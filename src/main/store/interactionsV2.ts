import Sqlite, { Database } from 'better-sqlite3'
import {
  BaseInteraction,
  ChatInteraction,
  NavInteraction,
  ChatState,
  NavState,
} from "@/shared/types/interactionsV2"
import path from 'path'
import { EntityData } from '@/shared/types/entity'

type InteractionStore = {
  createChat: (chat: EntityData<ChatInteraction>) => ChatInteraction
  createNav: (nav: EntityData<NavInteraction>) => NavInteraction
  getInteraction: (id: number) => BaseInteraction | null
  getChatState: (id: number) => ChatState | null
  getNavState: (id: number) => NavState | null
  getChatsByContextId: (contextId: number | null, lastId: number | null) => ChatInteraction[]
  getChatIdsByContextId: (contextId: number | null, lastId: number | null) => number[]
  getNavsByUrl: (url: string) => NavInteraction[]
  getNavIdsByUrl: (url: string) => number[]
  appendAssistantContent: (id: number, content: string, timestamp: number) => void
  updateNavState: (id: number, state: Partial<NavState>) => void
  close: () => void
}

const initDatabase = (db: Database): void => {
  // 创建基础交互表，使用自增主键
  db.exec(`
    CREATE TABLE IF NOT EXISTS interaction (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      userContent TEXT NOT NULL,
      contextId INTEGER,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (contextId) REFERENCES interaction(id)
    )
  `)

  // 创建聊天交互表
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat (
      id INTEGER PRIMARY KEY,
      model TEXT NOT NULL,
      assistantContent TEXT NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (id) REFERENCES interaction(id)
    )
  `)

  // 创建导航交互表
  db.exec(`
    CREATE TABLE IF NOT EXISTS navs (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      favIconUrl TEXT,
      imageAssetId TEXT,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (id) REFERENCES interaction(id)
    )
  `)

  // 为 nav 的 URL (userContent) 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_nav_url 
    ON interaction (userContent) 
    WHERE type = 'nav'
  `)
}

const createInteractionStore = (dbPath: string): InteractionStore => {
  const db = new Sqlite(path.resolve(dbPath))
  initDatabase(db)

  const createChat = (chat: EntityData<ChatInteraction>): ChatInteraction => {
    const { type, userContent, contextId, createdAt, model, assistantContent, updatedAt } = chat

    const insertInteraction = db.prepare(`
      INSERT INTO interaction (type, userContent, contextId, createdAt)
      VALUES (?, ?, ?, ?)
    `)

    const insertChat = db.prepare(`
      INSERT INTO chat (id, model, assistantContent, updatedAt)
      VALUES (?, ?, ?, ?)
    `)

    let id: number
    const transaction = db.transaction(() => {
      const result = insertInteraction.run(type, userContent, contextId, createdAt)
      id = result.lastInsertRowid as number
      insertChat.run(id, model, assistantContent, updatedAt)
    })

    transaction()

    return {
      ...chat,
      id,
    }
  }

  const createNav = (nav: EntityData<NavInteraction>): NavInteraction => {
    const { 
      type, userContent, contextId, createdAt,
      title, description, favIconUrl, imageAssetId, updatedAt 
    } = nav

    const insertInteraction = db.prepare(`
      INSERT INTO interaction (type, userContent, contextId, createdAt)
      VALUES (?, ?, ?, ?)
    `)

    const insertNav = db.prepare(`
      INSERT INTO navs (id, title, description, favIconUrl, imageAssetId, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    let id: number
    const transaction = db.transaction(() => {
      const result = insertInteraction.run(type, userContent, contextId, createdAt)
      id = result.lastInsertRowid as number
      insertNav.run(id, title, description, favIconUrl, imageAssetId, updatedAt)
    })

    transaction()

    return {
      ...nav,
      id,
    }
  }

  const getInteraction = (id: number): BaseInteraction | null => {
    return db.prepare<number, BaseInteraction>(`
      SELECT id, type, userContent, contextId, createdAt FROM interaction WHERE id = ?
    `).get(id) ?? null
  }

  const getChatState = (id: number): ChatState | null => {
    return db.prepare<number, ChatState>(`
      SELECT model, assistantContent, updatedAt FROM chat WHERE id = ?
    `).get(id) ?? null
  }

  const getNavState = (id: number): NavState | null => {
    return db.prepare<number, NavState>(`
      SELECT title, description, favIconUrl, imageAssetId, updatedAt FROM navs WHERE id = ?
    `).get(id) ?? null
  }

  const getNavsByUrl = (url: string): NavInteraction[] => {
    const results = db.prepare<string, NavInteraction>(`
      SELECT 
        i.id, i.type, i.userContent, i.contextId, i.createdAt,
        n.title, n.description, n.favIconUrl, n.imageAssetId, n.updatedAt
      FROM navs n
      LEFT JOIN interaction i ON n.id = i.id
      WHERE i.userContent = ?
      ORDER BY i.createdAt DESC
    `).all(url)

    return results
  }

  const getNavIdsByUrl = (url: string): number[] => {
    return db.prepare<string, { id: number }>(`
      SELECT id FROM interaction WHERE type = 'nav' AND userContent = ?
    `).all(url).map(result => result.id)
  }

  const prepareGetChatsConditions = (contextId: number | null, lastId: number | null): string[] => {  
    const conditions = ['i.type = \'chat\'']
    if (contextId) {
      conditions.push(`i.contextId = ${contextId}`)
    } else {
      conditions.push(`i.contextId IS NULL`)
    }
    if (lastId) {
      conditions.push(`i.id <= ${lastId}`)
    }
    return conditions
  }

  const getChatsByContextId = (contextId: number | null, lastId: number | null): ChatInteraction[] => {
    const sql =  (`
      SELECT
        i.id, i.type, i.userContent, i.contextId, i.createdAt,
        c.model, c.assistantContent, c.updatedAt
      FROM chat c
      LEFT JOIN interaction i ON c.id = i.id
      WHERE ${prepareGetChatsConditions(contextId, lastId).join(' AND ')}
      ORDER BY i.id ASC
    `)
    console.log(sql)
    const results = db.prepare<[], ChatInteraction>(sql).all()

    return results
  }

  const getChatIdsByContextId = (contextId: number | null, lastId: number | null): number[] => {
    const sql =  (`
      SELECT i.id FROM interaction i
      WHERE ${prepareGetChatsConditions(contextId, lastId).join(' AND ')}
      ORDER BY i.id ASC
    `)
    console.log(sql)
    return db.prepare<[], { id: number }>(sql).all().map(result => result.id)
  }

  const appendAssistantContent = (id: number, content: string, timestamp: number): void => {
    db.prepare<[string, number, number], void>(`
      UPDATE chat SET assistantContent = assistantContent || ?, updatedAt = ? WHERE id = ?
    `).run(content, timestamp, id)
  }

  const updateNavState = (id: number, state: Partial<NavState>): void => {
    const [updates, values] = Object.entries(state).reduce(([updates, values], [key, value]) => {
      values.push(value)
      return [updates + `${key} = ?, `, values]
    }, ['', []])
    values.push(id)
    const sql = `UPDATE navs SET ${updates.slice(0, -2)} WHERE id = ?`
    db.prepare(sql).run(...values)
  }

  const close = (): void => {
    db.close()
  }

  return {
    createChat,
    createNav,
    getInteraction,
    getChatState,
    getNavState,
    getChatsByContextId,
    getChatIdsByContextId,
    getNavsByUrl,
    getNavIdsByUrl,
    appendAssistantContent,
    updateNavState,
    close
  }
}

export { createInteractionStore }
export type { InteractionStore }

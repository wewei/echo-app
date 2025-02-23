import Sqlite, { Database } from 'better-sqlite3'
import {
  BaseInteraction,
  ChatInteraction,
  NavInteraction,
  Interaction,
  ChatState,
  NavState,
  QueryChatsParams,
} from "@/shared/types/interactionsV2"
import { EntityData } from '@/shared/types/entity'

export const DEFAULT_LIMIT = 10

type InteractionStore = {
  createChat: (chat: EntityData<ChatInteraction>) => ChatInteraction
  createNav: (nav: EntityData<NavInteraction>) => NavInteraction
  getInteraction: (id: number) => Interaction | null
  getChatState: (id: number) => ChatState | null
  getNavState: (id: number) => NavState | null
  getChats: (params: QueryChatsParams) => ChatInteraction[]
  getChatIds: (params: QueryChatsParams) => number[]
  getNavsByUrl: (url: string) => NavInteraction[]
  getNavIdsByUrl: (url: string) => number[]
  appendAssistantContent: (id: number, content: string, timestamp: number) => boolean
  updateNavState: (id: number, state: Partial<NavState>) => boolean
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

// <<<<<<< HEAD
const createInteractionStore = (dbPath: string): InteractionStore => {
  const db = new Sqlite(dbPath)
// =======
// const createInteractionStore = (profileId: string): InteractionStore => {
//   const dbPath = path.join(getProfileDir(profileId), 'sqlite')

//   if (!fs.existsSync(dbPath)) {
//     fs.mkdirSync(dbPath, { recursive: true })
//   }
//   const db = new Sqlite(path.join(dbPath, 'echo.sqlite'))
// >>>>>>> a01f959 (Update tab logic with new design)
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

  const getInteraction = (id: number): Interaction | null => {
    return db.prepare<number, Interaction>(`
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

  const prepareGetChatsConditions = ({
    contextId,
    created,
    updated,
    model,
  }: Omit<QueryChatsParams, 'limit' | 'order'>): [string[], (string | number)[]] => {  
    const conditions: string[] = []
    const values: (string | number)[] = []
    if (Number.isSafeInteger(contextId)) {
      conditions.push(`i.contextId = ?`)
      values.push(contextId)
    } else if (contextId === null) {
      conditions.push(`i.contextId IS NULL`)
    }
    if (Number.isFinite(created?.before)) {
      conditions.push(`i.createdAt < ?`)
      values.push(created.before)
    }
    if (Number.isFinite(created?.after)) {
      conditions.push(`i.createdAt > ?`)
      values.push(created.after)
    }
    if (Number.isFinite(updated?.before)) {
      conditions.push(`c.updatedAt < ?`)
      values.push(updated.before)
    }
    if (Number.isFinite(updated?.after)) {
      conditions.push(`c.updatedAt > ?`)
      values.push(updated.after)
    }
    if (model) {
      conditions.push(`c.model = ?`)
      values.push(model)
    }
    return [conditions, values]
  }

  const getChatsByContextId = (params: QueryChatsParams): ChatInteraction[] => {
    const [conditions, values] = prepareGetChatsConditions(params)
    return db.prepare<(string | number)[], ChatInteraction>(`
      SELECT
        i.id, i.type, i.userContent, i.contextId, i.createdAt,
        c.model, c.assistantContent, c.updatedAt
      FROM chat c
      LEFT JOIN interaction i ON c.id = i.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY i.createdAt ${params.order === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ?
    `).all(...values, params.limit ?? DEFAULT_LIMIT)
  }

  const getChatIdsByContextId = (params: QueryChatsParams): number[] => {
    const [conditions, values] = prepareGetChatsConditions(params)
    return db.prepare<(string | number)[], { id: number }>(`
      SELECT c.id FROM chat c
      LEFT JOIN interaction i ON c.id = i.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY i.createdAt ${params.order === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ?
    `).all(...values, params.limit ?? DEFAULT_LIMIT).map(result => result.id)
  }

  const appendAssistantContent = (id: number, content: string, timestamp: number): boolean => {
    const result = db.prepare<[string, number, number], boolean>(`
      UPDATE chat SET assistantContent = assistantContent || ?, updatedAt = ? WHERE id = ?
    `).run(content, timestamp, id)
    return result.changes > 0
  }

  const updateNavState = (id: number, state: Partial<NavState>): boolean => {
    const [updates, values] = Object.entries(state).reduce(([updates, values], [key, value]) => {
      values.push(value)
      return [updates + `${key} = ?, `, values]
    }, ['', []])
    values.push(id)
    const sql = `UPDATE navs SET ${updates.slice(0, -2)} WHERE id = ?`
    const result = db.prepare(sql).run(...values)
    return result.changes > 0
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
    getChats: getChatsByContextId,
    getChatIds: getChatIdsByContextId,
    getNavsByUrl,
    getNavIdsByUrl,
    appendAssistantContent,
    updateNavState,
    close
  }
}

export { createInteractionStore }
export type { InteractionStore }

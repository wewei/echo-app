import Sqlite, { Database } from 'better-sqlite3'
import {
  BaseInteraction,
  ChatInteraction,
  NavInteraction,
  Interaction,
  ChatInfo,
  NavInfo,
  nextChatId,
} from "@/shared/types/interactionsV2"
import path from 'path'
import { EntityData } from '@/shared/types/entity'
import crypto from 'node:crypto'

type InteractionStore = {
  createChat: (chat: EntityData<ChatInteraction>) => ChatInteraction
  createNav: (nav: EntityData<NavInteraction>) => NavInteraction
  getInteraction: (id: string) => Interaction | null
  getNavsByUrl: (url: string) => NavInteraction[]
  close: () => void
}

const generateNavId = (contextId: string, url: string): string => {
  const id = crypto.createHash('sha256').update(`${contextId}:${url}`).digest('hex')
  return id
}

const initDatabase = (db: Database): void => {
  // 创建基础交互表
  db.exec(`
    CREATE TABLE IF NOT EXISTS interaction (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      userContent TEXT NOT NULL,
      contextId TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (contextId) REFERENCES interaction(id)
    )
  `)

  // 创建聊天交互表
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat (
      id TEXT PRIMARY KEY,
      model TEXT NOT NULL,
      assistantContent TEXT NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (id) REFERENCES interaction(id)
    )
  `)

  // 创建导航交互表
  db.exec(`
    CREATE TABLE IF NOT EXISTS navs (
      id TEXT PRIMARY KEY,
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
    const id = nextChatId(contextId)

    const insertInteraction = db.prepare(`
      INSERT INTO interaction (id, type, userContent, contextId, createdAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        type = excluded.type,
        userContent = excluded.userContent,
        contextId = excluded.contextId,
        createdAt = excluded.createdAt
    `)

    const insertChat = db.prepare(`
      INSERT INTO chat (id, model, assistantContent, updatedAt)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        model = excluded.model,
        assistantContent = excluded.assistantContent,
        updatedAt = excluded.updatedAt
    `)

    const transaction = db.transaction(() => {
      insertInteraction.run(id, type, userContent, contextId, createdAt)
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
    const id = generateNavId(contextId, userContent)

    const insertInteraction = db.prepare(`
      INSERT INTO interaction (id, type, userContent, contextId, createdAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        type = excluded.type,
        userContent = excluded.userContent,
        contextId = excluded.contextId,
        createdAt = excluded.createdAt
    `)

    const insertNav = db.prepare(`
      INSERT INTO navs (id, title, description, favIconUrl, imageAssetId, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        favIconUrl = excluded.favIconUrl,
        imageAssetId = excluded.imageAssetId,
        updatedAt = excluded.updatedAt
    `)

    const transaction = db.transaction(() => {
      insertInteraction.run(id, type, userContent, contextId, createdAt)
      insertNav.run(id, title, description, favIconUrl, imageAssetId, updatedAt)
    })

    transaction()

    return {
      ...nav,
      id,
    }
  }

  const getNavsByUrl = (url: string): NavInteraction[] => {
    const results = db.prepare<string, NavInteraction>(`
      SELECT 
        i.id, i.type, i.userContent, i.contextId, i.createdAt,
        n.title, n.description, n.favIconUrl, n.imageAssetId, n.updatedAt
      FROM interaction i
      JOIN navs n ON i.id = n.id
      WHERE i.type = 'nav' AND i.userContent = ?
      ORDER BY i.createdAt DESC
    `).all(url)

    return results
  }

  const getInteraction = (id: string): Interaction | null => {
    const baseInteraction = db.prepare(`
      SELECT id, type, userContent, contextId, createdAt FROM interaction WHERE id = ?
    `).get(id) as BaseInteraction | undefined

    if (!baseInteraction) return null

    if (baseInteraction.type === 'chat') {
      const chatData = db.prepare<string, ChatInfo>(`
        SELECT id, model, assistantContent, updatedAt FROM chat WHERE id = ?
      `).get(id)

      return { ...baseInteraction, ...chatData } as ChatInteraction
    } else if (baseInteraction.type === 'nav') {
      const navData = db.prepare<string, NavInfo>(`
        SELECT id, title, description, favIconUrl, imageAssetId, updatedAt FROM navs WHERE id = ?
      `).get(id)

      return { ...baseInteraction, ...navData } as NavInteraction
    }

    return null
  }

  const close = (): void => {
    db.close()
  }

  return {
    createChat,
    createNav: createNav,
    getInteraction,
    getNavsByUrl,
    close
  }
}

export { createInteractionStore }
export type { InteractionStore }

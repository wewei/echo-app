import Sqlite, { Database } from 'better-sqlite3'
import {
  BaseInteraction,
  ChatInteraction,
  NavigationInteraction,
  Interaction,
  ChatInfo,
  NavigationInfo,
} from "@/shared/types/interactionsV2"
import path from 'path'

type InteractionStore = {
  createChat: (chat: ChatInteraction) => void
  createNavigation: (navigation: NavigationInteraction) => void
  getInteraction: (id: string) => Interaction | null
  close: () => void
}

const initDatabase = (db: Database): void => {
  // 创建基础交互表
  db.exec(`
    CREATE TABLE IF NOT EXISTS interaction (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      userContent TEXT NOT NULL,
      contextId TEXT,
      nextChatId TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (contextId) REFERENCES interaction(id),
      FOREIGN KEY (nextChatId) REFERENCES interaction(id)
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
    CREATE TABLE IF NOT EXISTS navigation (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      favIconUrl TEXT,
      imageAssetId TEXT,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (id) REFERENCES interaction(id)
    )
  `)
}

const createInteractionStore = (dbPath: string): InteractionStore => {
  const db = new Sqlite(path.resolve(dbPath))
  initDatabase(db)

  const createChat = (chat: ChatInteraction): void => {
    const { id, type, userContent, contextId, createdAt, model, assistantContent, updatedAt } = chat
    
    const insertInteraction = db.prepare(`
      INSERT INTO interaction (id, type, userContent, contextId, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)

    const insertChat = db.prepare(`
      INSERT INTO chat (id, model, assistantContent, updatedAt)
      VALUES (?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      insertInteraction.run(id, type, userContent, contextId, createdAt)
      insertChat.run(id, model, assistantContent, updatedAt)
    })

    transaction()
  }

  const createNavigation = (navigation: NavigationInteraction): void => {
    const { 
      id, type, userContent, contextId, createdAt,
      title, description, favIconUrl, imageAssetId, updatedAt 
    } = navigation

    const insertInteraction = db.prepare(`
      INSERT INTO interaction (id, type, userContent, contextId, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)

    const insertNavigation = db.prepare(`
      INSERT INTO navigation (id, title, description, favIconUrl, imageAssetId, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      insertInteraction.run(id, type, userContent, contextId, createdAt)
      insertNavigation.run(id, title, description, favIconUrl, imageAssetId, updatedAt)
    })

    transaction()
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
    } else if (baseInteraction.type === 'navigation') {
      const navigationData = db.prepare<string, NavigationInfo>(`
        SELECT id, title, description, favIconUrl, imageAssetId, updatedAt FROM navigation WHERE id = ?
      `).get(id)

      return { ...baseInteraction, ...navigationData } as NavigationInteraction
    }

    return null
  }

  const close = (): void => {
    db.close()
  }

  return {
    createChat,
    createNavigation,
    getInteraction,
    close
  }
}

export { createInteractionStore }
export type { InteractionStore }

import path from 'node:path'
import fs from 'node:fs'

import { app } from 'electron'
import Sqlite, { Database } from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { QueryInput, ResponseInput, Query, Response } from '@/shared/types/interactions'
import { getProfileDir } from '@/main/services/profileManager'

// 数据库初始化函数
const initializeDb = (db: Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      deletedTimestamp INTEGER,
      type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS query_contexts (
      id TEXT PRIMARY KEY,
      query_id TEXT NOT NULL,
      context_id TEXT NOT NULL,
      FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE,
      FOREIGN KEY (context_id) REFERENCES responses(id) ON DELETE CASCADE,
      UNIQUE(query_id, context_id)
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      agents TEXT NOT NULL,
      FOREIGN KEY (query) REFERENCES queries(id) ON DELETE CASCADE
    );

  `);
}

const stores = new Map<string, Database>()

const getStore = (profileId: string): Database => {
  if (stores.has(profileId)) {
    return stores.get(profileId);
  }
  const db = createConnection(profileId)
  stores.set(profileId, db)
  return db
}

app.on('will-quit', () => {
  for (const db of stores.values()) {
    db.close()
  }
  stores.clear()
})

// 创建数据库连接
const createConnection = (profileId: string): Database => {
  const dbPath = path.join(getProfileDir(profileId), 'sqlite')
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true })
  }
  
  const db = new Sqlite(path.join(dbPath, 'echo.sqlite'))
  initializeDb(db)
  return db
}

// Query 相关操作
const createQuery = (db: Database) => (input: QueryInput): Query => {
  const id = uuidv4()
  const { contexts, ...queryData } = input
  
  const insertQuery = db.prepare(`
    INSERT INTO queries (id, content, timestamp, deletedTimestamp, type)
    VALUES (@id, @content, @timestamp, @deletedTimestamp, @type)
  `)
  
  const insertContext = db.prepare(`
    INSERT INTO query_contexts (id, query_id, context_id)
    VALUES (?, ?, ?)
  `)

  db.transaction(() => {
    insertQuery.run({ ...queryData, id })
    
    if (contexts) {
      contexts.forEach(contextId => {
        insertContext.run(uuidv4(), id, contextId)
      })
    }
  })()

  return { ...queryData, id }
}

const updateQuery = (db: Database) => (id: string, input: Partial<QueryInput>): void => {
  const sets = Object.keys(input)
    .map(key => `${key} = @${key}`)
    .join(', ')
  const stmt = db.prepare(`UPDATE queries SET ${sets} WHERE id = @id`)
  stmt.run({ ...input, id })
}

const getQuery = (db: Database) => (id: string): Query | null => {
  const stmt = db.prepare('SELECT * FROM queries WHERE id = ?')
  return stmt.get(id) || null
}

const softDeleteQuery = (db: Database) => (id: string): Query | null => {
  const stmt = db.prepare('UPDATE queries SET deletedTimestamp = ? WHERE id = ?')
  stmt.run(Date.now(), id)
  return getQuery(db)(id)
}

const hardDeleteQuery = (db: Database) => (id: string): void => {
  const stmt = db.prepare('DELETE FROM queries WHERE id = ?')
  stmt.run(id)
}

// Response 相关操作
const createResponse = (db: Database) => (input: ResponseInput): Response => {
  const id = uuidv4()
  const stmt = db.prepare(`
    INSERT INTO responses (id, query, content, timestamp, agents)
    VALUES (@id, @query, @content, @timestamp, @agents)
  `)
  stmt.run({ ...input, id })
  return { ...input, id }
}

const updateResponse = (db: Database) => (id: string, input: Partial<ResponseInput>): void => {
  const sets = Object.keys(input)
    .map(key => `${key} = @${key}`)
    .join(', ')
  const stmt = db.prepare(`UPDATE responses SET ${sets} WHERE id = @id`)
  stmt.run({ ...input, id })
}

const getResponse = (db: Database) => (id: string): Response | null => {
  const stmt = db.prepare('SELECT * FROM responses WHERE id = ?')
  return stmt.get(id) || null
}

const getQueriesByIds = (db: Database) => (ids: string[]): Query[] => {
  if (ids.length === 0) return []
  
  const stmt = db.prepare(`
    SELECT * FROM queries 
    WHERE id IN (${ids.map(() => '?').join(',')})
  `)
  return stmt.all(...ids) as Query[]
}

const getResponsesByIds = (db: Database) => (ids: string[]): Response[] => {
  if (ids.length === 0) return []
  
  const stmt = db.prepare(`
    SELECT * FROM responses 
    WHERE id IN (${ids.map(() => '?').join(',')})
  `)
  return stmt.all(...ids) as Response[]
}

// 修改工厂函数，添加新方法
export const getDatabaseService = (profileId: string) => {
  const db = getStore(profileId)
  
  return {
    query: {
      create: createQuery(db),
      update: updateQuery(db),
      get: getQuery(db),
      softDelete: softDeleteQuery(db),
      hardDelete: hardDeleteQuery(db),
      getByIds: getQueriesByIds(db)
    },
    response: {
      create: createResponse(db),
      update: updateResponse(db),
      get: getResponse(db),
      getByIds: getResponsesByIds(db)
    },
  }
}

export type DatabaseService = ReturnType<typeof getDatabaseService> 

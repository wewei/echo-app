import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

import { app } from 'electron'
import Sqlite, { Database } from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

import { QueryInput, ResponseInput, Query, Response, QuerySearchOptions } from '@/shared/types/interactions'
import { getProfileDir, onProfileWillBeDeleted } from '@/main/services/profileManager'

// 数据库初始化函数
const initializeDb = (db: Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      contextId TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (contextId) REFERENCES responses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      queryId TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      agent TEXT NOT NULL,
      FOREIGN KEY (queryId) REFERENCES queries(id) ON DELETE CASCADE
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

onProfileWillBeDeleted((profileId) => {
  const db = stores.get(profileId)
  if (db) {
    db.close()
  }
  stores.delete(profileId)
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

const getQueryId = (input: QueryInput): string => {
  const key = JSON.stringify([input.content, input.contextId, input.timestamp])
  return crypto.createHash('sha256').update(key).digest('hex')
}

// Query 相关操作
const createQuery = (db: Database) => (input: QueryInput): Query => {
  const id = getQueryId(input)

  const query = getQuery(db)(id)
  if (query) {
    return query
  }

  const { contextId, content, timestamp } = input
  
  const insertQuery = db.prepare(`
    INSERT INTO queries (id, content, contextId, timestamp)
    VALUES (@id, @content, @contextId, @timestamp)
  `)
  
  insertQuery.run({ id, content, contextId, timestamp })

  return { id, content, timestamp, contextId }
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
  return stmt.get(id) as Query | null
}

const getQueriesByIds = (db: Database) => (ids: string[]): Query[] => {
  if (ids.length === 0) return []
  
  const stmt = db.prepare(`
    SELECT * FROM queries 
    WHERE id IN (${ids.map(() => '?').join(',')})
  `)
  return stmt.all(...ids) as Query[]
}

const MAX_COUNT = 100

const searchQueries = (db: Database) => (options: QuerySearchOptions): Query[] => {
  const conditions: string[] = []
  const params: (string | number)[] = []

  if (options.created) {
    const operator = options.created.type === 'before' ? '<' : '>'
    conditions.push(`timestamp ${operator} ?`)
    params.push(options.created.timestamp)
  }

  if (options.type) {
    conditions.push(`type = ?`)
    params.push(options.type)
  }

  let query = 'SELECT * FROM queries'
  
  if (options.contextId) {
    conditions.push(`contextId = ?`)
    params.push(options.contextId)
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`
  }

  query += ` LIMIT ${Math.min(options.maxCount ?? MAX_COUNT, MAX_COUNT)}`

  const stmt = db.prepare(query)
  return stmt.all(...params) as Query[]
}

// Response 相关操作
const getResponseId = (input: ResponseInput): string => {
  const key = JSON.stringify([input.queryId, input.agent, input.timestamp])
  return crypto.createHash('sha256').update(key).digest('hex')
}

const createResponse = (db: Database) => (input: ResponseInput): Response | null => {
  const id = getResponseId(input)

  const response = getResponse(db)(id)
  if (response) {
    return response
  }

  const stmt = db.prepare(`
    INSERT INTO responses (id, queryId, content, timestamp, agent)
    VALUES (@id, @queryId, @content, @timestamp, @agent)
  `)
  
  stmt.run({ ...input, id })
  // TODO: error handling

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
  const row = stmt.get(id) as Response | null
  if (!row) return null
  
  return row
}

const getResponsesByIds = (db: Database) => (ids: string[]): Response[] => {
  if (ids.length === 0) return []
  
  const stmt = db.prepare(`
    SELECT * FROM responses 
    WHERE id IN (${ids.map(() => '?').join(',')})
  `)
  return stmt.all(...ids) as Response[]
}

const getQueryResponseIds = (db: Database) => (queryId: string): string[] => {
  const stmt = db.prepare('SELECT id FROM responses WHERE queryId = ? ORDER BY timestamp ASC')
  const rows = stmt.all(queryId) as { id: string }[]
  return rows.map(row => row.id)
}

const appendResponse = (db: Database) => (id: string, content: string): Response | null => {
  const response = getResponse(db)(id)
  if (!response) return null

  const updatedResponse = {
    ...response,
    content: response.content + content,
    timestamp: Date.now()
  }

  updateResponse(db)(id, {
    content: updatedResponse.content,
    timestamp: updatedResponse.timestamp
  })

  return updatedResponse
}

// 更新工厂函数
export const getDatabaseService = (profileId: string) => {
  const db = getStore(profileId)
  
  return {
    query: {
      create: createQuery(db),
      update: updateQuery(db),
      get: getQuery(db),
      getByIds: getQueriesByIds(db),
      search: searchQueries(db),
    },
    response: {
      create: createResponse(db),
      update: updateResponse(db),
      get: getResponse(db),
      getByIds: getResponsesByIds(db),
      getByQueryId: getQueryResponseIds(db),
      append: appendResponse(db),
    },
  }
}

export type DatabaseService = ReturnType<typeof getDatabaseService> 

import BetterSqlite3  from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { QueryInput, ResponseInput, Query, Response } from '../../shared/types/echo'

// 数据库初始化函数
const initializeDb = (db: BetterSqlite3.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      context INTEGER,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      isDeleted BOOLEAN NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      FOREIGN KEY (context) REFERENCES responses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      agents TEXT NOT NULL,
      FOREIGN KEY (query) REFERENCES queries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_id INTEGER NOT NULL,
      response_id INTEGER NOT NULL,
      FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE,
      FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
      UNIQUE(query_id, response_id)
    );
  `)
}

// 创建数据库连接
const createConnection = (profileFolder: string): BetterSqlite3.Database => {
  const dbPath = path.join(profileFolder, 'sqlite')
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true })
  }
  
  const db = new BetterSqlite3(path.join(dbPath, 'echo.sqlite'))
  initializeDb(db)
  return db
}

// Query 相关操作
const createQuery = (db: BetterSqlite3.Database) => (input: QueryInput): Query => {
  const stmt = db.prepare(`
    INSERT INTO queries (context, content, timestamp, isDeleted, type)
    VALUES (@context, @content, @timestamp, @isDeleted, @type)
  `)
  const result = stmt.run(input)
  return { ...input, id: result.lastInsertRowid as number }
}

const updateQuery = (db: BetterSqlite3.Database) => (id: number, input: Partial<QueryInput>): void => {
  const sets = Object.keys(input)
    .map(key => `${key} = @${key}`)
    .join(', ')
  const stmt = db.prepare(`UPDATE queries SET ${sets} WHERE id = @id`)
  stmt.run({ ...input, id })
}

const getQuery = (db: BetterSqlite3.Database) => (id: number): Query | undefined => {
  const stmt = db.prepare('SELECT * FROM queries WHERE id = ?')
  return stmt.get(id) as Query | undefined
}

const softDeleteQuery = (db: BetterSqlite3.Database) => (id: number): void => {
  const stmt = db.prepare('UPDATE queries SET isDeleted = 1 WHERE id = ?')
  stmt.run(id)
}

const hardDeleteQuery = (db: BetterSqlite3.Database) => (id: number): void => {
  const stmt = db.prepare('DELETE FROM queries WHERE id = ?')
  stmt.run(id)
}

// Response 相关操作
const createResponse = (db: BetterSqlite3.Database) => (input: ResponseInput): Response => {
  const stmt = db.prepare(`
    INSERT INTO responses (query, content, timestamp, agents)
    VALUES (@query, @content, @timestamp, @agents)
  `)
  const result = stmt.run(input)
  return { ...input, id: result.lastInsertRowid as number }
}

const updateResponse = (db: BetterSqlite3.Database) => (id: number, input: Partial<ResponseInput>): void => {
  const sets = Object.keys(input)
    .map(key => `${key} = @${key}`)
    .join(', ')
  const stmt = db.prepare(`UPDATE responses SET ${sets} WHERE id = @id`)
  stmt.run({ ...input, id })
}

const getResponse = (db: BetterSqlite3.Database) => (id: number): Response | undefined => {
  const stmt = db.prepare('SELECT * FROM responses WHERE id = ?')
  return stmt.get(id) as Response | undefined
}

const deleteResponse = (db: BetterSqlite3.Database) => (id: number): void => {
  const stmt = db.prepare('DELETE FROM responses WHERE id = ?')
  stmt.run(id)
}

// 查询相关操作
const getQueryResponses = (db: BetterSqlite3.Database) => (queryId: number): Response[] => {
  const stmt = db.prepare('SELECT * FROM responses WHERE query = ? ORDER BY timestamp ASC')
  return stmt.all(queryId) as Response[]
}

const getQueryWithContext = (db: BetterSqlite3.Database) => (contextId: number): Query[] => {
  const stmt = db.prepare('SELECT * FROM queries WHERE context = ? ORDER BY timestamp ASC')
  return stmt.all(contextId) as Query[]
}

// 添加 Reference 相关操作
const createReference = (db: BetterSqlite3.Database) => (queryId: number, responseId: number): void => {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO references (query_id, response_id)
    VALUES (?, ?)
  `)
  stmt.run(queryId, responseId)
}

const deleteReference = (db: BetterSqlite3.Database) => (queryId: number, responseId: number): void => {
  const stmt = db.prepare('DELETE FROM references WHERE query_id = ? AND response_id = ?')
  stmt.run(queryId, responseId)
}

const getResponseReferences = (db: BetterSqlite3.Database) => (responseId: number): Query[] => {
  const stmt = db.prepare(`
    SELECT q.* FROM queries q
    INNER JOIN references r ON r.query_id = q.id
    WHERE r.response_id = ?
    ORDER BY q.timestamp ASC
  `)
  return stmt.all(responseId) as Query[]
}

const getQueryReferences = (db: BetterSqlite3.Database) => (queryId: number): Response[] => {
  const stmt = db.prepare(`
    SELECT r.* FROM responses r
    INNER JOIN references ref ON ref.response_id = r.id
    WHERE ref.query_id = ?
    ORDER BY r.timestamp ASC
  `)
  return stmt.all(queryId) as Response[]
}

// 导出工厂函数
export const createDatabaseService = (profileFolder: string) => {
  const db = createConnection(profileFolder)
  
  return {
    query: {
      create: createQuery(db),
      update: updateQuery(db),
      get: getQuery(db),
      softDelete: softDeleteQuery(db),
      hardDelete: hardDeleteQuery(db),
      getWithContext: getQueryWithContext(db)
    },
    response: {
      create: createResponse(db),
      update: updateResponse(db),
      get: getResponse(db),
      delete: deleteResponse(db),
      getForQuery: getQueryResponses(db)
    },
    reference: {
      create: createReference(db),
      delete: deleteReference(db),
      getQueryReferences: getQueryReferences(db),
      getResponseReferences: getResponseReferences(db)
    }
  }
}

export type DatabaseService = ReturnType<typeof createDatabaseService> 
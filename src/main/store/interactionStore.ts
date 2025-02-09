import Sqlite, { Database } from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { QueryInput, ResponseInput, Query, Response } from '@/shared/types/interactions'

// 数据库初始化函数
const initializeDb = (db: Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      context TEXT,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      isDeleted BOOLEAN NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      FOREIGN KEY (context) REFERENCES responses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      agents TEXT NOT NULL,
      FOREIGN KEY (query) REFERENCES queries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS references (
      id TEXT PRIMARY KEY,
      query_id TEXT NOT NULL,
      response_id TEXT NOT NULL,
      FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE,
      FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
      UNIQUE(query_id, response_id)
    );

    CREATE VIEW IF NOT EXISTS interaction_view AS
    SELECT
      q.id AS query_id,
      q.content AS query_content,
      q.timestamp AS query_timestamp,
      q.type AS query_type,
      r.id AS response_id,
      r.content AS response_content,
      r.timestamp AS response_timestamp,
      r.agents AS response_agents
    FROM queries q
    LEFT JOIN responses r ON q.id = r.query
    LEFT JOIN references ref ON q.id = ref.query_id
  `);
}

// 创建数据库连接
const createConnection = (profileFolder: string): Database => {
  const dbPath = path.join(profileFolder, 'sqlite')
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
  const stmt = db.prepare(`
    INSERT INTO queries (id, context, content, timestamp, isDeleted, type)
    VALUES (@id, @context, @content, @timestamp, @isDeleted, @type)
  `)
  stmt.run({ ...input, id })
  return { ...input, id }
}

const updateQuery = (db: Database) => (id: string, input: Partial<QueryInput>): void => {
  const sets = Object.keys(input)
    .map(key => `${key} = @${key}`)
    .join(', ')
  const stmt = db.prepare(`UPDATE queries SET ${sets} WHERE id = @id`)
  stmt.run({ ...input, id })
}

const getQuery = (db: Database) => (id: string): Query | undefined => {
  const stmt = db.prepare('SELECT * FROM queries WHERE id = ?')
  return stmt.get(id) as Query | undefined
}

const softDeleteQuery = (db: Database) => (id: string): void => {
  const stmt = db.prepare('UPDATE queries SET isDeleted = 1 WHERE id = ?')
  stmt.run(id)
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

const getResponse = (db: Database) => (id: string): Response | undefined => {
  const stmt = db.prepare('SELECT * FROM responses WHERE id = ?')
  return stmt.get(id) as Response | undefined
}

const deleteResponse = (db: Database) => (id: string): void => {
  const stmt = db.prepare('DELETE FROM responses WHERE id = ?')
  stmt.run(id)
}

// 查询相关操作
const getQueryResponses = (db: Database) => (queryId: string): Response[] => {
  const stmt = db.prepare('SELECT * FROM responses WHERE query = ? ORDER BY timestamp ASC')
  return stmt.all(queryId) as Response[]
}

const getQueryWithContext = (db: Database) => (contextId: string): Query[] => {
  const stmt = db.prepare('SELECT * FROM queries WHERE context = ? ORDER BY timestamp ASC')
  return stmt.all(contextId) as Query[]
}

// 添加 Reference 相关操作
const createReference = (db: Database) => (queryId: string, responseId: string): void => {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO references (id, query_id, response_id)
    VALUES (?, ?, ?)
  `)
  stmt.run(uuidv4(), queryId, responseId)
}

const deleteReference = (db: Database) => (queryId: string, responseId: string): void => {
  const stmt = db.prepare('DELETE FROM references WHERE query_id = ? AND response_id = ?')
  stmt.run(queryId, responseId)
}

const getResponseReferences = (db: Database) => (responseId: string): Query[] => {
  const stmt = db.prepare(`
    SELECT q.* FROM queries q
    INNER JOIN references r ON r.query_id = q.id
    WHERE r.response_id = ?
    ORDER BY q.timestamp ASC
  `)
  return stmt.all(responseId) as Query[]
}

const getQueryReferences = (db: Database) => (queryId: string): Response[] => {
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
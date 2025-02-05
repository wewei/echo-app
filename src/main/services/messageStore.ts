import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs/promises'
import { app } from 'electron'
import { Message, MessageQuery } from '../../shared/types/message'


// 缓存数据库连接
const dbCache = new Map<string, Database.Database>()

const getDatabase = async (profileId: string): Promise<Database.Database> => {
  let db = dbCache.get(profileId)
  
  if (!db) {
    const dbPath = path.join(
      app.getPath('userData'),
      'profiles',
      profileId,
      'sqlite',
      'messages.sqlite'
    )
    
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    
    // 创建消息表
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL CHECK(sender IN ('user', 'agent')),
        content TEXT NOT NULL,
        reply_to TEXT,
        reply_offset INTEGER,
        reply_length INTEGER,
        topic TEXT,
        timestamp INTEGER NOT NULL,
        context_url TEXT,
        FOREIGN KEY(reply_to) REFERENCES messages(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
      CREATE INDEX IF NOT EXISTS idx_messages_context_url ON messages(context_url);
      CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
        content, topic,
        content=messages,
        content_rowid=id
      );
      
      CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
        INSERT INTO messages_fts(rowid, content, topic)
        VALUES (new.id, new.content, new.topic);
      END;
      
      CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
        INSERT INTO messages_fts(messages_fts, rowid, content, topic)
        VALUES('delete', old.id, old.content, old.topic);
      END;
      
      CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
        INSERT INTO messages_fts(messages_fts, rowid, content, topic)
        VALUES('delete', old.id, old.content, old.topic);
        INSERT INTO messages_fts(rowid, content, topic)
        VALUES (new.id, new.content, new.topic);
      END;
    `)
    
    dbCache.set(profileId, db)
  }
  
  return db
}

// 添加消息
export const addMessage = async (profileId: string, message: Message): Promise<void> => {
  const db = await getDatabase(profileId)
  
  db.prepare(`
    INSERT INTO messages (
      id, sender, content, reply_to, reply_offset, reply_length,
      topic, timestamp, context_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    message.id,
    message.sender,
    message.content,
    message.replyTo,
    message.replyOffset,
    message.replyLength,
    message.topic,
    message.timestamp,
    message.contextUrl
  )
}

// 获取消息
export const getMessage = async (profileId: string, id: string): Promise<Message | null> => {
  const db = await getDatabase(profileId)
  
  const row = db.prepare(`
    SELECT 
      id, sender, content, reply_to as replyTo,
      reply_offset as replyOffset, reply_length as replyLength,
      topic, timestamp, context_url as contextUrl
    FROM messages 
    WHERE id = ?
  `).get(id)
  
  return row || null;
}

// 查询消息
export const queryMessages = async (
  profileId: string,
  query: MessageQuery
): Promise<Message[]> => {
  const db = await getDatabase(profileId)
  
  let sql = `
    SELECT 
      id, sender, content, reply_to as replyTo,
      reply_offset as replyOffset, reply_length as replyLength,
      topic, timestamp, context_url as contextUrl
    FROM messages
    WHERE 1=1
  `
  const params: any[] = []
  
  if (query.startTime !== undefined) {
    sql += ' AND timestamp >= ?'
    params.push(query.startTime)
  }
  
  if (query.endTime !== undefined) {
    sql += ' AND timestamp <= ?'
    params.push(query.endTime)
  }
  
  if (query.replyTo !== undefined) {
    sql += ' AND reply_to = ?'
    params.push(query.replyTo)
  }
  
  if (query.contextUrl !== undefined) {
    sql += ' AND context_url = ?'
    params.push(query.contextUrl)
  }
  
  if (query.keyword) {
    sql = `
      WITH matched AS (
        SELECT rowid 
        FROM messages_fts 
        WHERE messages_fts MATCH ? 
        ORDER BY rank
      )
      SELECT 
        m.id, m.sender, m.content, m.reply_to as replyTo,
        m.reply_offset as replyOffset, m.reply_length as replyLength,
        m.topic, m.timestamp, m.context_url as contextUrl
      FROM messages m
      INNER JOIN matched ON m.id = matched.rowid
      WHERE 1=1
    `
    params.unshift(query.keyword)
  }
  
  sql += ' ORDER BY timestamp DESC'
  
  if (query.take !== undefined) {
    sql += ' LIMIT ?'
    params.push(query.take)
    
    if (query.skip !== undefined) {
      sql += ' OFFSET ?'
      params.push(query.skip)
    }
  }
  
  return db.prepare(sql).all(...params) as Message[]
}

// 关闭数据库连接
app.on('will-quit', () => {
  for (const db of dbCache.values()) {
    db.close()
  }
  dbCache.clear()
}) 
import zod from 'zod';

export const querySchema = zod.object({
  // Query ID
  id: zod.string().nonempty(),

  // The ID of the context response of the query
  contextId: zod.string(),

  // The content of the query
  content: zod.string().nonempty(),

  // The timestamp of the query
  timestamp: zod.number(),
})

export type Query = { id: string; content: string; contextId?: string; timestamp: number }

export const responseSchema = zod.object({
  // Response ID
  id: zod.string().nonempty(),

  // The query ID the response responses to
  queryId: zod.string().nonempty(),

  // The content of the response
  content: zod.string().nonempty(),

  // The timestamp of the response
  timestamp: zod.number(),

  // The agent of the response
  agent: zod.string().nonempty(),
})

export type Response = { id: string; queryId: string; content: string; timestamp: number; agent: string }

export type QueryInput = Omit<Query, "id">

export type ResponseInput = Omit<Response, "id">

export const querySearchOptionsSchema = zod.object({
  // 创建的时间早于或晚于指定的时间
  created: zod.object({
    type: zod.enum(['before', 'after']),
    timestamp: zod.number(),  
  }).optional(),
  // 最大数量
  maxCount: zod.number().optional(),
  // 上下文ID
  contextId: zod.string().optional(),
  // Query 的类型
  type: zod.string().optional(),
})

export type QuerySearchOptions = zod.infer<typeof querySearchOptionsSchema>

export const IPC_CHANNELS = {
  CREATE_QUERY: 'interaction:createQuery',
  CREATE_RESPONSE: 'interaction:createResponse',
  APPEND_RESPONSE: 'interaction:appendResponse',
  SEARCH_QUERIES: 'interaction:searchQueries',
  GET_RESPONSE: 'interaction:getResponse',
  GET_QUERY: 'interaction:getQuery',
  GET_QUERY_RESPONSE_IDS: 'interaction:getQueryResponseIds',
} as const

export const QUERY_TYPE_CHAT = 'chat'
export const QUERY_TYPE_NAVIGATE = 'navigate'
export const QUERY_TYPE_SEARCH = 'search'

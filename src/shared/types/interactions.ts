import zod from 'zod';

export const querySchema = zod.object({
  id: zod.string().uuid(),
  contexts: zod.array(zod.string().uuid()).optional(),
  content: zod.string(),
  timestamp: zod.number(),
  type: zod.string(),
})

export type Query = zod.infer<typeof querySchema>

export const responseSchema = zod.object({
  id: zod.string().uuid(),
  query: zod.string().uuid(),
  content: zod.string(),
  timestamp: zod.number(),
  agents: zod.string(),
})

export type Response = zod.infer<typeof responseSchema>

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
  GET_RESPONSES: 'interaction:getResponses',
  GET_QUERIES: 'interaction:getQueries',
  GET_RESPONSES_OF_QUERY: 'interaction:getResponsesOfQuery',
} as const

export const QUERY_TYPE_CHAT = 'chat'
export const QUERY_TYPE_NAVIGATE = 'navigate'
export const QUERY_TYPE_SEARCH = 'search'

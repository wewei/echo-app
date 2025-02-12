import zod from 'zod';

export const queryTypeSchema = zod.enum(['chat', 'navigate']);

export type QueryType = zod.infer<typeof queryTypeSchema>

export const querySchema = zod.object({
  id: zod.string().uuid(),
  contexts: zod.array(zod.string().uuid()).optional(),
  content: zod.string(),
  timestamp: zod.number(),
  type: queryTypeSchema,
  deletedTimestamp: zod.number().optional(),
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

export const searchOptionsSchema = zod.object({
  timestamp: zod.number().optional(),
  before: zod.number().optional(),
  after: zod.number().optional(),
  contextId: zod.string().optional(),
  queryType: zod.string().optional(),
  responseAgents: zod.array(zod.string()).optional(),
  queryId: zod.string().optional(),
  deletedTimestamp: zod.number().optional(),
  deletedBefore: zod.number().optional(),
  deletedAfter: zod.number().optional(),
})

export type SearchOptions = zod.infer<typeof searchOptionsSchema>

export const IPC_CHANNELS = {
  CREATE_QUERY: 'interaction:createQuery',
  CREATE_RESPONSE: 'interaction:createResponse',
  APPEND_RESPONSE: 'interaction:appendResponse',
  SOFT_DELETE_QUERY: 'interaction:softDeleteQuery',
  HARD_DELETE_QUERY: 'interaction:hardDeleteQuery',
  GET_RESPONSES: 'interaction:getResponses',
  GET_QUERIES: 'interaction:getQueries',
} as const
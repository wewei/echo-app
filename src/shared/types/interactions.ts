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

export const interactionSchema = zod.object({
  responseId: zod.string().uuid(),
  responseContent: zod.string(),
  responseTimestamp: zod.number(),
  responseAgents: zod.string(),
  queryId: zod.string().uuid(),
  queryContent: zod.string(),
  queryTimestamp: zod.number(),
  queryType: queryTypeSchema,
  queryDeletedTimestamp: zod.number().optional(),
})

export type Interaction = zod.infer<typeof interactionSchema>

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

export const queryFromInteraction = (interaction: Interaction): Query => {
  return {
    id: interaction.queryId,
    content: interaction.queryContent,
    timestamp: interaction.queryTimestamp,
    type: interaction.queryType,
    deletedTimestamp: interaction.queryDeletedTimestamp,
  }
}

export const responseFromInteraction = (interaction: Interaction): Response => {
  return {
    id: interaction.responseId,
    content: interaction.responseContent,
    timestamp: interaction.responseTimestamp,
    agents: interaction.responseAgents,
  }
}

export const interactionFromQueryAndResponse = (query: Query, response: Response): Interaction => {
  return {
    queryId: query.id,
    queryContent: query.content,
    queryTimestamp: query.timestamp,
    queryType: query.type,
    responseId: response.id,
    responseContent: response.content,
    responseTimestamp: response.timestamp,
    responseAgents: response.agents,
  }
}

export const IPC_CHANNELS = {
  CREATE_QUERY: 'interaction:createQuery',
  CREATE_RESPONSE: 'interaction:createResponse',
  APPEND_RESPONSE: 'interaction:appendResponse',
  SOFT_DELETE_QUERY: 'interaction:softDeleteQuery',
  HARD_DELETE_QUERY: 'interaction:hardDeleteQuery',
  SEARCH_INTERACTIONS: 'interaction:searchInteractions',
  SEARCH_INTERACTION_IDS: 'interaction:searchInteractionIds',
  GET_RESPONSES: 'interaction:getResponses',
  GET_QUERIES: 'interaction:getQueries',
  GET_INTERACTIONS: 'interaction:getInteractions',
} as const
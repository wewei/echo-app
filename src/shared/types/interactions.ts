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

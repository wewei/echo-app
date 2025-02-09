import zod from 'zod';

export const queryTypeSchema = zod.enum(['chat', 'navigate']);

export type QueryType = zod.infer<typeof queryTypeSchema>

export const querySchema = zod.object({
  id: zod.string().uuid(),
  context: zod.string().uuid().optional(),
  content: zod.string(),
  timestamp: zod.number(),
  type: queryTypeSchema,
  isDeleted: zod.boolean(),
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

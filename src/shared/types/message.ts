import { z } from 'zod'

export const MessageSenderSchema = z.enum(['user', 'agent'])
export type MessageSender = z.infer<typeof MessageSenderSchema>

export const MessageSchema = z.object({
  uuid: z.string().uuid(),
  sender: MessageSenderSchema,
  content: z.string(),
  replyTo: z.string().optional(),
  replyOffset: z.number().optional(),
  replyLength: z.number().optional(),
  topic: z.string().optional(),
  timestamp: z.number(),
  contextUrl: z.string().optional()
})

export type Message = z.infer<typeof MessageSchema>

export const MessageQuerySchema = z.object({
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  skip: z.number().optional(),
  take: z.number().optional(),
  replyTo: z.string().optional(),
  contextUrl: z.string().optional(),
  keyword: z.string().optional(),
})

export type MessageQuery = z.infer<typeof MessageQuerySchema>

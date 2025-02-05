import { z } from 'zod'

export const MessageRoleSchema = z.enum(['system', 'user', 'assistant'])
export type MessageRole = z.infer<typeof MessageRoleSchema>

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.number(),
})
export type Message = z.infer<typeof MessageSchema>

export const ChatOptionsSchema = z.object({
  stream: z.boolean().default(false),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).optional(),
})
export type ChatOptions = z.infer<typeof ChatOptionsSchema>

export interface ChatResponse {
  id: string
  message: Message
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
} 
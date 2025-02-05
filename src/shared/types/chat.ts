import { z } from 'zod'

export const ChatMessageRoleSchema = z.enum(['system', 'user', 'assistant'])
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatMessageRoleSchema,
  content: z.string(),
  timestamp: z.number(),
})
export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const ChatOptionsSchema = z.object({
  stream: z.boolean().default(false),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).optional(),
})
export type ChatOptions = z.infer<typeof ChatOptionsSchema>

export interface ChatResponse {
  id: string
  message: ChatMessage
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
} 

export const CHAT_SETTINGS = "chat"
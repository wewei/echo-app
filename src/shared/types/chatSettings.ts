import { z } from 'zod'

export const ChatProviderSchema = z.enum(['openai', 'deepseek', 'azure', 'ollama'])
export const OpenAISettingsSchema = z.object({
  apiKey: z.string().default(''),
  baseURL: z.string().default('https://api.openai.com/v1'),
  model: z.string().default('gpt-4'),
})
export const DeepSeekSettingsSchema = z.object({
  apiKey: z.string().default(''),
  baseURL: z.string().default('https://api.deepseek.com/v1'),
  model: z.string().default('deepseek-chat'),
})

export const AzureSettingsSchema = z.object({
  apiKey: z.string().default(''),
  endpoint: z.string().default('https://{resource}.openai.azure.com'),
  model: z.string().default('gpt-4'),
  apiVersion: z.string().default('2024-10-21'),
  deployment: z.string().default('gpt-4'),
})

export const OllamaSettingsSchema = z.object({
  apiKey: z.string().default('ollama'),
  baseURL: z.string().default('http://localhost:11434/v1'),
  model: z.string().default('deepseek-r1:32b'),
})

export const ChatSettingsSchema = z.object({
  provider: ChatProviderSchema.default('openai'),
  openai: OpenAISettingsSchema.default({}),
  deepseek: DeepSeekSettingsSchema.default({}),
  azure: AzureSettingsSchema.default({}),
  ollama: OllamaSettingsSchema.default({})
})


export type ChatProvider = z.infer<typeof ChatProviderSchema>

export type OpenAISettings = z.infer<typeof OpenAISettingsSchema>
export type DeepSeekSettings = z.infer<typeof DeepSeekSettingsSchema>
export type AzureSettings = z.infer<typeof AzureSettingsSchema>
export type OllamaSettings = z.infer<typeof OllamaSettingsSchema>

export type ChatSettings = z.infer<typeof ChatSettingsSchema>

export const CHAT_SETTINGS = 'chat'
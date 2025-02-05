import { z } from 'zod'

export const AIProviderSchema = z.enum(['openai', 'deepseek', 'azure'])

export const AISettingsSchema = z.object({
  provider: AIProviderSchema.default('openai'),
  openai: z.object({
    apiKey: z.string().default(''),
    endpoint: z.string().default('https://api.openai.com/v1'),
    model: z.string().default('gpt-3.5-turbo'),
  }).default({}),
  deepseek: z.object({
    apiKey: z.string().default(''),
    endpoint: z.string().default('https://api.deepseek.com/v1'),
    model: z.string().default('gpt-3.5-turbo'),
  }).default({}),
  azure: z.object({
    apiKey: z.string().default(''),
    endpoint: z.string().default('https://{resource}.openai.azure.com'),
    model: z.string().default('gpt-3.5-turbo'),
    deployment: z.string().default('gpt-35-turbo'),
  }).default({})
})

export type AIProvider = z.infer<typeof AIProviderSchema>

export type AISettings = z.infer<typeof AISettingsSchema>

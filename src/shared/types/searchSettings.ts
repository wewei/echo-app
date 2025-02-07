import { z } from 'zod'

export const SearchSettingsSchema = z.object({
  provider: z.enum(['bing']).default('bing'),
  bing: z.object({
    apiKey: z.string().default(''),
  }).default({}),
})

export type SearchSettings = z.infer<typeof SearchSettingsSchema>

export const SEARCH_SETTINGS = 'search'
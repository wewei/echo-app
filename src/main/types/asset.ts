import { z } from 'zod'

export const AssetMetadataSchema = z.object({
  id: z.string().uuid(),
  mimeType: z.string(),
  createdAt: z.number(),
})

export type AssetMetadata = z.infer<typeof AssetMetadataSchema>

export const AssetsMetadataSchema = z.object({
  assets: z.record(z.string(), AssetMetadataSchema),
})

export type AssetsMetadata = z.infer<typeof AssetsMetadataSchema> 
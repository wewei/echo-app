import {z} from "zod";
export const RagSettingSchema = z.object({
  isOpen: z.boolean().default(false),
  provider: z.enum(['custom']).default('custom'),
  custom: z.object({
    endpoint: z.string().default("http://localhost:8001"),
    topK: z.number().min(1, "TopK must be greater than 0").max(100, "TopK must be less than 100").default(10),
    distanceThreshold: z.number().min(0, "Distance threshold must be greater than 0").max(1, "Distance threshold must be less than 1").default(0.6),
  }).default({}),
});

export type RagSettings = z.infer<typeof RagSettingSchema>;
export const RAG_SETTINGS = 'rag';
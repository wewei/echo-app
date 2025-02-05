import { z } from 'zod'

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  avatar: z.string(),
})

export type Profile = z.infer<typeof ProfileSchema>

export const ProfilesSchema = z.object({
  profiles: z.array(ProfileSchema),
  defaultProfileId: z.string().uuid().nullable(),
})

export type Profiles = z.infer<typeof ProfilesSchema> 
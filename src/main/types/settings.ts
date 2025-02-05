import { z } from 'zod'

// 通用的 settings 值类型
export type SettingsValue = string | number | boolean | null | { [key: string]: SettingsValue } | SettingsValue[]

// Settings 对象的 Schema
export const SettingsSchema = z.record(z.string(), z.unknown())

export type Settings = z.infer<typeof SettingsSchema> 
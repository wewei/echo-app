import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { type Settings, SettingsSchema } from '@/shared/types/settings'

const SETTINGS_DIR = 'settings'

// 获取 settings 目录路径
const getSettingsDir = (profileId: string) =>
  path.join(app.getPath('userData'), 'profiles', profileId, SETTINGS_DIR)

// 获取特定 scope 的 settings 文件路径
const getSettingsPath = (profileId: string, scope: string) =>
  path.join(getSettingsDir(profileId), `${scope}.json`)

// 确保 settings 目录存在
const ensureSettingsDir = async (profileId: string) => {
  const dir = getSettingsDir(profileId)
  await fs.mkdir(dir, { recursive: true })
}

// 读取 settings
export const readSettings = async (
  profileId: string,
  scope: string
): Promise<Settings> => {
  try {
    const filePath = getSettingsPath(profileId, scope)
    const data = await fs.readFile(filePath, 'utf-8')
    return SettingsSchema.parse(JSON.parse(data))
  } catch (error) {
    return {}
  }
}

// 写入 settings
export const writeSettings = async (
  profileId: string,
  scope: string,
  settings: Settings
): Promise<void> => {
  await ensureSettingsDir(profileId)
  const filePath = getSettingsPath(profileId, scope)
  await fs.writeFile(filePath, JSON.stringify(settings, null, 2))
}

// 更新部分 settings
export const updateSettings = async (
  profileId: string,
  scope: string,
  updates: Settings
): Promise<Settings> => {
  const current = await readSettings(profileId, scope)
  const updated = { ...current, ...updates }
  await writeSettings(profileId, scope, updated)
  for (const callback of (settingsListeners.get(scope) || [])) {
    callback(profileId, updated)
  }
  return updated
}

// 删除特定 key 的 settings
export const deleteSettings = async (
  profileId: string,
  scope: string,
  keys: string[]
): Promise<Settings> => {
  const current = await readSettings(profileId, scope)
  const updated = { ...current }
  for (const key of keys) {
    delete updated[key]
  }
  await writeSettings(profileId, scope, updated)
  return updated
}

// 清除某个 scope 的所有 settings
export const clearSettings = async (
  profileId: string,
  scope: string
): Promise<void> => {
  try {
    const filePath = getSettingsPath(profileId, scope)
    await fs.unlink(filePath)
  } catch (error) {
    // 如果文件不存在，忽略错误
  }
}

// 获取所有可用的 scopes
export const getScopes = async (profileId: string): Promise<string[]> => {
  try {
    const dir = getSettingsDir(profileId)
    const files = await fs.readdir(dir)
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.slice(0, -5)) // 移除 .json 后缀
  } catch (error) {
    return []
  }
} 

const settingsListeners = new Map<string, ((profileId: string, settings: Settings) => void)[]>()

export const onSettingsUpdate = (scope: string, callback: (profileId: string, settings: Settings) => void): () => void => {
  settingsListeners.set(scope, [...(settingsListeners.get(scope) || []), callback])
  return () => {
    settingsListeners.set(scope, [...(settingsListeners.get(scope) || []), callback])
  }
}
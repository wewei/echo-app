import { ipcMain } from 'electron'
import * as SettingsManager from '../services/settingsManager'
import { Settings } from '../types/settings'

export const registerSettingsHandlers = () => {
  // 读取 settings
  ipcMain.handle(
    'settings:read',
    async (_, profileId: string, scope: string) => {
      return await SettingsManager.readSettings(profileId, scope)
    }
  )

  // 写入 settings
  ipcMain.handle(
    'settings:write',
    async (_, profileId: string, scope: string, settings: Settings) => {
      await SettingsManager.writeSettings(profileId, scope, settings)
    }
  )

  // 更新 settings
  ipcMain.handle(
    'settings:update',
    async (_, profileId: string, scope: string, updates: Settings) => {
      return await SettingsManager.updateSettings(profileId, scope, updates)
    }
  )

  // 删除指定 keys 的 settings
  ipcMain.handle(
    'settings:delete',
    async (_, profileId: string, scope: string, keys: string[]) => {
      return await SettingsManager.deleteSettings(profileId, scope, keys)
    }
  )

  // 清除 scope 的所有 settings
  ipcMain.handle(
    'settings:clear',
    async (_, profileId: string, scope: string) => {
      await SettingsManager.clearSettings(profileId, scope)
    }
  )

  // 获取所有 scopes
  ipcMain.handle(
    'settings:getScopes',
    async (_, profileId: string) => {
      return await SettingsManager.getScopes(profileId)
    }
  )
} 
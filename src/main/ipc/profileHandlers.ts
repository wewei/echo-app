import { ipcMain } from 'electron'
import * as ProfileManager from '../services/profileManager'

export const registerProfileHandlers = () => {
  // 创建 profile
  ipcMain.handle('profile:create', async (_, username: string, avatar: string) => {
    return await ProfileManager.createProfile(username, avatar)
  })

  // 删除 profile
  ipcMain.handle('profile:delete', async (_, profileId: string) => {
    await ProfileManager.deleteProfile(profileId)
  })

  // 更新 profile
  ipcMain.handle('profile:update', async (_, profileId: string, updates: any) => {
    return await ProfileManager.updateProfile(profileId, updates)
  })

  // 设置默认 profile
  ipcMain.handle('profile:setDefault', async (_, profileId: string) => {
    await ProfileManager.setDefaultProfile(profileId)
  })

  // 获取所有 profiles
  ipcMain.handle('profile:getAll', async () => {
    return await ProfileManager.getAllProfiles()
  })

  // 获取指定 profile
  ipcMain.handle('profile:get', async (_, profileId: string) => {
    return await ProfileManager.getProfile(profileId)
  })

  // 获取默认 profile
  ipcMain.handle('profile:getDefault', async () => {
    return await ProfileManager.getDefaultProfile()
  })
} 
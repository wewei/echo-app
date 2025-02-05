import { ipcMain } from 'electron'
import * as ProfileManager from '../services/profileManager'
import { ProfileSchema } from '../../shared/types/profile'

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
  ipcMain.handle('profile:update', async (_, profileId: string, updates: unknown) => {
    const updatesObj = ProfileSchema.partial().parse(updates);
    return await ProfileManager.updateProfile(profileId, updatesObj)
  })

  // 获取所有 profiles
  ipcMain.handle('profile:getAll', async () => {
    return await ProfileManager.getAllProfiles()
  })

  // 获取指定 profile
  ipcMain.handle('profile:get', async (_, profileId: string) => {
    return await ProfileManager.getProfile(profileId)
  })
} 
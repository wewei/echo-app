import { ipcMain } from 'electron'
import * as AssetManager from '../services/assetManager'

export const registerAssetHandlers = () => {
  // 保存 asset
  ipcMain.handle(
    'asset:save',
    async (_, profileId: string, content: ArrayBuffer, mimeType: string) => {
      return await AssetManager.saveAsset(profileId, content, mimeType)
    }
  )

  // 读取 asset
  ipcMain.handle(
    'asset:read',
    async (_, profileId: string, assetId: string) => {
      return await AssetManager.readAsset(profileId, assetId)
    }
  )

  // 删除 asset
  ipcMain.handle(
    'asset:delete',
    async (_, profileId: string, assetId: string) => {
      await AssetManager.deleteAsset(profileId, assetId)
    }
  )
} 
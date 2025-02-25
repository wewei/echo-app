import { ipcRenderer } from 'electron'
import type { IAssetAPI } from '@/shared/types/ipc'

// Asset API
export const assetAPI: IAssetAPI = {
  save: (profileId, content, mimeType) => 
    ipcRenderer.invoke('asset:save', profileId, content, mimeType),
  read: (profileId, assetId) => 
    ipcRenderer.invoke('asset:read', profileId, assetId),
  delete: (profileId, assetId) => 
    ipcRenderer.invoke('asset:delete', profileId, assetId),
  getUrl: (profileId, assetId) => 
    `echo-asset://${profileId}/${assetId}`
}
import { contextBridge, ipcRenderer } from 'electron'
import type { IProfileAPI, IAssetAPI, ISettingsAPI } from './types'

// Profile API
const profileAPI: IProfileAPI = {
  create: (username, avatar) => 
    ipcRenderer.invoke('profile:create', username, avatar),
  delete: (profileId) => 
    ipcRenderer.invoke('profile:delete', profileId),
  update: (profileId, updates) => 
    ipcRenderer.invoke('profile:update', profileId, updates),
  setDefault: (profileId) => 
    ipcRenderer.invoke('profile:setDefault', profileId),
  getAll: () => 
    ipcRenderer.invoke('profile:getAll'),
  get: (profileId) => 
    ipcRenderer.invoke('profile:get', profileId),
  getDefault: () => 
    ipcRenderer.invoke('profile:getDefault')
}

// Asset API
const assetAPI: IAssetAPI = {
  save: (profileId, content, mimeType) => 
    ipcRenderer.invoke('asset:save', profileId, content, mimeType),
  read: (profileId, assetId) => 
    ipcRenderer.invoke('asset:read', profileId, assetId),
  delete: (profileId, assetId) => 
    ipcRenderer.invoke('asset:delete', profileId, assetId),
  getUrl: (profileId, assetId) => 
    `echo-asset://${profileId}/${assetId}`
}

// Settings API
const settingsAPI: ISettingsAPI = {
  read: (profileId, scope) => 
    ipcRenderer.invoke('settings:read', profileId, scope),
  write: (profileId, scope, settings) => 
    ipcRenderer.invoke('settings:write', profileId, scope, settings),
  update: (profileId, scope, updates) => 
    ipcRenderer.invoke('settings:update', profileId, scope, updates),
  delete: (profileId, scope, keys) => 
    ipcRenderer.invoke('settings:delete', profileId, scope, keys),
  clear: (profileId, scope) => 
    ipcRenderer.invoke('settings:clear', profileId, scope),
  getScopes: (profileId) => 
    ipcRenderer.invoke('settings:getScopes', profileId)
}

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  profile: profileAPI,
  asset: assetAPI,
  settings: settingsAPI
})

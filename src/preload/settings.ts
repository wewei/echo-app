import { ipcRenderer } from 'electron'
import type { ISettingsAPI } from '@/shared/types/ipc'


// Settings API
export const settingsAPI: ISettingsAPI = {
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
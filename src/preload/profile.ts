import { ipcRenderer } from 'electron'
import type { IProfileAPI } from './types'

export const profileAPI: IProfileAPI = {
  create: (username, avatar) => 
    ipcRenderer.invoke('profile:create', username, avatar),
  delete: (profileId) => 
    ipcRenderer.invoke('profile:delete', profileId),
  update: (profileId, updates) => 
    ipcRenderer.invoke('profile:update', profileId, updates),
  getAll: () => 
    ipcRenderer.invoke('profile:getAll'),
  get: (profileId) => 
    ipcRenderer.invoke('profile:get', profileId),
}

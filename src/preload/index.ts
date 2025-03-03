import { contextBridge } from 'electron'
import { assetAPI } from './asset'
import { profileAPI } from './profile'
import { settingsAPI } from './settings'
import { chatAPI } from './chat'
import { interactionAPI } from './interactions'
import { windowApi } from './window'
import { vectorDbApi } from './vectorDb'

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld("electron", {
  profile: profileAPI,
  asset: assetAPI,
  settings: settingsAPI,
  chat: chatAPI,
  interactions: interactionAPI,
  window: windowApi,
  vectorDb: vectorDbApi
});

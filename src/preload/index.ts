import { contextBridge } from 'electron'
import { assetAPI } from './asset'
import { profileAPI } from './profile'
import { settingsAPI } from './settings'
import { chatAPI } from './chat'
import { messageAPI } from './message'
import { interactionAPI } from './interactions'
import { interactionV2API } from './interactionsV2'

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  profile: profileAPI,
  asset: assetAPI,
  settings: settingsAPI,
  chat: chatAPI,
  message: messageAPI,
  interactions: interactionAPI,
  interactionsV2: interactionV2API
})

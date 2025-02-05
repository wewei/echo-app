import { ipcMain } from 'electron'
import * as messageStore from '../services/messageStore'
import type { Message, MessageQuery } from '../../shared/types/message'

export const registerMessageHandlers = () => {
  // 添加消息
  ipcMain.handle(
    'message:add',
    async (_, profileId: string, message: Message) => {
      return await messageStore.addMessage(profileId, message)
    }
  )

  // 获取消息
  ipcMain.handle(
    'message:get',
    async (_, profileId: string, id: string) => {
      return await messageStore.getMessage(profileId, id)
    }
  )

  // 查询消息
  ipcMain.handle(
    'message:query',
    async (_, profileId: string, query: MessageQuery) => {
      return await messageStore.queryMessages(profileId, query)
    }
  )
} 
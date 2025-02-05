import { ipcMain } from 'electron'
import { Profile } from '../../shared/types/profile'
import { Message, ChatOptions } from '../../shared/types/chat'
import * as chatService from '../services/chat'

export const registerChatHandlers = () => {
  ipcMain.handle(
    'chat:send',
    async (_, profile: Profile, messages: Message[], options?: ChatOptions) => {
      return await chatService.chat(profile, messages, options)
    }
  )

  ipcMain.handle(
    'chat:stream',
    async (event, streamId: string, profile: Profile, messages: Message[], options?: ChatOptions) => {
      try {
        await chatService.streamChat(
          profile,
          messages,
          (delta) => {
            event.sender.send('chat:stream:delta', streamId, delta)
          },
          (response) => {
            event.sender.send('chat:stream:done', streamId, response)
          },
          options
        )
      } catch (error) {
        event.sender.send('chat:stream:error', streamId, error.message)
        throw error // 重新抛出错误以便 preload 脚本可以处理
      }
    }
  )
} 
import { ipcMain } from 'electron'
import type OpenAI from 'openai'
import { getClient } from '../services/chatManager'

export const registerChatHandlers = () => {
  ipcMain.handle(
    'chat:send',
    async (_, profileId: string, params: OpenAI.Chat.Completions.ChatCompletionCreateParams) => {
      const client = await getClient(profileId)
      return client.chat.completions.create(params)
    }
  )

  ipcMain.handle(
    'chat:stream',
    async (event, streamId: string, profileId: string, params: OpenAI.Chat.Completions.ChatCompletionCreateParams) => {
      const client = await getClient(profileId)

      try {
        const stream = await client.chat.completions.create({ ...params, stream: true })

        for await (const chunk of stream) {
          console.log('stream', chunk.choices[0]?.delta?.content)
          event.sender.send('chat:stream:delta', streamId, chunk)
        }
        event.sender.send('chat:stream:done', streamId)
      } catch (error) {
        event.sender.send('chat:stream:error', streamId, error.message)
        throw error // 重新抛出错误以便 preload 脚本可以处理
      }
    }
  )
} 
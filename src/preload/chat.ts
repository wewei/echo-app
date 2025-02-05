import { ipcRenderer } from 'electron'
import { Profile } from '../shared/types/profile'
import { ChatMessage, ChatOptions, ChatResponse } from '../shared/types/chat'
import { v4 as uuid } from 'uuid'

export const chatAPI = {
  send: (
    profile: Profile,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatResponse> => {
    return ipcRenderer.invoke('chat:send', profile, messages, options)
  },

  stream: (
    profile: Profile,
    messages: ChatMessage[],
    onMessage: (delta: string) => void,
    onDone: (response: ChatResponse) => void,
    onError: (error: Error) => void,
    options?: ChatOptions
  ): () => void => {
    const streamId = uuid();
    
    const deltaHandler = (_: any, id: string, delta: string) => {
      if (id === streamId) onMessage(delta)
    }
    
    const doneHandler = (_: any, id: string, response: ChatResponse) => {
      if (id === streamId) {
        onDone(response)
        cleanup()
      }
    }
    
    const errorHandler = (_: any, id: string, error: string) => {
      if (id === streamId) {
        onError(new Error(error))
        cleanup()
      }
    }

    const cleanup = () => {
      ipcRenderer.removeListener('chat:stream:delta', deltaHandler)
      ipcRenderer.removeListener('chat:stream:done', doneHandler)
      ipcRenderer.removeListener('chat:stream:error', errorHandler)
    }

    ipcRenderer.on('chat:stream:delta', deltaHandler)
    ipcRenderer.on('chat:stream:done', doneHandler)
    ipcRenderer.on('chat:stream:error', errorHandler)

    ipcRenderer.invoke('chat:stream', streamId, profile, messages, options)
      .catch(error => {
        onError(error)
        cleanup()
      })

    // 返回取消函数
    return cleanup
  },
}

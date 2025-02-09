import { ipcRenderer } from 'electron'
import { OpenAI } from 'openai'
import { v4 as uuid } from 'uuid'

export const chatAPI = {
  send: (
    profileId: string,
    params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
    return ipcRenderer.invoke('chat:send', profileId, params)
  },

  stream: (
    profileId: string,
    params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
    onChunk: (chunk: OpenAI.Chat.Completions.ChatCompletionChunk) => void,
    onDone: () => void,
    onError: (error: Error) => void,
  ): () => void => {
    const streamId = uuid();
    const chunkHandler = (_: unknown, id: string, chunk: OpenAI.Chat.Completions.ChatCompletionChunk) => {
      if (id === streamId) onChunk(chunk)
    }

    const doneHandler = (_: unknown, id: string) => {
      if (id === streamId) {
        onDone()
        cleanup()
      }
    }
    
    const errorHandler = (_: unknown, id: string, error: string) => {
      if (id === streamId) {
        onError(new Error(error))
        cleanup()
      }
    }

    const cleanup = () => {
      ipcRenderer.removeListener('chat:stream:delta', chunkHandler)
      ipcRenderer.removeListener('chat:stream:done', doneHandler)
      ipcRenderer.removeListener('chat:stream:error', errorHandler)
    }

    ipcRenderer.on('chat:stream:delta', chunkHandler)
    ipcRenderer.on('chat:stream:done', doneHandler)
    ipcRenderer.on('chat:stream:error', errorHandler)

    ipcRenderer.invoke('chat:stream', streamId, profileId, params)
      .catch(error => {
        onError(error)
        cleanup()
      })

    // 返回取消函数
    return cleanup
  },
}

import { ipcRenderer } from 'electron'
import type { Message, MessageQuery } from '../shared/types/message'

export const messageAPI = {
  add: (profileId: string, message: Message): Promise<void> => {
    return ipcRenderer.invoke('message:add', profileId, message)
  },

  get: (profileId: string, id: string): Promise<Message | null> => {
    return ipcRenderer.invoke('message:get', profileId, id)
  },

  query: (profileId: string, query: MessageQuery): Promise<Message[]> => {
    return ipcRenderer.invoke('message:query', profileId, query)
  }
} 
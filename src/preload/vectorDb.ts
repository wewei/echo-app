import { ipcRenderer } from 'electron'
import type { VectorDbApi } from '@/shared/types/ipc'

export const vectorDbApi: VectorDbApi = {
  search: (profileId: string, query: string) => {
    return ipcRenderer.invoke('vectorDb:search', profileId, query);
  },

  add: (profileId:string, documents: string[], ids: string[], metadatas: Record<string, unknown>[]) => {
    return ipcRenderer.invoke('vectorDb:add', profileId, documents, ids, metadatas);
  }
}


import { ipcRenderer } from 'electron'
import type { VectorDbApi } from '@/shared/types/ipc'

export const vectorDbApi: VectorDbApi = {
  search: (profileId: string, query: string, top_k: number) => {
    return ipcRenderer.invoke('vectorDb:search', profileId, query, top_k);
  },

  add: (documents: string[], ids: string[], metadatas: Record<string, unknown>[]) => {
    return ipcRenderer.invoke('vectorDb:add', documents, ids, metadatas);
  }
}


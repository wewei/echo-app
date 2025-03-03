import { ipcRenderer } from 'electron'
import type { VectorDbApi } from '@/shared/types/ipc'

export const vectorDbApi: VectorDbApi = {
  search: (profile_id: string, query: string, top_k: number) => {
    return ipcRenderer.invoke('vectorDb:search', profile_id, query, top_k);
  },

  add: (documents: string[], ids: string[], metadatas: Record<string, unknown>[]) => {
    return ipcRenderer.invoke('vectorDb:add', documents, ids, metadatas);
  }
}


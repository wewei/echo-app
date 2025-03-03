
import { ipcMain } from 'electron'
import  * as VectorDbManager from "../services/vectorDbManager"
import type { VectorDbMetadata,  VectorDbSearchResponse } from '@/shared/types/vectorDb'

export const registerVectorDbHandlers = () => {
  ipcMain.handle(
    'vectorDb:search',
    async (_, profileId: string, query: string, top_k: number): Promise<VectorDbSearchResponse> => {
      return await VectorDbManager.search(profileId, query, top_k)
    }
  )

  ipcMain.handle(
    'vectorDb:add',
    async (_, documents: string[], ids: string[], metadatas: VectorDbMetadata[]): Promise<boolean> => {
      return await VectorDbManager.add(documents, ids, metadatas)
    }
  )
}
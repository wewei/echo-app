
import { ipcMain } from 'electron'
import { getClient } from '../services/vectorDbManager'
import type { VectorDbMetadata,  VectorDbSearchResponse } from '@/shared/types/vectorDb'

export const registerVectorDbHandlers = () => {
  ipcMain.handle(
    'vectorDb:search',
    async (_, profileId: string, query: string): Promise<VectorDbSearchResponse> => {
      const client = await getClient(profileId)
      if(!client) {
        return null;
      }
      return await client.search(profileId, query)
    }
  )

  ipcMain.handle(
    'vectorDb:add',
    async (_, profileId: string, documents: string[], ids: string[], metadatas: VectorDbMetadata[]): Promise<boolean> => {
      const client = await getClient(profileId)
      if(!client) {
        return false;
      }
      return await client.add(profileId, documents, ids, metadatas)
    }
  )
}
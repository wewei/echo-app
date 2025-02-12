import { ipcRenderer } from 'electron'
import type { QueryInput, ResponseInput, Query, Response } from '@/shared/types/interactions'
import { IPC_CHANNELS } from '@/shared/types/interactions'

export const interactionAPI = {
  createQuery: (profileId: string, input: QueryInput): Promise<Query> => 
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_QUERY, profileId, input),

  createResponse: (profileId: string, input: ResponseInput): Promise<Response> =>
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_RESPONSE, profileId, input),

  appendResponse: (profileId: string, id: string, content: string): Promise<Response | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.APPEND_RESPONSE, profileId, id, content),

  softDeleteQuery: (profileId: string, id: string): Promise<Query | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SOFT_DELETE_QUERY, profileId, id),

  hardDeleteQuery: (profileId: string, id: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.HARD_DELETE_QUERY, profileId, id),

  getResponses: (profileId: string, ids: string[]): Promise<Response[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_RESPONSES, profileId, ids),

  getQueries: (profileId: string, ids: string[]): Promise<Query[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_QUERIES, profileId, ids),
}

export type InteractionApi = typeof interactionAPI
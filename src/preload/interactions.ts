import { ipcRenderer } from 'electron'
import type { QueryInput, ResponseInput, Query, Response, QuerySearchOptions } from '@/shared/types/interactions'
import { IPC_CHANNELS } from '@/shared/types/interactions'

export const interactionAPI = {
  createQuery: (profileId: string, input: QueryInput): Promise<Query> => 
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_QUERY, profileId, input),

  getQuery: (profileId: string, id: string): Promise<Query | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_QUERY, profileId, id),

  searchQueries: (profileId: string, options: QuerySearchOptions): Promise<Query[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SEARCH_QUERIES, profileId, options),

  createResponse: (profileId: string, input: ResponseInput): Promise<Response> =>
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_RESPONSE, profileId, input),

  appendResponse: (profileId: string, id: string, content: string): Promise<Response | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.APPEND_RESPONSE, profileId, id, content),

  getResponse: (profileId: string, id: string): Promise<Response | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_RESPONSE, profileId, id),

  getQueryResponseIds: (profileId: string, queryId: string): Promise<string[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_QUERY_RESPONSE_IDS, profileId, queryId),
}

export type InteractionApi = typeof interactionAPI
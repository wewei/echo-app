import { ipcMain } from 'electron'

import { QueryInput, ResponseInput, IPC_CHANNELS, QuerySearchOptions } from '@/shared/types/interactions'
import { getInteractionManager } from '@/main/services/interactionManager'

export const registerInteractionHandlers = () => {
  ipcMain.handle(IPC_CHANNELS.CREATE_QUERY, 
    (_, profileId: string, input: QueryInput) => {
      return getInteractionManager(profileId).createQuery(input)
    }
  )

  ipcMain.handle(IPC_CHANNELS.SEARCH_QUERIES,
    (_, profileId: string, options: QuerySearchOptions) => {
      return getInteractionManager(profileId).searchQueries(options)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GET_QUERIES,
    (_, profileId: string, ids: string[]) => {
      return getInteractionManager(profileId).getQueries(ids)
    }
  )
  ipcMain.handle(IPC_CHANNELS.GET_RESPONSES,
    (_, profileId: string, ids: string[]) => {
      return getInteractionManager(profileId).getResponses(ids)
    }
  )

  ipcMain.handle(IPC_CHANNELS.CREATE_RESPONSE,
    (_, profileId: string, input: ResponseInput) => {
      return getInteractionManager(profileId).createResponse(input)
    }
  )

  ipcMain.handle(IPC_CHANNELS.APPEND_RESPONSE,
    (_, profileId: string, id: string, content: string) => {
      return getInteractionManager(profileId).appendResponse(id, content)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GET_RESPONSES_OF_QUERY,
    (_, profileId: string, queryId: string) => {
      return getInteractionManager(profileId).getResponsesOfQuery(queryId)
    }
  )
} 
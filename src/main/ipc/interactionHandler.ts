import { ipcMain } from 'electron'

import { QueryInput, ResponseInput, IPC_CHANNELS, QuerySearchOptions } from '@/shared/types/interactions'
import { getInteractionManager } from '@/main/services/interactionManager'
import { isEntityExist } from '@/shared/utils/cache/cache'

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

  ipcMain.handle(IPC_CHANNELS.GET_QUERY,
    (_, profileId: string, id: string) => {
      const entity = getInteractionManager(profileId).getQuery(id)
      if (isEntityExist(entity)) {
        return entity
      }
      return null
    }
  )
  ipcMain.handle(IPC_CHANNELS.GET_RESPONSE,
    (_, profileId: string, id: string) => {
      const entity = getInteractionManager(profileId).getResponse(id)
      if (isEntityExist(entity)) {
        return entity
      }
      return null
    }
  )

  ipcMain.handle(IPC_CHANNELS.CREATE_RESPONSE,
    (_, profileId: string, input: ResponseInput) => {
      return getInteractionManager(profileId).createResponse(input)
    }
  )

  ipcMain.handle(IPC_CHANNELS.APPEND_RESPONSE,
    (_, profileId: string, id: string, content: string) => {
      const entity = getInteractionManager(profileId).appendResponse(id, content)
      if (isEntityExist(entity)) {
        return entity
      }
      return null
    }
  )

  ipcMain.handle(IPC_CHANNELS.GET_QUERY_RESPONSE_IDS,
    (_, profileId: string, queryId: string) => {
      return getInteractionManager(profileId).getQueryResponseIds(queryId)
    }
  )
} 
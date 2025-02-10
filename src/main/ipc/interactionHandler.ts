import { ipcMain } from 'electron'

import { QueryInput, ResponseInput } from '@/shared/types/interactions'
import { IPC_CHANNELS } from '@/shared/types/interactions'

import { getInteractionManager, type SearchOptions } from '@/main/services/interactionManager'

export const registerInteractionHandlers = () => {
  ipcMain.handle(IPC_CHANNELS.CREATE_QUERY, 
    (_, profileId: string, input: QueryInput) => {
      return getInteractionManager(profileId).createQuery(input)
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

  ipcMain.handle(IPC_CHANNELS.SOFT_DELETE_QUERY,
    (_, profileId: string, id: string) => {
      return getInteractionManager(profileId).softDeleteQuery(id)
    }
  )

  ipcMain.handle(IPC_CHANNELS.HARD_DELETE_QUERY,
    (_, profileId: string, id: string) => {
      return getInteractionManager(profileId).hardDeleteQuery(id)
    }
  )

  ipcMain.handle(IPC_CHANNELS.SEARCH_INTERACTIONS,
    (_, profileId: string, options: SearchOptions) => {
      return getInteractionManager(profileId).searchInteractions(options)
    }
  )

  ipcMain.handle(IPC_CHANNELS.SEARCH_INTERACTION_IDS,
    (_, profileId: string, options: SearchOptions) => {
      return getInteractionManager(profileId).searchInteractionIds(options)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GET_RESPONSES,
    (_, profileId: string, ids: string[]) => {
      return getInteractionManager(profileId).getResponses(ids)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GET_QUERIES,
    (_, profileId: string, ids: string[]) => {
      return getInteractionManager(profileId).getQueries(ids)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GET_INTERACTIONS,
    (_, profileId: string, ids: string[]) => {
      return getInteractionManager(profileId).getInteractions(ids)
    }
  )
} 
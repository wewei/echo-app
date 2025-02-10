import { getDatabaseService } from '../store/interactions'
import { QueryInput, ResponseInput, Query, Response, Interaction } from '@/shared/types/interactions'

const managers = new Map<string, InteractionManager>()

export interface SearchOptions {
  timestamp?: number
  before?: number
  after?: number
  contextId?: string
  queryType?: string
  responseAgents?: string[]
  queryId?: string
  deletedTimestamp?: number
  deletedBefore?: number
  deletedAfter?: number
}

export interface InteractionManager {
  createQuery: (input: QueryInput) => Query
  createResponse: (input: ResponseInput) => Response
  appendResponse: (id: string, content: string) => void
  softDeleteQuery: (id: string) => void
  hardDeleteQuery: (id: string) => void
  searchInteractions: (options: SearchOptions) => Interaction[]
  searchInteractionIds: (options: SearchOptions) => string[]
  getResponses: (ids: string[]) => Response[]
  getQueries: (ids: string[]) => Query[]
  getInteractions: (ids: string[]) => Interaction[]
}

export const getInteractionManager = (profileId: string): InteractionManager => {
  if (managers.has(profileId)) {
    return managers.get(profileId)!
  }

  const db = getDatabaseService(profileId)

  const manager: InteractionManager = {
    createQuery: (input: QueryInput) => {
      return db.query.create(input)
    },

    createResponse: (input: ResponseInput) => {
      return db.response.create(input)
    },

    appendResponse: (id: string, content: string) => {
      const response = db.response.get(id)
      if (response) {
        db.response.update(id, {
          content: response.content + content,
          timestamp: Date.now()
        })
      }
    },

    softDeleteQuery: (id: string) => {
      db.query.softDelete(id)
    },

    hardDeleteQuery: (id: string) => {
      db.query.hardDelete(id)
    },

    searchInteractions: (options: SearchOptions) => {
      return db.interaction.search(options)
    },

    searchInteractionIds: (options: SearchOptions) => {
      return db.interaction.searchIds(options)
    },

    getResponses: (ids: string[]) => {
      return db.response.getByIds(ids)
    },

    getQueries: (ids: string[]) => {
      return db.query.getByIds(ids)
    },

    getInteractions: (ids: string[]) => {
      return db.interaction.getByIds(ids)
    }
  }

  managers.set(profileId, manager)
  return manager
}


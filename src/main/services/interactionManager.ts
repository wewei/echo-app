import { getDatabaseService } from '../store/interactions'
import { QueryInput, ResponseInput, Query, Response, QuerySearchOptions } from '@/shared/types/interactions'
import { onProfileDeleted } from './profileManager'

const managers = new Map<string, InteractionManager>()

export interface InteractionManager {
  // 创建 Query
  createQuery: (input: QueryInput) => Query

  // 获取 Query
  getQueries: (ids: string[]) => Query[]

  // 搜索 Query, 返回 Query 的 id
  searchQueries: (options: QuerySearchOptions) => Query[]

  // 创建 Response
  createResponse: (input: ResponseInput) => Response

  // 追加 Response
  appendResponse: (id: string, content: string) => Response | null

  // 获取 Response
  getResponses: (ids: string[]) => Response[]

  // 获取 Query 对应的 Response, 返回 Response 的 id
  getQueryResponseIds: (queryId: string) => string[]
}

export const getInteractionManager = (profileId: string): InteractionManager => {
  if (managers.has(profileId)) {
    return managers.get(profileId) as InteractionManager
  }

  const db = getDatabaseService(profileId)

  const manager: InteractionManager = {
    createQuery: (input: QueryInput) => {
      return db.query.create(input)
    },

    getQueries: (ids: string[]) => {
      const result = db.query.getByIds(ids);
      console.log("getQueries", result);
      return result;
    },

    getResponses: (ids: string[]) => {
      return db.response.getByIds(ids)
    },

    searchQueries: (options: QuerySearchOptions) => {
      return db.query.search(options)
    },

    createResponse: (input: ResponseInput) => {
      return db.response.create(input)
    },

    appendResponse: (id: string, content: string) => {
      const response = db.response.get(id) || null
      if (response) {
        db.response.update(id, {
          content: response.content + content,
          timestamp: Date.now()
        })
      }
      return response
    },

    getQueryResponseIds: (queryId: string) => {
      return db.response.getByQueryId(queryId)
    },
  }

  managers.set(profileId, manager)
  return manager
}

onProfileDeleted((profileId) => { managers.delete(profileId) })

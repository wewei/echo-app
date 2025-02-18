import { getDatabaseService } from '../store/interactions'
import { QueryInput, ResponseInput, Query, Response, QuerySearchOptions } from '@/shared/types/interactions'
import { onProfileDeleted } from './profileManager'
import { EntityState, isEntityExist } from '@/shared/types/entity'
import { makeCache } from '@/shared/utils/cache'
import { debounce } from '@/shared/utils/timing'

const managers = new Map<string, InteractionManager>()

export interface InteractionManager {
  // 创建 Query
  createQuery: (input: QueryInput) => Query

  // 获取 Query
  getQuery: (id: string) => EntityState<Query>

  // 搜索 Query, 返回 Query 的 id
  searchQueries: (options: QuerySearchOptions) => Query[]

  // 创建 Response
  createResponse: (input: ResponseInput) => Response

  // 追加 Response
  appendResponse: (id: string, content: string) => EntityState<Response>

  // 获取 Response
  getResponse: (id: string) => EntityState<Response>

  // 获取 Query 对应的 Response, 返回 Response 的 id
  getQueryResponseIds: (queryId: string) => string[]
}

export const getInteractionManager = (profileId: string): InteractionManager => {
  if (managers.has(profileId)) {
    return managers.get(profileId) as InteractionManager
  }

  const db = getDatabaseService(profileId)

  const responeCache = makeCache<string, Response>()
  const queryCache = makeCache<string, Query>()

  const createQuery = (input: QueryInput) => {
    return db.query.create(input)
  }

  const getQuery = (id: string) => {
    if (!queryCache.has(id)) {
      const query = db.query.get(id)
      if (isEntityExist(query)) {
          queryCache.set(id, query)
        }
    }
    return queryCache.get(id)
  }

  const searchQueries = (options: QuerySearchOptions) => {
    const queries = db.query.search(options)
    queries.forEach(query => queryCache.set(query.id, query))
    return queries
  }

  const getResponse = (id: string) => {
    if (!responeCache.has(id)) {
      const response = db.response.get(id)
      if (isEntityExist(response)) {
          responeCache.set(id, response)
        }
      }
    return responeCache.get(id)
  }

  const createResponse = (input: ResponseInput) => {
    return db.response.create(input)
  }

  const saveCachedResponse = (id: string) => {
    const response = responeCache.get(id)
    if (isEntityExist(response)) {
      db.response.update(id, response)
    }
  }

  const saveResponseAfterAppending = debounce(saveCachedResponse, 2000)

  const appendResponse = (id: string, content: string) => {
    const response = getResponse(id)
    if (isEntityExist(response)) {
      const newResponse = { ...response, content: response.content + content, timestamp: Date.now() }
      responeCache.set(id, newResponse)
      saveResponseAfterAppending(id)
      return newResponse
    }
    return response
  }

  const getQueryResponseIds = (queryId: string) => {
    return db.response.getByQueryId(queryId)
  }

  const manager: InteractionManager = {
    createQuery,
    getQuery,
    searchQueries,
    createResponse,
    appendResponse,
    getResponse,
    getQueryResponseIds
  }

  managers.set(profileId, manager)
  return manager
}

onProfileDeleted((profileId) => { managers.delete(profileId) })

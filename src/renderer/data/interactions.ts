import { InteractionApi } from '@/preload/interactions'
import { Query, Response, Interaction } from '@/shared/types/interactions'
import type { SearchOptions } from '@/main/services/interactionManager'

class InteractionStore {
  private api: InteractionApi
  private profileId: string
  private queryCache = new Map<string, Query>()
  private responseCache = new Map<string, Response>()

  constructor(api: InteractionApi, profileId: string) {
    this.api = api
    this.profileId = profileId
  }

  // Query 相关方法
  async createQuery(input: Omit<Query, "id">): Promise<Query> {
    const query = await this.api.createQuery(this.profileId, input)
    this.queryCache.set(query.id, query)
    return query
  }

  async softDeleteQuery(id: string): Promise<void> {
    await this.api.softDeleteQuery(this.profileId, id)
    const query = this.queryCache.get(id)
    if (query) {
      this.queryCache.set(id, {
        ...query,
        deletedTimestamp: Date.now()
      })
    }
  }

  async hardDeleteQuery(id: string): Promise<void> {
    await this.api.hardDeleteQuery(this.profileId, id)
    this.queryCache.delete(id)
  }

  async getQueries(ids: string[]): Promise<Query[]> {
    const uncachedIds = ids.filter(id => !this.queryCache.has(id))
    if (uncachedIds.length > 0) {
      const queries = await this.api.getQueries(this.profileId, uncachedIds)
      queries.forEach(query => this.queryCache.set(query.id, query))
    }
    return ids.map(id => this.queryCache.get(id)!).filter(Boolean)
  }

  // Response 相关方法
  async createResponse(input: Omit<Response, "id">): Promise<Response> {
    const response = await this.api.createResponse(this.profileId, input)
    this.responseCache.set(response.id, response)
    return response
  }

  async appendResponse(id: string, content: string): Promise<void> {
    await this.api.appendResponse(this.profileId, id, content)
    const response = this.responseCache.get(id)
    if (response) {
      this.responseCache.set(id, {
        ...response,
        content: response.content + content,
        timestamp: Date.now()
      })
    }
  }

  async getResponses(ids: string[]): Promise<Response[]> {
    const uncachedIds = ids.filter(id => !this.responseCache.has(id))
    if (uncachedIds.length > 0) {
      const responses = await this.api.getResponses(this.profileId, uncachedIds)
      responses.forEach(response => this.responseCache.set(response.id, response))
    }
    return ids.map(id => this.responseCache.get(id)!).filter(Boolean)
  }

  // Interaction 相关方法
  async searchInteractions(options: SearchOptions): Promise<Interaction[]> {
    const interactions = await this.api.searchInteractions(this.profileId, options)
    
    // 更新缓存
    interactions.forEach(interaction => {
      this.queryCache.set(interaction.queryId, {
        id: interaction.queryId,
        content: interaction.queryContent,
        timestamp: interaction.queryTimestamp,
        type: interaction.queryType,
        deletedTimestamp: interaction.queryDeletedTimestamp
      })
      
      this.responseCache.set(interaction.responseId, {
        id: interaction.responseId,
        content: interaction.responseContent,
        timestamp: interaction.responseTimestamp,
        agents: interaction.responseAgents,
        query: interaction.queryId
      })
    })

    return interactions
  }

  async searchInteractionIds(options: SearchOptions): Promise<string[]> {
    return await this.api.searchInteractionIds(this.profileId, options)
  }

  async getInteractions(ids: string[]): Promise<Interaction[]> {
    const interactions = await this.api.getInteractions(this.profileId, ids)
    
    // 更新缓存
    interactions.forEach(interaction => {
      this.queryCache.set(interaction.queryId, {
        id: interaction.queryId,
        content: interaction.queryContent,
        timestamp: interaction.queryTimestamp,
        type: interaction.queryType,
        deletedTimestamp: interaction.queryDeletedTimestamp
      })
      
      this.responseCache.set(interaction.responseId, {
        id: interaction.responseId,
        content: interaction.responseContent,
        timestamp: interaction.responseTimestamp,
        agents: interaction.responseAgents,
        query: interaction.queryId
      })
    })

    return interactions
  }

  // 缓存管理
  clearCache(): void {
    this.queryCache.clear()
    this.responseCache.clear()
  }
}

// 工厂函数
export const createInteractionStore = (
  api: InteractionApi,
  profileId: string
): InteractionStore => {
  return new InteractionStore(api, profileId)
}

export type { InteractionStore }


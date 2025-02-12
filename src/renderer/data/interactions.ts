import {
  type Query,
  type Response,
} from "@/shared/types/interactions";

export interface InteractionStore {
  // Query 相关方法
  createQuery: (input: Omit<Query, "id">) => Promise<Query>;
  softDeleteQuery: (id: string) => Promise<Query | null>;
  hardDeleteQuery: (id: string) => Promise<void>;
  getQuery: (id: string) => Promise<Query | null>;

  // Response 相关方法
  createResponse: (input: Omit<Response, "id">) => Promise<Response>;
  appendResponse: (id: string, content: string) => Promise<Response | null>;
  getResponse: (id: string) => Promise<Response | null>;

  // 缓存管理
  clearCache: () => void;
}

const interactionStores = new Map<string, InteractionStore>();

export const getInteractionStore = (profileId: string): InteractionStore => {
  const api = window.electron.interactions;

  if (interactionStores.has(profileId)) {
    return interactionStores.get(profileId) as InteractionStore;
  }
  const queryCache = new Map<string, Query>();
  const responseCache = new Map<string, Response>();
  const queryResponses = new Map<string, Set<string>>();

  // 缓存更新辅助函数
  const updateCachedResponse = (response: Response) => {
    responseCache.set(response.id, response);
    if (!queryResponses.has(response.query)) {
      queryResponses.set(response.query, new Set());
    }
    queryResponses.get(response.query)?.add(response.id);
  };

  const updateCachedQuery = (query: Query) => {
    queryCache.set(query.id, query);
  };

  const removeCachedQuery = (id: string) => {
    queryCache.delete(id);
    queryResponses
      .get(id)
      ?.forEach((responseId) => responseCache.delete(responseId));
    queryResponses.delete(id);
  };

  const getQuery = async (id: string) => {
    if (!queryCache.has(id)) {
      const queries = await api.getQueries(profileId, [id]);
      if (queries.length > 0) {
        queryCache.set(id, queries[0]);
      }
    }
    return queryCache.get(id);
  };

  const getResponse = async (id: string) => {
    if (!responseCache.has(id)) {
      const responses = await api.getResponses(profileId, [id]);
      if (responses.length > 0) {
        responseCache.set(id, responses[0]);
      }
    }
    return responseCache.get(id);
  };

  const interactionStore: InteractionStore = {
    // Query 相关方法
    async createQuery(input: Omit<Query, "id">) {
      const query = await api.createQuery(profileId, input);
      updateCachedQuery(query);
      return query;
    },

    async softDeleteQuery(id: string) {
      const query = await api.softDeleteQuery(profileId, id);
      if (query) {
        updateCachedQuery(query);
      }
      return query;
    },

    async hardDeleteQuery(id: string) {
      await api.hardDeleteQuery(profileId, id);
      removeCachedQuery(id);
    },

    getQuery,

    // Response 相关方法
    async createResponse(input: Omit<Response, "id">) {
      const response = await api.createResponse(profileId, input);
      updateCachedResponse(response);
      return response;
    },

    async appendResponse(id: string, content: string) {
      const response = await api.appendResponse(profileId, id, content);
      if (response) {
        updateCachedResponse(response);
      }
      return response;
    },

    getResponse,

    // 缓存管理
    clearCache() {
      queryCache.clear();
      responseCache.clear();
      queryResponses.clear();
    },
  };

  interactionStores.set(profileId, interactionStore);
  return interactionStore;
};

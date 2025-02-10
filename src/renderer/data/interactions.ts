import {
  type Query,
  type Response,
  type Interaction,
  type SearchOptions,
  queryFromInteraction,
  responseFromInteraction,
  interactionFromQueryAndResponse,
} from "@/shared/types/interactions";
import { useState, useEffect } from "react";
import { eventSource } from "@/shared/utils/event";

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

  // Interaction 相关方法
  searchInteractions: (options: SearchOptions) => Promise<Interaction[]>;
  searchInteractionIds: (options: SearchOptions) => Promise<string[]>;
  getInteraction: (id: string) => Promise<Interaction | null>;

  // 缓存管理
  clearCache: () => void;
}

const interactionStores = new Map<string, InteractionStore>();
const [notifyInteractionChanged, onInteractionChanged] =
  eventSource<[string, string, Interaction]>();

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

  const updateCachesFromInteraction = (interaction: Interaction) => {
    updateCachedQuery(queryFromInteraction(interaction));
    updateCachedResponse(responseFromInteraction(interaction));
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
        const responseIds = queryResponses.get(query.id);
        responseIds?.forEach((responseId) => {
          const response = responseCache.get(responseId);
          if (response) {
            notifyInteractionChanged(
              profileId,
              responseId,
              interactionFromQueryAndResponse(query, response)
            );
          }
        });
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
        const query = await getQuery(response.query);
        notifyInteractionChanged(
          profileId,
          response.id,
          interactionFromQueryAndResponse(query, response)
        );
      }
      return response;
    },

    getResponse,

    // Interaction 相关方法
    async searchInteractions(options: SearchOptions) {
      const interactions = await api.searchInteractions(profileId, options);
      interactions.forEach(updateCachesFromInteraction);
      return interactions;
    },

    async searchInteractionIds(options: SearchOptions) {
      return await api.searchInteractionIds(profileId, options);
    },

    async getInteraction(id: string) {
      const response = await getResponse(id);
      const query = await getQuery(response?.query);
      return interactionFromQueryAndResponse(query, response);
    },

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

export const useInteraction = (profileId: string, interactionId: string) => {
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  useEffect(() => {
    const interactionStore = getInteractionStore(profileId);
    interactionStore.getInteraction(interactionId).then(setInteraction);
  }, [profileId, interactionId]);

  onInteractionChanged((pid, iid, interaction) => {
    if (pid === profileId && iid === interactionId) {
      setInteraction(interaction);
    }
  });

  return interaction;
}

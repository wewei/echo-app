import { useState, useEffect, useReducer, useCallback } from "react";
import { Query, Response } from "@/shared/types/interactions";
import { ENTITY_NOT_EXIST } from "@/shared/utils/cache";
import { makeEventHub } from "@/shared/utils/event";
import { useCurrentProfileId } from "./profile";
import { EntityRendererState, ENTITY_PENDING } from "./cachedEntity";

export type CreateParams<T extends { id: string }> = Omit<T, 'id'>;

type ListResult<T> = {
  items: T[]
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

// Route /profileId/responseId
const createQueryEventHub = makeEventHub<Query>()
// Route /profileId/queryId
const createResponseEventHub = makeEventHub<Response>()
// Route /profileId/responseId
const appendQueryContentEventHub = makeEventHub<string>()

const useRecentQueries = (contextId?: string): ListResult<Query> => {
  type RecentQueryState = {
    items: Query[]
    hasMore: boolean
  }
  type RecentQueryAction = {
    type: 'newQueryCreated'
    query: Query
  } | {
    type: 'moreQueriesLoaded'
    queries: Query[]
    hasMore: boolean
  } | {
    type: 'refreshed'
    queries: Query[]
    hasMore: boolean
  }

  const [state, dispatch] = useReducer<RecentQueryState, [RecentQueryAction]>((current, action) => {
    switch (action.type) {
      case 'newQueryCreated':
        return { items: [...current.items, action.query], hasMore: current.hasMore }
      case 'moreQueriesLoaded':
        return { items: [...action.queries, ...current.items], hasMore: action.hasMore }
      case 'refreshed':
        return { items: action.queries, hasMore: action.hasMore }
    }
  }, { items: [], hasMore: true });

  const profileId = useCurrentProfileId()
  const earliestTimestamp = state.items[0]?.timestamp ?? Date.now()

  const loadMore = useCallback(async () => {
    const queries = await window.electron.interactions.searchQueries(profileId, {
      created: {
        type: 'before',
        timestamp: earliestTimestamp
      },
      contextId,
      maxCount: 100,
    })
    dispatch({ type: 'moreQueriesLoaded', queries, hasMore: queries.length > 0 })
  }, [profileId, contextId, earliestTimestamp])

  const refresh = useCallback(async () => {
    const queries = await window.electron.interactions.searchQueries(profileId, {
      created: {
        type: 'before',
        timestamp: Date.now()
      },
      contextId,
      maxCount: 100,
    })
    dispatch({ type: 'refreshed', queries, hasMore: queries.length > 0 })
  }, [profileId, contextId])

  useEffect(() => {
    refresh();
    const unwatch = createQueryEventHub.watch(contextId ? [profileId, contextId] : [profileId], (query) => {
      console.log("newQueryCreated", query);
      dispatch({ type: 'newQueryCreated', query })
    })
    return () => { unwatch() }
  }, [profileId, contextId])

  return {
    items: state.items,
    hasMore: state.hasMore,
    loadMore,
    refresh,
  };
}

const useQuery = (id: string): EntityRendererState<Query> => {
  const [state, setState] = useState<EntityRendererState<Query>>(ENTITY_PENDING);
  const profileId = useCurrentProfileId()

  useEffect(() => {
    const load = async () => {
      const [query] = await window.electron.interactions.getQueries(profileId, [id])
      if (query) {
        setState(query)
      } else {
        setState(ENTITY_NOT_EXIST)
      }
    }

    load()
  }, [id])

  return state;
}

const useResponse = (id: string): EntityRendererState<Response> => {
  const [state, setState] = useState<EntityRendererState<Response>>(ENTITY_PENDING);
  const profileId = useCurrentProfileId()

  useEffect(() => {
    const load = async () => {
      const [response] = await window.electron.interactions.getResponses(profileId, [id])
      if (response) {
        setState(response)
      } else {
        setState(ENTITY_NOT_EXIST)
      }
    }

    load()

    const unwatch = appendQueryContentEventHub.watch([profileId, id], (content) => {
      setState(prev => {
        if (prev === ENTITY_NOT_EXIST) {
          return ENTITY_NOT_EXIST
        }
        if (prev === ENTITY_PENDING) {
          return ENTITY_PENDING
        }
        return { ...prev, content: prev.content + content }
      })
    })

    return () => { unwatch() }
  }, [id])

  return state;
}

const useQueryResponseIds = (queryId: string): ListResult<string> => {
  type QueryResponseIdsState = {
    items: string[]
    hasMore: boolean
  }
  type QueryResponseIdsAction = {
    type: 'newResponseCreated'
    responseId: string
  } | {
    type: 'moreResponsesLoaded'
    responseIds: string[]
    hasMore: boolean
  } | {
    type: 'refreshed'
    responseIds: string[]
    hasMore: boolean
  }

  const [state, dispatch] = useReducer<QueryResponseIdsState, [QueryResponseIdsAction]>(  
    (current, action) => {
      switch (action.type) {
        case 'newResponseCreated':
          return { items: [...current.items, action.responseId], hasMore: current.hasMore }
        case 'moreResponsesLoaded':
          return { items: [...action.responseIds, ...current.items], hasMore: action.hasMore }
        case 'refreshed':
          return { items: action.responseIds, hasMore: action.hasMore }
      }
    }, { items: [], hasMore: true }
  )
  const profileId = useCurrentProfileId()
  const refresh = useCallback(async () => {
    const responseIds = await window.electron.interactions.getQueryResponseIds(profileId, queryId)
    dispatch({ type: 'refreshed', responseIds, hasMore: responseIds.length > 0 })
  }, [profileId, queryId])

  useEffect(() => {
    refresh()
    const unwatch = createResponseEventHub.watch([profileId, queryId], (response) => {
      dispatch({ type: 'newResponseCreated', responseId: response.id })
    })
    return () => { unwatch() }
  }, [profileId, queryId])

  return {
    items: state.items,
    hasMore: state.hasMore,
    loadMore: () => {},
    refresh,
  };
}

const createQuery = async (profileId: string, params: CreateParams<Query>): Promise<Query> => {
  const query = await window.electron.interactions.createQuery(profileId, params)
  console.log("createQuery", query);
  createQueryEventHub.notify(params.contextId ? [profileId, params.contextId] : [profileId], query)
  return query
}

const createResponse = async (profileId: string, params: CreateParams<Response>): Promise<Response> => {
  const response = await window.electron.interactions.createResponse(profileId, params)
  const queryId = response.queryId
  createResponseEventHub.notify([profileId, queryId], response)
  return response
}


const appendResponseContent = async (profileId: string, responseId: string, content: string): Promise<Response | null> => {
  const response = await window.electron.interactions.appendResponse(profileId, responseId, content)
  if (response) {
    appendQueryContentEventHub.notify([profileId, responseId], content)
  }
  return response
}

export { useRecentQueries, useQuery, useResponse, useQueryResponseIds, createQuery, createResponse, appendResponseContent };
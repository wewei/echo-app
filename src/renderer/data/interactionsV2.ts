import { useState } from "react";
import { Query, Response } from "@/shared/types/interactions";
import { EntityState } from "@/shared/utils/cache";

export const ENTITY_PENDING = 'ENTITY_PENDING';
export type EntityPending = typeof ENTITY_PENDING;
export type EntityRendererState<T> = EntityState<T> | EntityPending;

export type CreateParams<T extends { id: string }> = Omit<T, 'id'>;

type ListResult<T> = {
  items: T[]
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

const useRecnetQueries = (contextId?: string): ListResult<Query> => {
  const [items, setItems] = useState<Query[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // TODO

  return {
    items,
    hasMore,
    loadMore: () => {},
    refresh: () => {},
  };
}

const useQuery = (id: string): EntityRendererState<Query> => {
  const [state, setState] = useState<EntityRendererState<Query>>(ENTITY_PENDING);

  // TODO

  return state;
}

const useResponse = (id: string): EntityRendererState<Response> => {
  const [state, setState] = useState<EntityRendererState<Response>>(ENTITY_PENDING);

  // TODO

  return state;
}

const useQueryResponseIds = (queryId: string): ListResult<string> => {
  const [items, setItems] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // TODO

  return {
    items,
    hasMore,
    loadMore: () => {},
    refresh: () => {},
  };
}

const createQuery = async (query: CreateParams<Query>): Promise<Query> => {
  // TODO
  return { id: '1', ...query };
}

const deleteQuery = async (queryId: string): Promise<boolean> => {
  // TODO
  return true;
}

const createResponse = async (response: CreateParams<Response>): Promise<Response> => {
  // TODO
  return { id: '1', ...response };
}


const appendQueryContent = async (queryId: string, content: string): Promise<Response> => {
  // TODO
  return { id: '1', query: queryId, content, timestamp: Date.now(), agents: '1' };
}

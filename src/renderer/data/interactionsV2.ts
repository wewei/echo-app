import { useState, useEffect, useReducer, useCallback } from "react";
import { Interaction } from "@/shared/types/interactionsV2";
import { makeEventHub } from "@/shared/utils/event";

export type CreateParams<T extends { id: number }> = Omit<T, 'id'>;

type ListResult<T> = {
  items: T[]
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

// Event hubs for Interaction
const createInteractionEventHub = makeEventHub<Interaction>();

const useRecentInteractions = (contextId?: number): ListResult<Interaction> => {
  type RecentInteractionState = {
    items: Interaction[]
    hasMore: boolean
  }
  type RecentInteractionAction = {
    type: 'newInteractionCreated'
    interaction: Interaction
  } | {
    type: 'moreInteractionsLoaded'
    interactions: Interaction[]
    hasMore: boolean
  } | {
    type: 'refreshed'
    interactions: Interaction[]
    hasMore: boolean
  }

  const [state, dispatch] = useReducer<RecentInteractionState, [RecentInteractionAction]>((current, action) => {
    switch (action.type) {
      case 'newInteractionCreated':
        return { items: [...current.items, action.interaction], hasMore: current.hasMore }
      case 'moreInteractionsLoaded':
        return { items: [...action.interactions, ...current.items], hasMore: action.hasMore }
      case 'refreshed':
        return { items: action.interactions, hasMore: action.hasMore }
    }
  }, { items: [], hasMore: true });

  return {
    items: state.items,
    hasMore: state.hasMore,
    loadMore: () => {}, // Implement load more logic
    refresh: () => {}  // Implement refresh logic
  };
};

export { useRecentInteractions };

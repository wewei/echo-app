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

const mockInteractions: Interaction[] = [
  {
    id: 1,
    type: 'chat',
    userContent: 'Hello, how can I help you today?',
    contextId: null,
    createdAt: Date.now(),
    model: 'gpt-3',
    assistantContent: 'I am here to assist you with your inquiries.',
    updatedAt: Date.now(),
  },
  {
    id: 2,
    type: 'chat',
    userContent: 'What is the weather like today?',
    contextId: null,
    createdAt: Date.now(),
    model: 'gpt-3',
    assistantContent: 'The weather is sunny with a slight chance of rain.',
    updatedAt: Date.now(),
  },
  {
    id: 3,
    type: 'nav',
    userContent: 'https://example.com',
    contextId: null,
    createdAt: Date.now(),
    title: 'Example Page',
    description: 'This is an example page.',
    favIconUrl: null,
    imageAssetId: null,
    updatedAt: Date.now(),
  },
  {
    id: 4,
    type: 'nav',
    userContent: 'https://another-example.com',
    contextId: null,
    createdAt: Date.now(),
    title: 'Another Example Page',
    description: 'This is another example page.',
    favIconUrl: null,
    imageAssetId: null,
    updatedAt: Date.now(),
  },
  {
    id: 5,
    type: 'chat',
    userContent: 'Tell me a joke.',
    contextId: null,
    createdAt: Date.now(),
    model: 'gpt-3',
    assistantContent: 'Why did the scarecrow win an award? Because he was outstanding in his field!',
    updatedAt: Date.now(),
  }
];

const useMockData = true; // Set this to false to use real data

const useRecentInteractions = (contextId?: number): ListResult<Interaction> => {
  if (useMockData) {
    return {
      items: mockInteractions,
      hasMore: false,
      loadMore: () => {},
      refresh: () => {}
    };
  }

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

  const [state, dispatch] = useReducer((current: RecentInteractionState, action: RecentInteractionAction) => {
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
    loadMore: () => {},
    refresh: () => {}
  };
};

export { useRecentInteractions };

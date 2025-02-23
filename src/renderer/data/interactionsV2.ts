/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect, useReducer, useCallback, useMemo } from "react";
import { Interaction, ChatInteraction, BaseInteraction } from "@/shared/types/interactionsV2";
import { makeEventHub } from "@/shared/utils/event";
import { useCurrentProfileId } from "./profile";
import { traceBack } from "./traceBack";
import { ProfileInteractionV2Api } from "@/preload/interactionsV2";

export type CreateParams<T extends { id: number }> = Omit<T, 'id'>;

type ListResult<T> = {
  items: T[]
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

// Event hubs for Interaction
const createChatEventHub = makeEventHub<ChatInteraction>();
const appendContentEventHub = makeEventHub<string>()

type InteractionState = {
  items: BaseInteraction[]
  hasMore: boolean
}

type MoreLoadedAction = {
  type: 'moreLoaded'
  interactions: BaseInteraction[]
  hasMore: boolean
}

type RefreshedAction = {
  type: 'refreshed'
  interactions: BaseInteraction[]
  hasMore: boolean
}

const BATCH_SIZE = 20

export const useTraceBack = (
  api: ProfileInteractionV2Api,
  context: BaseInteraction
): ListResult<BaseInteraction> => {
  const [state, dispatch] = useReducer(
    (current: InteractionState, action: MoreLoadedAction | RefreshedAction) => {
      switch (action.type) {
        case "moreLoaded":
          return {
            items: [...current.items, ...action.interactions],
            hasMore: action.hasMore,
          };
        case "refreshed":
          return { items: action.interactions, hasMore: action.hasMore };
      }
    },
    { items: [], hasMore: true }
  );

  const stream = useMemo(() => traceBack(api)(context), [api, context]);
  const refresh = useCallback(async () => {
    const reader = stream.getReader();
    const interactions: BaseInteraction[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const interaction = await reader.read();
      if (interaction.done) {
        break;
      }
      interactions.push(interaction.value);
    }
    dispatch({
      type: "refreshed",
      interactions,
      hasMore: interactions.length === BATCH_SIZE,
    });
  }, [api, stream]);

  const loadMore = useCallback(async () => {
    const reader = stream.getReader();
    const interactions: BaseInteraction[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const interaction = await reader.read();
      if (interaction.done) {
        break;
      }
      interactions.push(interaction.value);
    }
    dispatch({
      type: "moreLoaded",
      interactions,
      hasMore: interactions.length === BATCH_SIZE,
    });
  }, [stream]);

  useEffect(() => {
    refresh();
  }, [stream]);

  return {
    ...state,
    loadMore,
    refresh,
  };
};

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

function useRecentChatInteractions(contextId?: number): ListResult<ChatInteraction> {
  type RecentChatInteractionState = {
    items: ChatInteraction[]
    hasMore: boolean
  }
  type RecentChatInteractionAction = {
    type: 'newInteractionCreated'
    interaction: ChatInteraction
  } | {
    type: 'moreInteractionsLoaded'
    interactions: ChatInteraction[]
    hasMore: boolean
  } | {
    type: 'refreshed'
    interactions: ChatInteraction[]
    hasMore: boolean
  }

  const [state, dispatch] = useReducer((current: RecentChatInteractionState, action: RecentChatInteractionAction) => {
    switch (action.type) {
      case 'newInteractionCreated':
        return { items: [...current.items, action.interaction], hasMore: current.hasMore }
      case 'moreInteractionsLoaded':
        return { items: [...action.interactions, ...current.items], hasMore: action.hasMore }
      case 'refreshed':
        return { items: action.interactions, hasMore: action.hasMore }
    }
  }, { items: [], hasMore: true });

  const profileId = useCurrentProfileId()
  const refresh = useCallback(async () => {
    const chatInteractions = await window.electron.interactionsV2.getChats(profileId, {
      contextId: null,
      limit: 100
    })
    dispatch({ type: 'refreshed', interactions: chatInteractions, hasMore: chatInteractions.length > 0 })
  }, [profileId, contextId])

  useEffect(() => {
    refresh()
    const unwatch = createChatEventHub.watch(contextId ? [profileId, String(contextId)] : [profileId], (chat) => {
      dispatch({ type: 'newInteractionCreated', interaction: chat })
    })
    return () => { unwatch() }
  }, [profileId, contextId])

  return {
    items: state.items,
    hasMore: state.hasMore,
    loadMore: () => {},
    refresh: () => {}
  };
}

const createChatInteraction = async (profileId: string, params: CreateParams<ChatInteraction>): Promise<ChatInteraction> => {
  const chat = await window.electron.interactionsV2.createChat(profileId, params);
  
  createChatEventHub.notify(params.contextId ? [profileId, String(params.contextId)] : [profileId], chat);
  return chat;
};

const appendAssistantContent = async (profileId: string, interactionId: number, content: string): Promise<void> => {
  await window.electron.interactionsV2.appendAssistantContent(profileId, interactionId, content, Date.now());
  
  appendContentEventHub.notify([profileId, String(interactionId)], content)
};

async function getInteraction(profileId: string, interactionId: number): Promise<Interaction | null> {
  try {
    const interactionData = await window.electron.interactionsV2.getInteraction(profileId, interactionId);
    return interactionData;
  } catch (error) {
    console.error('Failed to fetch interaction:', error);
    return null;
  }
}

function useInteraction(profileId: string, interactionId: number): Interaction | null {
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  useEffect(() => {
    if (interactionId >= 0) {
      const fetchInteraction = async () => {
        try {
          const interactionData = await getInteraction(profileId, interactionId);
          setInteraction(interactionData);
        } catch (error) {
          console.error('Failed to fetch interaction:', error);
        }
      };

      fetchInteraction();
    }
  }, [profileId, interactionId]);

  return interaction;
}

export { getInteraction, appendContentEventHub, useRecentInteractions, useRecentChatInteractions, createChatInteraction, appendAssistantContent, useInteraction };

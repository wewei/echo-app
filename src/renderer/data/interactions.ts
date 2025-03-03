/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect, useReducer, useCallback, useMemo, useState, useRef, ActionDispatch, Reducer } from "react";
import { ChatState, ChatInteraction, BaseInteraction, NavState, Interaction, NavInteraction } from "@/shared/types/interactions";
import { makeEventHub } from "@/shared/utils/event";
import { recentChats, traceBack, chatsForContext } from "./interactionStreams";
import { useInteractionApi } from "../contexts/interactonApi";
import { ENTITY_PENDING, EntityRendererState, isEntityReady } from "./entity";
import type { InteractionApi, ProfileInteractionApi } from "@/shared/types/ipc";
export type CreateParams<T extends { id: number }> = Omit<T, 'id'>;

type ListResult<T> = {
  items: T[]
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

// Event hubs for Interaction
// Route /profileId/contextId
const interactionCreatedEventHub = makeEventHub<BaseInteraction>();
// Route /profileId/interactionId
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

type CreatedAction = {
  type: 'created'
  interaction: BaseInteraction
}

const BATCH_SIZE = 20

const readStreams = async (stream: ReadableStream<BaseInteraction>, batchSize: number): Promise<BaseInteraction[]> => {
  const reader = stream.getReader()
  const interactions: BaseInteraction[] = []
  for (let i = 0; i < batchSize; i++) {
    const interaction = await reader.read()
    if (interaction.done) {
      break
    }
    interactions.push(interaction.value)
  }
  reader.cancel()
  return interactions
}

const useStreamActions = (
  stream: ReadableStream<BaseInteraction>,
  batchSize: number,
  dispatch: ActionDispatch<[action: MoreLoadedAction | RefreshedAction]>
): { loadMore: () => void; refresh: () => void } => {
  const refresh = useCallback(async () => {
    if (stream.locked) {
      return;
    }
    const interactions = await readStreams(stream, batchSize);
    dispatch({
      type: "refreshed",
      interactions,
      hasMore: interactions.length === BATCH_SIZE,
    });
  }, [stream]);

  const loadMore = useCallback(async () => {
    if (stream.locked) {
      return;
    }
    const interactions = await readStreams(stream, batchSize);
    dispatch({
      type: "moreLoaded",
      interactions,
      hasMore: interactions.length === BATCH_SIZE,
    });
  }, [stream]);

  useEffect(() => { refresh() }, [stream])

  return { loadMore, refresh };
};

const useInteractionListReducer = <A extends { type: string }>(
  reducer: Reducer<InteractionState, A> = (current) => current
) => {
  return useReducer(
    (
      current: InteractionState,
      action: MoreLoadedAction | RefreshedAction | A
    ) => {
      switch (action.type) {
        case "moreLoaded":
          return {
            items: [...current.items, ...(action as MoreLoadedAction).interactions],
            hasMore: (action as MoreLoadedAction).hasMore,
          };
        case "refreshed":
          return {
            items: (action as RefreshedAction).interactions,
            hasMore: (action as RefreshedAction).hasMore,
          };
        default:
          return reducer(current, action as A);
      }
    },
    { items: [], hasMore: true }
  );
};

export const useTraceBack = (
  contextId: number
): ListResult<BaseInteraction> => {
  const api = useInteractionApi()
  const [state, dispatch] = useInteractionListReducer()
  const stream = useMemo(() => traceBack(api)(contextId), [api, contextId])
  const { loadMore, refresh } = useStreamActions(stream, BATCH_SIZE, dispatch)

  return {
    ...state,
    loadMore,
    refresh,
  };
};

const eventPath = (profileId: string, contextId?: number | null) => {
  if (contextId === undefined) {
    return [profileId]
  }
  return [profileId, String(contextId)]
}

export const useRecentChats = (contextId?: number): ListResult<BaseInteraction> => {
  const api = useInteractionApi()
  const [state, dispatch] = useInteractionListReducer<CreatedAction>((current, action) => {
    if (action.type === "created") {
      return {
        items: [action.interaction, ...current.items],
        hasMore: current.hasMore,
      }
    }
    return current
  });

  const stream = useMemo(() => recentChats({ getChats: api.getChats })(contextId), [api, contextId]);
  const { loadMore, refresh } = useStreamActions(stream, BATCH_SIZE, dispatch)

  useEffect(() => {
    const unwatch = interactionCreatedEventHub.watch(
      eventPath(api.profileId(), contextId),
      (interaction: BaseInteraction) => {
        dispatch({ type: "created", interaction });
      }
    );
    return () => { unwatch() }
  }, [api.profileId(), contextId])

  return {
    items: state.items,
    hasMore: state.hasMore,
    loadMore,
    refresh
  };
};

export const useChats = (contextId?: number) => {
  const api = useInteractionApi()
  const [state, dispatch] = useInteractionListReducer<CreatedAction>((current, action) => {
    if (action.type === "created") {
      return {
        items: [action.interaction, ...current.items],
        hasMore: current.hasMore,
      }
    }
    return current
  });

  const stream = useMemo(
    () =>
      chatsForContext({
        getChats: api.getChats,
        getInteraction: api.getInteraction,
      })(contextId),
    [api, contextId]
  );
  const { loadMore, refresh } = useStreamActions(stream, BATCH_SIZE, dispatch)

  useEffect(() => {
    const unwatch = interactionCreatedEventHub.watch(
      eventPath(api.profileId(), contextId),
      (interaction: BaseInteraction) => {
        dispatch({ type: "created", interaction });

        // insert user message into vectorDb
        const documents = [interaction.userContent];
        const ids = [`user:${interaction.id}`];
        const metadatas = [{ role: "user", type: interaction.type, profileId: api.profileId(), chatId: interaction.id, contextId: interaction.contextId, createdAt: interaction.createdAt }];

        console.log("documents =", documents, "ids =", ids, "metadatas =", metadatas)
        window.electron.vectorDb.add(documents, ids, metadatas)
        .then(() => {
          console.log("Document added to vectorDb")
        })
        .catch((error) => {
          console.error("Failed to add document to vectorDb", error);
        });
      }
    );
    return () => { unwatch() }
  }, [api.profileId(), contextId])

  return {
    items: state.items,
    hasMore: state.hasMore,
    loadMore,
    refresh
  };
}

export const createChatInteraction = async (profileId: string, params: CreateParams<ChatInteraction>): Promise<ChatInteraction> => {
  const chat = await window.electron.interactions.createChat(profileId, params);
  interactionCreatedEventHub.notify(eventPath(profileId, params.contextId), chat);
  return chat;
};

export const createNavInteraction = async (profileId: string, params: CreateParams<NavInteraction>): Promise<NavInteraction> => {
  const nav = await window.electron.interactions.createNav(profileId, params);
  
  interactionCreatedEventHub.notify(eventPath(profileId, params.contextId), nav);
  return nav;
};

export const appendAssistantContent = async (profileId: string, interactionId: number, content: string): Promise<void> => {
  await window.electron.interactions.appendAssistantContent(profileId, interactionId, content, Date.now());
  
  appendContentEventHub.notify([profileId, String(interactionId)], content)
};

export const useNavState = (interactionId: number) => {
  const { getNavState } = useInteractionApi()
  const [state, setState] = useState<EntityRendererState<NavState>>(ENTITY_PENDING)

  useEffect(() => {
    const load = async () => {
      const state = await getNavState(interactionId)
      setState(state)
    }
    load()
  }, [interactionId])

  return state
}

export const useChatState = (interactionId: number) => {
  const { getChatState, profileId } = useInteractionApi()
  const [state, setState] = useState<EntityRendererState<ChatState>>(ENTITY_PENDING)

  useEffect(() => {
    const load = async () => {
      const state = await getChatState(interactionId)
      setState(state)
    }
    load()
    const unwatch = appendContentEventHub.watch(
      eventPath(profileId(), interactionId),
      (content: string) => {
        console.log("content =", content)
        setState((state) =>
          isEntityReady(state)
            ? { ...state, assistantContent: state.assistantContent + content }
            : state
        );
      }
    )
    return () => { unwatch() }
  }, [interactionId])

  return state
}

export const useBaseInteraction = (interactionId: number): EntityRendererState<BaseInteraction> => {
  const { getInteraction } = useInteractionApi()
  const [state, setState] = useState<EntityRendererState<BaseInteraction>>(ENTITY_PENDING)

  useEffect(() => {
    const load = async () => {
      const interaction = await getInteraction(interactionId)
      setState(interaction)
    }
    load()
  }, [interactionId])

  return state
}

export const useInteraction = (interactionId: number): EntityRendererState<Interaction> => {
  const { getInteraction, getChatState, getNavState } = useInteractionApi()
  const [state, setState] = useState<EntityRendererState<Interaction>>(ENTITY_PENDING)
  const refInteractionId = useRef(interactionId)

  useEffect(() => {
    const load = async () => {
      refInteractionId.current = interactionId
      const interaction = await getInteraction(interactionId)
      console.log("interactionId =", interactionId, "interaction =", interaction)
      if (interaction.type === 'chat') {
        const chatState = await getChatState(interactionId)
        if (refInteractionId.current === interactionId) {
          setState({
            ...interaction,
            ...chatState,
            type: 'chat',
          })
        }
      } else if (interaction.type === 'nav') {
        const navState = await getNavState(interactionId)
        if (refInteractionId.current === interactionId) {
          setState({
            ...interaction,
            ...navState,
            type: 'nav',
          })
        }
      }
    }
    load()
  }, [interactionId])

  return state
}

export const withProfileId = (profileId: string) => (api: InteractionApi): ProfileInteractionApi => {
  return {
    profileId: () => profileId,
    createChat: (chat) => api.createChat(profileId, chat),
    createNav: (nav) => api.createNav(profileId, nav),
    getInteraction: (id) => api.getInteraction(profileId, id),
    getChatState: (id) => api.getChatState(profileId, id),
    getNavState: (id) => api.getNavState(profileId, id),
    getChats: (params) => api.getChats(profileId, params),
    getChatIds: (params) => api.getChatIds(profileId, params),
    getNavs: (params) => api.getNavs(profileId, params),
    getNavsByUrl: (url) => api.getNavsByUrl(profileId, url),
    getNavIdsByUrl: (url: string) => api.getNavIdsByUrl(profileId, url),
    appendAssistantContent: (id, content, timestamp) => api.appendAssistantContent(profileId, id, content, timestamp),
    updateNavState: (id, state) => api.updateNavState(profileId, id, state),
  }
}
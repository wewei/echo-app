import { ipcRenderer } from 'electron'
import { ChatInteraction, INTERACTION_IPC_CHANNELS, NavInteraction, ChatState, NavState, BaseInteraction } from '@/shared/types/interactionsV2'
import { EntityData } from '@/shared/types/entity'

export const interactionAPI = {
  createChat: (profileId: string, chat: EntityData<ChatInteraction>): Promise<ChatInteraction> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.CREATE_CHAT, profileId, chat),

  createNav: (profileId: string, nav: EntityData<NavInteraction>): Promise<NavInteraction> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.CREATE_NAV, profileId, nav),

  getInteraction: (profileId: string, id: number): Promise<BaseInteraction | null> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_INTERACTION, profileId, id),

  getChatState: (profileId: string, id: number): Promise<ChatState | null> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_CHAT_STATE, profileId, id),

  getNavState: (profileId: string, id: number): Promise<NavState | null> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_NAV_STATE, profileId, id),

  getChatsByContextId: (profileId: string, contextId: number, lastId: number | null): Promise<ChatInteraction[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_CHATS_BY_CONTEXT_ID, profileId, contextId, lastId),

  getChatIdsByContextId: (profileId: string, contextId: number, lastId: number | null): Promise<number[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_CHAT_IDS_BY_CONTEXT_ID, profileId, contextId, lastId),

  getNavsByUrl: (profileId: string, url: string): Promise<NavInteraction[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_NAVS_BY_URL, profileId, url),

  getNavIdsByUrl: (profileId: string, url: string): Promise<number[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_NAV_IDS_BY_URL, profileId, url),

  appendAssistantContent: (profileId: string, id: number, content: string, timestamp: number): Promise<void> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.APPEND_ASSISTANT_CONTENT, profileId, id, content, timestamp),

  updateNavState: (profileId: string, id: number, state: Partial<NavState>): Promise<void> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.UPDATE_NAV_STATE, profileId, id, state),
}
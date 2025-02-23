import { ipcRenderer } from 'electron'
import { ChatInteraction, INTERACTION_IPC_CHANNELS, NavInteraction, ChatState, NavState, BaseInteraction, QueryChatsParams } from '@/shared/types/interactionsV2'
import { EntityData } from '@/shared/types/entity'

export const interactionV2API = {
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

  getChats: (profileId: string, params: QueryChatsParams): Promise<ChatInteraction[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_CHATS, profileId, params),

  getChatIds: (profileId: string, params: QueryChatsParams): Promise<number[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_CHAT_IDS, profileId, params),

  getNavsByUrl: (profileId: string, url: string): Promise<NavInteraction[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_NAVS_BY_URL, profileId, url),

  getNavIdsByUrl: (profileId: string, url: string): Promise<number[]> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_NAV_IDS_BY_URL, profileId, url),

  appendAssistantContent: (profileId: string, id: number, content: string, timestamp: number): Promise<boolean> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.APPEND_ASSISTANT_CONTENT, profileId, id, content, timestamp),

  updateNavState: (profileId: string, id: number, state: Partial<NavState>): Promise<boolean> =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.UPDATE_NAV_STATE, profileId, id, state),
}

export type InteractionV2Api = typeof interactionV2API

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Rest<T extends unknown[]> = T extends [infer _, ...infer U] ? U : never

export type ProfileInteractionV2Api = {
  [K in keyof InteractionV2Api]: (...args: Rest<Parameters<InteractionV2Api[K]>>) => ReturnType<InteractionV2Api[K]>
}

export const withProfileId = (profileId: string) => (api: InteractionV2Api): ProfileInteractionV2Api => {
  return {
    createChat: (chat) => api.createChat(profileId, chat),
    createNav: (nav) => api.createNav(profileId, nav),
    getInteraction: (id) => api.getInteraction(profileId, id),
    getChatState: (id) => api.getChatState(profileId, id),
    getNavState: (id) => api.getNavState(profileId, id),
    getChats: (params) => api.getChats(profileId, params),
    getChatIds: (params) => api.getChatIds(profileId, params),
    getNavsByUrl: (url) => api.getNavsByUrl(profileId, url),
    getNavIdsByUrl: (url: string) => api.getNavIdsByUrl(profileId, url),
    appendAssistantContent: (id, content, timestamp) => api.appendAssistantContent(profileId, id, content, timestamp),
    updateNavState: (id, state) => api.updateNavState(profileId, id, state),
  }
}
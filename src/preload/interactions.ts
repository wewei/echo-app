import { ipcRenderer } from 'electron'
import { INTERACTION_IPC_CHANNELS } from "@/shared/types/interactions";
import type { InteractionApi } from '@/shared/types/ipc'

export const interactionAPI: InteractionApi = {
  createChat: (profileId, chat) =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.CREATE_CHAT, profileId, chat),

  createNav: (profileId, nav) =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.CREATE_NAV, profileId, nav),

  getInteraction: (profileId, id) =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_INTERACTION, profileId, id),

  getChatState: (profileId, id) =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_CHAT_STATE, profileId, id),

  getNavState: (profileId, id) =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_NAV_STATE, profileId, id),

  getChats: (profileId, params) =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_CHATS, profileId, params),

  getChatIds: (profileId, params) =>
    ipcRenderer.invoke(
      INTERACTION_IPC_CHANNELS.GET_CHAT_IDS,
      profileId,
      params
    ),

  getNavs: (profileId, params) =>
    ipcRenderer.invoke(INTERACTION_IPC_CHANNELS.GET_NAVS, profileId, params),

  getNavsByUrl: (profileId, url) =>
    ipcRenderer.invoke(
      INTERACTION_IPC_CHANNELS.GET_NAVS_BY_URL,
      profileId,
      url
    ),

  getNavIdsByUrl: (profileId, url) =>
    ipcRenderer.invoke(
      INTERACTION_IPC_CHANNELS.GET_NAV_IDS_BY_URL,
      profileId,
      url
    ),

  appendAssistantContent: (profileId, id, content, timestamp) =>
    ipcRenderer.invoke(
      INTERACTION_IPC_CHANNELS.APPEND_ASSISTANT_CONTENT,
      profileId,
      id,
      content,
      timestamp
    ),

  updateNavState: (profileId, id, state) =>
    ipcRenderer.invoke(
      INTERACTION_IPC_CHANNELS.UPDATE_NAV_STATE,
      profileId,
      id,
      state
    ),
};

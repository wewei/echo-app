import { ipcMain } from 'electron'
import { ChatInteraction, INTERACTION_IPC_CHANNELS, NavInteraction, NavState } from '@/shared/types/interactionsV2'
import { getInteractionStore } from '@/main/services/interactionManagerV2'
import { EntityData } from '@/shared/types/entity'

export const registerInteractionHandlersV2 = () => {
  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.CREATE_CHAT,
    (_, profileId: string, chat: EntityData<ChatInteraction>) =>
      getInteractionStore(profileId).createChat(chat)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.CREATE_NAV,
    (_, profileId: string, nav: EntityData<NavInteraction>) =>
      getInteractionStore(profileId).createNav(nav)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_INTERACTION,
    (_, profileId: string, id: number) =>
      getInteractionStore(profileId).getInteraction(id)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_CHAT_STATE,
    (_, profileId: string, id: number) =>
      getInteractionStore(profileId).getChatState(id)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_NAV_STATE,
    (_, profileId: string, id: number) =>
      getInteractionStore(profileId).getNavState(id)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_CHATS_BY_CONTEXT_ID,
    (_, profileId: string, contextId: number | null, lastId: number | null, limit: number) =>
      getInteractionStore(profileId).getChatsByContextId(contextId, lastId, limit)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_CHAT_IDS_BY_CONTEXT_ID,
    (_, profileId: string, contextId: number | null, lastId: number | null, limit: number) =>
      getInteractionStore(profileId).getChatIdsByContextId(contextId, lastId, limit)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_NAVS_BY_URL,
    (_, profileId: string, url: string) =>
      getInteractionStore(profileId).getNavsByUrl(url)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_NAV_IDS_BY_URL,
    (_, profileId: string, url: string) =>
      getInteractionStore(profileId).getNavIdsByUrl(url)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.APPEND_ASSISTANT_CONTENT,
    (_, profileId: string, id: number, content: string, timestamp: number) =>
      getInteractionStore(profileId).appendAssistantContent(id, content, timestamp)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.UPDATE_NAV_STATE,
    (_, profileId: string, id: number, state: Partial<NavState>) =>
      getInteractionStore(profileId).updateNavState(id, state)
  )
}

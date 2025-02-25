import { ipcMain } from 'electron'
import { ChatInteraction, INTERACTION_IPC_CHANNELS, NavInteraction, NavState, QueryChatsParams, QueryNavsParams } from '@/shared/types/interactions'
import { getInteractionStore } from '@/main/services/interactionManager'
import { EntityData } from '@/shared/types/entity'

export const registerInteractionHandlers = () => {
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
    INTERACTION_IPC_CHANNELS.GET_CHATS,
    (_, profileId: string, params: QueryChatsParams) =>
      getInteractionStore(profileId).getChats(params)
  )

  ipcMain.handle(
    INTERACTION_IPC_CHANNELS.GET_CHAT_IDS,
    (_, profileId: string, params: QueryChatsParams) =>
      getInteractionStore(profileId).getChatIds(params)
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
    INTERACTION_IPC_CHANNELS.GET_NAVS,
    async (_, profileId: string, params: QueryNavsParams) => {
      const store = getInteractionStore(profileId);
      return store.getNavs(params);
    }
  );

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

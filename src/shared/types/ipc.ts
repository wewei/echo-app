import { OpenAI } from 'openai'
import type { Profile } from '@/shared/types/profile'
import type { AssetMetadata } from '@/shared/types/asset'
import type { Settings } from '@/shared/types/settings'
import { EntityData } from './entity'
import {
  ChatInteraction,
  ChatState,
  Interaction,
  NavInteraction,
  NavState,
  QueryChatsParams,
  QueryNavsParams,
} from "./interactions";

export interface IProfileAPI {
  create: (username: string, avatar: string) => Promise<Profile>
  delete: (profileId: string) => Promise<void>
  update: (profileId: string, updates: Partial<Profile>) => Promise<Profile | null>
  getAll: () => Promise<Profile[]>
  get: (profileId: string) => Promise<Profile | null>
}

export interface IAssetAPI {
  save: (profileId: string, content: ArrayBuffer, mimeType: string) => Promise<AssetMetadata>
  read: (profileId: string, assetId: string) => Promise<{ content: ArrayBuffer; metadata: AssetMetadata } | null>
  delete: (profileId: string, assetId: string) => Promise<void>
  getUrl: (profileId: string, assetId: string) => string
}

export interface ISettingsAPI {
  read: (profileId: string, scope: string) => Promise<Settings>
  write: (profileId: string, scope: string, settings: Settings) => Promise<void>
  update: (profileId: string, scope: string, updates: Settings) => Promise<Settings>
  delete: (profileId: string, scope: string, keys: string[]) => Promise<Settings>
  clear: (profileId: string, scope: string) => Promise<void>
  getScopes: (profileId: string) => Promise<string[]>
}

export interface IChatAPI {
  send: (
    profileId: string,
    params: OpenAI.Chat.Completions.ChatCompletionCreateParams
  ) => Promise<OpenAI.Chat.Completions.ChatCompletion>

  stream: (
    profileId: string,
    params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
    onChunk: (delta: OpenAI.Chat.Completions.ChatCompletionChunk) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ) => () => void
}

export interface InteractionApi {
  createChat(profileId: string, chat: EntityData<ChatInteraction>): Promise<ChatInteraction>
  createNav(profileId: string, nav: EntityData<NavInteraction>): Promise<NavInteraction>
  getInteraction(profileId: string, id: number): Promise<Interaction | null>
  getChatState(profileId: string, id: number): Promise<ChatState | null>
  getNavState(profileId: string, id: number): Promise<NavState | null>
  getChats(profileId: string, params: QueryChatsParams): Promise<ChatInteraction[]>
  getChatIds(profileId: string, params: QueryChatsParams): Promise<number[]>
  getNavs(profileId: string, params: QueryNavsParams): Promise<NavInteraction[]>
  getNavsByUrl(profileId: string, url: string): Promise<NavInteraction[]>
  getNavIdsByUrl(profileId: string, url: string): Promise<number[]>
  appendAssistantContent(profileId: string, id: number, content: string, timestamp: number): Promise<boolean>
  updateNavState(profileId: string, id: number, state: Partial<NavState>): Promise<boolean>
}

export interface IElectronAPI {
  profile: IProfileAPI
  asset: IAssetAPI
  settings: ISettingsAPI
  chat: IChatAPI
  interactions: InteractionApi
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
} 

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Rest<T extends unknown[]> = T extends [infer _, ...infer U]
  ? U
  : never;

export type ProfileInteractionApi = {
  [K in keyof InteractionApi]: (
    ...args: Rest<Parameters<InteractionApi[K]>>
  ) => ReturnType<InteractionApi[K]>;
} & {
  profileId: () => string;
};


import { OpenAI } from 'openai'
import type { Profile } from '@/shared/types/profile'
import type { AssetMetadata } from '@/shared/types/asset'
import type { Settings } from '@/shared/types/settings'
import type { Message, MessageQuery } from '@/shared/types/message'
import { InteractionApi } from './interactions'
import { InteractionV2Api } from './interactionsV2'

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
  ) => Promise<OpenAI.Chat.Completions.ChatCompletion>;
  stream: (
    profileId: string,
    params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
    onChunk: (delta: OpenAI.Chat.Completions.ChatCompletionChunk) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ) => () => void;
}

export interface IMessageAPI {
  add: (profileId: string, message: Message) => Promise<void>
  get: (profileId: string, uuid: string) => Promise<Message | null>
  query: (profileId: string, query: MessageQuery) => Promise<Message[]>
  update: (profileId: string, message: Message) => Promise<void>
}

export interface IElectronAPI {
  profile: IProfileAPI
  asset: IAssetAPI
  settings: ISettingsAPI
  chat: IChatAPI
  message: IMessageAPI
  interactions: InteractionApi
  interactionsV2: InteractionV2Api
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
} 
import { Profile } from '../shared/types/profile'
import { AssetMetadata } from '../shared/types/asset'
import { Settings } from '../shared/types/settings'
import { Message, ChatOptions, ChatResponse } from '../shared/types/chat'

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
  send: (profile: Profile, messages: Message[], options?: ChatOptions) => Promise<ChatResponse>
  stream: (
    profile: Profile,
    messages: Message[],
    onMessage: (delta: string) => void,
    onDone: (response: ChatResponse) => void,
    onError: (error: Error) => void,
    options?: ChatOptions
  ) => () => void
}

export interface IElectronAPI {
  profile: IProfileAPI
  asset: IAssetAPI
  settings: ISettingsAPI
  chat: IChatAPI
}

declare global {
  interface Window {
    electron: {
      profile: IProfileAPI
      asset: IAssetAPI
      settings: ISettingsAPI
      chat: IChatAPI
    }
  }
} 
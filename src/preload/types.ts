import { Profile } from '../shared/types/profile'
import { AssetMetadata } from '../shared/types/asset'
import { Settings } from '../shared/types/settings'

export interface IProfileAPI {
  create: (username: string, avatar: string) => Promise<Profile>
  delete: (profileId: string) => Promise<void>
  update: (profileId: string, updates: Partial<Profile>) => Promise<Profile | null>
  setDefault: (profileId: string) => Promise<void>
  getAll: () => Promise<Profile[]>
  get: (profileId: string) => Promise<Profile | null>
  getDefault: () => Promise<Profile | null>
}

export interface IAssetAPI {
  save: (profileId: string, content: Buffer, mimeType: string) => Promise<AssetMetadata>
  read: (profileId: string, assetId: string) => Promise<{ content: Buffer; metadata: AssetMetadata } | null>
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

declare global {
  interface Window {
    electron: {
      profile: IProfileAPI
      asset: IAssetAPI
      settings: ISettingsAPI
    }
  }
} 
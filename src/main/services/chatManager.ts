import { OpenAI, AzureOpenAI } from 'openai'
import { type ChatSettings, CHAT_SETTINGS } from '@/shared/types/chatSettings'
import { readSettings, onSettingsUpdated } from './settingsManager'
import { onProfileDeleted } from './profileManager'
// 缓存 OpenAI clients
const clients = new Map<string, OpenAI>()

export const getClient = async (profileId: string): Promise<OpenAI> => {
  let client = clients.get(profileId)
  if (!client) {
    const settings = await readSettings(profileId, CHAT_SETTINGS) as ChatSettings
    if (!settings) {
      throw new Error('AI settings not found')
    }

    client = new (settings.provider === 'azure' ? AzureOpenAI : OpenAI)(settings[settings.provider])
    clients.set(profileId, client)
  }
  return client
}

onSettingsUpdated(CHAT_SETTINGS, (profileId) => { clients.delete(profileId) })
onProfileDeleted((profileId) => { clients.delete(profileId) })
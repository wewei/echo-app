import OpenAI, { AzureOpenAI } from 'openai'
import { Profile } from '../../shared/types/profile'
import { ChatSettings } from '../../shared/types/chatSettings'
import { Message, ChatOptions, ChatResponse, CHAT_SETTINGS } from '../../shared/types/chat'
import { readSettings, onSettingsUpdate } from './settingsManager'
import { randomUUID } from 'crypto'

// 缓存 OpenAI clients
const clients = new Map<string, OpenAI>()

const getClient = async (profileId: string): Promise<OpenAI> => {
  let client = clients.get(profileId)
  if (!client) {
    const settings = await readSettings(profileId, CHAT_SETTINGS) as ChatSettings
    if (!settings) {
      throw new Error('AI settings not found')
    }

    client = new (settings.provider === 'azure' ? AzureOpenAI : OpenAI)(settings[settings.provider])
  }
  return client
}

onSettingsUpdate(CHAT_SETTINGS, (profileId) => {
  clients.delete(profileId)
})

export const chat = async (
  profile: Profile,
  messages: Message[],
  options: ChatOptions = { stream: false }
): Promise<ChatResponse> => {
  const client = await getClient(profile.id)
  const settings = await readSettings(profile.id, CHAT_SETTINGS) as ChatSettings
  if (!settings) {
    throw new Error('AI settings not found')
  }

  const config = settings[settings.provider]
  const completion = await client.chat.completions.create({
    model: config.model,
    messages: messages.map(({ role, content }) => ({ role, content })),
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    stream: false,
  })

  const choice = completion.choices[0]
  if (!choice?.message) {
    throw new Error('No response from AI')
  }

  return {
    id: completion.id,
    message: {
      id: randomUUID(),
      role: choice.message.role,
      content: choice.message.content || '',
      timestamp: Date.now(),
    },
    usage: completion.usage && {
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens,
    },
  }
}

export const streamChat = async (
  profile: Profile,
  messages: Message[],
  onMessage: (delta: string) => void,
  onDone: (response: ChatResponse) => void,
  options: ChatOptions = { stream: true }
): Promise<void> => {
  const client = await getClient(profile.id)
  const settings = await readSettings(profile.id, CHAT_SETTINGS) as ChatSettings
  if (!settings) {
    throw new Error('AI settings not found')
  }

  const config = settings[settings.provider]
  const stream = await client.chat.completions.create({
    model: config.model,
    messages: messages.map(({ role, content }) => ({ role, content })),
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    stream: true,
  })

  let content = ''
  const messageId = randomUUID()
  const startTime = Date.now()

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || ''
    content += delta
    onMessage(delta)
  }

  onDone({
    id: messageId,
    message: {
      id: messageId,
      role: 'assistant',
      content,
      timestamp: startTime,
    },
  })
} 
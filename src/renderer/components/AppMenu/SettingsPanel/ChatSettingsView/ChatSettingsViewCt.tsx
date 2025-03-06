import React from 'react'
import {
  ChatSettingsSchema,
  CHAT_SETTINGS,
  type ChatSettings,
  type ChatProvider,
} from "@/shared/types/chatSettings"
import type { Profile } from "@/shared/types/profile"
import { useSettings } from "@/renderer/data/settings"
import Loading from "@/renderer/components/Loading"
import ChatSettingsViewRp from './ChatSettingsViewRp'

interface Props {
  profile: Profile
}

export default function ChatSettingsViewCt({ profile }: Props) {
  const [settings, setSettings] = useSettings(
    profile.id,
    CHAT_SETTINGS,
    ChatSettingsSchema
  )

  if (!settings) {
    return <Loading />
  }

  const handleProviderChange = (provider: ChatProvider) => {
    const newSettings = { ...settings, provider }
    setSettings(newSettings)
    window.electron.settings.write(profile.id, CHAT_SETTINGS, newSettings)
  }

  const handleOpenAISettingsChange = (openai: ChatSettings['openai']) => {
    const newSettings = { ...settings, openai }
    setSettings(newSettings)
  }

  const handleDeepSeekSettingsChange = (deepseek: ChatSettings['deepseek']) => {
    const newSettings = { ...settings, deepseek }
    setSettings(newSettings)
  }

  const handleAzureSettingsChange = (azure: ChatSettings['azure']) => {
    const newSettings = { ...settings, azure }
    setSettings(newSettings)
  }

  const handleOllamaSettingsChange = (ollama: ChatSettings['ollama']) => {
    const newSettings = { ...settings, ollama }
    setSettings(newSettings)
  }

  return (
    <ChatSettingsViewRp
      settings={settings}
      onProviderChange={handleProviderChange}
      onOpenAISettingsChange={handleOpenAISettingsChange}
      onDeepSeekSettingsChange={handleDeepSeekSettingsChange}
      onAzureSettingsChange={handleAzureSettingsChange}
      onOllamaSettingsChange={handleOllamaSettingsChange}
    />
  )
}
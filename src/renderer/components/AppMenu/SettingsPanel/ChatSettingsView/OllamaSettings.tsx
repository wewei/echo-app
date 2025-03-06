import React from 'react'
import { useTranslation } from 'react-i18next'
import { OllamaSettings } from '@/shared/types/chatSettings'
import BaseAISettings from './BaseAISettings'

interface Props {
  settings: OllamaSettings
  onChange: (settings: OllamaSettings) => void
}

export default function OllamaSettingsPanel({ settings, onChange }: Props) {
  const { t } = useTranslation()

  const models = [
    { value: 'deepseek-r1:32b', label: t('settings.ai.models.ollamaDeepseekr132')},
  ]

  const handleChange = (field: string, value: string) => {
    onChange({
      ...settings,
      [field]: value
    })
  }

  return (
    <BaseAISettings
      apiKey="ollama"
      endpoint={settings.baseURL}
      model={settings.model}
      onSettingChange={(field, value) => {
        handleChange(field === 'endpoint' ? 'baseURL' : field, value)
      }}
      models={models}
      endpointPlaceholder="http://localhost:11434/"
    />
  )
}

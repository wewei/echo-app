import React from 'react'
import { useTranslation } from 'react-i18next'
import BaseAISettings from './BaseAISettings'
import { OpenAISettings } from '@/shared/types/chatSettings'

interface Props {
  settings: OpenAISettings
  onChange: (settings: OpenAISettings) => void
}

export default function OpenAISettingsPanel({ settings, onChange }: Props) {
  const { t } = useTranslation()

  const models = [
    { value: 'gpt-3.5-turbo', label: t('settings.ai.models.gpt35') },
    { value: 'gpt-4', label: t('settings.ai.models.gpt4') }
  ]

  const handleChange = (field: string, value: string) => {
    onChange({
      ...settings,
      [field]: value
    })
  }

  return (
    <BaseAISettings
      apiKey={settings.apiKey}
      endpoint={settings.baseURL}
      model={settings.model}
      onSettingChange={(field, value) => {
        handleChange(field === 'endpoint' ? 'baseURL' : field, value)
      }}
      models={models}
      endpointPlaceholder="https://api.openai.com"
    />
  )
} 
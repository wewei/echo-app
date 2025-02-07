import React from 'react'
import { useTranslation } from 'react-i18next'
import BaseAISettings from './BaseAISettings'
import { DeepSeekSettings } from '../../../shared/types/chatSettings'

interface Props {
  settings: DeepSeekSettings
  onChange: (settings: DeepSeekSettings) => void
}

export default function DeepSeekSettingsPanel({ settings, onChange }: Props) {
  const { t } = useTranslation()

  const models = [
    { value: 'deepseek-chat', label: t('settings.ai.models.deepseekChat') },
    { value: 'deepseek-coder', label: t('settings.ai.models.deepseekCoder') }
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
    />
  )
} 
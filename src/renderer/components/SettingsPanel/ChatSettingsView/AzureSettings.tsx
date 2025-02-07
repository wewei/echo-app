import React from 'react'
import { useTranslation } from 'react-i18next'
import { TextField } from '@mui/material'
import BaseAISettings from './BaseAISettings'
import { AzureSettings } from '../../../../shared/types/chatSettings'

interface Props {
  settings: AzureSettings
  onChange: (settings: AzureSettings) => void
}

export default function AzureSettingsPanel({ settings, onChange }: Props) {
  const { t } = useTranslation()

  const models = [
    { value: 'gpt-35-turbo', label: t('settings.ai.models.azureGpt35') },
    { value: 'gpt-4', label: t('settings.ai.models.azureGpt4') }
  ]

  const handleChange = (field: string, value: string) => {
    onChange({
      ...settings,
      [field]: value
    })
  }

  const extraFields = (
    <>
      <TextField
        size="small"
        label={t('settings.ai.azure.apiVersion')}
        value={settings.apiVersion}
        onChange={(e) => handleChange('apiVersion', e.target.value)}
        fullWidth
        placeholder="2024-02-15-preview"
      />
      <TextField
        size="small"
        label={t('settings.ai.azure.deployment')}
        value={settings.deployment}
        onChange={(e) => handleChange('deployment', e.target.value)}
        fullWidth
        placeholder="gpt-35-turbo"
      />
    </>
  )

  return (
    <BaseAISettings
      apiKey={settings.apiKey}
      endpoint={settings.endpoint}
      model={settings.model}
      onSettingChange={handleChange}
      models={models}
      endpointPlaceholder="https://{resource}.openai.azure.com"
      extraFields={extraFields}
    />
  )
} 
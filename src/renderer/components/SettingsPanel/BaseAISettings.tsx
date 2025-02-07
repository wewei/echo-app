import React from 'react'
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface BaseProps {
  apiKey: string
  endpoint?: string
  model: string
  onSettingChange: (field: string, value: string) => void
  models: Array<{ value: string; label: string }>
  endpointPlaceholder?: string
  extraFields?: React.ReactNode
}

export default function BaseAISettings({
  apiKey,
  endpoint,
  model,
  onSettingChange,
  models,
  endpointPlaceholder,
  extraFields
}: BaseProps) {
  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        size="small"
        label={t('settings.ai.apiKey')}
        type="password"
        value={apiKey}
        onChange={(e) => onSettingChange('apiKey', e.target.value)}
        fullWidth
      />

      <TextField
        size="small"
        label={t('settings.ai.endpoint')}
        value={endpoint}
        onChange={(e) => onSettingChange('endpoint', e.target.value)}
        fullWidth
        placeholder={endpointPlaceholder}
      />

      <FormControl fullWidth size="small">
        <InputLabel>{t('settings.ai.model')}</InputLabel>
        <Select
          value={model}
          label={t('settings.ai.model')}
          onChange={(e) => onSettingChange('model', e.target.value)}
        >
          {models.map(({ value, label }) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {extraFields}
    </Box>
  )
} 
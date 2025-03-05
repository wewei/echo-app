import React from 'react'
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  Typography,
  InputLabel,
  Switch,
  ListItemSecondaryAction,
  Divider
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { RagSettings } from '@/shared/types/ragSettings'

interface Props {
  settings: RagSettings
  onProviderChange: (value: string) => void
  onEndpointChange: (value: string) => void
  onTopKChange: (value: number) => void
  onDistanceThresholdChange: (value: number) => void
  isOpen: boolean
  onToggle: () => void
}

export default function RagSettingsViewRp({ 
  settings, 
  onProviderChange, 
  onEndpointChange, 
  onTopKChange,
  onDistanceThresholdChange,
  isOpen, 
  onToggle 
}: Props) {
  const { t } = useTranslation()

  return (
    <List>
      <ListItem
        secondaryAction={
          <Switch
            edge="end"
            checked={isOpen}
            onChange={onToggle}
            inputProps={{ 'aria-labelledby': 'rag-settings-switch' }}
          />
        }
      >
        <Typography variant="subtitle2" color="text.secondary">
          {t("settings.rag.title").toUpperCase()}
        </Typography>
      </ListItem>
      
      {isOpen && (
        <>
          <Divider component="li" />
          <ListItem>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
                py: 1,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="rag-provider-select-label">
                    {t("settings.rag.provider")}
                  </InputLabel>
                  <Select
                    labelId="rag-provider-select-label"
                    value={settings.provider}
                    label={t("settings.rag.provider")}
                    onChange={(e) => onProviderChange(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="custom">{t("settings.rag.providers.custom")}</MenuItem>
                  </Select>
                </FormControl>

                {settings.provider === 'custom' && (
                  <>
                    <TextField
                      size="small"
                      label={t("settings.rag.custom.endpoint")}
                      value={settings.custom.endpoint}
                      onChange={(e) => onEndpointChange(e.target.value)}
                      placeholder="http://localhost:8001"
                      fullWidth
                    />
                    <TextField
                      size="small"
                      type="number"
                      label={t("settings.rag.custom.topK")}
                      value={settings.custom.topK}
                      onChange={(e) => onTopKChange(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 1, max: 100, step:1 } }}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      type="number"
                      label={t("settings.rag.custom.distanceThreshold")}
                      value={settings.custom.distanceThreshold}
                      onChange={(e) => onDistanceThresholdChange(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 0, max: 1, step:0.1 } }}
                      fullWidth
                    />
                  </>
                )}
              </Box>
            </Box>
          </ListItem>
        </>
      )}
    </List>
  )
}

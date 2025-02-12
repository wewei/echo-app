import React from 'react'
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { SearchSettings } from '@/shared/types/searchSettings'

interface SearchSettingsViewRpProps {
  settings: SearchSettings
  onProviderChange: (value: string) => void
  onBingApiKeyChange: (value: string) => void
}

export default function SearchSettingsViewRp({
  settings,
  onProviderChange,
  onBingApiKeyChange
}: SearchSettingsViewRpProps) {
  const { t } = useTranslation()

  return (
    <List>
      <ListItem>
        <Typography variant="subtitle2" color="text.secondary">
          {t("settings.search.title").toUpperCase()}
        </Typography>
      </ListItem>
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
            <FormControl fullWidth size="small">
              <InputLabel>{t("settings.search.provider")}</InputLabel>
              <Select
                value={settings.provider}
                label={t("settings.search.provider")}
                onChange={(e) => onProviderChange(e.target.value)}
              >
                <MenuItem value="bing">
                  {t("settings.search.providers.bing")}
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label={t("settings.search.bing.apiKey")}
              type="password"
              value={settings.bing?.apiKey}
              onChange={(e) => onBingApiKeyChange(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      </ListItem>
    </List>
  )
} 
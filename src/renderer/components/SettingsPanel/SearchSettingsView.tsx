import React from 'react'
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Paper, List, ListItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { Profile } from '@/shared/types/profile'
import { SearchSettingsSchema, SEARCH_SETTINGS, type SearchSettings } from '@/shared/types/searchSettings'
import { useSettings } from '@/renderer/data/settings'
import Loading from '@/renderer/components/Loading'

interface Props {
  profile: Profile
}

export default function SearchSettingsView({ profile }: Props) {
  const { t } = useTranslation()
  const [settings, setSettings] = useSettings(profile.id, SEARCH_SETTINGS, SearchSettingsSchema)
  const handleChange = (field: keyof SearchSettings, value: string) => {
    if (field === 'provider') {
      setSettings({
        ...settings,
        provider: value as 'bing'
      })
    } else if (field === 'bing') {
      setSettings({
        ...settings,
        bing: {
          ...settings.bing,
          apiKey: value
        }
      })
    }
  }

  return settings ? (
    <Paper>
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
                  onChange={(e) => handleChange("provider", e.target.value)}
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
                onChange={(e) => handleChange("bing", e.target.value)}
                fullWidth
              />
            </Box>
          </Box>
        </ListItem>
      </List>
    </Paper>
  ) : (
    <Loading />
  );
} 
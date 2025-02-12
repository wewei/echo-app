import React from 'react'
import {
  List,
  ListItem,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type { ChatSettings, ChatProvider } from "@/shared/types/chatSettings"

import OpenAISettings from "./OpenAISettings"
import DeepSeekSettingsPanel from "./DeepSeekSettings"
import AzureSettingsPanel from "./AzureSettings"

interface ChatSettingsViewRpProps {
  settings: ChatSettings
  onProviderChange: (provider: ChatProvider) => void
  onOpenAISettingsChange: (settings: ChatSettings['openai']) => void
  onDeepSeekSettingsChange: (settings: ChatSettings['deepseek']) => void
  onAzureSettingsChange: (settings: ChatSettings['azure']) => void
}

export default function ChatSettingsViewRp({
  settings,
  onProviderChange,
  onOpenAISettingsChange,
  onDeepSeekSettingsChange,
  onAzureSettingsChange
}: ChatSettingsViewRpProps) {
  const { t } = useTranslation()

  const renderAISettings = () => {
    switch (settings.provider) {
      case "openai":
        return (
          <OpenAISettings
            settings={settings.openai}
            onChange={onOpenAISettingsChange}
          />
        )
      case "deepseek":
        return (
          <DeepSeekSettingsPanel
            settings={settings.deepseek}
            onChange={onDeepSeekSettingsChange}
          />
        )
      case "azure":
        return (
          <AzureSettingsPanel
            settings={settings.azure}
            onChange={onAzureSettingsChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <List>
      <ListItem>
        <Typography variant="subtitle2" color="text.secondary">
          {t("settings.ai.title").toUpperCase()}
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
          <FormControl fullWidth size="small">
            <InputLabel>{t("settings.ai.provider")}</InputLabel>
            <Select
              value={settings.provider}
              label={t("settings.ai.provider")}
              onChange={(e) => onProviderChange(e.target.value as ChatProvider)}
            >
              <MenuItem value="openai">
                {t("settings.ai.providers.openai")}
              </MenuItem>
              <MenuItem value="deepseek">
                {t("settings.ai.providers.deepseek")}
              </MenuItem>
              <MenuItem value="azure">
                {t("settings.ai.providers.azure")}
              </MenuItem>
            </Select>
          </FormControl>

          {renderAISettings()}
        </Box>
      </ListItem>
    </List>
  )
} 
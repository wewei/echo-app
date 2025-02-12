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
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  ChatSettingsSchema,
  CHAT_SETTINGS,
  type ChatSettings,
  type ChatProvider,
} from "@/shared/types/chatSettings";
import { Profile } from "@/shared/types/profile";
import { useSettings } from "@/renderer/data/settings";
import Loading from "@/renderer/components/Loading";

import OpenAISettings from "./OpenAISettings";
import DeepSeekSettingsPanel from "./DeepSeekSettings";
import AzureSettingsPanel from "./AzureSettings";

type Props = {
  profile: Profile;
};

const ChatSettings = ({ profile }: Props) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useSettings(
    profile.id,
    CHAT_SETTINGS,
    ChatSettingsSchema
  );
  const handleProviderChange = (provider: ChatProvider) => {
    setSettings({ ...settings, provider })
    window.electron.settings.write(profile.id, CHAT_SETTINGS, settings)
  }

  const renderAISettings = () => {
    switch (settings.provider) {
      case "openai":
        return (
          <OpenAISettings
            settings={settings.openai}
            onChange={(openai) => {
              const newSettings = { ...settings, openai };
              setSettings(newSettings);
            }}
          />
        );
      case "deepseek":
        return (
          <DeepSeekSettingsPanel
            settings={settings.deepseek}
            onChange={(deepseek) => {
              const newSettings = { ...settings, deepseek };
              setSettings(newSettings);
            }}
          />
        );
      case "azure":
        return (
          <AzureSettingsPanel
            settings={settings.azure}
            onChange={(azure) => {
              const newSettings = { ...settings, azure };
              setSettings(newSettings);
            }}
          />
        );
      default:
        return null;
    }
  };

  return settings ? (
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
              onChange={(e) => {
                handleProviderChange(e.target.value as ChatProvider);
              }}
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
  ) : (
    <Loading />
  );
};

export default ChatSettings;

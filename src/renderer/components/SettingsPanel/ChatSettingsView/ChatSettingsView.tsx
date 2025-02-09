import React from 'react'
import {
  Paper,
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

  const handleAISettingsChange = async (
    field: "provider" | "apiKey" | "endpoint" | "model",
    value: string
  ) => {
    const newSettings = { ...settings };

    if (field === "provider") {
      newSettings.provider = value as ChatProvider;
    } else {
      newSettings[settings.provider] = {
        ...newSettings[settings.provider],
        [field]: value,
      };
    }

    setSettings(newSettings);
  };

  const renderAISettings = () => {
    switch (settings.provider) {
      case "openai":
        return (
          <OpenAISettings
            settings={settings.openai}
            onChange={(settings) => {
              const newSettings = { ...settings, openai: settings };
              setSettings(newSettings);
              window.electron.settings.write(
                profile?.id,
                CHAT_SETTINGS,
                newSettings
              );
            }}
          />
        );
      case "deepseek":
        return (
          <DeepSeekSettingsPanel
            settings={settings.deepseek}
            onChange={(settings) => {
              const newSettings = { ...settings, deepseek: settings };
              setSettings(newSettings);
              window.electron.settings.write(
                profile?.id,
                CHAT_SETTINGS,
                newSettings
              );
            }}
          />
        );
      case "azure":
        return (
          <AzureSettingsPanel
            settings={settings.azure}
            onChange={(settings) => {
              const newSettings = { ...settings, azure: settings };
              setSettings(newSettings);
              window.electron.settings.write(
                profile?.id,
                CHAT_SETTINGS,
                newSettings
              );
            }}
          />
        );
      default:
        return null;
    }
  };

  return settings ? (
    <Paper>
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
                onChange={(e) =>
                  handleAISettingsChange("provider", e.target.value)
                }
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
    </Paper>
  ) : (
    <Loading />
  );
};

export default ChatSettings;

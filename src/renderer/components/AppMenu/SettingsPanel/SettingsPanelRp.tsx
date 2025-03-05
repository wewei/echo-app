import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import PhotoIcon from "@mui/icons-material/Photo";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import type { Profile } from "@/shared/types/profile";
import Loading from "@/renderer/components/Loading";
import SearchSettingsView from './SearchSettingsView';
import ChatSettingsView from './ChatSettingsView';
import RagSettingsView from './RagSettingsView';
import { EntityRendererState, isEntityReady } from "@/renderer/data/entity";

interface SettingsPanelRpProps {
  profile: EntityRendererState<Profile>
  isEditing: boolean
  username: string
  avatarAssetId: string
  logoutDialogOpen: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onBack: () => void
  onUsernameChange: (value: string) => void
  onEditStart: () => void
  onEditSave: () => void
  onEditCancel: () => void
  onAvatarClick: () => void
  onLogoutClick: () => void
  onLogoutConfirm: () => void
  onLogoutCancel: () => void
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function SettingsPanelRp({
  profile,
  isEditing,
  username,
  avatarAssetId,
  logoutDialogOpen,
  fileInputRef,
  onBack,
  onUsernameChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onAvatarClick,
  onLogoutClick,
  onLogoutConfirm,
  onLogoutCancel,
  onFileSelect,
}: SettingsPanelRpProps) {
  const { t } = useTranslation();

  if (!isEntityReady(profile)) {
    return <Loading />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Back Button */}
      <ListItem
        component="button"
        onClick={onBack}
        sx={{
          width: 'fit-content',
          px: 1,
          py: 0.5,
          mb: -1,
          border: 'none',
          borderRadius: 1,
          bgcolor: 'transparent',
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <ArrowBackIcon />
        </ListItemIcon>
        <ListItemText 
          primary={t("common.back")}
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: 500,
          }}
        />
      </ListItem>

      {/* Account Section */}
      <List>
        <ListItem sx={{ px: 0 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t("settings.account").toUpperCase()}
          </Typography>
        </ListItem>
        <ListItem sx={{ px: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: isEditing ? "flex-start" : "center",
              gap: 2,
              width: '100%',
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={
                  avatarAssetId
                    ? `echo-asset:///${profile.id}/${avatarAssetId}`
                    : profile.avatar
                }
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "primary.main",
                }}
              />
              {isEditing && (
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    right: -8,
                    bottom: -8,
                    backgroundColor: "background.paper",
                    boxShadow: 1,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                  onClick={onAvatarClick}
                >
                  <PhotoIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              {isEditing ? (
                <TextField
                  autoFocus
                  size="small"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  fullWidth
                  label={t("profile.create.username")}
                />
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {profile.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("profile.current")}
                  </Typography>
                </>
              )}
            </Box>
            {isEditing ? (
              <Box sx={{ display: "flex", gap: 1, pt: 0.5 }}>
                <IconButton
                  onClick={onEditSave}
                  color="primary"
                  size="small"
                >
                  <DoneIcon />
                </IconButton>
                <IconButton onClick={onEditCancel} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={onEditStart}
                size="small"
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </ListItem>
      </List>

      <Divider />

      {/* Chat Settings */}
      <ChatSettingsView profile={profile} />

      <Divider />

      {/* Search Settings */}
      <SearchSettingsView profile={profile} />

      <Divider />

      {/* Rag Settings */}
      <RagSettingsView profile={profile} />

      {/* About Section */}
      <List>
        <ListItem sx={{ px: 0 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t("settings.about").toUpperCase()}
          </Typography>
        </ListItem>
        <ListItem sx={{ px: 0 }}>
          <ListItemText
            primary={t("settings.version")}
            secondary={t("app.version")}
            primaryTypographyProps={{
              variant: 'body2',
              color: 'text.primary'
            }}
            secondaryTypographyProps={{
              variant: 'body2',
              color: 'text.secondary'
            }}
          />
        </ListItem>
      </List>

      <Divider />

      {/* Logout Section */}
      <List>
        <ListItem
          component="button"
          onClick={onLogoutClick}
          sx={{
            color: "error.main",
            justifyContent: "space-between",
            width: "100%",
            px: 0,
            border: "none",
            borderRadius: 1,
            bgcolor: "transparent",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <ListItemText
            primary={t("settings.logout")}
            primaryTypographyProps={{
              variant: 'body1',
              fontWeight: 500,
            }}
          />
          <LogoutIcon sx={{ color: "inherit" }} />
        </ListItem>
      </List>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={onLogoutCancel}
      >
        <DialogTitle>{t("settings.logoutConfirmTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("settings.logoutConfirmMessage")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onLogoutCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onLogoutConfirm} color="error" autoFocus>
            {t("settings.logout")}
          </Button>
        </DialogActions>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={onFileSelect}
      />
    </Box>
  );
} 
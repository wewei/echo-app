import React, { useRef, useState } from "react";
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
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import { useProfile } from "@/renderer/data/profile";
import Loading from "@/renderer/components/Loading";

import SearchSettingsView from './SearchSettingsView'
import ChatSettingsView from './ChatSettingsView'

export default function SettingsPanel() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarAssetId, setAvatarAssetId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile] = useProfile(profileId);
  const [username, setUsername] = useState(profile?.username || "");

  const navigate = useNavigate();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const asset = await window.electron.asset.save(
        profile?.id,
        buffer,
        file.type
      );
      setAvatarAssetId(asset.id);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  const handleBack = () => {
    setSearchParams({ menu: "/" });
  }

  const handleUpdateProfile = async () => {
    let avatarUrl = profile?.avatar;
    if (avatarAssetId) {
      avatarUrl = `echo-asset:///${profile?.id}/${avatarAssetId}`;
    }

    setIsEditing(false);
    setAvatarAssetId("");
    setProfile((prev) => ({ ...prev, username, avatar: avatarUrl }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername(profile?.username || "");
    setAvatarAssetId("");
  };

  const handleLogout = async () => {
    try {
      await window.electron.profile.delete(profile?.id);
      setLogoutDialogOpen(false);
      navigate("/noprofile");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return profile ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Back Button */}
      <ListItem
        component="button"
        onClick={handleBack}
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
                    ? `echo-asset:///${profile?.id}/${avatarAssetId}`
                    : profile?.avatar
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
                  onClick={() => fileInputRef.current?.click()}
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
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  label={t("profile.create.username")}
                />
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {profile?.username}
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
                  onClick={handleUpdateProfile}
                  color="primary"
                  size="small"
                >
                  <DoneIcon />
                </IconButton>
                <IconButton onClick={handleCancel} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => {
                  setUsername(profile?.username || "");
                  setIsEditing(true);
                }}
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
          onClick={() => setLogoutDialogOpen(true)}
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
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>{t("settings.logoutConfirmTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("settings.logoutConfirmMessage")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleLogout} color="error" autoFocus>
            {t("settings.logout")}
          </Button>
        </DialogActions>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={handleFileSelect}
      />
    </Box>
  ) : (
    <Loading />
  );
}

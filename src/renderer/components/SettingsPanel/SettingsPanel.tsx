import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import PhotoIcon from "@mui/icons-material/Photo";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "../../data/profile";
import SearchSettingsView from './SearchSettingsView'
import ChatSettingsView from './ChatSettingsView'
import Loading from "../Loading";

export default function SettingsPanel() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarAssetId, setAvatarAssetId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile] = useProfile(profileId);
  const [username, setUsername] = useState(profile?.username || "");
  const theme = useTheme();

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
    <>
      <Paper>
        <List>
          <ListItem>
            <Typography variant="subtitle2" color="text.secondary">
              {t("settings.account").toUpperCase()}
            </Typography>
          </ListItem>
          <ListItem>
            <Box
              sx={{
                display: "flex",
                alignItems: isEditing ? "flex-start" : "center",
                gap: 2,
                flexGrow: 1,
                py: 1,
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
                    <Typography variant="subtitle1">
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
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Box>
          </ListItem>
        </List>
      </Paper>

      <ChatSettingsView profile={profile} />
      <SearchSettingsView profile={profile} />

      <Paper>
        <List>
          <ListItem>
            <Typography variant="subtitle2" color="text.secondary">
              {t("settings.about").toUpperCase()}
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("settings.version")}
              secondary={t("app.version")}
            />
          </ListItem>
        </List>
      </Paper>

      <Paper>
        <List>
          <ListItem
            component="button"
            onClick={() => setLogoutDialogOpen(true)}
            sx={{
              color: "error.main",
              justifyContent: "space-between",
              py: 2,
              width: "100%",
              border: "none",
              bgcolor: "transparent",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemText
              primary={t("settings.logout")}
              slotProps={{
                primary: {
                  variant: "body1",
                  fontWeight: 500,
                },
              }}
            />
            <LogoutIcon sx={{ color: "inherit" }} />
          </ListItem>
        </List>
      </Paper>
    </>
  ) : (
    <Loading />
  );
}

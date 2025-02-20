import React, { useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useProfile, updateProfile } from "@/renderer/data/profile";
import SettingsPanelRp from "./SettingsPanelRp";
import { isEntityReady } from "@/renderer/data/entity";

export default function SettingsPanelCt() {
  const [, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarAssetId, setAvatarAssetId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { profileId } = useParams<{ profileId: string }>();
  const profile = useProfile(profileId);
  const [username, setUsername] = useState(isEntityReady(profile) ? profile.username : "");
  const navigate = useNavigate();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isEntityReady(profile)) return;

    try {
      const buffer = await file.arrayBuffer();
      const asset = await window.electron.asset.save(
        profile.id,
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
  };

  const handleUpdateProfile = async () => {
    if (!isEntityReady(profile)) return;
    
    let avatarUrl = profile.avatar;
    if (avatarAssetId) {
      avatarUrl = `echo-asset:///${profile.id}/${avatarAssetId}`;
    }

    setIsEditing(false);
    setAvatarAssetId("");
    updateProfile(profileId, { ...profile, username, avatar: avatarUrl });
  };

  const handleEditStart = () => {
    if (!isEntityReady(profile)) return;
    setUsername(profile.username);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    if (!isEntityReady(profile)) return;
    setIsEditing(false);
    setUsername(profile.username);
    setAvatarAssetId("");
  };

  const handleLogout = async () => {
    if (!isEntityReady(profile)) return;
    try {
      await window.electron.profile.delete(profile.id);
      setLogoutDialogOpen(false);
      navigate("/noprofile");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <SettingsPanelRp
      profile={profile}
      isEditing={isEditing}
      username={username}
      avatarAssetId={avatarAssetId}
      logoutDialogOpen={logoutDialogOpen}
      fileInputRef={fileInputRef}
      onBack={handleBack}
      onUsernameChange={setUsername}
      onEditStart={handleEditStart}
      onEditSave={handleUpdateProfile}
      onEditCancel={handleEditCancel}
      onAvatarClick={() => fileInputRef.current?.click()}
      onLogoutClick={() => setLogoutDialogOpen(true)}
      onLogoutConfirm={handleLogout}
      onLogoutCancel={() => setLogoutDialogOpen(false)}
      onFileSelect={handleFileSelect}
    />
  );
} 
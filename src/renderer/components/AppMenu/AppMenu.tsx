import React from 'react'
import { Box, Divider } from '@mui/material'
import ProfileHeader from './ProfileHeader'
import ProfileList from './ProfileList'
import SettingsPanel from '../SettingsPanel'
import { useProfile } from '@/renderer/data/profile'
import { useParams, useSearchParams } from 'react-router-dom'

export default function AppMenu() {
  const profileId = useParams().profileId;
  const [profile] = useProfile(profileId);
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get("menu");


  return (
    <Box
      sx={{
        width: 420,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <ProfileHeader
        profile={profile}
        onOpenSettings={() => {
          setSearchParams({ menu: "/settings" });
        }}
      />
      <Divider />
      <ProfileList />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          bgcolor: "background.paper",
          transform:
            path === "/settings" ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <SettingsPanel />
      </Box>
    </Box>
  );
}

import React from 'react'
import { Box, Divider, Paper } from '@mui/material'
import ProfileHeader from './ProfileHeader'
import ProfileList from './ProfileList'
import SettingsPanel from './SettingsPanel'
import { useProfile } from '@/renderer/data/profile'
import { useParams, useSearchParams } from 'react-router-dom'

export default function AppMenu() {
  const profileId = useParams().profileId;
  const [profile] = useProfile(profileId);
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get("menu");

  return (
    <Paper
      elevation={0}
      sx={{
        width: 420,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ p: 2, pb: 2 }}>
        <ProfileHeader
          profile={profile}
          onOpenSettings={() => setSearchParams({ menu: "/settings" })}
        />
      </Box>
      
      <Divider />
      
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        px: 2,
        py: 1,
        scrollbarGutter: 'stable',
        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'action.hover',
          borderRadius: 4,
        },
      }}>
        <ProfileList />
      </Box>

      <Paper
        elevation={2}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          bgcolor: "background.paper",
          transform: path === "/settings" ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: 'auto',
          p: 3,
          scrollbarGutter: 'stable',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'action.hover',
            borderRadius: 4,
          },
        }}
      >
        <SettingsPanel />
      </Paper>
    </Paper>
  );
}

import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import React, { useState, useEffect } from 'react'
import '../shared/i18n'
import { Profile } from '../shared/types/profile'
import AppHeader from './components/AppHeader'
import ChatPanel from './components/ChatPanel'
import NoProfile from './components/NoProfile'
import ProfileDialog from './components/ProfileDialog'
import SettingsPanel from './components/SettingsPanel'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // 加载 profiles
  useEffect(() => {
    const loadProfiles = async () => {
      const allProfiles = await window.electron.profile.getAll()
      setProfiles(allProfiles)
      
      const defaultProfile = await window.electron.profile.getDefault()
      setCurrentProfile(defaultProfile)
    }
    
    loadProfiles()
  }, [])

  // 切换 profile
  const handleProfileChange = async (profileId: string) => {
    const profile = await window.electron.profile.get(profileId)
    setCurrentProfile(profile)
    await window.electron.profile.setDefault(profileId)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AppHeader
          profiles={profiles}
          currentProfile={currentProfile}
          onProfileChange={handleProfileChange}
          onProfileCreate={() => setProfileDialogOpen(true)}
          onSettingsClick={() => setShowSettings(true)}
          showSettings={showSettings}
          onBackFromSettings={() => setShowSettings(false)}
        />
        {currentProfile ? (
          showSettings ? (
            <SettingsPanel profile={currentProfile} />
          ) : (
            <ChatPanel profile={currentProfile} />
          )
        ) : (
          <NoProfile onProfileCreated={(profile) => {
            setProfiles([...profiles, profile])
            setCurrentProfile(profile)
          }} />
        )}

        <ProfileDialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          onProfileCreated={(profile) => {
            setProfiles([...profiles, profile])
            setCurrentProfile(profile)
            setProfileDialogOpen(false)
          }}
        />
      </Box>
    </ThemeProvider>
  )
} 
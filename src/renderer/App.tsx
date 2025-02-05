import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import '../shared/i18n'
import { Profile } from '../shared/types/profile'
import AppHeader from './components/AppHeader'
import ChatPanel from './components/ChatPanel'
import NoProfile from './components/NoProfile'
import SettingsPanel from './components/SettingsPanel'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const loadProfiles = useCallback(async () => {
    const allProfiles = await window.electron.profile.getAll()
    setProfiles(allProfiles)
    if (
      allProfiles.length > 0 &&
      (!currentProfile || !allProfiles.some((p) => p.id === currentProfile.id))
    ) {
      setCurrentProfile(allProfiles[0]);
    }
  }, [currentProfile]);
 
  // 加载 profiles
  useEffect(() => { loadProfiles() }, [loadProfiles])

  // 切换 profile
  const handleProfileChange = async (profileId: string) => {
    const profile = await window.electron.profile.get(profileId)
    setCurrentProfile(profile)
  }

  const handleLogout = async () => {
    if (!currentProfile) return
    await window.electron.profile.delete(currentProfile.id)
    setShowSettings(false)
    loadProfiles()
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
          onProfileCreate={(profile) => {
            setProfiles([...profiles, profile])
            setCurrentProfile(profile)
            setShowSettings(true)  // 直接进入设置页
          }}
          onSettingsClick={() => setShowSettings(true)}
          showSettings={showSettings}
          onBackFromSettings={() => setShowSettings(false)}
        />
        {currentProfile ? (
          showSettings ? (
            <SettingsPanel 
              profile={currentProfile}
              onLogout={handleLogout}
            />
          ) : (
            <ChatPanel profile={currentProfile} />
          )
        ) : (
          <NoProfile onProfileCreated={(profile) => {
            setProfiles([...profiles, profile])
            setCurrentProfile(profile)
            setShowSettings(true)
          }}
          onNavigateToSettings={() => setShowSettings(true)}
          />
        )}
      </Box>
    </ThemeProvider>
  )
} 
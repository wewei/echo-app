import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Profile } from '../shared/types/profile'
import ProfileSelector from './components/ProfileSelector'
import ChatPanel from './components/ChatPanel'
import NoProfile from './components/NoProfile'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])

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
        <ProfileSelector
          profiles={profiles}
          currentProfile={currentProfile}
          onProfileChange={handleProfileChange}
          onProfilesChange={setProfiles}
        />
        {currentProfile ? (
          <ChatPanel profile={currentProfile} />
        ) : (
          <NoProfile onProfileCreated={(profile) => {
            setProfiles([...profiles, profile])
            setCurrentProfile(profile)
          }} />
        )}
      </Box>
    </ThemeProvider>
  )
} 
import React, { useState } from 'react'
import {
  AppBar, Toolbar, Avatar, IconButton,
  Drawer, List, ListItem, ListItemIcon,
  ListItemText, ListItemAvatar, Typography,
  Divider, Box
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { Profile } from '../../shared/types/profile'

interface Props {
  currentProfile: Profile | null
  profiles: Profile[]
  onProfileChange: (profileId: string) => void
  onProfileCreate: (profile: Profile) => void
  onSettingsClick: () => void
  showSettings?: boolean
  onBackFromSettings?: () => void
}

export default function AppHeader({
  currentProfile,
  profiles,
  onProfileChange,
  onProfileCreate,
  onSettingsClick,
  showSettings,
  onBackFromSettings
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { t } = useTranslation()

  if (showSettings) {
    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={onBackFromSettings}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            {t('settings.title')}
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('app.name')}
        </Typography>
        
        {currentProfile && (
          <IconButton 
            onClick={() => setDrawerOpen(true)}
            sx={{ p: 0.5 }}
          >
            <Avatar
              src={currentProfile.avatar}
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>
        )}

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 320, pt: 2 }}>
            {currentProfile && (
              <Box sx={{ px: 2, mb: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2
                }}>
                  <Avatar
                    src={currentProfile.avatar}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box>
                    <Typography variant="h6">
                      {currentProfile.username}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      {t('profile.current')}
                    </Typography>
                  </Box>
                </Box>

                <ListItem 
                  component="button"
                  onClick={() => {
                    onSettingsClick()
                    setDrawerOpen(false)
                  }}
                  sx={{
                    width: '100%',
                    border: 'none',
                    bgcolor: 'transparent',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('common.settings')} />
                </ListItem>
              </Box>
            )}

            <Divider />

            <List sx={{ pt: 0 }}>
              {profiles
                .filter(p => p.id !== currentProfile?.id)
                .map(profile => (
                  <ListItem
                    component="button"
                    key={profile.id}
                    sx={{
                      width: '100%',
                      border: 'none',
                      bgcolor: 'transparent',
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => {
                      onProfileChange(profile.id)
                      setDrawerOpen(false)
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={profile.avatar} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={profile.username}
                      secondary={t('profile.switchTo')}
                    />
                  </ListItem>
                ))
              }

              <ListItem
                component="button"
                sx={{
                  width: '100%',
                  border: 'none',
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={async () => {
                  // 创建新用户
                  const profile = await window.electron.profile.create(
                    t('profile.defaultName'),
                    ''  // 空头像
                  )
                  onProfileCreate(profile)
                  setDrawerOpen(false)
                }}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={t('profile.addNew')} />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  )
} 
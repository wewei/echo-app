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
import MenuIcon from '@mui/icons-material/Menu'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useProfile, useProfiles } from '../data/profile'

export default function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { profileId } = useParams<{ profileId: string }>()
  const [profile] = useProfile(profileId)
  const [profiles, createProfile] = useProfiles()

  const isSettingsPage = location.pathname.endsWith('/settings')

  if (isSettingsPage && profileId) {
    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={() => navigate(`/profile/${profileId}/chat`)}
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
        
        <IconButton 
          onClick={() => setDrawerOpen(true)}
          sx={{ p: 0.5 }}
        >
          {profile ? (
            <Avatar
              src={profile.avatar}
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <MenuIcon />
          )}
        </IconButton>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 320, pt: 2 }}>
            {profile ? (
              <Box sx={{ px: 2, mb: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2
                }}>
                  <Avatar
                    src={profile.avatar}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box>
                    <Typography variant="h6">
                      {profile.username}
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
                    navigate(`/profile/${profile.id}/settings`)
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
            ) : (
              <Box sx={{ px: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {t('profile.noProfile')}
                </Typography>
              </Box>
            )}

            {(profiles.length > 0) && <Divider />}

            <List sx={{ pt: 0 }}>
              {profiles
                .filter(p => p.id !== profile?.id)
                .map(p => (
                  <ListItem
                    component="button"
                    key={p.id}
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
                      navigate(`/profile/${p.id}/chat`)
                      setDrawerOpen(false)
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={p.avatar} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={p.username}
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
                  const newProfile = await createProfile()
                  navigate(`/profile/${newProfile.id}/settings`)
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
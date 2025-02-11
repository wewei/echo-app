import React from 'react'
import {
  Avatar, IconButton, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, ListItemAvatar, 
  Typography, Divider, Box
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'

import { useProfile, useProfiles } from '@/renderer/data/profile'

interface AppHeaderProps {
  showMenu?: boolean
  showSettings?: boolean
}

export default function AppHeader({ showMenu, showSettings }: AppHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profileId } = useParams<{ profileId: string }>()
  const [profile] = useProfile(profileId)
  const [profiles, createProfile] = useProfiles()

  const handleCloseMenu = () => {
    searchParams.delete('menu')
    setSearchParams(searchParams)
  }

  const handleOpenSettings = () => {
    searchParams.set('menu', '/settings')
    setSearchParams(searchParams)
  }

  const handleBack = () => {
    handleCloseMenu()
  }

  if (location.pathname.endsWith('/settings') && profileId) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
        }}
      >
        <IconButton
          onClick={() => navigate(`/profile/${profileId}/chat`)}
          sx={{ 
            p: 0.5,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1200,
      }}
    >
      <IconButton 
        onClick={() => {
          searchParams.set('menu', '/')
          setSearchParams(searchParams)
        }}
        sx={{ 
          p: 0.5,
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            bgcolor: 'background.paper',
          }
        }}
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
        open={showMenu}
        onClose={handleCloseMenu}
      >
        <Box 
          sx={{ 
            width: 420,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: showSettings ? 'translateX(-100%)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            <Box sx={{ pt: 2 }}>
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
                    onClick={handleOpenSettings}
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
                        handleCloseMenu()
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
                    handleCloseMenu()
                  }}
                >
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('profile.addNew')} />
                </ListItem>
              </List>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
} 
import React, { useRef, useState, useEffect } from 'react'
import {
  Box, Paper, List, ListItem, ListItemText,
  Avatar, IconButton, TextField,
  Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import EditIcon from '@mui/icons-material/Edit'
import PhotoIcon from '@mui/icons-material/Photo'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import LogoutIcon from '@mui/icons-material/Logout'
import { Profile } from '../../shared/types/profile'
import { ChatSettings, ChatSettingsSchema, ChatProvider, CHAT_SETTINGS } from '../../shared/types/chatSettings'
import OpenAISettingsPanel from './settings/OpenAISettings'
import DeepSeekSettingsPanel from './settings/DeepSeekSettings'
import AzureSettingsPanel from './settings/AzureSettings'

// 添加AI供应商类型定义
interface Props {
  profile: Profile
  onLogout: () => void
  onProfileUpdate: (profile: Profile) => void
}

export default function SettingsPanel({ profile, onLogout, onProfileUpdate }: Props) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [avatarAssetId, setAvatarAssetId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [chatSettings, setChatSettings] = useState<ChatSettings>(ChatSettingsSchema.parse({}))

  // 获取已保存的设置
  useEffect(() => {
    const loadAISettings = async () => {
      const settings = await window.electron.settings.read(profile.id, CHAT_SETTINGS)
      if (settings) {
        setChatSettings(ChatSettingsSchema.parse(settings))
      }
    }
    loadAISettings()
  }, [profile.id])

  // 保存AI设置
  const handleAISettingsChange = async (
    field: 'provider' | 'apiKey' | 'endpoint' | 'model',
    value: string
  ) => {
    const newSettings = { ...chatSettings }
    
    if (field === 'provider') {
      newSettings.provider = value as ChatProvider
    } else {
      newSettings[chatSettings.provider] = {
        ...newSettings[chatSettings.provider],
        [field]: value
      }
    }
    
    setChatSettings(newSettings)
    await window.electron.settings.write(profile.id, CHAT_SETTINGS, newSettings)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const asset = await window.electron.asset.save(
        profile.id,
        buffer,
        file.type
      )
      setAvatarAssetId(asset.id)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    }
  }

  const handleUpdateProfile = async () => {
    let avatarUrl = profile.avatar
    if (avatarAssetId) {
      avatarUrl = `echo-asset:///${profile.id}/${avatarAssetId}`
    }

    const updatedProfile = {
      ...profile,
      username,
      avatar: avatarUrl
    }

    await window.electron.profile.update(
      profile.id,
      { username, avatar: avatarUrl },
    )
    setIsEditing(false)
    setAvatarAssetId('')
    onProfileUpdate(updatedProfile)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setUsername(profile.username)
    setAvatarAssetId('')
  }

  const handleLogout = async () => {
    try {
      await window.electron.profile.delete(profile.id)
      
      setLogoutDialogOpen(false)
      onLogout()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  const renderAISettings = () => {
    switch (chatSettings.provider) {
      case 'openai':
        return (
          <OpenAISettingsPanel
            settings={chatSettings.openai}
            onChange={(settings) => {
              const newSettings = { ...chatSettings, openai: settings }
              setChatSettings(newSettings)
              window.electron.settings.write(profile.id, CHAT_SETTINGS, newSettings)
            }}
          />
        )
      case 'deepseek':
        return (
          <DeepSeekSettingsPanel
            settings={chatSettings.deepseek}
            onChange={(settings) => {
              const newSettings = { ...chatSettings, deepseek: settings }
              setChatSettings(newSettings)
              window.electron.settings.write(profile.id, CHAT_SETTINGS, newSettings)
            }}
          />
        )
      case 'azure':
        return (
          <AzureSettingsPanel
            settings={chatSettings.azure}
            onChange={(settings) => {
              const newSettings = { ...chatSettings, azure: settings }
              setChatSettings(newSettings)
              window.electron.settings.write(profile.id, CHAT_SETTINGS, newSettings)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      gap: 2,
      maxWidth: 600,
      mx: 'auto',
      width: '100%'
    }}>
      <Paper>
        <List>
          <ListItem>
            <Typography variant="subtitle2" color="text.secondary">
              {t('settings.account').toUpperCase()}
            </Typography>
          </ListItem>
          <ListItem>
            <Box sx={{ 
              display: 'flex',
              alignItems: isEditing ? 'flex-start' : 'center',
              gap: 2,
              flexGrow: 1,
              py: 1
            }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarAssetId ? 
                    `echo-asset:///${profile.id}/${avatarAssetId}` :
                    profile.avatar
                  }
                  sx={{ 
                    width: 56,
                    height: 56,
                    bgcolor: 'primary.main'
                  }}
                />
                {isEditing && (
                  <IconButton 
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      right: -8,
                      bottom: -8,
                      backgroundColor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
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
                    label={t('profile.create.username')}
                  />
                ) : (
                  <>
                    <Typography variant="subtitle1">
                      {profile.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.current')}
                    </Typography>
                  </>
                )}
              </Box>
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
                  <IconButton 
                    onClick={handleUpdateProfile}
                    color="primary"
                    size="small"
                  >
                    <DoneIcon />
                  </IconButton>
                  <IconButton 
                    onClick={handleCancel}
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <IconButton 
                  onClick={() => {
                    setUsername(profile.username)
                    setIsEditing(true)
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

      <Paper>
        <List>
          <ListItem>
            <Typography variant="subtitle2" color="text.secondary">
              {t('settings.ai.title').toUpperCase()}
            </Typography>
          </ListItem>
          <ListItem>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', py: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('settings.ai.provider')}</InputLabel>
                <Select
                  value={chatSettings.provider}
                  label={t('settings.ai.provider')}
                  onChange={(e) => handleAISettingsChange('provider', e.target.value)}
                >
                  <MenuItem value="openai">{t('settings.ai.providers.openai')}</MenuItem>
                  <MenuItem value="deepseek">{t('settings.ai.providers.deepseek')}</MenuItem>
                  <MenuItem value="azure">{t('settings.ai.providers.azure')}</MenuItem>
                </Select>
              </FormControl>

              {renderAISettings()}
            </Box>
          </ListItem>
        </List>
      </Paper>

      <Paper>
        <List>
          <ListItem>
            <Typography variant="subtitle2" color="text.secondary">
              {t('settings.about').toUpperCase()}
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary={t('settings.version')}
              secondary={t('app.version')}
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
              color: 'error.main',
              justifyContent: 'space-between',
              py: 2,
              width: '100%',
              border: 'none',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <ListItemText 
              primary={t('settings.logout')} 
              slotProps={{
                primary: {
                  variant: 'body1',
                  fontWeight: 500
                }
              }}
            />
            <LogoutIcon sx={{ color: 'inherit' }} />
          </ListItem>
        </List>
      </Paper>

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>
          {t('settings.logoutConfirmTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('settings.logoutConfirmMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleLogout}
            color="error"
            variant="contained"
          >
            {t('settings.logout')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 
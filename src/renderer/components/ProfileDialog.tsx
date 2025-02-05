import React, { useState, useRef } from 'react'
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField,
  Avatar, Box
} from '@mui/material'
import PhotoIcon from '@mui/icons-material/Photo'
import { useTranslation } from 'react-i18next'
import { Profile } from '../../shared/types/profile'

interface Props {
  open: boolean
  onClose: () => void
  onProfileCreated: (profile: Profile) => void
}

export default function ProfileDialog({
  open,
  onClose,
  onProfileCreated
}: Props) {
  const [username, setUsername] = useState('')
  const [avatarAssetId, setAvatarAssetId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const asset = await window.electron.asset.save(
        'temp',
        buffer,
        file.type
      )
      setAvatarAssetId(asset.id)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    }
  }

  const handleCreate = async () => {
    if (!avatarAssetId) return
    const profile = await window.electron.profile.create(
      username,
      `echo-asset:///temp/${avatarAssetId}`
    )
    
    // 将临时资源移动到新的 profile 下
    try {
      const content = await window.electron.asset.read('temp', avatarAssetId)
      if (content) {
        await window.electron.asset.save(
          profile.id,
          content.content,
          content.metadata.mimeType
        )
      }
    } catch (error) {
      console.error('Failed to move avatar:', error)
    }

    onProfileCreated(profile)
    setUsername('')
    setAvatarAssetId('')
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        {t('profile.create.title')}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('profile.create.username')}
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Box sx={{ 
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar
            src={avatarAssetId ? 
              `echo-asset:///temp/${avatarAssetId}` :
              undefined
            }
            sx={{ width: 64, height: 64 }}
          />
          <Button
            variant="outlined"
            startIcon={<PhotoIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('profile.create.avatar')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('profile.create.cancel')}</Button>
        <Button 
          onClick={handleCreate}
          disabled={!username || !avatarAssetId}
        >
          {t('profile.create.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 
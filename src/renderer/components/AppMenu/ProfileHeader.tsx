import React from 'react'
import { Box, Avatar, Typography, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { Profile } from '@/shared/types/profile'
import { useTranslation } from 'react-i18next'

type ProfileHeaderProps = {
  profile: Profile
  onOpenSettings: () => void
}

const ProfileHeader = ({ profile, onOpenSettings }: ProfileHeaderProps) => {
  const { t } = useTranslation()

  return (
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
        onClick={onOpenSettings}
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
  )
}

export default ProfileHeader
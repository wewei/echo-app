import React from 'react'
import { Box, Avatar, Typography, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { Profile } from '@/shared/types/profile'
import { useTranslation } from 'react-i18next'
import Loading from '@/renderer/components/Loading'
import { EntityRendererState, isEntityReady } from '@/renderer/data/cachedEntity'

type ProfileHeaderProps = {
  profile: EntityRendererState<Profile>
  onOpenSettings: () => void
}

const ProfileHeader = ({ profile, onOpenSettings }: ProfileHeaderProps) => {
  const { t } = useTranslation()
  if (!isEntityReady(profile)) {
    return <Loading />
  }

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2
      }}>
        <Avatar
          src={profile.avatar}
          sx={{ width: 56, height: 56 }}
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
          borderRadius: 1,
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
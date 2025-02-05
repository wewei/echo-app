import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Profile } from '../../shared/types/profile'

interface Props {
  onProfileCreated: (profile: Profile) => void
  onNavigateToSettings: () => void
}

export default function NoProfile({ onProfileCreated, onNavigateToSettings }: Props) {
  const { t } = useTranslation()

  const handleCreateProfile = async () => {
    const profile = await window.electron.profile.create(
      t('profile.defaultName'),
      ''  // 空头像
    )

    onProfileCreated(profile)
    onNavigateToSettings()
  }

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2
    }}>
      <Typography variant="h5">
        {t('welcome.title')}
      </Typography>
      <Typography color="text.secondary">
        {t('welcome.subtitle')}
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleCreateProfile}
      >
        {t('welcome.createProfile')}
      </Button>
    </Box>
  )
} 
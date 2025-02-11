import React from 'react'
import { Box, List, ListItem, ListItemAvatar, ListItemText, Typography, Avatar, Divider } from '@mui/material'
import { Profile } from '@/shared/types/profile'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ProfileHeader from './ProfileHeader'

export type AppMenuProps = {
  path: string
  currentProfileId: string
  profiles: Profile[]
  onPathChange: (path: string) => void
  onSwitchProfile: (profileId: string) => void
  onOpenSettings: () => void
  onCreateProfile: () => void
}

export default function AppMenu({ path, onPathChange, currentProfileId, profiles, onSwitchProfile, onOpenSettings, onCreateProfile }: AppMenuProps) {
  const { t } = useTranslation()
  const currentProfile = profiles.find(p => p.id === currentProfileId)

  if (path === '/') {
    return (
      <>
        <ProfileHeader
          profile={currentProfile}
          onOpenSettings={onOpenSettings}
        />
        <Divider />
      </>
    )
  }

}

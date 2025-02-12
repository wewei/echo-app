import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, ListItemIcon } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import type { Profile } from '@/shared/types/profile'

interface ProfileListPrProps {
  profiles: Profile[]
  currentProfileId?: string
  onProfileClick: (profileId: string) => void
  onCreateProfile: () => void
}

export default function ProfileListPr({
  profiles,
  currentProfileId,
  onProfileClick,
  onCreateProfile
}: ProfileListPrProps) {
  const { t } = useTranslation()

  return (
    <List>
      {profiles
        .filter(p => p.id !== currentProfileId)
        .map(p => (
          <ListItem
            component="button"
            key={p.id}
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
            onClick={() => onProfileClick(p.id)}
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
          borderRadius: 1,
          bgcolor: 'transparent',
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={onCreateProfile}
      >
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary={t('profile.addNew')} />
      </ListItem>
    </List>
  )
} 
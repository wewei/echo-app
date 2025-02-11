import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, ListItemIcon } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import { Profile } from '@/shared/types/profile'

interface ProfileListProps {
  profiles: Profile[]
  onSwitchProfile: (profileId: string) => void
  onCreateProfile: () => void
}

const ProfileList = ({ profiles, onSwitchProfile, onCreateProfile }: ProfileListProps) =>  {
  const { t } = useTranslation()

  return (
    <List sx={{ pt: 0 }}>
      {profiles
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
            onClick={() => onSwitchProfile(p.id)}
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

export default ProfileList
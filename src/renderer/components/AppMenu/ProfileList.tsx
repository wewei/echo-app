import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, ListItemIcon } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import { useProfiles } from '@/renderer/data/profile'
import { useNavigate, useParams } from 'react-router-dom'

const ProfileList = () =>  {
  const { t } = useTranslation()
  const [profiles, createProfile] = useProfiles();
  const currentProfileId = useParams().profileId;
  const navigate = useNavigate();
  const onProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  }

  return (
    <List sx={{ pt: 0 }}>
      {profiles
        .filter(p => p.id !== currentProfileId)
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
          bgcolor: 'transparent',
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={async () => {
          const { id } = await createProfile();
          navigate(`/profile/${id}?menu=/settings`);
        }}
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
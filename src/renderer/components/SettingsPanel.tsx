import React from 'react'
import {
  Box,
  Paper, List, ListItem, ListItemText,
  Divider
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Profile } from '../../shared/types/profile'

interface Props {
  profile: Profile
}

export default function SettingsPanel({ profile }: Props) {
  const { t } = useTranslation()

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      gap: 2
    }}>
      <Paper sx={{ flexGrow: 1 }}>
        <List>
          <ListItem>
            <ListItemText 
              primary={t('settings.account')}
              secondary={profile.username}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary={t('settings.version')}
              secondary={t('app.version')}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
} 
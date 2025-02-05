import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { Profile } from '../../shared/types/profile'

interface Props {
  onProfileCreated: (profile: Profile) => void
}

export default function NoProfile({ onProfileCreated }: Props) {
  const handleCreateProfile = async () => {
    // 这里使用一些默认值创建 profile
    const profile = await window.electron.profile.create(
      '新用户',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
    )
    onProfileCreated(profile)
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
        欢迎使用 Echo Chat
      </Typography>
      <Typography color="text.secondary">
        创建一个个人资料开始聊天
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleCreateProfile}
      >
        创建个人资料
      </Button>
    </Box>
  )
} 
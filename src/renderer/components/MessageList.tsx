import React from 'react'
import { Box, Typography } from '@mui/material'

interface Props {
  profileId: string
}

export default function MessageList({ profileId }: Props) {
  return (
    <Box>
      <Typography color="text.secondary" align="center">
        暂无消息
      </Typography>
    </Box>
  )
} 
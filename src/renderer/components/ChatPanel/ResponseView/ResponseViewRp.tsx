import React from 'react'
import { Box, Typography } from '@mui/material'
import type { Response } from '@/shared/types/interactions'

interface ResponseViewRpProps {
  response: Response
}

export default function ResponseViewRp({ response }: ResponseViewRpProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {new Date(response.timestamp).toLocaleString()}
        </Typography>
      </Box>
      <Typography>
        {response.content}
      </Typography>
    </Box>
  )
} 
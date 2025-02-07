import React from 'react'
import { Box, CircularProgress } from '@mui/material'

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2
      }}
    >
      <CircularProgress />
    </Box>
  )
}

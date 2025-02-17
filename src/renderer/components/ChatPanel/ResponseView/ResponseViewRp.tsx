import React from 'react'
import { Box, Typography, Paper, IconButton } from '@mui/material'
import type { Response } from '@/shared/types/interactions'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

type Props = {
  response: Response
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function ResponseViewRp({ response, hasPrevious, hasNext, onPrevious, onNext }: Props) {
  console.log(hasPrevious, hasNext)
  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'flex-start',
      px: 2 
    }}>
      <Paper
        elevation={1}
        sx={{
          position: 'relative',
          maxWidth: '80%',
          minWidth: '240px',
          bgcolor: 'background.paper',
          borderRadius: 2,
          borderTopLeftRadius: 0,
          px: 2,
          py: 1
        }}
      >
        <Typography color="text.primary">
          {response.content}
        </Typography>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1
        }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ opacity: 0.7, textWrap: 'nowrap' }}
          >
            {new Date(response.timestamp).toLocaleString()}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 0,
              borderRadius: 0,
              boxShadow: 0,
              zIndex: 0
            }}
          >
            <IconButton
              size="small"
              disabled={!hasPrevious}
              onClick={onPrevious}
              sx={{
                padding: '2px',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              size="small"
              disabled={!hasNext}
              onClick={onNext}
              sx={{
                padding: '2px',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>

        </Box>

      </Paper>
    </Box>
  )
} 
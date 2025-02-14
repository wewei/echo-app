import React from 'react'
import { Box, IconButton, Paper } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ResponseView from '@/renderer/components/ResponseView'

interface ResponseListRpProps {
  responseIds: string[]
  currentIndex: number
  onPrevious: () => void
  onNext: () => void
}

export default function ResponseListRp({
  responseIds,
  currentIndex,
  onPrevious,
  onNext
}: ResponseListRpProps) {
  const hasResponses = responseIds.length > 0
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < responseIds.length - 1

  if (!hasResponses) {
    return null
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 1,
          bgcolor: 'background.paper' 
        }}
      >
        <ResponseView responseId={responseIds[currentIndex]} />
      </Paper>

      {/* Navigation Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          display: 'flex',
          gap: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <IconButton 
          size="small"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton 
          size="small"
          disabled={!hasNext}
          onClick={onNext}
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  )
} 
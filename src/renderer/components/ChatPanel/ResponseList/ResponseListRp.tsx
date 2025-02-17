import React from 'react'
import { Box, IconButton, Paper } from '@mui/material'
import ResponseView from '@/renderer/components/ChatPanel/ResponseView'

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

  console.log(currentIndex, responseIds)

  return (
    <Box sx={{ position: 'relative', mb: 2  }}>
      <ResponseView
        responseId={responseIds[currentIndex]}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </Box>
  )
} 
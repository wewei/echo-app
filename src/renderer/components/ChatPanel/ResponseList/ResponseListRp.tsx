import React from 'react'
import { Box } from '@mui/material'
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

  if (!hasResponses) {
    return null
  }

  return (
    <Box sx={{ position: 'relative', mb: 2  }}>
      <ResponseView
        responseId={responseIds[currentIndex]}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < responseIds.length - 1}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </Box>
  )
} 
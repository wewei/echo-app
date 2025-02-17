import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Query } from '@/shared/types/interactions'
import ResponseList from '@/renderer/components/ChatPanel/ResponseList'

interface QueryViewRpProps {
  query: Query
}

export default function QueryViewRp({ query }: QueryViewRpProps) {
  const { t } = useTranslation()

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {new Date(query.timestamp).toLocaleString()}
        </Typography>
      </Box>
      <Typography sx={{ mb: 2 }}>
        {query.content}
      </Typography>
      <ResponseList queryId={query.id} />
    </Box>
  )
} 
import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Query } from '@/shared/types/interactions'

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
        <Chip 
          label={t(`query.type.${query.type}`)}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>
      <Typography>
        {query.content}
      </Typography>
    </Box>
  )
} 
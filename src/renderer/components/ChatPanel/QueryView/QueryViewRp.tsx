import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Query } from '@/shared/types/interactions'
import ResponseList from '@/renderer/components/ChatPanel/ResponseList'

interface QueryViewRpProps {
  query: Query
}

export default function QueryViewRp({ query }: QueryViewRpProps) {
  const { t } = useTranslation()

  return (
    <Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 2,
        px: 2
      }}>
        <Paper
          elevation={1}
          sx={{
            maxWidth: '80%',
            bgcolor: 'primary.main',
            borderRadius: 2,
            borderTopRightRadius: 0,
            px: 2,
            py: 1
          }}
        >
          <Typography color="primary.contrastText">
            {query.content}
          </Typography>
          <Typography
            variant="caption"
            color="primary.contrastText"
            sx={{ opacity: 0.7 }}
          >
            {new Date(query.timestamp).toLocaleString()}
          </Typography>
        </Paper>
      </Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 2,
        px: 2
      }}>
        <ResponseList queryId={query.id} />
      </Box>

    </Box>
  )
} 
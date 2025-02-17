import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Query } from '@/shared/types/interactions'
import ResponseList from '@/renderer/components/ChatPanel/ResponseList'

interface QueryViewRpProps {
  query: Query
}

export default function QueryViewRp({ query }: QueryViewRpProps) {
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
            py: 1,
            '& .markdown-body': {
              color: 'primary.contrastText',
              '& pre': {
                background: 'rgba(0, 0, 0, 0.1)',
                padding: 1,
                borderRadius: 1,
              },
              '& code': {
                color: 'inherit',
                background: 'rgba(0, 0, 0, 0.1)',
                padding: '2px 4px',
                borderRadius: 1,
              },
              '& a': {
                color: 'inherit',
                textDecoration: 'underline',
              }
            }
          }}
        >
          <Box className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {query.content}
            </ReactMarkdown>
          </Box>
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
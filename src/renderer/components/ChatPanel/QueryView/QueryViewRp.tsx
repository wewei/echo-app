import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import type { Query } from '@/shared/types/interactions'
import ResponseList from '@/renderer/components/ChatPanel/ResponseList'

const convertLatexDelimiters = (content: string): string => {
  return content
    // 转换行内公式
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')
    // 转换块级公式
    .replace(/\\\[(.*?)\\\]/g, '$$$1$$')
}

interface QueryViewRpProps {
  query: Query
}

export default function QueryViewRp({ query }: QueryViewRpProps) {
  const processedContent = convertLatexDelimiters(query.content)

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
              },
              '& .math, & .math-display': {
                color: 'inherit',
                '& .katex': {
                  color: 'inherit',
                }
              }
            }
          }}
        >
          <Box className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {processedContent}
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
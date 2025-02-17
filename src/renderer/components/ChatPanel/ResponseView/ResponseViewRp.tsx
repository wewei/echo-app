import React from 'react'
import { Box, Typography, Paper, IconButton } from '@mui/material'
import type { Response } from '@/shared/types/interactions'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const convertLatexDelimiters = (content: string): string => {
  return content
    // 转换行内公式
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')
    // 转换块级公式
    .replace(/\\\[(.*?)\\\]/g, '$$$1$$')
}

type Props = {
  response: Response
  onResponseClick?: (response: Response) => void
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function ResponseViewRp({ response, onResponseClick,hasPrevious, hasNext, onPrevious, onNext }: Props) {
  const processedContent = convertLatexDelimiters(response.content)

  console.log(response)
  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'flex-start',
      px: 2 
    }} onClick={(e) => {
      e.stopPropagation();
      console.log("response", response, onResponseClick);
      onResponseClick?.(response)
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
          py: 1,
          '& .markdown-body': {
            '& pre': {
              background: 'action.hover',
              padding: 1,
              borderRadius: 1,
              overflow: 'auto',
            },
            '& code': {
              background: 'action.hover',
              padding: '2px 4px',
              borderRadius: 1,
            },
            '& a': {
              color: 'primary.main',
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                padding: '6px',
              }
            },
            '& .math, & .math-display': {
              '& .katex': {
                color: 'text.primary',
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
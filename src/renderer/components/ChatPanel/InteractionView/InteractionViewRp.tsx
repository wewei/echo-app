import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Interaction } from '@/shared/types/interactionsV2';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

interface InteractionViewRpProps {
  interaction: Interaction;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const convertLatexDelimiters = (content: string): string => {
  return content
    // 转换行内公式
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')
    // 转换块级公式
    .replace(/\\\[(.*?)\\\]/g, '$$$1$$')
}

export default function InteractionViewRp({ interaction, hasPrevious, hasNext, onPrevious, onNext }: InteractionViewRpProps) {
  const processedContent = convertLatexDelimiters(interaction.userContent);
  const assistantContent = 
    interaction.type === 'chat' ? convertLatexDelimiters(interaction.assistantContent) : '';

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      mb: 2,
      px: 2
    }}>
      {/* 用户输入内容的气泡 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 1
      }}>
        <Paper
          elevation={1}
          sx={{
            maxWidth: '60%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2,
            borderTopRightRadius: 0,
            px: 2,
            py: 1,
            '& .markdown-body': {
              '& pre': {
                background: 'rgba(0, 0, 0, 0.1)',
                padding: 1,
                borderRadius: 1,
              },
              '& code': {
                background: 'rgba(0, 0, 0, 0.1)',
                padding: '2px 4px',
                borderRadius: 1,
              },
              '& a': {
                color: 'inherit',
                textDecoration: 'underline',
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
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
            sx={{ opacity: 0.7, mt: 1 }}
          >
            {new Date(interaction.createdAt).toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* 对方回复内容的气泡 */}
      {interaction.type === 'chat' && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 1
        }}>
          <Paper
            elevation={1}
            sx={{
              maxWidth: '60%',
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: 2,
              borderTopLeftRadius: 0,
              px: 2,
              py: 1,
              '& .markdown-body': {
                '& pre': {
                  background: 'rgba(0, 0, 0, 0.1)',
                  padding: 1,
                  borderRadius: 1,
                },
                '& code': {
                  background: 'rgba(0, 0, 0, 0.1)',
                  padding: '2px 4px',
                  borderRadius: 1,
                },
                '& a': {
                  color: 'inherit',
                  textDecoration: 'underline',
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                }
              }
            }}
          >
            <Box className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {assistantContent}
              </ReactMarkdown>
            </Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, mt: 1 }}
            >
              {new Date(interaction.updatedAt).toLocaleString()}
            </Typography>
          </Paper>
        </Box>
      )}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 1
      }}>
        <Box sx={{ display: 'flex' }}>
          {hasPrevious && (
            <IconButton onClick={onPrevious}>
              <NavigateBeforeIcon />
            </IconButton>
          )}
          {hasNext && (
            <IconButton onClick={onNext}>
              <NavigateNextIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}

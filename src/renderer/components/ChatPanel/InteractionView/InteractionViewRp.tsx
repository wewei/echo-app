import React, { useCallback } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { ChatInteraction, BaseInteraction } from '@/shared/types/interactions';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import { useSearchParams } from 'react-router-dom';

interface InteractionViewRpProps {
  interaction: ChatInteraction;
  onInteractionClick?: (interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
}

const convertLatexDelimiters = (content: string): string => {
  return content
    // 转换行内公式
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')
    // 转换块级公式
    .replace(/\\\[(.*?)\\\]/g, '$$$1$$')
}

export default function InteractionViewRp({ interaction, onInteractionClick, onInteractionExpand }: InteractionViewRpProps) {
  const processedContent = convertLatexDelimiters(interaction.userContent);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick: React.MouseEventHandler = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link) {
      onInteractionExpand?.(interaction, link.href);
    } else {
      onInteractionClick?.(interaction, null);
    }
  }, [onInteractionClick]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 2,
        px: 2,
        width: "100%",
        position: "relative",
      }}
      onClick={handleClick}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <IconButton
          aria-label="expand"
          onClick={(e) => {
            e.stopPropagation();
            onInteractionExpand?.(interaction, null);
          }}
        >
          <ForkLeftIcon />
        </IconButton>
      </Box>
      {/* 用户输入内容的气泡 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          mb: 1,
          position: "relative",
        }}
      >
        <Paper
          elevation={1}
          sx={{
            maxWidth: "60%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 2,
            borderTopRightRadius: 0,
            px: 2,
            py: 1,
            "& .markdown-body": {
              "& pre": {
                background: "rgba(0, 0, 0, 0.1)",
                padding: 1,
                borderRadius: 1,
              },
              "& code": {
                background: "rgba(0, 0, 0, 0.1)",
                padding: "2px 4px",
                borderRadius: 1,
              },
              "& a": {
                color: "inherit",
                textDecoration: "underline",
              },
              "& img": {
                maxWidth: "100%",
                height: "auto",
              },
            },
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
            sx={{
              opacity: 0.7,
              mt: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {new Date(interaction.createdAt).toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* 对方回复内容的气泡 */}
      {interaction.type === "chat" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mb: 1,
            position: "relative",
          }}
        >
          <Paper
            elevation={1}
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              color: "text.primary",
              borderRadius: 2,
              borderTopLeftRadius: 0,
              px: 2,
              py: 1,
              "& .markdown-body": {
                "& pre": {
                  background: "rgba(0, 0, 0, 0.1)",
                  padding: 1,
                  borderRadius: 1,
                },
                "& code": {
                  background: "rgba(0, 0, 0, 0.1)",
                  padding: "2px 4px",
                  borderRadius: 1,
                },
                "& a": {
                  color: "inherit",
                  textDecoration: "underline",
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                },
              },
            }}
          >
            <Box className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {interaction.assistantContent}
              </ReactMarkdown>
            </Box>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                mt: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {new Date(interaction.updatedAt).toLocaleString()}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

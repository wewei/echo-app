import React, { useCallback } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { ChatInteraction } from '@/shared/types/interactionsV2';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { useSearchParams } from 'react-router-dom';

interface InteractionViewRpProps {
  interaction: ChatInteraction;
  onLinkClicked?: (contextId: number, url: string) => void;
}

const convertLatexDelimiters = (content: string): string => {
  return content
    // 转换行内公式
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')
    // 转换块级公式
    .replace(/\\\[(.*?)\\\]/g, '$$$1$$')
}

export default function InteractionViewRp({ interaction, onLinkClicked }: InteractionViewRpProps) {
  const processedContent = convertLatexDelimiters(interaction.userContent);
  const [, setSearchParams] = useSearchParams();

  const handleClick: React.MouseEventHandler = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link) {
      e.preventDefault();
      console.log("handleClick link = ", link.href, ", interaction =", interaction);
      onLinkClicked?.(interaction.id, link.href);
    }
  }, [onLinkClicked]);

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
          onClick={() =>
            setSearchParams({ interactionId: String(interaction.id) })
          }
        >
          <OpenInFullIcon />
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

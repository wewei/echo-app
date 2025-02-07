import React, { useRef, useEffect, useState } from 'react'
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { Message } from "../../../shared/types/message";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { Link } from '@mui/material'

interface Props {
  messages: Message[];
  streamingMessage?: Message | null;
  onLinkClick?: (url: string) => void;
  loading?: boolean;
}

function MessageItem({
  message,
  isStreaming,
  onLinkClick,
}: {
  message: Message;
  isStreaming: boolean;
  onLinkClick?: (url: string) => void;
}) {
  return (
    <Box
      key={message.uuid}
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        opacity: isStreaming ? 0.7 : 1,
      }}
    >
      <Avatar
        sx={{
          bgcolor:
            message.sender === "agent" ? "primary.main" : "secondary.main",
        }}
      >
        {message.sender === "agent" ? (
          isStreaming ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <SmartToyIcon />
          )
        ) : (
          <PersonIcon />
        )}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="body1"
          component="div"
          sx={{
            "& p": { m: 0 },
            "& p + p": { mt: 1 },
            "& a": {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },
            "& pre": {
              p: 1,
              borderRadius: 1,
              bgcolor: 'action.hover',
              overflow: 'auto'
            },
            "& code": {
              fontFamily: 'monospace',
              bgcolor: 'action.hover',
              p: 0.5,
              borderRadius: 0.5,
            }
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <Link
                  component="a"
                  onClick={(e) => {
                    e.preventDefault()
                    onLinkClick?.(props.href || '')
                  }}
                  {...props}
                />
              ),
            }}
          >
            {message.content || " "}
          </ReactMarkdown>
        </Typography>
      </Box>
    </Box>
  );
}

export default function MessageList({ messages, streamingMessage, onLinkClick, loading }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const lastMessageLengthRef = useRef(0)

  // 检查是否在底部附近
  const isNearBottom = () => {
    const container = containerRef.current
    if (!container) return true

    const threshold = 100 // 距离底部100px以内都认为是在底部
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
  }

  // 处理滚动事件
  const handleScroll = () => {
    setShouldAutoScroll(isNearBottom())
  }

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    // 只在以下情况自动滚动：
    // 1. shouldAutoScroll 为 true（用户没有手动滚动上去）
    // 2. 消息数量增加或最后一条消息长度变化（正在流式响应）
    const lastMessage = messages[messages.length - 1]
    const lastMessageLength = lastMessage?.content.length || 0
    
    if (shouldAutoScroll && (
      messages.length > lastMessageLengthRef.current ||
      lastMessageLength > lastMessageLengthRef.current
    )) {
      scrollToBottom()
    }
    
    // 更新最后消息的长度
    lastMessageLengthRef.current = lastMessageLength
  }, [messages, shouldAutoScroll])

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((message) => (
        <MessageItem 
          message={message} 
          isStreaming={false} 
          key={message.uuid}
          onLinkClick={onLinkClick}
        />
      ))}
      {streamingMessage && (
        <MessageItem
          message={streamingMessage}
          isStreaming={true}
          key={streamingMessage.uuid}
          onLinkClick={onLinkClick}
        />
      )}
      <div ref={messagesEndRef} style={{ height: 20 }} />
      {loading && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );
} 
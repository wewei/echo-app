import React, { useState, useRef, useEffect } from 'react'
import { Box, Alert, Collapse } from '@mui/material'
import { Message } from '../../shared/types/chat'
import { Profile } from '../../shared/types/profile'
import { useTranslation } from 'react-i18next'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

interface Props {
  profile: Profile
}

export default function ChatPanel({ profile }: Props) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamCleanupRef = useRef<(() => void) | null>(null)

  // 清理流式响应
  useEffect(() => {
    return () => {
      if (streamCleanupRef.current) {
        streamCleanupRef.current()
      }
    }
  }, [])

  const handleSend = async (content: string) => {
    setError(null)

    // 添加用户消息
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])

    // 创建一个空的助手消息用于流式更新
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, assistantMessage])
    setIsStreaming(true)

    try {
      // 开始流式响应
      streamCleanupRef.current = window.electron.chat.stream(
        profile,
        [...messages, userMessage],
        // 处理增量更新
        (delta: string) => {
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            last.content += delta
            return updated
          })
        },
        // 处理完成
        (response) => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = response.message
            return updated
          })
          setIsStreaming(false)
        },
        // 处理错误
        (error: Error) => {
          console.error('Stream error:', error)
          setError(error.message)
          setIsStreaming(false)
          // 移除错误的助手消息
          setMessages(prev => prev.slice(0, -1))
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsStreaming(false)
      // 移除错误的助手消息
      setMessages(prev => prev.slice(0, -1))
    }
  }

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxWidth: 800,
      mx: 'auto',
      width: '100%'
    }}>
      <Collapse in={!!error}>
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error || t('chat.error.unknown')}
        </Alert>
      </Collapse>
      <MessageList 
        messages={messages} 
        isStreaming={isStreaming}
      />
      <MessageInput 
        onSend={handleSend} 
        disabled={isStreaming}
      />
    </Box>
  )
} 
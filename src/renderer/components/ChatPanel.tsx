import React, { useState, useRef, useEffect } from 'react'
import { Box, Alert, Collapse } from '@mui/material'
import { Message } from '../../shared/types/message'
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

  // 加载历史消息
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const history = await window.electron.message.query(profile.id, {
          take: 50,  // 最近50条消息
          skip: 0
        })
        setMessages(history)
      } catch (err) {
        console.error('Failed to load messages:', err)
        setError(t('chat.error.loadHistory'))
      }
    }
    
    loadMessages()
  }, [profile.id, t])

  const handleSend = async (content: string) => {
    setError(null)

    try {
      // 添加用户消息
      const userMessage: Omit<Message, 'id'> = {
        sender: 'user',
        content,
        timestamp: Date.now(),
      }
      const userMessageId = await window.electron.message.add(profile.id, userMessage)
      const savedUserMessage = { ...userMessage, id: userMessageId }

      // 创建一个临时的助手消息用于流式更新
      const assistantMessage: Message = {
        id: -1, // 临时ID
        sender: 'agent',
        content: '',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, savedUserMessage, assistantMessage])
      setIsStreaming(true)

      // 开始流式响应
      streamCleanupRef.current = window.electron.chat.stream(
        profile,
        [...messages, savedUserMessage].map(msg => ({
          id: msg.id?.toString() || crypto.randomUUID(),
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp
        })),
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
        async (response) => {
          // 保存完整的助手消息
          const assistantMessage: Omit<Message, 'id'> = {
            sender: 'agent',
            content: response.message.content,
            timestamp: response.message.timestamp,
          }
          const assistantMessageId = await window.electron.message.add(profile.id, assistantMessage)
          
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { ...assistantMessage, id: assistantMessageId }
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
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Box, Alert, Collapse } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { CHAT_SETTINGS, ChatSettingsSchema } from '../../shared/types/chatSettings'
import type { Message } from '../../shared/types/message'
import type { Profile } from '../../shared/types/profile'
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
  const cancelStreamRef = useRef<(() => void) | null>(null)

  // 加载历史消息
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const history = await window.electron.message.query(profile.id, {
          take: 50,  // 最近50条消息
          skip: 0
        })
        setMessages(history.reverse())
      } catch (err) {
        console.error('Failed to load messages:', err)
        setError(t('chat.error.loadHistory'))
      }
    }
    
    loadMessages()
  }, [profile.id, t])

  const handleSend = useCallback(async (content: string) => {
    setError(null)
    if (cancelStreamRef.current) {
      cancelStreamRef.current()
      cancelStreamRef.current = null
    }

    try {
      // 添加用户消息
      const userMessage: Message = {
        uuid: uuidv4(),
        sender: 'user',
        content,
        timestamp: Date.now(),
      }
      await window.electron.message.add(profile.id, userMessage)
      const assistantMessageId = uuidv4()

      // 创建一个临时的助手消息用于流式更新
      setMessages(prev => [...prev, userMessage, {
        uuid: assistantMessageId,
        sender: 'agent',
        content: '',
        timestamp: Date.now(),
      }])
      setIsStreaming(true)

      const chatSettings = ChatSettingsSchema.parse(await window.electron.settings.read(profile.id, CHAT_SETTINGS))
      const { model } = chatSettings[chatSettings.provider]

      // 开始流式响应
      cancelStreamRef.current = window.electron.chat.stream(
        profile.id,
        {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          model,
          stream: true,
        },
        (chunk) => {
          setMessages(prev => {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              last.content += content
              return updated
            }
            return prev
          })
        },
        // 处理完成
        async () => {
          // 保存完整的助手消息
          setMessages(prev => {
            const updated = prev.map(msg => {
              if (msg.uuid === assistantMessageId) {
                window.electron.message.add(profile.id, msg)
                return {
                  ...msg,
                  content: msg.content,
                  timestamp: Date.now(),
                }
              }
              return msg
            })
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
  }, [profile.id, messages, cancelStreamRef.current])

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
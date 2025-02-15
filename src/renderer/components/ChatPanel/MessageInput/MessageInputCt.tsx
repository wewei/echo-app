import React, { useState, KeyboardEvent, useCallback } from 'react'
import MessageInputRp from './MessageInputRp'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInputCt({
  onSend,
  disabled = false,
  placeholder = ''
}: Props) {
  const [message, setMessage] = useState('')

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }, [message, disabled, onSend])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <MessageInputRp
      message={message}
      onMessageChange={setMessage}
      onSend={handleSend}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={placeholder}
    />
  )
} 
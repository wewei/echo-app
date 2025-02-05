import React, { useState, KeyboardEvent } from 'react'
import { Box, TextField, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useTranslation } from 'react-i18next'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: Props) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')

  const handleSend = () => {
    if (content.trim()) {
      onSend(content.trim())
      setContent('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box sx={{ 
      p: 2,
      borderTop: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ 
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end'
      }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={t('chat.inputPlaceholder')}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={disabled || !content.trim()}
          sx={{ p: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
} 
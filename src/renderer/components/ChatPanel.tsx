import { Box, Paper, TextField, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import React, { useState } from 'react'
import { Profile } from '../../shared/types/profile'
import MessageList from './MessageList'

interface Props {
  profile: Profile
}

export default function ChatPanel({ profile }: Props) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return
    // TODO: 发送消息的逻辑
    setMessage('')
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      gap: 2
    }}>
      <Paper sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        p: 2
      }}>
        <MessageList profileId={profile.id} />
      </Paper>
      
      <Box sx={{ 
        display: 'flex',
        gap: 1
      }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="输入消息..."
        />
        <IconButton 
          onClick={handleSend}
          disabled={!message.trim()}
          sx={{ alignSelf: 'flex-end' }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
} 
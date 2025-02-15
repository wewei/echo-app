import React, { KeyboardEvent } from 'react'
import { Box, TextField, IconButton, styled } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

interface Props {
  message: string
  onMessageChange: (message: string) => void
  onSend: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  disabled?: boolean
  placeholder?: string
}

const Container = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '8px'
})

const StyledTextField = styled(TextField)({
  flexGrow: 1,
  '& .MuiInputBase-root': {
    borderRadius: '8px'
  }
})

export default function MessageInputRp({
  message,
  onMessageChange,
  onSend,
  onKeyDown,
  disabled = false,
  placeholder = ''
}: Props) {
  return (
    <Container>
      <StyledTextField
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        variant="outlined"
        size="small"
      />
      <IconButton
        onClick={onSend}
        disabled={disabled || !message.trim()}
        color="primary"
      >
        <SendIcon />
      </IconButton>
    </Container>
  )
} 
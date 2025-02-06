import React, { useState, useRef } from 'react'
import { Box, IconButton, Fade } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

type ViewMode = 'split' | 'chat' | 'browse'

interface Props {
  contextUrl?: string
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  onNavigate?: (url: string) => void
}

export default function SplitView({ contextUrl, leftContent, rightContent, onNavigate }: Props) {
  const [mode, setMode] = useState<ViewMode>(contextUrl ? 'split' : 'chat')
  
  const handleToggleLeft = () => {
    setMode(prev => prev === 'chat' ? 'split' : 'chat')
  }

  const handleToggleRight = () => {
    setMode(prev => prev === 'browse' ? 'split' : 'browse')
  }

  // 当有新的链接时，自动展开左侧面板
  React.useEffect(() => {
    if (contextUrl && mode === 'chat') {
      setMode('split')
    }
  }, [contextUrl])

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%',
      position: 'relative'
    }}>
      {/* 左侧内容 */}
      <Box sx={{
        width: mode === 'browse' ? '100%' : mode === 'chat' ? 0 : '50%',
        transition: 'width 0.3s ease',
        borderRight: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        flexShrink: 0,
      }}>
        <Fade in={mode !== 'chat'} timeout={300}>
          <Box sx={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            visibility: mode === 'chat' ? 'hidden' : 'visible',
            opacity: mode === 'chat' ? 0 : 1,
            transition: 'visibility 0.3s, opacity 0.3s',
          }}>
            {leftContent}
          </Box>
        </Fade>
        <IconButton
          onClick={handleToggleLeft}
          sx={{
            position: 'absolute',
            right: '-20px',
            top: '40%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          {mode === 'chat' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* 右侧内容 */}
      <Box sx={{
        width: mode === 'chat' ? '100%' : mode === 'browse' ? 0 : '50%',
        transition: 'width 0.3s ease',
        position: 'relative',
        flexShrink: 0,
      }}>
        <Fade in={mode !== 'browse'} timeout={300}>
          <Box sx={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            visibility: mode === 'browse' ? 'hidden' : 'visible',
            opacity: mode === 'browse' ? 0 : 1,
            transition: 'visibility 0.3s, opacity 0.3s',
          }}>
            {rightContent}
          </Box>
        </Fade>
        <IconButton
          onClick={handleToggleRight}
          sx={{
            position: 'absolute',
            left: '-20px',
            top: '60%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          {mode === 'browse' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
    </Box>
  )
} 
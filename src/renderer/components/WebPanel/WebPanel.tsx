import React, { useRef } from 'react'
import { Box } from '@mui/material'

const WebPanel = ({ contextUrl }: { contextUrl: string }) => {
  const webviewRef = useRef<HTMLWebViewElement>(null)

    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        bgcolor: 'background.paper',
        '& webview': {
          width: '100%',
          height: '100%',
          bgcolor: 'background.paper',
          opacity: 0.95,
        }
      }}>
        <webview
          ref={webviewRef}
          src={contextUrl || ''}
          style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: 'white'
          }}
        />
      </Box>
    )
  }

export default WebPanel;
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';

interface WebPanelProps {
  url?: string;
  tabId: string;
  onTitleChange?: (tabId: string, title: string) => void;
}

const WebPanel: React.FC<WebPanelProps> = (props) => {
  const [searchParams] = useSearchParams();

  const url = props.url || searchParams.get('url') || '';

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <webview
        src={url}
        style={{ width: '100%', height: '100%' }}
        ref={(webview: any) => {
          if (webview) {
            webview.removeEventListener('page-title-updated', () => {});
            webview.addEventListener('page-title-updated', (e: any) => {
              props.onTitleChange?.(props.tabId, e.title);
            });
          }
        }}
      />
    </Box>
  );
};

export default WebPanel;
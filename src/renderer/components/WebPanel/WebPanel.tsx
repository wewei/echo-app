import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';

interface WebPanelProps {
  url?: string;
  tabId: string;
  onTitleChange?: (tabId: string, title: string) => void;
}

const WebPanel: React.FC<WebPanelProps> = (props) => {
  const [searchParams] = useSearchParams();
  const webviewRef = useRef<any>(null);

  const url = props.url || searchParams.get('url') || '';

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleTitleUpdate = (e: any) => {
      props.onTitleChange?.(props.tabId, e.title);
    };

    webview.addEventListener('page-title-updated', handleTitleUpdate);
    return () => {
      webview.removeEventListener('page-title-updated', handleTitleUpdate);
    };
  }, [props.tabId, props.onTitleChange]);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <webview
        src={url}
        style={{ width: '100%', height: '100%' }}
        ref={webviewRef}
      />
    </Box>
  );
}

export default WebPanel;
import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import WebViewPool from './WebViewPool';

interface WebPanelProps {
  url: string;
  tabId: string;
  onTitleChange?: (tabId: string, title: string) => void;
}

const WebPanel: React.FC<WebPanelProps> = (props) => {
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const webviewPool = WebViewPool.getInstance({ maxSize: 3 });

  const url = props.url || searchParams.get('url') || '';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const webview = webviewPool.getWebView(props.tabId, url);
    container.innerHTML = '';
    container.appendChild(webview);

    const handleTitleUpdate = (e: any) => {
      props.onTitleChange?.(props.tabId, e.title);
    };

    webview.addEventListener('page-title-updated', handleTitleUpdate);
    return () => {
      webview.removeEventListener('page-title-updated', handleTitleUpdate);
    };
  }, [props.tabId]);


  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <webview
        src={url}
        style={{ width: '100%', height: '100%' }}
        ref={containerRef}
    />
    </Box>
  );
}

export default WebPanel;
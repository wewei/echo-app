import React, { useCallback } from 'react';
import { Box, styled } from '@mui/material';
import { Query, Response } from '@/shared/types/interactions';
import InteractionList from './InteractionList';
import MessageInput from './MessageInput';

interface Props {
  queries: Query[]
  onResponseClick?: (response: Response) => void
  handleLinkClick?: (url: string) => void
  onSendMessage: (message: string) => void
  loadMore: (() => void) | null
  hasMore: boolean
  disabled: boolean
}

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden'
});

const InteractionListContainer = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
  marginBottom: '16px'
});

const InputContainer = styled(Box)({
  padding: '16px',
  borderTop: '1px solid rgba(0, 0, 0, 0.12)'
});

export default function ChatPanelRp({
  queries,
  onResponseClick,
  handleLinkClick,
  onSendMessage,
  loadMore,
  hasMore,
  disabled
}: Props) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link) {
      e.preventDefault();
      handleLinkClick?.(link.href);
    }
  }, [handleLinkClick]);

  return (
    <Container onClick={handleClick}>
      <InteractionListContainer>
        <InteractionList
          contextId={undefined} // Pass appropriate contextId if needed
        />
      </InteractionListContainer>
      <InputContainer>
        <MessageInput
          onSend={onSendMessage} 
          disabled={disabled}
          placeholder="输入消息..."
        />
      </InputContainer>
    </Container>
  );
}

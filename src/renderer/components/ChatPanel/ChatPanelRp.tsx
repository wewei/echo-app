import React from 'react';
import { Box, styled } from '@mui/material';
import { Query } from '@/shared/types/interactions';
import QueryList from './QueryList';
import MessageInput from './MessageInput';

interface Props {
  queries: Query[]
  onQueryClick?: (queryId: string) => void
  onSendMessage: (message: string) => void
  loadMore: (() => void) | null
  hasMore: boolean
  disabled?: boolean
}

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden'
});

const QueryListContainer = styled(Box)({
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
  onQueryClick,
  onSendMessage,
  loadMore,
  hasMore,
  disabled = false
}: Props) {
  return (
    <Container>
      <QueryListContainer>
        <QueryList
          queries={queries}
          onQueryClick={onQueryClick}
          loadMore={loadMore}
          hasMore={hasMore}
        />
      </QueryListContainer>
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

import React from 'react';
import { Box, styled } from '@mui/material';
import InteractionList from './InteractionList';
import MessageInput from './MessageInput';

interface Props {
  onLinkClicked?: (contextId: number, url: string) => void;
  onSendMessage: (message: string) => void
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
  onLinkClicked,
  onSendMessage,
  disabled
}: Props) {


  return (
    <Container>
      <InteractionListContainer>
        <InteractionList
          contextId={undefined} // Pass appropriate contextId if needed
          onLinkClicked={onLinkClicked}
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

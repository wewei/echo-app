import React from 'react';
import { Box, styled, TextField } from '@mui/material';
import InteractionList from './InteractionList';
import { BaseInteraction } from '@/shared/types/interactions';
import MessageInput from './MessageInput';

interface Props {
  contextId: number | null
  onInteractionClick?: (interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
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
  contextId,
  onSendMessage,
  onInteractionClick,
  onInteractionExpand,
  disabled
}: Props) {


  return (
    <Container>
      <InteractionListContainer>
        <InteractionList
          contextId={contextId} // Pass appropriate contextId if needed
          onInteractionClick={onInteractionClick}
          onInteractionExpand={onInteractionExpand}
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

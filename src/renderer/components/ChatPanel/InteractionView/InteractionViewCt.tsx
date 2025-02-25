/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import InteractionViewRp from './InteractionViewRp';
import { BaseInteraction } from '@/shared/types/interactions';
import { isEntityReady } from '@/renderer/data/entity';
import Loading from '@/renderer/components/Loading';
import { useChatState } from '@/renderer/data/interactions';
interface InteractionViewCtProps {
  interaction: BaseInteraction;
  onLinkClicked?: (contextId: number, url: string) => void;
}

const ChatInteractionView = ({ interaction, onLinkClicked }: {
  interaction: BaseInteraction;
  onLinkClicked?: (contextId: number, url: string) => void;
}) => {
  const chatState = useChatState(interaction.id)
  return isEntityReady(chatState) ?
    <InteractionViewRp 
      interaction={ { ...interaction, ...chatState, type: 'chat' } } 
      onLinkClicked={onLinkClicked}
    />
  : <Loading />
}

export default function InteractionViewCt({ interaction, onLinkClicked }: InteractionViewCtProps) {
  if (interaction.type === 'chat') {
    return <ChatInteractionView interaction={interaction} onLinkClicked={onLinkClicked} />
  }
  return null
}

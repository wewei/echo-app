/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import InteractionViewRp from './InteractionViewRp';
import { BaseInteraction } from '@/shared/types/interactions';
import { isEntityReady } from '@/renderer/data/entity';
import Loading from '@/renderer/components/Loading';
import { useChatState } from '@/renderer/data/interactions';
interface InteractionViewCtProps {
  interaction: BaseInteraction;
  onInteractionClick?: (interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
  onLinkClicked?: (contextId: number, url: string) => void;
}

const ChatInteractionView = ({ interaction, onInteractionClick, onInteractionExpand }: {
  interaction: BaseInteraction;
  onInteractionClick?: (interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
}) => {
  const chatState = useChatState(interaction.id)
  return isEntityReady(chatState) ?
    <InteractionViewRp 
      interaction={ { ...interaction, ...chatState, type: 'chat' } } 
      onInteractionClick={onInteractionClick}
      onInteractionExpand={onInteractionExpand}
    />
  : <Loading />
}

export default function InteractionViewCt({ interaction, onInteractionClick, onInteractionExpand }: InteractionViewCtProps) {
  if (interaction.type === 'chat') {
    return <ChatInteractionView interaction={interaction} onInteractionClick={onInteractionClick} onInteractionExpand={onInteractionExpand} />
  }
  return null
}

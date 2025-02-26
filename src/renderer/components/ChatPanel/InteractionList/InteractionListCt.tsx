import React from 'react';
import InteractionListRp from './InteractionListRp';
import { useChats } from '@/renderer/data/interactions';
import { BaseInteraction } from '@/shared/types/interactions';

interface InteractionListCtProps {
  contextId?: number;
  onInteractionClick?: (interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
}

export default function InteractionListCt({ contextId, onInteractionClick, onInteractionExpand }: InteractionListCtProps) {
  const recentChats = useChats(contextId);

  console.log("recentChats = ", recentChats);
  return (
    <InteractionListRp
      interactions={recentChats.items}
      hasMore={recentChats.hasMore}
      loadMore={recentChats.loadMore}
      onInteractionClick={onInteractionClick}
      onInteractionExpand={onInteractionExpand}
    />
  );
}

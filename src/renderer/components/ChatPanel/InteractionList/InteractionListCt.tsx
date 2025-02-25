import React from 'react';
import InteractionListRp from './InteractionListRp';
import { useRecentChats } from '@/renderer/data/interactions';

interface InteractionListCtProps {
  contextId?: number;
  onLinkClicked?: (contextId: number, url: string) => void;
}

export default function InteractionListCt({ contextId, onLinkClicked }: InteractionListCtProps) {
  const recentChats = useRecentChats(contextId);

  return (
    <InteractionListRp
      interactions={recentChats.items}
      hasMore={recentChats.hasMore}
      loadMore={recentChats.loadMore}
      onLinkClicked={onLinkClicked}
    />
  );
}

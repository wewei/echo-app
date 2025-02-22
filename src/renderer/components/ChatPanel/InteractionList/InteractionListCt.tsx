import React from 'react';
import InteractionListRp from './InteractionListRp';
import { useRecentChatInteractions, useRecentInteractions } from '../../../data/interactionsV2';

interface InteractionListCtProps {
  contextId?: number;
}

export default function InteractionListCt({ contextId }: InteractionListCtProps) {
  const { items: interactions, hasMore, loadMore } = useRecentChatInteractions(contextId);

  return (
    <InteractionListRp
      interactions={interactions}
      hasMore={hasMore}
      loadMore={loadMore}
    />
  );
}

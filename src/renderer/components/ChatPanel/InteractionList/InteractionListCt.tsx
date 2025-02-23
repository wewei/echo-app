import React from 'react';
import InteractionListRp from './InteractionListRp';
import { useRecentChatInteractions, useRecentInteractions } from '../../../data/interactionsV2';

interface InteractionListCtProps {
  contextId?: number;
  onLinkClicked?: (contextId: number, url: string) => void;
}

export default function InteractionListCt({ contextId, onLinkClicked }: InteractionListCtProps) {
  const { items: interactions, hasMore, loadMore } = useRecentChatInteractions(contextId);
  console.log("InteractionListCt interactions =", interactions, ", hasMore =", hasMore);

  return (
    <InteractionListRp
      interactions={interactions}
      hasMore={hasMore}
      loadMore={loadMore}
      onLinkClicked={onLinkClicked}
    />
  );
}

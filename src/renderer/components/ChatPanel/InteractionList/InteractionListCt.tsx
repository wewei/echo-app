import React from 'react';
import InteractionListRp from './InteractionListRp';
import { useRecentInteractions } from '../../../data/interaction2';

interface InteractionListCtProps {
  contextId?: number;
}

export default function InteractionListCt({ contextId }: InteractionListCtProps) {
  const { items: interactions, hasMore, loadMore } = useRecentInteractions(contextId);

  return (
    <InteractionListRp
      interactions={interactions}
      hasMore={hasMore}
      loadMore={loadMore}
    />
  );
}

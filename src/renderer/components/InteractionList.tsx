import React, { useEffect, useRef, useState } from 'react';
import { Box, List, ListItem } from '@mui/material';
import { Interaction } from '@/shared/types/interactionsV2';
import { useRecentInteractions } from '../data/interaction2';

interface InteractionListProps {
  contextId?: number;
}

export default function InteractionList({ contextId }: InteractionListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { items: interactions, hasMore, loadMore } = useRecentInteractions(contextId);
  const [stayAtBottom, setStayAtBottom] = useState(true);

  useEffect(() => {
    if (stayAtBottom && listRef.current) {
      const elem = listRef.current;
      const callback = () => {
        elem.scrollTop = elem.scrollHeight;
      };
      const mutationObserver = new MutationObserver(callback);
      mutationObserver.observe(elem, { childList: true, subtree: true });
      return () => {
        mutationObserver.disconnect();
      };
    }
  }, [stayAtBottom, listRef.current]);

  useEffect(() => {
    setStayAtBottom(true);
  }, [interactions]);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setStayAtBottom(isAtBottom);
    if (isAtBottom && hasMore && loadMore) {
      loadMore();
    }
  };

  return (
    <Box ref={listRef} onScroll={handleScroll} sx={{ maxHeight: '400px', overflow: 'auto' }}>
      <List>
        {interactions.map((interaction) => (
          <ListItem key={interaction.id}>
            {/* You can customize the display of each interaction here */}
            <div>
              <p>Type: {interaction.type}</p>
              <p>User Content: {interaction.userContent}</p>
              <p>Created At: {new Date(interaction.createdAt).toLocaleString()}</p>
            </div>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

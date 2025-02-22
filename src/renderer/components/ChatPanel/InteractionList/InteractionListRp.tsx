import React, { useEffect, useRef, useState } from 'react';
import { Box, List, ListItem } from '@mui/material';
import { ChatInteraction } from '@/shared/types/interactionsV2';
import InteractionView from '../InteractionView/';

interface InteractionListRpProps {
  interactions: ChatInteraction[];
  hasMore: boolean;
  loadMore: (() => void) | null;
}

export default function InteractionListRp({ interactions, hasMore, loadMore }: InteractionListRpProps) {
  const listRef = useRef<HTMLDivElement>(null);
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
    <Box ref={listRef} onScroll={handleScroll} sx={{
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
        opacity: 0,
        transition: 'opacity 0.3s',
      },
      '&:hover::-webkit-scrollbar': {
        opacity: 1,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
    }} >
      <List>
        {interactions.map((interaction) => (
          <ListItem key={interaction.id}>
            <InteractionView interaction={interaction} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

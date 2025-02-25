import React, { useEffect, useRef, useState } from 'react';
import { BaseInteraction } from '@/shared/types/interactions';
import { Box, List, ListItem, Button } from '@mui/material';
import InteractionView from '../InteractionView/';

interface InteractionListRpProps {
  interactions: BaseInteraction[];
  hasMore: boolean;
  loadMore: (() => void) | null;
  onInteractionClick?: (interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
}

export default function InteractionListRp({ interactions, hasMore, loadMore, onInteractionClick, onInteractionExpand }: InteractionListRpProps) {
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
            <InteractionView interaction={interaction} onInteractionClick={onInteractionClick} onInteractionExpand={onInteractionExpand} />
          </ListItem>
        )).reverse()}
      </List>
      {hasMore && loadMore && (
        <Button onClick={loadMore}>Load more</Button>
      )}
    </Box>
  );
}

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

  const [scrolling, setScrolling] = useState(false);
  const timeoutRef = useRef(null);

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

    setScrolling(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setScrolling(false), 1000);
  };

  return (
    <Box ref={listRef} onScroll={handleScroll}>
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

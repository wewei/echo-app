import React, { useEffect, useRef, useState } from 'react'
import { Box, List, ListItem } from '@mui/material'
import QueryView from '../QueryView'
import { Query, Response } from '@/shared/types/interactions'

interface QueryListRpProps {
  queries: Query[]
  onResponseClick?: (response: Response) => void
  loadMore: (() => void) | null
  hasMore: boolean
}

export default function QueryListRp({ 
  queries,
  onResponseClick,
}: QueryListRpProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [stayAtBottom, setStayAtBottom] = useState(true)

  useEffect(() => {
    if (stayAtBottom && listRef.current) {
      const elem = listRef.current
      const callback = () => {
        elem.scrollTop = elem.scrollHeight
      }
      const mutationObserver = new MutationObserver(callback)
      mutationObserver.observe(elem, { childList: true, subtree: true })
      return () => {
        mutationObserver.disconnect()
      }
    }
  }, [stayAtBottom, listRef.current])

  useEffect(() => {
    setStayAtBottom(true)
  }, [queries])

  // 处理滚动事件
  const handleScroll = () => {
    if (!listRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10

    setStayAtBottom(isAtBottom)
  }

  return (
    <Box 
      ref={listRef}
      onScroll={handleScroll}
      sx={{ 
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        scrollbarGutter: 'stable',
        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'action.hover',
          borderRadius: 4,
        },
      }}
    >
      <List disablePadding>
        {queries.map((query) => (
          <React.Fragment key={query.id}>
            <ListItem disablePadding>
              <Box sx={{ width: '100%' }}>
                <QueryView query={query} onResponseClick={onResponseClick} />
              </Box>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
} 
import React, { useEffect, useRef } from 'react'
import { Box, List, ListItem, Divider, CircularProgress } from '@mui/material'
import { useInView } from 'react-intersection-observer'
import QueryView from '../QueryView'

interface QueryListRpProps {
  queryIds: string[]
  onQueryClick?: (queryId: string) => void
  loadMore: (() => void) | null
  hasMore: boolean
}

export default function QueryListRp({ 
  queryIds,
  onQueryClick,
  loadMore,
  hasMore
}: QueryListRpProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  })

  // 首次渲染时滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [])

  // 当 Loading Placeholder 可见时触发加载
  useEffect(() => {
    if (inView && loadMore) {
      loadMore()
    }
  }, [inView, loadMore])

  return (
    <Box 
      ref={listRef}
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
      {/* Loading Placeholder */}
      {loadMore && (
        <Box 
          ref={loadMoreRef}
          sx={{ 
            p: 2,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Query List */}
      <List disablePadding>
        {queryIds.map((queryId, index) => (
          <React.Fragment key={queryId}>
            <ListItem 
              disablePadding
              onClick={() => onQueryClick?.(queryId)}
              sx={{
                cursor: onQueryClick ? 'pointer' : 'default',
                '&:hover': onQueryClick ? {
                  bgcolor: 'action.hover'
                } : undefined
              }}
            >
              <Box sx={{ width: '100%' }}>
                <QueryView queryId={queryId} />
              </Box>
            </ListItem>
            {index < queryIds.length - 1 && (
              <Divider component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
} 
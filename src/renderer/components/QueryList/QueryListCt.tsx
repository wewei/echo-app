import React, { useEffect } from 'react'
import QueryListRp from './QueryListRp'
import { useRecentQueryIds } from '@/renderer/data/interactions'

interface Props {
  queryIds: string[]
  onQueryClick?: (queryId: string) => void
  loadMore: (() => void) | null
  hasMore: boolean
}

const BATCH_SIZE = 20

export default function QueryListCt({ 
  queryIds,
  onQueryClick,
  loadMore,
  hasMore 
}: Props) {

  return (
    <QueryListRp
      queryIds={queryIds}
      onQueryClick={onQueryClick}
      loadMore={loadMore}
      hasMore={hasMore}
    />
  )
} 
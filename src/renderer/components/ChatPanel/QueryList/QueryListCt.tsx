import React, { useEffect } from 'react'
import QueryListRp from './QueryListRp'
import { Query } from '@/shared/types/interactions'
interface Props {
  queries: Query[]
  onQueryClick?: (queryId: string) => void
  loadMore: (() => void) | null
  hasMore: boolean
}

export default function QueryListCt({ 
  queries,
  onQueryClick,
  loadMore,
  hasMore 
}: Props) {

  return (
    <QueryListRp
      queries={queries}
      onQueryClick={onQueryClick}
      loadMore={loadMore}
      hasMore={hasMore}
    />
  )
} 
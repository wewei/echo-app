import React from 'react'
import QueryListRp from './QueryListRp'
import { Query, Response } from '@/shared/types/interactions'

interface Props {
  queries: Query[]
  onResponseClick?: (response: Response) => void
  loadMore: (() => void) | null
  hasMore: boolean
}

export default function QueryListCt({ 
  queries,
  onResponseClick,
  loadMore,
  hasMore 
}: Props) {

  return (
    <QueryListRp
      queries={queries}
      onResponseClick={onResponseClick}
      loadMore={loadMore}
      hasMore={hasMore}
    />
  )
} 
import React from 'react'
import QueryListRp from './QueryListRp'
import { useRecentQueryIds } from '@/renderer/data/interactions'

interface Props {
  onQueryClick?: (queryId: string) => void
}

const BATCH_SIZE = 20

export default function QueryListCt({ onQueryClick }: Props) {
  const { ids, loadMore } = useRecentQueryIds()

  return (
    <QueryListRp
      queryIds={ids}
      onQueryClick={onQueryClick}
      loadMore={() => loadMore(BATCH_SIZE)}
    />
  )
} 
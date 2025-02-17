import React from 'react'
import QueryViewRp from './QueryViewRp'
import Loading from '@/renderer/components/Loading'
import { isEntityReady } from '@/renderer/data/cachedEntity'
import { Query, Response } from '@/shared/types/interactions'

interface Props {
  query: Query,
  onResponseClick?: (response: Response) => void
}

export default function QueryViewCt({ query, onResponseClick }: Props) {
  return isEntityReady(query) ? <QueryViewRp query={query} onResponseClick={onResponseClick}/> : <Loading />
} 
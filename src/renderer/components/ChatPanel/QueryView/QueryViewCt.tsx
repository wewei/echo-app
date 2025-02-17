import React from 'react'
import QueryViewRp from './QueryViewRp'
import Loading from '@/renderer/components/Loading'
import { isEntityReady } from '@/renderer/data/cachedEntity'
import { Query } from '@/shared/types/interactions'

interface Props {
  query: Query
}

export default function QueryViewCt({ query }: Props) {
  return isEntityReady(query) ? <QueryViewRp query={query} /> : <Loading />
} 
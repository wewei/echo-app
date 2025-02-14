import React from 'react'
import { useQuery } from '@/renderer/data/interactions'
import QueryViewRp from './QueryViewRp'
import Loading from '@/renderer/components/Loading'
import { isEntityReady } from '@/renderer/data/cachedEntity'

interface Props {
  queryId: string
}

export default function QueryViewCt({ queryId }: Props) {
  const query = useQuery(queryId)

  return isEntityReady(query) ? <QueryViewRp query={query} /> : <Loading />
} 
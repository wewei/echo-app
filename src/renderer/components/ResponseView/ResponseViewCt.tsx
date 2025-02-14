import React from 'react'
import { useResponse } from '@/renderer/data/interactions'
import { isEntityReady } from '@/renderer/data/cachedEntity'
import ResponseViewRp from './ResponseViewRp'
import Loading from '@/renderer/components/Loading'

interface Props {
  responseId: string
}

export default function ResponseViewCt({ responseId }: Props) {
  const response = useResponse(responseId)

  return isEntityReady(response) ? (
    <ResponseViewRp response={response} />
  ) : (
    <Loading />
  )
} 
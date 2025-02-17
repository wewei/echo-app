import React from 'react'
import { useResponse } from '@/renderer/data/interactions'
import { isEntityReady } from '@/renderer/data/cachedEntity'
import ResponseViewRp from './ResponseViewRp'
import Loading from '@/renderer/components/Loading'

interface Props {
  responseId: string
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function ResponseViewCt({ responseId, hasPrevious, hasNext, onPrevious, onNext }: Props) {
  const response = useResponse(responseId)

  return isEntityReady(response) ? (
    <ResponseViewRp
      response={response}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  ) : (
    <Loading />
  )
} 
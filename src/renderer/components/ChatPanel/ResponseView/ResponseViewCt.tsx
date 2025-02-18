import React from 'react'
import { useResponse } from '@/renderer/data/interactions'
import { isEntityReady } from '@/renderer/data/cachedEntity'
import ResponseViewRp from './ResponseViewRp'
import Loading from '@/renderer/components/Loading'
import { Response } from '@/shared/types/interactions'

interface Props {
  responseId: string
  onResponseClick?: (response: Response) => void
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function ResponseViewCt({ responseId, onResponseClick, hasPrevious, hasNext, onPrevious, onNext }: Props) {
  const response = useResponse(responseId)

  console.log("ResponseViewCt", response, isEntityReady(response), onResponseClick)
  return isEntityReady(response) ? (
    <ResponseViewRp
      response={response}
      onResponseClick={onResponseClick}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  ) : (
    <Loading />
  )
} 
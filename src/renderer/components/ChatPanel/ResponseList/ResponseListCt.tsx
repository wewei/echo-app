import React, { useState, useEffect } from 'react'
import { useQueryResponseIds } from '@/renderer/data/interactions'
import { isEntityReady } from '@/renderer/data/entity'
import ResponseListRp from './ResponseListRp'
import Loading from '@/renderer/components/Loading'
import { Response } from '@/shared/types/interactions'

interface Props {
  queryId: string,
  onResponseClick?: (response: Response) => void
}

export default function ResponseListCt({ queryId, onResponseClick }: Props) {
  const { items: responseIds } = useQueryResponseIds(queryId)
  const [currentIndex, setCurrentIndex] = useState(0)

  // 当获取到新的 responseIds 时，显示最新的 response
  useEffect(() => {
    if (responseIds.length > 0) {
      setCurrentIndex(responseIds.length - 1)
    }
  }, [responseIds])

  return isEntityReady(responseIds) ? (
    <ResponseListRp
      responseIds={responseIds}
      currentIndex={currentIndex}
      onResponseClick={onResponseClick}
      onPrevious={() => { /* function logic for previous */ }}
      onNext={() => { /* function logic for next */ }}
    />
  ) : (
    <Loading />
  )
}
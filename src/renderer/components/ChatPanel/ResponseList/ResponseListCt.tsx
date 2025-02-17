import React, { useState, useEffect } from 'react'
import { useQueryResponseIds } from '@/renderer/data/interactions'
import { isEntityReady } from '@/renderer/data/cachedEntity'
import ResponseListRp from './ResponseListRp'
import Loading from '@/renderer/components/Loading'

interface Props {
  queryId: string
}

export default function ResponseListCt({ queryId }: Props) {
  const { items: responseIds } = useQueryResponseIds(queryId)
  const [currentIndex, setCurrentIndex] = useState(0)

  // 当获取到新的 responseIds 时，显示最新的 response
  useEffect(() => {
    if (isEntityReady(responseIds) && responseIds.length > 0) {
      setCurrentIndex(responseIds.length - 1)
    }
  }, [responseIds])

  if (!isEntityReady(responseIds)) {
    return <Loading />
  }

  return (
    <ResponseListRp
      responseIds={responseIds}
      currentIndex={currentIndex}
      onPrevious={() => setCurrentIndex(i => i - 1)}
      onNext={() => setCurrentIndex(i => i + 1)}
    />
  )
} 
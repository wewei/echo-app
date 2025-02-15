import React, { useCallback } from 'react'
import { appendResponseContent, createResponse, useRecentQueryIds } from '@/renderer/data/interactions'
import ChatPanelRp from './ChatPanelRp'
import { useCurrentProfileId } from '@/renderer/data/profile'
import { ChatSettingsSchema, CHAT_SETTINGS } from '@/shared/types/chatSettings'
import { useSettings } from '@/renderer/data/settings'

interface Props {
  onQueryClick?: (queryId: string) => void
  disabled?: boolean
}

export default function ChatPanelCt({
  onQueryClick,
  disabled = false
}: Props) {
  const { ids: queryIds, loadMore, hasMore, createQuery } = useRecentQueryIds()
  const profileId = useCurrentProfileId()
  const [chatSettings] = useSettings(profileId, CHAT_SETTINGS, ChatSettingsSchema)
  const model = chatSettings?.[chatSettings?.provider]?.model

  const handleSendMessage = useCallback(async (message: string) => {
    const query = await createQuery({
      content: message,
      contexts: [], // TODO, add the contexts of the query
      type: 'chat',
      timestamp: new Date().getTime()
    })
    const response = await createResponse(profileId, {
      query: query.id,
      content: '',
      agents: 'chat',
      timestamp: new Date().getTime()
    })
    window.electron.chat.stream(
      profileId,
      {
        messages: [{ role: 'user', content: message }],
        model,
      },
      (delta) => {
        console.log(delta.choices[0].delta.content)
        appendResponseContent(profileId, response.id, delta.choices[0].delta.content)
      },
      () => {
        console.log('done')
      },
      (error: Error) => {
        console.error(error)
      }
    )
  }, [createQuery, profileId])

  const handleLoadMore = useCallback(() => {
    if (loadMore) {
      loadMore(10)
    }
  }, [loadMore])

  return (
    <ChatPanelRp
      queryIds={queryIds}
      onQueryClick={onQueryClick}
      onSendMessage={handleSendMessage}
      loadMore={hasMore ? handleLoadMore : null}
      hasMore={hasMore}
      disabled={disabled}
    />
  )
} 
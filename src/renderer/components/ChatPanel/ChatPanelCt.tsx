import React, { useCallback } from 'react'
import { createResponse, useRecentQueries, appendResponseContent, createQuery } from '@/renderer/data/interactions'
import ChatPanelRp from './ChatPanelRp'
import { useCurrentProfileId } from '@/renderer/data/profile'
import { ChatSettingsSchema, CHAT_SETTINGS } from '@/shared/types/chatSettings'
import { useSettings } from '@/renderer/data/settings'

interface Props {
  onQueryClick?: (queryId: string) => void
  handleLinkClick?: (url: string) => void
  disabled?: boolean
}

export default function ChatPanelCt({
  onQueryClick,
  disabled = false
}: Props) {
  const { items: queries, loadMore, hasMore } = useRecentQueries()
  const profileId = useCurrentProfileId()
  const [chatSettings] = useSettings(profileId, CHAT_SETTINGS, ChatSettingsSchema)
  const model = chatSettings?.[chatSettings?.provider]?.model
  console.log("model", model);

  const handleSendMessage = useCallback(async (message: string) => {
    const query = await createQuery(profileId, {
      content: message,
      timestamp: new Date().getTime()
    })
    const response = await createResponse(profileId, {
      queryId: query.id,
      content: '',
      agent: 'chat',
      timestamp: new Date().getTime()
    })
    window.electron.chat.stream(
      profileId,
      {
        messages: [{ role: 'user', content: message }],
        model,
      },
      (delta) => {
        console.log(delta.choices[0]?.delta?.content)
        appendResponseContent(profileId, response.id, delta.choices[0]?.delta?.content)
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
      loadMore()
    }
  }, [loadMore])

  return (
    <ChatPanelRp
      queries={queries}
      onQueryClick={onQueryClick}
      onSendMessage={handleSendMessage}
      loadMore={hasMore ? handleLoadMore : null}
      hasMore={hasMore}
      disabled={disabled}
    />
  )
} 
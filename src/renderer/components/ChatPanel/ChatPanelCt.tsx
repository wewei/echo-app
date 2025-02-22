import React, { useCallback } from 'react'
// import { createResponse, useRecentQueries, appendResponseContent, createQuery } from '@/renderer/data/interactions'
import ChatPanelRp from './ChatPanelRp'
import { useCurrentProfileId } from '@/renderer/data/profile'
import { ChatSettingsSchema, CHAT_SETTINGS } from '@/shared/types/chatSettings'
import { useSettings } from '@/renderer/data/settings'
import { chatAgent } from '@/renderer/agents/chatAgent'
import { Response } from '@/shared/types/interactions';
import { createChatInteraction, appendAssistantContent } from '@/renderer/data/interactionsV2';

interface Props {
  onResponseClick?: (response: Response) => void
  handleLinkClick?: (url: string) => void
  disabled?: boolean
}

export default function ChatPanelCt({
  onResponseClick,
  handleLinkClick,
  disabled = false
}: Props) {
  // const { items: queries, loadMore, hasMore } = useRecentQueries()
  const profileId = useCurrentProfileId()
  const [chatSettings] = useSettings(profileId, CHAT_SETTINGS, ChatSettingsSchema)
  const model = chatSettings?.[chatSettings?.provider]?.model

  const handleSendMessage = useCallback(async (message: string) => {
    // const query = await createQuery(profileId, {
    //   content: message,
    //   timestamp: new Date().getTime()
    // })
    // const response = await createResponse(profileId, {
    //   queryId: query.id,
    //   content: '',
    //   agent: 'chat',
    //   timestamp: new Date().getTime()
    // })
    
    // for await (const chunk of chatAgent({
    //   profileId,
    //   model,
    //   query,
    // })) {
    //   appendResponseContent(profileId, response.id, chunk)
    // }

    const chatInteraction = await createChatInteraction(profileId, {
      type: 'chat',
      model,
      userContent: message,
      contextId: null,
      createdAt: Date.now(),
      assistantContent: '',
      updatedAt: Date.now()
    });

    for await (const chunk of chatAgent({
      profileId,
      model,
      chatInteraction,
    })) {
      console.log('handle chunk', chunk)
      appendAssistantContent(profileId, chatInteraction.id, chunk)
    }
    
  }, [profileId, model])

  const handleLoadMore = useCallback(() => {
    // if (loadMore) {
    //   loadMore()
    // }
  }, [])

  return (
    <ChatPanelRp
      handleLinkClick={handleLinkClick}
      onSendMessage={handleSendMessage}
      // loadMore={hasMore ? handleLoadMore : null}
      // hasMore={hasMore}
      disabled={disabled}
    />
  )
}
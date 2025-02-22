import React, { useCallback } from 'react'
import ChatPanelRp from './ChatPanelRp'
import { useCurrentProfileId } from '@/renderer/data/profile'
import { ChatSettingsSchema, CHAT_SETTINGS } from '@/shared/types/chatSettings'
import { useSettings } from '@/renderer/data/settings'
import { chatAgent } from '@/renderer/agents/chatAgent'
import { createChatInteraction, appendAssistantContent } from '@/renderer/data/interactionsV2';

interface Props {
  onLinkClicked?: (contextId: number, url: string) => void
  disabled?: boolean
}

export default function ChatPanelCt({
  onLinkClicked,
  disabled = false
}: Props) {
  const profileId = useCurrentProfileId()
  const [chatSettings] = useSettings(profileId, CHAT_SETTINGS, ChatSettingsSchema)
  const model = chatSettings?.[chatSettings?.provider]?.model

  const handleSendMessage = useCallback(async (message: string) => {
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
      appendAssistantContent(profileId, chatInteraction.id, chunk)
    }
    
  }, [profileId, model])

  return (
    <ChatPanelRp
      onLinkClicked={onLinkClicked}
      onSendMessage={handleSendMessage}
      disabled={disabled}
    />
  )
}
import React, { useCallback } from 'react'
import ChatPanelRp from './ChatPanelRp'
import { useCurrentProfileId } from '@/renderer/data/profile'
import { ChatSettingsSchema, CHAT_SETTINGS } from '@/shared/types/chatSettings'
import { useSettings } from '@/renderer/data/settings'
import { chatAgent } from '@/renderer/agents/chatAgent'
import { createChatInteraction, appendAssistantContent, createNavInteraction } from '@/renderer/data/interactions';
import { BaseInteraction } from '@/shared/types/interactions';
import { TabItem } from '@/renderer/data/tabState';

interface Props {
  tab: TabItem;
  onInteractionClick?: (interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
  onTabUpdate: (tab: TabItem) => void;
  disabled?: boolean
}

export default function ChatPanelCt({
  tab,
  onInteractionClick,
  onInteractionExpand,
  onTabUpdate,
  disabled = false
}: Props) {
  const profileId = useCurrentProfileId()
  const [chatSettings] = useSettings(profileId, CHAT_SETTINGS, ChatSettingsSchema)
  const model = chatSettings?.[chatSettings?.provider]?.model

  const handleSendMessage = useCallback(async (message: string) => {
    let contextId = tab.contextId;
    if (tab.isTemporaryTab) {
      const nav = await createNavInteraction(profileId, {
        type: 'nav',
        title: message,
        contextId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userContent: '', // 提供适当的值
        description: '', // 提供适当的值
        favIconUrl: '', // 提供适当的值
        imageAssetId: '' // 提供适当的值
      });

      contextId = nav.id;
    }

    onTabUpdate({
      ...tab,
      contextId,
      isTemporaryTab: false
    })

    const chatInteraction = await createChatInteraction(profileId, {
      type: 'chat',
      model,
      userContent: message,
      contextId: contextId,
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
    
  }, [profileId, model, tab.contextId])

  return (
    <ChatPanelRp
      contextId={tab.contextId}
      onSendMessage={handleSendMessage}
      onInteractionClick={onInteractionClick}
      onInteractionExpand={onInteractionExpand}
      disabled={disabled}
    />
  )
}
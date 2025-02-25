import React, { useState } from 'react';
import { Box } from '@mui/material';
import WebPanel from '../WebPanel/WebPanel';
import InteractionView from '@/renderer/components/ChatPanel/InteractionView';
import { isEntityReady } from '@/renderer/data/entity';
import SplitView from '../SplitView';
import ChatPanel from '../ChatPanel';
import { BaseInteraction } from '@/shared/types/interactions';

interface ContentPanelRpProps {
  contextId: number;
  profileId?: string;
  onTitleChange: (id: string, title: string) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
}

export const ContentPanelRp: React.FC<ContentPanelRpProps> = ({
  contextId,
  onTitleChange,
  onInteractionExpand
}) => {
  const [interaction, setInteraction] = useState<BaseInteraction | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const onInteractionClick = (interaction: BaseInteraction, url : string) => {
    console.log("handleLinkClick", interaction, ", url =", url);
    setInteraction(interaction);
    setCurrentUrl(url);
  }

  return (
    <SplitView
      leftContent={<Box sx={{ height: '100%', overflow: 'auto' }}>
      {interaction && isEntityReady(interaction) ? (
        (() => {
          // 如果标签有 context，显示网页
          if (currentUrl !== null) {

            return (
              <WebPanel
                url={currentUrl}
                tabId={interaction.id.toString()}
                onTitleChange={onTitleChange}
              />
            );
          } else if (interaction.type === "chat") {
            return <InteractionView 
              interaction={interaction}
              onInteractionClick={onInteractionClick}
              onInteractionExpand={onInteractionExpand}
            />;
          } 
          
          return null;
        })()
      ) : null}
    </Box>}
      rightContent={<ChatPanel onInteractionClick={onInteractionClick} onInteractionExpand={onInteractionExpand} />}
    />
  );
};

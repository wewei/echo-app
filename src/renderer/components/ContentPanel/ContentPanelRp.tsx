import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import WebPanel from '../WebPanel/WebPanel';
import InteractionView from '@/renderer/components/ChatPanel/InteractionView';
import SplitView from '../SplitView';
import ChatPanel from '../ChatPanel';
import { BaseInteraction } from '@/shared/types/interactions';
import { TabItem } from '@/renderer/data/tabState';

interface ContentPanelRpProps {
  tab: TabItem
  profileId?: string;
  onTitleChange: (id: string, title: string) => void;
  onInteractionClick?: (tab: TabItem, interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
  onTabUpdate: (tab: TabItem) => void;
}

export const ContentPanelRp: React.FC<ContentPanelRpProps> = ({
  tab,
  onTitleChange,
  onInteractionClick,
  onInteractionExpand,
  onTabUpdate
}) => {

  console.log("ContentPanelRpProps render tab", tab);
  return (
    <SplitView
      leftContent={<Box sx={{ height: '100%', overflow: 'auto' }}>
        {tab.displayInfo ? (
          tab.displayInfo.type === 'Link' ? (
            <WebPanel
              url={tab.displayInfo.link}
              tabId={tab.id}
              onTitleChange={onTitleChange}
            />
          ) : (
            tab.displayInfo.chatInteraction ? (
              <InteractionView
                interaction={tab.displayInfo.chatInteraction}
                onInteractionClick={(intersection, url) => {
                  onInteractionClick(tab, intersection, url);
                }}
                onInteractionExpand={onInteractionExpand}
              />
            ) : null
          )
        ) : null}
      </Box>}
      rightContent={
        <ChatPanel
          tab={tab}
          onInteractionClick={(intersection, url) => {
            onInteractionClick(tab, intersection, url);
          }}
          onInteractionExpand={onInteractionExpand}
          onTabUpdate={onTabUpdate} 
        />}
    />
  );
};

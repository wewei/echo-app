import React from 'react';
import { ContentPanelRp } from './ContentPanelRp';
import { BaseInteraction } from '@/shared/types/interactions';
import { TabItem } from '@/renderer/data/tabState';

interface ContentPanelCtProps {
  tab: TabItem;
  onInteractionClick?: (tab: TabItem, interaction: BaseInteraction, url: string | null) => void;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
}


export const ContentPanelCt: React.FC<ContentPanelCtProps> = ({
  tab,
  onInteractionClick,
  onInteractionExpand
}) => {
  return (
    <ContentPanelRp
      tab={tab}
      onTitleChange={() => {}}
      onInteractionClick={onInteractionClick}
      onInteractionExpand={onInteractionExpand}
    />
  );
};

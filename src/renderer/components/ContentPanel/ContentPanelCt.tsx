import React from 'react';
import { ContentPanelRp } from './ContentPanelRp';
import { BaseInteraction } from '@/shared/types/interactions';

interface ContentPanelCtProps {
  contextId: number;
  onInteractionExpand?: (interaction: BaseInteraction, url: string | null) => void;
}


export const ContentPanelCt: React.FC<ContentPanelCtProps> = ({
  contextId,
  onInteractionExpand
}) => {
console.log("ContentPanelCt", contextId);
  return (
    <ContentPanelRp
      contextId={contextId}
      onTitleChange={() => {}}
      onInteractionExpand={onInteractionExpand}
    />
  );
};

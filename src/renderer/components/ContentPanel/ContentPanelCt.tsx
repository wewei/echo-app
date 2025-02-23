import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContentPanelRp } from './ContentPanelRp';
import useContentSession from '@/renderer/data/contentSession';
import { useInteraction } from '@/renderer/data/interactionsV2';
import { isEntityReady } from '@/renderer/data/entity';
import Loading from '../Loading';

export const ContentPanelCt: React.FC = () => {
  const [searchParams] = useSearchParams();

  const {
    contentSession,
    setContentSession,
    handleTabClick,
    handleTabClose,
    handleHiddenTabClick,
    handleTitleChange,
  } = useContentSession();

  useEffect(() => {
    const interactionIdStr = searchParams.get("interactionId");
    if (interactionIdStr) {
      const interactionId = parseInt(interactionIdStr);
      setContentSession(prevState => ({
        ...prevState,
        interactionId
      }));
    }
    
  }, [searchParams]);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleLinkClick = (responseurl: string) => {
    // if (isEntityReady(response)) {
    //   setContentSession(prevState => ({
    //     ...prevState,
    //     queryId: response.queryId,
    //     type: "Link",
    //     link: responseurl,
    //     responseId: response.id
    //   }))
    // }
  }

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // TODO, contentSession.activeTab 可能为 null, 此时不应 render ContentPanel
  const interaction = useInteraction(contentSession.activeTab)

  return isEntityReady(interaction) ? (
    <ContentPanelRp
      tabs={contentSession.tabs}
      hiddenTabs={contentSession.hiddenTabs}
      interaction={interaction}
      onTabClick={handleTabClick}
      onCloseTab={handleTabClose}
      onHiddenTabClick={handleHiddenTabClick}
      onTitleChange={handleTitleChange}
      menuAnchor={menuAnchor}
      onMenuClick={handleMenuClick}
      onMenuClose={handleMenuClose}
      handleLinkClick={handleLinkClick}
    />
  ) : <Loading />;
};

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ContentPanelRp } from './ContentPanelRp';
import useContentSession from '../../data/contentSession';
import { getInteraction } from '@/renderer/data/interactionsV2';

export const ContentPanelCt: React.FC = () => {
  const { profileId } = useParams();
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
console.log("searchParams ContentPanelCt interactionIdStr =", interactionIdStr);
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

  return (
    <ContentPanelRp
      profileId={profileId}
      tabs={contentSession.tabs}
      hiddenTabs={contentSession.hiddenTabs}
      activeTab={contentSession.activeTab}
      onTabClick={handleTabClick}
      onCloseTab={handleTabClose}
      onHiddenTabClick={handleHiddenTabClick}
      onTitleChange={handleTitleChange}
      menuAnchor={menuAnchor}
      onMenuClick={handleMenuClick}
      onMenuClose={handleMenuClose}
      handleLinkClick={handleLinkClick}
    />
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ContentPanelRp, TabItem } from './ContentPanelRp';
import useContentSession from '../../data/contentSession';

export const ContentPanelCt: React.FC = () => {
  const { profileId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(searchParams.get("context"))

  const {
    contentSession,
    setContentSession,
    handleTabActiveOrCreate,
    handleTabClick,
    handleTabClose,
    handleHiddenTabClick,
    handleTitleChange,
  } = useContentSession();


  useEffect(() => {
    const messageId = searchParams.get("messageId");
    const queryId = searchParams.get("queryId");
    const context = searchParams.get("context");
    setContentSession(prevState => ({
      ...prevState,
      queryId,
      context,
      messageId
    }))
  }, [searchParams]);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

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
    />
  );
};

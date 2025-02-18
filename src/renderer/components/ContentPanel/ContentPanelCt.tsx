import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { ContentPanelRp, TabItem } from './ContentPanelRp';
import useContentSession from '../../data/contentSession';
import { TypeString } from '../../data/contentSession';
import { useResponse } from '../../data/interactions';
import { isEntityReady } from '@/renderer/data/cachedEntity';

export const ContentPanelCt: React.FC = () => {
  const { profileId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

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
    const type = searchParams.get("type");
    const responseId = searchParams.get("responseId");
    const queryId = searchParams.get("queryId");
    const link = searchParams.get("link");
    setContentSession(prevState => ({
      ...prevState,
      queryId,
      type: (type || "Response") as TypeString,
      link,
      responseId
    }))
  }, [searchParams]);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const responseId = searchParams.get("responseId");
  const response = useResponse(responseId);

  const handleLinkClick = (responseurl: string) => {
    if (isEntityReady(response)) {
      setContentSession(prevState => ({
        ...prevState,
        queryId: response.queryId,
        type: "Link",
        link: responseurl,
        responseId: response.id
      }))
    }
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
      responseId={contentSession.responseId}
      type={contentSession.type}
      link={contentSession.link}
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

import { useState, useEffect } from 'react';
import { TabItem } from '../components/ContentPanel/ContentPanelRp';
import { useQuery } from './interactions';
import { Query } from '@/shared/types/interactions';
import { isEntityReady } from './cachedEntity';

export type TypeString = "Response" | "Link";

export interface ContentSession {
  tabs: TabItem[];
  hiddenTabs: TabItem[];
  activeTab: string | null;
  type: TypeString;
  queryId: string | null;
  responseId: string | null;
  context: string | null;
}

const MAX_VISIBLE_TABS = 5; // Maximum number of visible tabs

const useContentSession = () => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [contentSession, setContentSession] = useState<ContentSession>({
    tabs: [],
    hiddenTabs: [],
    activeTab: null,
    type: null,
    queryId: null,
    responseId: null,
    context: null
  });

  useEffect(() => {
    const storedContentSession = localStorage.getItem('contentSession');
    if (storedContentSession) {
      setContentSession(JSON.parse(storedContentSession));
    }
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (!hasInitialized) {
      return;
    }

    if (contentSession.type === "Response") {
      if (contentSession.queryId && contentSession.responseId) {
        handleTabActiveOrCreate("Response", contentSession.queryId, null, contentSession.responseId);
      }
    }

    if (contentSession.type === "Link") {
      if (contentSession.queryId && contentSession.context) {
        handleTabActiveOrCreate("Link", contentSession.queryId, contentSession.context, null);
      }
    }

  }, [hasInitialized, contentSession.type, contentSession.queryId, contentSession.context, contentSession.responseId]);

  const handleTabClick = (tab: TabItem) => {
    setContentSession(prevState => ({
      ...prevState,
      activeTab: tab.id,
    }));

    saveContentSessionAsync(contentSession);
  };

  const handleTabClose = (id: string) => {
    setContentSession(prevState => {
      const updatedTabs = prevState.tabs.filter(tab => tab.id !== id);
      let updatedHiddenTabs = [...prevState.hiddenTabs];

      if (updatedHiddenTabs.length > 0) {
        // Move the most recently accessed tab from hiddenTabs to tabs
        const mostRecentlyAccessedHiddenTab = updatedHiddenTabs.reduce((newest, tab) => tab.lastAccessed > newest.lastAccessed ? tab : newest);
        updatedHiddenTabs = updatedHiddenTabs.filter(tab => tab.id !== mostRecentlyAccessedHiddenTab.id);
        updatedTabs.push(mostRecentlyAccessedHiddenTab);
      }

      let mostRecentlyAccessedTab = null;
      if (updatedTabs.length > 0) {
        mostRecentlyAccessedTab = updatedTabs.reduce((newest, tab) => tab.lastAccessed > newest.lastAccessed ? tab : newest);
      }

      return {
        ...prevState,
        tabs: updatedTabs,
        hiddenTabs: updatedHiddenTabs,
        activeTab: mostRecentlyAccessedTab ? mostRecentlyAccessedTab.id : null,
      };
    });

    saveContentSessionAsync(contentSession);
  };

  const handleHiddenTabClick = (tab: TabItem) => {
    let updatedTabs = [...contentSession.tabs, tab];
    let updatedHiddenTabs = contentSession.hiddenTabs.filter(hiddenTab => hiddenTab.id !== tab.id);

    if (updatedTabs.length > MAX_VISIBLE_TABS) {
      // Move the least recently used tab to hiddenTabs
      const leastRecentlyUsedTab = contentSession.tabs.reduce((oldest, tab) => tab.lastAccessed < oldest.lastAccessed ? tab : oldest);
      updatedTabs = updatedTabs.filter(t => t.id !== leastRecentlyUsedTab.id);
      updatedHiddenTabs = [...updatedHiddenTabs, leastRecentlyUsedTab];
    }

    setContentSession(prevState => ({
      ...prevState,
      hiddenTabs: updatedHiddenTabs,
      tabs: updatedTabs,
      activeTab: tab.id,
    }));

    saveContentSessionAsync(contentSession);
  };

  const handleTitleChange = (id: string, title: string) => {
    setContentSession(prevState => ({
      ...prevState,
      tabs: prevState.tabs.map(tab =>
        tab.id === id ? { ...tab, title } : tab
      ),
    }));

    saveContentSessionAsync(contentSession);
  };

  const handleTabActiveOrCreate = (type: TypeString, queryId: string | null, context: string | null, responseId: string | null) => {
    const existingVisibleTab = contentSession.tabs.find(tab => tab.id === queryId);
    const existingHiddenTab = contentSession.hiddenTabs.find(tab => tab.id === queryId);

    if (existingVisibleTab) {
      handleTabClick(existingVisibleTab);
    } else if (existingHiddenTab) {
      handleHiddenTabClick(existingHiddenTab);
    } else {
      const newTab: TabItem = {
        id: queryId,
        title: context || `Query ${queryId}`,
        lastAccessed: Date.now(),
        context,
        responseId: responseId || undefined,
        type
      };

      let updatedTabs = [...contentSession.tabs, newTab];
      let updatedHiddenTabs = [...contentSession.hiddenTabs];
      if (updatedTabs.length > MAX_VISIBLE_TABS) {
        // Move the least recently used tab to hiddenTabs
        const leastRecentlyUsedTab = updatedTabs.reduce((oldest, tab) => tab.lastAccessed < oldest.lastAccessed ? tab : oldest);
        updatedTabs = updatedTabs.filter(t => t.id !== leastRecentlyUsedTab.id);
        updatedHiddenTabs = [...updatedHiddenTabs, leastRecentlyUsedTab];
      }

      setContentSession(prevState => ({
        ...prevState,
        tabs: updatedTabs,
        hiddenTabs: updatedHiddenTabs,
        activeTab: queryId,
        responseId: responseId,
        type: type
      }));
    }

    saveContentSessionAsync(contentSession);
  };

  const saveContentSessionAsync = async (session: ContentSession) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.setItem('contentSession', JSON.stringify(session));
        resolve();
      }, 0);
    });
  };

  return {
    contentSession,
    setContentSession,
    handleTabActiveOrCreate,
    handleTabClick,
    handleTabClose,
    handleHiddenTabClick,
    handleTitleChange,
  };
};

export default useContentSession;

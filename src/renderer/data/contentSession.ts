import { useState, useEffect } from 'react';
import { TabItem } from '../components/ContentPanel/ContentPanelRp';
import { Interaction } from '@/shared/types/interactionsV2';

export type TypeString = "Response" | "Link";

export interface ContentSession {
  tabs: TabItem[];
  hiddenTabs: TabItem[];
  activeTab: number | null;
  interactionId: number | null;
}

const MAX_VISIBLE_TABS = 5; // Maximum number of visible tabs

const useContentSession = () => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [contentSession, setContentSession] = useState<ContentSession>({
    tabs: [],
    hiddenTabs: [],
    activeTab: null,
    interactionId: null
  });

  useEffect(() => {
    const storedContentSession = localStorage.getItem('contentSessionV2');
    if (storedContentSession) {
      setContentSession(JSON.parse(storedContentSession));
    }
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (!hasInitialized) {
      return;
    }
    handleTabActiveOrCreate(contentSession.interactionId);
    setContentSession(prevState => ({
      ...prevState,
      interactionId: null
    }));

  }, [hasInitialized, contentSession.interactionId]);

  const handleTabClick = (tab: TabItem) => {

    setContentSession(prevState => ({
      ...prevState,
      activeTab: tab.id,
    }));

    saveContentSessionAsync(contentSession);
  };

  const handleTabClose = (id: number) => {
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

  const handleTitleChange = (id: number, title: string) => {
    setContentSession(prevState => ({
      ...prevState,
      tabs: prevState.tabs.map(tab =>
        tab.id === id ? { ...tab, title } : tab
      ),
    }));

    saveContentSessionAsync(contentSession);
  };

  const handleTabActiveOrCreate = (interactionId : number | null) => {
    if (interactionId === null) return;

    const existingVisibleTab = contentSession.tabs.find(tab => tab.id === interactionId);
    const existingHiddenTab = contentSession.hiddenTabs.find(tab => tab.id === interactionId);

    if (existingVisibleTab) {
      handleTabClick(existingVisibleTab);
    } else if (existingHiddenTab) {
      handleHiddenTabClick(existingHiddenTab);
    } else {
      const newTab: TabItem = {
        id: interactionId,
        title: "Interaction:" + interactionId,
        lastAccessed: Date.now(),
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
        activeTab: interactionId
      }));
    }

    saveContentSessionAsync(contentSession);
  };

  const saveContentSessionAsync = async (session: ContentSession) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.setItem('contentSessionV2', JSON.stringify(session));
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

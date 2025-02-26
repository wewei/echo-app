import { BaseInteraction } from '@/shared/types/interactions';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type TypeString = "Response" | "Link";

export interface DisplayInfo {
  type: 'Link' | 'Chat';
  link?: string;
  chatInteraction?: BaseInteraction;
}

export class DisplayInfoFactory {
  static create(interaction: BaseInteraction, url: string | null): DisplayInfo | null {
    if (url === null && interaction === null) {
      return null;
    }

    if (url) {
      return { type: 'Link', link: url };
    } else {
      return { type: 'Chat', chatInteraction: interaction };
    }
  }
}

export interface TabItem {
  id: string;
  contextId: number | null;
  title: string;
  lastAccessed: number;
  isTemporaryTab: boolean;
  displayInfo?: DisplayInfo;
}

export interface TabState {
  tabs: TabItem[];
  hiddenTabs: TabItem[];
  activeTab: string | null;
}

const MAX_VISIBLE_TABS = 5; // Maximum number of visible tabs

const useTabState = () => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [tabState, setTabState] = useState<TabState>({
    tabs: [],
    hiddenTabs: [],
    activeTab: null
  });

  useEffect(() => {
    const storedContentSession = localStorage.getItem('tabState');
    if (storedContentSession) {
      setTabState(JSON.parse(storedContentSession));
    }
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (hasInitialized && tabState.tabs.length === 0) {
      handleTabActiveOrCreate(null, null);
    }
  }, [hasInitialized]);

  useEffect(() => {
    console.log("tabs changed= ", tabState.tabs);
  }, [tabState.tabs]);

  const handleTabClick = (tab: TabItem) => {

    setTabState(prevState => ({
      ...prevState,
      activeTab: tab.id,
    }));

    saveContentSessionAsync(tabState);
  };

  const handleTabClose = (id: string) => {
    setTabState(prevState => {
      let updatedTabs = prevState.tabs.filter(tab => tab.id !== id);
      let updatedHiddenTabs = [...prevState.hiddenTabs];

      if (updatedTabs.length < MAX_VISIBLE_TABS && updatedHiddenTabs.length > 0) {
        const mostRecentlyUsedHiddenTab = updatedHiddenTabs.reduce((newest, tab) => tab.lastAccessed > newest.lastAccessed ? tab : newest);
        updatedHiddenTabs = updatedHiddenTabs.filter(t => t.id !== mostRecentlyUsedHiddenTab.id);
        updatedTabs = [...updatedTabs, mostRecentlyUsedHiddenTab];
      }

      return {
        ...prevState,
        tabs: updatedTabs,
        hiddenTabs: updatedHiddenTabs,
      };
    });

    saveContentSessionAsync(tabState);
  };

  const handleHiddenTabClick = (tab: TabItem) => {
    let updatedTabs = [...tabState.tabs, tab];
    let updatedHiddenTabs = tabState.hiddenTabs.filter(hiddenTab => hiddenTab.id !== tab.id);

    if (updatedTabs.length > MAX_VISIBLE_TABS) {
      // Move the least recently used tab to hiddenTabs
      const leastRecentlyUsedTab = tabState.tabs.reduce((oldest, tab) => tab.lastAccessed < oldest.lastAccessed ? tab : oldest);
      updatedTabs = updatedTabs.filter(t => t.id !== leastRecentlyUsedTab.id);
      updatedHiddenTabs = [...updatedHiddenTabs, leastRecentlyUsedTab];
    }

    setTabState(prevState => ({
      ...prevState,
      hiddenTabs: updatedHiddenTabs,
      tabs: updatedTabs,
    }));

    saveContentSessionAsync(tabState);
  };

  const handleTitleChange = (id: string, title: string) => {
    setTabState(prevState => ({
      ...prevState,
      tabs: prevState.tabs.map(tab =>
        tab.id === id ? { ...tab, title } : tab
      )
    }));

    saveContentSessionAsync(tabState);
  };

  const handleTabActiveOrCreate = (contextId : number | null, displayInfo : DisplayInfo | null) => {
    console.log("handleTabActiveOrCreate", hasInitialized);
    if (!hasInitialized) {
      return;
    }

    const existingVisibleTab = tabState.tabs.find(tab => tab.contextId === contextId);
    const existingHiddenTab = tabState.hiddenTabs.find(tab => tab.contextId === contextId);

    if (existingVisibleTab) {
      handleTabClick(existingVisibleTab);
    } else if (existingHiddenTab) {
      handleHiddenTabClick(existingHiddenTab);
    } else {
      const newTab: TabItem = {
        id: uuidv4(),
        contextId: contextId,
        title: contextId === null ? "New Tab" : "Context:" + contextId,
        displayInfo: displayInfo,
        lastAccessed: Date.now(),
        isTemporaryTab: contextId === null
      };

      let updatedTabs = [...tabState.tabs, newTab];
      let updatedHiddenTabs = [...tabState.hiddenTabs];
      if (updatedTabs.length > MAX_VISIBLE_TABS) {
        // Move the least recently used tab to hiddenTabs
        const leastRecentlyUsedTab = updatedTabs.reduce((oldest, tab) => tab.lastAccessed < oldest.lastAccessed ? tab : oldest);
        updatedTabs = updatedTabs.filter(t => t.id !== leastRecentlyUsedTab.id);
        updatedHiddenTabs = [...updatedHiddenTabs, leastRecentlyUsedTab];
      }

      setTabState(prevState => ({
        ...prevState,
        tabs: updatedTabs,
        hiddenTabs: updatedHiddenTabs,
        activeTab: newTab.id,
      }));
    }

    saveContentSessionAsync(tabState);
  };

  const saveContentSessionAsync = async (session: TabState) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.setItem('tabState', JSON.stringify(session));
        resolve();
      }, 1000);
    });
  };

  return {
    tabState,
    setTabState,
    handleTabActiveOrCreate,
    handleTabClick,
    handleTabClose,
    handleHiddenTabClick,
    handleTitleChange,
  };
};

export default useTabState;

import { BaseInteraction } from '@/shared/types/interactions';
import { fa } from '@faker-js/faker/.';
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
  activeTab: string | null;
}

const useTabState = () => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [tabState, setTabState] = useState<TabState>({
    tabs: [],
    activeTab: null
  });

  useEffect(() => {
    const storedTabState = localStorage.getItem('tabState');
    if (storedTabState) {
      setTabState(JSON.parse(storedTabState));
    }

    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (tabState.tabs.length === 0) {
      handleTabCreate(null, null);
    }
  }, [hasInitialized]);

  const handleTabClick = (tab: TabItem) => {

    setTabState(prevState => ({
      ...prevState,
      activeTab: tab.id,
    }));
  };

  const handleTabClose = (id: string) => {
    setTabState(prevState => {
      let updatedTabs = prevState.tabs.filter(tab => tab.id !== id);
      const mostRecentlyUsedHiddenTab = updatedTabs.length > 0 ? updatedTabs.reduce((newest, tab) => tab.lastAccessed > newest.lastAccessed ? tab : newest) : null;

      return {
        ...prevState,
        tabs: updatedTabs,
        activeTab: mostRecentlyUsedHiddenTab?.id || null
      };
    });
  };

  const handleTitleChange = (id: string, title: string) => {
    setTabState(prevState => ({
      ...prevState,
      tabs: prevState.tabs.map(tab =>
        tab.id === id ? { ...tab, title } : tab
      )
    }));
  };

  const handleTabCreate = (contextId : number | null, displayInfo : DisplayInfo | null, isTemporaryTab?: boolean) => {
    if (!hasInitialized) {
      return;
    }

    const newTab: TabItem = {
      id: uuidv4(),
      contextId: contextId,
      title: contextId === null ? "New Tab" : "Context:" + contextId,
      displayInfo: displayInfo,
      lastAccessed: Date.now(),
      isTemporaryTab: isTemporaryTab ?? true
    };

    let updatedTabs = [...tabState.tabs, newTab];

    setTabState(prevState => ({
      ...prevState,
      tabs: updatedTabs,
      activeTab: newTab.id,
    }));

    saveTabState(tabState);
  }

  const handleTabActiveOrCreate = (contextId : number | null, displayInfo : DisplayInfo | null) => {
    console.log("handleTabActiveOrCreate", hasInitialized);
    if (!hasInitialized) {
      return;
    }

    const existingVisibleTab = tabState.tabs.find(tab => tab.contextId === contextId);

    if (existingVisibleTab) {
      handleTabClick(existingVisibleTab);
    } else {
      handleTabCreate(contextId, displayInfo, false);
    }

    saveTabState(tabState);
  };

  const saveTabState = async (tabState: TabState) => {
    localStorage.setItem('tabState', JSON.stringify(tabState));
  };

  return {
    tabState,
    setTabState,
    handleTabCreate,
    handleTabActiveOrCreate,
    handleTabClick,
    handleTabClose,
    handleTitleChange,
  };
};

export default useTabState;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ContentPanelRp, TabItem } from './ContentPanelRp';

const MAX_VISIBLE_TABS = 5; // 最大可见标签数

export const ContentPanelCt: React.FC = () => {
  const { profileId } = useParams();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const messageId = searchParams.get("messageId");
  const queryId = searchParams.get("queryId");
  const context = searchParams.get("context");

  // 更新标签访问时间
  const updateTabAccess = (id: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === id 
          ? { ...tab, lastAccessed: Date.now() } 
          : tab
      )
    );
  };

  // 管理标签可见性
  const manageTabVisibility = () => {
    if (tabs.length > MAX_VISIBLE_TABS) {
      // 按最后访问时间排序，将最不常用的移到隐藏标签
      const leastUsedTab = [...tabs].sort((a, b) => a.lastAccessed - b.lastAccessed)[0];
      setTabs(prev => prev.filter(tab => tab.id !== leastUsedTab.id));
      setHiddenTabs(prev => [...prev, leastUsedTab]);
    }
  };

  useEffect(() => {
    console.log("queryId: "+queryId);
    if (queryId) {
      // 检查是否已存在对应的标签
      const existingVisibleTab = tabs.find(tab => tab.id === queryId);
      const existingHiddenTab = hiddenTabs.find(tab => tab.id === queryId);
      
      console.log("context ="+context + ", existingVisibleTab: "+existingVisibleTab + ", existingHiddenTab: "+existingHiddenTab);
      if (existingVisibleTab) {
        // 更新访问时间并激活标签
        updateTabAccess(queryId);
        setActiveTab(queryId);
      } else if (existingHiddenTab) {
        // 如果在隐藏标签中，移到可见标签
        setHiddenTabs(prev => prev.filter(tab => tab.id !== queryId));
        
        // 先确保不会超过最大标签数
        manageTabVisibility();
        
        // 然后添加新的可见标签
        setTabs(prev => [...prev, { ...existingHiddenTab, lastAccessed: Date.now() }]);
        setActiveTab(queryId);
      } else {
        // 创建新标签前先确保不会超过最大标签数
        manageTabVisibility();
        
        // 创建新标签
        const newTab: TabItem = {
          id: queryId,
          title: `Query ${queryId}`,
          lastAccessed: Date.now(),
          context: context || undefined,
          messageId: messageId || undefined
        };
        
        setTabs(prev => [...prev, newTab]);
        setActiveTab(queryId);
      }
    }
  }, [queryId, messageId, context]);

  const handleTabClick = (tab: TabItem) => {
    setActiveTab(tab.id);
    updateTabAccess(tab.id);
    // 更新 URL 参数，保留其他参数
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("queryId", tab.id);
      if (tab.context) {
        newParams.set("context", tab.context);
      } else {
        newParams.delete("context");
      }
      if (tab.messageId) {
        newParams.set("messageId", tab.messageId);
      } else {
        newParams.delete("messageId");
      }
      return newParams;
    });
  };

  const handleCloseTab = (id: string) => {
    // 从可见标签中移除
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== id);
      
      // 如果有隐藏标签，将最近访问的隐藏标签移到可见标签
      if (newTabs.length < MAX_VISIBLE_TABS && hiddenTabs.length > 0) {
        const [mostRecentHidden, ...remainingHidden] = [...hiddenTabs].sort((a, b) => b.lastAccessed - a.lastAccessed);
        setHiddenTabs(remainingHidden);
        return [...newTabs, mostRecentHidden];
      }
      
      return newTabs;
    });

    // 如果关闭的是当前标签，切换到最近访问的标签
    if (id === activeTab) {
      const remainingTabs = tabs.filter(tab => tab.id !== id);
      if (remainingTabs.length > 0) {
        const mostRecent = remainingTabs.reduce((prev, current) => 
          current.lastAccessed > prev.lastAccessed ? current : prev
        );
        setActiveTab(mostRecent.id);
      } else {
        setActiveTab(null);
      }
    }
  };

  const handleHiddenTabClick = (tab: TabItem) => {
    // 将选中的隐藏标签移到可见标签
    setHiddenTabs(prev => prev.filter(t => t.id !== tab.id));
    
    // 先确保不会超过最大标签数
    manageTabVisibility();
    
    // 添加新的可见标签
    setTabs(prev => [...prev, { ...tab, lastAccessed: Date.now() }]);
    setActiveTab(tab.id);
    
    // 更新 URL 参数，保留其他参数
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("queryId", tab.id);
      if (tab.context) {
        newParams.set("context", tab.context);
      } else {
        newParams.delete("context");
      }
      if (tab.messageId) {
        newParams.set("messageId", tab.messageId);
      } else {
        newParams.delete("messageId");
      }
      return newParams;
    });
    handleMenuClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleTitleChange = (id: string, title: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === id ? { ...tab, title } : tab
      )
    );
    setHiddenTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === id ? { ...tab, title } : tab
      )
    );
  };

  return (
    <ContentPanelRp
      tabs={tabs}
      hiddenTabs={hiddenTabs}
      activeTab={activeTab}
      menuAnchor={menuAnchor}
      profileId={profileId}
      messageId={messageId}
      context={context}
      onTabClick={handleTabClick}
      onCloseTab={handleCloseTab}
      onHiddenTabClick={handleHiddenTabClick}
      onMenuClick={handleMenuClick}
      onMenuClose={handleMenuClose}
      onTitleChange={handleTitleChange}
    />
  );
};

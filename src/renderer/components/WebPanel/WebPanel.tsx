import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export interface WebPanelRef {
  addTab: (url: string) => void;
}


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Tab {
  id: string;
  url: string;
  title: string;
  lastAccessed: number;
  webviewRef?: HTMLWebViewElement;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      style={{
        height: '100%',
        display: value === index ? 'block' : 'none'
      }}
      {...other}
    >
      {children}
    </div>
  );
}

const MAX_VISIBLE_TABS = 5; // 最大显示标签数

const WebPanel = forwardRef<WebPanelRef, {}>((props, ref) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // 关闭标签
  const handleCloseTab = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    // 调整活动标签
    if (tabIndex <= activeTab && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // 更新最后访问时间
  const updateTabAccess = useCallback((tabId: string) => {
    setTabs(prevTabs => prevTabs.map(tab =>
      tab.id === tabId
        ? { ...tab, lastAccessed: Date.now() }
        : tab
    ));
  }, []);

  // 获取要显示的标签
  const getVisibleTabs = useCallback(() => {
    return [...tabs].sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, MAX_VISIBLE_TABS);
  }, [tabs]);

  // 获取隐藏的标签
  const getHiddenTabs = useCallback(() => {
    const visibleTabs = new Set(getVisibleTabs().map(tab => tab.id));
    return tabs.filter(tab => !visibleTabs.has(tab.id));
  }, [tabs, getVisibleTabs]);

  // 切换标签
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log('handleTabChange: ' + newValue);
    setActiveTab(newValue);
    const tab = tabs[newValue];
    if (tab) {
      updateTabAccess(tab.id);
    }
  };

  // 处理菜单打开
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  // 处理菜单关闭
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // 处理隐藏标签选择
  const handleHiddenTabSelect = (tabId: string) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
      updateTabAccess(tabId);
    }
    handleMenuClose();
  };

  const addTab = (url: string) => {
    console.log('addTab: ' + url);
    const existingTabIndex = tabs.findIndex(tab => tab.url === url);
    if (existingTabIndex >= 0) {
      setActiveTab(existingTabIndex);
      updateTabAccess(tabs[existingTabIndex].id);
    } else {
      const newTab: Tab = {
        id: uuidv4(),
        url,
        title: new URL(url).hostname,
        lastAccessed: Date.now()
      };
      console.log('newTab: ' + newTab.id + ' ' + newTab.url);
      setTabs(prev => {
        const newTabs = [...prev, newTab];
        setActiveTab(newTabs.length - 1);
        return newTabs;
      });
    }
  };

  // 处理标题更新
  const handleTitleUpdate = useCallback((tabId: string, newTitle: string) => {
    console.log('tabId: ' + tabId + ' newTitle:' + newTitle);
    setTabs(prevTabs => prevTabs.map(tab =>
      tab.id === tabId ? { ...tab, title: newTitle } : tab
    ));
  }, []);

  // 打印所有tabs信息的辅助函数
  const debugPrintTabs = useCallback(() => {
    console.log('==== All Tabs Debug Info ====');
    tabs.forEach((tab, index) => {
      console.log(`Tab ${index}:`, {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        lastAccessed: new Date(tab.lastAccessed).toLocaleString()
      });
    });
  }, [tabs, activeTab]);

  // 在tabs变化时打印信息
  useEffect(() => {
    debugPrintTabs();
  }, [tabs, activeTab, debugPrintTabs]);

  useImperativeHandle(ref, () => ({
    addTab
  }));

  const visibleTabs = getVisibleTabs();
  const hiddenTabs = getHiddenTabs();

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {tabs.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flex: 1 }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      maxWidth: '160px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {tab.title}
                    </span>
                    <IconButton
                      size="small"
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
            ))}
          </Tabs>
          {hiddenTabs.length > 0 && (
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ mx: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
          )}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            {hiddenTabs.map((tab) => (
              <MenuItem
                key={tab.id}
                onClick={() => handleHiddenTabSelect(tab.id)}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <span style={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {tab.title}
                  </span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(e, tab.id);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {tabs.map((tab, index) => (
          <TabPanel key={tab.id} value={activeTab} index={index}>
            <webview
              key={tab.id}
              src={tab.url}
              style={{ width: '100%', height: '100%' }}
              webpreferences="contextIsolation=yes"
              allowpopups={true}
              ref={(webview: HTMLWebViewElement) => {
                if (webview) {
                  webview.removeEventListener('page-title-updated', () => { });
                  webview.addEventListener('page-title-updated', (e: any) => {
                    handleTitleUpdate(tab.id, e.title);
                  });
                }
              }}
            />
          </TabPanel>
        ))}

        {tabs.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            没有打开的网页
          </Box>
        )}
      </Box>
    </Box>
  );
})

export default WebPanel;
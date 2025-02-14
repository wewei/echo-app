import React from 'react';
import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MessageDetailPanel from '../MessageDetailPanel/MessageDetailPanel';
import WebPanel from '../WebPanel/WebPanel';

export interface TabItem {
  id: string;
  title: string;
  lastAccessed: number;
  context?: string;
  messageId?: string;
}

interface ContentPanelRpProps {
  tabs: TabItem[];
  hiddenTabs: TabItem[];
  activeTab: string | null;
  menuAnchor: HTMLElement | null;
  profileId?: string;
  messageId?: string | null;
  context?: string | null;
  onTabClick: (tab: TabItem) => void;
  onCloseTab: (id: string) => void;
  onHiddenTabClick: (tab: TabItem) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onTitleChange: (id: string, title: string) => void;
}

export const ContentPanelRp: React.FC<ContentPanelRpProps> = ({
  tabs,
  hiddenTabs,
  activeTab,
  menuAnchor,
  profileId,
  messageId,
  context,
  onTabClick,
  onCloseTab,
  onHiddenTabClick,
  onMenuClick,
  onMenuClose,
  onTitleChange,
}) => {
  console.log("activeTab:"+activeTab);
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' 
    }}>
      {tabs.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Tabs 
            value={activeTab}
            onChange={(_, value) => {
              const tab = tabs.find(t => t.id === value);
              if (tab) {
                onTabClick(tab);
              }
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flex: 1, minHeight: 0 }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>{tab.title}</span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
            ))}
          </Tabs>
          {hiddenTabs.length > 0 && (
            <>
              <IconButton
                size="small"
                onClick={onMenuClick}
                sx={{ ml: 1, mr: 1 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={onMenuClose}
              >
                {hiddenTabs.map((tab) => (
                  <MenuItem
                    key={tab.id}
                    onClick={() => {
                      onHiddenTabClick(tab);
                      onMenuClose();
                    }}
                  >
                    {tab.title}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1 }}>
        {activeTab && (
          (() => {
            
            const currentTab = tabs.find(tab => tab.id === activeTab);
            if (!currentTab) return null;

            // 如果标签有 context，显示网页
            if (currentTab.context) {
              return (
                <WebPanel
                  url={currentTab.context}
                  tabId={currentTab.id}
                  onTitleChange={onTitleChange}
                />
              );
            }

            // 如果标签有 messageId，显示消息详情
            if (currentTab.messageId) {
              return (
                <MessageDetailPanel
                  profileId={profileId}
                  messageId={currentTab.messageId}
                />
              );
            }
            return null;
          })()
        )}
      </Box>
    </Box>
  );
};

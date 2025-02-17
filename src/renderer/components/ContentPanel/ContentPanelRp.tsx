import React from 'react';
import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WebPanel from '../WebPanel/WebPanel';
import type { TypeString } from '@/renderer/data/contentSession';
import { isEntityReady } from '@/renderer/data/cachedEntity';
import { Query } from '@/shared/types/interactions';
import ResponseView from '@/renderer/components/ChatPanel/ResponseView'

export interface TabItem {
  id: string;
  title: string;
  type: TypeString;
  lastAccessed: number;
  context?: string;
  responseId?: string;
}

interface ContentPanelRpProps {
  tabs: TabItem[];
  hiddenTabs: TabItem[];
  activeTab: string | null;
  menuAnchor: HTMLElement | null;
  profileId?: string;
  type?: TypeString;
  query?: Query;
  responseId?: string | null;
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
  type,
  responseId,
  query,
  context,
  onTabClick,
  onCloseTab,
  onHiddenTabClick,
  onMenuClick,
  onMenuClose,
  onTitleChange,
}) => {
  console.log("ContentPanelRp tabs", tabs, "hiddenTabs", hiddenTabs, "activeTab", activeTab, "menuAnchor", menuAnchor, "profileId", profileId, "type", type, "responseId", responseId, "query", query, "context", context);
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
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              flex: 1,
              minHeight: 0,
              '&::-webkit-scrollbar': {
                height: '8px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px'
              }
            }}
          >
            {tabs.map((tab) => (
              <Box
                key={tab.id}
                onClick={() => onTabClick(tab)}
                sx={{
                  display: 'flex',
                  alignItems: 'center', 
                  padding: '8px 16px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: tab.id === activeTab ? 'rgba(0,0,0,0.04)' : 'transparent',
                  boxShadow: tab.id === activeTab ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  borderRadius: '4px 4px 0 0',
                  marginTop: '2px',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  },
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: tab.id === activeTab ? 'primary.main' : 'transparent',
                    borderRadius: '4px 4px 0 0'
                  }
                }}
              >
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
            ))}
          </Box>
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
      
      <Box sx={{ flexGrow: 1}}>
        {activeTab ? (
          (() => {
            
            const currentTab = tabs.find(tab => tab.id === activeTab);
            // if (!currentTab) return null;

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
            if (currentTab.type === "Response") {
              return <ResponseView 
              responseId={currentTab.responseId}
              hasPrevious={false}
              hasNext={false}
              onPrevious={() => { /* function logic */ }}
              onNext={() => { /* function logic */ }}
            />
            } 
            return <div style={{ padding: '20px', border: '1px solid black' }}>
            <h3>Test View 3</h3>
            <pre>{JSON.stringify(currentTab, null, 2)}</pre>
          </div>;
          })()
        ) : (
          <div style={{ padding: '20px', border: '1px solid black' }}>
                <h3>Test View 4</h3>
                <pre>{JSON.stringify("hhahahahahha", null, 2)}</pre>
              </div>
        )}
      </Box>
    </Box>
  );
};

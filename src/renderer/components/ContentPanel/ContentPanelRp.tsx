import React, { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WebPanel from '../WebPanel/WebPanel';
import InteractionView from '@/renderer/components/ChatPanel/InteractionView';
import { useInteraction } from '@/renderer/data/interactionsV2';

export interface TabItem {
  id: number;
  title: string;
  lastAccessed: number;
}

interface ContentPanelRpProps {
  tabs: TabItem[];
  hiddenTabs: TabItem[];
  activeTab: number | null;
  menuAnchor: HTMLElement | null;
  profileId?: string;
  onTabClick: (tab: TabItem) => void;
  onCloseTab: (id: number) => void;
  onHiddenTabClick: (tab: TabItem) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onTitleChange: (id: number, title: string) => void;
  handleLinkClick?: (url: string) => void;
}

export const ContentPanelRp: React.FC<ContentPanelRpProps> = ({
  tabs,
  hiddenTabs,
  menuAnchor,
  activeTab,
  profileId,
  onTabClick,
  onCloseTab,
  onHiddenTabClick,
  onMenuClick,
  onMenuClose,
  onTitleChange,
  handleLinkClick,
}) => {
  const interaction = useInteraction(profileId, activeTab);
  console.log("ContentPanelRp profileId =", profileId, "activeTab =", activeTab, "interaction =", interaction);
  useEffect(() => {
    console.log("ContentPanelRp interaction changed =", interaction);
  }, [interaction])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link) {
      e.preventDefault();
      console.log("handleClick", link.href);
      handleLinkClick?.(link.href);
    }
  }, [handleLinkClick]);
  

  return (
    <Box sx={{
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' 
    }} onClick={handleClick}>
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
                data-key={tab.id} // 添加data-key属性
                onClick={() => onTabClick(tab)}
                sx={{
                  display: 'flex',
                  alignItems: 'center', 
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: tab.id === activeTab ? '#3c3c3c' : '#2d2d2d', // 使用深色背景
                  color: '#ffffff', // 浅色文字
                  boxShadow: 'none', // 移除阴影效果
                  borderBottom: tab.id === activeTab ? '2px solid #f0f0f0' : '1px solid #444', // 选中状态使用更亮的底部边框
                  borderRadius: '4px 4px 0 0',
                  padding: '8px 16px', // 增加内边距
                  '&:hover': {
                    backgroundColor: '#4a4a4a', // hover时背景颜色稍微加深
                    boxShadow: 'none', // 移除hover时的阴影效果
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
                  },
                  marginTop: '2px',
                  position: 'relative',
                }}
              >
                <span style={{ maxWidth: '200px',textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{tab.title}</span>
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
        {interaction && (
          (() => {
            const currentTab = tabs.find(tab => tab.id === interaction.id);
            if (!currentTab) return null;

            // 如果标签有 context，显示网页
            if (interaction.type === "nav") {

              return (
                <WebPanel
                  url={interaction.userContent}
                  tabId={currentTab.id}
                  onTitleChange={onTitleChange}
                />
              );
            } else if (interaction.type === "chat") {
              return <InteractionView 
                interaction={interaction}
              />;
            } 
            
            return null;
          })()
        )}
      </Box>
    </Box>
  );
};

import React, {useState} from "react";
import { useSearchParams } from "react-router-dom";
import ContentPanel from "./ContentPanel";
import { Drawer, IconButton, Box, Button, Tabs, Tab } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AppMenu from "./AppMenu";
import { useCurrentProfileId } from "../data/profile";
import { InteractionApiProvider } from "../contexts/interactonApi";
import { withProfileId } from "@/renderer/data/interactions";
import useTabState, { TabItem, TabState } from "../data/tabState";
import CloseIcon from "@mui/icons-material/Close";
import { BaseInteraction } from "@/shared/types/interactions";
import { DisplayInfoFactory } from "../data/tabState";
import SplitView from './SplitView';
import SearchDialog from './SearchDialog';


export default function MainPage() {

  const [searchParams, setSearchParams] = useSearchParams();
  const menuPath = searchParams.get("menu");
  const profileId = useCurrentProfileId();
  const interactionApi = withProfileId(profileId)(window.electron.interactions)

  const { 
    tabState,
    setTabState,
    handleTabCreate,
    handleTabActiveOrCreate,
    handleTabClick,
    handleTabClose,
    handleTitleChange } = useTabState();


  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const onTabClick = (tab: TabItem) => {
    console.log("Tab clicked", tab);
    // Implement tab click logic here
    handleTabClick(tab);
  };

  const onCloseTab = (id: string) => {
    console.log("Tab closed", id);
    // Implement tab close logic here
    handleTabClose(id);
  };

  const onInteractionExpand = (interaction: BaseInteraction, url: string | null) => {
    console.log("Interaction expanded", interaction, ", url =", url);
    
    handleTabActiveOrCreate(interaction.id, DisplayInfoFactory.create(interaction, url));
  }

  const onInteractionClick = (tab : TabItem, interaction: BaseInteraction, url : string) => {
    console.log("handleLinkClick", interaction, ", url =", url);
    setTabState(prevState => ({
      ...prevState,
      tabs: prevState.tabs.map(t =>
        t.id === tab.id ? {
          ...t,
          displayInfo: url ? {
            type: 'Link',
            link: url
          } : interaction ? {
            type: 'Chat',
            chatInteraction: interaction
          } : undefined
        } : t
      )
    }));
  }

  const onTabUpdate = (tab: TabItem) => {
    console.log("onTabUpdate", tab);
    setTabState(prevState => ({
      ...prevState,
      tabs: prevState.tabs.map(t =>
        t.id === tab.id ? {
          ...t,
          contextId: tab.contextId,
          isTemporaryTab: tab.isTemporaryTab,
          displayInfo: tab.displayInfo
        } : t
      )
    }));
  }

  console.log("  tabState.activeTab", tabState);

  const handleMinimize = () => {
    window.electron.window.minimize()
  }

  const handleMaximize = () => {
    window.electron.window.maximize()
  }

  const handleClose = () => {
    window.electron.window.close()
  }

  const handleSearchIconClick = () => {
    setSearchDialogOpen(true);
  };

  const handleSearchDialogClose = () => {
    setSearchDialogOpen(false);
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement your search functionality here
  };

  return (
    <InteractionApiProvider interactionApi={interactionApi}>
        <Box
          sx={{
            height: "100%",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <SplitView
              initialSplitRatio={0.15}
              showToggleButtons={false}
              autoSwitchModeOnRelease={false}
              leftContent={
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="h-8 flex justify-between items-center bg-gray-800 drag">
                    <div className="flex">
                      <button onClick={handleMinimize} className="px-4 hover:bg-gray-700">─</button>
                      <button onClick={handleMaximize} className="px-4 hover:bg-gray-700">□</button>
                      <button onClick={handleClose} className="px-4 hover:bg-red-600">×</button>
                    </div>
                  </div>
                  <Tabs orientation="vertical" variant="fullWidth" value={tabState.activeTab} sx={{ flexGrow: 1 }}>
                  {tabState && tabState.tabs.map((tab) => (
                    <Tab value={tab.id} label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {tab.title}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTabClose(tab.id);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    } onClick={() => onTabClick(tab)}/>
                  ))}
                  </Tabs>
                  <Button onClick={(e) => {
                    e.stopPropagation();
                    handleTabCreate(null, null);
                    }}>Create New Tab</Button>
                </Box>
              }
              rightContent={tabState.activeTab && (
                <ContentPanel 
                    tab={tabState.tabs.find(tab => tab.id === tabState.activeTab)}
                    onInteractionClick={onInteractionClick}
                    onInteractionExpand={onInteractionExpand} 
                    onTabUpdate={onTabUpdate}
                  />
              )}

            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mt: 1,
              mr: 1,
            }} >
            <IconButton
              onClick={() => {
                setSearchParams({ menu: "/" });
              }}
              sx={{
                top: 16,
                right: 16,
                zIndex: 1200,
              }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              onClick={handleSearchIconClick}
              sx={{
                top: 16,
                right: 16,
                zIndex: 1200,
              }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
          <Drawer
            anchor="right"
            open={Boolean(menuPath)}
            onClose={() => {
              setSearchParams({ menu: "" });
            }}
          >
            <AppMenu />
          </Drawer>
          <SearchDialog 
            open={searchDialogOpen}
            onClose={handleSearchDialogClose}
            onSearch={handleSearch}
          />
        </Box>
    </InteractionApiProvider>
  );
}

import React from "react";
import { useSearchParams } from "react-router-dom";
import ContentPanel from "./ContentPanel";
import { Drawer, IconButton, Box, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AppMenu from "./AppMenu";
import { useCurrentProfileId } from "../data/profile";
import { InteractionApiProvider } from "../contexts/interactonApi";
import { withProfileId } from "@/renderer/data/interactions";
import useTabState, { TabItem, TabState } from "../data/tabState";
import CloseIcon from "@mui/icons-material/Close";
import { BaseInteraction } from "@/shared/types/interactions";
import { DisplayInfoFactory } from "../data/tabState";


export default function MainPage() {

  const [searchParams, setSearchParams] = useSearchParams();
  const menuPath = searchParams.get("menu");
  const profileId = useCurrentProfileId();
  const interactionApi = withProfileId(profileId)(window.electron.interactions)

  const { 
    tabState,
    setTabState,
    handleTabActiveOrCreate,
    handleTabClick,
    handleTabClose,
    handleHiddenTabClick,
    handleTitleChange } = useTabState();

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

  const onHiddenTabClick = (tab: TabItem) => {
    console.log("Hidden tab clicked", tab);
    // Implement hidden tab click logic here
    handleHiddenTabClick(tab);
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

  return (
    <InteractionApiProvider interactionApi={interactionApi}>
      <Box
        sx={{
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            height: "100%",
            width: "100%",
            borderRight: "1px solid #ccc",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              width: "200px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid #ccc",
              overflowY: "auto",
              position: "relative"
            }}
          >
            {tabState && tabState.tabs.map((tab) => (
              <Box
                key={tab.id}
                onClick={() => onTabClick(tab)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  borderRight: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: tab.id === tabState.activeTab ? "#303030" : "#101010",
                  padding: "8px 16px",
                }}
              >
                <span style={{ flex: 1 }}>{tab.title}</span>
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
            <Button
              onClick={() => handleTabActiveOrCreate(null, null)}
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                width: "100%",
                textAlign: "center",
                backgroundColor: "#f5f5f5",
                borderTop: "1px solid #ccc"
              }}
            >
              新建标签
            </Button>
          </Box>
          {tabState.activeTab && (
            <Box
              sx={{
                flexGrow: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <ContentPanel 
                tab={tabState.tabs.find(tab => tab.id === tabState.activeTab)}
                onInteractionClick={onInteractionClick}
                onInteractionExpand={onInteractionExpand} 
              />
            </Box>
          )}
        </Box>
        <IconButton
          onClick={() => {
            setSearchParams({ menu: "/" });
          }}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1200,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="right"
          open={Boolean(menuPath)}
          onClose={() => {
            setSearchParams({ menu: "" });
          }}
        >
          <AppMenu />
        </Drawer>
      </Box>
    </InteractionApiProvider>
  );
}

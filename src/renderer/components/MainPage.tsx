import React from "react";
import { useSearchParams } from "react-router-dom";
import ContentPanel from "./ContentPanel";
import { Drawer, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AppMenu from "./AppMenu";
import { useCurrentProfileId } from "../data/profile";
import { InteractionApiProvider } from "../contexts/interactonApi";
import { withProfileId } from "@/renderer/data/interactions";
import useTabState, { TabItem, TabState } from "../data/tabState";
import CloseIcon from "@mui/icons-material/Close";

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
            width: "200px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #ccc",
            overflowY: "auto",
          }}
        >
          {tabState && (tabState.tabs.map((tab) => (
            <Box
              key={tab.id}
              data-key={tab.id}
              onClick={() => onTabClick(tab)}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                whiteSpace: "nowrap",
                borderRight: "1px solid rgba(0,0,0,0.12)",
                backgroundColor: tab.id === tabState.activeTab ? "#000000" : "#fff",
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
          )))}
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <ContentPanel contextId={tabState.contextId}/>
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

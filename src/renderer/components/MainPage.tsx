import React, { useRef }  from "react";
import { useSearchParams } from "react-router-dom";
import SplitView from "./SplitView";
import WebPanel, { WebPanelRef } from "./WebPanel";
import ChatPanel from "./ChatPanel";
import MessageDetailPanel from "./MessageDetailPanel/MessageDetailPanel";
import { Drawer, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AppMenu from "./AppMenu";

const matchMessageDetailUrl = (contextUrl: string): { profileId: string, messageId: string } | null => {
  if (!contextUrl) {
    return null;
  }
  const url = new URL(contextUrl);
  if (url.protocol === "echo-message:") {
    const profileId = url.pathname.split("/")[1];
    const messageId = url.pathname.split("/")[2];
    return profileId && messageId ? { profileId, messageId } : null;
  }
  return null;
}

export default function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contextUrl = searchParams.get("context");
  const menuPath = searchParams.get("menu");
  const webPanelRef = useRef<WebPanelRef>(null);

  const handleLinkClick = (url: string) => {
    setSearchParams({ context: url })
    console.log(url)
    if (url) {
      webPanelRef.current?.addTab(url);
    }
  }

  const messageDetail = matchMessageDetailUrl(contextUrl);

  return (
    <Box sx={{ height: "100%", position: "fixed", top: 0, left: 0, right: 0, bottom: 0   }}>
      <SplitView
        leftContent={
          messageDetail ? (
            <MessageDetailPanel
              profileId={messageDetail.profileId}
              messageId={messageDetail.messageId}
            />
          ) : contextUrl ? (
            <WebPanel ref={webPanelRef} />
          ) : null 
        }
        rightContent={<ChatPanel handleLinkClick={handleLinkClick} />}
      />
      <IconButton
        onClick={() => { setSearchParams({ menu: "/" }); }}
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1200,
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={Boolean(menuPath)} onClose={() => {
        setSearchParams({ menu: "" });
      }}>
        <AppMenu />
      </Drawer>
    </Box>
  );
}


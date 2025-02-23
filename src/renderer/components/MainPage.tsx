import React from "react";
import { useSearchParams } from "react-router-dom";
import SplitView from "./SplitView";
import ContentPanel from "./ContentPanel";
import ChatPanel from "./ChatPanel";
import { Drawer, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AppMenu from "./AppMenu";
import { useCurrentProfileId } from "../data/profile";
import { InteractionApiProvider } from "../contexts/interactonApi";
import { withProfileId } from "@/renderer/data/interactionsV2";

export default function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuPath = searchParams.get("menu");
  const profileId = useCurrentProfileId();
  const interactionApi = withProfileId(profileId)(window.electron.interactionsV2)

  const onLinkClicked = async (contextId: number, url: string) => {
    console.log("onLinkClicked contextId =", contextId, ", url =", url);
    
    try {
      const navs = await window.electron.interactionsV2.getNavs(profileId, { userContent: url });
      if (navs.length > 0) {
        // 如果存在，打开第一个 nav
        console.log("searchParams onLinkClicked Nav exists, opening nav:", navs[0]);
        setSearchParams({ interactionId: navs[0].id.toString() });
      } else {
        // 如果不存在，创建一个新的 nav
        const newNav = await window.electron.interactionsV2.createNav(profileId, {
          type: 'nav',
          userContent: url,
          contextId,
          title: '',
          description: '',
          favIconUrl: '',
          imageAssetId: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        console.log("searchParams onLinkClicked Created new nav:", newNav);
        setSearchParams({ interactionId: newNav.id.toString() });
      }
    } catch (error) {
      console.error("Error handling link click:", error);
    }
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
        }}
      >
        <SplitView
          leftContent={<ContentPanel />}
          rightContent={<ChatPanel onLinkClicked={onLinkClicked} />}
        />
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

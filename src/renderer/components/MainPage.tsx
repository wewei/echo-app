import React from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import SplitView from "./SplitView";
import ContentPanel from "./ContentPanel";
import ChatPanel from "./ChatPanel";
import { Drawer, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AppMenu from "./AppMenu";

export default function MainPage() {
  const { profileId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const menuPath = searchParams.get("menu");

  const handleLinkClick = (url: string) => {
    setSearchParams({ context: url });
    console.log(url)
  }

  return (
    <Box sx={{ height: "100%", position: "fixed", top: 0, left: 0, right: 0, bottom: 0   }}>
      <SplitView
        leftContent={<ContentPanel />}
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

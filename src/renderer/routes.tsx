import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import ChatPanel from "./components/ChatPage";
import SettingsPanel from "./components/SettingsPanel";
import DefaultView from "./components/DefaultView";
import AppHeader from "./components/AppHeader";
import { Box } from "@mui/material";

const Layout = () => {
  return (
    <Routes>
      <Route
        path="/profile/:profileId/*"
        element={
          <Box
            sx={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <AppHeader />
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Routes>
                <Route path="chat?" element={<ChatPanel />} />
                <Route path="settings" element={<SettingsPanel />} />
              </Routes>
            </Box>
          </Box>
        }
      />
      <Route path="*" element={<DefaultView />} />
    </Routes>
  );
};

export const AppRouter = () => {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
};

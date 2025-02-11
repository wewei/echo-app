import React from "react";
import { HashRouter, Routes, Route, useSearchParams } from "react-router-dom";

import { Box } from "@mui/material";

import ChatPanel from "./components/ChatPage";
import DefaultView from "./components/DefaultView";
import AppHeader from "./components/AppHeader";
import SettingsPanel from "./components/SettingsPanel";

const Layout = () => {
  const [searchParams] = useSearchParams();
  const menuPath = searchParams.get("menu");

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
            <AppHeader 
              showMenu={menuPath === '/'} 
              showSettings={menuPath === '/settings'} 
            />
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden'
              }}
            >
              {menuPath === '/settings' && (
                <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider' }}>
                  <SettingsPanel />
                </Box>
              )}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <ChatPanel />
              </Box>
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

import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import ChatPanel from "./components/ChatPanel";
import SettingsPanel from "./components/SettingsPanel";
import DefaultView from "./components/DefaultView";
import AppHeader from "./components/AppHeader";

const Layout = () => {
  return (
    <Routes>
      <Route
        path="/profile/:profileId/*"
        element={
          <>
            <AppHeader />
            <Routes>
              <Route path="chat" element={<ChatPanel />} />
              <Route path="settings" element={<SettingsPanel />} />
            </Routes>
          </>
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

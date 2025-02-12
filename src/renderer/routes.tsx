import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import MainPage from "./components/MainPage";
import DefaultView from "./components/DefaultView";

// Routing definition
// - /profile/:profileId?context=:contextUrl&menu=:menuPath*
// menu:
// - /
// - /settings
const Layout = () => {
  return (
    <Routes>
      <Route path="/profile/:profileId/*" element={<MainPage />} />
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

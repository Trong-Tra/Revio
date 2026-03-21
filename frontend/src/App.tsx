/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { TopNav } from "./components/layout/TopNav";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { PaperDetail } from "./pages/PaperDetail";
import { Upload } from "./pages/Upload";
import { AgentSettings } from "./pages/AgentSettings";
import { Documentation } from "./pages/Documentation";

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans selection:bg-primary/20 selection:text-primary">
      <TopNav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/research" element={<Navigate to="/" replace />} />
          <Route path="/library" element={<Navigate to="/" replace />} />
          <Route path="/paper/:id" element={<PaperDetail />} />
          <Route path="/papers/:id" element={<PaperDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/settings" element={<AgentSettings />} />
          <Route path="/agents" element={<Navigate to="/settings" replace />} />
          <Route path="/agent-settings" element={<Navigate to="/settings" replace />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/documentation" element={<Navigate to="/docs" replace />} />
        </Routes>
      </main>
      {!isLandingPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TopNav } from "./components/layout/TopNav";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { PaperDetail } from "./pages/PaperDetail";
import { Upload } from "./pages/Upload";
import { AgentSettings } from "./pages/AgentSettings";
import { Documentation } from "./pages/Documentation";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans selection:bg-primary/20 selection:text-primary">
        <TopNav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paper/:id" element={<PaperDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<AgentSettings />} />
            <Route path="/docs" element={<Documentation />} />
            {/* Fallback routes for demo purposes */}
            <Route path="/library" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

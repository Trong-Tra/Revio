/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { TopNav } from "./components/layout/TopNav";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { PaperDetail } from "./pages/PaperDetail";
import { Upload } from "./pages/Upload";
import { AgentSettings } from "./pages/AgentSettings";
import { Documentation } from "./pages/Documentation";
import ConferencesPage from "./pages/ConferencesPage";
import ConferenceDetailPage from "./pages/ConferenceDetailPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import { animationTiming, premiumEase } from "./lib/animations";

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAuthPage = ["/signin", "/signup", "/profile"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-sans selection:bg-primary/20 selection:text-primary">
      <TopNav />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: animationTiming.duration.base, ease: premiumEase }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              <Route path="/research" element={<Navigate to="/" replace />} />
              <Route path="/library" element={<Navigate to="/" replace />} />
              <Route path="/paper/:id" element={<PaperDetail />} />
              <Route path="/papers/:id" element={<PaperDetail />} />
              <Route path="/conferences" element={<ConferencesPage />} />
              <Route path="/conferences/:id" element={<ConferenceDetailPage />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/settings" element={<AgentSettings />} />
              <Route path="/agents" element={<Navigate to="/settings" replace />} />
              <Route path="/agent-settings" element={<Navigate to="/settings" replace />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/documentation" element={<Navigate to="/docs" replace />} />
              <Route path="/signin" element={<SignIn setView={() => {}} />} />
              <Route path="/signup" element={<SignUp setView={() => {}} />} />
              <Route path="/profile" element={<Profile setView={() => {}} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isLandingPage && !isAuthPage && <Footer />}
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

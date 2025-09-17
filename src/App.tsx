import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import AvatarSelection from "./pages/AvatarSelection";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Marketplace from "./pages/Marketplace";
import { Leaderboard, Spaces } from "./pages/UnderConstruction";
import "./App.css";
import { AuthContextProvider } from "./contexts/contexts";
import { useAuthContext } from "./hooks/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isCareerAssociate } from "./utils/roleUtils";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

const App: React.FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContextProvider>
          <PageRoutes />
        </AuthContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const PageRoutes = () => {
  const { isAuthenticated } = useAuthContext();
  console.log(isAuthenticated);
  const location = useLocation();

  // Check if user has career associate access
  const hasCareerAccess = isCareerAssociate();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {isAuthenticated ? (
          <>
            {/* Routes available to all authenticated users */}
            <Route
              path="/leaderboard"
              element={
                <PageTransition>
                  <Leaderboard />
                </PageTransition>
              }
            />
            <Route
              path="/spaces"
              element={
                <PageTransition>
                  <Spaces />
                </PageTransition>
              }
            />

            {hasCareerAccess ? (
              <>
                <Route
                  path="/dashboard"
                  element={
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PageTransition>
                      <Settings />
                    </PageTransition>
                  }
                />
                <Route
                  path="/marketplace"
                  element={
                    <PageTransition>
                      <Marketplace />
                    </PageTransition>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to="/spaces" />} />
              </>
            )}
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;

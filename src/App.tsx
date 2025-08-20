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
import { Leaderboard, Spaces } from "./pages/UnderConstruction";
import "./App.css";
import { AuthContextProvider } from "./contexts/contexts";
import { useAuthContext } from "./hooks/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useIsTV } from "./utils/responsive";

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
  const isTV = useIsTV();
  console.log(isAuthenticated);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {isAuthenticated ? (
          isTV ? (
            // TV Mode Routes - Only Spaces and Leaderboard
            <>
              <Route
                path="/spaces"
                element={
                  <PageTransition>
                    <Spaces />
                  </PageTransition>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <PageTransition>
                    <Leaderboard />
                  </PageTransition>
                }
              />
              {/* Redirect all other routes to Spaces in TV mode */}
              <Route path="*" element={<Navigate to="/spaces" />} />
            </>
          ) : (
            // Normal Mode Routes - All routes available
            <>
              <Route
                path="/avatar"
                element={
                  <PageTransition>
                    <AvatarSelection />
                  </PageTransition>
                }
              />
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
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </>
          )
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
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
};

export default App;

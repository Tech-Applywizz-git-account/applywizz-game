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

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {isAuthenticated ? (
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

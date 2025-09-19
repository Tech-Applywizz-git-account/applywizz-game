import React from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import TeamVsTeamGame from "../components/TeamVsTeamGame";
import { colors, spacing } from "../utils/theme";

const TeamVsTeam: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: colors.background,
      }}
    >
      <Sidebar />
      
      <main
        style={{
          flex: 1,
          marginLeft: "280px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: window.innerWidth >= 768 ? spacing["2xl"] : spacing.lg,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `radial-gradient(ellipse at center, ${colors.primary}10 0%, transparent 70%)`,
            zIndex: 1,
          }}
        />

        <motion.div
          style={{ backgroundColor: "transparent", width: "100%", height: "100%" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <TeamVsTeamGame />
        </motion.div>
      </main>
    </div>
  );
};

export default TeamVsTeam;
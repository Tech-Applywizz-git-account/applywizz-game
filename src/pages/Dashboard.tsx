import React, { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Target, TrendingUp, Calendar, Trophy, LucideIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import PhaserThanosGame from "../components/PhaserThanosGame";
import { Card, CardContent } from "../components/ui/card";
import { colors, fonts, spacing } from "../utils/theme";
import { useBackendQuery } from "../hooks/hooks";
import { isCareerAssociate, getCurrentRole } from "../utils/roleUtils";
import {
  RoleFallbackUI,
  ErrorUI,
  LoadingUI,
  NoDataUI,
} from "../components/FallbackComponents";

interface ProgressCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  delay?: number;
}

interface ProgressDataItem {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
}

const BAR_WIDTH = 600; // Wider visual bar for clarity

/**
 * Custom hook to manage Thanos HP data and death state
 */
const useThanosHP = () => {
  const {
    data: thanos,
    isLoading,
    error,
  } = useBackendQuery("thanos-hp", "/thanos-hp");

  // Fallback data for when backend is unavailable
  const fallbackData = { hp: 850, total_hp: 1000 };

  // Always use fallback data if we don't have valid backend data
  const thanosData =
    thanos && typeof thanos === "object" && thanos.hp !== undefined
      ? thanos
      : fallbackData;

  const { hp, total_hp } = thanosData as any;
  const clampedHP = Math.max(0, Math.min(hp || 0, total_hp || 1000));
  const isThanosDead = clampedHP === 0;

  return {
    hp: hp || 850,
    total_hp: total_hp || 1000,
    clampedHP,
    isThanosDead,
    isLoading: isLoading && !error && !thanos,
    error,
  };
};

const HPBar: React.FC = () => {
  const { hp, total_hp, clampedHP, isLoading } = useThanosHP();

  // Only show loading if we're actually loading and don't have an error yet
  if (isLoading) return <div>Loading...</div>;

  const fillWidth = (clampedHP / total_hp) * BAR_WIDTH;

  return (
    <motion.div
      style={{
        marginTop: spacing.xl,
        textAlign: "center",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.sm,
          width: BAR_WIDTH,
          margin: "0 auto",
        }}
      >
        <span
          style={{
            color: colors.textSecondary,
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          Power Level
        </span>
        <span
          style={{
            color: colors.textPrimary,
            fontSize: "1rem",
            fontWeight: 700,
          }}
        >
          {hp}/{total_hp}
        </span>
      </div>

      <div
        style={{
          width: BAR_WIDTH,
          height: "16px",
          backgroundColor: colors.hpBackground,
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
          margin: "0 auto",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            backgroundColor:
              clampedHP > total_hp * 0.7
                ? colors.hpFull
                : clampedHP > total_hp * 0.3
                ? colors.hpMedium
                : colors.hpLow,
            borderRadius: "8px",
            boxShadow:
              clampedHP > total_hp * 0.7
                ? `0 0 10px ${colors.hpFull}40`
                : clampedHP > total_hp * 0.3
                ? `0 0 10px ${colors.hpMedium}40`
                : `0 0 10px ${colors.hpLow}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: fillWidth }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Shimmer */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          }}
          animate={{ left: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      </div>
    </motion.div>
  );
};

const ProgressCard: React.FC<ProgressCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card hover style={{ padding: spacing.lg }}>
        <CardContent>
          {/* Apple Watch Style Ring */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Background ring */}
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: `6px solid ${color}20`,
                }}
              />

              {/* Progress ring */}
              <motion.div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: `6px solid transparent`,
                  borderTopColor: color,
                  borderRightColor: color,
                  borderBottomColor: color,
                  transform: "rotate(-90deg)",
                }}
                initial={{ clipPath: "inset(0 50% 0 0)" }}
                animate={{ clipPath: "inset(0 15% 0 0)" }}
                transition={{
                  duration: 1.5,
                  delay: delay + 0.3,
                  ease: "easeOut",
                }}
              />

              {/* Icon in center */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: `${color}20`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                <Icon size={24} style={{ color }} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "800",
                  color: colors.textPrimary,
                  marginBottom: spacing.xs,
                  fontFamily: fonts.logo,
                  lineHeight: 1,
                }}
              >
                {value}
              </div>

              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: colors.textSecondary,
                  margin: 0,
                  marginBottom: spacing.xs,
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: colors.textMuted,
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Sparkle effect */}
          <motion.div
            style={{
              position: "absolute",
              top: "10%",
              right: "10%",
              width: "6px",
              height: "6px",
              backgroundColor: color,
              borderRadius: "50%",
              boxShadow: `0 0 10px ${color}`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay,
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { scrollY } = useScroll();
  const progressY = useTransform(scrollY, [200, 500], [100, 0]);
  const progressOpacity = useTransform(scrollY, [150, 300], [0, 1]);

  const {
    data: progress_data,
    isLoading,
    error,
  } = useBackendQuery("progress", "/tasks-info");

  // Get Thanos death state for battle management
  const { isThanosDead } = useThanosHP();

  // Fallback data for when backend is unavailable
  const fallbackProgressData = {
    todays_tasks: "5",
    progress: "80% Complete",
    weeks_tasks: "23",
    weeks_progress: "92% Complete",
    months_tasks: "87",
    months_progress: "78% Complete",
    all_time_tasks: "342",
  };

  const data = error || !progress_data ? fallbackProgressData : progress_data;

  const {
    todays_tasks,
    progress,
    weeks_tasks,
    weeks_progress,
    months_tasks,
    months_progress,
    all_time_tasks,
  } = data as any;

  const progressData: ProgressDataItem[] = [
    {
      icon: Target,
      title: "Today's Tasks",
      value: todays_tasks,
      ...(progress > 0 ? { subtitle: progress } : {}),
      color: colors.success,
    },
    {
      icon: TrendingUp,
      title: "This Week",
      value: weeks_tasks,
      ...(progress > 0 ? { subtitle: weeks_progress } : {}),
      color: colors.primary,
    },
    {
      icon: Calendar,
      title: "This Month",
      value: months_tasks,
      ...(progress > 0 ? { subtitle: months_progress } : {}),
      color: colors.secondary,
    },
    {
      icon: Trophy,
      title: "All Time",
      value: all_time_tasks,
      subtitle: "Keep Working Hard",
      color: colors.primary,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        display: "flex",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          marginLeft: window.innerWidth >= 1024 ? "280px" : "0",
          position: "relative",
        }}
      >
        {/* Hero Section - Full Height */}
        <div
          style={{
            height: "100vh",
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

          <HPBar />
          <motion.div
            style={{ backgroundColor: "transparent", padding: "20px" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.3 }}
          >
            <PhaserThanosGame isThanosDead={isThanosDead} />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            style={{
              position: "absolute",
              bottom: spacing["2xl"],
              left: "50%",
              transform: "translateX(-50%)",
            }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div
              style={{
                width: "2px",
                height: "40px",
                backgroundColor: colors.primary,
                borderRadius: "1px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: 0,
                  width: "100%",
                  height: "20px",
                  backgroundColor: colors.primaryLight,
                  borderRadius: "1px",
                }}
                animate={{ top: ["−20px", "40px"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Progress Section - Separate scrollable area with improved styling */}
        <motion.div
          style={{
            y: progressY,
            opacity: progressOpacity,
            padding: window.innerWidth >= 768 ? spacing["2xl"] : spacing.lg,
            backgroundColor: colors.background,
            position: "relative",
            zIndex: 10,
            minHeight: "100vh",
            borderTop: `1px solid ${colors.surfaceLight}20`,
            background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface}20 50%, ${colors.background} 100%)`,
          }}
        >
          <motion.div
            style={{
              textAlign: "center",
              marginBottom: spacing["3xl"],
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h1
              style={{
                fontSize: window.innerWidth >= 768 ? "2.5rem" : "2rem",
                fontWeight: "800",
                color: colors.textPrimary,
                margin: 0,
                marginBottom: spacing.lg,
                background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.primaryLight} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Welcome Back, Hero
            </motion.h1>
            <motion.p
              style={{
                fontSize: window.innerWidth >= 768 ? "1.2rem" : "1rem",
                color: colors.textSecondary,
                margin: 0,
                marginBottom: spacing.lg,
                lineHeight: 1.6,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Ready to balance productivity and achieve perfectly balanced
              goals?
            </motion.p>
            <h2
              style={{
                fontSize: window.innerWidth >= 768 ? "2rem" : "1.5rem",
                fontWeight: "700",
                color: colors.textPrimary,
                margin: 0,
                marginBottom: spacing.md,
                fontFamily: fonts.logo,
              }}
            >
              Today's Progress
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: colors.textSecondary,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Track your journey towards perfect balance
            </p>
          </motion.div>

          {/* Progress Grid - Responsive and Centered */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {/* Role-based conditional rendering for progress cards */}
            {isCareerAssociate() ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    window.innerWidth >= 1024
                      ? "repeat(2, minmax(300px, 400px))"
                      : window.innerWidth >= 640
                      ? "repeat(2, 1fr)"
                      : "1fr",
                  gap: window.innerWidth >= 768 ? spacing.xl : spacing.lg,
                  marginBottom: spacing["3xl"],
                  justifyContent: "center",
                  width: "100%",
                  maxWidth: "900px",
                }}
              >
                {/* Show progress cards based on data availability */}
                {error ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <ErrorUI
                      error={error.message || "Failed to load progress data"}
                      onRetry={() => window.location.reload()}
                    />
                  </div>
                ) : isLoading ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <LoadingUI
                      type="skeleton"
                      message="Loading your progress data..."
                    />
                  </div>
                ) : !progress_data ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <NoDataUI
                      title="No Progress Data"
                      message="We couldn't find any progress data. Start completing tasks to see your progress here!"
                    />
                  </div>
                ) : (
                  progressData.map((item, index) => (
                    <ProgressCard
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      value={item.value}
                      subtitle={item.subtitle as string}
                      color={item.color}
                      delay={index * 0.1}
                    />
                  ))
                )}
              </div>
            ) : (
              <div style={{ width: "100%", maxWidth: "900px" }}>
                <RoleFallbackUI
                  title="Progress Dashboard"
                  message={`Hi there! This detailed progress tracking is available for career associates. Your current role is "${
                    getCurrentRole() || "not set"
                  }". Contact your admin to update your access level.`}
                />
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

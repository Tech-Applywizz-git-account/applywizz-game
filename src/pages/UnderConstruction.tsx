import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Construction, User } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Sidebar";
import FloatingNavbar from "../components/FloatingNavbar";
import Avatar from "../components/Avatar";
import { Card } from "../components/ui/card";
import { colors, fonts, spacing } from "../utils/theme";
import { useAuthContext, useBackendQuery } from "../hooks/hooks";
import { decodeJwt } from "jose";
import FourPlayerArena from "../components/fourplayer";
import { isCareerAssociate } from "../utils/roleUtils";
import { getDisplayAvatar } from "../utils/avatarUtils";

interface UnderConstructionProps {
  title: string;
  description: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title,
  description,
}) => {
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.xl,
        }}
      >
        <motion.div
          style={{
            textAlign: "center",
            maxWidth: "600px",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            style={{
              width: "120px",
              height: "120px",
              margin: `0 auto ${spacing["2xl"]} auto`,
              backgroundColor: colors.surface,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${colors.surfaceLight}`,
            }}
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Construction size={48} style={{ color: colors.secondary }} />
          </motion.div>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing.lg,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: colors.textSecondary,
              margin: 0,
              marginBottom: spacing.md,
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>

          <p
            style={{
              fontSize: "1rem",
              color: colors.textMuted,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            We're working hard to bring you amazing features. Stay tuned!
          </p>

          <motion.div
            style={{
              marginTop: spacing["2xl"],
              display: "flex",
              justifyContent: "center",
              gap: spacing.sm,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: colors.secondary,
                  borderRadius: "50%",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: dot * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

// Settings Component
export const Settings: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("week");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { token } = useAuthContext();
  const role = localStorage.getItem("role");

  const user = decodeJwt(token as string);

  // Fetch user graph data from API
  const { data: chartData, isLoading: chartLoading } = useBackendQuery(
    ["user-graph", selectedTimeRange],
    `/user-graph?data=${selectedTimeRange}`
  );

  const chartExists = Array.isArray((chartData as any)?.user_data);

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
  };

  const timeRangeOptions = [
    { value: "week", label: "Last Week" },
    { value: "30days", label: "Last 30 Days" },
    { value: "all_time", label: "All Time" },
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
          padding: spacing["2xl"],
          display: "flex",
          justifyContent: "center",
        }}
      >
        <motion.div
          style={{
            width: "100%",
            maxWidth: "900px",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: spacing["2xl"],
              fontFamily: fonts.logo,
              textAlign: "center",
            }}
          >
            Settings
          </h1>

          {/* Central Profile Card */}
          <Card
            style={{
              padding: spacing["3xl"],
              textAlign: "center",
              marginBottom: spacing.xl,
            }}
          >
            {/* Centered Avatar */}
            <motion.div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: spacing.xl,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Avatar
                id={getDisplayAvatar().id}
                size={120}
                showStatus={true}
                style={{
                  boxShadow: `0 8px 32px ${colors.primary}40`,
                }}
              />
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  margin: 0,
                  marginBottom: spacing.xs,
                }}
              >
                {user.name as string}
              </h2>
              <p
                style={{
                  color: colors.textSecondary,
                  margin: 0,
                  fontSize: "1rem",
                  marginBottom: spacing["2xl"],
                }}
              >
                {user.email as string}
              </p>
            </motion.div>
          </Card>

          {/* Your Selected Role Section - Enhanced */}
          <Card
            style={{
              padding: spacing["2xl"],
              marginBottom: spacing.xl,
              background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}05 100%)`,
              border: `1px solid ${colors.primary}20`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                marginBottom: spacing.lg,
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <motion.div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: colors.primary,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <User size={18} style={{ color: colors.textPrimary }} />
                </motion.div>
                Your Selected Role
              </h3>
            </div>

            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.lg,
                padding: spacing.lg,
                backgroundColor: `${colors.surface}80`,
                borderRadius: "12px",
                border: `1px solid ${colors.surfaceLight}`,
              }}
              whileHover={{ backgroundColor: `${colors.surface}90` }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: colors.secondary,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: colors.textPrimary,
                  boxShadow: `0 4px 12px ${colors.secondary}40`,
                }}
              >
                🎯
              </div>

              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: colors.textPrimary,
                    margin: 0,
                    marginBottom: spacing.xs,
                  }}
                >
                  {role || "No role selected"}
                </h4>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: colors.textSecondary,
                    margin: 0,
                    marginBottom: spacing.xs,
                  }}
                >
                  Your selected role for personalized experience
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: spacing.xs,
                    flexWrap: "wrap",
                  }}
                >
                  {["Goal Tracking", "Time Management", "Analytics"].map(
                    (skill) => (
                      <span
                        key={skill}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: `${colors.primary}20`,
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: colors.primary,
                        }}
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </Card>
          <Card
            style={{
              padding: spacing["2xl"],
              marginBottom: spacing.xl,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.xl,
                flexWrap: "wrap",
                gap: spacing.md,
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: colors.textPrimary,
                  margin: 0,
                }}
              >
                Progress Overview
              </h3>

              {/* Time Range Selector */}
              <div
                style={{
                  display: "flex",
                  gap: spacing.sm,
                  flexWrap: "wrap",
                }}
              >
                {timeRangeOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleTimeRangeChange(option.value)}
                    disabled={chartLoading}
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor:
                        selectedTimeRange === option.value
                          ? colors.primary
                          : colors.surfaceLight,
                      color:
                        selectedTimeRange === option.value
                          ? colors.textPrimary
                          : colors.textSecondary,
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: chartLoading ? "not-allowed" : "pointer",
                      opacity: chartLoading ? 0.6 : 1,
                      transition: "all 0.2s ease",
                    }}
                    whileHover={
                      !chartLoading
                        ? {
                            backgroundColor:
                              selectedTimeRange === option.value
                                ? colors.primaryDark
                                : colors.surface,
                          }
                        : {}
                    }
                    whileTap={!chartLoading ? { scale: 0.95 } : {}}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chart Container */}
            <motion.div
              style={{
                height: "400px",
                width: "100%",
                position: "relative",
                opacity: chartLoading ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: chartLoading ? 0.5 : 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {chartLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                >
                  <motion.div
                    style={{
                      width: "32px",
                      height: "32px",
                      border: `3px solid ${colors.surfaceLight}`,
                      borderTop: `3px solid ${colors.primary}`,
                      borderRadius: "50%",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              )}

              {chartExists && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={(chartData as any)?.user_data || []}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={colors.surfaceLight}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={colors.textSecondary}
                      fontSize={12}
                    />
                    <YAxis stroke={colors.textSecondary} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.surfaceLight}`,
                        borderRadius: "8px",
                        color: colors.textPrimary,
                        fontSize: "0.875rem",
                      }}
                      labelStyle={{ color: colors.textSecondary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke={colors.primary}
                      strokeWidth={3}
                      dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: colors.primaryLight }}
                      name="Tasks Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Chart Legend */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: spacing.xl,
                marginTop: spacing.lg,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: colors.primary,
                    borderRadius: "50%",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: colors.textSecondary,
                  }}
                >
                  Tasks Completed
                </span>
              </div>
            </div>
          </Card>

          {/* Logout Section */}
          <Card
            style={{
              padding: spacing["2xl"],
              border: `1px solid ${colors.error}20`,
              backgroundColor: `${colors.error}05`,
            }}
          >
            <motion.button
              style={{
                width: "100%",
                padding: spacing.lg,
                backgroundColor: "transparent",
                border: `2px solid ${colors.error}`,
                borderRadius: "12px",
                color: colors.error,
                fontSize: "1rem",
                fontWeight: "600",
                fontFamily: fonts.body,
                cursor: "pointer",
              }}
              whileHover={{ backgroundColor: `${colors.error}10` }}
              whileTap={{ scale: 0.98 }}
            >
              Logout
            </motion.button>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

type TabType = "team" | "individual";
type PeriodType = "today" | "week" | "this_month" | "all_time";

type individualEntry = {
  username: string;
  user_score: string;
};

type PersonalProgress = {
  rank: string;
  name: string;
  score: string;
  totalParticipants: string;
};

type teamEntry = {
  team_name: string;
  team_score: string;
};

type LeaderboardEntry = individualEntry | teamEntry;
// Leaderboard Component
export const Leaderboard: React.FC = () => {
  const hasCareerAccess = isCareerAssociate();

  const [activeTab, setActiveTab] = useState<TabType>("team");
  // For non-access users, always set period to "today"
  const [period, setPeriod] = useState<PeriodType>("today");

  const endpoint = `/leaderboard?data=${period}&type=${activeTab}`;

  const { data, isLoading } = useBackendQuery(
    ["leaderboard", activeTab, period],
    endpoint
  );
  console.log(data);

  const leaderboardData =
    (activeTab === "team"
      ? (
          data as {
            teams: LeaderboardEntry[];
            personal_progress: PersonalProgress;
          }
        )?.teams
      : (
          data as {
            individuals: LeaderboardEntry[];
            personal_progress: PersonalProgress;
          }
        )?.individuals) || [];

  const personalProgress = {
    rank: (data as any)?.personal_progress?.rank,
    totalParticipants: (data as any)?.personal_progress?.totalParticipants,
    name: (data as any)?.personal_progress?.name,
    score: (data as any)?.personal_progress?.score,
    completedTasks: (data as any)?.personal_progress?.score,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        display: "flex",
      }}
    >
      {/* Conditional navigation - Sidebar for career associates, FloatingNavbar for others */}
      {hasCareerAccess ? <Sidebar /> : <FloatingNavbar />}

      <main
        style={{
          flex: 1,
          marginLeft:
            hasCareerAccess && window.innerWidth >= 1024 ? "280px" : "0",
          padding: spacing["2xl"],
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: spacing["2xl"],
              fontFamily: fonts.logo,
            }}
          >
            Leaderboard
          </h1>

          {/* Personal Progress - Only for career associates */}
          {hasCareerAccess && (
            <Card
              style={{
                marginBottom: spacing.xl,
                background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}05 100%)`,
                border: `1px solid ${colors.primary}20`,
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  marginBottom: spacing.lg,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <Avatar
                  id={getDisplayAvatar().id}
                  size={32}
                  style={{
                    border: `2px solid ${colors.primary}`,
                  }}
                />
                My Progress
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: spacing.lg,
                }}
              >
                {/* Rank Card */}
                <Card>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "2rem",
                        color: colors.primary,
                        fontWeight: "700",
                      }}
                    >
                      #{personalProgress.rank ?? "NA"}
                    </div>
                    <div>Current Rank</div>
                    <div style={{ color: colors.textMuted }}>
                      of {personalProgress?.totalParticipants ?? "NA"}{" "}
                      {activeTab === "team" ? "teams" : "players"}
                    </div>
                  </div>
                </Card>

                {/* Tasks Card */}
                <Card>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "2rem",
                        color: colors.success,
                        fontWeight: "700",
                      }}
                    >
                      {personalProgress?.completedTasks ?? "NA"}
                    </div>
                    <div>Tasks Completed</div>

                    <div style={{ color: colors.textMuted }}>
                      {personalProgress?.completedTasks != null
                        ? `${Math.round(
                            personalProgress.completedTasks
                          )} completed`
                        : "NA"}
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {/* Tabs & Period Toggles */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            {/* Tabs */}
            <Card style={{ display: "flex", padding: "4px" }}>
              {[
                { id: "team", label: "Teams" },
                { id: "individual", label: "Individuals" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    padding: spacing.md,
                    backgroundColor:
                      activeTab === tab.id ? colors.primary : "transparent",
                    color:
                      activeTab === tab.id
                        ? colors.textPrimary
                        : colors.textSecondary,
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </Card>

            {/* Period Toggle - Only for career associates */}
            {false && (
              <Card style={{ display: "flex", padding: "4px" }}>
                {[
                  { id: "today", label: "Today" },
                  { id: "week", label: "Week" },
                  { id: "this_month", label: "Month" },
                  { id: "all_time", label: "All Time" },
                ].map((p) => (
                  <motion.button
                    key={p.id}
                    onClick={() => setPeriod(p.id as PeriodType)}
                    style={{
                      padding: spacing.md,
                      backgroundColor:
                        period === p.id ? colors.primary : "transparent",
                      color:
                        period === p.id
                          ? colors.textPrimary
                          : colors.textSecondary,
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </Card>
            )}
          </div>

          {/* Leaderboard */}
          <Card style={{ padding: 0, maxHeight: "600px", overflowY: "auto" }}>
            {isLoading ? (
              <div style={{ padding: spacing.lg, textAlign: "center" }}>
                Loading...
              </div>
            ) : leaderboardData.length === 0 ? (
              <div style={{ padding: spacing.lg, textAlign: "center" }}>
                No data available.
              </div>
            ) : (
              leaderboardData.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: spacing.lg,
                    borderBottom:
                      index < leaderboardData.length - 1
                        ? `1px solid ${colors.surfaceLight}`
                        : "none",
                    backgroundColor:
                      index + 1 <= 3 ? `${colors.primary}10` : "transparent",
                  }}
                >
                  <div style={{ width: "50px", textAlign: "center" }}>
                    {index + 1 <= 3 ? (
                      ["🥇", "🥈", "🥉"][index]
                    ) : (
                      <span
                        style={{ fontWeight: 700, color: colors.textSecondary }}
                      >
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, marginLeft: spacing.md }}>
                    <h3 style={{ margin: 0 }}>
                      {activeTab === "team"
                        ? (entry as any).team_name
                        : (entry as any).username}
                    </h3>
                  </div>
                  <div style={{ fontWeight: "700" }}>
                    {activeTab === "team"
                      ? (entry as any).team_score
                      : (entry as any).user_score}{" "}
                    tasks
                  </div>
                </div>
              ))
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

const BAR_WIDTH = 600; // Wider visual bar for clarity

const useHP = () => {
  const {
    data: teamHP,
    error,
    isLoading,
  } = useBackendQuery("team-hp", "/team-hp");

  const fallbackData = { hp: 750, total_hp: 1000 };

  const hpData =
    teamHP && typeof teamHP === "object" && teamHP.hp !== undefined
      ? teamHP
      : fallbackData;

  const { hp, total_hp } = hpData as any;

  const clampedHP = Math.max(0, Math.min(hp || 0, total_hp || 1000));

  return {
    hp,
    total_hp,
    clampedHP,
    isLoading,
  };
};
/**
 * Team HP Bar component for non-access users in Spaces
 */
const TeamHPBar: React.FC = () => {
  const { hp, total_hp, clampedHP, isLoading } = useHP();

  // Fallback data for when backend is unavailable

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
          Team Power Level
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
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

export const Spaces: React.FC = () => {
  const { hp } = useHP();

  const hasDesktopSidebar =
    typeof window !== "undefined" && window.innerWidth >= 1024;
  const hasCareerAccess = isCareerAssociate();

  // Fetch top-four data for non-access users - properly handle loading state
  const {
    data: topFourData,
    isLoading: topFourLoading,
    error: topFourError,
  } = useBackendQuery("top-four", "/top-four");

  // Prepare players data for FourPlayerArena
  const getPlayersData = () => {
    if (topFourData && Array.isArray(topFourData.users)) {
      // Extract usernames from top-four API response and map to players
      const users = topFourData.users.slice(0, 4); // Ensure we only get 4 users
      const characterIds = ["samurai", "shinobi", "samurai2", "samuraiArcher"];

      return users.map((user: any, index: number) => ({
        uname: user.username || `User${index + 1}`,
        characterId: characterIds[index] || "samurai",
      }));
    }

    // Default fallback data for career associates or when API fails
    return [
      { uname: "u1", characterId: "samurai" },
      { uname: "u2", characterId: "shinobi" },
      { uname: "u3", characterId: "samurai2" },
      { uname: "u4", characterId: "samuraiArcher" },
    ];
  };

  // Only get players data if we have loaded the top-four data or if user is career associate
  const shouldLoadContent = hasCareerAccess || !topFourLoading;
  const playersData = shouldLoadContent ? getPlayersData() : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        display: "flex",
      }}
    >
      {/* Conditional navigation - Sidebar for career associates, FloatingNavbar for others */}
      {hasCareerAccess ? <Sidebar /> : <FloatingNavbar />}

      <main
        style={{
          flex: 1,
          marginLeft: hasCareerAccess && hasDesktopSidebar ? "280px" : "0",
          padding: 0, // no inner padding – let the game go full-bleed
          display: "flex",
          position: "relative",
        }}
      >
        {/* HP Bar Overlay for non-access users */}

        <div
          style={{
            position: "absolute",
            top: "80px", // Below the floating navbar
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10, // Ensure it's on top of the game
          }}
        >
          <TeamHPBar />
        </div>

        <Card
          fullBleed
          hover={false}
          // keep the rounded container, hide overflow so the canvas clips cleanly
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
            borderRadius: 16,
            overflow: "hidden",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Show loading state for non-career associates while top-four data loads */}
          {!hasCareerAccess && topFourLoading ? (
            <div
              style={{
                color: colors.textPrimary,
                fontSize: "1.2rem",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Loading arena...
            </div>
          ) : (
            /* FourPlayer arena with dynamic players data - only render when data is ready */
            <FourPlayerArena players={playersData as any} bossHp={hp} />
          )}
        </Card>
      </main>
    </div>
  );
};

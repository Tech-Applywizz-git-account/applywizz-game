import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
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
import Avatar, { AvatarData } from "../components/Avatar";
import { Card } from "../components/ui/card";
import { colors, fonts, spacing } from "../utils/theme";
import { useAuthContext, useBackendQuery } from "../hooks/hooks";
import { decodeJwt } from "jose";
import { isCareerAssociate, getCurrentRole } from "../utils/roleUtils";
import {
  RoleFallbackUI,
  ErrorUI,
  LoadingUI,
  NoDataUI,
} from "../components/FallbackComponents";
import { useNavigate } from "react-router-dom";

const Settings: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("week");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null);
  const navigator = useNavigate();

  const { logout } = useAuthContext();
  const role = localStorage.getItem("role");

  // Load avatar from localStorage on component mount
  useEffect(() => {
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) {
      try {
        const parsedAvatar = JSON.parse(storedAvatar);
        // Handle both old format (with color/pattern) and new format (just id)
        if (typeof parsedAvatar === "object" && parsedAvatar.id) {
          setSelectedAvatar({ id: parsedAvatar.id });
        } else if (typeof parsedAvatar === "number") {
          setSelectedAvatar({ id: parsedAvatar });
        }
      } catch (error) {
        console.error("Failed to parse stored avatar:", error);
      }
    }
  }, []);

  // Fetch user graph data from API
  const { data: chartData, isLoading: chartLoading } = useBackendQuery(
    ["user-graph", selectedTimeRange],
    `/user-graph?data=${selectedTimeRange}`
  );

  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useBackendQuery(["user-info"], "/user-info");

  const chartExists = Array.isArray((chartData as any)?.user_data);

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
  };

  const timeRangeOptions = [
    { value: "week", label: "Last Week" },
    { value: "30days", label: "Last 30 Days" },
    { value: "all_time", label: "All Time" },
  ];

  const renderAvatar = () => {
    if (selectedAvatar) {
      return (
        <Avatar
          id={selectedAvatar.id}
          size={120}
          showStatus={true}
          style={{
            boxShadow: `0 8px 32px rgba(139, 92, 246, 0.4)`,
          }}
        />
      );
    }

    // Default fallback avatar (the "MZ circle")
    return (
      <div
        style={{
          width: "120px",
          height: "120px",
          backgroundColor: colors.primary,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          fontWeight: "700",
          color: colors.textPrimary,
          position: "relative",
          boxShadow: `0 8px 32px ${colors.primary}40`,
        }}
      >
        MZ
        {/* Status indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            width: "24px",
            height: "24px",
            backgroundColor: colors.success,
            borderRadius: "50%",
            border: `3px solid ${colors.surface}`,
          }}
        />
      </div>
    );
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
              {renderAvatar()}
            </motion.div>

            {/* User Info */}
            {userLoading ? (
              <div style={{ height: 64 }} /> // skeleton placeholder if you want
            ) : userError ? (
              <p style={{ color: colors.error }}>Failed to load user info</p>
            ) : !userData ? (
              <p style={{ color: colors.textSecondary }}>No user info</p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: colors.textPrimary,
                    margin: 0,
                    marginBottom: spacing.xs,
                  }}
                >
                  {(userData as any)?.username}
                </h2>
                <p
                  style={{
                    color: colors.textSecondary,
                    margin: 0,
                    fontSize: "1rem",
                  }}
                >
                  {(userData as any)?.email}
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    margin: 0,
                    fontSize: "1rem",
                    marginBottom: spacing["2xl"],
                  }}
                >
                  ({(userData as any)?.team})
                </p>
              </motion.div>
            )}
          </Card>
          {/* Avatar Info Section - Show when custom avatar is selected */}
          {selectedAvatar && (
            <Card
              style={{
                padding: spacing["2xl"],
                marginBottom: spacing.xl,
                background: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)`,
                border: `1px solid rgba(139, 92, 246, 0.2)`,
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
                    <span style={{ fontSize: "18px" }}>👤</span>
                  </motion.div>
                  Your Selected Avatar
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
                <Avatar
                  id={selectedAvatar.id}
                  size={60}
                  style={{
                    boxShadow: `0 4px 12px rgba(139, 92, 246, 0.4)`,
                  }}
                />

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
                    Premium Avatar #{selectedAvatar.id}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: colors.textSecondary,
                      margin: 0,
                      marginBottom: spacing.xs,
                    }}
                  >
                    High-quality avatar • Personalized style
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: spacing.xs,
                      flexWrap: "wrap",
                    }}
                  >
                    {["Unique Design", "Premium Quality", "Personal Style"].map(
                      (feature) => (
                        <span
                          key={feature}
                          style={{
                            padding: `${spacing.xs} ${spacing.sm}`,
                            backgroundColor: `rgba(139, 92, 246, 0.2)`,
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: colors.primary,
                          }}
                        >
                          {feature}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            </Card>
          )}

          {/* Your Selected Role Section */}
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
                  <SettingsIcon
                    size={18}
                    style={{ color: colors.textPrimary }}
                  />
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

          {/* Progress Overview Card - Role-based conditional rendering */}
          {isCareerAssociate() ? (
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

              {/* Chart Container with enhanced error handling */}
              <motion.div
                style={{
                  height: "400px",
                  width: "100%",
                  position: "relative",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {chartLoading ? (
                  <LoadingUI
                    type="skeleton"
                    message="Loading your progress chart..."
                  />
                ) : !chartData ? (
                  <NoDataUI
                    title="No Chart Data"
                    message="We couldn't find any chart data for the selected time range. Try a different time period or complete some tasks to see your progress."
                  />
                ) : !chartExists ? (
                  <ErrorUI error="Invalid chart data format received from server" />
                ) : (
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
          ) : (
            <RoleFallbackUI
              title="Progress Analytics"
              message={`Advanced progress analytics are available for career associates. Your current role is "${
                getCurrentRole() || "not set"
              }". Contact your admin to access detailed analytics.`}
            />
          )}

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
              onClick={() => {
                logout();
                setTimeout(() => {
                  navigator("/");
                }, 2000);
              }}
            >
              Logout
            </motion.button>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;

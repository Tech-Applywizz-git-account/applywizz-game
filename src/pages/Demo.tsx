import React from "react";
import { motion } from "framer-motion";
import AnimatedAvatar from "../components/AnimatedAvatar";
import { Card } from "../components/ui/card";
import { colors, fonts, spacing } from "../utils/theme";
import { getBadgeImagePath } from "../utils/badgeUtils";

/**
 * Demo component to showcase the badge PNG and animated avatar implementations
 * This component demonstrates the changes made to the leaderboard without requiring authentication
 */
const Demo: React.FC = () => {
  const mockBadges = ["Bronze", "Silver", "Gold", "Diamond", "Ruby", "Emerald", "Sapphire", "Baahubali"];
  const mockSprites = ["Fighter", "Girl_1", "Samurai", "Shinobi", "Pyromancer_1"];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        padding: spacing["2xl"],
      }}
    >
      <motion.div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: spacing["2xl"],
            textAlign: "center",
            fontFamily: fonts.logo,
          }}
        >
          Badge & Avatar Implementation Demo
        </h1>
        
        <p
          style={{
            fontSize: "1.1rem",
            color: colors.textSecondary,
            marginBottom: spacing["2xl"],
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          This demo showcases the implementation of badge PNG images and animated avatar sections for the leaderboard
        </p>

        {/* Badge PNG Demo Section */}
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
            }}
          >
            🏆 Badge PNG Implementation
          </h2>
          
          <p
            style={{
              color: colors.textSecondary,
              marginBottom: spacing.lg,
            }}
          >
            All badge text instances have been replaced with corresponding PNG images from the <code>/assets/Badges/</code> folder:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: spacing.lg,
            }}
          >
            {mockBadges.map((badgeName) => {
              const badgeImagePath = getBadgeImagePath(badgeName);
              return (
                <Card key={badgeName}>
                  <div style={{ textAlign: "center" }}>
                    {badgeImagePath ? (
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: spacing.sm }}>
                        <img
                          src={badgeImagePath}
                          alt={`${badgeName} Badge`}
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "contain",
                            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "2rem",
                          color: colors.secondary,
                          fontWeight: "700",
                        }}
                      >
                        {badgeName}
                      </div>
                    )}
                    <div style={{ fontSize: "0.9rem", color: colors.textSecondary }}>
                      {badgeName} Badge
                    </div>
                    <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>
                      {badgeImagePath ? "PNG Image" : "Text Fallback"}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Animated Avatar Demo Section */}
        <Card
          style={{
            marginBottom: spacing.xl,
            background: `linear-gradient(135deg, ${colors.secondary}10 0%, ${colors.primary}05 100%)`,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: colors.textPrimary,
              marginBottom: spacing.lg,
            }}
          >
            👾 Animated Avatar Implementation
          </h2>
          
          <p
            style={{
              color: colors.textSecondary,
              marginBottom: spacing.lg,
            }}
          >
            New animated avatar section shows the user's selected avatar playing idle animation. Fallback to Fighter if no sprite is selected:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.lg,
            }}
          >
            {mockSprites.map((spriteName) => (
              <Card key={spriteName}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: spacing.sm }}>
                    <AnimatedAvatar
                      sprite={spriteName}
                      size={64}
                      style={{
                        border: `2px solid ${colors.primary}20`,
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${colors.primary}05 0%, ${colors.secondary}05 100%)`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.9rem", color: colors.textSecondary }}>
                    {spriteName}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>
                    Idle Animation
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Leaderboard Personal Progress Mockup */}
        <Card
          style={{
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
            }}
          >
            📊 Leaderboard Personal Progress (Mockup)
          </h2>
          
          <p
            style={{
              color: colors.textSecondary,
              marginBottom: spacing.lg,
            }}
          >
            This is how the enhanced leaderboard Personal Progress section looks with the new implementations:
          </p>

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
                  #5
                </div>
                <div>Current Rank</div>
                <div style={{ color: colors.textMuted }}>
                  of 150 players
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
                  42
                </div>
                <div>Tasks Completed</div>
                <div style={{ color: colors.textMuted }}>
                  42 completed
                </div>
              </div>
            </Card>

            {/* Badge Card with PNG */}
            <Card>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: spacing.sm }}>
                  <img
                    src={getBadgeImagePath("Gold")!}
                    alt="Gold Badge"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "contain",
                      filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
                    }}
                  />
                </div>
                <div>Current Badge</div>
                <div style={{ color: colors.textMuted }}>
                  Active
                </div>
              </div>
            </Card>

            {/* Animated Avatar Card */}
            <Card>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: spacing.sm }}>
                  <AnimatedAvatar
                    sprite="Samurai"
                    size={48}
                    style={{
                      border: `2px solid ${colors.primary}20`,
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${colors.primary}05 0%, ${colors.secondary}05 100%)`,
                    }}
                  />
                </div>
                <div>Selected Avatar</div>
                <div style={{ color: colors.textMuted }}>
                  Playing idle animation
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Demo;
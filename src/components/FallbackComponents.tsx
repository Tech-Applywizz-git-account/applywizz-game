import React from "react";
import { motion } from "framer-motion";
import { ShieldOff, AlertCircle, Loader2, FileX } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { colors, fonts, spacing } from "../utils/theme";

interface FallbackUIProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Fallback UI component for non-career-associate roles
 */
export const RoleFallbackUI: React.FC<FallbackUIProps> = ({ 
  title, 
  message, 
  icon = <ShieldOff size={48} />,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card style={{ padding: spacing["2xl"], textAlign: "center" }}>
        <CardContent>
          <motion.div
            style={{
              width: "80px",
              height: "80px",
              margin: `0 auto ${spacing.xl} auto`,
              backgroundColor: colors.surfaceLight,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${colors.surfaceLight}`,
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div style={{ color: colors.textMuted }}>
              {icon}
            </div>
          </motion.div>

          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing.md,
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: "1rem",
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.6,
              marginBottom: spacing.lg,
            }}
          >
            {message}
          </p>

          <div
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: `${colors.secondary}20`,
              borderRadius: "8px",
              fontSize: "0.875rem",
              color: colors.textMuted,
              display: "inline-flex",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <ShieldOff size={14} />
            Access restricted to career associates
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Error UI component for backend errors
 */
export const ErrorUI: React.FC<{ error: string; onRetry?: () => void }> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card 
        style={{ 
          padding: spacing["2xl"], 
          textAlign: "center",
          border: `1px solid ${colors.error}30`,
          backgroundColor: `${colors.error}05`
        }}
      >
        <CardContent>
          <motion.div
            style={{
              width: "80px",
              height: "80px",
              margin: `0 auto ${spacing.xl} auto`,
              backgroundColor: `${colors.error}20`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${colors.error}40`,
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <AlertCircle size={48} style={{ color: colors.error }} />
          </motion.div>

          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing.md,
            }}
          >
            Something went wrong
          </h3>

          <p
            style={{
              fontSize: "1rem",
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.6,
              marginBottom: spacing.lg,
            }}
          >
            We encountered an error while loading your data.
          </p>

          <div
            style={{
              padding: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: "8px",
              fontSize: "0.875rem",
              color: colors.textMuted,
              marginBottom: spacing.lg,
              fontFamily: "monospace",
              textAlign: "left",
              border: `1px solid ${colors.surfaceLight}`,
            }}
          >
            Error: {error}
          </div>

          {onRetry && (
            <motion.button
              onClick={onRetry}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                backgroundColor: colors.primary,
                color: colors.textPrimary,
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.xs,
              }}
              whileHover={{ backgroundColor: colors.primaryDark }}
              whileTap={{ scale: 0.95 }}
            >
              Try again
            </motion.button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Loading UI component with skeleton or spinner
 */
export const LoadingUI: React.FC<{ 
  type?: "skeleton" | "spinner";
  message?: string;
}> = ({ 
  type = "spinner", 
  message = "Loading..." 
}) => {
  if (type === "skeleton") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card style={{ padding: spacing["2xl"] }}>
          <CardContent>
            {/* Skeleton content */}
            <div style={{ display: "flex", alignItems: "center", gap: spacing.lg, marginBottom: spacing.lg }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: colors.surfaceLight,
                  borderRadius: "50%",
                  opacity: 0.7,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: "20px",
                    backgroundColor: colors.surfaceLight,
                    borderRadius: "4px",
                    marginBottom: spacing.sm,
                    opacity: 0.7,
                  }}
                />
                <div
                  style={{
                    height: "16px",
                    backgroundColor: colors.surfaceLight,
                    borderRadius: "4px",
                    width: "70%",
                    opacity: 0.5,
                  }}
                />
              </div>
            </div>
            
            {/* Multiple skeleton lines */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: "12px",
                  backgroundColor: colors.surfaceLight,
                  borderRadius: "4px",
                  marginBottom: spacing.sm,
                  width: `${100 - i * 10}%`,
                  opacity: 0.5 - i * 0.1,
                }}
              />
            ))}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card style={{ padding: spacing["2xl"], textAlign: "center" }}>
        <CardContent>
          <motion.div
            style={{
              width: "60px",
              height: "60px",
              margin: `0 auto ${spacing.lg} auto`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 size={48} style={{ color: colors.primary }} />
            </motion.div>
          </motion.div>

          <p
            style={{
              fontSize: "1rem",
              color: colors.textSecondary,
              margin: 0,
            }}
          >
            {message}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * No Data UI component for when backend returns empty data
 */
export const NoDataUI: React.FC<FallbackUIProps> = ({ 
  title, 
  message, 
  icon = <FileX size={48} />,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card style={{ padding: spacing["2xl"], textAlign: "center" }}>
        <CardContent>
          <motion.div
            style={{
              width: "80px",
              height: "80px",
              margin: `0 auto ${spacing.xl} auto`,
              backgroundColor: colors.surfaceLight,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${colors.surfaceLight}`,
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div style={{ color: colors.textMuted }}>
              {icon}
            </div>
          </motion.div>

          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing.md,
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: "1rem",
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
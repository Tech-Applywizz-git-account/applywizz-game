import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Logo from "../components/Logo";
import { colors, fonts, spacing } from "../utils/theme";
import { useAuthContext } from "../hooks/hooks";
import { decodeJwt } from "jose";

// Background pattern component for album covers
const AlbumCoverPattern = () => {
  const covers = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 40,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    opacity: Math.random() * 0.1 + 0.05,
  }));

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {covers.map((cover) => (
        <motion.div
          key={cover.id}
          style={{
            position: "absolute",
            left: `${cover.x}%`,
            top: `${cover.y}%`,
            width: `${cover.size}px`,
            height: `${cover.size}px`,
            backgroundColor: colors.primary,
            borderRadius: "8px",
            opacity: cover.opacity,
            transform: `rotate(${cover.rotation}deg)`,
          }}
          animate={{
            rotate: [cover.rotation, cover.rotation + 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Diamond logo pattern component
const DiamondLogo = () => {
  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.xl,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 12px)",
          gridTemplateRows: "repeat(3, 12px)",
          gap: "4px",
          padding: spacing.md,
        }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <motion.div
            key={i}
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: i === 4 ? colors.secondary : colors.primary,
              borderRadius: "2px",
              transform: "rotate(45deg)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 0.4 + i * 0.1,
              type: "spring",
              bounce: 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const baseUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;

    try {
      const res = await fetch(`${baseUrl}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Try to parse JSON regardless of status
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        const message =
          data?.error ||
          data?.message ||
          "Failed to login. Please check your credentials.";
        setErrorMsg(message);
        console.warn("Login failed:", message, { status: res.status, data });
        return;
      }

      const token = data?.token as string | undefined;

      login(token as string);

      const user = decodeJwt(token as string);
      localStorage.setItem("role", (user as any).role);
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => navigate("/welcome"), 400);
    } catch (err: any) {
      const message = err?.message || "Network error. Please try again.";
      setErrorMsg(message);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        fontFamily: fonts.body,
        position: "relative",
      }}
    >
      {/* Album covers background pattern */}
      <AlbumCoverPattern />

      <motion.div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: colors.surface,
          padding: spacing["3xl"],
          borderRadius: "24px",
          border: `1px solid ${colors.surfaceLight}`,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          position: "relative",
          zIndex: 10,
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Diamond Logo Pattern */}
        <DiamondLogo />

        {/* Title */}
        <motion.div
          style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing.sm,
              fontFamily: fonts.logo,
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              color: colors.textSecondary,
              fontSize: "0.95rem",
              margin: 0,
            }}
          >
            Sign in to continue your journey
          </p>
        </motion.div>

        {/* Inline status messages */}
        {errorMsg && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 text-sm"
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-4 py-3 text-sm"
          >
            {successMsg}
          </div>
        )}

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Email Field */}
          <div style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: colors.textSecondary,
                marginBottom: spacing.sm,
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={20}
                style={{
                  position: "absolute",
                  left: spacing.md,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: colors.textMuted,
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  padding: `${spacing.md} ${spacing.md} ${spacing.md} 3rem`,
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.surfaceLight}`,
                  borderRadius: "12px",
                  color: colors.textPrimary,
                  fontSize: "0.95rem",
                  fontFamily: fonts.body,
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.surfaceLight;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: spacing.xl }}>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: colors.textSecondary,
                marginBottom: spacing.sm,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={20}
                style={{
                  position: "absolute",
                  left: spacing.md,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: colors.textMuted,
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: `${spacing.md} 3rem ${spacing.md} 3rem`,
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.surfaceLight}`,
                  borderRadius: "12px",
                  color: colors.textPrimary,
                  fontSize: "0.95rem",
                  fontFamily: fonts.body,
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.surfaceLight;
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: spacing.md,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: colors.textMuted,
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: spacing.lg,
              backgroundColor: colors.textPrimary,
              color: colors.background,
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              fontFamily: fonts.body,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.2s ease",
            }}
            whileHover={!isLoading ? { backgroundColor: "#f5f5f5" } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: spacing.sm,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: `2px solid ${colors.background}`,
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Logging In...
              </motion.div>
            ) : (
              "Log In"
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          style={{
            textAlign: "center",
            marginTop: spacing.xl,
            color: colors.textMuted,
            fontSize: "0.85rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span style={{ color: colors.primary, cursor: "pointer" }}>
            Forgot your password?
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

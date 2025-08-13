import React from "react";
import { motion } from "framer-motion";
import { spacing, colors, fonts } from "../utils/theme";
import logoSvg from "./../../public/assets/logo.svg";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = "medium",
  showText = true,
  className = "",
}) => {
  const sizes = {
    small: { width: 32, height: 32, fontSize: "1.2rem" },
    medium: { width: 48, height: 48, fontSize: "1.5rem" },
    large: { width: 64, height: 64, fontSize: "2rem" },
  };

  const currentSize = sizes[size];

  return (
    <motion.div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.img
        src={logoSvg}
        alt="ApplyWizz Logo"
        style={{
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: "4px",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      {showText && (
        <motion.span
          style={{
            fontFamily: fonts.logo,
            fontSize: currentSize.fontSize,
            fontWeight: "700",
            color: colors.textPrimary,
            letterSpacing: "-0.02em",
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          ApplyWizz
        </motion.span>
      )}
    </motion.div>
  );
};

export default Logo;

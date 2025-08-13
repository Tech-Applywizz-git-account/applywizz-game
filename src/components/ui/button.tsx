import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { colors, spacing } from "../../utils/theme"

const buttonVariants = cva("", {
  variants: {
    variant: {
      default: "",
      destructive: "",
      outline: "",
      secondary: "",
      ghost: "",
      link: "",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, style, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button

    const getVariantStyles = () => {
      switch (variant) {
        case "destructive":
          return {
            backgroundColor: colors.error,
            color: colors.textPrimary,
            border: `1px solid ${colors.error}`,
          }
        case "outline":
          return {
            backgroundColor: "transparent",
            color: colors.textSecondary,
            border: `1px solid ${colors.surfaceLight}`,
          }
        case "secondary":
          return {
            backgroundColor: colors.surfaceLight,
            color: colors.textPrimary,
            border: `1px solid ${colors.surfaceLight}`,
          }
        case "ghost":
          return {
            backgroundColor: "transparent",
            color: colors.textSecondary,
            border: "1px solid transparent",
          }
        case "link":
          return {
            backgroundColor: "transparent",
            color: colors.primary,
            border: "1px solid transparent",
            textDecoration: "underline",
          }
        default:
          return {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            border: `1px solid ${colors.primary}`,
          }
      }
    }

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return {
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: "0.875rem",
            borderRadius: "8px",
          }
        case "lg":
          return {
            padding: `${spacing.lg} ${spacing.xl}`,
            fontSize: "1.125rem",
            borderRadius: "12px",
          }
        case "icon":
          return {
            padding: spacing.md,
            width: "40px",
            height: "40px",
            borderRadius: "8px",
          }
        default:
          return {
            padding: `${spacing.md} ${spacing.lg}`,
            fontSize: "1rem",
            borderRadius: "10px",
          }
      }
    }

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      fontWeight: "600",
      cursor: props.disabled ? "not-allowed" : "pointer",
      opacity: props.disabled || isLoading ? 0.6 : 1,
      transition: "all 0.2s ease",
      fontFamily: "inherit",
      outline: "none",
      ...getVariantStyles(),
      ...getSizeStyles(),
      ...style,
    }

    const hoverStyle = props.disabled || isLoading ? {} : (() => {
      switch (variant) {
        case "destructive":
          return { backgroundColor: "#dc2626" }
        case "outline":
          return { backgroundColor: colors.surfaceLight, borderColor: colors.primary }
        case "secondary":
          return { backgroundColor: colors.surface }
        case "ghost":
          return { backgroundColor: colors.surfaceLight }
        case "link":
          return { textDecoration: "none" }
        default:
          return { backgroundColor: colors.primaryDark }
      }
    })()

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={className}
          style={baseStyle}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <motion.button
        ref={ref}
        className={className}
        style={baseStyle}
        whileHover={hoverStyle}
        whileTap={{ scale: props.disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading && (
          <motion.div
            style={{
              width: "16px",
              height: "16px",
              border: `2px solid currentColor`,
              borderTop: "2px solid transparent",
              borderRadius: "50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
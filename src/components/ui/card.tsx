import React from "react"
import { motion } from "framer-motion"
import { colors, spacing } from "../../utils/theme"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: colors.surface,
      border: `1px solid ${colors.surfaceLight}`,
      borderRadius: "16px",
      padding: spacing.xl,
      position: "relative",
      overflow: "hidden",
      ...style,
    }

    const hoverStyle = hover ? {
      backgroundColor: colors.surfaceLight,
      scale: 1.02,
    } : {}

    return (
      <motion.div
        ref={ref}
        className={className}
        style={baseStyle}
        whileHover={hoverStyle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: spacing.sm,
      marginBottom: spacing.lg,
      ...style,
    }}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, style, ...props }, ref) => (
  <h3
    ref={ref}
    className={className}
    style={{
      fontSize: "1.25rem",
      fontWeight: "600",
      color: colors.textPrimary,
      margin: 0,
      lineHeight: 1.4,
      ...style,
    }}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, style, ...props }, ref) => (
  <p
    ref={ref}
    className={className}
    style={{
      fontSize: "0.875rem",
      color: colors.textSecondary,
      margin: 0,
      lineHeight: 1.5,
      ...style,
    }}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={{
      ...style,
    }}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      marginTop: spacing.lg,
      ...style,
    }}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
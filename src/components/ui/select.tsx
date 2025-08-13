import React from "react"
import { motion } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { colors, spacing } from "../../utils/theme"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, style, ...props }, ref) => {
    return (
      <div style={{ position: "relative", width: "100%" }}>
        <select
          ref={ref}
          className={className}
          style={{
            width: "100%",
            padding: `${spacing.md} ${spacing.lg}`,
            paddingRight: "2.5rem",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.surfaceLight}`,
            borderRadius: "10px",
            color: colors.textPrimary,
            fontSize: "0.9rem",
            fontFamily: "inherit",
            appearance: "none",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease",
            ...style,
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown
          size={16}
          style={{
            position: "absolute",
            right: spacing.md,
            top: "50%",
            transform: "translateY(-50%)",
            color: colors.textSecondary,
            pointerEvents: "none",
          }}
        />
      </div>
    )
  }
)
Select.displayName = "Select"

export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode
}

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, children, style, ...props }, ref) => (
    <option
      ref={ref}
      className={className}
      style={{
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        padding: spacing.sm,
        ...style,
      }}
      {...props}
    >
      {children}
    </option>
  )
)
SelectOption.displayName = "SelectOption"

export { Select, SelectOption }
"use client"

import MuiButton from "@mui/material/Button"
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button"

export type TPButtonVariant = "contained" | "outlined" | "text"
export type TPButtonSize = "small" | "medium" | "large"
export type TPButtonColor = "primary" | "secondary" | "error" | "inherit"

export interface TPButtonProps extends Omit<MuiButtonProps, "color"> {
  variant?: TPButtonVariant
  size?: TPButtonSize
  color?: TPButtonColor
  loading?: boolean
}

export function TPButton({
  variant = "contained",
  size = "medium",
  color = "primary",
  loading = false,
  disabled,
  children,
  ...props
}: TPButtonProps) {
  return (
    <MuiButton
      variant={variant}
      size={size}
      color={color === "secondary" ? "secondary" : color === "error" ? "error" : "primary"}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </MuiButton>
  )
}

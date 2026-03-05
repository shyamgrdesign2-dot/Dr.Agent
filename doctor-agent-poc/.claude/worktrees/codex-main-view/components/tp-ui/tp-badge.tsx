"use client"

import MuiBadge from "@mui/material/Badge"
import type { BadgeProps } from "@mui/material/Badge"

export type TPBadgeColor = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"

export interface TPBadgeProps extends Omit<BadgeProps, "color"> {
  color?: TPBadgeColor
}

export function TPBadge({ color = "primary", ...props }: TPBadgeProps) {
  return <MuiBadge color={color} {...props} />
}

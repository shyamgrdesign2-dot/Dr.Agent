"use client"

import MuiChip from "@mui/material/Chip"
import type { ChipProps } from "@mui/material/Chip"

export type TPChipVariant = "filled" | "outlined"
export type TPChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "error"

export interface TPChipProps extends Omit<ChipProps, "color"> {
  variant?: TPChipVariant
  color?: TPChipColor
}

export function TPChip({ variant = "filled", color = "default", ...props }: TPChipProps) {
  return <MuiChip variant={variant} color={color} {...props} />
}

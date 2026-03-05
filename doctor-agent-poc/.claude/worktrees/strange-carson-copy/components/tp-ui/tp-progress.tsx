"use client"

import MuiLinearProgress from "@mui/material/LinearProgress"
import type { LinearProgressProps } from "@mui/material/LinearProgress"

export interface TPProgressProps extends LinearProgressProps {
  variant?: "determinate" | "indeterminate" | "buffer"
}

export function TPProgress({ variant = "determinate", ...props }: TPProgressProps) {
  return <MuiLinearProgress variant={variant} {...props} />
}

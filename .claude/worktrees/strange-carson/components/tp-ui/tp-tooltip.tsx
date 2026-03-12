"use client"

import MuiTooltip from "@mui/material/Tooltip"
import type { TooltipProps } from "@mui/material/Tooltip"

export interface TPTooltipProps extends TooltipProps {}

export function TPTooltip(props: TPTooltipProps) {
  return <MuiTooltip {...props} />
}

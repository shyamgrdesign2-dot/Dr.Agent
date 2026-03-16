"use client"

import MuiDivider from "@mui/material/Divider"
import type { DividerProps } from "@mui/material/Divider"

export interface TPDividerProps extends DividerProps {}

export function TPDivider(props: TPDividerProps) {
  return <MuiDivider {...props} />
}

"use client"

import MuiSwitch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"
import type { SwitchProps } from "@mui/material/Switch"

export interface TPSwitchProps extends Omit<SwitchProps, "color"> {
  color?: "primary" | "secondary" | "error"
  label?: string
}

export function TPSwitch({
  color = "primary",
  label,
  ...props
}: TPSwitchProps) {
  const switchEl = <MuiSwitch color={color} {...props} />
  if (label) {
    return <FormControlLabel control={switchEl} label={label} />
  }
  return switchEl
}

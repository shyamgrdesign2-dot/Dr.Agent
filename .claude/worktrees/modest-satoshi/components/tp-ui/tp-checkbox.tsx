"use client"

import MuiCheckbox from "@mui/material/Checkbox"
import type { CheckboxProps } from "@mui/material/Checkbox"

export interface TPCheckboxProps extends Omit<CheckboxProps, "color"> {
  color?: "primary" | "secondary" | "error" | "default"
}

export function TPCheckbox({ color = "primary", ...props }: TPCheckboxProps) {
  return <MuiCheckbox color={color} {...props} />
}

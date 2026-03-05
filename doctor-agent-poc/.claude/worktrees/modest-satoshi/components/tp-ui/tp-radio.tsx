"use client"

import MuiRadio from "@mui/material/Radio"
import MuiRadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import type { RadioProps } from "@mui/material/Radio"
import type { RadioGroupProps } from "@mui/material/RadioGroup"

export interface TPRadioProps extends Omit<RadioProps, "color"> {
  color?: "primary" | "secondary" | "error" | "default"
}

export function TPRadio({ color = "primary", ...props }: TPRadioProps) {
  return <MuiRadio color={color} {...props} />
}

export interface TPRadioGroupProps extends RadioGroupProps {}

export function TPRadioGroup(props: TPRadioGroupProps) {
  return <MuiRadioGroup {...props} />
}

export { FormControlLabel }

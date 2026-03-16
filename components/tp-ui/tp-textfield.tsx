"use client"

import MuiTextField from "@mui/material/TextField"
import type { TextFieldProps } from "@mui/material/TextField"

export interface TPTextFieldProps extends Omit<TextFieldProps, "variant"> {
  variant?: "outlined" | "filled" | "standard"
}

export function TPTextField({ variant = "outlined", ...props }: TPTextFieldProps) {
  return <MuiTextField variant={variant} {...props} />
}

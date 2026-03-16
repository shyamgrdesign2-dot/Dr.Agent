"use client"

import MuiSelect from "@mui/material/Select"
import MuiMenuItem from "@mui/material/MenuItem"
import MuiFormControl from "@mui/material/FormControl"
import MuiInputLabel from "@mui/material/InputLabel"
import type { SelectProps } from "@mui/material/Select"

export interface TPSelectProps extends Omit<SelectProps, "variant"> {
  variant?: "outlined" | "filled" | "standard"
  label?: string
}

export function TPSelect({
  variant = "outlined",
  label,
  ...props
}: TPSelectProps) {
  const id = props.id ?? `tp-select-${Math.random().toString(36).slice(2)}`
  return (
    <MuiFormControl variant={variant} fullWidth={props.fullWidth} size={props.size}>
      {label && <MuiInputLabel id={`${id}-label`}>{label}</MuiInputLabel>}
      <MuiSelect
        labelId={label ? `${id}-label` : undefined}
        id={id}
        label={label}
        variant={variant}
        {...props}
      />
    </MuiFormControl>
  )
}


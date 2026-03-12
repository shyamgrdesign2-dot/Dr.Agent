"use client"

import MuiAlert from "@mui/material/Alert"
import MuiAlertTitle from "@mui/material/AlertTitle"
import type { AlertProps } from "@mui/material/Alert"

export type TPAlertSeverity = "error" | "warning" | "info" | "success"

export interface TPAlertProps extends Omit<AlertProps, "severity"> {
  severity?: TPAlertSeverity
  title?: string
}

export function TPAlert({ severity = "info", title, children, ...props }: TPAlertProps) {
  return (
    <MuiAlert severity={severity} {...props}>
      {title ? <MuiAlertTitle>{title}</MuiAlertTitle> : null}
      {children}
    </MuiAlert>
  )
}

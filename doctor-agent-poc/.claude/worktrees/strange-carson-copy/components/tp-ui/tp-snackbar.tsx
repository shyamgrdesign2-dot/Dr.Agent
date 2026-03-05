"use client"

import MuiSnackbar from "@mui/material/Snackbar"
import MuiAlert from "@mui/material/Alert"
import type { SnackbarProps } from "@mui/material/Snackbar"

export interface TPSnackbarProps extends Omit<SnackbarProps, "message"> {
  message?: string | React.ReactNode
  severity?: "error" | "warning" | "info" | "success"
}

export function TPSnackbar({
  severity = "info",
  message,
  onClose,
  ...props
}: TPSnackbarProps) {
  const content =
    typeof message === "string" ? (
      <MuiAlert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </MuiAlert>
    ) : (
      message
    )
  return (
    <MuiSnackbar {...props} onClose={onClose}>
      {content}
    </MuiSnackbar>
  )
}

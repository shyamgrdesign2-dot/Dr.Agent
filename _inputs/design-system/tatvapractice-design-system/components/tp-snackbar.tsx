"use client"

import type { ReactElement, ReactNode, SyntheticEvent } from "react"
import MuiSnackbar from "@mui/material/Snackbar"
import MuiAlert from "@mui/material/Alert"
import type { SnackbarProps } from "@mui/material/Snackbar"

export interface TPSnackbarProps extends Omit<SnackbarProps, "message"> {
  message?: string | ReactNode
  severity?: "error" | "warning" | "info" | "success"
}

export function TPSnackbar({
  severity = "info",
  message,
  onClose,
  ...props
}: TPSnackbarProps) {
  const handleAlertClose = (event: SyntheticEvent<Element, Event>) => {
    onClose?.(event, "escapeKeyDown")
  }

  const content: ReactElement | undefined =
    message == null
      ? undefined
      : typeof message === "string"
        ? (
          <MuiAlert severity={severity} variant="filled" onClose={onClose ? handleAlertClose : undefined}>
            {message}
          </MuiAlert>
        )
        : <>{message}</>

  return (
    <MuiSnackbar {...props} onClose={onClose}>
      {content}
    </MuiSnackbar>
  )
}

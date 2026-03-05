"use client"

import MuiDialog from "@mui/material/Dialog"
import MuiDialogTitle from "@mui/material/DialogTitle"
import MuiDialogContent from "@mui/material/DialogContent"
import MuiDialogActions from "@mui/material/DialogActions"
import type { DialogProps } from "@mui/material/Dialog"

export interface TPDialogProps extends DialogProps {}

export function TPDialog(props: TPDialogProps) {
  return <MuiDialog {...props} />
}

export function TPDialogTitle(
  props: React.ComponentProps<typeof MuiDialogTitle>
) {
  return <MuiDialogTitle {...props} />
}
export function TPDialogContent(
  props: React.ComponentProps<typeof MuiDialogContent>
) {
  return <MuiDialogContent {...props} />
}
export function TPDialogActions(
  props: React.ComponentProps<typeof MuiDialogActions>
) {
  return <MuiDialogActions {...props} />
}

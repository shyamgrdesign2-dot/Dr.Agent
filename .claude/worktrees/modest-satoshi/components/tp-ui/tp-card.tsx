"use client"

import MuiCard from "@mui/material/Card"
import MuiCardHeader from "@mui/material/CardHeader"
import MuiCardContent from "@mui/material/CardContent"
import MuiCardActions from "@mui/material/CardActions"
import type { CardProps } from "@mui/material/Card"

export interface TPCardProps extends CardProps {}

export function TPCard(props: TPCardProps) {
  return <MuiCard {...props} />
}

export function TPCardHeader(
  props: React.ComponentProps<typeof MuiCardHeader>
) {
  return <MuiCardHeader {...props} />
}
export function TPCardContent(
  props: React.ComponentProps<typeof MuiCardContent>
) {
  return <MuiCardContent {...props} />
}
export function TPCardActions(
  props: React.ComponentProps<typeof MuiCardActions>
) {
  return <MuiCardActions {...props} />
}

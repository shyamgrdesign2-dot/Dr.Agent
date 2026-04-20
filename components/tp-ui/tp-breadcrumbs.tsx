"use client"

import MuiBreadcrumbs from "@mui/material/Breadcrumbs"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import type { BreadcrumbsProps } from "@mui/material/Breadcrumbs"

export interface TPBreadcrumbsProps extends BreadcrumbsProps {}

export function TPBreadcrumbs(props: TPBreadcrumbsProps) {
  return <MuiBreadcrumbs {...props} />
}

export { MuiLink as TPLink }
export { Typography as TPTypography }

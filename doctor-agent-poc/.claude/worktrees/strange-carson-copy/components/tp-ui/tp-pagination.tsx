"use client"

import MuiPagination from "@mui/material/Pagination"
import type { PaginationProps } from "@mui/material/Pagination"

export interface TPPaginationProps extends PaginationProps {
  color?: "primary" | "secondary" | "standard"
}

export function TPPagination({ color = "primary", ...props }: TPPaginationProps) {
  return <MuiPagination color={color} {...props} />
}

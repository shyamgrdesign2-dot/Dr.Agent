"use client"

import MuiSkeleton from "@mui/material/Skeleton"
import type { SkeletonProps } from "@mui/material/Skeleton"

export interface TPSkeletonProps extends SkeletonProps {}

export function TPSkeleton(props: TPSkeletonProps) {
  return <MuiSkeleton {...props} />
}

"use client"

import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPSpinner — TP-branded loading spinner.
 * Sizes: sm (16px), md (24px), lg (32px). Color: tp-blue-500 by default.
 */

type TPSpinnerSize = "sm" | "md" | "lg"

const sizeMap: Record<TPSpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
}

interface TPSpinnerProps {
  size?: TPSpinnerSize
  className?: string
  /** Override color — defaults to tp-blue-500 */
  color?: string
}

export function TPSpinner({ size = "md", className, color }: TPSpinnerProps) {
  return (
    <RefreshCw
      size={sizeMap[size]}
      role="status"
      aria-label="Loading"
      className={cn("animate-spin text-tp-blue-500", className)}
      style={color ? { color } : undefined}
    />
  )
}

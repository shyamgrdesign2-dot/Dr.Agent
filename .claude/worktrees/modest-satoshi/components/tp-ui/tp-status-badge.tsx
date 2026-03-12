"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * TPStatusBadge — Pill-shaped status indicator for clinical workflows.
 *
 * Tokens:
 *   Shape         border-radius 9999px (full pill)
 *   SM            22px height, 10px font, 8px horizontal padding
 *   MD            26px height, 12px font, 10px horizontal padding
 *   Dot           6px circle, 2px right margin
 *
 * Color Map:
 *   queue         TP Blue 50/700
 *   in-progress   TP Violet 50/700
 *   finished      TP Success 50/700
 *   cancelled     TP Error 50/700
 *   draft         TP Slate 100/600
 *   pending       TP Warning 50/700
 *   active        TP Success 50/700
 *   inactive      TP Slate 100/600
 *   scheduled     TP Blue 50/700
 *   completed     TP Success 50/700
 *   overdue       TP Error 50/700
 */

type StatusBadgeVariant =
  | "queue"
  | "in-progress"
  | "finished"
  | "cancelled"
  | "draft"
  | "pending"
  | "active"
  | "inactive"
  | "scheduled"
  | "completed"
  | "overdue"

interface TPStatusBadgeProps {
  status: StatusBadgeVariant
  /** Override default label text */
  label?: string
  size?: "sm" | "md"
  /** Show leading status dot */
  showDot?: boolean
  className?: string
}

const statusConfig: Record<
  StatusBadgeVariant,
  { label: string; bg: string; text: string; dot: string }
> = {
  queue: {
    label: "Queue",
    bg: "bg-tp-blue-50",
    text: "text-tp-blue-700",
    dot: "bg-tp-blue-500",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-tp-violet-50",
    text: "text-tp-violet-700",
    dot: "bg-tp-violet-500",
  },
  finished: {
    label: "Finished",
    bg: "bg-tp-success-50",
    text: "text-tp-success-700",
    dot: "bg-tp-success-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-tp-error-50",
    text: "text-tp-error-700",
    dot: "bg-tp-error-500",
  },
  draft: {
    label: "Draft",
    bg: "bg-tp-slate-100",
    text: "text-tp-slate-600",
    dot: "bg-tp-slate-400",
  },
  pending: {
    label: "Pending",
    bg: "bg-tp-warning-50",
    text: "text-tp-warning-700",
    dot: "bg-tp-warning-500",
  },
  active: {
    label: "Active",
    bg: "bg-tp-success-50",
    text: "text-tp-success-700",
    dot: "bg-tp-success-500",
  },
  inactive: {
    label: "Inactive",
    bg: "bg-tp-slate-100",
    text: "text-tp-slate-600",
    dot: "bg-tp-slate-400",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-tp-blue-50",
    text: "text-tp-blue-700",
    dot: "bg-tp-blue-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-tp-success-50",
    text: "text-tp-success-700",
    dot: "bg-tp-success-500",
  },
  overdue: {
    label: "Overdue",
    bg: "bg-tp-error-50",
    text: "text-tp-error-700",
    dot: "bg-tp-error-500",
  },
}

export function TPStatusBadge({
  status,
  label,
  size = "md",
  showDot = true,
  className,
}: TPStatusBadgeProps) {
  const config = statusConfig[status]
  const displayLabel = label ?? config.label

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        config.bg,
        config.text,
        size === "sm"
          ? "h-[22px] px-2 text-[10px]"
          : "h-[26px] px-2.5 text-xs",
        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            "shrink-0 rounded-full",
            config.dot,
            size === "sm" ? "h-1.5 w-1.5" : "h-[6px] w-[6px]",
          )}
        />
      )}
      {displayLabel}
    </span>
  )
}

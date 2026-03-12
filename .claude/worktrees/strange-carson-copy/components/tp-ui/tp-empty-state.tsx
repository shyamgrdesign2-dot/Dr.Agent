"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * TPEmptyState — TP-branded zero/empty state display.
 * Centered illustration + title + description + optional action.
 */

interface TPEmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function TPEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: TPEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-tp-slate-200 bg-tp-slate-50/50 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-tp-blue-50 text-tp-blue-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-tp-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-tp-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

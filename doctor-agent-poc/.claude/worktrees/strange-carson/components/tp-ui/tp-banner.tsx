"use client"

import * as React from "react"
import { useState } from "react"
import {
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPBanner — TP-branded full-width dismissible banner.
 * Status variants: info, success, warning, error.
 */

type TPBannerStatus = "info" | "success" | "warning" | "error"

const statusConfig: Record<
  TPBannerStatus,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  info: {
    bg: "bg-tp-blue-50",
    border: "border-tp-blue-200",
    text: "text-tp-blue-800",
    icon: <Info size={18} style={{ color: "var(--tp-blue-500)", flexShrink: 0 }} className="text-tp-blue-500" />,
  },
  success: {
    bg: "bg-tp-success-50",
    border: "border-tp-success-200",
    text: "text-tp-success-800",
    icon: <CheckCircle2 size={18} style={{ color: "var(--tp-success-500)", flexShrink: 0 }} className="text-tp-success-500" />,
  },
  warning: {
    bg: "bg-tp-warning-50",
    border: "border-tp-warning-200",
    text: "text-tp-warning-800",
    icon: <AlertTriangle size={18} style={{ color: "var(--tp-warning-500)", flexShrink: 0 }} className="text-tp-warning-500" />,
  },
  error: {
    bg: "bg-tp-error-50",
    border: "border-tp-error-200",
    text: "text-tp-error-800",
    icon: <AlertCircle size={18} style={{ color: "var(--tp-error-500)", flexShrink: 0 }} className="text-tp-error-500" />,
  },
}

interface TPBannerProps {
  status?: TPBannerStatus
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  action?: React.ReactNode
  className?: string
}

export function TPBanner({
  status = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  action,
  className,
}: TPBannerProps) {
  const [visible, setVisible] = useState(true)
  const config = statusConfig[status]

  if (!visible) return null

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        config.bg,
        config.border,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className={cn("min-w-0 flex-1 text-sm", config.text)}>
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-0.5" : ""}>{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn("shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5", config.text)}
          aria-label="Dismiss"
        >
          <XCircle size={18} style={{ flexShrink: 0 }} />
        </button>
      )}
    </div>
  )
}

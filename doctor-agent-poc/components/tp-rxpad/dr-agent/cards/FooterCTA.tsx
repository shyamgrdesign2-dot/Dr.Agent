"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface FooterCTAProps {
  label: string
  onClick?: () => void
  href?: string
  target?: string
  rel?: string
  tone?: "primary" | "danger" | "neutral" | "success"
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  disabled?: boolean
  align?: "left" | "center"
  fullWidth?: boolean
  compact?: boolean
}

const baseClassName =
  "inline-flex h-[36px] items-center justify-center gap-[4px] rounded-[10px] px-3 text-[12px] font-medium transition-all"

const toneClassName: Record<NonNullable<FooterCTAProps["tone"]>, string> = {
  primary: "bg-transparent text-tp-blue-500 hover:bg-tp-blue-50/60 hover:text-tp-blue-600",
  danger: "bg-transparent text-tp-error-600 hover:bg-tp-error-50/60 hover:text-tp-error-700",
  neutral: "bg-transparent text-tp-slate-500 hover:bg-tp-slate-50 hover:text-tp-slate-600",
  success: "bg-transparent text-tp-green-600 hover:bg-tp-green-50/70 hover:text-tp-green-700",
}

function buildClassName({
  tone = "primary",
  disabled = false,
  fullWidth = false,
  compact = false,
}: Pick<FooterCTAProps, "tone" | "disabled" | "fullWidth" | "compact">) {
  return cn(
    baseClassName,
    toneClassName[tone],
    fullWidth && "w-full",
    compact && "px-2",
    disabled && "cursor-not-allowed bg-transparent text-tp-slate-400 hover:bg-transparent hover:text-tp-slate-400"
  )
}

export function FooterCTA({
  label,
  onClick,
  href,
  target,
  rel,
  tone = "primary",
  iconLeft,
  iconRight,
  disabled = false,
  align = "left",
  fullWidth = false,
  compact = false,
}: FooterCTAProps) {
  const wrapperClassName = cn("flex", align === "center" ? "justify-center" : "justify-start")
  const className = buildClassName({ tone, disabled, fullWidth, compact })

  if (href) {
    return (
      <div className={wrapperClassName}>
        <Link
          href={href}
          target={target}
          rel={rel}
          className={className}
        >
          {iconLeft}
          <span>{label}</span>
          {iconRight}
        </Link>
      </div>
    )
  }

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {iconLeft}
        <span>{label}</span>
        {iconRight}
      </button>
    </div>
  )
}

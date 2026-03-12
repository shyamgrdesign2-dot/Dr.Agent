"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPAppointmentBanner — Hero banner with gradient background + texture.
 *
 * Tokens:
 *   Height           160px (desktop), 120px (tablet)
 *   Background       gradient TP Blue 600 → Blue 500 → Violet 500
 *   Texture          SVG dot pattern at 5% opacity
 *   Border-radius    16px
 *   Title            Mulish 700, 24px, white
 *   Subtitle         Inter 400, 14px, white/70%
 *   CTA button       white 7% overlay + blur, white border/text, 10px radius, 36px height
 *   Padding          32px horizontal, 24px vertical
 */

interface TPAppointmentBannerProps {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaIcon?: React.ReactNode
  onCtaClick?: () => void
  /** Today's summary stats */
  stats?: Array<{ label: string; value: string | number }>
  variant?: "appointments" | "schedule" | "analytics"
  className?: string
}

const variantGradients: Record<string, string> = {
  appointments: "from-[var(--tp-blue-600)] via-[var(--tp-blue-500)] to-[var(--tp-violet-500)]",
  schedule: "from-[var(--tp-violet-600)] via-[var(--tp-violet-500)] to-[var(--tp-blue-500)]",
  analytics: "from-[var(--tp-blue-700)] via-[var(--tp-blue-600)] to-[var(--tp-success-500)]",
}

export function TPAppointmentBanner({
  title,
  subtitle,
  ctaLabel,
  ctaIcon,
  onCtaClick,
  stats,
  variant = "appointments",
  className,
}: TPAppointmentBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-r text-white",
        variantGradients[variant],
        className,
      )}
    >
      {/* SVG dot texture overlay */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="banner-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#banner-dots)" />
      </svg>

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/[0.06]" />
      <div className="pointer-events-none absolute -bottom-8 -right-4 h-32 w-32 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/[0.03]" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-8 lg:py-7">
        <div className="min-w-0 flex-1">
          <h2
            className="text-xl font-bold tracking-tight lg:text-2xl"
            style={{ fontFamily: "'Mulish', sans-serif" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-white/70 lg:text-base">{subtitle}</p>
          )}

          {/* Stats row */}
          {stats && stats.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 lg:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="min-w-0">
                  <p className="text-xl font-bold lg:text-2xl">{stat.value}</p>
                  <p className="text-[11px] text-white/60 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        {ctaLabel && (
          <button
            type="button"
            onClick={onCtaClick}
            className="ml-4 flex shrink-0 items-center gap-2 rounded-[10px] border border-white/35 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-[8px] transition-all hover:bg-white/[0.14] hover:shadow-md active:scale-[0.98]"
            style={{ height: 36 }}
          >
            {ctaIcon || <Plus size={18} />}
            <span className="hidden sm:inline">{ctaLabel}</span>
          </button>
        )}
      </div>
    </div>
  )
}

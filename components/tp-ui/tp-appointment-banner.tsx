"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { NoiseOverlay } from "./noise-overlay"

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
      {/* Geometric line pattern — right-aligned, scaled to banner height */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/8b46197b8125e32aedb152d3d430b818c39f3157.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.75]"
        style={{ mixBlendMode: "screen", objectFit: "contain", objectPosition: "right center" }}
      />

      {/* Noise grain texture */}
      <NoiseOverlay opacity={0.06} />

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

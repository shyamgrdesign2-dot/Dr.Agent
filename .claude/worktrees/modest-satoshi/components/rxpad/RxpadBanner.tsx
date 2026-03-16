"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RxpadBannerProps {
  title: string
  /** Action buttons rendered on the right */
  actions?: ReactNode
  className?: string
}

/**
 * RxpadBanner — The hero banner used on the Rxpad page.
 * Rounded bottom corners (16px), 149px tall.
 *
 * Background: radial-gradient with blue/purple tones for Rxpad branding
 * The card below should use -mt-[60px] so it overlaps this banner.
 */
export function RxpadBanner({ title, actions, className }: RxpadBannerProps) {
  return (
    <div
      className={cn(
        "relative h-[149px] w-full overflow-hidden rounded-b-[16px]",
        className,
      )}
      style={{
        background:
          "radial-gradient(99.09% 59.99% at 50% 55.44%, #3B82F6 0%, #2563EB 39.08%, #1E40AF 78.16%, #1D4ED8 100%)",
      }}
    >
      {/* Dot texture */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="rxpad-banner-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rxpad-banner-dots)" />
      </svg>

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/[0.05]" />
      <div className="pointer-events-none absolute -bottom-8 right-1/4 h-32 w-32 rounded-full bg-white/[0.03]" />

      {/* Content */}
      <div className="relative h-full px-3 pt-6 sm:px-6 lg:px-[18px]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 flex-1 font-heading text-[24px] font-bold leading-[1.15] text-white">
            {title}
          </h1>
          {actions && (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

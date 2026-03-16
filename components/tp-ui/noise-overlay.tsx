"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

interface NoiseOverlayProps {
  /** Noise opacity — 0.04–0.08 works well. Default 0.06 */
  opacity?: number
  className?: string
}

/**
 * NoiseOverlay — Resolution-independent SVG grain texture overlay.
 *
 * Uses `<feTurbulence>` fractal noise + desaturation to produce a
 * film-grain effect that blends over gradient backgrounds.
 *
 * Each instance generates a unique filter ID via `useId()` so
 * multiple overlays on the same page don't conflict.
 */
export function NoiseOverlay({ opacity = 0.06, className }: NoiseOverlayProps) {
  const filterId = `noise-${useId().replace(/[:]/g, "")}`

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <filter id={filterId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter={`url(#${filterId})`}
        opacity={opacity}
        style={{ mixBlendMode: "overlay" }}
      />
    </svg>
  )
}

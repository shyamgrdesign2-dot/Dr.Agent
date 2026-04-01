"use client"

import { cn } from "@/lib/utils"

export const AI_GRADIENT = "linear-gradient(135deg, #D565EA 0%, #673AAC 45%, #1A1994 100%)"
export const AI_GRADIENT_SOFT =
  "linear-gradient(135deg, rgba(213,101,234,0.18) 0%, rgba(139,92,246,0.22) 50%, rgba(103,58,172,0.18) 100%)"

/**
 * Dr. Agent brand sparkle icon.
 *
 * - Default (withBackground=false): plain spark icon from /icons/dr-agent/spark-icon.svg
 * - withBackground=true: gradient background from /icons/dr-agent/agent-bg.svg
 *   with white spark overlay from /icons/dr-agent/agent-spark.svg
 *
 * Both background assets are the user's Figma exports with embedded gradient PNG textures.
 */
export function AiBrandSparkIcon({
  size = 24,
  className,
  withBackground = false,
}: {
  size?: number
  className?: string
  /** When true, layers gradient background + white spark icon on top (square icon) */
  withBackground?: boolean
}) {
  if (withBackground) {
    return (
      <span
        className={cn("pointer-events-none select-none relative inline-flex items-center justify-center overflow-hidden", className)}
        style={{ width: size, height: size, borderRadius: size * 0.3 }}
        aria-hidden="true"
      >
        {/* Gradient background — Figma export with textured gradient */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/dr-agent/agent-bg.svg"
          width={size}
          height={size}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* White spark icon overlay — centered, smaller for balance */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/dr-agent/agent-spark.svg"
          width={size * 0.55}
          height={size * 0.55}
          alt=""
          className="relative z-10"
          draggable={false}
        />
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/dr-agent/spark-icon.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
      draggable={false}
    />
  )
}

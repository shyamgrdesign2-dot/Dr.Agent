"use client"

import { useId } from "react"

import { cn } from "@/lib/utils"

export const AI_GRADIENT = "linear-gradient(135deg, #D565EA 0%, #673AAC 45%, #1A1994 100%)"
export const AI_GRADIENT_SOFT =
  "linear-gradient(135deg, rgba(213,101,234,0.2) 0%, rgba(103,58,172,0.2) 45%, rgba(26,25,148,0.2) 100%)"

export function AiBrandSparkIcon({
  size = 24,
  className,
}: {
  size?: number
  className?: string
}) {
  const gradientId = useId().replace(/[:]/g, "")

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn(className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D565EA" />
          <stop offset="45%" stopColor="#673AAC" />
          <stop offset="100%" stopColor="#1A1994" />
        </linearGradient>
      </defs>
      <path
        d="M18.0841 11.612C18.4509 11.6649 18.4509 12.3351 18.0841 12.388C14.1035 12.9624 12.9624 14.1035 12.388 18.0841C12.3351 18.4509 11.6649 18.4509 11.612 18.0841C11.0376 14.1035 9.89647 12.9624 5.91594 12.388C5.5491 12.3351 5.5491 11.6649 5.91594 11.612C9.89647 11.0376 11.0376 9.89647 11.612 5.91594C11.6649 5.5491 12.3351 5.5491 12.388 5.91594C12.9624 9.89647 14.1035 11.0376 18.0841 11.612Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  )
}

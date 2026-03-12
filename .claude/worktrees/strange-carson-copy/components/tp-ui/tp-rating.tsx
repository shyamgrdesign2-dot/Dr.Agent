"use client"

import * as React from "react"
import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPRating — TP-branded star rating.
 * Active: tp-amber-500 (filled Star1). Sizes: sm/md/lg.
 */

type TPRatingSize = "sm" | "md" | "lg"

const sizeMap: Record<TPRatingSize, number> = {
  sm: 16,
  md: 22,
  lg: 28,
}

interface TPRatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  size?: TPRatingSize
  readOnly?: boolean
  className?: string
}

export function TPRating({
  value,
  onChange,
  max = 5,
  size = "md",
  readOnly = false,
  className,
}: TPRatingProps) {
  const [hover, setHover] = useState(0)
  const iconSize = sizeMap[size]

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        const isFilled = starValue <= (hover || value)

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={cn(
              "transition-transform",
              !readOnly && "hover:scale-110 cursor-pointer",
              readOnly && "cursor-default",
            )}
            role="radio"
            aria-checked={starValue === value}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <Star
              size={iconSize}
              className={cn(
                "transition-colors",
                isFilled ? "text-tp-amber-500" : "text-tp-slate-300",
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

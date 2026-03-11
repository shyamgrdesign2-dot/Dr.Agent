"use client"

import { useState } from "react"
import { DocumentCopy } from "iconsax-reactjs"
import { cn } from "@/lib/utils"

interface CopyIconProps {
  size?: number
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

export function CopyIcon({ size = 14, onClick, className }: CopyIconProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(e) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex-shrink-0 cursor-pointer transition-colors",
        hovered ? "text-tp-slate-500" : "text-tp-slate-600",
        className,
      )}
    >
      <DocumentCopy size={size} variant={hovered ? "Bulk" : "Linear"} />
    </button>
  )
}

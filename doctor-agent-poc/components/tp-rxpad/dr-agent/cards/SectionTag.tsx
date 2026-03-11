"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CopyIcon } from "./CopyIcon"
import { TPMedicalIcon } from "@/components/tp-ui"

interface SectionTagProps {
  label: string
  icon?: string
  onClick?: () => void
  onCopy?: () => void
  variant?: "default" | "specialty"
  className?: string
  /** Tooltip shown on hover over the entire tag, e.g. "Open detailed vitals" */
  tooltip?: string
  /** Tooltip shown on hover over the copy icon, e.g. "Copy all vitals" */
  copyTooltip?: string
}

/** Returns true if the string starts with an emoji character */
function isEmoji(str: string): boolean {
  if (!str) return false
  return /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}]/u.test(str)
}

export function SectionTag({
  label,
  icon,
  onClick,
  onCopy,
  variant = "default",
  className,
  tooltip,
  copyTooltip,
}: SectionTagProps) {
  const [hovered, setHovered] = useState(false)

  const bg = variant === "specialty"
    ? "bg-tp-violet-50 text-tp-violet-600"
    : "bg-tp-slate-100 text-tp-slate-500"

  return (
    <span
      className={cn(
        "group/tag inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-[4px] px-1.5 py-[0.5px] text-[11px] font-medium align-middle transition-colors",
        bg,
        hovered && variant !== "specialty" && "bg-tp-slate-200",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      title={tooltip}
    >
      {/* Icon rendered INSIDE the tag chip, matching tag text color */}
      {icon && (
        isEmoji(icon)
          ? <span className="text-[10px]">{icon}</span>
          : (
            <TPMedicalIcon
              name={icon}
              variant="bulk"
              size={11}
              className={cn(
                "inline-block align-middle transition-opacity",
                hovered ? "opacity-100" : "opacity-60",
                variant === "specialty" ? "text-tp-violet-600" : "text-tp-slate-500",
              )}
            />
          )
      )}
      <span className={cn("transition-colors", hovered && variant !== "specialty" && "text-tp-slate-700")}>
        {label}
      </span>
      {onCopy && hovered && (
        <CopyIcon
          size={10}
          onClick={(e) => { e.stopPropagation(); onCopy() }}
          className="ml-0.5"
        />
      )}
    </span>
  )
}

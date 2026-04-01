"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"
import { AI_PILL_BG, AI_PILL_BG_HOVER, AI_PILL_BORDER, AI_PILL_TEXT_GRADIENT } from "../constants"

interface AiTriggerChipProps {
  /** Short label displayed on the chip (e.g., "Suggest DDX") */
  label: string
  /** Message auto-sent to Dr. Agent when clicked */
  signalLabel: string
  /** Section ID for context (e.g., "symptoms", "diagnosis") */
  sectionId?: string
  className?: string
  /** Callback fired after publish (e.g. scroll to a section) */
  onAfterClick?: () => void
}

/**
 * Subtle AI trigger chip rendered inside RxPad sections.
 * Clicking it opens Dr. Agent and auto-sends a contextual message.
 *
 * Design: AI gradient bg + gradient text, 22px height, gentle fade-in.
 */
export function AiTriggerChip({
  label,
  signalLabel,
  sectionId,
  className,
  onAfterClick,
}: AiTriggerChipProps) {
  const { publishSignal } = useRxPadSync()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    publishSignal({
      type: "ai_trigger",
      label: signalLabel,
      sectionId,
    })
    onAfterClick?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "inline-flex h-[22px] items-center gap-[4px] rounded-full px-[8px]",
        "text-[12px] font-medium transition-all",
        "animate-[fadeIn_300ms_ease-out]",
        className,
      )}
      style={{
        background: isHovered ? AI_PILL_BG_HOVER : AI_PILL_BG,
        border: AI_PILL_BORDER,
      }}
    >
      <AiBrandSparkIcon size={14} />
      <span
        style={{
          background: AI_PILL_TEXT_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {label}
      </span>
    </button>
  )
}

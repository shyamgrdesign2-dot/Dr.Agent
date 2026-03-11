"use client"

import { cn } from "@/lib/utils"
import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"

interface AiTriggerIconProps {
  /** Tooltip text shown on hover */
  tooltip: string
  /** Message auto-sent to Dr. Agent when clicked */
  signalLabel: string
  /** Section ID for context */
  sectionId?: string
  /** Icon size (default 12) */
  size?: number
  /** Use "span" when nested inside a <button> to avoid invalid HTML */
  as?: "button" | "span"
  className?: string
}

/**
 * Small AI spark icon button for sidebar cards (medical records, lab results).
 * Clicking it opens Dr. Agent with an auto-sent contextual message.
 */
export function AiTriggerIcon({
  tooltip,
  signalLabel,
  sectionId,
  size = 14,
  as: Tag = "button",
  className,
}: AiTriggerIconProps) {
  const { publishSignal } = useRxPadSync()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger parent card expand/collapse
    publishSignal({
      type: "ai_trigger",
      label: signalLabel,
      sectionId,
    })
  }

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      role={Tag === "span" ? "button" : undefined}
      tabIndex={Tag === "span" ? 0 : undefined}
      onClick={handleClick}
      title={tooltip}
      className={cn(
        "inline-flex items-center justify-center rounded-[6px]",
        "transition-all duration-150",
        "hover:scale-110 hover:shadow-sm",
        "cursor-pointer",
        className,
      )}
      style={{
        width: size + 8,
        height: size + 8,
        background: AI_GRADIENT_SOFT,
      }}
    >
      <AiBrandSparkIcon size={size} />
    </Tag>
  )
}

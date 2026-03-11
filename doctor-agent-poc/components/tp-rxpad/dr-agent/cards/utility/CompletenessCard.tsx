"use client"

import { CheckCircle, Circle } from "lucide-react"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { cn } from "@/lib/utils"
import type { CompletenessSection } from "../../types"

interface CompletenessCardProps {
  data: {
    sections: CompletenessSection[]
    emptyCount: number
  }
  onPillTap?: (label: string) => void
}

export function CompletenessCard({ data, onPillTap }: CompletenessCardProps) {
  const emptySections = data.sections.filter((s) => !s.filled)

  // Generate action pills for empty sections
  const actionPills: Array<{ label: string }> = []
  for (const section of emptySections) {
    const name = section.name.toLowerCase()
    if (
      name.includes("investigation") ||
      name.includes("lab")
    ) {
      actionPills.push({ label: "Suggest inv" })
    } else if (
      name.includes("advice") ||
      name.includes("notes")
    ) {
      actionPills.push({ label: "Advice" })
    } else if (
      name.includes("follow") ||
      name.includes("next")
    ) {
      actionPills.push({ label: "Follow-up" })
    }
  }

  // Deduplicate pills
  const uniquePills = actionPills.filter(
    (pill, i, arr) =>
      arr.findIndex((p) => p.label === pill.label) === i
  )

  return (
    <CardShell
      icon={<span />}
      tpIconName="clipboard-activity"
      title="Documentation Check"
      badge={
        data.emptyCount > 0
          ? {
              label: `${data.emptyCount} empty`,
              color: "#64748B",
              bg: "#F1F5F9",
            }
          : undefined
      }
      actions={
        uniquePills.length > 0 ? (
          <>
            {uniquePills.map((pill) => (
              <ChatPillButton
                key={pill.label}
                label={pill.label}
                onClick={() => onPillTap?.(pill.label)}
              />
            ))}
          </>
        ) : undefined
      }
    >
      <div className="space-y-0">
        {data.sections.map((section, i) => (
          <div
            key={section.name}
            className="flex items-center gap-2 py-[4px]"
            style={i < data.sections.length - 1 ? { borderBottom: "0.5px solid var(--tp-slate-50, #F8FAFC)" } : undefined}
          >
            {/* Status icon */}
            {section.filled ? (
              <CheckCircle size={14} className="flex-shrink-0 text-tp-success-500" />
            ) : (
              <Circle size={14} className="flex-shrink-0 text-tp-slate-300" />
            )}

            {/* Section name */}
            <span
              className={cn(
                "flex-1 text-[12px]",
                section.filled
                  ? "text-tp-slate-600"
                  : "font-medium text-tp-slate-500"
              )}
            >
              {section.name}
            </span>

            {/* Count badge */}
            {section.count != null && (
              <span className="rounded-[4px] bg-tp-slate-100 px-1 py-[0.5px] text-[10px] text-tp-slate-400">
                {section.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </CardShell>
  )
}

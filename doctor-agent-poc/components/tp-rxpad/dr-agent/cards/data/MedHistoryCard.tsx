"use client"

import { CardShell } from "../CardShell"
import { InsightBox } from "../InsightBox"
import { ChatPillButton } from "../ActionRow"
import { cn } from "@/lib/utils"
import type { MedHistoryEntry } from "../../types"

interface MedHistoryCardProps {
  data: {
    entries: MedHistoryEntry[]
    insight: string
  }
  onPillTap?: (label: string) => void
}

function SourceBadge({ source }: { source: "prescribed" | "uploaded" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-[4px] px-1.5 py-[1px] text-[8px] font-semibold uppercase leading-[1.4]",
        source === "prescribed"
          ? "bg-tp-blue-50 text-tp-blue-500"
          : "bg-tp-violet-50 text-tp-violet-600"
      )}
    >
      {source}
    </span>
  )
}

export function MedHistoryCard({ data, onPillTap }: MedHistoryCardProps) {
  return (
    <CardShell
      icon={<span />}
      tpIconName="pill"
      title="Medication History"
      badge={{
        label: `${data.entries.length} found`,
        color: "#92400E",
        bg: "#FEF3C7",
      }}
      copyAll={() => {
        const text = data.entries.map(e => `${e.drug} ${e.dosage} — ${e.diagnosis}`).join('\n')
        navigator.clipboard?.writeText(text)
      }}
      copyAllTooltip="Copy medication history to clipboard"
      actions={
        <ChatPillButton label="Other drug classes" onClick={() => onPillTap?.("Other drug classes")} />
      }
    >
      <div className="space-y-0">
        {data.entries.map((entry, i) => (
          <div
            key={`${entry.drug}-${i}`}
            className={cn(
              "flex items-start gap-2 py-[4px]",
              i < data.entries.length - 1 &&
                "border-b border-tp-slate-100"
            )}
          >
            {/* Drug info */}
            <div className="min-w-0 flex-1">
              <div className="text-[12px]">
                <strong className="font-semibold text-tp-slate-800">
                  {entry.drug}
                </strong>
                <span className="ml-1 text-tp-slate-500">
                  {entry.dosage}
                </span>
              </div>
              <div className="text-[10px] text-tp-slate-400">
                {entry.date} · Dx: {entry.diagnosis}
              </div>
            </div>

            {/* Source badge */}
            <SourceBadge source={entry.source} />
          </div>
        ))}
      </div>

      {/* Insight */}
      <InsightBox variant="amber">{data.insight}</InsightBox>
    </CardShell>
  )
}

"use client"

import { useState } from "react"
import { CardShell } from "../CardShell"
import { cn } from "@/lib/utils"
import type { DrugInteractionData, SeverityLevel } from "../../types"

interface DrugInteractionCardProps {
  data: DrugInteractionData
  onAcknowledge?: () => void
}

const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  moderate: "MODERATE",
  low: "LOW",
}

const SEVERITY_BADGE: Record<SeverityLevel, { color: string; bg: string }> = {
  critical: { color: "#DC2626", bg: "#FEE2E2" },
  high: { color: "#EA580C", bg: "#FFF7ED" },
  moderate: { color: "#D97706", bg: "#FFFBEB" },
  low: { color: "#64748B", bg: "#F1F5F9" },
}

export function DrugInteractionCard({
  data,
  onAcknowledge,
}: DrugInteractionCardProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  const handleAck = () => {
    setAcknowledged(true)
    onAcknowledge?.()
  }

  const badge = SEVERITY_BADGE[data.severity]

  return (
    <CardShell
      icon={<span />}
      tpIconName="first-aid"
      title="Drug Interaction"
      badge={{ label: "DANGER", color: "#DC2626", bg: "#FEE2E2" }}
      sidebarLink={
        <button
          type="button"
          onClick={handleAck}
          disabled={acknowledged}
          className={cn(
            "inline-flex h-[28px] items-center rounded-[10px] px-4 text-[11px] font-medium transition-all",
            acknowledged
              ? "cursor-default border border-tp-slate-200 bg-tp-slate-50 text-tp-slate-400"
              : "border-[1.5px] border-tp-error-500 bg-transparent text-tp-error-600 hover:bg-tp-error-50"
          )}
        >
          {acknowledged ? "Acknowledged" : "Acknowledge"}
        </button>
      }
    >
      {/* Redesigned: white bg with left accent border */}
      <div
        className="space-y-[8px] rounded-[8px] bg-white px-3 py-[10px]"
        style={{
          borderLeft: "3px solid var(--tp-error-400, #F87171)",
          boxShadow: "0 0 0 0.5px rgba(220, 38, 38, 0.1)",
        }}
      >
        {/* Drug pair */}
        <div className="flex items-center gap-[6px] text-[12px] font-semibold text-tp-slate-800">
          <span>{data.drug1}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-tp-warning-500">
            <path d="M8 2L9.5 6H14L10.5 9L12 13L8 10.5L4 13L5.5 9L2 6H6.5L8 2Z" fill="currentColor" />
          </svg>
          <span>{data.drug2}</span>
        </div>

        {/* Severity */}
        <div className="flex items-center gap-[6px]">
          <span className="text-[9px] font-medium uppercase tracking-wider text-tp-slate-400">Severity</span>
          <span
            className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold"
            style={{ color: badge.color, backgroundColor: badge.bg }}
          >
            {SEVERITY_LABEL[data.severity]}
          </span>
        </div>

        {/* Risk */}
        <div>
          <p className="mb-[2px] text-[9px] font-medium uppercase tracking-wider text-tp-slate-400">Risk</p>
          <p className="text-[12px] leading-[1.5] text-tp-slate-700">{data.risk}</p>
        </div>

        {/* Action */}
        <div>
          <p className="mb-[2px] text-[9px] font-medium uppercase tracking-wider text-tp-slate-400">Recommended Action</p>
          <p className="text-[12px] leading-[1.5] text-tp-slate-700">{data.action}</p>
        </div>
      </div>
    </CardShell>
  )
}

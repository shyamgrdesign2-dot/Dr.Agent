"use client"

import { useState } from "react"
import { CardShell } from "../CardShell"
import { DataRow } from "../DataRow"
import { InsightBox } from "../InsightBox"
import { ChatPillButton } from "../ActionRow"
import type { OCRParameter } from "../../types"
import type { RxPadCopyPayload } from "@/components/tp-rxpad/rxpad-sync-context"

interface OCRPathologyCardProps {
  data: {
    title: string
    category: string
    parameters: OCRParameter[]
    normalCount: number
    insight: string
  }
  onPillTap?: (label: string) => void
  onCopy?: (payload: RxPadCopyPayload) => void
}

export function OCRPathologyCard({ data, onPillTap, onCopy }: OCRPathologyCardProps) {
  const [showNormal, setShowNormal] = useState(false)

  const flaggedParams = data.parameters.filter((p) => p.flag)
  const normalParams = data.parameters.filter((p) => !p.flag)

  /** Copy a single parameter to Lab Results */
  const handleCopyParam = (param: OCRParameter) => {
    onCopy?.({
      sourceDateLabel: "Today",
      targetSection: "labResults",
      labInvestigations: [`${param.name}: ${param.value}${param.refRange ? ` (ref: ${param.refRange})` : ""}`],
    })
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="Lab"
      title={data.title}
      badge={
        flaggedParams.length > 0
          ? {
              label: `${flaggedParams.length} flagged`,
              color: "#DC2626",
              bg: "#FEE2E2",
            }
          : undefined
      }
      copyAll={() =>
        onCopy?.({
          sourceDateLabel: "Today",
          targetSection: "labResults",
          labInvestigations: data.parameters.map((p) => `${p.name}: ${p.value}${p.refRange ? ` (ref: ${p.refRange})` : ""}`),
        })
      }
      copyAllTooltip="Copy complete digitized report to Lab Results"
      actions={
        <ChatPillButton label="Compare with previous" onClick={() => onPillTap?.("Compare with previous")} />
      }
    >
      {/* Category / confidence line */}
      <div className="mb-1 text-[10px] text-tp-slate-400">
        {data.category}
      </div>

      {/* Flagged parameters */}
      {flaggedParams.map((param, i) => (
        <DataRow
          key={param.name}
          label={param.name}
          value={param.value}
          flag={param.flag}
          refRange={param.refRange}
          isLast={
            !showNormal && i === flaggedParams.length - 1
          }
          onCopy={() => handleCopyParam(param)}
          copyTooltip={`Copy ${param.name} to Lab Results`}
        />
      ))}

      {/* Normal toggle */}
      {data.normalCount > 0 && (
        <button
          type="button"
          onClick={() => setShowNormal(!showNormal)}
          className="mt-1 w-full text-center text-[10px] font-medium text-tp-blue-500 transition-colors hover:text-tp-blue-600"
        >
          {showNormal
            ? "− Hide normal values"
            : `+ ${data.normalCount} normal`}
        </button>
      )}

      {/* Show normal params when toggled */}
      {showNormal &&
        normalParams.map((param, i) => (
          <DataRow
            key={param.name}
            label={param.name}
            value={param.value}
            refRange={param.refRange}
            isLast={i === normalParams.length - 1}
            onCopy={() => handleCopyParam(param)}
            copyTooltip={`Copy ${param.name} to Lab Results`}
          />
        ))}

      {/* Insight */}
      <InsightBox variant="red">{data.insight}</InsightBox>
    </CardShell>
  )
}

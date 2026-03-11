"use client"

import { CardShell } from "../CardShell"
import { InsightBox } from "../InsightBox"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import { cn } from "@/lib/utils"
import type { LabPanelData } from "../../types"

interface LabPanelCardProps {
  data: LabPanelData
  onPillTap?: (label: string) => void
  onSidebarNav?: (tab: string) => void
}

function FlagArrow({ flag }: { flag: "high" | "low" }) {
  if (flag === "high")
    return <span className="text-tp-error-500">↑</span>
  return <span className="text-tp-blue-500">↓</span>
}

export function LabPanelCard({ data, onPillTap, onSidebarNav }: LabPanelCardProps) {
  return (
    <CardShell
      icon={<span />}
      tpIconName="Lab"
      title="Lab Results"
      date={data.panelDate}
      badge={
        data.flagged.length > 0
          ? {
              label: `${data.flagged.length} flagged`,
              color: "#DC2626",
              bg: "#FEE2E2",
            }
          : undefined
      }
      copyAll={() => {
        const text = data.flagged.map(f => `${f.name}: ${f.value}${f.unit ? ` ${f.unit}` : ''}`).join('\n')
        navigator.clipboard?.writeText(text)
      }}
      copyAllTooltip="Copy flagged lab values to clipboard"
      actions={
        <>
          <ChatPillButton label="Compare prev" onClick={() => onPillTap?.("Compare prev")} />
          <ChatPillButton label="HbA1c trend" onClick={() => onPillTap?.("HbA1c trend")} />
        </>
      }
      sidebarLink={
        <SidebarLink
          text={data.hiddenNormalCount > 0
            ? `View full lab report (+${data.hiddenNormalCount} normal)`
            : "View full lab report"
          }
          onClick={() => onSidebarNav?.("labResults")}
        />
      }
    >
      {/* Grid-based lab results table */}
      <div className="overflow-hidden rounded-[8px] border border-tp-slate-100">
        {/* Header */}
        <div className="grid grid-cols-3 gap-[1px] bg-tp-slate-100 px-[8px] py-[4px] text-[9px] font-medium text-tp-slate-500 uppercase tracking-wider">
          <span>Parameter</span>
          <span>Value</span>
          <span>Ref Range</span>
        </div>
        {/* Rows */}
        {data.flagged.map((item, i) => (
            <div
              key={item.name}
              className={cn(
                "grid grid-cols-3 gap-[1px] px-[8px] py-[6px] text-[11px]",
                i % 2 === 0 ? "bg-white" : "bg-tp-slate-50",
                "border-l-[2px] border-tp-error-300",
              )}
            >
              <span className="font-medium text-tp-slate-700 truncate">{item.name}</span>
              <span className="flex items-center gap-[3px] font-medium text-tp-error-600">
                <FlagArrow flag={item.flag} />
                {item.value}{item.unit ? ` ${item.unit}` : ''}
              </span>
              <span className="text-tp-slate-400">{item.refRange ?? '—'}</span>
            </div>
        ))}
      </div>

      {/* Insight */}
      <InsightBox variant="red">{data.insight}</InsightBox>
    </CardShell>
  )
}

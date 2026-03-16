"use client"
import React from "react"
import { Chart } from "iconsax-reactjs"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import type { PieChartCardData } from "../../types"

interface Props { data: PieChartCardData; onPillTap?: (label: string) => void }

export function PieChartCard({ data, onPillTap }: Props) {
  let cumPercent = 0
  const stops = data.segments.map((seg) => {
    const start = cumPercent
    const pct = (seg.value / data.total) * 100
    cumPercent += pct
    return `${seg.color} ${start}% ${cumPercent}%`
  }).join(", ")

  return (
    <CardShell
      icon={<Chart size={14} variant="Bulk" color="var(--tp-blue-500, #3B82F6)" />}
      title={data.title}
      actions={
        <>
          <ChatPillButton label="Show patients" onClick={() => onPillTap?.("Show all fever patients")} />
          <ChatPillButton label="Monthly trend" onClick={() => onPillTap?.("Monthly trend")} />
        </>
      }
    >
      <div className="py-[2px]">
        <div className="flex items-center gap-[16px]">
          <div className="relative flex-shrink-0">
            <div className="h-[90px] w-[90px] rounded-full" style={{ background: `conic-gradient(${stops})` }} />
            <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">
              <span className="text-[13px] font-semibold text-tp-slate-800">{data.total}</span>
              <span className="text-[7px] text-tp-slate-400">{data.centerLabel}</span>
            </div>
          </div>
          <div className="flex-1 space-y-[4px]">
            {data.segments.map((seg, i) => {
              const pct = ((seg.value / data.total) * 100).toFixed(0)
              return (
                <div key={i} className="flex items-center gap-[6px]">
                  <span className="h-[8px] w-[8px] flex-shrink-0 rounded-[2px]" style={{ background: seg.color }} />
                  <span className="flex-1 text-[10px] text-tp-slate-600 truncate">{seg.label}</span>
                  <span className="text-[10px] font-semibold text-tp-slate-700">{pct}%</span>
                  <span className="text-[9px] text-tp-slate-400">({seg.value})</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </CardShell>
  )
}

"use client"
import React from "react"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import type { ConditionBarCardData } from "../../types"
import { downloadAsExcel } from "../../utils/downloadExcel"

interface Props { data: ConditionBarCardData; onPillTap?: (label: string) => void }

export function ConditionBarCard({ data, onPillTap }: Props) {
  const maxCount = Math.max(...data.items.map(i => i.count), 1)

  const handleDownload = () => {
    downloadAsExcel(
      "condition_distribution",
      ["Condition", "Count"],
      data.items.map(i => [i.condition, String(i.count)]),
    )
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="medical-record"
      title={data.title}
      sidebarLink={<SidebarLink text="Download as Excel" onClick={handleDownload} />}
      actions={
        <>
          <ChatPillButton label="Show DM patients" onClick={() => onPillTap?.("Show all DM patients")} />
          <ChatPillButton label="HbA1c distribution" onClick={() => onPillTap?.("HbA1c distribution")} />
        </>
      }
    >
      <div className="space-y-[8px]">
        {data.items.map((item, i) => {
          const widthPct = (item.count / maxCount) * 100
          return (
            <div key={i}>
              <div className="mb-[2px] flex items-center justify-between">
                <span className="text-[10px] font-medium text-tp-slate-700">{item.condition}</span>
                <span className="text-[10px] font-semibold text-tp-slate-800">{item.count}</span>
              </div>
              <div className="h-[10px] w-full rounded-full bg-tp-slate-100">
                <div className="h-full rounded-full transition-all" style={{ width: `${widthPct}%`, background: item.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {data.note && (
        <p className="mt-[8px] text-[10px] text-tp-slate-400 italic">{data.note}</p>
      )}
    </CardShell>
  )
}

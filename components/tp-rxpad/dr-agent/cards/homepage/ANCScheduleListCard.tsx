"use client"
import React, { useState } from "react"
import { Heart } from "iconsax-reactjs"
import { CardShell } from "../CardShell"
import type { ANCScheduleListCardData } from "../../types"

interface Props { data: ANCScheduleListCardData; onPillTap?: (label: string) => void }

export function ANCScheduleListCard({ data, onPillTap }: Props) {
  const [disabledItems, setDisabledItems] = useState<Set<number>>(new Set())
  const [allDisabled, setAllDisabled] = useState(false)

  const copyAll = () => {
    const text = data.items.map(i =>
      `${i.patientName} (${i.gestationalAge}) — ${i.ancItem} — Due ${i.dueWeek}${i.isOverdue ? " (Overdue)" : ""}`
    ).join("\n")
    navigator.clipboard.writeText(text)
  }

  const handleSendAll = () => {
    setAllDisabled(true)
    setDisabledItems(new Set(data.items.map((_, i) => i)))
    onPillTap?.("Send reminder to all")
  }

  const handleRemindItem = (index: number, name: string) => {
    setDisabledItems(prev => new Set(prev).add(index))
    onPillTap?.(`Remind ANC due for ${name}`)
  }

  return (
    <CardShell
      icon={<Heart size={14} variant="Bulk" color="var(--tp-violet-500, #8B5CF6)" />}
      title={data.title}
      badge={data.overdueCount > 0 ? { label: `${data.overdueCount} overdue`, color: "#DC2626", bg: "#FEE2E2" } : undefined}
      copyAll={copyAll}
      copyAllTooltip="Copy ANC schedule"
      sidebarLink={
        data.items.length > 0 && !allDisabled ? (
          <button
            type="button"
            className="inline-flex h-[28px] items-center rounded-[10px] border-[1.5px] border-tp-violet-500 bg-transparent px-4 text-[11px] font-medium text-tp-violet-600 hover:bg-tp-violet-50 transition-all"
            onClick={handleSendAll}
          >
            Send reminder to all ({data.items.length})
          </button>
        ) : undefined
      }
    >
      <div className="space-y-[5px]">
        {data.items.map((item, i) => {
          const isDisabled = disabledItems.has(i)
          return (
            <div key={i} className="flex items-center gap-[8px] rounded-[8px] bg-tp-slate-50 px-[8px] py-[6px] transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[4px]">
                  <p className="truncate text-[11px] font-medium text-tp-slate-800">
                    {item.patientName}
                  </p>
                  <span className="flex-shrink-0 rounded-[4px] bg-tp-violet-50 px-[5px] py-[1px] text-[8px] font-semibold text-tp-violet-600">
                    {item.gestationalAge}
                  </span>
                  {item.isOverdue && (
                    <span className="flex-shrink-0 rounded-[4px] bg-tp-error-50 px-[5px] py-[1px] text-[8px] font-semibold uppercase text-tp-error-600">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-tp-slate-400">
                  {item.ancItem} · Due {item.dueWeek}
                </p>
              </div>
              <button
                type="button"
                disabled={isDisabled}
                className="flex-shrink-0 rounded-[6px] border border-tp-violet-400 bg-transparent px-[10px] py-[3px] text-[9px] font-medium text-tp-violet-600 transition-colors hover:bg-tp-violet-50 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => handleRemindItem(i, item.patientName)}
              >
                Remind
              </button>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}

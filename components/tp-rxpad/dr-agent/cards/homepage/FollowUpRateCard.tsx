"use client"

import { CardShell } from "../CardShell"
import { Chart2 } from "iconsax-reactjs"
import type { FollowUpRateCardData } from "../../types"

interface Props {
  data: FollowUpRateCardData
}

export function FollowUpRateCard({ data }: Props) {
  const delta = data.currentRate - data.lastWeekRate
  const deltaTone = delta >= 0 ? "text-tp-success-600" : "text-tp-error-600"
  const trendMax = Math.max(...data.trend.map((p) => p.rate), 1)

  return (
    <CardShell
      icon={<Chart2 size={14} variant="Bulk" color="var(--tp-blue-500, #3B82F6)" />}
      title={data.title}
    >
      <div className="grid grid-cols-2 gap-[6px]">
        <div className="rounded-[8px] bg-tp-blue-50/60 px-[8px] py-[7px]">
          <p className="text-[9px] text-tp-blue-500">Current follow-up rate</p>
          <p className="text-[13px] font-semibold text-tp-blue-700">{data.currentRate}%</p>
        </div>
        <div className="rounded-[8px] bg-tp-slate-50 px-[8px] py-[7px]">
          <p className="text-[9px] text-tp-slate-500">Change vs last week</p>
          <p className={`text-[13px] font-semibold ${deltaTone}`}>{delta >= 0 ? "+" : ""}{delta}%</p>
        </div>
      </div>

      <div className="mt-[8px] rounded-[8px] border border-tp-slate-100 bg-white px-[8px] py-[7px]">
        <div className="grid grid-cols-2 gap-y-[4px] text-[10px] text-tp-slate-600">
          <p>Due today: <span className="font-semibold text-tp-slate-800">{data.dueToday}</span></p>
          <p>Overdue today: <span className="font-semibold text-tp-warning-700">{data.overdueToday}</span></p>
          <p>Completed this week: <span className="font-semibold text-tp-success-700">{data.completedThisWeek}</span></p>
          <p>Scheduled this week: <span className="font-semibold text-tp-slate-800">{data.scheduledThisWeek}</span></p>
        </div>
      </div>

      <div className="mt-[8px] rounded-[8px] border border-tp-slate-100 bg-white px-[8px] py-[7px]">
        <p className="text-[9px] text-tp-slate-500">4-week trend</p>
        <div className="mt-[6px] flex items-end gap-[6px]">
          {data.trend.map((point) => {
            const h = Math.max(8, Math.round((point.rate / trendMax) * 30))
            return (
              <div key={point.label} className="flex flex-col items-center gap-[3px]">
                <div className="w-[14px] rounded-[3px] bg-tp-blue-500/80" style={{ height: `${h}px` }} />
                <span className="text-[8px] text-tp-slate-500">{point.label}</span>
              </div>
            )
          })}
          <span className="ml-auto text-[9px] text-tp-slate-500">
            Avg: <span className="font-semibold text-tp-slate-700">{Math.round(data.trend.reduce((a, p) => a + p.rate, 0) / Math.max(1, data.trend.length))}%</span>
          </span>
        </div>
      </div>
    </CardShell>
  )
}

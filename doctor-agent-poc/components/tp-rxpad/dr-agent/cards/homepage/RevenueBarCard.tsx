"use client"
import React from "react"
import { MoneyRecive } from "iconsax-reactjs"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import type { RevenueBarCardData } from "../../types"
import { downloadAsExcel } from "../../utils/downloadExcel"

interface Props { data: RevenueBarCardData; onPillTap?: (label: string) => void }

export function RevenueBarCard({ data, onPillTap }: Props) {
  const maxValue = Math.max(...data.days.map(d => d.paid + d.due), 1)
  const barWidth = 32
  const barGap = 12
  const chartHeight = 100
  const svgWidth = data.days.length * (barWidth + barGap) - barGap + 20

  const copyAll = () => {
    const lines = data.days.map(d => `${d.label}: Paid ₹${d.paid}, Due ₹${d.due}`)
    navigator.clipboard.writeText(`${data.title}\nTotal: ₹${data.totalRevenue} (Paid: ₹${data.totalPaid}, Due: ₹${data.totalDue})\n${lines.join("\n")}`)
  }

  const handleDownload = () => {
    downloadAsExcel(
      "revenue_report",
      ["Day", "Paid (₹)", "Due (₹)", "Total (₹)"],
      data.days.map(d => [d.label, String(d.paid), String(d.due), String(d.paid + d.due)]),
    )
  }

  // Grid line positions at 25%, 50%, 75%
  const gridLines = [0.25, 0.5, 0.75].map(pct => chartHeight - pct * chartHeight)

  return (
    <CardShell
      icon={<MoneyRecive size={14} variant="Bulk" />}
      title={data.title}
      copyAll={copyAll}
      copyAllTooltip="Copy revenue data"
      sidebarLink={<SidebarLink text="Download as Excel" onClick={handleDownload} />}
      actions={
        <>
          <ChatPillButton label="Compare with last week" onClick={() => onPillTap?.("Compare with last week")} />
          <ChatPillButton label="Weekday breakdown" onClick={() => onPillTap?.("Weekday breakdown")} />
        </>
      }
    >
      {/* Revenue Summary — highlighted chips for quick scanning */}
      <div className="mb-[10px] flex items-stretch gap-[6px]">
        {/* Total */}
        <div className="flex flex-1 flex-col items-center rounded-[8px] bg-tp-slate-50 px-[8px] py-[6px]">
          <span className="text-[15px] font-bold leading-none text-tp-slate-800">
            &#x20B9;{data.totalRevenue.toLocaleString("en-IN")}
          </span>
          <span className="mt-[3px] text-[9px] font-medium uppercase tracking-wide text-tp-slate-400">
            Total
          </span>
        </div>
        {/* Paid */}
        <div className="flex flex-1 flex-col items-center rounded-[8px] px-[8px] py-[6px]" style={{ backgroundColor: "rgba(34,197,94,0.08)" }}>
          <span className="text-[15px] font-bold leading-none" style={{ color: "var(--tp-success-600, #16A34A)" }}>
            &#x20B9;{data.totalPaid.toLocaleString("en-IN")}
          </span>
          <span className="mt-[3px] text-[9px] font-medium uppercase tracking-wide" style={{ color: "var(--tp-success-500, #22C55E)" }}>
            Paid
          </span>
        </div>
        {/* Due */}
        <div className="flex flex-1 flex-col items-center rounded-[8px] px-[8px] py-[6px]" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
          <span className="text-[15px] font-bold leading-none" style={{ color: "var(--tp-warning-600, #D97706)" }}>
            &#x20B9;{data.totalDue.toLocaleString("en-IN")}
          </span>
          <span className="mt-[3px] text-[9px] font-medium uppercase tracking-wide" style={{ color: "var(--tp-warning-500, #F59E0B)" }}>
            Due
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="py-[2px] overflow-x-auto">
        <svg width={svgWidth} height={chartHeight + 20} className="block">
          {/* Grid lines */}
          {gridLines.map((y, i) => (
            <line key={i} x1={6} y1={y} x2={svgWidth - 6} y2={y} stroke="var(--tp-slate-200, #E2E8F0)" strokeWidth={0.5} strokeDasharray="3 3" />
          ))}
          {data.days.map((day, i) => {
            const x = 10 + i * (barWidth + barGap)
            const totalH = ((day.paid + day.due) / maxValue) * chartHeight
            const paidH = (day.paid / maxValue) * chartHeight
            const dueH = totalH - paidH
            return (
              <g key={i}>
                <rect x={x} y={chartHeight - totalH} width={barWidth} height={dueH} rx={4} fill="var(--tp-warning-500, #F59E0B)" opacity={0.75} />
                <rect x={x} y={chartHeight - paidH} width={barWidth} height={paidH} rx={4} fill="var(--tp-success-500, #22C55E)" opacity={0.85} />
                <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" className="text-[9px] fill-tp-slate-500" style={{ fontFamily: "DM Sans" }}>{day.label}</text>
              </g>
            )
          })}
          <line x1={6} y1={chartHeight} x2={svgWidth - 6} y2={chartHeight} stroke="var(--tp-slate-200, #E2E8F0)" strokeWidth={1} />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-[8px] flex gap-[12px] text-[9px] text-tp-slate-400">
        <span className="flex items-center gap-[3px]"><span className="inline-block h-[6px] w-[6px] rounded-[2px]" style={{ backgroundColor: "var(--tp-success-500, #22C55E)" }} /> Paid</span>
        <span className="flex items-center gap-[3px]"><span className="inline-block h-[6px] w-[6px] rounded-[2px]" style={{ backgroundColor: "var(--tp-warning-500, #F59E0B)" }} /> Due</span>
      </div>
    </CardShell>
  )
}

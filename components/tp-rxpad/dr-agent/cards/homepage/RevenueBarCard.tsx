"use client"
import React from "react"
import { MoneyRecive } from "iconsax-reactjs"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import type { RevenueBarCardData } from "../../types"

interface Props { data: RevenueBarCardData; onPillTap?: (label: string) => void }

export function RevenueBarCard({ data, onPillTap }: Props) {
  const isDepositMode = data.mode === "deposit"
  const isSinglePoint = data.days.length === 1
  const barWidth = 32
  const barGap = 12
  const chartHeight = 100
  const svgWidth = data.days.length * (barWidth + barGap) - barGap + 20
  const segmentGap = 2

  const copyAll = () => {
    const lines = data.days.map(d => `${d.label}: Paid ₹${d.paid}, Due ₹${d.due}, Refunded ₹${d.refunded ?? 0}`)
    navigator.clipboard.writeText(
      `${data.title}\nTotal: ₹${data.totalRevenue} (Primary: ₹${data.totalPaid}, Secondary: ₹${data.totalDue}, Refunded: ₹${data.totalRefunded})\n${lines.join("\n")}`,
    )
  }

  // Grid line positions at 25%, 50%, 75%
  const gridLines = [0.25, 0.5, 0.75].map(pct => chartHeight - pct * chartHeight)

  return (
    <CardShell
      icon={<MoneyRecive size={14} variant="Bulk" />}
      title={data.title}
      copyAll={copyAll}
      copyAllTooltip={isDepositMode ? "Copy deposit data" : "Copy billing data"}
      actions={
        <>
          {!isDepositMode ? (
            <>
              <ChatPillButton label="This Week's Deposits" onClick={() => onPillTap?.("This Week's Deposits")} />
              <ChatPillButton label="Compare with yesterday" onClick={() => onPillTap?.("Compare with yesterday")} />
            </>
          ) : (
            <>
              <ChatPillButton label="This Week's Billing" onClick={() => onPillTap?.("This Week's Billing")} />
              <ChatPillButton label="Compare with yesterday" onClick={() => onPillTap?.("Compare with yesterday")} />
            </>
          )}
        </>
      }
    >
      {/* Summary chips */}
      <div className="mb-[10px] grid grid-cols-2 gap-[6px]">
        <div className="rounded-[8px] bg-tp-slate-50 px-[8px] py-[7px]">
          <span className="block truncate text-[13px] font-semibold leading-tight text-tp-slate-800">
            &#x20B9;{data.totalRevenue.toLocaleString("en-IN")}
          </span>
          <span className="mt-[3px] block text-[9px] font-medium text-tp-slate-500">
            {isDepositMode ? "Total advance received" : "Total billed amount"}
          </span>
        </div>
        <div className="rounded-[8px] px-[8px] py-[7px]" style={{ backgroundColor: isDepositMode ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)" }}>
          <span className="block truncate text-[13px] font-semibold leading-tight" style={{ color: isDepositMode ? "var(--tp-error-600, #DC2626)" : "var(--tp-success-600, #16A34A)" }}>
            &#x20B9;{isDepositMode ? data.totalRefunded.toLocaleString("en-IN") : data.totalPaid.toLocaleString("en-IN")}
          </span>
          <span className="mt-[3px] block text-[9px] font-medium" style={{ color: isDepositMode ? "var(--tp-error-500, #EF4444)" : "var(--tp-success-500, #22C55E)" }}>
            {isDepositMode ? "Total advance refunded" : "Paid fully"}
          </span>
        </div>
        <div className="rounded-[8px] px-[8px] py-[7px]" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
          <span className="block truncate text-[13px] font-semibold leading-tight" style={{ color: "var(--tp-warning-600, #D97706)" }}>
            &#x20B9;{data.totalDue.toLocaleString("en-IN")}
          </span>
          <span className="mt-[3px] block text-[9px] font-medium" style={{ color: "var(--tp-warning-500, #F59E0B)" }}>
            {isDepositMode ? "Total advance debited" : "Due"}
          </span>
        </div>
        {!isDepositMode && (
          <div className="rounded-[8px] px-[8px] py-[7px]" style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
            <span className="block truncate text-[13px] font-semibold leading-tight" style={{ color: "var(--tp-error-600, #DC2626)" }}>
              &#x20B9;{data.totalRefunded.toLocaleString("en-IN")}
            </span>
            <span className="mt-[3px] block text-[9px] font-medium" style={{ color: "var(--tp-error-500, #EF4444)" }}>
              Refunded
            </span>
          </div>
        )}
      </div>

      {/* SVG Bar Chart (multi-day only) */}
      {!isSinglePoint && (
        <div className="py-[2px] overflow-x-auto">
          <svg width={svgWidth} height={chartHeight + 20} className="block">
            {/* Grid lines */}
            {gridLines.map((y, i) => (
              <line key={i} x1={6} y1={y} x2={svgWidth - 6} y2={y} stroke="var(--tp-slate-200, #E2E8F0)" strokeWidth={0.5} strokeDasharray="3 3" />
            ))}
            {data.days.map((day, i) => {
              const x = 10 + i * (barWidth + barGap)
              const refunded = day.refunded ?? 0
              const segments = [
                { key: "paid", value: day.paid, color: "var(--tp-success-500, #22C55E)", opacity: 0.85 },
                { key: "due", value: day.due, color: "var(--tp-warning-500, #F59E0B)", opacity: 0.75 },
                { key: "refunded", value: refunded, color: "var(--tp-error-500, #EF4444)", opacity: 0.9 },
              ].filter((segment) => segment.value > 0)

              const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0)
              const totalGapHeight = Math.max(segments.length - 1, 0) * segmentGap
              const drawableHeight = Math.max(chartHeight - totalGapHeight, 0)

              let cursorY = chartHeight
              return (
                <g key={i}>
                  {segments.map((segment, segmentIndex) => {
                    const height = totalValue > 0 ? (segment.value / totalValue) * drawableHeight : 0
                    const y = cursorY - height
                    cursorY = y - segmentGap
                    return (
                      <rect
                        key={`${segment.key}-${segmentIndex}`}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx={4}
                        fill={segment.color}
                        opacity={segment.opacity}
                      />
                    )
                  })}
                  <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" className="text-[9px] fill-tp-slate-500" style={{ fontFamily: "DM Sans" }}>{day.label}</text>
                </g>
              )
            })}
            <line x1={6} y1={chartHeight} x2={svgWidth - 6} y2={chartHeight} stroke="var(--tp-slate-200, #E2E8F0)" strokeWidth={1} />
          </svg>
        </div>
      )}

      {/* Legend (multi-day only) */}
      {!isSinglePoint && (
        <div className="mt-[8px] flex gap-[12px] text-[9px] text-tp-slate-400">
          <span className="flex items-center gap-[3px]"><span className="inline-block h-[6px] w-[6px] rounded-[2px]" style={{ backgroundColor: "var(--tp-success-500, #22C55E)" }} /> {isDepositMode ? "Received" : "Paid fully"}</span>
          <span className="flex items-center gap-[3px]"><span className="inline-block h-[6px] w-[6px] rounded-[2px]" style={{ backgroundColor: "var(--tp-warning-500, #F59E0B)" }} /> {isDepositMode ? "Debited" : "Due"}</span>
          <span className="flex items-center gap-[3px]"><span className="inline-block h-[6px] w-[6px] rounded-[2px]" style={{ backgroundColor: "var(--tp-error-500, #EF4444)" }} /> Refunded</span>
        </div>
      )}
    </CardShell>
  )
}

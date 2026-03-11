"use client"

import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import type { VitalTrendSeries } from "../../types"

interface VitalTrendsBarCardProps {
  data: {
    title: string
    series: VitalTrendSeries[]
  }
  onPillTap?: (label: string) => void
}

const TONE_BG: Record<"ok" | "warn" | "critical", string> = {
  ok: "bg-tp-success-500",
  warn: "bg-tp-warning-500",
  critical: "bg-tp-error-500",
}

const TONE_DOT: Record<"ok" | "warn" | "critical", string> = {
  ok: "var(--tp-success-500, #22C55E)",
  warn: "var(--tp-warning-500, #F59E0B)",
  critical: "var(--tp-error-500, #EF4444)",
}

function getTrendSummary(series: VitalTrendSeries): string {
  if (series.values.length < 2) return ""
  const first = series.values[0]
  const last = series.values[series.values.length - 1]
  const overallDiff = last - first
  const overallPct = Math.abs(overallDiff / (first || 1)) * 100
  if (overallPct < 2) return "\u2192 Stable"
  if (overallDiff > 0) return "\u2191 Increasing"
  return "\u2193 Declining"
}

function BarChart({ series }: { series: VitalTrendSeries }) {
  const maxVal = Math.max(...series.values, series.threshold ?? 0) * 1.15
  const minVal = Math.min(...series.values) * 0.85
  const chartH = 72 // usable bar height in px
  const trendText = getTrendSummary(series)

  const barHeight = (val: number) => {
    const ratio = maxVal > minVal ? (val - minVal) / (maxVal - minVal) : 0.5
    return Math.max(4, ratio * chartH)
  }

  const thresholdBottom = series.threshold != null && maxVal > minVal
    ? ((series.threshold - minVal) / (maxVal - minVal)) * chartH
    : null

  return (
    <div className="mb-2">
      {/* Series label */}
      <div className="mb-[6px] flex items-center gap-1.5">
        <div
          className="h-[8px] w-[8px] rounded-full"
          style={{ backgroundColor: TONE_DOT[series.tone] }}
        />
        <span className="text-[12px] font-semibold text-tp-slate-700">
          {series.label}
        </span>
        <span className="text-[10px] text-tp-slate-400">{series.unit}</span>
        {trendText && (
          <span className="ml-auto text-[10px] font-medium text-tp-slate-500">
            {trendText}
          </span>
        )}
      </div>

      {/* Bar chart area */}
      <div className="relative flex items-end gap-[6px] px-[4px]" style={{ height: chartH + 20 }}>
        {/* Threshold dashed line */}
        {thresholdBottom != null && (
          <div
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-tp-error-300"
            style={{ bottom: thresholdBottom + 18 }}
          >
            <span className="absolute -top-[12px] right-0 text-[8px] font-medium text-tp-error-400">
              {series.thresholdLabel ?? series.threshold}
            </span>
          </div>
        )}

        {series.values.map((val, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center gap-[2px]"
          >
            {/* Value on top */}
            <span className="text-[9px] font-semibold text-tp-slate-600">
              {val}
            </span>
            {/* Bar */}
            <div
              className={`w-full max-w-[32px] rounded-t-[4px] ${TONE_BG[series.tone]} transition-all`}
              style={{ height: barHeight(val) }}
            />
            {/* Date below */}
            <span className="mt-[2px] text-[8px] text-tp-slate-400">
              {series.dates[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function VitalTrendsBarCard({ data, onPillTap }: VitalTrendsBarCardProps) {
  const totalVisits = data.series.length > 0 ? data.series[0].values.length : 0

  return (
    <CardShell
      icon={<span />}
      tpIconName="Heart Rate"
      title={data.title}
      date={`${totalVisits} visits`}
      copyAll={() => {
        const text = data.series.map(s =>
          `${s.label} (${s.unit}): ${s.dates.map((d, i) => `${d}: ${s.values[i]}`).join(", ")}`
        ).join("\n")
        navigator.clipboard?.writeText(text)
      }}
      copyAllTooltip="Copy vitals data to clipboard"
      actions={
        <>
          <ChatPillButton label="All vitals" onClick={() => onPillTap?.("All vitals")} />
          <ChatPillButton label="View line graph" onClick={() => onPillTap?.("View line graph")} />
        </>
      }
      sidebarLink={<SidebarLink text="View full vitals history" />}
    >
      {data.series.map((s) => (
        <BarChart key={s.label} series={s} />
      ))}
    </CardShell>
  )
}

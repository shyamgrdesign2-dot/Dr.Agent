"use client"

import { useState } from "react"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import { ViewToggle } from "../ViewToggle"
import { ChartTypeToggle } from "../ChartTypeToggle"
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

const LINE_COLORS = [
  "#14B8A6", // teal
  "#8B5CF6", // violet
  "#EF4444", // red
  "#F59E0B", // amber
  "#3B82F6", // blue
]

function LineChart({ series: allSeries, multiSeries = false }: { series: VitalTrendSeries[]; multiSeries?: boolean }) {
  const SVG_W = 280
  const SVG_H = multiSeries ? 130 : 100
  const PAD = { top: 14, right: 10, bottom: 22, left: 32 }
  const plotW = SVG_W - PAD.left - PAD.right
  const plotH = SVG_H - PAD.top - PAD.bottom

  const allValues = allSeries.flatMap((s) => s.values)
  const allThresholds = allSeries.filter((s) => s.threshold != null).map((s) => s.threshold!)
  const globalMin = Math.min(...allValues, ...allThresholds) * 0.9
  const globalMax = Math.max(...allValues, ...allThresholds) * 1.1
  const range = globalMax - globalMin || 1

  const maxPoints = Math.max(...allSeries.map((s) => s.values.length))
  if (maxPoints < 2) {
    return <div className="py-3 text-center text-[10px] text-tp-slate-400">Insufficient data for line graph</div>
  }

  const xStep = maxPoints > 1 ? plotW / (maxPoints - 1) : 0
  const xPositions = Array.from({ length: maxPoints }, (_, i) => PAD.left + i * xStep)
  const yScale = (val: number) => PAD.top + plotH - ((val - globalMin) / range) * plotH
  const yTicks = [globalMin, (globalMin + globalMax) / 2, globalMax]
  const longestSeries = allSeries.reduce((a, b) => (a.dates.length >= b.dates.length ? a : b))

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: multiSeries ? 180 : 140 }}>
      {yTicks.map((tick) => (
        <text key={`y-${tick}`} x={PAD.left - 4} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" className="fill-tp-slate-400" fontSize={7}>{Math.round(tick)}</text>
      ))}
      {yTicks.map((tick) => (
        <line key={`grid-${tick}`} x1={PAD.left} y1={yScale(tick)} x2={SVG_W - PAD.right} y2={yScale(tick)} stroke="var(--tp-slate-100, #F1F5F9)" strokeWidth={0.5} />
      ))}
      {allSeries.map((s, si) =>
        s.threshold != null ? (
          <line key={`thresh-${si}`} x1={PAD.left} y1={yScale(s.threshold)} x2={SVG_W - PAD.right} y2={yScale(s.threshold)} stroke={LINE_COLORS[si % LINE_COLORS.length]} strokeWidth={0.8} strokeDasharray="4 2" opacity={0.5} />
        ) : null
      )}
      {allSeries.map((s, si) => {
        const color = LINE_COLORS[si % LINE_COLORS.length]
        const points = s.values.map((v, i) => `${xPositions[i]},${yScale(v)}`).join(" ")
        return (
          <g key={s.label}>
            <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            {s.values.map((v, i) => (
              <g key={i}>
                <circle cx={xPositions[i]} cy={yScale(v)} r={2.5} fill="white" stroke={color} strokeWidth={1.2}>
                  <title>{`${s.label}: ${v} ${s.unit} (${s.dates[i]})`}</title>
                </circle>
                <text x={xPositions[i]} y={yScale(v) - 6} textAnchor="middle" fontSize={6} fontWeight="bold" fill={color}>{v}</text>
              </g>
            ))}
          </g>
        )
      })}
      {longestSeries.dates.map((d, i) => (
        <text key={`x-${d}-${i}`} x={xPositions[i]} y={SVG_H - 4} textAnchor="middle" className="fill-tp-slate-400" fontSize={7}>{d}</text>
      ))}
    </svg>
  )
}

function VitalTrendsTable({ series }: { series: VitalTrendSeries[] }) {
  if (series.length === 0) return null
  const longestSeries = series.reduce((a, b) => (a.dates.length >= b.dates.length ? a : b))
  const dates = longestSeries.dates

  const toneColor = (tone: "ok" | "warn" | "critical", value: number, threshold?: number) => {
    if (tone === "critical") return "text-red-500 font-semibold"
    if (tone === "warn") return "text-amber-500 font-semibold"
    if (threshold != null && value < threshold) return "text-red-500 font-semibold"
    return ""
  }

  return (
    <table className="w-full text-[10px]">
      <thead>
        <tr className="text-tp-slate-400 font-medium border-b border-tp-slate-100">
          <th className="text-left py-1 pr-2">Date</th>
          {series.map((s) => (
            <th key={s.label} className="text-right py-1 px-1">{s.label} ({s.unit})</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dates.map((date, di) => (
          <tr key={date} className={di % 2 === 1 ? "bg-tp-slate-50/50" : ""}>
            <td className="text-left py-[3px] pr-2 text-tp-slate-500">{date}</td>
            {series.map((s) => {
              const val = di < s.values.length ? s.values[di] : null
              return (
                <td key={s.label} className={`text-right py-[3px] px-1 ${val != null ? toneColor(s.tone, val, s.threshold) : "text-tp-slate-300"}`}>
                  {val != null ? val : "\u2014"}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function VitalTrendsBarCard({ data, onPillTap }: VitalTrendsBarCardProps) {
  const [viewMode, setViewMode] = useState<"graph" | "text">("graph")
  const [chartType, setChartType] = useState<"line" | "bar">("bar")
  const totalVisits = data.series.length > 0 ? data.series[0].values.length : 0
  const isMultiSeries = data.series.length > 1

  return (
    <CardShell
      icon={<span />}
      tpIconName="Heart Rate"
      title={data.title}
      date={`${totalVisits} visits`}
      actions={
        <ChatPillButton label="All vitals" onClick={() => onPillTap?.("All vitals")} />
      }
      sidebarLink={<SidebarLink text="View full vitals history" />}
    >
      {data.series.length > 0 ? (
        <>
          {/* Toggle row: Graph/Text on left, Line/Bar on right */}
          <div className="mb-[6px] flex items-center justify-between">
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            {viewMode === "graph" && (
              <ChartTypeToggle chartType={chartType} onChange={setChartType} />
            )}
          </div>

          {viewMode === "graph" ? (
            <>
              {chartType === "bar" ? (
                data.series.map((s) => <BarChart key={s.label} series={s} />)
              ) : (
                <>
                  <LineChart series={data.series} multiSeries={isMultiSeries} />
                  <div className="mt-1 flex flex-wrap gap-3">
                    {data.series.map((s, si) => (
                      <div key={s.label} className="flex items-center gap-1">
                        <div className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: LINE_COLORS[si % LINE_COLORS.length] }} />
                        <span className="text-[9px] text-tp-slate-500">{s.label}{isMultiSeries ? ` (${s.unit})` : ""}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <VitalTrendsTable series={data.series} />
          )}
        </>
      ) : (
        <div className="py-4 text-center text-[12px] text-tp-slate-400">
          No vitals data available for charting.
        </div>
      )}
    </CardShell>
  )
}

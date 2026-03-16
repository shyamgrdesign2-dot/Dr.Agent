"use client"

import { useState } from "react"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import { ViewToggle } from "../ViewToggle"
import { ChartTypeToggle } from "../ChartTypeToggle"
import type { VitalTrendSeries } from "../../types"

interface LabTrendsCardProps {
  data: {
    title: string
    series: VitalTrendSeries[]
    parameterName: string
  }
  onPillTap?: (label: string) => void
}

/** Color coding: critical/warn = red shades, ok = green */
function seriesColor(tone: VitalTrendSeries["tone"]): string {
  if (tone === "critical") return "#EF4444" // red-500
  if (tone === "warn") return "#F59E0B"     // amber-500
  return "#22C55E"                           // green-500
}

const TONE_BG: Record<"ok" | "warn" | "critical", string> = {
  ok: "bg-tp-success-500",
  warn: "bg-tp-warning-500",
  critical: "bg-tp-error-500",
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

function LabBarChart({ series }: { series: VitalTrendSeries }) {
  const maxVal = Math.max(...series.values, series.threshold ?? 0) * 1.15
  const minVal = Math.min(...series.values) * 0.85
  const chartH = 72
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
      <div className="mb-[6px] flex items-center gap-1.5">
        <div className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: seriesColor(series.tone) }} />
        <span className="text-[12px] font-semibold text-tp-slate-700">{series.label}</span>
        <span className="text-[10px] text-tp-slate-400">{series.unit}</span>
        {trendText && <span className="ml-auto text-[10px] font-medium text-tp-slate-500">{trendText}</span>}
      </div>
      <div className="relative flex items-end gap-[6px] px-[4px]" style={{ height: chartH + 20 }}>
        {thresholdBottom != null && (
          <div className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-tp-error-300" style={{ bottom: thresholdBottom + 18 }}>
            <span className="absolute -top-[12px] right-0 text-[8px] font-medium text-tp-error-400">{series.thresholdLabel ?? series.threshold}</span>
          </div>
        )}
        {series.values.map((val, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-[2px]">
            <span className="text-[9px] font-semibold text-tp-slate-600">{val}</span>
            <div className={`w-full max-w-[32px] rounded-t-[4px] ${TONE_BG[series.tone]} transition-all`} style={{ height: barHeight(val) }} />
            <span className="mt-[2px] text-[8px] text-tp-slate-400">{series.dates[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LabLineChart({ series: allSeries }: { series: VitalTrendSeries[] }) {
  const SVG_W = 280
  const SVG_H = 100
  const PAD = { top: 10, right: 10, bottom: 22, left: 32 }
  const plotW = SVG_W - PAD.left - PAD.right
  const plotH = SVG_H - PAD.top - PAD.bottom

  // Compute global min/max across all series
  const allValues = allSeries.flatMap((s) => s.values)
  const allThresholds = allSeries
    .filter((s) => s.threshold != null)
    .map((s) => s.threshold!)
  const globalMin = Math.min(...allValues, ...allThresholds) * 0.9
  const globalMax = Math.max(...allValues, ...allThresholds) * 1.1
  const range = globalMax - globalMin || 1

  const maxPoints = Math.max(...allSeries.map((s) => s.values.length))
  if (maxPoints < 2) {
    return (
      <div className="py-3 text-center text-[10px] text-tp-slate-400">
        Insufficient data for line graph (need at least 2 data points)
      </div>
    )
  }

  // X positions
  const xStep = maxPoints > 1 ? plotW / (maxPoints - 1) : 0
  const xPositions = Array.from(
    { length: maxPoints },
    (_, i) => PAD.left + i * xStep
  )

  // Y scale
  const yScale = (val: number) =>
    PAD.top + plotH - ((val - globalMin) / range) * plotH

  // Y-axis labels (3 ticks)
  const yTicks = [globalMin, (globalMin + globalMax) / 2, globalMax]

  // X-axis dates (from longest series)
  const longestSeries = allSeries.reduce((a, b) =>
    a.dates.length >= b.dates.length ? a : b
  )

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full"
      style={{ maxHeight: 140 }}
    >
      {/* Y-axis labels */}
      {yTicks.map((tick) => (
        <text
          key={`y-${tick}`}
          x={PAD.left - 4}
          y={yScale(tick)}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-tp-slate-400"
          fontSize={7}
        >
          {Math.round(tick * 10) / 10}
        </text>
      ))}

      {/* Y-axis grid lines */}
      {yTicks.map((tick) => (
        <line
          key={`grid-${tick}`}
          x1={PAD.left}
          y1={yScale(tick)}
          x2={SVG_W - PAD.right}
          y2={yScale(tick)}
          stroke="var(--tp-slate-100, #F1F5F9)"
          strokeWidth={0.5}
        />
      ))}

      {/* Threshold dashed lines with labels */}
      {allSeries.map((s, si) =>
        s.threshold != null ? (
          <g key={`thresh-${si}`}>
            <line
              x1={PAD.left}
              y1={yScale(s.threshold)}
              x2={SVG_W - PAD.right}
              y2={yScale(s.threshold)}
              stroke="#EF4444"
              strokeWidth={0.8}
              strokeDasharray="4 2"
              opacity={0.6}
            />
            {s.thresholdLabel && (
              <text
                x={SVG_W - PAD.right}
                y={yScale(s.threshold) - 4}
                textAnchor="end"
                fontSize={6}
                fill="#EF4444"
                opacity={0.7}
              >
                {s.thresholdLabel}
              </text>
            )}
          </g>
        ) : null
      )}

      {/* Series polylines + data points */}
      {allSeries.map((s, si) => {
        const color = seriesColor(s.tone)
        const points = s.values
          .map((v, i) => `${xPositions[i]},${yScale(v)}`)
          .join(" ")

        return (
          <g key={s.label}>
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {s.values.map((v, i) => {
              // Color code per-point: above threshold = red, below = green
              const pointColor =
                s.threshold != null && v > s.threshold ? "#EF4444" : "#22C55E"

              return (
                <g key={i}>
                  <circle
                    cx={xPositions[i]}
                    cy={yScale(v)}
                    r={2.5}
                    fill="white"
                    stroke={pointColor}
                    strokeWidth={1.2}
                  >
                    <title>{`${s.label}: ${v} ${s.unit} (${s.dates[i]})`}</title>
                  </circle>
                  <text
                    x={xPositions[i]}
                    y={yScale(v) - 6}
                    textAnchor="middle"
                    fontSize={6}
                    fontWeight="bold"
                    fill={pointColor}
                  >
                    {v}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* X-axis date labels */}
      {longestSeries.dates.map((d, i) => (
        <text
          key={`x-${d}-${i}`}
          x={xPositions[i]}
          y={SVG_H - 4}
          textAnchor="middle"
          className="fill-tp-slate-400"
          fontSize={7}
        >
          {d}
        </text>
      ))}
    </svg>
  )
}

/**
 * Lab trends table — mirrors VitalTrendsTable format.
 * Rows = dates, Columns = parameters with unit.
 * Values above threshold are highlighted red.
 */
function LabTrendsTable({ series }: { series: VitalTrendSeries[] }) {
  if (series.length === 0) return null

  // Build unified date list from the longest series
  const longestSeries = series.reduce((a, b) =>
    a.dates.length >= b.dates.length ? a : b
  )
  const dates = longestSeries.dates

  const toneColor = (
    tone: "ok" | "warn" | "critical",
    value: number,
    threshold?: number,
  ) => {
    if (tone === "critical") return "text-red-500 font-semibold"
    if (tone === "warn") return "text-amber-500 font-semibold"
    if (threshold != null && value > threshold) return "text-red-500 font-semibold"
    return ""
  }

  return (
    <table className="w-full text-[10px]">
      <thead>
        <tr className="text-tp-slate-400 font-medium border-b border-tp-slate-100">
          <th className="text-left py-1 pr-2">Date</th>
          {series.map((s) => (
            <th key={s.label} className="text-right py-1 px-1">
              {s.label} ({s.unit})
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dates.map((date, di) => (
          <tr
            key={date}
            className={di % 2 === 1 ? "bg-tp-slate-50/50" : ""}
          >
            <td className="text-left py-[3px] pr-2 text-tp-slate-500">
              {date}
            </td>
            {series.map((s) => {
              const val = di < s.values.length ? s.values[di] : null
              return (
                <td
                  key={s.label}
                  className={`text-right py-[3px] px-1 ${
                    val != null
                      ? toneColor(s.tone, val, s.threshold)
                      : "text-tp-slate-300"
                  }`}
                >
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

export function LabTrendsCard({ data, onPillTap }: LabTrendsCardProps) {
  const [viewMode, setViewMode] = useState<"graph" | "text">("graph")
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const totalVisits =
    data.series.length > 0 ? data.series[0].values.length : 0

  return (
    <CardShell
      icon={<span />}
      tpIconName="Lab"
      title={data.title}
      date={`${totalVisits} visits`}
      actions={
        <>
          <ChatPillButton label="Compare labs" onClick={() => onPillTap?.("Compare labs")} />
          <ChatPillButton label="All lab values" onClick={() => onPillTap?.("All lab values")} />
        </>
      }
      sidebarLink={<SidebarLink text="View full lab report" />}
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
              {chartType === "line" ? (
                <LabLineChart series={data.series} />
              ) : (
                data.series.map((s) => <LabBarChart key={s.label} series={s} />)
              )}
            </>
          ) : (
            <LabTrendsTable series={data.series} />
          )}

          {/* Legend */}
          <div className="mt-1 flex flex-wrap gap-3">
            {data.series.map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <div
                  className="h-[6px] w-[6px] rounded-full"
                  style={{ backgroundColor: seriesColor(s.tone) }}
                />
                <span className="text-[9px] text-tp-slate-500">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-4 text-center text-[12px] text-tp-slate-400">
          No lab data available for charting.
        </div>
      )}
    </CardShell>
  )
}

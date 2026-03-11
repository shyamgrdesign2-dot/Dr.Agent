"use client"

import { useState } from "react"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import { ViewToggle } from "../ViewToggle"
import type { VitalTrendSeries } from "../../types"

interface VitalTrendsLineCardProps {
  data: {
    title: string
    series: VitalTrendSeries[]
  }
  onPillTap?: (label: string) => void
}

const SERIES_COLORS = [
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
      style={{ maxHeight: multiSeries ? 180 : 140 }}
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
          {Math.round(tick)}
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

      {/* Threshold dashed lines */}
      {allSeries.map((s, si) =>
        s.threshold != null ? (
          <line
            key={`thresh-${si}`}
            x1={PAD.left}
            y1={yScale(s.threshold)}
            x2={SVG_W - PAD.right}
            y2={yScale(s.threshold)}
            stroke={SERIES_COLORS[si % SERIES_COLORS.length]}
            strokeWidth={0.8}
            strokeDasharray="4 2"
            opacity={0.5}
          />
        ) : null
      )}

      {/* Series polylines + data points */}
      {allSeries.map((s, si) => {
        const color = SERIES_COLORS[si % SERIES_COLORS.length]
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
            {s.values.map((v, i) => (
              <g key={i}>
                <circle
                  cx={xPositions[i]}
                  cy={yScale(v)}
                  r={2.5}
                  fill="white"
                  stroke={color}
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
                  fill={color}
                >
                  {v}
                </text>
              </g>
            ))}
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

function VitalTrendsTable({ series }: { series: VitalTrendSeries[] }) {
  if (series.length === 0) return null

  // Build unified date list from the longest series
  const longestSeries = series.reduce((a, b) =>
    a.dates.length >= b.dates.length ? a : b
  )
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
            <td className="text-left py-[3px] pr-2 text-tp-slate-500">{date}</td>
            {series.map((s) => {
              const val = di < s.values.length ? s.values[di] : null
              return (
                <td
                  key={s.label}
                  className={`text-right py-[3px] px-1 ${
                    val != null ? toneColor(s.tone, val, s.threshold) : "text-tp-slate-300"
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

export function VitalTrendsLineCard({ data, onPillTap }: VitalTrendsLineCardProps) {
  const [viewMode, setViewMode] = useState<"graph" | "text">("graph")
  const totalVisits =
    data.series.length > 0 ? data.series[0].values.length : 0
  const isMultiSeries = data.series.length > 1

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
      copyAllTooltip="Copy vitals trend to clipboard"
      actions={
        <>
          <ChatPillButton label="Compare vitals" onClick={() => setViewMode((m) => m === "graph" ? "text" : "graph")} />
          <ChatPillButton label="All vitals" onClick={() => onPillTap?.("All vitals")} />
        </>
      }
      sidebarLink={<SidebarLink text="View full vitals history" />}
    >
      {data.series.length > 0 ? (
        <>
          {/* Shared segmented toggle */}
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />

          {viewMode === "graph" ? (
            <>
              <LineChart series={data.series} multiSeries={isMultiSeries} />

              {/* Legend */}
              <div className="mt-1 flex flex-wrap gap-3">
                {data.series.map((s, si) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <div
                      className="h-[6px] w-[6px] rounded-full"
                      style={{
                        backgroundColor:
                          SERIES_COLORS[si % SERIES_COLORS.length],
                      }}
                    />
                    <span className="text-[9px] text-tp-slate-500">
                      {s.label}{isMultiSeries ? ` (${s.unit})` : ""}
                    </span>
                  </div>
                ))}
              </div>
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

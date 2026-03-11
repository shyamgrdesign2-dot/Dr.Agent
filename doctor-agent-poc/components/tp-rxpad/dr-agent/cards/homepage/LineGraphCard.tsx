"use client"
import React from "react"
import { TrendUp } from "iconsax-reactjs"
import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import type { LineGraphCardData } from "../../types"
import { downloadAsExcel } from "../../utils/downloadExcel"

interface Props { data: LineGraphCardData; onPillTap?: (label: string) => void }

export function LineGraphCard({ data, onPillTap }: Props) {
  const chartW = 260
  const chartH = 80
  const padding = { top: 8, right: 10, bottom: 20, left: 30 }
  const plotW = chartW - padding.left - padding.right
  const plotH = chartH - padding.top - padding.bottom

  const maxVal = Math.max(...data.points.map(p => p.value), data.average) * 1.15
  const minVal = 0

  const points = data.points.map((p, i) => {
    const x = padding.left + (i / Math.max(data.points.length - 1, 1)) * plotW
    const y = padding.top + plotH - ((p.value - minVal) / (maxVal - minVal)) * plotH
    return { x, y, ...p }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ")
  const avgY = padding.top + plotH - ((data.average - minVal) / (maxVal - minVal)) * plotH

  const dirArrow = data.changeDirection === "up" ? "\u2191" : data.changeDirection === "down" ? "\u2193" : "\u2192"
  const dirColor = data.changeDirection === "up" ? "#15803D" : data.changeDirection === "down" ? "#DC2626" : "#6D28D9"

  const copyAll = () => {
    const text = data.points.map(p => `${p.label}: ${p.value}`).join("\n")
    navigator.clipboard.writeText(`${data.title}\nAverage: ${data.average}\nChange: ${dirArrow} ${data.changePercent}\n${text}`)
  }

  const handleDownload = () => {
    downloadAsExcel(
      "patient_volume",
      ["Period", "Value"],
      data.points.map(p => [p.label, String(p.value)]),
    )
  }

  return (
    <CardShell
      icon={<TrendUp size={14} variant="Bulk" color="var(--tp-blue-500, #3B82F6)" />}
      title={data.title}
      badge={{ label: `${dirArrow} ${data.changePercent}`, color: dirColor, bg: data.changeDirection === "up" ? "#DCFCE7" : data.changeDirection === "down" ? "#FEE2E2" : "#EDE9FE" }}
      copyAll={copyAll}
      copyAllTooltip="Copy volume data"
      sidebarLink={<SidebarLink text="Download as Excel" onClick={handleDownload} />}
      actions={
        <>
          <ChatPillButton label="Compare months" onClick={() => onPillTap?.("Compare with last month")} />
        </>
      }
    >
      <div className="py-[2px]">
      <svg width={chartW} height={chartH} className="block w-full" viewBox={`0 0 ${chartW} ${chartH}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = padding.top + plotH * (1 - frac)
          const val = Math.round(minVal + (maxVal - minVal) * frac)
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="#E0DDD6" strokeWidth={0.5} />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" style={{ fontSize: "7px", fill: "#9E978B", fontFamily: "DM Sans" }}>{val}</text>
            </g>
          )
        })}

        {/* Average dashed line */}
        <line x1={padding.left} y1={avgY} x2={chartW - padding.right} y2={avgY} stroke="#7049C7" strokeWidth={0.8} strokeDasharray="3,3" opacity={0.5} />
        <text x={chartW - padding.right + 2} y={avgY + 3} style={{ fontSize: "6px", fill: "#7049C7", fontFamily: "DM Sans" }}>avg</text>

        {/* Area fill */}
        <polygon
          points={`${points[0].x},${padding.top + plotH} ${polyline} ${points[points.length - 1].x},${padding.top + plotH}`}
          fill="url(#lineGradient)"
          opacity={0.15}
        />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#3B6FE0" strokeWidth={1.5} strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="white" stroke="#3B6FE0" strokeWidth={1.2} />
        ))}

        {/* X labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={chartH - 4} textAnchor="middle" style={{ fontSize: "7px", fill: "#9E978B", fontFamily: "DM Sans" }}>{p.label}</text>
        ))}

        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B6FE0" />
            <stop offset="100%" stopColor="#3B6FE0" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      </div>
    </CardShell>
  )
}

"use client"

import React from "react"
import { Activity } from "iconsax-reactjs"
import type { VitalsSummaryCardData } from "../../types"

interface VitalsSummaryCardProps {
  data: VitalsSummaryCardData
}

function flagColor(flag?: "normal" | "high" | "low" | "critical"): string {
  switch (flag) {
    case "critical":
      return "text-tp-error-600 font-semibold"
    case "high":
      return "text-[#D97706] font-medium"
    case "low":
      return "text-tp-blue-600 font-medium"
    default:
      return "text-tp-slate-700"
  }
}

function flagBadge(flag?: "normal" | "high" | "low" | "critical"): React.ReactNode {
  if (!flag || flag === "normal") return null
  const colors: Record<string, string> = {
    critical: "bg-tp-error-50 text-tp-error-600",
    high: "bg-[#FFF7ED] text-[#D97706]",
    low: "bg-tp-blue-50 text-tp-blue-600",
  }
  return (
    <span className={`ml-[6px] rounded-[4px] px-[5px] py-[1px] text-[10px] font-semibold uppercase ${colors[flag] ?? ""}`}>
      {flag}
    </span>
  )
}

export function VitalsSummaryCard({ data }: VitalsSummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-tp-slate-100 bg-white">
      {/* Header */}
      <div className="flex items-center gap-[8px] border-b border-tp-slate-100 px-[12px] py-[8px]">
        <div className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-tp-blue-50 text-tp-blue-500">
          <Activity size={14} variant="Bulk" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <h4 className="text-[13px] font-semibold text-tp-slate-800">{data.title}</h4>
          <span className="text-[11px] text-tp-slate-400">{data.recordedAt}</span>
        </div>
      </div>

      {/* Vitals table */}
      <div className="divide-y divide-tp-slate-50">
        {data.rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-[12px] py-[7px]">
            <span className="text-[12px] text-tp-slate-500">{row.label}</span>
            <div className="flex items-center">
              <span className={`text-[13px] ${flagColor(row.flag)}`}>
                {row.value}
              </span>
              <span className="ml-[3px] text-[11px] text-tp-slate-400">{row.unit}</span>
              {flagBadge(row.flag)}
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      {data.insight && (
        <div className="border-t border-tp-slate-100 px-[12px] py-[7px]">
          <p className="text-[12px] italic leading-[1.5] text-tp-slate-500">{data.insight}</p>
        </div>
      )}
    </div>
  )
}

"use client"

import React from "react"
import { CardShell } from "../CardShell"
import { cn } from "@/lib/utils"
import type { VitalsSummaryCardData } from "../../types"

interface VitalsSummaryCardProps {
  data: VitalsSummaryCardData
}

/** Arrow icon for flagged values — rendered to the right of value */
function FlagArrow({ flag }: { flag: "high" | "low" | "critical" }) {
  const isUp = flag === "high" || flag === "critical"
  return (
    <span className="ml-[3px] inline-flex items-center text-tp-error-500">
      <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
        <path
          d={isUp ? "M5 2L8 7H2L5 2Z" : "M5 8L2 3H8L5 8Z"}
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

export function VitalsSummaryCard({ data }: VitalsSummaryCardProps) {
  const flaggedCount = data.rows.filter(r => r.flag && r.flag !== "normal").length

  return (
    <CardShell
      icon={<span />}
      tpIconName="Heart Rate"
      title={data.title}
      badge={
        data.recordedAt
          ? { label: data.recordedAt, color: "#6D28D9", bg: "#EDE9FE" }
          : undefined
      }
      collapsible
      dataSources={["EMR Records"]}
    >
      <div className="flex flex-col">
        {data.rows.map((row, i) => {
          const isFlagged = row.flag && row.flag !== "normal"
          return (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between py-[5px]",
                i > 0 && "border-t border-tp-slate-50",
              )}
            >
              <span className="text-[13px] text-tp-slate-500">{row.label}</span>
              <div className="flex items-center gap-[2px]">
                <span
                  className={cn(
                    "text-[13px]",
                    isFlagged ? "text-tp-error-600 font-medium" : "text-tp-slate-700",
                  )}
                >
                  {row.value}
                </span>
                <span className="text-[11px] text-tp-slate-400">{row.unit}</span>
                {isFlagged && row.flag && row.flag !== "normal" && <FlagArrow flag={row.flag} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Insight */}
      {data.insight && (
        <div className="mt-[6px] rounded-[6px] bg-tp-slate-50 px-[8px] py-[5px]">
          <p className="text-[12px] italic leading-[1.5] text-tp-slate-500">{data.insight}</p>
        </div>
      )}
    </CardShell>
  )
}

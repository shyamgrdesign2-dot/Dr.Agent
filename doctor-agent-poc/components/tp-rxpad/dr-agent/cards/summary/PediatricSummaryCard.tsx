"use client"

import React from "react"

import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"
import { InsightBox } from "../InsightBox"
import { SidebarLink } from "../SidebarLink"
import type { PediatricsData } from "../../types"

interface PediatricSummaryCardProps {
  data: PediatricsData
  onSidebarNav?: (tab: string) => void
}

export function PediatricSummaryCard({ data, onSidebarNav }: PediatricSummaryCardProps) {
  type FlagValue = "normal" | "high" | "low" | "warning" | "success"

  /* ─ Growth row ─ */
  const growthValues = [
    data.ageDisplay && { key: "Age", value: data.ageDisplay },
    data.heightCm != null && {
      key: "Ht",
      value: `${data.heightCm} cm${data.heightPercentile ? ` (${data.heightPercentile})` : ""}`,
    },
    data.weightKg != null && {
      key: "Wt",
      value: `${data.weightKg} kg${data.weightPercentile ? ` (${data.weightPercentile})` : ""}`,
    },
    data.bmiPercentile && { key: "BMI", value: data.bmiPercentile },
    data.ofcCm != null && { key: "OFC", value: `${data.ofcCm} cm` },
  ].filter(Boolean) as Array<{ key: string; value: string; flag?: FlagValue }>

  /* ─ Vaccine row ─ */
  const vaccineValues: Array<{ key: string; value: string; flag?: FlagValue }> = []

  if (data.vaccinesPending != null && data.vaccinesPending > 0) {
    vaccineValues.push({
      key: "Pending",
      value: String(data.vaccinesPending),
      flag: "warning",
    })
  }
  if (data.vaccinesOverdue != null && data.vaccinesOverdue > 0) {
    vaccineValues.push({
      key: "Overdue",
      value: `${data.vaccinesOverdue}${
        data.overdueVaccineNames && data.overdueVaccineNames.length > 0
          ? ` (${data.overdueVaccineNames.join(", ")})`
          : ""
      }`,
      flag: "high",
    })
  }
  /* If everything is up to date */
  if (
    vaccineValues.length === 0 &&
    (data.vaccinesPending === 0 || data.vaccinesOverdue === 0)
  ) {
    vaccineValues.push({
      key: "Status",
      value: "Up to date",
      flag: "success",
    })
  }

  /* ─ Insights ─ */
  const insightMessages: string[] = []
  if (data.milestoneNotes && data.milestoneNotes.length > 0) {
    insightMessages.push(...data.milestoneNotes)
  }
  if (data.alerts && data.alerts.length > 0) {
    insightMessages.push(...data.alerts)
  }

  const insightVariant =
    data.alerts && data.alerts.length > 0
      ? data.alerts.some(
          (a) =>
            a.toLowerCase().includes("critical") ||
            a.toLowerCase().includes("severe"),
        )
        ? ("red" as const)
        : ("amber" as const)
      : ("purple" as const)

  return (
    <CardShell
      icon={<span />}
      tpIconName="health care"
      title="Pedia Summary"
      collapsible
      sidebarLink={
        onSidebarNav ? (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onSidebarNav("growth")}
              className="flex-1 inline-flex items-center justify-center gap-[4px] rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60"
            >
              View growth chart
            </button>
            <div className="h-[20px] flex-shrink-0" style={{ width: "1px", background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }} />
            <button
              type="button"
              onClick={() => onSidebarNav("vaccine")}
              className="flex-1 inline-flex items-center justify-center gap-[4px] rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60"
            >
              View vaccine history
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-1">
        {/* Growth */}
        {growthValues.length > 0 && (
          <InlineDataRow
            tag="Growth"
            tagIcon="Heart Rate"
            values={growthValues}
            onTagClick={() => onSidebarNav?.("growth")}
            source="existing"
          />
        )}

        {/* Vaccines */}
        {vaccineValues.length > 0 && (
          <InlineDataRow
            tag="Vaccines"
            tagIcon="injection"
            values={vaccineValues}
            onTagClick={() => onSidebarNav?.("vaccine")}
            source="existing"
          />
        )}

        {/* Insight box */}
        {insightMessages.length > 0 && (
          <InsightBox variant={insightVariant}>
            {insightMessages.join(" · ")}
          </InsightBox>
        )}
      </div>
    </CardShell>
  )
}

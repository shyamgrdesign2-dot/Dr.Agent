"use client"

import React from "react"

import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"
import { SidebarLink } from "../SidebarLink"
import type { GynecData } from "../../types"

interface GynecSummaryCardProps {
  data: GynecData
  onSidebarNav?: (tab: string) => void
}

export function GynecSummaryCard({ data, onSidebarNav }: GynecSummaryCardProps) {
  const values = [
    data.menarche && { key: "Menarche", value: data.menarche },
    data.cycleLength && {
      key: "Cycle",
      value: [data.cycleLength, data.cycleRegularity].filter(Boolean).join(", "),
    },
    data.flowDuration && {
      key: "Flow",
      value: [data.flowDuration, data.flowIntensity].filter(Boolean).join(", "),
    },
    data.painScore && { key: "Pain", value: data.painScore },
    data.lmp && { key: "LMP", value: data.lmp },
    data.lastPapSmear && { key: "Pap Smear", value: data.lastPapSmear },
  ].filter(Boolean) as Array<{
    key: string
    value: string
    flag?: "normal" | "high" | "low" | "warning" | "success"
  }>

  return (
    <CardShell
      icon={<span />}
      tpIconName="Gynec"
      title="Gynec Summary"
      dataSources={["EMR Records"]}
      collapsible
      sidebarLink={
        onSidebarNav ? (
          <SidebarLink
            text="View detailed gynec history"
            onClick={() => onSidebarNav("gynec")}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-1">
        {values.length > 0 && (
          <InlineDataRow
            tag="Menstrual History"
            tagIcon="clipboard-activity"
            values={values}
            source="existing"
          />
        )}

      </div>
    </CardShell>
  )
}

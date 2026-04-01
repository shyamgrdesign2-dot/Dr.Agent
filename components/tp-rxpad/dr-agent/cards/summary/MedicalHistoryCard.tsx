"use client"

import React from "react"
import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"
import type { MedicalHistoryCardData } from "../../types"

interface MedicalHistoryCardProps {
  data: MedicalHistoryCardData
  onSidebarNav?: (tab: string) => void
}

export function MedicalHistoryCard({ data, onSidebarNav }: MedicalHistoryCardProps) {
  return (
    <CardShell
      icon={<span />}
      tpIconName="medical-record"
      title="Medical History"
      collapsible
      dataSources={["EMR Records"]}
    >
      <div className="flex flex-col gap-[8px]">
        {data.sections.map((section, i) => {
          // Combine items into comma-separated string for InlineDataRow
          const values = section.items.length > 0
            ? [{ key: "", value: section.items.join(", ") }]
            : [{ key: "", value: "Not recorded" }]

          return (
            <InlineDataRow
              key={i}
              tag={section.tag}
              tagIcon={section.icon}
              values={values}
              onTagClick={() => onSidebarNav?.("history")}
              source="existing"
            />
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

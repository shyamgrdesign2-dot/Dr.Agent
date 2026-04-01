"use client"

import React from "react"
import { CardShell } from "../CardShell"
import { SectionTag, SECTION_TAG_ICON_MAP } from "../SectionTag"
import { cn } from "@/lib/utils"
import type { SbarCriticalCardData } from "../../types"
import { highlightClinicalText } from "../../shared/highlightClinicalText"

interface SbarCriticalCardProps {
  data: SbarCriticalCardData
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-tp-error-50 text-tp-error-700 font-bold",
  high: "bg-amber-50 text-amber-700 font-semibold",
}

export function SbarCriticalCard({ data }: SbarCriticalCardProps) {
  return (
    <CardShell
      icon={<span />}
      tpIconName="stethoscope"
      title="Patient Summary"
      dataSources={["EMR Records"]}
      collapsible={false}
    >
      <div className="flex flex-col gap-[8px]">
        {/* Situation — violet-bordered narrative (consistent with GPSummaryCard) */}
        <div className="rounded-[8px] bg-tp-slate-50 border-l-[3px] border-tp-violet-300 px-3 py-2">
          <p className="text-[16px] italic leading-[1.7] text-tp-slate-500">
            &ldquo;{highlightClinicalText(data.situation)}&rdquo;
          </p>
        </div>

        {/* Current Symptoms — inline with SectionTag */}
        {data.activeProblems.length > 0 && (
          <div className="text-[16px] leading-[1.8] text-tp-slate-800">
            <SectionTag label="Current Symptoms" icon="clipboard-activity" />{" "}
            <span className="text-tp-slate-700">
              {data.activeProblems.join(", ")}
            </span>
          </div>
        )}

        {/* Allergies — inline with SectionTag */}
        {data.allergies.length > 0 && (
          <div className="text-[16px] leading-[1.8]">
            <SectionTag label="Allergies" icon="shield-cross" />{" "}
            <span className="text-tp-slate-700">{data.allergies.join(", ")}</span>
          </div>
        )}

        {/* Key Medications — inline with SectionTag, regular text */}
        {data.keyMeds.length > 0 && (
          <div className="text-[16px] leading-[1.8] text-tp-slate-800">
            <SectionTag label="Key Medications" icon={SECTION_TAG_ICON_MAP["Medications"]} />{" "}
            <span className="text-tp-slate-700">
              {data.keyMeds.slice(0, 8).join(", ")}
            </span>
          </div>
        )}

        {/* Recent ER Admissions removed — data not available in current system */}
      </div>
    </CardShell>
  )
}

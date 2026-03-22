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
          <p className="text-[12px] italic leading-[1.6] text-tp-slate-500">
            &ldquo;{highlightClinicalText(data.situation)}&rdquo;
          </p>
        </div>

        {/* Active Problems — inline with SectionTag */}
        {data.activeProblems.length > 0 && (
          <div className="text-[12px] leading-[1.7] text-tp-slate-800">
            <SectionTag label="Active Problems" icon="clipboard-activity" />{" "}
            <span className="text-tp-slate-700">
              {data.activeProblems.join(", ")}
            </span>
          </div>
        )}

        {/* Critical Flags — compact grid inside colored card */}
        {data.criticalFlags.length > 0 && (
          <div
            className="rounded-[6px] px-[8px] py-[6px]"
            style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.10)" }}
          >
            <div className="mb-[4px]">
              <SectionTag label="Critical Flags" icon="danger" />
            </div>
            <div className="grid grid-cols-2 gap-x-[8px] gap-y-[3px]">
              {data.criticalFlags.map((flag, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between rounded-[4px] px-[6px] py-[3px] text-[12px]",
                    SEVERITY_STYLES[flag.severity],
                  )}
                >
                  <span className="text-[10px] opacity-80">{flag.label}</span>
                  <span className="font-bold">{flag.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allergies — inline with SectionTag, red badges for each allergen */}
        {data.allergies.length > 0 && (
          <div className="text-[12px] leading-[1.7]">
            <SectionTag label="Allergies" icon="shield-cross" />{" "}
            {data.allergies.map((allergy, i) => (
              <span key={i}>
                <span className="font-semibold text-red-700">{allergy}</span>
                {i < data.allergies.length - 1 && (
                  <span className="mx-[3px] text-tp-slate-300">|</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Key Medications — inline with SectionTag, regular text */}
        {data.keyMeds.length > 0 && (
          <div className="text-[12px] leading-[1.7] text-tp-slate-800">
            <SectionTag label="Key Medications" icon={SECTION_TAG_ICON_MAP["Medications"]} />{" "}
            <span className="text-tp-slate-700">
              {data.keyMeds.slice(0, 8).join(", ")}
            </span>
          </div>
        )}

        {/* Recent ER Admissions — inside colored card */}
        {data.recentER && data.recentER.length > 0 && (
          <div
            className="rounded-[6px] px-[8px] py-[6px]"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.10)" }}
          >
            <div className="mb-[4px]">
              <SectionTag label="Recent ER Admissions" icon="hospital" />
            </div>
            <div className="flex flex-col gap-[2px]">
              {data.recentER.map((er, i) => (
                <div
                  key={i}
                  className="flex items-start gap-[6px] text-[10px] text-tp-slate-700"
                >
                  <span className="mt-[1px] flex-shrink-0 text-amber-500">{"\u25CF"}</span>
                  <span>{er}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardShell>
  )
}

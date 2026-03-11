"use client"

import React from "react"

import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"

import { SidebarLink } from "../SidebarLink"
import { EmbeddedSpecialtyBox } from "./EmbeddedSpecialtyBox"
import { VITAL_META } from "../../constants"
import type { SmartSummaryData } from "../../types"


const LAB_SHORT_NAMES: Record<string, string> = {
  "HbA1c": "HbA1c",
  "Fasting Glucose": "F.Glucose",
  "Fasting Blood Sugar": "FBS",
  "TSH": "TSH",
  "LDL": "LDL",
  "HDL": "HDL",
  "Vitamin D": "Vit D",
  "Creatinine": "Creat",
  "Microalbumin": "Microalb",
  "Hemoglobin": "Hb",
  "Triglycerides": "TG",
  "Total Cholesterol": "T.Chol",
}

function shortenLabName(fullName: string): string {
  return LAB_SHORT_NAMES[fullName] || fullName
}

interface GPSummaryCardProps {
  data: SmartSummaryData
  onPillTap?: (label: string) => void
  onSidebarNav?: (tab: string) => void
  defaultCollapsed?: boolean
}

/* -- helpers ------------------------------------------------- */

type FlagValue = "normal" | "high" | "low" | "warning" | "success"

function parseVitalFlag(key: string, raw: string): FlagValue | undefined {
  const meta = VITAL_META.find((m) => m.key === key)
  if (!meta) return undefined
  // For BP, check systolic
  if (key === "bp") {
    const sys = parseInt(raw.split("/")[0], 10)
    if (isNaN(sys)) return undefined
    if (sys >= 140) return "high"
    if (sys <= 90) return "low"
    return "normal"
  }
  const num = parseFloat(raw)
  if (isNaN(num)) return undefined
  if (meta.isAbnormal(num)) {
    // Determine direction heuristically based on thresholds
    if (key === "spo2") return "low"
    if (key === "temp") return "high"
    if (key === "bmi") return num > 30 ? "high" : "low"
    return num > 100 ? "high" : "low"
  }
  return "normal"
}

/** Split a comma-separated string while respecting parentheses. */
function splitRespectingParens(str: string): string[] {
  const results: string[] = []
  let depth = 0
  let current = ""
  for (const ch of str) {
    if (ch === "(") depth++
    if (ch === ")") depth = Math.max(0, depth - 1)
    if (ch === "," && depth === 0) {
      results.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  if (current.trim()) results.push(current.trim())
  return results
}

/**
 * Shorten a symptom string.
 * "Fever (2d, high, evening spikes)" -> "Fever 2d"
 * "Eye redness (2d, bilateral)" -> "Eye redness 2d"
 * "Headache" -> "Headache"
 */
function shortenSymptom(raw: string): string {
  const match = raw.match(/^([^(]+)\(([^,)]+)/)
  if (match) {
    const name = match[1].trim()
    const firstDetail = match[2].trim()
    // Include first detail if it looks like a duration (contains d/w/m or digits)
    if (/\d/.test(firstDetail)) {
      return `${name} (${firstDetail})`
    }
    return name
  }
  return raw.trim()
}

/**
 * Shorten medication string to just drug name (+ strength if present).
 * "Telma20 1-0-0-1 BF" -> "Telma20"
 * "Metsmail 500 1-0-0-0 BF" -> "Metsmail 500"
 * "Paracetamol 650 SOS" -> "Paracetamol 650"
 */
function shortenMedication(raw: string): string {
  const parts = raw.trim().split(/\s+/)
  if (parts.length === 0) return raw
  // drug name is first token; if second token is a number (strength), include it
  const drugName = parts[0]
  if (parts.length > 1 && /^\d+/.test(parts[1]) && !/^\d+-\d+/.test(parts[1])) {
    return `${drugName} ${parts[1]}`
  }
  return drugName
}

/* -- component ----------------------------------------------- */

export function GPSummaryCard({ data, onPillTap, onSidebarNav, defaultCollapsed }: GPSummaryCardProps) {
  const hasSpecialty =
    !!data.obstetricData ||
    !!data.pediatricsData ||
    !!data.gynecData ||
    !!data.ophthalData

  /* - Vitals row - */
  const vitalsValues = data.todayVitals
    ? (
        [
          data.todayVitals.bp && {
            key: "BP",
            value: data.todayVitals.bp,
            flag: parseVitalFlag("bp", data.todayVitals.bp),
          },
          data.todayVitals.pulse && {
            key: "Pulse",
            value: `${data.todayVitals.pulse} bpm`,
            flag: parseVitalFlag("pulse", data.todayVitals.pulse),
          },
          data.todayVitals.spo2 && {
            key: "SpO\u2082",
            value: `${data.todayVitals.spo2}%`,
            flag: parseVitalFlag("spo2", data.todayVitals.spo2),
          },
          data.todayVitals.temp && {
            key: "Temp",
            value: `${data.todayVitals.temp}\u00B0F`,
            flag: parseVitalFlag("temp", data.todayVitals.temp),
          },
          data.todayVitals.weight && {
            key: "Wt",
            value: `${data.todayVitals.weight} kg`,
          },
        ].filter(Boolean) as Array<{ key: string; value: string; flag?: FlagValue }>
      )
    : []

  /* - Labs row - */
  const labsValues = data.keyLabs
    ? data.keyLabs
        .slice(0, 3)
        .map((lab) => ({
        key: shortenLabName(lab.name),
        value: `${lab.value}${lab.unit ? ` ${lab.unit}` : ""}`,
        flag: lab.flag === "high" ? ("high" as const) : lab.flag === "low" ? ("low" as const) : undefined,
      }))
    : []

  /* - History row - */
  const historyValues: Array<{ key: string; value: string }> = []
  if (data.chronicConditions && data.chronicConditions.length > 0) {
    historyValues.push({ key: "Chronic", value: data.chronicConditions.join(", ") })
  }
  if (data.allergies && data.allergies.length > 0) {
    historyValues.push({ key: "Allergies", value: data.allergies.join(", ") })
  }

  /* - Last Visit row (shortened) - */
  const lastVisitValues: Array<{ key: string; value: string }> = []
  if (data.lastVisit) {
    if (data.lastVisit.symptoms) {
      const shortened = splitRespectingParens(data.lastVisit.symptoms)
        .map(shortenSymptom)
        .join(", ")
      lastVisitValues.push({ key: "Sx", value: shortened })
    }
    if (data.lastVisit.diagnosis) {
      lastVisitValues.push({ key: "Dx", value: data.lastVisit.diagnosis })
    }
    if (data.lastVisit.medication) {
      const shortened = splitRespectingParens(data.lastVisit.medication)
        .map(shortenMedication)
        .join(", ")
      lastVisitValues.push({ key: "Rx", value: shortened })
    }
  }

  /* - Action pills — data-aware (only show if data exists) - */
  const pills: Array<{ label: string }> = []
  if (data.lastVisit) pills.push({ label: "Last visit details" })
  if (data.keyLabs && data.keyLabs.length > 0) {
    pills.push({ label: data.labFlagCount > 0 ? `Labs (${data.labFlagCount} flagged)` : "Labs" })
  }
  if (data.todayVitals && Object.keys(data.todayVitals).length > 0) pills.push({ label: "Vital trends" })
  if (pills.length === 0) pills.push({ label: "Suggest DDX" })
  pills.push({ label: "Ask me anything" })

  /* - Which sections are present (for dividers) - */
  const sections: Array<{ id: string; node: React.ReactNode }> = []

  if (vitalsValues.length > 0) {
    sections.push({
      id: "vitals",
      node: (
        <InlineDataRow
          tag="Today's Vitals"
          tagIcon="Heart Rate"
          values={vitalsValues}
          onTagClick={() => onSidebarNav?.("vitals")}
          source="existing"
        />
      ),
    })
  }

  if (labsValues.length > 0) {
    sections.push({
      id: "labs",
      node: (
        <InlineDataRow
          tag="Key Labs"
          tagIcon="Lab"
          values={labsValues}
          onTagClick={() => onSidebarNav?.("labResults")}
          source="existing"
        />
      ),
    })
  }

  if (historyValues.length > 0) {
    sections.push({
      id: "history",
      node: (
        <InlineDataRow
          tag="History"
          tagIcon="clipboard-activity"
          values={historyValues}
          onTagClick={() => onSidebarNav?.("history")}
          source="existing"
        />
      ),
    })
  }

  if (lastVisitValues.length > 0) {
    sections.push({
      id: "lastVisit",
      node: (
        <InlineDataRow
          tag="Last Visit"
          tagIcon="medical-record"
          values={lastVisitValues}
          onTagClick={() => onSidebarNav?.("pastVisits")}
          source="existing"
          allowCopyToRxPad={true}
        />
      ),
    })
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="stethoscope"
      title="Patient Summary"
      copyAll={() => {
        const parts: string[] = []
        if (data.chronicConditions?.length) parts.push(`Chronic: ${data.chronicConditions.join(", ")}`)
        if (data.allergies?.length) parts.push(`Allergies: ${data.allergies.join(", ")}`)
        if (data.todayVitals) {
          const v = data.todayVitals
          parts.push(`Vitals: BP ${v.bp ?? "-"}, Pulse ${v.pulse ?? "-"}, SpO2 ${v.spo2 ?? "-"}%`)
        }
        if (data.keyLabs?.length) parts.push(`Labs: ${data.keyLabs.map(l => `${l.name}: ${l.value}`).join(", ")}`)
        if (data.activeMeds?.length) parts.push(`Meds: ${data.activeMeds.join(", ")}`)
        navigator.clipboard?.writeText(parts.join("\n"))
      }}
      copyAllTooltip="Copy patient summary to clipboard"
      collapsible
      defaultCollapsed={defaultCollapsed}
      sidebarLink={
        onSidebarNav ? (
          <SidebarLink
            text="View all past visits"
            onClick={() => onSidebarNav("pastVisits")}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-[8px]">
        {sections.map((section) => (
          <React.Fragment key={section.id}>
            {section.node}
          </React.Fragment>
        ))}

        {/* Specialty embed */}
        {hasSpecialty && (
          <div className="mt-[2px]">
            <EmbeddedSpecialtyBox data={data} />
          </div>
        )}
      </div>
    </CardShell>
  )
}

"use client"

import React from "react"

import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"
import { InsightBox } from "../InsightBox"

import { SidebarLink } from "../SidebarLink"
import { EmbeddedSpecialtyBox } from "./EmbeddedSpecialtyBox"
import { VITAL_META } from "../../constants"
import type { SmartSummaryData, SpecialtyTabId, DoctorViewType } from "../../types"
import { highlightClinicalText } from "../../shared/highlightClinicalText"
import { formatWithHierarchy } from "../../shared/formatWithHierarchy"
import { buildCoreNarrative } from "../../shared/buildCoreNarrative"


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
  /** When true, suppress the narrative paragraph at the top (used when shown via "Patient's detailed summary" pill) */
  hideNarrative?: boolean
  /** Active specialty — adapts narrative lead-in and condition prioritization */
  activeSpecialty?: SpecialtyTabId
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

/* -- narrative snapshot helpers ------------------------------ */

/** Bold inline helper — semibold, non-italic, darker text for contrast in italic narrative */
function NarrBold({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold not-italic text-tp-slate-700">{children}</span>
}

/** Critical highlight — red bold for abnormal vitals/labs */
function NarrCritical({ children }: { children: React.ReactNode }) {
  return <span className="font-bold not-italic text-tp-error-600">{children}</span>
}

/**
 * Build a compact clinical narrative (quick summary) for the Patient Summary.
 *
 * Follows documented strict composition order with specialty-aware adaptation:
 *   0. Specialty lead-in (obstetric → G/P/EDD, ophthal → VA/IOP, etc.)
 *   1. Critical alert prefix (abnormal vitals/labs)
 *   2. Chronic/concerning conditions with duration
 *   3. Drug allergies
 *   4. Key medications (max 2-3)
 *   5. Last visit one-liner
 *   6. Follow-up overdue flag
 *
 * The underlying data stays the same — only the lead-in and priority change per specialty.
 * SBAR overlay: after building, we verify S/B/A/R coverage is present.
 *
 * Max 5-6 lines. Highlights key terms for 30-second scan.
 * If patientNarrative exists (pre-written), highlight key clinical terms.
 */
export function buildSummaryNarrative(
  data: SmartSummaryData,
  specialty?: SpecialtyTabId,
  _doctorViewType?: DoctorViewType,
): React.ReactNode[] | null {
  // If a pre-written narrative exists, use it with highlights
  if (data.patientNarrative) {
    return [highlightClinicalText(data.patientNarrative)]
  }

  // Use shared core narrative builder for consistent content
  const core = buildCoreNarrative(data, specialty, {
    maxConditions: 3,
    maxAllergies: 2,
    maxMeds: 3,
  })

  const parts: React.ReactNode[] = []

  // ── Step 0: Specialty lead-in ──
  if (core.specialtyLead) {
    parts.push(
      <span key="spec-lead">
        <NarrBold>{core.specialtyLead}</NarrBold>
        {". "}
      </span>,
    )
  }

  // ── Step 2: Chronic conditions with bold names ──
  if (core.conditions) {
    const condNodes = core.conditions.items.map((c, i, arr) => (
      <React.Fragment key={`cond-${i}`}>
        {i > 0 && i === arr.length - 1 ? " and " : i > 0 ? ", " : ""}
        <NarrBold>{c.name}</NarrBold>
        {c.duration ? <span className="text-tp-slate-400"> ({c.duration})</span> : ""}
      </React.Fragment>
    ))
    parts.push(
      <span key="conditions">
        {parts.length > 0 ? "Known case of " : "Patient with "}
        {condNodes}
        {core.conditions.hasMore > 0 ? ` + ${core.conditions.hasMore} more` : ""}
      </span>,
    )
  }

  // ── Step 3: Allergies ──
  if (core.allergies && core.allergies.length > 0) {
    parts.push(
      <span key="allergies">
        {parts.length > 0 ? ". Allergic to " : "Allergic to "}
        {core.allergies.map((a, i, arr) => (
          <React.Fragment key={i}>
            {formatWithHierarchy(a.trim(), "text-tp-slate-700", "text-tp-slate-400")}
            {i < arr.length - 1 && <span className="text-tp-slate-400">, </span>}
          </React.Fragment>
        ))}
      </span>,
    )
  }

  // ── Step 4: Active medications ──
  if (core.meds) {
    parts.push(
      <span key="meds">
        {parts.length > 0 ? ". On " : "On "}
        <NarrBold>{core.meds.names.join(", ")}</NarrBold>
        {core.meds.hasMore > 0 ? ` + ${core.meds.hasMore} more` : ""}
      </span>,
    )
  }

  // ── Step 5: Last visit one-liner ──
  if (core.lastVisit) {
    parts.push(
      <span key="lastVisit">
        {parts.length > 0 ? ". " : ""}
        Last seen <NarrBold>{core.lastVisit.date}</NarrBold> — Dx: {formatWithHierarchy(core.lastVisit.dx, "font-semibold not-italic text-tp-slate-700", "font-normal not-italic text-tp-slate-400")}
      </span>,
    )
  }

  // ── Step 6: Follow-up overdue flag ──
  if (core.followUpOverdue) {
    parts.push(
      <span key="overdue">
        {parts.length > 0 ? ". " : ""}
        <span className="text-tp-slate-400">Follow-up overdue by {core.followUpOverdue} days</span>
      </span>,
    )
  }

  // ── SBAR completeness overlay ──
  const sbarGaps = checkSbarCompleteness(data, parts)
  if (sbarGaps.length > 0) {
    parts.push(
      <span key="sbar-gap" className="text-tp-slate-400">
        {parts.length > 0 ? " " : ""}
        [Missing: {sbarGaps.join(", ")}]
      </span>,
    )
  }

  if (parts.length === 0) return null
  parts.push(<span key="period">.</span>)
  return parts
}

/* -- SBAR completeness overlay --------------------------------- */

/**
 * Lightweight SBAR check — verifies the narrative covers all four SBAR categories.
 * Returns a list of missing category labels (empty = all covered).
 *
 * S = Situation: chief complaint / symptoms / specialty lead-in
 * B = Background: chronic conditions / medical history
 * A = Assessment: vitals / labs / current state
 * R = Recommendation: active medications / follow-up plan
 */
function checkSbarCompleteness(
  data: SmartSummaryData,
  currentParts: React.ReactNode[],
): string[] {
  const gaps: string[] = []
  const partKeys = currentParts
    .filter((p): p is React.ReactElement => React.isValidElement(p))
    .map((p) => (p.key as string) || "")

  // S — Situation: do we have symptoms or a chief complaint?
  const hasSituation =
    partKeys.includes("spec-lead") ||
    partKeys.includes("critical") ||
    !!data.symptomCollectorData?.symptoms?.length ||
    !!data.sbarSituation
  if (!hasSituation) gaps.push("chief complaint")

  // B — Background: do we have conditions/history?
  const hasBackground =
    partKeys.includes("conditions") ||
    partKeys.includes("allergies") ||
    (data.chronicConditions && data.chronicConditions.length > 0) ||
    (data.familyHistory && data.familyHistory.length > 0)
  if (!hasBackground) gaps.push("history")

  // A — Assessment: do we have vitals or labs?
  const hasAssessment =
    partKeys.includes("critical") ||
    !!data.todayVitals ||
    (data.keyLabs && data.keyLabs.length > 0)
  if (!hasAssessment) gaps.push("vitals/labs")

  // R — Recommendation: do we have meds or plan?
  const hasRecommendation =
    partKeys.includes("meds") ||
    (data.activeMeds && data.activeMeds.length > 0) ||
    !!data.lastVisit?.medication
  if (!hasRecommendation) gaps.push("active treatment")

  return gaps
}

/* highlightNarrative removed — now using shared highlightClinicalText from ../../shared/highlightClinicalText */

/* -- component ----------------------------------------------- */

export function GPSummaryCard({ data, onPillTap, onSidebarNav, defaultCollapsed, hideNarrative, activeSpecialty }: GPSummaryCardProps) {
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
        flag: lab.flag === "high" ? ("high" as const) : lab.flag === "low" ? ("low" as const) : lab.flag === "critical" ? ("high" as const) : undefined,
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

  /* - Cross-problem flags (max 2 high-severity) - */
  const highSeverityFlags = (data.crossProblemFlags || [])
    .filter((f) => f.severity === "high")
    .slice(0, 2)

  /* - Clinical narrative — compact patient snapshot at top of card.
       Uses patientNarrative (if available) or auto-generates from
       chronic conditions + medications + allergies. - */
  const narrativeParts = buildSummaryNarrative(data, activeSpecialty)

  /* - Section ordering — most actionable first:
       1. Today's Vitals — current state, what needs attention now
       2. Key Labs — lab values with provenance flags
       3. History — chronic conditions, allergies
       4. Last Visit — previous care context
     Narrative (quick snapshot) is shown separately in the intro flow. - */
  const sections: Array<{ id: string; node: React.ReactNode }> = []

  // Current vitals — what needs attention today
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

  // Lab results with flags and provenance
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

  // Chronic conditions, allergies, medical history
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

  // Previous care context
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
          trailingNote={data.lastVisit?.doctorName ? `${data.lastVisit.doctorName}` : undefined}
        />
      ),
    })
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="stethoscope"
      title="Patient Summary"
      collapsible
      defaultCollapsed={defaultCollapsed}
      dataSources={["EMR Records", "Past Visit History"]}
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
        {/* Clinical narrative — compact patient snapshot (hidden when detailed summary is triggered) */}
        {!hideNarrative && narrativeParts && narrativeParts.length > 0 && (
          <div className="rounded-[8px] bg-tp-slate-50 border-l-[3px] border-tp-violet-300 px-3 py-2">
            <p className="text-[14px] italic leading-[1.7] text-tp-slate-500">
              &ldquo;{narrativeParts}&rdquo;
            </p>
          </div>
        )}

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

        {/* Cross-problem flags — using InsightBox design system */}
        {highSeverityFlags.map((flag, i) => (
          <InsightBox key={i} variant={flag.severity === "high" ? "red" : "amber"} className="mt-0">
            {flag.text}
          </InsightBox>
        ))}
      </div>
    </CardShell>
  )
}

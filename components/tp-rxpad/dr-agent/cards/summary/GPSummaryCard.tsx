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

  // Auto-generate from available structured data
  const parts: React.ReactNode[] = []

  // ── Step 0: Specialty lead-in ──
  // Each specialty gets a relevant clinical opener that surfaces the most
  // important context for that doctor in the first line.
  const specialtyLead = buildSpecialtyLeadIn(data, specialty)
  if (specialtyLead) {
    parts.push(specialtyLead)
  }

  // ── Step 1: Removed — Critical alert prefix was removed as per design review.
  // Abnormal vitals are shown in the vitals InlineDataRow with flag colors instead.
  if (false) {
    parts.push(
    )
  }

  // ── Step 2: Chronic conditions with bold names ──
  // For non-GP specialties, filter to conditions relevant to that specialty
  if (data.chronicConditions && data.chronicConditions.length > 0) {
    const filteredConditions = filterConditionsForSpecialty(data.chronicConditions, specialty)
    if (filteredConditions.length > 0) {
      const conditions = filteredConditions.slice(0, 3)
      const condNodes = conditions.map((c, i) => {
        const match = c.match(/^(.+?)\s*(?:\(([^)]+)\)\s*)?$/)
        const name = match?.[1]?.replace(/\s*—\s*$/, "").trim() || c
        const duration = match?.[2]
        return (
          <React.Fragment key={`cond-${i}`}>
            {i > 0 && i === conditions.length - 1 ? " and " : i > 0 ? ", " : ""}
            <NarrBold>{name}</NarrBold>
            {duration ? <span className="text-tp-slate-400"> ({duration})</span> : ""}
          </React.Fragment>
        )
      })
      parts.push(
        <span key="conditions">
          {parts.length > 0 ? "Known case of " : "Patient with "}
          {condNodes}
          {filteredConditions.length > 3 ? ` + ${filteredConditions.length - 3} more` : ""}
        </span>,
      )
    }
  }

  // ── Step 3: Allergies — shown in normal text (not highlighted) ──
  if (data.allergies && data.allergies.length > 0) {
    parts.push(
      <span key="allergies">
        {parts.length > 0 ? ". Allergic to " : "Allergic to "}
        <span className="text-tp-slate-700">{data.allergies.slice(0, 2).join(", ")}</span>
      </span>,
    )
  }

  // ── Step 4: Active medications — show 2-3 ──
  if (data.activeMeds && data.activeMeds.length > 0) {
    const meds = data.activeMeds.slice(0, 3).map(shortenMedication)
    parts.push(
      <span key="meds">
        {parts.length > 0 ? ". On " : "On "}
        <NarrBold>{meds.join(", ")}</NarrBold>
        {data.activeMeds.length > 3 ? ` + ${data.activeMeds.length - 3} more` : ""}
      </span>,
    )
  }

  // ── Step 5: Last visit one-liner ──
  if (data.lastVisit) {
    const lastDate = data.lastVisit.date || ""
    const dx = data.lastVisit.diagnosis || ""
    if (lastDate && dx) {
      parts.push(
        <span key="lastVisit">
          {parts.length > 0 ? ". " : ""}
          Last seen <NarrBold>{lastDate}</NarrBold> — Dx: <NarrBold>{dx}</NarrBold>
        </span>,
      )
    }
  }

  // ── Step 6: Follow-up overdue flag ──
  if (data.followUpOverdueDays && data.followUpOverdueDays > 0) {
    parts.push(
      <span key="overdue">
        {parts.length > 0 ? ". " : ""}
        <span className="text-tp-slate-400">Follow-up overdue by {data.followUpOverdueDays} days</span>
      </span>,
    )
  }

  // ── SBAR completeness overlay ──
  // Lightweight check: flag if any SBAR category is entirely missing from the narrative.
  // S = situation (symptoms/chief complaint) → covered by specialty lead-in or conditions
  // B = background (history/conditions) → covered by step 2
  // A = assessment (labs/vitals) → covered by step 1 (critical alerts)
  // R = recommendation (meds/plan) → covered by step 4
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

/* -- Specialty lead-in builders -------------------------------- */

/**
 * Build a specialty-specific opening line for the narrative.
 * Same data, different lens — surfaces the most critical context first.
 */
function buildSpecialtyLeadIn(
  data: SmartSummaryData,
  specialty?: SpecialtyTabId,
): React.ReactNode | null {
  if (!specialty || specialty === "gp") return null

  if (specialty === "obstetric" && data.obstetricData) {
    const ob = data.obstetricData
    const gp = [
      ob.gravida != null ? `G${ob.gravida}` : null,
      ob.para != null ? `P${ob.para}` : null,
      ob.living != null ? `L${ob.living}` : null,
      ob.abortion != null && ob.abortion > 0 ? `A${ob.abortion}` : null,
    ]
      .filter(Boolean)
      .join("")
    const details: string[] = []
    if (ob.gestationalWeeks) details.push(`${ob.gestationalWeeks} wks`)
    if (ob.edd) details.push(`EDD ${ob.edd}`)
    if (ob.lmp) details.push(`LMP ${ob.lmp}`)
    return (
      <span key="spec-lead">
        <NarrBold>{gp || "Obstetric patient"}</NarrBold>
        {details.length > 0 ? ` — ${details.join(", ")}` : ""}
        {". "}
      </span>
    )
  }

  if (specialty === "ophthal" && data.ophthalData) {
    const oph = data.ophthalData
    const vaDetails: string[] = []
    if (oph.vaRight) vaDetails.push(`OD: ${oph.vaRight}`)
    if (oph.vaLeft) vaDetails.push(`OS: ${oph.vaLeft}`)
    if (oph.iop) vaDetails.push(`IOP: ${oph.iop}`)
    if (vaDetails.length > 0) {
      return (
        <span key="spec-lead">
          <NarrBold>{vaDetails.join(", ")}</NarrBold>
          {". "}
        </span>
      )
    }
  }

  if (specialty === "gynec" && data.gynecData) {
    const gyn = data.gynecData
    const details: string[] = []
    if (gyn.lmp) details.push(`LMP ${gyn.lmp}`)
    if (gyn.cycleRegularity) details.push(`cycles ${gyn.cycleRegularity.toLowerCase()}`)
    if (gyn.painScore && parseInt(gyn.painScore, 10) > 5) details.push(`pain ${gyn.painScore}/10`)
    if (details.length > 0) {
      return (
        <span key="spec-lead">
          <NarrBold>{details.join(", ")}</NarrBold>
          {". "}
        </span>
      )
    }
  }

  if (specialty === "pediatrics" && data.pediatricsData) {
    const ped = data.pediatricsData
    const details: string[] = []
    if (ped.ageDisplay) details.push(ped.ageDisplay)
    if (ped.weightKg != null) {
      details.push(`Wt ${ped.weightKg}kg${ped.weightPercentile ? ` (${ped.weightPercentile})` : ""}`)
    }
    if (ped.vaccinesOverdue && ped.vaccinesOverdue > 0) {
      details.push(`${ped.vaccinesOverdue} vaccines overdue`)
    } else if (ped.vaccinesPending && ped.vaccinesPending > 0) {
      details.push(`${ped.vaccinesPending} vaccines pending`)
    }
    if (details.length > 0) {
      return (
        <span key="spec-lead">
          <NarrBold>{details.join(", ")}</NarrBold>
          {". "}
        </span>
      )
    }
  }

  return null
}

/* -- Condition filtering per specialty ------------------------- */

/** Specialty-relevant condition keywords — show these first, deprioritize others */
const SPECIALTY_CONDITION_RELEVANCE: Record<string, RegExp> = {
  obstetric: /pre-?eclampsia|gestational|GDM|HTN|hypertension|anemia|thyroid|diabetes/i,
  ophthal: /diabet|HTN|hypertension|glaucoma|cataract|retino|macula/i,
  gynec: /PCOS|endometri|fibroid|thyroid|anemia|hormonal/i,
  pediatrics: /asthma|allergy|anemia|epilepsy|growth|nutrition|congenital/i,
}

function filterConditionsForSpecialty(
  conditions: string[],
  specialty?: SpecialtyTabId,
): string[] {
  if (!specialty || specialty === "gp") return conditions

  const pattern = SPECIALTY_CONDITION_RELEVANCE[specialty]
  if (!pattern) return conditions

  // Split into relevant (matching) and other conditions
  const relevant = conditions.filter((c) => pattern.test(c))
  const other = conditions.filter((c) => !pattern.test(c))

  // Prioritize relevant conditions first, then fill remaining slots with others
  return [...relevant, ...other]
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
            <p className="text-[16px] italic leading-[1.7] text-tp-slate-500">
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

"use client"

import React from "react"
import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"
import { SectionTag, SECTION_TAG_ICON_MAP } from "../SectionTag"
import { VITAL_META } from "../../constants"
import type { SmartSummaryData, SpecialtyTabId } from "../../types"
import { highlightClinicalText } from "../../shared/highlightClinicalText"
import { formatWithHierarchy } from "../../shared/formatWithHierarchy"

// ── Shared helpers ──

const LAB_SHORT_NAMES: Record<string, string> = {
  "HbA1c": "HbA1c", "Fasting Glucose": "F.Glucose", "Fasting Blood Sugar": "FBS",
  "TSH": "TSH", "LDL": "LDL", "HDL": "HDL", "Vitamin D": "Vit D",
  "Creatinine": "Creat", "Microalbumin": "Microalb", "Hemoglobin": "Hb",
  "Triglycerides": "TG", "Total Cholesterol": "T.Chol", "eGFR": "eGFR",
  "Potassium": "K+", "Phosphorus": "Phos", "Calcium": "Ca", "PTH": "PTH",
  "Uric Acid": "UA", "WBC": "WBC", "Platelet": "Plt",
}

function shortenLabName(name: string): string {
  return LAB_SHORT_NAMES[name] || name
}

type FlagValue = "normal" | "high" | "low" | "warning" | "success"

function parseVitalFlag(key: string, raw: string): FlagValue | undefined {
  const meta = VITAL_META.find((m) => m.key === key)
  if (!meta) return undefined
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
    if (key === "spo2") return "low"
    if (key === "temp") return "high"
    if (key === "bmi") return num > 30 ? "high" : "low"
    return num > 100 ? "high" : "low"
  }
  return "normal"
}

function shortenMedication(raw: string): string {
  const parts = raw.trim().split(/\s+/)
  if (parts.length === 0) return raw
  const drugName = parts[0]
  if (parts.length > 1 && /^\d+/.test(parts[1]) && !/^\d+-\d+/.test(parts[1])) {
    return `${drugName} ${parts[1]}`
  }
  return drugName
}

/** Expand common medical abbreviations to full form */
const ABBREV_MAP: Record<string, string> = {
  "DM": "Diabetes", "HTN": "Hypertension", "CKD": "Chronic Kidney Disease",
  "COPD": "Chronic Obstructive Pulmonary Disease", "CAD": "Coronary Artery Disease",
  "CHF": "Congestive Heart Failure", "RA": "Rheumatoid Arthritis",
  "SLE": "Systemic Lupus Erythematosus", "TB": "Tuberculosis",
  "GERD": "Gastroesophageal Reflux Disease",
}

function expandAbbreviation(text: string): string {
  return text.replace(/\b(DM|HTN|CKD|COPD|CAD|CHF|RA|SLE|TB|GERD)\b/g, (match) => {
    return ABBREV_MAP[match] || match
  })
}

/** Split by commas but respect parenthetical groups */
function splitRespectingParens(str: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ""
  for (const ch of str) {
    if (ch === "(") depth++
    else if (ch === ")") depth--
    if (ch === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

/** Shorten symptom — "Fever (2d, high, evening spikes)" → "Fever (2d)" */
function shortenSymptom(raw: string): string {
  const match = raw.match(/^([^(]+)\(([^,)]+)/)
  if (match) {
    const name = match[1].trim()
    const firstDetail = match[2].trim()
    if (/\d/.test(firstDetail)) return `${name} (${firstDetail})`
    return name
  }
  return raw.trim()
}

// ── Situation line builder ──
//
// Follows the SUMMARY_COMPOSITION_ORDER documented in PatientSummaryLogicTab:
//   Step 1: Current symptoms (from symptom collector)
//   Step 2: Chronic/concerning conditions (top 2)
//   Step 3: Drug allergies (if present)
//   Step 4: Current medications (top 2)
//   Step 5: Last visit one-liner
//
// Priority 0: If a clinician manually wrote sbarSituation, use it as-is.
// Otherwise, compose from available data following the order above.
// Cap at ~200 chars / 2-3 sentences for scannability.

function buildSituationLine(data: SmartSummaryData): string {
  // Priority 0: patientNarrative (matches tooltip on appointment queue)
  if (data.patientNarrative) return expandAbbreviation(data.patientNarrative)
  // Priority 1: Pre-written SBAR situation (expand abbreviations)
  if (data.sbarSituation) return expandAbbreviation(data.sbarSituation)

  const parts: string[] = []

  // Step 1: Current symptoms
  if (data.symptomCollectorData?.symptoms?.length) {
    const top = data.symptomCollectorData.symptoms.slice(0, 3)
    const symptomStr = top.map(s => {
      let str = s.name
      if (s.duration) str += ` (${s.duration})`
      return str
    }).join(", ")
    parts.push(`Presenting with ${symptomStr}.`)
  }

  // Step 2: Chronic conditions (top 2, expanded abbreviations)
  if (data.chronicConditions?.length) {
    const top = data.chronicConditions.slice(0, 2).map(c => {
      const name = expandAbbreviation(c.split("(")[0].trim())
      const match = c.match(/\(([^)]+)\)/)
      return match ? `${name} (${match[1]})` : name
    })
    parts.push(`Known ${top.join(", ")}.`)
  }

  // Step 3: Drug allergies (only if present, keep concise)
  if (data.allergies?.length) {
    const drugAllergies = data.allergies.filter(a => {
      const lower = a.toLowerCase()
      return lower.includes("aspirin") || lower.includes("penicillin") || lower.includes("sulfa")
        || lower.includes("nsaid") || lower.includes("ibuprofen") || lower.includes("amoxicillin")
        || lower.includes("cephalosporin") || lower.includes("erythromycin")
    })
    if (drugAllergies.length > 0) {
      parts.push(`Allergic to ${drugAllergies.slice(0, 2).map(a => a.split("(")[0].trim()).join(", ")}.`)
    }
  }

  // Step 4: Current medications (top 2, shortened)
  if (data.activeMeds?.length && parts.length < 3) {
    const topMeds = data.activeMeds.slice(0, 2).map(shortenMedication)
    parts.push(`On ${topMeds.join(", ")}.`)
  }

  // Step 5: Last visit one-liner (only if no symptoms and space remains)
  if (parts.length === 0 && data.lastVisit) {
    parts.push(`Last visited ${data.lastVisit.date} for ${data.lastVisit.diagnosis || data.lastVisit.symptoms}.`)
  } else if (data.lastVisit && parts.length < 2) {
    parts.push(`Last seen ${data.lastVisit.date}.`)
  }

  if (parts.length === 0) return "New patient, no prior clinical data available."

  // Cap at ~200 chars
  let result = parts.join(" ")
  if (result.length > 220) {
    result = parts.slice(0, 2).join(" ")
  }
  return result
}

// ── Recommendation logic ──

/**
 * Build focused recommendation items — only what needs action NOW.
 *
 * Shown: follow-up overdue, critical vitals, top 2 due alerts, critical cross-problem flags.
 * NOT shown: individual lab values (visible in Key Labs row), missing fields, non-critical flags.
 */
function buildRecommendations(data: SmartSummaryData): string[] {
  const recs: string[] = []

  // 1. Follow-up overdue
  if (data.followUpOverdueDays > 0) {
    recs.push(`Follow-up overdue by ${data.followUpOverdueDays} day${data.followUpOverdueDays > 1 ? "s" : ""}`)
  }

  // 2. Critical vitals only (life-threatening thresholds)
  if (data.todayVitals) {
    const v = data.todayVitals
    if (v.bp) {
      const sys = parseInt(v.bp.split("/")[0], 10)
      if (!isNaN(sys) && (sys <= 90 || sys >= 160)) {
        recs.push(sys <= 90
          ? `BP critically low at ${v.bp} (assess for hypotension)`
          : `BP severely elevated at ${v.bp} (hypertensive urgency)`)
      }
    }
    if (v.spo2) {
      const spo2 = parseInt(v.spo2, 10)
      if (!isNaN(spo2) && spo2 < 92) {
        recs.push(`SpO₂ at ${v.spo2}% (consider supplemental oxygen)`)
      }
    }
    if (v.temp) {
      const temp = parseFloat(v.temp)
      if (!isNaN(temp) && temp >= 104) {
        recs.push(`High fever ${v.temp}°F (evaluate source)`)
      }
    }
  }

  // 3. Due alerts (max 2)
  if (data.dueAlerts?.length) {
    for (const alert of data.dueAlerts.slice(0, 2)) {
      recs.push(alert)
    }
  }

  // 4. Critical cross-problem flags only (max 1)
  if (data.crossProblemFlags?.length) {
    const critical = data.crossProblemFlags.find(f => f.severity === "critical")
    if (critical) {
      recs.push(critical.text)
    }
  }

  return recs
}

/**
 * Highlight clinical keywords in recommendation text.
 * Matches vitals (BP, SpO₂, HbA1c), clinical terms, values with units,
 * and action words — wraps them in semibold + darker color.
 */
function highlightRecommendation(text: string): React.ReactNode {
  // Capture groups for clinical terms worth highlighting
  const pattern = /(\b(?:BP|SpO[₂2]|HbA1c|eGFR|LDL|HDL|TSH|PTH|Creatinine|Lipid Profile|Hemoglobin|WBC|INR|EPO)\b|(?:overdue|critically low|severely elevated|hypertensive urgency|hypotension|supplemental oxygen|evaluate source)\b|\d+\/\d+(?:\s*mmHg)?|\d+(?:\.\d+)?%|\d+(?:\.\d+)?°F|\d+\s*days?|\d+(?:\.\d+)?\s*mg\/(?:dL|L)|\d+(?:\.\d+)?\s*m[Ll]\/min)/gi
  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }
    // Add highlighted match
    result.push(
      <span key={match.index} className="font-semibold text-tp-slate-700">{match[0]}</span>
    )
    lastIndex = pattern.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result.length > 1 ? <>{result}</> : text
}

/** Build a short last visit summary line */
function buildLastVisitLine(data: SmartSummaryData): { date?: string; diagnosis?: string; symptoms?: string; medication?: string } | null {
  if (!data.lastVisit) return null
  const lv = data.lastVisit
  return {
    date: lv.date || undefined,
    diagnosis: lv.diagnosis || undefined,
    symptoms: lv.symptoms
      ? lv.symptoms.split(",").slice(0, 2).map(s => shortenSymptom(s.trim())).join(", ")
      : undefined,
    medication: lv.medication || undefined,
  }
}

// ── Sub-section renderer for History ──

/**
 * Render a history sub-section inline: "Label: Item1 (detail), Item2 (detail)"
 * Uses formatWithHierarchy so item names are dark and bracket content is lighter.
 */
function HistorySubSection({ label, items }: { label: string; items: string[] }) {
  return (
    <>
      <span className="text-tp-slate-400">{label}:&nbsp;</span>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {formatWithHierarchy(item)}
          {i < items.length - 1 && <span className="text-tp-slate-400">, </span>}
        </React.Fragment>
      ))}
    </>
  )
}

// ── Main component ──

interface SbarOverviewCardProps {
  data: SmartSummaryData
  onPillTap?: (label: string) => void
  onSidebarNav?: (tab: string) => void
  activeSpecialty?: SpecialtyTabId
}

export function SbarOverviewCard({ data, onSidebarNav }: SbarOverviewCardProps) {
  const situation = buildSituationLine(data)

  // ── Background: History sub-sections ──
  const hasConditions = (data.chronicConditions?.length ?? 0) > 0
  const hasAllergies = (data.allergies?.length ?? 0) > 0
  const hasHistory = hasConditions || hasAllergies

  // ── Assessment: Vitals ──
  const vitals = data.todayVitals
  const vitalEntries: { key: string; value: string; flag?: FlagValue }[] = []
  if (vitals) {
    const VITAL_ORDER = ["bp", "pulse", "spo2", "temp", "weight", "rr"] as const
    for (const k of VITAL_ORDER) {
      const raw = vitals[k]
      if (!raw) continue
      const meta = VITAL_META.find((m) => m.key === k)
      const label = meta?.label || k
      const unit = meta?.unit || ""
      const flag = parseVitalFlag(k, raw)
      vitalEntries.push({ key: label, value: `${raw}${unit ? " " + unit : ""}`, flag })
    }
  }

  // ── Assessment: Labs ──
  const labEntries = (data.keyLabs ?? []).slice(0, 4).map(lab => ({
    key: shortenLabName(lab.name),
    value: `${lab.value}${lab.unit ? " " + lab.unit : ""}`,
    flag: lab.flag as FlagValue,
  }))

  // ── Recommendations ──
  const recommendations = buildRecommendations(data)

  // ── Last visit ──
  const lastVisit = buildLastVisitLine(data)

  return (
    <CardShell
      icon={<span />}
      tpIconName="stethoscope"
      title="Patient Summary"
      dataSources={["EMR Records"]}
      collapsible={false}
    >
      <div className="flex flex-col gap-[8px]">

        {/* ── S — Situation: short narrative ── */}
        <div className="rounded-[8px] bg-tp-slate-50 border-l-[3px] border-tp-violet-300 px-3 py-2">
          <p className="text-[14px] italic leading-[1.6] text-tp-slate-500">
            &ldquo;{highlightClinicalText(situation)}&rdquo;
          </p>
        </div>

        {/* ── B — History: conditions, allergies, current meds ── */}
        {/* Rendered manually (not via InlineDataRow) to ensure proper color hierarchy
            for each item — "Diabetes (1yr, Active)" → dark name + lighter brackets.
            InlineDataRow's compound split breaks on commas inside parentheses. */}
        {hasHistory && (
          <div className="text-[14px] leading-[1.65] text-tp-slate-800">
            <SectionTag
              label="History"
              icon={SECTION_TAG_ICON_MAP["History"]}
              onClick={onSidebarNav ? () => onSidebarNav("history") : undefined}
            />{" "}
            {hasConditions && (
              <HistorySubSection label="Conditions" items={data.chronicConditions!} />
            )}
            {hasConditions && hasAllergies && (
              <span className="mx-[6px] text-tp-slate-200">|</span>
            )}
            {hasAllergies && (
              <HistorySubSection label="Allergies" items={data.allergies!} />
            )}
          </div>
        )}

        {/* ── A — Today's Vitals ── */}
        {vitalEntries.length > 0 && (
          <InlineDataRow
            tag="Today's Vitals"
            tagIcon={SECTION_TAG_ICON_MAP["Today's Vitals"]}
            values={vitalEntries}
            source="existing"
            onTagClick={onSidebarNav ? () => onSidebarNav("vitals") : undefined}
          />
        )}

        {/* ── A — Key Labs ── */}
        {labEntries.length > 0 && (
          <InlineDataRow
            tag="Key Labs"
            tagIcon={SECTION_TAG_ICON_MAP["Key Labs"]}
            values={labEntries}
            source="existing"
            onTagClick={onSidebarNav ? () => onSidebarNav("lab-results") : undefined}
          />
        )}

        {/* ── Last Visit — with color hierarchy ── */}
        {lastVisit && (
          <div className="text-[14px] leading-[1.7] text-tp-slate-800">
            <SectionTag
              label="Last Visit"
              icon={SECTION_TAG_ICON_MAP["Last Visit"]}
              onClick={onSidebarNav ? () => onSidebarNav("past-visits") : undefined}
            />
            {" "}
            {lastVisit.date && (
              <span className="font-medium text-tp-slate-700">{lastVisit.date}</span>
            )}
            {lastVisit.symptoms && (
              <>
                <span className="mx-[6px] text-tp-slate-200">|</span>
                <span className="text-tp-slate-400">Sx:&nbsp;</span>
                {lastVisit.symptoms.split(", ").map((s, i, arr) => (
                  <React.Fragment key={i}>
                    {formatWithHierarchy(s.trim(), "text-tp-slate-700", "font-normal text-tp-slate-400")}
                    {i < arr.length - 1 && <span className="text-tp-slate-400">, </span>}
                  </React.Fragment>
                ))}
              </>
            )}
            {lastVisit.diagnosis && (
              <>
                <span className="mx-[6px] text-tp-slate-200">|</span>
                <span className="text-tp-slate-400">Dx:&nbsp;</span>
                {lastVisit.diagnosis.split(", ").map((d, i, arr) => (
                  <React.Fragment key={i}>
                    {formatWithHierarchy(d.trim(), "font-medium text-tp-slate-700", "font-normal text-tp-slate-400")}
                    {i < arr.length - 1 && <span className="text-tp-slate-400">, </span>}
                  </React.Fragment>
                ))}
              </>
            )}
            {lastVisit.medication && (
              <>
                <span className="mx-[6px] text-tp-slate-200">|</span>
                <span className="text-tp-slate-400">Rx:&nbsp;</span>
                {splitRespectingParens(lastVisit.medication).map((m, i, arr) => {
                  const shortened = shortenMedication(m)
                  return (
                    <React.Fragment key={i}>
                      {formatWithHierarchy(shortened, "text-tp-slate-700", "font-normal text-tp-slate-400")}
                      {i < arr.length - 1 && <span className="text-tp-slate-400">, </span>}
                    </React.Fragment>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── R — Recommendations ── */}
        {recommendations.length > 0 && (
          <div className="text-[14px] leading-[1.7]">
            <SectionTag label="Recommendations" icon={SECTION_TAG_ICON_MAP["Due Alerts"]} />
            <ul className="mt-[2px] flex flex-col gap-[2px] ml-[4px]">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-[6px]">
                  <span className="text-tp-slate-300 mt-[3px] text-[10px] leading-[18px]">●</span>
                  <span className="text-tp-slate-600 text-[14px] leading-[20px]">{highlightRecommendation(rec)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CardShell>
  )
}

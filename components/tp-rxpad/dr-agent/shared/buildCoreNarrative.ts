/**
 * Shared narrative builder — produces a structured intermediate format
 * that both GPSummaryCard (JSX) and SbarOverviewCard (plain text) consume.
 *
 * This ensures the patient summary narrative and SBAR situation line
 * always present the same clinical content, just formatted differently.
 */

import type { SmartSummaryData, SpecialtyTabId } from "../types"

// ── Types ──

export interface NarrativeCondition {
  name: string
  duration?: string
  raw: string
}

export interface NarrativeParts {
  /** Specialty-specific opener (obstetric G/P/EDD, ophthal VA/IOP, etc.) */
  specialtyLead?: string
  /** Chronic/concerning conditions */
  conditions?: { items: NarrativeCondition[]; hasMore: number }
  /** Drug allergies */
  allergies?: string[]
  /** Active medications (shortened) */
  meds?: { names: string[]; hasMore: number }
  /** Last visit summary */
  lastVisit?: { date: string; dx: string }
  /** Follow-up overdue days */
  followUpOverdue?: number
  /** Current symptoms from symptom collector */
  symptoms?: { name: string; duration?: string }[]
}

// ── Helpers ──

const ABBREV_MAP: Record<string, string> = {
  "DM": "Diabetes", "HTN": "Hypertension", "CKD": "Chronic Kidney Disease",
  "COPD": "Chronic Obstructive Pulmonary Disease", "CAD": "Coronary Artery Disease",
  "CHF": "Congestive Heart Failure", "RA": "Rheumatoid Arthritis",
  "SLE": "Systemic Lupus Erythematosus", "TB": "Tuberculosis",
  "GERD": "Gastroesophageal Reflux Disease",
}

export function expandAbbreviation(text: string): string {
  return text.replace(/\b(DM|HTN|CKD|COPD|CAD|CHF|RA|SLE|TB|GERD)\b/g, (match) => {
    return ABBREV_MAP[match] || match
  })
}

/** Shorten medication to drug name (+ strength if present) */
export function shortenMedication(raw: string): string {
  const parts = raw.trim().split(/\s+/)
  if (parts.length === 0) return raw
  const drugName = parts[0]
  if (parts.length > 1 && /^\d+/.test(parts[1]) && !/^\d+-\d+/.test(parts[1])) {
    return `${drugName} ${parts[1]}`
  }
  return drugName
}

/** Specialty-relevant condition keywords */
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
  const relevant = conditions.filter((c) => pattern.test(c))
  const other = conditions.filter((c) => !pattern.test(c))
  return [...relevant, ...other]
}

/** Parse a condition string like "Diabetes (5 yrs)" into name + duration */
function parseCondition(raw: string): NarrativeCondition {
  const match = raw.match(/^(.+?)\s*(?:\(([^)]+)\)\s*)?$/)
  const name = match?.[1]?.replace(/\s*—\s*$/, "").trim() || raw
  const duration = match?.[2]
  return { name, duration, raw }
}

// ── Specialty lead-in (plain text) ──

function buildSpecialtyLeadInText(
  data: SmartSummaryData,
  specialty?: SpecialtyTabId,
): string | undefined {
  if (!specialty || specialty === "gp") return undefined

  if (specialty === "obstetric" && data.obstetricData) {
    const ob = data.obstetricData
    const gp = [
      ob.gravida != null ? `G${ob.gravida}` : null,
      ob.para != null ? `P${ob.para}` : null,
      ob.living != null ? `L${ob.living}` : null,
      ob.abortion != null && ob.abortion > 0 ? `A${ob.abortion}` : null,
    ].filter(Boolean).join("")
    const details: string[] = []
    if (ob.gestationalWeeks) details.push(`${ob.gestationalWeeks} wks`)
    if (ob.edd) details.push(`EDD ${ob.edd}`)
    if (ob.lmp) details.push(`LMP ${ob.lmp}`)
    return `${gp || "Obstetric patient"}${details.length > 0 ? ` — ${details.join(", ")}` : ""}`
  }

  if (specialty === "ophthal" && data.ophthalData) {
    const oph = data.ophthalData
    const vaDetails: string[] = []
    if (oph.vaRight) vaDetails.push(`OD: ${oph.vaRight}`)
    if (oph.vaLeft) vaDetails.push(`OS: ${oph.vaLeft}`)
    if (oph.iop) vaDetails.push(`IOP: ${oph.iop}`)
    if (vaDetails.length > 0) return vaDetails.join(", ")
  }

  if (specialty === "gynec" && data.gynecData) {
    const gyn = data.gynecData
    const details: string[] = []
    if (gyn.lmp) details.push(`LMP ${gyn.lmp}`)
    if (gyn.cycleRegularity) details.push(`cycles ${gyn.cycleRegularity.toLowerCase()}`)
    if (gyn.painScore && parseInt(gyn.painScore, 10) > 5) details.push(`pain ${gyn.painScore}/10`)
    if (details.length > 0) return details.join(", ")
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
    if (details.length > 0) return details.join(", ")
  }

  return undefined
}

// ── Core builder ──

/**
 * Build structured narrative parts from patient data.
 * Both GPSummaryCard and SbarOverviewCard call this to ensure
 * they present the same clinical content.
 *
 * @param data - Patient summary data
 * @param specialty - Active specialty tab
 * @param maxConditions - Max conditions to show (default 3)
 * @param maxAllergies - Max allergies to show (default 2)
 * @param maxMeds - Max medications to show (default 3)
 */
export function buildCoreNarrative(
  data: SmartSummaryData,
  specialty?: SpecialtyTabId,
  options?: {
    maxConditions?: number
    maxAllergies?: number
    maxMeds?: number
  },
): NarrativeParts {
  const maxConditions = options?.maxConditions ?? 3
  const maxAllergies = options?.maxAllergies ?? 2
  const maxMeds = options?.maxMeds ?? 3

  const result: NarrativeParts = {}

  // Specialty lead-in
  const lead = buildSpecialtyLeadInText(data, specialty)
  if (lead) result.specialtyLead = lead

  // Symptoms from collector
  if (data.symptomCollectorData?.symptoms?.length) {
    result.symptoms = data.symptomCollectorData.symptoms.slice(0, 3).map(s => ({
      name: s.name,
      duration: s.duration,
    }))
  }

  // Chronic conditions (filtered by specialty)
  if (data.chronicConditions && data.chronicConditions.length > 0) {
    const filtered = filterConditionsForSpecialty(data.chronicConditions, specialty)
    if (filtered.length > 0) {
      const items = filtered.slice(0, maxConditions).map(parseCondition)
      result.conditions = {
        items,
        hasMore: Math.max(0, filtered.length - maxConditions),
      }
    }
  }

  // Allergies (all types, not just drug allergies)
  if (data.allergies && data.allergies.length > 0) {
    result.allergies = data.allergies.slice(0, maxAllergies)
  }

  // Active medications
  if (data.activeMeds && data.activeMeds.length > 0) {
    result.meds = {
      names: data.activeMeds.slice(0, maxMeds).map(shortenMedication),
      hasMore: Math.max(0, data.activeMeds.length - maxMeds),
    }
  }

  // Last visit
  if (data.lastVisit) {
    const date = data.lastVisit.date || ""
    const dx = data.lastVisit.diagnosis || ""
    if (date && dx) {
      result.lastVisit = { date, dx }
    }
  }

  // Follow-up overdue
  if (data.followUpOverdueDays && data.followUpOverdueDays > 0) {
    result.followUpOverdue = data.followUpOverdueDays
  }

  return result
}

/**
 * Render NarrativeParts as a plain text string.
 * Used by SbarOverviewCard's buildSituationLine.
 *
 * @param parts - Structured narrative parts from buildCoreNarrative
 * @param maxChars - Character limit (default 220)
 */
export function narrativeToPlainText(
  parts: NarrativeParts,
  maxChars = 220,
): string {
  const sentences: string[] = []

  // Specialty lead-in
  if (parts.specialtyLead) {
    sentences.push(`${parts.specialtyLead}.`)
  }

  // Symptoms
  if (parts.symptoms?.length) {
    const symptomStr = parts.symptoms.map(s => {
      return s.duration ? `${s.name} (${s.duration})` : s.name
    }).join(", ")
    sentences.push(`Presenting with ${symptomStr}.`)
  }

  // Conditions
  if (parts.conditions) {
    const condStr = parts.conditions.items
      .map(c => c.duration ? `${expandAbbreviation(c.name)} (${c.duration})` : expandAbbreviation(c.name))
      .join(", ")
    const prefix = sentences.length > 0 ? "Known case of" : "Patient with"
    const more = parts.conditions.hasMore > 0 ? ` + ${parts.conditions.hasMore} more` : ""
    sentences.push(`${prefix} ${condStr}${more}.`)
  }

  // Allergies
  if (parts.allergies?.length) {
    const allergyStr = parts.allergies.map(a => a.split("(")[0].trim()).join(", ")
    sentences.push(`Allergic to ${allergyStr}.`)
  }

  // Medications
  if (parts.meds) {
    const more = parts.meds.hasMore > 0 ? ` + ${parts.meds.hasMore} more` : ""
    sentences.push(`On ${parts.meds.names.join(", ")}${more}.`)
  }

  // Last visit
  if (parts.lastVisit) {
    sentences.push(`Last seen ${parts.lastVisit.date} — Dx: ${parts.lastVisit.dx}.`)
  }

  // Follow-up overdue
  if (parts.followUpOverdue) {
    sentences.push(`Follow-up overdue by ${parts.followUpOverdue} days.`)
  }

  if (sentences.length === 0) return "New patient, no prior clinical data available."

  // Cap at maxChars
  let result = sentences.join(" ")
  if (result.length > maxChars) {
    // Progressively trim from the end
    result = ""
    for (const s of sentences) {
      const candidate = result ? `${result} ${s}` : s
      if (candidate.length > maxChars && result.length > 0) break
      result = candidate
    }
  }

  return result
}

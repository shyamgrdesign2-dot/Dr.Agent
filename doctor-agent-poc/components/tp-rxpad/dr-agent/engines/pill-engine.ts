// -----------------------------------------------------------------
// Canned Pill Engine -- 4-Layer Priority Pipeline
// Pure function: (summary, phase, tabLens) -> CannedPill[]
// -----------------------------------------------------------------

import type { CannedPill, ConsultPhase, RxTabLens, SmartSummaryData } from "../types"

const MAX_PILLS = 4

// =============== LAYER 1: SAFETY FORCE ===============
function getLayer1(summary: SmartSummaryData): CannedPill[] {
  const pills: CannedPill[] = []

  // SpO2 critical
  const spo2 = summary.todayVitals?.spo2 ? parseFloat(summary.todayVitals.spo2) : null
  if (spo2 !== null && spo2 < 90) {
    pills.push({ id: "force-spo2-critical", label: "Review SpO\u2082", priority: 0, layer: 1, force: true, tone: "primary" })
  }

  // Allergies present
  if (summary.allergies && summary.allergies.length > 0) {
    pills.push({ id: "force-allergy", label: "Allergy Alert", priority: 2, layer: 1, force: true, tone: "primary" })
  }

  return pills
}

// =============== LAYER 2: CLINICAL FLAGS ===============
function getLayer2(summary: SmartSummaryData): CannedPill[] {
  const pills: CannedPill[] = []

  if (summary.labFlagCount >= 3) {
    pills.push({ id: "flag-labs", label: `${summary.labFlagCount} lab values flagged`, priority: 10, layer: 2, tone: "primary" })
  }

  if (summary.followUpOverdueDays > 0) {
    pills.push({ id: "flag-fu", label: `Follow-up overdue ${summary.followUpOverdueDays}d`, priority: 12, layer: 2, tone: "primary" })
  }

  const spo2 = summary.todayVitals?.spo2 ? parseFloat(summary.todayVitals.spo2) : null
  if (spo2 !== null && spo2 >= 90 && spo2 < 95) {
    pills.push({ id: "flag-spo2-declining", label: "SpO\u2082 trend declining", priority: 14, layer: 2, tone: "primary" })
  }

  // Check vital abnormals
  if (summary.todayVitals?.bp) {
    const sys = parseFloat(summary.todayVitals.bp.split("/")[0])
    if (sys > 140 || sys < 90) {
      pills.push({ id: "flag-vitals-bp", label: "BP needs attention", priority: 16, layer: 2, tone: "primary" })
    }
  }

  if (summary.todayVitals?.temp) {
    const temp = parseFloat(summary.todayVitals.temp)
    if (temp >= 100.4) {
      pills.push({ id: "flag-vitals-temp", label: "Temperature elevated", priority: 18, layer: 2, tone: "primary" })
    }
  }

  // Specialty-aware clinical pills (Layer 2 when clinically relevant)
  if (summary.obstetricData) {
    pills.push({ id: "specialty-obstetric", label: "Obstetric summary", priority: 20, layer: 2, tone: "primary" })
  }

  if (summary.gynecData) {
    pills.push({ id: "specialty-gynec", label: "Gynec summary", priority: 22, layer: 2, tone: "primary" })
  }

  if (summary.pediatricsData) {
    pills.push({ id: "specialty-pediatrics", label: "Growth & vaccines", priority: 24, layer: 2, tone: "primary" })
  }

  if (summary.ophthalData) {
    pills.push({ id: "specialty-ophthal", label: "Vision summary", priority: 26, layer: 2, tone: "primary" })
  }

  return pills
}

// =============== LAYER 3: CONSULTATION PHASE (Patient-Data-Aware) ===============
function getLayer3(phase: ConsultPhase, summary: SmartSummaryData): CannedPill[] {
  const hasVitals = !!(summary.todayVitals && Object.keys(summary.todayVitals).length > 0)
  const hasLabs = !!(summary.keyLabs && summary.keyLabs.length > 0)
  const hasLastVisit = !!summary.lastVisit
  const isNewPatient = summary.symptomCollectorData?.isNewPatient || summary.specialtyTags.length === 0
  const hasSymptoms = !!(summary.symptomCollectorData?.symptoms?.length)

  function buildEmpty(): CannedPill[] {
    if (isNewPatient) {
      // New patient — no past data to show, focus on intake + initial workup
      const pills: CannedPill[] = []
      if (hasSymptoms) pills.push({ id: "phase-intake", label: "Review intake data", priority: 30, layer: 3, tone: "primary" })
      pills.push({ id: "phase-ddx", label: "Suggest DDX", priority: 32, layer: 3, tone: "primary" })
      pills.push({ id: "phase-initial-workup", label: "Initial investigations", priority: 34, layer: 3, tone: "primary" })
      pills.push({ id: "phase-ask", label: "Ask me anything", priority: 36, layer: 3, tone: "primary" })
      return pills
    }
    // Existing patient — show pills for data that actually exists
    const pills: CannedPill[] = []
    // Show "Patient summary" pill only when Patient Reported card is the intro (symptomCollectorData exists)
    // When no intake data, Patient Summary is already shown directly in intro — no pill needed
    if (summary.symptomCollectorData) {
      pills.push({ id: "phase-snapshot", label: "Patient summary", priority: 29, layer: 3, tone: "primary" })
    }
    if (hasVitals) pills.push({ id: "phase-vital-trends", label: "Vital trends", priority: 31, layer: 3, tone: "primary" })
    if (hasLabs) pills.push({ id: "phase-labs", label: "Lab overview", priority: 32, layer: 3, tone: "primary" })
    if (hasLastVisit) pills.push({ id: "phase-last-visit", label: "Last visit details", priority: 33, layer: 3, tone: "primary" })
    pills.push({ id: "phase-ask", label: "Ask me anything", priority: 34, layer: 3, tone: "primary" })
    return pills
  }

  function buildSymptomsEntered(): CannedPill[] {
    const pills: CannedPill[] = [
      { id: "phase-ddx", label: "Suggest DDX", priority: 30, layer: 3, tone: "primary" },
    ]
    if (hasLastVisit) pills.push({ id: "phase-compare", label: "Compare with last visit", priority: 32, layer: 3, tone: "primary" })
    if (hasVitals) pills.push({ id: "phase-vital-trends", label: "Vital trends", priority: 33, layer: 3, tone: "primary" })
    if (!hasLastVisit) pills.push({ id: "phase-investigation", label: "Suggest investigations", priority: 34, layer: 3, tone: "primary" })
    return pills
  }

  const generators: Record<ConsultPhase, () => CannedPill[]> = {
    empty: buildEmpty,
    symptoms_entered: buildSymptomsEntered,
    dx_accepted: () => [
      { id: "phase-protocol-meds", label: "Suggest medications", priority: 30, layer: 3, tone: "primary" },
      { id: "phase-investigation", label: "Suggest investigations", priority: 32, layer: 3, tone: "primary" },
      { id: "phase-advice", label: "Draft advice", priority: 34, layer: 3, tone: "primary" },
      { id: "phase-followup", label: "Plan follow-up", priority: 36, layer: 3, tone: "primary" },
    ],
    meds_written: () => [
      { id: "phase-advice-gen", label: "Generate advice", priority: 30, layer: 3, tone: "primary" },
      { id: "phase-translate", label: "Translate to regional", priority: 32, layer: 3, tone: "primary" },
      { id: "phase-followup", label: "Plan follow-up", priority: 34, layer: 3, tone: "primary" },
    ],
    near_complete: () => [
      { id: "phase-completeness", label: "Completeness check", priority: 30, layer: 3, tone: "primary" },
      { id: "phase-translate", label: "Translate advice", priority: 32, layer: 3, tone: "primary" },
      { id: "phase-summary-final", label: "Visit summary", priority: 34, layer: 3, tone: "primary" },
    ],
  }

  const base = (generators[phase] || generators.empty)()

  // Add lab comparison pill when labs are available (all phases)
  if (hasLabs && !base.some(p => p.id === "phase-lab-compare")) {
    base.push({ id: "phase-lab-compare", label: "Lab comparison", priority: 35, layer: 3, tone: "primary" })
  }

  return base
}

// =============== LAYER 4: TAB LENS ===============
function getLayer4(lens: RxTabLens): CannedPill[] {
  const map: Record<RxTabLens, CannedPill[]> = {
    "dr-agent": [],
    "past-visits": [
      { id: "lens-compare", label: "Compare visits", priority: 60, layer: 4, tone: "primary" },
      { id: "lens-recurrence", label: "Recurrence check", priority: 62, layer: 4, tone: "primary" },
    ],
    vitals: [
      { id: "lens-vital-trends", label: "Vital trends", priority: 60, layer: 4, tone: "primary" },
      { id: "lens-graph", label: "Graph view", priority: 62, layer: 4, tone: "primary" },
    ],
    history: [
      { id: "lens-med-search", label: "Med history search", priority: 60, layer: 4, tone: "primary" },
      { id: "lens-chronic-timeline", label: "Chronic timeline", priority: 62, layer: 4, tone: "primary" },
    ],
    "lab-results": [
      { id: "lens-lab-compare", label: "Lab comparison", priority: 60, layer: 4, tone: "primary" },
      { id: "lens-annual-panel", label: "Annual panel", priority: 62, layer: 4, tone: "primary" },
    ],
    obstetric: [
      { id: "lens-ob-summary", label: "Obstetric summary", priority: 60, layer: 4, tone: "primary" },
      { id: "lens-anc", label: "ANC schedule", priority: 62, layer: 4, tone: "primary" },
    ],
    "medical-records": [
      { id: "lens-ocr", label: "OCR analysis", priority: 60, layer: 4, tone: "primary" },
      { id: "lens-extract", label: "Report extract", priority: 62, layer: 4, tone: "primary" },
    ],
  }
  return map[lens] || []
}

// =============== MAIN GENERATOR ===============

export function generatePills(
  summary: SmartSummaryData,
  phase: ConsultPhase,
  tabLens: RxTabLens,
): CannedPill[] {
  const all = [
    ...getLayer1(summary),
    ...getLayer2(summary),
    ...getLayer3(phase, summary),
    ...getLayer4(tabLens),
  ]

  // Sort by priority (ascending = highest priority first)
  all.sort((a, b) => a.priority - b.priority)

  // Deduplicate by label
  const seen = new Set<string>()
  const deduped = all.filter((p) => {
    if (seen.has(p.label)) return false
    seen.add(p.label)
    return true
  })

  // Layer 1 force pills always included, rest truncated to MAX_PILLS
  const forced = deduped.filter((p) => p.force)
  const rest = deduped.filter((p) => !p.force)
  const available = MAX_PILLS - forced.length

  return [...forced, ...rest.slice(0, Math.max(0, available))]
}

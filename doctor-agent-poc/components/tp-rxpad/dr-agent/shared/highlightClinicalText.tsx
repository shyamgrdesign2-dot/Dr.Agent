"use client"

import React from "react"

/**
 * Shared clinical text highlighter — bolds conditions, medications, lab values,
 * vitals, durations, pregnancy context, and clinical events.
 *
 * Used across:
 * - GPSummaryCard (narrative)
 * - PatientReportedCard (snapshot)
 * - SbarCriticalCard (situation)
 * - CardRenderer (patient_narrative)
 * - AiPatientTooltip (summary hover)
 */

/** Bold inline helper — semibold, non-italic, darker text for contrast in italic narrative */
function HighlightBold({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold not-italic text-tp-slate-700">{children}</span>
}

const CLINICAL_PATTERNS = [
  // Conditions & diagnoses
  /\bCKD\s+Stage\s+\d+\b/gi,
  /\bType\s+\d+\s+D(?:M|iabetes(?:\s+Mellitus)?)\b/gi,
  /\b(?:Hypertension|HTN|Diabetes(?:\s+Mellitus)?|Dyslipidemia|Hypothyroid(?:ism)?|Pre-?Diabetes|PCOS|Migraine|URTI|AUB|Primigravida|COPD|Asthma|Bronchial\s+Asthma|IHD|Ischemic\s+Heart\s+Disease|Diabetic\s+Nephropathy|Renal\s+Anemia|Hyperparathyroidism|Pre-?eclampsia|Gestational\s+DM|GDM|Anemia|Edema|Proteinuria|Conjunctivitis|Viral\s+fever|Pharyngitis|Otitis|Sinusitis|Pneumonia|UTI|Gastritis|Vertigo|Sciatica|Arthritis|Gout|Cellulitis)\b/gi,
  /\bpost-?(?:MI|CABG|angioplasty)\b/gi,
  /\b(?:peritoneal|hemo)\s*dialysis\b/gi,
  // Medications
  /\b(?:Telma|Metsmall|Metsmail|Metformin|Paracetamol|Azithromycin|Sumatriptan|Naproxen|Vitamin\s+D|Rosuvastatin|Melatonin|CoQ10|Thyronorm|Folic\s+Acid|Calcium|Amoxicillin|Salbutamol|Autrin|Tranexamic\s+acid|Iron\+Folic|Amlodipine|Atorvastatin|Telmisartan|Erythropoietin|EPO|Calcitriol|Sevelamer|Pantoprazole|Insulin|Glimepiride|Aspirin|Clopidogrel|Levocetrizine)\s*\d*\w*\b/gi,
  // Lab values (e.g., HbA1c 9.2%, eGFR 7, Hb 10.2, Creatinine 8.2)
  /\b(?:HbA1c|eGFR|Hb|Creatinine|TSH|LDL|HDL|Hemoglobin|Microalbumin|Triglycerides|FBS|IgE)\s*(?:\d+\.?\d*\s*%?(?:\s*mg\/dL|\s*mL\/min|\s*mIU\/L|\s*ng\/mL|\s*g\/dL|\s*IU\/mL)?)/gi,
  // Vitals (e.g., BP 170/100, SpO2 94%, Pulse 88)
  /\b(?:BP|SpO[₂2]|Pulse|HR)\s*\d+(?:\/\d+)?(?:\s*%|\s*bpm|\s*mmHg)?/gi,
  // Clinical events & counts
  /\b\d+\s*(?:ER|hospital)\s+admissions?\b/gi,
  /\bacute\s+fluid\s+overload\b/gi,
  // Durations (e.g., 2 years, 4 days, 1 week)
  /\b\d+[\s-]*(?:years?|yr|months?|mo|weeks?|wk|days?|d)\b/gi,
  // Dates (e.g., 12 Jan'26, 02-Mar-2026)
  /\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:'\d{2})?/gi,
  // Pregnancy context
  /\bG\d+P\d+(?:L\d+)?(?:A\d+)?\b/gi,
  /\bLMP\s+\S+/gi,
  /\bEDD\s+\S+/gi,
  // Age at start
  /^\d+-year-old\s+(?:male|female)/gi,
  // Follow-up overdue
  /\bfollow-?up\s+overdue(?:\s+by\s+\d+\s*d(?:ays?)?)?\b/gi,
]

/**
 * Highlight clinical terms in text — returns React nodes with semibold highlights.
 * Used for narrative/summary text rendering across the Dr Agent panel.
 */
export function highlightClinicalText(text: string): React.ReactNode {
  const matches: Array<{ start: number; end: number }> = []
  for (const pat of CLINICAL_PATTERNS) {
    pat.lastIndex = 0
    let m: RegExpExecArray | null
    let safety = 0
    while ((m = pat.exec(text)) !== null && safety++ < 100) {
      matches.push({ start: m.index, end: m.index + m[0].length })
      if (!pat.global) break
    }
  }

  if (matches.length === 0) return text

  // Sort and merge overlapping
  matches.sort((a, b) => a.start - b.start)
  const merged: Array<{ start: number; end: number }> = [matches[0]]
  for (let i = 1; i < matches.length; i++) {
    const last = merged[merged.length - 1]
    if (matches[i].start <= last.end) {
      last.end = Math.max(last.end, matches[i].end)
    } else {
      merged.push(matches[i])
    }
  }

  const parts: React.ReactNode[] = []
  let cursor = 0
  merged.forEach((m, i) => {
    if (m.start > cursor) {
      parts.push(text.slice(cursor, m.start))
    }
    parts.push(<HighlightBold key={`h-${i}`}>{text.slice(m.start, m.end)}</HighlightBold>)
    cursor = m.end
  })
  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }
  return <>{parts}</>
}

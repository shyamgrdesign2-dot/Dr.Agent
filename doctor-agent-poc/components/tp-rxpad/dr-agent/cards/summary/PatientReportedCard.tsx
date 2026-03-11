"use client"

import React, { useState } from "react"
import { CardShell } from "../CardShell"
import { CopyIcon } from "../CopyIcon"
import { ActionableTooltip } from "../ActionableTooltip"

import { TPMedicalIcon } from "@/components/tp-ui"
import { MessageQuestion } from "iconsax-reactjs"
import type { SymptomCollectorData } from "../../types"

interface PatientReportedCardProps {
  data: SymptomCollectorData
  onCopy?: (section: string, items: string[]) => void
  onPillTap?: (label: string) => void
  defaultCollapsed?: boolean
}

/* ── section config ─────────────────────────────────── */

interface SectionDef {
  id: string
  tpIconName: string
  title: string
  copyTooltip: string
  copyDest: string
  getItems: (
    d: SymptomCollectorData,
  ) => Array<{ name: string; detail?: string }> | undefined
}

/** Parse medication string into name + frequency detail.
 *  "Telma 20mg 1-0-0-1" → { name: "Telma 20mg", detail: "1-0-0-1" }
 *  "Metsmall 500mg 1-0-0-0" → { name: "Metsmall 500mg", detail: "1-0-0-0" }
 *  "Paracetamol SOS" → { name: "Paracetamol", detail: "SOS" }
 */
function parseMedication(med: string): { name: string; detail?: string } {
  // Match frequency pattern (1-0-0-1) optionally followed by timing (BF, AF, etc.)
  const freqMatch = med.match(/\s+(\d+-\d+-\d+-\d+(?:\s+(?:BF|AF|BD|TDS|OD|SOS|HS))?)\s*$/i)
  if (freqMatch) {
    return { name: med.slice(0, freqMatch.index).trim(), detail: freqMatch[1].trim() }
  }
  // Match standalone timing code at end
  const timingMatch = med.match(/\s+(BF|AF|BD|TDS|OD|SOS|HS)\s*$/i)
  if (timingMatch) {
    return { name: med.slice(0, timingMatch.index).trim(), detail: timingMatch[1].trim() }
  }
  return { name: med }
}

const SECTION_DEFS: SectionDef[] = [
  {
    id: "symptoms",
    tpIconName: "virus",
    title: "Symptom Reports",
    copyTooltip: "Copy all symptoms to Symptoms",
    copyDest: "symptoms",
    getItems: (d) =>
      d.symptoms?.map((s) => ({
        name: s.name,
        detail: [s.duration, s.severity, s.notes].filter(Boolean).join(", "),
      })),
  },
  {
    id: "medicalHistory",
    tpIconName: "medical-service",
    title: "Chronic Conditions",
    copyTooltip: "Copy chronic conditions to History",
    copyDest: "history",
    getItems: (d) => d.medicalHistory?.map((item) => ({ name: item })),
  },
  {
    id: "currentMedications",
    tpIconName: "pill",
    title: "Current Medications",
    copyTooltip: "Copy medications to RxPad",
    copyDest: "medications",
    getItems: (d) => d.currentMedications?.map((item) => parseMedication(item)),
  },
  {
    id: "questionsToDoctor",
    tpIconName: "Diagnosis",
    title: "Questions to Doctor",
    copyTooltip: "Copy questions",
    copyDest: "notes",
    getItems: (d) => d.questionsToDoctor?.map((q) => ({ name: q })),
  },
]

/* ── helpers ────────────────────────────────────────── */

function formatItem(item: { name: string; detail?: string }): string {
  return item.detail ? `${item.name} (${item.detail})` : item.name
}

/**
 * Build a concise quick snapshot — fits in ~2 lines at 392px width.
 *
 * Uses full condition names (Hypertension, Diabetes Mellitus — NOT abbreviations).
 * Highlights medicine names, dates, diagnosis, and symptoms in bold.
 * Shows only 1 current medication to save space.
 * "Suggested" medicines differ from "on" medicines.
 *
 * Example:
 *   "Patient with Hypertension 3yr and Diabetes Mellitus 2yr, on Telma 20mg,
 *    last visited on 27-01-2026 with fever, diagnosed Viral fever and
 *    Conjunctivitis, suggested Paracetamol 650mg and Azithromycin 500mg."
 */

/** Full condition name mapping (no abbreviations) */
const CONDITION_FULL: Record<string, string> = {
  hypertension: "Hypertension",
  diabetes: "Diabetes Mellitus",
  dyslipidemia: "Dyslipidemia",
  hypothyroid: "Hypothyroid",
  "pre-diabetes": "Pre-Diabetes",
  pcos: "PCOS",
  migraine: "Migraine",
}

function formatCondition(condition: string): { name: string; duration?: string } {
  const nameMatch = condition.match(/^([^(]+)/)
  const rawName = nameMatch ? nameMatch[1].trim().toLowerCase() : condition.toLowerCase()
  const full = CONDITION_FULL[rawName] ?? condition.replace(/\s*\(.*\)/, "").trim()
  const durationMatch = condition.match(/\(([^)]+)\)/)
  return { name: full, duration: durationMatch?.[1] }
}

/** Strip medication frequency patterns like "1-0-0-1", "1-0-0-0 BF" etc. */
function cleanMedName(med: string): string {
  return med
    .replace(/\s+\d+-\d+-\d+-\d+\s*/g, " ")  // remove 1-0-0-1
    .replace(/\s+(BF|AF|BD|TDS|OD|SOS|HS)\b/gi, "")  // remove timing
    .trim()
}

/** Inline bold helper — semibold + non-italic for clear contrast in italic snapshot */
function B({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold not-italic text-tp-slate-700">{children}</span>
}

function buildQuickSnapshot(data: SymptomCollectorData): React.ReactNode[] {
  const parts: React.ReactNode[] = []

  if (data.isNewPatient) {
    // ── New patient: symptom-first compact snapshot ──
    if (data.symptoms && data.symptoms.length > 0) {
      const symptomNames = data.symptoms.map((s) => s.name).slice(0, 2)
      parts.push(
        <span key="newSymptoms">
          New patient with <B>{symptomNames.join(" and ")}</B>
          {data.symptoms[0]?.duration ? ` ${data.symptoms[0].duration}` : ""}
        </span>,
      )
    }
    // Allergy inline
    if (data.allergies && data.allergies.length > 0) {
      parts.push(
        <span key="newAllergy">
          {parts.length > 0 ? ". " : ""}
          Allergy: <B>{data.allergies.join(", ")}</B>
        </span>,
      )
    }
    // Current meds — show 1
    if (data.currentMedications && data.currentMedications.length > 0) {
      const firstMed = cleanMedName(data.currentMedications[0])
      parts.push(
        <span key="newMeds">
          {parts.length > 0 ? ", on " : "On "}
          <B>{firstMed}</B>
        </span>,
      )
    }
  } else {
    // ── Existing patient: condition-first snapshot ──
    // Chronic conditions — full names with bold condition name
    if (data.medicalHistory && data.medicalHistory.length > 0) {
      const conditions = data.medicalHistory.map(formatCondition)
      const conditionNodes = conditions.map((c, i) => (
        <React.Fragment key={`cond-${i}`}>
          {i > 0 && i === conditions.length - 1 ? " and " : i > 0 ? ", " : ""}
          <B>{c.name}</B>{c.duration ? ` ${c.duration}` : ""}
        </React.Fragment>
      ))
      parts.push(<span key="conditions">Patient with {conditionNodes}</span>)
    }

    // Current medications — show only 1, bold the name
    if (data.currentMedications && data.currentMedications.length > 0) {
      const firstMed = cleanMedName(data.currentMedications[0])
      parts.push(
        <span key="meds">
          {parts.length > 0 ? ", on " : "On "}
          <B>{firstMed}</B>
        </span>,
      )
    }

    // Last visit — inline with bold date, symptoms, diagnosis, suggested meds
    if (data.lastVisitSummary) {
      parts.push(
        <span key="lastVisit">
          {parts.length > 0 ? ", " : ""}
          {highlightSummary(data.lastVisitSummary)}
        </span>,
      )
    }
  }

  return parts
}

/** Highlight dates, diagnoses, symptoms, and med names in the lastVisitSummary */
function highlightSummary(text: string): React.ReactNode {
  // Pattern: "last visited on 27 Jan'26 with fever, diagnosed Viral fever ..., suggested Paracetamol 650mg ..."
  const parts: React.ReactNode[] = []
  const regex = /\b(last visited on)\s+(.+?)\s+(with)\s+([^,]+),\s*(diagnosed)\s+([^,]+),\s*(suggested)\s+(.+)/i
  const match = text.match(regex)

  if (match) {
    parts.push("last visited on ")
    parts.push(<B key="date">{match[2]}</B>)
    parts.push(" with ")
    parts.push(<B key="symptoms">{match[4].trim()}</B>)
    parts.push(", diagnosed ")
    parts.push(<B key="diagnosis">{match[6].trim()}</B>)
    parts.push(", suggested ")
    parts.push(<B key="suggested">{match[8].trim()}</B>)
  } else {
    // Fallback: show as-is
    parts.push(text)
  }

  return <>{parts}</>
}

/* ── component ──────────────────────────────────────── */

export function PatientReportedCard({ data, onCopy, onPillTap, defaultCollapsed }: PatientReportedCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  /* Build all non-empty sections */
  const activeSections = SECTION_DEFS.map((def) => {
    const items = def.getItems(data)
    if (!items || items.length === 0) return null
    return { ...def, items }
  }).filter(Boolean) as Array<
    SectionDef & { items: Array<{ name: string; detail?: string }> }
  >

  if (activeSections.length === 0) return null

  /* Collect all items for copy-all */
  const allItems = activeSections.flatMap((s) => s.items.map(formatItem))

  /* Quick snapshot — flowing paragraph */
  const snapshotParts = buildQuickSnapshot(data)
  const showSnapshot = snapshotParts.length > 0

  /* Copy handler with flash feedback */
  const handleCopyItem = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1200)
  }

  const handleCopySection = (section: typeof activeSections[0]) => {
    const text = section.items.map(formatItem).join("\n")
    navigator.clipboard?.writeText(text)
    onCopy?.(section.copyDest, section.items.map(formatItem))
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="clipboard-activity"
      title="Patient Reported"
      badge={
        data.reportedAt
          ? { label: data.reportedAt, color: "#6D28D9", bg: "#EDE9FE" }
          : undefined
      }
      copyAll={() => onCopy?.("all", allItems)}
      copyAllTooltip="Copy all patient-reported data to RxPad"
      collapsible
      defaultCollapsed={defaultCollapsed ?? false}
    >
      <div className="flex flex-col gap-[8px]">
        {/* Quick snapshot — quotation-style block */}
        {showSnapshot && (
          <div className="rounded-[8px] bg-tp-slate-50 border-l-[3px] border-tp-violet-300 px-3 py-2">
            <p className="text-[12px] italic leading-[1.6] text-tp-slate-500">
              &ldquo;{snapshotParts}&rdquo;
            </p>
          </div>
        )}

        {/* Sections */}
        {activeSections.map((section) => (
          <div key={section.id}>
            {/* Section header bar with hover copy icon */}
            <div className="group/section-header flex items-center gap-[5px] rounded-[4px] bg-tp-slate-50 px-2 py-[3px]">
              {section.id === "questionsToDoctor" ? (
                <MessageQuestion size={12} variant="Bulk" color="var(--tp-slate-500, #64748B)" />
              ) : (
                <TPMedicalIcon
                  name={section.tpIconName}
                  variant="bulk"
                  size={12}
                  color="var(--tp-slate-500, #64748B)"
                />
              )}
              <span className="flex-1 text-[12px] font-semibold text-tp-slate-600">
                {section.title}
              </span>
              <span className="opacity-0 group-hover/section-header:opacity-100 transition-opacity">
                <ActionableTooltip
                  label={section.copyTooltip}
                  onAction={() => handleCopySection(section)}
                >
                  <CopyIcon size={14} onClick={() => handleCopySection(section)} />
                </ActionableTooltip>
              </span>
            </div>

            {/* Bullet list with per-item hover copy */}
            <ul className="mt-1 flex flex-col gap-[2px] pl-1">
              {section.items.map((item, idx) => {
                const itemKey = `${section.id}-${idx}`
                const itemText = formatItem(item)
                return (
                  <li
                    key={idx}
                    className="group/reported-item flex items-start gap-[6px] rounded-[4px] px-1 -mx-1 py-[2px] text-[12px] leading-[1.5] text-tp-slate-700 transition-colors hover:bg-tp-slate-50/80"
                  >
                    <span className="mt-[1px] flex-shrink-0 text-tp-slate-400">
                      •
                    </span>
                    <span className="flex-1">
                      <span className="font-normal text-tp-slate-700">
                        {item.name}
                      </span>
                      {item.detail && (
                        <span className="text-tp-slate-400">
                          {" "}({item.detail})
                        </span>
                      )}
                    </span>
                    <span className="flex-shrink-0 opacity-0 group-hover/reported-item:opacity-100 transition-opacity">
                      {copiedKey === itemKey ? (
                        <span className="text-[10px] text-tp-success-500 font-medium">Copied</span>
                      ) : (
                        <ActionableTooltip
                          label={`Copy "${item.name}" to RxPad`}
                          onAction={() => handleCopyItem(itemText, itemKey)}
                        >
                          <CopyIcon
                            size={14}
                            onClick={() => handleCopyItem(itemText, itemKey)}
                          />
                        </ActionableTooltip>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

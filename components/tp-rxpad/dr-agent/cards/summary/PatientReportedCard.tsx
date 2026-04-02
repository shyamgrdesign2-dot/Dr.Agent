"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useTouchDevice } from "@/hooks/use-touch-device"
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
  // Pattern 1: Parenthesized detail — "Telma 20mg (Twice daily)" or "Telma 20mg (Twice daily | Before food)"
  const parenMatch = med.trim().match(/^(.+?)\s*\((.+)\)\s*$/)
  if (parenMatch) {
    return { name: parenMatch[1].trim(), detail: parenMatch[2].trim() }
  }
  // Pattern 2: Frequency pattern (1-0-0-1) optionally followed by timing (BF, AF, etc.)
  const freqMatch = med.match(/\s+(\d+-\d+-\d+-\d+(?:\s+(?:BF|AF|BD|TDS|OD|SOS|HS))?)\s*$/i)
  if (freqMatch) {
    return { name: med.slice(0, freqMatch.index).trim(), detail: freqMatch[1].trim() }
  }
  // Pattern 3: Standalone timing code at end
  const timingMatch = med.match(/\s+(BF|AF|BD|TDS|OD|SOS|HS)\s*$/i)
  if (timingMatch) {
    return { name: med.slice(0, timingMatch.index).trim(), detail: timingMatch[1].trim() }
  }
  return { name: med }
}

/**
 * Parse a chronic condition / medical history string into name + detail.
 * Extracts duration, treatment context, and clinical details from raw text.
 *
 * "CKD Stage 5 on peritoneal dialysis since Jan 2024"
 *   → { name: "CKD Stage 5", detail: "peritoneal dialysis, since Jan 2024" }
 * "Type 2 Diabetes for 18 years — on insulin"
 *   → { name: "Type 2 Diabetes", detail: "18 years, on insulin" }
 * "Heart attack in 2021 — stent placed"
 *   → { name: "Heart attack", detail: "2021, stent placed" }
 * "High blood pressure — on medications"
 *   → { name: "High blood pressure", detail: "on medications" }
 * "Hypertension (3yr)"
 *   → { name: "Hypertension", detail: "3yr" }
 */
function parseCondition(raw: string): { name: string; detail?: string } {
  const trimmed = raw.trim()

  // Pattern 1: Already has parenthesized detail — "Hypertension (3yr)"
  const parenMatch = trimmed.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/)
  if (parenMatch) {
    return { name: parenMatch[1].trim(), detail: parenMatch[2].trim() }
  }

  // Pattern 2: Has em-dash separator — "Heart attack in 2021 — stent placed"
  const dashMatch = trimmed.match(/^(.+?)\s*[—–]\s*(.+)$/)
  if (dashMatch) {
    // Check if the left side also has "for/since/in" qualifier
    const leftParts = splitConditionQualifier(dashMatch[1].trim())
    const rightDetail = dashMatch[2].trim()
    if (leftParts.detail) {
      return { name: leftParts.name, detail: `${leftParts.detail}, ${rightDetail}` }
    }
    return { name: leftParts.name, detail: rightDetail }
  }

  // Pattern 3: Has "on/for/since/in" qualifier — "Type 2 Diabetes for 18 years"
  const qualParts = splitConditionQualifier(trimmed)
  if (qualParts.detail) {
    return qualParts
  }

  return { name: trimmed }
}

/**
 * Split a condition string at qualifier words (on, for, since, in + year).
 * "CKD Stage 5 on peritoneal dialysis since Jan 2024"
 *   → { name: "CKD Stage 5", detail: "peritoneal dialysis, since Jan 2024" }
 * "Type 2 Diabetes for 18 years"
 *   → { name: "Type 2 Diabetes", detail: "18 years" }
 */
function splitConditionQualifier(text: string): { name: string; detail?: string } {
  // Match "on [treatment]", "for [duration]", "since [date]", "in [year]"
  const qualMatch = text.match(
    /^(.+?)\s+(?:(on)\s+(.+?)(?:\s+(since|from)\s+(.+))?|(for)\s+(.+?)(?:\s+(on)\s+(.+))?|(since|from)\s+(.+)|(in)\s+(\d{4})\b(.*)?)$/i,
  )

  if (!qualMatch) return { name: text }

  // Simplify: split at first "on", "for", "since", or "in [year]"
  const simpleMatch = text.match(/^(.+?)\s+(?:on|for|since|from)\s+(.+)$/i)
  if (simpleMatch) {
    const name = simpleMatch[1].trim()
    const rest = simpleMatch[2].trim()
    // Further split at "since" or "from" if present
    const sinceMatch = rest.match(/^(.+?)\s+(?:since|from)\s+(.+)$/i)
    if (sinceMatch) {
      return { name, detail: `${sinceMatch[1].trim()}, since ${sinceMatch[2].trim()}` }
    }
    return { name, detail: rest }
  }

  // "in 2021" pattern
  const inYearMatch = text.match(/^(.+?)\s+in\s+(\d{4})\s*(.*)$/i)
  if (inYearMatch) {
    const name = inYearMatch[1].trim()
    const detail = inYearMatch[3] ? `${inYearMatch[2]}, ${inYearMatch[3].trim()}` : inYearMatch[2]
    return { name, detail }
  }

  return { name: text }
}

const SECTION_DEFS: SectionDef[] = [
  {
    id: "symptoms",
    tpIconName: "virus",
    title: "Symptoms Reported",
    copyTooltip: "Fill all symptoms to Symptoms",
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
    copyTooltip: "Fill chronic conditions to History",
    copyDest: "history",
    getItems: (d) => d.medicalHistory?.map((item) => parseCondition(item)),
  },
  {
    id: "currentMedications",
    tpIconName: "pill",
    title: "Current Medications",
    copyTooltip: "Fill medications to RxPad",
    copyDest: "medications",
    getItems: (d) => d.currentMedications?.map((item) => parseMedication(item)),
  },
  {
    id: "questionsToDoctor",
    tpIconName: "Diagnosis",
    title: "Questions to Doctor",
    copyTooltip: "Fill questions",
    copyDest: "notes",
    getItems: (d) => d.questionsToDoctor?.map((q) => ({ name: q })),
  },
]

/* ── helpers ────────────────────────────────────────── */

function formatItem(item: { name: string; detail?: string }): string {
  return item.detail ? `${item.name} (${item.detail})` : item.name
}

/* ── component ──────────────────────────────────────── */

export function PatientReportedCard({ data, onCopy, onPillTap, defaultCollapsed }: PatientReportedCardProps) {
  const isTouch = useTouchDevice()
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
      title="Pre-Visit Intake"
      badge={
        data.reportedAt
          ? { label: data.reportedAt, color: "#6D28D9", bg: "#EDE9FE" }
          : undefined
      }
      copyAll={() => onCopy?.("all", allItems)}
      copyAllTooltip="Fill all patient-reported data to RxPad"
      collapsible
      dataSources={["Patient Intake"]}
      defaultCollapsed={defaultCollapsed ?? false}
    >
      <div className="flex flex-col gap-[8px]">
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
              <span className="flex-1 text-[14px] font-semibold text-tp-slate-600">
                {section.title}
              </span>
              <span className={cn("transition-opacity", isTouch ? "opacity-70" : "opacity-0 group-hover/section-header:opacity-100")}>
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
                    className="group/reported-item flex items-start gap-[6px] rounded-[4px] px-1 -mx-1 py-[2px] text-[14px] leading-[1.6] text-tp-slate-700 transition-colors hover:bg-tp-slate-50/80"
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
                    <span className={cn("flex-shrink-0 transition-opacity", isTouch ? "opacity-70" : "opacity-0 group-hover/reported-item:opacity-100")}>
                      {copiedKey === itemKey ? (
                        <span className="text-[14px] text-tp-success-500 font-medium">Copied</span>
                      ) : (
                        <ActionableTooltip
                          label={`Fill "${item.name}" to RxPad`}
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

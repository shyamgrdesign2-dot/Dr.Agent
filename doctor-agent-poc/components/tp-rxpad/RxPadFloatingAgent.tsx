"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Activity,
  AlertTriangle,
  AtSign,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  Copy,
  FileText,
  FlaskConical,
  HeartPulse,
  Mic,
  Paperclip,
  Pill,
  Search,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  Upload,
  UserRound,
  X,
} from "lucide-react"

import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import {
  type AgentPatientContext,
  type AgentDynamicOutput,
  buildAgentMockReply,
  createAgentMessage,
} from "@/components/doctor-agent/mock-agent"
import {
  type RxPadCopyPayload,
  type RxPadVitalsSeed,
  useRxPadSync,
} from "@/components/tp-rxpad/rxpad-sync-context"
import { cn } from "@/lib/utils"

const CONTEXT_PATIENT_ID = "__patient__"
const CONTEXT_COMMON_ID = "__common__"
const CONTEXT_NONE_ID = "__none__"

type RxTabLens =
  | "dr-agent"
  | "past-visits"
  | "vitals"
  | "history"
  | "lab-results"
  | "obstetric"
  | "medical-records"

type ConsultPhase =
  | "empty"
  | "symptoms_entered"
  | "dx_accepted"
  | "meds_written"
  | "near_complete"
  | "in_progress"

interface RxContextOption {
  id: string
  label: string
  meta: string
  kind: "system" | "patient"
  isToday?: boolean
  patient?: AgentPatientContext
}

interface PromptChip {
  id: string
  label: string
  tone: "primary" | "info" | "warning" | "danger"
  force?: boolean
}

interface RxAgentChatMessage {
  id: string
  role: "assistant" | "user"
  text: string
  createdAt: string
  output?: AgentDynamicOutput
  rxOutput?: RxAgentOutput
}

interface LastVisitCardData {
  visitDate: string
  sections: Array<{ short: string; value: string }>
  meds: string[]
  copyAllPayload: RxPadCopyPayload
  copyMedsPayload: RxPadCopyPayload
}

type RxAgentOutput =
  | {
      kind: "last_visit"
      data: LastVisitCardData
    }
  | {
      kind: "multi_last_visit"
      visits: LastVisitCardData[]
    }
  | {
      kind: "visit_selector"
      dates: string[]
    }
  | {
      kind: "vitals_trend"
      summary: string
      trends: Array<{ label: string; latest: string; values: number[]; labels: string[]; tone: "ok" | "warn" | "critical" }>
    }
  | {
      kind: "visit_compare"
      title: string
      currentLabel: string
      previousLabel: string
      rows: Array<{ section: string; current: string; previous: string; status: "improved" | "same" | "worse" }>
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "abnormal_findings"
      title: string
      subtitle: string
      findings: Array<{ label: string; detail: string; severity: "high" | "moderate" | "low"; selected?: boolean }>
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "lab_panel"
      panelDate?: string
      flagged: Array<{ name: string; value: string; flag: "high" | "low" }>
      hiddenNormalCount: number
      insight: string
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "ddx"
      context: string
      options: Array<{
        name: string
        confidence: number
        rationale: string
        bucket?: "cant_miss" | "most_likely" | "extended"
        selected?: boolean
      }>
    }
  | {
      kind: "investigation_bundle"
      title: string
      subtitle: string
      items: Array<{ label: string; selected?: boolean }>
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "advice_bundle"
      title: string
      subtitle: string
      items: Array<{ label: string; selected?: boolean }>
      shareMessage: string
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "follow_up_bundle"
      title: string
      subtitle: string
      items: Array<{ label: string; selected?: boolean }>
      followUpValue: string
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "cascade"
      diagnosis: string
      meds: string[]
      investigations: string[]
      advice: string
      followUp: string
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "translation"
      source: string
      language: string
      translated: string
      advicePayload: RxPadCopyPayload
    }
  | {
      kind: "completeness"
      filled: string[]
      missing: string[]
      completenessPercent: number
    }
  | {
      kind: "med_history"
      className: string
      matches: Array<{ date: string; medicine: string; duration: string }>
    }
  | {
      kind: "recurrence"
      condition: string
      occurrences: number
      timeline: Array<{ date: string; detail: string }>
    }
  | {
      kind: "annual_panel"
      title: string
      tests: Array<{ test: string; priority: "high" | "medium" | "low" }>
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "ocr_report"
      title: string
      reportType: "pathology" | "radiology" | "prescription"
      parameters: Array<{
        name: string
        value: string
        unit: string
        reference: string
        flag: "normal" | "high" | "low" | "critical"
      }>
      insight?: string
      originalFileName: string
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "ui_showcase"
    }

const RX_CONTEXT_OPTIONS: RxContextOption[] = [
  {
    id: CONTEXT_PATIENT_ID,
    label: "Shyam GR (M, 25y)",
    meta: "Appointment today",
    kind: "patient",
    isToday: true,
    patient: {
      id: CONTEXT_PATIENT_ID,
      name: "Shyam GR",
      gender: "M",
      age: 25,
      visitType: "Follow-up",
    },
  },
  {
    id: "apt-anjali",
    label: "Anjali Patel (F, 28y)",
    meta: "Appointment today",
    kind: "patient",
    isToday: true,
    patient: {
      id: "apt-anjali",
      name: "Anjali Patel",
      gender: "F",
      age: 28,
      visitType: "New",
    },
  },
  {
    id: "apt-vikram",
    label: "Vikram Singh (M, 42y)",
    meta: "Follow-up on 12th Sep 2024",
    kind: "patient",
    patient: {
      id: "apt-vikram",
      name: "Vikram Singh",
      gender: "M",
      age: 42,
      visitType: "Follow-up",
    },
  },
  {
    id: CONTEXT_COMMON_ID,
    label: "Common workspace",
    meta: "Operational and cross-patient context",
    kind: "system",
  },
  {
    id: CONTEXT_NONE_ID,
    label: "No patient context",
    meta: "General guidance without chart linkage",
    kind: "system",
  },
]

const PHASE_PROMPTS: Record<ConsultPhase, string[]> = {
  empty: ["Patient snapshot", "Last visit", "Abnormal labs", "Current intake", "Show UI capabilities"],
  symptoms_entered: ["Generate DDX", "Last visit compare", "Vitals review", "Lab focus"],
  dx_accepted: ["Medication plan", "Investigations", "Advice draft", "Follow-up plan"],
  meds_written: ["Refine advice", "Translate advice", "Follow-up plan", "Completeness check"],
  near_complete: ["Final checklist", "Translate advice", "Visit review", "Risk recap"],
  in_progress: ["Patient snapshot", "Abnormal labs", "Last visit", "Current intake", "Show UI capabilities"],
}

const TAB_PROMPTS: Record<RxTabLens, string[]> = {
  "dr-agent": ["Patient snapshot", "Abnormal findings", "Last visit essentials"],
  "past-visits": ["Last visit essentials", "Previous comparison", "Recurrence check"],
  vitals: ["Vitals overview", "Concerning vitals", "Trend if relevant"],
  history: ["Chronic history", "Allergy safety", "Family/lifestyle context"],
  "lab-results": ["Flagged labs", "Latest panel focus", "Follow-up lab suggestion"],
  obstetric: ["Obstetric highlights", "ANC due items", "Pregnancy risk checks"],
  "medical-records": ["Latest document insights", "Abnormal OCR findings", "Older record lookup"],
}

interface LastVisitSummary {
  date: string
  vitals?: string
  symptoms: string
  examination: string
  diagnosis: string
  medication: string
  labTestsSuggested: string
  followUp?: string
}

interface SmartSummaryData {
  specialtyTags: string[]
  followUpOverdueDays: number
  patientNarrative?: string
  familyHistory?: string[]
  lifestyleNotes?: string[]
  allergies?: string[]
  chronicConditions?: string[]
  receptionistIntakeNotes?: string[]
  lastVisit?: LastVisitSummary
  labFlagCount: number
  todayVitals?: {
    bp: string
    pulse: string
    spo2: string
    temp: string
    bmi: string
  }
  activeMeds?: string[]
  keyLabs?: Array<{ name: string; value: string; flag: "high" | "low" }>
  dueAlerts?: string[]
  recordAlerts?: string[]
  concernTrend?: {
    label: string
    values: number[]
    labels: string[]
    unit: string
    tone?: "teal" | "red" | "violet"
  }
  symptomCollectorData?: {
    reportedAt: string
    symptoms: Array<{ name: string; duration?: string; severity?: string }>
    medicalHistory?: string[]
    familyHistory?: string[]
  }
}

const SMART_SUMMARY_BY_CONTEXT: Record<string, SmartSummaryData> = {
  [CONTEXT_PATIENT_ID]: {
    specialtyTags: ["General Medicine", "Diabetology", "Respiratory"],
    followUpOverdueDays: 5,
    patientNarrative:
      "I have fever since three days with evening spikes, dry cough worsening at night, and redness in both eyes. I missed some medicines last week due to travel and wanted to check whether this is due to dust or an infection.",
    familyHistory: ["Father: Type 2 Diabetes", "Mother: Hypertension"],
    lifestyleNotes: ["Sleep reduced to ~5 hrs for 1 week", "Frequent outside food during travel"],
    allergies: ["Dust", "NSAID sensitivity"],
    chronicConditions: ["Diabetes", "Hypertension"],
    receptionistIntakeNotes: [
      "Symptom collector marked fever spikes and dry cough before consultation.",
      "Reception desk marked partial non-adherence during travel week.",
    ],
    lastVisit: {
      date: "27 Jan'26",
      vitals: "BP 126/80, Pulse 76, SpO2 95%, Temp 99.0 F",
      symptoms: "Fever (2 days), bilateral eye redness",
      examination: "Mild conjunctival congestion, clear chest sounds",
      diagnosis: "Viral fever with conjunctival irritation",
      medication: "Telma20 1-0-0-1, Metsmail 500 1-0-0-1, Paracetamol SOS",
      labTestsSuggested: "CBC, LFT",
      followUp: "2 weeks",
    },
    labFlagCount: 7,
    todayVitals: {
      bp: "120/75",
      pulse: "68",
      spo2: "93%",
      temp: "99.1 F",
      bmi: "23.0",
    },
    activeMeds: ["Telma20 1-0-0-1", "Metsmail 500"],
    keyLabs: [
      { name: "TSH", value: "5.2", flag: "high" },
      { name: "LDL", value: "130", flag: "high" },
      { name: "Vit D", value: "20", flag: "low" },
    ],
    dueAlerts: ["Influenza vaccine due this month", "Diabetes follow-up overdue by 5 days"],
    recordAlerts: [
      "Latest pathology OCR: HbA1c 8.1% (high)",
      "Radiology note: mild sinus mucosal thickening",
    ],
    concernTrend: {
      label: "SpO2 trend (latest 93%)",
      values: [97, 96, 94, 93],
      labels: ["20 Jan", "22 Jan", "24 Jan", "27 Jan"],
      unit: "%",
      tone: "red",
    },
    symptomCollectorData: {
      reportedAt: "Today 10:15 AM",
      symptoms: [
        { name: "Fever", duration: "3d", severity: "High" },
        { name: "Headache", duration: "2d" },
        { name: "Body ache" },
      ],
      medicalHistory: ["Diabetes 2 yrs (on medication, name unknown)"],
      familyHistory: ["Father: Diabetes"],
    },
  },
  "apt-anjali": {
    specialtyTags: ["Neurology", "General Medicine"],
    followUpOverdueDays: 0,
    patientNarrative:
      "Headache around forehead mostly in evenings from one week, with eye strain after work and mild nausea in the last two days. She asks whether this is migraine recurrence and if she should continue old tablet.",
    familyHistory: ["Mother: Migraine"],
    lifestyleNotes: ["Screen time > 8h/day"],
    allergies: ["Pollen"],
    chronicConditions: ["Migraine history"],
    receptionistIntakeNotes: ["Patient reported stress-triggered headache before visit."],
    lastVisit: {
      date: "09 Oct'24",
      vitals: "Vitals not captured in previous record",
      symptoms: "Headache with eye strain",
      examination: "Neurological exam grossly normal",
      diagnosis: "Migraine (episodic)",
      medication: "Naproxen 250 SOS",
      labTestsSuggested: "No labs advised",
      followUp: "2 weeks",
    },
    labFlagCount: 1,
    todayVitals: undefined,
    activeMeds: ["Naproxen 250 SOS"],
    keyLabs: [{ name: "Vitamin D", value: "22", flag: "low" }],
    dueAlerts: [],
    recordAlerts: [],
    concernTrend: undefined,
  },
  "apt-vikram": {
    specialtyTags: ["General Medicine", "Lifestyle Medicine"],
    followUpOverdueDays: 12,
    patientNarrative:
      "Fatigue and low appetite for one week with poor sleep. Wants to know if current symptoms are linked to stress and if any blood tests are needed now.",
    familyHistory: [],
    lifestyleNotes: ["Sleep cycle shifted", "Late meals for past 10 days"],
    allergies: [],
    chronicConditions: undefined,
    receptionistIntakeNotes: ["Walk-in note says poor sleep and fatigue for 1 week."],
    lastVisit: {
      date: "12 Sep'24",
      vitals: "BP 132/84, Pulse 88, SpO2 98%",
      symptoms: "Fatigue, low appetite",
      examination: "No focal abnormality documented",
      diagnosis: "Nonspecific viral syndrome",
      medication: "Paracetamol 650 SOS",
      labTestsSuggested: "CBC, ESR",
      followUp: "1 week",
    },
    labFlagCount: 0,
    todayVitals: {
      bp: "138/88",
      pulse: "84",
      spo2: "97%",
      temp: "98.6 F",
      bmi: "25.1",
    },
    activeMeds: undefined,
    keyLabs: undefined,
    dueAlerts: ["Follow-up review overdue by 12 days"],
    recordAlerts: ["No new document uploaded in this visit yet."],
    concernTrend: undefined,
  },
}

function summarizeNarrative(text?: string, maxLen = 150) {
  if (!text) return "No symptom narrative captured from patient side."
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned.length <= maxLen) return cleaned

  const sentenceCuts = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean)
  const firstTwo = sentenceCuts.slice(0, 2).join(" ")
  if (firstTwo && firstTwo.length <= maxLen) return firstTwo

  const chunks = cleaned.split(",").map((part) => part.trim()).filter(Boolean)
  const compact = chunks.slice(0, 3).join(", ")
  if (compact.length <= maxLen) return compact

  return `${cleaned.slice(0, maxLen - 1).trimEnd()}...`
}

const SYMPTOM_COLLECTOR_SYMPTOMS = [
  { id: "sx-1", line: "Fever", detail: "Since: 3 days | Severity: High | Pattern: Evening spikes", severity: "high" as const },
  { id: "sx-2", line: "Dry cough", detail: "Since: 2 days | Severity: Moderate | Pattern: Night worsening", severity: "moderate" as const },
  { id: "sx-3", line: "Eye redness", detail: "Since: 2 days | Severity: Mild | Notes: Bilateral irritation", severity: "low" as const },
]

const SYMPTOM_COLLECTOR_HISTORY = [
  {
    id: "hx-1",
    line: "Chronic conditions",
    detail: "Condition: Diabetes | Since: 2 years | Status: Active | Condition: Hypertension | Since: 1 year | Status: Controlled",
    severity: "high" as const,
  },
  { id: "hx-2", line: "Allergies", detail: "Allergy: Dust | Allergy: NSAID sensitivity | Notes: Gastric discomfort", severity: "moderate" as const },
  { id: "hx-3", line: "Family history", detail: "Issue: Diabetes | Relative: Father | Issue: Hypertension | Relative: Mother", severity: "low" as const },
]

function buildInitialThreads() {
  return RX_CONTEXT_OPTIONS.reduce<Record<string, RxAgentChatMessage[]>>((acc, option) => {
    if (option.kind === "patient" && option.patient) {
      acc[option.id] = []
      return acc
    }
    const message = createAgentMessage(
      "assistant",
      option.id === CONTEXT_COMMON_ID
        ? "Common workspace active. I can combine Rx insights with operational context when needed."
        : "No patient context mode active. Ask for protocol-level guidance and generic consultation plans.",
    )
    acc[option.id] = [{ ...message }]
    return acc
  }, {})
}

function inferPhaseFromMessage(text: string, current: ConsultPhase): ConsultPhase {
  const q = text.toLowerCase()

  if (q.includes("symptom") || q.includes("ddx") || q.includes("diagnosis")) {
    return "symptoms_entered"
  }
  if (q.includes("accept") || q.includes("dx") || q.includes("protocol")) {
    return "dx_accepted"
  }
  if (q.includes("med") || q.includes("advice") || q.includes("translate")) {
    return "meds_written"
  }
  if (q.includes("completeness") || q.includes("final") || q.includes("follow-up")) {
    return "near_complete"
  }
  if (current === "empty" && q.length > 0) {
    return "in_progress"
  }
  return current
}

function inferLensFromPrompt(text: string, fallback: RxTabLens): RxTabLens {
  const q = text.toLowerCase()
  if (q.includes("vital") || q.includes("spo2") || q.includes("bp")) return "vitals"
  if (q.includes("lab") || q.includes("panel") || q.includes("glucose")) return "lab-results"
  if (q.includes("past") || q.includes("last visit") || q.includes("timeline")) return "past-visits"
  if (q.includes("history") || q.includes("allergy") || q.includes("chronic")) return "history"
  if (q.includes("obstetric") || q.includes("anc") || q.includes("preg")) return "obstetric"
  if (q.includes("report") || q.includes("ocr") || q.includes("record")) return "medical-records"
  return fallback
}

function buildSafetyPills({
  isPatientContext,
  hasInteractionAlert,
  summaryData,
}: {
  isPatientContext: boolean
  hasInteractionAlert: boolean
  summaryData?: SmartSummaryData
}): PromptChip[] {
  if (!isPatientContext || !summaryData) return []

  const pills: PromptChip[] = []

  if (hasInteractionAlert) {
    pills.push({
      id: "force-interaction",
      label: "Review drug interaction: Ibuprofen and Telma20",
      tone: "danger",
      force: true,
    })
  }

  if (summaryData.todayVitals?.spo2 && Number(summaryData.todayVitals.spo2.replace("%", "")) < 95) {
    pills.push({ id: "flag-spo2", label: `Review low SpO2: ${summaryData.todayVitals.spo2}`, tone: "warning" })
  }

  if (summaryData.followUpOverdueDays > 0) {
    pills.push({
      id: "flag-fu",
      label: `Show overdue follow-up: ${summaryData.followUpOverdueDays} days`,
      tone: "warning",
    })
  }

  if (summaryData.labFlagCount >= 3) {
    pills.push({
      id: "flag-labs",
      label: `Show ${summaryData.labFlagCount} abnormal lab results`,
      tone: "danger",
    })
  }

  if ((summaryData.dueAlerts?.length ?? 0) > 0) {
    pills.push({
      id: "flag-due",
      label: `Show due alerts: ${summaryData.dueAlerts!.length} items`,
      tone: "warning",
    })
  }

  if ((summaryData.recordAlerts?.length ?? 0) > 0 && summaryData.recordAlerts?.some((line) => line.toLowerCase().includes("high"))) {
    pills.push({
      id: "flag-record",
      label: "Show medical record alerts",
      tone: "warning",
    })
  }

  return pills
}

function buildPromptEngine({
  phase,
  lens,
  isPatientContext,
  hasInteractionAlert,
  hasRxpadSymptoms = false,
  summaryData,
}: {
  phase: ConsultPhase
  lens: RxTabLens
  isPatientContext: boolean
  hasInteractionAlert: boolean
  hasRxpadSymptoms?: boolean
  summaryData?: SmartSummaryData
}): PromptChip[] {
  const safety = buildSafetyPills({ isPatientContext, hasInteractionAlert, summaryData })
  const showcasePrompt: PromptChip = {
    id: "showcase-ui",
    label: "Show UI capabilities",
    tone: "info",
  }

  const phasePrompts = (PHASE_PROMPTS[phase] ?? PHASE_PROMPTS.in_progress).map((label) => ({
    id: `phase-${label}`,
    label,
    tone: "primary" as const,
  }))

  const lensPrompts = (TAB_PROMPTS[lens] ?? TAB_PROMPTS["dr-agent"]).map((label) => ({
    id: `lens-${label}`,
    label,
    tone: "info" as const,
  }))

  const merged = [...safety, ...phasePrompts, ...lensPrompts]
  const uniqueByLabel = Array.from(new Map(merged.map((pill) => [pill.label, pill])).values())
  const limited = uniqueByLabel.slice(0, 4)

  if (isPatientContext && hasRxpadSymptoms && !limited.some((pill) => pill.label === "Generate DDX")) {
    const ddxPrompt: PromptChip = {
      id: "ddx-quick",
      label: "Generate DDX",
      tone: "primary",
      force: true,
    }
    if (limited.length >= 4) {
      limited[limited.length - 1] = ddxPrompt
    } else {
      limited.push(ddxPrompt)
    }
  }

  if (isPatientContext && (phase === "empty" || phase === "in_progress")) {
    if (!limited.some((pill) => pill.label === showcasePrompt.label)) {
      if (limited.length >= 4) {
        limited[limited.length - 1] = showcasePrompt
      } else {
        limited.push(showcasePrompt)
      }
    }
  }

  return limited
}

function deriveBehaviorAwarePrompts({
  text,
  lens,
  isPatientContext,
  summaryData,
}: {
  text: string
  lens: RxTabLens
  isPatientContext: boolean
  summaryData?: SmartSummaryData
}) {
  if (!isPatientContext) {
    return ["Operational snapshot", "Queue and follow-up view", "Cross-patient trends", "Switch to patient chart"]
  }

  const q = text.toLowerCase()
  const contextSpecific: string[] = []

  if (q.includes("lab") || q.includes("report") || q.includes("hba1c")) {
    contextSpecific.push("Flagged labs", "Latest document insights", "Lab comparison")
  }
  if (q.includes("vital") || q.includes("spo2") || q.includes("bp")) {
    contextSpecific.push("Vitals overview", "Concerning vitals", "Trend if relevant")
  }
  if (q.includes("history") || q.includes("allergy") || q.includes("chronic")) {
    contextSpecific.push("Chronic history", "Allergy safety", "Family/lifestyle context")
  }
  if (q.includes("summary") || q.includes("visit")) {
    contextSpecific.push("Patient snapshot", "Last visit essentials", "Current intake notes")
  }

  if ((summaryData?.dueAlerts?.length ?? 0) > 0) {
    contextSpecific.push("Due and overdue items")
  }
  if ((summaryData?.recordAlerts?.length ?? 0) > 0) {
    contextSpecific.push("Medical record highlights")
  }

  const lensDefaults = TAB_PROMPTS[lens] ?? TAB_PROMPTS["dr-agent"]
  const merged = [...contextSpecific, ...lensDefaults, "Patient snapshot", "Abnormal findings"]
  return Array.from(new Set(merged)).slice(0, 4)
}

const SECTION_LENS_MAP: Record<string, RxTabLens> = {
  pastVisits: "past-visits",
  vitals: "vitals",
  history: "history",
  gynec: "obstetric",
  obstetric: "obstetric",
  vaccine: "obstetric",
  growth: "obstetric",
  labResults: "lab-results",
  medicalRecords: "medical-records",
  personalNotes: "medical-records",
  ophthal: "history",
}

function MiniLineGraph({
  values,
  labels,
  tone = "violet",
}: {
  values: number[]
  labels: string[]
  tone?: "violet" | "red" | "teal"
}) {
  const width = 260
  const height = 64
  const top = 8
  const bottom = 48
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(1, max - min)
  const step = values.length > 1 ? (width - 16) / (values.length - 1) : width - 16
  const points = values.map((value, index) => {
    const x = 8 + index * step
    const y = bottom - ((value - min) / span) * (bottom - top)
    return { x, y, value }
  })
  const pathLine = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
  const pathArea = `${pathLine} L ${points[points.length - 1]?.x ?? 8} ${bottom} L ${points[0]?.x ?? 8} ${bottom} Z`

  const stroke = tone === "red" ? "#dc2626" : tone === "teal" ? "#0d9488" : "#4B4AD5"
  const fill = tone === "red" ? "rgba(220,38,38,0.16)" : tone === "teal" ? "rgba(13,148,136,0.16)" : "rgba(75,74,213,0.16)"

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[64px] w-full">
      <path d={pathArea} fill={fill} />
      <path d={pathLine} fill="none" stroke={stroke} strokeWidth="2" />
      {points.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`}>
          <circle cx={point.x} cy={point.y} r="2.8" fill={stroke} />
          <text x={point.x} y={point.y - 6} textAnchor="middle" fontSize="7" fill="#6b7280">
            {point.value}
          </text>
          <text x={point.x} y={58} textAnchor="middle" fontSize="7" fill="#94a3b8">
            {labels[index] ?? `D${index + 1}`}
          </text>
        </g>
      ))}
    </svg>
  )
}

function toneChipClass(tone: PromptChip["tone"]) {
  return ""
}

const AGENT_GRADIENT_CHIP_CLASS =
  "rounded-full border-[0.5px] border-tp-violet-200/75 [background:linear-gradient(135deg,rgba(242,77,182,0.08)_0%,rgba(150,72,254,0.06)_52%,rgba(75,74,213,0.06)_100%)] px-2 py-0.5 text-[10px] font-medium text-tp-violet-700/90"

const AI_OUTPUT_CARD_CLASS =
  "rounded-[12px] border-[0.5px] border-tp-slate-200 bg-[linear-gradient(180deg,rgba(245,243,255,0.52)_0%,rgba(255,255,255,0.98)_22%,#fff_100%)] p-2.5"
const AI_INNER_SURFACE_CLASS = "overflow-hidden rounded-[10px] bg-tp-slate-50/85"
const AI_INNER_HEADER_CLASS = "border-b border-tp-slate-100 px-2 py-1.5"
const AI_INNER_BODY_CLASS = "space-y-1 px-2 py-1 text-[10px] text-tp-slate-600"
const AI_ROW_GRID_CLASS = "group/line grid grid-cols-[9px_72px_minmax(0,1fr)_auto] items-start gap-x-1.5"

const AI_INLINE_PROMPT_CLASS =
  "rounded-full border-[0.5px] border-tp-violet-200/75 [background:linear-gradient(135deg,rgba(242,77,182,0.08)_0%,rgba(150,72,254,0.06)_52%,rgba(75,74,213,0.06)_100%)] px-2 py-0.5 text-[9px] font-medium text-tp-violet-700/90 transition-colors hover:bg-tp-violet-50/70"

const AI_CARD_ICON_WRAP_CLASS =
  "inline-flex size-6 items-center justify-center rounded-md border-[0.5px] border-tp-violet-100 text-tp-violet-600"

const HOVER_COPY_ICON_CLASS =
  "inline-flex size-5 items-center justify-center rounded-[7px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 transition-all hover:border-tp-blue-300 hover:text-tp-blue-600 hover:[&_svg]:stroke-[2.4]"

const AI_SMALL_PRIMARY_CTA_CLASS =
  "inline-flex h-9 items-center justify-center gap-1 rounded-[10px] border-[0.5px] border-tp-blue-500 bg-tp-blue-500 px-3 text-[12px] font-medium text-white transition-colors hover:bg-tp-blue-600 disabled:cursor-not-allowed disabled:border-tp-slate-200 disabled:bg-tp-slate-100 disabled:text-tp-slate-400"

const AI_SMALL_SECONDARY_CTA_CLASS =
  "inline-flex h-9 items-center justify-center gap-1 rounded-[10px] border-[0.5px] border-tp-blue-200 bg-white px-3 text-[12px] font-medium text-tp-blue-700 transition-colors hover:bg-tp-blue-50 disabled:cursor-not-allowed disabled:border-tp-slate-200 disabled:bg-tp-slate-100 disabled:text-tp-slate-400"

function parseTokenDetail(raw: string) {
  const value = raw.trim()
  const match = value.match(/^(.*?)\s*\((.+)\)$/)
  if (!match) return { label: value, detail: "" }
  return { label: match[1].trim(), detail: match[2].trim() }
}

function parseMedicationEntry(raw: string) {
  const value = raw.trim()
  if (!value) return { name: "", detail: "" }
  const scheduleMatch = value.match(/\b(\d-\d-\d-\d|SOS|OD|BD|TDS|HS)\b/i)
  if (!scheduleMatch || scheduleMatch.index === undefined) return { name: value, detail: "" }
  const start = scheduleMatch.index
  const name = value.slice(0, start).trim().replace(/[|,;]+$/, "")
  const detail = value.slice(start).trim()
  return { name: name || value, detail }
}

function deriveFollowUpDate(value: string) {
  const text = value.toLowerCase()
  const dayMatch = text.match(/(\d+)\s*(day|days)/)
  const weekMatch = text.match(/(\d+)\s*(week|weeks)/)
  const monthMatch = text.match(/(\d+)\s*(month|months)/)
  const rangeMatch = text.match(/(\d+)\s*to\s*(\d+)\s*days/)

  let offsetDays: number | null = null
  if (rangeMatch) {
    const from = Number(rangeMatch[1])
    const to = Number(rangeMatch[2])
    if (!Number.isNaN(from) && !Number.isNaN(to)) {
      offsetDays = Math.round((from + to) / 2)
    }
  } else if (dayMatch) {
    const days = Number(dayMatch[1])
    if (!Number.isNaN(days)) offsetDays = days
  } else if (weekMatch) {
    const weeks = Number(weekMatch[1])
    if (!Number.isNaN(weeks)) offsetDays = weeks * 7
  } else if (monthMatch) {
    const months = Number(monthMatch[1])
    if (!Number.isNaN(months)) offsetDays = months * 30
  }

  if (!offsetDays) return ""
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

const VISIT_SUMMARY_ARCHIVE: LastVisitCardData[] = [
  {
    visitDate: "27 Jan'26",
    sections: [
      { short: "Symptoms", value: "Fever (2 days, high), eye redness (2 days)" },
      { short: "Diagnosis", value: "Viral fever, conjunctivitis" },
      { short: "Medication", value: "Telma20 1-0-0-1, Metsmail 500 1-0-0-1" },
      { short: "Lab Tests", value: "CBC, LFT" },
      { short: "Follow-up", value: "2 weeks" },
    ],
    meds: ["Telma20 1-0-0-1", "Metsmail 500 1-0-0-1"],
    copyAllPayload: {
      sourceDateLabel: "Last Visit 27 Jan'26",
      symptoms: ["Fever", "Eye redness"],
      diagnoses: ["Viral fever", "Conjunctivitis"],
      labInvestigations: ["Complete Blood Count", "Liver Function Test"],
      advice: "Hydration, eye hygiene and steam inhalation",
      followUp: "2 weeks",
    },
    copyMedsPayload: {
      sourceDateLabel: "Last Visit Medications 27 Jan'26",
      medications: [
        { medicine: "Telma20 Tablet", unitPerDose: "1 tablet", frequency: "1-0-0-1", when: "Before Food", duration: "4 days", note: "" },
        { medicine: "Metsmail 500 Tablet", unitPerDose: "1 tablet", frequency: "1-0-0-1", when: "After Food", duration: "4 days", note: "" },
      ],
    },
  },
  {
    visitDate: "26 Jan'26",
    sections: [
      { short: "Symptoms", value: "Fever, cough, throat discomfort" },
      { short: "Diagnosis", value: "Upper respiratory infection" },
      { short: "Medication", value: "Azithromycin 500 mg, Paracetamol SOS" },
      { short: "Lab Tests", value: "CBC" },
      { short: "Follow-up", value: "5 days" },
    ],
    meds: ["Azithromycin 500 mg", "Paracetamol SOS"],
    copyAllPayload: {
      sourceDateLabel: "Visit 26 Jan'26",
      symptoms: ["Fever", "Cough"],
      diagnoses: ["Upper respiratory infection"],
      labInvestigations: ["Complete Blood Count"],
      followUp: "5 days",
    },
    copyMedsPayload: {
      sourceDateLabel: "Visit Medications 26 Jan'26",
      medications: [
        { medicine: "Azithromycin 500 mg", unitPerDose: "1 tablet", frequency: "1-0-0", when: "After Food", duration: "3 days", note: "" },
        { medicine: "Paracetamol 650 mg", unitPerDose: "1 tablet", frequency: "SOS", when: "After Food", duration: "3 days", note: "" },
      ],
    },
  },
  {
    visitDate: "24 Jan'26",
    sections: [
      { short: "Symptoms", value: "Intermittent fever, body pain" },
      { short: "Diagnosis", value: "Viral syndrome" },
      { short: "Medication", value: "Paracetamol SOS, hydration advice" },
      { short: "Lab Tests", value: "Not advised" },
      { short: "Follow-up", value: "As needed" },
    ],
    meds: ["Paracetamol SOS"],
    copyAllPayload: {
      sourceDateLabel: "Visit 24 Jan'26",
      symptoms: ["Intermittent fever", "Body pain"],
      diagnoses: ["Viral syndrome"],
      advice: "Hydration and rest",
    },
    copyMedsPayload: {
      sourceDateLabel: "Visit Medications 24 Jan'26",
      medications: [
        { medicine: "Paracetamol 650 mg", unitPerDose: "1 tablet", frequency: "SOS", when: "After Food", duration: "2 days", note: "" },
      ],
    },
  },
]

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term))
}

function normalizeScenarioPrompt(rawPrompt: string) {
  const prompt = rawPrompt.trim().toLowerCase()
  if (!prompt) return rawPrompt

  if (
    includesAny(prompt, [
      "patient snapshot",
      "smart summary",
      "quick summary",
    ])
  ) {
    return "patient snapshot summary"
  }

  if (
    includesAny(prompt, [
      "current intake",
      "intake notes",
      "review symptoms",
      "review medical history",
      "patient-provided symptoms",
      "patient-provided medical history",
    ])
  ) {
    return "current intake notes"
  }

  if (
    includesAny(prompt, [
      "last visit compare",
      "compare past visit",
      "compare previous visit",
      "compare last visit",
      "previous comparison",
    ])
  ) {
    return "compare visit"
  }

  if (
    includesAny(prompt, [
      "last visit essentials",
      "last visit",
      "what happened last",
      "visit review",
    ])
  ) {
    return "last visit summary"
  }

  if (
    includesAny(prompt, [
      "abnormal findings",
      "abnormal labs",
      "flagged labs",
      "latest panel focus",
      "lab focus",
      "latest lab panel",
      "lab comparison",
      "compare lab panel",
      "compare lab panels",
      "medical record highlights",
      "medical record alerts",
      "abnormal ocr findings",
      "show abnormal labs",
    ])
  ) {
    return "abnormal findings lab panel"
  }

  if (
    includesAny(prompt, [
      "vitals overview",
      "vitals review",
      "concerning vitals",
      "trend if relevant",
      "trend view",
      "vital trends",
      "vitals trend",
    ])
  ) {
    return "vitals trend"
  }

  if (
    includesAny(prompt, [
      "generate ddx",
      "differential",
      "symptom triage",
      "severity triage",
      "analyze symptom",
      "worsened findings",
      "red-flag screening",
    ])
  ) {
    return "differential diagnosis"
  }

  if (
    includesAny(prompt, [
      "investigations",
      "investigation bundle",
      "suggest investigations",
      "test bundle",
      "follow-up lab suggestion",
      "initial workup",
    ])
  ) {
    return "investigation bundle"
  }

  if (
    includesAny(prompt, [
      "medication plan",
      "protocol meds",
      "protocol cascade",
      "generate cascade",
    ])
  ) {
    return "protocol cascade"
  }

  if (
    includesAny(prompt, [
      "medication safety",
      "allergy safety",
      "check allergies",
      "drug interaction",
      "dose and duration review",
      "review:",
      "suggest safe alternatives",
      "view allergy history",
    ])
  ) {
    return "allergy safety"
  }

  if (
    includesAny(prompt, [
      "advice draft",
      "refine advice",
      "advice and counseling draft",
      "advice and instructions",
    ])
  ) {
    return "advice bundle"
  }

  if (includesAny(prompt, ["translate advice", "copy hindi", "copy kannada", "copy telugu"])) {
    return "translate advice hindi"
  }

  if (
    includesAny(prompt, [
      "follow-up plan",
      "follow up plan",
      "follow-up planning",
      "care-plan reminders",
      "schedule appointment",
      "appointment reminder",
      "due alerts",
      "overdue follow-up",
      "due and overdue items",
    ])
  ) {
    return "follow-up plan"
  }

  if (
    includesAny(prompt, [
      "final checklist",
      "completeness check",
      "documentation completeness",
      "incomplete sections",
    ])
  ) {
    return "completeness check"
  }

  if (includesAny(prompt, ["recurrence check", "recurrence"])) {
    return "how many fever recurrences"
  }

  if (
    includesAny(prompt, [
      "cycle and lmp highlights",
      "gynec history focus",
      "gynec highlights",
      "cycle review",
      "due checks",
      "due and overdue checks",
    ])
  ) {
    return "gynec summary"
  }

  if (
    includesAny(prompt, [
      "obstetric highlights",
      "anc due items",
      "pregnancy risk checks",
      "risk checks",
      "immunization due view",
    ])
  ) {
    return "obstetric summary"
  }

  if (includesAny(prompt, ["visual symptom focus", "last ophthal findings"])) {
    return "ophthal summary"
  }

  if (
    includesAny(prompt, [
      "growth and vaccine review",
      "pediatric symptom triage",
      "development and feeding checks",
      "growth chart",
      "pediatric risk cues",
      "due vaccine checks",
      "vaccine due list",
      "overdue vaccine alerts",
    ])
  ) {
    return "pediatric summary"
  }

  if (
    includesAny(prompt, [
      "chronic history",
      "family/lifestyle context",
      "latest document insights",
      "older record lookup",
      "review latest medication",
      "medical history for this visit",
      "patient-provided medical history",
    ])
  ) {
    return "history insights"
  }

  if (
    includesAny(prompt, [
      "operational snapshot",
      "queue and follow-up view",
      "cross-patient trends",
      "switch to patient chart",
    ])
  ) {
    return "operational snapshot"
  }

  if (
    includesAny(prompt, [
      "show ui capabilities",
      "show ui",
      "dynamic ui",
      "showcase",
      "generate list view variant",
      "generate form variant",
      "input form variant",
    ])
  ) {
    return "ui capabilities showcase"
  }

  return rawPrompt
}

function buildRxAgentReply({
  prompt,
  patient,
  phase,
  lens,
}: {
  prompt: string
  patient: AgentPatientContext
  phase: ConsultPhase
  lens: RxTabLens
}): {
  reply: string
  output?: AgentDynamicOutput
  rxOutput?: RxAgentOutput
  nextPhase?: ConsultPhase
  raisesInteraction?: boolean
} {
  const normalizedPrompt = normalizeScenarioPrompt(prompt)
  const q = normalizedPrompt.toLowerCase()
  const rawQ = prompt.toLowerCase()
  const summaryData = SMART_SUMMARY_BY_CONTEXT[patient.id] ?? SMART_SUMMARY_BY_CONTEXT[CONTEXT_PATIENT_ID]

  if (q.includes("weather") || q.includes("billing")) {
    return {
      reply:
        "I can help with this patient's clinical context only. Try: patient summary, lab trends, or differential review.",
      nextPhase: phase,
    }
  }

  if (q.includes("operational snapshot")) {
    return {
      reply: "Operational prompts are available in common workspace. In patient context I can still summarize patient-linked follow-up priorities.",
      nextPhase: "in_progress",
      output: {
        type: "generic",
        title: "Operational Snapshot",
        subtitle: "Patient-linked operational cues",
        bullets: [
          "Today follow-up due status: active review needed",
          "Abnormal lab queue can be triaged from this chart",
          "Switch to common workspace for queue-level analytics",
        ],
        actions: ["Patient snapshot", "Switch to patient chart"],
      },
    }
  }

  if (q.includes("patient snapshot")) {
    return {
      reply: "Patient smart snapshot refreshed for quick pre-consult review.",
      nextPhase: "in_progress",
      output: {
        type: "summary",
        title: "Patient Smart Snapshot",
        subtitle: "Current context + previous visit essentials",
        bullets: [
          `Last visit: ${summaryData.lastVisit?.date ?? "Not available"} · ${summaryData.lastVisit?.diagnosis ?? "No diagnosis on file"}`,
          `Chronic conditions: ${(summaryData.chronicConditions ?? ["None reported"]).join(", ")}`,
          `Flagged labs: ${summaryData.labFlagCount} · Due alerts: ${summaryData.dueAlerts?.length ?? 0}`,
        ],
        actions: ["Last visit essentials", "Abnormal findings", "Generate DDX"],
      },
    }
  }

  if (q.includes("current intake")) {
    return {
      reply: "Current intake is structured and ready to be copied section-wise into RxPad.",
      nextPhase: "in_progress",
      output: {
        type: "summary",
        title: "Current Intake Notes",
        subtitle: "Patient-reported symptoms + medical history",
        bullets: [
          "Symptoms are already normalized into duration/severity format",
          "Medical history is grouped by condition, allergy, and family context",
          "Use row-level copy for precise insertion into RxPad sections",
        ],
        actions: ["Review symptoms", "Review medical history", "Generate DDX"],
      },
    }
  }

  if (q.includes("document") || q.includes("upload") || q.includes("ocr") || q.includes("report processed")) {
    return {
      reply: "Document processed. Found CBC panel with 2 flagged values requiring attention.",
      nextPhase: "in_progress",
      rxOutput: {
        kind: "ocr_report",
        title: "CBC · Auto-OCR · 2 flagged",
        reportType: "pathology",
        parameters: [
          { name: "Hemoglobin", value: "13.1", unit: "g/dL", reference: "13–17", flag: "normal" },
          { name: "WBC", value: "14,200", unit: "cells/mm³", reference: "4K–11K", flag: "high" },
          { name: "Platelets", value: "2.4L", unit: "/mm³", reference: "1.5–4.0L", flag: "normal" },
          { name: "ESR", value: "28", unit: "mm/hr", reference: "0–20", flag: "high" },
          { name: "RBC", value: "4.8", unit: "M/µL", reference: "4.5–5.5", flag: "normal" },
        ],
        insight: "WBC↑ + ESR↑ → active infection/inflammation markers",
        originalFileName: "CBC_report.pdf",
        copyPayload: {
          sourceDateLabel: "OCR: CBC report",
          targetSection: "labResults",
          labInvestigations: ["CBC"],
        },
      },
    }
  }

  if (q.includes("gynec summary")) {
    return {
      reply: "Gynec-focused snapshot prepared from available structured history.",
      nextPhase: "in_progress",
      output: {
        type: "summary",
        title: "Gynec Focus",
        subtitle: "Cycle context and due checks",
        bullets: [
          "LMP and cycle profile are prioritized for quick review",
          "Pain, flow pattern, and lifecycle changes are highlighted",
          "Due/overdue checks are surfaced for immediate action",
        ],
        actions: ["Patient snapshot", "Abnormal findings", "Follow-up plan"],
      },
    }
  }

  if (q.includes("obstetric summary")) {
    return {
      reply: "Obstetric summary prepared with ANC and pregnancy-priority context.",
      nextPhase: "in_progress",
      output: {
        type: "summary",
        title: "Obstetric Focus",
        subtitle: "LMP/EDD, ANC, and risk cues",
        bullets: [
          "Patient info + GPLAE are prioritized in first read",
          "ANC due items and immunization blockers are surfaced",
          "Recent examination findings are grouped by date",
        ],
        actions: ["ANC due items", "Follow-up plan", "Abnormal findings"],
      },
    }
  }

  if (q.includes("ophthal summary")) {
    return {
      reply: "Ophthal-focused summary prepared with most relevant visual findings.",
      nextPhase: "in_progress",
      output: {
        type: "summary",
        title: "Ophthal Focus",
        subtitle: "Visual acuity and red-flag cues",
        bullets: [
          "Visual acuity and lensometry trends are condensed for quick read",
          "Slit-lamp and fundus findings are summarized by severity",
          "Red-flag screening is prioritized before medication decisions",
        ],
        actions: ["Last visit essentials", "Medication safety", "Follow-up plan"],
      },
    }
  }

  if (q.includes("pediatric summary")) {
    return {
      reply: "Pediatric summary prepared with growth, vaccine, and symptom context.",
      nextPhase: "in_progress",
      output: {
        type: "summary",
        title: "Pediatric Focus",
        subtitle: "Growth and immunization overview",
        bullets: [
          "Growth milestones and trend concerns are highlighted first",
          "Due and overdue vaccines are grouped by urgency",
          "Parent-reported symptoms are structured for fast clinical intake",
        ],
        actions: ["Growth chart", "Vaccine due list", "Follow-up planning"],
      },
    }
  }

  if (q.includes("history insights")) {
    return {
      reply: "History insights are prepared with chronic, allergy, and lifestyle context.",
      nextPhase: "in_progress",
      output: {
        type: "summary",
        title: "History Insights",
        subtitle: "Chronic + allergy + family/lifestyle context",
        bullets: [
          `Chronic issues: ${(summaryData.chronicConditions ?? ["None reported"]).join(", ")}`,
          `Allergies: ${(summaryData.allergies ?? ["No known allergy"]).join(", ")}`,
          `Lifestyle/family cues: ${[...(summaryData.lifestyleNotes ?? []), ...(summaryData.familyHistory ?? [])].slice(0, 2).join(" | ") || "No notable context"}`,
        ],
        actions: ["Medication safety", "Abnormal findings", "Patient snapshot"],
      },
    }
  }

  if (q.includes("allergy safety")) {
    return {
      reply: "Safety check completed. Allergy and interaction-sensitive suggestions are highlighted.",
      nextPhase: "in_progress",
      output: {
        type: "generic",
        title: "Drug Allergy Alert",
        subtitle: "Patient safety check",
        bullets: [
          `${patient.name} has documented allergy context: ${(summaryData.allergies ?? ["No known allergy"]).join(", ")}`,
          "Avoid penicillin-class choices if uncertain allergy severity is documented",
          "Prefer safe alternatives and confirm before adding to final Rx",
        ],
        actions: ["View allergy history", "Suggest safe alternatives", "Medication plan"],
      },
    }
  }

  if (q.includes("show ui") || q.includes("ui capabilities") || q.includes("dynamic ui") || q.includes("showcase")) {
    return {
      reply: "Here is a compact capability showcase card with multiple dynamic UI patterns.",
      nextPhase: "in_progress",
      rxOutput: {
        kind: "ui_showcase",
      },
    }
  }

  if (rawQ.includes("visit summary")) {
    const requestedVisits = VISIT_SUMMARY_ARCHIVE.filter((visit) =>
      rawQ.includes(visit.visitDate.toLowerCase()),
    )
    if (requestedVisits.length === 0) {
      return {
        reply: "Select the visit dates you want to review.",
        nextPhase: "in_progress",
        rxOutput: {
          kind: "visit_selector",
          dates: VISIT_SUMMARY_ARCHIVE.map((visit) => visit.visitDate),
        },
      }
    }

    return {
      reply: `Loaded ${requestedVisits.length} visit ${requestedVisits.length > 1 ? "summaries" : "summary"}.`,
      nextPhase: "in_progress",
      rxOutput: {
        kind: "multi_last_visit",
        visits: requestedVisits,
      },
    }
  }

  if (q.includes("last visit") || q.includes("what happened last")) {
    return {
      reply: "Here is the structured last-visit summary with copy actions.",
      nextPhase: "in_progress",
      rxOutput: {
        kind: "last_visit",
        data: VISIT_SUMMARY_ARCHIVE[0],
      },
    }
  }

  if (q.includes("compare") && q.includes("visit")) {
    return {
      reply: "Comparison between current and last visit is ready.",
      nextPhase: "in_progress",
      rxOutput: {
        kind: "visit_compare",
        title: "Current vs Last Visit",
        currentLabel: "Current consultation",
        previousLabel: VISIT_SUMMARY_ARCHIVE[0].visitDate,
        rows: [
          {
            section: "Symptoms",
            current: "Fever (3 days | high | evening spikes), dry cough (2 days | moderate)",
            previous: "Fever (2 days | high), eye redness (2 days | moderate)",
            status: "worse",
          },
          {
            section: "Vitals",
            current: "BP: 126/80 | Pulse: 76/min | SpO2: 93% ↓ | Temp: 99.4 F",
            previous: "BP: 120/75 | Pulse: 68/min | SpO2: 95% | Temp: 98.8 F",
            status: "worse",
          },
          {
            section: "Medications",
            current: "Paracetamol 650 mg, Levocetirizine 5 mg",
            previous: "Telma20, Metsmail 500",
            status: "same",
          },
          {
            section: "Lab findings",
            current: "TSH ↑ 5.2, Vit D ↓ 20",
            previous: "CBC and LFT suggested",
            status: "worse",
          },
        ],
        copyPayload: {
          sourceDateLabel: "Current vs last visit comparison",
          additionalNotes:
            "Symptoms worsened with respiratory profile; SpO2 trend lower than previous visit; thyroid and vitamin deficits need follow-up.",
        },
      },
    }
  }

  if (q.includes("abnormal finding") || q.includes("abnormal findings")) {
    return {
      reply: "Abnormal findings are grouped with quick actions.",
      nextPhase: "in_progress",
      rxOutput: {
        kind: "abnormal_findings",
        title: "Abnormal Findings",
        subtitle: "Prioritized for immediate review",
        findings: [
          { label: "SpO2 93%", detail: "Below threshold on current visit", severity: "high", selected: true },
          { label: "TSH 5.2 ↑", detail: "Thyroid panel out of range", severity: "moderate" },
          { label: "Vitamin D 20 ↓", detail: "Deficiency pattern in latest panel", severity: "moderate" },
          { label: "Follow-up overdue", detail: "Review delay by 5 days", severity: "low" },
        ],
        copyPayload: {
          sourceDateLabel: "Abnormal findings snapshot",
          additionalNotes: "SpO2 low, thyroid profile abnormal, vitamin D low, follow-up overdue.",
        },
      },
    }
  }

  if (q.includes("trend") || q.includes("vital") || q.includes("spo2") || lens === "vitals") {
    return {
      reply: "Vitals trend is ready. I highlighted what needs immediate attention.",
      nextPhase: phase === "empty" ? "in_progress" : phase,
      rxOutput: {
        kind: "vitals_trend",
        summary: "SpO2 trend is drifting low while pulse is improving.",
        trends: [
          {
            label: "SpO2",
            latest: "93%",
            values: [97, 96, 94, 93],
            labels: ["20 Jan", "22 Jan", "24 Jan", "27 Jan"],
            tone: "critical",
          },
          {
            label: "Pulse",
            latest: "68/min",
            values: [94, 88, 76, 68],
            labels: ["20 Jan", "22 Jan", "24 Jan", "27 Jan"],
            tone: "ok",
          },
        ],
      },
    }
  }

  if (q.includes("lab") || q.includes("panel") || lens === "lab-results") {
    return {
      reply: "Lab panel loaded with flagged-first view and a one-tap copy action.",
      nextPhase: phase,
      rxOutput: {
        kind: "lab_panel",
        panelDate: "24 Jan'26",
        flagged: [
          { name: "TSH", value: "5.2", flag: "high" },
          { name: "LDL", value: "130", flag: "high" },
          { name: "Vit D", value: "20", flag: "low" },
          { name: "Glucose", value: "116", flag: "high" },
        ],
        hiddenNormalCount: 8,
        insight: "Thyroid and metabolic profile need follow-up correlation with current symptoms.",
        copyPayload: {
          sourceDateLabel: "Lab panel (AI extracted)",
          labInvestigations: ["TSH", "Lipid Profile", "Vitamin D", "Fasting Glucose"],
        },
      },
    }
  }

  if (q.includes("ddx") || q.includes("differential") || q.includes("diagnosis")) {
    return {
      reply: "Differential diagnosis grouped by clinical probability is ready.",
      nextPhase: "symptoms_entered",
      rxOutput: {
        kind: "ddx",
        context: "Fever + dry cough + sore throat + dust allergy",
        options: [
          {
            name: "Community-acquired Pneumonia",
            confidence: 88,
            rationale: "Persistent fever with chest symptoms; cannot miss escalation risk.",
            bucket: "cant_miss",
            selected: true,
          },
          {
            name: "Pulmonary Embolism",
            confidence: 64,
            rationale: "Less likely but included due to chest discomfort red-flag profile.",
            bucket: "cant_miss",
          },
          {
            name: "Acute Upper Respiratory Tract Infection",
            confidence: 76,
            rationale: "Fits acute timeline with sore throat and mild systemic signs.",
            bucket: "most_likely",
          },
          {
            name: "Acute Bronchitis",
            confidence: 74,
            rationale: "Cough-led presentation with low-grade inflammatory picture.",
            bucket: "most_likely",
            selected: true,
          },
          {
            name: "Viral Pharyngitis",
            confidence: 68,
            rationale: "Throat-led variant with constitutional symptoms.",
            bucket: "most_likely",
          },
          {
            name: "Allergic Rhinitis with Post-nasal Drip",
            confidence: 55,
            rationale: "Allergy history supports secondary respiratory irritation.",
            bucket: "extended",
          },
          {
            name: "GERD with Laryngopharyngeal Reflux",
            confidence: 41,
            rationale: "Extended differential for throat irritation without progression.",
            bucket: "extended",
          },
        ],
      },
    }
  }

  if (q.includes("investigation") || q.includes("inv ") || q.includes("test bundle")) {
    return {
      reply: "Suggested investigations prepared. Select and add directly to RxPad.",
      nextPhase: "dx_accepted",
      rxOutput: {
        kind: "investigation_bundle",
        title: "Suggested Investigations",
        subtitle: "Baseline + escalation checks",
        items: [
          { label: "CBC with ESR", selected: true },
          { label: "CRP (quantitative)", selected: true },
          { label: "Chest X-ray PA view" },
          { label: "Sputum culture if no improvement in 48h" },
        ],
        copyPayload: {
          sourceDateLabel: "Investigation bundle",
          labInvestigations: ["CBC with ESR", "CRP (quantitative)", "Chest X-ray PA view", "Sputum culture"],
        },
      },
    }
  }

  if (
    (q.includes("advice") || q.includes("instructions")) &&
    !q.includes("translate") &&
    !q.includes("hindi") &&
    !q.includes("kannada") &&
    !q.includes("telugu")
  ) {
    return {
      reply: "Advice and instructions are ready. Pick lines and add to Rx advice.",
      nextPhase: "meds_written",
      rxOutput: {
        kind: "advice_bundle",
        title: "Advice and Instructions",
        subtitle: "Auto-generated from diagnosis",
        items: [
          { label: "Adequate hydration — 2.5 to 3L water daily", selected: true },
          { label: "Steam inhalation twice daily", selected: true },
          { label: "Avoid cold beverages and dust exposure" },
          { label: "Light diet, avoid oily and spicy food" },
          { label: "Monitor temperature — revisit if fever > 101°F persists 48h" },
        ],
        shareMessage: "Patient-ready advice is prepared for sharing.",
        copyPayload: {
          sourceDateLabel: "Advice bundle",
          advice:
            "Adequate hydration (2.5 to 3L/day), steam inhalation twice daily, avoid cold beverages and dust exposure, light diet, monitor temperature and revisit if fever > 101°F persists 48h.",
        },
      },
    }
  }

  if (q.includes("follow-up") || q.includes("follow up") || q.includes("revisit")) {
    return {
      reply: "Follow-up plan generated with recall checkpoints.",
      nextPhase: "near_complete",
      rxOutput: {
        kind: "follow_up_bundle",
        title: "Follow-up Plan",
        subtitle: "Auto-structured care plan",
        items: [
          { label: "Review in 3–5 days if symptoms persist", selected: true },
          { label: "Repeat CBC after 5 days of antibiotics", selected: true },
          { label: "Immediate revisit if high fever, breathlessness, or chest pain" },
        ],
        followUpValue: "3 to 5 days",
        copyPayload: {
          sourceDateLabel: "Follow-up plan",
          followUp: "Review in 3 to 5 days; immediate revisit if high fever, breathlessness, or chest pain.",
          labInvestigations: ["Repeat CBC after 5 days of antibiotics"],
        },
      },
    }
  }

  if (q.includes("protocol") || q.includes("cascade")) {
    const raisesInteraction = q.includes("ibuprofen") || q.includes("painkiller")
    return {
      reply: "Protocol cascade is ready for meds, investigations, advice, and follow-up.",
      nextPhase: "dx_accepted",
      raisesInteraction,
      rxOutput: {
        kind: "cascade",
        diagnosis: "Viral Fever",
        meds: ["Paracetamol 650 mg SOS", "Levocetirizine 5 mg HS", "Ibuprofen 400 mg BD"],
        investigations: ["CBC", "CRP", "Urine Routine"],
        advice: "Hydration, eye hygiene, steam inhalation and red-flag counseling.",
        followUp: "2 weeks",
        copyPayload: {
          sourceDateLabel: "DDX protocol cascade",
          diagnoses: ["Viral Fever"],
          medications: [
            {
              medicine: "Paracetamol 650",
              unitPerDose: "1 tablet",
              frequency: "1-0-0-1",
              when: "After Food",
              duration: "3 days",
              note: "SOS for fever",
            },
            {
              medicine: "Levocetirizine 5",
              unitPerDose: "1 tablet",
              frequency: "0-0-0-1",
              when: "After Food",
              duration: "5 days",
              note: "At bedtime",
            },
            {
              medicine: "Ibuprofen 400",
              unitPerDose: "1 tablet",
              frequency: "1-0-1",
              when: "After Food",
              duration: "3 days",
              note: "Avoid if gastric irritation",
            },
          ],
          labInvestigations: ["Complete Blood Count", "CRP", "Urine Routine"],
          advice: "Hydration, eye hygiene, steam inhalation and red-flag counseling.",
          followUp: "2 weeks",
        },
      },
    }
  }

  if (q.includes("translate") || q.includes("hindi") || q.includes("kannada") || q.includes("telugu")) {
    return {
      reply: "Advice translation prepared. You can copy directly into Rx advice.",
      nextPhase: "meds_written",
      rxOutput: {
        kind: "translation",
        source: "Hydration and eye hygiene. Return if fever persists over 48 hours.",
        language: q.includes("kannada") ? "Kannada" : q.includes("telugu") ? "Telugu" : "Hindi",
        translated:
          q.includes("kannada")
            ? "ಹೈಡ್ರೇಶನ್ ಕಾಯ್ದುಕೊಳ್ಳಿ. ಕಣ್ಣಿನ ಸ್ವಚ್ಛತೆ ಪಾಲಿಸಿ. 48 ಗಂಟೆಗಳಿಗೂ ಜ್ವರ ಮುಂದುವರಿದರೆ ಮರಳಿ ಬನ್ನಿ."
            : q.includes("telugu")
              ? "నీరు బాగా తాగండి. కళ్ల పరిశుభ్రత పాటించండి. 48 గంటల తర్వాత కూడా జ్వరం ఉంటే మళ్లీ రావాలి."
              : "पानी पर्याप्त लें। आँखों की स्वच्छता रखें। 48 घंटे से ज़्यादा बुखार रहे तो दोबारा आएँ।",
        advicePayload: {
          sourceDateLabel: "AI translated advice",
          advice:
            q.includes("kannada")
              ? "ಹೈಡ್ರೇಶನ್ ಕಾಯ್ದುಕೊಳ್ಳಿ. ಕಣ್ಣಿನ ಸ್ವಚ್ಛತೆ ಪಾಲಿಸಿ. 48 ಗಂಟೆಗಳಿಗೂ ಜ್ವರ ಮುಂದುವರಿದರೆ ಮರಳಿ ಬನ್ನಿ."
              : q.includes("telugu")
                ? "నీరు బాగా తాగండి. కళ్ల పరిశుభ్రత పాటించండి. 48 గంటల తర్వాత కూడా జ్వరం ఉంటే మళ్లీ రావాలి."
                : "पानी पर्याप्त लें। आँखों की स्वच्छता रखें। 48 घंटे से ज़्यादा बुखार रहे तो दोबारा आएँ।",
        },
      },
    }
  }

  if (q.includes("completeness") || q.includes("final checklist") || q.includes("missing section")) {
    return {
      reply: "Documentation completeness check is ready.",
      nextPhase: "near_complete",
      rxOutput: {
        kind: "completeness",
        filled: ["Symptoms", "Diagnosis", "Medications", "Lab Investigations"],
        missing: ["Advice", "Follow-up"],
        completenessPercent: 71,
      },
    }
  }

  if (q.includes("steroid")) {
    return {
      reply: "I checked medication history for steroid-class exposure.",
      rxOutput: {
        kind: "med_history",
        className: "Steroid",
        matches: [
          { date: "14 Dec'25", medicine: "Prednisolone 10 mg", duration: "5 days" },
          { date: "02 Aug'25", medicine: "Methylpred 8 mg", duration: "3 days" },
        ],
      },
    }
  }

  if (q.includes("how many") && q.includes("fever")) {
    return {
      reply: "Recurrence pattern computed from past visits.",
      rxOutput: {
        kind: "recurrence",
        condition: "Fever",
        occurrences: 4,
        timeline: [
          { date: "27 Jan'26", detail: "Fever + eye redness" },
          { date: "26 Jan'26", detail: "Fever + cough" },
          { date: "14 Dec'25", detail: "High fever" },
          { date: "18 Oct'25", detail: "Intermittent fever" },
        ],
      },
    }
  }

  if (q.includes("annual") || q.includes("routine") || q.includes("screening")) {
    return {
      reply: "Annual screening panel generated with priority tags.",
      rxOutput: {
        kind: "annual_panel",
        title: "Annual health screening panel",
        tests: [
          { test: "HbA1c", priority: "high" },
          { test: "Lipid Profile", priority: "high" },
          { test: "TSH", priority: "medium" },
          { test: "Vitamin D", priority: "medium" },
          { test: "Urine Routine", priority: "low" },
        ],
        copyPayload: {
          sourceDateLabel: "Annual panel suggestion",
          labInvestigations: ["HbA1c", "Lipid Profile", "TSH", "Vitamin D", "Urine Routine"],
        },
      },
    }
  }

  const fallback = buildAgentMockReply(prompt, patient)
  return {
    reply: fallback.reply,
    output: fallback.output,
    nextPhase: inferPhaseFromMessage(prompt, phase),
  }
}

function inferCopyPayloadFromLine(line: string): RxPadCopyPayload {
  const value = line.trim()
  const lower = value.toLowerCase()

  if (lower.includes("bp") || lower.includes("pulse") || lower.includes("spo2") || lower.includes("temperature")) {
    return {
      sourceDateLabel: "AI insight",
      targetSection: "vitals",
      additionalNotes: value,
    }
  }
  if (lower.includes("lab") || lower.includes("hba1c") || lower.includes("tsh") || lower.includes("glucose")) {
    return {
      sourceDateLabel: "AI insight",
      targetSection: "labResults",
      labInvestigations: [value],
    }
  }
  if (lower.includes("allergy") || lower.includes("chronic") || lower.includes("history")) {
    return {
      sourceDateLabel: "AI insight",
      targetSection: "history",
      additionalNotes: value,
    }
  }
  return {
    sourceDateLabel: "AI insight",
    targetSection: "rxpad",
    additionalNotes: value,
  }
}

function DynamicOutputCard({
  output,
  onCopy,
}: {
  output: AgentDynamicOutput
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)
  const copyAllNotes = [
    ...output.bullets,
    ...(output.clickableItems ?? []),
    ...output.actions,
  ]
    .filter(Boolean)
    .join(" | ")

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-tp-slate-700">{output.title}</p>
            <p className="truncate text-[10px] text-tp-slate-500">{output.subtitle}</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[216px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(
                    {
                      sourceDateLabel: output.title,
                      targetSection: "history",
                      additionalNotes: copyAllNotes,
                    },
                    `${output.title} copied to RxPad`,
                  )
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy complete card to RxPad"
                aria-label="Copy complete card to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy complete card to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mb-2 space-y-1">
        {output.bullets.map((point) => (
          <div key={point} className="group/point grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5 text-[10px] text-tp-slate-700">
            <span className="text-tp-slate-400">•</span>
            <span className="leading-4">{point}</span>
            <button
              type="button"
              onClick={() => onCopy(inferCopyPayloadFromLine(point), "Copied to RxPad")}
              className={cn("opacity-0 transition-opacity group-hover/point:opacity-100", HOVER_COPY_ICON_CLASS)}
              title="Copy this item to RxPad"
              aria-label="Copy this item to RxPad"
            >
              <Copy size={10} />
            </button>
          </div>
        ))}
      </div>

      {output.chart && output.chart.values.length > 0 && (
        <div className="mb-2 rounded-[10px] bg-white/72 p-2">
          <MiniLineGraph values={output.chart.values} labels={output.chart.labels} tone="violet" />
        </div>
      )}

      {output.clickableItems && output.clickableItems.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {output.clickableItems.map((item) => (
            <div key={item} className="group/item inline-flex items-center gap-1">
              <button type="button" className="rounded-full border border-tp-slate-200 bg-tp-slate-50/80 px-2 py-0.5 text-[9px] font-medium text-tp-slate-600">
                {item}
              </button>
              <button
                type="button"
                onClick={() => onCopy(inferCopyPayloadFromLine(item), "Copied to RxPad")}
                className={cn("opacity-0 transition-opacity group-hover/item:opacity-100", HOVER_COPY_ICON_CLASS)}
                title="Copy this item to RxPad"
                aria-label="Copy this item to RxPad"
              >
                <Copy size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto pb-0.5">
        <div className="inline-flex min-w-max gap-1">
          {output.actions.slice(0, 4).map((action) => (
          <button key={action} type="button" className={AGENT_GRADIENT_CHIP_CLASS}>
            {action}
          </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function LastVisitCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: LastVisitCardData
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-tp-slate-800">Last Visit Summary · {data.visitDate}</p>
        <div className="relative flex items-center gap-1.5">
          <span className="rounded-full border border-tp-slate-200 bg-tp-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-tp-slate-600">Past Visits</span>
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[210px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(data.copyAllPayload, "Complete visit Rx copied to RxPad")
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy complete Rx to RxPad"
                aria-label="Copy complete Rx to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy complete Rx to RxPad
              </button>
              <button
                type="button"
                onClick={() => {
                  onCopy(data.copyMedsPayload, "Medications copied to RxPad")
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy medications to RxPad"
                aria-label="Copy medications to RxPad"
              >
                <Pill size={11} className="text-tp-blue-600" />
                Copy medications to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-1 text-[10px] text-tp-slate-600">
        {data.sections.map((section) => {
          const lower = section.short.toLowerCase()
          const sectionItems = section.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
          const copyPayload: RxPadCopyPayload =
            lower.includes("symptom")
              ? { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", symptoms: sectionItems }
              : lower.includes("diagnosis")
                ? { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", diagnoses: sectionItems }
                : lower.includes("medication")
                  ? {
                      sourceDateLabel: `Visit ${data.visitDate}`,
                      targetSection: "rxpad",
                      medications: sectionItems.map((med) => ({
                        medicine: med.trim(),
                        unitPerDose: "-",
                        frequency: "-",
                        when: "-",
                        duration: "-",
                        note: "",
                      })),
                    }
                  : lower.includes("lab")
                    ? { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "labResults", labInvestigations: sectionItems }
                    : lower.includes("follow")
                      ? { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", followUp: section.value }
                      : { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "history", additionalNotes: `${section.short}: ${section.value}` }

          return (
            <div key={section.short} className="group/row grid grid-cols-[9px_72px_minmax(0,1fr)_auto] items-start gap-x-1.5">
              <span className="text-tp-slate-400">•</span>
              <span className="text-tp-slate-500">{section.short}</span>
              <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                {lower.includes("medication")
                  ? sectionItems.map((entry, index) => {
                      const med = parseMedicationEntry(entry)
                      return (
                        <span key={`${med.name}-${index}`}>
                          <span className="font-semibold text-tp-slate-700">{med.name || entry}</span>
                          {med.detail ? (
                            <>
                              <span className="text-tp-slate-400"> (</span>
                              <span className="text-tp-slate-500">{med.detail}</span>
                              <span className="text-tp-slate-400">)</span>
                            </>
                          ) : null}
                          {index < sectionItems.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                        </span>
                      )
                    })
                    : lower.includes("symptom")
                    ? sectionItems.map((entry, index) => {
                        const token = parseTokenDetail(entry)
                        return (
                          <span key={`${token.label}-${index}`}>
                            <span className="font-semibold text-tp-slate-700">{token.label}</span>
                            {token.detail ? (
                              <>
                                <span className="text-tp-slate-400"> (</span>
                                <span className="text-tp-slate-500">{token.detail}</span>
                                <span className="text-tp-slate-400">)</span>
                              </>
                            ) : null}
                            {index < sectionItems.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                          </span>
                        )
                      })
                    : sectionItems.map((entry, index) => (
                        <span key={`${entry}-${index}`}>
                          <span className={cn("font-medium text-tp-slate-700", lower.includes("lab") && "font-semibold")}>{entry}</span>
                          {index < sectionItems.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                        </span>
                      ))}
              </p>
              <button
                type="button"
                onClick={() => onCopy(copyPayload, `${section.short} copied to RxPad`)}
                className={cn("opacity-0 transition-opacity group-hover/row:opacity-100", HOVER_COPY_ICON_CLASS)}
                title={`Copy ${section.short} to RxPad`}
                aria-label={`Copy ${section.short} to RxPad`}
              >
                <Copy size={10} />
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Compare previous visit with current context")} className={AGENT_GRADIENT_CHIP_CLASS}>
              Compare previous visit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function VisitSummarySelectorCard({
  dates,
  onQuickSend,
}: {
  dates: string[]
  onQuickSend: (prompt: string) => void
}) {
  const [selectedDates, setSelectedDates] = useState<string[]>([])

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <p className="mb-1 text-[11px] font-semibold text-tp-slate-800">Select visit dates</p>
      <p className="mb-2 text-[10px] text-tp-slate-500">Choose one or more dates to load visit summaries.</p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {dates.map((date) => {
          const active = selectedDates.includes(date)
          return (
            <button
              key={date}
              type="button"
              onClick={() =>
                setSelectedDates((prev) =>
                  active ? prev.filter((item) => item !== date) : [...prev, date],
                )
              }
              className={cn("rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium", active ? AGENT_GRADIENT_CHIP_CLASS : "border-tp-slate-200 bg-white text-tp-slate-700")}
            >
              {date}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          if (selectedDates.length === 0) return
          onQuickSend(`Show visit summary for ${selectedDates.join(", ")}`)
        }}
        disabled={selectedDates.length === 0}
        className={cn(
          "rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-semibold",
          selectedDates.length > 0 ? AGENT_GRADIENT_CHIP_CLASS : "border-tp-slate-200 bg-tp-slate-100 text-tp-slate-400",
        )}
      >
        Load selected summaries
      </button>
    </div>
  )
}

function MultiVisitSummaryCard({
  visits,
  onCopy,
  onQuickSend,
}: {
  visits: LastVisitCardData[]
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  return (
    <div className="space-y-2">
      {visits.map((visit) => (
        <LastVisitCard key={visit.visitDate} data={visit} onCopy={onCopy} onQuickSend={onQuickSend} />
      ))}
    </div>
  )
}

function VitalsTrendCard({
  data,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "vitals_trend" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
            <HeartPulse size={12} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-tp-slate-700">Vitals Trend View</p>
            <p className="text-[10px] text-tp-slate-500">{data.summary}</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[220px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(
                    {
                      sourceDateLabel: "Vitals trend insight",
                      targetSection: "vitals",
                      additionalNotes: data.trends.map((trend) => `${trend.label}: ${trend.latest}`).join(" | "),
                    },
                    "All vital trends copied to RxPad",
                  )
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy all vital trends to RxPad"
                aria-label="Copy all vital trends to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy all vital trends to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        {data.trends.map((trend) => (
          <div key={trend.label} className="group/trend rounded-[10px] bg-white/72 p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold text-tp-slate-700">{trend.label}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                    trend.tone === "critical"
                      ? "border-[0.5px] border-tp-error-200 bg-tp-error-50 text-tp-error-600"
                      : trend.tone === "warn"
                        ? "border-[0.5px] border-tp-warning-200 bg-tp-warning-50 text-tp-warning-700"
                        : "border-[0.5px] border-tp-success-200 bg-tp-success-50 text-tp-success-700",
                  )}
                >
                  {trend.latest}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      {
                        sourceDateLabel: "Vitals trend insight",
                        targetSection: "vitals",
                        additionalNotes: `${trend.label}: ${trend.latest}`,
                      },
                      `${trend.label} copied to RxPad (Vitals)`,
                    )
                  }
                  className={cn("opacity-0 transition-opacity group-hover/trend:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title={`Copy ${trend.label} to RxPad (Vitals)`}
                  aria-label={`Copy ${trend.label} to RxPad (Vitals)`}
                >
                  <Copy size={10} />
                </button>
              </div>
            </div>
            <MiniLineGraph
              values={trend.values}
              labels={trend.labels}
              tone={trend.tone === "critical" ? "red" : trend.tone === "warn" ? "teal" : "violet"}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function LabPanelCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "lab_panel" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
            <AlertTriangle size={12} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-tp-slate-700">
              Abnormal lab results{data.panelDate ? ` · ${data.panelDate}` : ""}
            </p>
            <p className="text-[10px] text-tp-slate-500">{data.hiddenNormalCount} normal values hidden for compact view</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[220px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(data.copyPayload, "All lab investigations copied to RxPad")
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy all lab investigations to RxPad"
                aria-label="Copy all lab investigations to RxPad"
              >
                <FlaskConical size={11} className="text-tp-blue-600" />
                Copy all lab investigations to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-1 text-[10px] text-tp-slate-600">
        {data.flagged.map((row) => (
          <div key={row.name} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto_auto] items-start gap-x-1.5">
            <span className="text-tp-slate-400">•</span>
            <p className="min-w-0 font-medium">
              <span className="text-tp-slate-500">{row.name}</span>
            </p>
            <span className={cn("text-[10px] font-semibold", row.flag === "high" ? "text-tp-error-600" : "text-tp-warning-700")}>
              {row.flag === "high" ? "↑" : "↓"} {row.value}
            </span>
            <button
              type="button"
              onClick={() => onCopy({ sourceDateLabel: "Lab panel", targetSection: "labResults", labInvestigations: [row.name] }, `${row.name} copied to RxPad (Lab Investigation)`)}
              className={cn("opacity-0 transition-opacity group-hover/row:opacity-100", HOVER_COPY_ICON_CLASS)}
              title={`Copy ${row.name} to RxPad (Lab Investigation)`}
              aria-label={`Copy ${row.name} to RxPad (Lab Investigation)`}
            >
              <Copy size={10} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-1.5 rounded-[10px] bg-white/72 px-2 py-1 text-[10px] text-tp-slate-700">{data.insight}</div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Compare lab panel with previous date") } className={AGENT_GRADIENT_CHIP_CLASS}>
              Compare with previous labs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function VisitCompareCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "visit_compare" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start gap-2">
        <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={13} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-tp-slate-700">{data.title}</p>
          <p className="text-[10px] text-tp-slate-500">
            {data.currentLabel} vs {data.previousLabel}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 text-[10px]">
        {data.rows.map((row) => {
          const active = selectedRows.includes(row.section)
          return (
            <button
              key={row.section}
              type="button"
              onClick={() =>
                setSelectedRows((prev) =>
                  active ? prev.filter((item) => item !== row.section) : [...prev, row.section],
                )
              }
              className="w-full rounded-[9px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50/85 px-2 py-1.5 text-left"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-tp-slate-700">{row.section}</p>
                <span
                  className={cn(
                    "rounded-full border-[0.5px] px-1.5 py-0.5 text-[9px] font-medium",
                    row.status === "worse"
                      ? "border-tp-error-200 bg-tp-error-50 text-tp-error-700"
                      : row.status === "improved"
                        ? "border-tp-success-200 bg-tp-success-50 text-tp-success-700"
                        : "border-tp-slate-200 bg-white text-tp-slate-600",
                  )}
                >
                  {row.status}
                </span>
              </div>
              <p className="leading-4 text-tp-slate-600">
                <span className="text-tp-slate-500">Current:</span> <span className="font-medium text-tp-slate-700">{row.current}</span>
              </p>
              <p className="leading-4 text-tp-slate-600">
                <span className="text-tp-slate-500">Previous:</span> <span className="font-medium text-tp-slate-700">{row.previous}</span>
              </p>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                ...data.copyPayload,
                additionalNotes:
                  selectedRows.length > 0
                    ? data.rows
                        .filter((row) => selectedRows.includes(row.section))
                        .map((row) => `${row.section}: ${row.current} vs ${row.previous}`)
                        .join(" | ")
                    : data.copyPayload.additionalNotes,
              },
              "Comparison insights copied to RxPad",
            )
          }
          className={AI_SMALL_PRIMARY_CTA_CLASS}
        >
          Copy comparison to RxPad
        </button>
      </div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Generate DDX using worsened findings only")} className={AGENT_GRADIENT_CHIP_CLASS}>
              DDX from worsened findings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AbnormalFindingsCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "abnormal_findings" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [selected, setSelected] = useState<string[]>(
    data.findings.filter((item) => item.selected).map((item) => item.label),
  )

  useEffect(() => {
    setSelected(data.findings.filter((item) => item.selected).map((item) => item.label))
  }, [data.findings])

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start gap-2">
        <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
          <AlertTriangle size={12} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-tp-slate-700">{data.title}</p>
          <p className="text-[10px] text-tp-slate-500">{data.subtitle}</p>
        </div>
      </div>

      <div className="space-y-1 text-[10px]">
        {data.findings.map((item) => {
          const active = selected.includes(item.label)
          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setSelected((prev) =>
                  active ? prev.filter((entry) => entry !== item.label) : [...prev, item.label],
                )
              }
              className="w-full rounded-[9px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50/85 px-2 py-1.5 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-tp-slate-700">{item.label}</p>
                <span
                  className={cn(
                    "rounded-full border-[0.5px] px-1.5 py-0.5 text-[9px] font-medium",
                    item.severity === "high"
                      ? "border-tp-error-200 bg-tp-error-50 text-tp-error-700"
                      : item.severity === "moderate"
                        ? "border-tp-warning-200 bg-tp-warning-50 text-tp-warning-700"
                        : "border-tp-slate-200 bg-white text-tp-slate-600",
                  )}
                >
                  {item.severity}
                </span>
              </div>
              <p className="mt-0.5 leading-4 text-tp-slate-500">{item.detail}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                ...data.copyPayload,
                additionalNotes:
                  selected.length > 0 ? selected.join(" | ") : data.findings.map((item) => item.label).join(" | "),
              },
              "Abnormal findings copied to RxPad",
            )
          }
          className={AI_SMALL_PRIMARY_CTA_CLASS}
        >
          Copy findings to RxPad
        </button>
      </div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Generate DDX from selected abnormal findings")} className={AGENT_GRADIENT_CHIP_CLASS}>
              Generate DDX from findings
            </button>
            <button type="button" onClick={() => onQuickSend("Suggest investigations for selected abnormal findings")} className={AGENT_GRADIENT_CHIP_CLASS}>
              Suggest investigations
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DdxCard({
  data,
  onAccept,
  onQuickSend,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "ddx" }>
  onAccept: (diagnoses: string[]) => void
  onQuickSend: (prompt: string) => void
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const contextTokens = useMemo(
    () => data.context.split("+").map((item) => item.trim()).filter(Boolean),
    [data.context],
  )

  useEffect(() => {
    setSelected([])
  }, [data.context, data.options])

  const grouped = useMemo(() => {
    const bucketMap: Record<"cant_miss" | "most_likely" | "extended", Array<(typeof data.options)[number]>> = {
      cant_miss: [],
      most_likely: [],
      extended: [],
    }
    data.options.forEach((option) => {
      const bucket = option.bucket ?? (option.confidence >= 80 ? "cant_miss" : option.confidence >= 60 ? "most_likely" : "extended")
      bucketMap[bucket].push(option)
    })
    return [
      { id: "cant_miss" as const, title: "CAN'T MISS", className: "border-tp-error-200 bg-tp-error-50/40 text-tp-error-700" },
      { id: "most_likely" as const, title: "MOST LIKELY", className: "border-tp-slate-200 bg-tp-slate-50/85 text-tp-slate-700" },
      { id: "extended" as const, title: "EXTENDED", className: "border-tp-slate-200 bg-tp-slate-50/65 text-tp-slate-600" },
    ].map((bucket) => ({
      ...bucket,
      options: bucketMap[bucket.id],
    }))
  }, [data.options])

  const selectedCount = selected.length

  function toggleSelection(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={14} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-tp-slate-700">Differential Diagnosis</p>
            <p className="text-[10px] text-tp-slate-500">Ranked by clinical probability</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[208px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(
                    {
                      sourceDateLabel: "DDX suggestions",
                      diagnoses: data.options.map((option) => option.name),
                    },
                    "All DDX options copied to RxPad",
                  )
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy all DDX options to RxPad"
                aria-label="Copy all DDX options to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy all DDX options to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {contextTokens.length > 0 ? (
        <p className="mb-2 rounded-[10px] bg-tp-slate-50 px-2 py-1.5 text-[10px] leading-4 text-tp-slate-600">
          Generated using: <span className="font-medium text-tp-slate-700">{contextTokens.join(", ")}</span>.
        </p>
      ) : null}
      <div className="space-y-2">
        {grouped.map((group) => (
          <div key={group.id} className={cn("rounded-[10px] border-[0.5px] p-2", group.className)}>
            <p className="mb-1 text-[10px] font-semibold tracking-wide">{group.title}</p>
            <div className="space-y-1">
              {group.options.map((option) => {
                const isSelected = selected.includes(option.name)
                return (
                  <div key={option.name} className="group/row grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSelection(option.name)}
                      className={cn(
                        "mt-0.5 inline-flex size-4 items-center justify-center rounded-[5px] border-[0.5px] transition-colors",
                        isSelected ? "border-tp-blue-500 bg-tp-blue-500 text-white" : "border-tp-slate-300 bg-white text-transparent",
                      )}
                      aria-label={`${isSelected ? "Unselect" : "Select"} ${option.name}`}
                    >
                      <Check size={10} strokeWidth={2.8} />
                    </button>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-tp-slate-700">{option.name}</p>
                      <p className="text-[9px] leading-4 text-tp-slate-500">{option.rationale}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onCopy(
                          {
                            sourceDateLabel: "DDX suggestion",
                            diagnoses: [option.name],
                          },
                          `${option.name} copied to RxPad`,
                        )
                      }
                      className={cn("opacity-0 transition-opacity group-hover/row:opacity-100", HOVER_COPY_ICON_CLASS)}
                      title={`Copy ${option.name} to RxPad`}
                      aria-label={`Copy ${option.name} to RxPad`}
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={() =>
            onCopy(
              {
                sourceDateLabel: "Selected DDX",
                diagnoses: selected,
              },
              `${selectedCount} diagnoses copied to RxPad`,
            )
          }
          className={AI_SMALL_SECONDARY_CTA_CLASS}
        >
          {selectedCount > 0 ? `Copy ${selectedCount} to RxPad` : "Copy to RxPad"}
        </button>
      </div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => {
                onAccept(selected)
                onQuickSend(`Generate cascade for ${selected.join(", ")}`)
              }}
              className={cn(AGENT_GRADIENT_CHIP_CLASS, selectedCount === 0 && "cursor-not-allowed border-tp-slate-200 bg-tp-slate-100 text-tp-slate-400")}
            >
              {selectedCount > 0 ? `Generate cascade (${selectedCount})` : "Generate cascade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InvestigationBundleCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "investigation_bundle" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [selected, setSelected] = useState(() =>
    data.items.filter((item) => item.selected).map((item) => item.label),
  )

  useEffect(() => {
    setSelected(data.items.filter((item) => item.selected).map((item) => item.label))
  }, [data.items])

  function toggleSelection(label: string) {
    setSelected((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start gap-2">
        <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={13} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-tp-slate-700">{data.title}</p>
          <p className="text-[10px] text-tp-slate-500">{data.subtitle}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-[10px] text-tp-slate-700">
        {data.items.map((item) => {
          const isSelected = selected.includes(item.label)
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => toggleSelection(item.label)}
              className="flex w-full items-start gap-2 rounded-[8px] px-1 py-0.5 text-left hover:bg-tp-slate-50"
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex size-4 items-center justify-center rounded-[5px] border-[0.5px]",
                  isSelected ? "border-tp-blue-500 bg-tp-blue-500 text-white" : "border-tp-slate-300 bg-white text-transparent",
                )}
              >
                <Check size={10} strokeWidth={2.8} />
              </span>
              <span className="leading-4">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                ...data.copyPayload,
                labInvestigations: selected.length > 0 ? selected : data.items.map((item) => item.label),
              },
              `${selected.length > 0 ? selected.length : data.items.length} investigations copied to RxPad`,
            )
          }
          className={AI_SMALL_PRIMARY_CTA_CLASS}
        >
          Add all
        </button>
      </div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Refine investigation bundle by cost and urgency")} className={AGENT_GRADIENT_CHIP_CLASS}>
              Edit investigation bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdviceBundleCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "advice_bundle" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [selected, setSelected] = useState(() =>
    data.items.filter((item) => item.selected).map((item) => item.label),
  )

  useEffect(() => {
    setSelected(data.items.filter((item) => item.selected).map((item) => item.label))
  }, [data.items])

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start gap-2">
        <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={13} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-tp-slate-700">{data.title}</p>
          <p className="text-[10px] text-tp-slate-500">{data.subtitle}</p>
        </div>
      </div>

      <div className="space-y-1 text-[10px] text-tp-slate-700">
        {data.items.map((item) => {
          const isSelected = selected.includes(item.label)
          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setSelected((prev) => (prev.includes(item.label) ? prev.filter((entry) => entry !== item.label) : [...prev, item.label]))
              }
              className="flex w-full items-start gap-2 rounded-[8px] px-1 py-0.5 text-left hover:bg-tp-slate-50"
            >
              <span className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-tp-violet-400" />
              <span className={cn("leading-4", isSelected ? "font-medium text-tp-slate-800" : "text-tp-slate-600")}>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                ...data.copyPayload,
                advice: (selected.length > 0 ? selected : data.items.map((item) => item.label)).join(" | "),
              },
              "Advice copied to RxPad",
            )
          }
          className={AI_SMALL_PRIMARY_CTA_CLASS}
        >
          Add to advice
        </button>
      </div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend(data.shareMessage)} className={AGENT_GRADIENT_CHIP_CLASS}>
              Share advice with patient
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FollowUpBundleCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "follow_up_bundle" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [selected, setSelected] = useState(() =>
    data.items.filter((item) => item.selected).map((item) => item.label),
  )

  useEffect(() => {
    setSelected(data.items.filter((item) => item.selected).map((item) => item.label))
  }, [data.items])

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start gap-2">
        <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={13} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-tp-slate-700">{data.title}</p>
          <p className="text-[10px] text-tp-slate-500">{data.subtitle}</p>
        </div>
      </div>

      <div className="space-y-1 text-[10px] text-tp-slate-700">
        {data.items.map((item) => {
          const isSelected = selected.includes(item.label)
          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setSelected((prev) => (prev.includes(item.label) ? prev.filter((entry) => entry !== item.label) : [...prev, item.label]))
              }
              className="flex w-full items-start gap-2 rounded-[8px] px-1 py-0.5 text-left hover:bg-tp-slate-50"
            >
              <span className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-tp-violet-400" />
              <span className={cn("leading-4", isSelected ? "font-medium text-tp-slate-800" : "text-tp-slate-600")}>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                ...data.copyPayload,
                followUp: data.followUpValue,
                followUpDate: deriveFollowUpDate(data.followUpValue),
              },
              "Follow-up date set in RxPad",
            )
          }
          className={AI_SMALL_PRIMARY_CTA_CLASS}
        >
          Set follow-up date
        </button>
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                sourceDateLabel: data.title,
                targetSection: "followUp",
                followUpDate: deriveFollowUpDate(data.followUpValue),
                followUp: data.followUpValue,
                followUpNotes: (selected.length > 0 ? selected : data.items.map((item) => item.label)).join(" | "),
                additionalNotes: (selected.length > 0 ? selected : data.items.map((item) => item.label)).join(" | "),
              },
              "Follow-up notes added",
            )
          }
          className={AI_SMALL_SECONDARY_CTA_CLASS}
        >
          Add follow-up notes
        </button>
      </div>
      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Create appointment reminder for follow-up plan")} className={AGENT_GRADIENT_CHIP_CLASS}>
              Schedule appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CascadeCard({
  data,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "cascade" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
            <Stethoscope size={12} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-tp-slate-700">DDX Cascade · {data.diagnosis}</p>
            <p className="text-[10px] text-tp-slate-500">Protocol meds + investigations + advice + follow-up</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[220px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(data.copyPayload, "Cascade suggestions copied to RxPad")
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy complete cascade to RxPad"
                aria-label="Copy complete cascade to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy complete cascade to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5 text-[10px] text-tp-slate-700">
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5">
          <p className="mb-1 font-semibold">Medications</p>
          <p>{data.meds.join(" · ")}</p>
        </div>
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5">
          <p className="mb-1 font-semibold">Investigations</p>
          <p>{data.investigations.join(" · ")}</p>
        </div>
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5">
          <p className="mb-1 font-semibold">Advice</p>
          <p>{data.advice}</p>
        </div>
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5">
          <p className="mb-1 font-semibold">Follow-up</p>
          <p>{data.followUp}</p>
        </div>
      </div>
    </div>
  )
}

function TranslationCard({
  data,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "translation" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
            <Sparkles size={12} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-tp-slate-700">Vernacular Translation · {data.language}</p>
            <p className="text-[10px] text-tp-slate-500">Original and translated advice</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[220px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(data.advicePayload, `${data.language} advice copied to RxPad`)
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title={`Copy ${data.language} advice to RxPad`}
                aria-label={`Copy ${data.language} advice to RxPad`}
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy {data.language} advice to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px] text-tp-slate-600">{data.source}</div>
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px] text-tp-slate-700">{data.translated}</div>
      </div>
    </div>
  )
}

function CompletenessCard({
  data,
}: {
  data: Extract<RxAgentOutput, { kind: "completeness" }>
}) {
  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-tp-slate-700">Documentation Completeness</p>
        <span className="rounded-full border border-tp-warning-200 bg-tp-warning-50 px-1.5 py-0.5 text-[9px] font-semibold text-tp-warning-700">{data.completenessPercent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-tp-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706]" style={{ width: `${data.completenessPercent}%` }} />
      </div>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        <div className="rounded-lg border border-tp-slate-100 bg-tp-slate-50/75 p-2">
          <p className="mb-1 text-[10px] font-semibold text-tp-success-700">Filled</p>
          <p className="text-[10px] text-tp-success-700">{data.filled.join(" · ")}</p>
        </div>
        <div className="rounded-lg border border-tp-slate-100 bg-tp-slate-50/75 p-2">
          <p className="mb-1 text-[10px] font-semibold text-tp-warning-700">Missing</p>
          <p className="text-[10px] text-tp-warning-700">{data.missing.join(" · ")}</p>
        </div>
      </div>
    </div>
  )
}

function MedHistoryCard({
  data,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "med_history" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-tp-slate-700">Drug class history · {data.className}</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[228px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(
                    {
                      sourceDateLabel: `${data.className} medication history`,
                      medications: data.matches.map((item) => ({
                        medicine: item.medicine,
                        unitPerDose: "-",
                        frequency: "-",
                        when: "-",
                        duration: item.duration,
                        note: item.date,
                      })),
                    },
                    "Medication history copied to RxPad",
                  )
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy all medication history to RxPad"
                aria-label="Copy all medication history to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy all medication history to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        {data.matches.map((item) => (
          <div key={`${item.date}-${item.medicine}`} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5 rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px] text-tp-slate-700">
            <span className="text-tp-slate-400">•</span>
            <p className="min-w-0 leading-4">
              <span className="font-semibold">{item.medicine}</span>
              <span className="mx-1 text-tp-slate-300">|</span>
              <span className="text-tp-slate-500">{item.date} · {item.duration}</span>
            </p>
            <button
              type="button"
              onClick={() =>
                onCopy(
                  {
                    sourceDateLabel: `${data.className} medication history`,
                    medications: [
                      {
                        medicine: item.medicine,
                        unitPerDose: "-",
                        frequency: "-",
                        when: "-",
                        duration: item.duration,
                        note: item.date,
                      },
                    ],
                  },
                  `${item.medicine} copied to RxPad`,
                )
              }
              className={cn("opacity-0 transition-opacity group-hover/row:opacity-100", HOVER_COPY_ICON_CLASS)}
              title={`Copy ${item.medicine} to RxPad`}
              aria-label={`Copy ${item.medicine} to RxPad`}
            >
              <Copy size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecurrenceCard({
  data,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "recurrence" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-tp-slate-700">
          Recurrence · {data.condition} ({data.occurrences} times)
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[216px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(
                    {
                      sourceDateLabel: `${data.condition} recurrence timeline`,
                      additionalNotes: data.timeline.map((row) => `${row.date}: ${row.detail}`).join(" | "),
                    },
                    "Recurrence timeline copied to RxPad",
                  )
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy full recurrence timeline to RxPad"
                aria-label="Copy full recurrence timeline to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy full recurrence timeline to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        {data.timeline.map((row) => (
          <div key={`${row.date}-${row.detail}`} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5 rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px] text-tp-slate-700">
            <span className="text-tp-slate-400">•</span>
            <p className="min-w-0 leading-4">
              <span className="font-semibold">{row.date}</span>
              <span className="mx-1 text-tp-slate-300">|</span>
              <span className="text-tp-slate-500">{row.detail}</span>
            </p>
            <button
              type="button"
              onClick={() =>
                onCopy(
                  {
                    sourceDateLabel: `${data.condition} recurrence`,
                    additionalNotes: `${row.date}: ${row.detail}`,
                  },
                  `${data.condition} recurrence entry copied to RxPad`,
                )
              }
              className={cn("opacity-0 transition-opacity group-hover/row:opacity-100", HOVER_COPY_ICON_CLASS)}
              title={`Copy ${data.condition} recurrence entry to RxPad`}
              aria-label={`Copy ${data.condition} recurrence entry to RxPad`}
            >
              <Copy size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnnualPanelCard({
  data,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "annual_panel" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-tp-slate-700">{data.title}</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[226px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(data.copyPayload, "Annual panel copied to RxPad (Lab Investigation)")
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy all annual panel investigations to RxPad"
                aria-label="Copy all annual panel investigations to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy all annual panel investigations to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        {data.tests.map((item) => (
          <div key={item.test} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto_auto] items-start gap-x-1.5 rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px]">
            <span className="text-tp-slate-400">•</span>
            <span className="font-medium text-tp-slate-700">{item.test}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-semibold",
                item.priority === "high"
                  ? "bg-tp-error-50 text-tp-error-600"
                  : item.priority === "medium"
                    ? "bg-tp-warning-50 text-tp-warning-700"
                    : "bg-tp-success-50 text-tp-success-700",
              )}
            >
              {item.priority}
            </span>
            <button
              type="button"
              onClick={() =>
                onCopy(
                  {
                    sourceDateLabel: `${data.title}`,
                    labInvestigations: [item.test],
                  },
                  `${item.test} copied to RxPad (Lab Investigation)`,
                )
              }
              className={cn("opacity-0 transition-opacity group-hover/row:opacity-100", HOVER_COPY_ICON_CLASS)}
              title={`Copy ${item.test} to RxPad (Lab Investigation)`}
              aria-label={`Copy ${item.test} to RxPad (Lab Investigation)`}
            >
              <Copy size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function UiShowcaseCard({
  onCopy,
  onQuickSend,
}: {
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "inputs" | "media">("overview")
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)

  const copyAllNotes =
    "Dynamic card patterns: list view, card view, chart bars, CTA actions, text input, checkbox, slider, date picker, multi-choice chips, image/video/audio placeholders, tabs, modal trigger."

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={AI_CARD_ICON_WRAP_CLASS} style={{ background: AI_GRADIENT_SOFT }}>
            <Sparkles size={12} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-tp-slate-700">Dynamic UI Capability Showcase</p>
            <p className="text-[10px] text-tp-slate-500">Reusable A2UI and AGUI patterns for TypeRx</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCopyMenuOpen((prev) => !prev)}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
            title="Copy options to RxPad"
            aria-label="Copy options to RxPad"
          >
            <Copy size={11} />
          </button>
          {copyMenuOpen ? (
            <div className="absolute right-0 top-[28px] z-20 w-[220px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  onCopy(
                    {
                      sourceDateLabel: "Dynamic UI capability showcase",
                      additionalNotes: copyAllNotes,
                    },
                    "Capability summary copied to RxPad",
                  )
                  setCopyMenuOpen(false)
                }}
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                title="Copy complete capability summary to RxPad"
                aria-label="Copy complete capability summary to RxPad"
              >
                <ClipboardPlus size={11} className="text-tp-blue-600" />
                Copy complete capability summary to RxPad
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mb-2 inline-flex rounded-[10px] bg-white/72 p-0.5">
        {[
          { id: "overview", label: "Overview" },
          { id: "inputs", label: "Inputs" },
          { id: "media", label: "Media" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as "overview" | "inputs" | "media")}
            className={cn(
              "rounded-[8px] px-2 py-1 text-[10px] font-medium",
              activeTab === tab.id ? "bg-tp-violet-100 text-tp-violet-700" : "text-tp-slate-600 hover:bg-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={AI_INNER_SURFACE_CLASS}>
        {activeTab === "overview" ? (
          <div className={AI_INNER_BODY_CLASS}>
            <p className="leading-4 text-tp-slate-700">
              <span className="text-tp-slate-400">•</span>
              <span className="ml-1 font-medium">List view</span>
              <span className="mx-1 text-tp-slate-300">|</span>
              <span>compact pointers with copy-to-section actions</span>
            </p>
            <p className="leading-4 text-tp-slate-700">
              <span className="text-tp-slate-400">•</span>
              <span className="ml-1 font-medium">Card view</span>
              <span className="mx-1 text-tp-slate-300">|</span>
              <span>stacked summaries for DDX, labs, protocols and visit history</span>
            </p>
            <div className="rounded-[10px] bg-white/72 px-2 py-1.5">
              <p className="mb-1 text-[10px] font-semibold text-tp-slate-700">Mini bar trend</p>
              <div className="flex items-end gap-1">
                {[38, 52, 46, 60, 49].map((value, index) => (
                  <div key={`${value}-${index}`} className="w-4 rounded-t bg-tp-violet-200/80" style={{ height: `${value / 1.8}px` }} />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <button type="button" className={AGENT_GRADIENT_CHIP_CLASS}>Open modal template</button>
              <button type="button" className={AGENT_GRADIENT_CHIP_CLASS}>Generate list variant</button>
            </div>
          </div>
        ) : null}

        {activeTab === "inputs" ? (
          <div className={AI_INNER_BODY_CLASS}>
            <input
              disabled
              value="Text field template"
              className="h-8 w-full rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white px-2 text-[10px] text-tp-slate-500"
              aria-label="Text field sample"
            />
            <div className="flex items-center gap-2 text-[10px] text-tp-slate-700">
              <input type="checkbox" checked readOnly className="size-3 rounded border-tp-slate-300" />
              <span>Checkbox template for consent or selection</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-tp-slate-500">Slider template</p>
              <input type="range" min={0} max={100} value={60} readOnly className="w-full accent-[#4B4AD5]" />
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value="2026-03-05" readOnly className="h-8 rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white px-2 text-[10px] text-tp-slate-600" />
              <div className="flex flex-wrap gap-1">
                {["Single", "Multi", "Urgent"].map((item) => (
                  <span key={item} className="rounded-full bg-tp-slate-100 px-2 py-0.5 text-[9px] text-tp-slate-600">{item}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "media" ? (
          <div className={AI_INNER_BODY_CLASS}>
            <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px] text-tp-slate-600">
              <p className="font-medium text-tp-slate-700">Image placeholder</p>
              <div className="mt-1 h-16 rounded-[8px] border-[0.5px] border-dashed border-tp-slate-300 bg-tp-slate-50" />
            </div>
            <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px] text-tp-slate-600">
              <p className="font-medium text-tp-slate-700">Audio player template</p>
              <audio controls className="mt-1 w-full" />
            </div>
            <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[10px] text-tp-slate-600">
              <p className="font-medium text-tp-slate-700">Video placeholder</p>
              <div className="mt-1 h-16 rounded-[8px] border-[0.5px] border-dashed border-tp-slate-300 bg-tp-slate-50" />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 border-t border-tp-slate-100 pt-1.5">
        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Generate list view variant for this context")} className={AGENT_GRADIENT_CHIP_CLASS}>
              Generate list variant
            </button>
            <button type="button" onClick={() => onQuickSend("Generate input form variant for this context")} className={AGENT_GRADIENT_CHIP_CLASS}>
              Generate form variant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type SpecialtyTabId = "gp" | "gynec" | "ophthal" | "obstetric" | "pediatrics"

const SPECIALTY_TABS: Array<{ id: SpecialtyTabId; label: string }> = [
  { id: "gp", label: "GP" },
  { id: "gynec", label: "Gynec" },
  { id: "ophthal", label: "Ophthal" },
  { id: "obstetric", label: "Obstetric" },
  { id: "pediatrics", label: "Pedia" },
]

const SPECIALTY_PROMPTS: Record<SpecialtyTabId, string[]> = {
  gp: ["Patient snapshot", "Last visit essentials", "Abnormal findings", "Medication safety"],
  gynec: ["Cycle and LMP highlights", "Gynec history focus", "Due and overdue checks", "Symptom triage"],
  ophthal: ["Visual symptom focus", "Last ophthal findings", "Red-flag screening", "Medication safety"],
  obstetric: ["Obstetric highlights", "ANC due items", "Pregnancy risk checks", "Immunization due view"],
  pediatrics: ["Growth and vaccine review", "Pediatric symptom triage", "Development and feeding checks", "Follow-up planning"],
}

function clinicalTokens(text?: string, limit = 4) {
  if (!text) return []
  return text
    .split(/,|;|\\.|\\|/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit)
}

function buildSpecialtySnapshot(tab: SpecialtyTabId, summaryData: SmartSummaryData) {
  if (tab === "gynec") {
    return {
      headline: "Specialty snapshot",
      keyItems: [
        "LMP: 02 Jun 2025",
        "Cycle: Regular",
        "ANC follow-up: due in 5 days",
      ],
      alerts: ["Review menstrual pain trend", "Check due ANC counseling"],
    }
  }

  if (tab === "ophthal") {
    return {
      headline: "Specialty snapshot",
      keyItems: [
        "Visual strain after prolonged screens",
        "No acute vision-loss red flag",
        "Bilateral redness noted in intake",
      ],
      alerts: ["Conjunctival symptoms present"],
    }
  }

  if (tab === "obstetric") {
    return {
      headline: "Specialty snapshot",
      keyItems: [
        "LMP: 02 Jun 2025",
        "EDD: 17 Mar 2026",
        "ANC due in 5 days",
      ],
      alerts: ["Check ANC scheduler", "Review due immunization status"],
    }
  }

  if (tab === "pediatrics") {
    return {
      headline: "Specialty snapshot",
      keyItems: [
        "Weight gain slower in last month",
        "Td/TT booster pending",
        "Mild nocturnal cough reported",
      ],
      alerts: ["Vaccination due this week", "Growth review due in 10 days"],
    }
  }

  return {
    headline: "Specialty snapshot",
    keyItems: [
      summaryData.followUpOverdueDays > 0
        ? `Follow-up overdue ${summaryData.followUpOverdueDays} days`
        : "Follow-up on track",
      summaryData.labFlagCount > 0
        ? `${summaryData.labFlagCount} abnormal lab values`
        : "No major lab abnormality",
      summaryData.todayVitals
        ? `Vitals captured: BP ${summaryData.todayVitals.bp}, SpO2 ${summaryData.todayVitals.spo2}`
        : "Vitals pending for current visit",
    ],
    alerts: summaryData.dueAlerts?.slice(0, 2) ?? [],
  }
}

interface SpecialtyClinicalView {
  currentSymptoms: string[]
  currentVitals?: SmartSummaryData["todayVitals"]
  currentMedications: string[]
  currentLabs: Array<{ name: string; value: string; flag: "high" | "low" }>
  lastVisit?: LastVisitSummary
  dueItems: string[]
}

function vitalsSeedFromVitals(vitals?: SmartSummaryData["todayVitals"]): RxPadVitalsSeed | undefined {
  if (!vitals) return undefined
  const [systolic, diastolic] = vitals.bp.split("/")
  return {
    bpSystolic: systolic?.trim(),
    bpDiastolic: diastolic?.trim(),
    temperature: vitals.temp,
    heartRate: vitals.pulse,
  }
}

function buildSpecialtyClinicalView(tab: SpecialtyTabId, summaryData: SmartSummaryData): SpecialtyClinicalView {
  const fallbackVisit: LastVisitSummary = {
    date: "27 Jan'26",
    vitals: "BP 126/80 | Pulse 76 | SpO2 95% | Temperature 99.0 F",
    symptoms: "Fever (2 days, high), eye redness (2 days, moderate)",
    examination: "Mild conjunctival congestion, chest clear",
    diagnosis: "Viral fever with conjunctival irritation",
    medication: "Telma20 1-0-0-1, Metsmail 500 1-0-0-1",
    labTestsSuggested: "CBC, LFT",
    followUp: "2 weeks",
  }

  if (tab === "gynec") {
    return {
      currentSymptoms: ["Lower abdominal pain (2 days, moderate)", "Heavy flow (2 days, high)"],
      currentVitals: { bp: "112/74", pulse: "82", spo2: "98%", temp: "98.7 F", bmi: "22.6" },
      currentMedications: ["Tranexamic Acid 500 mg", "Mefenamic Acid 500 mg"],
      currentLabs: [{ name: "Hemoglobin", value: "9.8", flag: "low" }, { name: "TSH", value: "5.4", flag: "high" }],
      lastVisit: {
        date: "05 Feb'26",
        vitals: "BP 110/72 | Pulse 80 | SpO2 98% | Temperature 98.5 F",
        symptoms: "Menstrual pain (3 days), heavy flow",
        examination: "Lower abdominal tenderness",
        diagnosis: "Dysmenorrhea with menorrhagia",
        medication: "Tranexamic Acid 500 mg, Mefenamic Acid 500 mg",
        labTestsSuggested: "CBC, Thyroid Profile",
        followUp: "1 week",
      },
      dueItems: ["Cycle review due in 3 days"],
    }
  }

  if (tab === "ophthal") {
    return {
      currentSymptoms: ["Eye redness (2 days, bilateral)", "Burning sensation (moderate)", "Blurred vision in evening"],
      currentVitals: { bp: "124/78", pulse: "74", spo2: "98%", temp: "98.4 F", bmi: "23.2" },
      currentMedications: ["Carboxymethylcellulose eye drops", "Olopatadine eye drops"],
      currentLabs: [{ name: "Blood Glucose", value: "146", flag: "high" }],
      lastVisit: {
        date: "12 Jan'26",
        vitals: "BP 122/76 | Pulse 72 | SpO2 98% | Temperature 98.3 F",
        symptoms: "Dry eye, intermittent redness",
        examination: "Conjunctival congestion with dry eye signs",
        diagnosis: "Allergic conjunctivitis with dry eye",
        medication: "Lubricant eye drops, Olopatadine eye drops",
        labTestsSuggested: "Random Blood Sugar",
        followUp: "10 days",
      },
      dueItems: ["Ophthal follow-up overdue by 2 days"],
    }
  }

  if (tab === "obstetric") {
    return {
      currentSymptoms: ["Pedal edema (mild)", "Lower back pain (2 days)", "Nausea (morning)"],
      currentVitals: { bp: "128/84", pulse: "90", spo2: "97%", temp: "98.6 F", bmi: "25.1" },
      currentMedications: ["Iron and Folic Acid", "Calcium with Vitamin D"],
      currentLabs: [{ name: "Hemoglobin", value: "10.2", flag: "low" }, { name: "TSH", value: "4.8", flag: "high" }],
      lastVisit: {
        date: "18 Feb'26",
        vitals: "BP 126/82 | Pulse 88 | SpO2 98% | Temperature 98.5 F",
        symptoms: "Leg swelling, low back pain",
        examination: "Mild edema with stable fetal movements",
        diagnosis: "Third trimester monitoring visit",
        medication: "Iron and Folic Acid, Calcium supplement",
        labTestsSuggested: "CBC, Urine Routine, Thyroid Profile",
        followUp: "1 week",
      },
      dueItems: ["ANC scheduler due in 5 days", "Tetanus booster due this week"],
    }
  }

  if (tab === "pediatrics") {
    return {
      currentSymptoms: ["Dry cough (3 days, mild)", "Reduced appetite (2 days)"],
      currentVitals: { bp: "96/62", pulse: "104", spo2: "97%", temp: "99.0 F", bmi: "16.2" },
      currentMedications: ["Levocetirizine syrup", "Paracetamol syrup"],
      currentLabs: [{ name: "WBC", value: "12.5", flag: "high" }],
      lastVisit: {
        date: "03 Feb'26",
        vitals: "Pulse 102 | SpO2 98% | Temperature 99.1 F",
        symptoms: "Nocturnal cough, throat irritation",
        examination: "Mild pharyngeal congestion",
        diagnosis: "Upper respiratory tract infection",
        medication: "Levocetirizine syrup, Saline nasal drops",
        labTestsSuggested: "CBC if fever persists",
        followUp: "5 days",
      },
      dueItems: ["Td/TT booster due this week", "Growth chart review due in 10 days"],
    }
  }

  return {
    currentSymptoms:
      clinicalTokens(summaryData.lastVisit?.symptoms || summaryData.patientNarrative, 4) || [],
    currentVitals: summaryData.todayVitals,
    currentMedications: summaryData.activeMeds ?? [],
    currentLabs: summaryData.keyLabs ?? [],
    lastVisit: summaryData.lastVisit ?? fallbackVisit,
    dueItems: summaryData.dueAlerts ?? [],
  }
}

type VitalsToken = { label: string; value: string }

function normalizeVitalLabel(raw: string) {
  const value = raw.trim().toLowerCase()
  if (value.includes("bp") || value.includes("systolic") || value.includes("diastolic")) return "BP"
  if (value.includes("pulse") || value.includes("heart")) return "Pulse"
  if (value.includes("spo2") || value.includes("spo₂") || value.includes("oxygen")) return "SpO2"
  if (value.includes("temp")) return "Temp"
  return raw.trim()
}

function parseVitalsTokens(raw?: string): VitalsToken[] {
  if (!raw) return []
  return raw
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const colonMatch = item.match(/^([^:]+):\s*(.+)$/)
      if (colonMatch) {
        return { label: normalizeVitalLabel(colonMatch[1]), value: colonMatch[2].trim() }
      }

      const spacedMatch = item.match(/^(BP|Pulse|SpO2|SPO2|Temperature|Temp)\s+(.+)$/i)
      if (spacedMatch) {
        return { label: normalizeVitalLabel(spacedMatch[1]), value: spacedMatch[2].trim() }
      }

      if (/\d{2,3}\s*\/\s*\d{2,3}/.test(item)) {
        return { label: "BP", value: item.trim() }
      }

      return { label: "Vitals", value: item }
    })
}

function vitalsTokensFromCurrent(vitals?: { bp?: string; pulse?: string; spo2?: string; temp?: string } | null): VitalsToken[] {
  if (!vitals) return []
  const tokens: VitalsToken[] = []
  if (vitals.bp) tokens.push({ label: "BP", value: vitals.bp })
  if (vitals.pulse) tokens.push({ label: "Pulse", value: `${vitals.pulse}/min` })
  if (vitals.spo2) tokens.push({ label: "SpO2", value: vitals.spo2 })
  if (vitals.temp) tokens.push({ label: "Temp", value: vitals.temp })
  return tokens
}

function SummaryCard({
  collapsed,
  onToggle,
  onCopy,
  onQuickSend,
  summaryData,
  activeSpecialty,
}: {
  collapsed: boolean
  onToggle: () => void
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
  summaryData: SmartSummaryData
  activeSpecialty: SpecialtyTabId
}) {
  const [expanded, setExpanded] = useState(false)
  const [lastVisitCopyMenuOpen, setLastVisitCopyMenuOpen] = useState(false)
  const [currentEssentialsCopyMenuOpen, setCurrentEssentialsCopyMenuOpen] = useState(false)
  const [additionalHistoryCopyMenuOpen, setAdditionalHistoryCopyMenuOpen] = useState(false)
  const [recordHighlightsCopyMenuOpen, setRecordHighlightsCopyMenuOpen] = useState(false)
  const specialtySnapshot = useMemo(() => buildSpecialtySnapshot(activeSpecialty, summaryData), [activeSpecialty, summaryData])
  const clinicalView = useMemo(() => buildSpecialtyClinicalView(activeSpecialty, summaryData), [activeSpecialty, summaryData])

  const latestVisit = clinicalView.lastVisit
  const showSpecialtySnapshot = activeSpecialty !== "gp"
  const hasTodayVitals = Boolean(clinicalView.currentVitals)
  const hasLabs = clinicalView.currentLabs.length > 0
  const hasMeds = clinicalView.currentMedications.length > 0
  const chronicHighlights = (summaryData.chronicConditions ?? []).slice(0, 3)
  const allergyHighlights = (summaryData.allergies ?? []).slice(0, 2)
  const historyLineForCopy =
    chronicHighlights.length > 0 || allergyHighlights.length > 0
      ? [
          chronicHighlights.length > 0 ? `Chronic: ${chronicHighlights.join(", ")}` : null,
          allergyHighlights.length > 0 ? `Allergies: ${allergyHighlights.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | ")
      : "No chronic condition or allergy documented"
  const patientNarrative = summarizeNarrative(summaryData.patientNarrative || summaryData.receptionistIntakeNotes?.join(" "), 120)
  const symptomHighlights = (clinicalView.currentSymptoms.length > 0 ? clinicalView.currentSymptoms : [patientNarrative]).map((item) =>
    item.replace(/\bfev\b/gi, "Fever").replace(/\bSx\b/gi, "Symptoms"),
  )
  const labHighlights = clinicalView.currentLabs.slice(0, 4)
  const lastVisitSymptomTokens = clinicalTokens(latestVisit?.symptoms, 4)
  const currentMedicationEntries = clinicalView.currentMedications.map(parseMedicationEntry).filter((item) => item.name)
  const lastVisitMedications = latestVisit?.medication.split(",").map((med) => med.trim()).filter(Boolean) ?? []
  const lastVisitMedicationEntries = lastVisitMedications.map(parseMedicationEntry).filter((item) => item.name)
  const currentVitalsTokens = vitalsTokensFromCurrent(clinicalView.currentVitals)
  const lastVisitVitalsTokens = parseVitalsTokens(latestVisit?.vitals)
  const currentEssentialsPayload: RxPadCopyPayload = {
    sourceDateLabel: "Current consultation essentials",
    symptoms: symptomHighlights.length > 0 ? symptomHighlights : undefined,
    vitals: vitalsSeedFromVitals(clinicalView.currentVitals),
    medications:
      clinicalView.currentMedications.length > 0
        ? clinicalView.currentMedications.map((med) => ({
            medicine: med,
            unitPerDose: "-",
            frequency: "-",
            when: "-",
            duration: "-",
            note: "",
          }))
        : undefined,
    labInvestigations: labHighlights.length > 0 ? labHighlights.map((lab) => lab.name) : undefined,
    additionalNotes: historyLineForCopy,
  }
  const additionalHistoryNotes = [
    (summaryData.familyHistory?.length ?? 0) > 0 ? `Family history: ${summaryData.familyHistory!.join(", ")}` : null,
    (summaryData.lifestyleNotes?.length ?? 0) > 0 ? `Lifestyle: ${summaryData.lifestyleNotes!.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" | ")
  const recordHighlightNotes = (summaryData.recordAlerts ?? []).slice(0, 3).join(" | ")

  const concernPills: Array<{ label: string; tone: "error" | "warning" | "success" }> = []
  if (summaryData.followUpOverdueDays > 0) {
    concernPills.push({ label: `Overdue: ${summaryData.followUpOverdueDays} days`, tone: "warning" })
  }
  if (summaryData.labFlagCount > 0) {
    concernPills.push({ label: `${summaryData.labFlagCount} abnormal lab results`, tone: "error" })
  }
  if (clinicalView.dueItems.length > 0) {
    concernPills.push({ label: `${clinicalView.dueItems.length} due items`, tone: "warning" })
  }
  if (concernPills.length === 0) {
    concernPills.push({ label: "No immediate critical alerts", tone: "success" })
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="h-[42px] w-full rounded-[12px] border-[0.5px] border-tp-slate-200 bg-white px-2.5 text-left"
      >
        <div className="flex h-full items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[10px] bg-tp-violet-100 text-tp-violet-600">
              <Stethoscope size={13} />
            </span>
            <p className="truncate text-[11px] font-semibold text-tp-slate-800">Patient Smart Summary</p>
            {concernPills[0] ? (
              <span
                className={cn(
                  "truncate rounded-full border-[0.5px] px-1.5 py-0.5 text-[9px] font-medium",
                  concernPills[0].tone === "error"
                    ? "border-tp-error-200 bg-tp-error-50 text-tp-error-700"
                    : concernPills[0].tone === "warning"
                      ? "border-tp-warning-200 bg-tp-warning-50 text-tp-warning-700"
                      : "border-tp-success-200 bg-tp-success-50 text-tp-success-700",
                )}
              >
                {concernPills[0].label}
              </span>
            ) : null}
          </div>
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 text-tp-slate-600">
            <ChevronDown size={12} />
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-[12px] border-[0.5px] border-tp-slate-200 bg-[linear-gradient(180deg,rgba(245,243,255,0.45)_0%,rgba(255,255,255,0.98)_22%,#fff_100%)]">
      <div className="sticky top-0 z-10 border-b border-tp-slate-100 bg-white px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex size-6 items-center justify-center rounded-[10px] bg-tp-violet-100 text-tp-violet-600">
              <Stethoscope size={13} />
            </span>
            <p className="text-[11px] font-semibold text-tp-slate-800">Patient Smart Summary</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 text-tp-slate-600"
            title="Collapse card"
            aria-label="Collapse card"
          >
            <ChevronUp size={12} />
          </button>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {concernPills.slice(0, 4).map((pill) => (
            <span
              key={pill.label}
              className={cn(
                "rounded-full border-[0.5px] px-2 py-0.5 text-[9px] font-medium",
                pill.tone === "error"
                  ? "border-tp-error-200 bg-tp-error-50 text-tp-error-700"
                  : pill.tone === "warning"
                    ? "border-tp-warning-200 bg-tp-warning-50 text-tp-warning-700"
                    : "border-tp-success-200 bg-tp-success-50 text-tp-success-700",
              )}
            >
              {pill.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2 p-2">
        {showSpecialtySnapshot ? (
          <div className={AI_INNER_SURFACE_CLASS}>
            <div className={AI_INNER_HEADER_CLASS}>
              <p className="text-[10px] font-semibold text-tp-slate-700">{specialtySnapshot.headline}</p>
            </div>
            <div className={AI_INNER_BODY_CLASS}>
              {specialtySnapshot.keyItems.slice(0, 3).map((item) => (
                <p key={item}>
                  <span className="text-tp-slate-400">•</span>
                  <span className="ml-1 font-medium text-tp-slate-700">{item}</span>
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <div className={AI_INNER_SURFACE_CLASS}>
          <div className={cn(AI_INNER_HEADER_CLASS, "flex items-center justify-between gap-2")}>
            <p className="text-[10px] font-semibold text-tp-slate-700">Current consultation essentials</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrentEssentialsCopyMenuOpen((prev) => !prev)}
                className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
                title="Copy options to RxPad"
                aria-label="Copy options to RxPad"
              >
                <Copy size={11} />
              </button>
              {currentEssentialsCopyMenuOpen ? (
                <div className="absolute right-0 top-[28px] z-20 w-[226px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => {
                      onCopy(currentEssentialsPayload, "Current consultation essentials copied to RxPad")
                      setCurrentEssentialsCopyMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                    title="Copy all current consultation essentials to RxPad"
                    aria-label="Copy all current consultation essentials to RxPad"
                  >
                    <ClipboardPlus size={11} className="text-tp-blue-600" />
                    Copy all current consultation essentials to RxPad
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className={AI_INNER_BODY_CLASS}>
            <div className={AI_ROW_GRID_CLASS}>
              <span className="text-tp-slate-400">•</span>
              <span className="text-tp-slate-500">Symptoms</span>
              <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                {symptomHighlights.map((item, index) => {
                  const token = parseTokenDetail(item)
                  return (
                    <span key={`${token.label}-${index}`}>
                      <span className="font-semibold text-tp-slate-700">{token.label}</span>
                      {token.detail ? (
                        <>
                          <span className="text-tp-slate-400"> (</span>
                          <span className="text-tp-slate-500">{token.detail}</span>
                          <span className="text-tp-slate-400">)</span>
                        </>
                      ) : null}
                      {index < symptomHighlights.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                    </span>
                  )
                })}
              </p>
              <button
                type="button"
                onClick={() => onCopy({ sourceDateLabel: "Current visit symptoms", symptoms: symptomHighlights }, "Symptoms copied to RxPad")}
                className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                title="Copy symptoms to RxPad"
                aria-label="Copy symptoms to RxPad"
              >
                <Copy size={10} />
              </button>
            </div>

            <div className={AI_ROW_GRID_CLASS}>
              <span className="text-tp-slate-400">•</span>
              <span className="text-tp-slate-500">Vitals</span>
              <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                {hasTodayVitals
                  ? currentVitalsTokens.map((token, index) => {
                      const spo2Value = token.label === "SpO2" ? Number(token.value.replace(/[^\d.]/g, "")) : Number.NaN
                      const showLowSpo2 = token.label === "SpO2" && !Number.isNaN(spo2Value) && spo2Value < 95
                      return (
                        <span key={`${token.label}-${index}`}>
                          <span className="text-tp-slate-500">{token.label}:</span>{" "}
                          <span className="font-medium text-tp-slate-700">{token.value}</span>
                          {showLowSpo2 ? <span className="ml-0.5 text-tp-error-600">↓</span> : null}
                          {index < currentVitalsTokens.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                        </span>
                      )
                    })
                  : "Not captured"}
              </p>
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    { sourceDateLabel: "Current visit vitals", vitals: vitalsSeedFromVitals(clinicalView.currentVitals) },
                    "Vitals copied to RxPad",
                  )
                }
                disabled={!hasTodayVitals}
                className={cn(
                  "opacity-0 transition-opacity group-hover/line:opacity-100",
                  HOVER_COPY_ICON_CLASS,
                  !hasTodayVitals && "cursor-not-allowed opacity-40",
                )}
                title="Copy vitals to RxPad"
                aria-label="Copy vitals to RxPad"
              >
                <Copy size={10} />
              </button>
            </div>

            <div className={AI_ROW_GRID_CLASS}>
              <span className="text-tp-slate-400">•</span>
              <span className="text-tp-slate-500">Medical history</span>
              <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                <span className="text-tp-slate-500">Chronic:</span>{" "}
                <span className="font-medium text-tp-slate-700">{chronicHighlights.length > 0 ? chronicHighlights.join(", ") : "None"}</span>
                <span className="mx-1 text-tp-slate-300">|</span>
                <span className="text-tp-slate-500">Allergies:</span>{" "}
                <span className="font-medium text-tp-slate-700">{allergyHighlights.length > 0 ? allergyHighlights.join(", ") : "None"}</span>
              </p>
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    {
                      sourceDateLabel: "Medical history context",
                      additionalNotes: historyLineForCopy,
                    },
                    "Medical history copied to RxPad",
                  )
                }
                className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                title="Copy medical history to RxPad"
                aria-label="Copy medical history to RxPad"
              >
                <Copy size={10} />
              </button>
            </div>

            {hasMeds ? (
              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Medications</span>
                <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                  {currentMedicationEntries.map((item, index) => (
                    <span key={`${item.name}-${index}`}>
                      <span className="font-semibold text-tp-slate-700">{item.name}</span>
                      {item.detail ? (
                        <>
                          <span className="text-tp-slate-400"> (</span>
                          <span className="text-tp-slate-500">{item.detail}</span>
                          <span className="text-tp-slate-400">)</span>
                        </>
                      ) : null}
                      {index < currentMedicationEntries.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                    </span>
                  ))}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      {
                        sourceDateLabel: "Current visit medications",
                        medications: clinicalView.currentMedications.map((med) => ({
                          medicine: med,
                          unitPerDose: "-",
                          frequency: "-",
                          when: "-",
                          duration: "-",
                          note: "",
                        })),
                      },
                      "Medications copied to RxPad",
                    )
                  }
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy medications to RxPad"
                  aria-label="Copy medications to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>
            ) : null}

            {hasLabs ? (
              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Concerning lab results</span>
                <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                  {labHighlights.map((lab, index) => (
                    <span key={lab.name}>
                      <span className="text-tp-slate-500">{lab.name}:</span>{" "}
                      <span className={cn("font-medium", lab.flag === "high" ? "text-tp-error-600" : "text-tp-warning-700")}>
                        {lab.flag === "high" ? "↑" : "↓"} {lab.value}
                      </span>
                      {index < labHighlights.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                    </span>
                  ))}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      { sourceDateLabel: "Current lab highlights", labInvestigations: labHighlights.map((lab) => lab.name) },
                      "Lab highlights copied to RxPad",
                    )
                  }
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy lab highlights to RxPad"
                  aria-label="Copy lab highlights to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className={AI_INNER_SURFACE_CLASS}>
          <div className={cn(AI_INNER_HEADER_CLASS, "flex items-center justify-between gap-2")}>
            <p className="text-[10px] font-semibold text-tp-slate-700">Last visit essentials ({latestVisit?.date ?? "No record"})</p>
            {latestVisit ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLastVisitCopyMenuOpen((prev) => !prev)}
                  className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
                  title="Copy options to RxPad"
                  aria-label="Copy options to RxPad"
                >
                  <Copy size={11} />
                </button>
                {lastVisitCopyMenuOpen ? (
                  <div className="absolute right-0 top-[28px] z-20 w-[210px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => {
                        onCopy(
                          {
                            sourceDateLabel: `Last visit ${latestVisit.date}`,
                            symptoms: lastVisitSymptomTokens,
                            examinations: [latestVisit.examination],
                            diagnoses: [latestVisit.diagnosis],
                            medications: lastVisitMedications.map((med) => ({
                              medicine: med,
                              unitPerDose: "-",
                              frequency: "-",
                              when: "-",
                              duration: "-",
                              note: "",
                            })),
                            labInvestigations: latestVisit.labTestsSuggested.split(",").map((item) => item.trim()),
                            followUp: latestVisit.followUp,
                          },
                          "Complete visit Rx copied to RxPad",
                        )
                        setLastVisitCopyMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                      title="Copy complete Rx to RxPad"
                      aria-label="Copy complete Rx to RxPad"
                    >
                      <ClipboardPlus size={11} className="text-tp-blue-600" />
                      Copy complete Rx to RxPad
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCopy(
                          {
                            sourceDateLabel: `Last visit ${latestVisit.date}`,
                            medications: lastVisitMedications.map((med) => ({
                              medicine: med,
                              unitPerDose: "-",
                              frequency: "-",
                              when: "-",
                              duration: "-",
                              note: "",
                            })),
                          },
                          "Medications copied to RxPad",
                        )
                        setLastVisitCopyMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                      title="Copy medications to RxPad"
                      aria-label="Copy medications to RxPad"
                    >
                      <Pill size={11} className="text-tp-blue-600" />
                      Copy medications to RxPad
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          {latestVisit ? (
            <div className={AI_INNER_BODY_CLASS}>
              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Vitals</span>
                <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                  {lastVisitVitalsTokens.length > 0
                    ? lastVisitVitalsTokens.map((token, index) => {
                        const spo2Value = token.label === "SpO2" ? Number(token.value.replace(/[^\d.]/g, "")) : Number.NaN
                        const showLowSpo2 = token.label === "SpO2" && !Number.isNaN(spo2Value) && spo2Value < 95
                        return (
                          <span key={`${token.label}-${index}`}>
                            <span className="text-tp-slate-500">{token.label}:</span>{" "}
                            <span className="font-medium text-tp-slate-700">{token.value}</span>
                            {showLowSpo2 ? <span className="ml-0.5 text-tp-error-600">↓</span> : null}
                            {index < lastVisitVitalsTokens.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                          </span>
                        )
                      })
                    : "Not documented"}
                </p>
                <button
                  type="button"
                  onClick={() => onCopy({ sourceDateLabel: `Last visit ${latestVisit.date}`, additionalNotes: `Vitals: ${latestVisit.vitals}` }, "Vitals copied to RxPad")}
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy last-visit vitals to RxPad"
                  aria-label="Copy last-visit vitals to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>

              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Medical history</span>
                <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                  <span className="text-tp-slate-500">Chronic:</span>{" "}
                  <span className="font-medium text-tp-slate-700">{chronicHighlights.length > 0 ? chronicHighlights.join(", ") : "None"}</span>
                  <span className="mx-1 text-tp-slate-300">|</span>
                  <span className="text-tp-slate-500">Allergies:</span>{" "}
                  <span className="font-medium text-tp-slate-700">{allergyHighlights.length > 0 ? allergyHighlights.join(", ") : "None"}</span>
                </p>
                <button
                  type="button"
                  onClick={() => onCopy({ sourceDateLabel: `Last visit ${latestVisit.date}`, additionalNotes: historyLineForCopy }, "Medical history copied to RxPad")}
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy medical history to RxPad"
                  aria-label="Copy medical history to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>

              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Symptoms</span>
                <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                  {lastVisitSymptomTokens.length > 0
                    ? lastVisitSymptomTokens.map((item, index) => {
                        const token = parseTokenDetail(item)
                        return (
                          <span key={`${token.label}-${index}`}>
                            <span className="font-semibold text-tp-slate-700">{token.label}</span>
                            {token.detail ? (
                              <>
                                <span className="text-tp-slate-400"> (</span>
                                <span className="text-tp-slate-500">{token.detail}</span>
                                <span className="text-tp-slate-400">)</span>
                              </>
                            ) : null}
                            {index < lastVisitSymptomTokens.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                          </span>
                        )
                      })
                    : "Not documented"}
                </p>
                <button
                  type="button"
                  onClick={() => onCopy({ sourceDateLabel: `Last visit ${latestVisit.date}`, symptoms: lastVisitSymptomTokens }, "Symptoms copied to RxPad")}
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy last-visit symptoms to RxPad"
                  aria-label="Copy last-visit symptoms to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>

              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Examination</span>
                <p className="min-w-0 leading-4 text-[10px] font-medium text-tp-slate-700">
                  {latestVisit.examination}
                </p>
                <button
                  type="button"
                  onClick={() => onCopy({ sourceDateLabel: `Last visit ${latestVisit.date}`, examinations: [latestVisit.examination] }, "Examination copied to RxPad")}
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy last-visit examination to RxPad"
                  aria-label="Copy last-visit examination to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>

              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Diagnosis</span>
                <p className="min-w-0 leading-4 text-[10px] font-medium text-tp-slate-800">
                  {latestVisit.diagnosis}
                </p>
                <button
                  type="button"
                  onClick={() => onCopy({ sourceDateLabel: `Last visit ${latestVisit.date}`, diagnoses: [latestVisit.diagnosis] }, "Diagnosis copied to RxPad")}
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy last-visit diagnosis to RxPad"
                  aria-label="Copy last-visit diagnosis to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>

              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Medications</span>
                <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                  {lastVisitMedicationEntries.length > 0
                    ? lastVisitMedicationEntries.map((item, index) => (
                        <span key={`${item.name}-${index}`}>
                          <span className="font-semibold text-tp-slate-700">{item.name}</span>
                          {item.detail ? (
                            <>
                              <span className="text-tp-slate-400"> (</span>
                              <span className="text-tp-slate-500">{item.detail}</span>
                              <span className="text-tp-slate-400">)</span>
                            </>
                          ) : null}
                          {index < lastVisitMedicationEntries.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                        </span>
                      ))
                    : "Not documented"}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      {
                        sourceDateLabel: `Last visit ${latestVisit.date}`,
                        medications: lastVisitMedications.map((med) => ({
                          medicine: med,
                          unitPerDose: "-",
                          frequency: "-",
                          when: "-",
                          duration: "-",
                          note: "",
                        })),
                      },
                      "Last-visit medications copied to RxPad",
                    )
                  }
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy last-visit medications to RxPad"
                  aria-label="Copy last-visit medications to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>

              <div className={AI_ROW_GRID_CLASS}>
                <span className="text-tp-slate-400">•</span>
                <span className="text-tp-slate-500">Lab tests</span>
                <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
                  <span className="font-medium text-tp-slate-700">{latestVisit.labTestsSuggested}</span>
                </p>
                <button
                  type="button"
                  onClick={() => onCopy({ sourceDateLabel: `Last visit ${latestVisit.date}`, labInvestigations: latestVisit.labTestsSuggested.split(",").map((item) => item.trim()) }, "Lab tests copied to RxPad")}
                  className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                  title="Copy last-visit lab tests to RxPad"
                  aria-label="Copy last-visit lab tests to RxPad"
                >
                  <Copy size={10} />
                </button>
              </div>
            </div>
          ) : (
            <p className="px-2 py-1 text-[10px] text-tp-slate-500">No previous visit summary available.</p>
          )}
        </div>

        {activeSpecialty === "gp" && summaryData.concernTrend && summaryData.labFlagCount > 0 ? (
          <div className={AI_INNER_SURFACE_CLASS}>
            <div className={cn(AI_INNER_HEADER_CLASS, "flex items-center justify-between gap-2")}>
              <p className="text-[10px] font-semibold text-tp-slate-700">{summaryData.concernTrend.label}</p>
              <span className="rounded-full border-[0.5px] border-tp-warning-200 bg-tp-warning-50 px-1.5 py-0.5 text-[9px] font-semibold text-tp-warning-700">
                Highlighted
              </span>
            </div>
            <div className="px-2 py-1.5">
              <MiniLineGraph
                values={summaryData.concernTrend.values}
                labels={summaryData.concernTrend.labels}
                tone={summaryData.concernTrend.tone ?? "violet"}
              />
            </div>
          </div>
        ) : null}

        {expanded ? (
          <div className="space-y-2">
            {(summaryData.familyHistory?.length ?? 0) > 0 || (summaryData.lifestyleNotes?.length ?? 0) > 0 ? (
              <div className={AI_INNER_SURFACE_CLASS}>
                <div className={cn(AI_INNER_HEADER_CLASS, "flex items-center justify-between gap-2")}>
                  <p className="text-[10px] font-semibold text-tp-slate-700">Additional history context</p>
                  {additionalHistoryNotes ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAdditionalHistoryCopyMenuOpen((prev) => !prev)}
                        className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
                        title="Copy options to RxPad"
                        aria-label="Copy options to RxPad"
                      >
                        <Copy size={11} />
                      </button>
                      {additionalHistoryCopyMenuOpen ? (
                        <div className="absolute right-0 top-[28px] z-20 w-[220px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => {
                              onCopy(
                                {
                                  sourceDateLabel: "Additional history context",
                                  targetSection: "history",
                                  additionalNotes: additionalHistoryNotes,
                                },
                                "Additional history copied to RxPad",
                              )
                              setAdditionalHistoryCopyMenuOpen(false)
                            }}
                            className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                            title="Copy all additional history to RxPad"
                            aria-label="Copy all additional history to RxPad"
                          >
                            <ClipboardPlus size={11} className="text-tp-blue-600" />
                            Copy all additional history to RxPad
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className={AI_INNER_BODY_CLASS}>
                {(summaryData.familyHistory?.length ?? 0) > 0 ? (
                    <div className="group/line grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5">
                      <span className="text-tp-slate-400">•</span>
                      <p className="leading-4 text-tp-slate-700">
                        <span className="text-tp-slate-500">Family history</span>
                        <span className="mx-1 text-tp-slate-300">|</span>
                        <span className="font-medium">{summaryData.familyHistory!.join(", ")}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onCopy(
                            {
                              sourceDateLabel: "Additional history context",
                              targetSection: "history",
                              additionalNotes: `Family history: ${summaryData.familyHistory!.join(", ")}`,
                            },
                            "Family history copied to RxPad",
                          )
                        }
                        className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                        title="Copy family history to RxPad"
                        aria-label="Copy family history to RxPad"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                ) : null}
                {(summaryData.lifestyleNotes?.length ?? 0) > 0 ? (
                    <div className="group/line grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5">
                      <span className="text-tp-slate-400">•</span>
                      <p className="leading-4 text-tp-slate-700">
                        <span className="text-tp-slate-500">Lifestyle</span>
                        <span className="mx-1 text-tp-slate-300">|</span>
                        <span className="font-medium">{summaryData.lifestyleNotes!.join(", ")}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onCopy(
                            {
                              sourceDateLabel: "Additional history context",
                              targetSection: "history",
                              additionalNotes: `Lifestyle: ${summaryData.lifestyleNotes!.join(", ")}`,
                            },
                            "Lifestyle context copied to RxPad",
                          )
                        }
                        className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                        title="Copy lifestyle context to RxPad"
                        aria-label="Copy lifestyle context to RxPad"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                ) : null}
                </div>
              </div>
            ) : null}

            {(summaryData.recordAlerts?.length ?? 0) > 0 ? (
              <div className={AI_INNER_SURFACE_CLASS}>
                <div className={cn(AI_INNER_HEADER_CLASS, "flex items-center justify-between gap-2")}>
                  <p className="text-[10px] font-semibold text-tp-slate-700">Medical record highlights</p>
                  {recordHighlightNotes ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setRecordHighlightsCopyMenuOpen((prev) => !prev)}
                        className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
                        title="Copy options to RxPad"
                        aria-label="Copy options to RxPad"
                      >
                        <Copy size={11} />
                      </button>
                      {recordHighlightsCopyMenuOpen ? (
                        <div className="absolute right-0 top-[28px] z-20 w-[224px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => {
                              onCopy(
                                {
                                  sourceDateLabel: "Medical record highlights",
                                  targetSection: "medicalRecords",
                                  additionalNotes: recordHighlightNotes,
                                },
                                "Medical record highlights copied to RxPad",
                              )
                              setRecordHighlightsCopyMenuOpen(false)
                            }}
                            className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[10px] text-tp-slate-700 hover:bg-tp-slate-50"
                            title="Copy all medical record highlights to RxPad"
                            aria-label="Copy all medical record highlights to RxPad"
                          >
                            <ClipboardPlus size={11} className="text-tp-blue-600" />
                            Copy all medical record highlights to RxPad
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className={AI_INNER_BODY_CLASS}>
                  {summaryData.recordAlerts!.slice(0, 3).map((item) => (
                    <div key={item} className="group/line grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5">
                      <span className="text-tp-slate-400">•</span>
                      <p className="leading-4 text-[10px] text-tp-slate-700">{item}</p>
                      <button
                        type="button"
                        onClick={() =>
                          onCopy(
                            {
                              sourceDateLabel: "Medical record highlights",
                              targetSection: "medicalRecords",
                              additionalNotes: item,
                            },
                            "Medical record highlight copied to RxPad",
                          )
                        }
                        className={cn("opacity-0 transition-opacity group-hover/line:opacity-100", HOVER_COPY_ICON_CLASS)}
                        title="Copy medical record highlight to RxPad"
                        aria-label="Copy medical record highlight to RxPad"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full rounded-[8px] border-[0.5px] border-transparent px-2 py-1 text-center text-[10px] font-semibold text-tp-blue-600 hover:border-tp-blue-200 hover:bg-tp-blue-50"
        >
          {expanded ? "Show less details" : "Show more details"}
        </button>

        <div className="overflow-x-auto pb-0.5">
          <div className="inline-flex min-w-max gap-1">
            <button type="button" onClick={() => onQuickSend("Compare last visit with current findings")} className={AI_INLINE_PROMPT_CLASS}>
              Compare last visit
            </button>
            <button type="button" onClick={() => onQuickSend("Show abnormal labs and likely clinical impact")} className={AI_INLINE_PROMPT_CLASS}>
              Review abnormal labs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntakeSection({
  title,
  items,
  sectionCopyLabel,
  lineCopyLabel,
  tone = "neutral",
  onCopy,
}: {
  title: string
  items: Array<{ id: string; line: string; detail: string; severity: "high" | "moderate" | "low" }>
  sectionCopyLabel: string
  lineCopyLabel: string
  tone?: "neutral" | "violet" | "teal"
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const surfaceToneClass =
    tone === "violet"
      ? "bg-tp-slate-50/85"
      : tone === "teal"
        ? "bg-tp-slate-50/85"
        : "bg-tp-slate-50/85"

  return (
    <div className={cn("group/section", AI_INNER_SURFACE_CLASS, surfaceToneClass)}>
      <div className={cn(AI_INNER_HEADER_CLASS, "flex items-center justify-between gap-2")}>
        <p className="text-[10px] font-semibold text-tp-slate-700">{title}</p>
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                sourceDateLabel: "Symptom collector",
                symptoms: items.map((item) => item.line),
                additionalNotes: `${title}: ${items.map((item) => `${item.line} (${item.detail})`).join("; ")}`,
              },
              sectionCopyLabel,
            )
          }
          className="inline-flex size-6 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:border-tp-blue-300 hover:text-tp-blue-600"
          title={`Copy all ${title.toLowerCase()} to RxPad`}
          aria-label={`Copy all ${title.toLowerCase()} to RxPad`}
        >
          <Copy size={11} />
        </button>
      </div>
      <div className={AI_INNER_BODY_CLASS}>
        {items.map((item) => (
          <div key={item.id} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5">
            <span className="text-tp-slate-400">•</span>
            <p className="min-w-0 leading-4 text-[10px] text-tp-slate-600">
              <span className={cn(title.toLowerCase().includes("symptom") ? "font-semibold text-tp-slate-700" : "text-tp-slate-500")}>{item.line}</span>
              <span className="text-tp-slate-400"> (</span>
              {item.detail.split("|").map((chunk, index, arr) => {
                const token = chunk.trim()
                const tokenMatch = token.match(/^([^:]+:)\s*(.+)$/)
                return (
                  <span key={`${item.id}-${index}`}>
                    {tokenMatch ? (
                      <>
                        <span className="text-tp-slate-500">{tokenMatch[1]}</span>{" "}
                        <span className="font-medium text-tp-slate-700">{tokenMatch[2]}</span>
                      </>
                    ) : (
                      <span className="font-medium text-tp-slate-700">{token}</span>
                    )}
                    {index < arr.length - 1 ? <span className="mx-1 text-tp-slate-300">|</span> : null}
                  </span>
                )
              })}
              <span className="text-tp-slate-400">)</span>
            </p>
            <button
              type="button"
              onClick={() =>
                onCopy(
                  {
                    sourceDateLabel: "Symptom collector line",
                    symptoms: [item.line],
                    additionalNotes: `${item.line} (${item.detail})`,
                  },
                  `${lineCopyLabel}: ${item.line}`,
                )
              }
              className={cn("opacity-0 transition-opacity group-hover/row:opacity-100", HOVER_COPY_ICON_CLASS)}
              title={`Copy ${item.line} to RxPad`}
              aria-label={`Copy ${item.line} to RxPad`}
            >
              <Copy size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SymptomCollectorCard({
  onCopy,
  onQuickSend,
}: {
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="flex h-[42px] w-full items-center justify-between rounded-[12px] border-[0.5px] border-tp-slate-200 bg-white px-2.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-[8px] bg-tp-violet-100 text-tp-violet-600">
            <Activity size={12} />
          </span>
          <p className="truncate text-[11px] font-semibold text-tp-slate-800">Symptoms and medical history from patient</p>
        </div>
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 text-tp-slate-600">
          <ChevronDown size={12} />
        </span>
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-[12px] border-[0.5px] border-tp-slate-200 bg-[linear-gradient(180deg,rgba(245,243,255,0.45)_0%,rgba(255,255,255,0.98)_22%,#fff_100%)]">
      <div className="flex items-center justify-between gap-2 border-b border-tp-slate-100 px-2.5 py-2">
        <div className="min-w-0 flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-[8px] bg-tp-violet-100 text-tp-violet-600">
            <Activity size={12} />
          </span>
          <p className="truncate text-[11px] font-semibold text-tp-slate-800">Symptoms and medical history from patient</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-[8px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 text-tp-slate-600"
          aria-label="Collapse patient-provided details"
        >
          <ChevronUp size={12} />
        </button>
      </div>

      <div className="space-y-2 p-2">
        <IntakeSection
          title="Current symptoms"
          items={SYMPTOM_COLLECTOR_SYMPTOMS}
          sectionCopyLabel="All symptoms copied to RxPad"
          lineCopyLabel="Copied to RxPad (Symptoms)"
          tone="violet"
          onCopy={onCopy}
        />
        <IntakeSection
          title="Provided medical history"
          items={SYMPTOM_COLLECTOR_HISTORY}
          sectionCopyLabel="Medical history copied to RxPad (History)"
          lineCopyLabel="Copied to RxPad (History)"
          tone="teal"
          onCopy={(payload, msg) =>
            onCopy(
              {
                ...payload,
                targetSection: "history",
                symptoms: undefined,
                additionalNotes: payload.additionalNotes,
              },
              msg,
            )
          }
        />
      </div>

      <div className="mt-1 overflow-x-auto px-2 pb-2">
        <div className="inline-flex min-w-max gap-1">
          <button type="button" onClick={() => onQuickSend("Review patient-provided symptoms and prioritize clinical relevance")} className={AI_INLINE_PROMPT_CLASS}>
            Review symptoms
          </button>
          <button type="button" onClick={() => onQuickSend("Summarize patient-provided medical history for this visit")} className={AI_INLINE_PROMPT_CLASS}>
            Review medical history
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── OCR Report Card ───
function OcrReportCard({
  data,
  onCopy,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "ocr_report" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const flaggedCount = data.parameters.filter((p) => p.flag !== "normal").length
  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className={AI_INNER_SURFACE_CLASS}>
        <div className="flex items-center gap-1.5 border-b border-tp-slate-100 bg-gradient-to-r from-[#0d948810] to-[#0d948805] px-2.5 py-1.5">
          <span className="size-[6px] rounded-full bg-[#0D9488]" />
          <span className="text-[10px] font-semibold text-[#0D9488]">📄 {data.title}</span>
          {flaggedCount > 0 && (
            <span className="ml-auto text-[9px] font-semibold text-tp-error-600">{flaggedCount} flagged</span>
          )}
        </div>
        <div className="px-2 py-1.5">
          {/* Table header */}
          <div className="mb-1 grid grid-cols-[minmax(0,1fr)_60px_48px_20px] gap-x-1 border-b-2 border-tp-slate-100 pb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-tp-slate-400">Parameter</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-tp-slate-400">Ref</span>
            <span className="text-right text-[9px] font-bold uppercase tracking-wider text-tp-slate-400">Value</span>
            <span className="text-center text-[9px] font-bold uppercase tracking-wider text-tp-slate-400">⚑</span>
          </div>
          {/* Parameter rows */}
          {data.parameters.map((param) => (
            <div
              key={param.name}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_60px_48px_20px] items-center gap-x-1 border-b border-tp-slate-50 py-[3px]",
                (param.flag === "high" || param.flag === "critical") && "bg-tp-error-50/60 -mx-2 px-2",
                param.flag === "low" && "bg-tp-warning-50/60 -mx-2 px-2",
              )}
            >
              <span className={cn("text-[10px]", param.flag !== "normal" ? "font-semibold text-tp-slate-800" : "text-tp-slate-600")}>
                {param.name}
              </span>
              <span className="text-[9px] text-tp-slate-400">{param.reference}</span>
              <span
                className={cn(
                  "text-right text-[10px] font-semibold",
                  param.flag === "high" || param.flag === "critical" ? "text-tp-error-600" : param.flag === "low" ? "text-tp-warning-600" : "text-tp-slate-700",
                )}
              >
                {param.flag === "high" || param.flag === "critical" ? "↑" : param.flag === "low" ? "↓" : ""}
                {param.value}
              </span>
              <span className={cn("text-center text-[10px]", param.flag === "normal" ? "text-tp-success-600" : "text-tp-error-600")}>
                {param.flag === "normal" ? "✓" : param.flag === "high" ? "↑" : param.flag === "low" ? "↓" : "⚠"}
              </span>
            </div>
          ))}
          {/* Clinical insight */}
          {data.insight && (
            <div className="mt-2 rounded-[6px] bg-tp-error-50 px-2 py-1.5 text-[10px] font-medium text-tp-error-700">
              <strong>Alert:</strong> {data.insight}
            </div>
          )}
          {/* Action pills */}
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => onCopy(data.copyPayload, `OCR data copied to Lab Results`)}
              className="rounded-[42px] border border-tp-success-200 bg-tp-success-50 px-2 py-0.5 text-[9px] font-semibold text-tp-success-700 transition-colors hover:bg-tp-success-100"
            >
              📋 Copy to Lab Results
            </button>
            <button
              type="button"
              onClick={() => onQuickSend("Compare previous CBC")}
              className="rounded-[42px] border border-tp-blue-200 bg-tp-blue-50 px-2 py-0.5 text-[9px] font-semibold text-tp-blue-700 transition-colors hover:bg-tp-blue-100"
            >
              📊 Compare prev CBC
            </button>
            <button
              type="button"
              className="rounded-[42px] border border-tp-slate-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-tp-slate-600 transition-colors hover:bg-tp-slate-50"
            >
              📄 Original PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RxOutputRenderer({
  rxOutput,
  output,
  onCopy,
  onQuickSend,
  onAcceptDiagnosis,
}: {
  rxOutput?: RxAgentOutput
  output?: AgentDynamicOutput
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
  onAcceptDiagnosis: (diagnoses: string[]) => void
}) {
  if (rxOutput?.kind === "last_visit") {
    return <LastVisitCard data={rxOutput.data} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "visit_selector") {
    return <VisitSummarySelectorCard dates={rxOutput.dates} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "multi_last_visit") {
    return <MultiVisitSummaryCard visits={rxOutput.visits} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "visit_compare") {
    return <VisitCompareCard data={rxOutput} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "abnormal_findings") {
    return <AbnormalFindingsCard data={rxOutput} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "vitals_trend") {
    return <VitalsTrendCard data={rxOutput} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "lab_panel") {
    return <LabPanelCard data={rxOutput} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "ddx") {
    return <DdxCard data={rxOutput} onAccept={onAcceptDiagnosis} onQuickSend={onQuickSend} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "investigation_bundle") {
    return <InvestigationBundleCard data={rxOutput} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "advice_bundle") {
    return <AdviceBundleCard data={rxOutput} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "follow_up_bundle") {
    return <FollowUpBundleCard data={rxOutput} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "cascade") {
    return <CascadeCard data={rxOutput} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "translation") {
    return <TranslationCard data={rxOutput} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "completeness") {
    return <CompletenessCard data={rxOutput} />
  }
  if (rxOutput?.kind === "med_history") {
    return <MedHistoryCard data={rxOutput} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "recurrence") {
    return <RecurrenceCard data={rxOutput} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "annual_panel") {
    return <AnnualPanelCard data={rxOutput} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "ocr_report") {
    return <OcrReportCard data={rxOutput} onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "ui_showcase") {
    return <UiShowcaseCard onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (output) {
    return <DynamicOutputCard output={output} onCopy={onCopy} />
  }
  return null
}

function formatMessageTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function AgentIntroCard({
  contextLabel,
  isPatientContext,
}: {
  contextLabel: string
  isPatientContext: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[10px]" style={{ background: AI_GRADIENT_SOFT }}>
        <AiBrandSparkIcon size={13} />
      </span>
      <div className="max-w-[88%] text-[12px] leading-[18px] text-tp-slate-700">
        <p>
          {isPatientContext
            ? "Hi Doctor, patient snapshot is ready. Ask anything and I will assist with concise support."
            : `Hi Doctor, you are in ${contextLabel}. I can help with operational guidance until you switch to a patient chart.`}
        </p>
      </div>
    </div>
  )
}

export function RxPadFloatingAgent({ onClose }: { onClose: () => void }) {
  const { requestCopyToRxPad, lastSignal } = useRxPadSync()

  const [selectedContextId, setSelectedContextId] = useState(CONTEXT_PATIENT_ID)
  const [threads, setThreads] = useState<Record<string, RxAgentChatMessage[]>>(() => buildInitialThreads())
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [specialtyMenuOpen, setSpecialtyMenuOpen] = useState(false)
  const [contextSearch, setContextSearch] = useState("")
  const [pendingReplies, setPendingReplies] = useState<Record<string, number>>({})
  const [consultPhaseByContext, setConsultPhaseByContext] = useState<Record<string, ConsultPhase>>({
    [CONTEXT_PATIENT_ID]: "empty",
  })
  const [lensByContext, setLensByContext] = useState<Record<string, RxTabLens>>({
    [CONTEXT_PATIENT_ID]: "dr-agent",
  })
  const [specialtyByContext, setSpecialtyByContext] = useState<Record<string, SpecialtyTabId>>({
    [CONTEXT_PATIENT_ID]: "gp",
  })
  const [hasInteractionAlert, setHasInteractionAlert] = useState(false)
  const [summaryCollapsedByContext, setSummaryCollapsedByContext] = useState<Record<string, boolean>>({})
  const [hasRxpadSymptomsByContext, setHasRxpadSymptomsByContext] = useState<Record<string, boolean>>({})
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "like" | "dislike">>({})
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingUpload, setIsProcessingUpload] = useState(false)
  const [showPiDropdown, setShowPiDropdown] = useState(false)
  const [piFilter, setPiFilter] = useState("")
  const [symptomCollectorCollapsed, setSymptomCollectorCollapsed] = useState(false)

  const timersRef = useRef<number[]>([])
  const voiceTimerRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const contextMenuRef = useRef<HTMLDivElement | null>(null)
  const specialtyMenuRef = useRef<HTMLDivElement | null>(null)
  const copyTimerRef = useRef<number | null>(null)
  const staleRotationRef = useRef<number | null>(null)
  const lastHandledSignalRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const piDropdownRef = useRef<HTMLDivElement | null>(null)

  const selectedContext = useMemo(
    () => RX_CONTEXT_OPTIONS.find((option) => option.id === selectedContextId) ?? RX_CONTEXT_OPTIONS[0],
    [selectedContextId],
  )

  const messages = useMemo(
    () => threads[selectedContextId] ?? [],
    [threads, selectedContextId],
  )
  const pending = pendingReplies[selectedContextId] ?? 0

  const isPatientContext = selectedContext.kind === "patient"
  const activeLens = lensByContext[selectedContextId] ?? "dr-agent"
  const activeSpecialty = specialtyByContext[selectedContextId] ?? "gp"
  const consultPhase = consultPhaseByContext[selectedContextId] ?? "empty"
  const summaryCollapsed = summaryCollapsedByContext[selectedContextId] ?? false
  const activeSummaryData =
    isPatientContext
      ? SMART_SUMMARY_BY_CONTEXT[selectedContextId] ?? SMART_SUMMARY_BY_CONTEXT[CONTEXT_PATIENT_ID]
      : undefined
  const summaryHasSymptoms = useMemo(() => {
    if (!isPatientContext || !activeSummaryData) return false
    return buildSpecialtyClinicalView(activeSpecialty, activeSummaryData).currentSymptoms.length > 0
  }, [isPatientContext, activeSummaryData, activeSpecialty])
  const hasRxpadSymptoms = hasRxpadSymptomsByContext[selectedContextId] ?? summaryHasSymptoms

  const basePills = useMemo(
    () =>
      buildPromptEngine({
        phase: consultPhase,
        lens: activeLens,
        isPatientContext,
        hasInteractionAlert,
        hasRxpadSymptoms,
        summaryData: activeSummaryData,
      }),
    [consultPhase, activeLens, isPatientContext, hasInteractionAlert, hasRxpadSymptoms, activeSummaryData],
  )

  const [promptSuggestions, setPromptSuggestions] = useState<PromptChip[]>(basePills)

  useEffect(() => {
    setPromptSuggestions(basePills)
  }, [basePills, selectedContextId])

  useEffect(() => {
    if (!isPatientContext) return
    applyPromptSuggestions(
      SPECIALTY_PROMPTS[activeSpecialty],
      selectedContextId,
      activeLens,
      consultPhase,
    )
  }, [activeSpecialty, isPatientContext, selectedContextId, activeLens, consultPhase])

  useEffect(() => {
    if (!lastSignal || lastSignal.id === lastHandledSignalRef.current) return
    lastHandledSignalRef.current = lastSignal.id

    const contextId = selectedContextId
    const currentLens = lensByContext[contextId] ?? "dr-agent"
    const currentPhase = consultPhaseByContext[contextId] ?? "empty"

    if (lastSignal.type === "section_focus" && lastSignal.sectionId) {
      const mappedLens = SECTION_LENS_MAP[lastSignal.sectionId]
      if (!mappedLens) return

      setLensByContext((prev) => ({ ...prev, [contextId]: mappedLens }))

      const sectionPromptMap: Record<string, string[]> = {
        gynec: ["Gynec highlights", "Cycle review", "Due checks"],
        obstetric: ["Obstetric highlights", "ANC due items", "Risk checks"],
        vitals: ["Vitals review", "Abnormal findings", "Trend view"],
        pastVisits: ["Last visit", "Compare past visit", "Recurrence check"],
        history: ["Chronic history", "Allergy safety", "Family/lifestyle context"],
        labResults: ["Abnormal findings", "Latest lab panel", "Compare lab panels"],
        medicalRecords: ["Latest document insights", "Abnormal OCR findings", "Older record lookup"],
        growth: ["Growth chart", "Due vaccine checks", "Pediatric risk cues"],
        vaccine: ["Vaccine due list", "Overdue vaccine alerts", "Care-plan reminders"],
      }

      applyPromptSuggestions(
        sectionPromptMap[lastSignal.sectionId] ?? (TAB_PROMPTS[mappedLens] ?? TAB_PROMPTS["dr-agent"]),
        contextId,
        mappedLens,
        currentPhase,
      )
      return
    }

    if (lastSignal.type === "symptoms_changed") {
      setHasRxpadSymptomsByContext((prev) => ({ ...prev, [contextId]: true }))
      const inferredLens = inferLensFromPrompt(`symptom ${lastSignal.label ?? ""}`, currentLens)
      const nextPhase = currentPhase === "empty" ? "symptoms_entered" : currentPhase
      setConsultPhaseByContext((prev) => ({ ...prev, [contextId]: nextPhase }))
      if (inferredLens !== currentLens) {
        setLensByContext((prev) => ({ ...prev, [contextId]: inferredLens }))
      }

      applyPromptSuggestions(
        [
          "Generate DDX",
          "Severity triage",
          "Last visit compare",
          lastSignal.label ? `Analyze symptom: ${lastSignal.label}` : "Analyze symptom",
        ],
        contextId,
        inferredLens,
        nextPhase,
      )
      return
    }

    if (lastSignal.type === "medications_changed") {
      const nextPhase: ConsultPhase = "meds_written"
      setConsultPhaseByContext((prev) => ({ ...prev, [contextId]: nextPhase }))
      applyPromptSuggestions(
        [
          "Drug interaction check",
          "Dose and duration review",
          "Advice and counseling draft",
          lastSignal.label ? `Review: ${lastSignal.label}` : "Review latest medication",
        ],
        contextId,
        currentLens,
        nextPhase,
      )
      return
    }

    if (lastSignal.type === "sidebar_pill_tap" && lastSignal.label) {
      // Sidebar pill tap → inject the pill label as a user message in the chat
      sendMessage(lastSignal.label, "canned")
    }
  }, [lastSignal, selectedContextId, lensByContext, consultPhaseByContext])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
  }, [messages, pending, selectedContextId, summaryCollapsed])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!contextMenuRef.current?.contains(event.target as Node)) {
        setContextMenuOpen(false)
      }
      if (!specialtyMenuRef.current?.contains(event.target as Node)) {
        setSpecialtyMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  useEffect(() => {
    if (staleRotationRef.current) {
      window.clearTimeout(staleRotationRef.current)
    }

    staleRotationRef.current = window.setTimeout(() => {
      setPromptSuggestions((prev) => {
        if (prev.length < 2) return prev
        const [first, ...rest] = prev
        return [...rest, first]
      })
      staleRotationRef.current = null
    }, 60000)

    return () => {
      if (staleRotationRef.current) {
        window.clearTimeout(staleRotationRef.current)
        staleRotationRef.current = null
      }
    }
  }, [promptSuggestions])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current)
      }
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
      if (staleRotationRef.current) {
        window.clearTimeout(staleRotationRef.current)
      }
    }
  }, [])

  const filteredContextOptions = useMemo(() => {
    const q = contextSearch.trim().toLowerCase()
    if (!q) return RX_CONTEXT_OPTIONS
    return RX_CONTEXT_OPTIONS.filter(
      (option) => option.label.toLowerCase().includes(q) || option.meta.toLowerCase().includes(q),
    )
  }, [contextSearch])

  const todayOptions = filteredContextOptions.filter((option) => option.kind === "patient" && option.isToday)
  const otherOptions = filteredContextOptions.filter((option) => !(option.kind === "patient" && option.isToday))

  function pushMessage(contextId: string, message: RxAgentChatMessage) {
    setThreads((prev) => ({
      ...prev,
      [contextId]: [...(prev[contextId] ?? []), message],
    }))
  }

  function handleCopy(payload: RxPadCopyPayload, message: string) {
    requestCopyToRxPad(payload)
    setCopyFeedback(message)

    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current)
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopyFeedback(null)
      copyTimerRef.current = null
    }, 1500)
  }

  function updateManualSuggestions(text: string, contextId: string, lens: RxTabLens, phase: ConsultPhase) {
    const contextOption = RX_CONTEXT_OPTIONS.find((option) => option.id === contextId)
    const contextIsPatient = contextOption?.kind === "patient"
    const summaryData = contextIsPatient ? SMART_SUMMARY_BY_CONTEXT[contextId] ?? SMART_SUMMARY_BY_CONTEXT[CONTEXT_PATIENT_ID] : undefined
    const contextHasSymptoms = hasRxpadSymptomsByContext[contextId] ?? false

    const dynamic = deriveBehaviorAwarePrompts({
      text,
      lens,
      isPatientContext: Boolean(contextIsPatient),
      summaryData,
    })
    const dynamicPills: PromptChip[] = dynamic.map((label) => ({
      id: `dynamic-${label}`,
      label,
      tone: "primary",
    }))

    const merged = [
      ...buildPromptEngine({
        phase,
        lens,
        isPatientContext: contextIsPatient,
        hasInteractionAlert,
        hasRxpadSymptoms: contextHasSymptoms,
        summaryData,
      }),
      ...dynamicPills,
    ]
    setPromptSuggestions(Array.from(new Map(merged.map((pill) => [pill.label, pill])).values()).slice(0, 4))
  }

  function applyPromptSuggestions(labels: string[], contextId: string, lens: RxTabLens, phase: ConsultPhase) {
    const contextOption = RX_CONTEXT_OPTIONS.find((option) => option.id === contextId)
    const contextIsPatient = contextOption?.kind === "patient"
    const summaryData = contextIsPatient ? SMART_SUMMARY_BY_CONTEXT[contextId] ?? SMART_SUMMARY_BY_CONTEXT[CONTEXT_PATIENT_ID] : undefined
    const contextHasSymptoms = hasRxpadSymptomsByContext[contextId] ?? false

    const signalPills: PromptChip[] = labels.map((label) => ({
      id: `signal-${label}`,
      label,
      tone: "primary",
    }))

    const merged = [
      ...signalPills,
      ...buildPromptEngine({
        phase,
        lens,
        isPatientContext: contextIsPatient,
        hasInteractionAlert,
        hasRxpadSymptoms: contextHasSymptoms,
        summaryData,
      }),
    ]

    setPromptSuggestions(Array.from(new Map(merged.map((pill) => [pill.label, pill])).values()).slice(0, 5))
  }

  // ─── PI (Patient Information) dropdown categories ───
  const piCategories = useMemo(() => {
    if (!isPatientContext || !activeSummaryData) return []
    const s = activeSummaryData
    return [
      { id: "vitals", icon: "🩺", label: "Vitals", snippet: s.todayVitals ? `BP: ${s.todayVitals.bp}, SpO2: ${s.todayVitals.spo2}, Pulse: ${s.todayVitals.pulse}, Temp: ${s.todayVitals.temp}` : "No vitals recorded" },
      { id: "allergies", icon: "⚠️", label: "Allergies", snippet: s.allergies?.length ? s.allergies.join(", ") : "No known allergies" },
      { id: "conditions", icon: "🏥", label: "Chronic Conditions", snippet: s.chronicConditions?.length ? s.chronicConditions.join(", ") : "None on file" },
      { id: "meds", icon: "💊", label: "Active Medications", snippet: s.activeMeds?.length ? s.activeMeds.join(", ") : "No active medications" },
      { id: "last-visit", icon: "📋", label: "Last Visit", snippet: s.lastVisit ? `${s.lastVisit.date} · Dx: ${s.lastVisit.diagnosis} · Rx: ${s.lastVisit.medication}` : "No previous visits" },
      { id: "labs", icon: "🔬", label: "Lab Results", snippet: s.keyLabs?.length ? s.keyLabs.map((l) => `${l.name}: ${l.value}${l.flag !== "normal" ? ` (${l.flag})` : ""}`).join(", ") : "No lab data" },
      { id: "family", icon: "👨‍👩‍👧", label: "Family History", snippet: s.familyHistory?.length ? s.familyHistory.join(", ") : "No family history on file" },
    ]
  }, [isPatientContext, activeSummaryData])

  const filteredPiCategories = useMemo(() => {
    if (!piFilter) return piCategories
    const q = piFilter.toLowerCase()
    return piCategories.filter((c) => c.label.toLowerCase().includes(q) || c.snippet.toLowerCase().includes(q))
  }, [piCategories, piFilter])

  function handlePiSelect(category: (typeof piCategories)[0]) {
    setInputValue((prev) => `${prev}[${category.label}: ${category.snippet}] `.trimStart())
    setShowPiDropdown(false)
    setPiFilter("")
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    if (event.target) event.target.value = ""
  }

  function handleSendWithUpload() {
    if (!uploadedFile && !inputValue.trim()) return
    const fileName = uploadedFile?.name ?? ""
    const messageText = uploadedFile
      ? inputValue.trim()
        ? `📎 ${fileName} — ${inputValue.trim()}`
        : `📎 Uploaded: ${fileName}`
      : inputValue.trim()

    if (uploadedFile) {
      setIsProcessingUpload(true)
      sendMessage(messageText, "typed")
      const timer = window.setTimeout(() => {
        setIsProcessingUpload(false)
        const contextId = selectedContextId
        const assistantOcr = createAgentMessage(
          "assistant",
          `Document processed: ${fileName}. Found CBC panel with 2 flagged values.`,
        )
        pushMessage(contextId, {
          ...assistantOcr,
          rxOutput: {
            kind: "ocr_report",
            title: `CBC · Auto-OCR · 2 flagged`,
            reportType: "pathology",
            parameters: [
              { name: "Hemoglobin", value: "13.1", unit: "g/dL", reference: "13–17", flag: "normal" },
              { name: "WBC", value: "14,200", unit: "cells/mm³", reference: "4K–11K", flag: "high" },
              { name: "Platelets", value: "2.4L", unit: "/mm³", reference: "1.5–4.0L", flag: "normal" },
              { name: "ESR", value: "28", unit: "mm/hr", reference: "0–20", flag: "high" },
              { name: "RBC", value: "4.8", unit: "M/µL", reference: "4.5–5.5", flag: "normal" },
            ],
            insight: "WBC↑ + ESR↑ → active infection/inflammation markers",
            originalFileName: fileName,
            copyPayload: {
              sourceDateLabel: "OCR: " + fileName,
              targetSection: "labResults",
              labInvestigations: ["CBC"],
            },
          },
        })
      }, 1500)
      timersRef.current.push(timer)
      setUploadedFile(null)
    } else {
      sendMessage(messageText, "typed")
    }
    setInputValue("")
  }

  // Close PI dropdown on click outside
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (piDropdownRef.current && !piDropdownRef.current.contains(event.target as Node)) {
        setShowPiDropdown(false)
        setPiFilter("")
      }
    }
    if (showPiDropdown) {
      document.addEventListener("mousedown", onClickOutside)
      return () => document.removeEventListener("mousedown", onClickOutside)
    }
  }, [showPiDropdown])

  function sendMessage(rawMessage: string, source: "typed" | "canned" | "voice" = "typed") {
    const text = rawMessage.trim()
    if (!text) return

    const contextId = selectedContextId
    const contextOption = RX_CONTEXT_OPTIONS.find((option) => option.id === contextId)
    const currentLens = lensByContext[contextId] ?? "dr-agent"
    const inferredLens = inferLensFromPrompt(text, currentLens)
    const currentPhase = consultPhaseByContext[contextId] ?? "empty"
    const user = createAgentMessage("user", text)
    pushMessage(contextId, { ...user })
    setInputValue("")
    setSummaryCollapsedByContext((prev) => ({ ...prev, [contextId]: true }))

    if (inferredLens !== currentLens) {
      setLensByContext((prev) => ({ ...prev, [contextId]: inferredLens }))
    }

    if (source !== "canned") {
      updateManualSuggestions(text, contextId, inferredLens, currentPhase)
    }
    setPendingReplies((prev) => ({
      ...prev,
      [contextId]: (prev[contextId] ?? 0) + 1,
    }))

    const timer = window.setTimeout(() => {
      const payload =
        contextOption?.kind === "patient" && contextOption.patient
          ? buildRxAgentReply({
              prompt: text,
              patient: contextOption.patient,
              phase: currentPhase,
              lens: inferredLens,
            })
          : {
              reply: "Workspace mode is active. I can still provide Rx consultation guidance, checklists, and communication drafts.",
              output: {
                type: "generic" as const,
                title: "Workspace Guidance",
                subtitle: contextId === CONTEXT_COMMON_ID ? "Common context" : "No patient context",
                bullets: [
                  "Switch to patient context for chart-level actions",
                  "Use common mode for operational summaries",
                  "Voice, text, and canned prompts are available",
                ],
                actions: ["Switch to patient", "Keep workspace mode"],
              },
            }

      if (payload.raisesInteraction) {
        setHasInteractionAlert(true)
      }

      if (payload.nextPhase) {
        setConsultPhaseByContext((prev) => ({ ...prev, [contextId]: payload.nextPhase! }))
      } else {
        setConsultPhaseByContext((prev) => ({
          ...prev,
          [contextId]: inferPhaseFromMessage(text, prev[contextId] ?? "empty"),
        }))
      }

      const assistant = createAgentMessage("assistant", payload.reply, payload.output)
      pushMessage(contextId, { ...assistant, rxOutput: payload.rxOutput })

      setPendingReplies((prev) => {
        const next = { ...prev }
        const count = (next[contextId] ?? 1) - 1
        if (count <= 0) {
          delete next[contextId]
        } else {
          next[contextId] = count
        }
        return next
      })

      timersRef.current = timersRef.current.filter((id) => id !== timer)
    }, 520)

    timersRef.current.push(timer)
  }

  function handleMicClick() {
    if (isRecording) {
      setIsRecording(false)
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current)
      }
      sendMessage("Voice note: summarize this consultation context and suggest next actions.", "voice")
      return
    }

    setIsRecording(true)
    voiceTimerRef.current = window.setTimeout(() => {
      setIsRecording(false)
      sendMessage("Voice note: summarize this consultation context and suggest next actions.", "voice")
      voiceTimerRef.current = null
    }, 1800)
  }

  function applySpecialty(tabId: SpecialtyTabId) {
    setSpecialtyByContext((prev) => ({ ...prev, [selectedContextId]: tabId }))
    setLensByContext((prev) => ({
      ...prev,
      [selectedContextId]:
        tabId === "gp"
          ? "dr-agent"
          : tabId === "ophthal"
            ? "history"
            : "obstetric",
    }))
    setSpecialtyMenuOpen(false)
  }

  function handleAcceptDiagnosis(diagnoses: string[]) {
    if (diagnoses.length === 0) return
    handleCopy(
      {
        sourceDateLabel: "DDX accepted",
        diagnoses,
      },
      `${diagnoses.length} diagnoses added to Diagnosis`,
    )
    setConsultPhaseByContext((prev) => ({ ...prev, [selectedContextId]: "dx_accepted" }))
    sendMessage(`Protocol plan for ${diagnoses[0]}`, "canned")
  }

  return (
    <aside className="hidden h-full w-full md:block">
      <div className="flex h-full flex-col overflow-hidden rounded-[12px] border-[0.5px] border-tp-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-tp-slate-100 bg-white px-2.5 py-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
              <AiBrandSparkIcon size={14} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-tp-slate-900">Doctor Agent</p>
              <p className="truncate text-[10px] text-tp-slate-600">TypeRx consultation</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isPatientContext ? (
              <div ref={specialtyMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSpecialtyMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-tp-violet-300 bg-[linear-gradient(135deg,rgba(242,77,182,0.14)_0%,rgba(150,72,254,0.12)_52%,rgba(75,74,213,0.12)_100%)] px-2 py-0.5 text-[10px] font-medium text-tp-violet-700"
                >
                  {SPECIALTY_TABS.find((item) => item.id === activeSpecialty)?.label ?? "GP"}
                  <ChevronDown size={11} className="text-tp-violet-500" />
                </button>
                {specialtyMenuOpen && (
                  <div className="absolute right-0 top-[28px] z-30 w-[122px] overflow-hidden rounded-[10px] border-[0.5px] border-tp-slate-200 bg-white">
                    {SPECIALTY_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => applySpecialty(tab.id)}
                        className={cn(
                          "w-full px-2 py-1.5 text-left text-[10px]",
                          tab.id === activeSpecialty ? "bg-tp-violet-50 text-tp-violet-700" : "text-tp-slate-700 hover:bg-tp-slate-50",
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-6 items-center justify-center rounded-[8px] text-tp-slate-500 transition-colors hover:bg-white/70"
              aria-label="Close doctor agent"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[linear-gradient(180deg,rgba(244,247,252,0.98)_0%,rgba(255,255,255,0.96)_38%,rgba(248,250,252,0.98)_100%)]">
          <div ref={scrollRef} className="h-full overflow-y-auto px-3 pb-3 pt-2">
            <div className="sticky top-2 z-20 mb-3 space-y-1.5">
              <div ref={contextMenuRef} className="flex justify-center">
                <div className="relative">
                <button
                  type="button"
                  onClick={() => setContextMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-white/50 bg-white/60 px-2.5 py-1 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.5)] backdrop-blur-md"
                >
                  <span className="inline-flex size-4 items-center justify-center rounded-full bg-tp-slate-100 text-tp-slate-500">
                    <UserRound size={10} strokeWidth={2} />
                  </span>
                  <span className="max-w-[160px] truncate text-[10px] font-medium text-tp-slate-600">{selectedContext.label}</span>
                  <ChevronDown size={13} className="text-tp-slate-400" />
                </button>

                  {contextMenuOpen && (
                    <div className="absolute left-1/2 top-[34px] z-20 w-[278px] -translate-x-1/2 overflow-hidden rounded-xl border-[0.5px] border-tp-slate-200 bg-white">
                      <div className="border-b border-tp-slate-100 p-2">
                      <div className="relative">
                        <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-tp-slate-400" />
                        <input
                          value={contextSearch}
                          onChange={(event) => setContextSearch(event.target.value)}
                          placeholder="Search patient or context"
                          className="h-8 w-full rounded-[8px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 pl-7 pr-2.5 text-[11px] text-tp-slate-700 outline-none focus:border-tp-blue-300"
                        />
                      </div>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto p-1.5">
                        {todayOptions.length > 0 && (
                          <>
                            <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-tp-slate-400">Today's Appointments</p>
                            {todayOptions.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  setSelectedContextId(option.id)
                                  setContextMenuOpen(false)
                                }}
                                className={cn(
                                  "mb-1 w-full rounded-[8px] px-2 py-2 text-left transition-colors",
                                  option.id === selectedContextId ? "bg-tp-blue-50" : "hover:bg-tp-slate-50",
                                )}
                              >
                                <p className="truncate text-[11px] font-semibold text-tp-slate-700">{option.label}</p>
                                <p className="text-[10px] text-tp-slate-500">{option.meta}</p>
                              </button>
                            ))}
                          </>
                        )}
                        {otherOptions.length > 0 && (
                          <>
                            <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-tp-slate-400">Other Contexts</p>
                            {otherOptions.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  setSelectedContextId(option.id)
                                  setContextMenuOpen(false)
                                }}
                                className={cn(
                                  "mb-1 w-full rounded-[8px] px-2 py-2 text-left transition-colors",
                                  option.id === selectedContextId ? "bg-tp-blue-50" : "hover:bg-tp-slate-50",
                                )}
                              >
                                <p className="truncate text-[11px] font-semibold text-tp-slate-700">{option.label}</p>
                                <p className="text-[10px] text-tp-slate-500">{option.meta}</p>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <AgentIntroCard contextLabel={selectedContext.label} isPatientContext={isPatientContext} />

              {isPatientContext && activeSummaryData && (
                <div className="space-y-2">
                  <div className="ml-8 max-w-[86%]">
                    <SummaryCard
                      collapsed={summaryCollapsed}
                      onToggle={() => setSummaryCollapsedByContext((prev) => ({ ...prev, [selectedContextId]: !summaryCollapsed }))}
                      onCopy={handleCopy}
                      onQuickSend={(prompt) => sendMessage(prompt, "canned")}
                      summaryData={activeSummaryData}
                      activeSpecialty={activeSpecialty}
                    />
                  </div>
                  <div className="ml-8 max-w-[86%]">
                    <SymptomCollectorCard onCopy={handleCopy} onQuickSend={(prompt) => sendMessage(prompt, "canned")} />
                  </div>
                </div>
              )}

              {copyFeedback && (
                <div className="rounded-lg border-[0.5px] border-tp-success-200 bg-tp-success-50 px-2 py-1 text-[10px] font-semibold text-tp-success-700">
                  {copyFeedback}
                </div>
              )}

              {messages.map((message) => {
                const isUser = message.role === "user"
                const feedback = messageFeedback[message.id]
                return (
                  <div key={message.id} className="space-y-1.5">
                    <div className={cn("flex w-full items-start gap-2", isUser ? "justify-end" : "justify-start")}>
                      {!isUser && (
                        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
                          <AiBrandSparkIcon size={13} />
                        </span>
                      )}
                      <div
                        className={cn(
                          "max-w-[86%] px-3 py-2 text-[12px] leading-[18px]",
                          isUser
                            ? "rounded-[12px] rounded-br-[6px] border-[0.5px] border-tp-slate-200 bg-tp-slate-100 text-tp-slate-700"
                            : "rounded-none bg-transparent text-tp-slate-700",
                        )}
                      >
                        <p>{message.text}</p>
                        {isUser ? <p className="mt-1 text-[9px] text-tp-slate-500">{formatMessageTime(message.createdAt)}</p> : null}
                      </div>
                      {isUser && (
                        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-tp-slate-100 text-tp-slate-600">
                          <UserRound size={12} strokeWidth={2} />
                        </span>
                      )}
                    </div>
                    {!isUser && (message.output || message.rxOutput) && (
                      <div className="ml-8 max-w-[86%]">
                        <RxOutputRenderer
                          rxOutput={message.rxOutput}
                          output={message.output}
                          onCopy={handleCopy}
                          onQuickSend={(prompt) => sendMessage(prompt, "canned")}
                          onAcceptDiagnosis={handleAcceptDiagnosis}
                        />
                      </div>
                    )}
                    {!isUser && (
                      <div className="ml-8 flex items-center gap-1.5 text-[9px] text-tp-slate-400">
                        <span>{formatMessageTime(message.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setMessageFeedback((prev) => {
                              const next = { ...prev }
                              if (feedback === "like") {
                                delete next[message.id]
                              } else {
                                next[message.id] = "like"
                              }
                              return next
                            })
                          }
                          className={cn(
                            "inline-flex size-5 items-center justify-center rounded-[8px]",
                            feedback === "like"
                              ? "bg-tp-success-50 text-tp-success-700"
                              : "bg-tp-slate-100 text-tp-slate-500 hover:bg-tp-slate-200",
                          )}
                          aria-label="Like response"
                        >
                          <ThumbsUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setMessageFeedback((prev) => {
                              const next = { ...prev }
                              if (feedback === "dislike") {
                                delete next[message.id]
                              } else {
                                next[message.id] = "dislike"
                              }
                              return next
                            })
                          }
                          className={cn(
                            "inline-flex size-5 items-center justify-center rounded-[8px]",
                            feedback === "dislike"
                              ? "bg-tp-error-50 text-tp-error-600"
                              : "bg-tp-slate-100 text-tp-slate-500 hover:bg-tp-slate-200",
                          )}
                          aria-label="Dislike response"
                        >
                          <ThumbsDown size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {pending > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
                        <AiBrandSparkIcon size={13} />
                      </span>
                      <div className="inline-flex items-center gap-1.5 rounded-[12px] rounded-bl-[6px] border-[0.5px] border-tp-violet-100 bg-white px-3 py-2">
                        <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.2s]" />
                        <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.1s]" />
                        <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce" />
                      </div>
                    </div>
                  <div className="ml-8 max-w-[86%] rounded-[12px] border-[0.5px] border-tp-violet-100 bg-white p-2.5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
                        <AiBrandSparkIcon size={14} />
                      </span>
                      <p className="text-[11px] font-semibold text-tp-slate-700">Preparing structured response</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-[92%] rounded bg-tp-slate-100" />
                      <div className="h-2 w-[78%] rounded bg-tp-slate-100" />
                      <div className="h-2 w-[66%] rounded bg-tp-slate-100" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-tp-slate-100 bg-white/95 px-3 py-2.5 backdrop-blur-sm">
          {/* ── Prompt Pills ── */}
          <div className="mb-2 overflow-x-auto pb-1">
            <div className="inline-flex min-w-max items-center gap-1.5">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => sendMessage(prompt.label, "canned")}
                  className={cn(
                    "whitespace-nowrap transition-colors hover:bg-tp-violet-50/60",
                    AGENT_GRADIENT_CHIP_CLASS,
                    toneChipClass(prompt.tone),
                    prompt.force && "border-tp-error-200/90 text-tp-error-700",
                  )}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Upload Preview Chip ── */}
          {uploadedFile && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-[8px] border border-tp-blue-200 bg-tp-blue-50 px-2.5 py-1.5">
              <FileText size={13} className="text-tp-blue-500" />
              <span className="max-w-[200px] truncate text-[11px] font-medium text-tp-blue-700">{uploadedFile.name}</span>
              <button type="button" onClick={() => setUploadedFile(null)} className="text-tp-blue-400 hover:text-tp-blue-600">
                <X size={12} />
              </button>
            </div>
          )}

          {/* ── Processing indicator ── */}
          {isProcessingUpload && (
            <div className="mb-2 flex items-center gap-2 rounded-[8px] bg-tp-slate-50 px-2.5 py-1.5">
              <div className="size-3 animate-spin rounded-full border-2 border-tp-violet-300 border-t-transparent" />
              <span className="text-[11px] text-tp-slate-600">Processing document via OCR...</span>
            </div>
          )}

          {/* ── PI Dropdown (above input) ── */}
          {showPiDropdown && isPatientContext && (
            <div ref={piDropdownRef} className="mb-2 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white shadow-lg">
              <div className="border-b border-tp-slate-100 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-tp-slate-400">
                  <AtSign size={11} />
                  Insert patient context
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto py-1">
                {filteredPiCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handlePiSelect(cat)}
                    className="flex w-full items-start gap-2 px-2.5 py-2 text-left transition-colors hover:bg-tp-slate-50"
                  >
                    <span className="mt-0.5 text-[13px]">{cat.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-tp-slate-700">{cat.label}</p>
                      <p className="truncate text-[10px] text-tp-slate-500">{cat.snippet}</p>
                    </div>
                  </button>
                ))}
                {filteredPiCategories.length === 0 && (
                  <p className="px-2.5 py-2 text-center text-[10px] text-tp-slate-400">No matching categories</p>
                )}
              </div>
            </div>
          )}

          {/* ── Input Area: [📎] [@] [input] [🎤] [➤] ── */}
          <div className="flex items-center gap-1.5">
            {/* Upload button */}
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[0.5px] transition-colors",
                uploadedFile
                  ? "border-tp-blue-300 bg-tp-blue-50 text-tp-blue-500"
                  : "border-tp-slate-200 bg-white text-tp-slate-400 hover:bg-tp-slate-50 hover:text-tp-blue-500",
              )}
              aria-label="Upload document"
              title="Upload report (PDF, Image)"
            >
              <Paperclip size={14} strokeWidth={2} />
            </button>

            {/* PI context button */}
            {isPatientContext && (
              <button
                type="button"
                onClick={() => { setShowPiDropdown((prev) => !prev); setPiFilter("") }}
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[0.5px] transition-colors",
                  showPiDropdown
                    ? "border-tp-violet-300 bg-tp-violet-50 text-tp-violet-500"
                    : "border-tp-slate-200 bg-white text-tp-slate-400 hover:bg-tp-slate-50 hover:text-tp-violet-500",
                )}
                aria-label="Insert patient info"
                title="Insert patient data (@)"
              >
                <AtSign size={14} strokeWidth={2} />
              </button>
            )}

            {/* Text input */}
            <input
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value)
                if (event.target.value.endsWith("@") && isPatientContext) {
                  setShowPiDropdown(true)
                  setPiFilter("")
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleSendWithUpload()
                }
                if (event.key === "Escape" && showPiDropdown) {
                  setShowPiDropdown(false)
                }
              }}
              placeholder={uploadedFile ? "Add a note about this document..." : "Type a prompt for Doctor Agent"}
              className="h-9 min-w-0 flex-1 rounded-[10px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 px-3 text-[12px] text-tp-slate-700 outline-none transition-colors focus:border-tp-blue-300 focus:ring-1 focus:ring-tp-blue-100"
            />

            {/* Voice button */}
            <button
              type="button"
              onClick={handleMicClick}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[0.5px] transition-colors",
                isRecording
                  ? "border-tp-violet-300 bg-tp-violet-100 text-tp-violet-600"
                  : "border-tp-slate-200 bg-white text-tp-slate-600 hover:bg-tp-slate-50",
              )}
              aria-label={isRecording ? "Stop recording" : "Record audio prompt"}
            >
              <Mic size={14} strokeWidth={2} />
            </button>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSendWithUpload}
              disabled={!inputValue.trim() && !uploadedFile}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-colors",
                inputValue.trim() || uploadedFile
                  ? "bg-tp-blue-500 text-white shadow-sm hover:bg-tp-blue-600"
                  : "cursor-not-allowed bg-tp-slate-100 text-tp-slate-400",
              )}
              aria-label="Send prompt"
            >
              <SendHorizontal size={14} strokeWidth={2} />
            </button>
          </div>

          {/* ── Footer ── */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-tp-slate-500">
            <ShieldCheck size={11} className="text-tp-success-600" />
            <span>Encrypted. Patient details are stored securely and accessible only to this doctor.</span>
          </div>

          {isRecording && <p className="mt-1 text-[10px] font-medium text-tp-violet-600">Recording voice prompt...</p>}
        </div>
      </div>
    </aside>
  )
}

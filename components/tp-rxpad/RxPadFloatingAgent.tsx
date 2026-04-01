"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Baby,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  Copy,
  Droplets,
  FileText,
  FlaskConical,
  HeartPulse,
  Mic,
  Paperclip,
  Pill,
  Scale,
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
import { Heart, DocumentText1, Warning2, People, Notepad2, Calendar1 } from "iconsax-reactjs"

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
import { TPMedicalIcon } from "@/components/tp-ui/medical-icons/TPMedicalIcon"
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

interface CannedPill {
  id: string
  label: string
  icon?: React.ReactNode
  priority: number          // 0-99, lower = higher priority
  layer: 1 | 2 | 3 | 4
  force?: boolean            // Layer 1 safety = non-dismissible
  cooldownMs?: number        // Post-tap cooldown (default 3000ms)
  tone: "primary" | "info" | "warning" | "danger"
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
  | {
      kind: "allergy_conflict"
      drug: string
      allergy: string
      severity: "critical"
    }
  | {
      kind: "drug_interaction"
      drugA: string
      drugB: string
      description: string
      severity: "minor" | "moderate" | "severe"
    }
  | {
      kind: "protocol_meds"
      diagnosis: string
      meds: Array<{
        name: string
        dose: string
        route: string
        frequency: string
        safetyCheck: "ok" | "allergy_conflict" | "dose_warning"
      }>
      copyPayload: RxPadCopyPayload
    }
  | {
      kind: "patient_summary"
      summaryData: SmartSummaryData
      activeSpecialty: SpecialtyTabId
      patientGender?: string
      patientAge?: number
    }
  | {
      kind: "text_fact"
      icon: string
      fact: string
      source: string
    }
  | {
      kind: "text_alert"
      level: "critical" | "warning"
      message: string
      action?: string
    }
  | {
      kind: "text_list"
      title: string
      items: string[]
      max?: number
    }
  | {
      kind: "text_compare"
      label: string
      current: string
      previous: string
      delta: string
      deltaDirection: "up" | "down" | "same"
    }
  | {
      kind: "text_suggestion"
      suggestion: string
      rationale: string
      pills: string[]
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
    id: "apt-priya",
    label: "Priya Rao (F, 26y)",
    meta: "Appointment today",
    kind: "patient",
    isToday: true,
    patient: {
      id: "apt-priya",
      name: "Priya Rao",
      gender: "F",
      age: 26,
      visitType: "Follow-up",
    },
  },
  {
    id: "apt-arjun",
    label: "Arjun S (M, 4y)",
    meta: "Appointment today",
    kind: "patient",
    isToday: true,
    patient: {
      id: "apt-arjun",
      name: "Arjun S",
      gender: "M",
      age: 4,
      visitType: "Follow-up",
    },
  },
  {
    id: "apt-lakshmi",
    label: "Lakshmi K (F, 45y)",
    meta: "Appointment today",
    kind: "patient",
    isToday: true,
    patient: {
      id: "apt-lakshmi",
      name: "Lakshmi K",
      gender: "F",
      age: 45,
      visitType: "New",
    },
  },
  {
    id: "apt-zerodata",
    label: "Ramesh M (M, 35y)",
    meta: "Walk-in today",
    kind: "patient",
    isToday: true,
    patient: {
      id: "apt-zerodata",
      name: "Ramesh M",
      gender: "M",
      age: 35,
      visitType: "New",
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
    bp?: string
    pulse?: string
    spo2?: string
    temp?: string
    bmi?: string
    rr?: string
    weight?: string
    height?: string
    bmr?: string
    bsa?: string
    bloodSugar?: string
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
    allergies?: string[]
    lifestyle?: string[]
  }

  // --- Specialty-specific data blocks ---
  gynecData?: {
    menarche?: number
    cycleLength?: string
    cycleRegularity?: "Regular" | "Irregular"
    flowDuration?: string
    flowIntensity?: "Light" | "Moderate" | "Heavy"
    padsPerDay?: number
    painScore?: string
    lmp?: string
    lastPapSmear?: string
    alerts?: string[]
  }
  ophthalData?: {
    vaRight?: string
    vaLeft?: string
    nearVaRight?: string
    nearVaLeft?: string
    iop?: { right: string; left: string }
    slitLamp?: string
    fundus?: string
    lastExamDate?: string
    glassPrescription?: string
    alerts?: string[]
  }
  obstetricData?: {
    gravida?: number
    para?: number
    living?: number
    abortion?: number
    ectopic?: number
    lmp?: string
    edd?: string
    gestationalWeeks?: number
    presentation?: string
    fetalMovement?: string
    oedema?: boolean
    fundusHeight?: string
    amnioticFluid?: string
    lastExamDate?: string
    ancDue?: string[]
    vaccineStatus?: string
    alerts?: string[]
  }
  pediatricsData?: {
    ageDisplay?: string
    heightCm?: number
    heightPercentile?: string
    weightKg?: number
    weightPercentile?: string
    ofcCm?: number
    bmiPercentile?: string
    vaccinesPending?: number
    vaccinesOverdue?: number
    overdueVaccineNames?: string[]
    milestoneNotes?: string[]
    feedingNotes?: string
    lastGrowthDate?: string
    alerts?: string[]
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
      allergies: ["Dust", "NSAID sensitivity"],
      lifestyle: ["Sleep reduced ~5 hrs for 1 week", "Frequent outside food during travel"],
    },
    ophthalData: {
      vaRight: "6/9",
      vaLeft: "6/12",
      nearVaRight: "N6",
      nearVaLeft: "N8",
      slitLamp: "Mild conjunctival congestion bilateral, no corneal staining",
      fundus: "Normal disc and macula OU",
      lastExamDate: "12 Jan'26",
      alerts: ["Conjunctival symptoms (allergic conjunctivitis vs viral)"],
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
    gynecData: {
      menarche: 13,
      cycleLength: "28-30 days",
      cycleRegularity: "Regular",
      flowDuration: "4-5 days",
      flowIntensity: "Moderate",
      padsPerDay: 3,
      painScore: "3/10",
      lmp: "08 Feb'26",
      lastPapSmear: "15 Mar'25",
      alerts: [],
    },
    ophthalData: {
      vaRight: "6/6",
      vaLeft: "6/6",
      nearVaRight: "N8",
      nearVaLeft: "N8",
      slitLamp: "No abnormality detected",
      fundus: "Normal disc and macula OU",
      lastExamDate: "10 Oct'24",
      alerts: ["Digital eye strain (screen time > 8h/day, near VA slightly reduced)"],
    },
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
      rr: "18",
      weight: "78",
      height: "174",
      bmr: "1680",
      bsa: "1.94",
    },
    activeMeds: undefined,
    keyLabs: undefined,
    dueAlerts: ["Follow-up review overdue by 12 days"],
    recordAlerts: ["No new document uploaded in this visit yet."],
    concernTrend: undefined,
    ophthalData: {
      vaRight: "6/12",
      vaLeft: "6/18",
      nearVaRight: "N10",
      nearVaLeft: "N12",
      slitLamp: "Early nuclear sclerosis bilateral",
      fundus: "Normal disc, mild arteriolar narrowing OU",
      lastExamDate: "15 Sep'24",
      glassPrescription: "+1.5 DS both eyes",
      alerts: ["Presbyopia (corrective lenses recommended)", "Arteriolar narrowing (correlate with BP)"],
    },
  },
  "apt-priya": {
    specialtyTags: ["Obstetrics", "General Medicine"],
    followUpOverdueDays: 0,
    patientNarrative:
      "I have swelling in my feet since 3 days, lower back pain since 2 days, and morning nausea. My last ANC was 2 weeks back, and I want to check if everything is normal with the baby.",
    familyHistory: ["Mother: Gestational diabetes"],
    lifestyleNotes: ["Walking 30 min daily", "Iron supplements regular"],
    allergies: ["Shellfish"],
    chronicConditions: undefined,
    receptionistIntakeNotes: [
      "ANC follow-up patient. Reports pedal edema and lower back pain.",
      "Fetal movements reported as active.",
    ],
    lastVisit: {
      date: "18 Feb'26",
      vitals: "BP 126/82, Pulse 88, SpO2 98%, Temp 98.5 F",
      symptoms: "Leg swelling, low back pain",
      examination: "Mild pedal edema, stable fetal movements, fundal height appropriate",
      diagnosis: "Third trimester monitoring visit",
      medication: "Iron and Folic Acid 1-0-0, Calcium with Vitamin D 0-1-0",
      labTestsSuggested: "CBC, Urine Routine, Thyroid Profile",
      followUp: "1 week",
    },
    labFlagCount: 2,
    todayVitals: {
      bp: "130/85",
      pulse: "88",
      spo2: "98%",
      temp: "98.6 F",
      bmi: "23.0",
    },
    activeMeds: ["Iron and Folic Acid 1-0-0", "Calcium with Vitamin D 0-1-0"],
    keyLabs: [
      { name: "Hemoglobin", value: "11.2", flag: "low" },
      { name: "TSH", value: "4.8", flag: "high" },
    ],
    dueAlerts: ["Growth scan due in 5 days", "Td/TT booster due this week"],
    recordAlerts: ["Last ANC scan report: normal fetal growth"],
    concernTrend: undefined,
    symptomCollectorData: {
      reportedAt: "Today 09:40 AM",
      symptoms: [
        { name: "Pedal edema", duration: "3d", severity: "Mild" },
        { name: "Lower back pain", duration: "2d", severity: "Moderate" },
        { name: "Morning nausea" },
      ],
      medicalHistory: [],
      familyHistory: ["Mother: Gestational diabetes"],
    },
    gynecData: {
      menarche: 13,
      cycleLength: "28 days",
      cycleRegularity: "Regular",
      flowDuration: "4 days",
      flowIntensity: "Moderate",
      padsPerDay: 3,
      painScore: "2/10",
      lmp: "14 Jun'25",
      lastPapSmear: "20 Jan'25",
      alerts: ["Currently pregnant (see obstetric summary)"],
    },
    obstetricData: {
      gravida: 1,
      para: 0,
      living: 0,
      abortion: 0,
      ectopic: 0,
      lmp: "14 Jun'25",
      edd: "21 Mar'26",
      gestationalWeeks: 37,
      presentation: "Cephalic",
      fetalMovement: "Active",
      oedema: true,
      fundusHeight: "34 cm",
      amnioticFluid: "Normal",
      lastExamDate: "18 Feb'26",
      ancDue: ["Growth scan due in 5 days", "Td/TT booster due this week"],
      vaccineStatus: "Td/TT Dose 1 given",
      alerts: ["BP 130/85 (borderline, monitor closely)", "ANC growth scan overdue"],
    },
    ophthalData: {
      vaRight: "6/6",
      vaLeft: "6/6",
      slitLamp: "No abnormality",
      fundus: "Normal disc and macula OU",
      lastExamDate: "20 Jan'25",
      alerts: [],
    },
  },
  "apt-arjun": {
    specialtyTags: ["Pediatrics", "General Medicine"],
    followUpOverdueDays: 0,
    patientNarrative:
      "My son has dry cough since 3 days and is not eating well since 2 days. He had similar symptoms last month and was given syrup. We want to check if he needs further tests.",
    familyHistory: ["Father: Asthma"],
    lifestyleNotes: ["Playschool started 2 months ago", "Picky eater"],
    allergies: ["Egg"],
    chronicConditions: undefined,
    receptionistIntakeNotes: [
      "Parent reports dry cough and reduced appetite. Previous URTI 1 month ago.",
      "Vaccination record shows MMR-2 pending.",
    ],
    lastVisit: {
      date: "03 Feb'26",
      vitals: "Pulse 102, SpO2 98%, Temp 99.1 F",
      symptoms: "Nocturnal cough, throat irritation",
      examination: "Mild pharyngeal congestion, no wheeze",
      diagnosis: "Upper respiratory tract infection",
      medication: "Levocetirizine syrup 2.5 ml OD, Saline nasal drops",
      labTestsSuggested: "CBC if fever persists",
      followUp: "5 days",
    },
    labFlagCount: 1,
    todayVitals: {
      bp: "-",
      pulse: "104",
      spo2: "97%",
      temp: "99.0 F",
      bmi: "16.2",
    },
    activeMeds: ["Levocetirizine syrup 2.5 ml OD", "Paracetamol syrup SOS"],
    keyLabs: [{ name: "WBC", value: "12.5", flag: "high" }],
    dueAlerts: ["Td/TT booster due this week", "Growth chart review due in 10 days"],
    recordAlerts: [],
    concernTrend: undefined,
    symptomCollectorData: {
      reportedAt: "Today 10:30 AM",
      symptoms: [
        { name: "Dry cough", duration: "3d", severity: "Mild" },
        { name: "Reduced appetite", duration: "2d" },
      ],
      medicalHistory: ["URTI last month"],
      familyHistory: ["Father: Asthma"],
    },
    pediatricsData: {
      ageDisplay: "4 years",
      heightCm: 98,
      heightPercentile: "25th",
      weightKg: 14,
      weightPercentile: "15th",
      ofcCm: 50,
      bmiPercentile: "20th",
      vaccinesPending: 3,
      vaccinesOverdue: 1,
      overdueVaccineNames: ["MMR-2"],
      milestoneNotes: ["Speech delay noted by parent", "Fine motor skills age-appropriate"],
      feedingNotes: "Picky eater, low appetite past 2 weeks",
      lastGrowthDate: "03 Feb'26",
      alerts: ["Weight below 25th percentile (nutritional review)", "MMR-2 overdue"],
    },
    ophthalData: {
      vaRight: "6/6",
      vaLeft: "6/9",
      slitLamp: "Normal anterior segment OU",
      fundus: "Normal disc and macula OU",
      lastExamDate: "05 Jan'26",
      alerts: ["Mild intermittent exotropia (follow-up in 3 months)"],
    },
  },
  "apt-lakshmi": {
    specialtyTags: ["Gynecology", "Endocrinology"],
    followUpOverdueDays: 0,
    patientNarrative:
      "I have heavy menstrual bleeding since 6 months with fatigue and lower abdominal pain during periods. I was diagnosed with PCOS in 2018 and had partial thyroidectomy in 2020. I want to check if my thyroid dose needs adjustment and whether my bleeding needs further evaluation.",
    familyHistory: ["Mother (Diabetes)", "Sister (PCOS)"],
    lifestyleNotes: ["Sedentary work pattern", "Irregular meal timings"],
    allergies: [],
    chronicConditions: ["PCOS", "Hypothyroidism"],
    receptionistIntakeNotes: [
      "Symptom collector marked heavy menstrual bleeding and fatigue before consultation.",
      "Patient reports missed thyroid medication doses during travel last month.",
    ],
    lastVisit: {
      date: "12 Dec'25",
      vitals: "BP 128/82, Pulse 76, SpO2 98%, Temp 98.4 F",
      symptoms: "Fatigue, irregular cycles",
      examination: "Mild pallor, thyroid surgical scar noted",
      diagnosis: "Hypothyroidism, PCOS evaluation",
      medication: "Thyronorm 50mcg, Metformin 500mg",
      labTestsSuggested: "TSH, FBS, CBC",
      followUp: "3 months",
    },
    labFlagCount: 3,
    todayVitals: {
      bp: "130/85",
      pulse: "78",
      spo2: "98%",
      temp: "98.4°F",
      weight: "68",
      height: "158",
    },
    activeMeds: ["Thyronorm 50mcg 1-0-0-0", "Metformin 500mg 0-1-0-1"],
    keyLabs: [
      { name: "Hb", value: "9.2", flag: "low" },
      { name: "TSH", value: "6.8", flag: "high" },
      { name: "FBS", value: "112", flag: "high" },
    ],
    dueAlerts: ["Pap smear overdue > 1 year"],
    recordAlerts: ["Latest lab: Hb 9.2 g/dL (low), TSH 6.8 (elevated)"],
    concernTrend: {
      label: "Hb trend (latest 9.2)",
      values: [11.0, 10.5, 9.8, 9.2],
      labels: ["Jun'25", "Aug'25", "Oct'25", "Feb'26"],
      unit: "g/dL",
      tone: "red",
    },
    symptomCollectorData: {
      reportedAt: "Today 10:15 AM",
      symptoms: [
        { name: "Heavy menstrual bleeding", duration: "6 months", severity: "Severe" },
        { name: "Fatigue", duration: "3 months", severity: "Moderate" },
        { name: "Lower abdominal pain", duration: "during periods", severity: "Moderate" },
      ],
      medicalHistory: ["PCOS diagnosed 2018", "Thyroidectomy 2020 (partial)"],
      familyHistory: ["Mother (Diabetes)", "Sister (PCOS)"],
    },
    gynecData: {
      cycleRegularity: "Irregular",
      cycleLength: "35-50 days",
      flowIntensity: "Heavy",
      padsPerDay: 6,
      lmp: "18 Feb'26",
      lastPapSmear: "Mar 2024",
      painScore: "6/10",
      alerts: ["Heavy flow with low Hb (evaluate for menorrhagia)", "Pap smear overdue > 1 year"],
    },
    obstetricData: {
      gravida: 2,
      para: 1,
      abortion: 1,
    },
  },
  "apt-zerodata": {
    specialtyTags: [],
    followUpOverdueDays: 0,
    labFlagCount: 0,
    todayVitals: undefined,
    allergies: [],
    chronicConditions: [],
    activeMeds: [],
    keyLabs: [],
    lastVisit: undefined,
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

/* ──────────────────────────────────────────────────────────────── */
/*  Phase 3 — Canned Pill Engine (4-layer priority pipeline)      */
/* ──────────────────────────────────────────────────────────────── */

function buildCannedPillEngine({
  phase,
  lens,
  isPatientContext,
  hasInteractionAlert,
  hasRxpadSymptoms = false,
  summaryData,
  specialty,
}: {
  phase: ConsultPhase
  lens: RxTabLens
  isPatientContext: boolean
  hasInteractionAlert: boolean
  hasRxpadSymptoms?: boolean
  summaryData?: SmartSummaryData
  specialty?: SpecialtyTabId
}): CannedPill[] {
  const pills: CannedPill[] = []

  /* ── Layer 1 — Safety FORCE (priority 0-9) ── */
  if (isPatientContext && summaryData) {
    const spo2Raw = summaryData.todayVitals?.spo2
    const spo2Val = spo2Raw ? Number(spo2Raw.replace("%", "")) : null

    if (spo2Val !== null && spo2Val < 90) {
      pills.push({
        id: "force-spo2-critical",
        label: `\u26A0 Review SpO2`,
        priority: 0,
        layer: 1,
        tone: "danger",
        force: true,
        cooldownMs: 3000,
      })
    }

    // Allergy conflict — surface when patient has known allergies
    if ((summaryData.allergies?.length ?? 0) > 0) {
      pills.push({
        id: "force-allergy",
        label: `\u26A0 Allergy Alert`,
        priority: 1,
        layer: 1,
        tone: "danger",
        force: true,
        cooldownMs: 3000,
      })
    }

    if (hasInteractionAlert) {
      pills.push({
        id: "force-interaction",
        label: `\u26A0 Drug Interaction`,
        priority: 2,
        layer: 1,
        tone: "danger",
        force: true,
        cooldownMs: 3000,
      })
    }
  }

  /* ── Layer 2 — Clinical Flags (priority 10-29) ── */
  if (isPatientContext && summaryData) {
    if (summaryData.labFlagCount >= 3) {
      pills.push({
        id: "flag-labs",
        label: `Review Lab Flags (${summaryData.labFlagCount})`,
        priority: 10,
        layer: 2,
        tone: "warning",
        cooldownMs: 3000,
      })
    }

    if (summaryData.followUpOverdueDays > 0) {
      pills.push({
        id: "flag-fu",
        label: `Overdue F/U (${summaryData.followUpOverdueDays}d)`,
        priority: 12,
        layer: 2,
        tone: "warning",
        cooldownMs: 3000,
      })
    }

    const spo2Raw = summaryData.todayVitals?.spo2
    const spo2Val = spo2Raw ? Number(spo2Raw.replace("%", "")) : null
    if (spo2Val !== null && spo2Val < 95 && spo2Val >= 90) {
      pills.push({
        id: "flag-spo2-declining",
        label: "SpO2 declining",
        priority: 14,
        layer: 2,
        tone: "warning",
        cooldownMs: 3000,
      })
    }

    // Abnormal vitals — check for concerning BP, pulse, temp
    const bp = summaryData.todayVitals?.bp
    const pulse = summaryData.todayVitals?.pulse
    const temp = summaryData.todayVitals?.temp
    const hasAbnormalVitals =
      (bp && (parseInt(bp) > 140 || parseInt(bp) < 90)) ||
      (pulse && (parseInt(pulse) > 100 || parseInt(pulse) < 50)) ||
      (temp && (parseFloat(temp) > 99.5 || parseFloat(temp) < 96.0))
    if (hasAbnormalVitals) {
      pills.push({
        id: "flag-vitals-abnormal",
        label: "Review Vitals",
        priority: 16,
        layer: 2,
        tone: "warning",
        cooldownMs: 3000,
      })
    }
  }

  /* ── Layer 3 — Consultation Phase (priority 30-59) ── */
  const phaseMap: Record<ConsultPhase, Array<{ id: string; label: string; priority: number }>> = {
    empty: [
      { id: "phase-voice", label: "\uD83C\uDF99 Start voice", priority: 30 },
      { id: "phase-history", label: "\uD83D\uDCCB Add history", priority: 32 },
      { id: "phase-upload", label: "\uD83D\uDCCE Upload report", priority: 34 },
    ],
    symptoms_entered: [
      { id: "phase-ddx", label: "\uD83E\uDDE0 Suggest DDX", priority: 30 },
      { id: "phase-inv-bundle", label: "\uD83D\uDD0D Investigation bundle", priority: 32 },
    ],
    dx_accepted: [
      { id: "phase-protocol-meds", label: "\uD83D\uDC8A Protocol meds", priority: 30 },
      { id: "phase-advice", label: "\uD83D\uDCDD Advice", priority: 32 },
      { id: "phase-investigation", label: "\uD83D\uDCCB Investigation", priority: 34 },
    ],
    meds_written: [
      { id: "phase-advice-bundle", label: "\uD83D\uDCDD Advice bundle", priority: 30 },
      { id: "phase-followup", label: "\uD83D\uDCC5 Follow-up plan", priority: 32 },
      { id: "phase-completeness", label: "\u2705 Completeness check", priority: 34 },
    ],
    near_complete: [
      { id: "phase-completeness", label: "\u2705 Completeness check", priority: 30 },
      { id: "phase-translate", label: "\uD83C\uDF10 Translate advice", priority: 32 },
      { id: "phase-summary", label: "\uD83D\uDCCA Summary", priority: 34 },
    ],
    in_progress: [
      { id: "phase-snapshot", label: "Patient snapshot", priority: 30 },
      { id: "phase-abnormal", label: "Abnormal labs", priority: 32 },
      { id: "phase-last-visit", label: "Last visit", priority: 34 },
    ],
  }

  const phasePills = phaseMap[phase] ?? phaseMap.in_progress
  for (const p of phasePills) {
    pills.push({
      id: p.id,
      label: p.label,
      priority: p.priority,
      layer: 3,
      tone: "primary",
      cooldownMs: 3000,
    })
  }

  /* ── Layer 4 — Tab-Specific (priority 60-89) ── */
  const lensMap: Partial<Record<RxTabLens, Array<{ id: string; label: string; priority: number }>>> = {
    "past-visits": [
      { id: "lens-compare", label: "Compare visits", priority: 60 },
      { id: "lens-recurrence", label: "Recurrence check", priority: 62 },
    ],
    vitals: [
      { id: "lens-vital-trends", label: "Vital trends", priority: 60 },
      { id: "lens-graph", label: "Graph view", priority: 62 },
    ],
    "lab-results": [
      { id: "lens-lab-compare", label: "Lab comparison", priority: 60 },
      { id: "lens-annual-panel", label: "Annual panel", priority: 62 },
    ],
    history: [
      { id: "lens-med-search", label: "Med history search", priority: 60 },
      { id: "lens-chronic-timeline", label: "Chronic timeline", priority: 62 },
    ],
    "medical-records": [
      { id: "lens-ocr", label: "OCR analysis", priority: 60 },
      { id: "lens-extract", label: "Report extract", priority: 62 },
    ],
  }

  const lensPills = lensMap[lens]
  if (lensPills) {
    for (const lp of lensPills) {
      pills.push({
        id: lp.id,
        label: lp.label,
        priority: lp.priority,
        layer: 4,
        tone: "info",
        cooldownMs: 3000,
      })
    }
  }

  /* ── Sorting & selection ── */
  pills.sort((a, b) => a.priority - b.priority)

  // Layer 1 pills always occupy first slots
  const layer1 = pills.filter((p) => p.layer === 1)
  const rest = pills.filter((p) => p.layer !== 1)

  const selected: CannedPill[] = [...layer1, ...rest]
  // Deduplicate by label, then truncate to 4
  const uniqueByLabel = Array.from(new Map(selected.map((pill) => [pill.label, pill])).values())
  return uniqueByLabel.slice(0, 4)
}

/** Backward-compatible wrapper — returns PromptChip[] from the new CannedPill engine */
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
  const canned = buildCannedPillEngine({ phase, lens, isPatientContext, hasInteractionAlert, hasRxpadSymptoms, summaryData })
  return canned.map((pill) => ({
    id: pill.id,
    label: pill.label,
    tone: pill.tone,
    force: pill.force,
  }))
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
  threshold,
}: {
  values: number[]
  labels: string[]
  tone?: "violet" | "red" | "teal"
  threshold?: number
}) {
  const width = 260
  const height = 64
  const top = 8
  const bottom = 48
  const allValues = threshold != null ? [...values, threshold] : values
  const max = Math.max(...allValues)
  const min = Math.min(...allValues)
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

  const thresholdY = threshold != null ? bottom - ((threshold - min) / span) * (bottom - top) : null

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[64px] w-full">
      <path d={pathArea} fill={fill} />
      <path d={pathLine} fill="none" stroke={stroke} strokeWidth="2" />
      {thresholdY != null && (
        <g>
          <line
            x1={8}
            y1={thresholdY}
            x2={width - 8}
            y2={thresholdY}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text x={width - 8} y={thresholdY - 3} textAnchor="end" fontSize="7" fill="#ef4444">
            Threshold: {threshold}
          </text>
        </g>
      )}
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

function VitalBarChart({
  values,
  labels,
  unit,
  threshold,
  tone,
}: {
  values: number[]
  labels: string[]
  unit?: string
  threshold?: number
  tone: "violet" | "teal" | "red"
}) {
  const barHeight = 14
  const gap = 4
  const labelAreaWidth = 40
  const valueAreaWidth = 32
  const chartLeft = labelAreaWidth + 4
  const chartRight = 200 - valueAreaWidth - 4
  const chartWidth = chartRight - chartLeft
  const svgHeight = values.length * (barHeight + gap) + 8
  const allValues = threshold != null ? [...values, threshold] : values
  const max = Math.max(...allValues)

  const colorMap = {
    violet: { fill: "#8b5cf6", stroke: "#7c3aed" },
    teal: { fill: "#14b8a6", stroke: "#0d9488" },
    red: { fill: "#ef4444", stroke: "#dc2626" },
  }
  const colors = colorMap[tone]

  const thresholdX = threshold != null && max > 0 ? chartLeft + (threshold / max) * chartWidth : null

  return (
    <svg viewBox={`0 0 200 ${svgHeight}`} className="w-full" style={{ height: svgHeight }}>
      {values.map((value, index) => {
        const y = 4 + index * (barHeight + gap)
        const barWidth = max > 0 ? (value / max) * chartWidth : 0
        const isAboveThreshold = threshold != null && value > threshold
        const barFill = isAboveThreshold ? "rgba(239,68,68,0.6)" : `${colors.fill}99`
        const barStroke = isAboveThreshold ? "#dc2626" : colors.stroke

        return (
          <g key={`bar-${index}`}>
            <text x={labelAreaWidth} y={y + barHeight / 2 + 3} textAnchor="end" fontSize="8" fill="#64748b">
              {labels[index] ?? `D${index + 1}`}
            </text>
            <rect
              x={chartLeft}
              y={y}
              width={Math.max(0, barWidth)}
              height={barHeight}
              rx={3}
              fill={barFill}
              stroke={barStroke}
              strokeWidth="0.5"
            />
            <text
              x={chartLeft + barWidth + 4}
              y={y + barHeight / 2 + 3}
              textAnchor="start"
              fontSize="8"
              fontWeight="bold"
              fill="#374151"
            >
              {value}
              {unit ? ` ${unit}` : ""}
            </text>
          </g>
        )
      })}
      {thresholdX != null && (
        <g>
          <line
            x1={thresholdX}
            y1={0}
            x2={thresholdX}
            y2={svgHeight}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text x={thresholdX} y={7} textAnchor="middle" fontSize="7" fill="#ef4444">
            {threshold}
          </text>
        </g>
      )}
    </svg>
  )
}

function getVitalThreshold(label: string): number | undefined {
  const lower = label.toLowerCase()
  if (lower.includes("spo2") || lower.includes("sp02")) return 95
  if (lower.includes("systolic") || lower.includes("bp sys")) return 140
  if (lower.includes("diastolic") || lower.includes("bp dia")) return 90
  if (lower.includes("pulse") || lower.includes("heart rate")) return 100
  if (lower.includes("temp")) return 100.4
  if (lower.includes("rbs") || lower.includes("blood sugar")) return 200
  return undefined
}

function toneChipClass(tone: CannedPill["tone"]) {
  return ""
}

/* ──────────────────────────────────────────────────────────────── */
/*  CARD ANATOMY — Design-System-Aligned Constants (Phase 1)      */
/* ──────────────────────────────────────────────────────────────── */

const AI_OUTPUT_CARD_CLASS =
  "rounded-[12px] border-[0.5px] border-tp-slate-200 bg-[linear-gradient(180deg,rgba(245,243,255,0.52)_0%,rgba(255,255,255,0.98)_22%,#fff_100%)] p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
const AI_INNER_SURFACE_CLASS = "overflow-hidden rounded-[10px] bg-tp-slate-50/85"
const AI_INNER_HEADER_CLASS = "border-b border-tp-slate-100 px-2 py-1.5"
const AI_INNER_BODY_CLASS = "space-y-1 px-2 py-1 text-[12px] text-tp-slate-600"
const AI_ROW_GRID_CLASS = "group/line grid grid-cols-[9px_72px_minmax(0,1fr)_auto] items-start gap-x-1.5"

/* 3 Button Families per Implementation Guide */

// Family 1: Chat Pills — AI Gradient, triggers agent chat action
const AGENT_GRADIENT_CHIP_CLASS =
  "inline-flex h-[24px] items-center rounded-full border-[0.5px] border-tp-violet-200/75 [background:linear-gradient(135deg,rgba(242,77,182,0.08)_0%,rgba(150,72,254,0.06)_52%,rgba(75,74,213,0.06)_100%)] px-2 py-0 text-[11px] font-medium text-tp-violet-700/90 transition-colors hover:bg-tp-violet-50/70"

// Family 2: Copy/Action — TP Blue, copies to RxPad
const AI_SMALL_PRIMARY_CTA_CLASS =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-[10px] border-[0.5px] border-tp-blue-200 bg-white px-3 text-[12px] font-medium text-tp-blue-700 transition-colors hover:bg-tp-blue-50 active:bg-tp-blue-100 disabled:cursor-not-allowed disabled:border-tp-slate-200 disabled:bg-tp-slate-100 disabled:text-tp-slate-400"

const AI_SMALL_SECONDARY_CTA_CLASS =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-[10px] border-[0.5px] border-tp-blue-200 bg-white px-3 text-[12px] font-medium text-tp-blue-700 transition-colors hover:bg-tp-blue-50 active:bg-tp-blue-100 disabled:cursor-not-allowed disabled:border-tp-slate-200 disabled:bg-tp-slate-100 disabled:text-tp-slate-400"

const AI_TERTIARY_CTA_CLASS =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-[10px] px-3 text-[12px] font-medium text-tp-slate-600 transition-colors hover:bg-tp-slate-50 active:bg-tp-slate-100"

// Family 3: External CTA — TP Blue border, opens sidebar tab
const SIDEBAR_CTA_CLASS =
  "inline-flex items-center gap-1 text-[11px] font-medium text-tp-blue-600 transition-colors hover:text-tp-blue-700 hover:underline"

const AI_INLINE_PROMPT_CLASS =
  "rounded-full border-[0.5px] border-tp-violet-200/75 [background:linear-gradient(135deg,rgba(242,77,182,0.08)_0%,rgba(150,72,254,0.06)_52%,rgba(75,74,213,0.06)_100%)] px-2 py-1 text-[12px] font-medium text-tp-violet-700/90 transition-colors hover:bg-tp-violet-50/70"

const AI_CARD_ICON_WRAP_CLASS =
  "inline-flex size-6 items-center justify-center rounded-md border-[0.5px] border-tp-violet-100 text-tp-violet-600"

const HOVER_COPY_ICON_CLASS =
  "inline-flex size-5 items-center justify-center rounded-[7px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 transition-all hover:border-tp-blue-300 hover:text-tp-blue-600 hover:[&_svg]:stroke-[2.4]"

/* ──────────────────────────────────────────────────────────────── */
/*  FOUNDATION PRIMITIVES — Shared Components (Phase 1)            */
/* ──────────────────────────────────────────────────────────────── */

/* ── Phase 11 — Polish: Guardrails, Touch Targets, Edge Cases ─── */

/** Drug names are displayed exactly as stored — brand names, not generics.
 *  Abbreviation conventions: Sx, Dx, Rx, BF, 1-0-0-1 format */
const DRUG_NAME_DISPLAY_RULE = "as-stored" as const // brand names, not generics
void DRUG_NAME_DISPLAY_RULE // referenced for documentation; prevents unused-var lint

/** Off-topic detection: blocks non-clinical queries */
function isOffTopicQuery(text: string): boolean {
  const offTopicPatterns = [
    /\b(weather|movie|sport|game|cook|recipe|joke|sing|dance|news|politics)\b/i,
    /\b(who is|tell me about|what happened)\b.*\b(celebrity|actor|singer|player)\b/i,
    /\b(play|stream|watch|listen)\b/i,
  ]
  return offTopicPatterns.some((pattern) => pattern.test(text))
}

const OFF_TOPIC_REPLY =
  "I'm focused on clinical support. Try asking about this patient's vitals, lab results, or treatment plan."

/** Response truncation: enforces "no paragraphs" rule (max 4 lines) */
function truncateResponseText(text: string, maxLines: number = 4): { text: string; truncated: boolean } {
  const lines = text.split("\n").filter((l) => l.trim())
  if (lines.length <= maxLines) return { text, truncated: false }
  return { text: lines.slice(0, maxLines).join("\n") + "...", truncated: true }
}

/** Cross-patient safety block: prevents referencing other patients */
function detectsCrossPatientReference(text: string, currentPatientName: string): boolean {
  const otherPatients = RX_CONTEXT_OPTIONS
    .filter((opt) => opt.kind === "patient" && opt.label !== currentPatientName)
    .map((opt) => opt.patient?.name?.toLowerCase() ?? "")
    .filter(Boolean)

  const lowerText = text.toLowerCase()
  return otherPatients.some((name) => lowerText.includes(name))
}

const CROSS_PATIENT_REPLY =
  "I can only provide information about the current patient. Please switch to the correct patient context."

/* ── End Phase 11 Helpers ─────────────────────────────────────── */

/** Level 1-3 Hover Copy Button */
function HoverCopyButton({
  size = "item",
  label,
  payload,
  onCopy,
  className,
}: {
  size?: "card" | "section" | "item"
  label: string
  payload: RxPadCopyPayload
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  className?: string
}) {
  const sizeClass = size === "card" ? "size-6" : size === "section" ? "size-5" : "size-[18px]"
  const iconSize = size === "card" ? 12 : size === "section" ? 11 : 10
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onCopy(payload, label) }}
      className={cn(
        "inline-flex items-center justify-center rounded-[7px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 transition-all hover:border-tp-blue-300 hover:text-tp-blue-600",
        sizeClass,
        className,
      )}
      title={label}
      aria-label={label}
    >
      <Copy size={iconSize} />
    </button>
  )
}

/** Section Tag — inline uppercase label with hover-copy (Level 2) */
function SectionTag({
  label,
  copyPayload,
  onCopy,
}: {
  label: string
  copyPayload?: RxPadCopyPayload
  onCopy?: (payload: RxPadCopyPayload, message: string) => void
}) {
  return (
    <span className="group/tag mr-1.5 inline-flex items-center gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-400">{label}</span>
      {copyPayload && onCopy && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCopy(copyPayload, `${label} copied`) }}
          className="inline-flex size-[15px] items-center justify-center rounded border-[0.5px] border-transparent text-tp-slate-300 opacity-0 transition-all group-hover/tag:border-tp-slate-200 group-hover/tag:text-tp-blue-500 group-hover/tag:opacity-100"
          title={`Copy ${label}`}
          aria-label={`Copy ${label}`}
        >
          <Copy size={9} />
        </button>
      )}
    </span>
  )
}

/** Compact inline row: [Icon] TAG  value1 | value2 | value3 */
function InlineSummaryRow({
  icon,
  tag,
  segments,
  onCopy,
  copyPayload,
}: {
  icon: React.ReactNode
  tag: string
  segments: Array<{ text: string; red?: boolean; bold?: boolean }>
  onCopy?: (payload: RxPadCopyPayload, msg: string) => void
  copyPayload?: RxPadCopyPayload
}) {
  if (segments.length === 0) return null

  return (
    <div className="group/row flex items-start gap-1.5 py-[2px]">
      <span className="mt-[2px] shrink-0 text-tp-slate-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <span className="mr-1.5 inline text-[10px] font-semibold uppercase tracking-wider text-tp-slate-400">
          {tag}
        </span>
        {copyPayload && onCopy && (
          <button
            type="button"
            onClick={() => onCopy(copyPayload, `${tag} copied`)}
            className="mr-1 hidden align-middle group-hover/row:inline-flex"
            title={`Copy ${tag}`}
          >
            <Copy size={10} className="text-tp-slate-300 hover:text-tp-blue-500" />
          </button>
        )}
        <span className="text-[11px] leading-[15px]">
          {segments.map((seg, j) => (
            <span key={j}>
              {j > 0 && <span className="mx-0.5 text-tp-slate-300">|</span>}
              <span
                className={cn(
                  seg.red ? "font-medium text-tp-error-500" : "text-tp-slate-600",
                  seg.bold && "font-semibold text-tp-slate-700",
                )}
              >
                {seg.text}
              </span>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

function TagHeading({
  icon,
  label,
  tooltipTab,
  onNavigate,
}: {
  icon: React.ReactNode
  label: string
  tooltipTab?: string
  onNavigate?: (tab: string) => void
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] bg-tp-slate-100 px-1.5 py-[3px]",
        tooltipTab && onNavigate && "cursor-pointer hover:bg-tp-slate-200/80",
      )}
      title={tooltipTab ? `Go to ${tooltipTab.replace(/-/g, " ")}` : undefined}
      onClick={tooltipTab && onNavigate ? () => onNavigate(tooltipTab) : undefined}
      role={tooltipTab && onNavigate ? "button" : undefined}
      tabIndex={tooltipTab && onNavigate ? 0 : undefined}
    >
      <span className="text-tp-slate-500">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">{label}</span>
    </span>
  )
}

function ColorCodedValue({
  value,
  status,
  className,
}: {
  value: string
  status: "normal" | "abnormal" | "warning"
  className?: string
}) {
  return (
    <span
      className={cn(
        "text-[12px]",
        status === "abnormal"
          ? "font-semibold text-tp-error-600"
          : status === "warning"
            ? "font-medium text-tp-warning-600"
            : "text-tp-slate-700",
        className,
      )}
    >
      {value}
    </span>
  )
}

/** Source Attribution — small gray text below card content */
function SourceAttribution({ tab, section, date }: { tab: string; section?: string; date?: string }) {
  const parts = [tab, section, date].filter(Boolean)
  return (
    <p className="mt-1.5 text-[10px] text-tp-slate-400">
      Source: {parts.join(" · ")}
    </p>
  )
}

/** Sidebar CTA Link — opens sidebar tab, closes agent */
function SidebarCTA({
  label,
  targetTab,
  onClick,
}: {
  label: string
  targetTab: string
  onClick?: (tab: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(targetTab)}
      className={cn(SIDEBAR_CTA_CLASS, "mt-1.5 border-t border-tp-slate-100 pt-1.5")}
    >
      {label} <span className="text-tp-blue-400">→</span>
    </button>
  )
}

/** Response Feedback — 👍/👎 below every agent response */
function ResponseFeedback({
  messageId,
  feedback,
  onFeedback,
}: {
  messageId: string
  feedback?: "like" | "dislike"
  onFeedback: (messageId: string, type: "like" | "dislike") => void
}) {
  return (
    <div className="mt-1.5 flex items-center gap-2 border-t border-tp-slate-100 pt-1.5">
      <span className="text-[10px] text-tp-slate-400">Helpful?</span>
      <button
        type="button"
        onClick={() => !feedback && onFeedback(messageId, "like")}
        disabled={!!feedback}
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-[5px] transition-all",
          feedback === "like"
            ? "bg-tp-success-50 text-tp-success-600"
            : feedback === "dislike"
              ? "text-tp-slate-200"
              : "text-tp-slate-400 hover:bg-tp-success-50 hover:text-tp-success-600",
        )}
        aria-label="Helpful"
      >
        <ThumbsUp size={11} />
      </button>
      <button
        type="button"
        onClick={() => !feedback && onFeedback(messageId, "dislike")}
        disabled={!!feedback}
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-[5px] transition-all",
          feedback === "dislike"
            ? "bg-tp-error-50 text-tp-error-600"
            : feedback === "like"
              ? "text-tp-slate-200"
              : "text-tp-slate-400 hover:bg-tp-error-50 hover:text-tp-error-600",
        )}
        aria-label="Not helpful"
      >
        <ThumbsDown size={11} />
      </button>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────── */
/*  INTRO UX — Context Lines & Alert Banners (Phase 2)             */
/* ──────────────────────────────────────────────────────────────── */

interface IntroContextLine {
  label: string
  segments: Array<{ text: string; red?: boolean }>
  priority: number
}

function buildContextLines(s: SmartSummaryData, specialty: SpecialtyTabId): IntroContextLine[] {
  const lines: IntroContextLine[] = []

  // Priority 1 — Chronic + Active Meds (merged onto ONE line)
  if (s.chronicConditions?.length || s.activeMeds?.length) {
    const segs: Array<{ text: string; red?: boolean }> = []
    if (s.chronicConditions?.length) {
      segs.push({ text: s.chronicConditions.join(", ") })
    }
    if (s.activeMeds?.length) {
      segs.push({ text: `On ${s.activeMeds.join(", ")}` })
    }
    lines.push({ label: "Chronic", segments: segs, priority: 1 })
  }

  // Priority 2 — Last visit headline (Dx → Rx · Inv · F/U merged)
  if (s.lastVisit) {
    const segs: Array<{ text: string; red?: boolean }> = []
    if (s.lastVisit.diagnosis) segs.push({ text: s.lastVisit.diagnosis })
    if (s.lastVisit.medication) segs.push({ text: `Rx: ${s.lastVisit.medication}` })
    if (s.lastVisit.labTestsSuggested) segs.push({ text: `Inv: ${s.lastVisit.labTestsSuggested}` })
    if (s.lastVisit.followUp) segs.push({ text: `F/U: ${s.lastVisit.followUp}` })
    lines.push({ label: `Last visit ${s.lastVisit.date}`, segments: segs, priority: 2 })
  }

  // Priority 3 — Today's vitals (merged, abnormal in red)
  if (s.todayVitals) {
    const segs: Array<{ text: string; red?: boolean }> = []
    const v = s.todayVitals
    if (v.bp) {
      const sys = Number.parseInt(v.bp)
      segs.push({ text: `BP ${v.bp}`, red: sys >= 140 })
    }
    if (v.spo2) {
      const val = Number.parseInt(v.spo2)
      segs.push({ text: `SpO2 ${v.spo2}`, red: val < 95 })
    }
    if (v.pulse) segs.push({ text: `Pulse ${v.pulse}` })
    if (v.temp) {
      const t = Number.parseFloat(v.temp)
      segs.push({ text: `Temp ${v.temp}\u00B0F`, red: t >= 100.4 })
    }
    if (v.weight) segs.push({ text: `Wt ${v.weight}kg` })
    if (segs.length > 0) {
      lines.push({ label: "Today", segments: segs, priority: 3 })
    }
  }

  // Priority 4 — Lab flags (count + top 3)
  if (s.labFlagCount > 0 && s.keyLabs?.length) {
    const topFlags = s.keyLabs.slice(0, 3).map(l => ({
      text: `${l.name}${l.flag === "high" ? "\u2191" : "\u2193"} ${l.value}`,
      red: true as const,
    }))
    const extra = s.labFlagCount > 3 ? [{ text: `+${s.labFlagCount - 3} more` }] : []
    lines.push({ label: `Labs${s.keyLabs[0] ? "" : ""}`, segments: [{ text: `${s.labFlagCount} abnormal` }, ...topFlags, ...extra], priority: 4 })
  }

  // Priority 5 — Patient narrative (symptom collector summary)
  if (s.symptomCollectorData?.symptoms?.length) {
    const names = s.symptomCollectorData.symptoms.slice(0, 4).map(sx => sx.name)
    lines.push({ label: "Patient says", segments: [{ text: names.join(", ") }], priority: 5 })
  }

  // Priority 6 — Specialty-specific
  if (specialty === "obstetric" && s.obstetricData) {
    const ob = s.obstetricData
    lines.push({ label: "OB", segments: [
      { text: `G${ob.gravida}P${ob.para}L${ob.living}A${ob.abortion}E${ob.ectopic}` },
      { text: `${ob.gestationalWeeks ?? "\u2014"}w` },
      { text: `EDD ${ob.edd ?? "\u2014"}` },
    ], priority: 6 })
  }
  if (specialty === "gynec" && s.gynecData) {
    lines.push({ label: "Gynec", segments: [
      { text: `LMP ${s.gynecData.lmp ?? "\u2014"}` },
      { text: `Cycle ${s.gynecData.cycleRegularity ?? "\u2014"}, ${s.gynecData.cycleLength ?? "\u2014"}` },
      { text: `Flow ${s.gynecData.flowIntensity ?? "\u2014"}` },
    ], priority: 6 })
  }
  if (specialty === "ophthal" && s.ophthalData) {
    const o = s.ophthalData
    lines.push({ label: "Vision", segments: [
      { text: `VA OD ${o.vaRight ?? "\u2014"} OS ${o.vaLeft ?? "\u2014"}` },
      ...(o.slitLamp ? [{ text: `Slit: ${o.slitLamp.slice(0, 40)}` }] : []),
    ], priority: 6 })
  }
  if (specialty === "pediatrics" && s.pediatricsData) {
    const p = s.pediatricsData
    lines.push({ label: "Growth", segments: [
      { text: p.ageDisplay ?? "\u2014" },
      { text: `Ht ${p.heightCm ?? "\u2014"}cm (${p.heightPercentile ?? "\u2014"})` },
      { text: `Wt ${p.weightKg ?? "\u2014"}kg (${p.weightPercentile ?? "\u2014"})` },
    ], priority: 6 })
  }

  // Sort by priority, return top 5
  lines.sort((a, b) => a.priority - b.priority)
  return lines.slice(0, 5)
}

/** Patient Category Intelligence */
type PatientCategory = "concerning" | "care" | "operational" | "unknown"

function classifyPatientCategory(s: SmartSummaryData): PatientCategory {
  // Clinically Concerning
  if (s.todayVitals?.spo2 && Number.parseInt(s.todayVitals.spo2) < 95) return "concerning"
  if (s.todayVitals?.bp && Number.parseInt(s.todayVitals.bp) >= 180) return "concerning"
  if (s.keyLabs?.some(l => l.flag === "high" || l.flag === "low")) return "concerning"

  // Care-Level
  if (s.chronicConditions?.length) return "care"
  if (s.followUpOverdueDays > 0) return "care"
  if (s.allergies?.length) return "care"

  // Operational
  if (s.lastVisit || s.todayVitals) return "operational"

  return "unknown"
}

const CATEGORY_BORDER_CLASS: Record<PatientCategory, string> = {
  concerning: "border-l-[3px] border-l-tp-error-300",
  care: "border-l-[3px] border-l-tp-warning-300",
  operational: "border-l-[3px] border-l-tp-slate-200",
  unknown: "border-l-[3px] border-l-tp-slate-150",
}

/** Intro Alert Strip — compact single-line safety alerts */
function IntroAlertStrip({ summaryData }: { summaryData: SmartSummaryData }) {
  const items: Array<{ text: string; tone: "critical" | "warning" }> = []

  // Allergy — always critical
  if (summaryData.allergies?.length) {
    items.push({ text: `ALLERGY: ${summaryData.allergies.join(", ")}`, tone: "critical" })
  }
  // SpO2 < 90 — true emergency
  if (summaryData.todayVitals?.spo2 && Number.parseInt(summaryData.todayVitals.spo2) < 90) {
    items.push({ text: `SpO2 ${summaryData.todayVitals.spo2}% (Critical)`, tone: "critical" })
  }
  // BP >= 180 — hypertensive urgency
  if (summaryData.todayVitals?.bp && Number.parseInt(summaryData.todayVitals.bp) >= 180) {
    items.push({ text: `BP ${summaryData.todayVitals.bp} (Hypertensive urgency)`, tone: "critical" })
  }
  // F/U overdue > 7 days
  if (summaryData.followUpOverdueDays > 7) {
    items.push({ text: `F/U overdue ${summaryData.followUpOverdueDays}d`, tone: "warning" })
  }

  if (items.length === 0) return null

  // Max 2 items
  const displayItems = items.slice(0, 2)

  return (
    <div className="flex items-center gap-1 px-0.5">
      <AlertTriangle size={10} className="shrink-0 text-tp-error-500" />
      <p className="text-[10px] font-semibold leading-[14px]">
        {displayItems.map((item, i) => (
          <span key={i}>
            {i > 0 && <span className="text-tp-slate-300"> &middot; </span>}
            <span className={item.tone === "critical" ? "text-tp-error-600" : "text-tp-warning-600"}>{item.text}</span>
          </span>
        ))}
      </p>
    </div>
  )
}

/** Intro Context Lines — consolidated smart lines with bold labels */
function IntroSmartLines({ lines }: { lines: IntroContextLine[] }) {
  if (lines.length === 0) return null

  return (
    <div className="space-y-[3px]">
      {lines.map((line, i) => (
        <div key={i} className="text-[12px] leading-[18px]">
          <span className="font-semibold text-tp-slate-800">{line.label}:</span>{" "}
          {line.segments.map((seg, j) => (
            <span key={j}>
              {j > 0 && <span className="text-tp-slate-300"> &middot; </span>}
              <span className={seg.red ? "font-medium text-tp-error-500" : "text-tp-slate-600"}>{seg.text}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** Symptom Collector Card — purple-tinted collapsible card */
function SymptomCollectorCard({
  data,
  collapsed,
  onToggle,
  onCopy,
}: {
  data: NonNullable<SmartSummaryData["symptomCollectorData"]>
  collapsed: boolean
  onToggle: () => void
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  if (collapsed) {
    return (
      <button type="button" onClick={onToggle}
        className="flex h-[32px] w-full items-center justify-between rounded-[10px] border-[0.5px] border-tp-violet-200 bg-tp-violet-50/40 px-2.5 text-left">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex size-4 items-center justify-center rounded bg-tp-violet-100 text-tp-violet-500">
            <ClipboardPlus size={10} />
          </span>
          <p className="text-[11px] font-medium text-tp-violet-700">Patient-reported · {data.reportedAt}</p>
          <span className="rounded-full bg-tp-violet-100 px-1 py-0.5 text-[10px] font-medium text-tp-violet-600">{data.symptoms.length} Sx</span>
        </div>
        <ChevronDown size={11} className="shrink-0 text-tp-violet-400" />
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-[10px] border-[0.5px] border-tp-violet-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-tp-violet-100 bg-tp-violet-50/40 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex size-5 items-center justify-center rounded-[6px] bg-tp-violet-100 text-tp-violet-500">
            <ClipboardPlus size={11} />
          </span>
          <p className="text-[12px] font-semibold text-tp-violet-800">Patient-reported</p>
          <span className="text-[10px] text-tp-violet-500">{data.reportedAt}</span>
        </div>
        <button type="button" onClick={onToggle} className="inline-flex size-5 items-center justify-center rounded-[6px] border-[0.5px] border-tp-violet-200 bg-white text-tp-violet-500" aria-label="Collapse">
          <ChevronUp size={11} />
        </button>
      </div>

      {/* Symptoms */}
      <div className="space-y-1 px-2.5 py-2">
        <SectionTag label="Symptoms" />
        <div className="flex flex-wrap gap-1">
          {data.symptoms.map(sx => (
            <span key={sx.name} className="inline-flex items-center gap-1 rounded-full bg-tp-violet-50 px-1.5 py-0.5 text-[11px] text-tp-violet-700">
              {sx.name}
              {sx.duration && <span className="rounded bg-tp-violet-100 px-0.5 text-[10px] font-medium text-tp-violet-600">{sx.duration}</span>}
              {sx.severity && (
                <span className={cn(
                  "rounded px-0.5 text-[9px] font-semibold uppercase",
                  sx.severity === "High" || sx.severity === "Severe" ? "bg-tp-error-50 text-tp-error-600" :
                  sx.severity === "Moderate" ? "bg-tp-warning-50 text-tp-warning-700" :
                  "bg-tp-slate-100 text-tp-slate-500",
                )}>{sx.severity}</span>
              )}
            </span>
          ))}
        </div>

        {/* Medical/Family History if present */}
        {data.medicalHistory?.length ? (
          <div className="mt-1">
            <SectionTag label="History" />
            <p className="inline text-[11px] text-tp-slate-600">{data.medicalHistory.join(" | ")}</p>
          </div>
        ) : null}
        {data.familyHistory?.length ? (
          <div className="mt-0.5">
            <SectionTag label="Family" />
            <p className="inline text-[11px] text-tp-slate-600">{data.familyHistory.join(" | ")}</p>
          </div>
        ) : null}

        {/* Copy actions */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onCopy({
              sourceDateLabel: `Patient-reported ${data.reportedAt}`,
              targetSection: "symptoms",
              symptoms: data.symptoms.map(sx => sx.name),
              additionalNotes: data.symptoms.map(sx => `${sx.name}${sx.duration ? ` (${sx.duration})` : ""}${sx.severity ? ` [${sx.severity}]` : ""}`).join(" | "),
            }, "Symptoms copied to Complaints")}
            className="inline-flex h-[28px] items-center gap-1 rounded-[8px] border-[0.5px] border-tp-blue-200 bg-white px-2 text-[11px] font-medium text-tp-blue-700 hover:bg-tp-blue-50"
          >
            <Copy size={10} /> Copy Sx to Complaints
          </button>
          {(data.medicalHistory?.length || data.familyHistory?.length) ? (
            <button
              type="button"
              onClick={() => onCopy({
                sourceDateLabel: `Patient-reported History ${data.reportedAt}`,
                targetSection: "history",
                additionalNotes: [...(data.medicalHistory ?? []), ...(data.familyHistory ?? [])].join(" | "),
              }, "History copied to Medical History")}
              className="inline-flex h-[28px] items-center gap-1 rounded-[8px] border-[0.5px] border-tp-blue-200 bg-white px-2 text-[11px] font-medium text-tp-blue-700 hover:bg-tp-blue-50"
            >
              <Copy size={10} /> Copy to History
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PatientReportedCard({
  data,
  collapsed,
  onToggle,
  onCopy,
}: {
  data: NonNullable<SmartSummaryData["symptomCollectorData"]>
  collapsed: boolean
  onToggle: () => void
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  const sxCount = data.symptoms.length
  const hxCount = (data.medicalHistory?.length ?? 0) + (data.familyHistory?.length ?? 0)
  const totalItems = sxCount + hxCount

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[32px] w-full items-center justify-between rounded-[10px] border-[0.5px] border-tp-violet-200 bg-tp-violet-50/40 px-2.5 text-left"
      >
        <div className="flex items-center gap-1.5">
          <span className="inline-flex size-4 items-center justify-center rounded bg-tp-violet-100 text-tp-violet-500">
            <ClipboardPlus size={10} />
          </span>
          <p className="text-[12px] font-medium text-tp-violet-700">Patient-reported</p>
          <span className="rounded-full bg-tp-violet-100 px-1 py-0.5 text-[10px] font-medium text-tp-violet-600">
            {sxCount} Sx{hxCount > 0 ? ` · ${hxCount} Hx` : ""}
          </span>
        </div>
        <ChevronDown size={11} className="shrink-0 text-tp-violet-400" />
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-[10px] border-[0.5px] border-tp-violet-200 bg-white">
      {/* Header with copy-all + collapse */}
      <div className="flex items-center justify-between gap-2 border-b border-tp-violet-100 bg-tp-violet-50/40 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex size-5 items-center justify-center rounded-[6px] bg-tp-violet-100 text-tp-violet-500">
            <ClipboardPlus size={11} />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-tp-violet-800">Patient-reported</p>
            <p className="text-[9px] italic text-tp-violet-400">Not clinically validated</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              onCopy(
                {
                  sourceDateLabel: `Patient-reported ${data.reportedAt}`,
                  targetSection: "symptoms",
                  symptoms: data.symptoms.map((sx) => sx.name),
                  additionalNotes: [
                    ...data.symptoms.map((sx) => `${sx.name}${sx.duration ? ` (${sx.duration})` : ""}${sx.severity ? ` [${sx.severity}]` : ""}`),
                    ...(data.medicalHistory ?? []).map((h) => `Hx: ${h}`),
                    ...(data.familyHistory ?? []).map((f) => `FHx: ${f}`),
                  ].join(" | "),
                },
                "All patient-reported data copied",
              )
            }
            className={HOVER_COPY_ICON_CLASS}
            title="Copy all"
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex size-5 items-center justify-center rounded-[6px] border-[0.5px] border-tp-violet-200 bg-white text-tp-violet-500"
            aria-label="Collapse"
          >
            <ChevronUp size={11} />
          </button>
        </div>
      </div>

      <div className="divide-y divide-tp-violet-50 px-2.5">
        {/* ── Section 1: Symptoms — per-item copy on hover ── */}
        <div className="py-2">
          <div className="mb-1 flex items-center justify-between">
            <TagHeading icon={<Activity size={11} />} label="Symptoms" />
            <button
              type="button"
              onClick={() =>
                onCopy(
                  {
                    sourceDateLabel: `Patient-reported ${data.reportedAt}`,
                    targetSection: "symptoms",
                    symptoms: data.symptoms.map((sx) => sx.name),
                    additionalNotes: data.symptoms.map((sx) => `${sx.name}${sx.duration ? ` (${sx.duration})` : ""}${sx.severity ? ` [${sx.severity}]` : ""}`).join(" | "),
                  },
                  "Symptoms → Complaints",
                )
              }
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-tp-blue-600 opacity-0 transition-opacity hover:text-tp-blue-700 group-hover:opacity-100 [div:hover>&]:opacity-100"
              title="Copy all symptoms"
            >
              <Copy size={9} /> Copy Sx
            </button>
          </div>
          <div className="space-y-0.5">
            {data.symptoms.map((sx) => (
              <div key={sx.name} className="group/sx flex items-center justify-between gap-1 rounded px-0.5 py-0.5 hover:bg-tp-violet-50/60">
                <div className="flex flex-wrap items-center gap-1 text-[12px]">
                  <span className="font-medium text-tp-slate-700">{sx.name}</span>
                  {sx.duration && (
                    <span className="rounded bg-tp-violet-100/80 px-1 py-0.5 text-[10px] font-medium text-tp-violet-600">
                      {sx.duration}
                    </span>
                  )}
                  {sx.severity && (
                    <span
                      className={cn(
                        "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                        sx.severity === "High" || sx.severity === "Severe"
                          ? "bg-tp-error-50 text-tp-error-600"
                          : sx.severity === "Moderate"
                            ? "bg-tp-warning-50 text-tp-warning-700"
                            : "bg-tp-slate-100 text-tp-slate-500",
                      )}
                    >
                      {sx.severity}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      {
                        sourceDateLabel: `Patient-reported ${data.reportedAt}`,
                        targetSection: "symptoms",
                        symptoms: [sx.name],
                        additionalNotes: `${sx.name}${sx.duration ? ` (${sx.duration})` : ""}${sx.severity ? ` [${sx.severity}]` : ""}`,
                      },
                      `${sx.name} → Complaints`,
                    )
                  }
                  className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-tp-violet-50 group-hover/sx:opacity-100"
                  title={`Copy ${sx.name}`}
                >
                  <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: Chronic / Medical History — per-item copy ── */}
        {data.medicalHistory?.length ? (
          <div className="py-2">
            <div className="mb-1 flex items-center justify-between">
              <TagHeading icon={<Notepad2 size={11} variant="Bold" />} label="Chronic" />
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    {
                      sourceDateLabel: `Patient-reported History ${data.reportedAt}`,
                      targetSection: "history",
                      additionalNotes: data.medicalHistory!.join(" | "),
                    },
                    "History → Medical History",
                  )
                }
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-tp-blue-600 opacity-0 transition-opacity hover:text-tp-blue-700 [div:hover>&]:opacity-100"
                title="Copy all history"
              >
                <Copy size={9} /> Copy Hx
              </button>
            </div>
            <div className="space-y-0.5">
              {data.medicalHistory.map((item, i) => (
                <div key={i} className="group/hx flex items-center justify-between gap-1 rounded px-0.5 py-0.5 hover:bg-tp-slate-50">
                  <span className="text-[12px] text-tp-slate-600">{item}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(
                        {
                          sourceDateLabel: `Patient-reported History ${data.reportedAt}`,
                          targetSection: "history",
                          additionalNotes: item,
                        },
                        `${item} → History`,
                      )
                    }
                    className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-tp-slate-50 group-hover/hx:opacity-100"
                    title={`Copy ${item}`}
                  >
                    <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Section 3: Allergies (from patient input, not validated) ── */}
        {data.allergies?.length ? (
          <div className="py-2">
            <div className="mb-1">
              <TagHeading icon={<ShieldCheck size={11} />} label="Allergies" />
            </div>
            <div className="space-y-0.5">
              {data.allergies.map((item, i) => (
                <div key={i} className="group/al flex items-center justify-between gap-1 rounded px-0.5 py-0.5 hover:bg-tp-error-50/40">
                  <span className="text-[12px] font-medium text-tp-error-700">{item}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(
                        {
                          sourceDateLabel: `Patient-reported Allergy ${data.reportedAt}`,
                          targetSection: "history",
                          additionalNotes: `Allergy: ${item}`,
                        },
                        `Allergy: ${item} → History`,
                      )
                    }
                    className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-tp-error-50 group-hover/al:opacity-100"
                    title={`Copy allergy: ${item}`}
                  >
                    <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Section 4: Family History — per-item copy ── */}
        {data.familyHistory?.length ? (
          <div className="py-2">
            <div className="mb-1 flex items-center justify-between">
              <TagHeading icon={<People size={11} />} label="Family" />
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    {
                      sourceDateLabel: `Patient-reported Family ${data.reportedAt}`,
                      targetSection: "history",
                      additionalNotes: data.familyHistory!.map((f) => `Family: ${f}`).join(" | "),
                    },
                    "Family History → History",
                  )
                }
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-tp-blue-600 opacity-0 transition-opacity hover:text-tp-blue-700 [div:hover>&]:opacity-100"
                title="Copy all family history"
              >
                <Copy size={9} /> Copy FHx
              </button>
            </div>
            <div className="space-y-0.5">
              {data.familyHistory.map((item, i) => (
                <div key={i} className="group/fh flex items-center justify-between gap-1 rounded px-0.5 py-0.5 hover:bg-tp-slate-50">
                  <span className="text-[12px] text-tp-slate-600">{item}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(
                        {
                          sourceDateLabel: `Patient-reported Family ${data.reportedAt}`,
                          targetSection: "history",
                          additionalNotes: `Family: ${item}`,
                        },
                        `Family: ${item} → History`,
                      )
                    }
                    className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-tp-slate-50 group-hover/fh:opacity-100"
                    title={`Copy ${item}`}
                  >
                    <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Section 5: Lifestyle (if data present) ── */}
        {data.lifestyle?.length ? (
          <div className="py-2">
            <div className="mb-1">
              <TagHeading icon={<HeartPulse size={11} />} label="Lifestyle" />
            </div>
            <div className="space-y-0.5">
              {data.lifestyle.map((item, i) => (
                <div key={i} className="group/ls flex items-center justify-between gap-1 rounded px-0.5 py-0.5 hover:bg-tp-slate-50">
                  <span className="text-[12px] text-tp-slate-600">{item}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(
                        {
                          sourceDateLabel: `Patient-reported Lifestyle ${data.reportedAt}`,
                          targetSection: "history",
                          additionalNotes: `Lifestyle: ${item}`,
                        },
                        `${item} → History`,
                      )
                    }
                    className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-tp-slate-50 group-hover/ls:opacity-100"
                    title={`Copy ${item}`}
                  >
                    <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Disclaimer footer */}
      <div className="border-t border-tp-violet-100 px-2.5 py-1">
        <p className="text-[9px] italic text-tp-slate-400">
          ⚠ Patient-reported data — not clinically validated. Verify before prescribing.
        </p>
      </div>
    </div>
  )
}

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
      { short: "Symptoms", value: "Fever (2 days | High severity | Evening spikes), Eye redness (2 days | Bilateral | Watering)" },
      { short: "Diagnosis", value: "Viral fever, Conjunctivitis" },
      { short: "Medication", value: "Telma20 (1-0-0-1 | Before food | 4 days), Metsmail 500 (1-0-0-1 | After food | 4 days)" },
      { short: "Lab Tests", value: "CBC, LFT" },
      { short: "Advice", value: "Hydration, eye hygiene and steam inhalation, avoid screen time" },
      { short: "Follow-up", value: "Review in 2 weeks with lab reports" },
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
      { short: "Symptoms", value: "Fever (3 days | Moderate), Cough (dry | 4 days), Throat discomfort (mild)" },
      { short: "Diagnosis", value: "Upper respiratory infection" },
      { short: "Medication", value: "Azithromycin 500mg (1-0-0-0 | After food | 3 days), Paracetamol 650 (As needed | After food | If fever >100°F)" },
      { short: "Lab Tests", value: "CBC" },
      { short: "Follow-up", value: "Review in 5 days" },
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
      reply: "Patient smart snapshot: compact overview for quick pre-consult review.",
      nextPhase: "in_progress",
      rxOutput: {
        kind: "patient_summary",
        summaryData,
        activeSpecialty: "gp" as SpecialtyTabId,
        patientGender: patient.gender,
        patientAge: patient.age,
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
          { label: "Adequate hydration (2.5 to 3L water daily)", selected: true },
          { label: "Steam inhalation twice daily", selected: true },
          { label: "Avoid cold beverages and dust exposure" },
          { label: "Light diet, avoid oily and spicy food" },
          { label: "Monitor temperature (revisit if fever > 101°F persists 48h)" },
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
        meds: ["Paracetamol 650mg (1-0-0-1 | After food | 5 days | As needed if fever>100°F)", "Levocetirizine 5mg (0-0-0-1 | After food | 5 days)", "Ibuprofen 400mg (1-0-1-0 | After food | 3 days | If pain)"],
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

  if (q.includes("protocol") || q.includes("treatment plan") || q.includes("medication protocol")) {
    return {
      reply: "Protocol-based medication plan generated. Review and copy to RxPad.",
      nextPhase: "dx_accepted",
      rxOutput: {
        kind: "protocol_meds",
        diagnosis: "Type 2 Diabetes Mellitus",
        meds: [
          { name: "Metformin", dose: "500mg", route: "Oral", frequency: "1-0-0-1", safetyCheck: "ok" },
          { name: "Glimepiride", dose: "1mg", route: "Oral", frequency: "1-0-0-0", safetyCheck: "ok" },
          { name: "Atorvastatin", dose: "10mg", route: "Oral", frequency: "0-0-0-1", safetyCheck: "ok" },
        ],
        copyPayload: {
          sourceDateLabel: "Protocol",
          targetSection: "rxpad",
          medications: [
            { medicine: "Metformin 500mg", unitPerDose: "1 tab", frequency: "1-0-0-1", when: "After food", duration: "30 days", note: "" },
            { medicine: "Glimepiride 1mg", unitPerDose: "1 tab", frequency: "1-0-0-0", when: "Before food", duration: "30 days", note: "" },
            { medicine: "Atorvastatin 10mg", unitPerDose: "1 tab", frequency: "0-0-0-1", when: "After food", duration: "30 days", note: "" },
          ],
        },
      },
    }
  }

  if (q.includes("what is") || q.includes("meaning of") || q.includes("define")) {
    return {
      reply: "Here is a quick clinical fact for your reference.",
      rxOutput: {
        kind: "text_fact",
        icon: "info",
        fact: "HbA1c reflects average blood glucose over the past 2-3 months. A value above 6.5% is diagnostic of diabetes mellitus. Target for most adults with diabetes is below 7%.",
        source: "ADA Standards of Care 2025",
      },
    }
  }

  if (q.includes("allergy check") || q.includes("check allergy") || q.includes("nsaid allergy")) {
    return {
      reply: "Allergy conflict detected for this patient.",
      rxOutput: {
        kind: "allergy_conflict",
        drug: "Ibuprofen",
        allergy: summaryData.allergies?.find((a) => a.toLowerCase().includes("nsaid")) ?? "NSAID sensitivity",
        severity: "critical",
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
            <p className="truncate text-[12px] font-semibold text-tp-slate-700">{output.title}</p>
            <p className="truncate text-[12px] text-tp-slate-500">{output.subtitle}</p>
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
          <div key={point} className="group/point grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5 text-[12px] text-tp-slate-700">
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
              <button type="button" className="rounded-full border border-tp-slate-200 bg-tp-slate-50/80 px-2 py-0.5 text-[12px] font-medium text-tp-slate-600">
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
  /** Map raw section.short to concise heading labels */
  const sectionLabel = (short: string): string => {
    const s = short.toLowerCase()
    if (s.includes("symptom")) return "Sx"
    if (s.includes("exam")) return "Examination"
    if (s.includes("diagnosis")) return "Dx"
    if (s.includes("medication")) return "Rx"
    if (s.includes("lab")) return "Lab"
    if (s.includes("follow")) return "Follow-up"
    return short
  }

  /** Build a copy payload for a single item within a section */
  const itemPayload = (lower: string, item: string): RxPadCopyPayload => {
    if (lower.includes("symptom"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", symptoms: [item] }
    if (lower.includes("diagnosis"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", diagnoses: [item] }
    if (lower.includes("medication"))
      return {
        sourceDateLabel: `Visit ${data.visitDate}`,
        targetSection: "rxpad",
        medications: [{ medicine: item.trim(), unitPerDose: "-", frequency: "-", when: "-", duration: "-", note: "" }],
      }
    if (lower.includes("lab"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "labResults", labInvestigations: [item] }
    if (lower.includes("follow"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", followUp: item }
    return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "history", additionalNotes: item }
  }

  /** Build a copy payload for an entire section */
  const sectionPayload = (lower: string, items: string[], rawValue: string): RxPadCopyPayload => {
    if (lower.includes("symptom"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", symptoms: items }
    if (lower.includes("diagnosis"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", diagnoses: items }
    if (lower.includes("medication"))
      return {
        sourceDateLabel: `Visit ${data.visitDate}`,
        targetSection: "rxpad",
        medications: items.map((med) => ({ medicine: med.trim(), unitPerDose: "-", frequency: "-", when: "-", duration: "-", note: "" })),
      }
    if (lower.includes("lab"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "labResults", labInvestigations: items }
    if (lower.includes("follow"))
      return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "rxpad", followUp: rawValue }
    return { sourceDateLabel: `Visit ${data.visitDate}`, targetSection: "history", additionalNotes: rawValue }
  }

  // Section icon mapping
  const sectionIcon = (short: string): React.ReactNode => {
    const s = short.toLowerCase()
    if (s.includes("symptom")) return <Activity size={12} className="text-tp-slate-400" />
    if (s.includes("exam")) return <Stethoscope size={12} className="text-tp-slate-400" />
    if (s.includes("diagnosis")) return <Stethoscope size={12} className="text-tp-blue-500" />
    if (s.includes("medication")) return <Pill size={12} className="text-tp-violet-500" />
    if (s.includes("lab")) return <FlaskConical size={12} className="text-tp-blue-500" />
    if (s.includes("advice")) return <FileText size={12} className="text-tp-emerald-500" />
    if (s.includes("follow")) return <Calendar size={12} className="text-tp-amber-500" />
    return <FileText size={12} className="text-tp-slate-400" />
  }

  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* ── Card header ── */}
      <div className="flex items-center justify-between gap-2 bg-tp-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
            <FileText size={13} className="text-tp-violet-600" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#1A1714]">Last Visit</p>
            <p className="text-[11px] text-[#9E978B]">{data.visitDate}</p>
          </div>
        </div>
        <HoverCopyButton
          size="card"
          label="Copy entire visit to RxPad"
          payload={data.copyAllPayload}
          onCopy={onCopy}
        />
      </div>

      {/* ── Detailed Pointer Sections ── */}
      <div className="py-1">
        {data.sections.map((section) => {
          const lower = section.short.toLowerCase()
          const heading = sectionLabel(section.short)
          const icon = sectionIcon(section.short)
          const sectionItems = section.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
          const secPayload = sectionPayload(lower, sectionItems, section.value)

          // For advice/follow-up: render as paragraph, not bullets
          const isTextSection = lower.includes("advice") || lower.includes("follow")

          return (
            <div key={section.short} className="mb-1">
              {/* Section strip heading */}
              <div className="group/heading mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
                {icon}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">{heading}</span>
                <button
                  type="button"
                  onClick={() => onCopy(secPayload, `${heading} copied`)}
                  className="ml-auto opacity-0 transition-opacity group-hover/heading:opacity-100"
                  title={`Copy ${heading}`}
                >
                  <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                </button>
              </div>

              {/* Content */}
              {isTextSection ? (
                <p className="px-3 text-[11px] leading-[16px] text-[#1A1714]/80">{section.value}</p>
              ) : (
                <ul className="space-y-[3px] px-3">
                  {sectionItems.map((entry, index) => {
                    const isMed = lower.includes("medication")
                    const isSx = lower.includes("symptom")
                    const isDx = lower.includes("diagnosis")

                    return (
                      <li
                        key={`${entry}-${index}`}
                        className="group/item flex items-start gap-1.5"
                      >
                        <span className="mt-[6px] block size-[4px] shrink-0 rounded-full bg-tp-slate-300" />
                        <span className="min-w-0 flex-1 text-[11.5px] leading-[16px] text-tp-slate-600">
                          {isMed ? (() => {
                            // Parse: "DrugName (detail)" bracket format
                            const parenMatch = entry.match(/^(.+?)(\s*\(.+\))$/)
                            if (parenMatch) {
                              return (
                                <>
                                  <span className="font-semibold text-tp-slate-700">{parenMatch[1].trim()}</span>
                                  <span className="text-tp-slate-400">{parenMatch[2]}</span>
                                </>
                              )
                            }
                            const med = parseMedicationEntry(entry)
                            return (
                              <>
                                <span className="font-semibold text-tp-slate-700">{med.name || entry}</span>
                                {med.detail ? <span className="text-tp-slate-400"> ({med.detail})</span> : null}
                              </>
                            )
                          })() : isSx ? (() => {
                            // Parse: "SymptomName (detail)" bracket format
                            const parenMatch = entry.match(/^(.+?)(\s*\(.+\))$/)
                            if (parenMatch) {
                              return (
                                <>
                                  <span className="font-semibold text-tp-slate-700">{parenMatch[1].trim()}</span>
                                  <span className="text-tp-slate-400">{parenMatch[2]}</span>
                                </>
                              )
                            }
                            const token = parseTokenDetail(entry)
                            return (
                              <>
                                <span className="font-medium text-tp-slate-700">{token.label}</span>
                                {token.detail ? <span className="text-tp-slate-400"> — {token.detail}</span> : null}
                              </>
                            )
                          })() : isDx ? (
                            <span className="font-semibold text-tp-slate-700">{entry}</span>
                          ) : (
                            <span className="font-medium text-tp-slate-700">{entry}</span>
                          )}
                        </span>
                        {/* Level 3 — per-item hover copy */}
                        <HoverCopyButton
                          size="item"
                          label={`Copy "${entry}" to RxPad`}
                          payload={itemPayload(lower, entry)}
                          onCopy={onCopy}
                          className="shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100"
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Action Row ── */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
        <SidebarCTA label="See all past visits" targetTab="past-visits" />
        <button type="button" onClick={() => onQuickSend("Compare previous visit with current context")} className={AGENT_GRADIENT_CHIP_CLASS}>
          Compare visit
        </button>
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
      <p className="mb-1 text-[12px] font-semibold text-tp-slate-800">Select visit dates</p>
      <p className="mb-2 text-[12px] text-tp-slate-500">Choose one or more dates to load visit summaries.</p>
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
              className={cn("rounded-full border-[0.5px] px-2 py-0.5 text-[12px] font-medium", active ? AGENT_GRADIENT_CHIP_CLASS : "border-tp-slate-200 bg-white text-tp-slate-700")}
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
          "rounded-full border-[0.5px] px-2 py-0.5 text-[12px] font-semibold",
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
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      <div className="flex items-start justify-between gap-2 bg-tp-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
            <HeartPulse size={13} className="text-tp-violet-600" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#1A1714]">Vitals Trend View</p>
            <p className="text-[11px] text-[#9E978B]">{data.summary}</p>
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
              <p className="text-[12px] font-semibold text-tp-slate-700">{trend.label}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[12px] font-semibold",
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
            {trend.values.length <= 4 ? (
              <VitalBarChart
                values={trend.values}
                labels={trend.labels}
                tone={trend.tone === "critical" ? "red" : trend.tone === "warn" ? "teal" : "violet"}
                threshold={getVitalThreshold(trend.label)}
              />
            ) : (
              <MiniLineGraph
                values={trend.values}
                labels={trend.labels}
                tone={trend.tone === "critical" ? "red" : trend.tone === "warn" ? "teal" : "violet"}
                threshold={getVitalThreshold(trend.label)}
              />
            )}
          </div>
        ))}
      </div>
      <SourceAttribution tab="Vitals" section="Trend Analysis" />
      <SidebarCTA label="View full vitals history →" targetTab="vitals" />
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
            <p className="text-[12px] font-semibold text-tp-slate-700">
              Abnormal lab results{data.panelDate ? ` · ${data.panelDate}` : ""}
            </p>
            <p className="text-[12px] text-tp-slate-500">{data.hiddenNormalCount} normal values hidden for compact view</p>
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
      <div className="space-y-1 text-[12px] text-tp-slate-600">
        {data.flagged.map((row) => (
          <div key={row.name} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto_auto] items-start gap-x-1.5">
            <span className="text-tp-slate-400">•</span>
            <p className="min-w-0 font-medium">
              <span className="text-tp-slate-500">{row.name}</span>
            </p>
            <span className={cn("text-[12px] font-semibold", row.flag === "high" ? "text-tp-error-600" : "text-tp-warning-700")}>
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
      <div className="mt-1.5 rounded-[10px] bg-white/72 px-2 py-1 text-[12px] text-tp-slate-700">{data.insight}</div>
      <SourceAttribution tab="Lab Results" section="Abnormal Panel" date={data.panelDate} />
      <SidebarCTA label="View complete lab report →" targetTab="lab-results" />
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

  const worseCount = data.rows.filter(r => r.status === "worse").length

  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Card Header */}
      <div className="flex items-center gap-2 bg-tp-slate-50 px-3 py-2">
        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={14} />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#1A1714]">{data.title}</p>
            {worseCount > 0 && (
              <span className="rounded-[4px] bg-[#C42B2B] px-1.5 py-[1px] text-[10px] font-semibold text-white">{worseCount} worse</span>
            )}
          </div>
          <p className="text-[11px] text-[#9E978B]">{data.currentLabel} vs {data.previousLabel}</p>
        </div>
      </div>

      {/* Comparison rows */}
      <div className="space-y-[2px] p-2">
        {data.rows.map((row) => {
          const active = selectedRows.includes(row.section)
          const statusColor = row.status === "worse" ? "#C42B2B" : row.status === "improved" ? "#1B8C54" : "#9E978B"
          return (
            <button
              key={row.section}
              type="button"
              onClick={() =>
                setSelectedRows((prev) =>
                  active ? prev.filter((item) => item !== row.section) : [...prev, row.section],
                )
              }
              className={cn(
                "w-full rounded-[8px] border-[0.5px] border-l-[3px] px-2.5 py-1.5 text-left transition-colors hover:bg-tp-slate-50",
                row.status === "worse" ? "border-l-[#C42B2B] border-tp-error-100" :
                row.status === "improved" ? "border-l-[#1B8C54] border-tp-success-100" : "border-l-[#9E978B] border-tp-slate-200",
              )}
            >
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-[#1A1714]">{row.section}</p>
                <span className="shrink-0 rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold capitalize" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
                  {row.status}
                </span>
              </div>
              <div className="grid grid-cols-[52px_1fr] gap-x-1 gap-y-0.5 text-[11px]">
                <span className="text-[#9E978B]">Current</span>
                <span className="font-medium text-[#1A1714]">{row.current}</span>
                <span className="text-[#9E978B]">Previous</span>
                <span className="text-[#1A1714]/70">{row.previous}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
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
          <Copy size={10} className="mr-1" /> Copy comparison
        </button>
        <button type="button" onClick={() => onQuickSend("Generate DDX using worsened findings only")} className={AGENT_GRADIENT_CHIP_CLASS}>
          DDX from worsened
        </button>
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

  const highCount = data.findings.filter(f => f.severity === "high").length
  const modCount = data.findings.filter(f => f.severity === "moderate").length

  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 bg-tp-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
            <AlertTriangle size={14} className="text-tp-violet-600" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-[#1A1714]">{data.title}</p>
              {highCount > 0 && (
                <span className="rounded-[4px] bg-[#C42B2B] px-1.5 py-[1px] text-[10px] font-semibold text-white">{highCount} high</span>
              )}
              {modCount > 0 && (
                <span className="rounded-[4px] bg-[#C6850C] px-1.5 py-[1px] text-[10px] font-semibold text-white">{modCount} moderate</span>
              )}
            </div>
            <p className="text-[11px] text-[#9E978B]">{data.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Findings rows */}
      <div className="space-y-[2px] p-2">
        {data.findings.map((item) => {
          const active = selected.includes(item.label)
          const sevColor = item.severity === "high" ? "#C42B2B" : item.severity === "moderate" ? "#C6850C" : "#9E978B"
          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setSelected((prev) =>
                  active ? prev.filter((entry) => entry !== item.label) : [...prev, item.label],
                )
              }
              className={cn(
                "group/af flex w-full items-start gap-2 rounded-[8px] border-[0.5px] border-l-[3px] px-2.5 py-1.5 text-left transition-colors",
                item.severity === "high"
                  ? "border-l-[#C42B2B] border-tp-error-100 bg-tp-error-50/30 hover:bg-tp-error-50/60"
                  : item.severity === "moderate"
                    ? "border-l-[#C6850C] border-tp-warning-100 bg-tp-warning-50/20 hover:bg-tp-warning-50/40"
                    : "border-l-[#9E978B] border-tp-slate-200 bg-tp-slate-50/50 hover:bg-tp-slate-50",
              )}
            >
              {/* Checkbox */}
              <span className={cn(
                "mt-0.5 inline-flex size-[16px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-all",
                active ? "border-tp-blue-500 bg-tp-blue-500 text-white" : "border-tp-slate-300 bg-white text-transparent",
              )}>
                <Check size={10} strokeWidth={3} />
              </span>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-[12px] font-semibold text-[#1A1714]">{item.label}</p>
                  <span className="shrink-0 rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold capitalize" style={{ backgroundColor: `${sevColor}15`, color: sevColor }}>
                    {item.severity}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-[15px] text-[#9E978B]">{item.detail}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
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
          <Copy size={11} className="mr-1" /> Copy findings
        </button>
        <button type="button" onClick={() => onQuickSend("Generate DDX from selected abnormal findings")} className={AGENT_GRADIENT_CHIP_CLASS}>
          DDX from findings
        </button>
        <button type="button" onClick={() => onQuickSend("Suggest investigations for selected abnormal findings")} className={AGENT_GRADIENT_CHIP_CLASS}>
          Suggest investigations
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────── */
/*  DDX 3-TIER CARD — Can't Miss / Most Likely / Consider          */
/*  Phase 6A — Visual Overhaul per Implementation Guide            */
/* ──────────────────────────────────────────────────────────────── */

const DDX_TIER_CONFIG = {
  cant_miss: {
    title: "CAN'T MISS",
    icon: <ShieldCheck size={11} />,
    borderClass: "border-l-[3px] border-l-tp-error-400",
    bgClass: "bg-tp-error-50/50",
    titleClass: "text-tp-error-700",
    badgeBg: "bg-tp-error-100 text-tp-error-700",
    hoverBg: "hover:bg-tp-error-50/80",
  },
  most_likely: {
    title: "MOST LIKELY",
    icon: <Stethoscope size={11} />,
    borderClass: "border-l-[3px] border-l-tp-blue-400",
    bgClass: "bg-tp-blue-50/40",
    titleClass: "text-tp-blue-700",
    badgeBg: "bg-tp-blue-100 text-tp-blue-700",
    hoverBg: "hover:bg-tp-blue-50/60",
  },
  extended: {
    title: "CONSIDER",
    icon: <Search size={11} />,
    borderClass: "border-l-[3px] border-l-tp-slate-300",
    bgClass: "bg-tp-slate-50/60",
    titleClass: "text-tp-slate-600",
    badgeBg: "bg-tp-slate-200 text-tp-slate-600",
    hoverBg: "hover:bg-tp-slate-100/60",
  },
} as const

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
  const [selected, setSelected] = useState<string[]>([])
  const [expandedRationale, setExpandedRationale] = useState<string[]>([])
  const contextTokens = useMemo(
    () => data.context.split("+").map((item) => item.trim()).filter(Boolean),
    [data.context],
  )

  useEffect(() => {
    setSelected([])
    setExpandedRationale([])
  }, [data.context, data.options])

  const grouped = useMemo(() => {
    const bucketMap: Record<"cant_miss" | "most_likely" | "extended", Array<(typeof data.options)[number]>> = {
      cant_miss: [],
      most_likely: [],
      extended: [],
    }
    for (const option of data.options) {
      const bucket = option.bucket ?? (option.confidence >= 80 ? "cant_miss" : option.confidence >= 60 ? "most_likely" : "extended")
      bucketMap[bucket].push(option)
    }
    return (["cant_miss", "most_likely", "extended"] as const).map((id) => ({
      id,
      ...DDX_TIER_CONFIG[id],
      options: bucketMap[id],
    })).filter(g => g.options.length > 0)
  }, [data.options])

  const selectedCount = selected.length

  function toggleSelection(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  function toggleRationale(name: string) {
    setExpandedRationale((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 bg-tp-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={14} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-[#1A1714]">Differential Diagnosis</p>
              <span className="rounded-[4px] bg-tp-violet-100 px-1.5 py-[1px] text-[10px] font-semibold text-tp-violet-700">
                {data.options.length}
              </span>
            </div>
            <p className="text-[11px] text-[#9E978B]">3-tier ranked by clinical probability</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCopy({ sourceDateLabel: "DDX suggestions", diagnoses: data.options.map(o => o.name) }, "All DDX copied to RxPad")}
          className={HOVER_COPY_ICON_CLASS}
          title="Copy all to RxPad"
          aria-label="Copy all DDX to RxPad"
        >
          <Copy size={11} />
        </button>
      </div>

      {/* Context tokens */}
      {contextTokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-b border-[#C4BFB5]/20 px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#9E978B]">Based on</span>
          {contextTokens.map((token) => (
            <span key={token} className="rounded-full bg-tp-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-[#1A1714]">{token}</span>
          ))}
        </div>
      )}

      {/* 3-Tier Groups */}
      <div className="space-y-1.5">
        {grouped.map((group) => (
          <div key={group.id} className={cn("overflow-hidden rounded-[10px]", group.bgClass)}>
            {/* Tier header */}
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1.5", group.borderClass)}>
              <span className={group.titleClass}>{group.icon}</span>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", group.titleClass)}>{group.title}</span>
              <span className={cn("ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold", group.badgeBg)}>{group.options.length}</span>
            </div>

            {/* Options */}
            <div className="divide-y divide-white/60">
              {group.options.map((option) => {
                const isSelected = selected.includes(option.name)
                const isExpanded = expandedRationale.includes(option.name)
                return (
                  <div key={option.name} className={cn("group/dx px-2.5 py-1.5 transition-colors", group.hoverBg)}>
                    <div className="flex items-start gap-2">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleSelection(option.name)}
                        className={cn(
                          "mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all",
                          isSelected
                            ? "border-tp-blue-500 bg-tp-blue-500 text-white shadow-[0_0_0_2px_rgba(75,74,213,0.15)]"
                            : "border-tp-slate-300 bg-white text-transparent hover:border-tp-blue-300",
                        )}
                        aria-label={`${isSelected ? "Unselect" : "Select"} ${option.name}`}
                      >
                        <Check size={11} strokeWidth={3} />
                      </button>

                      {/* Dx content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleRationale(option.name)}
                            className="text-left text-[12px] font-semibold text-tp-slate-800 hover:text-tp-blue-700"
                          >
                            {option.name}
                          </button>
                          <span className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                            group.badgeBg,
                          )}>
                            {option.confidence}%
                          </span>
                        </div>
                        {/* Rationale — collapsible */}
                        {isExpanded && (
                          <p className="mt-0.5 text-[11px] leading-[15px] text-tp-slate-500">{option.rationale}</p>
                        )}
                      </div>

                      {/* Per-row copy */}
                      <button
                        type="button"
                        onClick={() => onCopy({ sourceDateLabel: "DDX", diagnoses: [option.name] }, `${option.name} → Dx`)}
                        className={cn("shrink-0 opacity-0 transition-opacity group-hover/dx:opacity-100", HOVER_COPY_ICON_CLASS)}
                        title={`Copy ${option.name} to RxPad`}
                        aria-label={`Copy ${option.name} to RxPad`}
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={() => {
            onAccept(selected)
            onQuickSend(`Generate cascade for ${selected.join(", ")}`)
          }}
          className={selectedCount > 0 ? AI_SMALL_SECONDARY_CTA_CLASS : AGENT_GRADIENT_CHIP_CLASS}
        >
          {selectedCount > 0 ? `Accept ${selectedCount} Dx → Cascade` : "Select Dx to cascade"}
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={() => onCopy({ sourceDateLabel: "Selected DDX", diagnoses: selected }, `${selectedCount} Dx → RxPad`)}
          className={AI_SMALL_SECONDARY_CTA_CLASS}
        >
          <Copy size={10} className="mr-1" /> Copy to Dx
        </button>
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
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Card Header */}
      <div className="flex items-center gap-2 bg-tp-slate-50 px-3 py-2">
        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
          <FlaskConical size={13} className="text-tp-violet-600" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#1A1714]">{data.title}</p>
            <span className="rounded-[4px] bg-tp-blue-50 px-1.5 py-[1px] text-[10px] font-semibold text-tp-blue-700">{data.items.length}</span>
          </div>
          <p className="text-[11px] text-[#9E978B]">{data.subtitle}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-[2px] p-2">
        {data.items.map((item) => {
          const isSelected = selected.includes(item.label)
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => toggleSelection(item.label)}
              className="flex w-full items-center gap-2 rounded-[8px] border-[0.5px] border-tp-slate-100 px-2.5 py-1.5 text-left transition-colors hover:bg-tp-slate-50"
            >
              <span className={cn(
                "inline-flex size-[16px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-all",
                isSelected ? "border-tp-blue-500 bg-tp-blue-500 text-white" : "border-tp-slate-300 bg-white text-transparent",
              )}>
                <Check size={10} strokeWidth={3} />
              </span>
              <span className="text-[12px] leading-[16px] text-[#1A1714]">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
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
          <Copy size={10} className="mr-1" /> Add {selected.length > 0 ? `${selected.length} selected` : "all"}
        </button>
        <button type="button" onClick={() => onQuickSend("Refine investigation bundle by cost and urgency")} className={AGENT_GRADIENT_CHIP_CLASS}>
          Edit bundle
        </button>
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
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Card Header */}
      <div className="flex items-center gap-2 bg-tp-slate-50 px-3 py-2">
        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
          <FileText size={13} className="text-tp-violet-600" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#1A1714]">{data.title}</p>
            <span className="rounded-[4px] bg-tp-violet-50 px-1.5 py-[1px] text-[10px] font-semibold text-tp-violet-700">{data.items.length}</span>
          </div>
          <p className="text-[11px] text-[#9E978B]">{data.subtitle}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-[2px] p-2">
        {data.items.map((item) => {
          const isSelected = selected.includes(item.label)
          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setSelected((prev) => (prev.includes(item.label) ? prev.filter((entry) => entry !== item.label) : [...prev, item.label]))
              }
              className="flex w-full items-center gap-2 rounded-[8px] border-[0.5px] border-tp-slate-100 px-2.5 py-1.5 text-left transition-colors hover:bg-tp-slate-50"
            >
              <span className="size-[5px] shrink-0 rounded-full bg-tp-violet-400" />
              <span className={cn("text-[12px] leading-[16px]", isSelected ? "font-medium text-[#1A1714]" : "text-[#1A1714]/70")}>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
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
          <Copy size={10} className="mr-1" /> Add to advice
        </button>
        <button type="button" onClick={() => onQuickSend(data.shareMessage)} className={AGENT_GRADIENT_CHIP_CLASS}>
          Share with patient
        </button>
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
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Card Header */}
      <div className="flex items-center gap-2 bg-tp-slate-50 px-3 py-2">
        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
          <Calendar size={13} className="text-tp-violet-600" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#1A1714]">{data.title}</p>
          </div>
          <p className="text-[11px] text-[#9E978B]">{data.subtitle}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-[2px] p-2">
        {data.items.map((item) => {
          const isSelected = selected.includes(item.label)
          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setSelected((prev) => (prev.includes(item.label) ? prev.filter((entry) => entry !== item.label) : [...prev, item.label]))
              }
              className="flex w-full items-center gap-2 rounded-[8px] border-[0.5px] border-tp-slate-100 px-2.5 py-1.5 text-left transition-colors hover:bg-tp-slate-50"
            >
              <span className="size-[5px] shrink-0 rounded-full bg-[#C6850C]" />
              <span className={cn("text-[12px] leading-[16px]", isSelected ? "font-medium text-[#1A1714]" : "text-[#1A1714]/70")}>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
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
          <Calendar size={10} className="mr-1" /> Set follow-up
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
          <Copy size={10} className="mr-1" /> Add notes
        </button>
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
  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between gap-2 bg-tp-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #2AABAB)" }}
          >
            <Pill size={13} className="text-white" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-semibold text-[#1A1714]">
                Suggested Rx
              </p>
              <span className="rounded-[4px] bg-tp-blue-50 px-1.5 py-[1px] text-[10px] font-semibold text-tp-blue-700">
                {data.meds.length} meds
              </span>
            </div>
            <p className="text-[11px] text-[#9E978B]">{data.diagnosis}</p>
          </div>
        </div>
        <HoverCopyButton
          size="card"
          label="Copy all meds to Med(Rx)"
          payload={data.copyPayload}
          onCopy={(p) => onCopy(p, "All medications copied to Med(Rx)")}
        />
      </div>

      {/* ── Safety Line ── */}
      <div className="flex items-center gap-1.5 border-b border-[#C4BFB5]/20 bg-[#1B8C54]/5 px-3 py-1">
        <span className="size-[5px] rounded-full bg-[#1B8C54]" />
        <p className="text-[11px] font-medium text-[#1B8C54]">
          No allergy conflicts · No interactions
        </p>
      </div>

      {/* ── Drug Rows (bordered) ── */}
      <div className="overflow-hidden rounded-[8px] border-[0.5px] border-tp-slate-150">
        {data.meds.map((med, idx) => {
          // Parse: "DrugName (detail)" bracket format
          let drugName = med
          let drugDetail = ""
          {
            const parenMatch = med.match(/^([^(]+)\((.+)\)$/)
            if (parenMatch) {
              drugName = parenMatch[1].trim()
              drugDetail = parenMatch[2].trim()
            } else {
              const spaceMatch = med.match(/^([A-Za-z]+\s?\d*\s?(?:mg|mcg|ml|g|IU)?)\s*(.*)$/)
              if (spaceMatch && spaceMatch[2]) {
                drugName = spaceMatch[1].trim()
                drugDetail = spaceMatch[2].trim()
              }
            }
          }

          return (
            <div
              key={med}
              className={cn(
                "group/drug flex items-start justify-between gap-2 px-2.5 py-2 hover:bg-tp-slate-50/50",
                idx > 0 && "border-t border-tp-slate-100",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-tp-slate-800">{drugName}</p>
                {drugDetail && (
                  <p className="mt-0.5 text-[11px] leading-[14px] text-tp-slate-500">{drugDetail}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    {
                      sourceDateLabel: `Suggested Rx · ${data.diagnosis}`,
                      targetSection: "rxpad",
                      medications: [{ medicine: med.trim(), unitPerDose: "-", frequency: "-", when: "-", duration: "-", note: "" }],
                    },
                    `${drugName} copied to Med(Rx)`,
                  )
                }
                className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] border-[0.5px] border-transparent text-tp-slate-300 hover:border-tp-slate-200 hover:text-tp-blue-500"
                title={`Copy ${drugName} to Med(Rx)`}
                aria-label={`Copy ${drugName} to Med(Rx)`}
              >
                <Copy size={10} />
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Copy All button ── */}
      <div className="mt-2 flex">
        <button
          type="button"
          onClick={() =>
            onCopy(
              {
                ...data.copyPayload,
                targetSection: "rxpad",
                medications: data.meds.map((m) => ({
                  medicine: m.trim(),
                  unitPerDose: "-",
                  frequency: "-",
                  when: "-",
                  duration: "-",
                  note: "",
                })),
              },
              `${data.meds.length} medications copied to Med(Rx)`,
            )
          }
          className={AI_SMALL_PRIMARY_CTA_CLASS}
        >
          <Copy size={10} className="mr-1 inline" />
          Copy all {data.meds.length} to Med(Rx)
        </button>
      </div>

      {/* ── Additional Protocol — section strip headers ── */}
      {(data.investigations.length > 0 || data.advice || data.followUp) && (
        <div className="py-1">
          {/* Investigations */}
          {data.investigations.length > 0 && (
            <div className="mb-1">
              <div className="group/heading mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
                <FlaskConical size={11} className="text-[#9E978B]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Investigations</span>
                <span className="rounded-[4px] bg-tp-blue-50 px-1 py-[1px] text-[9px] font-semibold text-tp-blue-600">{data.investigations.length}</span>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      { ...data.copyPayload, targetSection: "labResults", labInvestigations: data.investigations },
                      "Investigations copied",
                    )
                  }
                  className="ml-auto opacity-0 transition-opacity group-hover/heading:opacity-100"
                  title="Copy investigations"
                >
                  <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 px-3">
                {data.investigations.map((inv) => (
                  <span key={inv} className="inline-flex items-center rounded-[6px] border-[0.5px] border-tp-blue-200 bg-tp-blue-50/50 px-2 py-[3px] text-[11px] text-tp-blue-800">
                    {inv}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Advice */}
          {data.advice && (
            <div className="mb-1">
              <div className="group/heading mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
                <FileText size={11} className="text-[#9E978B]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Advice</span>
                <button
                  type="button"
                  onClick={() =>
                    onCopy({ ...data.copyPayload, advice: data.advice }, "Advice copied")
                  }
                  className="ml-auto opacity-0 transition-opacity group-hover/heading:opacity-100"
                  title="Copy advice"
                >
                  <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                </button>
              </div>
              <p className="px-3 text-[11px] leading-[16px] text-[#1A1714]/80">{data.advice}</p>
            </div>
          )}

          {/* Follow-up */}
          {data.followUp && (
            <div className="mb-1">
              <div className="group/heading mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
                <Activity size={11} className="text-[#C6850C]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Follow-up</span>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      { ...data.copyPayload, targetSection: "followUp", followUpNotes: data.followUp },
                      "Follow-up copied",
                    )
                  }
                  className="ml-auto opacity-0 transition-opacity group-hover/heading:opacity-100"
                  title="Copy follow-up"
                >
                  <Copy size={10} className="text-tp-slate-400 hover:text-tp-blue-500" />
                </button>
              </div>
              <p className="px-3 text-[11px] leading-[16px] text-[#1A1714]/80">{data.followUp}</p>
            </div>
          )}
        </div>
      )}
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
            <p className="text-[12px] font-semibold text-tp-slate-700">Vernacular Translation · {data.language}</p>
            <p className="text-[12px] text-tp-slate-500">Original and translated advice</p>
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5">
          <SectionTag label="Original" />
          <p className="mt-0.5 text-[12px] text-tp-slate-600">{data.source}</p>
        </div>
        <div className="rounded-[10px] bg-white/72 px-2 py-1.5">
          <SectionTag label={data.language} />
          <p className="mt-0.5 text-[12px] font-medium text-tp-slate-700">{data.translated}</p>
        </div>
      </div>
      <SourceAttribution tab="Dr Agent" section="Translation" />
    </div>
  )
}

function CompletenessCard({
  data,
  onQuickSend,
}: {
  data: Extract<RxAgentOutput, { kind: "completeness" }>
  onQuickSend?: (prompt: string) => void
}) {
  // Define optional sections (gray dash if absent)
  const optionalSections = new Set(["Notes", "Follow-up Notes"])

  return (
    <div className={AI_OUTPUT_CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-tp-slate-700">Documentation Completeness</p>
        <span className="rounded-full border border-tp-warning-200 bg-tp-warning-50 px-1.5 py-0.5 text-[12px] font-semibold text-tp-warning-700">{data.completenessPercent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-tp-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706]" style={{ width: `${data.completenessPercent}%` }} />
      </div>

      {/* Per-section status indicators */}
      <div className="mt-2 space-y-0.5">
        {data.filled.map((section) => (
          <div key={section} className="flex items-center gap-1.5 py-0.5">
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-tp-success-100 text-[10px] text-tp-success-600">✓</span>
            <span className="text-[12px] text-tp-success-700">{section}</span>
          </div>
        ))}
        {data.missing.map((section) => {
          const isOptional = optionalSections.has(section)
          return (
            <div key={section} className="flex items-center gap-1.5 py-0.5">
              {isOptional ? (
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-tp-slate-100 text-[10px] text-tp-slate-400">—</span>
              ) : (
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-amber-100 text-[10px] text-amber-600">⚠</span>
              )}
              <span className={cn("text-[12px]", isOptional ? "text-tp-slate-400" : "text-tp-warning-700")}>{section}</span>
              {!isOptional && onQuickSend && (
                <button
                  type="button"
                  onClick={() => onQuickSend(`Fill ${section}`)}
                  className="ml-auto rounded-full border border-tp-warning-200 bg-tp-warning-50 px-1.5 py-0.5 text-[10px] font-semibold text-tp-warning-700 transition-colors hover:bg-tp-warning-100"
                >
                  Fill {section}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <SourceAttribution tab="Dr Agent" section="Completeness Check" />
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
        <p className="text-[12px] font-semibold text-tp-slate-700">Drug class history · {data.className}</p>
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
          <div key={`${item.date}-${item.medicine}`} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5 rounded-[10px] bg-white/72 px-2 py-1.5 text-[12px] text-tp-slate-700">
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
        <p className="text-[12px] font-semibold text-tp-slate-700">
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
          <div key={`${row.date}-${row.detail}`} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto] items-start gap-x-1.5 rounded-[10px] bg-white/72 px-2 py-1.5 text-[12px] text-tp-slate-700">
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
        <p className="text-[12px] font-semibold text-tp-slate-700">{data.title}</p>
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
          <div key={item.test} className="group/row grid grid-cols-[9px_minmax(0,1fr)_auto_auto] items-start gap-x-1.5 rounded-[10px] bg-white/72 px-2 py-1.5 text-[12px]">
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
            <p className="text-[12px] font-semibold text-tp-slate-700">Dynamic UI Capability Showcase</p>
            <p className="text-[12px] text-tp-slate-500">Reusable A2UI and AGUI patterns for TypeRx</p>
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
                className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1 text-left text-[12px] text-tp-slate-700 hover:bg-tp-slate-50"
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
              "rounded-[8px] px-2 py-1 text-[12px] font-medium",
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
              <p className="mb-1 text-[12px] font-semibold text-tp-slate-700">Mini bar trend</p>
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
              className="h-8 w-full rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white px-2 text-[12px] text-tp-slate-500"
              aria-label="Text field sample"
            />
            <div className="flex items-center gap-2 text-[12px] text-tp-slate-700">
              <input type="checkbox" checked readOnly className="size-3 rounded border-tp-slate-300" />
              <span>Checkbox template for consent or selection</span>
            </div>
            <div className="space-y-1">
              <p className="text-[12px] text-tp-slate-500">Slider template</p>
              <input type="range" min={0} max={100} value={60} readOnly className="w-full accent-[#4B4AD5]" />
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value="2026-03-05" readOnly className="h-8 rounded-[8px] border-[0.5px] border-tp-slate-200 bg-white px-2 text-[12px] text-tp-slate-600" />
              <div className="flex flex-wrap gap-1">
                {["Single", "Multi", "Urgent"].map((item) => (
                  <span key={item} className="rounded-full bg-tp-slate-100 px-2 py-0.5 text-[12px] text-tp-slate-600">{item}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "media" ? (
          <div className={AI_INNER_BODY_CLASS}>
            <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[12px] text-tp-slate-600">
              <p className="font-medium text-tp-slate-700">Image placeholder</p>
              <div className="mt-1 h-16 rounded-[8px] border-[0.5px] border-dashed border-tp-slate-300 bg-tp-slate-50" />
            </div>
            <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[12px] text-tp-slate-600">
              <p className="font-medium text-tp-slate-700">Audio player template</p>
              <audio controls className="mt-1 w-full" />
            </div>
            <div className="rounded-[10px] bg-white/72 px-2 py-1.5 text-[12px] text-tp-slate-600">
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
  if (tab === "gynec" && summaryData.gynecData) {
    const g = summaryData.gynecData
    return {
      headline: "Specialty snapshot",
      keyItems: [
        g.lmp ? `LMP: ${g.lmp}` : "LMP: Not recorded",
        `Cycle: ${g.cycleRegularity ?? "-"}, ${g.cycleLength ?? "-"}`,
        g.flowIntensity ? `Flow: ${g.flowIntensity}` : null,
      ].filter(Boolean) as string[],
      alerts: g.alerts ?? [],
    }
  }

  if (tab === "ophthal" && summaryData.ophthalData) {
    const o = summaryData.ophthalData
    return {
      headline: "Specialty snapshot",
      keyItems: [
        o.vaRight || o.vaLeft ? `VA: OD ${o.vaRight ?? "-"} / OS ${o.vaLeft ?? "-"}` : null,
        o.slitLamp ? `Slit Lamp: ${o.slitLamp}` : null,
        o.lastExamDate ? `Last exam: ${o.lastExamDate}` : null,
      ].filter(Boolean) as string[],
      alerts: o.alerts ?? [],
    }
  }

  if (tab === "obstetric" && summaryData.obstetricData) {
    const ob = summaryData.obstetricData
    return {
      headline: "Specialty snapshot",
      keyItems: [
        ob.lmp ? `LMP: ${ob.lmp}` : null,
        ob.edd ? `EDD: ${ob.edd}` : null,
        ob.ancDue?.length ? ob.ancDue[0] : "ANC on track",
      ].filter(Boolean) as string[],
      alerts: ob.alerts ?? [],
    }
  }

  if (tab === "pediatrics" && summaryData.pediatricsData) {
    const p = summaryData.pediatricsData
    return {
      headline: "Specialty snapshot",
      keyItems: [
        p.weightPercentile ? `Weight: ${p.weightPercentile} percentile` : null,
        p.vaccinesOverdue ? `${p.vaccinesOverdue} vaccine(s) overdue` : p.vaccinesPending ? `${p.vaccinesPending} vaccines pending` : null,
        p.milestoneNotes?.[0] ?? null,
      ].filter(Boolean) as string[],
      alerts: p.alerts ?? [],
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
  const [systolic, diastolic] = (vitals.bp ?? "").split("/")
  return {
    bpSystolic: systolic?.trim(),
    bpDiastolic: diastolic?.trim(),
    temperature: vitals.temp,
    heartRate: vitals.pulse,
  }
}

function buildSpecialtyClinicalView(tab: SpecialtyTabId, summaryData: SmartSummaryData): SpecialtyClinicalView {
  // All specialties now derive from per-patient data in summaryData
  const symptoms = summaryData.symptomCollectorData?.symptoms?.map(
    (sx) => `${sx.name}${sx.duration ? ` (${sx.duration}${sx.severity ? `, ${sx.severity.toLowerCase()}` : ""})` : ""}`
  ) ?? clinicalTokens(summaryData.lastVisit?.symptoms || summaryData.patientNarrative, 4) ?? []

  return {
    currentSymptoms: symptoms,
    currentVitals: summaryData.todayVitals,
    currentMedications: summaryData.activeMeds ?? [],
    currentLabs: summaryData.keyLabs ?? [],
    lastVisit: summaryData.lastVisit,
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
        <p className="text-[12px] font-semibold text-tp-slate-700">{title}</p>
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
            <p className="min-w-0 leading-4 text-[12px] text-tp-slate-600">
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

function LegacySymptomCollectorCard({
  onCopy,
  onQuickSend,
}: {
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
}) {
  const [collapsed, setCollapsed] = useState(true)

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="flex h-[32px] w-full items-center justify-between rounded-[10px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50/60 px-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-tp-violet-100 text-tp-violet-600">
            <Activity size={12} />
          </span>
          <p className="truncate text-[12px] font-medium text-tp-slate-600">Patient-reported symptoms & history</p>
        </div>
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-[6px] text-tp-slate-400">
          <ChevronDown size={11} />
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
          <p className="truncate text-[13px] font-semibold text-tp-slate-800">Symptoms and medical history from patient</p>
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
          <span className="text-[12px] font-semibold text-[#0D9488]">{data.title}</span>
          {flaggedCount > 0 && (
            <span className="ml-auto text-[12px] font-semibold text-tp-error-600">{flaggedCount} flagged</span>
          )}
        </div>
        <div className="px-2 py-1.5">
          {/* Table header */}
          <div className="mb-1 grid grid-cols-[minmax(0,1fr)_60px_48px_20px] gap-x-1 border-b-2 border-tp-slate-100 pb-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-tp-slate-400">Parameter</span>
            <span className="text-[12px] font-bold uppercase tracking-wider text-tp-slate-400">Ref</span>
            <span className="text-right text-[12px] font-bold uppercase tracking-wider text-tp-slate-400">Value</span>
            <span className="text-center text-[12px] font-bold uppercase tracking-wider text-tp-slate-400">⚑</span>
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
              <span className={cn("text-[12px]", param.flag !== "normal" ? "font-semibold text-tp-slate-800" : "text-tp-slate-600")}>
                {param.name}
              </span>
              <span className="text-[12px] text-tp-slate-400">{param.reference}</span>
              <span
                className={cn(
                  "text-right text-[12px] font-semibold",
                  param.flag === "high" || param.flag === "critical" ? "text-tp-error-600" : param.flag === "low" ? "text-tp-warning-600" : "text-tp-slate-700",
                )}
              >
                {param.flag === "high" || param.flag === "critical" ? "↑" : param.flag === "low" ? "↓" : ""}
                {param.value}
              </span>
              <span className={cn("text-center text-[12px]", param.flag === "normal" ? "text-tp-success-600" : "text-tp-error-600")}>
                {param.flag === "normal" ? "✓" : param.flag === "high" ? "↑" : param.flag === "low" ? "↓" : "⚠"}
              </span>
            </div>
          ))}
          {/* Clinical insight */}
          {data.insight && (
            <div className="mt-2 rounded-[6px] bg-tp-error-50 px-2 py-1.5 text-[12px] font-medium text-tp-error-700">
              <strong>Alert:</strong> {data.insight}
            </div>
          )}
          {/* Action pills */}
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => onCopy(data.copyPayload, `OCR data copied to Lab Results`)}
              className="rounded-[42px] border border-tp-success-200 bg-tp-success-50 px-2 py-0.5 text-[12px] font-semibold text-tp-success-700 transition-colors hover:bg-tp-success-100"
            >
              Copy to Lab Results
            </button>
            <button
              type="button"
              onClick={() => onQuickSend("Compare previous CBC")}
              className="rounded-[42px] border border-tp-blue-200 bg-tp-blue-50 px-2 py-0.5 text-[12px] font-semibold text-tp-blue-700 transition-colors hover:bg-tp-blue-100"
            >
              Compare prev CBC
            </button>
            <button
              type="button"
              className="rounded-[42px] border border-tp-slate-200 bg-white px-2 py-0.5 text-[12px] font-semibold text-tp-slate-600 transition-colors hover:bg-tp-slate-50"
            >
              Original PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AllergyConflictCard({ data }: { data: Extract<RxAgentOutput, { kind: "allergy_conflict" }> }) {
  return (
    <div className="overflow-hidden rounded-[12px] border-l-[4px] border-l-[#C42B2B] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Header strip */}
      <div className="flex items-center gap-2 bg-tp-error-50 px-3 py-2">
        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px] bg-tp-error-100 text-tp-error-600">
          <ShieldCheck size={14} />
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-[#C42B2B]">Allergy Conflict</span>
          <span className="rounded-[4px] bg-[#C42B2B] px-1.5 py-[1px] text-[10px] font-semibold text-white">BLOCK</span>
        </div>
      </div>
      {/* Content */}
      <div className="px-3 py-2">
        <div className="mb-1.5 grid grid-cols-[40px_1fr] gap-x-2 gap-y-1">
          <span className="text-[10px] font-medium text-[#9E978B]">Drug</span>
          <span className="text-[12px] font-semibold text-[#C42B2B]">{data.drug}</span>
          <span className="text-[10px] font-medium text-[#9E978B]">Allergy</span>
          <span className="text-[12px] font-semibold text-[#1A1714]">{data.allergy}</span>
        </div>
        <div className="rounded-[6px] bg-tp-error-50/60 px-2 py-1.5">
          <p className="text-[11px] font-medium text-[#C42B2B]">Do not prescribe — patient has a documented allergy to this drug or its class.</p>
        </div>
      </div>
    </div>
  )
}

function DrugInteractionCard({ data }: { data: Extract<RxAgentOutput, { kind: "drug_interaction" }> }) {
  const borderColor =
    data.severity === "severe" ? "border-l-[#C42B2B]" :
    data.severity === "moderate" ? "border-l-[#C6850C]" : "border-l-[#9E978B]"

  const headerBg =
    data.severity === "severe" ? "bg-tp-error-50" :
    data.severity === "moderate" ? "bg-[#FEF3CD]/50" : "bg-tp-slate-50"

  const badgeClass =
    data.severity === "severe" ? "bg-[#C42B2B] text-white" :
    data.severity === "moderate" ? "bg-[#C6850C] text-white" : "bg-tp-slate-400 text-white"

  return (
    <div className={cn("overflow-hidden rounded-[12px] border-l-[4px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]", borderColor)}>
      {/* Header */}
      <div className={cn("flex items-center gap-2 px-3 py-2", headerBg)}>
        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px] bg-white/80 text-tp-warning-600">
          <AlertTriangle size={14} />
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#1A1714]">Drug Interaction</span>
          <span className={cn("rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold capitalize", badgeClass)}>
            {data.severity}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="px-3 py-2">
        <div className="mb-1.5 flex items-center justify-center gap-3">
          <span className="rounded-[6px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 px-2 py-1 text-[12px] font-semibold text-[#1A1714]">{data.drugA}</span>
          <span className="text-[14px] text-[#C6850C]">↔</span>
          <span className="rounded-[6px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 px-2 py-1 text-[12px] font-semibold text-[#1A1714]">{data.drugB}</span>
        </div>
        <p className="text-[11px] leading-[16px] text-[#1A1714]/80">{data.description}</p>
        <SourceAttribution tab="CDSS" section="Drug Interactions" />
      </div>
    </div>
  )
}

function ProtocolMedsCard({
  data,
  onCopy,
}: {
  data: Extract<RxAgentOutput, { kind: "protocol_meds" }>
  onCopy: (payload: RxPadCopyPayload, message: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* Card Header */}
      <div className="flex items-center gap-2 bg-tp-slate-50 px-3 py-2">
        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
          <Pill size={13} className="text-tp-violet-600" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#1A1714]">Protocol Meds</p>
            <span className="rounded-[4px] bg-tp-blue-50 px-1.5 py-[1px] text-[10px] font-semibold text-tp-blue-700">{data.meds.length}</span>
          </div>
          <p className="text-[11px] text-[#9E978B]">{data.diagnosis}</p>
        </div>
      </div>

      {/* Drug Rows */}
      <div className="divide-y divide-[#C4BFB5]/15 px-3 py-1">
        {data.meds.map((med) => {
          const safetyColor =
            med.safetyCheck === "ok" ? "#1B8C54" :
            med.safetyCheck === "allergy_conflict" ? "#C42B2B" : "#C6850C"
          return (
            <div key={med.name} className="group/med flex items-center gap-2 py-1.5">
              <span className="size-[6px] shrink-0 rounded-full" style={{ backgroundColor: safetyColor }} />
              <div className="min-w-0 flex-1">
                <span className="text-[12px] font-semibold text-[#1A1714]">{med.name}</span>
                <span className="ml-1 text-[11px] text-[#9E978B]">{med.dose} {med.route} {med.frequency}</span>
              </div>
              {med.safetyCheck === "allergy_conflict" && (
                <span className="shrink-0 rounded-[4px] bg-[#C42B2B] px-1 py-[1px] text-[9px] font-semibold text-white">ALLERGY</span>
              )}
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    {
                      sourceDateLabel: `Protocol: ${data.diagnosis}`,
                      medications: [
                        {
                          medicine: med.name,
                          unitPerDose: med.dose,
                          frequency: med.frequency,
                          when: "-",
                          duration: "-",
                          note: med.route,
                        },
                      ],
                    },
                    `${med.name} copied to Med(Rx)`,
                  )
                }
                className={cn("shrink-0 opacity-0 transition-opacity group-hover/med:opacity-100", HOVER_COPY_ICON_CLASS)}
                title={`Copy ${med.name} to RxPad`}
                aria-label={`Copy ${med.name} to RxPad`}
              >
                <Copy size={10} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
        <button
          type="button"
          onClick={() => onCopy(data.copyPayload, `Protocol meds for ${data.diagnosis} copied to Med(Rx)`)}
          className={AI_SMALL_PRIMARY_CTA_CLASS}
        >
          <Copy size={10} className="mr-1" /> Copy all to Med(Rx)
        </button>
      </div>
    </div>
  )
}

/* ── T1 — Fact (lightweight inline) ───────────────────────────────── */
function TextFactCard({ data }: { data: Extract<RxAgentOutput, { kind: "text_fact" }> }) {
  return (
    <div className="rounded-[8px] bg-tp-slate-50/60 px-2.5 py-1.5">
      <p className="text-[12px] leading-[16px] text-tp-slate-700">
        {data.icon} {data.fact}
      </p>
      <p className="mt-0.5 text-[11px] leading-[14px] text-tp-slate-400">Source: {data.source}</p>
    </div>
  )
}

/* ── T2 — Alert (critical / warning) ─────────────────────────────── */
function TextAlertCard({ data }: { data: Extract<RxAgentOutput, { kind: "text_alert" }> }) {
  const isCritical = data.level === "critical"
  return (
    <div
      className={cn(
        "rounded-[8px] border-[0.5px] px-2.5 py-1.5",
        isCritical
          ? "border-tp-error-200 bg-tp-error-50/70 text-tp-error-700"
          : "border-tp-warning-200 bg-tp-warning-50/70 text-tp-warning-700",
      )}
    >
      <p className="text-[12px] font-medium leading-[16px]">
        {isCritical ? "\u26A0" : "\u23F0"} {data.message}
      </p>
      {data.action && (
        <p
          className={cn(
            "mt-0.5 text-[11px] leading-[14px]",
            isCritical ? "text-tp-error-500" : "text-tp-warning-500",
          )}
        >
          {data.action}
        </p>
      )}
    </div>
  )
}

/* ── T3 — List (bullet list with optional truncation) ────────────── */
function TextListCard({ data, onQuickSend }: { data: Extract<RxAgentOutput, { kind: "text_list" }>, onQuickSend: (prompt: string) => void }) {
  const max = data.max ?? data.items.length
  const visible = data.items.slice(0, max)
  const remaining = data.items.length - max

  return (
    <div className="px-0.5 py-1">
      <p className="text-[12px] font-semibold leading-[16px] text-tp-slate-700">{data.title}</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-[12px] leading-[16px] text-tp-slate-600">
        {visible.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => onQuickSend(`Show all items for: ${data.title}`)}
          className="mt-1 text-[11px] leading-[14px] text-tp-slate-400 hover:text-tp-slate-600"
        >
          {remaining} more&hellip;
        </button>
      )}
    </div>
  )
}

/* ── T4 — Compare (current vs previous, compact) ────────────────── */
function TextCompareCard({ data }: { data: Extract<RxAgentOutput, { kind: "text_compare" }> }) {
  const directionIcon = data.deltaDirection === "up" ? "\u2191" : data.deltaDirection === "down" ? "\u2193" : "\u2192"
  const directionClass =
    data.deltaDirection === "up"
      ? "text-tp-error-600"
      : data.deltaDirection === "down"
        ? "text-tp-success-600"
        : "text-tp-slate-400"

  return (
    <div className="rounded-[8px] bg-tp-slate-50/60 px-2.5 py-1.5">
      <p className="text-[12px] font-semibold leading-[16px] text-tp-slate-700">{data.label}</p>
      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] leading-[16px]">
        <span className="text-tp-slate-500">{data.previous}</span>
        <span className="text-tp-slate-300">&rarr;</span>
        <span className="font-medium text-tp-slate-700">{data.current}</span>
        <span className={cn("font-semibold", directionClass)}>
          {directionIcon} {data.delta}
        </span>
      </div>
    </div>
  )
}

/* ── T5 — Suggestion (with rationale + action pills) ─────────────── */
function TextSuggestionCard({ data, onQuickSend }: { data: Extract<RxAgentOutput, { kind: "text_suggestion" }>, onQuickSend: (prompt: string) => void }) {
  return (
    <div className="px-0.5 py-1">
      <p className="text-[12px] font-semibold leading-[16px] text-tp-slate-700">{data.suggestion}</p>
      <p className="mt-0.5 text-[11px] leading-[14px] text-tp-slate-400">{data.rationale}</p>
      {data.pills.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {data.pills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => onQuickSend(pill)}
              className={AGENT_GRADIENT_CHIP_CLASS}
            >
              {pill}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RxOutputRenderer({
  rxOutput,
  output,
  onCopy,
  onQuickSend,
  onAcceptDiagnosis,
  onNavigate,
}: {
  rxOutput?: RxAgentOutput
  output?: AgentDynamicOutput
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onQuickSend: (prompt: string) => void
  onAcceptDiagnosis: (diagnoses: string[]) => void
  onNavigate?: (tab: string) => void
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
    return <CompletenessCard data={rxOutput} onQuickSend={onQuickSend} />
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
  if (rxOutput?.kind === "allergy_conflict") {
    return <AllergyConflictCard data={rxOutput} />
  }
  if (rxOutput?.kind === "drug_interaction") {
    return <DrugInteractionCard data={rxOutput} />
  }
  if (rxOutput?.kind === "protocol_meds") {
    return <ProtocolMedsCard data={rxOutput} onCopy={onCopy} />
  }
  if (rxOutput?.kind === "ui_showcase") {
    return <UiShowcaseCard onCopy={onCopy} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "patient_summary") {
    return (
      <PatientSummaryCard
        collapsed={false}
        onToggle={() => {}}
        summaryData={rxOutput.summaryData}
        activeSpecialty={rxOutput.activeSpecialty}
        patientGender={rxOutput.patientGender}
        patientAge={rxOutput.patientAge}
        onNavigate={onNavigate}
      />
    )
  }
  if (rxOutput?.kind === "text_fact") {
    return <TextFactCard data={rxOutput} />
  }
  if (rxOutput?.kind === "text_alert") {
    return <TextAlertCard data={rxOutput} />
  }
  if (rxOutput?.kind === "text_list") {
    return <TextListCard data={rxOutput} onQuickSend={onQuickSend} />
  }
  if (rxOutput?.kind === "text_compare") {
    return <TextCompareCard data={rxOutput} />
  }
  if (rxOutput?.kind === "text_suggestion") {
    return <TextSuggestionCard data={rxOutput} onQuickSend={onQuickSend} />
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

function AgentIntroMessage({
  contextLabel,
  isPatientContext,
}: {
  contextLabel: string
  isPatientContext: boolean
}) {
  const patientName = contextLabel.split(" (")[0]
  const greeting = isPatientContext
    ? `Hi Doctor, here's ${patientName}'s overview`
    : `Hi Doctor, you are in ${contextLabel}. I can help with operational guidance until you switch to a patient chart.`

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[10px]" style={{ background: AI_GRADIENT_SOFT }}>
        <AiBrandSparkIcon size={13} />
      </span>
      <p className="max-w-[88%] text-[12px] leading-[18px] text-tp-slate-600">{greeting}</p>
    </div>
  )
}

/** Full Intro Sequence — Alert Strip + Context Lines + PatientReported + PatientSummary (collapsed when symptoms exist) */
function PatientIntroSequence({
  summaryData,
  activeSpecialty,
  patientGender,
  patientAge,
  summaryCollapsed,
  onToggleSummary,
  symptomCollectorCollapsed,
  onToggleSymptomCollector,
  onCopy,
  onNavigate,
}: {
  summaryData: SmartSummaryData
  activeSpecialty: SpecialtyTabId
  patientGender?: string
  patientAge?: number
  summaryCollapsed: boolean
  onToggleSummary: () => void
  symptomCollectorCollapsed: boolean
  onToggleSymptomCollector: () => void
  onCopy: (payload: RxPadCopyPayload, message: string) => void
  onNavigate?: (tab: string) => void
}) {
  const contextLines = useMemo(
    () => buildContextLines(summaryData, activeSpecialty),
    [summaryData, activeSpecialty],
  )
  const category = useMemo(
    () => classifyPatientCategory(summaryData),
    [summaryData],
  )
  const isZeroData = !summaryData.lastVisit && !summaryData.todayVitals && !summaryData.chronicConditions?.length && !summaryData.keyLabs?.length

  return (
    <div className="space-y-2">
      {/* ── Intro Card: Alert Strip + Context Lines (compact, low cognitive load) ── */}
      <div className={cn("space-y-1.5 rounded-[12px] border-[0.5px] border-tp-slate-200 bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]", CATEGORY_BORDER_CLASS[category])}>
        {/* 1. Alert Strip — compact inline safety alerts (max 2) */}
        <IntroAlertStrip summaryData={summaryData} />

        {/* 2. Context Lines — 3-5 prioritized clinical facts */}
        {!isZeroData && <IntroSmartLines lines={contextLines} />}

        {/* 3. Zero-data state for new patients */}
        {isZeroData && (
          <div className="flex flex-col items-center gap-2 py-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-tp-slate-100">
              <UserRound size={20} className="text-tp-slate-400" />
            </span>
            <p className="text-[12px] font-medium text-tp-slate-600">New patient · First consultation</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              <button type="button" className={AGENT_GRADIENT_CHIP_CLASS}>
                <Mic size={11} className="mr-0.5 inline" /> Start voice
              </button>
              <button type="button" className={AGENT_GRADIENT_CHIP_CLASS}>
                <ClipboardPlus size={11} className="mr-0.5 inline" /> Add history
              </button>
              <button type="button" className={AGENT_GRADIENT_CHIP_CLASS}>
                <Paperclip size={11} className="mr-0.5 inline" /> Upload report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Patient-Reported Card: SEPARATE from intro (per spec A6) ── */}
      {summaryData.symptomCollectorData && (
        <PatientReportedCard
          data={summaryData.symptomCollectorData}
          collapsed={symptomCollectorCollapsed}
          onToggle={onToggleSymptomCollector}
          onCopy={onCopy}
        />
      )}

      {/* ── Patient Summary Card: collapsed when patient-reported exists, expanded when none ── */}
      {!isZeroData && (
        <PatientSummaryCard
          collapsed={summaryCollapsed}
          onToggle={onToggleSummary}
          summaryData={summaryData}
          activeSpecialty={activeSpecialty}
          patientGender={patientGender}
          patientAge={patientAge}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PatientSummaryCard — specialty-aware compact card                  */
/* ------------------------------------------------------------------ */

type VitalEntry = { key: string; label: string; value: string; unit?: string; icon: React.ReactNode; abnormal: boolean; sev: "critical" | "warning" | "normal"; arrow: "↑" | "↓"; priority: number }

type SummarySection =
  | { kind: "allergy"; allergies: string[] }
  | { kind: "vitals"; entries: VitalEntry[] }
  | { kind: "specialty"; specialtyId: SpecialtyTabId; content: React.ReactNode }
  | { kind: "chronic"; conditions: string[]; meds?: string[] }
  | { kind: "lastVisit"; visit: LastVisitSummary }
  | { kind: "labs"; labs: Array<{ name: string; value: string; flag: "high" | "low" }> }
  | { kind: "dueAlerts"; alerts: string[] }
  | { kind: "symptoms"; symptoms: Array<{ name: string; duration?: string; severity?: string }> }
  | { kind: "zeroData" }

const SPECIALTY_CARD_TITLES: Record<SpecialtyTabId, string> = {
  gp: "Patient Summary",
  gynec: "Gynec Summary",
  ophthal: "Ophthal Summary",
  obstetric: "Obstetric Summary",
  pediatrics: "Pediatric Summary",
}

const SPECIALTY_VISUAL_CONFIG: Record<SpecialtyTabId, { headerBg: string; accentBorder: string; iconBg: string; iconColor: string; icon: React.ReactNode }> = {
  gp:         { headerBg: "bg-tp-slate-50",     accentBorder: "border-l-tp-blue-400",   iconBg: "bg-tp-blue-50",   iconColor: "text-tp-blue-500",   icon: <Stethoscope size={12} /> },
  gynec:      { headerBg: "bg-[#FDF2F8]",       accentBorder: "border-l-[#EC4899]",     iconBg: "bg-[#FDF2F8]",    iconColor: "text-[#EC4899]",     icon: <TPMedicalIcon name="Gynec" size={12} color="#EC4899" /> },
  ophthal:    { headerBg: "bg-[#F0FDFA]",       accentBorder: "border-l-[#14B8A6]",     iconBg: "bg-[#F0FDFA]",    iconColor: "text-[#14B8A6]",     icon: <TPMedicalIcon name="eye" size={12} color="#14B8A6" /> },
  obstetric:  { headerBg: "bg-tp-violet-50/60", accentBorder: "border-l-tp-violet-400", iconBg: "bg-tp-violet-50", iconColor: "text-tp-violet-500", icon: <TPMedicalIcon name="Obstetric" size={12} color="#8B5CF6" /> },
  pediatrics: { headerBg: "bg-tp-blue-50/60",   accentBorder: "border-l-tp-blue-300",   iconBg: "bg-tp-blue-50",   iconColor: "text-tp-blue-400",   icon: <Baby size={12} /> },
}

const VITAL_META: Record<string, { label: string; unit?: string; icon: React.ReactNode; priority: number; isAbnormal: (v: string) => boolean; direction: (v: string) => "↑" | "↓"; severity: (v: string) => "critical" | "warning" | "normal" }> = {
  bp:         { label: "BP",    unit: "mmHg",  icon: <Activity size={11} />,    priority: 1,  isAbnormal: (v) => { const s = Number.parseInt(v); return s >= 140 || s <= 90 }, direction: (v) => Number.parseInt(v) >= 140 ? "↑" : "↓", severity: (v) => { const s = Number.parseInt(v); if (s >= 180 || s <= 70) return "critical"; if (s >= 140 || s <= 90) return "warning"; return "normal" } },
  spo2:       { label: "SpO2",  unit: "%",     icon: <HeartPulse size={11} />,  priority: 2,  isAbnormal: (v) => Number.parseInt(v) < 95, direction: () => "↓", severity: (v) => { const n = Number.parseInt(v); if (n < 90) return "critical"; if (n < 95) return "warning"; return "normal" } },
  pulse:      { label: "Pulse", unit: "/min",  icon: <HeartPulse size={11} />,  priority: 3,  isAbnormal: (v) => { const n = Number.parseInt(v); return n > 100 || n < 50 }, direction: (v) => Number.parseInt(v) > 100 ? "↑" : "↓", severity: (v) => { const n = Number.parseInt(v); if (n > 130 || n < 40) return "critical"; if (n > 100 || n < 50) return "warning"; return "normal" } },
  temp:       { label: "Temp",  unit: "°F",    icon: <TPMedicalIcon name="thermometer" size={11} color="currentColor" />, priority: 4, isAbnormal: (v) => Number.parseFloat(v) >= 100.4, direction: () => "↑", severity: (v) => { const n = Number.parseFloat(v); if (n >= 103) return "critical"; if (n >= 100.4) return "warning"; return "normal" } },
  rr:         { label: "RR",    unit: "/min",  icon: <Activity size={11} />,    priority: 5,  isAbnormal: (v) => { const n = Number.parseInt(v); return n > 20 || n < 12 }, direction: (v) => Number.parseInt(v) > 20 ? "↑" : "↓", severity: (v) => { const n = Number.parseInt(v); if (n > 30 || n < 8) return "critical"; if (n > 20 || n < 12) return "warning"; return "normal" } },
  weight:     { label: "Wt",    unit: "kg",    icon: <Scale size={11} />,       priority: 6,  isAbnormal: () => false, direction: () => "↑" as const, severity: () => "normal" as const },
  height:     { label: "Ht",    unit: "cm",    icon: <Scale size={11} />,       priority: 7,  isAbnormal: () => false, direction: () => "↑" as const, severity: () => "normal" as const },
  bmi:        { label: "BMI",   unit: "kg/m²", icon: <Activity size={11} />,    priority: 8,  isAbnormal: (v) => { const n = Number.parseFloat(v); return n > 30 || n < 18.5 }, direction: (v) => Number.parseFloat(v) > 30 ? "↑" : "↓", severity: (v) => { const n = Number.parseFloat(v); if (n > 40 || n < 16) return "critical"; if (n > 30 || n < 18.5) return "warning"; return "normal" } },
  bmr:        { label: "BMR",   unit: "kcal",  icon: <Activity size={11} />,    priority: 9,  isAbnormal: () => false, direction: () => "↑" as const, severity: () => "normal" as const },
  bsa:        { label: "BSA",   unit: "m²",    icon: <Activity size={11} />,    priority: 10, isAbnormal: () => false, direction: () => "↑" as const, severity: () => "normal" as const },
  bloodSugar: { label: "BS",    unit: "mg/dL", icon: <Droplets size={11} />,    priority: 11, isAbnormal: (v) => Number.parseInt(v) > 140, direction: () => "↑", severity: (v) => { const n = Number.parseInt(v); if (n > 300) return "critical"; if (n > 140) return "warning"; return "normal" } },
}

/* ---- Shared section builders ---- */

function buildVitalsSection(todayVitals: SmartSummaryData["todayVitals"]): SummarySection | null {
  if (!todayVitals) return null
  const entries: VitalEntry[] = []
  for (const [key, value] of Object.entries(todayVitals)) {
    if (value == null || value === "") continue
    const meta = VITAL_META[key]
    if (!meta) continue
    entries.push({ key, label: meta.label, value, unit: meta.unit, icon: meta.icon, abnormal: meta.isAbnormal(value), sev: meta.severity(value), arrow: meta.direction(value), priority: meta.priority })
  }
  entries.sort((a, b) => a.priority - b.priority)
  if (entries.length === 0) return null
  return { kind: "vitals" as const, entries }
}

function buildAllergySection(allergies?: string[]): SummarySection | null {
  if (!allergies?.length) return null
  return { kind: "allergy" as const, allergies }
}

function buildChronicSection(conditions?: string[], meds?: string[]): SummarySection | null {
  if (!conditions?.length) return null
  return { kind: "chronic" as const, conditions, meds }
}

function buildLabsSection(keyLabs?: Array<{ name: string; value: string; flag: "high" | "low" }>): SummarySection | null {
  if (!keyLabs?.length) return null
  const flagged = keyLabs.filter((l) => l.flag === "high" || l.flag === "low")
  if (flagged.length === 0) return null
  return { kind: "labs" as const, labs: flagged }
}

function buildLastVisitSection(visit?: LastVisitSummary): SummarySection | null {
  if (!visit) return null
  return { kind: "lastVisit" as const, visit }
}

function buildSymptomsSection(symptomData?: SmartSummaryData["symptomCollectorData"]): SummarySection | null {
  if (!symptomData?.symptoms?.length) return null
  return { kind: "symptoms" as const, symptoms: symptomData.symptoms }
}

function buildDueAlertsSection(alerts?: string[]): SummarySection | null {
  if (!alerts?.length) return null
  return { kind: "dueAlerts" as const, alerts }
}

/* ---- Section renderers ---- */

function AllergyBanner({ allergies }: { allergies: string[] }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[8px] border-[0.5px] border-tp-error-200 bg-tp-error-50 px-2 py-1.5">
      <ShieldCheck size={13} className="shrink-0 text-tp-error-500" />
      <p className="text-[12px] font-semibold leading-[14px] text-tp-error-700">
        ALLERGY: {allergies.join(", ")}
      </p>
    </div>
  )
}

/* Old section renderers (VitalsGrid, ChronicMedsSection, LabChipsSection, LastVisitSection, DueAlertsSection, SymptomsSection) removed — replaced by InlineSummaryRow in PatientSummaryCard */

function ZeroDataPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-tp-slate-100">
        <UserRound size={16} className="text-tp-slate-400" />
      </span>
      <p className="text-[12px] font-medium text-tp-slate-500">New patient</p>
      <p className="text-[11px] text-tp-slate-400">No prior records available</p>
    </div>
  )
}

function SpecialtyContextBlock({ specialtyId, content, accentBorder, icon, label }: { specialtyId: SpecialtyTabId; content: React.ReactNode; accentBorder: string; icon: React.ReactNode; label: string }) {
  return (
    <div className="overflow-hidden rounded-[8px] border-[0.5px] border-tp-slate-150 bg-white">
      <div className={cn("flex items-start gap-2 border-l-[3px] px-2 py-1.5", accentBorder)}>
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">{label}</p>
          <div className="mt-0.5">{content}</div>
        </div>
      </div>
    </div>
  )
}

/* ---- Specialty-specific context content builders ---- */

function buildGynecContextContent(g: NonNullable<SmartSummaryData["gynecData"]>): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-tp-slate-600">
      {g.cycleRegularity && <span>{g.cycleRegularity}, {g.cycleLength ?? "-"}</span>}
      {g.flowIntensity && <><span className="text-tp-slate-300">|</span><span>Flow {g.flowIntensity}{g.padsPerDay ? `, ${g.padsPerDay} pads/day` : ""}</span></>}
      {g.lmp && <><span className="text-tp-slate-300">|</span><span className="font-medium text-tp-slate-700">LMP {g.lmp}</span></>}
      {g.lastPapSmear && <><span className="text-tp-slate-300">|</span><span>Pap {g.lastPapSmear}</span></>}
      {g.painScore && <><span className="text-tp-slate-300">|</span><span>Pain {g.painScore}</span></>}
    </div>
  )
}

function buildOphthalContextContent(o: NonNullable<SmartSummaryData["ophthalData"]>): React.ReactNode {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
      {(o.vaRight || o.vaLeft) && <><span className="font-semibold text-tp-slate-500">VA</span><span className="text-tp-slate-700">OD {o.vaRight ?? "-"} | OS {o.vaLeft ?? "-"}</span></>}
      {(o.nearVaRight || o.nearVaLeft) && <><span className="font-semibold text-tp-slate-500">Near</span><span className="text-tp-slate-700">OD {o.nearVaRight ?? "-"} | OS {o.nearVaLeft ?? "-"}</span></>}
      {o.iop && <><span className="font-semibold text-tp-slate-500">IOP</span><span className="text-tp-slate-700">OD {o.iop.right} | OS {o.iop.left}</span></>}
      {o.slitLamp && <><span className="font-semibold text-tp-slate-500">Slit</span><span className="text-tp-slate-700">{o.slitLamp}</span></>}
      {o.fundus && <><span className="font-semibold text-tp-slate-500">Fundus</span><span className="text-tp-slate-700">{o.fundus}</span></>}
      {o.glassPrescription && <><span className="font-semibold text-tp-slate-500">Rx</span><span className="text-tp-slate-700">{o.glassPrescription}</span></>}
      {o.lastExamDate && <><span className="font-semibold text-tp-slate-500">Last</span><span className="text-tp-slate-700">{o.lastExamDate}</span></>}
    </div>
  )
}

function buildObstetricContextContent(ob: NonNullable<SmartSummaryData["obstetricData"]>): React.ReactNode {
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {ob.gravida != null && (
          <span className="rounded bg-tp-violet-50 px-1 py-0.5 text-[11px] font-bold text-tp-violet-700">
            G{ob.gravida}P{ob.para ?? 0}L{ob.living ?? 0}A{ob.abortion ?? 0}E{ob.ectopic ?? 0}
          </span>
        )}
        {ob.gestationalWeeks && <span className="font-semibold text-tp-slate-700">{ob.gestationalWeeks}w</span>}
        {ob.edd && <><span className="text-tp-slate-300">|</span><span className="text-tp-slate-600">EDD {ob.edd}</span></>}
        {ob.presentation && <><span className="text-tp-slate-300">|</span><span className="text-tp-slate-600">{ob.presentation}</span></>}
        {ob.fetalMovement && <><span className="text-tp-slate-300">|</span><span className="text-tp-slate-600">FM {ob.fetalMovement}</span></>}
      </div>
      {(ob.fundusHeight || ob.amnioticFluid || ob.oedema != null) && (
        <div className="flex flex-wrap gap-x-2 text-[10px] text-tp-slate-500">
          {ob.fundusHeight && <span>Fundus {ob.fundusHeight}</span>}
          {ob.amnioticFluid && <span>Fluid {ob.amnioticFluid}</span>}
          {ob.oedema != null && <span>Oedema {ob.oedema ? "Yes" : "No"}</span>}
        </div>
      )}
    </div>
  )
}

function buildPediatricsContextContent(p: NonNullable<SmartSummaryData["pediatricsData"]>): React.ReactNode {
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {p.ageDisplay && <span className="font-semibold text-tp-slate-700">{p.ageDisplay}</span>}
        {p.heightCm != null && (
          <span className="text-tp-slate-600">Ht {p.heightCm}cm <span className="text-[10px] text-tp-slate-400">({p.heightPercentile ?? "-"})</span></span>
        )}
        {p.weightKg != null && (
          <span className={cn("text-tp-slate-600", p.weightPercentile && Number.parseInt(p.weightPercentile) < 25 && "font-semibold text-tp-error-600")}>
            Wt {p.weightKg}kg <span className="text-[10px] text-tp-slate-400">({p.weightPercentile ?? "-"})</span>
          </span>
        )}
        {p.ofcCm != null && <span className="text-tp-slate-600">OFC {p.ofcCm}cm</span>}
      </div>
      {(p.vaccinesPending != null || p.vaccinesOverdue != null) && (
        <div className="flex gap-1.5 text-[10px]">
          {p.vaccinesPending ? <span className="text-tp-slate-500">{p.vaccinesPending} vaccines pending</span> : null}
          {p.vaccinesOverdue ? <span className="font-medium text-tp-error-600">{p.vaccinesOverdue} overdue{p.overdueVaccineNames?.length ? ` (${p.overdueVaccineNames.join(", ")})` : ""}</span> : null}
        </div>
      )}
      {p.milestoneNotes?.length ? (
        <p className="text-[10px] text-tp-slate-500">Milestones: {p.milestoneNotes.join("; ")}</p>
      ) : null}
    </div>
  )
}

/* ---- build*Sections — per-specialty section assembly ---- */

function buildGpSections(s: SmartSummaryData): SummarySection[] {
  const sections: SummarySection[] = []
  const allergy = buildAllergySection(s.allergies); if (allergy) sections.push(allergy)
  const vitals = buildVitalsSection(s.todayVitals); if (vitals) sections.push(vitals)
  const chronic = buildChronicSection(s.chronicConditions, s.activeMeds); if (chronic) sections.push(chronic)
  const labs = buildLabsSection(s.keyLabs); if (labs) sections.push(labs)
  const lastVisit = buildLastVisitSection(s.lastVisit); if (lastVisit) sections.push(lastVisit)
  const symptoms = buildSymptomsSection(s.symptomCollectorData); if (symptoms) sections.push(symptoms)
  if (sections.length === 0) sections.push({ kind: "zeroData" })
  return sections
}

function buildGynecSections(s: SmartSummaryData): SummarySection[] {
  const g = s.gynecData
  if (!g) return buildGpSections(s)
  const sections: SummarySection[] = []
  const allergy = buildAllergySection(s.allergies); if (allergy) sections.push(allergy)
  const config = SPECIALTY_VISUAL_CONFIG.gynec
  sections.push({ kind: "specialty", specialtyId: "gynec", content: buildGynecContextContent(g) })
  const vitals = buildVitalsSection(s.todayVitals); if (vitals) sections.push(vitals)
  const labs = buildLabsSection(s.keyLabs); if (labs) sections.push(labs)
  if (sections.length <= 1) sections.push({ kind: "zeroData" })
  return sections
}

function buildOphthalSections(s: SmartSummaryData): SummarySection[] {
  const o = s.ophthalData
  if (!o) return buildGpSections(s)
  const sections: SummarySection[] = []
  const allergy = buildAllergySection(s.allergies); if (allergy) sections.push(allergy)
  sections.push({ kind: "specialty", specialtyId: "ophthal", content: buildOphthalContextContent(o) })
  const lastVisit = buildLastVisitSection(s.lastVisit); if (lastVisit) sections.push(lastVisit)
  if (sections.length <= 1) sections.push({ kind: "zeroData" })
  return sections
}

function buildObstetricSections(s: SmartSummaryData): SummarySection[] {
  const ob = s.obstetricData
  if (!ob) return buildGpSections(s)
  const sections: SummarySection[] = []
  const allergy = buildAllergySection(s.allergies); if (allergy) sections.push(allergy)
  sections.push({ kind: "specialty", specialtyId: "obstetric", content: buildObstetricContextContent(ob) })
  const vitals = buildVitalsSection(s.todayVitals); if (vitals) sections.push(vitals)
  const due = buildDueAlertsSection(ob.ancDue); if (due) sections.push(due)
  const labs = buildLabsSection(s.keyLabs); if (labs) sections.push(labs)
  if (sections.length <= 1) sections.push({ kind: "zeroData" })
  return sections
}

function buildPediatricsSections(s: SmartSummaryData): SummarySection[] {
  const p = s.pediatricsData
  if (!p) return buildGpSections(s)
  const sections: SummarySection[] = []
  const allergy = buildAllergySection(s.allergies); if (allergy) sections.push(allergy)
  sections.push({ kind: "specialty", specialtyId: "pediatrics", content: buildPediatricsContextContent(p) })
  const vitals = buildVitalsSection(s.todayVitals); if (vitals) sections.push(vitals)
  // Vaccine due alerts
  const vaccineAlerts: string[] = []
  if (p.vaccinesOverdue) vaccineAlerts.push(`${p.vaccinesOverdue} vaccines overdue${p.overdueVaccineNames?.length ? ` (${p.overdueVaccineNames.join(", ")})` : ""}`)
  if (p.vaccinesPending) vaccineAlerts.push(`${p.vaccinesPending} vaccines pending`)
  const due = buildDueAlertsSection(vaccineAlerts.length > 0 ? vaccineAlerts : undefined); if (due) sections.push(due)
  const labs = buildLabsSection(s.keyLabs); if (labs) sections.push(labs)
  if (sections.length <= 1) sections.push({ kind: "zeroData" })
  return sections
}

function getSectionsForSpecialty(s: SmartSummaryData, specialty: SpecialtyTabId): SummarySection[] {
  switch (specialty) {
    case "gynec": return buildGynecSections(s)
    case "ophthal": return buildOphthalSections(s)
    case "obstetric": return buildObstetricSections(s)
    case "pediatrics": return buildPediatricsSections(s)
    default: return buildGpSections(s)
  }
}

/* ---- New clinical alerts (allergy handled in sections, not here) ---- */

function buildClinicalAlerts(s: SmartSummaryData, specialty: SpecialtyTabId): Array<{ text: string; tone: "red" | "amber" }> {
  const alerts: Array<{ text: string; tone: "red" | "amber" }> = []
  if (s.todayVitals?.spo2) {
    const spo2Val = Number.parseInt(s.todayVitals.spo2)
    if (!Number.isNaN(spo2Val) && spo2Val < 90) alerts.push({ text: `SpO2 ${s.todayVitals.spo2} — Critical`, tone: "red" })
  }
  if (specialty === "gp" && s.followUpOverdueDays > 0) {
    alerts.push({ text: `F/U Overdue: ${s.followUpOverdueDays} days`, tone: "amber" })
  }
  if (specialty === "gynec" && s.gynecData?.alerts?.length) {
    for (const a of s.gynecData.alerts) alerts.push({ text: a, tone: "amber" })
  }
  if (specialty === "ophthal" && s.ophthalData?.alerts?.length) {
    for (const a of s.ophthalData.alerts) alerts.push({ text: a, tone: "amber" })
  }
  if (specialty === "obstetric" && s.obstetricData?.alerts?.length) {
    for (const a of s.obstetricData.alerts) alerts.push({ text: a, tone: "red" })
  }
  if (specialty === "pediatrics" && s.pediatricsData?.alerts?.length) {
    for (const a of s.pediatricsData.alerts) alerts.push({ text: a, tone: "amber" })
  }
  return alerts
}

function buildCollapsedInfo(s: SmartSummaryData, specialty: SpecialtyTabId): { tokens: string[]; hasAllergy: boolean; abnormalLabCount: number; abnormalVitalCount: number } {
  const hasAllergy = !!s.allergies?.length
  const abnormalLabCount = s.keyLabs?.filter((l) => l.flag === "high" || l.flag === "low" || l.flag === "critical").length ?? 0
  let abnormalVitalCount = 0
  if (s.todayVitals) {
    for (const [key, value] of Object.entries(s.todayVitals)) {
      if (value && VITAL_META[key]?.isAbnormal(value)) abnormalVitalCount++
    }
  }

  let tokens: string[] = []
  if (specialty === "gynec" && s.gynecData) {
    const g = s.gynecData
    if (g.cycleRegularity) tokens.push(`Cycle ${g.cycleRegularity}`)
    if (g.lmp) tokens.push(`LMP ${g.lmp}`)
    if (g.flowIntensity) tokens.push(`Flow ${g.flowIntensity}`)
  } else if (specialty === "ophthal" && s.ophthalData) {
    const o = s.ophthalData
    if (o.vaRight || o.vaLeft) tokens.push(`VA OD ${o.vaRight ?? "-"} OS ${o.vaLeft ?? "-"}`)
    if (o.slitLamp && !["no abnormality", "no abnormality detected", "normal anterior segment ou"].includes(o.slitLamp.toLowerCase()))
      tokens.push("Slit Lamp abnormal")
  } else if (specialty === "obstetric" && s.obstetricData) {
    const ob = s.obstetricData
    if (ob.gravida != null) tokens.push(`G${ob.gravida}P${ob.para ?? 0}`)
    if (ob.edd) tokens.push(`EDD ${ob.edd}`)
    if (ob.gestationalWeeks) tokens.push(`${ob.gestationalWeeks}w`)
    if (ob.ancDue?.length) tokens.push("ANC due")
  } else if (specialty === "pediatrics" && s.pediatricsData) {
    const p = s.pediatricsData
    if (p.ageDisplay) tokens.push(p.ageDisplay)
    if (p.weightPercentile) tokens.push(`Wt ${p.weightPercentile}`)
    if (p.vaccinesOverdue) tokens.push(`${p.vaccinesOverdue} vax overdue`)
  } else {
    // For patients with SBAR data, show critical lab values as tokens for instant triage
    if ((s as any).sbarSituation && s.keyLabs?.length) {
      const criticals = s.keyLabs.filter(l => l.flag === "critical" || l.flag === "high").slice(0, 3)
      if (criticals.length) tokens.push(...criticals.map(c => `${c.name} ${c.value}${c.flag === "critical" ? " ↑" : ""}`))
    } else {
      if (s.chronicConditions?.length) tokens.push(s.chronicConditions.slice(0, 2).join(", "))
    }
    if (s.followUpOverdueDays > 0) tokens.push("F/U Overdue")
  }
  return { tokens, hasAllergy, abnormalLabCount, abnormalVitalCount }
}

/* ---- Redesigned PatientSummaryCard ---- */

function PatientSummaryCard({
  collapsed,
  onToggle,
  summaryData,
  activeSpecialty,
  patientGender,
  patientAge,
  onNavigate,
}: {
  collapsed: boolean
  onToggle: () => void
  summaryData: SmartSummaryData
  activeSpecialty: SpecialtyTabId
  patientGender?: string
  patientAge?: number
  onNavigate?: (tab: string) => void
}) {
  const s = summaryData
  const config = SPECIALTY_VISUAL_CONFIG[activeSpecialty]

  // N/A check
  const isNA =
    (activeSpecialty === "gynec" && patientGender === "M") ||
    (activeSpecialty === "obstetric" && patientGender === "M") ||
    (activeSpecialty === "pediatrics" && (patientAge ?? 99) >= 18)

  const naMessage =
    activeSpecialty === "gynec" ? "Gynecology not applicable for male patients" :
    activeSpecialty === "obstetric" ? "Obstetrics not applicable for male patients" :
    activeSpecialty === "pediatrics" ? "Pediatrics not applicable for adult patients" : ""

  if (isNA) {
    if (collapsed) {
      return (
        <button type="button" onClick={onToggle}
          className="flex h-[32px] w-full items-center justify-between rounded-[10px] border-[0.5px] border-dashed border-tp-slate-200 bg-tp-slate-50/40 px-3 text-left">
          <p className="truncate text-[11px] text-tp-slate-400 italic">Not applicable for this patient</p>
          <ChevronDown size={11} className="shrink-0 text-tp-slate-300" />
        </button>
      )
    }
    return (
      <div className="overflow-hidden rounded-[10px] border-[0.8px] border-dashed border-tp-slate-200 bg-white">
        <div className={cn("flex items-center justify-between gap-2 border-b border-tp-slate-100 px-3 py-1.5", config.headerBg)}>
          <div className="flex items-center gap-1.5">
            <span className={cn("inline-flex size-5 items-center justify-center rounded-[6px]", config.iconBg, config.iconColor)}>{config.icon}</span>
            <p className="text-[12px] font-medium text-tp-slate-400">{SPECIALTY_CARD_TITLES[activeSpecialty]}</p>
          </div>
          <button type="button" onClick={onToggle} className="inline-flex size-5 items-center justify-center rounded-[6px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500" aria-label="Collapse card">
            <ChevronUp size={11} />
          </button>
        </div>
        <div className="px-3 py-3">
          <p className="text-[12px] italic text-tp-slate-400">{naMessage}</p>
        </div>
      </div>
    )
  }

  // Build sections and metadata
  const sections = getSectionsForSpecialty(s, activeSpecialty)
  const clinicalAlerts = buildClinicalAlerts(s, activeSpecialty)
  const collapsedInfo = buildCollapsedInfo(s, activeSpecialty)

  /* ---- COLLAPSED STATE ---- */
  if (collapsed) {
    const totalFlags = collapsedInfo.abnormalLabCount + collapsedInfo.abnormalVitalCount
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex h-[36px] w-full items-center gap-2 rounded-[10px] border-[0.5px] px-2.5 text-left",
          collapsedInfo.hasAllergy ? "border-tp-error-200 bg-tp-error-50/40" : "border-tp-slate-200 bg-tp-slate-50/60",
        )}
      >
        {/* Specialty mini-icon */}
        <span className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded", config.iconBg, config.iconColor)}>
          {config.icon}
        </span>
        {/* Allergy indicator dot */}
        {collapsedInfo.hasAllergy && <span className="size-1.5 shrink-0 rounded-full bg-tp-error-500" title="Has allergy" />}
        {/* Token pills */}
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          {collapsedInfo.tokens.slice(0, 3).map((token) => (
            <span key={token} className="truncate rounded bg-tp-slate-100 px-1 py-0.5 text-[10px] font-medium text-tp-slate-600">
              {token}
            </span>
          ))}
          {totalFlags > 0 && (
            <span className="shrink-0 rounded bg-tp-error-50 px-1 py-0.5 text-[10px] font-semibold text-tp-error-600">
              {totalFlags} {totalFlags === 1 ? "flag" : "flags"}
            </span>
          )}
        </div>
        <ChevronDown size={11} className="shrink-0 text-tp-slate-400" />
      </button>
    )
  }

  /* ---- EXPANDED STATE ---- */
  const totalFlags = collapsedInfo.abnormalLabCount + collapsedInfo.abnormalVitalCount

  // Pre-compute vital entries for grid
  const vitalEntries = (() => {
    if (!s.todayVitals) return [] as VitalEntry[]
    return Object.entries(s.todayVitals)
      .filter(([, v]) => v)
      .map(([key, val]) => {
        const meta = VITAL_META[key as keyof typeof VITAL_META]
        if (!meta) return null
        const sev = meta.severity(val as string)
        const arrow = meta.direction(val as string)
        return { key, label: meta.label, value: val as string, unit: meta.unit ?? "", icon: meta.icon, abnormal: sev !== "normal", sev, arrow, priority: meta.priority } as VitalEntry
      })
      .filter(Boolean) as VitalEntry[]
  })().sort((a, b) => a.priority - b.priority)

  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_4px_rgba(20,18,14,0.06),0_0_0_0.5px_rgba(20,18,14,0.08)]">
      {/* ── Card Header — 26×26 specialty icon · title · flagged badge · collapse ── */}
      <div className={cn("flex items-center justify-between gap-2 px-3 py-2", config.headerBg)}>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex size-[26px] shrink-0 items-center justify-center rounded-[8px]", config.iconBg, config.iconColor)}>
            {config.icon}
          </span>
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-[#1A1714]">{SPECIALTY_CARD_TITLES[activeSpecialty]}</p>
            {totalFlags > 0 && (
              <span className="rounded-[4px] bg-tp-error-50 px-1.5 py-[1px] text-[10px] font-semibold text-tp-error-600">
                {totalFlags} flagged
              </span>
            )}
            {collapsedInfo.hasAllergy && (
              <span className="rounded-[4px] bg-tp-error-100 px-1.5 py-[1px] text-[10px] font-semibold text-tp-error-700">
                ⚠ Allergy
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={onToggle}
          className="inline-flex size-6 items-center justify-center rounded-[6px] border-[0.5px] border-tp-slate-200 bg-white text-tp-slate-500 hover:bg-tp-slate-50"
          aria-label="Collapse card">
          <ChevronUp size={12} />
        </button>
      </div>

      {/* ── Clinical Alerts Strip ── */}
      {clinicalAlerts.length > 0 && (
        <div className="flex items-center gap-2 border-b border-[#C4BFB5]/20 bg-tp-error-50/40 px-3 py-1.5">
          <AlertTriangle size={12} className="shrink-0 text-tp-error-500" />
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {clinicalAlerts.map((alert, i) => (
              <span key={i} className={cn("text-[11px] font-semibold", alert.tone === "red" ? "text-tp-error-600" : "text-tp-warning-600")}>
                {alert.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── SBAR Situation Bar (only for patients with sbarSituation) ── */}
      {(s as any).sbarSituation && (
        <div className="flex items-start gap-2 border-b border-[#C4BFB5]/15 bg-[#F0F4F8] px-3 py-1.5">
          <span className="mt-[1px] shrink-0 rounded-[3px] bg-[#8B5CF6] px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-white">SBAR</span>
          <p className="text-[11px] leading-snug text-[#374151]">{(s as any).sbarSituation}</p>
        </div>
      )}

      {/* ── Data Completeness Bar (only for patients with sectionCompleteness) ── */}
      {(s as any).sectionCompleteness?.length > 0 && (() => {
        const sections = (s as any).sectionCompleteness as { sectionId: string; filled: number; total: number; status: string }[]
        const totalFilled = sections.reduce((sum: number, sec: { filled: number }) => sum + sec.filled, 0)
        const totalFields = sections.reduce((sum: number, sec: { total: number }) => sum + sec.total, 0)
        const pct = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0
        return (
          <div className="flex items-center gap-2 border-b border-[#C4BFB5]/10 px-3 py-1.5">
            <div className="flex h-[5px] flex-1 overflow-hidden rounded-full bg-gray-100">
              {sections.map((sec: { sectionId: string; status: string; filled: number; total: number }) => {
                const w = totalFields > 0 ? (sec.total / totalFields) * 100 : 0
                const bg = sec.status === "complete" ? "#10B981" : sec.status === "partial" ? "#F59E0B" : "#D1D5DB"
                return <div key={sec.sectionId} className="h-full" style={{ width: `${w}%`, backgroundColor: bg }} />
              })}
            </div>
            <span className="shrink-0 text-[10px] font-medium text-[#9E978B]">{pct}% documented</span>
          </div>
        )
      })()}

      {/* ── Card Body — Visual sections with gray strip headers ── */}
      <div className="py-1">

        {/* ─── 1. ALLERGY SECTION ─── */}
        {s.allergies?.length ? (
          <div className="mb-1">
            <div className="mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
              <ShieldCheck size={11} className="text-tp-error-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Allergy Alert</span>
              <span className="rounded-[4px] bg-tp-error-100 px-1 py-[1px] text-[9px] font-semibold text-tp-error-700">Drug Allergy</span>
            </div>
            <div className="px-3">
              <div className="flex flex-wrap gap-1">
                {s.allergies.map((a) => (
                  <span key={a} className="inline-flex items-center rounded-full border-[0.5px] border-tp-error-200 bg-tp-error-50 px-2 py-0.5 text-[11px] font-medium text-tp-error-700">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── CROSS-PROBLEM FLAGS (only for patients with crossProblemFlags) ─── */}
        {(s as any).crossProblemFlags?.length > 0 && (
          <div className="mb-1 px-3">
            <div className="space-y-1">
              {((s as any).crossProblemFlags as { text: string; problems: string[]; severity: string }[]).map((flag: { text: string; problems: string[]; severity: string }, i: number) => (
                <div key={i} className={cn(
                  "flex items-start gap-1.5 rounded-[6px] border border-dashed px-2 py-[5px]",
                  flag.severity === "high" ? "border-[#C42B2B]/30 bg-[#C42B2B]/5" : "border-[#C6850C]/30 bg-[#C6850C]/5"
                )}>
                  <span className="mt-[2px] text-[10px]">⚡</span>
                  <div>
                    <span className="text-[11px] font-medium text-[#1A1714]">{flag.text}</span>
                    <div className="mt-0.5 flex gap-1">
                      {flag.problems.map((p: string) => (
                        <span key={p} className="rounded bg-[#F8F7F4] px-1 py-[1px] text-[9px] font-medium text-[#9E978B]">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 2. VITALS SECTION — 2-column grid layout ─── */}
        {vitalEntries.length > 0 && (
          <div className="mb-1">
            <div
              className={cn("mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]", onNavigate && "cursor-pointer hover:bg-[#F0EFEB]")}
              onClick={onNavigate ? () => onNavigate("vitals") : undefined}
              role={onNavigate ? "button" : undefined}
              tabIndex={onNavigate ? 0 : undefined}
              title={onNavigate ? "Go to vitals" : undefined}
            >
              <Heart size={11} variant="Bold" className="text-[#9E978B]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Today&apos;s Vitals</span>
              {collapsedInfo.abnormalVitalCount > 0 && (
                <span className="rounded-[4px] bg-tp-warning-50 px-1 py-[1px] text-[9px] font-semibold text-tp-warning-600">
                  {collapsedInfo.abnormalVitalCount} abnormal
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-[3px] px-3">
              {vitalEntries.map((e) => (
                <div key={e.key} className="flex items-baseline justify-between">
                  <span className="text-[11px] text-[#9E978B]">{e.label}</span>
                  <span className={cn("text-[12px] font-semibold",
                    e.sev === "critical" ? "text-[#C42B2B]" :
                    e.sev === "warning" ? "text-[#C6850C]" :
                    "text-[#1A1714]"
                  )}>
                    {e.value}
                    {e.unit && <span className="ml-0.5 text-[10px] font-normal text-[#9E978B]">{e.unit}</span>}
                    {e.abnormal && <span className="ml-0.5 text-[10px]">{e.arrow}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 3. LABS SECTION — individual flagged rows with color dots ─── */}
        {s.keyLabs?.length ? (() => {
          const labs = s.keyLabs!
          const shown = labs.slice(0, 6)
          const overflow = labs.length - shown.length
          return (
            <div className="mb-1">
              <div
                className={cn("mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]", onNavigate && "cursor-pointer hover:bg-[#F0EFEB]")}
                onClick={onNavigate ? () => onNavigate("lab-results") : undefined}
              >
                <FlaskConical size={11} className="text-[#9E978B]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Lab Results</span>
                {collapsedInfo.abnormalLabCount > 0 && (
                  <span className="rounded-[4px] bg-tp-error-50 px-1 py-[1px] text-[9px] font-semibold text-tp-error-600">
                    {collapsedInfo.abnormalLabCount} flagged
                  </span>
                )}
              </div>
              <div className="space-y-[2px] px-3">
                {shown.map((l) => {
                  const prov = (s as any).dataProvenance?.[l.name] as { source: string; extractedFrom?: string } | undefined
                  const provDot = prov ? (
                    prov.source === "emr" ? "#10B981" :
                    prov.source === "ai_extracted" ? "#F59E0B" :
                    prov.source === "not_available" ? "#9CA3AF" : undefined
                  ) : undefined
                  return (
                  <div key={l.name} className="flex items-center justify-between border-b border-[#C4BFB5]/15 pb-[2px]">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-[6px] rounded-full", l.flag === "high" || l.flag === "low" || l.flag === "critical" ? "bg-[#C42B2B]" : "bg-[#1B8C54]")} />
                      <span className="text-[11px] text-[#1A1714]">{l.name}</span>
                      {provDot && (
                        <span
                          className="size-[4px] rounded-full"
                          style={{ backgroundColor: provDot }}
                          title={prov?.source === "emr" ? "Source: EMR (verified)" : prov?.source === "ai_extracted" ? `Source: AI-extracted from ${prov.extractedFrom || "uploaded document"} (verify before acting)` : "Not available in any source (needs ordering)"}
                        />
                      )}
                      {prov?.source === "ai_extracted" && prov.extractedFrom && (
                        <span className="text-[8px] italic text-[#D97706]" title={prov.extractedFrom}>(from PDF)</span>
                      )}
                    </div>
                    <span className={cn("text-[12px] font-semibold",
                      l.flag === "high" || l.flag === "low" || l.flag === "critical" ? "text-[#C42B2B]" : "text-[#1B8C54]"
                    )}>
                      {l.value}{l.flag === "high" || l.flag === "critical" ? " ↑" : l.flag === "low" ? " ↓" : ""}
                    </span>
                  </div>
                  )
                })}
                {overflow > 0 && (
                  <button type="button" className="mt-0.5 text-[10px] font-medium text-tp-blue-600 hover:underline"
                    onClick={onNavigate ? () => onNavigate("lab-results") : undefined}>
                    +{overflow} more results →
                  </button>
                )}
              </div>
            </div>
          )
        })() : null}

        {/* ─── 3b. POMR PROBLEM CARDS (only for patients with pomrProblems) ─── */}
        {(s as any).pomrProblems?.length > 0 && (() => {
          const pomrProblems = (s as any).pomrProblems as Array<{
            problem: string; status: string; statusColor: string
            completeness: { emr: number; ai: number; missing: number }
            labKeys: string[]; vitalKeys?: string[]; medKeys?: string[]; missingKeys?: string[]
          }>
          return (
            <div className="mb-1">
              <div className="mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
                <span className="size-[6px] rounded-full bg-[#8B5CF6]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Problems (POMR)</span>
                <span className="rounded-[4px] bg-[#8B5CF6]/10 px-1 py-[1px] text-[9px] font-semibold text-[#8B5CF6]">
                  {pomrProblems.length}
                </span>
              </div>
              <div className="space-y-1.5 px-3">
                {pomrProblems.map((prob, pi) => {
                  const resolvedLabs = prob.labKeys
                    .map(k => s.keyLabs?.find(l => l.name === k))
                    .filter(Boolean) as Array<{ name: string; value: string; flag: string }>
                  return (
                    <div key={pi} className="rounded-[8px] border border-[#E5E2DB] bg-white p-2">
                      {/* Problem header + status */}
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#1A1714]">{prob.problem}</span>
                        <span
                          className="rounded-[4px] px-1.5 py-[1px] text-[9px] font-semibold"
                          style={{ backgroundColor: prob.statusColor + "15", color: prob.statusColor }}
                        >
                          {prob.status}
                        </span>
                      </div>
                      {/* Per-problem completeness bar */}
                      <div className="mb-1.5 flex items-center gap-2">
                        <div className="flex h-[4px] flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full bg-[#10B981]" style={{ width: `${prob.completeness.emr}%` }} />
                          <div className="h-full bg-[#F59E0B]" style={{ width: `${prob.completeness.ai}%` }} />
                          <div className="h-full bg-[#D1D5DB]" style={{ width: `${prob.completeness.missing}%` }} />
                        </div>
                        <span className="shrink-0 text-[9px] text-[#9E978B]">
                          {prob.completeness.emr}% EMR
                        </span>
                      </div>
                      {/* Labs for this problem */}
                      {resolvedLabs.length > 0 && (
                        <div className="space-y-[2px]">
                          {resolvedLabs.map(l => {
                            const prov2 = (s as any).dataProvenance?.[l.name] as { source: string; extractedFrom?: string } | undefined
                            const dot2 = prov2 ? (prov2.source === "emr" ? "#10B981" : prov2.source === "ai_extracted" ? "#F59E0B" : "#9CA3AF") : undefined
                            return (
                              <div key={l.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <span className={cn("size-[5px] rounded-full",
                                    l.flag === "critical" || l.flag === "high" || l.flag === "low" ? "bg-[#C42B2B]" : "bg-[#1B8C54]"
                                  )} />
                                  <span className="text-[10px] text-[#9E978B]">{l.name}</span>
                                  {dot2 && (
                                    <span className="size-[4px] rounded-full" style={{ backgroundColor: dot2 }}
                                      title={prov2?.source === "emr" ? "EMR (verified)" : prov2?.source === "ai_extracted" ? `AI: ${prov2.extractedFrom || "document"}` : "Not available"} />
                                  )}
                                </div>
                                <span className={cn("text-[11px] font-semibold",
                                  l.flag === "critical" || l.flag === "high" || l.flag === "low" ? "text-[#C42B2B]" : "text-[#1B8C54]"
                                )}>
                                  {l.value}{l.flag === "high" || l.flag === "critical" ? " ↑" : l.flag === "low" ? " ↓" : ""}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {/* Medications for this problem */}
                      {prob.medKeys?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {prob.medKeys.map((mk: string) => (
                            <span key={mk} className="rounded bg-blue-50 px-1.5 py-[1px] text-[9px] text-blue-600">{mk}</span>
                          ))}
                        </div>
                      )}
                      {/* Missing data for this problem */}
                      {prob.missingKeys?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {prob.missingKeys.map((mk: string) => (
                            <span key={mk} className="rounded border border-dashed border-gray-200 bg-gray-50 px-1.5 py-[1px] text-[9px] italic text-gray-400">
                              {mk} — not available
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* ─── 4. HISTORY SECTION — condition & family chips ─── */}
        {(s.chronicConditions?.length || s.familyHistory?.length) ? (
          <div className="mb-1">
            <div
              className={cn("mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]", onNavigate && "cursor-pointer hover:bg-[#F0EFEB]")}
              onClick={onNavigate ? () => onNavigate("history") : undefined}
            >
              <Notepad2 size={11} variant="Bold" className="text-[#9E978B]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">History</span>
            </div>
            <div className="space-y-1.5 px-3">
              {s.chronicConditions?.length ? (
                <div>
                  <p className="mb-0.5 text-[10px] font-medium text-[#9E978B]">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-1">
                    {s.chronicConditions.map((c) => (
                      <span key={c} className="inline-flex items-center rounded-full border-[0.5px] border-tp-slate-200 bg-tp-slate-50 px-2 py-0.5 text-[11px] text-[#1A1714]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {s.familyHistory?.length ? (
                <div>
                  <p className="mb-0.5 text-[10px] font-medium text-[#9E978B]">Family History</p>
                  <div className="flex flex-wrap gap-1">
                    {s.familyHistory.map((f) => (
                      <span key={f} className="inline-flex items-center rounded-full border-[0.5px] border-tp-slate-200 bg-tp-slate-50 px-2 py-0.5 text-[11px] text-[#1A1714]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ─── 5. ACTIVE Rx SECTION — medication pills ─── */}
        {s.activeMeds?.length ? (
          <div className="mb-1">
            <div
              className={cn("mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]", onNavigate && "cursor-pointer hover:bg-[#F0EFEB]")}
              onClick={onNavigate ? () => onNavigate("dr-agent") : undefined}
            >
              <Pill size={11} className="text-[#9E978B]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Active Rx</span>
              <span className="rounded-[4px] bg-tp-blue-50 px-1 py-[1px] text-[9px] font-semibold text-tp-blue-600">
                {s.activeMeds.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 px-3">
              {s.activeMeds.map((m, i) => (
                <span key={i} className="inline-flex items-center rounded-[6px] border-[0.5px] border-tp-blue-200 bg-tp-blue-50/50 px-2 py-[3px] text-[11px] font-medium text-tp-blue-800">
                  <Pill size={9} className="mr-1 text-tp-blue-400" />{m}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* ─── 6. LAST VISIT SECTION — structured Dx/Rx/Inv/F-U rows ─── */}
        {s.lastVisit ? (
          <div className="mb-1">
            <div
              className={cn("mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]", onNavigate && "cursor-pointer hover:bg-[#F0EFEB]")}
              onClick={onNavigate ? () => onNavigate("past-visits") : undefined}
            >
              <Calendar1 size={11} variant="Bold" className="text-[#9E978B]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Last Visit</span>
              <span className="text-[10px] font-normal text-[#9E978B]">{s.lastVisit.date}</span>
            </div>
            <div className="space-y-[3px] px-3">
              <div className="grid grid-cols-[32px_1fr] gap-x-2">
                <span className="text-[10px] font-medium text-[#9E978B]">Dx</span>
                <span className="text-[12px] font-medium text-[#1A1714]">{s.lastVisit.diagnosis}</span>
              </div>
              <div className="grid grid-cols-[32px_1fr] gap-x-2">
                <span className="text-[10px] font-medium text-[#9E978B]">Rx</span>
                <span className="text-[11px] text-[#1A1714]">{s.lastVisit.medication}</span>
              </div>
              {s.lastVisit.labTestsSuggested && (
                <div className="grid grid-cols-[32px_1fr] gap-x-2">
                  <span className="text-[10px] font-medium text-[#9E978B]">Inv</span>
                  <span className="text-[11px] text-[#1A1714]">{s.lastVisit.labTestsSuggested}</span>
                </div>
              )}
              {s.lastVisit.followUp && (
                <div className="grid grid-cols-[32px_1fr] gap-x-2">
                  <span className="text-[10px] font-medium text-[#9E978B]">F/U</span>
                  <span className="text-[11px] text-[#1A1714]">{s.lastVisit.followUp}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* ─── 7. DUE ALERTS SECTION — red-tinted rows ─── */}
        {s.dueAlerts?.length ? (
          <div className="mb-1">
            <div className="mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
              <Warning2 size={11} variant="Bold" className="text-[#C42B2B]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C42B2B]">Due Alerts</span>
            </div>
            <div className="space-y-[2px] px-3">
              {s.dueAlerts.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-[4px] bg-tp-error-50/40 px-2 py-[3px]">
                  <span className="size-[5px] shrink-0 rounded-full bg-[#C42B2B]" />
                  <span className="text-[11px] font-medium text-[#C42B2B]">{a}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ─── MISSING EXPECTED FIELDS (only for patients with missingExpectedFields) ─── */}
        {(s as any).missingExpectedFields?.length > 0 && (
          <div className="mb-1">
            <div className="mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
              <span className="size-[6px] rounded-full bg-[#9CA3AF]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">Expected — Not Available</span>
              <span className="rounded-[4px] bg-gray-100 px-1 py-[1px] text-[9px] font-semibold text-gray-500">
                {(s as any).missingExpectedFields.length}
              </span>
            </div>
            <div className="space-y-[2px] px-3">
              {((s as any).missingExpectedFields as { field: string; reason: string; prompt: string }[]).map((mf: { field: string; reason: string; prompt: string }, i: number) => (
                <div key={i} className="flex items-start gap-1.5 rounded-[4px] border border-dashed border-gray-200 bg-gray-50/50 px-2 py-[4px]">
                  <span className="mt-[3px] size-[5px] shrink-0 rounded-full bg-[#9CA3AF]" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-[#1A1714]">{mf.field}</span>
                    <p className="text-[10px] text-[#9E978B]">{mf.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── RECOMMENDATION TIERS (only for patients with recommendationTiers) ─── */}
        {(s as any).recommendationTiers?.length > 0 && (
          <div className="mb-1">
            <div className="mb-1 flex items-center gap-1.5 bg-[#F8F7F4] px-3 py-[5px]">
              <Sparkles size={11} className="text-[#8B5CF6]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E978B]">AI Recommendations</span>
              <span className="text-[9px] italic text-[#9E978B]">verify before acting</span>
            </div>
            <div className="space-y-[3px] px-3">
              {((s as any).recommendationTiers as { text: string; tier: string; gatedBy?: string }[]).map((rec: { text: string; tier: string; gatedBy?: string }, i: number) => {
                const tierStyle = rec.tier === "act"
                  ? { bg: "#ECFDF5", text: "#059669", label: "ACT" }
                  : rec.tier === "verify"
                  ? { bg: "#FFFBEB", text: "#D97706", label: "VERIFY" }
                  : { bg: "#F3F4F6", text: "#6B7280", label: "GATHER" }
                return (
                  <div key={i} className="flex items-start gap-1.5 py-[2px]">
                    <span
                      className="mt-[2px] shrink-0 rounded-[3px] px-1.5 py-[1px] text-[8px] font-bold"
                      style={{ backgroundColor: tierStyle.bg, color: tierStyle.text }}
                    >
                      {tierStyle.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-[#1A1714]">{rec.text}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── 8. SPECIALTY EMBED — colored accent box for non-GP ─── */}
        {activeSpecialty !== "gp" && (() => {
          const specConfig = SPECIALTY_VISUAL_CONFIG[activeSpecialty]
          let specContent: React.ReactNode = null
          if (activeSpecialty === "gynec" && s.gynecData) specContent = buildGynecContextContent(s.gynecData)
          else if (activeSpecialty === "ophthal" && s.ophthalData) specContent = buildOphthalContextContent(s.ophthalData)
          else if (activeSpecialty === "obstetric" && s.obstetricData) specContent = buildObstetricContextContent(s.obstetricData)
          else if (activeSpecialty === "pediatrics" && s.pediatricsData) specContent = buildPediatricsContextContent(s.pediatricsData)
          if (!specContent) return null
          return (
            <div className="mx-3 mb-1 mt-1">
              <SpecialtyContextBlock
                specialtyId={activeSpecialty}
                content={specContent}
                accentBorder={specConfig.accentBorder}
                icon={specConfig.icon}
                label={SPECIALTY_CARD_TITLES[activeSpecialty]}
              />
            </div>
          )
        })()}

        {/* Zero data */}
        {!s.todayVitals && !s.lastVisit && !s.chronicConditions?.length && !s.keyLabs?.length && (
          <div className="px-3"><ZeroDataPlaceholder /></div>
        )}
      </div>

      {/* ── Action Pills Row ── */}
      <div className="flex flex-wrap gap-1.5 border-t border-[#C4BFB5]/20 px-3 py-1.5">
        {s.lastVisit && (
          <button type="button" className={AGENT_GRADIENT_CHIP_CLASS} onClick={onNavigate ? () => onNavigate("past-visits") : undefined}>
            <Calendar1 size={10} variant="Bold" className="mr-0.5" /> Last visit
          </button>
        )}
        {(s.keyLabs?.length ?? 0) > 0 && (
          <button type="button" className={AGENT_GRADIENT_CHIP_CLASS} onClick={onNavigate ? () => onNavigate("lab-results") : undefined}>
            <FlaskConical size={10} className="mr-0.5" /> Labs{collapsedInfo.abnormalLabCount > 0 ? ` (${collapsedInfo.abnormalLabCount} flagged)` : ""}
          </button>
        )}
        <button type="button" className={AGENT_GRADIENT_CHIP_CLASS} onClick={onNavigate ? () => onNavigate("vitals") : undefined}>
          <Activity size={10} className="mr-0.5" /> Trends
        </button>
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
  const [symptomCollectorCollapsed, setSymptomCollectorCollapsed] = useState(false)
  const [pillCooldowns, setPillCooldowns] = useState<Record<string, number>>({})
  const [dismissedPills, setDismissedPills] = useState<Record<string, number>>({})
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})

  const timersRef = useRef<number[]>([])
  const voiceTimerRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const contextMenuRef = useRef<HTMLDivElement | null>(null)
  const specialtyMenuRef = useRef<HTMLDivElement | null>(null)
  const copyTimerRef = useRef<number | null>(null)
  const staleRotationRef = useRef<number | null>(null)
  const lastHandledSignalRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
  const activeSummaryData =
    isPatientContext
      ? SMART_SUMMARY_BY_CONTEXT[selectedContextId] ?? SMART_SUMMARY_BY_CONTEXT[CONTEXT_PATIENT_ID]
      : undefined
  const summaryCollapsed = summaryCollapsedByContext[selectedContextId] ?? !!(activeSummaryData?.symptomCollectorData)
  const summaryHasSymptoms = useMemo(() => {
    if (!isPatientContext || !activeSummaryData) return false
    return buildSpecialtyClinicalView(activeSpecialty, activeSummaryData).currentSymptoms.length > 0
  }, [isPatientContext, activeSummaryData, activeSpecialty])
  const hasRxpadSymptoms = hasRxpadSymptomsByContext[selectedContextId] ?? summaryHasSymptoms

  const basePills = useMemo(
    () =>
      buildCannedPillEngine({
        phase: consultPhase,
        lens: activeLens,
        isPatientContext,
        hasInteractionAlert,
        hasRxpadSymptoms,
        summaryData: activeSummaryData,
        specialty: activeSpecialty,
      }),
    [consultPhase, activeLens, isPatientContext, hasInteractionAlert, hasRxpadSymptoms, activeSummaryData, activeSpecialty],
  )

  const [promptSuggestions, setPromptSuggestions] = useState<CannedPill[]>(basePills)

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
    const contextSpecialty = specialtyByContext[contextId] ?? "gp"

    const dynamic = deriveBehaviorAwarePrompts({
      text,
      lens,
      isPatientContext: Boolean(contextIsPatient),
      summaryData,
    })
    const dynamicPills: CannedPill[] = dynamic.map((label, i) => ({
      id: `dynamic-${label}`,
      label,
      priority: 50 + i,
      layer: 3 as const,
      tone: "primary" as const,
      cooldownMs: 3000,
    }))

    const merged: CannedPill[] = [
      ...buildCannedPillEngine({
        phase,
        lens,
        isPatientContext: contextIsPatient,
        hasInteractionAlert,
        hasRxpadSymptoms: contextHasSymptoms,
        summaryData,
        specialty: contextSpecialty,
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
    const contextSpecialty = specialtyByContext[contextId] ?? "gp"

    const signalPills: CannedPill[] = labels.map((label, i) => ({
      id: `signal-${label}`,
      label,
      priority: 40 + i,
      layer: 3 as const,
      tone: "primary" as const,
      cooldownMs: 3000,
    }))

    const merged: CannedPill[] = [
      ...signalPills,
      ...buildCannedPillEngine({
        phase,
        lens,
        isPatientContext: contextIsPatient,
        hasInteractionAlert,
        hasRxpadSymptoms: contextHasSymptoms,
        summaryData,
        specialty: contextSpecialty,
      }),
    ]

    setPromptSuggestions(Array.from(new Map(merged.map((pill) => [pill.label, pill])).values()).slice(0, 5))
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

    // ── Phase 11 Guardrail: Off-topic detection ──
    if (source === "typed" && isOffTopicQuery(text)) {
      const guardrailMsg = createAgentMessage("assistant", OFF_TOPIC_REPLY)
      pushMessage(contextId, guardrailMsg)
      return
    }

    // ── Phase 11 Guardrail: Cross-patient safety block ──
    const currentPatientName = contextOption?.label ?? ""
    if (
      source === "typed" &&
      contextOption?.kind === "patient" &&
      detectsCrossPatientReference(text, currentPatientName)
    ) {
      const guardrailMsg = createAgentMessage("assistant", CROSS_PATIENT_REPLY)
      pushMessage(contextId, guardrailMsg)
      return
    }

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
    // Auto-expand PatientSummaryCard so doctor sees updated specialty content
    setSummaryCollapsedByContext((prev) => ({ ...prev, [selectedContextId]: false }))
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
              <p className="truncate text-[12px] text-tp-slate-600">TypeRx consultation</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isPatientContext ? (
              <div ref={specialtyMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSpecialtyMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-tp-violet-300 bg-[linear-gradient(135deg,rgba(242,77,182,0.14)_0%,rgba(150,72,254,0.12)_52%,rgba(75,74,213,0.12)_100%)] px-2 py-0.5 text-[12px] font-medium text-tp-violet-700"
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
                          "w-full px-2 py-1.5 text-left text-[12px]",
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
              className="inline-flex size-6 min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] text-tp-slate-500 transition-colors hover:bg-white/70"
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
                  <span className="max-w-[160px] truncate text-[12px] font-medium text-tp-slate-600">{selectedContext.label}</span>
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
                          className="h-8 w-full rounded-[8px] border-[0.5px] border-tp-slate-200 bg-tp-slate-50 pl-7 pr-2.5 text-[12px] text-tp-slate-700 outline-none focus:border-tp-blue-300"
                        />
                      </div>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto p-1.5">
                        {todayOptions.length > 0 && (
                          <>
                            <p className="px-2 py-1 text-[12px] font-semibold uppercase tracking-wide text-tp-slate-400">Today's Appointments</p>
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
                                <p className="truncate text-[12px] font-semibold text-tp-slate-700">{option.label}</p>
                                <p className="text-[12px] text-tp-slate-500">{option.meta}</p>
                              </button>
                            ))}
                          </>
                        )}
                        {otherOptions.length > 0 && (
                          <>
                            <p className="px-2 py-1 text-[12px] font-semibold uppercase tracking-wide text-tp-slate-400">Other Contexts</p>
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
                                <p className="truncate text-[12px] font-semibold text-tp-slate-700">{option.label}</p>
                                <p className="text-[12px] text-tp-slate-500">{option.meta}</p>
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

            <div className="space-y-2">
              <AgentIntroMessage contextLabel={selectedContext.label} isPatientContext={isPatientContext} />

              {isPatientContext && activeSummaryData && (
                <div className="ml-8 max-w-[86%]">
                  <PatientIntroSequence
                    summaryData={activeSummaryData}
                    activeSpecialty={activeSpecialty}
                    patientGender={selectedContext.patient?.gender}
                    patientAge={selectedContext.patient?.age}
                    summaryCollapsed={summaryCollapsed}
                    onToggleSummary={() => setSummaryCollapsedByContext((prev) => ({ ...prev, [selectedContextId]: !summaryCollapsed }))}
                    symptomCollectorCollapsed={symptomCollectorCollapsed}
                    onToggleSymptomCollector={() => setSymptomCollectorCollapsed((prev) => !prev)}
                    onCopy={handleCopy}
                    onNavigate={(tab) => setLensByContext((prev) => ({ ...prev, [selectedContextId]: tab as RxTabLens }))}
                  />
                </div>
              )}

              {copyFeedback && (
                <div className="rounded-lg border-[0.5px] border-tp-success-200 bg-tp-success-50 px-2 py-1 text-[12px] font-semibold text-tp-success-700">
                  {copyFeedback}
                </div>
              )}

              {messages.map((message) => {
                const isUser = message.role === "user"
                const feedback = messageFeedback[message.id]
                const { text: displayText, truncated: isTruncated } = isUser
                  ? { text: message.text, truncated: false }
                  : truncateResponseText(message.text)
                const isExpanded = expandedMessages[message.id] ?? false
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
                        <p className="whitespace-pre-line">{isExpanded ? message.text : displayText}</p>
                        {isTruncated && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedMessages((prev) => ({
                                ...prev,
                                [message.id]: !prev[message.id],
                              }))
                            }
                            className="mt-0.5 text-[11px] text-tp-blue-600 hover:underline"
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </button>
                        )}
                        {isUser ? <p className="mt-1 text-[12px] text-tp-slate-500">{formatMessageTime(message.createdAt)}</p> : null}
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
                          onNavigate={(tab) => setLensByContext((prev) => ({ ...prev, [selectedContextId]: tab as RxTabLens }))}
                        />
                      </div>
                    )}
                    {!isUser && (
                      <div className="ml-8 flex items-center gap-2">
                        <span className="text-[10px] text-tp-slate-400">{formatMessageTime(message.createdAt)}</span>
                        <ResponseFeedback
                          messageId={message.id}
                          feedback={feedback}
                          onFeedback={(id, type) => setMessageFeedback((prev) => ({ ...prev, [id]: type }))}
                        />
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
                      <p className="text-[12px] font-semibold text-tp-slate-700">Preparing structured response</p>
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
          {/* ── Canned Pill Strip ── */}
          <div className="mb-2 overflow-x-auto pb-1">
            <div className="inline-flex min-w-max items-center gap-1.5">
              {promptSuggestions
                .filter((pill) => {
                  // Layer 1 (force) pills always shown
                  if (pill.force) return true
                  // Filter out dismissed pills within 5-min window
                  const dismissedAt = dismissedPills[pill.id]
                  if (dismissedAt && Date.now() - dismissedAt < 300000) return false
                  return true
                })
                .map((prompt) => {
                  const isCoolingDown = Boolean(pillCooldowns[prompt.id] && Date.now() - pillCooldowns[prompt.id] < (prompt.cooldownMs ?? 3000))
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      disabled={isCoolingDown}
                      onClick={() => {
                        // Set cooldown timestamp
                        setPillCooldowns((prev) => ({ ...prev, [prompt.id]: Date.now() }))
                        // Clear cooldown after duration
                        const cd = prompt.cooldownMs ?? 3000
                        const timer = window.setTimeout(() => {
                          setPillCooldowns((prev) => {
                            const next = { ...prev }
                            delete next[prompt.id]
                            return next
                          })
                        }, cd)
                        timersRef.current.push(timer)
                        sendMessage(prompt.label, "canned")
                      }}
                      className={cn(
                        "whitespace-nowrap transition-all hover:bg-tp-violet-50/60",
                        AGENT_GRADIENT_CHIP_CLASS,
                        toneChipClass(prompt.tone),
                        prompt.force && "border-tp-error-200/90 text-tp-error-700",
                        isCoolingDown && "pointer-events-none opacity-50",
                      )}
                    >
                      {prompt.label}
                    </button>
                  )
                })}
            </div>
          </div>

          {/* ── Upload Preview Chip ── */}
          {uploadedFile && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-[8px] border border-tp-blue-200 bg-tp-blue-50 px-2.5 py-1.5">
              <FileText size={13} className="text-tp-blue-500" />
              <span className="max-w-[200px] truncate text-[12px] font-medium text-tp-blue-700">{uploadedFile.name}</span>
              <button type="button" onClick={() => setUploadedFile(null)} className="text-tp-blue-400 hover:text-tp-blue-600">
                <X size={12} />
              </button>
            </div>
          )}

          {/* ── Processing indicator ── */}
          {isProcessingUpload && (
            <div className="mb-2 flex items-center gap-2 rounded-[8px] bg-tp-slate-50 px-2.5 py-1.5">
              <div className="size-3 animate-spin rounded-full border-2 border-tp-violet-300 border-t-transparent" />
              <span className="text-[12px] text-tp-slate-600">Processing document via OCR...</span>
            </div>
          )}

          {/* ── Input Area: [📎] [input] [🎤] [➤] ── */}
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

            {/* Text input */}
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleSendWithUpload()
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
                "inline-flex size-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[10px] border-[0.5px] transition-colors",
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
                "inline-flex size-9 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[10px] transition-colors",
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
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-tp-slate-500">
            <ShieldCheck size={11} className="text-tp-success-600" />
            <span>Encrypted. Patient details are stored securely and accessible only to this doctor.</span>
          </div>

          {isRecording && <p className="mt-1 text-[12px] font-medium text-tp-violet-600">Recording voice prompt...</p>}
        </div>
      </div>
    </aside>
  )
}

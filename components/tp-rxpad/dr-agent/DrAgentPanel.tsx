"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"
import type { RxPadCopyPayload } from "@/components/tp-rxpad/rxpad-sync-context"

import type {
  CannedPill,
  ConsultPhase,
  DoctorViewType,
  RxAgentChatMessage,
  RxTabLens,
  SmartSummaryData,
  SpecialtyTabId,
} from "./types"
import { CONTEXT_PATIENT_ID, RX_CONTEXT_OPTIONS } from "./constants"
import { SMART_SUMMARY_BY_CONTEXT } from "./mock-data"
import { generatePills } from "./engines/pill-engine"
import { generateHomepagePills } from "./engines/homepage-pill-engine"
import { inferPhase } from "./engines/phase-engine"
import { classifyIntent, PILL_INTENT_MAP } from "./engines/intent-engine"
import { buildReply, buildDocumentReply, buildPomrCardData } from "./engines/reply-engine"
import { buildHomepageReply } from "./engines/homepage-reply-engine"
import { parseVoiceToStructuredRx } from "./engines/voice-rx-engine"

import { Hospital, User } from "iconsax-reactjs"
import { AgentHeader } from "./shell/AgentHeader"
import { PatientSelector } from "./shell/PatientSelector"
import { ChatThread } from "./chat/ChatThread"
import { WelcomeScreen, type PageContext } from "./chat/WelcomeScreen"
import { PillBar } from "./chat/PillBar"
import { ChatInput } from "./chat/ChatInput"
import { AttachPanel } from "./chat/AttachPanel"
import { DocumentBottomSheet } from "./chat/DocumentBottomSheet"
import type { PatientDocument } from "./types"
import { PATIENT_DOCUMENTS } from "./mock-data"

// ═══════════════ HELPERS ═══════════════

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

/** Map intent category + query keywords to a context-aware typing indicator hint */
function getQueryHint(category: string, query: string): string {
  const q = query.toLowerCase()
  if (q.includes("interaction") || q.includes("drug")) return "Checking drug interactions"
  if (q.includes("lab") || q.includes("vital") || q.includes("trend")) return "Fetching lab results"
  if (q.includes("summary") || q.includes("snapshot") || q.includes("patient")) return "Looking up patient records"
  if (q.includes("intake") || q.includes("pre-visit")) return "Loading intake data"
  if (q.includes("ddx") || q.includes("diagnos")) return "Reviewing clinical guidelines"
  if (q.includes("investigation") || q.includes("test")) return "Reviewing investigation protocols"
  if (q.includes("document") || q.includes("report") || q.includes("upload")) return "Analyzing document"
  switch (category) {
    case "data_retrieval": return "Looking up patient records"
    case "clinical_decision": return "Reviewing clinical guidelines"
    case "clinical_question": return "Reviewing clinical data"
    case "comparison": return "Comparing clinical data"
    case "operational": return "Fetching clinic data"
    case "document_analysis": return "Analyzing document"
    case "action": return "Preparing response"
    default: return "Reviewing clinical data"
  }
}

function detectSpecialties(summary: SmartSummaryData): SpecialtyTabId[] {
  const tabs: SpecialtyTabId[] = ["gp"]
  if (summary.obstetricData) tabs.push("obstetric")
  if (summary.pediatricsData) tabs.push("pediatrics")
  if (summary.gynecData) tabs.push("gynec")
  if (summary.ophthalData) tabs.push("ophthal")
  return tabs
}

function buildIntroMessages(
  summary: SmartSummaryData,
  patient: typeof RX_CONTEXT_OPTIONS[0],
  _doctorViewType?: DoctorViewType,
  intakeMode: "with_intake" | "without_intake" = "with_intake",
  panelMode: "rxpad" | "homepage" = "homepage",
): RxAgentChatMessage[] {
  const hasData = summary.specialtyTags.length > 0
  const messages: RxAgentChatMessage[] = []

  // ── RxPad + Homepage patient context: no pre-loaded messages ──
  // The WelcomeScreen handles the first-time experience. When the doctor
  // clicks a canned action (e.g. "Patient Summary"), only that response appears.
  // No auto-generated pre-intake or summary cards — show only what the doctor asks for.
  if (panelMode === "rxpad" || panelMode === "homepage") {
    return messages
  }

  // ── Homepage / Appointment page intro flow ──
  //
  // With intake:
  //   Single message → Intake card (already includes quick snapshot via patientNarrative)
  //
  // Without intake:
  //   Single message → Quick historical snapshot (patient_narrative)
  //
  // No data:
  //   Single message → New patient text
  //
  const showIntake = intakeMode === "with_intake" && !!summary.symptomCollectorData

  if (showIntake) {
    // Intake card — includes quick snapshot inside via patientNarrative
    messages.push({
      id: uid(),
      role: "assistant",
      text: `${patient.label}'s details reported by patient via Symptom Collector:`,
      createdAt: new Date().toISOString(),
      rxOutput: {
        kind: "symptom_collector",
        data: {
          ...summary.symptomCollectorData!,
          patientNarrative: summary.patientNarrative,
        },
      },
      feedbackGiven: null,
    })
  } else if (hasData) {
    // No intake — show quick historical snapshot
    messages.push({
      id: uid(),
      role: "assistant",
      text: `Quick snapshot for ${patient.label}:`,
      createdAt: new Date().toISOString(),
      rxOutput: { kind: "patient_narrative", data: summary },
      feedbackGiven: null,
    })
  } else {
    messages.push({
      id: uid(),
      role: "assistant",
      text: `${patient.label} — new patient, first visit. No prior records yet.`,
      createdAt: new Date().toISOString(),
      feedbackGiven: null,
    })
  }

  return messages
}

// ═══════════════ STATIC PATIENT INFO STRIP ═══════════════

function StaticPatientStrip({ selectedPatientId }: { selectedPatientId: string }) {
  const selected =
    RX_CONTEXT_OPTIONS.find((o) => o.id === selectedPatientId) ??
    RX_CONTEXT_OPTIONS[0]

  const genderLabel = selected?.gender === "M" ? "M" : selected?.gender === "F" ? "F" : ""
  const ageLabel = selected?.age ? `${selected.age}y` : ""
  const metaParts = [genderLabel, ageLabel].filter(Boolean).join(", ")

  return (
    <div className="sticky top-0 z-10 flex justify-center pb-1 pt-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/55 px-2.5 py-1 text-[14px] font-medium text-tp-slate-600 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.5)] backdrop-blur-md">
        {selected?.label}
        {metaParts && <span className="text-tp-slate-400">· {metaParts}</span>}
      </span>
    </div>
  )
}

// ═══════════════ MAIN COMPONENT ═══════════════

interface DrAgentPanelProps {
  onClose: () => void
  /** Override the default patient — used when embedding in appointment page */
  initialPatientId?: string
  /** "homepage" mode enables operational queries and homepage pills */
  mode?: "rxpad" | "homepage"
  /** Active tab on homepage — used for pill generation */
  activeTab?: string
  /** Active rail item on homepage (e.g. "follow-ups", "pharmacy") */
  activeRailItem?: string
  /** Homepage patient list — mapped from queue appointments */
  homepagePatients?: import("./types").RxContextOption[]
  /** Auto-send a message when the panel opens (e.g. from tooltip CTA). Incremented counter triggers re-send. */
  autoMessage?: string
  /** Counter to re-trigger autoMessage even with same text */
  autoMessageTrigger?: number
  /** Counter to force patient context re-sync from parent */
  patientSwitchTrigger?: number
}

const HOMEPAGE_COMMON_ID = "__homepage_common__"

export function DrAgentPanel({ onClose, initialPatientId, mode = "rxpad", activeTab, activeRailItem, homepagePatients, autoMessage, autoMessageTrigger, patientSwitchTrigger }: DrAgentPanelProps) {
  // ── Patient Context ──
  // In homepage mode with no patient, use a special common ID for operational context
  const effectiveDefaultId = (mode === "homepage" && !initialPatientId) ? HOMEPAGE_COMMON_ID : (initialPatientId ?? CONTEXT_PATIENT_ID)
  const [selectedPatientId, setSelectedPatientId] = useState(effectiveDefaultId)

  // Sync when initialPatientId changes from parent (appointment page)
  useEffect(() => {
    if (mode === "homepage" && !initialPatientId) {
      if (selectedPatientId !== HOMEPAGE_COMMON_ID) {
        setSelectedPatientId(HOMEPAGE_COMMON_ID)
      }
    } else if (initialPatientId) {
      setSelectedPatientId(initialPatientId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatientId, mode, patientSwitchTrigger])

  // ── Per-Patient State (keyed by patient ID) ──
  const [messagesByPatient, setMessagesByPatient] = useState<Record<string, RxAgentChatMessage[]>>({})
  const [phaseByPatient, setPhaseByPatient] = useState<Record<string, ConsultPhase>>({})

  // ── UI State ──
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtyTabId>("gp")
  const [activeTabLens] = useState<RxTabLens>("dr-agent")
  const [doctorViewType, setDoctorViewType] = useState<DoctorViewType>("specialist_first_visit")
  const [intakeMode, setIntakeMode] = useState<"with_intake" | "without_intake">("with_intake")
  const [inputValue, setInputValue] = useState("")
  const [isPrefilled, setIsPrefilled] = useState(false)
  const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false)
  const [chipShaking, setChipShaking] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingHint, setTypingHint] = useState("")
  const [showAttachPanel, setShowAttachPanel] = useState(false)
  const [showDocBottomSheet, setShowDocBottomSheet] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Integration ──
  const { requestCopyToRxPad, lastSignal, publishSignal, setPatientAllergies } = useRxPadSync()
  const lastSignalIdRef = useRef<number>(0)

  // ── Derived State ──
  const patient = useMemo(
    () => RX_CONTEXT_OPTIONS.find((p) => p.id === selectedPatientId) || RX_CONTEXT_OPTIONS[0],
    [selectedPatientId],
  )

  const summary = useMemo(
    () => SMART_SUMMARY_BY_CONTEXT[selectedPatientId] || SMART_SUMMARY_BY_CONTEXT[CONTEXT_PATIENT_ID],
    [selectedPatientId],
  )

  const messages = useMemo(
    () => messagesByPatient[selectedPatientId] || [],
    [messagesByPatient, selectedPatientId],
  )

  const phase = useMemo(
    () => phaseByPatient[selectedPatientId] || "empty",
    [phaseByPatient, selectedPatientId],
  )

  const availableSpecialties = useMemo(() => detectSpecialties(summary), [summary])

  const isPatientContext = mode === "homepage" && selectedPatientId !== HOMEPAGE_COMMON_ID

  // Show doctor view selector only for patients with POMR/SBAR data (POC: Ramesh Kumar only)
  const showDoctorViewSelector = selectedPatientId === "apt-ramesh-ckd"

  // ── Pill deduplication: track which card kinds have been shown ──
  const shownCardKinds = useMemo(() => {
    const kinds = new Set<string>()
    for (const msg of messages) {
      if (msg.rxOutput?.kind) kinds.add(msg.rxOutput.kind)
    }
    return kinds
  }, [messages])

  /** Map pill labels to the card kind(s) they produce — used to hide pills for already-shown cards */
  const PILL_TO_CARD_KINDS: Record<string, string[]> = {
    "Patient's detailed summary": ["patient_summary", "sbar_overview"],
    "Patient summary": ["sbar_overview", "patient_summary"],
    "Reported by patient": ["symptom_collector"],
    "Show reported intake": ["symptom_collector"],
    "Last visit": ["last_visit"],
    "Last visit details": ["last_visit"],
    "Past visit summaries": ["last_visit"],
    "Vital trends": ["vitals_trend_bar"],
    "Suggest DDX": ["ddx"],
    "Lab overview": ["lab_panel"],
    "Lab comparison": ["lab_comparison"],
    "Obstetric summary": ["obstetric_summary"],
    "Gynec summary": ["gynec_summary"],
    "Growth & vaccines": ["pediatric_summary"],
    "Vision summary": ["ophthal_summary"],
    "Flagged lab results": ["lab_panel"],
    "Follow-up overview": ["follow_up"],
  }

  const pills = useMemo(() => {
    const rawPills = (mode === "homepage" && selectedPatientId === HOMEPAGE_COMMON_ID)
      ? generateHomepagePills(activeTab, activeRailItem, null)
      : isPatientContext
        ? generateHomepagePills(activeTab, activeRailItem, summary)
        : generatePills(summary, phase, activeTabLens, showDoctorViewSelector ? doctorViewType : undefined)

    // Filter out pills whose card has already been shown in the current conversation
    return rawPills.filter(pill => {
      const cardKinds = PILL_TO_CARD_KINDS[pill.label]
      if (!cardKinds) return true // Unknown mapping — always show
      return !cardKinds.some(kind => shownCardKinds.has(kind))
    })
  }, [mode, activeTab, activeRailItem, isPatientContext, summary, phase, activeTabLens, selectedPatientId, showDoctorViewSelector, doctorViewType, shownCardKinds])

  // ── Sync patient allergies to context (for RxPad medication alerts) ──
  useEffect(() => {
    setPatientAllergies(summary.allergies ?? [])
  }, [summary, setPatientAllergies])

  // ── Initialize patient messages on first visit or after intake mode change ──
  // Note: we track whether messages exist for the current patient using a ref-derived flag
  // to avoid putting messagesByPatient in the dep array (which would cause infinite loops
  // since this effect itself sets messagesByPatient).
  const hasMessagesForPatient = !!messagesByPatient[selectedPatientId]
  useEffect(() => {
    if (!hasMessagesForPatient) {
      let introMessages: RxAgentChatMessage[]
      if (mode === "homepage" && selectedPatientId === HOMEPAGE_COMMON_ID) {
        // Homepage — no intro messages; WelcomeScreen handles the first-time experience
        introMessages = []
      } else {
        introMessages = buildIntroMessages(summary, patient, showDoctorViewSelector ? doctorViewType : undefined, intakeMode, mode)
      }
      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatientId]: introMessages,
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId, hasMessagesForPatient, summary, patient, mode, initialPatientId])

  // ── Reset specialty when patient changes ──
  useEffect(() => {
    const detected = detectSpecialties(summary)
    if (!detected.includes(activeSpecialty)) {
      setActiveSpecialty("gp")
    }
  }, [summary, activeSpecialty])

  // ── Handle Sidebar Signals ──
  useEffect(() => {
    if (!lastSignal || lastSignal.id === lastSignalIdRef.current) return
    lastSignalIdRef.current = lastSignal.id

    if (lastSignal.type === "sidebar_pill_tap" && lastSignal.label) {
      // Pre-fill input box — doctor decides whether to send
      setInputValue(lastSignal.label)
      setIsPrefilled(true)
    }

    // AI trigger from RxPad section chips or sidebar icons → pre-fill input
    if (lastSignal.type === "ai_trigger" && lastSignal.label) {
      setInputValue(lastSignal.label)
      setIsPrefilled(true)
    }

    // When symptoms are added in RxPad, advance phase to show DDX pills
    if (lastSignal.type === "symptoms_changed") {
      const currentPhase = phaseByPatient[selectedPatientId] || "empty"
      if (currentPhase === "empty") {
        setPhaseByPatient((prev) => ({ ...prev, [selectedPatientId]: "symptoms_entered" }))
      }
    }

    // When diagnosis is added, advance phase
    if (lastSignal.type === "diagnosis_changed") {
      const currentPhase = phaseByPatient[selectedPatientId] || "empty"
      if (currentPhase === "symptoms_entered") {
        setPhaseByPatient((prev) => ({ ...prev, [selectedPatientId]: "dx_accepted" }))
      }
    }

    // When medications are added, advance phase accordingly
    if (lastSignal.type === "medications_changed") {
      const currentPhase = phaseByPatient[selectedPatientId] || "empty"
      if (currentPhase === "dx_accepted") {
        setPhaseByPatient((prev) => ({ ...prev, [selectedPatientId]: "meds_written" }))
      }
    }
  }, [lastSignal])

  // ── Core: Send Message ──
  const handleSend = useCallback((text?: string) => {
    const msg = text || inputValue.trim()
    if (!msg) return

    const userMsg: RxAgentChatMessage = {
      id: uid(),
      role: "user",
      text: msg,
      createdAt: new Date().toISOString(),
    }

    setMessagesByPatient((prev) => ({
      ...prev,
      [selectedPatientId]: [...(prev[selectedPatientId] || []), userMsg],
    }))
    setInputValue("")

    // Classify intent — check PILL_INTENT_MAP first (exact pill labels bypass NLU)
    const pillOverride = PILL_INTENT_MAP[msg]
    const intent = pillOverride
      ? { category: pillOverride, format: "card" as const, confidence: 1 }
      : classifyIntent(msg)

    // Set context-aware typing hint before showing indicator
    setTypingHint(getQueryHint(intent.category, msg))
    setIsTyping(true)

    // Build reply after a short delay (simulate thinking)
    setTimeout(() => {
      const currentMessages = [...(messagesByPatient[selectedPatientId] || []), userMsg]
      const currentPhase = phaseByPatient[selectedPatientId] || "empty"

      // Update phase
      const newPhase = inferPhase(currentMessages, currentPhase)
      if (newPhase !== currentPhase) {
        setPhaseByPatient((prev) => ({ ...prev, [selectedPatientId]: newPhase }))
      }

      // ── Guardrails + Routing ──
      const isClinicOverview = mode === "homepage" && selectedPatientId === HOMEPAGE_COMMON_ID
      const isRxPadMode = mode === "rxpad"

      // Patient-specific intents that should NOT render in Clinic Overview
      const PATIENT_SPECIFIC_INTENTS: Set<string> = new Set([
        "data_retrieval", "clinical_decision", "comparison", "document_analysis",
      ])
      // Patient-specific keywords in the message
      const nl = msg.toLowerCase()
      const isPatientSpecificQuery = nl.includes("timeline") || nl.includes("last visit") || nl.includes("patient summary")
        || nl.includes("snapshot") || nl.includes("lab") || nl.includes("vital")
        || nl.includes("medication") || nl.includes("obstetric summary") || nl.includes("gynec summary")
        || nl.includes("growth") || nl.includes("vision") || nl.includes("intake")

      // Operational (clinic-overview) keywords
      const isOperationalQuery = intent.category === "operational"

      let reply: import("./types").ReplyResult

      // Extract patient name from message for search
      const extractPatientQuery = (text: string): string => {
        const patterns = [
          /(?:details?\s+(?:about|of|for)\s+)(.+)/i,
          /(?:search|find|look\s*up|show)\s+(?:patient\s+)?(.+)/i,
          /(?:patient\s+named?\s+)(.+)/i,
          /(?:who\s+is\s+)(.+)/i,
        ]
        for (const p of patterns) {
          const m = text.match(p)
          if (m) return m[1].trim().replace(/[?.!]+$/, "")
        }
        return ""
      }

      // Check if message mentions a patient name (fuzzy match against known patients)
      const allPatients = RX_CONTEXT_OPTIONS.filter(o => o.kind === "patient")
      let nameQuery = extractPatientQuery(msg)
      // If no pattern matched, check if the raw input matches a known patient name
      if (!nameQuery) {
        const directMatch = allPatients.some(
          p => p.label.toLowerCase().includes(nl) || nl.includes(p.label.toLowerCase().split(" ")[0])
        )
        if (directMatch) nameQuery = msg.trim()
      }

      if (isClinicOverview && nameQuery) {
        // ── Patient search → show search card with pre-filled query ──
        const matches = allPatients
          .filter(p => p.label.toLowerCase().includes(nameQuery.toLowerCase()))
          .map(p => ({
            patientId: p.id,
            name: p.label,
            meta: p.meta,
            hasAppointmentToday: !!p.isToday,
          }))
        reply = {
          text: matches.length > 0
            ? `Found ${matches.length} patient${matches.length > 1 ? "s" : ""} matching "${nameQuery}". Select to view details.`
            : `No patients found for "${nameQuery}". Try searching with a different name.`,
          rxOutput: {
            kind: "patient_search",
            data: { query: nameQuery, results: matches },
          },
        }
      } else if (isClinicOverview && (PATIENT_SPECIFIC_INTENTS.has(intent.category) || isPatientSpecificQuery)) {
        // ── GUARDRAIL: Patient-specific query without a name → show search card ──
        reply = {
          text: "Please search for a patient to view their clinical data.",
          rxOutput: {
            kind: "patient_search",
            data: { query: "", results: [] },
          },
        }
      } else if (isRxPadMode && isOperationalQuery) {
        // ── GUARDRAIL: Operational/clinic query inside RxPad → redirect to appointments page ──
        const patientLabel = summary.patientNarrative
          ? "this patient"
          : "the current patient"
        reply = {
          text: `You're currently inside ${patientLabel}'s consultation. Clinic-wide analytics like revenue, KPIs, and scheduling are available on the Appointments page. Switch to the Clinic Overview context to access operational data.`,
          followUpPills: [
            { id: "grd-suggest", label: "Suggest DDX", priority: 10, layer: 3, tone: "primary" as const },
            { id: "grd-labs", label: "Lab overview", priority: 12, layer: 3, tone: "primary" as const },
          ],
        }
      } else if (mode === "homepage" && isOperationalQuery) {
        // ── Normal: Operational query in Clinic Overview ──
        reply = buildHomepageReply(msg, intent)
      } else {
        // ── Normal: Patient-context reply ──
        reply = buildReply(msg, summary, newPhase, intent)
      }

      const assistantMsg: RxAgentChatMessage = {
        id: uid(),
        role: "assistant",
        text: reply.text,
        createdAt: new Date().toISOString(),
        rxOutput: reply.rxOutput,
        feedbackGiven: null,
        suggestions: reply.suggestions,
      }

      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatientId]: [...(prev[selectedPatientId] || []), assistantMsg],
      }))
      setIsTyping(false)
      setTypingHint("")
    // Delay simulates AI thinking — 2-2.5s feels natural for clinical queries
    }, 1800 + Math.random() * 700)
  }, [inputValue, selectedPatientId, summary, messagesByPatient, phaseByPatient, mode, homepagePatients])

  // ── Auto-message from parent (e.g. tooltip "View Detailed Summary" CTA) ──
  const handleSendRef = useRef(handleSend)
  handleSendRef.current = handleSend
  useEffect(() => {
    if (autoMessage) {
      // Double-RAF ensures React has flushed patient context before sending
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          handleSendRef.current(autoMessage)
        })
      })
      return () => cancelAnimationFrame(rafId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMessage, autoMessageTrigger])

  // ── Pill Tap ──
  const handlePillTap = useCallback((pill: CannedPill) => {
    handleSend(pill.label)
  }, [handleSend])

  // ── Feedback ──
  const handleFeedback = useCallback((messageId: string, feedback: "up" | "down") => {
    setMessagesByPatient((prev) => {
      const msgs = prev[selectedPatientId] || []
      return {
        ...prev,
        [selectedPatientId]: msgs.map((m) =>
          m.id === messageId ? { ...m, feedbackGiven: feedback } : m,
        ),
      }
    })
  }, [selectedPatientId])

  // ── Patient Search Selection ──
  const handlePatientSelect = useCallback((patientId: string) => {
    setSelectedPatientId(patientId)
  }, [])

  // ── Fill to RxPad ──
  const handleCopy = useCallback((payload: unknown) => {
    if (payload && typeof payload === "object" && "sourceDateLabel" in payload) {
      requestCopyToRxPad(payload as RxPadCopyPayload)
      // Also persist to sessionStorage so RxPad can pick it up if opened later
      try {
        const existing = sessionStorage.getItem("pendingRxPadCopy")
        const arr: unknown[] = existing ? JSON.parse(existing) : []
        arr.push(payload)
        sessionStorage.setItem("pendingRxPadCopy", JSON.stringify(arr))
      } catch { /* ignore storage errors */ }
    }
  }, [requestCopyToRxPad])

  // ── Sidebar Navigation ──
  const handleSidebarNav = useCallback((tab: string) => {
    // Publish signal first so sidebar can process it
    publishSignal({ type: "section_focus", sectionId: tab })
    // Small delay to let sidebar process the signal before closing agent panel
    setTimeout(() => {
      onClose()
    }, 50)
  }, [publishSignal, onClose])

  // ── From pill tap in chat (text-based) ──
  const handleChatPillTap = useCallback((label: string) => {
    handleSend(label)
  }, [handleSend])

  // ── Doctor View Change — directly rebuild intro messages ──
  const handleDoctorViewChange = useCallback((newType: DoctorViewType) => {
    setDoctorViewType(newType)
    // Directly rebuild intro messages instead of delete-then-recreate via useEffect
    // This avoids the intermediate empty state that could cause visual flicker
    const newIntro = buildIntroMessages(summary, patient, showDoctorViewSelector ? newType : undefined, intakeMode, mode)
    setMessagesByPatient((prev) => ({
      ...prev,
      [selectedPatientId]: newIntro,
    }))
    setIsTyping(false)
  }, [selectedPatientId, summary, patient, showDoctorViewSelector, intakeMode])

  // ── Intake Mode Change — directly rebuild intro messages ──
  const handleIntakeModeChange = useCallback((newMode: "with_intake" | "without_intake") => {
    setIntakeMode(newMode)
    // Directly rebuild intro messages instead of delete-then-recreate via useEffect
    const newIntro = buildIntroMessages(summary, patient, showDoctorViewSelector ? doctorViewType : undefined, newMode, mode)
    setMessagesByPatient((prev) => ({
      ...prev,
      [selectedPatientId]: newIntro,
    }))
    setIsTyping(false)
  }, [selectedPatientId, summary, patient, showDoctorViewSelector, doctorViewType])

  // ── Patient Change ──
  const handlePatientChange = useCallback((id: string) => {
    setSelectedPatientId(id)
    setInputValue("")
    setIsTyping(false)
  }, [])

  // ── Chip shake — triggered when locked chip in input is clicked ──
  const handleLockedChipClick = useCallback(() => {
    setChipShaking(true)
    setTimeout(() => setChipShaking(false), 600)
  }, [])

  // ── Edit message — ChatGPT-style: truncate after edited msg, re-send ──
  const handleEditMessage = useCallback((messageId: string, newText: string) => {
    setMessagesByPatient((prev) => {
      const msgs = prev[selectedPatientId] || []
      const idx = msgs.findIndex((m) => m.id === messageId)
      if (idx < 0) return prev
      // Keep messages up to (not including) the edited one
      const kept = msgs.slice(0, idx)
      return { ...prev, [selectedPatientId]: kept }
    })
    // Re-send with new text after state updates
    setTimeout(() => handleSend(newText), 50)
  }, [selectedPatientId, handleSend])

  // ── Handle attach — context-aware ──
  // Homepage (Clinic Overview, no patient) → open native file picker
  // Patient context → show bottom sheet with patient's documents
  const handleAttach = useCallback(() => {
    if (mode === "homepage" && selectedPatientId === HOMEPAGE_COMMON_ID) {
      // No patient context → trigger native file input
      fileInputRef.current?.click()
    } else {
      // Patient context → show document bottom sheet
      setShowDocBottomSheet(true)
    }
  }, [mode, selectedPatientId])

  // ── Handle sending selected documents from bottom sheet ──
  const handleSendDocuments = useCallback((docs: PatientDocument[]) => {
    setShowDocBottomSheet(false)

    const fileNames = docs.map(d => d.fileName)
    const textPrefix = docs.length === 1
      ? `Analyze this document: **${docs[0].fileName}**`
      : `Analyze these ${docs.length} documents: ${fileNames.map(f => `**${f}**`).join(", ")}`

    const userMsg: RxAgentChatMessage = {
      id: uid(),
      role: "user",
      text: textPrefix,
      createdAt: new Date().toISOString(),
      attachment: {
        type: "pdf",
        fileName: docs[0].fileName,
        pageCount: docs[0].pageCount,
      },
    }

    setMessagesByPatient((prev) => ({
      ...prev,
      [selectedPatientId]: [...(prev[selectedPatientId] || []), userMsg],
    }))
    setIsTyping(true)

    // Determine reply based on first doc's type
    const docType = docs[0].docType === "radiology" ? "radiology"
      : docs[0].docType === "prescription" ? "prescription"
      : "pathology"

    setTimeout(() => {
      const reply = buildDocumentReply(docType, summary)
      const assistantMsg: RxAgentChatMessage = {
        id: uid(),
        role: "assistant",
        text: docs.length === 1
          ? reply.text
          : `I've analyzed ${docs.length} documents. Here's the key extraction from the primary report:\n\n${reply.text}`,
        createdAt: new Date().toISOString(),
        rxOutput: reply.rxOutput,
        feedbackGiven: null,
      }

      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatientId]: [...(prev[selectedPatientId] || []), assistantMsg],
      }))
      setIsTyping(false)
    }, 1200)
  }, [selectedPatientId, summary])

  // ── Handle upload from bottom sheet or file input ──
  const handleUploadNew = useCallback(() => {
    setShowDocBottomSheet(false)
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(() => {
    // In POC, just open the old attach panel for doc type selection
    setShowAttachPanel(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const handleAttachSelect = useCallback((docType: "pathology" | "radiology" | "prescription") => {
    setShowAttachPanel(false)

    const fileNameMap: Record<string, string> = {
      pathology: "Lab_Report_Mar2026.pdf",
      radiology: "X-Ray_Chest_Mar2026.pdf",
      prescription: "Previous_Rx_Mar2026.pdf",
    }
    const pageMap: Record<string, number> = { pathology: 2, radiology: 1, prescription: 1 }

    const userMsg: RxAgentChatMessage = {
      id: uid(),
      role: "user",
      text: "",
      createdAt: new Date().toISOString(),
      attachment: {
        type: "pdf",
        fileName: fileNameMap[docType] ?? "Document.pdf",
        pageCount: pageMap[docType] ?? 1,
      },
    }

    setMessagesByPatient((prev) => ({
      ...prev,
      [selectedPatientId]: [...(prev[selectedPatientId] || []), userMsg],
    }))
    setIsTyping(true)

    setTimeout(() => {
      const reply = buildDocumentReply(docType, summary)
      const assistantMsg: RxAgentChatMessage = {
        id: uid(),
        role: "assistant",
        text: reply.text,
        createdAt: new Date().toISOString(),
        rxOutput: reply.rxOutput,
        feedbackGiven: null,
        suggestions: reply.suggestions,
      }

      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatientId]: [...(prev[selectedPatientId] || []), assistantMsg],
      }))
      setIsTyping(false)
    }, 1200)
  }, [selectedPatientId, summary])

  // ── Voice transcription → structured RX ──
  const handleVoiceTranscription = useCallback((text: string) => {
    // Show truncated user message
    const truncated = text.length > 60 ? text.slice(0, 57) + "..." : text
    const userMsg: RxAgentChatMessage = {
      id: uid(),
      role: "user",
      text: `🎤 ${truncated}`,
      createdAt: new Date().toISOString(),
    }

    setMessagesByPatient((prev) => ({
      ...prev,
      [selectedPatientId]: [...(prev[selectedPatientId] || []), userMsg],
    }))
    setIsTyping(true)

    // Parse voice text into structured sections
    setTimeout(() => {
      const structured = parseVoiceToStructuredRx(text)
      const sectionNames = structured.sections.map((s) => s.title).join(", ")
      const assistantMsg: RxAgentChatMessage = {
        id: uid(),
        role: "assistant",
        text: `I've structured your voice input into ${structured.sections.length} sections (${sectionNames}). Review and copy to RxPad.`,
        createdAt: new Date().toISOString(),
        rxOutput: { kind: "voice_structured_rx", data: structured },
        feedbackGiven: null,
      }

      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatientId]: [...(prev[selectedPatientId] || []), assistantMsg],
      }))
      setIsTyping(false)
    }, 800)
  }, [selectedPatientId])

  // ── Chat scroll ref ──
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = chatScrollRef.current
    if (!el) return
    return () => {
    }
  }, [])

  // ── Patient documents for bottom sheet ──
  const patientDocuments = useMemo(
    () => PATIENT_DOCUMENTS[selectedPatientId] || [],
    [selectedPatientId],
  )

  return (
    <div className="relative flex h-full flex-col bg-white" style={{ minWidth: 350, maxWidth: 400 }}>
      {/* Hidden file input for native upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ── Header — white bg for differentiation ── */}
      <AgentHeader
        availableSpecialties={availableSpecialties}
        activeSpecialty={activeSpecialty}
        onSpecialtyChange={setActiveSpecialty}
        onPatientChange={handlePatientChange}
        selectedPatientId={selectedPatientId}
        onClose={onClose}
        doctorViewType={doctorViewType}
        onDoctorViewChange={handleDoctorViewChange}
        showDoctorViewSelector={showDoctorViewSelector}
        intakeMode={intakeMode}
        onIntakeModeChange={handleIntakeModeChange}
      />

      {/* ── Chat area — subtle warm AI-tinted background ── */}
      <div
        className="relative flex flex-1 flex-col overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FAFAFE 0%, #F8F8FC 40%, #FAFAFD 100%)",
        }}
      >
        <div ref={chatScrollRef} className="da-chat-scroll flex flex-1 flex-col overflow-y-auto">

          {/* Floating patient chip — homepage mode, always visible for context switching */}
          {mode === "homepage" && (
            <div className="sticky top-0 z-10 flex justify-center pb-1 pt-3">
              <button
                type="button"
                onClick={() => setIsPatientSheetOpen(true)}
                className={cn("da-floating-chip inline-flex items-center gap-[4px] px-[8px] py-[3px] transition-all", chipShaking && "da-chip-shake")}
                style={{
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(12px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(12px) saturate(1.4)",
                  boxShadow: "0 2px 12px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,255,255,0.5) inset",
                  height: 28,
                  borderRadius: 14,
                }}
              >
                {selectedPatientId === HOMEPAGE_COMMON_ID ? (
                  <>
                    <span className="flex-shrink-0 text-tp-slate-500">
                      <Hospital size={12} variant="Bulk" />
                    </span>
                    <span style={{ color: "#3D3D4E", fontWeight: 600, fontSize: 11, lineHeight: "12px" }}>Clinic overview</span>
                  </>
                ) : (
                  <>
                    <span className="flex-shrink-0 text-tp-slate-500">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <path opacity="0.4" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="currentColor" />
                        <path d="M12 14.5c-5.01 0-9.09 3.36-9.09 7.5 0 .28.22.5.5.5h17.18c.28 0 .5-.22.5-.5 0-4.14-4.08-7.5-9.09-7.5Z" fill="currentColor" />
                      </svg>
                    </span>
                    <span style={{ color: "#3D3D4E", fontWeight: 600, fontSize: 11, lineHeight: "12px" }}>{patient.label}</span>
                    {patient.gender && (
                      <span className="flex-shrink-0 whitespace-nowrap flex items-center" style={{ fontSize: 10, lineHeight: "12px" }}>
                        <span style={{ color: "#B0B7C3" }}>(</span>
                        <span style={{ color: "#B0B7C3" }}>{patient.gender}</span>
                        {patient.age && <><span className="mx-[2px]" style={{ color: "#D0D5DD" }}>|</span><span style={{ color: "#B0B7C3" }}>{patient.age}y</span></>}
                        <span style={{ color: "#B0B7C3" }}>)</span>
                      </span>
                    )}
                  </>
                )}
                <svg width={12} height={12} viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ color: "#667085" }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          {messages.filter(m => m.role === "user").length === 0 && !isTyping ? (
            <WelcomeScreen
              context={
                mode === "homepage"
                  ? (selectedPatientId === HOMEPAGE_COMMON_ID ? "homepage" : "patient_detail")
                  : "rxpad"
              }
              patientName={selectedPatientId !== HOMEPAGE_COMMON_ID ? patient?.label : undefined}
              hasIntake={!!summary.symptomCollectorData}
              summary={selectedPatientId !== HOMEPAGE_COMMON_ID ? summary : undefined}
              onActionClick={(msg) => handleSend(msg)}
            />
          ) : (
            /* Chat messages */
            <ChatThread
              messages={messages}
              isTyping={isTyping}
              typingHint={typingHint}
              onFeedback={handleFeedback}
              onPillTap={handleChatPillTap}
              onCopy={handleCopy}
              onSidebarNav={handleSidebarNav}
              className="flex-1"
              activeSpecialty={activeSpecialty}
              patientDocuments={patientDocuments}
              onPatientSelect={handlePatientSelect}
              onEditMessage={handleEditMessage}
            />
          )}
        </div>
      </div>

      {/* ── Pill Bar + Input — fade-in footer ── */}
      <div className="relative bg-white">
        {/* Fade-in top edge — smoother, taller gradient for gentle transition */}
        <div
          className="pointer-events-none absolute -top-[16px] left-0 right-0"
          style={{
            height: 16,
            background: "linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.4) 40%, transparent)",
          }}
        />
        {/* Hide canned pills when welcome screen is showing (no user messages yet) */}
        {pills.length > 0 && messages.filter(m => m.role === "user").length > 0 && !isTyping && (
          <div className="px-[4px] pt-[8px] pb-[6px]">
            <PillBar
              pills={pills}
              onTap={handlePillTap}
              disabled={false}
            />
          </div>
        )}
        {showAttachPanel && (
          <AttachPanel
            onSelect={handleAttachSelect}
            onClose={() => setShowAttachPanel(false)}
          />
        )}
        <ChatInput
          value={inputValue}
          onChange={(v) => { setInputValue(v); if (isPrefilled) setIsPrefilled(false) }}
          onSend={() => { setIsPrefilled(false); handleSend() }}
          onAttach={handleAttach}
          onVoiceTranscription={handleVoiceTranscription}
          disabled={isTyping}
          isPrefilled={isPrefilled}
          placeholder={selectedPatientId === HOMEPAGE_COMMON_ID ? "Ask about today's clinic..." : `Ask about ${patient.label}...`}
          patientName={selectedPatientId === HOMEPAGE_COMMON_ID ? "Clinic Overview" : (patient.label || undefined)}
          patientMeta={selectedPatientId === HOMEPAGE_COMMON_ID ? undefined : (patient.gender && patient.age ? `${patient.gender}|${patient.age}y` : undefined)}
          patientLocked
          patientLockedMessage={mode === "homepage" ? "Use the floating chip above to switch patient" : `You're inside ${patient.label?.split(" ")[0] || "this patient"}'s ${mode === "rxpad" ? "prescription" : "detail"} page — chat is focused on this patient`}
          onLockedChipClick={handleLockedChipClick}
          isClinicContext={selectedPatientId === HOMEPAGE_COMMON_ID}
        />
      </div>

      {/* ── Document Bottom Sheet — overlays entire panel ── */}
      {showDocBottomSheet && (
        <DocumentBottomSheet
          documents={patientDocuments}
          onSendDocuments={handleSendDocuments}
          onUploadNew={handleUploadNew}
          onClose={() => setShowDocBottomSheet(false)}
          patientFirstName={patient?.label?.split(" ")[0]}
        />
      )}

      {/* Patient/Context selector — bottom sheet overlays entire panel */}
      {mode === "homepage" && (
        <PatientSelector
          selectedId={selectedPatientId}
          onSelect={handlePatientChange}
          showUniversalOption
          universalOptionId={HOMEPAGE_COMMON_ID}
          externalPatients={homepagePatients}
          isOpen={isPatientSheetOpen}
          onClose={() => setIsPatientSheetOpen(false)}
        />
      )}

      {/* Floating chip hover/active + shake animation CSS */}
      <style>{`
        .da-floating-chip { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .da-floating-chip:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 4px 16px rgba(15,23,42,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset !important;
        }
        .da-floating-chip:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 1px 4px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.5) inset !important;
        }
        @keyframes daChipShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-4px); }
          30% { transform: translateX(4px); }
          45% { transform: translateX(-3px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-1px); }
          90% { transform: translateX(1px); }
        }
        .da-chip-shake { animation: daChipShake 0.5s ease-in-out; }
        .da-chat-scroll::-webkit-scrollbar { width: 3px; }
        .da-chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .da-chat-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
        .da-chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.12) transparent; }
      `}</style>
    </div>
  )
}

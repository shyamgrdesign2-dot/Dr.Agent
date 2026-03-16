"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"
import type { RxPadCopyPayload } from "@/components/tp-rxpad/rxpad-sync-context"

import type {
  CannedPill,
  ConsultPhase,
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
import { buildReply, buildDocumentReply } from "./engines/reply-engine"
import { buildHomepageReply } from "./engines/homepage-reply-engine"
import { parseVoiceToStructuredRx } from "./engines/voice-rx-engine"

import { Hospital, User } from "iconsax-reactjs"
import { AgentHeader } from "./shell/AgentHeader"
import { PatientSelector } from "./shell/PatientSelector"
import { ChatThread } from "./chat/ChatThread"
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

function detectSpecialties(summary: SmartSummaryData): SpecialtyTabId[] {
  const tabs: SpecialtyTabId[] = ["gp"]
  if (summary.obstetricData) tabs.push("obstetric")
  if (summary.pediatricsData) tabs.push("pediatrics")
  if (summary.gynecData) tabs.push("gynec")
  if (summary.ophthalData) tabs.push("ophthal")
  return tabs
}

function buildIntroMessages(summary: SmartSummaryData, patient: typeof RX_CONTEXT_OPTIONS[0]): RxAgentChatMessage[] {
  const hasData = summary.specialtyTags.length > 0
  const messages: RxAgentChatMessage[] = []

  if (summary.symptomCollectorData) {
    // Patient filled intake form — show Patient Reported card only
    // Patient Summary available via canned pill (not auto-shown)
    const isNew = summary.symptomCollectorData.isNewPatient
    messages.push({
      id: uid(),
      role: "assistant",
      text: isNew
        ? `${patient.label} — first visit, no prior records. Patient-reported data below.`
        : `${patient.label}'s pre-visit intake is ready.`,
      createdAt: new Date().toISOString(),
      rxOutput: { kind: "symptom_collector", data: summary.symptomCollectorData },
      feedbackGiven: null,
    })
  } else {
    // No patient-reported data — show Patient Summary directly (or text-only for new patients)
    messages.push({
      id: uid(),
      role: "assistant",
      text: hasData
        ? `Here's ${patient.label}'s clinical summary.`
        : `${patient.label} — new patient, first visit. No prior records yet.`,
      createdAt: new Date().toISOString(),
      rxOutput: hasData ? { kind: "patient_summary", data: summary } : undefined,
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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/55 px-2.5 py-1 text-[12px] font-medium text-tp-slate-600 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.5)] backdrop-blur-md">
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
}

const HOMEPAGE_COMMON_ID = "__homepage_common__"

export function DrAgentPanel({ onClose, initialPatientId, mode = "rxpad", activeTab, activeRailItem, homepagePatients }: DrAgentPanelProps) {
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
    } else if (initialPatientId && initialPatientId !== selectedPatientId) {
      setSelectedPatientId(initialPatientId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatientId, mode])

  // ── Per-Patient State (keyed by patient ID) ──
  const [messagesByPatient, setMessagesByPatient] = useState<Record<string, RxAgentChatMessage[]>>({})
  const [phaseByPatient, setPhaseByPatient] = useState<Record<string, ConsultPhase>>({})

  // ── UI State ──
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtyTabId>("gp")
  const [activeTabLens] = useState<RxTabLens>("dr-agent")
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
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

  const pills = useMemo(
    () => (mode === "homepage" && selectedPatientId === HOMEPAGE_COMMON_ID)
      ? generateHomepagePills(activeTab, activeRailItem, null)
      : isPatientContext
        ? generateHomepagePills(activeTab, activeRailItem, summary)
        : generatePills(summary, phase, activeTabLens),
    [mode, activeTab, activeRailItem, isPatientContext, summary, phase, activeTabLens, selectedPatientId],
  )

  // ── Sync patient allergies to context (for RxPad medication alerts) ──
  useEffect(() => {
    setPatientAllergies(summary.allergies ?? [])
  }, [summary, setPatientAllergies])

  // ── Initialize patient messages on first visit ──
  useEffect(() => {
    if (!messagesByPatient[selectedPatientId]) {
      let introMessages: RxAgentChatMessage[]
      if (mode === "homepage" && selectedPatientId === HOMEPAGE_COMMON_ID) {
        // Homepage operational mode — hybrid text + visual welcome card
        const now = new Date()
        const todayStr = `${now.toLocaleDateString("en-US", { weekday: "short" })}, ${now.getDate()} ${now.toLocaleDateString("en-US", { month: "short" })}'${String(now.getFullYear()).slice(2)}`
        introMessages = [{
          id: uid(),
          role: "assistant",
          text: `Welcome back, Doctor! Here's your clinic overview for today.`,
          createdAt: new Date().toISOString(),
          rxOutput: {
            kind: "welcome_card",
            data: {
              greeting: "Good morning, Doctor!",
              date: todayStr,
              contextLine: "Clinic running on time · Next: Priya Rao (follow-up)",
              stats: [
                { label: "Queued", value: 8, color: "#64748B", tab: "queue" },
                { label: "Follow-ups", value: 3, color: "#64748B", tab: "follow-ups" },
                { label: "Finished", value: 0, color: "#64748B", tab: "finished" },
                { label: "Drafts", value: 2, color: "#64748B", tab: "draft" },
                { label: "Cancelled", value: 1, color: "#64748B", tab: "cancelled" },
                { label: "P.Digitisation", value: 2, color: "#64748B", tab: "pending-digitisation" },
              ],
            },
          },
          feedbackGiven: null,
        }]
      } else {
        introMessages = buildIntroMessages(summary, patient)
      }
      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatientId]: introMessages,
      }))
    }
  }, [selectedPatientId, summary, patient, messagesByPatient, mode, initialPatientId])

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
      // Inject pill tap as user message
      handleSend(lastSignal.label)
    }

    // AI trigger from RxPad section chips or sidebar icons → auto-send as user message
    if (lastSignal.type === "ai_trigger" && lastSignal.label) {
      handleSend(lastSignal.label)
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
    setIsTyping(true)

    // Classify intent — check PILL_INTENT_MAP first (exact pill labels bypass NLU)
    const pillOverride = PILL_INTENT_MAP[msg]
    const intent = pillOverride
      ? { category: pillOverride, format: "card" as const, confidence: 1 }
      : classifyIntent(msg)

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

      if (isClinicOverview && (PATIENT_SPECIFIC_INTENTS.has(intent.category) || isPatientSpecificQuery)) {
        // ── GUARDRAIL: Patient-specific query in Clinic Overview → ask to select patient ──
        const patientNames = (homepagePatients || [])
          .filter(p => p.kind === "patient")
          .slice(0, 4)
          .map(p => p.label.split(",")[0].trim())
        reply = {
          text: "This requires a specific patient context. Please select a patient to view their data.",
          rxOutput: {
            kind: "follow_up_question",
            data: {
              question: "Select a patient to view their clinical data:",
              options: patientNames.length > 0 ? patientNames : ["Shyam GR", "Neha Gupta", "Vikram Singh", "Priya Rao"],
              multiSelect: false,
            },
          },
          followUpPills: [
            { id: "grd-kpis", label: "Weekly KPIs", priority: 12, layer: 3, tone: "primary" as const },
          ],
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
      }

      setMessagesByPatient((prev) => ({
        ...prev,
        [selectedPatientId]: [...(prev[selectedPatientId] || []), assistantMsg],
      }))
      setIsTyping(false)
    }, 600 + Math.random() * 400)
  }, [inputValue, selectedPatientId, summary, messagesByPatient, phaseByPatient, mode, homepagePatients])

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

  // ── Patient Change ──
  const handlePatientChange = useCallback((id: string) => {
    setSelectedPatientId(id)
    setInputValue("")
    setIsTyping(false)
  }, [])

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

  // ── Clinic Overview tag auto-hide on scroll ──
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const lastScrollTop = useRef(0)
  const [isTagHidden, setIsTagHidden] = useState(false)
  const tagTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = chatScrollRef.current
    if (!el) return
    const handler = () => {
      const st = el.scrollTop
      const isScrollingUp = st > lastScrollTop.current && st > 30
      lastScrollTop.current = st
      if (isScrollingUp) {
        setIsTagHidden(true)
        // Auto-reveal after 2s of no scroll
        if (tagTimeoutRef.current) clearTimeout(tagTimeoutRef.current)
        tagTimeoutRef.current = setTimeout(() => setIsTagHidden(false), 2000)
      } else {
        setIsTagHidden(false)
        if (tagTimeoutRef.current) clearTimeout(tagTimeoutRef.current)
      }
    }
    el.addEventListener("scroll", handler, { passive: true })
    return () => {
      el.removeEventListener("scroll", handler)
      if (tagTimeoutRef.current) clearTimeout(tagTimeoutRef.current)
    }
  }, [])

  // ── Patient documents for bottom sheet ──
  const patientDocuments = useMemo(
    () => PATIENT_DOCUMENTS[selectedPatientId] || [],
    [selectedPatientId],
  )

  return (
    <div className="relative flex h-full flex-col bg-white">
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
      />

      {/* ── Chat area — subtle warm AI-tinted background ── */}
      <div
        className="relative flex flex-1 flex-col overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FAFAFE 0%, #F8F8FC 40%, #FAFAFD 100%)",
        }}
      >
        <div ref={chatScrollRef} className="flex flex-1 flex-col overflow-y-auto">
          {/* Patient context strip — auto-hides on scroll up, reappears on scroll down or after pause */}
          {mode === "homepage" ? (
            <div
              className={cn(
                "sticky top-0 z-10 flex justify-center px-3 pt-4 pb-1 transition-all duration-300 ease-out",
                isTagHidden && "-translate-y-full opacity-0 pointer-events-none",
              )}
              onClick={() => setIsTagHidden(false)}
            >
              <PatientSelector
                selectedId={selectedPatientId}
                onSelect={handlePatientChange}
                showUniversalOption
                universalOptionId={HOMEPAGE_COMMON_ID}
                externalPatients={homepagePatients}
                className="flex justify-center"
                renderTrigger={(toggle, isOpen) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className="inline-flex items-center gap-[5px] rounded-full border border-tp-slate-200/40 px-3 py-[6px] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] transition-all hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.18)]"
                    style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                  >
                    {/* Context icon — clinic or patient */}
                    <span className="flex-shrink-0 text-tp-slate-500">
                      {selectedPatientId === HOMEPAGE_COMMON_ID ? (
                        <Hospital size={14} variant="Bulk" />
                      ) : (
                        <User size={14} variant="Bulk" />
                      )}
                    </span>
                    <span className="truncate text-[12px] font-medium text-tp-slate-600">
                      {selectedPatientId === HOMEPAGE_COMMON_ID ? "Clinic Overview" : patient?.label}
                    </span>
                    {selectedPatientId !== HOMEPAGE_COMMON_ID && patient?.gender && patient?.age && (
                      <span className="text-[11px] font-normal text-tp-slate-400">
                        · {patient.gender === "M" ? "M" : "F"}, {patient.age}y
                      </span>
                    )}
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 12 12"
                      fill="none"
                      className={cn("flex-shrink-0 text-tp-slate-400 transition-transform duration-150", isOpen && "rotate-180")}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              />
            </div>
          ) : null}

          {/* Chat messages */}
          <ChatThread
            messages={messages}
            isTyping={isTyping}
            onFeedback={handleFeedback}
            onPillTap={handleChatPillTap}
            onCopy={handleCopy}
            onSidebarNav={handleSidebarNav}
            className="flex-1"
          />
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
        {pills.length > 0 && (
          <div className="px-[4px] pt-[8px] pb-[6px]">
            <PillBar
              pills={pills}
              onTap={handlePillTap}
              disabled={isTyping}
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
          onChange={setInputValue}
          onSend={() => handleSend()}
          onAttach={handleAttach}
          onVoiceTranscription={handleVoiceTranscription}
          disabled={isTyping}
          placeholder={selectedPatientId === HOMEPAGE_COMMON_ID ? "Ask about today's clinic..." : `Ask about ${patient.label}...`}
        />
      </div>

      {/* ── Document Bottom Sheet — overlays entire panel ── */}
      {showDocBottomSheet && (
        <DocumentBottomSheet
          documents={patientDocuments}
          onSendDocuments={handleSendDocuments}
          onUploadNew={handleUploadNew}
          onClose={() => setShowDocBottomSheet(false)}
        />
      )}
    </div>
  )
}

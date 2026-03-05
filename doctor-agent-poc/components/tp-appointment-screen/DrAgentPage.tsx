"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import {
  Calendar2,
  CalendarAdd,
  ClipboardClose,
  ClipboardText,
  ClipboardTick,
  Clock,
  DocumentLike,
  DocumentSketch,
  Flash,
  Hospital,
  MessageProgramming,
  Messages2,
  Notification,
  Profile2User,
  Timer,
  ReceiptText,
  SearchNormal1,
  Shop,
  TickCircle,
  Video,
} from "iconsax-reactjs"
import { Check, ChevronDown, ListFilter, Mic, MoreVertical, Plus, Search, SendHorizontal, ShieldCheck, Star, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { TPButton as Button, TPSplitButton } from "@/components/tp-ui/button-system"
import { TPSecondaryNavPanel, type TPSecondaryNavItem, TPTag } from "@/components/tp-ui"
import { AppointmentBanner } from "@/components/appointments/AppointmentBanner"
import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import {
  type AgentChatMessage,
  type AgentDynamicOutput,
  buildAgentMockReply,
  buildAgentWelcomeMessage,
  createAgentMessage,
  deriveAgentPromptSuggestions,
} from "@/components/doctor-agent/mock-agent"
import { DateRangePicker, type DatePresetId } from "@/components/ui/date-range-picker"

const REF_LOGO = "/assets/b38df11ad80d11b9c1d530142443a18c2f53d406.png"
const REF_AVATAR = "/assets/52cb18088c5b8a5db6a7711c9900d7d08a1bac42.png"

type AppointmentStatus =
  | "queue"
  | "finished"
  | "cancelled"
  | "draft"
  | "pending-digitisation"

type BadgeTone = "warning" | "success"
type DateRangeKey = "today" | "yesterday" | "past-3-months" | "past-4-months"

interface AppointmentTab {
  id: AppointmentStatus
  label: string
  count: number
  icon: React.ComponentType<any>
}

interface AppointmentRow {
  id: string
  serial: number
  name: string
  gender: "M" | "F"
  age: number
  contact: string
  visitType: string
  visitBadge?: {
    text: string
    tone: BadgeTone
  }
  contactBadge?: string
  slotTime: string
  slotDate: string
  hasVideo: boolean
  status: AppointmentStatus
  dateKey: DateRangeKey
  starred?: boolean
}

interface AgentContextOption {
  id: string
  label: string
  meta: string
  kind: "system" | "patient"
  isToday?: boolean
}

const navItems: TPSecondaryNavItem[] = [
  { id: "appointments", label: "Appointments", icon: Calendar2 },
  {
    id: "ask-tatva",
    label: "Ask Tatva",
    icon: Messages2,
    badge: {
      text: "New",
      gradient:
        "linear-gradient(257.32deg, rgb(22, 163, 74) 0%, rgb(68, 207, 119) 47.222%, rgb(22, 163, 74) 94.444%)",
    },
  },
  {
    id: "opd-billing",
    label: "OPD Billing",
    icon: ReceiptText,
    badge: {
      text: "Trial",
      gradient:
        "linear-gradient(257.32deg, rgb(241, 82, 35) 0%, rgb(255, 152, 122) 47.222%, rgb(241, 82, 35) 94.444%)",
    },
  },
  { id: "all-patients", label: "All Patients", icon: Profile2User },
  { id: "follow-ups", label: "Follow-ups", icon: CalendarAdd },
  { id: "pharmacy", label: "Pharmacy", icon: Shop },
  { id: "ipd", label: "IPD", icon: Hospital },
  { id: "daycare", label: "Daycare", icon: DocumentLike },
  { id: "bulk-messages", label: "Bulk Messages", icon: MessageProgramming },
]

const appointmentTabs: AppointmentTab[] = [
  { id: "queue", label: "Queue", count: 20, icon: Clock },
  { id: "finished", label: "Finished", count: 0, icon: ClipboardTick },
  { id: "cancelled", label: "Cancelled", count: 0, icon: ClipboardClose },
  { id: "draft", label: "Draft", count: 0, icon: Timer },
  {
    id: "pending-digitisation",
    label: "Pending Digitisation",
    count: 0,
    icon: DocumentSketch,
  },
]


const queueAppointments: AppointmentRow[] = [
  {
    id: "apt-1",
    serial: 1,
    name: "Shyam GR",
    gender: "M",
    age: 35,
    contact: "+91-9812734567",
    visitType: "Follow-up",
    visitBadge: { text: "Unfulfilled", tone: "warning" },
    slotTime: "10:30 am",
    slotDate: "9th Oct 2024",
    hasVideo: true,
    status: "queue",
    dateKey: "today",
  },
  {
    id: "apt-2",
    serial: 2,
    name: "Sita Menon",
    gender: "F",
    age: 30,
    contact: "+91-9988776655",
    contactBadge: "IPD",
    visitType: "New",
    slotTime: "10:35 am",
    slotDate: "8th Oct 2024",
    hasVideo: true,
    status: "queue",
    dateKey: "yesterday",
    starred: true,
  },
  {
    id: "apt-3",
    serial: 3,
    name: "Vikram Singh",
    gender: "M",
    age: 42,
    contact: "+91-9001234567",
    visitType: "New",
    slotTime: "10:40 am",
    slotDate: "12th Sep 2024",
    hasVideo: true,
    status: "queue",
    dateKey: "past-3-months",
  },
  {
    id: "apt-4",
    serial: 4,
    name: "Nisha Rao",
    gender: "F",
    age: 26,
    contact: "+91-9876543210",
    visitType: "Routine",
    slotTime: "10:45 am",
    slotDate: "18th Aug 2024",
    hasVideo: true,
    status: "queue",
    dateKey: "past-4-months",
  },
  {
    id: "apt-5",
    serial: 5,
    name: "Rahul Verma",
    gender: "M",
    age: 50,
    contact: "+91-9123456789",
    visitType: "Follow-up",
    slotTime: "10:50 am",
    slotDate: "2nd Jul 2024",
    hasVideo: false,
    status: "queue",
    dateKey: "past-4-months",
  },
  {
    id: "apt-6",
    serial: 6,
    name: "Anjali Patel",
    gender: "F",
    age: 28,
    contact: "+91-9988771122",
    visitType: "New",
    slotTime: "10:55 am",
    slotDate: "9th Oct 2024",
    hasVideo: true,
    status: "queue",
    dateKey: "today",
  },
]

const CONTEXT_COMMON_ID = "__common__"
const CONTEXT_NONE_ID = "__none__"

const WORKSPACE_LABELS: Record<string, string> = {
  appointments: "Appointments",
  "opd-billing": "OPD Billing",
  "follow-ups": "Follow-ups",
  "all-patients": "All Patients",
  pharmacy: "Pharmacy",
  ipd: "IPD",
  daycare: "Daycare",
  "bulk-messages": "Bulk Messages",
  "ask-tatva": "Ask Tatva",
}

const WORKSPACE_QUICK_PROMPTS: Record<string, string[]> = {
  appointments: [
    "Show queue priorities for today",
    "Which patients are likely no-show?",
    "Summarize pending draft visits",
    "What should I start with next?",
  ],
  "opd-billing": [
    "Show unbilled consultations",
    "List pending payments by amount",
    "Highlight billing exceptions",
    "Suggest today's billing actions",
  ],
  "follow-ups": [
    "List overdue follow-ups",
    "Who needs callback today?",
    "Summarize follow-up reasons",
    "Draft follow-up message",
  ],
}

const WORKSPACE_TIPS: Record<string, string> = {
  appointments: "Tip: use Common context for operational insights before opening a patient consultation.",
  "opd-billing": "Tip: choose No patient context for billing analytics and workflow summaries.",
  "follow-ups": "Tip: switch to a patient context when you want chart-level suggestions.",
}

const PATIENT_CONTEXT_PROMPTS: Record<string, string[]> = {
  appointments: [
    "Summarize this consultation",
    "Draft diagnosis from symptoms",
    "Add common investigations",
    "Suggest follow-up plan",
  ],
  "follow-ups": [
    "Summarize patient follow-up history",
    "Highlight missed follow-up risks",
    "Draft callback message",
    "Prepare follow-up checklist",
  ],
}

const AGENT_QUICK_PROMPTS = [
  "Summarize this consultation",
  "Draft diagnosis from symptoms",
  "Add common investigations",
  "Suggest follow-up plan",
]

function formatPatientLabel(patient: AppointmentRow) {
  return `${patient.name} (${patient.gender}, ${patient.age}y)`
}

function buildInitialAgentThreads() {
  const seed = queueAppointments.reduce<Record<string, AgentChatMessage[]>>((acc, patient) => {
    acc[patient.id] = [
      createAgentMessage(
        "assistant",
        buildAgentWelcomeMessage(patient),
      ),
    ]
    return acc
  }, {})

  seed[CONTEXT_COMMON_ID] = [
    createAgentMessage(
      "assistant",
      "Common workspace is active. I can help with operational, queue, billing, and follow-up insights across all patients.",
    ),
  ]
  seed[CONTEXT_NONE_ID] = [
    createAgentMessage(
      "assistant",
      "No patient context mode is active. Ask for workflow or analytics prompts not tied to one chart.",
    ),
  ]

  return seed
}

function buildWorkspaceReply(
  prompt: string,
  workspaceId: string,
  contextId: string,
): { reply: string; output: AgentDynamicOutput } {
  const normalized = prompt.toLowerCase()
  const workspaceLabel = WORKSPACE_LABELS[workspaceId] ?? "Clinic Workspace"
  const isNoPatient = contextId === CONTEXT_NONE_ID

  if (normalized.includes("trend") || normalized.includes("analytics") || normalized.includes("chart")) {
    return {
      reply: `${workspaceLabel} trend view is ready. I generated an operational chart with clickable metrics.`,
      output: {
        type: "generic",
        title: `${workspaceLabel} Trends`,
        subtitle: isNoPatient ? "No patient context" : "Common workspace",
        bullets: [
          "Queue pressure dropped by 18% over last 4 intervals",
          "Pending actions are concentrated in 2 workflow buckets",
          "Peak delay appears in post-lunch slot",
        ],
        actions: ["Open Detailed Trend", "Export Snapshot"],
        chart: {
          labels: ["09:00", "11:00", "13:00", "15:00"],
          values: [82, 74, 56, 49],
          suffix: "%",
        },
        clickableItems: ["Queue load", "Pending closures", "Turnaround"],
      },
    }
  }

  if (workspaceId === "opd-billing") {
    return {
      reply: "Billing workspace insights are ready. I highlighted pending collections and exceptions for faster closure.",
      output: {
        type: "generic",
        title: "Billing Snapshot",
        subtitle: isNoPatient ? "No patient context" : "Common workspace",
        bullets: [
          "6 consultations are still unbilled today",
          "2 payments pending over 48 hours",
          "1 invoice flagged for coding mismatch",
        ],
        actions: ["Open Billing Queue", "Draft Reminders"],
        clickableItems: ["Unbilled list", "Aging invoices", "Coding exceptions"],
      },
    }
  }

  if (workspaceId === "follow-ups") {
    return {
      reply: "Follow-up workspace summary generated. I prioritized overdue and high-risk callbacks first.",
      output: {
        type: "generic",
        title: "Follow-up Priorities",
        subtitle: isNoPatient ? "No patient context" : "Common workspace",
        bullets: [
          "4 overdue follow-ups need action today",
          "2 patients reported persistent symptoms",
          "3 follow-up messages can be sent now",
        ],
        actions: ["Open Follow-up List", "Send Batch Message"],
        clickableItems: ["Overdue follow-ups", "High-risk callbacks", "Message queue"],
      },
    }
  }

  return {
    reply: `${workspaceLabel} context understood. I prepared a dynamic operational summary for this page.`,
    output: {
      type: "generic",
      title: `${workspaceLabel} Workspace`,
      subtitle: isNoPatient ? "No patient context" : "Common workspace",
      bullets: [
        "Page-level intent recognized from current workspace",
        "Patient and operational contexts are available",
        "Ready to generate section-wise action suggestions",
      ],
      actions: ["Show Recommendations", "Generate Action Plan"],
      clickableItems: ["Operational overview", "Priority list", "Section suggestions"],
    },
  }
}

// ─── Column sort / filter helpers ────────────────────────────────────────────

const ALL_VISIT_TYPES = ["Follow-up", "New", "Routine"]

function parseSlotTime(t: string): number {
  const [time, mer] = t.split(" ")
  const [h, m] = time.split(":").map(Number)
  const hour = mer === "pm" && h < 12 ? h + 12 : mer === "am" && h === 12 ? 0 : h
  return hour * 60 + m
}

function matchesDateFilter(rowDateKey: DateRangeKey, selected: DatePresetId) {
  if (selected === "today") return rowDateKey === "today"
  if (selected === "yesterday") return rowDateKey === "yesterday"
  if (selected === "past-3-months" || selected === "next-3-months") {
    return rowDateKey === "today" || rowDateKey === "yesterday" || rowDateKey === "past-3-months"
  }
  // past-4-months, next-4-months → show all
  return true
}

const TAB_EMPTY_MESSAGES: Record<AppointmentStatus, string> = {
  "queue":                "There are no patients in the queue right now",
  "finished":             "You haven't finished any consultations yet",
  "cancelled":            "Nothing here — you haven't cancelled any appointments",
  "draft":                "You haven't saved any drafts yet",
  "pending-digitisation": "No pending digitisations right now",
}

const TAB_EMPTY_ICONS: Record<AppointmentStatus, React.ComponentType<any>> = {
  "queue":                Clock,
  "finished":             ClipboardTick,
  "cancelled":            ClipboardClose,
  "draft":                ClipboardText,
  "pending-digitisation": DocumentSketch,
}

export function DrAgentPage() {
  const router = useRouter()
  const [activeRailItem, setActiveRailItem] = useState(navItems[0].id)
  const [activeTab, setActiveTab] = useState<AppointmentStatus>("queue")
  const [query, setQuery] = useState("")
  const [tabDateFilters, setTabDateFilters] = useState<Partial<Record<AppointmentStatus, DatePresetId>>>({})
  const dateFilter = tabDateFilters[activeTab] ?? "today"
  function setDateFilter(id: DatePresetId) {
    setTabDateFilters((prev) => ({ ...prev, [activeTab]: id }))
  }
  const tableOverflowRef = useRef<HTMLDivElement | null>(null)
  const [isTableScrolled, setIsTableScrolled] = useState(false)

  useEffect(() => {
    const el = tableOverflowRef.current
    if (!el) return
    const handler = () => setIsTableScrolled(el.scrollLeft > 0)
    el.addEventListener("scroll", handler, { passive: true })
    return () => el.removeEventListener("scroll", handler)
  }, [])

  // ── Column sort + unified filter ─────────────────────────────────────────
  const [slotSort, setSlotSort] = useState<"none" | "asc" | "desc">("none")
  const [slotConsult, setSlotConsult] = useState<"all" | "video" | "in-clinic">("all")
  const [vtFilter, setVtFilter] = useState<string[]>([])

  // Filter panel (portal)
  const filterBtnRef = useRef<HTMLButtonElement | null>(null)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterStyle, setFilterStyle] = useState<React.CSSProperties>({})
  const [filterMounted, setFilterMounted] = useState(false)
  useEffect(() => { setFilterMounted(true) }, [])

  const chatPatients = useMemo(
    () => queueAppointments.filter((row) => row.status === "queue"),
    [],
  )
  const [isAgentWindowOpen, setIsAgentWindowOpen] = useState(false)
  const [selectedChatPatientId, setSelectedChatPatientId] = useState(CONTEXT_COMMON_ID)
  const [chatInput, setChatInput] = useState("")
  const [agentThreads, setAgentThreads] = useState<Record<string, AgentChatMessage[]>>(() =>
    buildInitialAgentThreads(),
  )
  const [pendingReplies, setPendingReplies] = useState<Record<string, number>>({})
  const replyTimersRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      replyTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      replyTimersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (activeRailItem !== "appointments") {
      setSelectedChatPatientId(CONTEXT_COMMON_ID)
      setIsAgentWindowOpen(true)
    }
  }, [activeRailItem])

  const contextOptions = useMemo(
    () => {
      const patientOptions: AgentContextOption[] = chatPatients.map((patient) => {
        let meta = `Appointment on ${patient.slotDate}`
        if (patient.dateKey === "today") {
          meta = "Appointment today"
        } else if (patient.visitType === "Follow-up") {
          meta = "Follow-up patient"
        }

        return {
          id: patient.id,
          label: formatPatientLabel(patient),
          meta,
          kind: "patient",
          isToday: patient.dateKey === "today",
        }
      })

      const baseOptions: AgentContextOption[] = [
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

      return [...baseOptions, ...patientOptions]
    },
    [chatPatients],
  )

  const selectedChatPatient = useMemo(
    () => chatPatients.find((patient) => patient.id === selectedChatPatientId) ?? null,
    [chatPatients, selectedChatPatientId],
  )

  const workspaceLabel = WORKSPACE_LABELS[activeRailItem] ?? "Clinic Workspace"
  const workspaceQuickPrompts = useMemo(() => {
    if (selectedChatPatientId === CONTEXT_COMMON_ID || selectedChatPatientId === CONTEXT_NONE_ID) {
      return WORKSPACE_QUICK_PROMPTS[activeRailItem] ?? AGENT_QUICK_PROMPTS
    }
    return PATIENT_CONTEXT_PROMPTS[activeRailItem] ?? AGENT_QUICK_PROMPTS
  }, [activeRailItem, selectedChatPatientId])
  const workspaceTip = WORKSPACE_TIPS[activeRailItem] ?? "Tip: choose a patient context only when chart-specific guidance is needed."

  const activeChatMessages = useMemo(
    () => agentThreads[selectedChatPatientId] ?? [],
    [agentThreads, selectedChatPatientId],
  )

  function handleFilterBtnClick() {
    if (filterOpen) { setFilterOpen(false); return }
    const rect = filterBtnRef.current!.getBoundingClientRect()
    setFilterStyle({ position: "fixed", top: rect.bottom + 4, right: window.innerWidth - rect.right, zIndex: 9999 })
    setFilterOpen(true)
  }

  const activeFilterCount = vtFilter.length + (slotConsult !== "all" ? 1 : 0)
  const hasActiveFilters = !!(query.trim()) || vtFilter.length > 0 || slotConsult !== "all" || dateFilter !== "today"

  const visibleAppointments = useMemo(() => {
    let rows = queueAppointments.filter((row) => {
      const tabMatch = row.status === activeTab
      const dateMatch = matchesDateFilter(row.dateKey, dateFilter)
      const slotMatch = slotConsult === "all" ? true
        : slotConsult === "video" ? row.hasVideo : !row.hasVideo
      const vtMatch = vtFilter.length === 0 ? true : vtFilter.includes(row.visitType)
      const q = query.trim().toLowerCase()
      if (!tabMatch || !dateMatch || !slotMatch || !vtMatch) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.contact.toLowerCase().includes(q) ||
        row.visitType.toLowerCase().includes(q)
      )
    })
    if (slotSort !== "none") {
      rows = [...rows].sort((a, b) => {
        const d = parseSlotTime(a.slotTime) - parseSlotTime(b.slotTime)
        return slotSort === "asc" ? d : -d
      })
    }
    return rows
  }, [activeTab, dateFilter, query, slotSort, slotConsult, vtFilter])

  // Calculate counts for each tab
  const getTabCount = (tabId: AppointmentStatus) => {
    return queueAppointments.filter((row) => {
      const tabMatch = row.status === tabId
      const dateMatch = matchesDateFilter(row.dateKey, dateFilter)
      const slotMatch = slotConsult === "all" ? true
        : slotConsult === "video" ? row.hasVideo : !row.hasVideo
      const vtMatch = vtFilter.length === 0 ? true : vtFilter.includes(row.visitType)
      const q = query.trim().toLowerCase()
      if (!tabMatch || !dateMatch || !slotMatch || !vtMatch) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.contact.toLowerCase().includes(q) ||
        row.visitType.toLowerCase().includes(q)
      )
    }).length
  }

  function openTypeRx() {
    router.push("/Rxpad")
  }

  function openPatientDetails(row: AppointmentRow, from: "appointments" | "rxpad" = "appointments") {
    const params = new URLSearchParams({
      patientId: row.id,
      name: row.name,
      gender: row.gender,
      age: String(row.age),
      from,
    })
    router.push(`/patient-details?${params.toString()}`)
  }

  function openAgentForPatient(row: AppointmentRow) {
    setSelectedChatPatientId(row.id)
    setIsAgentWindowOpen(true)
  }

  function appendAgentMessage(patientId: string, message: AgentChatMessage) {
    setAgentThreads((prev) => ({
      ...prev,
      [patientId]: [...(prev[patientId] ?? []), message],
    }))
  }

  function sendChatMessage(rawText: string) {
    const text = rawText.trim()
    if (!text) return

    const contextId = selectedChatPatientId
    appendAgentMessage(contextId, createAgentMessage("user", text))
    setChatInput("")
    setPendingReplies((prev) => ({
      ...prev,
      [contextId]: (prev[contextId] ?? 0) + 1,
    }))

    const timeoutId = window.setTimeout(() => {
      const { reply, output } = selectedChatPatient
        ? buildAgentMockReply(text, selectedChatPatient)
        : buildWorkspaceReply(text, activeRailItem, contextId)
      appendAgentMessage(
        contextId,
        createAgentMessage("assistant", reply, output),
      )
      setPendingReplies((prev) => {
        const next = { ...prev }
        const remaining = (next[contextId] ?? 1) - 1
        if (remaining <= 0) {
          delete next[contextId]
        } else {
          next[contextId] = remaining
        }
        return next
      })
      replyTimersRef.current = replyTimersRef.current.filter((timer) => timer !== timeoutId)
    }, 550)

    replyTimersRef.current.push(timeoutId)
  }

  return (
    <div className="min-h-screen bg-tp-slate-100 font-sans text-tp-slate-900">
      <TopHeader />

      <div className="flex h-[calc(100vh-62px)]">
        <aside className="hidden h-full shrink-0 md:block">
          <TPSecondaryNavPanel
            items={navItems}
            activeId={activeRailItem}
            onSelect={setActiveRailItem}
            variant="primary"
            height="100%"
            bottomSpacerPx={96}
            renderIcon={({ item, isActive, iconSize }) => {
              const Icon = item.icon as React.ComponentType<any>
              return (
                <Icon
                  size={iconSize}
                  variant={isActive ? "Bulk" : "Linear"}
                  strokeWidth={isActive ? undefined : 1.5}
                  color={isActive ? "var(--tp-slate-0)" : "var(--tp-slate-700)"}
                />
              )
            }}
          />
        </aside>

        <main className="flex-1 overflow-hidden">
          <div className="flex h-full min-w-0">
            {/* STICKY LAYOUT: section is a flex column — only the table body scrolls */}
            <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
            {/* Mobile nav strip — fixed, no scroll */}
            <div className="shrink-0 px-3 py-3 md:hidden">
              <div className="flex items-center gap-2 overflow-x-auto">
                {navItems.map((item) => {
                  const isActive = item.id === activeRailItem
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveRailItem(item.id)}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "border-tp-blue-500 bg-tp-blue-50 text-tp-blue-700"
                          : "border-tp-slate-200 bg-white text-tp-slate-600",
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Banner — fixed, shrinks to natural height */}
            <div className="shrink-0">
              <AppointmentBanner
                title="Your Appointments"
                actions={
                  <>
                    <Button
                      variant="outline"
                      theme="primary"
                      size="md"
                      surface="dark"
                      className="whitespace-nowrap !bg-[rgba(255,255,255,0.13)] backdrop-blur-sm"
                      leftIcon={<Plus size={20} strokeWidth={1.5} />}
                    >
                      Add Appointment
                    </Button>
                    <Button
                      variant="solid"
                      theme="primary"
                      size="md"
                      surface="dark"
                      className="whitespace-nowrap"
                      leftIcon={<Flash size={24} variant="Linear" strokeWidth={1.5} />}
                    >
                      Start Walk-In
                    </Button>
                  </>
                }
              />
            </div>

            {/* Card — flex-1 so it takes all remaining height; overlaps banner by 60px */}
            {/* Note: no overflow-hidden here — the date picker popover must be able to escape */}
            <div className="relative z-10 -mt-[60px] flex flex-1 flex-col px-3 pb-6 sm:px-4 lg:px-[18px]">
              <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-tp-slate-200 bg-white">

                {/* Tabs row — fixed, does not scroll vertically */}
                <div className="shrink-0 overflow-x-auto border-b border-tp-slate-100 px-2 pt-2 sm:px-4 sm:pt-3 lg:px-[18px] lg:pt-[18px]">
                  <div className="flex min-w-max items-center gap-0">
                    {appointmentTabs.map((tab) => {
                      const isActive = activeTab === tab.id
                      const Icon = tab.icon

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            "group relative flex shrink-0 flex-col gap-2 rounded-t-lg px-3 pb-0 pt-1 transition-colors",
                            // hover: only background changes, text color stays same
                            isActive
                              ? "text-tp-blue-500"
                              : "text-tp-slate-700 hover:bg-tp-slate-100",
                          )}
                          aria-pressed={isActive}
                        >
                          <span className="flex items-center gap-2 text-[14px] font-medium">
                            <Icon
                              size={20}
                              variant={isActive ? "Bulk" : "Linear"}
                              strokeWidth={isActive ? undefined : 1.5}
                              color={isActive ? "var(--tp-blue-500)" : "var(--tp-slate-600)"}
                            />
                            <span className={cn(isActive && "font-semibold")}>
                              {tab.label}
                            </span>
                            <span className={cn(
                              "inline-flex items-center justify-center rounded-full px-[5px] h-[16px] min-w-[16px] text-[10px] font-semibold tabular-nums leading-none",
                              isActive
                                ? "bg-tp-blue-100 text-tp-blue-400"
                                : "bg-tp-slate-100 text-tp-slate-400",
                            )}>
                              {getTabCount(tab.id)}
                            </span>
                          </span>

                          <span
                            className={cn(
                              "h-[3px] w-full translate-y-px rounded-full transition-opacity",
                              isActive
                                ? "bg-tp-blue-500 opacity-100"
                                : "bg-tp-blue-500 opacity-0",
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Search + filter bar — fixed, does not scroll */}
                <div className="shrink-0 px-3 pt-4 pb-3 sm:px-4 lg:px-[18px] lg:pt-5 lg:pb-4">
                  <div className="flex flex-nowrap items-center justify-between gap-3">
                    <label className="relative min-w-[160px] w-full max-w-[420px]">
                      <SearchNormal1
                        size={20}
                        variant="Linear"
                        strokeWidth={1.5}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tp-slate-400"
                      />
                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by patient name / ID / mobile number"
                        className="h-[38px] w-full rounded-[10px] border border-tp-slate-200 bg-white pl-10 pr-3 text-sm text-ellipsis text-tp-slate-700 placeholder:text-tp-slate-400 transition-colors hover:border-tp-slate-300 focus:border-tp-blue-300 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/15"
                      />
                    </label>

                    <div className="flex shrink-0 items-center gap-2">
                      {/* Unified filter button */}
                      <button
                        ref={filterBtnRef}
                        type="button"
                        onClick={handleFilterBtnClick}
                        className={cn(
                          "inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border px-3 text-[13px] font-medium transition-colors whitespace-nowrap",
                          activeFilterCount > 0
                            ? "border-tp-blue-300 bg-tp-blue-50 text-tp-blue-700 hover:bg-tp-blue-100"
                            : "border-tp-slate-200 bg-white text-tp-slate-600 hover:border-tp-slate-300 hover:bg-tp-slate-50",
                        )}
                      >
                        <ListFilter size={15} strokeWidth={2} className="shrink-0 text-tp-slate-600" />
                        <span>Filter</span>
                        {activeFilterCount > 0 && (
                          <span className="rounded-full bg-tp-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>

                      <DateRangePicker
                        value={dateFilter}
                        onChange={(sel) => setDateFilter(sel.presetId)}
                        className="min-w-[80px] max-w-[180px]"
                        hideFuturePresets={activeTab !== "queue"}
                      />
                    </div>
                  </div>
                </div>

                {/* Active filter tags — shown between search bar and table */}
                {(vtFilter.length > 0 || slotConsult !== "all") && (
                  <div className="shrink-0 px-3 pb-3 sm:px-4 lg:px-[18px]">
                    <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-tp-slate-100 bg-tp-slate-50 px-3 py-2">
                      <span className="shrink-0 text-[12px] font-semibold text-tp-slate-500">
                        Filter: {activeFilterCount}
                      </span>
                      <span className="h-4 w-px shrink-0 bg-tp-slate-200" />
                      {slotConsult !== "all" && (
                        <FilterTag
                          prefix="Slot"
                          value={slotConsult === "video" ? "Teleconsultation" : "In-Clinic"}
                          onRemove={() => setSlotConsult("all")}
                        />
                      )}
                      {vtFilter.map((vt) => (
                        <FilterTag
                          key={vt}
                          prefix="Visit Type"
                          value={vt}
                          onRemove={() => setVtFilter((p) => p.filter((v) => v !== vt))}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => { setSlotConsult("all"); setVtFilter([]) }}
                        className="ml-auto shrink-0 text-[12px] font-semibold text-tp-warning-600 underline underline-offset-2 decoration-tp-warning-400 hover:text-tp-warning-700 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}

                {/* Table — flex-1, only this area scrolls */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <div
                    ref={tableOverflowRef}
                    className="flex-1 min-h-0 overflow-auto px-3 pb-4 sm:px-4 lg:px-[18px]"
                  >
                    <div className="min-w-[920px] pt-1">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="rounded-[12px] bg-tp-slate-100">
                            <th className="rounded-l-[12px] px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[40px] max-w-[56px] w-[48px]">
                              #
                            </th>
                            <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[140px] max-w-[220px]">
                              Name
                            </th>
                            <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[140px] max-w-[200px]">
                              Contact
                            </th>
                            <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[110px] max-w-[180px]">
                              Visit Type
                            </th>
                            <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[110px] max-w-[160px]">
                              <button
                                type="button"
                                onClick={() => setSlotSort((s) => s === "none" ? "asc" : s === "asc" ? "desc" : "none")}
                                className={cn(
                                  "inline-flex items-center gap-1.5 -ml-0.5 rounded-[6px] px-0.5 py-0.5 transition-colors hover:bg-tp-slate-200/70",
                                  slotSort !== "none" && "text-tp-blue-600",
                                )}
                              >
                                <span className="uppercase">Slot</span>
                                <ColumnSortIcon dir={slotSort} />
                              </button>
                            </th>
                            <th className={cn(
                              "sticky right-0 z-20 w-px rounded-r-[12px] bg-tp-slate-100 px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 xl:static",
                              isTableScrolled && "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.10)]",
                            )}>
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {visibleAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center">
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                                  {(() => {
                                    const EmptyIcon = TAB_EMPTY_ICONS[activeTab]
                                    return (
                                      <EmptyIcon
                                        size={140}
                                        variant="Bulk"
                                        color="var(--tp-slate-200)"
                                      />
                                    )
                                  })()}
                                  <p className="text-[13px] font-medium text-tp-slate-500">
                                    {hasActiveFilters
                                      ? "No appointments matching your filters."
                                      : TAB_EMPTY_MESSAGES[activeTab]}
                                  </p>
                                  {hasActiveFilters && (
                                    <button
                                      type="button"
                                      onClick={() => { setQuery(""); setSlotConsult("all"); setVtFilter([]); setTabDateFilters({}) }}
                                      className="mt-0.5 text-[12px] font-semibold text-tp-warning-600 underline underline-offset-2 decoration-tp-warning-400 transition-colors hover:text-tp-warning-700"
                                    >
                                      Clear all filters
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            visibleAppointments.map((row, index) => (
                              <tr
                                key={row.id}
                                className="h-16 border-b border-tp-slate-100 last:border-b-0 hover:bg-tp-slate-50/50"
                              >
                                <td className="px-3 py-3 text-sm text-tp-slate-700">
                                  {index + 1}
                                </td>

                                <td className="px-3 py-3 align-middle">
                                  <div className="max-w-[200px] overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => openPatientDetails(row)}
                                      className="cursor-pointer truncate text-left text-sm font-semibold text-tp-blue-500 hover:underline"
                                    >
                                      {row.name}
                                    </button>
                                    <p className="mt-1 truncate text-sm text-tp-slate-700">
                                      {row.gender}, {row.age}y
                                      {row.starred && (
                                        <span className="ml-1 inline-flex">
                                          <Star
                                            size={14}
                                            fill="var(--tp-success-500)"
                                            stroke="var(--tp-success-500)"
                                          />
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </td>

                                <td className="px-3 py-3 align-middle">
                                  <div className="max-w-[180px] overflow-hidden">
                                    <span className="block truncate text-sm text-tp-slate-700">
                                      {row.contact}
                                    </span>
                                    {row.contactBadge && (
                                      <div className="mt-1">
                                        <TPTag
                                          color="violet"
                                          variant="light"
                                          size="sm"
                                        >
                                          {row.contactBadge}
                                        </TPTag>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="px-3 py-3 align-middle text-sm text-tp-slate-700">
                                  <div className="max-w-[160px] overflow-hidden">
                                    <span className="truncate block">{row.visitType}</span>
                                    {row.visitBadge && (
                                      <div className="mt-1">
                                        <TPTag
                                          color={row.visitBadge.tone === "warning" ? "warning" : "success"}
                                          variant={row.visitBadge.tone === "warning" ? "light" : "light"}
                                          size="sm"
                                        >
                                          {row.visitBadge.text}
                                        </TPTag>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="px-3 py-3 align-middle">
                                  <div className="max-w-[150px] overflow-hidden">
                                    <div className="text-sm text-tp-slate-700">
                                      <span className="inline-flex items-center gap-1">
                                        {row.slotTime}
                                        {row.hasVideo && (
                                          <VideoConsultTooltip>
                                            <Video
                                              size={13}
                                              variant="Bulk"
                                              color="var(--tp-violet-500)"
                                            />
                                          </VideoConsultTooltip>
                                        )}
                                      </span>
                                    </div>
                                    <p className="mt-1 truncate text-xs text-tp-slate-600">
                                      {row.slotDate}
                                    </p>
                                  </div>
                                </td>

                                <td className={cn(
                                  "sticky right-0 z-10 w-px bg-white px-3 py-3 align-middle xl:static",
                                  isTableScrolled && "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.10)]",
                                )}>
                                  <div className="flex items-center gap-3 whitespace-nowrap">
                                    <div className="transition-all hover:scale-105 duration-200">
                                      <TPSplitButton
                                        primaryAction={{
                                          label: "TypeRx",
                                          onClick: openTypeRx,
                                        }}
                                        secondaryActions={[
                                          { id: "type-rx", label: "TypeRx", onClick: openTypeRx },
                                        ]}
                                        variant="outline"
                                        theme="primary"
                                        size="md"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      aria-label="AI action"
                                      onClick={() => openAgentForPatient(row)}
                                      className="shrink-0 inline-flex size-[42px] items-center justify-center rounded-[10px] transition-all hover:opacity-80 hover:scale-105"
                                      style={{
                                        background: AI_GRADIENT_SOFT,
                                      }}
                                    >
                                      <AiBrandSparkIcon size={20} />
                                    </button>

                                    <button
                                      type="button"
                                      aria-label="More options"
                                      className="flex shrink-0 items-center justify-center rounded-lg p-1 text-tp-slate-600 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-900"
                                    >
                                      <MoreVertical size={20} strokeWidth={1.5} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
            {isAgentWindowOpen && (
              <aside className="hidden h-full w-[392px] shrink-0 md:block">
                <AgentFloatingWindow
                  contextOptions={contextOptions}
                  selectedPatientId={selectedChatPatientId}
                  selectedPatient={selectedChatPatient}
                  messages={activeChatMessages}
                  pendingReplyCount={pendingReplies[selectedChatPatientId] ?? 0}
                  workspaceLabel={workspaceLabel}
                  workspaceTip={workspaceTip}
                  quickPrompts={workspaceQuickPrompts}
                  inputValue={chatInput}
                  onInputChange={setChatInput}
                  onPatientChange={setSelectedChatPatientId}
                  onSend={sendChatMessage}
                  onPromptClick={sendChatMessage}
                  onClose={() => setIsAgentWindowOpen(false)}
                />
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* Unified filter panel — portal-rendered to escape overflow:hidden */}
      {filterMounted && filterOpen && (
        <CommonFilterPanel
          style={filterStyle}
          panelRef={filterPanelRef}
          triggerRef={filterBtnRef}
          currentConsult={slotConsult}
          currentVtFilter={vtFilter}
          onApply={(consult, vtf) => { setSlotConsult(consult); setVtFilter(vtf); setFilterOpen(false) }}
        />
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AgentFloatingWindow({
  contextOptions,
  selectedPatientId,
  selectedPatient,
  messages,
  pendingReplyCount,
  workspaceLabel,
  workspaceTip,
  quickPrompts,
  inputValue,
  onInputChange,
  onPatientChange,
  onSend,
  onPromptClick,
  onClose,
}: {
  contextOptions: AgentContextOption[]
  selectedPatientId: string
  selectedPatient: AppointmentRow | null
  messages: AgentChatMessage[]
  pendingReplyCount: number
  workspaceLabel: string
  workspaceTip: string
  quickPrompts: string[]
  inputValue: string
  onInputChange: (value: string) => void
  onPatientChange: (patientId: string) => void
  onSend: (message: string) => void
  onPromptClick: (prompt: string) => void
  onClose: () => void
}) {
  const canSend = inputValue.trim().length > 0
  const [isRecording, setIsRecording] = useState(false)
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const voiceTimerRef = useRef<number | null>(null)
  const contextMenuRef = useRef<HTMLDivElement | null>(null)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [contextSearch, setContextSearch] = useState("")
  const [showTip, setShowTip] = useState(true)
  const [tipIndex, setTipIndex] = useState(0)
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>(quickPrompts)

  useEffect(() => {
    const node = messageListRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
  }, [messages, pendingReplyCount, selectedPatientId])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!contextMenuRef.current?.contains(event.target as Node)) {
        setContextMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  useEffect(() => {
    setShowTip(true)
    setTipIndex(0)
  }, [workspaceTip, selectedPatientId, workspaceLabel])

  useEffect(() => {
    setPromptSuggestions(quickPrompts)
  }, [quickPrompts, selectedPatientId, workspaceLabel])

  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current)
      }
    }
  }, [])

  const selectedContextOption =
    contextOptions.find((option) => option.id === selectedPatientId) ?? contextOptions[0]

  const filteredContextOptions = useMemo(() => {
    const q = contextSearch.trim().toLowerCase()
    if (!q) return contextOptions
    return contextOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.meta.toLowerCase().includes(q),
    )
  }, [contextOptions, contextSearch])

  const todayPatientOptions = filteredContextOptions.filter(
    (option) => option.kind === "patient" && option.isToday,
  )
  const otherContextOptions = filteredContextOptions.filter(
    (option) => !(option.kind === "patient" && option.isToday),
  )

  const tipItems = [
    workspaceTip,
    "Tip: ask for trends to view interactive chart cards.",
    "Tip: use voice button for faster prompts.",
  ]

  function handleMicClick() {
    if (isRecording) {
      setIsRecording(false)
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current)
      }
      const voicePrompt = "Voice note: please summarize this context and suggest next best actions."
      onSend(voicePrompt)
      setPromptSuggestions(deriveAgentPromptSuggestions(voicePrompt, quickPrompts))
      return
    }

    setIsRecording(true)
    voiceTimerRef.current = window.setTimeout(() => {
      setIsRecording(false)
      const voicePrompt = "Voice note: please summarize this context and suggest next best actions."
      onSend(voicePrompt)
      setPromptSuggestions(deriveAgentPromptSuggestions(voicePrompt, quickPrompts))
      voiceTimerRef.current = null
    }, 1800)
  }

  function handleManualSend() {
    const text = inputValue.trim()
    if (!text) return
    onSend(text)
    setPromptSuggestions(deriveAgentPromptSuggestions(text, quickPrompts))
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-tp-slate-200 bg-white shadow-[0_24px_48px_-24px_rgba(23,23,37,0.35)]">
      <div className="flex items-center justify-between border-b border-tp-slate-100 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-tp-slate-900">Doctor Agent</p>
            <p className="truncate text-[11px] text-tp-slate-500">{workspaceLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] text-tp-slate-500 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-800"
          aria-label="Close doctor agent"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="relative flex-1">
        <div ref={contextMenuRef} className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2">
          <div className="pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setContextMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/55 px-2.5 py-1 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.5)] backdrop-blur-md"
            >
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-tp-slate-100 text-tp-slate-500">
                <Profile2User size={10} variant="Linear" strokeWidth={2} />
              </span>
              <span className="max-w-[160px] truncate text-[10px] font-medium text-tp-slate-600">
                {selectedContextOption?.label ?? "Select context"}
              </span>
              <ChevronDown size={13} strokeWidth={1.75} className="text-tp-slate-400" />
            </button>

            {contextMenuOpen && (
              <div className="absolute left-1/2 top-[34px] z-20 w-[278px] -translate-x-1/2 overflow-hidden rounded-xl border border-tp-slate-200 bg-white shadow-[0_16px_30px_-12px_rgba(15,23,42,0.25)]">
                <div className="border-b border-tp-slate-100 p-2">
                  <input
                    value={contextSearch}
                    onChange={(event) => setContextSearch(event.target.value)}
                    placeholder="Search patient or context"
                    className="h-8 w-full rounded-[8px] border border-tp-slate-200 bg-tp-slate-50 px-2.5 text-[11px] text-tp-slate-700 outline-none focus:border-tp-blue-300"
                  />
                </div>
                <div className="max-h-[250px] overflow-y-auto p-1.5">
                  {todayPatientOptions.length > 0 && (
                    <>
                      <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-tp-slate-400">
                        Today&apos;s Appointments
                      </p>
                      {todayPatientOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            onPatientChange(option.id)
                            setContextMenuOpen(false)
                          }}
                          className={cn(
                            "mb-1 w-full rounded-[8px] px-2 py-2 text-left transition-colors",
                            option.id === selectedPatientId ? "bg-tp-blue-50" : "hover:bg-tp-slate-50",
                          )}
                        >
                          <p className="truncate text-[11px] font-semibold text-tp-slate-700">{option.label}</p>
                          <p className="text-[10px] text-tp-slate-500">{option.meta}</p>
                        </button>
                      ))}
                    </>
                  )}

                  {otherContextOptions.length > 0 && (
                    <>
                      <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-tp-slate-400">
                        Other Contexts
                      </p>
                      {otherContextOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            onPatientChange(option.id)
                            setContextMenuOpen(false)
                          }}
                          className={cn(
                            "mb-1 w-full rounded-[8px] px-2 py-2 text-left transition-colors",
                            option.id === selectedPatientId ? "bg-tp-blue-50" : "hover:bg-tp-slate-50",
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

        <div ref={messageListRef} className="h-full space-y-3 overflow-y-auto px-3 py-3 pt-12">
          {messages.map((message) => {
            const isUser = message.role === "user"
            return (
              <div key={message.id} className="space-y-1.5">
                <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-[18px]",
                      isUser
                        ? "rounded-br-[8px] bg-tp-blue-500 text-white"
                        : "rounded-bl-[8px] bg-tp-slate-100 text-tp-slate-700",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
                {!isUser && message.output && (
                <AgentDynamicOutputCard
                  title={message.output.title}
                  subtitle={message.output.subtitle}
                  bullets={message.output.bullets}
                  actions={message.output.actions}
                  chart={message.output.chart}
                  clickableItems={message.output.clickableItems}
                />
              )}
              </div>
            )
          })}

          {pendingReplyCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-[8px] bg-tp-slate-100 px-3 py-2">
                  <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.2s]" />
                  <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.1s]" />
                  <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce" />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="w-[88%] rounded-xl border border-tp-violet-100 bg-white p-2.5 shadow-[0_8px_20px_-14px_rgba(103,58,172,0.45)]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
                      <AiBrandSparkIcon size={14} />
                    </span>
                    <p className="text-[11px] font-semibold text-tp-slate-700">Generating dynamic UI output</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-[92%] rounded bg-tp-slate-100" />
                    <div className="h-2 w-[78%] rounded bg-tp-slate-100" />
                    <div className="h-2 w-[66%] rounded bg-tp-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-tp-slate-100 px-3 py-3">
        <div className="mb-2 overflow-x-auto pb-1">
          <div className="inline-flex min-w-max items-center gap-1.5">
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPromptClick(prompt)}
                className="whitespace-nowrap rounded-full border border-tp-violet-200 px-2.5 py-1 text-[11px] font-semibold transition-colors"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(242,77,182,0.08) 0%, rgba(150,72,254,0.08) 50%, rgba(75,74,213,0.08) 100%)",
                  color: "var(--tp-violet-600)",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSend) {
                event.preventDefault()
                handleManualSend()
              }
            }}
            placeholder="Type a prompt for Doctor Agent"
            className="h-10 min-w-0 flex-1 rounded-[10px] border border-tp-slate-200 bg-tp-slate-50 px-3 text-[13px] text-tp-slate-700 outline-none transition-colors hover:border-tp-slate-300 focus:border-tp-blue-300 focus:ring-2 focus:ring-tp-blue-500/15"
          />
          <button
            type="button"
            onClick={handleMicClick}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border transition-colors",
              isRecording
                ? "border-tp-violet-300 bg-tp-violet-100 text-tp-violet-600"
                : "border-tp-slate-200 bg-white text-tp-slate-600 hover:bg-tp-slate-50",
            )}
            aria-label={isRecording ? "Stop recording" : "Record audio prompt"}
          >
            <Mic size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleManualSend}
            disabled={!canSend}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] transition-colors",
              canSend
                ? "bg-tp-blue-500 text-white hover:bg-tp-blue-600"
                : "cursor-not-allowed bg-tp-slate-100 text-tp-slate-400",
            )}
            aria-label="Send prompt"
          >
            <SendHorizontal size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-tp-slate-500">
          <ShieldCheck size={12} className="text-tp-success-600" />
          <span>
            Encrypted. Patient details are stored securely and only accessible to this doctor; review AI suggestions before use.
          </span>
        </div>
        {isRecording && (
          <p className="mt-1 text-[10px] font-medium text-tp-violet-600">
            Recording voice prompt...
          </p>
        )}
        {showTip && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-tp-slate-400">
            <span className="truncate">{tipItems[tipIndex]}</span>
            <button
              type="button"
              onClick={() => setTipIndex((prev) => (prev + 1) % tipItems.length)}
              className="rounded px-1 py-0.5 text-tp-violet-500 hover:bg-tp-violet-50"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setShowTip(false)}
              className="rounded px-1 py-0.5 text-tp-slate-500 hover:bg-tp-slate-100"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentDynamicOutputCard({
  title,
  subtitle,
  bullets,
  actions,
  chart,
  clickableItems,
}: {
  title: string
  subtitle: string
  bullets: string[]
  actions: string[]
  chart?: { labels: string[]; values: number[]; suffix?: string }
  clickableItems?: string[]
}) {
  return (
    <div className="rounded-xl border border-tp-violet-100 bg-white p-2.5 shadow-[0_8px_20px_-14px_rgba(103,58,172,0.45)]">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={14} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-tp-slate-700">{title}</p>
          <p className="truncate text-[10px] text-tp-slate-500">{subtitle}</p>
        </div>
      </div>
      <ul className="mb-2 space-y-1">
        {bullets.map((point) => (
          <li key={point} className="text-[11px] leading-[16px] text-tp-slate-600">
            <span className="mr-1 text-tp-violet-500">•</span>
            {point}
          </li>
        ))}
      </ul>
      {chart && chart.labels.length > 0 && chart.values.length > 0 && (
        <div className="mb-2 rounded-lg border border-tp-slate-100 bg-tp-slate-50 p-2">
          <div className="flex h-16 items-end gap-1.5">
            {chart.values.map((value, index) => (
              <button
                key={`${chart.labels[index] ?? index}`}
                type="button"
                className="group flex flex-1 flex-col items-center justify-end"
              >
                <span
                  className="w-full rounded-t-[4px] bg-tp-violet-400 transition-opacity group-hover:opacity-80"
                  style={{ height: `${Math.max(18, Math.min(64, value))}%` }}
                />
                <span className="mt-1 text-[9px] text-tp-slate-500">{chart.labels[index] ?? `P${index + 1}`}</span>
              </button>
            ))}
          </div>
          <p className="mt-1 text-[9px] text-tp-slate-400">
            Click bars to inspect details {chart.suffix ? `(${chart.suffix})` : ""}
          </p>
        </div>
      )}
      {clickableItems && clickableItems.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {clickableItems.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full border border-tp-slate-200 bg-tp-slate-50 px-2 py-0.5 text-[9px] font-medium text-tp-slate-600 transition-colors hover:bg-tp-slate-100"
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-full border border-tp-violet-200 bg-tp-violet-50 px-2 py-0.5 text-[10px] font-semibold text-tp-violet-600 transition-colors hover:bg-tp-violet-100"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Dynamic sort icon (active direction highlighted in blue) ─────────────────

function ColumnSortIcon({ dir }: { dir: "none" | "asc" | "desc" }) {
  return (
    <span className="inline-flex flex-col items-center gap-[2px]">
      <span className={cn(
        "h-0 w-0 border-b-[4px] border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent transition-colors",
        dir === "asc" ? "border-b-tp-blue-500" : "border-b-tp-slate-600",
      )} />
      <span className={cn(
        "h-0 w-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent transition-colors",
        dir === "desc" ? "border-t-tp-blue-500" : "border-t-tp-slate-600",
      )} />
    </span>
  )
}

// ─── Filter chip tag ──────────────────────────────────────────────────────────

function FilterTag({ prefix, value, onRemove }: { prefix: string; value: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-tp-blue-200 bg-tp-blue-50 px-2.5 py-1 text-[11px]">
      <span className="font-medium text-tp-blue-300">{prefix}:</span>
      <span className="font-semibold text-tp-blue-500">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 text-tp-blue-300 transition-colors hover:bg-tp-blue-100 hover:text-tp-blue-500"
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </span>
  )
}

// ─── Unified filter panel ─────────────────────────────────────────────────────

function CommonFilterPanel({
  style,
  panelRef,
  triggerRef,
  currentConsult,
  currentVtFilter,
  onApply,
}: {
  style: React.CSSProperties
  panelRef: React.Ref<HTMLDivElement>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  currentConsult: "all" | "video" | "in-clinic"
  currentVtFilter: string[]
  onApply: (consult: "all" | "video" | "in-clinic", vtFilter: string[]) => void
}) {
  const [consult, setConsult] = useState(currentConsult)
  const [vtFilter, setVtFilter] = useState<string[]>(currentVtFilter)

  // Stale-closure safe ref so the mousedown handler always sees latest onApply
  const onApplyRef = useRef(onApply)
  useEffect(() => { onApplyRef.current = onApply }, [onApply])

  // Click-outside → apply staged filters (not discard)
  useEffect(() => {
    function handler(e: MouseEvent) {
      const panel = (panelRef as React.RefObject<HTMLDivElement>).current
      if (panel?.contains(e.target as Node)) return
      if (triggerRef?.current?.contains(e.target as Node)) return
      onApplyRef.current(consult, vtFilter)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [consult, vtFilter, triggerRef, panelRef])

  const consultOpts: Array<{ v: "video" | "in-clinic"; label: string }> = [
    { v: "video", label: "Teleconsultation" },
    { v: "in-clinic", label: "In-clinic" },
  ]

  function toggleVtType(t: string) {
    setVtFilter((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  function isVtChecked(t: string) {
    return vtFilter.includes(t)
  }

  function handleClear() {
    setConsult("all")
    setVtFilter([])
  }

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className="w-[236px] overflow-hidden rounded-[12px] border border-tp-slate-200 bg-white shadow-[0_8px_24px_-4px_rgba(23,23,37,0.12)]"
    >
      {/* Slot Type section */}
      <div className="p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Slot Type</p>
        <div className="flex flex-col gap-0.5">
          {consultOpts.map(({ v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => setConsult(v)}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-tp-slate-50"
            >
              <span className={cn(
                "size-4 shrink-0 rounded-full border-2 transition-colors",
                consult === v
                  ? "border-tp-blue-500 bg-tp-blue-500 shadow-[inset_0_0_0_2px_white]"
                  : "border-tp-slate-300",
              )} />
              <span className={cn(
                "text-[13px]",
                consult === v ? "font-medium text-tp-slate-900" : "text-tp-slate-600",
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 h-px bg-tp-slate-100" />

      {/* Visit Types section */}
      <div className="p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Visit Type</p>
        <div className="flex flex-col gap-0.5">
          {ALL_VISIT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleVtType(t)}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-tp-slate-50"
            >
              <span className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors",
                isVtChecked(t) ? "border-tp-blue-500 bg-tp-blue-500" : "border-tp-slate-300",
              )}>
                {isVtChecked(t) && <Check size={10} strokeWidth={3} className="text-white" />}
              </span>
              <span className={cn("text-[13px]", isVtChecked(t) ? "font-medium text-tp-slate-900" : "text-tp-slate-600")}>
                {t}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 h-px bg-tp-slate-100" />

      {/* Footer — Clear (warning orange) + Apply, right-aligned */}
      <div className="flex items-center justify-end gap-3 border-t border-tp-slate-100 p-3 pt-2.5">
        <button
          type="button"
          onClick={handleClear}
          className="text-[12px] font-semibold text-tp-warning-600 underline underline-offset-2 decoration-tp-warning-400 transition-colors hover:text-tp-warning-700"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => onApply(consult, vtFilter)}
          className="rounded-[8px] bg-tp-blue-500 px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-tp-blue-600"
        >
          Apply
        </button>
      </div>
    </div>,
    document.body,
  )
}

// ─── Video Consultation Tooltip ───────────────────────────────────────────────

function VideoConsultTooltip({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function show() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setStyle({
        position: "fixed",
        // Center above the icon, with a small gap
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
      })
    }
    setVisible(true)
  }

  function hide() {
    setVisible(false)
  }

  return (
    <>
      <span ref={triggerRef} onMouseEnter={show} onMouseLeave={hide} className="inline-flex cursor-pointer">
        {children}
      </span>
      {visible && mounted &&
        createPortal(
          <div
            style={style}
            className="w-[208px] overflow-hidden rounded-[12px] border border-tp-slate-200 bg-white shadow-[0_8px_24px_-4px_rgba(23,23,37,0.16)]"
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-tp-slate-100 px-3 py-2.5">
              <span
                className="flex size-[28px] shrink-0 items-center justify-center rounded-[7px]"
                style={{ background: "rgba(138,77,187,0.12)" }}
              >
                <Video size={14} variant="Bulk" color="var(--tp-violet-500)" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-tp-slate-900">Video Consultation</p>
                <p className="text-[11px] text-tp-slate-500">Scheduled call</p>
              </div>
            </div>
            {/* Body */}
            <div className="px-3 py-2.5">
              <p className="mb-2.5 text-[11px] leading-relaxed text-tp-slate-500">
                Patient has requested a video call for this appointment slot.
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="flex-1 rounded-[8px] bg-tp-blue-500 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-tp-blue-600"
                >
                  Join Call
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[8px] border border-tp-slate-200 py-1.5 text-[11px] font-medium text-tp-slate-700 transition-colors hover:bg-tp-slate-50"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

// ─── Hexagonal play-button icon (VideoTutorialIcon) ───────────────────────────

function VideoTutorialIcon({
  size = 24,
  color = "#000000",
}: {
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19.5099 5.85L13.5699 2.42C12.5999 1.86 11.3999 1.86 10.4199 2.42L4.48992 5.85C3.51992 6.41 2.91992 7.45 2.91992 8.58V15.42C2.91992 16.54 3.51992 17.58 4.48992 18.15L10.4299 21.58C11.3999 22.14 12.5999 22.14 13.5799 21.58L19.5199 18.15C20.4899 17.59 21.0899 16.55 21.0899 15.42V8.58C21.0799 7.45 20.4799 6.42 19.5099 5.85ZM14.2499 13.4L13.2099 14L12.1699 14.6C10.8399 15.37 9.74992 14.74 9.74992 13.2V12V10.8C9.74992 9.26 10.8399 8.63 12.1699 9.4L13.2099 10L14.2499 10.6C15.5799 11.37 15.5799 12.63 14.2499 13.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

// ─── Clinic data ──────────────────────────────────────────────────────────────

const DUMMY_CLINICS = [
  { id: "rajeshwar", name: "Rajeshwar Eye Clinic" },
  { id: "city", name: "City Medical Centre" },
  { id: "sunrise", name: "Sunrise Hospital" },
  { id: "apollo", name: "Apollo Clinic, Banjara Hills" },
  { id: "care", name: "Care Diagnostics" },
]

// ─── TopHeader ────────────────────────────────────────────────────────────────

function TopHeader() {
  const [isClinicMenuOpen, setClinicMenuOpen] = useState(false)
  const [activeClinic, setActiveClinic] = useState(DUMMY_CLINICS[0].id)
  const [clinicSearch, setClinicSearch] = useState("")
  const clinicMenuRef = useRef<HTMLDivElement | null>(null)
  const clinicSearchRef = useRef<HTMLInputElement | null>(null)
  const clinicListRef = useRef<HTMLDivElement | null>(null)
  const [clinicListCanScrollDown, setClinicListCanScrollDown] = useState(false)

  function updateClinicScrollState() {
    const el = clinicListRef.current
    if (!el) return
    setClinicListCanScrollDown(el.scrollHeight > el.scrollTop + el.clientHeight + 2)
  }

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!clinicMenuRef.current?.contains(event.target as Node)) {
        setClinicMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  // Focus search input + init scroll indicator when dropdown opens
  useEffect(() => {
    if (isClinicMenuOpen) {
      setClinicSearch("")
      setTimeout(() => {
        clinicSearchRef.current?.focus()
        updateClinicScrollState()
      }, 50)
    }
  }, [isClinicMenuOpen])

  // Re-check scroll indicator when filter changes
  useEffect(() => {
    if (isClinicMenuOpen) {
      requestAnimationFrame(updateClinicScrollState)
    }
  }, [clinicSearch, isClinicMenuOpen])

  const activeClinicName = DUMMY_CLINICS.find((c) => c.id === activeClinic)?.name ?? "Clinic"

  const filteredClinics = DUMMY_CLINICS.filter((c) =>
    c.name.toLowerCase().includes(clinicSearch.toLowerCase()),
  )

  return (
    <header className="flex h-[62px] shrink-0 items-center border-b border-tp-slate-100 bg-tp-slate-0 px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center">
        <img
          src={REF_LOGO}
          alt="TatvaPractice"
          className="h-8 w-auto object-contain"
        />
      </div>

      <div className="flex items-center gap-3.5">
        {/* Tutorial icon — hexagonal play button */}
        <button
          type="button"
          className="flex size-[42px] items-center justify-center rounded-[10px] bg-tp-slate-100 transition-colors hover:bg-tp-slate-200"
          aria-label="Play tutorial"
        >
          <VideoTutorialIcon size={20} color="#BA7DE9" />
        </button>

        <button
          type="button"
          className="relative inline-flex size-[42px] items-center justify-center rounded-[10px] bg-tp-slate-100 text-tp-slate-700 transition-colors hover:bg-tp-slate-200"
          aria-label="Notifications"
        >
          <Notification size={20} variant="Linear" strokeWidth={1.5} />
          <span className="absolute -top-0.5 right-1 size-2.5 rounded-full border-2 border-white bg-red-500" />
        </button>

        <div className="h-[42px] w-px bg-tp-slate-300 opacity-80" />

        {/* Clinic selector with search + scrollable list */}
        <div className="relative hidden sm:block" ref={clinicMenuRef}>
          <button
            type="button"
            onClick={() => setClinicMenuOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-tp-slate-100 px-4 py-2 transition-colors hover:bg-tp-slate-200"
            aria-label="Switch clinic"
            aria-expanded={isClinicMenuOpen}
          >
            <Hospital size={20} variant="Linear" strokeWidth={1.5} color="var(--tp-slate-700)" />
            <span className="max-w-[120px] truncate text-[14.7px] text-tp-slate-700">
              {activeClinicName.length > 18 ? activeClinicName.substring(0, 18) + "…" : activeClinicName}
            </span>
            <ChevronDown
              size={18}
              strokeWidth={1.5}
              className="transition-transform duration-200"
              style={{ transform: isClinicMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {isClinicMenuOpen && (
            <div className="absolute right-0 top-[46px] z-50 w-[240px] overflow-hidden rounded-[12px] border border-tp-slate-200 bg-white shadow-[0_12px_24px_-4px_rgba(23,23,37,0.10)]">
              {/* Search input */}
              <div className="border-b border-tp-slate-100 p-2">
                <div className="relative">
                  <Search
                    size={14}
                    strokeWidth={1.5}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-tp-slate-400"
                  />
                  <input
                    ref={clinicSearchRef}
                    type="text"
                    value={clinicSearch}
                    onChange={(e) => setClinicSearch(e.target.value)}
                    placeholder="Search clinics..."
                    className="h-[32px] w-full rounded-[8px] border border-tp-slate-200 bg-tp-slate-50 pl-7 pr-2 text-[13px] text-tp-slate-700 placeholder:text-tp-slate-400 focus:border-tp-blue-300 focus:outline-none focus:ring-1 focus:ring-tp-blue-200"
                  />
                </div>
              </div>

              {/* Clinic list — scrollable when many items, with scroll indicator */}
              <div className="relative">
                <div
                  ref={clinicListRef}
                  onScroll={updateClinicScrollState}
                  className="max-h-[200px] overflow-y-auto py-1"
                >
                  <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-tp-slate-400">
                    Your Clinics
                  </p>
                  {filteredClinics.length === 0 ? (
                    <p className="px-3 py-3 text-[13px] text-tp-slate-400">No clinics found</p>
                  ) : (
                    filteredClinics.map((clinic) => (
                      <button
                        key={clinic.id}
                        type="button"
                        onClick={() => {
                          setActiveClinic(clinic.id)
                          setClinicMenuOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                          clinic.id === activeClinic
                            ? "bg-tp-blue-50 text-tp-blue-700"
                            : "text-tp-slate-700 hover:bg-tp-slate-50",
                        )}
                      >
                        <Hospital
                          size={16}
                          variant={clinic.id === activeClinic ? "Bulk" : "Linear"}
                          strokeWidth={1.5}
                          color={clinic.id === activeClinic ? "var(--tp-blue-500)" : "var(--tp-slate-500)"}
                        />
                        <span className="flex-1 truncate">{clinic.name}</span>
                        {clinic.id === activeClinic && (
                          <TickCircle size={14} variant="Bold" color="var(--tp-blue-500)" />
                        )}
                      </button>
                    ))
                  )}
                </div>
                {/* Scroll-down indicator — gradient fade with chevron */}
                {clinicListCanScrollDown && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-9 items-end justify-center rounded-b-[12px] bg-gradient-to-t from-white via-white/80 to-transparent pb-1.5">
                    <ChevronDown size={13} strokeWidth={2} className="text-tp-slate-400" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          type="button"
          className="relative inline-flex size-[42px] items-center justify-center rounded-full transition-opacity hover:opacity-80"
          aria-label="Profile"
        >
          <span
            className="inline-flex size-full items-center justify-center rounded-full"
            style={{
              background:
                "linear-gradient(to bottom, #FFDE00, #FD5900) padding-box, linear-gradient(to bottom, #FFDE00, #FD5900) border-box",
            }}
          >
            <span className="inline-flex size-full overflow-hidden rounded-full border border-white">
              <img src={REF_AVATAR} alt="User" className="size-full object-cover" />
            </span>
          </span>
        </button>
      </div>
    </header>
  )
}

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import {
  Calendar2,
  CalendarAdd,
  CalendarRemove,
  ClipboardText,
  DocumentLike,
  Hospital,
  MessageProgramming,
  Messages2,
  Profile2User,
  ReceiptText,
  SearchNormal1,
  Shop,
  TickCircle,
  Ticket,
  Video,
} from "iconsax-reactjs"
import {
  Check,
  ChevronDown,
  ListFilter,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { TPButton as Button, TPIconButton, TPSplitButton } from "@/components/tp-ui/button-system"
import { TPSecondaryNavPanel, type TPSecondaryNavItem, TPTag } from "@/components/tp-ui"
import { AppointmentBanner } from "@/components/tp-ui/appointment-banner"
import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import { DateRangePicker, type DatePresetId } from "@/components/ui/date-range-picker"
import { Setting2 } from "iconsax-reactjs"
import { TutorialPlayIcon } from "@/components/tp-ui/TutorialPlayIcon"

// ─── Constants ─────────────────────────────────────────────────────────────────

const REF_LOGO = "/assets/b38df11ad80d11b9c1d530142443a18c2f53d406.png"
const REF_AVATAR = "/assets/52cb18088c5b8a5db6a7711c9900d7d08a1bac42.png"

// ─── Nav items ─────────────────────────────────────────────────────────────────

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

// ─── Types ──────────────────────────────────────────────────────────────────

type FollowUpStatus = "pending" | "completed" | "missed"
type VisitMode = "video" | "in-clinic"

interface FollowUpRow {
  id: string
  name: string
  gender: "M" | "F"
  age: number
  contact: string
  contactBadge?: string
  lastVisit: string
  lastVisitDate: string
  followUpDate: string
  followUpTime: string
  followUpDateKey: DatePresetId
  status: FollowUpStatus
  visitMode: VisitMode
  condition: string
  starred?: boolean
}

// ─── Mock data ──────────────────────────────────────────────────────────────

const FOLLOW_UP_ROWS: FollowUpRow[] = [
  {
    id: "fu-1",
    name: "Shyam GR",
    gender: "M",
    age: 35,
    contact: "+91-9812734567",
    lastVisit: "Eye Checkup",
    lastVisitDate: "20th Feb 2026",
    followUpDate: "10th Mar 2026",
    followUpTime: "10:30 am",
    followUpDateKey: "next-3-months",
    status: "pending",
    visitMode: "video",
    condition: "Glaucoma",
  },
  {
    id: "fu-2",
    name: "Sita Menon",
    gender: "F",
    age: 30,
    contact: "+91-9988776655",
    contactBadge: "IPD",
    lastVisit: "Post-op Review",
    lastVisitDate: "18th Feb 2026",
    followUpDate: "12th Mar 2026",
    followUpTime: "11:00 am",
    followUpDateKey: "next-3-months",
    status: "pending",
    visitMode: "in-clinic",
    condition: "Cataract Surgery",
    starred: true,
  },
  {
    id: "fu-3",
    name: "Vikram Singh",
    gender: "M",
    age: 42,
    contact: "+91-9001234567",
    lastVisit: "Diabetes Review",
    lastVisitDate: "15th Feb 2026",
    followUpDate: "15th Mar 2026",
    followUpTime: "09:45 am",
    followUpDateKey: "next-3-months",
    status: "pending",
    visitMode: "video",
    condition: "Type 2 Diabetes",
  },
  {
    id: "fu-4",
    name: "Nisha Rao",
    gender: "F",
    age: 26,
    contact: "+91-9876543210",
    lastVisit: "BP Monitoring",
    lastVisitDate: "10th Feb 2026",
    followUpDate: "20th Mar 2026",
    followUpTime: "10:15 am",
    followUpDateKey: "next-3-months",
    status: "pending",
    visitMode: "in-clinic",
    condition: "Hypertension",
  },
  {
    id: "fu-5",
    name: "Rahul Verma",
    gender: "M",
    age: 50,
    contact: "+91-9123456789",
    lastVisit: "Cardiology OPD",
    lastVisitDate: "5th Feb 2026",
    followUpDate: "2nd Apr 2026",
    followUpTime: "02:30 pm",
    followUpDateKey: "next-3-months",
    status: "pending",
    visitMode: "video",
    condition: "Arrhythmia",
  },
  {
    id: "fu-6",
    name: "Anjali Patel",
    gender: "F",
    age: 28,
    contact: "+91-9988771122",
    lastVisit: "Skin Allergy",
    lastVisitDate: "1st Feb 2026",
    followUpDate: "10th Apr 2026",
    followUpTime: "11:30 am",
    followUpDateKey: "next-3-months",
    status: "pending",
    visitMode: "in-clinic",
    condition: "Eczema",
  },
  {
    id: "fu-7",
    name: "Deepak Joshi",
    gender: "M",
    age: 61,
    contact: "+91-9345671234",
    lastVisit: "Ortho Consult",
    lastVisitDate: "25th Jan 2026",
    followUpDate: "15th May 2026",
    followUpTime: "03:00 pm",
    followUpDateKey: "next-3-months",
    status: "pending",
    visitMode: "in-clinic",
    condition: "Knee Osteoarthritis",
  },
  {
    id: "fu-8",
    name: "Priya Sharma",
    gender: "F",
    age: 38,
    contact: "+91-9765432198",
    contactBadge: "VIP",
    lastVisit: "Thyroid Panel",
    lastVisitDate: "20th Jan 2026",
    followUpDate: "20th Jun 2026",
    followUpTime: "09:00 am",
    followUpDateKey: "next-4-months",
    status: "pending",
    visitMode: "video",
    condition: "Hypothyroidism",
    starred: true,
  },
  {
    id: "fu-9",
    name: "Arjun Reddy",
    gender: "M",
    age: 45,
    contact: "+91-9654321876",
    lastVisit: "Neuro OPD",
    lastVisitDate: "3rd Mar 2026",
    followUpDate: "3rd Mar 2026",
    followUpTime: "10:00 am",
    followUpDateKey: "today",
    status: "completed",
    visitMode: "video",
    condition: "Migraine",
  },
  {
    id: "fu-10",
    name: "Kavita Nair",
    gender: "F",
    age: 55,
    contact: "+91-9871234560",
    lastVisit: "Gynae OPD",
    lastVisitDate: "28th Feb 2026",
    followUpDate: "5th Mar 2026",
    followUpTime: "11:15 am",
    followUpDateKey: "today",
    status: "missed",
    visitMode: "in-clinic",
    condition: "Menopause Management",
  },
  {
    id: "fu-11",
    name: "Suresh Kumar",
    gender: "M",
    age: 67,
    contact: "+91-9012345678",
    lastVisit: "Pulmonology",
    lastVisitDate: "22nd Feb 2026",
    followUpDate: "4th Mar 2026",
    followUpTime: "02:00 pm",
    followUpDateKey: "today",
    status: "missed",
    visitMode: "in-clinic",
    condition: "COPD",
  },
]

// ─── Status helpers ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  FollowUpStatus,
  { label: string; color: "warning" | "success" | "error"; tagColor: "warning" | "success" | "error" }
> = {
  pending: { label: "Pending", color: "warning", tagColor: "warning" },
  completed: { label: "Completed", color: "success", tagColor: "success" },
  missed: { label: "Missed", color: "error", tagColor: "error" },
}

const ALL_STATUSES: FollowUpStatus[] = ["pending", "completed", "missed"]
const ALL_VISIT_MODES: Array<{ v: VisitMode; label: string }> = [
  { v: "video", label: "Teleconsultation" },
  { v: "in-clinic", label: "In-Clinic" },
]

// ─── Sub-components ─────────────────────────────────────────────────────────

function FilterTag({
  prefix,
  value,
  onRemove,
}: {
  prefix: string
  value: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-tp-blue-200 bg-tp-blue-50 px-2.5 py-1 text-[12px] font-medium text-tp-blue-700">
      <span className="text-tp-blue-400">{prefix}:</span>
      {value}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${prefix} ${value} filter`}
        className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-tp-blue-100"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  )
}

// ─── Filter panel (portal) ──────────────────────────────────────────────────

interface FilterPanelProps {
  style: React.CSSProperties
  panelRef: React.RefObject<HTMLDivElement>
  triggerRef: React.RefObject<HTMLButtonElement>
  initialStatus: FollowUpStatus[]
  initialMode: VisitMode | "all"
  onApply: (status: FollowUpStatus[], mode: VisitMode | "all") => void
}

function FollowUpFilterPanel({
  style,
  panelRef,
  triggerRef,
  initialStatus,
  initialMode,
  onApply,
}: FilterPanelProps) {
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus[]>(initialStatus)
  const [modeFilter, setModeFilter] = useState<VisitMode | "all">(initialMode)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const onApplyRef = useRef(onApply)
  useEffect(() => { onApplyRef.current = onApply }, [onApply])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if ((panelRef as React.RefObject<HTMLDivElement>).current?.contains(e.target as Node)) return
      if (triggerRef?.current?.contains(e.target as Node)) return
      onApplyRef.current(statusFilter, modeFilter)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [statusFilter, modeFilter, triggerRef, panelRef])

  function toggleStatus(s: FollowUpStatus) {
    setStatusFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  function handleClear() {
    setStatusFilter([])
    setModeFilter("all")
  }

  if (!mounted) return null

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className="w-[236px] overflow-hidden rounded-[12px] border border-tp-slate-200 bg-white shadow-[0_8px_24px_-4px_rgba(23,23,37,0.12)]"
    >
      {/* Visit Mode section */}
      <div className="p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Visit Mode</p>
        <div className="flex flex-col gap-0.5">
          {ALL_VISIT_MODES.map(({ v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => setModeFilter(v)}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-tp-slate-50"
            >
              <span className={cn(
                "size-4 shrink-0 rounded-full border-2 transition-colors",
                modeFilter === v
                  ? "border-tp-blue-500 bg-tp-blue-500 shadow-[inset_0_0_0_2px_white]"
                  : "border-tp-slate-300",
              )} />
              <span className={cn(
                "text-[13px]",
                modeFilter === v ? "font-medium text-tp-slate-900" : "text-tp-slate-600",
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 h-px bg-tp-slate-100" />

      {/* Status section */}
      <div className="p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Follow-up Status</p>
        <div className="flex flex-col gap-0.5">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleStatus(s)}
              className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-tp-slate-50"
            >
              <span className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors",
                statusFilter.includes(s) ? "border-tp-blue-500 bg-tp-blue-500" : "border-tp-slate-300",
              )}>
                {statusFilter.includes(s) && <Check size={10} strokeWidth={3} className="text-white" />}
              </span>
              <span className={cn("text-[13px]", statusFilter.includes(s) ? "font-medium text-tp-slate-900" : "text-tp-slate-600")}>
                {STATUS_CONFIG[s].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 h-px bg-tp-slate-100" />

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
          onClick={() => onApply(statusFilter, modeFilter)}
          className="rounded-[8px] bg-tp-blue-500 px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-tp-blue-600"
        >
          Apply
        </button>
      </div>
    </div>,
    document.body,
  )
}

// ─── Video Consultation Tooltip ─────────────────────────────────────────────

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
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
      })
    }
    setVisible(true)
  }

  return (
    <>
      <span ref={triggerRef} onMouseEnter={show} onMouseLeave={() => setVisible(false)} className="inline-flex cursor-pointer">
        {children}
      </span>
      {visible && mounted && createPortal(
        <div
          style={style}
          className="w-[208px] overflow-hidden rounded-[12px] border border-tp-slate-200 bg-white shadow-[0_8px_24px_-4px_rgba(23,23,37,0.16)]"
        >
          <div className="flex items-center gap-2 border-b border-tp-slate-100 px-3 py-2.5">
            <span className="flex size-[28px] shrink-0 items-center justify-center rounded-[7px]" style={{ background: "rgba(138,77,187,0.12)" }}>
              <Video size={14} variant="Bulk" color="var(--tp-violet-500)" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-tp-slate-900">Video Consultation</p>
              <p className="text-[11px] text-tp-slate-500">Scheduled follow-up call</p>
            </div>
          </div>
          <div className="px-3 py-2.5">
            <p className="mb-2.5 text-[11px] leading-relaxed text-tp-slate-500">
              Patient has a video call scheduled for this follow-up slot.
            </p>
            <div className="flex gap-1.5">
              <button type="button" className="flex-1 rounded-[8px] bg-tp-blue-500 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-tp-blue-600">
                Join Call
              </button>
              <button type="button" className="flex-1 rounded-[8px] border border-tp-slate-200 py-1.5 text-[11px] font-medium text-tp-slate-700 transition-colors hover:bg-tp-slate-50">
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

// ─── Clinic data ─────────────────────────────────────────────────────────────

const DUMMY_CLINICS = [
  { id: "rajeshwar", name: "Rajeshwar Eye Clinic" },
  { id: "city", name: "City Medical Centre" },
  { id: "sunrise", name: "Sunrise Hospital" },
  { id: "apollo", name: "Apollo Clinic, Banjara Hills" },
  { id: "care", name: "Care Diagnostics" },
]

// (VideoTutorialIcon removed — replaced by shared TutorialPlayIcon)

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
      if (!clinicMenuRef.current?.contains(event.target as Node)) setClinicMenuOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  useEffect(() => {
    if (isClinicMenuOpen) {
      setClinicSearch("")
      setTimeout(() => {
        clinicSearchRef.current?.focus()
        updateClinicScrollState()
      }, 50)
    }
  }, [isClinicMenuOpen])

  useEffect(() => {
    if (isClinicMenuOpen) requestAnimationFrame(updateClinicScrollState)
  }, [clinicSearch, isClinicMenuOpen])

  const activeClinicName = DUMMY_CLINICS.find((c) => c.id === activeClinic)?.name ?? "Clinic"
  const filteredClinics = DUMMY_CLINICS.filter((c) => c.name.toLowerCase().includes(clinicSearch.toLowerCase()))

  return (
    <header className="flex h-[62px] shrink-0 items-center border-b border-tp-slate-100 bg-tp-slate-0 px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center">
        <img src={REF_LOGO} alt="TatvaPractice" className="h-8 w-auto object-contain" />
      </div>

      <div className="flex items-center gap-3.5">
        <button
          type="button"
          className="flex size-[42px] items-center justify-center"
          aria-label="Play tutorial"
        >
          <TutorialPlayIcon size={28} />
        </button>

        <button
          type="button"
          className="relative inline-flex size-[42px] items-center justify-center rounded-[10px] bg-tp-slate-100 text-tp-slate-700 transition-colors hover:bg-tp-slate-200"
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 right-1 size-2.5 rounded-full border-2 border-white bg-red-500" />
        </button>

        <TPIconButton
          icon={<Setting2 size={20} variant="Linear" strokeWidth={1.5} />}
          theme="neutral"
          size="md"
          aria-label="Settings"
        />

        <div className="h-[42px] w-px bg-tp-slate-300 opacity-80" />

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
              <div className="border-b border-tp-slate-100 p-2">
                <div className="relative">
                  <Search size={14} strokeWidth={1.5} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-tp-slate-400" />
                  <input
                    ref={clinicSearchRef}
                    type="text"
                    value={clinicSearch}
                    onChange={(e) => setClinicSearch(e.target.value)}
                    placeholder="Search clinics…"
                    className="h-8 w-full rounded-[8px] border border-tp-slate-200 bg-white pl-8 pr-3 text-[13px] text-tp-slate-700 placeholder:text-tp-slate-400 focus:border-tp-blue-300 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/15"
                  />
                </div>
              </div>

              <div className="relative">
                <div
                  ref={clinicListRef}
                  onScroll={updateClinicScrollState}
                  className="max-h-[200px] overflow-y-auto py-1"
                >
                  {filteredClinics.length === 0 ? (
                    <p className="px-4 py-3 text-[13px] text-tp-slate-400">No clinics found</p>
                  ) : (
                    filteredClinics.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setActiveClinic(c.id); setClinicMenuOpen(false) }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-tp-slate-50",
                          c.id === activeClinic ? "font-semibold text-tp-blue-600" : "text-tp-slate-700",
                        )}
                      >
                        <Hospital size={16} variant={c.id === activeClinic ? "Bulk" : "Linear"} strokeWidth={1.5} color={c.id === activeClinic ? "var(--tp-blue-500)" : "var(--tp-slate-500)"} />
                        <span className="min-w-0 flex-1 truncate">{c.name}</span>
                        {c.id === activeClinic && (
                          <TickCircle size={16} variant="Bulk" color="var(--tp-blue-500)" />
                        )}
                      </button>
                    ))
                  )}
                </div>
                {clinicListCanScrollDown && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
            </div>
          )}
        </div>

        <button type="button" aria-label="Profile" className="shrink-0">
          <img src={REF_AVATAR} alt="Dr profile" className="size-[38px] rounded-full object-cover ring-2 ring-tp-slate-200" />
        </button>
      </div>
    </header>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function FollowUpsPage() {
  const router = useRouter()
  const [activeRailItem, setActiveRailItem] = useState("follow-ups")
  const [query, setQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<DatePresetId>("next-3-months")
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus[]>([])
  const [modeFilter, setModeFilter] = useState<VisitMode | "all">("all")
  const [dateSort, setDateSort] = useState<"none" | "asc" | "desc">("asc")

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterPanelStyle, setFilterPanelStyle] = useState<React.CSSProperties>({})
  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const filterPanelRef = useRef<HTMLDivElement>(null)
  const tableOverflowRef = useRef<HTMLDivElement>(null)
  const [isTableScrolled, setIsTableScrolled] = useState(false)

  useEffect(() => {
    const el = tableOverflowRef.current
    if (!el) return
    function onScroll() { setIsTableScrolled(el.scrollLeft > 4) }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  function handleFilterBtnClick() {
    if (isFilterOpen) {
      setIsFilterOpen(false)
      return
    }
    const btn = filterBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setFilterPanelStyle({
      position: "fixed",
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
      zIndex: 9999,
    })
    setIsFilterOpen(true)
  }

  function handleFilterApply(status: FollowUpStatus[], mode: VisitMode | "all") {
    setStatusFilter(status)
    setModeFilter(mode)
    setIsFilterOpen(false)
  }

  const activeFilterCount = statusFilter.length + (modeFilter !== "all" ? 1 : 0)
  const hasActiveFilters = activeFilterCount > 0 || query.trim() !== ""

  const visibleRows = useMemo(() => {
    let rows = FOLLOW_UP_ROWS.filter((r) => r.followUpDateKey === dateFilter || dateFilter === "today")

    // For "today" preset show all (or match today + past). For future presets, show upcoming.
    if (dateFilter === "next-3-months") {
      rows = FOLLOW_UP_ROWS.filter((r) =>
        r.followUpDateKey === "next-3-months" || r.followUpDateKey === "today",
      )
    } else if (dateFilter === "next-4-months") {
      rows = FOLLOW_UP_ROWS
    } else if (dateFilter === "today") {
      rows = FOLLOW_UP_ROWS.filter((r) => r.followUpDateKey === "today")
    } else if (dateFilter === "yesterday" || dateFilter === "past-3-months" || dateFilter === "past-4-months") {
      rows = FOLLOW_UP_ROWS.filter((r) => r.status === "missed" || r.status === "completed")
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.contact.includes(q) ||
          r.condition.toLowerCase().includes(q),
      )
    }

    if (statusFilter.length > 0) {
      rows = rows.filter((r) => statusFilter.includes(r.status))
    }

    if (modeFilter !== "all") {
      rows = rows.filter((r) => r.visitMode === modeFilter)
    }

    return rows
  }, [dateFilter, query, statusFilter, modeFilter, dateSort])

  return (
    <div className="min-h-screen bg-tp-slate-100 font-sans text-tp-slate-900">
      <TopHeader />

      <div className="flex h-[calc(100vh-62px)]">
        {/* Sidebar */}
        <aside className="hidden h-full shrink-0 md:block">
          <TPSecondaryNavPanel
            items={navItems}
            activeId={activeRailItem}
            onSelect={(id) => {
              if (id === "appointments") { router.push("/tp-appointment-screen"); return }
              setActiveRailItem(id)
            }}
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
            <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">

              {/* Mobile nav strip */}
              <div className="shrink-0 px-3 py-3 md:hidden">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {navItems.map((item) => {
                    const isActive = item.id === activeRailItem
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === "appointments") { router.push("/tp-appointment-screen"); return }
                          setActiveRailItem(item.id)
                        }}
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

              {/* Banner */}
              <div className="shrink-0">
                <AppointmentBanner
                  title="Follow Ups"
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
                        Create Appointment
                      </Button>
                      <Button
                        variant="solid"
                        theme="primary"
                        size="md"
                        surface="dark"
                        className="whitespace-nowrap"
                        leftIcon={<CalendarAdd size={20} variant="Linear" strokeWidth={1.5} />}
                      >
                        Book Follow-up
                      </Button>
                    </>
                  }
                />
              </div>

              {/* Card overlapping banner */}
              <div className="relative z-10 -mt-[60px] flex flex-1 flex-col px-3 pb-6 sm:px-4 lg:px-[18px]">
                <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-tp-slate-200 bg-white">

                  {/* Page title + summary row */}
                  <div className="shrink-0 border-b border-tp-slate-100 px-4 pt-5 pb-4 sm:px-6 lg:px-[18px]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-[15px] font-bold text-tp-slate-900">Patient Follow-up List</h2>
                        <p className="mt-0.5 text-[13px] text-tp-slate-500">
                          {visibleRows.length} patient{visibleRows.length !== 1 ? "s" : ""} · upcoming &amp; due follow-ups
                        </p>
                      </div>

                      {/* Status summary chips */}
                      <div className="hidden items-center gap-2 sm:flex">
                        {(["pending", "completed", "missed"] as FollowUpStatus[]).map((s) => {
                          const count = FOLLOW_UP_ROWS.filter((r) => r.status === s).length
                          const cfg = STATUS_CONFIG[s]
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                setStatusFilter((prev) =>
                                  prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                                )
                              }
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
                                statusFilter.includes(s)
                                  ? cfg.color === "warning"
                                    ? "border-tp-warning-300 bg-tp-warning-50 text-tp-warning-700"
                                    : cfg.color === "success"
                                      ? "border-tp-success-300 bg-tp-success-50 text-tp-success-700"
                                      : "border-tp-error-200 bg-tp-error-50 text-tp-error-700"
                                  : "border-tp-slate-200 bg-tp-slate-50 text-tp-slate-600 hover:border-tp-slate-300 hover:bg-tp-slate-100",
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  cfg.color === "warning"
                                    ? "bg-tp-warning-500"
                                    : cfg.color === "success"
                                      ? "bg-tp-success-500"
                                      : "bg-tp-error-500",
                                )}
                              />
                              {cfg.label}
                              <span className={cn(
                                "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                                cfg.color === "warning"
                                  ? "bg-tp-warning-100 text-tp-warning-700"
                                  : cfg.color === "success"
                                    ? "bg-tp-success-100 text-tp-success-700"
                                    : "bg-tp-error-100 text-tp-error-700",
                              )}>
                                {count}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Search + filter bar */}
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
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search by patient name / contact / condition"
                          className="h-[38px] w-full rounded-[10px] border border-tp-slate-200 bg-white pl-10 pr-3 text-sm text-ellipsis text-tp-slate-700 placeholder:text-tp-slate-400 transition-colors hover:border-tp-slate-300 focus:border-tp-blue-300 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/15"
                        />
                      </label>

                      <div className="flex shrink-0 items-center gap-2">
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

                        {/* Smart date picker — defaults to future presets */}
                        <DateRangePicker
                          value={dateFilter}
                          onChange={(sel) => setDateFilter(sel.presetId)}
                          className="min-w-[80px] max-w-[200px]"
                          hideFuturePresets={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active filter tags */}
                  {(statusFilter.length > 0 || modeFilter !== "all") && (
                    <div className="shrink-0 px-3 pb-3 sm:px-4 lg:px-[18px]">
                      <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-tp-slate-100 bg-tp-slate-50 px-3 py-2">
                        <span className="shrink-0 text-[12px] font-semibold text-tp-slate-500">
                          Filter: {activeFilterCount}
                        </span>
                        <span className="h-4 w-px shrink-0 bg-tp-slate-200" />
                        {modeFilter !== "all" && (
                          <FilterTag
                            prefix="Mode"
                            value={modeFilter === "video" ? "Teleconsultation" : "In-Clinic"}
                            onRemove={() => setModeFilter("all")}
                          />
                        )}
                        {statusFilter.map((s) => (
                          <FilterTag
                            key={s}
                            prefix="Status"
                            value={STATUS_CONFIG[s].label}
                            onRemove={() => setStatusFilter((p) => p.filter((x) => x !== s))}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => { setModeFilter("all"); setStatusFilter([]) }}
                          className="ml-auto shrink-0 text-[12px] font-semibold text-tp-warning-600 underline underline-offset-2 decoration-tp-warning-400 hover:text-tp-warning-700 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <div
                      ref={tableOverflowRef}
                      className="flex-1 min-h-0 overflow-auto px-3 pb-4 sm:px-4 lg:px-[18px]"
                    >
                      <div className="min-w-[960px] pt-1">
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
                              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[140px] max-w-[200px]">
                                Last Visit / Condition
                              </th>
                              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[130px] max-w-[180px]">
                                <button
                                  type="button"
                                  onClick={() => setDateSort((s) => s === "none" ? "asc" : s === "asc" ? "desc" : "none")}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 -ml-0.5 rounded-[6px] px-0.5 py-0.5 transition-colors hover:bg-tp-slate-200/70",
                                    dateSort !== "none" && "text-tp-blue-600",
                                  )}
                                >
                                  <span className="uppercase">Follow-up Date</span>
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 opacity-60">
                                    {dateSort === "asc" && <path d="M7 2L11 6H3L7 2Z" fill="currentColor" />}
                                    {dateSort === "desc" && <path d="M7 12L3 8H11L7 12Z" fill="currentColor" />}
                                    {dateSort === "none" && (
                                      <>
                                        <path d="M7 2L11 6H3L7 2Z" fill="currentColor" opacity="0.4" />
                                        <path d="M7 12L3 8H11L7 12Z" fill="currentColor" opacity="0.4" />
                                      </>
                                    )}
                                  </svg>
                                </button>
                              </th>
                              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[100px] max-w-[140px]">
                                Status
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
                            {visibleRows.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-16 text-center">
                                  <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                                    <CalendarRemove
                                      size={120}
                                      variant="Bulk"
                                      color="var(--tp-slate-200)"
                                    />
                                    <p className="text-[13px] font-medium text-tp-slate-500">
                                      {hasActiveFilters
                                        ? "No follow-ups match your filters."
                                        : "No follow-ups scheduled for this period."}
                                    </p>
                                    {hasActiveFilters && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuery("")
                                          setStatusFilter([])
                                          setModeFilter("all")
                                          setDateFilter("next-3-months")
                                        }}
                                        className="mt-0.5 text-[12px] font-semibold text-tp-warning-600 underline underline-offset-2 decoration-tp-warning-400 transition-colors hover:text-tp-warning-700"
                                      >
                                        Clear all filters
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              visibleRows.map((row, index) => {
                                const statusCfg = STATUS_CONFIG[row.status]
                                return (
                                  <tr
                                    key={row.id}
                                    className="h-16 border-b border-tp-slate-100 last:border-b-0 hover:bg-tp-slate-50/50"
                                  >
                                    {/* # */}
                                    <td className="px-3 py-3 text-sm text-tp-slate-700">{index + 1}</td>

                                    {/* Name */}
                                    <td className="px-3 py-3 align-middle">
                                      <div className="max-w-[200px] overflow-hidden">
                                        <button
                                          type="button"
                                          className="cursor-pointer truncate text-left text-sm font-semibold text-tp-blue-500 hover:underline"
                                        >
                                          {row.name}
                                        </button>
                                        <p className="mt-1 truncate text-sm text-tp-slate-700">
                                          {row.gender}, {row.age}y
                                          {row.starred && (
                                            <span className="ml-1 inline-flex">
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--tp-success-500)" stroke="var(--tp-success-500)" strokeWidth="1">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                              </svg>
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-3 py-3 align-middle">
                                      <div className="max-w-[180px] overflow-hidden">
                                        <span className="block truncate text-sm text-tp-slate-700">{row.contact}</span>
                                        {row.contactBadge && (
                                          <div className="mt-1">
                                            <TPTag color="violet" variant="light" size="sm">{row.contactBadge}</TPTag>
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Last Visit / Condition */}
                                    <td className="px-3 py-3 align-middle">
                                      <div className="max-w-[190px] overflow-hidden">
                                        <span className="block truncate text-sm text-tp-slate-700">{row.lastVisit}</span>
                                        <p className="mt-1 truncate text-[12px] text-tp-slate-500">{row.condition}</p>
                                      </div>
                                    </td>

                                    {/* Follow-up Date */}
                                    <td className="px-3 py-3 align-middle">
                                      <div className="max-w-[160px] overflow-hidden">
                                        <div className="text-sm text-tp-slate-700">
                                          <span className="inline-flex items-center gap-1">
                                            {row.followUpTime}
                                            {row.visitMode === "video" && (
                                              <VideoConsultTooltip>
                                                <Video size={13} variant="Bulk" color="var(--tp-violet-500)" />
                                              </VideoConsultTooltip>
                                            )}
                                          </span>
                                        </div>
                                        <p className="mt-1 truncate text-xs text-tp-slate-600">{row.followUpDate}</p>
                                      </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-3 py-3 align-middle">
                                      <TPTag
                                        color={statusCfg.tagColor}
                                        variant="light"
                                        size="sm"
                                      >
                                        {statusCfg.label}
                                      </TPTag>
                                    </td>

                                    {/* Action */}
                                    <td className={cn(
                                      "sticky right-0 z-10 w-px bg-white px-3 py-3 align-middle xl:static",
                                      isTableScrolled && "shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.10)]",
                                    )}>
                                      <div className="flex items-center gap-3 whitespace-nowrap">
                                        <div className="transition-all hover:scale-105 duration-200">
                                          <TPSplitButton
                                            primaryAction={{ label: "TypeRx", onClick: () => {} }}
                                            secondaryActions={[
                                              { id: "type-rx", label: "TypeRx", onClick: () => {} },
                                              { id: "reschedule", label: "Reschedule", onClick: () => {} },
                                              { id: "mark-done", label: "Mark as Done", onClick: () => {} },
                                            ]}
                                            variant="outline"
                                            theme="primary"
                                            size="md"
                                          />
                                        </div>

                                        <button
                                          type="button"
                                          aria-label="AI action"
                                          className="shrink-0 inline-flex size-[42px] items-center justify-center rounded-[10px] transition-all hover:opacity-80 hover:scale-105"
                                        >
                                          <AiBrandSparkIcon size={42} withBackground />
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
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Filter panel portal */}
      {isFilterOpen && (
        <FollowUpFilterPanel
          style={filterPanelStyle}
          panelRef={filterPanelRef}
          triggerRef={filterBtnRef}
          initialStatus={statusFilter}
          initialMode={modeFilter}
          onApply={handleFilterApply}
        />
      )}
    </div>
  )
}

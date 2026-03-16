"use client"

import { useState } from "react"
import {
  Users,
  CheckCircle,
  XCircle,
  Pencil,
  Clock,
  Eye,
  Bell,
  Settings,
  Calendar,
  Trash2,
  MoreVertical,
  Video,
} from "lucide-react"

import { TPTopNavBar, defaultNavActions } from "@/components/tp-ui/tp-top-nav-bar"
import { TPAppointmentBanner } from "@/components/tp-ui/tp-appointment-banner"
import { TPSplitButton } from "@/components/tp-ui/button-system"
import { TPClinicalTabs } from "@/components/tp-ui/tp-clinical-tabs"
import { TPSearchFilterBar } from "@/components/tp-ui/tp-search-filter-bar"
import { TPStatusBadge } from "@/components/tp-ui/tp-status-badge"
import { TPClinicalTable } from "@/components/tp-ui/tp-clinical-table"
import { TPPatientInfoHeader } from "@/components/tp-ui/tp-patient-info-header"

// ═════════════════════════════════════════════════════════════
// 1. Top Nav Bar Showcase
// ═════════════════════════════════════════════════════════════

export function TopNavBarShowcase() {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Top Navigation Bar
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        62px height, white bg, 0.5px #F1F1F5 bottom border. Toolbar icons: 42px containers, bg-[#f1f1f5], rounded-[10.5px]. Profile avatar: 42px with gradient border.
      </p>

      <div className="space-y-4">
        {/* Default variant (HomeHeader) */}
        <div className="overflow-hidden rounded-xl border border-[#e2e2ea]">
          <TPTopNavBar
            title="TatvaPractice"
            profile={{ name: "Dr. Ananya Sharma", initials: "AS" }}
          />
        </div>

        {/* Clinical variant with patient info (RxpadHeader) */}
        <div className="overflow-hidden rounded-xl border border-[#e2e2ea]">
          <TPTopNavBar
            variant="clinical"
            patient={{
              name: "Rajesh Kumar",
              age: 34,
              gender: "M",
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// 2. Appointment Banner Showcase
// ═════════════════════════════════════════════════════════════

export function AppointmentBannerShowcase() {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Appointment Banner
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        Gradient hero banner (Blue 600→Violet 500), 16px radius, SVG dot texture at 6% opacity. CTA: white bg, Blue 600 text, 10px radius.
      </p>

      <div className="space-y-4">
        <TPAppointmentBanner
          title="Your Appointments"
          subtitle="Manage today's schedule, track patient queue, and stay on top."
          ctaLabel="New Appointment"
          stats={[
            { label: "In Queue", value: 5 },
            { label: "Finished", value: 3 },
            { label: "Total", value: 16 },
          ]}
        />

        <TPAppointmentBanner
          title="Weekly Schedule"
          subtitle="Plan ahead with your full weekly view."
          ctaLabel="View Calendar"
          variant="schedule"
        />

        <TPAppointmentBanner
          title="Clinic Analytics"
          subtitle="Track performance metrics and patient trends."
          ctaLabel="View Report"
          variant="analytics"
          stats={[
            { label: "This Week", value: 87 },
            { label: "Avg Wait", value: "12min" },
          ]}
        />
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// 3. Clinical Tabs Showcase
// ═════════════════════════════════════════════════════════════

export function ClinicalTabsShowcase() {
  const [activeUnderline, setActiveUnderline] = useState("queue")
  const [activePill, setActivePill] = useState("queue")

  const tabs = [
    {
      id: "queue",
      label: "Queue",
      count: 5,
      iconActive: <Users size={18} color="#4b4ad5" />,
      iconInactive: <Users size={18} color="#454551" className="opacity-60" />,
    },
    {
      id: "finished",
      label: "Finished",
      count: 3,
      iconActive: <CheckCircle size={18} color="#4b4ad5" />,
      iconInactive: <CheckCircle size={18} color="#454551" className="opacity-60" />,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: 2,
      iconActive: <XCircle size={18} color="#4b4ad5" />,
      iconInactive: <XCircle size={18} color="#454551" className="opacity-60" />,
    },
    {
      id: "draft",
      label: "Draft",
      count: 2,
      iconActive: <Pencil size={18} color="#4b4ad5" />,
      iconInactive: <Pencil size={18} color="#454551" className="opacity-60" />,
    },
    {
      id: "pending",
      label: "Pending",
      count: 3,
      iconActive: <Clock size={18} color="#4b4ad5" />,
      iconInactive: <Clock size={18} color="#454551" className="opacity-60" />,
    },
  ]

  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Clinical Tabs
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        Active: 3px bottom bar #4b4ad5. Active text: #4b4ad5, Inter Semi Bold 12px. Inactive: #454551/60. Icon container: bg-[#eef] when active.
      </p>

      <div className="space-y-6">
        <div>
          <p className="mb-2 text-[11px] font-medium text-[#454551]/60">Underline variant</p>
          <TPClinicalTabs
            tabs={tabs}
            activeTab={activeUnderline}
            onTabChange={setActiveUnderline}
            variant="underline"
          />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-[#454551]/60">Pill variant</p>
          <TPClinicalTabs
            tabs={tabs}
            activeTab={activePill}
            onTabChange={setActivePill}
            variant="pill"
          />
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// 4. Search & Filter Bar Showcase
// ═════════════════════════════════════════════════════════════

export function SearchFilterBarShowcase() {
  const [search, setSearch] = useState("")

  const filters = [
    {
      id: "department",
      label: "Department",
      options: [
        { value: "all", label: "All Departments" },
        { value: "General Medicine", label: "General Medicine" },
        { value: "Ophthalmology", label: "Ophthalmology" },
      ],
      selectedValue: "all",
    },
    {
      id: "doctor",
      label: "Doctor",
      options: [
        { value: "all", label: "All Doctors" },
        { value: "Dr. Sharma", label: "Dr. Sharma" },
        { value: "Dr. Mehta", label: "Dr. Mehta" },
      ],
      selectedValue: "all",
    },
  ]

  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Search & Filter Bar
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        Search: white bg, #E2E2EA border, 10px radius, 38px height. Filters: white bg, 10px radius, 38px height. Focus: #4b4ad5 border + ring.
      </p>

      <TPSearchFilterBar
        searchPlaceholder="Search patients, doctors, UHID..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
      />
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// 5. Status Badge Showcase
// ═════════════════════════════════════════════════════════════

export function StatusBadgeShowcase() {
  const allStatuses = [
    "queue", "in-progress", "finished", "cancelled", "draft", "pending",
    "active", "inactive", "scheduled", "completed", "overdue",
  ] as const

  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Status Badges
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        Pill-shaped (9999px radius). SM: 22px/10px, MD: 26px/12px. Leading 6px dot. Color-coded per status.
      </p>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-medium text-[#454551]/60">Medium (default)</p>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((status) => (
              <TPStatusBadge key={status} status={status} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-[#454551]/60">Small</p>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((status) => (
              <TPStatusBadge key={status} status={status} size="sm" />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-[#454551]/60">Without dot</p>
          <div className="flex flex-wrap gap-2">
            {allStatuses.slice(0, 6).map((status) => (
              <TPStatusBadge key={status} status={status} showDot={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// 6. Clinical Table Showcase
// ═════════════════════════════════════════════════════════════

export function ClinicalTableShowcase() {
  const [selected, setSelected] = useState<string[]>([])

  type SampleRow = {
    id: string
    patient: string
    age: number
    time: string
    status: "queue" | "finished" | "cancelled" | "pending"
    doctor: string
  }

  const data: SampleRow[] = [
    { id: "1", patient: "Rajesh Kumar", age: 34, time: "09:00 AM", status: "queue", doctor: "Dr. Sharma" },
    { id: "2", patient: "Priya Patel", age: 28, time: "09:15 AM", status: "queue", doctor: "Dr. Sharma" },
    { id: "3", patient: "Mohammed Ali", age: 52, time: "09:30 AM", status: "finished", doctor: "Dr. Sharma" },
    { id: "4", patient: "Lakshmi Devi", age: 45, time: "10:00 AM", status: "pending", doctor: "Dr. Mehta" },
    { id: "5", patient: "Arjun Singh", age: 19, time: "10:15 AM", status: "cancelled", doctor: "Dr. Desai" },
  ]

  const columns = [
    {
      id: "patient",
      header: "Patient",
      sortable: true,
      sortValue: (row: SampleRow) => row.patient,
      accessor: (row: SampleRow) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef] text-[#4b4ad5] text-[10px] font-semibold">
            {row.patient.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-[#454551]">{row.patient}</p>
            <p className="text-[11px] text-[#a2a2a8]">{row.age}y</p>
          </div>
        </div>
      ),
    },
    {
      id: "time",
      header: "Time",
      width: 100,
      sortable: true,
      sortValue: (row: SampleRow) => row.time,
      accessor: (row: SampleRow) => <span className="text-sm">{row.time}</span>,
    },
    {
      id: "doctor",
      header: "Doctor",
      accessor: (row: SampleRow) => <span className="text-sm">{row.doctor}</span>,
    },
    {
      id: "status",
      header: "Status",
      width: 130,
      accessor: (row: SampleRow) => <TPStatusBadge status={row.status} size="sm" />,
    },
    {
      id: "actions",
      header: "Actions",
      width: 80,
      align: "center" as const,
      sticky: true,
      accessor: (row: SampleRow) => (
        <div className="flex justify-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f1f1f5] text-[#454551] hover:bg-[#e2e2ea]">
            <Eye size={14} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#E11D48] hover:bg-red-50">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Clinical Data Table
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        Header: #F1F1F5 bg, Inter Semi Bold 12px uppercase. Rows: white, hover #F1F1F5, 1px #E2E2EA border. Selected: #EEF. Checkbox: 20px, 6px radius, #4b4ad5.
      </p>

      <TPClinicalTable
        columns={columns}
        data={data}
        rowKey={(row) => row.id}
        selectedRows={selected}
        onRowSelect={setSelected}
        selectable
      />
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// 7. Patient Info Header Showcase
// ═════════════════════════════════════════════════════════════

export function PatientInfoHeaderShowcase() {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Patient Info Header (RxPad)
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        62px height, white bg. Back button: 80px. Patient: Poppins SemiBold 14px. Demographics: Roboto Regular 12px. Toolbar: 42px buttons, rounded-[10.5px].
      </p>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-[#e2e2ea]">
          <TPPatientInfoHeader
            patient={{
              name: "Rajesh Kumar",
              age: 34,
              gender: "Male",
              bloodGroup: "B+",
              uhid: "TP-2024-00142",
              phone: "+91 98765 43210",
            }}
            visitInfo={{
              type: "OPD",
              date: "24 Jun 2025",
              tokenNumber: 3,
            }}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e2e2ea]">
          <TPPatientInfoHeader
            patient={{
              name: "Priya Patel",
              age: 28,
              gender: "Female",
              bloodGroup: "O+",
              uhid: "TP-2024-00298",
            }}
            visitInfo={{
              type: "Teleconsult",
              date: "24 Jun 2025",
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// 8. Dr. Agent Appointments Table Showcase
// ═════════════════════════════════════════════════════════════

function AiSparkIcon() {
  return (
    <span className="inline-flex size-[28px] items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ds-ai-spark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D565EA" />
            <stop offset="45%" stopColor="#673AAC" />
            <stop offset="100%" stopColor="#1A1994" />
          </linearGradient>
        </defs>
        <path d="M18.0841 11.612C18.4509 11.6649 18.4509 12.3351 18.0841 12.388C14.1035 12.9624 12.9624 14.1035 12.388 18.0841C12.3351 18.4509 11.6649 18.4509 11.612 18.0841C11.0376 14.1035 9.89647 12.9624 5.91594 12.388C5.5491 12.3351 5.5491 11.6649 5.91594 11.612C9.89647 11.0376 11.0376 9.89647 11.612 5.91594C11.6649 5.5491 12.3351 5.5491 12.388 5.91594C12.9624 9.89647 14.1035 11.0376 18.0841 11.612Z" fill="url(#ds-ai-spark-gradient)" />
      </svg>
    </span>
  )
}

function SortIndicators() {
  return (
    <span className="inline-flex flex-col items-center gap-[2px]">
      <span className="h-0 w-0 border-b-[5px] border-l-[4px] border-r-[4px] border-b-tp-slate-700 border-l-transparent border-r-transparent" />
      <span className="h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-tp-slate-500" />
    </span>
  )
}

const SAMPLE_ROWS = [
  { id: "1", serial: 1, name: "Shyam GR", gender: "M", age: 35, contact: "+91-9812734567", visitType: "Follow-up", slotTime: "10:30 am", slotDate: "9th Oct 2024", hasVideo: true },
  { id: "2", serial: 2, name: "Sita Menon", gender: "F", age: 30, contact: "+91-9988776655", visitType: "New", slotTime: "10:35 am", slotDate: "8th Oct 2024", hasVideo: true },
  { id: "3", serial: 3, name: "Vikram Singh", gender: "M", age: 42, contact: "+91-9001234567", visitType: "New", slotTime: "10:40 am", slotDate: "12th Sep 2024", hasVideo: false },
]

export function DrAgentAppointmentsShowcase() {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a2a2a8]">
        Appointments Table (Dr. Agent)
      </h3>
      <p className="mb-4 text-xs text-[#a2a2a8]">
        Inline table with sticky action column. Action cell: TPSplitButton (outline/primary) + AI gradient icon button + MoreVertical icon. Header: 12px uppercase #F1F1F5 bg. Rows: white, hover #F1F1F5. Sticky right column has left shadow.
      </p>

      <div className="overflow-x-auto rounded-[12px] border border-tp-slate-200">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-tp-slate-100">
              <th className="rounded-l-[12px] px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 w-[48px]">#</th>
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[140px]">Name</th>
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[140px]">Contact</th>
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700">
                <span className="inline-flex items-center gap-1.5">Visit Type <SortIndicators /></span>
              </th>
              <th className="px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700">
                <span className="inline-flex items-center gap-1.5">Slot <SortIndicators /></span>
              </th>
              <th className="sticky right-0 z-20 rounded-r-[12px] bg-tp-slate-100 px-3 py-3 text-left text-[12px] font-semibold uppercase text-tp-slate-700 min-w-[280px] shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ROWS.map((row) => (
              <tr key={row.id} className="h-16 border-b border-tp-slate-100 last:border-b-0 hover:bg-tp-slate-50/50">
                <td className="px-3 py-3 text-sm text-tp-slate-700">{row.serial}</td>
                <td className="px-3 py-3 align-middle">
                  <p className="text-sm font-semibold text-tp-blue-500">{row.name}</p>
                  <p className="mt-1 text-sm text-tp-slate-700">{row.gender}, {row.age}y</p>
                </td>
                <td className="px-3 py-3 align-middle text-sm text-tp-slate-700">{row.contact}</td>
                <td className="px-3 py-3 align-middle text-sm text-tp-slate-700">{row.visitType}</td>
                <td className="px-3 py-3 align-middle">
                  <div className="text-sm text-tp-slate-700">
                    <span className="inline-flex items-center gap-1">
                      {row.slotTime}
                      {row.hasVideo && <Video size={13} strokeWidth={1.5} color="var(--tp-blue-500)" />}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-tp-slate-600">{row.slotDate}</p>
                </td>
                <td className="sticky right-0 z-10 bg-white px-0 py-3 align-middle shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <TPSplitButton
                      primaryAction={{ label: "VoiceRx", onClick: () => {} }}
                      secondaryActions={[
                        { id: "tab-rx", label: "TabRx", onClick: () => {} },
                        { id: "type-rx", label: "TypeRx", onClick: () => {} },
                        { id: "snap-rx", label: "SnapRx", onClick: () => {} },
                        { id: "smart-sync", label: "SmartSync", onClick: () => {} },
                      ]}
                      variant="outline"
                      theme="primary"
                      size="md"
                    />
                    <button
                      type="button"
                      aria-label="AI action"
                      className="shrink-0 inline-flex size-[42px] items-center justify-center rounded-[10px] transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, rgba(213,101,234,0.25) 0%, rgba(103,58,172,0.25) 45%, rgba(26,25,148,0.25) 100%)" }}
                    >
                      <AiSparkIcon />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

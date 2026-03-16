"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Users,
  CheckCircle,
  XCircle,
  Pencil,
  Clock,
  Plus,
  Eye,
  Trash2,
  Calendar,
  MessageCircle,
  Receipt,
  CalendarPlus,
  CalendarCheck,
  Store,
  Building2,
  MessageSquareCode,
} from "lucide-react"

import { TPTopNavBar } from "@/components/tp-ui/tp-top-nav-bar"
import { TPAppointmentBanner } from "@/components/tp-ui/tp-appointment-banner"
import { TPClinicalTabs } from "@/components/tp-ui/tp-clinical-tabs"
import { TPSearchFilterBar } from "@/components/tp-ui/tp-search-filter-bar"
import { TPClinicalTable } from "@/components/tp-ui/tp-clinical-table"
import { TPStatusBadge } from "@/components/tp-ui/tp-status-badge"

import type { Appointment, AppointmentStatus, FilterOption } from "./types"
import { APPOINTMENT_TYPE_RULES } from "./types"
import {
  sampleAppointments,
  appointmentTabs,
  appointmentFilters,
} from "./sample-data"

/**
 * AppointmentsPage — Full appointments management page.
 * ─────────────────────────────────────────────────────
 * Layout: HomeHeader (62px) + WHITE sidebar (80px) + content area
 *
 * Figma reference: YourAppointments.tsx
 *   - Background: #F1F1F5
 *   - Sidebar: WHITE bg, 80px wide, blue accents
 *   - Active nav item: bg-[#eef], icon bg-[#4b4ad5] white, left bar 3px
 *   - Labels: Inter Medium 12px, text-[#4b4ad5]
 */

// ─── Sidebar navigation items ──────────────────────────────

interface SidebarNavItem {
  id: string
  label: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
  badge?: { text: string; gradient: string }
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    id: "appointments",
    label: "Appointment",
    icon: <Calendar size={20} color="#4B4AD5" />,
    activeIcon: <Calendar size={20} color="white" />,
  },
  {
    id: "ask-tatva",
    label: "Ask Tatva",
    icon: <MessageCircle size={20} color="#4B4AD5" />,
    activeIcon: <MessageCircle size={20} color="white" />,
  },
  {
    id: "opd-billing",
    label: "OPD Billing",
    icon: <Receipt size={20} color="#4B4AD5" />,
    activeIcon: <Receipt size={20} color="white" />,
    badge: {
      text: "Trial",
      gradient: "linear-gradient(257.32deg, rgb(241, 82, 35) 0%, rgb(255, 152, 122) 47.222%, rgb(241, 82, 35) 94.444%)",
    },
  },
  {
    id: "all-patients",
    label: "All Patients",
    icon: <Users size={20} color="#4B4AD5" />,
    activeIcon: <Users size={20} color="white" />,
  },
  {
    id: "follow-ups",
    label: "Follow-ups",
    icon: <CalendarPlus size={20} color="#4B4AD5" />,
    activeIcon: <CalendarPlus size={20} color="white" />,
  },
  {
    id: "follow-ups-2",
    label: "Follow-ups",
    icon: <CalendarCheck size={20} color="#4B4AD5" />,
    activeIcon: <CalendarCheck size={20} color="white" />,
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    icon: <Store size={20} color="#4B4AD5" />,
    activeIcon: <Store size={20} color="white" />,
  },
  {
    id: "ipd",
    label: "IPD",
    icon: <Building2 size={20} color="#4B4AD5" />,
    activeIcon: <Building2 size={20} color="white" />,
  },
  {
    id: "daycare",
    label: "Daycare",
    icon: <Building2 size={20} color="#4B4AD5" />,
    activeIcon: <Building2 size={20} color="white" />,
  },
  {
    id: "bulk-messages",
    label: "Bulk Messages",
    icon: <MessageSquareCode size={20} color="#4B4AD5" />,
    activeIcon: <MessageSquareCode size={20} color="white" />,
  },
]

// ─── Tab icon configurations ────────────────────────────────

const tabIcons = {
  queue: {
    active: <Users size={18} color="#4b4ad5" />,
    inactive: <Users size={18} color="#454551" className="opacity-60" />,
  },
  finished: {
    active: <CheckCircle size={18} color="#4b4ad5" />,
    inactive: <CheckCircle size={18} color="#454551" className="opacity-60" />,
  },
  cancelled: {
    active: <XCircle size={18} color="#4b4ad5" />,
    inactive: <XCircle size={18} color="#454551" className="opacity-60" />,
  },
  draft: {
    active: <Pencil size={18} color="#4b4ad5" />,
    inactive: <Pencil size={18} color="#454551" className="opacity-60" />,
  },
  pending: {
    active: <Clock size={18} color="#4b4ad5" />,
    inactive: <Clock size={18} color="#454551" className="opacity-60" />,
  },
}

// ─── Table columns ──────────────────────────────────────────

function getTableColumns() {
  return [
    {
      id: "token",
      header: "#",
      width: 50,
      accessor: (row: Appointment) => (
        <span className="text-xs font-mono text-[#a2a2a8]">
          {row.tokenNumber != null ? `#${row.tokenNumber}` : "—"}
        </span>
      ),
    },
    {
      id: "patient",
      header: "Patient",
      minWidth: 200,
      sortable: true,
      sortValue: (row: Appointment) => row.patient.name,
      accessor: (row: Appointment) => (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef] text-[#4b4ad5]">
            <span className="text-[11px] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
              {row.patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-[#4b4ad5] truncate"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {row.patient.name}
            </p>
            <p className="text-[11px] text-[#a2a2a8]">
              {row.patient.age}y, {row.patient.gender}
              {row.patient.uhid && (
                <span className="ml-1 font-mono text-[#a2a2a8]">{row.patient.uhid}</span>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "time",
      header: "Time",
      width: 100,
      sortable: true,
      sortValue: (row: Appointment) => row.scheduledTime,
      accessor: (row: Appointment) => (
        <div>
          <p className="text-sm font-medium text-[#454551]">{row.scheduledTime}</p>
          <p className="text-[11px] text-[#a2a2a8]">{row.duration} min</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      width: 120,
      accessor: (row: Appointment) => {
        const typeRule = APPOINTMENT_TYPE_RULES[row.type]
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${typeRule.bg} ${typeRule.text}`}>
            {row.type}
          </span>
        )
      },
    },
    {
      id: "doctor",
      header: "Doctor",
      minWidth: 160,
      sortable: true,
      sortValue: (row: Appointment) => row.doctor,
      accessor: (row: Appointment) => (
        <div>
          <p className="text-sm text-[#454551]">{row.doctor}</p>
          <p className="text-[11px] text-[#a2a2a8]">{row.department}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: 130,
      accessor: (row: Appointment) => (
        <TPStatusBadge status={row.status} size="sm" />
      ),
    },
    {
      id: "payment",
      header: "Payment",
      width: 100,
      accessor: (row: Appointment) => (
        <div>
          <p className="text-sm font-medium text-[#454551]">
            {row.fee ? `\u20B9${row.fee}` : "—"}
          </p>
          {row.paymentStatus && (
            <p className={`text-[11px] font-medium ${
              row.paymentStatus === "paid" ? "text-[#16a34a]" :
              row.paymentStatus === "pending" ? "text-[#d97706]" :
              "text-[#a2a2a8]"
            }`}>
              {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      width: 100,
      sticky: true,
      align: "center" as const,
      accessor: (row: Appointment) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f1f5] text-[#454551] hover:bg-[#e2e2ea] transition-colors"
            aria-label="View details"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f1f5] text-[#454551] hover:bg-[#e2e2ea] transition-colors"
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#E11D48] hover:bg-red-50 transition-colors"
            aria-label="Cancel"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]
}

// ─── WHITE Sidebar Component (Appointments variant) ─────────

function AppointmentsSidebar({
  activeId,
  onSelect,
}: {
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav
      className="relative flex flex-col shrink-0 bg-white overflow-x-clip"
      style={{ width: 80, height: "100%" }}
    >
      <div
        className="flex-1 flex flex-col gap-[4px] py-[18px] overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {sidebarNavItems.map((item) => {
          const isActive = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="group relative flex w-full shrink-0 flex-col items-center"
              style={{
                backgroundColor: isActive ? "#eef" : "transparent",
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-0 bottom-0 bg-[#4b4ad5]"
                  style={{
                    width: 3,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                />
              )}

              <div className="flex flex-col items-center gap-[6px] py-[12px] px-[6px]">
                {/* Icon container */}
                <span
                  className="relative flex shrink-0 items-center justify-center rounded-[10px] transition-transform group-hover:scale-[1.02]"
                  style={{
                    width: 32,
                    height: 32,
                    padding: 6,
                    backgroundColor: isActive ? "#4b4ad5" : "#eef",
                  }}
                >
                  {isActive ? item.activeIcon : item.icon}
                </span>

                {/* Label */}
                <span
                  className="overflow-hidden text-center font-medium text-[#4b4ad5]"
                  style={{
                    width: 68,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    lineHeight: "18px",
                    letterSpacing: "0.1px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    wordBreak: "break-word" as const,
                  }}
                >
                  {item.label}
                </span>
              </div>

              {/* Active right arrow */}
              {isActive && (
                <span className="absolute" style={{ right: 0, top: "50%", transform: "translateY(-50%)" }}>
                  <svg width={8} height={16} viewBox="0 0 8 16" fill="white" style={{ display: "block" }}>
                    <path d="M8 0L0 8L8 16V0Z" />
                  </svg>
                </span>
              )}

              {/* Badge */}
              {item.badge && (
                <span
                  className="absolute flex items-center justify-center font-medium"
                  style={{
                    top: 8,
                    right: 0,
                    fontSize: 10,
                    lineHeight: "normal",
                    color: "white",
                    backgroundImage: item.badge.gradient,
                    borderTopLeftRadius: 30,
                    borderBottomLeftRadius: 30,
                    paddingLeft: 4,
                    paddingRight: 2,
                    paddingBlock: 4,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.badge.text}
                </span>
              )}

              {/* Hover state */}
              {!isActive && (
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[#eef]/50" />
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute left-0 bottom-0 z-10"
        style={{
          width: 80,
          height: 162,
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, white 100%)",
        }}
      />
    </nav>
  )
}

// ─── Main Component ─────────────────────────────────────────

export function AppointmentsPage() {
  // ── State ──
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "all">("queue")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [activeSidebarItem, setActiveSidebarItem] = useState("appointments")
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    department: "all",
    doctor: "all",
    type: "all",
  })

  // ── Filter chain ──
  const filteredAppointments = useMemo(() => {
    let result = [...sampleAppointments]

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((a) => a.status === activeTab)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.patient.name.toLowerCase().includes(q) ||
          a.doctor.toLowerCase().includes(q) ||
          a.patient.uhid?.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q),
      )
    }

    // Dropdown filters
    if (filterValues.department && filterValues.department !== "all") {
      result = result.filter((a) => a.department === filterValues.department)
    }
    if (filterValues.doctor && filterValues.doctor !== "all") {
      result = result.filter((a) => a.doctor === filterValues.doctor)
    }
    if (filterValues.type && filterValues.type !== "all") {
      result = result.filter((a) => a.type === filterValues.type)
    }

    return result
  }, [activeTab, searchQuery, filterValues])

  // ── Tabs with dynamic counts ──
  const tabs = useMemo(() => {
    return appointmentTabs.map((tab) => ({
      id: tab.id,
      label: tab.label,
      count: sampleAppointments.filter((a) => a.status === tab.id).length,
      iconActive: tabIcons[tab.id as keyof typeof tabIcons]?.active || <Clock size={18} color="#4b4ad5" />,
      iconInactive: tabIcons[tab.id as keyof typeof tabIcons]?.inactive || <Clock size={18} color="#454551" className="opacity-60" />,
    }))
  }, [])

  // ── Filters with current values ──
  const filters: FilterOption[] = useMemo(
    () =>
      appointmentFilters.map((f) => ({
        ...f,
        selectedValue: filterValues[f.id] || "all",
      })),
    [filterValues],
  )

  const handleFilterChange = useCallback((filterId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }))
  }, [])

  // ── Banner stats ──
  const bannerStats = useMemo(() => [
    { label: "In Queue", value: sampleAppointments.filter((a) => a.status === "queue").length },
    { label: "Finished", value: sampleAppointments.filter((a) => a.status === "finished").length },
    { label: "Total Today", value: sampleAppointments.length },
  ], [])

  const columns = useMemo(() => getTableColumns(), [])

  return (
    <div className="flex h-screen w-full flex-col bg-[#f1f1f5]">
      {/* ── Top Nav Bar (HomeHeader variant — 62px) ── */}
      <TPTopNavBar
        variant="default"
        title="TatvaPractice"
        profile={{
          name: "Dr. Ananya Sharma",
          initials: "AS",
        }}
      />

      {/* ── Content with sidebar ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* WHITE Sidebar — 80px */}
        <AppointmentsSidebar
          activeId={activeSidebarItem}
          onSelect={setActiveSidebarItem}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6">
            {/* Banner */}
            <TPAppointmentBanner
              title="Your Appointments"
              subtitle="Manage today's schedule, track patient queue, and stay on top of your clinical workflow."
              ctaLabel="New Appointment"
              onCtaClick={() => {}}
              stats={bannerStats}
              className="mb-5"
            />

            {/* Tabs */}
            <TPClinicalTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => {
                setActiveTab(id as AppointmentStatus | "all")
                setSelectedRows([])
              }}
              variant="underline"
              className="mb-4"
            />

            {/* Search + Filters */}
            <TPSearchFilterBar
              searchPlaceholder="Search patients, doctors, UHID..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFilterChange={handleFilterChange}
              actions={
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#4b4ad5] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#3a39c4] active:scale-[0.98]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Appointment</span>
                </button>
              }
              className="mb-4"
            />

            {/* Data Table */}
            <TPClinicalTable
              columns={columns}
              data={filteredAppointments}
              rowKey={(row) => row.id}
              selectedRows={selectedRows}
              onRowSelect={setSelectedRows}
              selectable
              emptyMessage="No appointments found for the selected filters."
            />

            {/* Footer info */}
            <div className="mt-3 flex items-center justify-between text-xs text-[#a2a2a8]">
              <p>
                Showing {filteredAppointments.length} of {sampleAppointments.length} appointments
              </p>
              {selectedRows.length > 0 && (
                <p className="font-medium text-[#4b4ad5]">
                  {selectedRows.length} selected
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Appointments Module — Type System
 * ══════════════════════════════════
 * Complete type definitions for the appointments domain.
 * Follows the same architecture as components/rx/types.ts.
 */

// ─── Enums & Unions ─────────────────────────────────────────

export type AppointmentStatus =
  | "queue"
  | "in-progress"
  | "finished"
  | "cancelled"
  | "draft"
  | "pending"

export type AppointmentType =
  | "OPD"
  | "Teleconsult"
  | "Follow-up"
  | "Emergency"
  | "Procedure"

export type DepartmentType =
  | "General Medicine"
  | "Ophthalmology"
  | "Gynaecology"
  | "Paediatrics"
  | "Dermatology"
  | "Orthopaedics"
  | "ENT"
  | "Dental"

// ─── Data Models ────────────────────────────────────────────

export interface AppointmentPatient {
  id: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  phone?: string
  uhid?: string
  avatarUrl?: string
  bloodGroup?: string
}

export interface Appointment {
  id: string
  patient: AppointmentPatient
  scheduledTime: string
  scheduledDate: string
  duration: number // minutes
  type: AppointmentType
  status: AppointmentStatus
  doctor: string
  department: DepartmentType
  tokenNumber?: number
  notes?: string
  checkedIn: boolean
  checkedInTime?: string
  /** Amount in INR */
  fee?: number
  /** Payment status */
  paymentStatus?: "paid" | "pending" | "waived"
}

// ─── Filter & Tab Configuration ─────────────────────────────

export interface AppointmentFilter {
  status?: AppointmentStatus[]
  type?: AppointmentType[]
  doctor?: string
  department?: DepartmentType
  dateRange?: { from: string; to: string }
  searchQuery?: string
}

export interface AppointmentTab {
  id: AppointmentStatus | "all"
  label: string
  count: number
  /** Iconsax icon name for active (Bulk) state */
  iconActive: string
  /** Iconsax icon name for inactive (Linear) state */
  iconInactive: string
}

export interface FilterOption {
  id: string
  label: string
  options: Array<{ value: string; label: string }>
  selectedValue?: string
}

// ─── Table Column Configuration ─────────────────────────────

export interface TableSortConfig {
  column: string
  direction: "asc" | "desc"
}

// ─── Display Rules ──────────────────────────────────────────

export interface StatusDisplayRule {
  label: string
  bg: string
  text: string
  dot: string
  border: string
  description: string
}

/**
 * APPOINTMENT_STATUS_RULES
 * Maps each appointment status → display tokens.
 * Pattern mirrors VITAL_DISPLAY_RULES from rx/types.ts.
 */
export const APPOINTMENT_STATUS_RULES: Record<AppointmentStatus, StatusDisplayRule> = {
  queue: {
    label: "Queue",
    bg: "bg-tp-blue-50",
    text: "text-tp-blue-700",
    dot: "bg-tp-blue-500",
    border: "border-tp-blue-200",
    description: "Patient is in the waiting queue",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-tp-violet-50",
    text: "text-tp-violet-700",
    dot: "bg-tp-violet-500",
    border: "border-tp-violet-200",
    description: "Consultation is currently in progress",
  },
  finished: {
    label: "Finished",
    bg: "bg-tp-success-50",
    text: "text-tp-success-700",
    dot: "bg-tp-success-500",
    border: "border-tp-success-200",
    description: "Consultation completed",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-tp-error-50",
    text: "text-tp-error-700",
    dot: "bg-tp-error-500",
    border: "border-tp-error-200",
    description: "Appointment was cancelled",
  },
  draft: {
    label: "Draft",
    bg: "bg-tp-slate-100",
    text: "text-tp-slate-600",
    dot: "bg-tp-slate-400",
    border: "border-tp-slate-200",
    description: "Appointment saved as draft",
  },
  pending: {
    label: "Pending",
    bg: "bg-tp-warning-50",
    text: "text-tp-warning-700",
    dot: "bg-tp-warning-500",
    border: "border-tp-warning-200",
    description: "Waiting for confirmation",
  },
}

/**
 * APPOINTMENT_TYPE_RULES
 * Maps appointment type → display tokens.
 */
export const APPOINTMENT_TYPE_RULES: Record<AppointmentType, { bg: string; text: string }> = {
  OPD: { bg: "bg-tp-blue-50", text: "text-tp-blue-600" },
  Teleconsult: { bg: "bg-tp-violet-50", text: "text-tp-violet-600" },
  "Follow-up": { bg: "bg-tp-amber-50", text: "text-tp-amber-600" },
  Emergency: { bg: "bg-tp-error-50", text: "text-tp-error-600" },
  Procedure: { bg: "bg-tp-success-50", text: "text-tp-success-600" },
}

/**
 * PAYMENT_STATUS_RULES
 */
export const PAYMENT_STATUS_RULES: Record<string, { bg: string; text: string }> = {
  paid: { bg: "bg-tp-success-50", text: "text-tp-success-700" },
  pending: { bg: "bg-tp-warning-50", text: "text-tp-warning-700" },
  waived: { bg: "bg-tp-slate-100", text: "text-tp-slate-600" },
}

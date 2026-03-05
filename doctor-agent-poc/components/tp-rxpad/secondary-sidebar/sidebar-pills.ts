/**
 * Per-tab pill mapping for sidebar content panels.
 * Each sidebar tab gets 2–4 contextual pills at its bottom.
 * Pill taps switch to Dr.Agent tab and inject the pill label as a user message.
 */

export interface SidebarPill {
  id: string
  label: string
  icon: string
  /** Optional: force red styling for safety pills */
  danger?: boolean
}

export const SIDEBAR_TAB_PILLS: Record<string, SidebarPill[]> = {
  pastVisits: [
    { id: "pv-last", label: "Last visit", icon: "📋" },
    { id: "pv-compare", label: "Compare visits", icon: "🔄" },
    { id: "pv-timeline", label: "Treatment timeline", icon: "📊" },
  ],
  vitals: [
    { id: "vt-trends", label: "Vital trends", icon: "📈" },
    { id: "vt-flags", label: "Flag abnormals", icon: "⚠" },
    { id: "vt-compare", label: "Compare visits", icon: "📊" },
  ],
  history: [
    { id: "hx-full", label: "Full history", icon: "📋" },
    { id: "hx-meds", label: "Chronic meds", icon: "💊" },
    { id: "hx-allergies", label: "Allergies", icon: "⚠" },
  ],
  labResults: [
    { id: "lb-panel", label: "Full panel", icon: "📊" },
    { id: "lb-flagged", label: "Flagged values", icon: "⚠" },
    { id: "lb-trends", label: "Lab trends", icon: "📈" },
  ],
  medicalRecords: [
    { id: "mr-latest", label: "Latest report", icon: "📄" },
    { id: "mr-summary", label: "Pathology summary", icon: "📊" },
    { id: "mr-upload", label: "Upload report", icon: "📎" },
  ],
  obstetric: [
    { id: "ob-summary", label: "OB summary", icon: "🤰" },
    { id: "ob-edd", label: "EDD calculator", icon: "📅" },
    { id: "ob-vaccines", label: "ANC vaccines", icon: "💉" },
  ],
  gynec: [
    { id: "gn-summary", label: "Gynec summary", icon: "📋" },
    { id: "gn-cycle", label: "Cycle pattern", icon: "📊" },
    { id: "gn-lmp", label: "LMP tracking", icon: "📅" },
  ],
  vaccine: [
    { id: "vc-pending", label: "Pending vaccines", icon: "💉" },
    { id: "vc-overdue", label: "Overdue doses", icon: "⏰" },
    { id: "vc-schedule", label: "Full schedule", icon: "📋" },
  ],
  growth: [
    { id: "gr-chart", label: "Growth chart", icon: "📊" },
    { id: "gr-weight", label: "Weight trend", icon: "📈" },
    { id: "gr-milestones", label: "Milestones", icon: "📋" },
  ],
  ophthal: [
    { id: "op-va", label: "VA comparison", icon: "👁" },
    { id: "op-iop", label: "IOP trend", icon: "📊" },
    { id: "op-fundus", label: "Fundus summary", icon: "📋" },
  ],
  personalNotes: [
    { id: "pn-latest", label: "Latest notes", icon: "📝" },
    { id: "pn-summary", label: "Summarize notes", icon: "📋" },
  ],
}

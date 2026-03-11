// -----------------------------------------------------------------
// Homepage Pill Engine -- Generates operational canned pills
// for the Homepage Doctor Agent based on active tab, rail item,
// and patient context (now patient-data-aware)
// -----------------------------------------------------------------

import type { CannedPill, SmartSummaryData } from "../types"

type HomepageTab = "queue" | "finished" | "cancelled" | "draft" | "pending-digitisation"

// ─── Master list: one pill per homepage card type (15 total) ─────
// The UI will show max 4–5 at a time; tab overrides pick the
// most relevant subset. This master list is the exhaustive catalogue
// so every homepage card kind has a discoverable entry-point.
const ALL_HOMEPAGE_PILLS: CannedPill[] = [
  /* ① patient_list       */ { id: "hp-schedule",        label: "Today's schedule",       priority: 10, layer: 3, tone: "primary" },
  /* ② follow_up_list     */ { id: "hp-followups",       label: "Follow-ups due",         priority: 12, layer: 3, tone: "primary" },
  /* ③ revenue_bar        */ { id: "hp-revenue",         label: "Revenue today",           priority: 14, layer: 3, tone: "primary" },
  /* ④ bulk_action        */ { id: "hp-reminders",       label: "Send reminders",          priority: 16, layer: 3, tone: "primary" },
  /* ⑤ donut_chart        */ { id: "hp-demographics",    label: "Patient demographics",    priority: 18, layer: 3, tone: "primary" },
  /* ⑥ pie_chart          */ { id: "hp-diagnosis-dist",  label: "Diagnosis breakdown",     priority: 20, layer: 3, tone: "primary" },
  /* ⑦ line_graph         */ { id: "hp-patient-volume",  label: "Patient trends",          priority: 22, layer: 3, tone: "primary" },
  /* ⑧ analytics_table    */ { id: "hp-kpis",           label: "Weekly KPIs",             priority: 24, layer: 3, tone: "primary" },
  /* ⑨ condition_bar      */ { id: "hp-conditions",      label: "Chronic conditions",      priority: 26, layer: 3, tone: "primary" },
  /* ⑩ heatmap            */ { id: "hp-peak-hours",      label: "Peak hours",              priority: 28, layer: 3, tone: "primary" },
  /* ⑪ referral           */ { id: "hp-referrals",       label: "Referral summary",        priority: 30, layer: 3, tone: "primary" },
  /* ⑫ vaccination_sched  */ { id: "hp-vaccine-schedule",label: "Vaccination schedule",    priority: 32, layer: 3, tone: "primary" },
  /* ⑬ billing_summary    */ { id: "hp-billing",         label: "Billing overview",        priority: 34, layer: 3, tone: "primary" },
  /* ⑭ vaccination_due    */ { id: "hp-vaccine-due",     label: "Vaccination due list",    priority: 36, layer: 3, tone: "warning" },
  /* ⑮ anc_schedule_list  */ { id: "hp-anc-schedule",    label: "ANC schedule",            priority: 38, layer: 3, tone: "warning" },
]

// ─── Tab overrides: pick the 4 most relevant pills per tab ──────
const TAB_OVERRIDES: Record<HomepageTab, CannedPill[]> = {
  queue: [
    ALL_HOMEPAGE_PILLS[0],  // Today's schedule
    ALL_HOMEPAGE_PILLS[1],  // Follow-ups due
    ALL_HOMEPAGE_PILLS[7],  // Weekly KPIs
    ALL_HOMEPAGE_PILLS[6],  // Patient trends
  ],
  finished: [
    ALL_HOMEPAGE_PILLS[5],  // Diagnosis breakdown
    ALL_HOMEPAGE_PILLS[2],  // Revenue today
    ALL_HOMEPAGE_PILLS[4],  // Patient demographics
    ALL_HOMEPAGE_PILLS[8],  // Chronic conditions
  ],
  cancelled: [
    ALL_HOMEPAGE_PILLS[9],  // Peak hours
    ALL_HOMEPAGE_PILLS[6],  // Patient trends
    ALL_HOMEPAGE_PILLS[7],  // Weekly KPIs
    ALL_HOMEPAGE_PILLS[3],  // Send reminders
  ],
  draft: [
    ALL_HOMEPAGE_PILLS[11], // Vaccination schedule
    ALL_HOMEPAGE_PILLS[12], // Billing overview
    ALL_HOMEPAGE_PILLS[10], // Referral summary
    ALL_HOMEPAGE_PILLS[13], // Vaccination due list
  ],
  "pending-digitisation": [
    ALL_HOMEPAGE_PILLS[10], // Referral summary
    ALL_HOMEPAGE_PILLS[12], // Billing overview
    ALL_HOMEPAGE_PILLS[2],  // Revenue today
    ALL_HOMEPAGE_PILLS[1],  // Follow-ups due
  ],
}

// Rail-specific pills — shown when a non-appointments rail item is active
const RAIL_PILLS: Record<string, CannedPill[]> = {
  "follow-ups": [
    { id: "rail-overdue", label: "Overdue follow-ups", priority: 10, layer: 3, tone: "warning" },
    { id: "rail-reminders", label: "Send reminders", priority: 12, layer: 3, tone: "primary" },
    { id: "rail-thisweek", label: "This week's follow-ups", priority: 14, layer: 3, tone: "primary" },
    { id: "rail-rate", label: "Follow-up rate", priority: 16, layer: 3, tone: "info" },
  ],
  "opd-billing": [
    { id: "rail-pending", label: "Pending payments", priority: 10, layer: 3, tone: "warning" },
    { id: "rail-collection", label: "Today's collection", priority: 12, layer: 3, tone: "primary" },
    { id: "rail-invoice", label: "Generate invoice", priority: 14, layer: 3, tone: "primary" },
    { id: "rail-outstanding", label: "Outstanding dues", priority: 16, layer: 3, tone: "danger" },
  ],
  pharmacy: [
    { id: "rail-lowstock", label: "Low stock alerts", priority: 10, layer: 3, tone: "danger" },
    { id: "rail-pendingrx", label: "Pending prescriptions", priority: 12, layer: 3, tone: "warning" },
    { id: "rail-dispense", label: "Dispense history", priority: 14, layer: 3, tone: "primary" },
    { id: "rail-expiring", label: "Expiring medicines", priority: 16, layer: 3, tone: "warning" },
  ],
  "bulk-messages": [
    { id: "rail-campaign", label: "Draft campaign", priority: 10, layer: 3, tone: "primary" },
    { id: "rail-delivery", label: "Delivery stats", priority: 12, layer: 3, tone: "info" },
    { id: "rail-templates", label: "Template library", priority: 14, layer: 3, tone: "primary" },
    { id: "rail-scheduled", label: "Scheduled messages", priority: 16, layer: 3, tone: "primary" },
  ],
}

// ─── Patient-Context-Aware Pill Generator ────────────────────────
// Generates pills based on the patient's actual data — no "Last visit"
// if they've never visited, no "Flagged labs" if they have no labs, etc.
function generatePatientContextPills(summary: SmartSummaryData): CannedPill[] {
  const isNew = summary.symptomCollectorData?.isNewPatient || summary.specialtyTags.length === 0
  const hasVitals = !!(summary.todayVitals && Object.keys(summary.todayVitals).length > 0)
  const hasLabs = !!(summary.keyLabs && summary.keyLabs.length > 0)
  const hasLastVisit = !!summary.lastVisit

  const pills: CannedPill[] = []
  let p = 10

  if (isNew) {
    // New patient: focus on intake review, DDX, initial workup
    if (summary.symptomCollectorData?.symptoms?.length) {
      pills.push({ id: "pc-intake", label: "Review intake data", priority: p, layer: 3, tone: "primary" }); p += 2
    }
    pills.push({ id: "pc-ddx", label: "Suggest DDX", priority: p, layer: 3, tone: "primary" }); p += 2
    if (summary.allergies?.length) {
      pills.push({ id: "pc-allergy", label: `Allergy: ${summary.allergies[0]}`, priority: p, layer: 3, tone: "warning" }); p += 2
    }
    pills.push({ id: "pc-workup", label: "Initial workup", priority: p, layer: 3, tone: "info" }); p += 2
  } else {
    // Existing patient: show data-relevant pills
    pills.push({ id: "pc-snapshot", label: "Patient snapshot", priority: p, layer: 3, tone: "primary" }); p += 2

    if (hasLastVisit) {
      pills.push({ id: "pc-lastvisit", label: "Last visit", priority: p, layer: 3, tone: "primary" }); p += 2
    }

    if (hasLabs && summary.labFlagCount > 0) {
      pills.push({ id: "pc-labs", label: `${summary.labFlagCount} flagged labs`, priority: p, layer: 3, tone: "warning" }); p += 2
    }

    // Follow-up overdue
    if (summary.followUpOverdueDays > 0) {
      pills.push({ id: "pc-fu-overdue", label: `Follow-up overdue ${summary.followUpOverdueDays}d`, priority: p, layer: 3, tone: "warning" }); p += 2
    }

    // Specialty pills — prioritize the most clinically relevant specialty
    if (summary.obstetricData) {
      pills.push({ id: "pc-ob", label: "Obstetric summary", priority: p, layer: 3, tone: "primary" }); p += 2
    }
    if (summary.gynecData) {
      pills.push({ id: "pc-gynec", label: "Gynec summary", priority: p, layer: 3, tone: "primary" }); p += 2
    }
    if (summary.pediatricsData) {
      pills.push({ id: "pc-pedia", label: "Growth & vaccines", priority: p, layer: 3, tone: "primary" }); p += 2
    }
    if (summary.ophthalData) {
      pills.push({ id: "pc-ophthal", label: "Vision summary", priority: p, layer: 3, tone: "primary" }); p += 2
    }

    if (hasVitals && pills.length < 4) {
      pills.push({ id: "pc-vitals", label: "Vital trends", priority: p, layer: 3, tone: "info" }); p += 2
    }

    if (pills.length < 4) {
      pills.push({ id: "pc-preconsult", label: "Pre-consult prep", priority: p, layer: 3, tone: "info" }); p += 2
    }
  }

  return pills.slice(0, 4)
}

// ─── Legacy fallback for when no summary is available ────────────
const FALLBACK_PATIENT_PILLS: CannedPill[] = [
  { id: "pc-snapshot", label: "Patient snapshot", priority: 10, layer: 3, tone: "primary" },
  { id: "pc-lastvisit", label: "Last visit", priority: 12, layer: 3, tone: "primary" },
  { id: "pc-preconsult", label: "Pre-consult prep", priority: 16, layer: 3, tone: "info" },
]

export function generateHomepagePills(
  activeTab?: string,
  activeRailItem?: string,
  /** Pass SmartSummaryData for patient-specific pills, null for operational mode */
  patientSummary?: SmartSummaryData | null,
): CannedPill[] {
  // Patient-specific context → data-aware pills
  if (patientSummary) {
    return generatePatientContextPills(patientSummary)
  }

  // Rail-specific context (non-appointments rail items)
  if (activeRailItem && activeRailItem !== "appointments" && RAIL_PILLS[activeRailItem]) {
    return RAIL_PILLS[activeRailItem]
  }

  // Demo mode: show ALL pills so every card type is discoverable
  // In production, swap to: TAB_OVERRIDES[tab] || ALL_HOMEPAGE_PILLS.slice(0, 4)
  return ALL_HOMEPAGE_PILLS
}

/** Exposed for documentation / team reference — every homepage card's pill */
export { ALL_HOMEPAGE_PILLS }


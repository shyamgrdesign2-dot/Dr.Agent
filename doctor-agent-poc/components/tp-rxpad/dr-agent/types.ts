// ─────────────────────────────────────────────────────────────
// Doctor Agent v0 — Shared Type Definitions
// ─────────────────────────────────────────────────────────────

import type { RxPadCopyPayload } from "@/components/tp-rxpad/rxpad-sync-context"

// ═══════════════ CORE ENUMS & LITERALS ═══════════════

export type ConsultPhase =
  | "empty"
  | "symptoms_entered"
  | "dx_accepted"
  | "meds_written"
  | "near_complete"

export type SpecialtyTabId = "gp" | "gynec" | "ophthal" | "obstetric" | "pediatrics"

export type RxTabLens =
  | "dr-agent"
  | "past-visits"
  | "vitals"
  | "history"
  | "lab-results"
  | "obstetric"
  | "medical-records"

export type PillTone = "primary" | "info" | "warning" | "danger"

export type IntentCategory =
  | "data_retrieval"
  | "clinical_decision"
  | "action"
  | "comparison"
  | "document_analysis"
  | "clinical_question"
  | "operational"
  | "ambiguous"
  | "follow_up"

export type ResponseFormat = "text" | "hybrid" | "card"

export type FlagDirection = "high" | "low"

export type SeverityLevel = "critical" | "high" | "moderate" | "low"

export type InsightVariant = "red" | "amber" | "purple" | "teal"

// ═══════════════ PATIENT CONTEXT ═══════════════

export interface RxContextOption {
  id: string
  label: string
  meta: string
  kind: "system" | "patient"
  isToday?: boolean
  gender?: "M" | "F"
  age?: number
}

// ═══════════════ SMART SUMMARY DATA ═══════════════

export interface VitalEntry {
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

export interface LabFlag {
  name: string
  value: string
  unit?: string
  flag: FlagDirection
  refRange?: string
}

export interface SymptomCollectorData {
  reportedAt: string
  symptoms: Array<{ name: string; duration?: string; severity?: string; notes?: string }>
  medicalHistory?: string[]
  familyHistory?: string[]
  allergies?: string[]
  lifestyle?: string[]
  questionsToDoctor?: string[]
  /** Populated by system from patient records */
  currentMedications?: string[]
  lastVisitSummary?: string
  /** Medicines suggested in last visit (different from currentMedications) */
  suggestedMeds?: string[]
  isNewPatient?: boolean
}

export interface LastVisitData {
  date: string
  vitals?: string
  symptoms: string
  examination: string
  diagnosis: string
  medication: string
  labTestsSuggested: string
  advice?: string
  followUp?: string
}

export interface GynecData {
  menarche?: string
  cycleLength?: string
  cycleRegularity?: string
  flowDuration?: string
  flowIntensity?: string
  padsPerDay?: string
  painScore?: string
  lmp?: string
  lastPapSmear?: string
  alerts?: string[]
}

export interface OphthalData {
  vaRight?: string
  vaLeft?: string
  nearVaRight?: string
  nearVaLeft?: string
  iop?: string
  slitLamp?: string
  fundus?: string
  lastExamDate?: string
  glassPrescription?: string
  alerts?: string[]
}

export interface ObstetricData {
  gravida?: number
  para?: number
  living?: number
  abortion?: number
  ectopic?: number
  lmp?: string
  edd?: string
  gestationalWeeks?: string
  presentation?: string
  fetalMovement?: string
  oedema?: string
  fundusHeight?: string
  amnioticFluid?: string
  lastExamDate?: string
  ancDue?: string[]
  vaccineStatus?: string[]
  alerts?: string[]
  bpLatest?: string
}

export interface PediatricsData {
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
  feedingNotes?: string[]
  lastGrowthDate?: string
  alerts?: string[]
}

export interface ConcernTrend {
  label: string
  values: number[]
  labels: string[]
  unit: string
  tone?: "teal" | "red" | "violet" | "amber"
}

export interface SmartSummaryData {
  specialtyTags: string[]
  followUpOverdueDays: number
  patientNarrative?: string
  familyHistory?: string[]
  lifestyleNotes?: string[]
  allergies?: string[]
  chronicConditions?: string[]
  receptionistIntakeNotes?: string[]
  lastVisit?: LastVisitData
  labFlagCount: number
  todayVitals?: VitalEntry
  activeMeds?: string[]
  keyLabs?: LabFlag[]
  dueAlerts?: string[]
  recordAlerts?: string[]
  concernTrend?: ConcernTrend
  symptomCollectorData?: SymptomCollectorData
  gynecData?: GynecData
  ophthalData?: OphthalData
  obstetricData?: ObstetricData
  pediatricsData?: PediatricsData
}

// ═══════════════ CANNED PILLS ═══════════════

export interface CannedPill {
  id: string
  label: string
  priority: number        // 0-99, lower = higher priority
  layer: 1 | 2 | 3 | 4
  force?: boolean          // Layer 1 safety pills
  cooldownMs?: number
  tone: PillTone
}

// ═══════════════ CARD DATA INTERFACES ═══════════════

export interface LastVisitCardSection {
  tag: string
  icon: string
  items: Array<{ label: string; detail?: string; severity?: string }>
  notes?: string
}

export interface LastVisitCardData {
  visitDate: string
  sections: LastVisitCardSection[]
  copyAllPayload: RxPadCopyPayload
}

export interface LabPanelData {
  panelDate: string
  flagged: LabFlag[]
  hiddenNormalCount: number
  insight: string
}

export interface VitalTrendSeries {
  label: string
  values: number[]
  dates: string[]
  tone: "ok" | "warn" | "critical"
  threshold?: number
  thresholdLabel?: string
  unit: string
}

export interface LabComparisonRow {
  parameter: string
  prevValue: string
  currValue: string
  prevDate: string
  currDate: string
  delta: string
  direction: "up" | "down" | "stable"
  isFlagged: boolean
}

export interface MedHistoryEntry {
  drug: string
  dosage: string
  date: string
  diagnosis: string
  source: "prescribed" | "uploaded"
}

export interface DDXOption {
  name: string
  bucket: "cant_miss" | "most_likely" | "consider"
  selected?: boolean
}

export interface ProtocolMed {
  name: string
  dosage: string
  timing: string
  duration: string
  notes?: string
}

export interface InvestigationItem {
  name: string
  rationale: string
  selected?: boolean
}

export interface OCRParameter {
  name: string
  value: string
  refRange?: string
  flag?: FlagDirection
  confidence?: "high" | "medium" | "low"
}

export interface OCRSection {
  heading: string
  icon: string
  items: string[]
  copyDestination: string
}

export interface CompletenessSection {
  name: string
  filled: boolean
  count?: number
}

export interface TranslationData {
  sourceLanguage: string
  targetLanguage: string
  sourceText: string
  translatedText: string
}

export interface FollowUpOption {
  label: string
  days: number
  recommended?: boolean
  reason?: string
}

export interface DrugInteractionData {
  drug1: string
  drug2: string
  severity: SeverityLevel
  risk: string
  action: string
}

export interface AllergyConflictData {
  drug: string
  allergen: string
  alternative: string
}

// ═══════════════ VOICE-TO-STRUCTURED-RX ═══════════════

export interface VoiceRxItem {
  name: string
  detail?: string         // e.g., "3 days", "500mg", "1-0-0-1"
}

export interface VoiceRxSection {
  sectionId: string       // "symptoms" | "examination" | "diagnosis" | "medication" | "advice" | "investigation" | "followUp" | "history"
  title: string           // "Symptoms", "Examination", etc.
  tpIconName: string      // TPMedicalIcon name
  items: VoiceRxItem[]    // Structured items matching RxPad table format
}

export interface VoiceStructuredRxData {
  voiceText: string                    // Original transcribed text
  sections: VoiceRxSection[]           // Parsed structured sections
  copyAllPayload: RxPadCopyPayload     // Copy everything to RxPad
}

// ═══════════════ HOMEPAGE CARD DATA (H1–H12) ═══════════════

export type BadgeTone = "warning" | "success" | "info" | "danger"

export interface PatientListItem { name: string; age: number; gender: "M" | "F"; time: string; status: string; statusTone: BadgeTone; patientId?: string }
export interface PatientListCardData { title: string; items: PatientListItem[]; totalCount: number }

export interface FollowUpListItem { name: string; scheduledDate: string; reason: string; isOverdue: boolean; patientId?: string }
export interface FollowUpListCardData { title: string; items: FollowUpListItem[]; overdueCount: number }

export interface RevenueBarDay { label: string; paid: number; due: number; refunded?: number }
export interface RevenueBarCardData {
  title: string
  mode?: "billing" | "deposit"
  totalRevenue: number
  totalPaid: number
  totalDue: number
  totalRefunded: number
  days: RevenueBarDay[]
}

export interface RevenueComparisonCardData {
  title: string
  primaryDateLabel: string
  compareDateLabel: string
  primaryRevenue: number
  compareRevenue: number
  primaryRefunded: number
  compareRefunded: number
  primaryDeposits: number
  compareDeposits: number
  insight: string
}

export interface BulkActionCardData { action: string; messagePreview: string; recipients: string[]; totalCount: number }

export interface DonutSegment { label: string; value: number; color: string }
export interface DonutChartCardData { title: string; segments: DonutSegment[]; total: number; centerLabel: string }

export interface PieChartCardData { title: string; segments: DonutSegment[]; total: number; centerLabel: string }

export interface LineGraphPoint { label: string; value: number }
export interface LineGraphCardData { title: string; points: LineGraphPoint[]; average: number; changePercent: string; changeDirection: "up" | "down" | "stable" }

export interface AnalyticsKPI { metric: string; thisWeek: string; lastWeek: string; delta: string; direction: "up" | "down" | "stable"; isGood: boolean }
export interface AnalyticsTableCardData { title: string; kpis: AnalyticsKPI[]; insight: string }

export interface ConditionBarItem { condition: string; count: number; color: string }
export interface ConditionBarCardData { title: string; items: ConditionBarItem[]; note: string }

export interface HeatmapCell { value: number; intensity: "low" | "medium" | "high" }
export interface HeatmapCardData { title: string; rows: string[]; cols: string[]; cells: HeatmapCell[][] }
export interface DuePatientsCardData {
  title: string
  periodLabel: string
  patientCount: number
  totalDueAmount: number
  asOf: string
  ctaLabel: string
}
export interface ExternalCtaCardData {
  title: string
  description: string
  ctaLabel: string
  ctaUrl: string
  openInNewTab?: boolean
}
export interface FollowUpRatePoint { label: string; rate: number }
export interface FollowUpRateCardData {
  title: string
  currentRate: number
  lastWeekRate: number
  dueToday: number
  overdueToday: number
  completedThisWeek: number
  scheduledThisWeek: number
  trend: FollowUpRatePoint[]
}

// ═══════════════ NEW CARD TYPES ═══════════════

export interface ReferralItem {
  doctorName: string
  doctorPhone: string
  specialty: string
  patientsReferred: number
  topReason: string
}
export interface ReferralCardData {
  title: string
  totalReferrers: number
  totalPatients: number
  items: ReferralItem[]
}

export interface VaccineScheduleItem {
  patientName: string
  patientId?: string
  name: string
  dose: string
  dueDate: string
  status: "given" | "due" | "overdue"
}
export interface VaccinationScheduleCardData {
  title: string
  overdueCount: number
  dueCount: number
  givenCount: number
  vaccines: VaccineScheduleItem[]
}

export interface ClinicalGuidelineCardData {
  title: string
  condition: string
  source: string
  recommendations: string[]
  evidenceLevel: "A" | "B" | "C"
}

export interface TimelineEvent {
  date: string
  type: "visit" | "lab" | "procedure" | "admission"
  summary: string
}
export interface PatientTimelineCardData {
  title: string
  events: TimelineEvent[]
}

export interface RxPreviewCardData {
  patientName: string
  date: string
  diagnoses: string[]
  medications: string[]
  investigations: string[]
  advice: string[]
  followUp: string
}

export interface BillingItem {
  referenceNo: string
  patientName: string
  amount: number
  billedAmount?: number
  paidAmount?: number
  status: "paid_fully" | "due" | "refunded" | "deposited" | "debited"
}
export interface BillingSummaryCardData {
  title: string
  mode: "billing" | "deposit" | "combined"
  items: BillingItem[]
  todayBilledAmount?: number
  todayCollectedAmount?: number
  totalBilledAmount: number
  totalPaidFullyAmount: number
  totalDueAmount: number
  totalRefundedAmount: number
  totalAdvanceReceived: number
  totalAdvanceRefunded: number
  totalAdvanceDebited: number
  footerCtaLabel?: string
  footerCtaAction?: string
  minimal?: boolean
  insight?: string
}

// ═══════════════ VACCINATION DUE/OVERDUE LIST ═══════════════

export interface VaccinationDueItem {
  patientName: string
  patientId?: string
  vaccineName: string
  dose: string
  dueDate: string
  isOverdue: boolean
}
export interface VaccinationDueListCardData {
  title: string
  overdueCount: number
  dueCount: number
  items: VaccinationDueItem[]
}

// ═══════════════ ANC SCHEDULE DUE/OVERDUE LIST ═══════════════

export interface ANCScheduleItem {
  patientName: string
  patientId?: string
  ancItem: string
  dueWeek: string
  gestationalAge: string
  isOverdue: boolean
}
export interface ANCScheduleListCardData {
  title: string
  overdueCount: number
  dueCount: number
  items: ANCScheduleItem[]
}

// ═══════════════ RX AGENT OUTPUT (DISCRIMINATED UNION) ═══════════════

export type RxAgentOutput =
  | { kind: "patient_summary"; data: SmartSummaryData }
  | { kind: "last_visit"; data: LastVisitCardData }
  | { kind: "lab_panel"; data: LabPanelData }
  | { kind: "vitals_trend_bar"; data: { title: string; series: VitalTrendSeries[] } }
  | { kind: "vitals_trend_line"; data: { title: string; series: VitalTrendSeries[] } }
  | { kind: "lab_trend"; data: { title: string; series: VitalTrendSeries[]; parameterName: string } }
  | { kind: "lab_comparison"; data: { rows: LabComparisonRow[]; insight: string } }
  | { kind: "med_history"; data: { entries: MedHistoryEntry[]; insight: string } }
  | { kind: "ddx"; data: { context: string; options: DDXOption[] } }
  | { kind: "protocol_meds"; data: { diagnosis: string; meds: ProtocolMed[]; safetyCheck: string; copyPayload: RxPadCopyPayload } }
  | { kind: "investigation_bundle"; data: { title: string; items: InvestigationItem[]; copyPayload: RxPadCopyPayload } }
  | { kind: "follow_up"; data: { context: string; options: FollowUpOption[] } }
  | { kind: "ocr_pathology"; data: { title: string; category: string; parameters: OCRParameter[]; normalCount: number; insight: string } }
  | { kind: "ocr_extraction"; data: { title: string; category: string; sections: OCRSection[]; insight: string } }
  | { kind: "translation"; data: TranslationData & { copyPayload: RxPadCopyPayload } }
  | { kind: "completeness"; data: { sections: CompletenessSection[]; emptyCount: number } }
  | { kind: "drug_interaction"; data: DrugInteractionData }
  | { kind: "allergy_conflict"; data: AllergyConflictData }
  | { kind: "follow_up_question"; data: { question: string; options: string[]; multiSelect: boolean } }
  | { kind: "symptom_collector"; data: SymptomCollectorData }
  | { kind: "obstetric_summary"; data: ObstetricData }
  | { kind: "gynec_summary"; data: GynecData }
  | { kind: "pediatric_summary"; data: PediatricsData }
  | { kind: "ophthal_summary"; data: OphthalData }
  | { kind: "text_fact"; data: { value: string; context: string; source: string } }
  | { kind: "text_alert"; data: { message: string; severity: SeverityLevel } }
  | { kind: "text_list"; data: { items: string[] } }
  | { kind: "advice_bundle"; data: { title: string; items: string[]; shareMessage: string; copyPayload: RxPadCopyPayload } }
  | { kind: "voice_structured_rx"; data: VoiceStructuredRxData }
  // Homepage Operational Cards (H1–H12)
  | { kind: "patient_list"; data: PatientListCardData }
  | { kind: "follow_up_list"; data: FollowUpListCardData }
  | { kind: "revenue_bar"; data: RevenueBarCardData }
  | { kind: "revenue_comparison"; data: RevenueComparisonCardData }
  | { kind: "bulk_action"; data: BulkActionCardData }
  | { kind: "donut_chart"; data: DonutChartCardData }
  | { kind: "pie_chart"; data: PieChartCardData }
  | { kind: "line_graph"; data: LineGraphCardData }
  | { kind: "analytics_table"; data: AnalyticsTableCardData }
  | { kind: "condition_bar"; data: ConditionBarCardData }
  | { kind: "heatmap"; data: HeatmapCardData }
  | { kind: "due_patients"; data: DuePatientsCardData }
  | { kind: "external_cta"; data: ExternalCtaCardData }
  | { kind: "follow_up_rate"; data: FollowUpRateCardData }
  | { kind: "welcome_card"; data: WelcomeCardData }
  // New Card Variants
  | { kind: "referral"; data: ReferralCardData }
  | { kind: "vaccination_schedule"; data: VaccinationScheduleCardData }
  | { kind: "clinical_guideline"; data: ClinicalGuidelineCardData }
  | { kind: "patient_timeline"; data: PatientTimelineCardData }
  | { kind: "rx_preview"; data: RxPreviewCardData }
  | { kind: "billing_summary"; data: BillingSummaryCardData }
  | { kind: "vaccination_due_list"; data: VaccinationDueListCardData }
  | { kind: "anc_schedule_list"; data: ANCScheduleListCardData }
  // Text Variants
  | { kind: "text_step"; data: { steps: string[] } }
  | { kind: "text_quote"; data: { quote: string; source: string } }
  | { kind: "text_comparison"; data: { labelA: string; labelB: string; itemsA: string[]; itemsB: string[] } }

// ═══════════════ WELCOME CARD ═══════════════

export interface WelcomeCardStat { label: string; value: number; color: string; icon?: string; tab?: string }
export interface WelcomeCardQuickAction { label: string; tab?: string }
export interface WelcomeCardData {
  greeting: string
  date: string
  stats: WelcomeCardStat[]
  quickActions?: WelcomeCardQuickAction[]
  contextLine?: string
  tips?: string[]
}

// ═══════════════ PATIENT DOCUMENT (EMR uploads) ═══════════════

export type PatientDocType = "pathology" | "radiology" | "prescription" | "discharge_summary" | "vaccination" | "other"

export interface PatientDocument {
  id: string
  fileName: string
  docType: PatientDocType
  uploadedAt: string        // e.g. "05 Mar'26"
  uploadedBy: string        // e.g. "Dr. Sharma", "Patient", "Apollo Diagnostics"
  pageCount: number
  size: string              // e.g. "340 KB"
}

// ═══════════════ CHAT ATTACHMENT ═══════════════

export interface ChatAttachment {
  type: "pdf" | "image"
  fileName: string
  pageCount?: number
}

// ═══════════════ CHAT MESSAGE ═══════════════

export interface RxAgentChatMessage {
  id: string
  role: "assistant" | "user"
  text: string
  createdAt: string
  rxOutput?: RxAgentOutput
  attachment?: ChatAttachment
  feedbackGiven?: "up" | "down" | null
}

// ═══════════════ INTENT CLASSIFICATION RESULT ═══════════════

export interface IntentResult {
  category: IntentCategory
  format: ResponseFormat
  confidence: number
}

// ═══════════════ REPLY BUILDER RESULT ═══════════════

export interface ReplyResult {
  text: string
  rxOutput?: RxAgentOutput
  followUpPills?: CannedPill[]
}

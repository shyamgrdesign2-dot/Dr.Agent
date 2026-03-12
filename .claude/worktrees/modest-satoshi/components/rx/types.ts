/**
 * RX Workspace Type Definitions
 * ─────────────────────────────
 * Complete type system for the TatvaPractice RX sidebar panels,
 * expanded section views, and RXPad content area.
 *
 * Architecture:
 *   NavItem → SecondaryNav → ExpandedPanel → SectionContent
 *                                              ↓
 *                                           RxPad (receives copied items)
 */

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

export type SectionId =
  | "past-visits"
  | "vitals"
  | "history"
  | "ophthal"
  | "gynec"
  | "obstetric"
  | "vaccine"
  | "growth"
  | "lab-results"
  | "records"
  | "follow-up"

export interface NavBadge {
  text: string
  gradient: string
}

export interface NavItem {
  id: SectionId
  label: string
  icon: string // Iconsax icon name
  badge?: NavBadge
  /** Total count of items in this section (shown as badge number) */
  count?: number
}

// ═══════════════════════════════════════════════════════════════
// PAST VISITS
// ═══════════════════════════════════════════════════════════════

export interface PastVisitMedication {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface PastVisitEntry {
  id: string
  date: string // ISO date string
  visitType: "OPD" | "IPD" | "Emergency" | "Teleconsult"
  doctorName: string
  speciality?: string
  symptoms: string[]
  examination: string[]
  diagnosis: string[]
  medications: PastVisitMedication[]
  labInvestigations?: string[]
  advices?: string[]
  followUp?: string
  notes?: string
}

// ═══════════════════════════════════════════════════════════════
// VITALS
// ═══════════════════════════════════════════════════════════════

export type VitalStatus = "normal" | "warning" | "critical" | "low"

export interface VitalReading {
  id: string
  date: string
  bloodPressure?: { systolic: number; diastolic: number; status: VitalStatus }
  temperature?: { value: number; unit: "F" | "C"; status: VitalStatus }
  heartRate?: { value: number; status: VitalStatus }
  respiratoryRate?: { value: number; status: VitalStatus }
  spO2?: { value: number; status: VitalStatus }
  weight?: { value: number; unit: "kg" | "lbs" }
  height?: { value: number; unit: "cm" | "ft" }
  bmi?: { value: number; status: VitalStatus }
  bloodSugar?: { fasting?: number; pp?: number; random?: number; status: VitalStatus }
}

// ═══════════════════════════════════════════════════════════════
// MEDICAL HISTORY
// ═══════════════════════════════════════════════════════════════

export type HistorySeverity = "mild" | "moderate" | "severe"

export interface AllergyEntry {
  id: string
  allergen: string
  type: "Drug" | "Food" | "Environmental" | "Other"
  severity: HistorySeverity
  reaction: string
  reportedDate?: string
}

export interface ChronicCondition {
  id: string
  condition: string
  diagnosedDate: string
  status: "Active" | "Resolved" | "In Remission"
  medications?: string[]
  notes?: string
}

export interface SurgicalHistory {
  id: string
  procedure: string
  date: string
  hospital?: string
  outcome?: string
  notes?: string
}

export interface FamilyHistoryEntry {
  id: string
  relation: string
  condition: string
  ageOfOnset?: string
  status?: "Living" | "Deceased"
  notes?: string
}

export interface SocialHistory {
  smoking: { status: "Never" | "Former" | "Current"; details?: string }
  alcohol: { status: "Never" | "Occasional" | "Regular" | "Heavy"; details?: string }
  occupation?: string
  exercise?: string
  diet?: string
}

export interface MedicalHistory {
  allergies: AllergyEntry[]
  chronicConditions: ChronicCondition[]
  surgicalHistory: SurgicalHistory[]
  familyHistory: FamilyHistoryEntry[]
  socialHistory: SocialHistory
  pastMedications?: string[]
}

// ═══════════════════════════════════════════════════════════════
// OPHTHAL
// ═══════════════════════════════════════════════════════════════

export interface VisionReading {
  eye: "Right" | "Left"
  unaided?: string
  withGlasses?: string
  pinhole?: string
  nearVision?: string
}

export interface OphthalEntry {
  id: string
  date: string
  vision: VisionReading[]
  iop?: { right: number; left: number; method: string }
  anteriorSegment?: { right: string; left: string }
  posteriorSegment?: { right: string; left: string }
  diagnosis?: string[]
  treatment?: string[]
  notes?: string
}

// ═══════════════════════════════════════════════════════════════
// GYNEC
// ═══════════════════════════════════════════════════════════════

export interface MenstrualHistory {
  lmp?: string // Last Menstrual Period date
  cycleLength?: number
  duration?: number
  regularity: "Regular" | "Irregular"
  flow: "Light" | "Moderate" | "Heavy"
  dysmenorrhea?: boolean
  notes?: string
}

export interface GynecEntry {
  id: string
  date: string
  menstrualHistory: MenstrualHistory
  papSmear?: { date: string; result: string }
  contraception?: string
  complaints?: string[]
  examination?: string
  diagnosis?: string[]
  treatment?: string[]
}

// ═══════════════════════════════════════════════════════════════
// OBSTETRIC
// ═══════════════════════════════════════════════════════════════

export interface PregnancyEntry {
  id: string
  year: string
  outcome: "Live Birth" | "Stillbirth" | "Miscarriage" | "Abortion" | "Ectopic"
  modeOfDelivery?: "NVD" | "LSCS" | "Assisted" | "N/A"
  birthWeight?: string
  gender?: "Male" | "Female"
  complications?: string[]
  notes?: string
}

export interface CurrentPregnancy {
  edd?: string // Expected Date of Delivery
  lmp?: string
  gestationalAge?: string
  gravida: number
  para: number
  abortion: number
  living: number
  antenatalVisits?: AntenatalVisit[]
}

export interface AntenatalVisit {
  id: string
  date: string
  gestationalAge: string
  weight?: number
  bp?: string
  fetalHeartRate?: number
  presentation?: string
  uterineHeight?: string
  notes?: string
}

export interface ObstetricHistory {
  obstetricFormula?: string // e.g., "G3P2A1L2"
  previousPregnancies: PregnancyEntry[]
  currentPregnancy?: CurrentPregnancy
}

// ═══════════════════════════════════════════════════════════════
// VACCINE
// ═══════════════════════════════════════════════════════════════

export type VaccineStatus = "Completed" | "Due" | "Overdue" | "Scheduled" | "Missed"

export interface VaccineRecord {
  id: string
  vaccineName: string
  dose: string // e.g., "Dose 1", "Dose 2", "Booster"
  dateAdministered?: string
  scheduledDate?: string
  status: VaccineStatus
  batchNumber?: string
  administeredBy?: string
  site?: string
  notes?: string
}

export interface VaccineCategory {
  category: string // e.g., "National Immunization Schedule", "Optional Vaccines"
  vaccines: VaccineRecord[]
}

// ═══════════════════════════════════════════════════════════════
// GROWTH
// ═══════════════════════════════════════════════════════════════

export interface GrowthRecord {
  id: string
  date: string
  age: string // e.g., "6 months", "2 years"
  weight: number
  height: number
  headCircumference?: number
  bmi?: number
  weightPercentile?: number
  heightPercentile?: number
  bmiPercentile?: number
  notes?: string
}

// ═══════════════════════════════════════════════════════════════
// LAB RESULTS
// ═══════════════════════════════════════════════════════════════

export type LabResultStatus = "Normal" | "Abnormal" | "Critical" | "Pending"

export interface LabTestResult {
  id: string
  testName: string
  value: string
  unit: string
  referenceRange: string
  status: LabResultStatus
  flag?: "High" | "Low" | "Critical High" | "Critical Low"
}

export interface LabReport {
  id: string
  date: string
  labName?: string
  orderedBy?: string
  category: string // e.g., "Hematology", "Biochemistry", "Urine"
  tests: LabTestResult[]
  notes?: string
  attachmentUrl?: string
}

// ═══════════════════════════════════════════════════════════════
// MEDICAL RECORDS
// ═══════════════════════════════════════════════════════════════

export type DocumentType =
  | "Prescription"
  | "Lab Report"
  | "Radiology"
  | "Discharge Summary"
  | "Referral Letter"
  | "Insurance"
  | "Consent Form"
  | "Other"

export interface MedicalDocument {
  id: string
  title: string
  type: DocumentType
  date: string
  uploadedBy: string
  fileUrl: string
  fileType: "pdf" | "image" | "doc"
  fileSize?: string
  notes?: string
  tags?: string[]
}

// ═══════════════════════════════════════════════════════════════
// FOLLOW-UP
// ═══════════════════════════════════════════════════════════════

export type FollowUpStatus = "Scheduled" | "Completed" | "Missed" | "Cancelled" | "Rescheduled"

export interface FollowUpEntry {
  id: string
  scheduledDate: string
  reason: string
  doctorName?: string
  status: FollowUpStatus
  visitType: "OPD" | "Teleconsult" | "Lab Review" | "Procedure"
  notes?: string
  reminderSent?: boolean
}

// ═══════════════════════════════════════════════════════════════
// RXPAD (Main Content Area)
// ═══════════════════════════════════════════════════════════════

export interface RxPadSymptom {
  id: string
  name: string
  duration?: string
  severity?: HistorySeverity
  notes?: string
}

export interface RxPadExamination {
  id: string
  name: string
  finding?: string
  notes?: string
}

export interface RxPadDiagnosis {
  id: string
  name: string
  type: "Provisional" | "Confirmed" | "Differential"
  icdCode?: string
}

export interface RxPadVitals {
  bloodPressure?: { systolic: string; diastolic: string }
  temperature?: string
  heartRate?: string
  respiratoryRate?: string
  weight?: string
  spO2?: string
  surgeryProcedureName?: string
}

export interface RxPadMedication {
  id: string
  medicine: string
  unitPerDose: string
  frequency: string
  when: string
  duration: string
  note?: string
}

export interface RxPadLabInvestigation {
  id: string
  name: string
  notes?: string
}

export interface RxPadData {
  symptoms: RxPadSymptom[]
  examinations: RxPadExamination[]
  diagnosis: RxPadDiagnosis[]
  vitals: RxPadVitals
  medications: RxPadMedication[]
  advices: string
  labInvestigations: RxPadLabInvestigation[]
  followUp?: { date: string; notes?: string }
  additionalNotes: string
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

export interface ExpandedPanelProps {
  sectionId: SectionId
  title: string
  isOpen: boolean
  onClose: () => void
  onCopyToRxPad?: (data: CopyPayload) => void
  children: React.ReactNode
}

export type CopyTarget =
  | "symptoms"
  | "examinations"
  | "diagnosis"
  | "medications"
  | "vitals"
  | "lab-investigations"
  | "advices"
  | "follow-up"
  | "notes"

export interface CopyPayload {
  target: CopyTarget
  items: string[]
  source: string // e.g., "Past Visit - 24 Jun 2025"
}

// ═══════════════════════════════════════════════════════════════
// PATIENT CONTEXT
// ═══════════════════════════════════════════════════════════════

export interface PatientInfo {
  id: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  bloodGroup?: string
  phone?: string
  uhid?: string // Unique Hospital ID
}

export interface RxWorkspaceState {
  activeSection: SectionId | null
  expandedSection: SectionId | null
  patient: PatientInfo
  rxPadData: RxPadData
}

// ═══════════════════════════════════════════════════════════════
// DISPLAY RULES
// ═══════════════════════════════════════════════════════════════

/**
 * Display rules for section content formatting.
 * These define how medical data should be highlighted,
 * color-coded, and formatted across sections.
 */
export interface DisplayRule {
  /** CSS class or token to apply */
  style: string
  /** Condition when this rule applies */
  condition: string
  /** Description for documentation */
  description: string
}

export const VITAL_DISPLAY_RULES: Record<VitalStatus, DisplayRule> = {
  normal: {
    style: "text-tp-success-600 bg-tp-success-50",
    condition: "Value within normal reference range",
    description: "Green text on light green background — indicates healthy/normal reading",
  },
  warning: {
    style: "text-tp-warning-600 bg-tp-warning-50",
    condition: "Value slightly outside normal range",
    description: "Amber text on light amber background — requires attention but not critical",
  },
  critical: {
    style: "text-tp-error-600 bg-tp-error-50",
    condition: "Value significantly outside normal range",
    description: "Red text on light red background — requires immediate attention",
  },
  low: {
    style: "text-tp-blue-600 bg-tp-blue-50",
    condition: "Value below normal range",
    description: "Blue text on light blue background — below normal, monitor required",
  },
}

export const ALLERGY_SEVERITY_RULES: Record<HistorySeverity, DisplayRule> = {
  mild: {
    style: "text-tp-warning-600 bg-tp-warning-50 border-tp-warning-200",
    condition: "Mild allergic reaction, no life-threatening symptoms",
    description: "Amber styling for mild alerts",
  },
  moderate: {
    style: "text-tp-warning-700 bg-tp-warning-100 border-tp-warning-300",
    condition: "Moderate reaction requiring treatment",
    description: "Darker amber for moderate severity",
  },
  severe: {
    style: "text-tp-error-600 bg-tp-error-50 border-tp-error-200",
    condition: "Severe/anaphylactic reaction — ALWAYS prominently displayed",
    description: "Red styling with bold text for severe allergies",
  },
}

export const LAB_RESULT_RULES: Record<LabResultStatus, DisplayRule> = {
  Normal: {
    style: "text-tp-slate-700",
    condition: "Result within reference range",
    description: "Default text color — no special highlighting needed",
  },
  Abnormal: {
    style: "text-tp-warning-600 font-semibold",
    condition: "Result outside reference range",
    description: "Amber bold text to draw attention",
  },
  Critical: {
    style: "text-tp-error-600 font-bold",
    condition: "Result critically outside range — life-threatening",
    description: "Red bold text — highest priority visual indicator",
  },
  Pending: {
    style: "text-tp-slate-400 italic",
    condition: "Result not yet available",
    description: "Muted italic text — awaiting results",
  },
}

export const VACCINE_STATUS_RULES: Record<VaccineStatus, DisplayRule> = {
  Completed: {
    style: "text-tp-success-600 bg-tp-success-50",
    condition: "Vaccine administered",
    description: "Green — completed vaccination",
  },
  Due: {
    style: "text-tp-blue-600 bg-tp-blue-50",
    condition: "Vaccine due as per schedule",
    description: "Blue — upcoming vaccination",
  },
  Overdue: {
    style: "text-tp-error-600 bg-tp-error-50",
    condition: "Vaccine past due date",
    description: "Red — missed schedule, needs attention",
  },
  Scheduled: {
    style: "text-tp-violet-600 bg-tp-violet-50",
    condition: "Appointment scheduled for vaccination",
    description: "Violet — scheduled, not yet due",
  },
  Missed: {
    style: "text-tp-slate-500 bg-tp-slate-100 line-through",
    condition: "Vaccine was missed and not rescheduled",
    description: "Muted with strikethrough — missed entirely",
  },
}

export const FOLLOW_UP_STATUS_RULES: Record<FollowUpStatus, DisplayRule> = {
  Scheduled: {
    style: "text-tp-blue-600 bg-tp-blue-50",
    condition: "Appointment scheduled",
    description: "Blue — upcoming follow-up",
  },
  Completed: {
    style: "text-tp-success-600 bg-tp-success-50",
    condition: "Follow-up completed",
    description: "Green — completed",
  },
  Missed: {
    style: "text-tp-error-600 bg-tp-error-50",
    condition: "Patient did not attend",
    description: "Red — missed appointment",
  },
  Cancelled: {
    style: "text-tp-slate-500 bg-tp-slate-100",
    condition: "Appointment cancelled",
    description: "Muted — cancelled",
  },
  Rescheduled: {
    style: "text-tp-warning-600 bg-tp-warning-50",
    condition: "Appointment moved to a new date",
    description: "Amber — rescheduled",
  },
}

"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowLeft2, Hospital, User, Activity, Microscope, Heart, Eye, Woman, DocumentText, Cpu, Brush2, ExportSquare } from "iconsax-reactjs"
import DesignSystemTab from "./DesignSystemTab"
import PatientSummaryLogicTab from "./PatientSummaryLogicTab"
import { IntentClassificationContent } from "@/app/intent-classification/page"

// ─────────────────────────────────────────────────────────────
// Scenarios Documentation Page
// Comprehensive guide to all demo patients, workflows, and cards
// ─────────────────────────────────────────────────────────────

interface PatientScenario {
  id: string
  name: string
  age: number
  gender: "M" | "F"
  status: string
  statusColor: string
  specialty: string
  specialtyIcon: React.ReactNode
  tagline: string
  symptoms: string[]
  conditions: string[]
  keyData: string[]
  cannedPills: string[]
  cardsDemoed: string[]
  workflow: string[]
  alerts: string[]
}

const PATIENT_SCENARIOS: PatientScenario[] = [
  {
    id: "apt-zerodata",
    name: "Ramesh M",
    age: 35,
    gender: "M",
    status: "Walk-in · New Patient",
    statusColor: "#3B82F6",
    specialty: "General Medicine (First Visit)",
    specialtyIcon: <User size={16} variant="Bold" />,
    tagline: "Zero prior data — demonstrates first-time patient workflow with intake-only data",
    symptoms: ["Knee Pain (1wk, right knee, worse on stairs)", "Morning Stiffness (3d, 15-20 min)"],
    conditions: ["None (new patient)"],
    keyData: [
      "Allergy: Sulfonamides",
      "History: Childhood asthma (resolved), Appendectomy 2018",
      "Current meds: Vitamin D3 60K weekly, Calcium 500mg daily",
      "No vitals, no labs, no prior visits",
    ],
    cannedPills: ["Review intake data", "Suggest DDX", "Allergy: Sulfonamides", "Initial workup"],
    cardsDemoed: [
      "symptom_collector — Patient-reported intake (symptoms, history, meds)",
      "ddx — Osteoarthritis vs RA vs Gout differential",
      "investigation_bundle — Knee pain workup (X-ray, CBC, ESR, CRP, Uric acid, RA factor)",
      "protocol_meds — Paracetamol + Diclofenac + Pantoprazole + Calcium",
      "advice_bundle — Rest knee, ice pack, calcium diet, avoid Sulfonamides",
      "follow_up — 1 week (X-ray review)",
    ],
    workflow: [
      "Agent opens with intake card (no patient summary — first visit)",
      "Pills show: Review intake, Suggest DDX, Allergy alert, Initial workup",
      "No 'Last visit', 'Lab overview', or 'Vital trends' pills (data doesn't exist)",
      "DDX generates musculoskeletal differentials specific to knee pain",
      "Protocol meds are knee-pain-specific (not generic fever meds)",
      "Investigations include X-ray and arthritis workup",
    ],
    alerts: ["Sulfonamides allergy (Layer 1 force pill)"],
  },
  {
    id: "__patient__",
    name: "Shyam GR",
    age: 25,
    gender: "M",
    status: "Follow-up · Unfulfilled",
    statusColor: "#F59E0B",
    specialty: "General Medicine + Diabetology",
    specialtyIcon: <Activity size={16} variant="Bold" />,
    tagline: "Complex multi-morbidity patient — DM + HTN with acute fever overlay. 7 flagged labs, critical vitals",
    symptoms: ["Fever (3d, evening spikes)", "Dry Cough (2d, night worsening)"],
    conditions: ["Diabetes (1yr)", "Hypertension (6mo)"],
    keyData: [
      "Allergies: Dust, Egg, Prawns",
      "BP: 70/60 (critical low), SpO₂: 93% (declining), Temp: 104°F",
      "7 flagged labs: HbA1c 8.1%, FBS 168, TSH 5.8, LDL 142, Vit D 18, Creatinine 1.4, Microalbumin 45",
      "Follow-up overdue 5 days",
      "Last visit: 27 Jan'26 — Viral fever + Conjunctivitis",
    ],
    cannedPills: ["Review SpO₂ (critical)", "Allergy Alert", "7 lab values flagged", "Follow-up overdue 5d", "BP needs attention", "Temperature elevated"],
    cardsDemoed: [
      "symptom_collector — Pre-visit symptoms + questions to doctor",
      "patient_summary — Full clinical summary with all sections",
      "lab_panel — 7 flagged values with insight",
      "vitals_trend_line — SpO₂ declining trend (97→93%)",
      "lab_comparison — Previous vs current lab values",
      "last_visit — 27 Jan visit details with copy-all",
      "ddx — Dengue/Leptospirosis/Viral Fever differential",
      "protocol_meds — Fever protocol (Paracetamol + Cetirizine + Pantoprazole)",
      "investigation_bundle — CBC, CRP, LFT, Dengue NS1",
      "drug_interaction / allergy_conflict — Allergy-aware prescribing",
      "completeness — Documentation checklist",
      "translation — Advice in Hindi/Telugu",
      "voice_structured_rx — Voice-to-structured prescription",
      "ocr_pathology — Lab report OCR extraction",
    ],
    workflow: [
      "Agent opens with intake card showing symptoms + patient questions",
      "Layer 1 safety pills fire immediately: SpO₂ review, Allergy Alert",
      "Layer 2 clinical pills: 7 flagged labs, BP attention, Temp elevated, F/U overdue",
      "Phase transitions: empty → symptoms_entered → dx_accepted → meds_written → near_complete",
      "Each phase shows relevant next-step pills",
      "Full voice-to-RxPad workflow demonstrable",
      "Document upload → OCR extraction demonstrable",
    ],
    alerts: ["SpO₂ < 95% (Layer 1)", "3 allergies (Layer 1)", "7 lab flags (Layer 2)", "BP critical (Layer 2)", "Temp elevated (Layer 2)", "Follow-up overdue (Layer 2)"],
  },
  {
    id: "apt-anjali",
    name: "Anjali Patel",
    age: 28,
    gender: "F",
    status: "New Visit",
    statusColor: "#3B82F6",
    specialty: "GP + Ophthalmology + Gynecology",
    specialtyIcon: <Eye size={16} variant="Bold" />,
    tagline: "Multi-specialty patient — migraine with eye strain + gynec baseline. Demonstrates cross-specialty workflow",
    symptoms: ["Headache (4d, frontal, throbbing)", "Photophobia (2d, mild)"],
    conditions: ["Migraine (episodic)"],
    keyData: [
      "No allergies",
      "Vitamin D: 18 ng/mL (low)",
      "Screen time >8hr/day",
      "Gynec: Regular cycles, LMP 10 Feb'26",
      "Ophthal: VA 6/6, digital eye strain alert",
      "Last visit: 15 Jan'26 — Migraine without aura",
    ],
    cannedPills: ["Patient summary", "Vision summary", "Lab overview", "Last visit details"],
    cardsDemoed: [
      "symptom_collector — Headache + photophobia intake",
      "patient_summary — GP clinical summary",
      "ophthal_summary — VA, fundus, digital eye strain",
      "gynec_summary — Cycle data, LMP",
      "ddx — SAH vs Migraine vs Tension headache vs Cluster vs Eye strain",
      "protocol_meds — Sumatriptan + Naproxen + Vitamin D3 + Amitriptyline",
      "investigation_bundle — Vitamin D, B12, CBC, Thyroid panel",
      "advice_bundle — 20-20-20 rule, sleep schedule, migraine diary",
      "follow_up — 2 weeks (prophylaxis assessment)",
    ],
    workflow: [
      "Agent opens with intake card",
      "Specialty tabs available: GP, Ophthal, Gynec",
      "Vision summary shows digital eye strain alert — relevant to migraine",
      "DDX includes eye strain headache specific to this patient",
      "Protocol meds include migraine prophylaxis (Amitriptyline)",
      "Advice includes screen time management",
    ],
    alerts: [],
  },
  {
    id: "apt-vikram",
    name: "Vikram Singh",
    age: 42,
    gender: "M",
    status: "Follow-up · Overdue",
    statusColor: "#EF4444",
    specialty: "GP + Cardiology + Ophthalmology",
    specialtyIcon: <Heart size={16} variant="Bold" />,
    tagline: "Metabolic syndrome patient — HTN + dyslipidemia + pre-diabetes with 12-day overdue follow-up",
    symptoms: ["Fatigue (2wk, persistent)", "Poor Sleep (2wk, difficulty staying asleep)"],
    conditions: ["Hypertension (3yr)", "Dyslipidemia (1yr)", "Pre-diabetes"],
    keyData: [
      "Allergy: Sulfa drugs",
      "BP: 138/88 (elevated), BMI: 27.7 (overweight)",
      "3 flagged labs: LDL 138, HbA1c 6.2, Triglycerides 195",
      "ECG pending, Lipid recheck overdue",
      "Ophthal: Presbyopia onset, Grade I arteriolar narrowing",
      "Family history: CAD (Father), DM (Mother)",
    ],
    cannedPills: ["Allergy Alert", "3 lab values flagged", "Follow-up overdue 12d", "Vision summary", "Patient summary"],
    cardsDemoed: [
      "symptom_collector — Fatigue + sleep intake",
      "patient_summary — Metabolic risk profile",
      "ophthal_summary — Arteriolar narrowing correlating with HTN",
      "ddx — OSA vs Metabolic fatigue vs Hypothyroidism vs Depression",
      "protocol_meds — Continue Telma/Rosuvastatin + CoQ10 + Melatonin",
      "investigation_bundle — ECG, Lipid panel, HbA1c, TSH, Sleep study",
      "advice_bundle — Dinner by 8 PM, no screens, walk 30 min, limit alcohol",
      "follow_up — 2 weeks (ECG + lab review)",
    ],
    workflow: [
      "Follow-up overdue 12 days — prominently shown",
      "Layer 2 pills: 3 flagged labs, overdue F/U, BP elevated",
      "Ophthal data shows arteriolar narrowing — cross-correlates with HTN",
      "DDX includes sleep apnea and depression screening",
      "Investigations include pending ECG",
    ],
    alerts: ["Sulfa allergy (Layer 1)", "3 lab flags (Layer 2)", "Follow-up overdue 12d (Layer 2)", "BP elevated (Layer 2)"],
  },
  {
    id: "apt-priya",
    name: "Priya Rao",
    age: 26,
    gender: "F",
    status: "Routine ANC",
    statusColor: "#8B5CF6",
    specialty: "Obstetrics (High-risk Pregnancy)",
    specialtyIcon: <Heart size={16} variant="Bold" />,
    tagline: "Primigravida at 38 weeks — borderline BP, family history of pre-eclampsia. Demonstrates obstetric workflow",
    symptoms: ["Pedal Edema (3d, bilateral ankle)", "Lower Back Pain (2d, moderate)"],
    conditions: ["Hypothyroid (2yr)"],
    keyData: [
      "Allergy: Sulfa drugs",
      "G1P0, LMP 14 Jun'25, EDD 21 Mar'26, 38wk",
      "BP: 130/85 (borderline), Presentation: Cephalic, FHR: Active",
      "Hb: 11.2 (low), TSH: 4.8 (high)",
      "ANC due: Dating scan (overdue), NT scan (due)",
      "Family: Pre-eclampsia (Mother), GDM (Sister)",
    ],
    cannedPills: ["Allergy Alert", "Obstetric summary", "Patient summary", "Vital trends"],
    cardsDemoed: [
      "symptom_collector — Edema + back pain intake",
      "patient_summary — Clinical summary with obstetric context",
      "obstetric_summary — Full G/P/A/E, EDD, presentation, oedema, ANC due, vaccines",
      "ddx — Pre-eclampsia vs Physiological edema vs DVT vs Lumbar strain",
      "protocol_meds — Thyronorm + Folic Acid + Iron + Calcium (ANC protocol)",
      "investigation_bundle — BP chart, 24hr urine protein, NST, TSH, CBC",
      "advice_bundle — Left lateral position, leg elevation, fetal kick count, danger signs",
      "follow_up — 3 days (weekly ANC at 38wk + BP monitoring)",
    ],
    workflow: [
      "Specialty tabs: GP, Obstetric",
      "Obstetric summary card shows full pregnancy overview",
      "ANC due items highlighted (overdue scans)",
      "DDX is pregnancy-specific (Pre-eclampsia vs DVT vs Physiological)",
      "Protocol meds are pregnancy-safe ANC medications",
      "Follow-up is more frequent (3 days) due to 38wk + borderline BP",
      "Advice includes danger signs for immediate reporting",
    ],
    alerts: ["Sulfa allergy (Layer 1)", "Obstetric specialty (Layer 2)"],
  },
  {
    id: "apt-arjun",
    name: "Arjun S",
    age: 4,
    gender: "M",
    status: "Follow-up",
    statusColor: "#3B82F6",
    specialty: "Pediatrics",
    specialtyIcon: <Heart size={16} variant="Bold" />,
    tagline: "4-year-old with growth concerns — weight below expected, speech delay, vaccine overdue. Demonstrates pediatric workflow",
    symptoms: ["Dry Cough (3d, worse at night)", "Reduced Appetite (1wk, mild)"],
    conditions: ["None"],
    keyData: [
      "No allergies",
      "Weight: 14kg (15th percentile — below expected)",
      "Height: 98cm (25th percentile)",
      "Speech delay: 2-word sentences only at 4yrs",
      "MMR-2 vaccine overdue",
      "Feeding: Picky eater, milk-dependent",
      "Family: Asthma (Father)",
    ],
    cannedPills: ["Growth & vaccines", "Patient summary", "Vital trends", "Ask me anything"],
    cardsDemoed: [
      "symptom_collector — Cough + appetite intake",
      "patient_summary — Pediatric clinical overview",
      "pediatric_summary — Growth percentiles, milestones, vaccines, feeding notes, alerts",
      "ddx — Pertussis vs Reactive airways vs Post-nasal drip vs FB aspiration vs TB",
      "protocol_meds — Salbutamol syrup + Cetirizine + Honey + Multivitamin",
      "investigation_bundle — CBC, Chest X-ray, IgE levels, Speech assessment",
      "advice_bundle — Steam inhalation, solid food, MMR-2 schedule, speech therapy, screen limit",
      "follow_up — 5 days (reassess cough + appetite)",
    ],
    workflow: [
      "Specialty tabs: GP, Pediatrics",
      "Pediatric summary shows growth chart concerns prominently",
      "MMR-2 overdue highlighted in due alerts",
      "Speech delay noted — investigation includes speech assessment",
      "DDX is pediatric-specific (Pertussis, reactive airways)",
      "Protocol meds are pediatric doses (syrups, not tablets)",
      "Advice includes developmental guidance (speech therapy, screen time)",
    ],
    alerts: ["Pediatric growth concern (Layer 2)", "MMR-2 overdue (due alerts)"],
  },
  {
    id: "apt-lakshmi",
    name: "Lakshmi K",
    age: 45,
    gender: "F",
    status: "Follow-up · Starred",
    statusColor: "#EC4899",
    specialty: "Gynecology + Endocrinology",
    specialtyIcon: <Woman size={16} variant="Bold" />,
    tagline: "Perimenopausal patient — heavy AUB + iron deficiency anemia + hypothyroid. Demonstrates gynecology workflow",
    symptoms: ["Heavy Menstrual Bleeding (6mo, 5 pads/day)", "Fatigue (3mo, increasing)"],
    conditions: ["PCOS (2018)", "Partial thyroidectomy (2020)", "Hypothyroid on Rx"],
    keyData: [
      "Allergy: Ibuprofen",
      "Hb: 9.2 g/dL (iron deficiency anemia)",
      "TSH: 6.8 (high), FBS: 112 (borderline high)",
      "Cycles: Irregular 35-40d, Flow: Heavy 7d (5 pads/day)",
      "Pap smear >1yr overdue, USG pelvis pending",
      "Family: Breast cancer (Aunt), Thyroid (Mother)",
    ],
    cannedPills: ["Allergy Alert", "3 lab values flagged", "Gynec summary", "Patient summary"],
    cardsDemoed: [
      "symptom_collector — Heavy bleeding + fatigue intake",
      "patient_summary — Gynec + endocrine clinical summary",
      "gynec_summary — Full cycle data, LMP, Pap smear status, flow intensity, alerts",
      "ddx — Endometrial carcinoma vs AUB-OD vs Fibroids vs Coagulopathy vs Thyroid AUB",
      "protocol_meds — Thyronorm + Autrin + Tranexamic acid + Vitamin C",
      "investigation_bundle — USG pelvis, Pap smear, CBC, Iron studies, Thyroid panel",
      "advice_bundle — Iron-rich diet, Vit C with iron, AVOID Ibuprofen, cycle tracking",
      "follow_up — 2 weeks (USG + Pap smear results)",
    ],
    workflow: [
      "Specialty tabs: GP, Gynec",
      "Gynec summary shows compound alert: Heavy flow + low Hb",
      "Pap smear overdue prominently flagged",
      "DDX is gynec-specific (AUB differential)",
      "Protocol meds include anemia management + thyroid continuation",
      "Ibuprofen allergy specifically mentioned in advice",
      "Investigations include overdue Pap smear",
    ],
    alerts: ["Ibuprofen allergy (Layer 1)", "3 lab flags (Layer 2)", "Gynec specialty (Layer 2)"],
  },
  {
    id: "reg-suresh",
    name: "Suresh Nair",
    age: 58,
    gender: "M" as const,
    status: "Walk-in · No Intake",
    statusColor: "#64748B",
    specialty: "General Medicine + Cardiology",
    specialtyIcon: <Heart size={16} variant="Bold" />,
    tagline: "Returning patient with full history but NO symptom collector. Demonstrates history-only workflow without self-reported data",
    symptoms: ["No self-reported symptoms (did not use intake form)"],
    conditions: ["Ischemic Heart Disease (2024, post-angioplasty)", "Hypertension (5yr)", "Dyslipidemia (3yr)"],
    keyData: [
      "Allergy: Aspirin (GI intolerance → Clopidogrel)",
      "LDL: 118 mg/dL (above target <100)",
      "Triglycerides: 178 mg/dL (above target <150)",
      "On 4 active medications (Clopidogrel, Atorvastatin, Metoprolol, Telmisartan)",
      "Last visit: 10 Feb'26 — stable IHD, controlled HTN",
      "ECG due (annual), Echo follow-up pending",
      "Family: MI (Father, 55), Stroke (Mother, 68)",
    ],
    cannedPills: ["Aspirin allergy", "2 lab flags", "Patient summary", "Lab comparison"],
    cardsDemoed: [
      "patient_summary — Built from historical data only (no symptom collector section)",
      "last_visit — Previous visit with 4-drug regimen, clear examination, lab suggestions",
      "lab_comparison — LDL trending down (142→128→118) but still above target",
      "ddx — Stable IHD differentials: medication optimization vs lifestyle vs new symptoms",
      "protocol_meds — Statin intensification, continue dual antiplatelet",
      "investigation_bundle — ECG, Echo, Lipid panel, Renal panel",
    ],
    workflow: [
      "Agent opens with patient summary from HISTORICAL data (no intake data available)",
      "No symptom collector card shown (patient didn't fill intake)",
      "Intro message acknowledges no new symptoms reported",
      "Pills: Patient summary, Lab overview, Last visit, Vital trends",
      "Phase starts at 'empty' but with rich historical context",
      "DDX focuses on risk stratification, not acute presentation",
    ],
    alerts: ["Aspirin allergy (Layer 1)", "2 lab flags (Layer 2)"],
  },
]

// ─── Card Type Families ──────────────────────────────────────

interface CardFamily {
  name: string
  icon: React.ReactNode
  cards: { kind: string; description: string }[]
}

const CARD_FAMILIES: CardFamily[] = [
  {
    name: "Patient Data",
    icon: <User size={14} variant="Bold" />,
    cards: [
      { kind: "patient_summary", description: "Full clinical summary with all sections — vitals, labs, history, meds" },
      { kind: "symptom_collector", description: "Patient-reported pre-visit intake — symptoms, history, meds, questions" },
      { kind: "last_visit", description: "Previous visit details with section-wise breakdown and copy-all" },
      { kind: "med_history", description: "Medication history entries with source and insight" },
    ],
  },
  {
    name: "Specialty Summaries",
    icon: <Hospital size={14} variant="Bold" />,
    cards: [
      { kind: "obstetric_summary", description: "Pregnancy overview — G/P/A, EDD, gestational age, ANC, vaccines" },
      { kind: "gynec_summary", description: "Gynecological data — cycles, LMP, flow, Pap smear, alerts" },
      { kind: "pediatric_summary", description: "Growth percentiles, milestones, vaccines, feeding notes" },
      { kind: "ophthal_summary", description: "Visual acuity, IOP, fundus, glass prescription, alerts" },
    ],
  },
  {
    name: "Labs & Vitals",
    icon: <Microscope size={14} variant="Bold" />,
    cards: [
      { kind: "lab_panel", description: "Flagged lab results with reference ranges and insight" },
      { kind: "lab_comparison", description: "Side-by-side previous vs current lab values with deltas" },
      { kind: "lab_trend", description: "Single parameter trend over time (e.g., HbA1c)" },
      { kind: "vitals_trend_bar", description: "Vital parameter trend as bar chart" },
      { kind: "vitals_trend_line", description: "Vital parameter trend as line chart with threshold" },
    ],
  },
  {
    name: "Clinical Decision Support",
    icon: <Cpu size={14} variant="Bold" />,
    cards: [
      { kind: "ddx", description: "Differential diagnosis — can't miss / most likely / consider buckets" },
      { kind: "protocol_meds", description: "Medication suggestions with allergy safety check and copy-to-RxPad" },
      { kind: "investigation_bundle", description: "Lab/imaging suggestions with rationale and selective copy" },
      { kind: "follow_up", description: "Follow-up scheduling with recommended interval and reasoning" },
      { kind: "drug_interaction", description: "Drug-drug interaction warnings" },
      { kind: "allergy_conflict", description: "Drug-allergen conflict alerts with alternatives" },
    ],
  },
  {
    name: "Workflow & Utility",
    icon: <DocumentText size={14} variant="Bold" />,
    cards: [
      { kind: "completeness", description: "Documentation checklist showing filled/empty sections" },
      { kind: "advice_bundle", description: "Patient advice with share message and copy-to-RxPad" },
      { kind: "translation", description: "Advice translated to Hindi/Telugu with copy" },
      { kind: "voice_structured_rx", description: "Voice-to-structured prescription with section parsing" },
      { kind: "ocr_pathology", description: "Lab report OCR extraction with flagged values" },
      { kind: "ocr_extraction", description: "Generic document OCR with section-wise extraction" },
      { kind: "text_fact / text_alert / text_list", description: "Simple text responses — facts, alerts, bullet lists" },
      { kind: "follow_up_question", description: "Interactive question with selectable options" },
    ],
  },
  {
    name: "Homepage Operations",
    icon: <Activity size={14} variant="Bold" />,
    cards: [
      { kind: "welcome_card", description: "Today's schedule overview with stats and quick actions" },
      { kind: "patient_list", description: "Queue/list of patients with status badges" },
      { kind: "follow_up_list", description: "Overdue follow-up list with scheduling" },
      { kind: "revenue_bar", description: "Revenue tracking — paid vs due by day" },
      { kind: "donut_chart / pie_chart", description: "Categorical distribution visualizations" },
      { kind: "line_graph", description: "Trend visualization (footfall, revenue over time)" },
      { kind: "analytics_table", description: "Weekly KPI table with delta indicators" },
      { kind: "condition_bar", description: "Condition frequency bar chart" },
      { kind: "heatmap", description: "Hour-by-day appointment density heatmap" },
      { kind: "bulk_action", description: "Bulk SMS/notification actions" },
      { kind: "external_cta", description: "Single-CTA response card for external exports (Excel/Word/link)" },
    ],
  },
]

// ─── Phase System ────────────────────────────────────────────

const PHASES = [
  { id: "empty", label: "Empty", description: "No data in RxPad yet", pills: "Patient summary, Vital trends, Lab overview (or intake-specific for new patients)" },
  { id: "symptoms_entered", label: "Symptoms Entered", description: "Symptoms added in RxPad", pills: "Suggest DDX, Compare with last visit, Vital trends" },
  { id: "dx_accepted", label: "Diagnosis Accepted", description: "Diagnosis selected in RxPad", pills: "Suggest medications, Suggest investigations, Draft advice, Plan follow-up" },
  { id: "meds_written", label: "Meds Written", description: "Medications added in RxPad", pills: "Generate advice, Translate to regional, Plan follow-up" },
  { id: "near_complete", label: "Near Complete", description: "Most sections filled", pills: "Completeness check, Translate advice, Visit summary" },
]

// ─── Page Component ──────────────────────────────────────────

type PageTab = "summary-logic" | "intent-classification" | "design-system" | "scenarios"

export default function ScenariosPage() {
  const [expandedPatient, setExpandedPatient] = useState<string | null>("apt-zerodata")
  const [activeTab, setActiveTab] = useState<PageTab>("summary-logic")

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tp-appointment-screen"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <ArrowLeft2 size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-[8px]">
                <h1 className="text-[18px] font-bold text-slate-800">Dr. Agent — Documentation</h1>
                <span className="rounded-[4px] bg-amber-50 border border-amber-200/60 px-[6px] py-[1px] text-[9px] font-semibold text-amber-600 uppercase tracking-wide">
                  Internal Reference Only
                </span>
              </div>
              <p className="text-[12px] text-slate-500">
                Demo scenarios, card catalog, summary generation logic, and UI design system &middot; Not for production or client-facing use
              </p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {([
                { id: "summary-logic" as PageTab, label: "Patient Summary Logic", icon: <DocumentText size={14} variant="Bold" /> },
                { id: "intent-classification" as PageTab, label: "Intent Classification", icon: <Cpu size={14} variant="Bold" /> },
                { id: "design-system" as PageTab, label: "Design System", icon: <Brush2 size={14} variant="Bold" /> },
              ]).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dr-agent-design-system"
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-100"
                target="_blank"
              >
                <ExportSquare size={14} variant="Bold" />
                Full Design Spec
              </Link>
              <button
                type="button"
                onClick={() => setActiveTab("scenarios")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  activeTab === "scenarios"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                }`}
                title="Demo Scenarios (internal)"
              >
                <Eye size={16} variant="Bold" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "design-system" ? (
        <div className="mx-auto max-w-5xl px-6 py-8">
          <DesignSystemTab />
        </div>
      ) : activeTab === "intent-classification" ? (
        <div className="mx-auto max-w-7xl px-6 py-8">
          <IntentClassificationContent />
        </div>
      ) : activeTab === "summary-logic" ? (
        <div className="mx-auto max-w-5xl px-6 py-8">
          <PatientSummaryLogicTab />
        </div>
      ) : (
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* ─── Dr. Agent — Intro & Overview ────────────────────── */}
        <section className="mb-10">
          <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-blue-50/40 p-5">
            <h2 className="mb-1 text-[16px] font-bold text-slate-800">What is Dr. Agent?</h2>
            <p className="mb-4 text-[12px] leading-relaxed text-slate-600">
              Dr. Agent is not just an AI assistant — it{"'"}s an <strong>AI co-pilot for doctors</strong> embedded directly into the TatvaPractice EMR workflow.
              It sits alongside the prescription pad (RxPad) and provides real-time, context-aware clinical intelligence during patient consultations.
            </p>

            {/* AAGUI & A2UI */}
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-violet-200/40 bg-white/70 p-3">
                <h3 className="mb-1 text-[11px] font-bold text-violet-700">AAGUI — AI-Augmented GUI</h3>
                <p className="text-[10px] leading-relaxed text-slate-600">
                  Traditional EMRs need doctors to navigate multiple screens. AAGUI embeds AI into existing UI surfaces — every card, sidebar section, and header becomes an AI touchpoint. AI is part of the interface, not a separate chat window.
                </p>
              </div>
              <div className="rounded-lg border border-violet-200/40 bg-white/70 p-3">
                <h3 className="mb-1 text-[11px] font-bold text-violet-700">A2UI — Agent-to-UI Communication</h3>
                <p className="text-[10px] leading-relaxed text-slate-600">
                  Bidirectional: AI generates structured outputs (cards, charts) that render natively in the EMR. Doctor interactions (pills, sidebar clicks, copy-to-RxPad) feed context back. The doctor never leaves their workflow.
                </p>
              </div>
            </div>

            {/* v0 Feature Highlights */}
            <h3 className="mb-2 text-[12px] font-bold text-slate-700">v0 Capabilities</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
              {[
                { title: "Patient Intelligence", desc: "Auto-loads summary, chronic conditions, allergies, labs, vitals" },
                { title: "Specialty-Aware", desc: "GP, Gynec, Obstetric, Pediatrics, Ophthalmology — auto-detects" },
                { title: "30+ Card Types", desc: "Summary, data, action, utility, safety, homepage analytics cards" },
                { title: "Smart Prompt System", desc: "Phase-aware, tab-aware, patient-data-aware canned pills" },
                { title: "Voice-to-Structured Rx", desc: "Dictate consultation → AI parses into structured Rx sections" },
                { title: "Document OCR", desc: "Upload reports → AI extracts structured data for review" },
                { title: "Sidebar AI Integration", desc: "Hover AI icons on any sidebar section for instant analysis" },
                { title: "Clinic Overview", desc: "Schedule, follow-ups, revenue, analytics from homepage" },
              ].map(f => (
                <div key={f.title} className="mb-1">
                  <span className="text-[10px] font-semibold text-violet-600">{f.title}</span>
                  <p className="text-[9px] leading-[1.4] text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* UX Principles — single line */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["Zero workflow disruption", "Copy-first actions", "Progressive disclosure", "Hover-to-discover", "Trust indicators on every output"].map(p => (
                <span key={p} className="rounded-full bg-white/80 border border-violet-200/40 px-2 py-0.5 text-[9px] font-medium text-violet-600">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Demo Flow Guide — Step-by-Step Story ────────────── */}
        <section className="mb-10">
          <h2 className="mb-3 text-[15px] font-bold text-slate-800">Demo Flow Guide</h2>
          <p className="mb-4 text-[11px] text-slate-500">
            A step-by-step story to walk through the Dr. Agent experience. Follow these acts sequentially for a complete demo.
          </p>
          <div className="space-y-3">
            {[
              {
                act: "Act 1", title: "Clinic Overview", steps: [
                  { step: "1", action: "Open Appointments page", detail: "Navigate to Appointments in the left sidebar — see the appointments table with today's queue" },
                  { step: "2", action: "Open Dr. Agent", detail: "Click the Dr. Agent edge tag (curved glass shape on the right edge) — agent panel slides in" },
                  { step: "3", action: "Explore the Welcome Card", detail: "Today's Schedule card shows: context line, 6 stats in a 3-column grid (Queued, Follow-ups, Finished, Drafts, Cancelled, P.Digitisation)" },
                  { step: "4", action: "Try the canned pills", detail: "Click 'Follow-ups due' → shows follow-up list. Click 'Revenue today' → shows revenue bar chart" },
                  { step: "5", action: "Send SMS Reminders", detail: "In Follow-up list, click 'Remind' on patients → green tick confirmation. Or click 'Send reminder to all'" },
                ],
              },
              {
                act: "Act 2", title: "Patient Consultation", steps: [
                  { step: "6", action: "Open a patient", detail: "Click 'TypeRx' on any patient row — RxPad opens with prescription form on left, Dr. Agent on right" },
                  { step: "7", action: "Patient Intake Card", detail: "Dr. Agent auto-shows the Patient Reported card with symptoms, severity, chronic conditions, medications" },
                  { step: "8", action: "AI-Powered Cards", detail: "Click 'Suggest DDX' → differential diagnoses. Click 'Initial investigations' → lab tests to order" },
                  { step: "9", action: "Fill to RxPad", detail: "Click fill icon in card header → data fills into the RxPad section. Use section-specific fill for targeted placement" },
                  { step: "10", action: "Voice Dictation", detail: "Click voice icon → recording UI with animated wave bars → dictate consultation → AI structures into Rx sections → Accept all" },
                ],
              },
              {
                act: "Act 3", title: "Sidebar AI Integration", steps: [
                  { step: "11", action: "Hover AI Icons", detail: "Click any sidebar tab (Vitals, History, Labs) → hover card headers → AI spark icon appears → click for analysis" },
                  { step: "12", action: "Deep-Link Navigation", detail: "Cards with sidebar links (e.g., 'View full vitals') navigate to the relevant sidebar tab — panels stay synced" },
                ],
              },
              {
                act: "Act 4", title: "Specialty Switching", steps: [
                  { step: "13", action: "Switch specialties", detail: "In header, click specialty dropdown (GP default). Switch to Gynec → Lakshmi K. Obstetric → Priya Rao. Pediatrics → Arjun S" },
                ],
              },
              {
                act: "Act 5", title: "Document Upload", steps: [
                  { step: "14", action: "Upload a document", detail: "Click + icon in input → select type (Pathology, Radiology, Prescription) → OCR card with structured data → review and copy" },
                ],
              },
            ].map(act => (
              <div key={act.act} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{act.act}</span>
                  <h3 className="text-[12px] font-semibold text-slate-700">{act.title}</h3>
                </div>
                <div className="space-y-2">
                  {act.steps.map(s => (
                    <div key={s.step} className="flex gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                        {s.step}
                      </span>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-700">{s.action}</span>
                        <p className="text-[10px] leading-relaxed text-slate-500">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Talking Points */}
          <div className="mt-4 rounded-lg border border-violet-200/40 bg-violet-50/50 p-3">
            <h3 className="mb-2 text-[11px] font-bold text-violet-700">Key Talking Points</h3>
            <div className="grid gap-1 sm:grid-cols-2">
              {[
                ["AAGUI", "AI is embedded into the interface, not a separate chat window"],
                ["A2UI", "The agent and UI talk to each other — cards trigger sidebar, sidebar triggers agent"],
                ["Zero disruption", "Doctor never leaves the RxPad. Everything happens in the side panel"],
                ["Progressive intelligence", "Start simple, drill deeper. Summary → Detail → Action"],
                ["Voice-first", "Dictate the entire consultation, AI structures it for you"],
                ["Trust by design", "Every AI output has a trust indicator, copy actions are explicit, nothing auto-fills"],
              ].map(([label, desc]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-[10px] font-bold text-violet-600 flex-shrink-0">{label}:</span>
                  <span className="text-[10px] text-slate-600">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-10">
          <h2 className="mb-3 text-[15px] font-bold text-slate-800">How It Works</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Smart Canned Pills", desc: "Pills at the bottom of the agent panel are generated dynamically based on the patient's actual data. New patients see 'Review intake' and 'Suggest DDX' — not 'Last visit' or 'Flagged labs'." },
              { label: "Phase-Based Updates", desc: "As you add symptoms, diagnosis, and medications in RxPad, the canned pills automatically update to suggest the next logical step (DDX → Meds → Advice → Follow-up)." },
              { label: "Per-Patient Responses", desc: "Every card response (DDX, medications, investigations, advice, follow-up) is tailored to the specific patient's symptoms, conditions, and clinical context." },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-1 text-[12px] font-semibold text-violet-600">{item.label}</h3>
                <p className="text-[11px] leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Patient Scenarios */}
        <section className="mb-10">
          <h2 className="mb-4 text-[15px] font-bold text-slate-800">Patient Scenarios ({PATIENT_SCENARIOS.length})</h2>
          <div className="space-y-3">
            {PATIENT_SCENARIOS.map((patient) => {
              const isExpanded = expandedPatient === patient.id
              return (
                <div
                  key={patient.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
                >
                  {/* Patient Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedPatient(isExpanded ? null : patient.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ background: patient.statusColor }}
                    >
                      {patient.specialtyIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-800">{patient.name}</span>
                        <span className="text-[11px] text-slate-400">{patient.gender}, {patient.age}y</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-semibold text-white"
                          style={{ background: patient.statusColor }}
                        >
                          {patient.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{patient.tagline}</p>
                    </div>
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`flex-shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 pb-4 pt-3">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-3">
                          <DetailBlock title="Specialty" items={[patient.specialty]} />
                          <DetailBlock title="Today's Symptoms" items={patient.symptoms} />
                          <DetailBlock title="Chronic Conditions" items={patient.conditions} />
                          <DetailBlock title="Key Clinical Data" items={patient.keyData} />
                          <DetailBlock title="Safety Alerts" items={patient.alerts.length > 0 ? patient.alerts : ["None"]} isAlert />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                          <DetailBlock title="Canned Pills Shown" items={patient.cannedPills} isPill />
                          <DetailBlock title="Cards Demonstrated" items={patient.cardsDemoed} />
                          <DetailBlock title="Workflow Steps" items={patient.workflow} isNumbered />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Card Types */}
        <section className="mb-10">
          <h2 className="mb-4 text-[15px] font-bold text-slate-800">Card Types ({CARD_FAMILIES.reduce((s, f) => s + f.cards.length, 0)})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {CARD_FAMILIES.map((family) => (
              <div key={family.name} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                    {family.icon}
                  </span>
                  <h3 className="text-[12px] font-bold text-slate-700">{family.name}</h3>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                    {family.cards.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {family.cards.map((card) => (
                    <div key={card.kind} className="flex gap-2">
                      <code className="mt-0.5 flex-shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[9px] font-mono text-violet-600">
                        {card.kind}
                      </code>
                      <span className="text-[10px] leading-relaxed text-slate-500">{card.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Phase System */}
        <section className="mb-10">
          <h2 className="mb-4 text-[15px] font-bold text-slate-800">Consultation Phase System</h2>
          <p className="mb-3 text-[11px] text-slate-500">
            As the doctor progresses through the consultation in RxPad, the agent's canned pills automatically update to suggest the next step.
            Phases advance when RxPad signals: symptoms added → diagnosis selected → medications written.
          </p>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((phase, i) => (
              <div key={phase.id} className="flex-1 rounded-xl border border-slate-200 bg-white p-3" style={{ minWidth: 160 }}>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">{phase.label}</span>
                </div>
                <p className="mb-1 text-[10px] text-slate-400">{phase.description}</p>
                <p className="text-[10px] leading-relaxed text-slate-600">
                  <span className="font-medium text-violet-600">Pills:</span> {phase.pills}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Homepage Tabs */}
        <section className="mb-10">
          <h2 className="mb-3 text-[15px] font-bold text-slate-800">Homepage Appointment Tabs</h2>
          <div className="grid gap-2 sm:grid-cols-5">
            {[
              { tab: "Queue", count: 7, cta: "TypeRx (split button)", desc: "Active patients waiting. Primary CTA opens RxPad." },
              { tab: "Finished", count: 3, cta: "Print Rx", desc: "Completed consultations. Review and print." },
              { tab: "Cancelled", count: 2, cta: "None (menu only)", desc: "Cancelled appointments with reasons." },
              { tab: "Draft", count: 2, cta: "Resume Rx", desc: "Partially completed prescriptions." },
              { tab: "Pending Digitisation", count: 2, cta: "Digitise Rx", desc: "Inpatient records awaiting digitisation." },
            ].map((item) => (
              <div key={item.tab} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">{item.tab}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">{item.count}</span>
                </div>
                <p className="mt-1 text-[10px] text-violet-600">{item.cta}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage Matrix */}
        <section className="mb-10">
          <h2 className="mb-3 text-[15px] font-bold text-slate-800">Coverage Matrix</h2>
          <p className="mb-3 text-[11px] text-slate-500">
            Which patient demonstrates which workflow and specialty feature.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-2 py-1.5 text-left font-semibold text-slate-600">Feature</th>
                  {PATIENT_SCENARIOS.map((p) => (
                    <th key={p.id} className="px-2 py-1.5 text-center font-semibold text-slate-600">{p.name.split(" ")[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["New patient flow", "apt-zerodata"],
                  ["Follow-up overdue", "__patient__,apt-vikram"],
                  ["Multi-morbidity (DM+HTN)", "__patient__"],
                  ["Obstetric workflow", "apt-priya"],
                  ["Gynecology workflow", "apt-lakshmi,apt-anjali"],
                  ["Pediatric workflow", "apt-arjun"],
                  ["Ophthalmology data", "apt-anjali,apt-vikram"],
                  ["Allergy alerts", "__patient__,apt-vikram,apt-priya,apt-lakshmi,apt-zerodata"],
                  ["Lab flags (\u22653)", "__patient__,apt-vikram,apt-lakshmi"],
                  ["Critical vitals", "__patient__"],
                  ["Voice-to-RxPad", "__patient__"],
                  ["Document OCR", "__patient__"],
                  ["Translation", "__patient__"],
                  ["Drug interaction checks", "__patient__,apt-lakshmi"],
                ].map(([feature, ids]) => (
                  <tr key={feature as string} className="border-t border-slate-100">
                    <td className="px-2 py-1.5 font-medium text-slate-700">{feature}</td>
                    {PATIENT_SCENARIOS.map((p) => (
                      <td key={p.id} className="px-2 py-1.5 text-center">
                        {(ids as string).split(",").includes(p.id) ? (
                          <span className="inline-block h-3 w-3 rounded-full bg-green-400" />
                        ) : (
                          <span className="inline-block h-3 w-3 rounded-full bg-slate-100" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      )}
    </div>
  )
}

// ─── Helper: Detail Block ────────────────────────────────────

function DetailBlock({
  title,
  items,
  isPill,
  isAlert,
  isNumbered,
}: {
  title: string
  items: string[]
  isPill?: boolean
  isAlert?: boolean
  isNumbered?: boolean
}) {
  return (
    <div>
      <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</h4>
      {isPill ? (
        <div className="flex flex-wrap gap-1">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-violet-200/60 bg-violet-50/60 px-2 py-0.5 text-[10px] font-medium text-violet-700"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item, i) => (
            <li
              key={item}
              className={`text-[10px] leading-relaxed ${isAlert ? "text-red-600" : "text-slate-600"}`}
            >
              {isNumbered ? `${i + 1}. ` : "\u2022 "}{item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

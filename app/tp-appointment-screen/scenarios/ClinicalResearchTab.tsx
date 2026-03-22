"use client"

import React, { useState } from "react"
import { CATALOG } from "./CardCatalogLive"
import { CardRenderer } from "@/components/tp-rxpad/dr-agent/cards/CardRenderer"

// ─────────────────────────────────────────────────────────────
// Clinical Research & Design Framework Documentation
// Covers: doctor research process, SBAR/POMR/Timeline model,
// partial data handling, source provenance, and how our cards
// implement these clinical communication standards.
// ─────────────────────────────────────────────────────────────

// ── Consultation Time Dissection (Internal Research) ──────────

const CONSULTATION_DISSECTION = {
  title: "How Doctors Actually Spend Their Consultation Time",
  description:
    "Through our in-depth research with practicing doctors — shadowing consultations and timing each phase — we observed how a typical 8-12 minute outpatient consultation actually breaks down. This time dissection became the foundation for everything Dr.Agent optimises.",
  phases: [
    {
      label: "Reading & Context-Building",
      minutes: "2–3 min",
      percent: 25,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      description:
        "The doctor opens the patient file, scans previous visit notes, checks lab results, and pieces together the clinical picture. For a chronic patient, this involves flipping between multiple tabs, deciphering handwritten referrals, and mentally constructing the patient's trajectory. This is where the most time is wasted.",
      agentRole: "Dr.Agent eliminates this by pre-building the PatientSummaryCard — the complete picture is ready before the patient walks in.",
    },
    {
      label: "Patient Interview & Examination",
      minutes: "3–4 min",
      percent: 35,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
      description:
        "Active clinical time — asking about symptoms, current complaints, medication compliance, lifestyle changes. This is the irreducible core of the consultation that cannot and should not be automated. The doctor's clinical judgment and patient rapport happen here.",
      agentRole: "The Symptom Collector pre-captures structured symptom data before the consultation, so the doctor starts the interview with context instead of from scratch.",
    },
    {
      label: "Diagnosis & Decision-Making",
      minutes: "1–2 min",
      percent: 15,
      color: "#059669",
      bgColor: "#ECFDF5",
      description:
        "Forming a differential diagnosis, deciding on investigations, choosing treatment protocols. Experienced doctors do this rapidly through pattern recognition — but miss edge cases when fatigued or rushed.",
      agentRole: "Dr.Agent surfaces DDX suggestions, flags drug interactions, and highlights cross-problem risks — acting as a safety net for clinical decision-making.",
    },
    {
      label: "Prescribing & Documentation",
      minutes: "2–3 min",
      percent: 25,
      color: "#D97706",
      bgColor: "#FFFBEB",
      description:
        "Writing prescriptions, ordering investigations, documenting findings, typing advice. This is mechanical work that consumes a quarter of the consultation — time that could be spent with the patient.",
      agentRole: "One-click copy from Dr.Agent to RxPad — medications, investigations, and advice generated contextually and ready to review, not type from scratch.",
    },
  ],
  keyInsight:
    "The fundamental insight: doctors spend 50% of consultation time on information retrieval and documentation — tasks that AI can handle — and only 50% on irreducible clinical work (examination + decision-making). Dr.Agent's job is to compress the first 50% to near-zero, giving the doctor back 4-5 minutes per patient.",
}

// ── Research Process (Dual Track) ────────────────────────────

const RESEARCH_TRACKS = [
  {
    track: "Consultation",
    label: "Doctor Shadowing & Symptom Collection",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    description:
      "Through in-depth research with doctors during live consultations, we shadowed GPs and specialists to understand the real consultation workflow — timing each phase, identifying bottlenecks, and discovering that pre-consultation symptom collection could save 2-3 minutes per patient. This led to the Symptom Collector feature and the time-dissection model that drives Dr.Agent's architecture.",
    findings: [
      "Doctors spend ~25% of consultation time just reading and building context from fragmented records",
      "Symptom collection before the consultation saves 2-3 minutes of doctor's active interview time",
      "Documentation and prescription writing consumes another 25% — most of it is mechanical and repetitive",
      "The irreducible clinical core (examination + decision) is only ~50% of actual consultation time",
      "Pre-built patient summaries transform consultations from 'information gathering' to 'clinical discussion'",
    ],
  },
  {
    track: "Cross-Specialty",
    label: "Javed & Team — Specialist Interviews",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    description:
      "Javed and team conducted in-depth interviews with nephrologists, cardiologists, endocrinologists, and general practitioners, focusing on how specialists consume patient information across departments. The core question: when a chronic disease patient walks into your consultation room, what do you need to know in the first 30 seconds vs. the first 5 minutes?",
    findings: [
      "Doctors think in layers — fast triage first, then structured problem review, then deep-dive trajectory analysis",
      "Cross-specialty handovers follow the ISBAR (Introduction-Situation-Background-Assessment-Recommendation) framework",
      "Most specialist EMR views are fragmented — doctors see only their own department's recent notes",
      "Redundant investigations are ordered because previous results from other departments are buried in the record",
      "Trend data (disease trajectory over months) is almost never available in a consumable format",
      "A confident display of uncertain data is more dangerous than showing no data at all — provenance matters",
    ],
  },
]

const RESEARCH_CONVERGENCE = {
  title: "Where Both Research Tracks Converge",
  description:
    "The consultation dissection and Javed's cross-specialty interviews independently arrived at the same core problem: doctors waste too much cognitive effort on information assembly. Our doctor shadowing quantified it (50% of time on non-clinical tasks), while Javed's specialist interviews qualified it (layered cognition, provenance needs, cross-specialty gaps). Together, they shaped Dr.Agent's three-layer architecture.",
  convergencePoints: [
    {
      internal: "Pre-consultation context building takes 2-3 minutes",
      external: "SBAR gives the 30-second triage scan doctors actually need",
      outcome: "PatientSummaryCard with SBAR situation bar — replaces 3 minutes of file-reading with a 30-second scan",
    },
    {
      internal: "Symptom Collector pre-captures structured patient input",
      external: "Doctors think in problems, not data types (POMR framework)",
      outcome: "AI-generated DDX and per-problem cards that connect symptoms to diagnosis workflow",
    },
    {
      internal: "Documentation phase is mechanical and time-consuming",
      external: "AI recommendations must be gated by data quality",
      outcome: "One-click copy to RxPad with ACT/VERIFY/GATHER tiers — fast but safe",
    },
    {
      internal: "Doctors miss patterns when rushed (15-20 patients/day)",
      external: "Longitudinal trajectory is invisible in snapshot views",
      outcome: "VitalsTrendCard and ConcernTrend — AI surfaces declining patterns the doctor might miss at 4pm",
    },
  ],
}

const RESEARCH_PROCESS = [
  {
    phase: "Discovery",
    label: "Doctor Interviews & Consultation Shadowing",
    color: "#8B5CF6",
    description:
      "Two parallel research tracks ran simultaneously. Through our research with doctors, we shadowed live consultations to time and dissect each phase — reading records, interviewing patients, examining, prescribing. Javed and team focused on cross-specialty communication, interviewing nephrologists, cardiologists, endocrinologists, and GPs about how they consume patient information across departments.",
    findings: [
      "From doctor shadowing: doctors spend ~50% of consultation time on non-clinical tasks (reading records + documentation)",
      "From specialist interviews: each specialist sees only their own department's notes — no cross-specialty view exists",
      "From doctor shadowing: pre-consultation symptom collection saves 2-3 minutes of interview time per patient",
      "From specialist interviews: chronic disease patients carry data in phone photos, printed Rx, and scanned PDFs",
      "Converging insight: the fundamental bottleneck is information assembly, not clinical decision-making",
    ],
  },
  {
    phase: "Analysis",
    label: "Framework Evaluation & Time Modelling",
    color: "#3B82F6",
    description:
      "From our doctor shadowing, we built a consultation time model (context-building → interview → diagnosis → documentation), while Javed's team evaluated evidence-based clinical communication frameworks: POMR (Weed, 1968), SBAR (IHI/WHO), and longitudinal timeline (Croskerry, 2002). The conclusion: no single format serves all contexts — a layered approach that maps to the consultation timeline is required.",
    findings: [
      "POMR maps 1:1 to specialist cognition — doctors think in problems, not data types",
      "SBAR is the gold standard for emergency/on-call handovers — 30-second comprehension",
      "Longitudinal timelines reveal disease trajectory — critical for follow-up reviews",
      "The consultation time model showed the biggest ROI is in the 'context-building' phase (first 2-3 minutes)",
      "Indian clinic reality: significant data exists outside structured EMR — provenance tagging is essential",
    ],
  },
  {
    phase: "Design",
    label: "Tiered Summary Architecture",
    color: "#059669",
    description:
      "Both research tracks converged into a single design: a tiered summary architecture that mirrors clinical cognition (fast triage → structured problems → deep-dive trajectory) while mapping to the consultation timeline (pre-consult summary → active consultation support → post-consult documentation). Every data point carries source provenance.",
    findings: [
      "Layer 1 (SBAR) → 30-second pre-consultation scan — replaces 3 minutes of record-reading",
      "Layer 2 (POMR) → 2-minute specialist view — per-problem cards with cross-problem interaction flags",
      "Layer 3 (Timeline) → 5-minute deep dive — lab trends, clinical events, medication cause-effect",
      "Symptom Collector feeds directly into the SBAR situation line and DDX generation",
      "Partial data handling → every data point carries source provenance: [EMR], [AI-extracted], [not available]",
      "AI recommendations gated by data quality — never make confident suggestions on uncertain data",
    ],
  },
]

// ── Three-Layer Summary Model ──────────────────────────────

const SUMMARY_LAYERS = [
  {
    layer: 1,
    name: "SBAR",
    fullName: "Situation — Background — Assessment — Recommendation",
    framework: "IHI/WHO Patient Safety Communication Standard",
    audience: "Emergency / On-call doctor",
    timeToRead: "30 seconds",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
    description:
      "Ultra-fast triage view. Gives the on-call doctor exactly what they need to decide: is this patient stable, what are the critical flags, and what needs to happen right now?",
    components: [
      { label: "S — Situation", detail: "1-2 line current clinical context (who, what, why here today)" },
      { label: "B — Background", detail: "Chronic diagnoses, current medications, recent events" },
      { label: "A — Assessment", detail: "Critical flags (K+, eGFR, BP), warning flags, risk level" },
      { label: "R — Recommendation", detail: "AI-generated next steps — clearly labelled, clinician must verify" },
    ],
    mapsTo: [
      "Collapsed PatientSummaryCard (3-line snapshot + flag count + allergy dot)",
      "Clinical Alerts Strip (critical/warning flags in red/amber)",
      "SBAR Situation Bar (one-line situation summary at card top)",
    ],
  },
  {
    layer: 2,
    name: "POMR",
    fullName: "Problem-Oriented Medical Record",
    framework: "Weed, 1968 — Gold standard for chronic multi-morbidity documentation",
    audience: "Specialist (first visit or consultation)",
    timeToRead: "2 minutes",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    description:
      "Structured per-problem view. Each active medical problem gets its own section with status, labs, current treatment, and trend. Cross-problem interaction flags highlight dangerous drug-disease combinations.",
    components: [
      { label: "Problem Cards", detail: "Each chronic condition as a separate section: status, labs, Rx, trend" },
      { label: "Cross-Problem Flags", detail: "Interaction warnings between problems (e.g., 'Furosemide losing efficacy as GFR declines')" },
      { label: "Pending Investigations", detail: "Overdue or expected tests listed by urgency" },
      { label: "Specialty Context", detail: "Domain-specific data embedded per specialty (gynec, ophthal, obstetric, pediatrics)" },
    ],
    mapsTo: [
      "Expanded PatientSummaryCard sections (Allergy, Vitals, Labs, History, Active Rx, Last Visit, Due Alerts)",
      "Specialty Embed section (Gynec/Obstetric/Ophthal/Pediatrics data in accent box)",
      "Cross-Problem Flags (dashed-border pills between sections)",
      "AbnormalFindingsCard (severity-based grouped findings with checkboxes)",
    ],
  },
  {
    layer: 3,
    name: "Timeline",
    fullName: "Longitudinal Disease Trajectory",
    framework: "Croskerry, 2002 — Temporal reasoning in clinical cognition",
    audience: "Treating physician / Specialist follow-up",
    timeToRead: "5 minutes",
    color: "#059669",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    description:
      "Deep-dive view showing disease trajectory over 12-24 months. Lab trend lines, medication change events, ER admissions, and procedure flags plotted on a timeline. Reveals patterns invisible in snapshot views.",
    components: [
      { label: "Lab Trends", detail: "Key markers (eGFR, HbA1c, Hb, BP, K+) trended over 12 months with directional arrows" },
      { label: "Clinical Events", detail: "ER admissions, hospitalisations, procedure dates on the same timeline" },
      { label: "Medication Changes", detail: "Rx additions/removals/dose changes correlated with lab values" },
      { label: "AI Trajectory Insight", detail: "Pattern recognition: 'eGFR declined 3.2 ml/min over 12 months — expected 1-2 ml/min'" },
    ],
    mapsTo: [
      "VitalsTrendCard (lab/vital bar charts and line graphs with tone-based coloring)",
      "LabComparisonCard (current vs. previous values with directional indicators)",
      "ConcernTrend in PatientSummaryCard (eGFR/HbA1c trend with mini graph)",
      "LastVisitCard (structured visit history with section strips)",
    ],
  },
]

// ── Partial Data Framework ──────────────────────────────────

const DATA_TRUST_LEVELS = [
  {
    tag: "[EMR]",
    label: "Structured EMR Data",
    color: "#059669",
    bgColor: "#ECFDF5",
    dotColor: "#10B981",
    trustLevel: "High — act on this",
    clinicianAction: "No verification needed for routine decisions",
    description:
      "Entered directly into TatvaPractice via a lab order, prescription, or encounter note. Timestamped, auditable, standardised units. A specialist can act on this without verification.",
    example: "eGFR 11 mL/min — from structured lab panel ordered in TatvaPractice, result received from lab integration",
  },
  {
    tag: "[AI-extracted]",
    label: "AI-Extracted from Upload",
    color: "#D97706",
    bgColor: "#FFFBEB",
    dotColor: "#F59E0B",
    trustLevel: "Medium — verify before acting",
    clinicianAction: "Open source document and visually confirm value, units, and date",
    description:
      "OCR/LLM parsed from an uploaded image, scanned PDF, or photographed prescription. The value may be correct, but extraction could have misread handwriting, missed units, or confused a current prescription with a historical one.",
    example: "HbA1c 9.2% — extracted from a printed lab report PDF uploaded by patient (Feb 2026). Verify against source.",
  },
  {
    tag: "[not available]",
    label: "Expected but Not Found",
    color: "#6B7280",
    bgColor: "#F9FAFB",
    dotColor: "#9CA3AF",
    trustLevel: "Gap — order or ask patient",
    clinicianAction: "Treat as a consultation agenda item — order the test or ask the patient",
    description:
      "The field is clinically expected for this patient type (e.g., Kt/V for a PD patient, Ferritin for CKD anaemia) but was not found in either structured EMR data or any uploaded document. This is not a blank field — it is an active gap.",
    example: "Echocardiogram result — expected for a patient with 2 ER admissions for fluid overload, but no result in EMR or uploads.",
  },
]

const DESIGN_PRINCIPLES = [
  {
    number: "01",
    title: "Never hide uncertainty — surface it explicitly",
    description:
      "A blank field and a missing field are not the same thing. 'Not entered' means nobody typed it. 'Not available' means the system searched EMR and all uploaded documents and found nothing. Both states must be shown. Hiding missing fields creates false completeness and clinical overconfidence.",
  },
  {
    number: "02",
    title: "Source provenance on every data point",
    description:
      "Every value must carry an inline source tag at the point of display — [EMR], [AI-extracted], or [not available]. Clinicians make different decisions based on a creatinine from a structured lab order vs. a creatinine extracted from a blurry photo. The tag must be on the value itself, not in a legend at the bottom.",
  },
  {
    number: "03",
    title: "Per-card data completeness indicator",
    description:
      "Each problem card shows a three-segment completeness bar: proportion from EMR (green), AI-extracted (amber), missing (gray). A nephrologist scanning cards who sees the Diabetes card is 55% AI-extracted knows to probe in the consultation rather than assume the summary is complete.",
  },
  {
    number: "04",
    title: "AI recommendations gated by data quality",
    description:
      "The SBAR R block must not generate confident recommendations for fields that are AI-extracted or missing. Recommendations are tiered: EMR-based first (ACT), AI-extracted second (VERIFY — with caveat), missing data last (GATHER — as action items).",
  },
  {
    number: "05",
    title: "Link back to the source document",
    description:
      "Every AI-extracted value must reference the original source document — file name, upload date, and ideally page/region. A nephrologist who sees 'Furosemide 80mg — AI-extracted from handwritten Rx, Aug 2025' must be one tap away from viewing the actual prescription image.",
  },
  {
    number: "06",
    title: "Expected-but-missing fields are a consultation agenda",
    description:
      "For a CKD Stage 5 patient, Kt/V, PET, Ferritin, and echocardiogram are clinically expected fields. If absent from all sources, the summary surfaces them as 'clinically expected — not found' rather than silently omitting them. The doctor arrives knowing exactly what to order.",
  },
]

// ── Mapping Table ───────────────────────────────────────────

const CONCEPT_MAPPING = [
  {
    concept: "SBAR — 30-second triage scan",
    ourFeature: "Collapsed PatientSummaryCard + Clinical Alerts Strip + SBAR Situation Bar",
    status: "built" as const,
  },
  {
    concept: "POMR — Per-problem specialist view",
    ourFeature: "Expanded PatientSummaryCard (8 sections: Allergy, Vitals, Labs, History, Active Rx, Last Visit, Due Alerts, Specialty)",
    status: "built" as const,
  },
  {
    concept: "Cross-problem interaction flags",
    ourFeature: "Cross-Problem Flags section (dashed amber/red pills between problem sections)",
    status: "built" as const,
  },
  {
    concept: "Longitudinal lab trend timeline",
    ourFeature: "VitalsTrendCard (bar/line charts with tone coloring) + ConcernTrend in summary",
    status: "built" as const,
  },
  {
    concept: "Clinical event timeline",
    ourFeature: "LastVisitCard sections + ER/hospitalisation flags in Due Alerts",
    status: "built" as const,
  },
  {
    concept: "Source provenance tags [EMR / AI / Missing]",
    ourFeature: "Inline colored dots (green/amber/gray) on lab and vital values",
    status: "built" as const,
  },
  {
    concept: "Per-card data completeness bar",
    ourFeature: "Three-segment bar (green/amber/gray) in PatientSummaryCard header",
    status: "built" as const,
  },
  {
    concept: "Expected-but-missing field prompts",
    ourFeature: "Missing Expected Fields section with 'Order' indicators",
    status: "built" as const,
  },
  {
    concept: "Recommendation gating by data quality",
    ourFeature: "Tiered recommendations: ACT (EMR) / VERIFY (AI) / GATHER (missing)",
    status: "built" as const,
  },
  {
    concept: "Source document link-back",
    ourFeature: "Document reference on AI-extracted values (file name + upload date)",
    status: "planned" as const,
  },
  {
    concept: "Clinician review & correction feedback loop",
    ourFeature: "In-summary editing: doctor corrects AI-extracted value, feeds back to extraction model",
    status: "planned" as const,
  },
  {
    concept: "OCR ingestion pipeline",
    ourFeature: "Document OCR pipeline for uploaded images and PDFs with entity extraction",
    status: "planned" as const,
  },
]

// ── CKD Reference Case ─────────────────────────────────────

const CKD_SBAR = {
  situation:
    "76-year-old male on peritoneal dialysis for end-stage CKD presenting for routine nephrology review. 2 ER admissions in past 12 months — both for acute fluid overload (pulmonary oedema + bilateral pitting oedema).",
  background: [
    "Diagnoses: CKD G5 (diabetic nephropathy), T2DM (HbA1c 7.8%), Hypertension (poorly controlled, avg BP 158/92 mmHg)",
    "PD modality: CAPD 4 exchanges/day, 2L bags. On dialysis since January 2024",
    "Key medications: Insulin glargine 18U HS, Amlodipine 10mg, Telmisartan 40mg, Furosemide 40mg BD, Sevelamer 800mg TDS, EPO 4000U 2x/wk",
  ],
  assessment: {
    critical: ["eGFR 11 mL/min (declining)", "K+ 5.8 mEq/L (hyperkalaemia)", "Hb 9.2 g/dL (renal anaemia)"],
    warning: ["BP 158/92 (uncontrolled)", "HbA1c 7.8%", "PTH 480 pg/mL (secondary hyperparathyroidism)", "SpO₂ 94%"],
  },
  recommendations: [
    { text: "Hyperkalaemia (K+ 5.8) — review dietary compliance, adjust sevelamer dose", tier: "act" as const, source: "EMR" },
    { text: "BP uncontrolled at 158/92 — review antihypertensive regimen and PD fluid strategy", tier: "act" as const, source: "EMR" },
    { text: "ESA dose review — Hb 9.2 g/dL below target 10-12 g/dL for PD patients", tier: "verify" as const, source: "AI-extracted" },
    { text: "Order retinal screening — diabetic + CKD, not done in 14 months", tier: "gather" as const, source: "not available" },
    { text: "Chase echo result — ordered post-ER, not returned to EMR", tier: "gather" as const, source: "not available" },
  ],
}

const CKD_POMR_PROBLEMS = [
  {
    problem: "CKD Stage 5 / Peritoneal Dialysis",
    status: "Active — critical",
    statusColor: "#EF4444",
    completeness: { emr: 70, ai: 15, missing: 15 },
    fields: [
      { label: "eGFR", value: "11 mL/min/1.73m²", source: "emr" as const, flag: "critical" as const },
      { label: "Creatinine", value: "8.2 mg/dL", source: "emr" as const, flag: "high" as const },
      { label: "K+", value: "5.8 mEq/L", source: "emr" as const, flag: "high" as const },
      { label: "PD modality", value: "CAPD 4x/day", source: "emr" as const, flag: null },
      { label: "Kt/V", value: "—", source: "not_available" as const, flag: null },
      { label: "PET result", value: "—", source: "not_available" as const, flag: null },
    ],
  },
  {
    problem: "Hypertension",
    status: "Uncontrolled",
    statusColor: "#D97706",
    completeness: { emr: 50, ai: 30, missing: 20 },
    fields: [
      { label: "Last BP", value: "158/92 mmHg", source: "emr" as const, flag: "high" as const },
      { label: "3-month avg", value: "155/90 mmHg", source: "emr" as const, flag: "high" as const },
      { label: "Furosemide", value: "40mg BD — verify?", source: "ai_extracted" as const, flag: null },
      { label: "Echo result", value: "—", source: "not_available" as const, flag: null },
    ],
  },
  {
    problem: "Type 2 Diabetes Mellitus",
    status: "Poorly controlled",
    statusColor: "#D97706",
    completeness: { emr: 30, ai: 55, missing: 15 },
    fields: [
      { label: "HbA1c", value: "7.8%", source: "ai_extracted" as const, flag: "high" as const },
      { label: "FBS", value: "186 mg/dL", source: "ai_extracted" as const, flag: "high" as const },
      { label: "Insulin", value: "Glargine 18U HS", source: "ai_extracted" as const, flag: null },
      { label: "Retinal screening", value: "—", source: "not_available" as const, flag: null },
    ],
  },
  {
    problem: "Anaemia of CKD",
    status: "Suboptimal",
    statusColor: "#D97706",
    completeness: { emr: 40, ai: 20, missing: 40 },
    fields: [
      { label: "Hb", value: "9.2 g/dL", source: "ai_extracted" as const, flag: "low" as const },
      { label: "EPO dose", value: "4000U 2x/wk", source: "emr" as const, flag: null },
      { label: "Ferritin", value: "—", source: "not_available" as const, flag: null },
      { label: "Transferrin sat.", value: "—", source: "not_available" as const, flag: null },
    ],
  },
]

const noop = () => {}

const REFERENCE_LAYER_CARDS = [
  {
    layer: "Layer 1 — Fast orientation (SBAR as reference)",
    note: "These cards handle the first read of the patient. We use SBAR as a reference lens for quick orientation, not as a strict card template.",
    cards: [
      { kind: "patient_summary", label: "Patient Summary", mapping: "Primary orientation card for the first scan." },
      { kind: "sbar_critical", label: "SBAR Critical", mapping: "Explicit critical-state framing when risk needs to be surfaced fast." },
      { kind: "lab_panel", label: "Lab Panel", mapping: "Flagged values compressed into a quick actionable read." },
      { kind: "last_visit", label: "Last Visit", mapping: "Recent clinical memory that supports the opening read." },
    ],
  },
  {
    layer: "Layer 2 — Structured problem/action view (POMR as reference)",
    note: "We use POMR as a reference for grouping and representing problem-oriented data. It informs how we structure these cards, but the UI stays product-native rather than academically literal.",
    cards: [
      { kind: "pomr_problem_card", label: "POMR Problem Card", mapping: "Best example of a problem-led structured response." },
      { kind: "investigation_bundle", label: "Investigation Bundle", mapping: "Turns one clinical problem into an actionable workup set." },
      { kind: "drug_interaction", label: "Drug Interaction", mapping: "Adds safety logic into the problem/action workflow." },
      { kind: "protocol_meds", label: "Protocol Meds", mapping: "Converts reasoning into RxPad-ready therapeutic action." },
    ],
  },
  {
    layer: "Layer 3 — Longitudinal review",
    note: "This layer supports trend reading and continuity. It helps the doctor move from snapshot interpretation to trajectory interpretation.",
    cards: [
      { kind: "patient_timeline", label: "Patient Timeline", mapping: "Chronological record view for continuity." },
      { kind: "lab_comparison", label: "Lab Comparison", mapping: "Before-vs-now framing to support trend interpretation." },
      { kind: "med_history", label: "Medication History", mapping: "Treatment continuity and change over time." },
    ],
  },
] as const

function findCatalogCard(kind: string) {
  return CATALOG.find((entry) => entry.kind === kind)
}

// ── Component ────────────────────────────────────────────────

export default function ClinicalResearchTab() {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(1)

  const tierColors = {
    act: { bg: "#ECFDF5", text: "#059669", label: "ACT" },
    verify: { bg: "#FFFBEB", text: "#D97706", label: "VERIFY" },
    gather: { bg: "#F3F4F6", text: "#6B7280", label: "GATHER" },
  }

  const sourceColors = {
    emr: { dot: "#10B981", label: "EMR" },
    ai_extracted: { dot: "#F59E0B", label: "AI" },
    not_available: { dot: "#9CA3AF", label: "—" },
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
            Origin Case Study
          </span>
        </div>
        <h2 className="mb-2 text-[18px] font-bold text-slate-800">Why we built Dr. Agent this way</h2>
        <p className="text-[13px] leading-relaxed text-slate-600">
          Dr. Agent started from a consultation-design problem. Doctors were already getting data from EMR records, uploaded reports, patient intake, historical sidebars, and RxPad sections, but the effort to assemble and act on that data was still falling on the doctor. The goal was to convert that fragmented information into a UI system that helps the doctor read faster, decide faster, and document faster without leaving the workflow.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-slate-800">The design shift</h3>
          <p className="mb-2 text-[11px] leading-relaxed text-slate-600">
            We moved away from thinking about AI as a separate chat assistant and started treating it as a response layer inside the doctor’s working UI.
          </p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
              <span className="text-[10px] leading-relaxed text-slate-500">AI-augmented UI: the output must appear as native cards, previews, tags, signals, and actions.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
              <span className="text-[10px] leading-relaxed text-slate-500">A2UI thinking: every card, pill, copy action, and sidebar jump is an agent-to-interface bridge.</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-slate-800">Why UI cards became the core</h3>
          <p className="mb-2 text-[11px] leading-relaxed text-slate-600">
            Cards gave us a repeatable way to package one clinical response at a time without overwhelming the doctor.
          </p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="text-[10px] leading-relaxed text-slate-500">A card can carry context, payload, trust signals, next steps, and copy actions in one contained unit.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="text-[10px] leading-relaxed text-slate-500">A small design system with shared rules lets us derive many card types while keeping the interaction model consistent.</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-slate-800">How the workflow is supported</h3>
          <p className="mb-2 text-[11px] leading-relaxed text-slate-600">
            The response is only useful if it can move the doctor forward inside the product.
          </p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />
              <span className="text-[10px] leading-relaxed text-slate-500">Canned messages guide the next best step instead of forcing free-text prompting every time.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />
              <span className="text-[10px] leading-relaxed text-slate-500">Copy/fill actions connect directly into RxPad sections and historical sidebars where that data belongs.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-rose-500" />
              <span className="text-[10px] leading-relaxed text-slate-500">Sidebar links and specialty views create multiple entry points instead of locking the doctor into one route.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <h3 className="mb-2 text-[14px] font-bold text-slate-800">What this case study led to</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-blue-100 bg-white/80 p-3">
            <p className="mb-1 text-[11px] font-semibold text-blue-700">Response cards</p>
            <p className="text-[10px] leading-relaxed text-slate-500">Structured cards for summaries, labs, safety, DDX, plans, and operational flows.</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white/80 p-3">
            <p className="mb-1 text-[11px] font-semibold text-blue-700">Canned guidance</p>
            <p className="text-[10px] leading-relaxed text-slate-500">Pills that keep the doctor moving through the consultation and documentation journey.</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white/80 p-3">
            <p className="mb-1 text-[11px] font-semibold text-blue-700">RxPad integration</p>
            <p className="text-[10px] leading-relaxed text-slate-500">Outputs are designed to be reviewed, then filled into the exact place where the doctor works.</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white/80 p-3">
            <p className="mb-1 text-[11px] font-semibold text-blue-700">Trust cues</p>
            <p className="text-[10px] leading-relaxed text-slate-500">Sources, completeness, and feedback signals help the doctor judge the response confidently.</p>
          </div>
        </div>
      </section>

      {/* ── Three-Layer Summary Model ───────────────────────── */}
      <section>
        <h3 className="mb-1 text-[14px] font-bold text-slate-800">The Three-Layer Summary Model</h3>
        <p className="mb-3 text-[12px] text-slate-500">
          A single format cannot serve all clinical contexts. The tiered approach mirrors how clinical cognition works:
          fast heuristic triage → structured problem framing → pattern-based temporal reasoning. We use SBAR and POMR as reference frameworks for structuring and representing data, not as rigid templates that must be copied exactly.
        </p>
        <div className="space-y-3">
          {SUMMARY_LAYERS.map((layer) => (
            <div
              key={layer.layer}
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: layer.borderColor }}
            >
              {/* Header */}
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3"
                style={{ backgroundColor: layer.bgColor }}
                onClick={() => setExpandedLayer(expandedLayer === layer.layer ? null : layer.layer)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
                    style={{ backgroundColor: layer.color }}
                  >
                    L{layer.layer}
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: layer.color }}>
                    {layer.name}
                  </span>
                  <span className="text-[11px] text-slate-500">— {layer.audience} — {layer.timeToRead}</span>
                </div>
                <span className="text-[11px] text-slate-400">{expandedLayer === layer.layer ? "▲" : "▼"}</span>
              </button>

              {expandedLayer === layer.layer && (
                <div className="border-t bg-white px-4 py-3" style={{ borderColor: layer.borderColor }}>
                  <p className="mb-2 text-[11px] font-medium text-slate-500">{layer.framework}</p>
                  <p className="mb-3 text-[12px] leading-relaxed text-slate-600">{layer.description}</p>

                  {/* Components */}
                  <div className="mb-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Components</p>
                    {layer.components.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <span className="mt-0.5 text-[12px] font-semibold" style={{ color: layer.color }}>
                          {c.label}
                        </span>
                        <span className="text-[12px] text-slate-500">{c.detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Maps to our cards */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maps to in Dr.Agent</p>
                    {layer.mapsTo.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-1 text-[10px]" style={{ color: layer.color }}>→</span>
                        <span className="text-[12px] text-slate-600">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Partial Data Handling Framework ──────────────────── */}
      <section>
        <h3 className="mb-1 text-[14px] font-bold text-slate-800">Partial Data Handling — selective pattern</h3>
        <p className="mb-3 text-[12px] text-slate-500">
          This is not a rule for every Dr. Agent response. Most cards simply render whatever valid data is currently available. Partial-data handling becomes important only in a few cases, especially problem-oriented cards and other structured summary views where the doctor expects a known set of fields and missingness itself carries meaning. In those cases, the response should show provenance clearly and help the doctor know what to act on, verify, or gather.
        </p>

        {/* Trust Levels */}
        <div className="mb-4 space-y-3">
          {DATA_TRUST_LEVELS.map((level) => (
            <div
              key={level.tag}
              className="rounded-xl border p-4"
              style={{ borderColor: level.color + "40", backgroundColor: level.bgColor }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: level.dotColor }}
                />
                <span className="text-[13px] font-bold" style={{ color: level.color }}>
                  {level.tag}
                </span>
                <span className="text-[12px] font-medium text-slate-600">{level.label}</span>
              </div>
              <p className="mb-2 text-[12px] leading-relaxed text-slate-600">{level.description}</p>
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold" style={{ color: level.color }}>
                  Trust: {level.trustLevel}
                </span>
                <span className="text-[10px] text-slate-500">Action: {level.clinicianAction}</span>
              </div>
              <div className="mt-2 rounded-md bg-white/60 px-3 py-1.5">
                <span className="text-[10px] font-semibold text-slate-400">EXAMPLE: </span>
                <span className="text-[11px] italic text-slate-500">{level.example}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Design Principles ────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[14px] font-bold text-slate-800">Design Principles — where partial-data rules apply</h3>
        <div className="space-y-2">
          {DESIGN_PRINCIPLES.map((p) => (
            <div key={p.number} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500">
                  {p.number}
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-slate-700">{p.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{p.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mapping Table ────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[14px] font-bold text-slate-800">Concept → Feature Mapping</h3>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 font-semibold text-slate-600">Research Concept</th>
                <th className="px-3 py-2 font-semibold text-slate-600">Our Implementation</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CONCEPT_MAPPING.map((row, i) => (
                <tr key={i} className="bg-white">
                  <td className="px-3 py-2 text-slate-700">{row.concept}</td>
                  <td className="px-3 py-2 text-slate-500">{row.ourFeature}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: row.status === "built" ? "#ECFDF5" : "#FFF7ED",
                        color: row.status === "built" ? "#059669" : "#D97706",
                      }}
                    >
                      {row.status === "built" ? "Built" : "Planned"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CKD Reference Case ───────────────────────────────── */}
      <section>
        <h3 className="mb-1 text-[14px] font-bold text-slate-800">Reference Case — CKD Stage 5 (Ramesh Kumar, 76M)</h3>
        <p className="mb-3 text-[12px] text-slate-500">
          Instead of explaining the reference layers with dummy blocks, this section maps the actual UI cards we have already built back to those layers. The layers are explanatory lenses that help teams understand the response system; the real implementation is the card system itself.
        </p>

        <div className="space-y-4">
          {REFERENCE_LAYER_CARDS.map((group) => (
            <div key={group.layer} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h4 className="text-[13px] font-semibold text-slate-800">{group.layer}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{group.note}</p>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
                {group.cards.map((item) => {
                  const entry = findCatalogCard(item.kind)
                  if (!entry) return null

                  return (
                    <div key={item.kind} className="space-y-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                        <p className="mt-1 text-[10px] leading-[1.5] text-slate-600">{item.mapping}</p>
                      </div>
                      <div className="w-full max-w-[380px]">
                        <CardRenderer
                          output={entry.output}
                          onPillTap={noop}
                          onCopy={noop}
                          onSidebarNav={noop}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

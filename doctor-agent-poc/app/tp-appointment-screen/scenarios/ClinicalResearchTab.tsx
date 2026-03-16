"use client"

import React, { useState } from "react"

// ─────────────────────────────────────────────────────────────
// Clinical Research & Design Framework Documentation
// Covers: doctor research process, SBAR/POMR/Timeline model,
// partial data handling, source provenance, and how our cards
// implement these clinical communication standards.
// ─────────────────────────────────────────────────────────────

// ── Research Process ────────────────────────────────────────

const RESEARCH_PROCESS = [
  {
    phase: "Discovery",
    label: "Doctor Interviews",
    color: "#8B5CF6",
    description:
      "Javed and team conducted in-depth interviews with nephrologists, cardiologists, endocrinologists, and general practitioners to understand how specialists communicate patient information across departments. The core question: when a chronic disease patient walks into your consultation room, what do you need to know in the first 30 seconds vs. the first 5 minutes?",
    findings: [
      "Doctors think in layers — fast triage first, then structured problem review, then deep-dive trajectory analysis",
      "Cross-specialty handovers follow the ISBAR (Introduction-Situation-Background-Assessment-Recommendation) framework",
      "Most specialist EMR views are fragmented — doctors see only their own department's recent notes",
      "Redundant investigations are ordered because previous results from other departments are buried in the record",
      "Trend data (disease trajectory over months) is almost never available in a consumable format",
    ],
  },
  {
    phase: "Analysis",
    label: "Framework Evaluation",
    color: "#3B82F6",
    description:
      "From these interviews, three evidence-based clinical communication frameworks were evaluated against the identified audience needs: POMR (Weed, 1968), SBAR (IHI/WHO), and longitudinal timeline visualisation (Croskerry, 2002). The conclusion: no single format serves all clinical contexts — a layered approach is required.",
    findings: [
      "POMR (Problem-Oriented Medical Record) maps 1:1 to specialist cognition — doctors think in problems, not data types",
      "SBAR is the gold standard for emergency/on-call handovers — ultra-fast comprehension in under 30 seconds",
      "Longitudinal timelines reveal disease trajectory — critical for treating physicians doing follow-up reviews",
      "Indian clinic reality: significant patient data exists outside structured EMR (phone photos, printed prescriptions, scanned PDFs)",
      "A confident display of uncertain data is more dangerous than showing no data at all — provenance matters",
    ],
  },
  {
    phase: "Design",
    label: "Tiered Summary Architecture",
    color: "#059669",
    description:
      "The final design uses a tiered summary that mirrors how clinical cognition actually works: fast heuristic triage → structured problem framing → pattern-based temporal reasoning. Each layer serves a distinct audience with different time constraints.",
    findings: [
      "Layer 1 (SBAR) → 30-second emergency/on-call scan — critical flags, situation summary",
      "Layer 2 (POMR) → 2-minute specialist first-visit review — per-problem cards with cross-problem interaction flags",
      "Layer 3 (Timeline) → 5-minute treating physician deep dive — lab trends, clinical events, medication cause-effect",
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
      {/* ── What is Dr.Agent ────────────────────────────────── */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            AI Co-Pilot for Doctors
          </span>
        </div>
        <h2 className="mb-2 text-[16px] font-bold text-slate-800">
          What is Dr.Agent?
        </h2>
        <p className="mb-3 text-[13px] leading-relaxed text-slate-600">
          Dr.Agent is an <strong>AI-powered clinical co-pilot</strong> embedded directly into the TatvaPractice EMR workflow. It sits
          alongside the prescription pad (RxPad) and provides real-time, context-aware clinical intelligence during patient
          consultations — acting as the doctor&apos;s second brain that surfaces the right information at the right time.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-100 bg-white/70 p-3">
            <h3 className="mb-1 text-[11px] font-bold text-blue-700">How It Helps</h3>
            <ul className="space-y-1 text-[11px] text-slate-600">
              <li className="flex items-start gap-1.5"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-400" />Pre-consultation summary — doctor sees the full picture before the patient walks in</li>
              <li className="flex items-start gap-1.5"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-400" />Real-time clinical decision support — DDX, medication protocols, investigation bundles</li>
              <li className="flex items-start gap-1.5"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-400" />Cross-specialty context — shows data from other departments the doctor doesn&apos;t normally see</li>
              <li className="flex items-start gap-1.5"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-400" />Safety layer — allergy checks, drug interactions, cross-problem flags</li>
            </ul>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-white/70 p-3">
            <h3 className="mb-1 text-[11px] font-bold text-indigo-700">The Interview Concept</h3>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Dr.Agent works as an <strong>intelligent interviewer</strong> — it doesn&apos;t just present data, it actively engages the
              doctor in a structured conversation. It asks: <em>&quot;Given this patient&apos;s declining eGFR and 2 ER admissions, should we
              reassess PD adequacy?&quot;</em> This transforms passive data consumption into active clinical reasoning, helping doctors
              catch patterns they might miss in a busy 10-minute consultation.
            </p>
          </div>
        </div>
      </div>

      {/* ── Research Hero ────────────────────────────────────── */}
      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
            Research-Driven Design
          </span>
        </div>
        <h2 className="mb-2 text-[16px] font-bold text-slate-800">
          Clinical Summary Design — From Doctor Research to Product
        </h2>
        <p className="text-[13px] leading-relaxed text-slate-600">
          Javed and team conducted in-depth interviews with nephrologists, cardiologists, endocrinologists, and general
          practitioners to understand how specialists consume patient information across departments. Two key problems
          emerged: <strong>fragmented views</strong> (each specialist sees only their own department&apos;s notes) and <strong>uncertain
          data</strong> (patients carry printed prescriptions, phone photos of lab reports, scanned PDFs from external clinics).
          From these insights, two design concepts were developed that drive our Dr.Agent clinical summary architecture.
        </p>
      </div>

      {/* ── Research Process ────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[14px] font-bold text-slate-800">Research Process</h3>
        <div className="space-y-3">
          {RESEARCH_PROCESS.map((phase) => (
            <div key={phase.phase} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: phase.color + "15", color: phase.color }}
                >
                  {phase.phase}
                </span>
                <span className="text-[13px] font-semibold text-slate-700">{phase.label}</span>
              </div>
              <p className="mb-3 text-[12px] leading-relaxed text-slate-600">{phase.description}</p>
              <div className="space-y-1.5">
                {phase.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: phase.color }} />
                    <span className="text-[12px] text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Three-Layer Summary Model ───────────────────────── */}
      <section>
        <h3 className="mb-1 text-[14px] font-bold text-slate-800">The Three-Layer Summary Model</h3>
        <p className="mb-3 text-[12px] text-slate-500">
          A single format cannot serve all clinical contexts. The tiered approach mirrors how clinical cognition works:
          fast heuristic triage → structured problem framing → pattern-based temporal reasoning.
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
        <h3 className="mb-1 text-[14px] font-bold text-slate-800">Partial Data Handling Framework</h3>
        <p className="mb-3 text-[12px] text-slate-500">
          In Indian clinical practice, a significant proportion of a chronic patient&apos;s records exist outside the structured EMR.
          Every data point must carry its source provenance — the doctor needs to know whether to act, verify, or gather.
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
        <h3 className="mb-3 text-[14px] font-bold text-slate-800">Design Principles — Partial Data Handling</h3>
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
          This illustrative case demonstrates all three layers and partial data handling in a realistic multi-specialty context.
          Select <strong>Ramesh Kumar</strong> in the patient selector to see this rendered live in the Dr.Agent panel.
        </p>

        {/* SBAR Layer */}
        <div className="mb-4 rounded-xl border border-red-200 bg-white overflow-hidden">
          <div className="bg-red-50 px-4 py-2 border-b border-red-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Layer 1 — SBAR</span>
          </div>
          <div className="divide-y divide-red-100 px-4">
            {/* S */}
            <div className="py-2.5">
              <span className="mr-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">S</span>
              <span className="text-[12px] text-slate-700">{CKD_SBAR.situation}</span>
            </div>
            {/* B */}
            <div className="py-2.5">
              <span className="mr-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">B</span>
              <div className="mt-1 space-y-1">
                {CKD_SBAR.background.map((b, i) => (
                  <p key={i} className="text-[12px] text-slate-600">{b}</p>
                ))}
              </div>
            </div>
            {/* A */}
            <div className="py-2.5">
              <span className="mr-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">A</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {CKD_SBAR.assessment.critical.map((c, i) => (
                  <span key={i} className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 border border-red-200">{c}</span>
                ))}
                {CKD_SBAR.assessment.warning.map((w, i) => (
                  <span key={i} className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">{w}</span>
                ))}
              </div>
            </div>
            {/* R */}
            <div className="py-2.5">
              <span className="mr-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">R</span>
              <p className="mt-0.5 mb-1.5 text-[10px] italic text-slate-400">AI-generated — clinician must verify before acting</p>
              <div className="space-y-1.5">
                {CKD_SBAR.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 shrink-0 rounded px-1.5 py-0 text-[9px] font-bold"
                      style={{ backgroundColor: tierColors[r.tier].bg, color: tierColors[r.tier].text }}
                    >
                      {tierColors[r.tier].label}
                    </span>
                    <span className="text-[12px] text-slate-600">{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* POMR Layer */}
        <div className="mb-4 rounded-xl border border-blue-200 bg-white overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Layer 2 — POMR (Per-Problem Cards)</span>
          </div>
          <div className="divide-y divide-blue-100 px-4 py-2">
            {CKD_POMR_PROBLEMS.map((prob, pi) => (
              <div key={pi} className="py-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-slate-700">{prob.problem}</span>
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: prob.statusColor + "15", color: prob.statusColor }}
                  >
                    {prob.status}
                  </span>
                </div>
                {/* Completeness bar */}
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-l-full bg-emerald-400" style={{ width: `${prob.completeness.emr}%` }} />
                    <div className="h-full bg-amber-400" style={{ width: `${prob.completeness.ai}%` }} />
                    <div className="h-full rounded-r-full bg-gray-300" style={{ width: `${prob.completeness.missing}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {prob.completeness.emr}% EMR · {prob.completeness.ai}% AI · {prob.completeness.missing}% missing
                  </span>
                </div>
                {/* Fields */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {prob.fields.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-1.5">
                      <span
                        className="h-[6px] w-[6px] shrink-0 rounded-full"
                        style={{ backgroundColor: sourceColors[f.source].dot }}
                      />
                      <span className="text-[11px] text-slate-500">{f.label}</span>
                      <span
                        className={`text-[11px] font-medium ${
                          f.flag === "critical" ? "text-red-600" :
                          f.flag === "high" || f.flag === "low" ? "text-amber-600" :
                          f.source === "not_available" ? "italic text-gray-400" :
                          "text-slate-700"
                        }`}
                      >
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Layer (brief) */}
        <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden">
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Layer 3 — Longitudinal Timeline</span>
          </div>
          <div className="px-4 py-3">
            <p className="mb-2 text-[12px] text-slate-600">
              eGFR trajectory over 12 months: <strong>18 → 16 → 14 → 11 mL/min</strong> (declining at 3.2 mL/min/year — expected: 1-2 mL/min in stable PD).
            </p>
            <div className="mb-2 flex items-center gap-3">
              {[
                { label: "Jun'25", value: "18", color: "#D97706" },
                { label: "Sep'25", value: "16", color: "#D97706" },
                { label: "Dec'25", value: "14", color: "#EF4444" },
                { label: "Mar'26", value: "11", color: "#EF4444" },
              ].map((point, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[14px] font-bold" style={{ color: point.color }}>{point.value}</span>
                  <span className="text-[9px] text-slate-400">{point.label}</span>
                </div>
              ))}
              <span className="text-[10px] text-slate-400">mL/min</span>
            </div>
            <div className="rounded-md bg-red-50 px-3 py-2 border border-red-100">
              <p className="text-[10px] font-semibold text-red-600">AI Trajectory Insight</p>
              <p className="text-[11px] text-red-700">
                Two fluid overload events in 6 months suggest declining residual renal function and/or inadequate ultrafiltration —
                trajectory consistent with peritoneal membrane fatigue. Consider formal PET reassessment and cardiology co-management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

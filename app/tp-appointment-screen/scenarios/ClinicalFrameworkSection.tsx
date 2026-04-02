"use client"

import React, { useState } from "react"
import { CATALOG } from "./CardCatalogLive"
import { CardRenderer } from "@/components/tp-rxpad/dr-agent/cards/CardRenderer"

// ── Three-Layer Summary Model ──────────────────────────────────

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

const REFERENCE_LAYER_CARDS = [
  {
    layer: "Layer 1 — Fast orientation (SBAR as reference)",
    note: "These cards handle the first read of the patient. We use SBAR as a reference lens for quick orientation, not as a strict card template.",
    cards: [
      { kind: "patient_summary", label: "Patient Summary (Detailed)", mapping: "Comprehensive patient overview with full narrative, all sections expanded." },
      { kind: "sbar_overview", label: "SBAR Overview", mapping: "Structured handoff summary: Situation, Background, Assessment, Recommendation. Primary quick-scan card for consult prep." },
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

const noop = () => {}

// ── Component ────────────────────────────────────────────────

export default function ClinicalFrameworkSection() {
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
                  <span className="text-[11px] text-slate-500">{layer.audience} / {layer.timeToRead}</span>
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
        <h3 className="mb-1 text-[14px] font-bold text-slate-800">Partial Data Handling</h3>
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
        <h3 className="mb-3 text-[14px] font-bold text-slate-800">Design Principles</h3>
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

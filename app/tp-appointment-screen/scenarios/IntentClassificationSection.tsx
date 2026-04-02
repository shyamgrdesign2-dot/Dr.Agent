"use client"

import React, { useState } from "react"

// ─────────────────────────────────────────────────────────────
// Intent Classification & Response Types
// ─────────────────────────────────────────────────────────────

// ── Two Response Types ──────────────────────────────────────

const RESPONSE_TYPES = [
  {
    type: "UI Card",
    icon: "▣",
    tint: "violet",
    description: "Structured visual cards with headers, data sections, charts, tables, copy actions, and navigation. Used when structured data exists.",
    when: [
      "Structured data exists (labs, vitals, medications, visit history)",
      "Visual format adds clarity (trends, comparisons, checklists)",
      "Actionable elements needed (copy to RxPad, checkboxes, navigation)",
    ],
    examples: [
      { query: "Patient summary", card: "sbar_overview" },
      { query: "HbA1c trend", card: "lab_trend" },
      { query: "Suggest DDX", card: "ddx" },
      { query: "Today's vitals", card: "vitals_summary" },
    ],
  },
  {
    type: "Text Response",
    icon: "≡",
    tint: "blue",
    description: "Plain conversational text with suggestion pills. Used when data is insufficient for a card or the query is a simple question.",
    when: [
      "No relevant data exists for the query",
      "Answer is a simple fact or explanation",
      "Intent is ambiguous or out of scope",
    ],
    examples: [
      { query: "HbA1c trend (no data)", card: "Text + pills" },
      { query: "What is CKD?", card: "Text explanation" },
      { query: "Tell me a joke", card: "Guardrail + pills" },
    ],
  },
]

// ── Intent Categories ───────────────────────────────────────

const INTENT_CATEGORIES = [
  {
    category: "data_retrieval",
    label: "Data Retrieval",
    icon: "📋",
    defaultFormat: "card",
    description: "Fetch and display patient or clinic data — summaries (SBAR), vitals, labs, history, specialty records.",
    triggerExamples: ["Patient summary", "Show vitals", "Lab results", "Medical history"],
    cardOutputs: ["sbar_overview", "vitals_summary", "lab_panel", "medical_history", "last_visit", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary"],
    fallbackBehavior: "Text response suggesting to upload records or enter data.",
  },
  {
    category: "clinical_decision",
    label: "Clinical Decision",
    icon: "🧠",
    defaultFormat: "card",
    description: "AI-assisted clinical reasoning — DDX, protocol meds, investigation recommendations, guidelines.",
    triggerExamples: ["Suggest DDX", "Protocol medications", "What tests to order?"],
    cardOutputs: ["ddx", "protocol_meds", "investigation_bundle", "clinical_guideline"],
    fallbackBehavior: "Asks for chief complaint or diagnosis context first.",
  },
  {
    category: "comparison",
    label: "Comparison & Trends",
    icon: "📈",
    defaultFormat: "card",
    description: "Visualise changes over time — lab trends, vital trends, lab comparisons.",
    triggerExamples: ["HbA1c trend", "Compare labs", "BP trend", "Vital trends"],
    cardOutputs: ["lab_trend", "lab_comparison", "vitals_trend_line", "vitals_trend_bar"],
    fallbackBehavior: "Single data point: text with value. Zero: text saying no data.",
  },
  {
    category: "action",
    label: "Action & Workflow",
    icon: "⚡",
    defaultFormat: "hybrid",
    description: "Trigger workflow actions — follow-up, translate, copy Rx, referral, completeness check.",
    triggerExamples: ["Plan follow-up", "Translate to Hindi", "Copy prescription"],
    cardOutputs: ["follow_up", "translation", "rx_preview", "referral", "advice_bundle", "completeness"],
    fallbackBehavior: "Text explaining what's needed first (e.g., generate meds before copy).",
  },
  {
    category: "document_analysis",
    label: "Document Analysis",
    icon: "📄",
    defaultFormat: "card",
    description: "Extract data from uploaded documents — scanned reports, prescriptions, lab printouts.",
    triggerExamples: ["Scan this report", "Extract lab values"],
    cardOutputs: ["ocr_pathology", "ocr_extraction"],
    fallbackBehavior: "Text prompting to upload a file.",
  },
  {
    category: "clinical_question",
    label: "Clinical Question",
    icon: "❓",
    defaultFormat: "text",
    description: "Knowledge questions — dosing, mechanism of action, side effects, drug interactions.",
    triggerExamples: ["Mechanism of Metformin?", "Dosing for Amoxicillin"],
    cardOutputs: ["text", "drug_interaction", "allergy_conflict"],
    fallbackBehavior: "Text response with clinical explanation.",
  },
  {
    category: "operational",
    label: "Operational & Analytics",
    icon: "📊",
    defaultFormat: "card",
    description: "Clinic-level operations — schedule, revenue, KPIs, demographics, vaccination schedules.",
    triggerExamples: ["Today's schedule", "Weekly KPIs", "Revenue today"],
    cardOutputs: ["patient_list", "follow_up_list", "revenue_bar", "analytics_table", "donut_chart", "heatmap", "vaccination_due_list"],
    fallbackBehavior: "Always returns card with aggregated clinic data.",
  },
  {
    category: "out_of_scope",
    label: "Out of Scope",
    icon: "🚫",
    defaultFormat: "card",
    description: "Non-medical queries — sports, weather, news. Triggers guardrail.",
    triggerExamples: ["Tell me a joke", "What's the weather?"],
    cardOutputs: ["guardrail"],
    fallbackBehavior: "Guardrail card with polite redirect + suggestion pills.",
  },
  {
    category: "ambiguous",
    label: "Ambiguous",
    icon: "🔍",
    defaultFormat: "text",
    description: "Low-confidence or open-ended input.",
    triggerExamples: ["hmm", "ok", "anything else?", "help"],
    cardOutputs: ["text + suggestion pills"],
    fallbackBehavior: "Sorry message with 4 contextual pills based on patient data.",
  },
  {
    category: "follow_up",
    label: "Follow-Up",
    icon: "🔄",
    defaultFormat: "card",
    description: "Multi-step interactions — selecting options, refining previous response.",
    triggerExamples: ["Yes, show details", "Option 2", "Compare with last month"],
    cardOutputs: ["follow_up_question", "refined card"],
    fallbackBehavior: "If context lost, text asking to rephrase.",
  },
]

// ── Decision Flow Steps ─────────────────────────────────────

const DECISION_FLOW_STEPS = [
  { step: 1, label: "Receive Input", description: "Doctor types a question or taps a canned pill." },
  { step: 2, label: "Classify Intent", description: "Normalize and match against 96+ keyword rules. Pills skip via PILL_INTENT_MAP." },
  { step: 3, label: "Check Data", description: "Check patient data: labs, vitals, history, meds, specialty records." },
  { step: 4, label: "Select Format", description: "Card (visual), Hybrid (card + text), or Text (plain). Data-rich → card." },
  { step: 5, label: "Choose Card", description: "Match to 63+ card types. Pick content zone, tags, copy actions." },
  { step: 6, label: "Assemble", description: "Build anatomy: Header, Content, Insight, Pills, Footer." },
  { step: 7, label: "Render", description: "Render in chat. Wire copy to RxPad. Show follow-up pills." },
]

// ── Walkthrough ────────────────────────────────────────────

const HBAIC_WALKTHROUGH = {
  query: "Show me the HbA1c trend",
  scenarios: [
    {
      condition: "3+ HbA1c values exist",
      outcome: "card" as const,
      cardType: "lab_trend (line chart)",
      summary: "5 values found → line chart with 6.5% threshold → insight: improving but above target",
      thinkingProcess: [
        { aspect: "Data Check", decision: "Found 5 HbA1c values across visits (Jun'25 to Feb'26). Sufficient for trend." },
        { aspect: "Format", decision: "Multiple data points → visual trend more useful than listing numbers. Card format." },
        { aspect: "Content Zone", decision: "Time-series → line chart. Date on X-axis, value on Y-axis." },
        { aspect: "Header", decision: "Title: 'HbA1c Trend'. Lab icon. Date range subtext." },
        { aspect: "Reference Range", decision: "Target < 6.5% shown as threshold line. Above = critical tone." },
        { aspect: "Insight", decision: "'Gradual improvement from 10.1% to 9.2% over 8 months, still above target 6.5%.'" },
        { aspect: "Source", decision: "EMR lab records. Confidence: high." },
        { aspect: "Pills", decision: "'Compare with other labs', 'Suggest medications', 'Patient summary'" },
      ],
    },
    {
      condition: "Only 1 value exists",
      outcome: "text" as const,
      cardType: "Text response",
      summary: "1 value (9.2%) → can't show trend → text with value, reference range, follow-up guidance",
      thinkingProcess: [
        { aspect: "Data Check", decision: "Only 1 HbA1c: 9.2% (Feb 2026). Cannot show trend with single point." },
        { aspect: "Format", decision: "Single point → no visual benefit. Text response." },
        { aspect: "Content", decision: "'One HbA1c available: 9.2% (Feb 2026). Above target < 6.5%.'" },
        { aspect: "Insight", decision: "'Baseline value. Follow-up in 3 months to assess trend.'" },
        { aspect: "Pills", decision: "'Full lab panel', 'Suggest medications', 'Patient summary'" },
      ],
    },
    {
      condition: "No values found",
      outcome: "text" as const,
      cardType: "Text response",
      summary: "0 values → text explaining gap → suggest ordering HbA1c or uploading report",
      thinkingProcess: [
        { aspect: "Data Check", decision: "No HbA1c in EMR or uploads." },
        { aspect: "Format", decision: "No data → text explaining the gap." },
        { aspect: "Content", decision: "'No HbA1c found. Upload a lab report or enter manually.'" },
        { aspect: "Guidance", decision: "Suggest ordering HbA1c if diabetes or risk factors." },
        { aspect: "Pills", decision: "'Order investigations', 'Upload lab report', 'Patient summary'" },
      ],
    },
  ],
}

// ── Synthetic Data Chart ─────────────────────────────────

const SYNTHETIC_DATA_CHART = [
  {
    category: "Patient Context & Summaries",
    icon: "📋",
    note: "All summaries follow SBAR format (Situation, Background, Assessment, Recommendation). patient_summary and sbar_overview use the same SmartSummaryData structure.",
    entries: [
      { query: "Patient summary / SBAR", intent: "data_retrieval", dataCheck: "Any patient data", cardFormat: "sbar_overview", contentZone: "SBAR sections + inline data rows", fallback: "Text: suggest starting with history" },
      { query: "Pre-visit intake", intent: "data_retrieval", dataCheck: "Symptom collector data", cardFormat: "symptom_collector", contentZone: "Inline data rows", fallback: "Text: no pre-visit data submitted" },
      { query: "Medical history", intent: "data_retrieval", dataCheck: "Chronic conditions / allergies", cardFormat: "medical_history", contentZone: "Section-grouped data rows", fallback: "Text: no history recorded" },
      { query: "Past visit", intent: "data_retrieval", dataCheck: "Previous visit records", cardFormat: "last_visit", contentZone: "5-section strip", fallback: "Text: no previous visits" },
      { query: "Specialty summary", intent: "data_retrieval", dataCheck: "Specialty data exists", cardFormat: "obstetric / gynec / pediatric / ophthal", contentZone: "Specialty SBAR sections", fallback: "Text: no specialty data" },
    ],
  },
  {
    category: "Labs & Vitals",
    icon: "🔬",
    entries: [
      { query: "Today's vitals", intent: "data_retrieval", dataCheck: "Vitals recorded today", cardFormat: "vitals_summary", contentZone: "Data rows with flags", fallback: "Text: no vitals today" },
      { query: "Lab panel", intent: "data_retrieval", dataCheck: "Lab values exist", cardFormat: "lab_panel", contentZone: "Flagged data rows + reference ranges", fallback: "Text: no labs found" },
      { query: "HbA1c trend", intent: "comparison", dataCheck: "Multiple values over time", cardFormat: "lab_trend", contentZone: "Line chart + threshold", fallback: "Single: text. None: text" },
      { query: "Compare labs", intent: "comparison", dataCheck: "2+ visit values", cardFormat: "lab_comparison", contentZone: "Comparison table (prev/curr/delta)", fallback: "Text: only one set" },
      { query: "Vital trends", intent: "comparison", dataCheck: "Multiple readings", cardFormat: "vitals_trend_line/bar", contentZone: "Line or bar chart", fallback: "Text: single reading" },
    ],
  },
  {
    category: "Clinical Decision Support",
    icon: "🧠",
    entries: [
      { query: "Suggest DDX", intent: "clinical_decision", dataCheck: "Symptoms available", cardFormat: "ddx", contentZone: "3-tier checkbox list", fallback: "Text: enter chief complaint" },
      { query: "Protocol medications", intent: "clinical_decision", dataCheck: "Diagnosis exists", cardFormat: "protocol_meds", contentZone: "Medication display", fallback: "Text: accept diagnosis first" },
      { query: "Suggest investigations", intent: "clinical_decision", dataCheck: "Clinical suspicion", cardFormat: "investigation_bundle", contentZone: "Checkbox list + rationale", fallback: "Text: provide symptoms" },
      { query: "Drug interactions", intent: "clinical_question", dataCheck: "Active medications", cardFormat: "drug_interaction", contentZone: "Drug A vs B + severity", fallback: "Text: no medications" },
      { query: "Clinical guideline", intent: "clinical_decision", dataCheck: "Condition mentioned", cardFormat: "clinical_guideline", contentZone: "Recommendation list", fallback: "Text: specify condition" },
    ],
  },
  {
    category: "Actions & Workflow",
    icon: "⚡",
    entries: [
      { query: "Plan follow-up", intent: "action", dataCheck: "Active encounter", cardFormat: "follow_up", contentZone: "Radio options + reasoning", fallback: "Text: start consultation first" },
      { query: "Draft advice", intent: "action", dataCheck: "Diagnosis + meds", cardFormat: "advice_bundle", contentZone: "Bullet list", fallback: "Generic wellness tips" },
      { query: "Translate to Hindi", intent: "action", dataCheck: "Content exists", cardFormat: "translation", contentZone: "Translation pair + copy", fallback: "Text: nothing to translate" },
      { query: "Copy prescription", intent: "action", dataCheck: "Generated meds", cardFormat: "rx_preview", contentZone: "Structured Rx + copy", fallback: "Text: generate meds first" },
      { query: "Completeness check", intent: "action", dataCheck: "RxPad state", cardFormat: "completeness", contentZone: "Section checklist", fallback: "Always available" },
    ],
  },
  {
    category: "Document Analysis",
    icon: "📄",
    entries: [
      { query: "Scan report", intent: "document_analysis", dataCheck: "Document uploaded", cardFormat: "ocr_extraction", contentZone: "Structured sections", fallback: "Text: upload a document" },
      { query: "Extract lab values", intent: "document_analysis", dataCheck: "Lab report uploaded", cardFormat: "ocr_pathology", contentZone: "Flagged data rows", fallback: "Text: upload lab report" },
    ],
  },
  {
    category: "Operational & Analytics",
    icon: "📊",
    entries: [
      { query: "Today's schedule", intent: "operational", dataCheck: "Appointments", cardFormat: "patient_list", contentZone: "Patient list rows", fallback: "Text: no patients today" },
      { query: "Follow-up dues", intent: "operational", dataCheck: "Follow-up records", cardFormat: "follow_up_list", contentZone: "Patient list + overdue flags", fallback: "Text: no follow-ups due" },
      { query: "Revenue", intent: "operational", dataCheck: "Billing data", cardFormat: "revenue_bar", contentZone: "Stacked bar chart", fallback: "Text: no transactions" },
      { query: "Weekly KPIs", intent: "operational", dataCheck: "Aggregated metrics", cardFormat: "analytics_table", contentZone: "KPI table (this/last/delta)", fallback: "Text: no data" },
      { query: "Demographics", intent: "operational", dataCheck: "Patient registry", cardFormat: "donut_chart", contentZone: "Donut/pie chart", fallback: "Empty chart" },
      { query: "Peak hours", intent: "operational", dataCheck: "Time data", cardFormat: "heatmap", contentZone: "Grid heatmap", fallback: "Empty heatmap" },
      { query: "Vaccination schedule", intent: "operational", dataCheck: "Vaccine records", cardFormat: "vaccination_schedule", contentZone: "Schedule + status badges", fallback: "Text: no records" },
    ],
  },
  {
    category: "Follow-Up & Clarification",
    icon: "🔄",
    entries: [
      { query: "Yes, show details", intent: "follow_up", dataCheck: "Previous context", cardFormat: "Refined card", contentZone: "Depends on query", fallback: "Text: rephrase request" },
      { query: "Option 2", intent: "follow_up", dataCheck: "Multi-option response", cardFormat: "Selected option card", contentZone: "Per option data shape", fallback: "Text: clarify selection" },
      { query: "Compare with last month", intent: "follow_up", dataCheck: "Previous + historical data", cardFormat: "comparison card", contentZone: "Comparison table/chart", fallback: "Text: what to compare?" },
    ],
  },
  {
    category: "Safety & Guardrails",
    icon: "🛡",
    entries: [
      { query: "Non-medical query", intent: "out_of_scope", dataCheck: "N/A", cardFormat: "guardrail", contentZone: "Redirect + pills", fallback: "Always guardrail" },
      { query: "Ambiguous input", intent: "ambiguous", dataCheck: "N/A", cardFormat: "text + pills", contentZone: "Sorry message + 4 pills", fallback: "Guided suggestions" },
      { query: "Allergy conflict", intent: "clinical_question", dataCheck: "Meds + allergies", cardFormat: "allergy_conflict", contentZone: "Drug vs allergen + alternatives", fallback: "Text: no allergies on record" },
    ],
  },
]

// ── Content Zone Types ──────────────────────────────────────

const CONTENT_ZONE_TYPES = [
  { zone: "Inline Data Rows", description: "Section-tagged key:value pairs. Most common pattern.", usedIn: "Summaries, Vitals, Last visit, Specialty", icon: "═", category: "data" },
  { zone: "Line Chart", description: "Time-series with threshold lines and tone coloring.", usedIn: "Lab trends, Vital trends, Patient volume", icon: "📈", category: "chart" },
  { zone: "Bar Chart", description: "Categorical comparisons with stacked segments.", usedIn: "Revenue, Vital trends (bar), Condition distribution", icon: "📊", category: "chart" },
  { zone: "Comparison Table", description: "Previous vs current with delta indicators.", usedIn: "Lab comparison, Revenue comparison", icon: "⇔", category: "data" },
  { zone: "Checkbox List", description: "Multi-select with urgency tiers.", usedIn: "DDX, Investigation bundle, Bulk actions", icon: "☑", category: "list" },
  { zone: "Radio List", description: "Single-select with reasoning.", usedIn: "Follow-up scheduling, Follow-up questions", icon: "◉", category: "list" },
  { zone: "Bullet List", description: "Itemized content with optional copy-all.", usedIn: "Advice, Guidelines, Text lists", icon: "•", category: "list" },
  { zone: "Medication Display", description: "Drug + dosage + timing + duration + safety.", usedIn: "Protocol meds, Rx preview, Med history", icon: "💊", category: "specialized" },
  { zone: "Patient List", description: "Name, age, time, status, complaint rows.", usedIn: "Queue, Follow-up list, Search results", icon: "👤", category: "data" },
  { zone: "SBAR Sections", description: "Situation → Background → Assessment → Recommendation.", usedIn: "Patient summary, Specialty summaries", icon: "S", category: "specialized" },
  { zone: "Donut / Pie Chart", description: "Proportional distribution visualization.", usedIn: "Demographics, Diagnosis breakdown", icon: "◔", category: "chart" },
  { zone: "Heatmap Grid", description: "Row x Column intensity grid.", usedIn: "Peak hours, Weekly volume", icon: "▦", category: "chart" },
  { zone: "KPI Table", description: "Metric rows with period comparison and delta.", usedIn: "Weekly KPIs, Analytics, Follow-up rate", icon: "▤", category: "data" },
  { zone: "Clinical Narrative", description: "AI-generated paragraph summary.", usedIn: "Patient summary (collapsed), Narrative card", icon: "¶", category: "specialized" },
  { zone: "Translation Pair", description: "Source left, target right, with copy.", usedIn: "Translation card (Hindi, Telugu, etc.)", icon: "🌐", category: "specialized" },
  { zone: "Drug Interaction", description: "Drug A vs B + severity + action.", usedIn: "Drug interaction, Allergy conflict", icon: "⚠", category: "specialized" },
  { zone: "Vaccination Schedule", description: "Vaccine + due date + status badge.", usedIn: "Vaccination schedule, ANC schedule", icon: "💉", category: "specialized" },
  { zone: "Timeline", description: "Chronological event list with type markers.", usedIn: "Patient timeline (visits, labs, procedures)", icon: "⏱", category: "specialized" },
]

const ZONE_CATEGORY_STYLES: Record<string, { label: string; bg: string; border: string; dot: string }> = {
  data: { label: "Data Display", bg: "bg-blue-50/60", border: "border-l-blue-400", dot: "bg-blue-500" },
  chart: { label: "Charts", bg: "bg-emerald-50/60", border: "border-l-emerald-400", dot: "bg-emerald-500" },
  list: { label: "Lists", bg: "bg-amber-50/60", border: "border-l-amber-400", dot: "bg-amber-500" },
  specialized: { label: "Specialized", bg: "bg-violet-50/60", border: "border-l-violet-400", dot: "bg-violet-500" },
}

// ── Component ────────────────────────────────────────────────

export default function IntentClassificationSection({ onNavigateTab }: { onNavigateTab?: (tab: string) => void } = {}) {
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-10">

      {/* ── Page Header / Intro ── */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 px-6 py-5">
        <h3 className="mb-1 text-[18px] font-bold text-slate-800">How Dr. Agent Decides What to Show</h3>
        <p className="max-w-2xl text-[12px] leading-[1.6] text-slate-500">
          Dr. Agent is an <strong className="text-slate-700">AI co-pilot</strong> built for{" "}
          <strong className="text-slate-700">doctors, nurses, admins, and clinical operators</strong> — anyone
          involved in the patient care workflow. It does two things:{" "}
          <strong className="text-slate-700">surfaces the right information</strong> at the right time (summaries,
          vitals, history, trends) and <strong className="text-slate-700">takes action</strong> on behalf of the
          user — cancelling appointments, saving uploaded documents against a patient, generating bills,
          sending reminders, and more.
        </p>
        <p className="mt-2 max-w-2xl text-[12px] leading-[1.6] text-slate-500">
          Every response starts with a decision: <strong className="text-slate-700">UI card</strong> or{" "}
          <strong className="text-slate-700">plain text</strong>? This section covers the{" "}
          <strong className="text-slate-700">7-step pipeline</strong>,{" "}
          <strong className="text-slate-700">10 intent categories</strong>, and the complete{" "}
          <strong className="text-slate-700">intent-to-card reference</strong> mapping 35+ query patterns to outputs.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: TWO RESPONSE TYPES
      ═══════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[15px] font-bold text-slate-800">Two Response Types</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {RESPONSE_TYPES.map((rt) => {
            const isViolet = rt.tint === "violet"
            return (
              <div key={rt.type} className={`rounded-xl border p-5 ${isViolet ? "border-violet-200 bg-violet-50/30" : "border-blue-200 bg-blue-50/30"}`}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-[16px] ${isViolet ? "bg-violet-100" : "bg-blue-100"}`}>{rt.icon}</span>
                  <h5 className={`text-[13px] font-bold ${isViolet ? "text-violet-800" : "text-blue-800"}`}>{rt.type}</h5>
                </div>
                <p className="mb-3 text-[11px] leading-relaxed text-slate-500">{rt.description}</p>

                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">When</p>
                <div className="mb-3 space-y-1">
                  {rt.when.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${isViolet ? "bg-violet-300" : "bg-blue-300"}`} />
                      <span className="text-[10px] leading-relaxed text-slate-500">{w}</span>
                    </div>
                  ))}
                </div>

                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">Examples</p>
                <div className="space-y-1">
                  {rt.examples.map((ex, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1 ${isViolet ? "bg-violet-50/60" : "bg-blue-50/60"}`}>
                      <span className="text-[10px] text-slate-500">{ex.query}</span>
                      <span className={`ml-auto text-[9px] font-mono ${isViolet ? "text-violet-500" : "text-blue-500"}`}>{ex.card}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: DECISION PIPELINE
      ═══════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[15px] font-bold text-slate-800">Decision Pipeline</h4>

        {/* Visual flow — connected cards with arrows */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white px-6 py-7">
          <div className="flex items-start gap-0 min-w-[960px]">
            {DECISION_FLOW_STEPS.map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center" style={{ width: 130 }}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-600">
                    {s.step}
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-slate-700 text-center leading-tight">{s.label}</p>
                  <p className="mt-1 text-[9px] text-slate-400 text-center leading-snug max-w-[115px]">{s.description}</p>
                </div>
                {i < DECISION_FLOW_STEPS.length - 1 && (
                  <div className="flex items-center pt-4" style={{ minWidth: 8 }}>
                    <div className="h-[1.5px] w-4 bg-slate-200" />
                    <svg width="6" height="8" viewBox="0 0 6 8" className="shrink-0 text-slate-300">
                      <path d="M0 0 L6 4 L0 8Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Outcome callout */}
          <div className="mt-6 flex items-center justify-center gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-1.5 rounded-md bg-violet-50 border border-violet-200 px-3 py-1.5">
              <span className="text-[10px]">▣</span>
              <span className="text-[10px] font-medium text-violet-700">Data exists → <strong>UI Card</strong></span>
            </div>
            <span className="text-[10px] text-slate-300">or</span>
            <div className="flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-3 py-1.5">
              <span className="text-[10px]">≡</span>
              <span className="text-[10px] font-medium text-blue-700">No data → <strong>Text + Pills</strong></span>
            </div>
          </div>
        </div>

        {/* Input routing */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-4 text-[11px] font-semibold text-slate-700">Input Routing: Two paths, one decision</p>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="flex items-start gap-10 justify-center">
                {/* Left: Pills */}
                <div className="flex flex-col items-center gap-2 w-52">
                  <div className="flex h-12 w-full items-center justify-center rounded-lg bg-violet-50 border border-violet-200 gap-2">
                    <span className="text-[13px]">💊</span>
                    <span className="text-[11px] font-semibold text-violet-700">Canned Pill Tap</span>
                  </div>
                  <svg width="2" height="14" className="text-violet-300"><rect width="2" height="14" fill="currentColor" /></svg>
                  <div className="flex h-11 w-full items-center justify-center rounded-lg bg-violet-600 text-white">
                    <span className="text-[10px] font-mono font-semibold">PILL_INTENT_MAP</span>
                  </div>
                  <span className="text-[8px] text-slate-400">160+ mapped → skip classification</span>
                </div>

                {/* Right: Text */}
                <div className="flex flex-col items-center gap-2 w-52">
                  <div className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-50 border border-blue-200 gap-2">
                    <span className="text-[13px]">⌨</span>
                    <span className="text-[11px] font-semibold text-blue-700">Free Text Input</span>
                  </div>
                  <svg width="2" height="14" className="text-blue-300"><rect width="2" height="14" fill="currentColor" /></svg>
                  <div className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-white">
                    <span className="text-[10px] font-semibold">Intent Engine (96+ rules)</span>
                  </div>
                  <span className="text-[8px] text-slate-400">Normalize → Match → Classify</span>
                </div>
              </div>

              {/* Converge */}
              <div className="flex justify-center my-3">
                <svg width="440" height="28" viewBox="0 0 440 28" className="text-slate-300">
                  <path d="M114 0 L114 10 L220 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M326 0 L326 10 L220 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M220 20 L220 28" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <polygon points="216,28 224,28 220,33" fill="currentColor" />
                </svg>
              </div>

              {/* Data Check */}
              <div className="flex justify-center mb-3">
                <div className="flex h-11 w-56 items-center justify-center rounded-lg bg-slate-800 text-white gap-2">
                  <span className="text-[11px] font-semibold">Intent + Data Availability Check</span>
                </div>
              </div>

              {/* Branch */}
              <div className="flex justify-center mb-3">
                <svg width="440" height="28" viewBox="0 0 440 28" className="text-slate-300">
                  <path d="M220 0 L220 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M220 10 L130 22" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
                  <path d="M220 10 L310 22" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
                  <polygon points="126,19 134,22 128,26" fill="#8B5CF6" />
                  <polygon points="306,19 314,22 308,26" fill="#3B82F6" />
                </svg>
              </div>

              {/* Two outcomes */}
              <div className="flex justify-center gap-14">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-11 w-44 items-center justify-center rounded-lg bg-violet-50 border border-violet-200 gap-1.5">
                    <span className="text-[12px]">▣</span>
                    <span className="text-[11px] font-semibold text-violet-700">UI Card</span>
                  </div>
                  <span className="text-[8px] text-violet-400">63+ card types</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-11 w-44 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 gap-1.5">
                    <span className="text-[12px]">≡</span>
                    <span className="text-[11px] font-semibold text-blue-700">Text + Pills</span>
                  </div>
                  <span className="text-[8px] text-blue-400">Explanation / guardrail / fallback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: 10 INTENT CATEGORIES
      ═══════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[15px] font-bold text-slate-800">10 Intent Categories</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTENT_CATEGORIES.map((ic) => (
            <div key={ic.category} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-[14px]">{ic.icon}</span>
                <span className="text-[12px] font-bold text-slate-800">{ic.label}</span>
                <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                  {ic.defaultFormat}
                </span>
              </div>
              <p className="mb-2 text-[11px] leading-relaxed text-slate-500">{ic.description}</p>

              <div className="mb-2 flex flex-wrap gap-1">
                {ic.triggerExamples.map((t) => (
                  <span key={t} className="rounded-md bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">&quot;{t}&quot;</span>
                ))}
              </div>

              <div className="mb-2 flex flex-wrap gap-1">
                {ic.cardOutputs.slice(0, 5).map((c) => (
                  <span key={c} className="rounded bg-slate-50 px-1 py-0.5 text-[8px] font-mono text-slate-400">{c}</span>
                ))}
                {ic.cardOutputs.length > 5 && (
                  <span className="rounded bg-slate-50 px-1 py-0.5 text-[8px] text-slate-400">+{ic.cardOutputs.length - 5}</span>
                )}
              </div>

              <div className="rounded-md bg-slate-50 px-2 py-1.5">
                <p className="text-[10px] leading-relaxed text-slate-400">
                  <strong className="text-slate-500">Fallback:</strong> {ic.fallbackBehavior}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: WALKTHROUGH
      ═══════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-2 text-[15px] font-bold text-slate-800">Walkthrough: &quot;{HBAIC_WALKTHROUGH.query}&quot;</h4>
        <p className="mb-4 text-[11px] text-slate-400">
          Same question, 3 data scenarios, 3 different outcomes. Click any row to see the AI thinking process.
        </p>

        {/* Summary table */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 border-l-violet-300">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2.5 text-left font-semibold text-slate-500 w-[30%]">Scenario</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-500 w-[10%]">Output</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-500">What happens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HBAIC_WALKTHROUGH.scenarios.map((s, idx) => (
                <tr
                  key={idx}
                  className={`cursor-pointer transition-colors ${expandedScenario === idx ? "bg-violet-50/30" : "hover:bg-slate-50"}`}
                  onClick={() => setExpandedScenario(expandedScenario === idx ? null : idx)}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-700">{s.condition}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold text-white ${s.outcome === "card" ? "bg-violet-600" : "bg-blue-500"}`}>
                      {s.outcome}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {s.summary.split("→").map((part, pi) => (
                      <React.Fragment key={pi}>
                        {pi > 0 && <span className="text-slate-300"> → </span>}
                        <span>{part.trim()}</span>
                      </React.Fragment>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expanded detail */}
        {expandedScenario !== null && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 border-l-violet-300">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${HBAIC_WALKTHROUGH.scenarios[expandedScenario].outcome === "card" ? "bg-violet-600" : "bg-blue-500"}`}>
                  {HBAIC_WALKTHROUGH.scenarios[expandedScenario].outcome.toUpperCase()}
                </span>
                <span className="text-[12px] font-semibold text-slate-700">{HBAIC_WALKTHROUGH.scenarios[expandedScenario].condition}</span>
                <span className="text-[10px] text-slate-400">→ <strong className="text-slate-600">{HBAIC_WALKTHROUGH.scenarios[expandedScenario].cardType}</strong></span>
              </div>
              <button onClick={() => setExpandedScenario(null)} className="text-[10px] text-slate-400 hover:text-slate-600">Close ✕</button>
            </div>
            <div className="px-5 py-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300">AI Thinking Process</p>
              <div className="space-y-1.5">
                {HBAIC_WALKTHROUGH.scenarios[expandedScenario].thinkingProcess.map((tp, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                    <span className="mt-0.5 shrink-0 rounded bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700 min-w-[70px] text-center">
                      {tp.aspect}
                    </span>
                    <span className="text-[10px] leading-relaxed text-slate-600">{tp.decision}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: INTENT-TO-CARD REFERENCE CHART
      ═══════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-2 text-[15px] font-bold text-slate-800">Intent-to-Card Reference</h4>
        <p className="mb-4 text-[11px] text-slate-400">
          Query → Intent → Data Check → Card → Content Zone → Fallback. The single source of truth for what Dr. Agent shows.
        </p>

        <div className="space-y-3">
          {SYNTHETIC_DATA_CHART.map((group) => (
            <div key={group.category} className="overflow-hidden rounded-xl border border-slate-200 border-l-[3px] border-l-violet-200">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setExpandedCategory(expandedCategory === group.category ? null : group.category)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">{group.icon}</span>
                  <span className="text-[12px] font-bold text-slate-700">{group.category}</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                    {group.entries.length}
                  </span>
                </div>
                <span className={`text-[11px] text-slate-400 transition-transform ${expandedCategory === group.category ? "rotate-180" : ""}`}>▼</span>
              </button>

              {expandedCategory === group.category && (
                <div className="border-t border-slate-100">
                  {("note" in group && group.note) && (
                    <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                      <p className="text-[9px] text-slate-400 italic">{group.note}</p>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-3 py-2 font-semibold text-slate-500">Query</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Intent</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Data Check</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Card</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Content Zone</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Fallback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {group.entries.map((entry, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-3 py-2 font-medium text-slate-700">{entry.query}</td>
                            <td className="px-3 py-2">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                                {entry.intent}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500">{entry.dataCheck}</td>
                            <td className="px-3 py-2">
                              <code className="rounded bg-violet-50 border border-violet-100 px-1 py-0.5 text-[9px] font-mono text-violet-600">{entry.cardFormat}</code>
                            </td>
                            <td className="px-3 py-2 text-slate-500">{entry.contentZone}</td>
                            <td className="px-3 py-2 text-slate-400">{entry.fallback}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: CONTENT ZONE TYPES
      ═══════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-2 text-[15px] font-bold text-slate-800">18 Content Zone Types</h4>
        <p className="mb-4 text-[11px] text-slate-400">
          When a card is selected, its body uses one of these zone types based on data shape.
        </p>

        {/* Summary by category */}
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          {Object.entries(ZONE_CATEGORY_STYLES).map(([key, style]) => {
            const zones = CONTENT_ZONE_TYPES.filter(z => z.category === key)
            return (
              <div key={key} className={`rounded-lg border border-slate-200 p-3 ${style.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  <p className="text-[10px] font-semibold text-slate-700">{style.label} <span className="text-slate-400">({zones.length})</span></p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {zones.map(z => (
                    <span key={z.zone} className="rounded bg-white/70 px-1.5 py-0.5 text-[8px] text-slate-500">{z.icon} {z.zone}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Detailed grid */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_ZONE_TYPES.map((cz) => {
            const catStyle = ZONE_CATEGORY_STYLES[cz.category]
            return (
              <div key={cz.zone} className={`rounded-lg border border-slate-100 bg-white px-3 py-2.5 border-l-2 ${catStyle?.border || ""}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[13px]">{cz.icon}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{cz.zone}</span>
                </div>
                <p className="mb-1 text-[10px] leading-relaxed text-slate-500">{cz.description}</p>
                <p className="text-[9px] text-slate-400">{cz.usedIn}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <section className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="mb-2 text-[12px] font-semibold text-slate-600">Next: How are these cards built? →</p>
        <p className="mb-3 text-[11px] leading-relaxed text-slate-400">
          The intent engine picks the card. <strong className="text-slate-500">Card Anatomy</strong> defines the 5-zone structure
          every card follows. <strong className="text-slate-500">Card Catalog</strong> shows all 63+ types with live previews.
        </p>
        <div className="flex flex-wrap gap-2">
          {onNavigateTab ? (
            <>
              <button
                onClick={() => onNavigateTab("card-anatomy")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-[11px] font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Card Anatomy & Patterns
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button
                onClick={() => onNavigateTab("card-catalog")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Card Catalog
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button
                onClick={() => onNavigateTab("response-management")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Response Management
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </>
          ) : (
            <p className="text-[10px] text-slate-400">
              See <strong className="text-slate-500">Card Anatomy & Patterns</strong>, <strong className="text-slate-500">Card Catalog</strong>,
              and <strong className="text-slate-500">Response Management</strong> tabs.
            </p>
          )}
        </div>
      </section>

    </div>
  )
}

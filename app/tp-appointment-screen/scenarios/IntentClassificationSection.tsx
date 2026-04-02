"use client"

import React, { useState } from "react"

// ─────────────────────────────────────────────────────────────
// Intent Classification & Response Types
// The decision layer that sits between user input and response.
// ─────────────────────────────────────────────────────────────

// ── Two Response Types ──────────────────────────────────────

const RESPONSE_TYPES = [
  {
    type: "UI Card",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    icon: "▣",
    description: "Structured visual cards with headers, data sections, charts, tables, copy actions, and navigation. Used when data exists and a visual format adds clarity over plain text.",
    when: [
      "Sufficient structured data exists (labs, vitals, medications, visit history)",
      "The response benefits from visual structure (trends, comparisons, checklists)",
      "The output needs actionable elements (copy to RxPad, checkboxes, navigation links)",
      "Multiple data points need to be grouped and scannable (patient summary, investigation bundle)",
    ],
    examples: [
      { query: "Patient summary", card: "patient_summary / sbar_overview" },
      { query: "HbA1c trend", card: "lab_trend (line chart)" },
      { query: "Suggest DDX", card: "ddx (checkbox list)" },
      { query: "Today's vitals", card: "vitals_summary (data rows)" },
      { query: "Weekly KPIs", card: "analytics_table (KPI table)" },
    ],
  },
  {
    type: "Text Response",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    icon: "≡",
    description: "Plain conversational text, sometimes with inline suggestion pills. Used when no visual structure is needed, data is insufficient for a card, or the query is a simple question.",
    when: [
      "No relevant data exists for the query (e.g., asking for labs when none are recorded)",
      "The answer is a simple fact or explanation (e.g., 'What is the dosage for Amoxicillin?')",
      "The intent is ambiguous and the system needs to ask a clarifying question",
      "The query is out of scope (guardrail response with redirect suggestions)",
    ],
    examples: [
      { query: "Show HbA1c trend (no data)", card: "Text: 'No HbA1c values found for this patient...'" },
      { query: "What is CKD?", card: "Text: Clinical explanation paragraph" },
      { query: "Tell me a joke", card: "Text: Guardrail + suggestion pills" },
      { query: "hmm", card: "Text: Clarification + contextual pill suggestions" },
    ],
  },
]

// ── Intent Categories ───────────────────────────────────────

const INTENT_CATEGORIES = [
  {
    category: "data_retrieval",
    label: "Data Retrieval",
    color: "#3B82F6",
    defaultFormat: "card",
    description: "Fetch and display existing patient or clinic data — summaries, vitals, labs, history, specialty records.",
    triggerExamples: ["Patient summary", "Show vitals", "Lab results", "Medical history", "Last visit", "Obstetric summary"],
    cardOutputs: ["patient_summary", "sbar_overview", "vitals_summary", "lab_panel", "medical_history", "last_visit", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary"],
    fallbackBehavior: "If no data exists, text response with suggestion to upload records or enter data manually.",
  },
  {
    category: "clinical_decision",
    label: "Clinical Decision",
    color: "#059669",
    defaultFormat: "card",
    description: "AI-assisted clinical reasoning — differential diagnosis, protocol medications, investigation recommendations, clinical guidelines.",
    triggerExamples: ["Suggest DDX", "Protocol medications", "What tests to order?", "Clinical guideline for CKD"],
    cardOutputs: ["ddx", "protocol_meds", "investigation_bundle", "clinical_guideline"],
    fallbackBehavior: "Requires symptom or diagnosis context. If absent, asks for chief complaint first.",
  },
  {
    category: "comparison",
    label: "Comparison & Trends",
    color: "#D97706",
    defaultFormat: "card",
    description: "Visualise changes over time — lab trends, vital trends, lab comparisons, disease trajectory.",
    triggerExamples: ["HbA1c trend", "Compare labs", "BP trend", "Vital trends", "eGFR trajectory"],
    cardOutputs: ["lab_trend", "lab_comparison", "vitals_trend_line", "vitals_trend_bar"],
    fallbackBehavior: "If only one data point exists, text response with the single value. If zero, text saying no data available.",
  },
  {
    category: "action",
    label: "Action & Workflow",
    color: "#8B5CF6",
    defaultFormat: "hybrid",
    description: "Trigger a workflow action — schedule follow-up, translate advice, copy prescription, generate referral.",
    triggerExamples: ["Plan follow-up", "Translate to Hindi", "Copy prescription", "Generate referral"],
    cardOutputs: ["follow_up", "translation", "rx_preview", "referral", "voice_structured_rx", "advice_bundle"],
    fallbackBehavior: "If no active prescription or data to act on, text explaining what's needed first.",
  },
  {
    category: "document_analysis",
    label: "Document Analysis",
    color: "#EC4899",
    defaultFormat: "card",
    description: "Extract and structure data from uploaded documents — scanned reports, handwritten prescriptions, lab printouts.",
    triggerExamples: ["Scan this report", "Extract lab values", "OCR this prescription"],
    cardOutputs: ["ocr_pathology", "ocr_extraction"],
    fallbackBehavior: "If no document uploaded, text prompting the doctor to upload a file.",
  },
  {
    category: "clinical_question",
    label: "Clinical Question",
    color: "#0EA5E9",
    defaultFormat: "text",
    description: "Knowledge questions — 'What is?', 'How to?', dosing queries, mechanism of action, side effects.",
    triggerExamples: ["What is the mechanism of Metformin?", "Dosing for Amoxicillin", "Side effects of ACE inhibitors"],
    cardOutputs: ["text (plain)", "drug_interaction (if interaction query)", "allergy_conflict (if allergy query)"],
    fallbackBehavior: "Text response with clinical explanation. May include a card if the question maps to a structured output.",
  },
  {
    category: "operational",
    label: "Operational & Analytics",
    color: "#F97316",
    defaultFormat: "card",
    description: "Clinic-level operations — today's queue, revenue, follow-up dues, analytics, bulk messaging, vaccination schedules.",
    triggerExamples: ["Today's schedule", "Weekly KPIs", "Revenue today", "Follow-up dues", "Chronic conditions breakdown"],
    cardOutputs: ["patient_list", "follow_up_list", "revenue_bar", "revenue_comparison", "analytics_table", "donut_chart", "pie_chart", "line_graph", "condition_bar", "heatmap", "billing_summary", "vaccination_due_list", "anc_schedule_list", "bulk_action"],
    fallbackBehavior: "Always returns a card with aggregated clinic data.",
  },
  {
    category: "out_of_scope",
    label: "Out of Scope",
    color: "#EF4444",
    defaultFormat: "card",
    description: "Non-medical, non-clinical queries — sports scores, weather, news, recipes. Triggers the guardrail.",
    triggerExamples: ["Tell me a joke", "What's the weather?", "Latest cricket score"],
    cardOutputs: ["guardrail"],
    fallbackBehavior: "Guardrail card with polite redirect + contextual suggestion pills to guide back to clinical queries.",
  },
  {
    category: "ambiguous",
    label: "Ambiguous",
    color: "#6B7280",
    defaultFormat: "text",
    description: "Cannot determine clear intent. Low-confidence match or open-ended input.",
    triggerExamples: ["hmm", "ok", "anything else?", "help"],
    cardOutputs: ["text + suggestion pills"],
    fallbackBehavior: "Sorry message with 4 contextual suggestion pills based on patient data.",
  },
  {
    category: "follow_up",
    label: "Follow-Up / Clarification",
    color: "#14B8A6",
    defaultFormat: "card",
    description: "Multi-step interactions — answering a follow-up question, selecting from options, refining a previous response.",
    triggerExamples: ["Yes, show me the details", "Option 2", "Compare with last month"],
    cardOutputs: ["follow_up_question", "Any card from the refined query"],
    fallbackBehavior: "If context is lost, text asking the doctor to rephrase.",
  },
]

// ── Decision Flow Steps ─────────────────────────────────────

const DECISION_FLOW_STEPS = [
  {
    step: 1,
    label: "Receive Input",
    color: "#6B7280",
    description: "Doctor types a question or taps a canned pill. The raw input enters the pipeline.",
  },
  {
    step: 2,
    label: "Classify Intent",
    color: "#3B82F6",
    description: "The intent engine normalizes the input (lowercase, strip special chars) and matches against 96+ keyword rules across 10 intent categories. Canned pills bypass this step — they have pre-mapped intents via PILL_INTENT_MAP (160+ entries).",
  },
  {
    step: 3,
    label: "Check Data Availability",
    color: "#8B5CF6",
    description: "The reply engine checks patient/clinic data: Do we have labs? Vitals? History? Medications? Specialty records? The answer determines whether we can build a card or must fall back to text.",
  },
  {
    step: 4,
    label: "Select Response Format",
    color: "#059669",
    description: "Based on intent + data availability: Card (structured visual), Hybrid (card + explanatory text), or Text (plain response). Data-rich queries get cards; data-absent queries get helpful text with suggestions.",
  },
  {
    step: 5,
    label: "Choose Card Type",
    color: "#D97706",
    description: "The reply engine matches the query to one of 63+ card types. It considers: what content zone fits best (chart, table, list, data rows), what section tags to apply, whether copy actions are needed, and what insight to generate.",
  },
  {
    step: 6,
    label: "Assemble Card Anatomy",
    color: "#EF4444",
    description: "The selected card is built with its full anatomy: Header (icon, title, tags, completeness donut), Content Zone (the primary data payload), Insight Zone (AI interpretation), Canned Pills (next-step suggestions), and Footer (CTAs if needed).",
  },
  {
    step: 7,
    label: "Render & Deliver",
    color: "#EC4899",
    description: "The assembled card (or text) is rendered in the chat panel. Copy payloads are wired to RxPad. Sidebar links are connected. Follow-up pills appear below for the next interaction.",
  },
]

// ── Walkthrough Example: HbA1c Trend ────────────────────────

const HBAIC_WALKTHROUGH = {
  query: "Show me the HbA1c trend",
  scenarios: [
    {
      condition: "Multiple HbA1c values exist (3+ data points)",
      outcome: "card",
      cardType: "lab_trend (line chart)",
      thinkingProcess: [
        { aspect: "Data Check", decision: "Found 5 HbA1c values across visits (Jun'25 to Feb'26). Sufficient for trend visualization." },
        { aspect: "Format Decision", decision: "Multiple data points means a visual trend is far more useful than listing numbers in text. Choose card format." },
        { aspect: "Content Zone", decision: "Time-series data maps best to a line chart. Each point plotted with date on X-axis, value on Y-axis." },
        { aspect: "Header", decision: "Title: 'HbA1c Trend'. Tag: Lab icon. Subtext: date range. No completeness donut (not a summary card)." },
        { aspect: "Reference Range", decision: "Target HbA1c < 6.5%. Show as threshold line on chart. Values above threshold colored in critical tone." },
        { aspect: "Insight Zone", decision: "AI generates: 'Gradual improvement from 10.1% to 9.2% over 8 months, but still above target 6.5%. Current regimen showing effect.'" },
        { aspect: "Canned Pills", decision: "Suggest follow-ups: 'Compare with other labs', 'Suggest medications', 'Full patient summary'" },
        { aspect: "Footer / Actions", decision: "No copy action needed (read-only historical data). No footer CTA." },
      ],
    },
    {
      condition: "Only 1 HbA1c value exists",
      outcome: "text",
      cardType: "Text response (no card)",
      thinkingProcess: [
        { aspect: "Data Check", decision: "Found only 1 HbA1c value: 9.2% from Feb 2026. Cannot show a trend with a single point." },
        { aspect: "Format Decision", decision: "Single data point means no visual benefit from a chart. Respond with text." },
        { aspect: "Text Content", decision: "State the single value with context: 'There is one HbA1c value available: 9.2% (Feb 2026). This is above the target range of < 6.5%.'" },
        { aspect: "Reference Range", decision: "Mention the reference range inline: 'Target: < 6.5%. This value is elevated.'" },
        { aspect: "Insight", decision: "If this is the first reading, note: 'This is the baseline value. A follow-up HbA1c in 3 months will help assess the trend.'" },
        { aspect: "Follow-up Suggestions", decision: "Offer pills: 'Full lab panel', 'Suggest medications', 'Patient summary' to guide the doctor forward." },
      ],
    },
    {
      condition: "No HbA1c values found",
      outcome: "text",
      cardType: "Text response (no card)",
      thinkingProcess: [
        { aspect: "Data Check", decision: "No HbA1c values in EMR or uploaded documents for this patient." },
        { aspect: "Format Decision", decision: "No data means text response explaining the gap." },
        { aspect: "Text Content", decision: "'No HbA1c values found for this patient. You can upload a lab report or enter the value manually.'" },
        { aspect: "Actionable Guidance", decision: "Suggest ordering HbA1c if the patient has diabetes or risk factors." },
        { aspect: "Follow-up Suggestions", decision: "Offer pills: 'Order investigations', 'Upload lab report', 'Patient summary'" },
      ],
    },
  ],
}

// ── Intent-to-Card Synthetic Data Chart ─────────────────────

const SYNTHETIC_DATA_CHART = [
  {
    category: "Patient Context & Summaries",
    color: "#3B82F6",
    entries: [
      { query: "Patient summary", intent: "data_retrieval", dataCheck: "Any patient data exists", cardFormat: "patient_summary / sbar_overview", contentZone: "Inline data rows + clinical narrative", fallback: "New patient: text suggesting to start with history" },
      { query: "SBAR overview", intent: "data_retrieval", dataCheck: "Patient history + vitals + labs", cardFormat: "sbar_overview", contentZone: "SBAR structured sections (S/B/A/R)", fallback: "Minimal data: abbreviated SBAR with gaps noted" },
      { query: "Pre-visit intake", intent: "data_retrieval", dataCheck: "Symptom collector data exists", cardFormat: "symptom_collector", contentZone: "Inline data rows (symptoms, severity, duration)", fallback: "No intake: text 'No pre-visit data submitted by patient'" },
      { query: "Medical history", intent: "data_retrieval", dataCheck: "Chronic conditions / allergies / family history", cardFormat: "medical_history", contentZone: "Section-grouped data rows", fallback: "No history: text 'No medical history recorded'" },
      { query: "Past visit summaries", intent: "data_retrieval", dataCheck: "Previous visit records", cardFormat: "last_visit", contentZone: "5-section strip (symptoms, exam, dx, meds, labs)", fallback: "No visits: text 'No previous visit records found'" },
    ],
  },
  {
    category: "Labs & Vitals",
    color: "#059669",
    entries: [
      { query: "Today's vitals", intent: "data_retrieval", dataCheck: "Today's vitals recorded", cardFormat: "vitals_summary", contentZone: "Data rows with flags (high/low/normal)", fallback: "No vitals: text 'No vitals recorded for today'" },
      { query: "Lab results / Lab panel", intent: "data_retrieval", dataCheck: "Lab values in EMR or uploads", cardFormat: "lab_panel", contentZone: "Flagged data rows with reference ranges", fallback: "No labs: text 'No lab results found'" },
      { query: "HbA1c trend", intent: "comparison", dataCheck: "Multiple HbA1c values over time", cardFormat: "lab_trend (line chart)", contentZone: "Line chart with threshold line", fallback: "Single value: text. No values: text" },
      { query: "Compare labs", intent: "comparison", dataCheck: "Lab values from 2+ visits", cardFormat: "lab_comparison", contentZone: "Comparison table (prev vs current, delta, flags)", fallback: "Single visit: text 'Only one set of lab values'" },
      { query: "BP trend / Vital trends", intent: "comparison", dataCheck: "Multiple vitals readings", cardFormat: "vitals_trend_line / vitals_trend_bar", contentZone: "Line or bar chart with tone coloring", fallback: "Single reading: text with the value" },
    ],
  },
  {
    category: "Clinical Decision Support",
    color: "#8B5CF6",
    entries: [
      { query: "Suggest DDX", intent: "clinical_decision", dataCheck: "Symptoms or chief complaint available", cardFormat: "ddx", contentZone: "3-tier checkbox list (Can't Miss / Most Likely / Consider)", fallback: "No symptoms: text 'Please enter chief complaint first'" },
      { query: "Protocol medications", intent: "clinical_decision", dataCheck: "Diagnosis or symptom pattern", cardFormat: "protocol_meds", contentZone: "Medication display (drug, dose, timing, duration)", fallback: "No diagnosis: text 'Accept a diagnosis first'" },
      { query: "Suggest investigations", intent: "clinical_decision", dataCheck: "Diagnosis or clinical suspicion", cardFormat: "investigation_bundle", contentZone: "Checkbox list with rationale per test", fallback: "No clinical context: text asking for symptoms" },
      { query: "Drug interactions", intent: "clinical_question", dataCheck: "Active medications list", cardFormat: "drug_interaction", contentZone: "Drug A vs Drug B + severity + mechanism + action", fallback: "No active meds: text 'No medications on record'" },
      { query: "Clinical guideline", intent: "clinical_decision", dataCheck: "Specific condition mentioned", cardFormat: "clinical_guideline", contentZone: "Recommendation list with evidence level", fallback: "Vague query: text asking to specify condition" },
    ],
  },
  {
    category: "Actions & Workflow",
    color: "#D97706",
    entries: [
      { query: "Plan follow-up", intent: "action", dataCheck: "Active encounter", cardFormat: "follow_up", contentZone: "Radio options (1wk / 2wk / 1mo / custom) with reasoning", fallback: "No encounter: text 'Start a consultation first'" },
      { query: "Draft advice", intent: "action", dataCheck: "Diagnosis + medication context", cardFormat: "advice_bundle", contentZone: "Bullet list (lifestyle tips, med instructions)", fallback: "No diagnosis: generic wellness tips" },
      { query: "Translate to Hindi", intent: "action", dataCheck: "Text content to translate", cardFormat: "translation", contentZone: "Side-by-side (English | Hindi) with copy", fallback: "No content: text 'No advice or summary to translate'" },
      { query: "Copy prescription", intent: "action", dataCheck: "Generated meds / investigations", cardFormat: "rx_preview", contentZone: "Structured Rx sections with copy payload", fallback: "No prescription data: text 'Generate protocol meds first'" },
      { query: "Completeness check", intent: "action", dataCheck: "RxPad form state", cardFormat: "completeness", contentZone: "Section checklist (filled/empty counts)", fallback: "Always available when in consultation" },
    ],
  },
  {
    category: "Document Analysis",
    color: "#EC4899",
    entries: [
      { query: "Scan this report", intent: "document_analysis", dataCheck: "Document uploaded", cardFormat: "ocr_extraction", contentZone: "Structured sections from document", fallback: "No upload: text 'Please upload a document'" },
      { query: "Extract lab values", intent: "document_analysis", dataCheck: "Lab report uploaded", cardFormat: "ocr_pathology", contentZone: "Flagged data rows with reference ranges", fallback: "No lab report: text 'Upload a lab report'" },
    ],
  },
  {
    category: "Operational & Analytics (Clinic Level)",
    color: "#F97316",
    entries: [
      { query: "Today's schedule", intent: "operational", dataCheck: "Appointment data", cardFormat: "patient_list", contentZone: "Patient list (name, age, time, complaint, status)", fallback: "No appointments: text 'No patients scheduled today'" },
      { query: "Follow-up dues", intent: "operational", dataCheck: "Follow-up records", cardFormat: "follow_up_list", contentZone: "Patient list with overdue flags", fallback: "No follow-ups: text 'No follow-ups due'" },
      { query: "Revenue today / This week", intent: "operational", dataCheck: "Billing data", cardFormat: "revenue_bar / revenue_comparison", contentZone: "Stacked bar chart (paid/due/refunded)", fallback: "No billing data: text 'No transactions recorded'" },
      { query: "Weekly KPIs", intent: "operational", dataCheck: "Aggregated metrics", cardFormat: "analytics_table", contentZone: "KPI table (metric, this week, last week, delta)", fallback: "No data: text with empty state" },
      { query: "Patient demographics", intent: "operational", dataCheck: "Patient registry", cardFormat: "donut_chart / pie_chart", contentZone: "Donut or pie chart with segments", fallback: "No patients: empty chart" },
      { query: "Chronic condition breakdown", intent: "operational", dataCheck: "Diagnosis records", cardFormat: "condition_bar", contentZone: "Horizontal bar chart (top conditions)", fallback: "No diagnoses recorded: empty state" },
      { query: "Peak hours", intent: "operational", dataCheck: "Appointment time data", cardFormat: "heatmap", contentZone: "Grid heatmap (day x hour)", fallback: "No data: empty heatmap" },
      { query: "Vaccination schedule", intent: "operational", dataCheck: "Patient age + vaccine records", cardFormat: "vaccination_schedule / vaccination_due_list", contentZone: "Schedule list with status badges", fallback: "No vaccine records: text" },
    ],
  },
  {
    category: "Follow-Up & Clarification",
    color: "#14B8A6",
    entries: [
      { query: "Yes, show me the details", intent: "follow_up", dataCheck: "Previous response context exists", cardFormat: "Refined card from original query", contentZone: "Depends on the refined query (any zone type)", fallback: "Context lost: text asking to rephrase" },
      { query: "Option 2", intent: "follow_up", dataCheck: "Previous multi-option response", cardFormat: "Card matching the selected option", contentZone: "Determined by the selected option's data shape", fallback: "No options context: text 'Could you clarify what you'd like?'" },
      { query: "Compare with last month", intent: "follow_up", dataCheck: "Previous data + historical data", cardFormat: "lab_comparison / revenue_comparison", contentZone: "Comparison table or bar chart", fallback: "No previous context: text asking what to compare" },
    ],
  },
  {
    category: "Safety & Guardrails",
    color: "#EF4444",
    entries: [
      { query: "Non-medical query", intent: "out_of_scope", dataCheck: "N/A", cardFormat: "guardrail", contentZone: "Polite redirect message + suggestion pills", fallback: "Always shows guardrail + contextual pills" },
      { query: "Ambiguous / unclear", intent: "ambiguous", dataCheck: "N/A", cardFormat: "text + suggestion pills", contentZone: "Sorry message + 4 contextual pills", fallback: "Guided suggestions based on patient data" },
      { query: "Allergy conflict", intent: "clinical_question", dataCheck: "Active meds + allergy list", cardFormat: "allergy_conflict", contentZone: "Drug vs allergen + alternative suggestions", fallback: "No allergies on record: text confirming no conflicts" },
    ],
  },
]

// ── Content Zone Types ──────────────────────────────────────

const CONTENT_ZONE_TYPES = [
  { zone: "Inline Data Rows", description: "Section-tagged key:value pairs. Most common pattern for summaries and structured data.", usedIn: "Patient summary, Vitals, Last visit, Specialty summaries", icon: "═" },
  { zone: "Line Chart", description: "Time-series visualization with threshold lines and tone coloring.", usedIn: "Lab trends (HbA1c, eGFR), Vital trends (BP, SpO2), Patient volume", icon: "📈" },
  { zone: "Bar Chart", description: "Categorical or time-bucketed comparisons with stacked segments.", usedIn: "Revenue breakdown, Vital trends (bar variant), Condition distribution", icon: "📊" },
  { zone: "Comparison Table", description: "Side-by-side previous vs current with delta indicators and flags.", usedIn: "Lab comparison, Revenue comparison", icon: "⇔" },
  { zone: "Checkbox List", description: "Multi-select items with urgency or confidence tiers.", usedIn: "DDX (3-tier), Investigation bundle, Bulk actions", icon: "☑" },
  { zone: "Radio List", description: "Single-select options with recommended flags and reasoning.", usedIn: "Follow-up scheduling, Follow-up questions", icon: "◉" },
  { zone: "Bullet List", description: "Simple itemized content with optional copy-all action.", usedIn: "Advice bundle, Clinical guidelines, Text lists", icon: "•" },
  { zone: "Medication Display", description: "Drug name + dosage + timing + duration + safety notes.", usedIn: "Protocol meds, Rx preview, Med history, Voice structured Rx", icon: "💊" },
  { zone: "Patient List", description: "Name, age/gender, time, status badge, chief complaint rows.", usedIn: "Today's queue, Follow-up list, Due patients, Search results", icon: "👤" },
  { zone: "SBAR Sections", description: "4-part scaffold: Situation, Background, Assessment, Recommendation.", usedIn: "SBAR overview, SBAR critical", icon: "S" },
  { zone: "Donut / Pie Chart", description: "Proportional distribution visualization with labeled segments.", usedIn: "Demographics, Diagnosis breakdown, Data completeness", icon: "◔" },
  { zone: "Heatmap Grid", description: "Row x Column intensity grid for time-based patterns.", usedIn: "Peak hours, Weekly volume", icon: "▦" },
  { zone: "KPI Table", description: "Dashboard-style metric rows with this-period vs last-period and delta.", usedIn: "Weekly KPIs, Analytics table, Follow-up rate", icon: "▤" },
  { zone: "Clinical Narrative", description: "AI-generated paragraph summarizing the patient in natural language.", usedIn: "Patient summary (collapsed), Patient narrative card", icon: "¶" },
  { zone: "Translation Pair", description: "Source language left, target language right, with copy action.", usedIn: "Translation card (Hindi, Telugu, Tamil, Kannada, Marathi)", icon: "🌐" },
  { zone: "Drug Interaction", description: "Drug A vs Drug B with severity level, risk description, and recommended action.", usedIn: "Drug interaction card, Allergy conflict card", icon: "⚠" },
  { zone: "Vaccination Schedule", description: "Vaccine name + due date + status badge (completed/pending/overdue).", usedIn: "Vaccination schedule, Vaccination due list, ANC schedule", icon: "💉" },
  { zone: "Timeline", description: "Chronological vertical event list with type-coded markers.", usedIn: "Patient timeline (visits, labs, procedures, admissions)", icon: "⏱" },
]

// ── Component ────────────────────────────────────────────────

export default function IntentClassificationSection({ onNavigateTab }: { onNavigateTab?: (tab: string) => void } = {}) {
  const [expandedScenario, setExpandedScenario] = useState<number | null>(0)
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Patient Context & Summaries")

  return (
    <div className="space-y-10">

      {/* ── Page Header ── */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50/80 via-white to-blue-50/60 px-6 py-5">
        <h3 className="mb-1 text-[18px] font-bold text-slate-800">How Dr. Agent Decides What to Show</h3>
        <p className="max-w-2xl text-[12px] leading-[1.6] text-slate-500">
          Every response starts with a decision: should this be a{" "}
          <strong className="text-violet-700">structured UI card</strong> or a{" "}
          <strong className="text-blue-700">plain text response</strong>? This section explains the
          complete <strong className="text-slate-700">decision pipeline</strong>, from the moment the doctor types a question to the rendered output.
          It covers <strong className="text-slate-700">10 intent categories</strong>, the{" "}
          <strong className="text-slate-700">data availability check</strong> that drives format selection,
          and a complete <strong className="text-slate-700">intent-to-card reference chart</strong> mapping{" "}
          <strong className="text-violet-600">35+ query patterns</strong> to their card outputs.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1: TWO RESPONSE TYPES
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[16px] font-bold text-slate-800">Two Types of Responses</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {RESPONSE_TYPES.map((rt) => (
            <div key={rt.type} className="rounded-xl border p-5" style={{ borderColor: rt.borderColor, backgroundColor: rt.bgColor }}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[20px]">{rt.icon}</span>
                <h5 className="text-[14px] font-bold" style={{ color: rt.color }}>{rt.type}</h5>
              </div>
              <p className="mb-3 text-[12px] leading-relaxed text-slate-600">{rt.description}</p>

              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">When to use</p>
              <div className="mb-3 space-y-1">
                {rt.when.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: rt.color }} />
                    <span className="text-[11px] leading-relaxed text-slate-500">{w}</span>
                  </div>
                ))}
              </div>

              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Examples</p>
              <div className="space-y-1">
                {rt.examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md bg-white/60 px-2 py-1">
                    <span className="shrink-0 text-[10px] font-semibold text-slate-400">Q:</span>
                    <span className="text-[10px] text-slate-600">{ex.query}</span>
                    <span className="ml-auto shrink-0 text-[10px] font-medium" style={{ color: rt.color }}>{ex.card}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2: THE DECISION PIPELINE
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[16px] font-bold text-slate-800">The Decision Pipeline</h4>
        <p className="mb-4 text-[12px] text-slate-500">
          Every user input flows through these <strong className="text-slate-700">7 sequential steps</strong> before a response is rendered.
          The pipeline handles both <strong className="text-violet-600">canned pill taps</strong> (pre-mapped, skip classification) and{" "}
          <strong className="text-blue-600">free-text queries</strong> (full NLU classification).
        </p>

        {/* ── Visual Pipeline Flow Chart ── */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-5">
          <div className="flex items-center gap-1 min-w-[900px]">
            {DECISION_FLOW_STEPS.map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 105 }}>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[14px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.step}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">{s.label}</span>
                </div>
                {i < DECISION_FLOW_STEPS.length - 1 && (
                  <div className="flex flex-1 items-center justify-center" style={{ minWidth: 20 }}>
                    <div className="h-[2px] flex-1 bg-slate-200" />
                    <svg width="8" height="10" viewBox="0 0 8 10" className="shrink-0 text-slate-300">
                      <path d="M0 0 L8 5 L0 10Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          {/* ── Dual-path callout ── */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1">
              <span className="text-[10px]">▣</span>
              <span className="text-[10px] font-semibold text-violet-700">Data exists → UI Card</span>
            </div>
            <span className="text-[10px] text-slate-300">or</span>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1">
              <span className="text-[10px]">≡</span>
              <span className="text-[10px] font-semibold text-blue-700">No data / simple answer → Text</span>
            </div>
          </div>
        </div>

        {/* ── Detailed Steps ── */}
        <div className="space-y-2">
          {DECISION_FLOW_STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-white"
                style={{ backgroundColor: s.color }}
              >
                {s.step}
              </span>
              <div>
                <p className="text-[12px] font-semibold text-slate-800">{s.label}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500"
                  dangerouslySetInnerHTML={{
                    __html: s.description
                      .replace(/PILL_INTENT_MAP/g, '<strong class="font-mono text-violet-600 bg-violet-50 px-1 rounded">PILL_INTENT_MAP</strong>')
                      .replace(/(\d+\+?\s*(?:keyword rules|entries|card types|mappings))/g, '<strong class="text-slate-700">$1</strong>')
                      .replace(/(Card|Hybrid|Text)(\s*\()/g, '<strong class="text-slate-700">$1</strong>$2')
                      .replace(/(CardRenderer)/g, '<strong class="font-mono text-blue-600 bg-blue-50 px-1 rounded">$1</strong>')
                      .replace(/(63\+)/g, '<strong class="text-violet-600">$1</strong>')
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2.5: INPUT ROUTING DIAGRAM
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[16px] font-bold text-slate-800">Input Routing: Pills vs Free Text</h4>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Row 1: Input sources */}
              <div className="flex justify-center gap-16 mb-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-32 items-center justify-center rounded-xl bg-violet-100 border border-violet-200">
                    <span className="text-[12px] font-bold text-violet-700">Canned Pill Tap</span>
                  </div>
                  <span className="text-[9px] text-slate-400">160+ pre-mapped intents</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-32 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
                    <span className="text-[12px] font-bold text-blue-700">Free Text Input</span>
                  </div>
                  <span className="text-[9px] text-slate-400">Natural language queries</span>
                </div>
              </div>

              {/* Arrows down */}
              <div className="flex justify-center gap-16 mb-4">
                <div className="flex flex-col items-center" style={{ width: 128 }}>
                  <svg width="2" height="24" className="text-violet-300"><rect width="2" height="24" fill="currentColor" /></svg>
                  <svg width="10" height="8" viewBox="0 0 10 8" className="text-violet-300"><path d="M0 0 L5 8 L10 0Z" fill="currentColor" /></svg>
                </div>
                <div className="flex flex-col items-center" style={{ width: 128 }}>
                  <svg width="2" height="24" className="text-blue-300"><rect width="2" height="24" fill="currentColor" /></svg>
                  <svg width="10" height="8" viewBox="0 0 10 8" className="text-blue-300"><path d="M0 0 L5 8 L10 0Z" fill="currentColor" /></svg>
                </div>
              </div>

              {/* Row 2: Processing */}
              <div className="flex justify-center gap-16 mb-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-32 items-center justify-center rounded-xl bg-violet-500 text-white">
                    <span className="text-[11px] font-bold text-center leading-tight">PILL_INTENT_MAP<br />Direct Lookup</span>
                  </div>
                  <span className="text-[9px] text-slate-400">Skip NLU classification</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-32 items-center justify-center rounded-xl bg-blue-500 text-white">
                    <span className="text-[11px] font-bold text-center leading-tight">Intent Engine<br />96+ Keyword Rules</span>
                  </div>
                  <span className="text-[9px] text-slate-400">Normalize → Match → Classify</span>
                </div>
              </div>

              {/* Converge arrows */}
              <div className="flex justify-center mb-4">
                <div className="relative" style={{ width: 320 }}>
                  <svg width="320" height="32" viewBox="0 0 320 32" className="text-slate-300">
                    <path d="M80 0 L80 16 L160 24" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M240 0 L240 16 L160 24" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M160 24 L160 32" stroke="currentColor" strokeWidth="2" fill="none" />
                    <polygon points="155,32 165,32 160,38" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Row 3: Unified output */}
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-48 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <span className="text-[12px] font-bold">Intent + Data Check → Response</span>
                  </div>
                  <span className="text-[9px] text-slate-400">Build card or generate text based on available data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3: 10 INTENT CATEGORIES
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[16px] font-bold text-slate-800">10 Intent Categories</h4>
        <p className="mb-4 text-[12px] text-slate-500">
          The <strong className="text-slate-700">intent engine</strong> classifies every input into one of these categories.
          Each has a <strong className="text-violet-600">default response format</strong> (card, text, or hybrid),
          specific <strong className="text-slate-700">card outputs</strong>, and a defined{" "}
          <strong className="text-amber-600">fallback behavior</strong> when data is insufficient.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTENT_CATEGORIES.map((ic) => (
            <div key={ic.category} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ic.color }} />
                <span className="text-[13px] font-bold text-slate-800">{ic.label}</span>
                <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ backgroundColor: ic.color + "15", color: ic.color }}>
                  {ic.defaultFormat}
                </span>
              </div>
              <p className="mb-2 text-[11px] leading-relaxed text-slate-500">{ic.description}</p>
              <div className="mb-2 flex flex-wrap gap-1">
                {ic.triggerExamples.slice(0, 4).map((t) => (
                  <span key={t} className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-500">&quot;{t}&quot;</span>
                ))}
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400">
                <strong className="text-slate-500">Fallback:</strong> {ic.fallbackBehavior}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4: WALKTHROUGH EXAMPLE
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-2 text-[16px] font-bold text-slate-800">Walkthrough: How AI Thinks Through One Question</h4>
        <p className="mb-4 text-[12px] text-slate-500">
          For a single question, <strong className="text-violet-700">&quot;{HBAIC_WALKTHROUGH.query}&quot;</strong>, the
          AI considers <strong className="text-slate-700">3 different data scenarios</strong> and makes completely different decisions for each.
          This demonstrates the <strong className="text-slate-700">data-driven branching</strong> at the heart of every query.
        </p>

        <div className="space-y-3">
          {HBAIC_WALKTHROUGH.scenarios.map((scenario, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpandedScenario(expandedScenario === idx ? null : idx)}
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${scenario.outcome === "card" ? "bg-violet-500" : "bg-blue-500"}`}>
                    {scenario.outcome.toUpperCase()}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-800">{scenario.condition}</span>
                </div>
                <span className="text-[11px] text-slate-400">{expandedScenario === idx ? "▲" : "▼"}</span>
              </button>

              {expandedScenario === idx && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <p className="mb-3 text-[11px] text-slate-500">
                    Output: <strong className="text-slate-700">{scenario.cardType}</strong>
                  </p>
                  <div className="space-y-2">
                    {scenario.thinkingProcess.map((tp, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2">
                        <span className="mt-0.5 shrink-0 rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                          {tp.aspect}
                        </span>
                        <span className="text-[11px] leading-relaxed text-slate-600">{tp.decision}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5: INTENT-TO-CARD SYNTHETIC DATA CHART
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-2 text-[16px] font-bold text-slate-800">Intent-to-Card Reference Chart</h4>
        <p className="mb-4 text-[12px] text-slate-500">
          The complete mapping: <strong className="text-slate-700">user query</strong> →{" "}
          <strong className="text-blue-600">intent category</strong> →{" "}
          <strong className="text-violet-600">data check</strong> →{" "}
          <strong className="text-emerald-600">card output</strong> →{" "}
          <strong className="text-amber-600">content zone</strong> →{" "}
          <strong className="text-red-500">fallback behavior</strong>.
          This is the <strong className="text-slate-700">single source of truth</strong> for understanding what Dr. Agent will show for any given input.
        </p>

        <div className="space-y-4">
          {SYNTHETIC_DATA_CHART.map((group) => (
            <div key={group.category} className="overflow-hidden rounded-xl border border-slate-200">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 bg-slate-50"
                onClick={() => setExpandedCategory(expandedCategory === group.category ? null : group.category)}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />
                  <span className="text-[13px] font-bold text-slate-800">{group.category}</span>
                  <span className="text-[11px] text-slate-400">({group.entries.length} patterns)</span>
                </div>
                <span className="text-[11px] text-slate-400">{expandedCategory === group.category ? "▲" : "▼"}</span>
              </button>

              {expandedCategory === group.category && (
                <div className="border-t border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-3 py-2 font-semibold text-slate-500">Query</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Intent</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Data Check</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Card / Format</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Content Zone</th>
                          <th className="px-3 py-2 font-semibold text-slate-500">Fallback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {group.entries.map((entry, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-3 py-2 font-medium text-slate-700">&quot;{entry.query}&quot;</td>
                            <td className="px-3 py-2">
                              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ backgroundColor: group.color + "15", color: group.color }}>
                                {entry.intent}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500">{entry.dataCheck}</td>
                            <td className="px-3 py-2 font-medium text-slate-700">{entry.cardFormat}</td>
                            <td className="px-3 py-2 text-slate-500">{entry.contentZone}</td>
                            <td className="px-3 py-2 text-[10px] text-slate-400">{entry.fallback}</td>
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

      {/* ══════════════════════════════════════════════════════════
          SECTION 6: CONTENT ZONE TYPES
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h4 className="mb-4 text-[16px] font-bold text-slate-800">Content Zone Types</h4>
        <p className="mb-4 text-[12px] text-slate-500">
          When a card is selected, its body is assembled from one of these <strong className="text-violet-700">18 content zone types</strong>.
          The choice depends on the <strong className="text-slate-700">data shape</strong> (time-series → chart, key-value → data rows, options → lists)
          and what <strong className="text-slate-700">format best serves the doctor&apos;s workflow</strong>.
          These same zone types are used in{" "}
          <strong className="text-blue-600">Card Anatomy & Patterns</strong> as content primitives.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_ZONE_TYPES.map((cz) => (
            <div key={cz.zone} className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[14px]">{cz.icon}</span>
                <span className="text-[11px] font-bold text-slate-800">{cz.zone}</span>
              </div>
              <p className="mb-1 text-[10px] leading-relaxed text-slate-500">{cz.description}</p>
              <p className="text-[9px] text-slate-400">Used in: {cz.usedIn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer: Story continues ── */}
      <section className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50/80 via-white to-blue-50/60 px-5 py-5">
        <p className="mb-2 text-[13px] font-bold text-violet-700">Next: How are these cards built? →</p>
        <p className="mb-4 text-[12px] leading-relaxed text-slate-500">
          You now understand <strong className="text-slate-700">how Dr. Agent classifies intent</strong>,{" "}
          <strong className="text-slate-700">checks data availability</strong>, and{" "}
          <strong className="text-slate-700">picks a response format</strong>.
          The next step is understanding <strong className="text-violet-600">card anatomy</strong>: the 5-zone structure
          (header, content, insight, pills, footer) that every UI card follows, and the{" "}
          <strong className="text-violet-600">18 content zone types</strong> that power the content layer.
        </p>
        <div className="flex flex-wrap gap-2">
          {onNavigateTab ? (
            <>
              <button
                onClick={() => onNavigateTab("card-anatomy")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
              >
                Card Anatomy & Patterns
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button
                onClick={() => onNavigateTab("card-catalog")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Card Catalog (63+ types)
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button
                onClick={() => onNavigateTab("response-management")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Response Management
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </>
          ) : (
            <p className="text-[11px] text-slate-400">
              See the <strong className="text-slate-600">Card Anatomy & Patterns</strong> tab for the 5-zone card structure,
              the <strong className="text-slate-600">Card Catalog</strong> for all 63+ card types with 120+ variants,
              and <strong className="text-slate-600">Response Management</strong> for the full pipeline and copy rules.
            </p>
          )}
        </div>
      </section>

    </div>
  )
}

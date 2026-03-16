"use client"

import React, { useState, useMemo } from "react"

// ═══════════════════════════════════════════════════════════════
// DATA CONSTANTS — All data defined here, rendered below
// ═══════════════════════════════════════════════════════════════

const NAV_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "pipeline-flow", label: "Pipeline Flow" },
  { id: "intent-categories", label: "Intent Categories" },
  { id: "keyword-rules", label: "Keyword Rules" },
  { id: "output-decision", label: "Output Decision" },
  { id: "pill-intent-bypass", label: "Pill Bypass" },
  { id: "pill-priority", label: "Pill Pipeline" },
  { id: "phase-engine", label: "Phase Engine" },
  { id: "card-routing", label: "Card Routing" },
  { id: "sidebar-tabs", label: "Sidebar Tabs" },
  { id: "homepage-vs-patient", label: "Homepage vs Patient" },
  { id: "context-signals", label: "Context Signals" },
  { id: "e2e-examples", label: "E2E Examples" },
  { id: "canned-messages", label: "Canned Messages" },
  { id: "acceptance-criteria", label: "Acceptance Criteria" },
]

// ── 1. Intent Categories ──
const INTENT_CATEGORIES: {
  id: string; label: string; color: string; bg: string; border: string
  description: string; typicalOutput: string; confidenceRule: string
  examples: string[]
}[] = [
  {
    id: "data_retrieval", label: "data_retrieval", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200",
    description: "Fetch patient data: summaries, labs, vitals, history, specialty records. Read-only retrieval of existing clinical information.",
    typicalOutput: "patient_summary, lab_panel, last_visit, med_history, specialty summaries (obstetric, gynec, pediatric, ophthal), patient_timeline",
    confidenceRule: "0.85 on keyword match. Specialty keywords (gynec, ophthal, obstetric, pediatric) also route here.",
    examples: ["Show patient summary", "What are the latest labs?", "Gynec history", "Last visit details", "Vitals overview"],
  },
  {
    id: "clinical_decision", label: "clinical_decision", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200",
    description: "Decision support: differential diagnosis, protocol medications, investigation bundles, clinical guidelines. Drives actionable clinical cards.",
    typicalOutput: "ddx, protocol_meds, investigation_bundle, clinical_guideline",
    confidenceRule: "0.85 on keyword match. Checked after data_retrieval to avoid false positives on 'test' or 'order'.",
    examples: ["Suggest DDX", "Protocol meds for hypertension", "What investigations should I order?", "Suggest lab tests"],
  },
  {
    id: "action", label: "action", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
    description: "Perform an action: copy to RxPad, translate advice, schedule follow-up, draft patient advice. Produces actionable output.",
    typicalOutput: "translation, follow_up, advice_bundle, rx_preview, voice_structured_rx",
    confidenceRule: "0.85 on keyword match. 'follow-up' matches here (not operational) unless preceded by 'dues' or 'overdue'.",
    examples: ["Translate advice to Hindi", "Plan follow-up", "Draft advice", "Copy to RxPad"],
  },
  {
    id: "comparison", label: "comparison", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
    description: "Compare data over time: lab trends, vital trends, visit deltas. Produces visual trend/comparison cards.",
    typicalOutput: "lab_comparison, vitals_trend_bar, vitals_trend_line, lab_trend",
    confidenceRule: "0.85 on keyword match. Keywords: compare, trend, change, previous, difference, delta, graph, chart.",
    examples: ["Compare labs with previous", "HbA1c trend", "Show BP graph", "Vital trends"],
  },
  {
    id: "document_analysis", label: "document_analysis", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200",
    description: "Process uploaded documents using OCR. Extracts structured data from pathology reports, discharge summaries, prescriptions.",
    typicalOutput: "ocr_pathology, ocr_extraction",
    confidenceRule: "0.85 on keyword match. Keywords: upload, document, ocr, scan, report upload, attach.",
    examples: ["Analyze uploaded report", "OCR this document", "Extract from scan"],
  },
  {
    id: "clinical_question", label: "clinical_question", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200",
    description: "Medical knowledge questions. Returns text responses for factual queries, drug interactions for specific checks.",
    typicalOutput: "text_fact, drug_interaction, text_quote, text_alert, text_step",
    confidenceRule: "0.85 on keyword match. Format defaults to 'text' for general questions, 'card' for drug interaction checks.",
    examples: ["What is normal HbA1c?", "Check drug interactions", "Explain mechanism of action", "Side effects of metformin"],
  },
  {
    id: "operational", label: "operational", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200",
    description: "Clinic operations: queue, revenue, KPIs, follow-up lists, demographics, billing, vaccination schedules. Homepage-centric.",
    typicalOutput: "welcome_card, patient_list, follow_up_list, revenue_bar, analytics_table, donut_chart, heatmap, billing_summary, condition_bar, line_graph",
    confidenceRule: "0.85 on keyword match. Checked FIRST in rule priority because multi-word phrases like 'follow-ups due' must win over single-word 'follow-up'.",
    examples: ["Today's schedule", "Follow-ups due this week", "Revenue today", "Weekly KPIs", "Busiest hours"],
  },
  {
    id: "ambiguous", label: "ambiguous", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200",
    description: "Cannot determine intent. Falls back to free-text response. Also used for open-ended prompts like 'Ask me anything'.",
    typicalOutput: "text response (no card)",
    confidenceRule: "0.3 confidence. This is the fallback when no keyword rule matches.",
    examples: ["Ask me anything", "Hello", "Thanks", "Can you help?"],
  },
  {
    id: "follow_up", label: "follow_up", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200",
    description: "Clarification questions from the agent when it needs more information to provide a precise answer.",
    typicalOutput: "follow_up_question",
    confidenceRule: "0.85 on keyword match. Keywords: which, select, choose, pick one.",
    examples: ["Which diagnosis do you want?", "Select one option", "Pick one"],
  },
]

// ── 2. Keyword Rules (from intent-engine.ts RULES array) ──
const KEYWORD_RULES: { priority: number; category: string; keywords: string[]; format: string }[] = [
  // Operational (checked first)
  { priority: 1, category: "operational", keywords: ["today's schedule", "appointments today", "who's next", "queue status", "queue list"], format: "card" },
  { priority: 2, category: "operational", keywords: ["follow-ups due", "overdue follow", "callback", "follow up due"], format: "card" },
  { priority: 3, category: "operational", keywords: ["revenue", "billing", "collection", "payment", "income", "earnings"], format: "card" },
  { priority: 4, category: "operational", keywords: ["send sms", "send reminder", "remind all", "bulk sms", "notify"], format: "card" },
  { priority: 5, category: "operational", keywords: ["demographics", "age group", "gender split", "patient composition"], format: "card" },
  { priority: 6, category: "operational", keywords: ["diagnosis distribution", "diagnosis breakdown", "top diagnos", "common conditions"], format: "card" },
  { priority: 7, category: "operational", keywords: ["patient volume", "footfall", "monthly patients"], format: "card" },
  { priority: 8, category: "operational", keywords: ["kpi", "performance", "weekly summary", "analytics", "dashboard"], format: "card" },
  { priority: 9, category: "operational", keywords: ["chronic", "diabetic", "hypertensive", "condition breakdown"], format: "card" },
  { priority: 10, category: "operational", keywords: ["busiest", "slot utilization", "peak hours", "appointment density"], format: "card" },
  { priority: 11, category: "operational", keywords: ["how many patients", "patient count", "total patients"], format: "card" },
  { priority: 12, category: "operational", keywords: ["cancellation rate", "no show", "no-show"], format: "card" },
  { priority: 13, category: "operational", keywords: ["referral summary", "specialist referral"], format: "card" },
  { priority: 14, category: "operational", keywords: ["vaccination due", "vaccine overdue", "immunization due"], format: "card" },
  { priority: 15, category: "operational", keywords: ["anc schedule", "anc due", "antenatal", "obstetric schedule"], format: "card" },
  { priority: 16, category: "operational", keywords: ["billing overview", "bill summary", "billing summary"], format: "card" },
  { priority: 17, category: "operational", keywords: ["patient trend", "footfall trend", "daily patient count"], format: "card" },
  { priority: 18, category: "operational", keywords: ["completeness", "checklist", "missing", "empty section"], format: "card" },
  // Data Retrieval
  { priority: 19, category: "data_retrieval", keywords: ["patient timeline", "visit timeline", "clinical timeline"], format: "card" },
  { priority: 20, category: "data_retrieval", keywords: ["summary", "snapshot", "patient", "overview", "history", "last visit"], format: "card" },
  { priority: 21, category: "data_retrieval", keywords: ["gynec", "gynae", "ophthal", "eye", "vision", "obstetric", "pediatric", "growth", "vaccine"], format: "card" },
  { priority: 22, category: "data_retrieval", keywords: ["vitals", "bp", "spo2", "pulse", "temperature", "weight"], format: "card" },
  { priority: 23, category: "data_retrieval", keywords: ["lab", "report", "hba1c", "glucose", "creatinine", "cbc", "lipid"], format: "card" },
  { priority: 24, category: "data_retrieval", keywords: ["medication", "meds", "drug", "rx", "prescription"], format: "card" },
  // Clinical Decision
  { priority: 25, category: "clinical_decision", keywords: ["ddx", "differential", "diagnosis", "diagnose", "suggest dx"], format: "card" },
  { priority: 26, category: "clinical_decision", keywords: ["protocol", "suggest med", "recommend", "guideline"], format: "card" },
  { priority: 27, category: "clinical_decision", keywords: ["investigation", "test", "order", "screening", "workup"], format: "card" },
  // Action
  { priority: 28, category: "action", keywords: ["copy", "add", "fill", "draft"], format: "card" },
  { priority: 29, category: "action", keywords: ["translate", "hindi", "telugu", "kannada", "tamil", "marathi"], format: "card" },
  { priority: 30, category: "action", keywords: ["follow-up", "follow up", "f/u", "next visit", "schedule"], format: "card" },
  // Comparison
  { priority: 31, category: "comparison", keywords: ["compare", "trend", "change", "previous", "difference", "delta"], format: "card" },
  { priority: 32, category: "comparison", keywords: ["graph", "chart", "line", "bar", "plot"], format: "card" },
  // Document Analysis
  { priority: 33, category: "document_analysis", keywords: ["upload", "document", "ocr", "scan", "report upload", "attach"], format: "card" },
  // Clinical Question
  { priority: 34, category: "clinical_question", keywords: ["what is", "how to", "why", "explain", "cause", "mechanism"], format: "text" },
  { priority: 35, category: "clinical_question", keywords: ["check interaction", "drug interaction"], format: "card" },
  { priority: 36, category: "clinical_question", keywords: ["dose", "dosage", "interaction", "contraindication", "side effect"], format: "card" },
  // Follow-up
  { priority: 37, category: "follow_up", keywords: ["which", "select", "choose", "pick one"], format: "card" },
]

// ── 3. Pill-to-Intent Map (from PILL_INTENT_MAP) ──
const PILL_INTENT_ENTRIES: { label: string; intent: string }[] = [
  // Data Retrieval
  { label: "Summary", intent: "data_retrieval" },
  { label: "Patient summary", intent: "data_retrieval" },
  { label: "Patient snapshot", intent: "data_retrieval" },
  { label: "Gynec summary", intent: "data_retrieval" },
  { label: "Ophthal summary", intent: "data_retrieval" },
  { label: "Obstetric summary", intent: "data_retrieval" },
  { label: "Pediatric summary", intent: "data_retrieval" },
  { label: "Vision summary", intent: "data_retrieval" },
  { label: "Growth summary", intent: "data_retrieval" },
  { label: "OB summary", intent: "data_retrieval" },
  { label: "Pre-consult prep", intent: "data_retrieval" },
  { label: "Last visit", intent: "data_retrieval" },
  { label: "Last visit details", intent: "data_retrieval" },
  { label: "Review SpO\u2082", intent: "data_retrieval" },
  { label: "Allergy Alert", intent: "data_retrieval" },
  { label: "Other drug classes", intent: "data_retrieval" },
  { label: "Annual panel", intent: "data_retrieval" },
  { label: "Med history search", intent: "data_retrieval" },
  { label: "Chronic timeline", intent: "data_retrieval" },
  { label: "Review intake data", intent: "data_retrieval" },
  { label: "Lab overview", intent: "data_retrieval" },
  { label: "Growth & vaccines", intent: "data_retrieval" },
  { label: "Growth check", intent: "data_retrieval" },
  { label: "Vision check", intent: "data_retrieval" },
  { label: "Patient timeline", intent: "data_retrieval" },
  // Comparison
  { label: "Lab trends", intent: "comparison" },
  { label: "Compare with last visit", intent: "comparison" },
  { label: "Vital trends", intent: "comparison" },
  { label: "Compare visits", intent: "comparison" },
  { label: "Graph view", intent: "comparison" },
  { label: "Line graph", intent: "comparison" },
  { label: "Bar view", intent: "comparison" },
  { label: "All 11 params", intent: "comparison" },
  { label: "Lab comparison", intent: "comparison" },
  { label: "Compare prev", intent: "comparison" },
  { label: "HbA1c trend", intent: "comparison" },
  { label: "Compare with previous", intent: "comparison" },
  { label: "Compare with another date", intent: "comparison" },
  { label: "Compare with last week", intent: "comparison" },
  { label: "Monthly trend", intent: "comparison" },
  { label: "Compare months", intent: "comparison" },
  // Clinical Decision
  { label: "Suggest DDX", intent: "clinical_decision" },
  { label: "Protocol meds", intent: "clinical_decision" },
  { label: "Investigations", intent: "clinical_decision" },
  { label: "Suggest lab tests", intent: "clinical_decision" },
  { label: "Suggest inv", intent: "clinical_decision" },
  { label: "Initial investigations", intent: "clinical_decision" },
  { label: "Initial workup", intent: "clinical_decision" },
  // Action
  { label: "Advice", intent: "action" },
  { label: "F/U", intent: "action" },
  { label: "Translate", intent: "action" },
  { label: "Follow-up", intent: "action" },
  { label: "Translate advice", intent: "action" },
  { label: "Hindi", intent: "action" },
  { label: "Tamil", intent: "action" },
  { label: "Telugu", intent: "action" },
  // Clinical Question
  { label: "Check interactions", intent: "clinical_question" },
  // Document Analysis
  { label: "OCR analysis", intent: "document_analysis" },
  { label: "Report extract", intent: "document_analysis" },
  { label: "Upload document", intent: "document_analysis" },
  // Operational
  { label: "Completeness check", intent: "operational" },
  { label: "Today's schedule", intent: "operational" },
  { label: "Follow-ups due", intent: "operational" },
  { label: "Revenue today", intent: "operational" },
  { label: "Revenue this week", intent: "operational" },
  { label: "This week's billing", intent: "operational" },
  { label: "This week's deposits", intent: "operational" },
  { label: "Weekly KPIs", intent: "operational" },
  { label: "Patient demographics", intent: "operational" },
  { label: "Diagnosis breakdown", intent: "operational" },
  { label: "Busiest hours", intent: "operational" },
  { label: "Chronic conditions", intent: "operational" },
  { label: "Cancellation rate", intent: "operational" },
  { label: "Pending drafts", intent: "operational" },
  { label: "Discharge status", intent: "operational" },
  { label: "Show cancelled patients", intent: "operational" },
  { label: "Send reminder to all", intent: "operational" },
  { label: "Follow-up analytics", intent: "operational" },
  { label: "Gender split", intent: "operational" },
  { label: "Condition breakdown", intent: "operational" },
  { label: "Show all fever patients", intent: "operational" },
  { label: "Show all DM patients", intent: "operational" },
  { label: "HbA1c distribution", intent: "operational" },
  { label: "Show patients", intent: "operational" },
  { label: "Payment reminders", intent: "operational" },
  { label: "Overdue follow-ups", intent: "operational" },
  { label: "Today's collection", intent: "operational" },
  { label: "Today's billing", intent: "operational" },
  { label: "Today's deposits", intent: "operational" },
  { label: "Past 30 days collection", intent: "operational" },
  { label: "Generate invoice", intent: "operational" },
  { label: "Low stock alerts", intent: "operational" },
  { label: "Pending prescriptions", intent: "operational" },
  { label: "Dispense history", intent: "operational" },
  { label: "Expiring medicines", intent: "operational" },
  { label: "Draft campaign", intent: "operational" },
  { label: "Delivery stats", intent: "operational" },
  { label: "Template library", intent: "operational" },
  { label: "Scheduled messages", intent: "operational" },
  { label: "Referral summary", intent: "operational" },
  { label: "Vaccination schedule", intent: "operational" },
  { label: "Billing overview", intent: "operational" },
  { label: "Patient trends", intent: "operational" },
  { label: "Peak hours", intent: "operational" },
  { label: "Vaccination due list", intent: "operational" },
  { label: "ANC schedule", intent: "operational" },
  { label: "Abnormal labs", intent: "operational" },
  // Ambiguous
  { label: "Ask anything", intent: "ambiguous" },
  { label: "Ask me anything", intent: "ambiguous" },
]

// ── 4. Output Decision Rules ──
const OUTPUT_RULES: { condition: string; output: "Text" | "Card"; reason: string }[] = [
  { condition: "Short factual medical question (what is, how to, why)", output: "Text", reason: "Concise answer is fastest to consume" },
  { condition: "Ambiguous or unclassifiable input", output: "Text", reason: "Start concise, escalate to card only on drill-down" },
  { condition: "Structured clinical data (labs, vitals, summaries)", output: "Card", reason: "Visual hierarchy and badges improve scan speed" },
  { condition: "Decision support (DDX, meds, investigations)", output: "Card", reason: "Needs confidence tiers, checkboxes, and copy-to-RxPad" },
  { condition: "Comparisons and trends", output: "Card", reason: "Tabular and chart visuals outperform text lists" },
  { condition: "Operational dashboards (revenue, KPIs, queue)", output: "Card", reason: "Counts + charts + CTAs are clearer than prose" },
  { condition: "Translation output", output: "Card", reason: "Side-by-side source/target with copy button" },
  { condition: "Document analysis (OCR)", output: "Card", reason: "Structured extraction with per-section copy" },
  { condition: "Vitals or dosage queries", output: "Card", reason: "Card with agent description text for context" },
  { condition: "Copy/fill/draft actions", output: "Card", reason: "Card with agent description text + actionable payload" },
  { condition: "Drug interaction check", output: "Card", reason: "Severity badge + structured risk/action" },
]

// ── 5. Consultation Phases ──
const PHASES: { id: string; label: string; description: string; keywords: string[]; pillsNewPatient: string[]; pillsExistingPatient: string[]; transitions: string }[] = [
  {
    id: "empty", label: "Getting started", description: "Initial state when consultation opens. No user interaction yet.",
    keywords: [], pillsNewPatient: ["Review intake data", "Suggest DDX", "Initial investigations", "Ask me anything"],
    pillsExistingPatient: ["Patient summary", "Vital trends", "Lab overview", "Last visit details"],
    transitions: "Any text input moves to symptoms_entered. Phase never returns to empty once left.",
  },
  {
    id: "symptoms_entered", label: "Symptoms captured", description: "Doctor has entered or reviewed symptoms. System detected symptom-related keywords or user typed any text from empty.",
    keywords: ["symptom", "fever", "cough", "pain", "complaint", "sx"],
    pillsNewPatient: ["Suggest DDX", "Suggest investigations"], pillsExistingPatient: ["Suggest DDX", "Compare with last visit", "Vital trends"],
    transitions: "Moves to dx_accepted when DDX card is shown and user responds, or when dx/diagnosis keywords detected.",
  },
  {
    id: "dx_accepted", label: "Diagnosis accepted", description: "Doctor has accepted a diagnosis. DDX card was shown and interacted with, or diagnosis keywords detected.",
    keywords: ["accept", "dx", "diagnosis", "differential", "ddx", "protocol"],
    pillsNewPatient: ["Suggest medications", "Suggest investigations", "Draft advice", "Plan follow-up"],
    pillsExistingPatient: ["Suggest medications", "Suggest investigations", "Draft advice", "Plan follow-up"],
    transitions: "Moves to meds_written when protocol_meds card shown, or med/drug/rx keywords detected.",
  },
  {
    id: "meds_written", label: "Medications written", description: "Doctor has written medications. Protocol meds card was shown and user progressed, or medication keywords detected.",
    keywords: ["med", "drug", "prescription", "rx", "advice", "translate"],
    pillsNewPatient: ["Translate to regional", "Plan follow-up"], pillsExistingPatient: ["Translate to regional", "Plan follow-up"],
    transitions: "Moves to near_complete when completeness/final/follow-up keywords detected.",
  },
  {
    id: "near_complete", label: "Nearly complete", description: "Most RxPad sections are filled. Doctor is wrapping up the consultation.",
    keywords: ["completeness", "final", "follow-up", "follow up", "f/u", "done"],
    pillsNewPatient: ["Completeness check", "Translate advice", "Visit summary"],
    pillsExistingPatient: ["Completeness check", "Translate advice", "Visit summary"],
    transitions: "Terminal state for the consultation. Phase never goes backwards.",
  },
]

// ── 6. Card Families ──
const CARD_FAMILIES: { family: string; count: number; color: string; cards: { kind: string; description: string }[] }[] = [
  {
    family: "Summary", count: 7, color: "bg-blue-500",
    cards: [
      { kind: "patient_summary", description: "Full patient overview with vitals, labs, history, trends" },
      { kind: "symptom_collector", description: "Patient-reported symptoms from intake form" },
      { kind: "last_visit", description: "Previous visit summary with copy-to-rx" },
      { kind: "obstetric_summary", description: "Obstetric data (GP, EDD, ANC, vaccines)" },
      { kind: "gynec_summary", description: "Gynecological history" },
      { kind: "pediatric_summary", description: "Growth, milestones, vaccines" },
      { kind: "ophthal_summary", description: "Visual acuity, IOP, fundus" },
    ],
  },
  {
    family: "Data", count: 8, color: "bg-teal-500",
    cards: [
      { kind: "lab_panel", description: "Flagged lab results in grid table" },
      { kind: "vitals_trend_bar", description: "Vitals over time as bar chart" },
      { kind: "vitals_trend_line", description: "Vitals over time as line chart" },
      { kind: "lab_trend", description: "Single lab parameter trend" },
      { kind: "lab_comparison", description: "Previous vs current lab values with deltas" },
      { kind: "med_history", description: "Medication history timeline" },
      { kind: "vaccination_schedule", description: "Vaccine schedule with status badges" },
      { kind: "patient_timeline", description: "Chronological event timeline" },
    ],
  },
  {
    family: "Action", count: 7, color: "bg-violet-500",
    cards: [
      { kind: "ddx", description: "Checkbox selection for differential diagnoses" },
      { kind: "protocol_meds", description: "Review + Copy medications to RxPad" },
      { kind: "investigation_bundle", description: "Checkbox selection for investigations" },
      { kind: "follow_up", description: "Radio selection for follow-up timing" },
      { kind: "advice_bundle", description: "Copy advice and share with patient" },
      { kind: "voice_structured_rx", description: "Section-by-section copy from voice dictation" },
      { kind: "rx_preview", description: "Final prescription summary" },
    ],
  },
  {
    family: "Analysis", count: 2, color: "bg-pink-500",
    cards: [
      { kind: "ocr_pathology", description: "Structured lab report with parameters" },
      { kind: "ocr_extraction", description: "Multi-section document extraction" },
    ],
  },
  {
    family: "Utility", count: 5, color: "bg-emerald-500",
    cards: [
      { kind: "translation", description: "Source to target language translation" },
      { kind: "completeness", description: "RxPad section fill status" },
      { kind: "follow_up_question", description: "Agent asks doctor for clarification" },
      { kind: "clinical_guideline", description: "Evidence-based recommendations" },
      { kind: "referral", description: "Specialist referral with urgency" },
    ],
  },
  {
    family: "Safety", count: 2, color: "bg-red-500",
    cards: [
      { kind: "drug_interaction", description: "Drug-drug interaction alert" },
      { kind: "allergy_conflict", description: "Drug-allergy conflict alert" },
    ],
  },
  {
    family: "Text", count: 6, color: "bg-slate-500",
    cards: [
      { kind: "text_fact", description: "Single fact with source citation" },
      { kind: "text_alert", description: "Severity-colored alert bar" },
      { kind: "text_list", description: "Bulleted list of items" },
      { kind: "text_step", description: "Numbered step-by-step instructions" },
      { kind: "text_quote", description: "Clinical reference quotation" },
      { kind: "text_comparison", description: "Two-column side-by-side comparison" },
    ],
  },
  {
    family: "Homepage", count: 14, color: "bg-orange-500",
    cards: [
      { kind: "welcome_card", description: "Daily greeting with stats and tips" },
      { kind: "patient_list", description: "Queue or filtered patient list" },
      { kind: "follow_up_list", description: "Upcoming follow-ups with overdue flags" },
      { kind: "revenue_bar", description: "Daily revenue bar chart" },
      { kind: "revenue_comparison", description: "Compare revenue across dates" },
      { kind: "bulk_action", description: "Batch SMS/reminder interface" },
      { kind: "donut_chart", description: "Patient distribution donut" },
      { kind: "pie_chart", description: "Consultation type breakdown" },
      { kind: "line_graph", description: "Daily patient count trend" },
      { kind: "analytics_table", description: "KPI dashboard with week-over-week" },
      { kind: "condition_bar", description: "Top conditions horizontal bars" },
      { kind: "heatmap", description: "Appointment density heatmap" },
      { kind: "billing_summary", description: "Session billing with payment status" },
      { kind: "vaccination_due_list", description: "Vaccination due/overdue list" },
    ],
  },
]

// ── 7. Sidebar Tab Pills ──
const SIDEBAR_TABS: { tab: string; pills: string[] }[] = [
  { tab: "pastVisits", pills: ["Last visit details", "Compare with last visit", "Patient summary", "Protocol meds"] },
  { tab: "vitals", pills: ["Vital trends", "Review SpO\u2082", "BP needs attention", "Compare with last visit"] },
  { tab: "history", pills: ["Patient summary", "Allergy Alert", "Check interactions", "Suggest DDX"] },
  { tab: "labResults", pills: ["Labs flagged", "HbA1c trend", "Lab comparison", "Suggest investigations"] },
  { tab: "medicalRecords", pills: ["Patient summary", "Labs flagged", "Last visit details", "Upload document"] },
  { tab: "obstetric", pills: ["Obstetric summary", "Vital trends", "Suggest investigations", "Plan follow-up"] },
  { tab: "gynec", pills: ["Gynec summary", "Labs flagged", "Suggest investigations", "Plan follow-up"] },
  { tab: "vaccine", pills: ["Growth & vaccines", "Patient summary", "Plan follow-up", "Generate advice"] },
  { tab: "growth", pills: ["Growth & vaccines", "Vital trends", "Generate advice", "Plan follow-up"] },
  { tab: "ophthal", pills: ["Vision summary", "Vital trends", "Suggest investigations", "Plan follow-up"] },
  { tab: "personalNotes", pills: ["Patient summary", "Completeness check", "Generate advice", "Translate advice"] },
]

// ── 8. Context Signals ──
const CONTEXT_SIGNALS: { signal: string; source: string; influence: string }[] = [
  { signal: "Patient demographics", source: "RxContextOption", influence: "Age/gender-appropriate guidelines and dosing" },
  { signal: "Active specialty", source: "SpecialtyTabId", influence: "Show relevant specialty data (gynec, pediatric, etc.)" },
  { signal: "Today's vitals", source: "SmartSummaryData.todayVitals", influence: "Highlight abnormals, include in DDX reasoning, trigger safety pills" },
  { signal: "Lab flags", source: "SmartSummaryData.keyLabs", influence: "Drive lab-related cards, flag counts, layer 2 pills" },
  { signal: "Active medications", source: "SmartSummaryData.activeMeds", influence: "Drug interaction checks, protocol conflict detection" },
  { signal: "Consultation phase", source: "ConsultPhase", influence: "Determines which card types and pills are relevant" },
  { signal: "Last visit data", source: "SmartSummaryData.lastVisit", influence: "Enables comparison cards, 'Last visit' pill availability" },
  { signal: "Symptom collector", source: "SmartSummaryData.symptomCollectorData", influence: "Drives DDX, investigation suggestions, intake review" },
  { signal: "Allergies", source: "SmartSummaryData.allergies", influence: "Safety alerts, drug alternatives, Layer 1 force pills" },
  { signal: "Chronic conditions", source: "SmartSummaryData.chronicConditions", influence: "Narrative context, guideline selection, condition-aware advice" },
  { signal: "RxPad state", source: "Sections filled/empty", influence: "Completeness checks, next-step suggestions" },
  { signal: "Active sidebar tab", source: "RxTabLens", influence: "Layer 4 tab-lens pills, reply routing adjustments" },
  { signal: "Follow-up overdue days", source: "SmartSummaryData.followUpOverdueDays", influence: "Layer 2 clinical flag pill, follow-up reminders" },
  { signal: "Obstetric/Gynec/Pediatric/Ophthal data", source: "SmartSummaryData.*Data", influence: "Specialty-aware Layer 2 pills, specialty card routing" },
]

// ── 9. E2E Flow Examples ──
const E2E_EXAMPLES: {
  title: string; context: string
  steps: { stage: string; detail: string }[]
}[] = [
  {
    title: "Homepage operational query",
    context: "Doctor is on homepage, queue tab active, no patient selected",
    steps: [
      { stage: "User prompt", detail: "\"How many follow-ups are due this week?\"" },
      { stage: "Normalization", detail: "Lowercased: \"how many follow-ups are due this week?\"" },
      { stage: "Intent classification", detail: "Keyword match: 'follow-ups due' matches operational rule (priority 2). Result: { category: 'operational', format: 'card', confidence: 0.85 }" },
      { stage: "Output format decision", detail: "Format = card. Operational queries always produce cards for dashboard-style presentation." },
      { stage: "Card selection", detail: "Reply engine matches 'follow-up dues this week' and produces follow_up_list card with overdueCount and items." },
      { stage: "Rendered output", detail: "FollowUpListCard showing list of patients with scheduled follow-ups, overdue flags, and 'Send reminder' CTA." },
    ],
  },
  {
    title: "Clinical question (text response)",
    context: "Doctor is inside patient consultation, dx_accepted phase",
    steps: [
      { stage: "User prompt", detail: "\"What is the normal HbA1c range?\"" },
      { stage: "Normalization", detail: "Lowercased: \"what is the normal hba1c range?\"" },
      { stage: "Intent classification", detail: "Keyword match: 'what is' matches clinical_question rule (priority 34). Result: { category: 'clinical_question', format: 'text', confidence: 0.85 }" },
      { stage: "Output format decision", detail: "Format = text. Short factual answer is fastest to consume, no card needed." },
      { stage: "Card selection", detail: "Reply engine generates text_fact with value, context ('Diabetes Management'), and source ('ADA Guidelines')." },
      { stage: "Rendered output", detail: "Inline text box: 'Normal HbA1c is <5.7%. Pre-diabetes: 5.7-6.4%. Diabetes: >=6.5%.' with source citation." },
    ],
  },
  {
    title: "DDX request with symptoms",
    context: "Patient Shyam GR, symptoms: headache + dizziness, BP 152/96, phase: symptoms_entered",
    steps: [
      { stage: "User prompt", detail: "\"Suggest DDX\" (pill tap)" },
      { stage: "Normalization", detail: "Pill bypass: 'Suggest DDX' found in PILL_INTENT_MAP. No keyword matching needed." },
      { stage: "Intent classification", detail: "Direct lookup: PILL_INTENT_MAP['Suggest DDX'] = 'clinical_decision'. Result: { category: 'clinical_decision', format: 'card', confidence: 1.0 }" },
      { stage: "Output format decision", detail: "Format = card. DDX needs confidence tiers (can't miss / most likely / consider) and checkbox selection." },
      { stage: "Card selection", detail: "Reply engine builds DDX from symptoms + chronic conditions + allergies context. Options ranked by bucket." },
      { stage: "Rendered output", detail: "DDXCard with 3 tiers: Can't Miss (Hypertensive Urgency), Most Likely (Essential HTN, Tension Headache), Consider (Secondary HTN). Checkboxes to accept." },
    ],
  },
  {
    title: "Lab comparison after pill click",
    context: "Patient with labs available, vitals tab active, phase: dx_accepted",
    steps: [
      { stage: "User prompt", detail: "\"Lab comparison\" (pill tap)" },
      { stage: "Normalization", detail: "Pill bypass: 'Lab comparison' found in PILL_INTENT_MAP. Maps to 'comparison'." },
      { stage: "Intent classification", detail: "Direct lookup: PILL_INTENT_MAP['Lab comparison'] = 'comparison'. Result: { category: 'comparison', format: 'card', confidence: 1.0 }" },
      { stage: "Output format decision", detail: "Format = card. Comparison data needs tabular layout with delta indicators." },
      { stage: "Card selection", detail: "Reply engine builds lab_comparison from keyLabs. Each row: parameter, prev value, curr value, delta, direction arrow, flag." },
      { stage: "Rendered output", detail: "LabComparisonCard with rows showing HbA1c 8.1 vs 8.8 (+0.7), Creatinine 1.1 vs 1.2 (+0.1), etc. InsightBox with clinical interpretation." },
    ],
  },
  {
    title: "Specialty-specific summary (obstetric)",
    context: "Patient Anjali Patel, 28F, 14wk pregnant with asthma, obstetric tab active",
    steps: [
      { stage: "User prompt", detail: "\"Obstetric summary\" (pill tap or typed)" },
      { stage: "Normalization", detail: "Pill bypass or keyword match: 'obstetric' matches data_retrieval rule (priority 21)." },
      { stage: "Intent classification", detail: "Result: { category: 'data_retrieval', format: 'card', confidence: 0.85 }" },
      { stage: "Output format decision", detail: "Format = card. Specialty summaries need structured sections with clinical details." },
      { stage: "Card selection", detail: "Reply engine detects 'obstetric' keyword AND obstetricData exists. Routes to obstetric_summary card (takes priority over generic summary)." },
      { stage: "Rendered output", detail: "ObstetricSummaryCard showing G2P1L1, EDD, gestational weeks, presentation, ANC due items, vaccine status, alerts." },
    ],
  },
  {
    title: "Ambiguous prompt handling",
    context: "Doctor types free-form text, no matching keywords",
    steps: [
      { stage: "User prompt", detail: "\"Help me with this patient\"" },
      { stage: "Normalization", detail: "Lowercased: \"help me with this patient\"" },
      { stage: "Intent classification", detail: "No keyword rule matches. Fallback: { category: 'ambiguous', format: 'text', confidence: 0.3 }" },
      { stage: "Output format decision", detail: "Format = text. Ambiguous queries start with concise text, escalate to cards only on follow-up." },
      { stage: "Card selection", detail: "Reply engine generates free-text response acknowledging the request and offering specific next steps." },
      { stage: "Rendered output", detail: "Text response: 'I can help! Try asking for a patient summary, suggest DDX, or check labs.' Follow-up pills offered based on current phase." },
    ],
  },
]

// ── 10. Acceptance Criteria ──
const ACCEPTANCE_CRITERIA: { category: string; items: string[] }[] = [
  {
    category: "Intent Classification",
    items: [
      "All 9 intent categories must produce correct output for their representative test prompts",
      "Keyword priority ordering must be deterministic: operational multi-word phrases beat single-word matches",
      "Pill-to-intent bypass must produce identical results regardless of pill label casing/spacing",
      "Ambiguous fallback must trigger for unrecognized input with confidence 0.3",
      "No keyword collision: each prompt must map to exactly one intent category",
    ],
  },
  {
    category: "Pill Pipeline",
    items: [
      "Layer 1 safety pills (SpO2 <90, Allergy) must ALWAYS appear, cannot be displaced",
      "Maximum 4 pills displayed at any time (force pills + remaining pool)",
      "Pills must sort by priority ascending (lower number = higher priority)",
      "Deduplication by label must prevent duplicate pills across layers",
      "Data-aware pills: 'Vital trends' only when vitals exist, 'Lab overview' only when labs exist",
    ],
  },
  {
    category: "Phase Engine",
    items: [
      "Phase must never go backwards in the sequence: empty -> symptoms_entered -> dx_accepted -> meds_written -> near_complete",
      "Phase transitions must respond to both keyword detection AND card interaction (DDX shown + user responds = dx_accepted)",
      "Pills must change correctly on each phase transition",
      "New patient vs existing patient must show different pill sets in empty phase",
    ],
  },
  {
    category: "Reply Engine",
    items: [
      "Every pill label in PILL_INTENT_MAP must produce a non-empty response from the reply engine",
      "Specialty-specific summaries (obstetric, gynec, pediatric, ophthal) must take priority over generic summary when specialty data exists",
      "Missing data must produce graceful fallback text (e.g., 'No labs available') instead of empty cards",
      "All copy payloads must contain valid RxPadCopyPayload structures",
    ],
  },
  {
    category: "Homepage vs Patient",
    items: [
      "Homepage context must show only operational cards (no clinical cards)",
      "Patient context must show clinical cards and suppress irrelevant homepage cards",
      "Rail-specific pills must change when switching between follow-ups, billing, pharmacy, etc.",
      "Tab-specific pills on homepage must reflect the active queue tab (finished, cancelled, draft)",
    ],
  },
  {
    category: "Safety",
    items: [
      "Drug interaction cards must trigger when 2+ medications are active",
      "Allergy conflict cards must trigger when prescribed drug matches known allergen",
      "Safety pills (Layer 1) must render with force:true and priority 0-9",
      "All clinical text must include disclaimer: responses are template-driven, not LLM-generated (POC)",
    ],
  },
]

// ── Layer data for pill priority section ──
const PILL_LAYERS: {
  layer: number; name: string; priorityRange: string; color: string; borderColor: string; bgColor: string
  description: string; forceRule: string
  items: { trigger: string; pill: string; priority: number }[]
}[] = [
  {
    layer: 1, name: "Safety Force", priorityRange: "0-9", color: "text-red-700", borderColor: "border-red-200", bgColor: "bg-red-50",
    description: "Always shown, cannot be displaced by any other layer. Triggered by critical vital signs or allergy presence.",
    forceRule: "force: true -- these pills are ALWAYS included in the final set regardless of the max-4 limit.",
    items: [
      { trigger: "SpO\u2082 < 90%", pill: "Review SpO\u2082", priority: 0 },
      { trigger: "Allergies present (any)", pill: "Allergy Alert", priority: 2 },
    ],
  },
  {
    layer: 2, name: "Clinical Flags", priorityRange: "10-29", color: "text-amber-700", borderColor: "border-amber-200", bgColor: "bg-amber-50",
    description: "Triggered by abnormal patient data. Checked after safety pills.",
    forceRule: "Not forced, but high priority. Displaced only by Layer 1 and higher-priority Layer 2 items.",
    items: [
      { trigger: "Lab flag count >= 3", pill: "N lab values flagged", priority: 10 },
      { trigger: "Follow-up overdue > 0 days", pill: "Suggest follow-up", priority: 12 },
      { trigger: "SpO\u2082 90-94% (declining)", pill: "SpO\u2082 trend declining", priority: 14 },
      { trigger: "BP systolic >140 or <90", pill: "BP needs attention", priority: 16 },
      { trigger: "Temperature >= 100.4\u00B0F", pill: "Temperature elevated", priority: 18 },
      { trigger: "Obstetric data present", pill: "Obstetric summary", priority: 20 },
      { trigger: "Gynec data present", pill: "Gynec summary", priority: 22 },
      { trigger: "Pediatrics data present", pill: "Growth & vaccines", priority: 24 },
      { trigger: "Ophthal data present", pill: "Vision summary", priority: 26 },
    ],
  },
  {
    layer: 3, name: "Consultation Phase", priorityRange: "29-49", color: "text-violet-700", borderColor: "border-violet-200", bgColor: "bg-violet-50",
    description: "The core driver of contextual suggestions. Changes based on consultation phase (empty, symptoms_entered, dx_accepted, meds_written, near_complete).",
    forceRule: "Not forced. Data-aware: pills only appear if relevant data exists (e.g., 'Vital trends' requires vitals).",
    items: [
      { trigger: "empty + existing patient (has intake)", pill: "Patient summary", priority: 29 },
      { trigger: "empty + new patient", pill: "Suggest DDX", priority: 32 },
      { trigger: "symptoms_entered", pill: "Suggest DDX", priority: 30 },
      { trigger: "dx_accepted", pill: "Suggest medications", priority: 30 },
      { trigger: "meds_written", pill: "Translate to regional", priority: 32 },
      { trigger: "near_complete", pill: "Completeness check", priority: 30 },
      { trigger: "Labs available (any phase)", pill: "Lab comparison", priority: 35 },
    ],
  },
  {
    layer: 4, name: "Tab Lens", priorityRange: "60-69", color: "text-blue-700", borderColor: "border-blue-200", bgColor: "bg-blue-50",
    description: "Triggered by which sidebar tab is active. Adds tab-specific suggestions at lowest priority.",
    forceRule: "Not forced. Lowest priority -- only shown if higher layers leave room in the max-4 pool.",
    items: [
      { trigger: "past-visits tab", pill: "Compare visits / Recurrence check", priority: 60 },
      { trigger: "vitals tab", pill: "Vital trends / Graph view", priority: 60 },
      { trigger: "history tab", pill: "Med history search / Chronic timeline", priority: 60 },
      { trigger: "lab-results tab", pill: "Lab comparison / Annual panel", priority: 60 },
      { trigger: "obstetric tab", pill: "Obstetric summary / ANC schedule", priority: 60 },
      { trigger: "medical-records tab", pill: "OCR analysis / Report extract", priority: 60 },
    ],
  },
]

// ── Homepage vs Patient comparison ──
const HOMEPAGE_VS_PATIENT: { aspect: string; homepage: string; patient: string }[] = [
  { aspect: "Card families", homepage: "Operational (welcome, queue, revenue, KPIs, demographics, heatmap)", patient: "Clinical (summary, DDX, meds, labs, vitals, advice)" },
  { aspect: "Pill source", homepage: "homepage-pill-engine.ts with tab/rail overrides", patient: "pill-engine.ts with 4-layer priority pipeline" },
  { aspect: "Phase awareness", homepage: "No consultation phase -- operational context only", patient: "Full phase state machine (empty through near_complete)" },
  { aspect: "Data signals", homepage: "Queue tab, rail item, optional patient summary", patient: "All SmartSummaryData fields, specialty, vitals, labs" },
  { aspect: "Max pills", homepage: "Up to 12 in demo (4 in production per tab)", patient: "Max 4, with Layer 1 force pills always included" },
  { aspect: "Intent routing", homepage: "Primarily operational intents, some comparison", patient: "All 9 intent categories active" },
  { aspect: "Rail-specific pills", homepage: "follow-ups, opd-billing, all-patients, pharmacy, bulk-messages", patient: "N/A -- sidebar tab context instead" },
]

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

/** Shared inner component used by both standalone page and embedded tab */
function IntentClassificationInner({ embedded = false }: { embedded?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [keywordSearch, setKeywordSearch] = useState("")
  const [keywordFilterCat, setKeywordFilterCat] = useState<string>("all")
  const [pillGroupBy, setPillGroupBy] = useState<"category" | "alpha">("category")
  const [pillSearch, setPillSearch] = useState("")
  const [activePhase, setActivePhase] = useState<string>("empty")
  const [activeE2E, setActiveE2E] = useState(0)
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null)
  const [activeLayerTab, setActiveLayerTab] = useState(1)

  const filteredRules = useMemo(() => {
    let rules = KEYWORD_RULES
    if (keywordFilterCat !== "all") rules = rules.filter(r => r.category === keywordFilterCat)
    if (keywordSearch.trim()) {
      const q = keywordSearch.toLowerCase()
      rules = rules.filter(r => r.keywords.some(k => k.includes(q)) || r.category.includes(q))
    }
    return rules
  }, [keywordSearch, keywordFilterCat])

  const filteredPills = useMemo(() => {
    let pills = PILL_INTENT_ENTRIES
    if (pillSearch.trim()) {
      const q = pillSearch.toLowerCase()
      pills = pills.filter(p => p.label.toLowerCase().includes(q) || p.intent.includes(q))
    }
    if (pillGroupBy === "category") {
      const groups: Record<string, typeof pills> = {}
      pills.forEach(p => {
        if (!groups[p.intent]) groups[p.intent] = []
        groups[p.intent].push(p)
      })
      return groups
    }
    return { "All pills": [...pills].sort((a, b) => a.label.localeCompare(b.label)) }
  }, [pillSearch, pillGroupBy])

  const catColor = (cat: string) => INTENT_CATEGORIES.find(c => c.id === cat)?.color || "text-slate-600"

  // Section nav bar (used in both modes)
  const sectionNav = (
    <div className="overflow-x-auto">
      <nav className="flex gap-1 pb-2">
        {NAV_SECTIONS.map(item => (
          <a key={item.id} href={`#${item.id}`} className="whitespace-nowrap rounded-full px-3 py-[4px] text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  )

  if (embedded) {
    return (
      <div>
        {sectionNav}
        <div className="mt-4">{renderContent()}</div>
      </div>
    )
  }

  function renderContent() {
    return (
      <>

        {/* ═══ SECTION 1: OVERVIEW ═══ */}
        <section id="overview" className="mb-14">
          <SectionHeading number={1} title="Overview" subtitle="Two-stage pipeline: Intent Classification followed by Response Format Decision" />

          <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50 px-5 py-4">
            <p className="text-[12px] leading-[1.7] text-violet-800">
              The Doctor Agent uses a <span className="font-bold">two-stage pipeline</span> to decide what to show the doctor.
              Stage 1 (<span className="font-semibold">Intent Classification</span>) determines <em>what kind</em> of response is needed.
              Stage 2 (<span className="font-semibold">Output Decision</span>) determines <em>how</em> to present it (text or card).
              Together with the <span className="font-semibold">Canned Pill Engine</span>, they drive the contextual, phase-aware experience.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              { step: "Step 1", title: "Prompt normalization", desc: "Lowercase, subscript conversion, whitespace cleanup. Pill labels checked against PILL_INTENT_MAP for bypass." },
              { step: "Step 2", title: "Intent classification", desc: "Map to one of 9 categories via keyword rules (70+ rules) or pill bypass (90+ mappings). First match wins." },
              { step: "Step 3", title: "Output-format decision", desc: "Choose text (concise) or card (structured/actionable with agent description text)." },
              { step: "Step 4", title: "Renderer selection", desc: "Select card kind + populate payload from SmartSummaryData. Render via CardRenderer discriminated union." },
            ].map(s => (
              <div key={s.step} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.step}</p>
                <p className="mt-1 text-[12px] font-semibold text-slate-800">{s.title}</p>
                <p className="mt-1 text-[11px] leading-[1.5] text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Pipeline diagram */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[12px] font-semibold text-slate-700">Pipeline Flow</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {[
                "User types prompt / taps pill",
                "Normalize input",
                "Check PILL_INTENT_MAP (bypass?)",
                "Run keyword rules (first match)",
                "Fallback: ambiguous @ 0.3",
                "Decide format: text | card",
                "Build reply from SmartSummaryData",
                "Render card + regenerate pills",
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-700">{step}</span>
                  {i < 7 && <span className="text-slate-300">&rarr;</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PIPELINE VISUAL FLOW DIAGRAM ═══ */}
        <section id="pipeline-flow" className="mb-14">
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Visual Reference</p>
            <h2 className="mt-1 text-[15px] font-bold text-slate-800">Pipeline Overview &mdash; Visual Flow</h2>
            <p className="mt-1 text-[11px] text-slate-500">Two-stage pipeline from user input to final doctor-facing response.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 overflow-x-auto">
            <div className="flex flex-col lg:flex-row gap-6 min-w-[640px]">

              {/* ── STAGE 1: Intent Classification (Blue) ── */}
              <div className="flex-1 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-blue-500">Stage 1 &mdash; Intent Classification</p>

                <div className="flex flex-col items-center gap-1.5">
                  {/* User Input */}
                  <div className="w-full rounded-lg border border-blue-300 bg-blue-100 px-3 py-2 text-center">
                    <p className="text-[11px] font-semibold text-blue-800">User Input</p>
                    <p className="text-[9px] text-blue-600">Text typed OR pill clicked</p>
                  </div>

                  <span className="text-blue-300 text-[13px]">&darr;</span>

                  {/* Decision: Pill Click? */}
                  <div className="w-full max-w-[220px] rotate-0 rounded-lg border-2 border-dashed border-blue-400 bg-white px-3 py-2 text-center" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", padding: "24px 12px" }}>
                    <p className="text-[10px] font-bold text-blue-700">Pill Click?</p>
                  </div>

                  {/* Two branches */}
                  <div className="grid w-full grid-cols-2 gap-3">
                    {/* YES branch */}
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">YES</span>
                      <span className="text-blue-300 text-[13px]">&darr;</span>
                      <div className="w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-center">
                        <p className="text-[10px] font-semibold text-blue-800">Direct Intent Mapping</p>
                        <p className="text-[9px] text-blue-500">90+ pill mappings</p>
                      </div>
                      <span className="text-blue-300 text-[13px]">&darr;</span>
                      <p className="text-[9px] italic text-blue-400">Skip to Stage 2</p>
                    </div>

                    {/* NO branch */}
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-600">NO</span>
                      <span className="text-blue-300 text-[13px]">&darr;</span>
                      <div className="w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-center">
                        <p className="text-[10px] font-semibold text-blue-800">Keyword Rules Engine</p>
                        <p className="text-[9px] text-blue-500">70+ rules</p>
                      </div>
                      <span className="text-blue-300 text-[13px]">&darr;</span>
                      <div className="w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-center">
                        <p className="text-[10px] font-semibold text-blue-800">Priority Match</p>
                        <p className="text-[9px] text-blue-500">First match wins</p>
                      </div>
                    </div>
                  </div>

                  <span className="text-blue-300 text-[13px]">&darr;</span>

                  {/* Intent Category result */}
                  <div className="w-full rounded-lg border-2 border-blue-400 bg-blue-100 px-3 py-2 text-center">
                    <p className="text-[11px] font-bold text-blue-800">Intent Category</p>
                    <p className="text-[9px] text-blue-600 leading-[1.4]">One of 9: operational, data_retrieval, clinical_decision, action, comparison, document_analysis, clinical_question, follow_up, ambiguous</p>
                  </div>
                </div>
              </div>

              {/* ── Arrow between stages ── */}
              <div className="hidden lg:flex flex-col items-center justify-center">
                <span className="text-[18px] text-slate-300">&rarr;</span>
              </div>
              <div className="flex lg:hidden items-center justify-center">
                <span className="text-[18px] text-slate-300">&darr;</span>
              </div>

              {/* ── STAGE 2: Output Decision (Green) ── */}
              <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-emerald-500">Stage 2 &mdash; Output Decision</p>

                <div className="flex flex-col items-center gap-1.5">
                  {/* Intent Category input */}
                  <div className="w-full rounded-lg border-2 border-emerald-400 bg-emerald-100 px-3 py-2 text-center">
                    <p className="text-[11px] font-bold text-emerald-800">Intent Category</p>
                    <p className="text-[9px] text-emerald-600">From Stage 1</p>
                  </div>

                  <span className="text-emerald-300 text-[13px]">&darr;</span>

                  {/* Output Format Decision */}
                  <div className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold text-emerald-800">Output Format Decision</p>
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      {["text", "card"].map(f => (
                        <span key={f} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">{f}</span>
                      ))}
                    </div>
                  </div>

                  <span className="text-emerald-300 text-[13px]">&darr;</span>

                  {/* Card Routing */}
                  <div className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold text-emerald-800">Card Routing</p>
                    <p className="text-[9px] text-emerald-500">55+ card types &middot; 8 families</p>
                  </div>

                  <span className="text-emerald-300 text-[13px]">&darr;</span>

                  {/* Context Enrichment */}
                  <div className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold text-emerald-800">Context Enrichment</p>
                    <p className="text-[9px] text-emerald-500">Phase + Tab + Specialty</p>
                  </div>

                  <span className="text-emerald-300 text-[13px]">&darr;</span>

                  {/* Final Response */}
                  <div className="w-full rounded-lg border-2 border-emerald-400 bg-emerald-100 px-3 py-2 text-center">
                    <p className="text-[11px] font-bold text-emerald-800">Final Response</p>
                    <p className="text-[9px] text-emerald-600">Rendered to Doctor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Context Signals (side inputs) ── */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Context Signals Feeding Into Pipeline</p>
              <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <div>
                    <p className="text-[10px] font-semibold text-violet-700">Consultation Phase</p>
                    <p className="text-[9px] text-violet-500">5 phases</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <div>
                    <p className="text-[10px] font-semibold text-sky-700">Active Sidebar Tab</p>
                    <p className="text-[9px] text-sky-500">Tab-aware routing</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <div>
                    <p className="text-[10px] font-semibold text-amber-700">Doctor Specialty</p>
                    <p className="text-[9px] text-amber-500">Specialty keywords</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <div>
                    <p className="text-[10px] font-semibold text-rose-700">Homepage vs Patient</p>
                    <p className="text-[9px] text-rose-500">Context switch</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 2: INTENT CATEGORIES ═══ */}
        <section id="intent-categories" className="mb-14">
          <SectionHeading number={2} title="Intent Categories" subtitle="9 categories with definitions, example prompts, and confidence rules. Click a card to expand." />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INTENT_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.id)}
                  className={`cursor-pointer rounded-xl border text-left transition-all ${isActive ? `${cat.border} ${cat.bg} ring-2 ring-offset-1 ring-violet-300` : "border-slate-200 bg-white hover:border-slate-300"} px-4 py-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md ${cat.bg} ${cat.border} border px-2 py-0.5 text-[10px] font-bold ${cat.color}`}>
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{isActive ? "collapse" : "expand"}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-[1.5] text-slate-600">{cat.description}</p>
                  {isActive && (
                    <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Typical output</p>
                        <p className="mt-0.5 text-[11px] text-slate-700">{cat.typicalOutput}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Confidence rule</p>
                        <p className="mt-0.5 text-[11px] text-slate-700">{cat.confidenceRule}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Example prompts</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {cat.examples.map(ex => (
                            <span key={ex} className="rounded-full bg-white/80 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* ═══ SECTION 3: KEYWORD RULES ═══ */}
        <section id="keyword-rules" className="mb-14">
          <SectionHeading number={3} title="Keyword Rules Engine" subtitle="70+ keyword rules checked top-to-bottom. First match wins. Priority ordering ensures multi-word phrases beat single-word." />

          <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-blue-700">Priority ordering (checked in this order)</p>
            <p className="mt-1 text-[11px] text-blue-600">
              operational (multi-word) &rarr; data_retrieval &rarr; clinical_decision &rarr; action &rarr; comparison &rarr; document_analysis &rarr; clinical_question &rarr; follow_up &rarr; ambiguous fallback
            </p>
          </div>

          {/* Filters */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              type="text" placeholder="Search keywords..." value={keywordSearch}
              onChange={e => setKeywordSearch(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200 w-56"
            />
            <select
              value={keywordFilterCat} onChange={e => setKeywordFilterCat(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 outline-none"
            >
              <option value="all">All categories</option>
              {[...new Set(KEYWORD_RULES.map(r => r.category))].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400">{filteredRules.length} rules shown</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="max-h-[480px] overflow-y-auto">
              <table className="min-w-full text-[11px]">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="px-3 py-2 font-semibold w-12">#</th>
                    <th className="px-3 py-2 font-semibold w-32">Category</th>
                    <th className="px-3 py-2 font-semibold">Keywords</th>
                    <th className="px-3 py-2 font-semibold w-16">Format</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-3 py-1.5 text-slate-400">{rule.priority}</td>
                      <td className={`px-3 py-1.5 font-medium ${catColor(rule.category)}`}>{rule.category}</td>
                      <td className="px-3 py-1.5 text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {rule.keywords.map(kw => (
                            <span key={kw} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">{kw}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rule.format === "card" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                          {rule.format}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4: OUTPUT DECISION ═══ */}
        <section id="output-decision" className="mb-14">
          <SectionHeading number={4} title="Output Decision Layer (Text vs Card)" subtitle="Complete decision rules for when to show text or card response format. Cards always include 1-2 line agent description text." />

          {/* Decision tree visual */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-4 text-[12px] font-semibold text-slate-700">Decision Tree</p>
            <div className="flex flex-col gap-3 text-[11px]">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 border border-violet-200 px-3 py-2 font-semibold text-violet-700 w-44 text-center">Classified Intent</div>
                <span className="text-slate-300">&rarr;</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-center">
                    <p className="font-semibold text-slate-700">Text</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">clinical_question, ambiguous</p>
                  </div>
                  <div className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-center">
                    <p className="font-semibold text-violet-700">Card</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">data_retrieval, clinical_decision, action, comparison, operational, document_analysis</p>
                    <p className="mt-0.5 text-[9px] text-violet-400 italic">Always includes 1-2 line agent description</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-2 font-semibold">Condition</th>
                  <th className="px-4 py-2 font-semibold w-20">Output</th>
                  <th className="px-4 py-2 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {OUTPUT_RULES.map((rule, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-4 py-2 text-slate-700">{rule.condition}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${rule.output === "Card" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                        {rule.output}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{rule.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ SECTION 5: PILL-TO-INTENT BYPASS ═══ */}
        <section id="pill-intent-bypass" className="mb-14">
          <SectionHeading number={5} title="Pill-to-Intent Bypass" subtitle="90+ pill label to intent mappings. When a pill is tapped, NLU keyword matching is entirely bypassed for deterministic routing." />

          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-emerald-700">Why bypass?</p>
            <p className="mt-1 text-[11px] text-emerald-600">
              Zero latency on pill taps. Deterministic routing (no false matches). Consistent behavior regardless of pill label phrasing.
              The PILL_INTENT_MAP in intent-engine.ts maps each pill label string directly to an IntentCategory.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              type="text" placeholder="Search pills..." value={pillSearch}
              onChange={e => setPillSearch(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-violet-300 w-56"
            />
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button onClick={() => setPillGroupBy("category")} className={`px-3 py-1.5 text-[11px] font-medium ${pillGroupBy === "category" ? "bg-violet-100 text-violet-700" : "bg-white text-slate-500"}`}>
                By category
              </button>
              <button onClick={() => setPillGroupBy("alpha")} className={`px-3 py-1.5 text-[11px] font-medium border-l border-slate-200 ${pillGroupBy === "alpha" ? "bg-violet-100 text-violet-700" : "bg-white text-slate-500"}`}>
                Alphabetical
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              {Object.values(filteredPills).reduce((sum, arr) => sum + arr.length, 0)} pills
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(filteredPills).map(([group, pills]) => (
              <div key={group} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                  <span className={`text-[12px] font-semibold ${catColor(group)}`}>{group}</span>
                  <span className="ml-2 text-[10px] text-slate-400">{pills.length} pills</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-4 py-3">
                  {pills.map(p => (
                    <span key={p.label} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-700">
                      {p.label}
                      {pillGroupBy === "alpha" && <span className="ml-1 text-[9px] text-slate-400">({p.intent})</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 6: 4-LAYER PILL PRIORITY ═══ */}
        <section id="pill-priority" className="mb-14">
          <SectionHeading number={6} title="4-Layer Pill Priority Pipeline" subtitle="Pills generated across 4 layers, sorted by priority, deduped, then capped at max 4." />

          {/* Pipeline resolution diagram */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[12px] font-semibold text-slate-700">Pipeline Resolution</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {[
                "All 4 layers generate pills",
                "Sort by priority (ascending)",
                "Deduplicate by label",
                "Layer 1 force pills always included",
                "Remaining slots filled (max 4 total)",
                "Final pill set displayed",
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-700">{step}</span>
                  {i < 5 && <span className="text-slate-300">&darr;</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Layer tabs */}
          <div className="mb-3 flex gap-1">
            {PILL_LAYERS.map(layer => (
              <button
                key={layer.layer}
                onClick={() => setActiveLayerTab(layer.layer)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${activeLayerTab === layer.layer ? `${layer.bgColor} ${layer.color} ${layer.borderColor} border` : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                Layer {layer.layer}: {layer.name}
              </button>
            ))}
          </div>

          {/* Active layer detail */}
          {PILL_LAYERS.filter(l => l.layer === activeLayerTab).map(layer => (
            <div key={layer.layer} className={`rounded-xl border ${layer.borderColor} ${layer.bgColor} p-5`}>
              <div className="mb-3 flex items-center gap-3">
                <span className={`text-[14px] font-bold ${layer.color}`}>Layer {layer.layer}: {layer.name}</span>
                <span className="rounded-full bg-white/80 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600">Priority {layer.priorityRange}</span>
              </div>
              <p className="mb-2 text-[11px] text-slate-600">{layer.description}</p>
              <p className="mb-4 text-[11px] font-medium text-slate-700">Rule: {layer.forceRule}</p>

              <div className="overflow-hidden rounded-lg border border-white/50 bg-white">
                <table className="min-w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                      <th className="px-3 py-2 font-semibold">Trigger condition</th>
                      <th className="px-3 py-2 font-semibold">Pill label</th>
                      <th className="px-3 py-2 font-semibold w-16">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layer.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-3 py-1.5 text-slate-700">{item.trigger}</td>
                        <td className="px-3 py-1.5">
                          <span className="rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700">{item.pill}</span>
                        </td>
                        <td className="px-3 py-1.5 text-slate-500">{item.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        {/* ═══ SECTION 7: PHASE ENGINE ═══ */}
        <section id="phase-engine" className="mb-14">
          <SectionHeading number={7} title="Consultation Phase Engine" subtitle="5 phases with no-backwards rule. Phase transitions driven by keyword detection + card interaction." />

          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-amber-700">No-backwards rule</p>
            <p className="mt-1 text-[11px] text-amber-600">
              Phase order: empty &rarr; symptoms_entered &rarr; dx_accepted &rarr; meds_written &rarr; near_complete.
              The phase engine never moves backwards. Once a phase is reached, earlier phases cannot be re-entered.
            </p>
          </div>

          {/* Phase selector */}
          <div className="mb-4 flex gap-1">
            {PHASES.map((phase, i) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${activePhase === phase.id ? "bg-violet-100 text-violet-700 border border-violet-200" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] text-slate-600">{i + 1}</span>
                {phase.id}
              </button>
            ))}
          </div>

          {PHASES.filter(p => p.id === activePhase).map(phase => (
            <div key={phase.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-[14px] font-bold text-slate-800">{phase.label}</span>
                <span className="rounded-full bg-violet-100 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700">{phase.id}</span>
              </div>
              <p className="mb-4 text-[12px] text-slate-600">{phase.description}</p>

              {phase.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Detection keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {phase.keywords.map(kw => (
                      <span key={kw} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500 mb-2">New patient pills</p>
                  <div className="space-y-1">
                    {phase.pillsNewPatient.map(p => (
                      <div key={p} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] text-blue-700">{p}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500 mb-2">Existing patient pills</p>
                  <div className="space-y-1">
                    {phase.pillsExistingPatient.map(p => (
                      <div key={p} className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-700">{p}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Transition rule</p>
                <p className="text-[11px] text-slate-600">{phase.transitions}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ═══ SECTION 8: CARD ROUTING ═══ */}
        <section id="card-routing" className="mb-14">
          <SectionHeading number={8} title="Intent to Card Routing" subtitle="Complete mapping of which intent categories produce which card types. 50+ card variants organized by family." />

          {/* Intent-to-card summary */}
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
              <p className="text-[12px] font-semibold text-slate-700">Intent &rarr; Card Family Mapping</p>
            </div>
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-4 py-2 font-semibold">Intent Category</th>
                  <th className="px-4 py-2 font-semibold">Card Kinds Produced</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { intent: "data_retrieval", cards: "patient_summary, last_visit, lab_panel, med_history, specialty summaries (4), patient_timeline" },
                  { intent: "clinical_decision", cards: "ddx, protocol_meds, investigation_bundle, clinical_guideline" },
                  { intent: "action", cards: "follow_up, advice_bundle, translation, rx_preview, voice_structured_rx" },
                  { intent: "comparison", cards: "lab_comparison, vitals_trend_bar, vitals_trend_line, lab_trend" },
                  { intent: "document_analysis", cards: "ocr_pathology, ocr_extraction" },
                  { intent: "clinical_question", cards: "drug_interaction, text_fact, text_quote, text_alert, text_step" },
                  { intent: "operational", cards: "welcome_card, patient_list, follow_up_list, revenue_bar, analytics_table, donut_chart, heatmap, billing_summary, condition_bar, line_graph, plus 4 more" },
                  { intent: "follow_up", cards: "follow_up_question" },
                  { intent: "ambiguous", cards: "text response (no card)" },
                ].map(row => (
                  <tr key={row.intent} className="border-b border-slate-50">
                    <td className={`px-4 py-2 font-medium ${catColor(row.intent)}`}>{row.intent}</td>
                    <td className="px-4 py-2 text-slate-600">{row.cards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card families accordion */}
          <p className="mb-3 text-[12px] font-semibold text-slate-700">Card Families ({CARD_FAMILIES.reduce((s, f) => s + f.count, 0)} total cards)</p>
          <div className="space-y-2">
            {CARD_FAMILIES.map(fam => {
              const isOpen = expandedFamily === fam.family
              return (
                <div key={fam.family} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setExpandedFamily(isOpen ? null : fam.family)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${fam.color}`} />
                      <span className="text-[12px] font-semibold text-slate-800">{fam.family} Family</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{fam.count} cards</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{isOpen ? "collapse" : "expand"}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 py-3">
                      <div className="space-y-1.5">
                        {fam.cards.map(card => (
                          <div key={card.kind} className="flex items-start gap-2 text-[11px]">
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-violet-600 whitespace-nowrap">{card.kind}</code>
                            <span className="text-slate-600">{card.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ═══ SECTION 9: SIDEBAR TAB CONTEXT ═══ */}
        <section id="sidebar-tabs" className="mb-14">
          <SectionHeading number={9} title="Sidebar Tab Context" subtitle="11 sidebar tabs with their specific pills. Tapping a pill switches to the Dr. Agent panel and injects the pill label as a user message." />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SIDEBAR_TABS.map(tab => (
              <div key={tab.tab} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[12px] font-semibold text-slate-800 mb-2">{tab.tab}</p>
                <div className="space-y-1">
                  {tab.pills.map(pill => (
                    <div key={pill} className="rounded-lg border border-violet-100 bg-violet-50/50 px-2.5 py-1 text-[11px] text-violet-700">{pill}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 10: HOMEPAGE VS PATIENT ═══ */}
        <section id="homepage-vs-patient" className="mb-14">
          <SectionHeading number={10} title="Homepage vs Patient Context" subtitle="The system behaves differently on homepage (operational) vs inside a patient appointment (clinical)." />

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-2 font-semibold w-40">Aspect</th>
                  <th className="px-4 py-2 font-semibold">
                    <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">Homepage</span>
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700">Patient Context</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {HOMEPAGE_VS_PATIENT.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-700">{row.aspect}</td>
                    <td className="px-4 py-2 text-slate-600">{row.homepage}</td>
                    <td className="px-4 py-2 text-slate-600">{row.patient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-orange-700">Homepage Rail-Specific Pills</p>
            <p className="mt-1 text-[11px] text-orange-600">
              5 rail contexts change pills: <span className="font-medium">follow-ups</span> (dues today, overdue, this week, rate),{" "}
              <span className="font-medium">opd-billing</span> (collection, billing, deposits, invoice),{" "}
              <span className="font-medium">all-patients</span> (demographics, diagnosis, trends, KPIs, chronic, peak hours, referral, vaccination, ANC),{" "}
              <span className="font-medium">pharmacy</span> (low stock, pending Rx, dispense, expiring),{" "}
              <span className="font-medium">bulk-messages</span> (campaign, delivery, templates, scheduled).
            </p>
          </div>
        </section>

        {/* ═══ SECTION 11: CONTEXT SIGNALS ═══ */}
        <section id="context-signals" className="mb-14">
          <SectionHeading number={11} title="Context Signals" subtitle="All context signals used by the reply engine to generate contextual responses." />

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-2 font-semibold">Signal</th>
                  <th className="px-4 py-2 font-semibold">Source</th>
                  <th className="px-4 py-2 font-semibold">How it influences response</th>
                </tr>
              </thead>
              <tbody>
                {CONTEXT_SIGNALS.map((sig, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-700">{sig.signal}</td>
                    <td className="px-4 py-2"><code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono text-violet-600">{sig.source}</code></td>
                    <td className="px-4 py-2 text-slate-600">{sig.influence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ SECTION 12: E2E EXAMPLES ═══ */}
        <section id="e2e-examples" className="mb-14">
          <SectionHeading number={12} title="End-to-End Flow Examples" subtitle="6 complete traced examples showing the full pipeline from user prompt to rendered output." />

          {/* Example selector */}
          <div className="mb-4 flex flex-wrap gap-1">
            {E2E_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setActiveE2E(i)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${activeE2E === i ? "bg-violet-100 text-violet-700 border border-violet-200" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                {ex.title}
              </button>
            ))}
          </div>

          {E2E_EXAMPLES.filter((_, i) => i === activeE2E).map(example => (
            <div key={example.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-[14px] font-bold text-slate-800 mb-1">{example.title}</p>
              <p className="text-[11px] text-slate-500 mb-4">{example.context}</p>
              <div className="space-y-3">
                {example.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700">{step.stage}</p>
                      <p className="mt-0.5 text-[11px] leading-[1.6] text-slate-600">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ═══ SECTION 13: CANNED MESSAGES ═══ */}
        <section id="canned-messages" className="mb-14">
          <SectionHeading number={13} title="Canned Message Responses" subtitle="How text responses are generated, clinical language rules, and disclaimer handling." />

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-[12px] font-semibold text-slate-800 mb-3">What is a Canned Message?</p>
              <p className="text-[11px] leading-[1.7] text-slate-600">
                When a pill is tapped or intent is classified, the reply engine generates a structured response.
                For the POC, responses are <span className="font-semibold">deterministic and template-driven</span> (not LLM-generated).
                The reply engine in <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono text-violet-600">reply-engine.ts</code> uses
                a large switch/if chain matching on normalized input to produce the correct RxAgentOutput.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-[12px] font-semibold text-slate-800 mb-3">How Messages Adapt</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { trigger: "Phase transitions", detail: "When doctor enters symptoms, message shifts from 'Here is the patient summary' to 'Based on the symptoms, here are possible diagnoses'." },
                  { trigger: "Data changes", detail: "When new labs arrive, the message highlights deltas and flags." },
                  { trigger: "Action context", detail: "If the doctor is on the medication section, the message focuses on drug-related info." },
                  { trigger: "Specialty context", detail: "If the patient has obstetric data, specialty-specific insights are woven into narratives." },
                ].map(item => (
                  <div key={item.trigger} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-slate-700">{item.trigger}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-[12px] font-semibold text-slate-800 mb-3">Clinical Language Rules</p>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li>Use clinical terminology appropriate for the doctor audience (not patient-facing).</li>
                <li>Include quantitative data where available (lab values, vital numbers, overdue days).</li>
                <li>Flag abnormals and critical values with emphasis markers.</li>
                <li>Safety checks (allergy conflicts, drug interactions) always include severity and recommended action.</li>
                <li>Copy payloads always use structured RxPadCopyPayload format for consistent RxPad integration.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[12px] font-semibold text-red-700">Disclaimer (POC)</p>
              <p className="mt-1 text-[11px] text-red-600">
                All responses are template-driven from deterministic rules, not generated by an LLM.
                When building the real backend: use keyword rules as training data/few-shot examples, feed all SmartSummaryData signals into the LLM prompt,
                and require the LLM to return JSON matching the RxAgentOutput union type. The 4-layer pill engine should remain server-side (deterministic and fast).
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 14: ACCEPTANCE CRITERIA ═══ */}
        <section id="acceptance-criteria" className="mb-14">
          <SectionHeading number={14} title="Acceptance Criteria" subtitle="What must pass for the intent classification system to be production-ready." />

          <div className="space-y-4">
            {ACCEPTANCE_CRITERIA.map(group => (
              <div key={group.category} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                  <p className="text-[12px] font-semibold text-slate-700">{group.category}</p>
                </div>
                <div className="px-4 py-3">
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded border border-slate-300 bg-slate-50 flex items-center justify-center text-[8px] text-slate-400">{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFE]">
      {/* ══ STICKY HEADER ══ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h1 className="text-[18px] font-bold leading-tight bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Intent Classification & Output Decision
              </h1>
              <p className="text-[11px] text-slate-400">
                Complete reference for the Dr. Agent decision-making pipeline
              </p>
            </div>
          </div>
          <a href="/tp-appointment-screen/scenarios" className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Back to Documentation
          </a>
        </div>
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
          {sectionNav}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {renderContent()}
      </main>
    </div>
  )
}

/** Content-only version for embedding as a tab (no page wrapper/header) */
export function IntentClassificationContent() {
  return <IntentClassificationInner embedded />
}

export default function IntentClassificationPage() {
  return <IntentClassificationInner />
}

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function SectionHeading({ number, title, subtitle }: { number: number; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">{number}</span>
        <h2 className="text-[20px] font-bold text-slate-800">{title}</h2>
      </div>
      <p className="ml-8 text-[12px] text-slate-500">{subtitle}</p>
    </div>
  )
}

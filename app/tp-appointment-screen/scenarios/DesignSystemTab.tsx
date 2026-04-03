"use client"

import React, { useState } from "react"
import { CardCatalogLive } from "./CardCatalogLive"

// ─────────────────────────────────────────────────────────────
// Doctor Agent — UI Card Design System
// Comprehensive design tokens, card catalog, intent mapping,
// and interaction patterns for the entire card library.
// ─────────────────────────────────────────────────────────────

// ═══════ DESIGN TOKENS ═══════

const TOKENS = {
  colors: {
    primary: { label: "TP Blue 500", value: "#4B4AD5", css: "var(--tp-blue-500)" },
    primaryLight: { label: "TP Blue 50", value: "#EEEEFF", css: "var(--tp-blue-50)" },
    slate800: { label: "TP Slate 800", value: "#2C2C35", css: "var(--tp-slate-800)" },
    slate700: { label: "TP Slate 700", value: "#454551", css: "var(--tp-slate-700)" },
    slate600: { label: "TP Slate 600", value: "#545460", css: "var(--tp-slate-600)" },
    slate500: { label: "TP Slate 500", value: "#717179", css: "var(--tp-slate-500)" },
    slate400: { label: "TP Slate 400", value: "#A2A2A8", css: "var(--tp-slate-400)" },
    slate200: { label: "TP Slate 200", value: "#E2E2EA", css: "var(--tp-slate-200)" },
    slate50: { label: "TP Slate 50", value: "#FAFAFB", css: "var(--tp-slate-50)" },
    error700: { label: "TP Error 700", value: "#9F1239", css: "var(--tp-error-700)" },
    error600: { label: "TP Error 600", value: "#C8102E", css: "var(--tp-error-600)" },
    error50: { label: "TP Error 50", value: "#FFF1F2", css: "var(--tp-error-50)" },
    warning700: { label: "TP Warning 700", value: "#B45309", css: "var(--tp-warning-700)" },
    warning600: { label: "TP Warning 600", value: "#D97706", css: "var(--tp-warning-600)" },
    warning50: { label: "TP Warning 50", value: "#FFFBEB", css: "var(--tp-warning-50)" },
    success700: { label: "TP Success 700", value: "#047857", css: "var(--tp-success-700)" },
    success600: { label: "TP Success 600", value: "#059669", css: "var(--tp-success-600)" },
    success50: { label: "TP Success 50", value: "#ECFDF5", css: "var(--tp-success-50)" },
    violet800: { label: "TP Violet 800", value: "#572A81", css: "var(--tp-violet-800)" },
    violet600: { label: "TP Violet 600", value: "#8A4DBB", css: "var(--tp-violet-600)" },
    violet50: { label: "TP Violet 50", value: "#FAF5FE", css: "var(--tp-violet-50)" },
    aiGradient: { label: "AI Gradient", value: "linear-gradient(135deg, #D565EA 0%, #673AAC 45%, #1A1994 100%)", css: "var(--ai-gradient)" },
  },
  typography: [
    { token: "card-title", size: "16px", weight: 600, leading: "1.2", usage: "Card header titles" },
    { token: "card-subtitle", size: "12px", weight: 400, leading: "1.3", usage: "Dates, meta under title" },
    { token: "body", size: "14px", weight: 400, leading: "1.5", usage: "Card body text, data values" },
    { token: "body-semibold", size: "14px", weight: 600, leading: "1.5", usage: "Labels, section headers" },
    { token: "badge", size: "12px", weight: 600, leading: "1.2", usage: "Status badges, tags" },
    { token: "chip", size: "12px", weight: 500, leading: "1", usage: "Copy-all chips, secondary info" },
    { token: "pill-label", size: "13px", weight: 400, leading: "1", usage: "AI action pill text" },
    { token: "stat-value", size: "18px", weight: 700, leading: "1", usage: "Dashboard stat numbers" },
    { token: "stat-label", size: "12px", weight: 500, leading: "1.4", usage: "Dashboard stat labels" },
    { token: "chart-label", size: "10px", weight: 500, leading: "1", usage: "SVG chart axis labels (minimum)" },
    { token: "tooltip", size: "12px", weight: 400, leading: "1.3", usage: "Hover tooltips" },
    { token: "section-header", size: "14px", weight: 600, leading: "1", usage: "Inline section headers" },
    { token: "insight-text", size: "13px", weight: 500, leading: "1.5", usage: "InsightBox body text" },
  ],
  spacing: [
    { token: "card-radius", value: "12px", usage: "Outer card container" },
    { token: "card-header-px", value: "12px", usage: "Header horizontal padding" },
    { token: "card-header-py", value: "10px", usage: "Header vertical padding" },
    { token: "card-body-px", value: "12px", usage: "Body horizontal padding" },
    { token: "card-body-py", value: "8px", usage: "Body vertical padding" },
    { token: "icon-container", value: "24x24px", usage: "Header icon box" },
    { token: "icon-radius", value: "8px", usage: "Header icon rounded corners" },
    { token: "icon-size", value: "14px", usage: "Icon glyph inside container" },
    { token: "section-tag-icon", value: "12px", usage: "Icon inside SectionTag chip headers (not 10px)" },
    { token: "gap-header", value: "7px", usage: "Between icon, title, badge" },
    { token: "gap-body", value: "8px", usage: "Between body sections" },
    { token: "gap-pills", value: "4px", usage: "Between action pills" },
    { token: "pill-height", value: "26px", usage: "Action pill button height" },
    { token: "pill-px", value: "14px", usage: "Action pill horizontal padding" },
    { token: "pill-radius", value: "full (9999px)", usage: "Fully rounded pills" },
    { token: "badge-px", value: "6px", usage: "Badge horizontal padding" },
    { token: "badge-py", value: "1px", usage: "Badge vertical padding" },
    { token: "badge-radius", value: "4px", usage: "Badge rounded corners" },
    { token: "section-bar-py", value: "3px", usage: "Section header bar padding" },
    { token: "collapse-btn", value: "22x22px", usage: "Collapse toggle button" },
    { token: "collapse-radius", value: "6px", usage: "Collapse button corners" },
    { token: "inline-divider-char", value: "|", usage: "Structural divider between data sections (never use ·)" },
    { token: "inline-divider-mx", value: "6px", usage: "Horizontal margin on inline dividers (mx-[6px])" },
    { token: "inline-divider-color", value: "text-tp-slate-200", usage: "Divider text color class" },
  ],
  shadows: [
    { token: "card-shadow", value: "0 1px 3px rgba(23,23,37,0.04), 0 0 0 0.5px rgba(23,23,37,0.06)", usage: "Card outer shadow" },
  ],
}

// ═══════ CARD CATALOG ═══════

interface CardSpec {
  kind: string
  family: string
  title: string
  tpIcon: string | null
  iconsaxIcon: string | null
  dataType: string
  features: string[]
  copyActions: string[]
  pillActions: string[]
  collapsible: boolean
  constraints: string[]
}

const CARD_CATALOG: CardSpec[] = [
  // ── Summary Cards ──
  {
    kind: "patient_summary", family: "Summary", title: "Patient Summary",
    tpIcon: "stethoscope", iconsaxIcon: null,
    dataType: "SmartSummaryData",
    features: ["InlineDataRow sections", "Specialty boxes", "Sidebar navigation links", "Vitals/Labs/History/Meds sections"],
    copyActions: ["Fill all (vitals + labs + conditions + allergies + meds)"],
    pillActions: ["Last visit details", "Labs", "Vital trends", "Suggest DDX", "Ask me anything"],
    collapsible: true,
    constraints: ["Always first card shown for existing patients", "Sections dynamically rendered based on available data", "Max width: 392px agent panel"],
  },
  {
    kind: "symptom_collector", family: "Summary", title: "Patient Reported",
    tpIcon: "clipboard-activity", iconsaxIcon: null,
    dataType: "SymptomCollectorData",
    features: ["Quick snapshot paragraph (italic, quoted)", "4 sections: Symptoms, Chronic Conditions, Meds, Questions", "Per-item hover copy with flash feedback", "Section-level copy-all"],
    copyActions: ["Fill all to RxPad", "Per-section fill", "Per-item fill with 'Filled' flash"],
    pillActions: ["Suggest DDX", "Initial investigations", "Ask me anything", "Show detailed summary", "Show last visit"],
    collapsible: true,
    constraints: ["Snapshot auto-generated from patient data", "New vs existing patient shows different pills", "Bold highlights: font-semibold not-italic for contrast in italic block"],
  },
  {
    kind: "last_visit", family: "Summary", title: "Last Visit Summary",
    tpIcon: "medical-record", iconsaxIcon: null,
    dataType: "LastVisitCardData",
    features: ["Section-wise breakdown (tag + icon + items)", "Section notes in italic", "Per-section copy"],
    copyActions: ["Fill all sections", "Per-section fill to RxPad"],
    pillActions: ["Compare previous visit"],
    collapsible: true,
    constraints: ["Only shown when lastVisit data exists", "Badge shows visitDate"],
  },
  {
    kind: "obstetric_summary", family: "Summary", title: "Obstetric Summary",
    tpIcon: "Obstetric", iconsaxIcon: null,
    dataType: "ObstetricData",
    features: ["3 InlineDataRow sections (Basic Info, ANC/Vaccines, Last Exam)", "Optional gravida badge"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Only rendered when specialty includes obstetric", "Badge format: G_P_L_A_E"],
  },
  {
    kind: "gynec_summary", family: "Summary", title: "Gynec Summary",
    tpIcon: "Gynec", iconsaxIcon: null,
    dataType: "GynecData",
    features: ["InlineDataRow for menstrual history", "InsightBox for alerts"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Only rendered when specialty includes gynec"],
  },
  {
    kind: "pediatric_summary", family: "Summary", title: "Pedia Summary",
    tpIcon: "health care", iconsaxIcon: null,
    dataType: "PediatricsData",
    features: ["Growth + vaccine InlineDataRows", "InsightBox for insights/alerts", "Sidebar links to growth chart, vaccine history"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Only rendered when patient is pediatric age (<18y)"],
  },
  {
    kind: "ophthal_summary", family: "Summary", title: "Ophthal Summary",
    tpIcon: "eye", iconsaxIcon: null,
    dataType: "OphthalData",
    features: ["3 InlineDataRow sections (OD, OS, Findings)", "InsightBox for alerts"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Only rendered when specialty includes ophthal"],
  },
  {
    kind: "med_history", family: "Summary", title: "Medication History",
    tpIcon: "pill", iconsaxIcon: null,
    dataType: "{ entries: MedHistoryEntry[]; insight: string }",
    features: ["Per-entry layout with source badges", "Date and diagnosis info", "InsightBox"],
    copyActions: ["Fill all medications"],
    pillActions: ["Other drug classes"],
    collapsible: true,
    constraints: ["Badge shows entry count", "Source: 'prescribed' or 'uploaded'"],
  },

  // ── Data Cards ──
  {
    kind: "lab_panel", family: "Data", title: "Lab Results",
    tpIcon: "Lab", iconsaxIcon: null,
    dataType: "LabPanelData",
    features: ["DataRow per flagged item", "InsightBox with red variant", "Badge shows flagged count"],
    copyActions: ["Fill flagged lab values"],
    pillActions: ["Compare prev", "HbA1c trend"],
    collapsible: true,
    constraints: ["Only flagged values shown by default", "Hidden normal count displayed in subtitle"],
  },
  {
    kind: "vitals_trend_bar", family: "Data", title: "Vital Trends (Bar)",
    tpIcon: "Heart Rate", iconsaxIcon: null,
    dataType: "{ title: string; series: VitalTrendSeries[] }",
    features: ["Custom SVG bar chart", "Trend indicators with tone-based colors", "Date shows total visits"],
    copyActions: ["Fill all vitals data"],
    pillActions: ["All vitals", "View line graph"],
    collapsible: true,
    constraints: ["Bar width auto-calculated based on data points"],
  },
  {
    kind: "vitals_trend_line", family: "Data", title: "Vital Trends (Line)",
    tpIcon: "Heart Rate", iconsaxIcon: null,
    dataType: "{ title: string; series: VitalTrendSeries[] }",
    features: ["SVG line chart with threshold line", "View toggle (graph/table)", "Interactive data points", "Legend"],
    copyActions: ["Fill all vitals data"],
    pillActions: ["Compare vitals", "All vitals"],
    collapsible: true,
    constraints: ["Threshold drawn as dashed line when provided", "Tone colors: danger=red, warning=amber, normal=blue"],
  },
  {
    kind: "lab_trend", family: "Data", title: "Lab Trend",
    tpIcon: "Lab", iconsaxIcon: null,
    dataType: "{ title: string; series: VitalTrendSeries[]; parameterName: string }",
    features: ["Line chart with graph/table toggle", "Threshold highlighting", "Per-point color coding"],
    copyActions: ["Fill trend data"],
    pillActions: ["Compare labs", "All lab values"],
    collapsible: true,
    constraints: ["Single parameter trend (e.g. HbA1c over time)"],
  },
  {
    kind: "lab_comparison", family: "Data", title: "Lab Comparison",
    tpIcon: "Lab", iconsaxIcon: null,
    dataType: "{ rows: LabComparisonRow[]; insight: string }",
    features: ["Table: parameter, previous, current, delta", "Direction arrows", "Delta highlighting", "InsightBox"],
    copyActions: ["Fill comparison data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Rows sorted by clinical significance"],
  },

  // ── Action Cards ──
  {
    kind: "ddx", family: "Action", title: "Differential Diagnosis",
    tpIcon: "Diagnosis", iconsaxIcon: null,
    dataType: "{ context: string; options: DDXOption[] }",
    features: ["3 buckets: CANT MISS / MOST LIKELY / CONSIDER", "Checkboxes for selection", "Reasoning basis", "Cascade generation"],
    copyActions: ["Fill selected diagnoses", "Fill all to RxPad"],
    pillActions: [],
    collapsible: true,
    constraints: ["Bucket colors: cant_miss=red, most_likely=blue, consider=slate", "Subtitle: 'Ranked by clinical probability'"],
  },
  {
    kind: "protocol_meds", family: "Action", title: "Suggested Rx",
    tpIcon: "pill", iconsaxIcon: null,
    dataType: "{ diagnosis: string; meds: ProtocolMed[]; safetyCheck: string; copyPayload: RxPadCopyPayload }",
    features: ["Diagnosis context box", "Safety check line", "Per-medication copy icons"],
    copyActions: ["Fill all to RxPad via payload"],
    pillActions: [],
    collapsible: true,
    constraints: ["Safety check shows tick or warning icon", "Allergy-aware: excludes conflicting drugs"],
  },
  {
    kind: "investigation_bundle", family: "Action", title: "Investigations",
    tpIcon: "Lab", iconsaxIcon: null,
    dataType: "{ title: string; items: InvestigationItem[]; copyPayload: RxPadCopyPayload }",
    features: ["CheckboxRow per investigation", "Rationale field per item", "Selective copy"],
    copyActions: ["Fill selected to RxPad"],
    pillActions: [],
    collapsible: true,
    constraints: ["Title includes context (e.g. 'Knee Pain Workup')"],
  },
  {
    kind: "follow_up", family: "Action", title: "Suggested Follow-Up",
    tpIcon: "medical-record", iconsaxIcon: null,
    dataType: "{ context: string; options: FollowUpOption[] }",
    features: ["Context line", "Option pills with recommended highlighting", "Reason InsightBox"],
    copyActions: ["Fill recommended option"],
    pillActions: ["One pill per option"],
    collapsible: true,
    constraints: ["Recommended option visually highlighted", "Options sorted by days"],
  },
  {
    kind: "advice_bundle", family: "Action", title: "Patient Advice",
    tpIcon: "clipboard-activity", iconsaxIcon: null,
    dataType: "{ title: string; items: string[]; shareMessage: string; copyPayload: RxPadCopyPayload }",
    features: ["Bullet list of advice items", "Per-item copy with feedback", "Share via WhatsApp button"],
    copyActions: ["Fill all to RxPad", "Per-item fill"],
    pillActions: ["Share via WhatsApp", "Schedule follow-up"],
    collapsible: true,
    constraints: ["Share message is pre-formatted for WhatsApp"],
  },
  {
    kind: "voice_structured_rx", family: "Action", title: "Structured Transcript",
    tpIcon: null, iconsaxIcon: "Microphone2",
    dataType: "VoiceStructuredRxData",
    features: ["Show/hide original voice text toggle", "Structured sections with TPMedicalIcon", "Per-section and per-item copy"],
    copyActions: ["Fill all structured data", "Per-section fill"],
    pillActions: ["Re-dictate"],
    collapsible: true,
    constraints: ["Badge: 'Just now'", "Sections use TPMedicalIcon for section-specific icons"],
  },

  // ── Analysis Cards ──
  {
    kind: "ocr_pathology", family: "Analysis", title: "Lab Report OCR",
    tpIcon: "Lab", iconsaxIcon: null,
    dataType: "{ title: string; category: string; parameters: OCRParameter[]; normalCount: number; insight: string }",
    features: ["DataRow per flagged parameter", "Toggle for normal values", "Per-parameter copy to Lab Results", "InsightBox"],
    copyActions: ["Full copy to Lab Results", "Per-parameter copy"],
    pillActions: ["Compare with previous"],
    collapsible: true,
    constraints: ["Badge shows flagged count", "Normal values hidden by default"],
  },
  {
    kind: "ocr_extraction", family: "Analysis", title: "Document OCR",
    tpIcon: "medical-record", iconsaxIcon: null,
    dataType: "{ title: string; category: string; sections: OCRSection[]; insight: string }",
    features: ["Section-wise extraction with icons", "Per-section and per-item copy", "InsightBox purple variant"],
    copyActions: ["Section-level copy", "Per-item copy"],
    pillActions: ["View original (ExternalButton)"],
    collapsible: true,
    constraints: ["Badge: 'Auto-Analyzed'"],
  },

  // ── Safety Cards ──
  {
    kind: "drug_interaction", family: "Safety", title: "Drug Interaction",
    tpIcon: "first-aid", iconsaxIcon: null,
    dataType: "DrugInteractionData",
    features: ["Alert box styling", "Severity level display", "Risk and action text", "Acknowledge button"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Severity: CRITICAL/HIGH/MODERATE/LOW", "Uses DANGER badge (tp-error) instead of header variant", "Acknowledge button has state tracking"],
  },
  {
    kind: "allergy_conflict", family: "Safety", title: "Allergy Conflict",
    tpIcon: "first-aid", iconsaxIcon: null,
    dataType: "AllergyConflictData",
    features: ["Drug to Allergen display", "Contraindicated badge", "Alternative suggestion box", "Override button"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Uses DANGER badge (tp-error) instead of header variant", "Override requires explicit acknowledgment"],
  },

  // ── Utility Cards ──
  {
    kind: "completeness", family: "Utility", title: "Documentation Check",
    tpIcon: "clipboard-activity", iconsaxIcon: null,
    dataType: "{ sections: CompletenessSection[]; emptyCount: number }",
    features: ["Checkmark/circle status per section", "Section count display", "Context-aware pills"],
    copyActions: [], pillActions: ["Suggest inv", "Advice", "Follow-up"],
    collapsible: true,
    constraints: ["Badge shows empty count", "Pills dynamically generated based on which sections are empty"],
  },
  {
    kind: "translation", family: "Utility", title: "Translation",
    tpIcon: "clipboard-activity", iconsaxIcon: null,
    dataType: "TranslationData & { copyPayload: RxPadCopyPayload }",
    features: ["Source and target language sections", "Highlighted background", "Side-by-side comparison"],
    copyActions: ["Fill translation"],
    pillActions: ["Hindi", "Tamil", "Telugu"],
    collapsible: true,
    constraints: ["Title shows target language name"],
  },
  {
    kind: "follow_up_question", family: "Utility", title: "Follow-Up Question",
    tpIcon: "Diagnosis", iconsaxIcon: null,
    dataType: "{ question: string; options: string[]; multiSelect: boolean }",
    features: ["CheckboxRow for multi-select", "RadioRow for single-select", "Submit button"],
    copyActions: ["Submit selected answers"], pillActions: [],
    collapsible: true,
    constraints: ["Title is the question text", "Conditional rendering based on multiSelect"],
  },

  // ── Text Cards ──
  {
    kind: "text_fact", family: "Text", title: "Quick Fact",
    tpIcon: null, iconsaxIcon: null,
    dataType: "{ value: string; context: string; source: string }",
    features: ["Inline text response"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Rendered inline within chat bubble, not as standalone card"],
  },
  {
    kind: "text_alert", family: "Text", title: "Alert",
    tpIcon: null, iconsaxIcon: null,
    dataType: "{ message: string; severity: string }",
    features: ["Alert text with severity indicator"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Rendered inline within chat"],
  },
  {
    kind: "text_list", family: "Text", title: "List",
    tpIcon: null, iconsaxIcon: null,
    dataType: "{ items: string[] }",
    features: ["Bullet list response"],
    copyActions: [], pillActions: [],
    collapsible: true,
    constraints: ["Rendered inline within chat"],
  },

  // ── Homepage Cards ──
  {
    kind: "welcome_card", family: "Homepage", title: "Today's Schedule",
    tpIcon: null, iconsaxIcon: "Calendar",
    dataType: "WelcomeCardData",
    features: ["2x2 stats grid with colored stat blocks", "Quick action pills", "Clickable stat buttons"],
    copyActions: [], pillActions: ["Show today's queue", "Pending follow-ups", "Revenue overview", "Draft prescriptions"],
    collapsible: true,
    constraints: ["Always first card on homepage", "Stats: Queued, Finished, Drafts, Cancelled, P.Digitisation", "Date shown as subtitle"],
  },
  {
    kind: "patient_list", family: "Homepage", title: "Patient Queue",
    tpIcon: "clipboard-activity", iconsaxIcon: null,
    dataType: "PatientListCardData",
    features: ["Patient rows with gender/age/time", "Status tone badges", "'View all' link"],
    copyActions: ["Fill patient list"],
    pillActions: [],
    collapsible: true,
    constraints: ["Badge shows total count", "Gender avatar (M/F initials)"],
  },
  {
    kind: "follow_up_list", family: "Homepage", title: "Follow-Up Queue",
    tpIcon: null, iconsaxIcon: "Calendar2",
    dataType: "FollowUpListCardData",
    features: ["Follow-up list with overdue highlight", "Per-item Remind button", "Bulk send button"],
    copyActions: ["Fill follow-up list"],
    pillActions: [],
    collapsible: true,
    constraints: ["Badge shows overdue count", "Overdue items use error-50 bg"],
  },
  {
    kind: "revenue_bar", family: "Homepage", title: "Revenue Tracker",
    tpIcon: "health-file-02", iconsaxIcon: null,
    dataType: "RevenueBarCardData",
    features: ["SVG stacked bar chart", "Paid (green) vs Due (orange)", "Excel download"],
    copyActions: ["Fill revenue data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Download generates .xlsx file"],
  },
  {
    kind: "donut_chart", family: "Homepage", title: "Donut Chart",
    tpIcon: null, iconsaxIcon: "Chart",
    dataType: "DonutChartCardData",
    features: ["Conic-gradient donut", "Center label with total", "Legend with percentages"],
    copyActions: ["Fill chart data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Conic-gradient CSS (no SVG)"],
  },
  {
    kind: "pie_chart", family: "Homepage", title: "Pie Chart",
    tpIcon: null, iconsaxIcon: "Chart",
    dataType: "PieChartCardData",
    features: ["Conic-gradient pie", "Legend with values and percentages"],
    copyActions: ["Fill chart data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Conic-gradient CSS"],
  },
  {
    kind: "line_graph", family: "Homepage", title: "Line Graph",
    tpIcon: null, iconsaxIcon: "TrendUp",
    dataType: "LineGraphCardData",
    features: ["SVG line graph with 4+ points", "Average dashed line", "Trend indicator badge"],
    copyActions: ["Fill trend data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Badge shows trend direction + percentage", "Excel download available"],
  },
  {
    kind: "analytics_table", family: "Homepage", title: "KPI Table",
    tpIcon: null, iconsaxIcon: "StatusUp",
    dataType: "AnalyticsTableCardData",
    features: ["4-column table (Metric/This Week/Last Week/Change)", "Delta indicators with color", "KPI insight box"],
    copyActions: ["Fill KPI data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Excel download available", "Delta colors: green=positive, red=negative"],
  },
  {
    kind: "condition_bar", family: "Homepage", title: "Condition Bar",
    tpIcon: "medical-record", iconsaxIcon: null,
    dataType: "ConditionBarCardData",
    features: ["Horizontal bar chart", "Max count label"],
    copyActions: ["Fill condition data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Excel download available"],
  },
  {
    kind: "heatmap", family: "Homepage", title: "Heatmap",
    tpIcon: null, iconsaxIcon: "Calendar2",
    dataType: "HeatmapCardData",
    features: ["Grid heatmap (rows x cols)", "Intensity color coding (low/medium/high)", "Legend"],
    copyActions: ["Fill heatmap data"],
    pillActions: [],
    collapsible: true,
    constraints: ["Intensity colors: low=#EDF8F1, medium=#FEF6E7, high=#FDEDED", "Excel download available"],
  },
  {
    kind: "bulk_action", family: "Homepage", title: "Bulk Action",
    tpIcon: null, iconsaxIcon: "Flash",
    dataType: "BulkActionCardData",
    features: ["Message preview", "Recipients list (max 3 + remainder)", "Confirm/Cancel buttons"],
    copyActions: [],
    pillActions: [],
    collapsible: true,
    constraints: ["Uses ACTION badge (tp-warning) instead of header variant", "Confirm changes to success state"],
  },
  {
    kind: "external_cta", family: "Homepage", title: "External CTA",
    tpIcon: null, iconsaxIcon: "Link1",
    dataType: "ExternalCtaCardData",
    features: ["Single-line description", "One primary CTA link", "Opens external file/page (Excel/Word/etc.)"],
    copyActions: [],
    pillActions: [],
    collapsible: true,
    constraints: ["Used for export-only responses", "CTA can open in new tab", "No extra chart/table content"],
  },
]

// ═══════ INTENT MAPPING ═══════

interface IntentRoute {
  intent: string
  format: string
  context: string
  cardKinds: string[]
  triggers: string[]
}

const INTENT_MAP: IntentRoute[] = [
  {
    intent: "data_retrieval", format: "card", context: "Patient",
    cardKinds: ["patient_summary", "last_visit", "lab_panel", "vitals_trend_line", "vitals_trend_bar", "lab_comparison", "lab_trend", "med_history"],
    triggers: ["summary", "snapshot", "last visit", "labs", "vitals", "trend", "medication history"],
  },
  {
    intent: "clinical_decision", format: "card", context: "Patient",
    cardKinds: ["ddx", "protocol_meds", "investigation_bundle", "follow_up", "advice_bundle"],
    triggers: ["suggest DDX", "differential", "medications", "investigations", "advice", "follow-up"],
  },
  {
    intent: "action", format: "hybrid", context: "Patient",
    cardKinds: ["translation", "voice_structured_rx", "completeness"],
    triggers: ["translate", "voice rx", "completeness check", "copy to RxPad"],
  },
  {
    intent: "comparison", format: "card", context: "Patient",
    cardKinds: ["lab_comparison", "vitals_trend_line", "lab_trend"],
    triggers: ["compare", "trend", "graph", "change over time"],
  },
  {
    intent: "document_analysis", format: "card", context: "Patient",
    cardKinds: ["ocr_pathology", "ocr_extraction"],
    triggers: ["upload", "scan", "OCR", "analyze report"],
  },
  {
    intent: "operational", format: "card", context: "Homepage",
    cardKinds: ["patient_list", "follow_up_list", "revenue_bar", "donut_chart", "pie_chart", "line_graph", "analytics_table", "condition_bar", "heatmap", "bulk_action", "external_cta"],
    triggers: ["queue", "follow-ups", "revenue", "demographics", "diagnosis distribution", "footfall", "KPIs", "conditions", "busiest hours", "send SMS", "excel export", "word export"],
  },
  {
    intent: "clinical_question", format: "text", context: "Either",
    cardKinds: ["text_fact", "text_alert", "text_list"],
    triggers: ["what is", "how does", "dose of", "interaction between"],
  },
  {
    intent: "follow_up", format: "card", context: "Patient",
    cardKinds: ["follow_up_question"],
    triggers: ["which one", "select", "pick one"],
  },
]

// ═══════ PILL SYSTEM ═══════

interface PillLayer {
  layer: number
  name: string
  priority: string
  description: string
  examples: string[]
  force: boolean
}

const PILL_LAYERS: PillLayer[] = [
  {
    layer: 1, name: "Safety Force", priority: "0-2",
    description: "Always shown if condition met. Cannot be displaced by other pills.",
    examples: ["Review SpO2 (SpO2 < 90%)", "Allergy Alert (allergies present)"],
    force: true,
  },
  {
    layer: 2, name: "Clinical Flags", priority: "10-26",
    description: "Data-driven alerts from lab flags, vitals, follow-up status, and specialty data.",
    examples: ["X lab values flagged (3+ flags)", "Follow-up overdue Xd", "SpO2 trend declining", "BP needs attention", "Temperature elevated", "Obstetric/Gynec/Growth/Vision summary"],
    force: false,
  },
  {
    layer: 3, name: "Consultation Phase", priority: "30-36",
    description: "Phase-dependent workflow pills. Change as doctor progresses through consultation.",
    examples: ["empty: Patient summary + Suggest DDX + Initial investigations", "symptoms_entered: Suggest DDX + Compare with last visit", "dx_accepted: Suggest medications + Suggest investigations", "meds_written: Generate advice + Translate to regional", "near_complete: Completeness check + Translate advice"],
    force: false,
  },
  {
    layer: 4, name: "Tab Lens", priority: "60-62",
    description: "Context-specific pills based on which RxPad sidebar tab is active.",
    examples: ["past-visits: Compare visits, Recurrence check", "vitals: Vital trends, Graph view", "lab-results: Lab comparison, Annual panel", "medical-records: OCR analysis, Report extract"],
    force: false,
  },
]

// ═══════ INTERACTION PATTERNS ═══════

interface InteractionPattern {
  pattern: string
  description: string
  implementation: string
  tokens: string
}

const INTERACTIONS: InteractionPattern[] = [
  {
    pattern: "Fill All",
    description: "Copy icon next to title. Tooltip on hover with actionable label.",
    implementation: "CardShell.copyAll prop + ActionableTooltip wrapper",
    tokens: "Icon: 11px, Linear/Bulk toggle on hover, color: slate-400 -> blue-500",
  },
  {
    pattern: "Per-Item Copy",
    description: "Hover over individual item shows copy icon. 'Copied' flash feedback for 1.2s.",
    implementation: "group/hover with opacity-0 -> opacity-100 transition",
    tokens: "Flash text: 10px, tp-success-500, font-medium",
  },
  {
    pattern: "Collapse/Expand",
    description: "ChevronDown/Up toggle in header. Body hidden when collapsed.",
    implementation: "CardShell.collapsible + defaultCollapsed props",
    tokens: "Button: 22x22px, rounded-6px, border slate-200, bg slate-50",
  },
  {
    pattern: "Excel Download",
    description: "DocumentDownload icon with tooltip. Generates .xlsx file.",
    implementation: "CardShell.onDownload + downloadAsExcel utility",
    tokens: "Icon: 11px, Linear, color: slate-400 -> green-600 on hover",
  },
  {
    pattern: "AI Action Pills",
    description: "Gradient-text pills at card bottom. Horizontal scroll overflow.",
    implementation: "ChatPillButton with AI_PILL_* constants",
    tokens: "Height: 26px, px: 14px, radius: full, text: 11px, AI gradient text",
  },
  {
    pattern: "Fill Button (Blue)",
    description: "Outlined blue button for primary fill actions (Fill to RxPad).",
    implementation: "CopyButton component",
    tokens: "Height: 26px, border: 1.5px blue-500, bg: blue-50, text: 11px blue-500",
  },
  {
    pattern: "External Button",
    description: "Outlined blue button for external links (View original).",
    implementation: "ExternalButton component",
    tokens: "Height: 26px, border: 1.5px blue-500, bg: transparent, text: 11px blue-500",
  },
  {
    pattern: "Sidebar Link",
    description: "Persistent link below card body to navigate to related sidebar tab.",
    implementation: "CardShell.sidebarLink prop, rendered below actions row with divider",
    tokens: "Border-t slate-100, px: 12px, py: 4px",
  },
  {
    pattern: "Badge",
    description: "Inline badge in header showing counts, dates, or status.",
    implementation: "CardShell.badge prop with {label, color, bg}",
    tokens: "Text: 10px/600, px: 6px, py: 1px, radius: 4px",
  },
  {
    pattern: "InsightBox",
    description: "Highlighted insight/alert box within card body.",
    implementation: "InsightBox component with variant prop",
    tokens: "Variants: red (error-50), amber (warning-50), purple (violet-50), teal (success-50). Text: 11px/500",
  },
  {
    pattern: "Acknowledge Button",
    description: "Safety cards (drug interaction, allergy conflict) require explicit acknowledgment.",
    implementation: "Stateful button with confirmed state tracking",
    tokens: "Transitions from warning/danger to success state",
  },
]

// ═══════ COMPONENT ═══════

function TokenSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-5 w-5 rounded border border-slate-200 flex-shrink-0" style={{ background: color }} />
      <span className="text-[10px] text-slate-600">{label}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-[14px] font-bold text-slate-800">{children}</h3>
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-2 text-[12px] font-bold text-violet-600 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  )
}

export default function DesignSystemTab() {
  return (
    <div className="space-y-10">
      {/* ─── 1. Design Foundation ─── */}
      <section>
        <SectionTitle>1. Design Foundation</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Colors */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <SubSection title="Core Colors">
              <div className="grid grid-cols-2 gap-2">
                {Object.values(TOKENS.colors).map(c => (
                  <TokenSwatch key={c.label} color={c.value} label={c.label} />
                ))}
              </div>
            </SubSection>
          </div>

          {/* Typography */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <SubSection title="Typography Scale">
              <div className="space-y-1">
                {TOKENS.typography.map(t => (
                  <div key={t.token} className="flex items-baseline gap-2">
                    <code className="flex-shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[8px] font-mono text-violet-600">{t.token}</code>
                    <span className="text-[9px] text-slate-500">{t.size}/{t.weight}</span>
                    <span className="text-[9px] text-slate-400 truncate">{t.usage}</span>
                  </div>
                ))}
              </div>
            </SubSection>
          </div>

          {/* Spacing */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <SubSection title="Spacing Tokens">
              <div className="space-y-1">
                {TOKENS.spacing.map(s => (
                  <div key={s.token} className="flex items-baseline gap-2">
                    <code className="flex-shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[8px] font-mono text-violet-600">{s.token}</code>
                    <span className="text-[9px] font-mono text-slate-500">{s.value}</span>
                    <span className="text-[9px] text-slate-400 truncate">{s.usage}</span>
                  </div>
                ))}
              </div>
            </SubSection>
          </div>
        </div>
      </section>

      {/* ─── 2. CardShell Architecture ─── */}
      <section>
        <SectionTitle>2. CardShell Architecture</SectionTitle>
        <p className="mb-3 text-[11px] text-slate-500">
          Every UI card extends <code className="rounded bg-slate-100 px-1 text-violet-600">CardShell</code>.
          It provides the header (icon + title + badge + copy + collapse), body container, action pills row, and optional sidebar link.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Anatomy */}
            <div>
              <h5 className="mb-2 text-[11px] font-bold text-slate-700">Card Anatomy</h5>
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center gap-2 rounded bg-blue-50 p-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-[10px] font-bold">1</span>
                  <div>
                    <span className="font-semibold text-slate-700">Header</span>
                    <span className="text-slate-500"> — Icon (24x24) + Title (12px/600) + Fill + Badge + Collapse</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded bg-slate-50 p-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold">2</span>
                  <div>
                    <span className="font-semibold text-slate-700">Body</span>
                    <span className="text-slate-500"> — Card-specific content (px:12, py:8)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded bg-violet-50 p-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-violet-600 text-[10px] font-bold">3</span>
                  <div>
                    <span className="font-semibold text-slate-700">Actions</span>
                    <span className="text-slate-500"> — AI gradient pills (h:26px, horizontal scroll)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded bg-green-50 p-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-green-600 text-[10px] font-bold">4</span>
                  <div>
                    <span className="font-semibold text-slate-700">Sidebar Link</span>
                    <span className="text-slate-500"> — Optional deep link to sidebar tab</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Icon Pattern */}
            <div>
              <h5 className="mb-2 text-[11px] font-bold text-slate-700">Icon Pattern (Unified)</h5>
              <div className="space-y-2 text-[10px]">
                <div className="rounded bg-blue-50 p-3">
                  <p className="font-semibold text-blue-700 mb-1">TP Medical Icon (Primary)</p>
                  <p className="text-slate-600">When tpIconName resolves in registry:</p>
                  <code className="block mt-1 text-[9px] text-violet-600 bg-white rounded p-1.5 leading-relaxed">
                    bg: var(--tp-blue-50)<br/>
                    icon: TPMedicalIcon size=14 color=var(--tp-blue-500)
                  </code>
                </div>
                <div className="rounded bg-blue-50 p-3">
                  <p className="font-semibold text-blue-700 mb-1">Iconsax Fallback</p>
                  <p className="text-slate-600">When no TP icon available (Calendar, Microphone2, etc.):</p>
                  <code className="block mt-1 text-[9px] text-violet-600 bg-white rounded p-1.5 leading-relaxed">
                    iconBg: always tp-blue-50 (rgba(59,130,246,0.08))<br/>
                    icon: Iconsax size=14 variant=Bulk color=var(--tp-blue-500)
                  </code>
                </div>
                <div className="rounded bg-slate-50 p-3">
                  <p className="font-semibold text-slate-700 mb-1">Header Variants Removed</p>
                  <p className="text-slate-600">headerVariant prop removed. All cards use default blue header. Danger/warning intent now conveyed via badge color (tp-error / tp-warning) instead of header gradient.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Props Table */}
          <div className="mt-4">
            <h5 className="mb-2 text-[11px] font-bold text-slate-700">CardShell Props</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-600">Prop</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-600">Type</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-600">Default</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["icon", "ReactNode", "required", "Iconsax/Lucide icon element (fallback when no tpIconName)"],
                    ["iconBg", "string", "tp-blue-50", "Deprecated — always uses tp-blue-50 (rgba(59,130,246,0.08))"],
                    ["tpIconName", "string?", "—", "TP Medical Icon registry name. When set, overrides icon+iconBg with blue pattern"],
                    ["title", "string", "required", "Card header title (12px/600)"],
                    ["date", "string?", "—", "Subtitle below title (10px/400, slate-400)"],
                    ["badge", "{label,color,bg}?", "—", "Inline badge in header (10px/600)"],
                    ["copyAll", "() => void?", "—", "Adds Copy icon with ActionableTooltip"],
                    ["copyAllTooltip", "string?", "—", "Tooltip label for copy-all icon"],
                    ["onDownload", "() => void?", "—", "Adds DocumentDownload icon (xlsx export)"],
                    ["collapsible", "boolean", "true", "Shows ChevronDown/Up toggle button"],
                    ["defaultCollapsed", "boolean", "false", "Initial collapsed state"],
                    ["actions", "ReactNode?", "—", "Action pills row (horizontal scroll)"],
                    ["sidebarLink", "ReactNode?", "—", "Link below actions with top border divider"],
                  ].map(([prop, type, def, desc]) => (
                    <tr key={prop} className="border-t border-slate-100">
                      <td className="px-2 py-1.5 font-mono text-violet-600">{prop}</td>
                      <td className="px-2 py-1.5 text-slate-500">{type}</td>
                      <td className="px-2 py-1.5 text-slate-400">{def}</td>
                      <td className="px-2 py-1.5 text-slate-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Live Card Catalog ─── */}
      <section>
        <SectionTitle>3. Live Card Catalog ({CARD_CATALOG.length} card variants)</SectionTitle>
        <p className="mb-3 text-[11px] text-slate-500">
          Every card below is rendered with the same components used inside Dr. Agent. Hover, collapse, copy, and interact with them exactly as they appear in the chatbot.
        </p>
        <CardCatalogLive />
      </section>

      {/* ─── 4. Intent to Card Flow ─── */}
      <section>
        <SectionTitle>4. Intent Classification to Card Flow</SectionTitle>
        <p className="mb-3 text-[11px] text-slate-500">
          User input flows through intent-engine.ts to classify intent, then reply-engine.ts (patient context) or homepage-reply-engine.ts (homepage) generates the appropriate card output.
        </p>

        {/* Flow diagram */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-[10px]">
            <div className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-700">User Query</div>
            <span className="text-slate-400">&rarr;</span>
            <div className="rounded-lg bg-violet-50 px-3 py-2 font-semibold text-violet-700">classifyIntent()</div>
            <span className="text-slate-400">&rarr;</span>
            <div className="rounded-lg bg-green-50 px-3 py-2 font-semibold text-green-700">
              <div>Homepage: buildHomepageReply()</div>
              <div className="text-[9px] font-normal text-green-600 mt-0.5">Patient: buildReply()</div>
            </div>
            <span className="text-slate-400">&rarr;</span>
            <div className="rounded-lg bg-amber-50 px-3 py-2 font-semibold text-amber-700">Card Output</div>
            <span className="text-slate-400">+</span>
            <div className="rounded-lg bg-pink-50 px-3 py-2 font-semibold text-pink-700">generatePills()</div>
          </div>
        </div>

        {/* Intent mapping table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Intent</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Format</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Context</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Card Kinds</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Trigger Keywords</th>
              </tr>
            </thead>
            <tbody>
              {INTENT_MAP.map(route => (
                <tr key={route.intent} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono font-semibold text-violet-600">{route.intent}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${route.format === "card" ? "bg-blue-50 text-blue-700" : route.format === "text" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>
                      {route.format}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{route.context}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {route.cardKinds.map(k => (
                        <code key={k} className="rounded bg-slate-100 px-1 py-0.5 text-[8px] font-mono text-violet-600">{k}</code>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{route.triggers.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 5. Pill System ─── */}
      <section>
        <SectionTitle>5. Pill Priority System (4-Layer Pipeline)</SectionTitle>
        <p className="mb-3 text-[11px] text-slate-500">
          Pills are generated through a 4-layer priority pipeline. Each layer produces pills with specific priority ranges.
          Pills are deduplicated, sorted by priority (lowest = highest), and truncated to max 4. Layer 1 "force" pills are always shown.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {PILL_LAYERS.map(layer => (
            <div key={layer.layer} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">
                  L{layer.layer}
                </span>
                <span className="text-[12px] font-bold text-slate-700">{layer.name}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
                  P: {layer.priority}
                </span>
                {layer.force && (
                  <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">FORCE</span>
                )}
              </div>
              <p className="mb-2 text-[10px] text-slate-500">{layer.description}</p>
              <div className="space-y-0.5">
                {layer.examples.map(ex => (
                  <div key={ex} className="text-[10px] text-slate-600">{"\u2022"} {ex}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pill design tokens */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <h5 className="mb-2 text-[11px] font-bold text-slate-700">Pill Design Tokens</h5>
          <div className="grid gap-3 sm:grid-cols-3 text-[10px]">
            <div>
              <span className="font-bold text-slate-600">ChatPillButton (AI Gradient)</span>
              <div className="mt-1 space-y-0.5 text-slate-500">
                <div>Height: 26px, Radius: full</div>
                <div>Padding: 14px horizontal</div>
                <div>Text: 11px/400, AI gradient fill</div>
                <div>Border: 1px rgba(103,58,172,0.15)</div>
                <div>Bg: AI_PILL_BG (8% gradient)</div>
                <div>Hover: AI_PILL_BG_HOVER (14% gradient)</div>
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-600">CopyButton (Blue Outlined)</span>
              <div className="mt-1 space-y-0.5 text-slate-500">
                <div>Height: 26px, Radius: full</div>
                <div>Border: 1.5px blue-500</div>
                <div>Bg: blue-50 (hover: blue-100)</div>
                <div>Text: 11px/500, blue-500</div>
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-600">ExternalButton (Blue Ghost)</span>
              <div className="mt-1 space-y-0.5 text-slate-500">
                <div>Height: 26px, Radius: full</div>
                <div>Border: 1.5px blue-500</div>
                <div>Bg: transparent (hover: blue-50)</div>
                <div>Text: 11px/500, blue-500</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Interaction Patterns ─── */}
      <section>
        <SectionTitle>6. Interaction Patterns</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTERACTIONS.map(item => (
            <div key={item.pattern} className="rounded-xl border border-slate-200 bg-white p-3">
              <h5 className="mb-1 text-[11px] font-bold text-slate-700">{item.pattern}</h5>
              <p className="text-[10px] text-slate-500 mb-1">{item.description}</p>
              <div className="text-[9px]">
                <span className="font-medium text-violet-600">Implementation:</span>
                <span className="text-slate-500"> {item.implementation}</span>
              </div>
              <div className="text-[9px] mt-0.5">
                <span className="font-medium text-violet-600">Tokens:</span>
                <span className="text-slate-500"> {item.tokens}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. Layout & Responsiveness ─── */}
      <section>
        <SectionTitle>7. Layout and Responsiveness</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h5 className="mb-2 text-[11px] font-bold text-slate-700">Agent Panel Constraints</h5>
            <div className="space-y-1 text-[10px] text-slate-600">
              <div>{"\u2022"} Panel width: 392px (fixed, not responsive)</div>
              <div>{"\u2022"} Cards fill 100% of panel width minus 12px padding each side</div>
              <div>{"\u2022"} SVG charts auto-scale to available width</div>
              <div>{"\u2022"} Text truncation with CSS truncate class on long titles</div>
              <div>{"\u2022"} Action pills: horizontal overflow-x-auto scroll</div>
              <div>{"\u2022"} No breakpoint-based responsive design within panel</div>
              <div>{"\u2022"} iPad: Panel shows as slideover from right edge</div>
              <div>{"\u2022"} Desktop: Panel docked on right side of RxPad</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h5 className="mb-2 text-[11px] font-bold text-slate-700">Shadow & Elevation</h5>
            <div className="space-y-1 text-[10px] text-slate-600">
              <div>{"\u2022"} Card shadow: 0 1px 3px rgba(23,23,37,0.04), 0 0 0 0.5px rgba(23,23,37,0.06)</div>
              <div>{"\u2022"} Card radius: 12px outer</div>
              <div>{"\u2022"} No card-within-card nesting (flat hierarchy)</div>
              <div>{"\u2022"} Body sections: bg-tp-slate-50 for sub-blocks</div>
              <div>{"\u2022"} InsightBox: colored bg (variant-specific) + rounded-8px</div>
              <div>{"\u2022"} All borders: 1px solid tp-slate-200 (or variant color)</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h5 className="mb-2 text-[11px] font-bold text-slate-700">AI Gradient System</h5>
            <div className="space-y-1 text-[10px] text-slate-600">
              <div>{"\u2022"} Primary gradient: linear-gradient(91deg, #D565EA 3%, #673AAC 67%, #1A1994 130%)</div>
              <div>{"\u2022"} Soft bg: 8% opacity gradient (pills, highlights)</div>
              <div>{"\u2022"} Border: 30% opacity gradient</div>
              <div>{"\u2022"} Text: gradient fill via WebkitBackgroundClip + WebkitTextFillColor</div>
              <div>{"\u2022"} Used in: pills, canned pill bar, agent header spark icon</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h5 className="mb-2 text-[11px] font-bold text-slate-700">Font Size Contract</h5>
            <div className="space-y-1 text-[10px] text-slate-600">
              <div>{"\u2022"} Body text: 12px (text-[12px])</div>
              <div>{"\u2022"} Card headings: 12px (max 14px)</div>
              <div>{"\u2022"} Chips/pills: 10-11px</div>
              <div>{"\u2022"} Tooltips: 10px</div>
              <div>{"\u2022"} Badges: 10px</div>
              <div>{"\u2022"} Chart labels: 8-9px</div>
              <div>{"\u2022"} NO responsive font sizing. All fixed px values.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Downloadable Reference ─── */}
      <section>
        <SectionTitle>8. Export Reference</SectionTitle>
        <p className="mb-3 text-[11px] text-slate-500">
          Copy the raw JSON below to feed into your design system file. Contains complete card catalog, tokens, intent mapping, and interaction patterns.
        </p>
        <DownloadableJSON />
      </section>
    </div>
  )
}

// ═══════ DOWNLOADABLE JSON ═══════

function DownloadableJSON() {
  const [copied, setCopied] = useState(false)

  const exportData = {
    version: "1.0.0",
    name: "Dr. Agent UI Card Design System",
    generatedAt: new Date().toISOString().split("T")[0],
    designTokens: TOKENS,
    cardCatalog: CARD_CATALOG.map(c => ({
      kind: c.kind,
      family: c.family,
      title: c.title,
      icon: c.tpIcon ? { source: "tp-medical", name: c.tpIcon } : c.iconsaxIcon ? { source: "iconsax", name: c.iconsaxIcon } : null,
      dataType: c.dataType,
      features: c.features,
      copyActions: c.copyActions,
      pillActions: c.pillActions,
      collapsible: c.collapsible,
      constraints: c.constraints,
    })),
    intentMapping: INTENT_MAP.map(r => ({
      intent: r.intent,
      format: r.format,
      context: r.context,
      cardKinds: r.cardKinds,
      triggers: r.triggers,
    })),
    pillSystem: {
      maxPills: 4,
      layers: PILL_LAYERS.map(l => ({
        layer: l.layer,
        name: l.name,
        priorityRange: l.priority,
        force: l.force,
        description: l.description,
        examples: l.examples,
      })),
    },
    interactionPatterns: INTERACTIONS.map(i => ({
      pattern: i.pattern,
      description: i.description,
      implementation: i.implementation,
      tokens: i.tokens,
    })),
    cardShellProps: {
      icon: "ReactNode (required) — Fallback icon element",
      iconBg: "string — deprecated — always uses tp-blue-50",
      tpIconName: "string? — TP Medical Icon name (overrides icon+iconBg)",
      title: "string (required) — Header title",
      date: "string? — Subtitle below title",
      badge: "{label,color,bg}? — Inline status badge",
      copyAll: "() => void? — Adds copy icon in header",
      copyAllTooltip: "string? — Tooltip for copy icon",
      onDownload: "() => void? — Adds download icon",
      collapsible: "boolean (default: true)",
      defaultCollapsed: "boolean (default: false)",
      actions: "ReactNode? — Action pills row",
      sidebarLink: "ReactNode? — Deep link to sidebar tab",
    },
    aiGradient: {
      primary: "linear-gradient(91deg, #D565EA 3.04%, #673AAC 66.74%, #1A1994 130.45%)",
      soft: "8% opacity version for backgrounds",
      border: "30% opacity version for borders",
      textFill: "gradient fill via WebkitBackgroundClip",
    },
  }

  const jsonStr = JSON.stringify(exportData, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dr-agent-design-system.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
        <span className="text-[11px] font-semibold text-slate-700">dr-agent-design-system.json</span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-200"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-lg bg-violet-600 px-3 py-1 text-[10px] font-medium text-white transition-colors hover:bg-violet-700"
        >
          Download .json
        </button>
      </div>
      <pre className="max-h-[300px] overflow-auto p-4 text-[9px] leading-relaxed text-slate-600">
        {jsonStr}
      </pre>
    </div>
  )
}

"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUp2, Calendar2, Copy } from "iconsax-reactjs"

// ── Live Card Catalog + CardRenderer ──
import { CardCatalogLive, CATALOG, type CatalogEntry } from "@/app/tp-appointment-screen/scenarios/CardCatalogLive"
import { CardRenderer } from "@/components/tp-rxpad/dr-agent/cards/CardRenderer"
import { SectionTag, SECTION_TAG_ICON_MAP } from "@/components/tp-rxpad/dr-agent/cards/SectionTag"
import { FeedbackRow } from "@/components/tp-rxpad/dr-agent/cards/FeedbackRow"
import { DataCompletenessDonut } from "@/components/tp-rxpad/dr-agent/cards/DataCompletenessDonut"
import { SourceInfoIcon } from "@/components/tp-rxpad/dr-agent/cards/CardShell"
import { TPMedicalIcon } from "@/components/tp-ui"
import ClinicalFrameworkSection from "@/app/tp-appointment-screen/scenarios/ClinicalFrameworkSection"
import IntentClassificationSection from "@/app/tp-appointment-screen/scenarios/IntentClassificationSection"

// ═══════════════════════════════════════════════════════════════
// DR. AGENT — COMPREHENSIVE SYSTEM REFERENCE
// ═══════════════════════════════════════════════════════════════

type MainTab = "intent-classification" | "card-anatomy" | "card-catalog" | "response-management" | "user-scenarios"

// ── Helpers ──
const noop = () => {}

// Find a catalog entry by kind for live preview
function findCatalogCard(kind: string): CatalogEntry | undefined {
  return CATALOG.find(c => c.kind === kind)
}

// Render a live card preview without adding an extra shell around the real card
function LiveCardPreview({ kind, label, highlightZone }: { kind: string; label?: string; highlightZone?: "header" | "content" | "footer" }) {
  const entry = findCatalogCard(kind)
  if (!entry) return null
  return (
    <div className="relative">
      {label && <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>}
      <div className="relative overflow-visible">
        {/* Zone overlay labels */}
        {highlightZone && (
          <div className={`absolute right-0 top-0 z-10 rounded-bl-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            highlightZone === "header" ? "bg-blue-500 text-white" :
            highlightZone === "content" ? "bg-violet-500 text-white" :
            "bg-emerald-500 text-white"
          }`}>
            {highlightZone} zone
          </div>
        )}
        <div className="w-full max-w-[380px]">
          <CardRenderer
            output={entry.output}
            onPillTap={noop}
            onCopy={noop}
            onSidebarNav={noop}
          />
        </div>
      </div>
    </div>
  )
}

// ── CONTENT PRIMITIVES — all content types used in cards ──
type ContentPrimitive = {
  name: string
  description: string
  usedIn: string[]
  variations?: string[]
  fetchFrom?: string
  copyRule?: string
  uiRule?: string
  exampleCard: string // kind from CATALOG to show as live preview
}

// ── Content Zone Types (shared between Intent Classification and Card Anatomy) ──
const CONTENT_ZONE_TYPES_FOR_ANATOMY = [
  { zone: "Inline Data Rows", description: "Section-tagged key:value pairs. Most common pattern. For patient summaries, follows SBAR protocol as a structuring convention.", usedIn: "Patient summary (SBAR), Vitals, Last visit, Specialty summaries, Med history, OCR extraction", icon: "═" },
  { zone: "Flagged Data Rows", description: "Inline data rows with abnormal-value highlighting, reference ranges, and flag indicators (high/low/critical).", usedIn: "Lab panels, OCR pathology, Vitals (abnormal)", icon: "⚑" },
  { zone: "Line Chart", description: "Time-series visualization with threshold lines. Single-param: one line + ref band. Multi-param: overlaid lines.", usedIn: "Lab trends (HbA1c, eGFR), Vital trends (BP, SpO2)", icon: "📈" },
  { zone: "Bar Chart", description: "Categorical or time-bucketed comparisons with stacked or grouped segments.", usedIn: "Revenue, Multi-param vital trends, Condition distribution", icon: "📊" },
  { zone: "Comparison Table", description: "Side-by-side previous vs current with delta indicators and flags.", usedIn: "Lab comparison, Revenue comparison", icon: "⇔" },
  { zone: "Checkbox List", description: "Multi-select items with urgency or confidence tiers.", usedIn: "DDX (3-tier), Investigation bundle, Bulk actions", icon: "☑" },
  { zone: "Radio List", description: "Single-select options with recommended flags and reasoning.", usedIn: "Follow-up scheduling, Follow-up questions", icon: "◉" },
  { zone: "Bullet List", description: "Simple itemized content with optional copy-all action.", usedIn: "Advice bundle, Clinical guidelines, Text lists", icon: "•" },
  { zone: "Medication Display", description: "Drug name + dosage + timing + duration + safety notes.", usedIn: "Protocol meds, Rx preview, Med history, Voice structured Rx", icon: "💊" },
  { zone: "Patient List", description: "Name, age/gender, time, status badge, chief complaint rows.", usedIn: "Today's queue, Follow-up list, Due patients, Search results", icon: "👤" },
  { zone: "Donut / Pie Chart", description: "Proportional distribution visualization with labeled segments.", usedIn: "Demographics, Diagnosis breakdown, Data completeness", icon: "◔" },
  { zone: "Heatmap Grid", description: "Row x Column intensity grid for time-based patterns.", usedIn: "Peak hours, Weekly volume", icon: "▦" },
  { zone: "KPI Table", description: "Dashboard-style metric rows with this-period vs last-period and delta.", usedIn: "Weekly KPIs, Analytics table, Follow-up rate", icon: "▤" },
  { zone: "Clinical Narrative", description: "AI-generated paragraph summarizing the patient in natural language.", usedIn: "Patient summary (collapsed), Patient narrative card", icon: "¶" },
  { zone: "Translation Pair", description: "Source language left, target language right, with copy action.", usedIn: "Translation card (Hindi, Telugu, Tamil, Kannada, Marathi)", icon: "🌐" },
  { zone: "Drug Interaction", description: "Drug A vs Drug B with severity level, risk description, and recommended action.", usedIn: "Drug interaction card, Allergy conflict card", icon: "⚠" },
  { zone: "Vaccination Schedule", description: "Vaccine name + due date + status badge (completed/pending/overdue).", usedIn: "Vaccination schedule, ANC schedule, Pediatric vaccines", icon: "💉" },
  { zone: "Timeline", description: "Chronological vertical event list with type-coded markers.", usedIn: "Patient timeline (visits, labs, procedures, admissions)", icon: "⏱" },
]

const HEADER_ELEMENTS = [
  { element: "Primary Icon", spec: "26×26px container, always tp-blue-50 background with blue medical icon", always: true },
  { element: "Primary Heading", spec: "12px/600 weight, tp-slate-800, single line truncated", always: true },
  { element: "Secondary Heading", spec: "10px/400, tp-slate-400, sits below primary heading when needed", always: false },
  { element: "Copy Icon", spec: "Top-right. Show only when the card content is newly generated and copyable into RxPad", always: false },
  { element: "Tag", spec: "Inline pill for count, status, date, or scenario label", always: false },
  { element: "Completeness Donut", spec: "14-24px donut in headerExtra slot. EMR/AI/Missing segments", always: false },
  { element: "Accordion Toggle", spec: "Chevron to collapse/expand content zone. This control is mandatory in the header", always: true },
]

const HEADER_MANDATORY_RULES = [
  "Always present: primary blue icon, primary heading, and accordion toggle.",
  "Optional and scenario-based: secondary heading, tag, completeness donut, and copy icon.",
  "These header parts are mix-and-match, but the mandatory trio should stay constant across variants.",
]

const HEADER_COPY_RULES = [
  "Show the common header copy icon only when the card contains newly generated content that can be filled into RxPad.",
  "Do not show the copy icon when the displayed content is already fetched from historical data or already exists in RxPad.",
  "Past visit history is the exception: past visit content can still be copied into RxPad, so those cards can show the copy option.",
  "The same eligibility logic should apply both in the card body and in the common header copy action.",
]

const COPY_RULE_EXPLANATIONS = [
  {
    title: "Fetched historical data",
    body: "If Dr. Agent is only fetching and showing data that already exists in the historical sidebar, that content stays read-only. Showing historical data again does not make it copyable.",
  },
  {
    title: "Past Visit exception",
    body: "Past Visit is the explicit exception. Even though it comes from history, that visit summary can be copied into primary RxPad sections, so Last Visit cards should expose common header copy.",
  },
  {
    title: "Newly generated content",
    body: "Newly generated means Dr. Agent has created a fresh structured output inside the agent itself, such as DDX, medications, investigations, advice, translation, Rx preview, or a newly composed historical block that is not already present in the sidebar as-is.",
  },
  {
    title: "Copy destinations",
    body: "Generated content can be copied either into the primary RxPad areas like Symptoms, Examination, Diagnosis, Medication, Advice, Lab Investigation, Surgery, Additional Notes, Follow-up, and custom modules, or into the historical sidebar when the generated block becomes a new historical record.",
  },
]

const CONTENT_ELEMENT_SPECS = [
  {
    element: "Inline Data Row",
    spec: "SectionTag (default or specialty) followed by 2‑4 inline key:value pairs, 12px text, violet tag accent when specialty context applies.",
    logic: "Use `InlineDataRow` and `SectionTag` components to render tag + key:value pairs; content is read-only unless it is newly generated data marked as copyable.",
  },
  {
    element: "Tag + Value Pair",
    spec: "Tags wrap in inline-flex, respect padding, and the values support metric badges, flags, or copy cues.",
    logic: "Tag height must hug text and align center with the icon/accordion; copy controls live in the common header rules.",
  },
  {
    element: "Primitive Logic",
    spec: "Every content primitive should document how it is generated, when it appears, and what parts are optional vs fixed.",
    logic: "Developers should be able to mix primitives by scenario while preserving the copyability rule: historical data stays read-only unless it is newly generated or explicitly allowed like Last Visit.",
  },
]

const HISTORICAL_SOURCE_AREAS = [
  "Past Visit",
  "Vitals",
  "History",
  "Ophthal",
  "Gynec",
  "Obstetric",
  "Vaccine",
  "Growth",
  "Records",
  "Lab Results",
  "Personal Notes",
]

const RXPAD_PRIMARY_TARGETS = [
  "Symptoms",
  "Examination",
  "Diagnosis",
  "Medication",
  "Advice",
  "Lab Investigation",
  "Surgery",
  "Additional Notes",
  "Follow-up",
  "Custom modules",
]

type HeaderPreviewProps = {
  label: string
  title: string
  subtitle?: string
  tag?: string
  iconName: string
  showCopy?: boolean
  alignCenter?: boolean
}

function HeaderPreview({
  label,
  title,
  subtitle,
  tag,
  iconName,
  showCopy = false,
  alignCenter = false,
}: HeaderPreviewProps) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div
        className={`flex gap-[7px] rounded-[12px] border border-slate-100 px-3 py-[11px] ${alignCenter ? "items-center" : "items-start"}`}
        style={{
          background: "linear-gradient(180deg, rgba(59,130,246,0.05) 0%, #FFFFFF 100%)",
        }}
      >
        <div
          className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px]"
          style={{ background: "var(--tp-blue-50, rgba(59, 130, 246, 0.08))" }}
        >
          <TPMedicalIcon name={iconName} variant="bulk" size={15} color="var(--tp-blue-500, #3B82F6)" />
        </div>

        <div className="flex min-w-0 flex-col text-tp-slate-800">
          <div className="flex items-center gap-[6px]">
            <span className="max-w-[200px] truncate text-[12px] font-semibold leading-[1.3]" title={title}>
              {title}
            </span>
            {showCopy && (
              <div className="flex-shrink-0 text-tp-blue-500">
                <Copy size={14} variant="Linear" />
              </div>
            )}
          </div>
          {subtitle && (
            <span className="mt-[1px] max-w-[200px] truncate text-[10px] leading-[1.3] text-tp-slate-400">
              {subtitle}
            </span>
          )}
        </div>

        <span className="flex-1" />

        {tag && (
          <span className="inline-flex items-center max-w-[120px] truncate rounded-[4px] bg-blue-50 px-[6px] py-[3px] text-[10px] font-semibold leading-[1.2] text-blue-700">
            {tag}
          </span>
        )}

        <button
          type="button"
          className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px] bg-tp-slate-50 text-tp-slate-600"
          aria-label="Collapse section"
        >
          <ArrowUp2 size={12} variant="Linear" />
        </button>
      </div>
    </div>
  )
}

function TagIconPreview({ iconName, variant, size = 14 }: { iconName: string; variant: "default" | "specialty"; size?: number }) {
  const color = variant === "specialty" ? "var(--tp-violet-600, #7C3AED)" : "var(--tp-slate-500, #64748B)"

  if (iconName === "iconsax:calendar") {
    return <Calendar2 size={size} variant="Bulk" color={color} />
  }

  return (
    <TPMedicalIcon
      name={iconName}
      variant="bulk"
      size={size}
      color={color}
    />
  )
}

const FOOTER_CONFIG = {
  scenarios: [
    { type: "No CTA", when: "Review-only cards or cards that finish within the body itself", example: "Trend charts, comparison views, pure informational cards" },
    { type: "Single CTA - Tertiary", when: "One lightweight footer action uses the standard link-style footer treatment", example: "Open Excel, Send reminder to all" },
    { type: "Single CTA - Secondary", when: "One more prominent bordered footer action is needed", example: "Acknowledge, Submit, Override - I accept the risk" },
    { type: "Two CTAs - Tertiary", when: "Two lightweight actions share the footer with a centered divider", example: "View full report + Explore details" },
    { type: "Two CTAs - Secondary", when: "Two bordered footer CTAs need equal emphasis in the same row", example: "Cancel + Confirm & Send" },
  ],
  rules: [
    "Footer CTA area supports 0, 1, or 2 CTAs only. Never exceed 2.",
    "Single CTA is always left-aligned. Both tertiary and secondary single CTAs sit at the start of the footer.",
    "Arrow or navigation icons sit at the end of the text. Other action icons like print, add, download, or acknowledge sit at the start of the text.",
    "Two CTA variants can be text-link/tertiary or bordered/secondary based on scenario.",
    "In 2-CTA tertiary footers, the divider sits at the visual center and both actions balance equally around it.",
    "In 2-CTA secondary footers, use spacing between the two CTAs instead of the divider.",
    "Tertiary variants follow the exact divided-footer pattern used in `Footer CTAs (Max 2, Divided)`.",
    "Copy never belongs in the footer. Whole-card copy stays in the header only.",
  ],
}

type FooterVariantPreviewProps = {
  label: string
  align?: "left" | "center"
  variant: "tertiary" | "secondary"
  ctas: Array<{
    text: string
    icon?: "left" | "right"
    iconKind?: "arrow" | "check"
    tone?: "blue" | "green" | "red" | "orange"
    hug?: boolean
  }>
}

function FooterVariantPreview({
  label,
  align = "left",
  variant,
  ctas,
}: FooterVariantPreviewProps) {
  const isSingle = ctas.length === 1

  function toneClasses(tone: "blue" | "green" | "red" | "orange" = "blue", buttonVariant: "tertiary" | "secondary") {
    if (buttonVariant === "tertiary") {
      if (tone === "green") return "text-emerald-600 hover:bg-emerald-50/70"
      if (tone === "red") return "text-red-600 hover:bg-red-50/70"
      if (tone === "orange") return "text-amber-600 hover:bg-amber-50/70"
      return "text-tp-blue-500 hover:bg-tp-blue-50/60"
    }

    if (tone === "green") return "border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/70"
    if (tone === "red") return "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50/70"
    if (tone === "orange") return "border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50/70"
    return "border-blue-200 text-tp-blue-500 hover:border-blue-300 hover:bg-tp-blue-50/60"
  }

  function renderIcon(kind: "arrow" | "check" = "arrow") {
    if (kind === "check") {
      return (
        <svg width={14} height={14} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
          <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }

    return (
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  function ctaClass(
    buttonVariant: "tertiary" | "secondary",
    tone: "blue" | "green" | "red" | "orange" = "blue",
    fullWidth = false,
    hug = false
  ) {
    const singleWidthClass = fullWidth ? "flex-1" : hug ? "w-auto" : "w-[250px] max-w-full"

    if (buttonVariant === "tertiary") {
      return `${singleWidthClass} inline-flex h-[36px] items-center justify-center gap-[4px] rounded-[10px] px-2 text-[12px] font-medium transition-colors ${toneClasses(tone, buttonVariant)}`
    }

    return `${singleWidthClass} inline-flex h-[36px] items-center justify-center gap-[4px] rounded-[10px] border bg-white px-2 text-[12px] font-medium transition-colors ${toneClasses(tone, buttonVariant)}`
  }

  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div
        className="overflow-hidden rounded-[12px] border border-slate-100 bg-white"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, rgba(59,130,246,0.04) 100%)" }}
      >
        <div className="px-3 py-[8px]" style={{ borderTop: "0.5px solid var(--tp-slate-50, #F8FAFC)" }}>
          {isSingle ? (
            <div className={`flex ${align === "center" ? "justify-center" : "justify-start"}`}>
              <button
                type="button"
                className={ctaClass(variant, ctas[0].tone ?? "blue", false, ctas[0].hug ?? false)}
              >
                {ctas[0].icon === "left" && renderIcon(ctas[0].iconKind)}
                <span>{ctas[0].text}</span>
                {ctas[0].icon === "right" && renderIcon(ctas[0].iconKind)}
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <button
                type="button"
                className={ctaClass(variant, ctas[0].tone ?? "blue", true)}
              >
                {ctas[0].icon === "left" && renderIcon(ctas[0].iconKind)}
                <span>{ctas[0].text}</span>
                {ctas[0].icon === "right" && renderIcon(ctas[0].iconKind)}
              </button>
              {variant === "tertiary" ? (
                <div
                  className="h-[20px] flex-shrink-0"
                  style={{ width: "1px", background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }}
                />
              ) : (
                <div className="w-6 flex-shrink-0" />
              )}
              <button
                type="button"
                className={ctaClass(variant, ctas[1].tone ?? "blue", true)}
              >
                {ctas[1].icon === "left" && renderIcon(ctas[1].iconKind)}
                <span>{ctas[1].text}</span>
                {ctas[1].icon === "right" && renderIcon(ctas[1].iconKind)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PILL_LOGIC = {
  structure: [
    "Canned messages always sit between the main content area and the footer zone.",
    "Show a maximum of 4 pills at a time. Prioritize the most relevant next-step actions instead of showing every possible option.",
    "Each pill should read like a short next action or follow-up question, ideally 2-4 words.",
  ],
  when_shown: [
    "After patient summary is loaded (phase: empty → summary shown)",
    "After a card is rendered (next-step pills refresh)",
    "Tab changes in sidebar (tab-lens pills update)",
    "Safety flags detected (Layer 1 pills force-shown)",
    "Specialty data exists (e.g., obstetric, pediatric pills appear)",
  ],
  when_not_shown: [
    "During typing (pills hidden while composing)",
    "While card is streaming/loading",
    "Homepage without patient context (except homepage pills)",
    "Follow-up question card is active (waiting for selection)",
  ],
  generation: [
    "Use pills only when the card can naturally lead to a next action, deeper drill-down, comparison, or transformation.",
    "Do not show pills for cards that already require an explicit choice inside the card itself, unless a later follow-up state is reached.",
    "Generate pill text from the strongest next useful action: compare, explain, trend, translate, fill, refine, or continue workflow.",
    "Safety or critical conditions can force-show high-priority pills above normal recommendation logic.",
  ],
}

const ALL_SECTION_TAGS = [
  { tag: "Vitals", usedIn: "Patient Summary", variant: "default", iconName: SECTION_TAG_ICON_MAP["Vitals"] },
  { tag: "Symptoms", usedIn: "Pre-visit Intake, Last Visit, Voice Rx", variant: "default", iconName: SECTION_TAG_ICON_MAP["Symptoms"] },
  { tag: "Diagnosis", usedIn: "Last Visit, Voice Rx, OCR, Rx Preview", variant: "default", iconName: SECTION_TAG_ICON_MAP["Diagnosis"] },
  { tag: "Medication", usedIn: "Last Visit, Voice Rx, OCR, Rx Preview", variant: "default", iconName: SECTION_TAG_ICON_MAP["Medication"] },
  { tag: "Investigation", usedIn: "Voice Rx, OCR, Rx Preview", variant: "default", iconName: SECTION_TAG_ICON_MAP["Investigation"] },
  { tag: "Advice", usedIn: "Rx Preview", variant: "default", iconName: SECTION_TAG_ICON_MAP["Advice"] },
  { tag: "Follow-up", usedIn: "Rx Preview, Follow-up Cards", variant: "default", iconName: SECTION_TAG_ICON_MAP["Follow-up"] },
  { tag: "Active Meds", usedIn: "Patient Summary", variant: "default", iconName: SECTION_TAG_ICON_MAP["Active Meds"] },
  { tag: "Chronic Conditions", usedIn: "Patient Summary", variant: "default", iconName: SECTION_TAG_ICON_MAP["Chronic Conditions"] },
  { tag: "Key Labs", usedIn: "Patient Summary, POMR", variant: "default", iconName: SECTION_TAG_ICON_MAP["Key Labs"] },
  { tag: "Family History", usedIn: "Patient Summary", variant: "default", iconName: SECTION_TAG_ICON_MAP["Family History"] },
  { tag: "Allergies", usedIn: "Patient Summary, SBAR", variant: "default", iconName: SECTION_TAG_ICON_MAP["Allergies"] },
  { tag: "Lifestyle", usedIn: "Patient Summary", variant: "default", iconName: SECTION_TAG_ICON_MAP["Lifestyle"] },
  { tag: "Due Alerts", usedIn: "Patient Summary", variant: "default", iconName: SECTION_TAG_ICON_MAP["Due Alerts"] },
  { tag: "Basic Info", usedIn: "Obstetric Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["Basic Info"] },
  { tag: "ANC Status", usedIn: "Obstetric Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["ANC Status"] },
  { tag: "Last Exam", usedIn: "Obstetric Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["Last Exam"] },
  { tag: "Menstrual History", usedIn: "Gynec Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["Menstrual History"] },
  { tag: "Screening", usedIn: "Gynec Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["Screening"] },
  { tag: "OD (Right)", usedIn: "Ophthal Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["OD (Right)"] },
  { tag: "OS (Left)", usedIn: "Ophthal Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["OS (Left)"] },
  { tag: "Findings", usedIn: "Ophthal Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["Findings"] },
  { tag: "Growth", usedIn: "Pediatric Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["Growth"] },
  { tag: "Vaccines", usedIn: "Pediatric Summary", variant: "specialty", iconName: SECTION_TAG_ICON_MAP["Vaccines"] },
]

// ── Content primitives with exampleCard references ──
const CONTENT_PRIMITIVES: ContentPrimitive[] = [
  {
    name: "InlineDataRow (Tag + Key:Value pairs)",
    description: "Horizontal row with a SectionTag label followed by inline key:value pairs. The most common content pattern.",
    usedIn: ["Patient Summary", "Obstetric Summary", "Gynec Summary", "Ophthal Summary", "Pediatric Summary", "Last Visit Card"],
    variations: ["Default (slate tag)", "Specialty (violet tag)", "Flagged values (red/amber)", "Compound values (pipe-separated)"],
    fetchFrom: "Historical sidebar modules such as Vitals, History, Gynec, Obstetric, Growth, Vaccine, Lab Results, and Past Visit.",
    copyRule: "Read-only by default when fetched from historical data. Copy becomes valid only for newly generated rows or the allowed Past Visit flow.",
    uiRule: "Use one tag-led row per clinical theme. Keep the tag + values in a single scan line and only break when the value count becomes clinically unreadable.",
    exampleCard: "patient_summary",
  },
  {
    name: "DataRow (Vertical label-value)",
    description: "Single vertical row: label on top, value below with unit and reference range.",
    usedIn: ["Lab Panel Card", "OCR Pathology Card"],
    variations: ["Normal", "High flag (red)", "Low flag (amber)", "With trend arrow"],
    fetchFrom: "Lab Results, OCR-derived Records data, or newly generated extracted result blocks.",
    copyRule: "Only copyable when the result block is newly digitized/generated for fill. Plain fetched historical results stay read-only.",
    uiRule: "Use when one parameter needs more visual weight than an inline row. Keep label, value, unit, and reference range vertically grouped.",
    exampleCard: "lab_panel",
  },
  {
    name: "Lab Comparison Table",
    description: "Two-column comparison: previous vs current values with delta indicators (↑↓→).",
    usedIn: ["Lab Comparison Card"],
    variations: ["All improved (green)", "Mixed changes", "Missing previous data"],
    fetchFrom: "Lab Results history with at least one earlier comparable result.",
    copyRule: "Comparison views are typically analytical/read-only and should not show copy unless a downstream generated summary is created from them.",
    uiRule: "Keep parameter, previous, current, and delta aligned in a fixed table so worsening/improving signals are obvious.",
    exampleCard: "lab_comparison",
  },
  {
    name: "Line Chart / Bar Chart",
    description: "SVG-based trend visualization. Auto-scales to card width.",
    usedIn: ["Vital Trends Line", "Vital Trends Bar", "Lab Trends", "Revenue Bar", "Line Graph"],
    variations: ["Line with tone coloring", "Bar with thresholds", "Dual chart toggle"],
    fetchFrom: "Vitals, Lab Results, homepage analytics, or other sequential time-series sources.",
    copyRule: "Charts are visual review patterns and are not directly copyable into RxPad or historical modules.",
    uiRule: "Choose line for continuous trend reading, bar for threshold comparison, and keep labels/units stable across all variants.",
    exampleCard: "vitals_trend_bar",
  },
  {
    name: "Checkbox Row",
    description: "Checkbox with label and rationale text. Used for multi-select actions.",
    usedIn: ["DDX Card", "Investigation Card"],
    variations: ["3-tier DDX (Can't Miss / Most Likely / Consider)", "With urgency indicator"],
    fetchFrom: "Newly generated agent recommendations such as DDX or suggested investigations.",
    copyRule: "Copy/fill is allowed after the doctor selects items because the selected output becomes a newly generated action set.",
    uiRule: "Each row should contain one actionable option and a short rationale. Group rows by urgency or category when needed.",
    exampleCard: "ddx",
  },
  {
    name: "Radio Row",
    description: "Radio button with label and detail. Used for single-select choices.",
    usedIn: ["Follow-up Card", "Follow-up Question Card"],
    variations: ["With recommended flag", "With detail explanation"],
    fetchFrom: "Newly generated follow-up or clarification options from the agent.",
    copyRule: "The row itself is not the copy object; the chosen outcome may later be filled into Follow-up or another RxPad section.",
    uiRule: "Use only for mutually exclusive decisions. Recommendation badges can change, but the radio anatomy should remain stable.",
    exampleCard: "follow_up",
  },
  {
    name: "Bullet List (• items)",
    description: "Simple bulleted list with 12px text.",
    usedIn: ["Advice Card", "Rx Preview", "text_list"],
    variations: ["With copy-all action", "With share action (SMS/WhatsApp)"],
    fetchFrom: "Newly generated advice, summaries, or text answers.",
    copyRule: "Copy/share is valid when the list is agent-generated for action. Historical or already-synced content should not surface the same copy affordance again.",
    uiRule: "Keep each bullet atomized and short. Use this when sequence is light but readability and downstream action matter.",
    exampleCard: "advice_bundle",
  },
  {
    name: "Medication Display",
    description: "Drug name + dosage + timing + duration. Safety check notes below.",
    usedIn: ["Protocol Meds Card", "Rx Preview Card", "Med History Card"],
    variations: ["With safety check", "With copy-to-RxPad", "With source indicator"],
    fetchFrom: "RxPad draft state, protocol generation, or medication history from the historical sidebar.",
    copyRule: "Protocol/Rx Preview medication blocks are copyable into RxPad. Historical medication history is review-only unless it is regenerated as new content.",
    uiRule: "Always keep name, dose, frequency, and duration grouped so doctors can scan and copy without ambiguity.",
    exampleCard: "protocol_meds",
  },
  {
    name: "Vaccination Schedule",
    description: "Vaccine name + due date + status badge (completed/pending/overdue).",
    usedIn: ["Vaccination Schedule Card"],
    variations: ["Completed (green)", "Pending (amber)", "Overdue (red)"],
    fetchFrom: "Historical Vaccine module and schedule rules for the patient context.",
    copyRule: "Historical vaccine schedules are read-only unless the agent generates a new structured recommendation to save back into history.",
    uiRule: "Sort by due relevance and keep status color, due date, and vaccine name tightly grouped.",
    exampleCard: "vaccination_schedule",
  },
  {
    name: "Patient Timeline",
    description: "Vertical timeline with dated events: visit, lab, procedure, admission.",
    usedIn: ["Patient Timeline Card"],
    variations: ["Color-coded by type", "Highlighted procedures"],
    fetchFrom: "Past Visit, Lab Results, Records, and other chronological historical modules.",
    copyRule: "Timeline itself is read-only; only individual generated summaries or allowed Past Visit payloads should expose copy.",
    uiRule: "Maintain a strong date-to-event rhythm so the chronology reads clearly even when filtered.",
    exampleCard: "patient_timeline",
  },
  {
    name: "Translation Side-by-Side",
    description: "Source language on top, translated below with language labels.",
    usedIn: ["Translation Card"],
    variations: ["Hindi", "Telugu", "Tamil", "Kannada", "Marathi"],
    fetchFrom: "Newly generated translation output based on selected source text.",
    copyRule: "Translation output is copyable/shareable because it is new generated content intended for downstream use.",
    uiRule: "Always label source and translated language clearly so doctors know what will be copied or shared.",
    exampleCard: "translation",
  },
  {
    name: "Drug Interaction Display",
    description: "Drug A ★ Drug B. Severity badge. Risk, mechanism, recommended action.",
    usedIn: ["Drug Interaction Card"],
    variations: ["Critical (red)", "Major (amber)", "Moderate (yellow)"],
    fetchFrom: "Newly generated safety analysis using current prescription context.",
    copyRule: "Safety review cards are primarily advisory and usually not copied; the accepted downstream medication change is what gets filled.",
    uiRule: "Lead with the interacting pair and severity, then follow with mechanism and recommended action.",
    exampleCard: "drug_interaction",
  },
  {
    name: "Allergy Conflict Display",
    description: "Prescribed drug vs known allergen. Alternative suggestions.",
    usedIn: ["Allergy Conflict Card"],
    variations: ["Direct allergy match", "Cross-reactivity"],
    fetchFrom: "Current prescription context plus allergy data from the historical History module.",
    copyRule: "This is advisory by default; copy belongs to the accepted alternative plan, not the alert card itself.",
    uiRule: "Always show the conflict first and the safer alternative second.",
    exampleCard: "allergy_conflict",
  },
  {
    name: "Donut / Pie Chart",
    description: "Circular chart with colored segments. Center label shows total.",
    usedIn: ["Donut Chart", "Pie Chart", "Data Completeness Donut"],
    variations: ["Gender distribution", "Age group", "Payment mode"],
    fetchFrom: "Homepage or operational aggregates.",
    copyRule: "Charts are non-copyable review components.",
    uiRule: "Use only when ratio/distribution matters more than exact row-level inspection.",
    exampleCard: "donut_chart",
  },
  {
    name: "Horizontal Bar Chart",
    description: "Horizontal bars with labels and counts. Percentage width proportional.",
    usedIn: ["Condition Bar Card"],
    variations: ["Top 10 conditions", "Chronic only"],
    fetchFrom: "Homepage analytics or summarized diagnosis distribution datasets.",
    copyRule: "Analytical display only; no copy action.",
    uiRule: "Keep labels left, measure right, and use consistent ranking order.",
    exampleCard: "condition_bar",
  },
  {
    name: "Heatmap Grid",
    description: "Rows × Columns grid with intensity-colored cells. Appointment density.",
    usedIn: ["Heatmap Card"],
    variations: ["This week", "Month view"],
    fetchFrom: "Operational scheduling/appointment analytics.",
    copyRule: "Review-only visual; no copy action.",
    uiRule: "Use a stable legend and calibrated density scale so comparisons stay meaningful.",
    exampleCard: "heatmap",
  },
  {
    name: "KPI Table",
    description: "Metric rows: this week / last week / delta / direction. Dashboard format.",
    usedIn: ["Analytics Table Card"],
    variations: ["Weekly KPIs", "Monthly KPIs"],
    fetchFrom: "Operational analytics and homepage business summaries.",
    copyRule: "Review-only table; no copy action.",
    uiRule: "Preserve row alignment so current value, baseline, and delta scan together.",
    exampleCard: "analytics_table",
  },
  {
    name: "Patient List",
    description: "Patient rows: name, age/gender, time, status badge, chief complaint.",
    usedIn: ["Patient List Card", "Follow-up List Card"],
    variations: ["With status badges", "With overdue flags", "With search input"],
    fetchFrom: "Homepage patient lists, follow-up queues, and patient search results.",
    copyRule: "List rows are navigational/operational and not copy targets.",
    uiRule: "Each row should expose identity, status, and next-action context in one line of scan.",
    exampleCard: "patient_list",
  },
  {
    name: "Revenue Stacked Bar",
    description: "Daily bars stacked by paid/due/refunded.",
    usedIn: ["Revenue Bar Card"],
    variations: ["Today only", "This week (7 bars)"],
    fetchFrom: "Operational billing analytics.",
    copyRule: "Review-only chart; no copy action.",
    uiRule: "Use stacked comparison only when the financial sub-states must be read together.",
    exampleCard: "revenue_bar",
  },
  {
    name: "Clinical Narrative",
    description: "Italic text in violet-bordered quotation box. AI-generated summary.",
    usedIn: ["Patient Summary (narrative)", "Patient Narrative Card"],
    variations: ["GP narrative", "Specialist narrative"],
    fetchFrom: "Mixed structured sources such as Past Visit, Vitals, History, Labs, Records, and specialty modules.",
    copyRule: "Narratives are copyable only when they are newly generated and mapped to an RxPad or historical target.",
    uiRule: "Use as a compression layer above detailed rows, not as a replacement for structured data.",
    exampleCard: "patient_summary",
  },
  {
    name: "SBAR Structured Sections",
    description: "4-section layout: Situation → Background → Assessment → Recommendation.",
    usedIn: ["SBAR Critical Card"],
    variations: ["Emergency", "Critical lab", "Vital deterioration"],
    fetchFrom: "Mixed high-risk context from historical data, current context, and generated clinical reasoning.",
    copyRule: "Usually advisory/read-only unless a structured recommendation is explicitly fillable.",
    uiRule: "Keep the four-section scaffold fixed so urgent reading stays predictable.",
    exampleCard: "patient_summary", // fallback since sbar_critical may not be in CATALOG
  },
  {
    name: "POMR Problem Detail",
    description: "Problem header + completeness donut + labs + medications + missing fields.",
    usedIn: ["POMR Problem Card"],
    variations: ["CKD", "Diabetes", "HTN", "High/low completeness"],
    fetchFrom: "Mixed historical modules grouped around a single problem such as CKD, Diabetes, or HTN.",
    copyRule: "Problem review itself is not directly copyable; newly generated downstream summaries/actions may be.",
    uiRule: "Keep one problem as the organizing axis and hang completeness, labs, meds, and missing fields under it.",
    exampleCard: "patient_summary", // fallback
  },
  {
    name: "Voice Structured Sections",
    description: "Voice dictation parsed into structured RxPad sections with copy-all.",
    usedIn: ["Voice-to-Structured Rx Card"],
    variations: ["Full dictation", "Partial", "With corrections"],
    fetchFrom: "Newly generated voice-transcribed structured content.",
    copyRule: "Copy/fill is valid because the card is producing new RxPad-ready sections.",
    uiRule: "Preserve section boundaries so doctors can validate before filling.",
    exampleCard: "voice_structured_rx",
  },
]

// ── CARD CATALOG DATA ──
type CardSpec = { kind: string; family: string; description: string; intent: string; whenToShow: string; permutations: string[]; dataParams: string; dataSources: string; formattingNotes: string; cannedMessages: string[]; intentSummary: string }

function getCardFetchFrom(kind: string): string {
  if (["last_visit", "patient_timeline"].includes(kind)) return "Past Visit history and other chronological historical modules"
  if (["lab_panel", "lab_trend", "lab_comparison"].includes(kind)) return "Lab Results history, Records OCR, or mixed lab context"
  if (["vitals_trend_bar", "vitals_trend_line"].includes(kind)) return "Vitals history and encounter vitals"
  if (["patient_summary", "sbar_overview", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary", "symptom_collector", "vitals_summary"].includes(kind)) {
    return "Mixed patient context: historical sidebar modules + current encounter data"
  }
  if (["protocol_meds", "investigation_bundle", "follow_up", "advice_bundle", "rx_preview", "voice_structured_rx", "ddx"].includes(kind)) {
    return "Newly generated Dr. Agent output using patient context and current RxPad state"
  }
  if (["ocr_pathology", "ocr_extraction", "translation", "drug_interaction", "allergy_conflict", "clinical_guideline"].includes(kind)) {
    return "Generated analysis layer from uploaded records, current RxPad state, or user query context"
  }
  if (["med_history", "vaccination_schedule", "medical_history"].includes(kind)) return "Historical sidebar modules"
  if (kind === "guardrail") return "No external data — internally generated redirect card"
  if (["sbar_critical", "pomr_problem_card", "completeness", "follow_up_question"].includes(kind)) return "Mixed historical + current clinical context"
  if (["welcome_card", "patient_list", "patient_search", "follow_up_list", "revenue_bar", "bulk_action", "donut_chart", "pie_chart", "line_graph", "analytics_table", "condition_bar", "heatmap", "billing_summary", "external_cta", "referral"].includes(kind)) {
    return "Homepage or operational analytics datasets"
  }
  return "Context-specific mixed data"
}

function getCardUiRule(kind: string): string {
  if (["patient_summary", "sbar_overview", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary", "vitals_summary"].includes(kind)) return "Lead with compressed scan-friendly summary blocks, then expand into tag-led structured rows."
  if (["last_visit", "rx_preview", "voice_structured_rx"].includes(kind)) return "Use sectioned content with icon-led tags and expose common header copy when the entire card is copyable."
  if (["lab_panel", "med_history", "vaccination_schedule", "ocr_pathology", "ocr_extraction", "medical_history"].includes(kind)) return "Keep each row or section strongly structured so clinicians can inspect details without losing source meaning."
  if (kind === "guardrail") return "Soft redirect with suggestion pills — neutral tone, no severity coloring."
  if (["lab_trend", "lab_comparison", "vitals_trend_bar", "vitals_trend_line"].includes(kind)) return "Prioritize quick comparison and trend recognition over text density."
  if (["ddx", "investigation_bundle", "follow_up", "advice_bundle", "protocol_meds"].includes(kind)) return "Action cards should make selection or fillability obvious before any secondary explanation."
  if (["welcome_card", "patient_list", "patient_search", "follow_up_list", "revenue_bar", "bulk_action", "donut_chart", "pie_chart", "line_graph", "analytics_table", "condition_bar", "heatmap", "billing_summary", "external_cta", "referral"].includes(kind)) {
    return "Operational cards should stay glanceable, compact, and list/dashboard oriented."
  }
  return "Use the standard card shell with a stable header, structured body, and action-aware footer."
}

const CARD_SPECS: CardSpec[] = [
  // ── Summary ──
  { kind: "patient_summary", family: "Summary", description: "Comprehensive patient overview — vitals, labs, flags, chronic conditions, medications, narrative.", intent: "data_retrieval", whenToShow: "'Patient summary', 'overview', 'snapshot' or 'Patient's detailed summary' pill.", permutations: ["With/without labs", "With chronic conditions", "With symptom collector", "With specialty alerts", "With vitals abnormals"], dataParams: "SmartSummaryData", dataSources: "EMR: vitals, labs, conditions, meds, allergies. Uploaded documents (AI-extracted). Symptom collector (patient-reported). Specialty modules (obstetric/gynec/ophthal/pediatric).", formattingNotes: "Inline data rows: primary text in tp-slate-700 (#454551), (parenthetical details) in tp-slate-400 (#A2A2A8), dividers · | in tp-slate-200 (#E2E2EA). Section tags with icons. Provenance dots: EMR tp-success-600 (#059669), AI tp-warning-600 (#D97706). Narrative in tp-violet-600 (#8A4DBB) italic. Font: Inter 10-11px body, 9px captions.", cannedMessages: ["Patient summary", "Overview", "Patient's detailed summary", "Show patient snapshot"], intentSummary: "data_retrieval → Card: multi-section clinical overview too complex for text" },
  { kind: "sbar_overview", family: "Summary", description: "ISBAR-structured patient summary — Situation (narrative), Background (history + allergies), Assessment (vitals + labs), Recommendation (action items).", intent: "data_retrieval", whenToShow: "'Patient summary' pill for SBAR/critical care view. Used in Emergency/On-call context.", permutations: ["Full SBAR with all sections", "Without labs", "With critical vitals", "With follow-up overdue", "With last visit"], dataParams: "SmartSummaryData", dataSources: "EMR: vitals, labs, conditions, meds, allergies. Historical visit data. Symptom collector. Same sources as patient_summary, structured into ISBAR format.", formattingNotes: "ISBAR section headers (Situation, Background, Assessment, Recommendation) with colored left borders. Compact rows within each section. Critical flags in red.", cannedMessages: ["SBAR summary", "Patient summary", "Emergency overview", "On-call handoff"], intentSummary: "data_retrieval → Card: ISBAR-structured overview needs section-based card layout" },
  { kind: "symptom_collector", family: "Summary", description: "Patient-reported symptoms from pre-visit intake form.", intent: "data_retrieval", whenToShow: "'Pre-visit intake' pill.", permutations: ["Full intake", "Partial intake", "With severity ratings"], dataParams: "SymptomCollectorData", dataSources: "Patient-reported pre-visit intake form. Symptoms, medical history, family history, allergies, lifestyle, and questions to doctor.", formattingNotes: "Section-tagged rows — symptoms with severity badges, history as tag pills, allergies in red-tinted row. Questionnaire format with expandable sections.", cannedMessages: ["Pre-visit intake", "Symptoms reported", "What did the patient report?", "Intake form"], intentSummary: "data_retrieval → Card: multi-section intake data with severity ratings needs structured layout" },
  { kind: "last_visit", family: "Summary", description: "Previous visit summary with copy-to-rx action.", intent: "data_retrieval", whenToShow: "'Last visit details' pill.", permutations: ["Recent (<30d)", "Old (>90d amber)", "With meds"], dataParams: "LastVisitCardData", dataSources: "EMR visit records — symptoms, examination, diagnosis, medication, advice, follow-up, lab tests suggested.", formattingNotes: "Section-tagged rows: 'Fever (2d, high)' → 'Fever' in tp-slate-700 (#454551), '(2d, high)' in tp-slate-400 (#A2A2A8). Pipe '|' dot '·' in tp-slate-200 (#E2E2EA). Copy-to-RxPad per section. Font: Inter 10px body.", cannedMessages: ["Last visit details", "Previous visit", "What happened last time?", "Show visit on [date]"], intentSummary: "data_retrieval → Card: structured visit data with copy-to-RxPad needs card layout" },
  { kind: "obstetric_summary", family: "Summary", description: "ANC status, gravida/para, EDD, gestational weeks, fetal data.", intent: "data_retrieval", whenToShow: "Obstetric data exists + pill tapped.", permutations: ["Active pregnancy", "High-risk", "Post-delivery"], dataParams: "ObstetricData", dataSources: "EMR obstetric module: gravida/para/living/abortion, LMP, EDD, gestational age, fetal data, ANC schedule, vaccine status, BP tracking.", formattingNotes: "Key-value grid with gestational age prominently displayed. ANC timeline with due/overdue badges. High-risk flags in red. Fetal data section with icons.", cannedMessages: ["Obstetric summary", "ANC status", "Pregnancy details", "Gestational age"], intentSummary: "data_retrieval → Card: pregnancy tracking with timeline and risk flags needs structured card" },
  { kind: "gynec_summary", family: "Summary", description: "Menarche, cycle, LMP, Pap smear, flow/pain.", intent: "data_retrieval", whenToShow: "Gynec data exists + pill tapped.", permutations: ["Regular", "Irregular", "Post-menopausal"], dataParams: "GynecData", dataSources: "EMR gynecology module: menarche, cycle details (length, regularity, flow, pain), LMP, Pap smear history.", formattingNotes: "Key-value rows with cycle regularity badge (regular/irregular). Pain score as visual scale. Alerts in amber/red rows. LMP prominently displayed.", cannedMessages: ["Gynec summary", "Menstrual history", "Cycle details", "LMP status"], intentSummary: "data_retrieval → Card: gynecological history with cycle data needs structured layout" },
  { kind: "pediatric_summary", family: "Summary", description: "Growth percentiles, milestones, vaccine status.", intent: "data_retrieval", whenToShow: "Pediatric data exists + pill tapped.", permutations: ["Infant", "Child", "Overdue vaccines"], dataParams: "PediatricsData", dataSources: "EMR pediatric module: growth measurements (height/weight/OFC percentiles), milestone tracking, vaccine schedule, feeding notes.", formattingNotes: "Growth percentile badges (green normal, amber borderline, red concerning). Vaccine status with overdue count in red. Milestone checklist format.", cannedMessages: ["Pediatric summary", "Growth chart", "Vaccine status", "Child development"], intentSummary: "data_retrieval → Card: growth percentiles and vaccine tracking need visual badges and structure" },
  { kind: "ophthal_summary", family: "Summary", description: "Visual acuity, IOP, refraction, slit lamp, fundus.", intent: "data_retrieval", whenToShow: "Ophthal data exists + pill tapped.", permutations: ["Normal", "Elevated IOP", "Refractive error"], dataParams: "OphthalData", dataSources: "EMR ophthalmology module: visual acuity (near/far), IOP, slit lamp findings, fundus examination, glass prescription.", formattingNotes: "Two-column layout for R/L eye comparison. IOP with threshold coloring. Slit lamp and fundus as descriptive rows. Glass prescription in monospace.", cannedMessages: ["Eye examination", "Ophthal summary", "Visual acuity", "IOP reading"], intentSummary: "data_retrieval → Card: bilateral eye data with R/L comparison needs structured card" },
  // ── Data & Trends ──
  { kind: "lab_panel", family: "Data", description: "Latest lab results grid with flags.", intent: "data_retrieval", whenToShow: "'Lab overview' or 'N lab values flagged' pill.", permutations: ["All normal", "Mixed flags", "Critical flags", "By category"], dataParams: "LabPanelData", dataSources: "EMR lab orders and results. Uploaded lab report PDFs (AI-extracted with confidence scoring).", formattingNotes: "Grid rows: flag arrows ↑↓ in tp-error-600 (#C8102E). Ref ranges in tp-slate-400 (#A2A2A8). Alternating rows white/tp-slate-50 (#FAFAFB). Flagged count badge tp-error-50 bg. Font: Inter 10px body, 9px ref range.", cannedMessages: ["Lab overview", "Show labs", "What labs are flagged?", "N lab values flagged"], intentSummary: "data_retrieval → Card: flagged values need color coding and grid structure" },
  { kind: "vitals_trend_bar", family: "Data", description: "Vitals over time as bar chart with thresholds.", intent: "comparison", whenToShow: "'Vital trends' or 'Bar view' pill.", permutations: ["Single vital", "Multiple overlaid", "With thresholds"], dataParams: "{title, series: VitalTrendSeries[]}", dataSources: "EMR vitals history across visits. Encounter vitals recorded by nurse/doctor.", formattingNotes: "Stacked/grouped bar chart with threshold line overlay. Color-coded bars (green=ok, amber=warn, red=critical). Date labels on x-axis.", cannedMessages: ["Vital trends", "Bar view", "Show vitals over time", "BP trend"], intentSummary: "comparison → Card: temporal bar chart with thresholds requires chart rendering" },
  { kind: "vitals_trend_line", family: "Data", description: "Vitals over time as line chart with tone coloring.", intent: "comparison", whenToShow: "'Line graph' pill.", permutations: ["Stable (green)", "Declining (red)", "Improving"], dataParams: "{title, series: VitalTrendSeries[]}", dataSources: "EMR vitals history across visits. Encounter vitals recorded by nurse/doctor.", formattingNotes: "Line chart with tone coloring (green=stable, red=declining). Data points at each visit. Threshold reference line if applicable.", cannedMessages: ["Line graph", "Vitals line trend", "Show trend line", "Vitals over time"], intentSummary: "comparison → Card: line chart with tone-based coloring requires chart rendering" },
  { kind: "lab_trend", family: "Data", description: "Single lab parameter trend over time.", intent: "comparison", whenToShow: "'HbA1c trend' type queries.", permutations: ["Improving", "Worsening", "Stable", "With normal range band"], dataParams: "{title, series, parameterName}", dataSources: "EMR lab results history for a single parameter over time. May include AI-extracted values from uploaded reports.", formattingNotes: "Single-parameter line chart with normal range band shaded. Data points labeled with values. Improving/worsening direction arrow.", cannedMessages: ["HbA1c trend", "Creatinine trend", "Show lab trend", "How has [param] changed?"], intentSummary: "comparison → Card: single-parameter trend with normal range band needs chart layout" },
  { kind: "lab_comparison", family: "Data", description: "Previous vs current lab values with deltas.", intent: "comparison", whenToShow: "'Compare labs' or 'Lab comparison' pill.", permutations: ["All improved", "Mixed", "No previous data"], dataParams: "{rows: LabComparisonRow[]}", dataSources: "EMR lab results — previous vs current values. Delta calculations generated by system.", formattingNotes: "Two-column comparison table with delta arrows (↑↓). Flagged rows highlighted. Previous and current dates in column headers.", cannedMessages: ["Compare labs", "Lab comparison", "Previous vs current labs", "What changed in labs?"], intentSummary: "comparison → Card: side-by-side lab comparison with deltas needs table structure" },
  { kind: "med_history", family: "Data", description: "Medication history timeline.", intent: "data_retrieval", whenToShow: "'Med history' pill.", permutations: ["Active only", "Full history", "By diagnosis"], dataParams: "{entries: MedHistoryEntry[]}", dataSources: "EMR medication records — prescribed drugs with dosage, dates, and linked diagnoses. Uploaded prescription records.", formattingNotes: "Timeline-style rows with drug name bold, dosage and diagnosis in lighter text. Date column. Source badge (prescribed/uploaded).", cannedMessages: ["Med history", "Medication history", "Past medications", "What was prescribed before?"], intentSummary: "data_retrieval → Card: medication timeline with source attribution needs structured rows" },
  { kind: "patient_timeline", family: "Data", description: "Chronological event timeline.", intent: "data_retrieval", whenToShow: "'Patient timeline' pill.", permutations: ["All events", "Visits only", "By date range"], dataParams: "PatientTimelineCardData", dataSources: "EMR visit records, lab events, procedures, admissions — all chronological patient events.", formattingNotes: "Vertical timeline with event type icons (visit/lab/procedure/admission). Date on left, summary on right. Color-coded by event type.", cannedMessages: ["Patient timeline", "Visit history", "Show timeline", "Chronological history"], intentSummary: "data_retrieval → Card: chronological event timeline with type icons needs visual layout" },
  { kind: "vaccination_schedule", family: "Data", description: "Vaccine schedule with status badges.", intent: "data_retrieval", whenToShow: "Patient-level vaccine schedule.", permutations: ["Infant", "Adult", "Pregnancy", "Overdue"], dataParams: "VaccinationScheduleCardData", dataSources: "EMR vaccine records — scheduled vaccines with dose tracking, due dates, and status (given/due/overdue).", formattingNotes: "Schedule rows with status badges (green=given, amber=due, red=overdue). Patient name and dose info. Grouped by vaccine name.", cannedMessages: ["Vaccine schedule", "Vaccination status", "Pending vaccines", "Immunization record"], intentSummary: "data_retrieval → Card: vaccine schedule with status badges needs structured layout" },
  { kind: "medical_history", family: "Data", description: "Chronic conditions, allergies, family history, surgical history, lifestyle — organized by section tags.", intent: "data_retrieval", whenToShow: "'Medical history' pill or 'Show allergies/conditions/family history'.", permutations: ["Full history", "Chronic only", "Allergy-focused", "Family history only"], dataParams: "MedicalHistoryCardData", dataSources: "EMR historical sidebar modules: chronic conditions, surgical history, allergies, family history, social history. AI-extracted from uploaded documents.", formattingNotes: "Section-tagged rows with icons per category (conditions, surgeries, allergies, family). Items as inline tag pills. Parenthetical durations in lighter text.", cannedMessages: ["Medical history", "Past medical history", "Chronic conditions", "Show patient history"], intentSummary: "data_retrieval → Card: multi-section medical history with categorized tags needs card layout" },
  { kind: "vitals_summary", family: "Data", description: "Today's vitals in structured table — BP, pulse, SpO₂, temp, weight, height, BMI.", intent: "data_retrieval", whenToShow: "'Today's vitals' pill or 'What are the current vitals?'.", permutations: ["All normal", "With abnormals", "Incomplete vitals"], dataParams: "VitalsSummaryCardData", dataSources: "EMR encounter vitals: BP, pulse, SpO₂, temp, BMI, respiratory rate, weight, height. Recorded during current or most recent visit.", formattingNotes: "Grid rows with short label (BP, HR, SpO₂), value, unit, and flag badge (normal green, high/low red). Recorded timestamp in header.", cannedMessages: ["Today's vitals", "Vitals summary", "Current vitals", "Show vitals"], intentSummary: "data_retrieval → Card: vital parameters with flag badges need grid-based card layout" },
  // ── Action ──
  { kind: "ddx", family: "Action", description: "Differential diagnosis — 3 tiers with checkboxes.", intent: "clinical_decision", whenToShow: "'Suggest DDX' pill.", permutations: ["Single complaint", "Multiple complaints", "With lab correlation", "Emergency"], dataParams: "{context, options: DDXOption[]}", dataSources: "AI-generated from current symptoms, examination, labs, and clinical context. Cross-referenced with clinical protocols.", formattingNotes: "3-tier checkbox list: Most Likely (green), Possible (amber), Less Likely (slate). Rationale text under each option.", cannedMessages: ["Suggest DDX", "Differential diagnosis", "What could this be?", "Possible diagnoses"], intentSummary: "clinical_decision → Card: tiered selection with checkboxes requires interactive UI" },
  { kind: "protocol_meds", family: "Action", description: "Protocol medications with safety notes + copy to RxPad.", intent: "clinical_decision", whenToShow: "'Suggest medications' pill.", permutations: ["Single diagnosis", "Multi-diagnosis", "Pediatric dosing", "Renal-adjusted"], dataParams: "{diagnosis, meds, safetyCheck, copyPayload}", dataSources: "AI-generated from accepted diagnosis + clinical protocols. Cross-checked against patient allergies, renal function, age/weight for dosing.", formattingNotes: "Drug rows with name bold, dosage/timing/duration in structured columns. Safety check banner at top. Copy-to-RxPad button in footer.", cannedMessages: ["Suggest medications", "Protocol meds", "What should I prescribe?", "Treatment plan"], intentSummary: "clinical_decision → Card: medication list with safety checks and copy-to-RxPad needs card" },
  { kind: "investigation_bundle", family: "Action", description: "Suggested tests with rationale + copy.", intent: "clinical_decision", whenToShow: "'Suggest investigations' pill.", permutations: ["Initial workup", "Follow-up", "Pre-surgical", "Missing tests"], dataParams: "{title, items, copyPayload}", dataSources: "AI-generated from clinical context — suggested tests based on symptoms, differential, and missing data.", formattingNotes: "Checkbox list with test name and rationale below each. Copy-to-RxPad in footer. Selected tests highlighted.", cannedMessages: ["Suggest investigations", "What tests to order?", "Lab workup", "Missing tests"], intentSummary: "clinical_decision → Card: test selection with rationale and copy needs interactive card" },
  { kind: "follow_up", family: "Action", description: "Follow-up schedule radio selection.", intent: "action", whenToShow: "'Plan follow-up' pill.", permutations: ["Acute (3-5d)", "Chronic (2-4wk)", "Post-procedure"], dataParams: "{context, options: FollowUpOption[]}", dataSources: "AI-generated follow-up recommendations based on diagnosis acuity, treatment plan, and clinical protocols.", formattingNotes: "Radio-button list with follow-up intervals. Recommended option highlighted. Reason text under each option.", cannedMessages: ["Plan follow-up", "When should they return?", "Follow-up schedule", "Next visit"], intentSummary: "action → Card: radio selection for follow-up interval needs interactive UI" },
  { kind: "advice_bundle", family: "Action", description: "Patient advice list with copy + share.", intent: "action", whenToShow: "'Draft advice' pill.", permutations: ["General", "Condition-specific", "Post-procedure", "With share"], dataParams: "{title, items, shareMessage, copyPayload}", dataSources: "AI-generated patient advice based on diagnosis, medications, and clinical context. Share-ready format.", formattingNotes: "Bulleted advice items. Copy-all and share buttons in footer. Share preview in patient-friendly language.", cannedMessages: ["Draft advice", "Patient advice", "What to tell the patient?", "Discharge instructions"], intentSummary: "action → Card: advice list with copy and share actions needs card layout" },
  { kind: "rx_preview", family: "Action", description: "Full prescription preview with tag-based section headers.", intent: "action", whenToShow: "Near consultation completion.", permutations: ["Complete Rx", "Partial (missing)", "Multi-diagnosis"], dataParams: "RxPreviewCardData", dataSources: "Current RxPad state — compiled prescription with all sections (diagnosis, medication, investigation, advice, follow-up).", formattingNotes: "Tag-based section headers matching RxPad sections. Items listed per section. Complete/incomplete status indicators. Print-ready layout.", cannedMessages: ["Preview prescription", "Rx preview", "Show prescription", "Before I print"], intentSummary: "action → Card: full prescription preview with section headers needs structured card" },
  { kind: "voice_structured_rx", family: "Action", description: "Voice dictation parsed into RxPad sections.", intent: "action", whenToShow: "After voice input.", permutations: ["Full", "Partial", "With corrections"], dataParams: "VoiceStructuredRxData", dataSources: "Voice transcription parsed into structured RxPad sections by AI. Original voice text preserved for verification.", formattingNotes: "Section-tagged rows matching RxPad format (Symptoms, Examination, Diagnosis, Medication, etc.). Original voice text in collapsible block. Copy-all to RxPad in footer.", cannedMessages: ["Voice Rx", "Dictate prescription", "Voice input", "Speak prescription"], intentSummary: "action → Card: voice-parsed structured sections with copy-to-RxPad needs card layout" },
  // ── Analysis ──
  { kind: "ocr_pathology", family: "Analysis", description: "Pathology report OCR with flags and confidence.", intent: "document_analysis", whenToShow: "Upload pathology report.", permutations: ["CBC", "Lipid", "Renal/liver", "Low-confidence"], dataParams: "{title, category, parameters, normalCount}", dataSources: "Uploaded pathology report PDF — AI-extracted parameters with confidence scoring. Cross-referenced with reference ranges.", formattingNotes: "Grid rows with parameter name, value, reference range, and flag. Confidence dots (high=green, medium=amber, low=red). Normal count hidden by default.", cannedMessages: ["Analyze report", "Read pathology", "Extract lab values", "What does this report say?"], intentSummary: "document_analysis → Card: extracted parameters with flags and confidence need grid layout" },
  { kind: "ocr_extraction", family: "Analysis", description: "Full document extraction by section.", intent: "document_analysis", whenToShow: "Upload discharge/prescription.", permutations: ["Discharge summary", "Prescription", "Referral letter"], dataParams: "{title, category, sections}", dataSources: "Uploaded document PDF (discharge summary, prescription, referral) — AI-extracted sections with copy destinations.", formattingNotes: "Section-based extraction with icon-led headers. Items listed per section. Copy-to-RxPad destination labeled per section.", cannedMessages: ["Extract document", "Read this file", "What does this say?", "Parse upload"], intentSummary: "document_analysis → Card: multi-section document extraction with copy targets needs card" },
  // ── Clinical Problem ──
  { kind: "sbar_critical", family: "Clinical", description: "SBAR emergency triage with completeness ring.", intent: "data_retrieval", whenToShow: "Critical flags (SpO2 <90, critical labs).", permutations: ["Emergency", "Critical lab", "Vital deterioration"], dataParams: "SbarCriticalCardData", dataSources: "EMR critical flags — SpO₂, critical labs, vital deterioration. Active problems, allergies, key medications, recent ER visits.", formattingNotes: "Red-bordered urgent card. Situation text prominent. Critical flags with severity badges. Allergies and meds as tag pills. Completeness ring in header.", cannedMessages: ["Emergency summary", "Critical flags", "SBAR triage", "Urgent overview"], intentSummary: "data_retrieval → Card: emergency triage with critical flags needs high-visibility card layout" },
  { kind: "pomr_problem_card", family: "Clinical", description: "POMR single problem with completeness donut.", intent: "data_retrieval", whenToShow: "Chronic condition pills (CKD, DM, HTN).", permutations: ["CKD", "Diabetes", "HTN", "Anaemia", "High/low completeness"], dataParams: "PomrProblemCardData", dataSources: "EMR problem list — single chronic condition with related labs, meds, missing fields. Data completeness from EMR + AI sources.", formattingNotes: "Problem header with status badge and completeness donut. Lab rows with provenance dots. Missing fields as amber prompts. Source entries listed.", cannedMessages: ["CKD status", "Diabetes management", "HTN control", "Show [condition] card"], intentSummary: "data_retrieval → Card: problem-oriented view with completeness donut needs structured card" },
  // ── Utility & Safety ──
  { kind: "translation", family: "Utility", description: "Language translation side-by-side + copy.", intent: "action", whenToShow: "'Translate' pill.", permutations: ["Hindi", "Telugu", "Tamil", "Kannada", "Marathi"], dataParams: "TranslationData & {copyPayload}", dataSources: "AI translation engine — source text from RxPad or chat. Supports Hindi, Telugu, Tamil, Kannada, Marathi.", formattingNotes: "Side-by-side source and translated text. Language labels above each column. Copy-to-RxPad button for translated text.", cannedMessages: ["Translate", "Translate to Hindi", "Patient language", "Translate advice"], intentSummary: "action → Card: side-by-side translation with copy needs two-column card layout" },
  { kind: "drug_interaction", family: "Safety", description: "Drug-drug interaction alert with severity.", intent: "clinical_question", whenToShow: "'Check interactions' or auto-triggered.", permutations: ["Critical", "Major", "Moderate", "Clear"], dataParams: "DrugInteractionData", dataSources: "Drug interaction database — checked against current RxPad medications. Severity classification and recommended actions.", formattingNotes: "Alert banner with severity color (critical=red, major=orange, moderate=amber). Drug pair prominently displayed. Risk and action text below.", cannedMessages: ["Check interactions", "Drug interactions", "Is this combination safe?", "Interaction alert"], intentSummary: "clinical_question → Card: drug interaction alert with severity coloring needs card format" },
  { kind: "allergy_conflict", family: "Safety", description: "Drug-allergy conflict with alternatives.", intent: "clinical_question", whenToShow: "Auto-triggered on allergy match.", permutations: ["Direct match", "Cross-reactivity", "With alternatives"], dataParams: "AllergyConflictData", dataSources: "Patient allergy records cross-referenced with prescribed/being-prescribed medications. Alternative suggestions.", formattingNotes: "Red alert banner with drug-allergen pair. Alternative medication suggestion in green-tinted row. Auto-triggered format.", cannedMessages: ["Allergy check", "Is this safe for allergies?", "Allergy conflict", "Alternative medication"], intentSummary: "clinical_question → Card: allergy conflict alert with alternative suggestion needs card format" },
  { kind: "follow_up_question", family: "Utility", description: "Agent asks doctor for clarification.", intent: "follow_up", whenToShow: "Ambiguous input needs clarification.", permutations: ["Single-select", "Multi-select"], dataParams: "{question, options, multiSelect}", dataSources: "Internally generated by AI agent when input is ambiguous or insufficient for a confident response.", formattingNotes: "Question text prominent. Option buttons/chips below. Single-select as radio, multi-select as checkboxes.", cannedMessages: ["Clarify", "Which one?", "Can you specify?", "More details needed"], intentSummary: "follow_up → Card: clarification question with selectable options needs interactive card" },
  { kind: "clinical_guideline", family: "Utility", description: "Evidence-based guideline recommendations.", intent: "clinical_decision", whenToShow: "Guidelines query.", permutations: ["KDIGO", "ADA", "JNC", "NICE"], dataParams: "ClinicalGuidelineCardData", dataSources: "Clinical guideline databases — KDIGO, ADA, JNC, NICE. Evidence-level rated recommendations for specific conditions.", formattingNotes: "Condition and source in header. Recommendations as numbered list. Evidence level badge (A/B/C) with color coding.", cannedMessages: ["Clinical guideline", "What do guidelines say?", "Evidence-based recommendation", "KDIGO for CKD"], intentSummary: "clinical_decision → Card: guideline recommendations with evidence levels need structured card" },
  { kind: "referral", family: "Utility", description: "Referral summary — top referrers.", intent: "operational", whenToShow: "'Referral summary' pill.", permutations: ["By referrer", "By specialty", "Trends"], dataParams: "ReferralCardData", dataSources: "Operational database — referral records with referring doctor details, specialty, patient counts, top reasons.", formattingNotes: "List rows with doctor name, specialty, patient count, and top reason. Summary stats in header.", cannedMessages: ["Referral summary", "Top referrers", "Who refers patients?", "Referral analytics"], intentSummary: "operational → Card: referral list with stats needs structured card layout" },
  { kind: "completeness", family: "Utility", description: "Documentation completeness check with filled/empty sections.", intent: "operational", whenToShow: "'Completeness check' pill.", permutations: ["Mostly complete", "Mostly empty", "All filled"], dataParams: "{sections: CompletenessSection[], emptyCount}", dataSources: "Current RxPad state — analysis of filled vs empty documentation sections. Real-time completeness check.", formattingNotes: "Checklist rows with filled/empty status icons (green check/red x). Empty count badge in header. Section names in dark text.", cannedMessages: ["Completeness check", "Am I missing anything?", "Documentation status", "What's incomplete?"], intentSummary: "operational → Card: documentation checklist with fill status needs card layout" },
  { kind: "guardrail", family: "Utility", description: "Out-of-scope or policy-restricted response — explains why and suggests alternatives.", intent: "ambiguous", whenToShow: "When query is outside Dr. Agent's scope or restricted by policy.", permutations: ["Out of scope", "Policy restricted", "Requires human review"], dataParams: "GuardrailCardData", dataSources: "No external data — internally generated redirect card when query is out-of-scope or potentially unsafe.", formattingNotes: "Soft message explaining limitation. Suggestion pills below as horizontal scrollable chips. No severity coloring — neutral tone.", cannedMessages: ["Out of scope", "I can't help with that", "Not a clinical question", "Try rephrasing"], intentSummary: "ambiguous → Card: soft redirect with actionable suggestion pills needs card format" },
  // ── Text ──
  { kind: "text_fact", family: "Text", description: "Fact box with source citation.", intent: "clinical_question", whenToShow: "Short factual questions.", permutations: ["Medical fact", "Drug info", "Lab range"], dataParams: "{value, context, source}", dataSources: "AI-generated clinical knowledge response with source citation. Drug info, lab ranges, medical facts.", formattingNotes: "Fact value prominent in dark text. Context and source in lighter text below. Source as clickable citation.", cannedMessages: ["What is normal [param]?", "Drug dosage", "Quick fact", "Lab reference range"], intentSummary: "clinical_question → Card: cited fact with source needs minimal card shell" },
  { kind: "text_alert", family: "Text", description: "Severity-colored alert bar.", intent: "clinical_question", whenToShow: "Urgent message.", permutations: ["Critical", "Warning", "Info"], dataParams: "{message, severity}", dataSources: "System-generated or AI-triggered alert — urgent messages requiring doctor attention.", formattingNotes: "Severity-colored full-width bar (critical=red, high=orange, moderate=amber, low=blue). Message text in contrasting color.", cannedMessages: ["Alert", "Urgent notice", "Warning", "Critical message"], intentSummary: "clinical_question → Card: severity-colored alert needs visual formatting" },
  { kind: "text_list", family: "Text", description: "Bulleted list.", intent: "clinical_question", whenToShow: "List response.", permutations: ["Short", "Long"], dataParams: "{items}", dataSources: "AI-generated list response — bulleted items from clinical knowledge or patient data.", formattingNotes: "Simple bulleted list with consistent spacing. No special coloring — standard text.", cannedMessages: ["List options", "What are the causes?", "Side effects of [drug]", "Symptoms of [condition]"], intentSummary: "clinical_question → Card: bulleted list with consistent formatting needs card shell" },
  { kind: "text_step", family: "Text", description: "Numbered steps with blue border.", intent: "clinical_question", whenToShow: "Procedural instructions.", permutations: ["Clinical", "Patient", "Medication"], dataParams: "{steps}", dataSources: "AI-generated procedural instructions — step-by-step clinical, patient, or medication procedures.", formattingNotes: "Numbered steps with blue left border. Each step as a distinct row. Sequential reading flow.", cannedMessages: ["How to [procedure]?", "Steps for [treatment]", "Instructions", "Procedure steps"], intentSummary: "clinical_question → Card: numbered procedural steps need visual step formatting" },
  { kind: "text_quote", family: "Text", description: "Clinical quotation with attribution.", intent: "clinical_question", whenToShow: "Citing guidelines.", permutations: ["Guideline", "Textbook", "Research"], dataParams: "{quote, source}", dataSources: "Clinical guideline, textbook, or research citation — direct quote with attribution.", formattingNotes: "Indented blockquote with left border. Source attribution below in italics. Quotation marks styling.", cannedMessages: ["What does [guideline] say?", "Quote from [source]", "Cite reference", "Guideline text"], intentSummary: "clinical_question → Card: attributed quotation needs blockquote formatting" },
  { kind: "text_comparison", family: "Text", description: "Two-column comparison.", intent: "clinical_question", whenToShow: "Comparing two options.", permutations: ["Drug vs Drug", "Treatment comparison"], dataParams: "{labelA, labelB, itemsA, itemsB}", dataSources: "AI-generated comparison — two options side by side with bullet points for each.", formattingNotes: "Two-column layout with label headers. Bullet items under each column. Balanced width distribution.", cannedMessages: ["Compare [A] vs [B]", "Drug comparison", "Which is better?", "Treatment comparison"], intentSummary: "clinical_question → Card: two-column comparison needs side-by-side layout" },
  { kind: "patient_narrative", family: "Text", description: "Standalone patient narrative as violet-bordered paragraph.", intent: "data_retrieval", whenToShow: "Part of patient summary flow.", permutations: ["Short (1 line)", "Full (3-4 lines)"], dataParams: "{patientNarrative, specialtyTags, followUpOverdueDays}", dataSources: "AI-generated patient narrative from SmartSummaryData — synthesized clinical summary in natural language.", formattingNotes: "Violet-bordered paragraph block in italic. Specialty tags and follow-up overdue days as contextual badges above narrative.", cannedMessages: ["Patient narrative", "Clinical summary", "Tell me about this patient", "Quick narrative"], intentSummary: "data_retrieval → Card: narrative paragraph with contextual badges needs bordered card" },
  // ── Homepage ──
  { kind: "welcome_card", family: "Homepage", description: "Daily greeting with stats.", intent: "operational", whenToShow: "Homepage load.", permutations: ["Weekday", "Weekend"], dataParams: "WelcomeCardData", dataSources: "Operational database — today's appointment count, pending follow-ups, revenue snapshot, contextual tips.", formattingNotes: "Greeting with date. Stat cards in horizontal row with icons and colors. Quick action buttons below.", cannedMessages: ["Good morning", "Dashboard", "Today's overview", "Home"], intentSummary: "operational → Card: dashboard greeting with stats and actions needs card layout" },
  { kind: "patient_list", family: "Homepage", description: "Today's patient queue.", intent: "operational", whenToShow: "'Today's schedule' pill.", permutations: ["Full day", "Filtered"], dataParams: "PatientListCardData", dataSources: "Operational database — today's appointment schedule with patient details, status, and time slots.", formattingNotes: "List rows with patient name, age, gender, time, and status badge (color-coded). Total count in header.", cannedMessages: ["Today's patients", "Appointment list", "Who's next?", "Today's schedule"], intentSummary: "operational → Card: patient queue with status badges needs list card layout" },
  { kind: "patient_search", family: "Homepage", description: "Patient search with results.", intent: "operational", whenToShow: "Doctor types patient name.", permutations: ["Single match", "Multiple", "No match"], dataParams: "PatientSearchCardData", dataSources: "Patient database — search results matching name query. Includes appointment status and basic demographics.", formattingNotes: "Search result rows with patient name, meta info, and today's appointment indicator. Clickable rows.", cannedMessages: ["Search [name]", "Find patient", "Look up [name]", "Patient search"], intentSummary: "operational → Card: search results with clickable rows need card layout" },
  { kind: "follow_up_list", family: "Homepage", description: "Due/overdue follow-ups.", intent: "operational", whenToShow: "'Follow-ups due' pill.", permutations: ["This week", "Overdue"], dataParams: "FollowUpListCardData", dataSources: "Operational database — scheduled follow-ups with due dates, reasons, and overdue status.", formattingNotes: "List rows with patient name, scheduled date, reason, and overdue badge (red if overdue). Overdue count in header.", cannedMessages: ["Follow-ups due", "Overdue follow-ups", "Who needs follow-up?", "Pending follow-ups"], intentSummary: "operational → Card: follow-up list with overdue badges needs list card layout" },
  { kind: "revenue_bar", family: "Homepage", description: "Daily revenue stacked bars.", intent: "operational", whenToShow: "'Revenue today' pill.", permutations: ["Today", "This week"], dataParams: "RevenueBarCardData", dataSources: "Operational database — daily revenue data: paid, due, refunded amounts per day.", formattingNotes: "Stacked bar chart with paid (green), due (amber), refunded (red) segments. Total revenue summary above chart.", cannedMessages: ["Revenue today", "Daily revenue", "Billing chart", "Show earnings"], intentSummary: "operational → Card: stacked revenue bars with color segments need chart layout" },
  { kind: "bulk_action", family: "Homepage", description: "Batch SMS/email campaign.", intent: "operational", whenToShow: "'Send reminder' pill.", permutations: ["Follow-up SMS", "Appointment", "Custom"], dataParams: "BulkActionCardData", dataSources: "Operational database — recipient list for batch SMS/email campaigns. Message preview and recipient count.", formattingNotes: "Action type header. Message preview in bordered box. Recipient list/count. Send confirmation button.", cannedMessages: ["Send reminder", "Bulk SMS", "Notify patients", "Send follow-up reminders"], intentSummary: "operational → Card: batch action with preview and confirmation needs card layout" },
  { kind: "donut_chart", family: "Homepage", description: "Patient distribution donut.", intent: "operational", whenToShow: "'Demographics' pill.", permutations: ["Gender", "Age group", "Payment"], dataParams: "DonutChartCardData", dataSources: "Operational analytics — patient distribution data by category (gender, age group, payment type).", formattingNotes: "Donut chart with colored segments. Center label with total. Legend with segment labels and values.", cannedMessages: ["Demographics", "Patient distribution", "Gender breakdown", "Age distribution"], intentSummary: "operational → Card: donut chart visualization needs chart card layout" },
  { kind: "pie_chart", family: "Homepage", description: "Filled pie chart.", intent: "operational", whenToShow: "Alternative to donut.", permutations: ["Same as donut"], dataParams: "PieChartCardData", dataSources: "Operational analytics — same data sources as donut chart, rendered as filled pie.", formattingNotes: "Filled pie chart with colored segments. Legend with segment labels and values.", cannedMessages: ["Pie chart", "Distribution chart", "Show breakdown", "Category split"], intentSummary: "operational → Card: pie chart visualization needs chart card layout" },
  { kind: "line_graph", family: "Homepage", description: "Metric trend line.", intent: "operational", whenToShow: "'Patient trends' pill.", permutations: ["Footfall", "Revenue"], dataParams: "LineGraphCardData", dataSources: "Operational analytics — metric trends over time (footfall, revenue, patient count).", formattingNotes: "Line chart with data points. Average line overlay. Change percent badge (up green, down red). Title and period in header.", cannedMessages: ["Patient trends", "Footfall graph", "Show trend", "Weekly graph"], intentSummary: "operational → Card: trend line chart with change indicators needs chart layout" },
  { kind: "analytics_table", family: "Homepage", description: "KPI dashboard table.", intent: "operational", whenToShow: "'Weekly KPIs' pill.", permutations: ["Weekly", "Monthly"], dataParams: "AnalyticsTableCardData", dataSources: "Operational analytics — weekly/monthly KPI comparisons with delta calculations.", formattingNotes: "Table with metric name, this week, last week, delta, and direction arrow. Good/bad coloring on delta.", cannedMessages: ["Weekly KPIs", "Performance metrics", "Analytics dashboard", "How did we do?"], intentSummary: "operational → Card: KPI comparison table with deltas needs structured table layout" },
  { kind: "condition_bar", family: "Homepage", description: "Top conditions bars.", intent: "operational", whenToShow: "'Diagnosis distribution'.", permutations: ["Top 10", "Chronic"], dataParams: "ConditionBarCardData", dataSources: "Operational analytics — diagnosis distribution data with patient counts per condition.", formattingNotes: "Horizontal bar chart with condition labels. Color-coded bars. Count labels.", cannedMessages: ["Diagnosis distribution", "Top conditions", "Common diagnoses", "Disease breakdown"], intentSummary: "operational → Card: condition distribution bars need chart layout" },
  { kind: "heatmap", family: "Homepage", description: "Appointment density grid.", intent: "operational", whenToShow: "'Busiest hours' pill.", permutations: ["This week", "Month"], dataParams: "HeatmapCardData", dataSources: "Operational analytics — appointment density data by day and hour.", formattingNotes: "Grid with days as rows, hours as columns. Cell intensity coloring (low=light, high=dark).", cannedMessages: ["Busiest hours", "Appointment heatmap", "When am I busiest?", "Peak hours"], intentSummary: "operational → Card: density heatmap grid needs visual matrix layout" },
  { kind: "billing_summary", family: "Homepage", description: "Session billing overview.", intent: "operational", whenToShow: "'Billing overview' pill.", permutations: ["Today", "By status"], dataParams: "BillingSummaryCardData", dataSources: "Operational database — billing records with patient details, amounts, status (paid/due/refunded/deposited).", formattingNotes: "Summary stats in header (billed, collected, due, refunded). Item rows with reference number, patient name, amount, and status badge.", cannedMessages: ["Billing overview", "Today's billing", "Payment status", "Collection summary"], intentSummary: "operational → Card: billing data with status badges and totals needs structured card" },
  { kind: "external_cta", family: "Homepage", description: "External link (Excel/Word download).", intent: "operational", whenToShow: "Export or download ready.", permutations: ["Excel", "Word", "Custom URL"], dataParams: "ExternalCtaCardData", dataSources: "System-generated link — export/download URLs for Excel, Word, or custom external resources.", formattingNotes: "Title and description text. Prominent CTA button with link. Optional new-tab indicator.", cannedMessages: ["Download report", "Export data", "Open in Excel", "Download file"], intentSummary: "operational → Card: external link with CTA button needs minimal card shell" },
  { kind: "anc_schedule_list", family: "Homepage", description: "ANC schedule with overdue/due items per patient.", intent: "operational", whenToShow: "'ANC schedule' pill.", permutations: ["All due", "Overdue only", "By trimester"], dataParams: "ANCScheduleListCardData", dataSources: "Operational database — ANC schedule items across patients with due dates, gestational age, and overdue status.", formattingNotes: "List rows with patient name, ANC item, due week, gestational age, and overdue badge.", cannedMessages: ["ANC schedule", "Antenatal due list", "ANC overdue", "Pregnancy follow-ups"], intentSummary: "operational → Card: ANC schedule list with overdue tracking needs list card layout" },
  { kind: "follow_up_rate", family: "Homepage", description: "Follow-up rate analytics with trend.", intent: "operational", whenToShow: "'Follow-up rate' pill.", permutations: ["Weekly", "Monthly", "With overdue"], dataParams: "FollowUpRateCardData", dataSources: "Operational analytics — follow-up compliance rate with trend data, due/overdue/completed counts.", formattingNotes: "Rate percentage prominent. Comparison with last week. Due/overdue/completed counts. Trend line chart below.", cannedMessages: ["Follow-up rate", "Compliance rate", "Are patients returning?", "Follow-up analytics"], intentSummary: "operational → Card: rate analytics with trend line needs chart card layout" },
  { kind: "revenue_comparison", family: "Homepage", description: "Revenue comparison between two periods.", intent: "operational", whenToShow: "'Compare revenue' pill.", permutations: ["Week-on-week", "Month-on-month"], dataParams: "RevenueComparisonCardData", dataSources: "Operational database — revenue data for two time periods with deposits and refunds for comparison.", formattingNotes: "Two-period comparison with primary and compare columns. Revenue, refunded, deposits rows.", cannedMessages: ["Compare revenue", "Week-on-week", "Revenue comparison", "How does this compare?"], intentSummary: "operational → Card: two-period revenue comparison needs structured comparison layout" },
  { kind: "vaccination_due_list", family: "Homepage", description: "Patients with vaccinations due/overdue.", intent: "operational", whenToShow: "'Vaccination due list' pill.", permutations: ["Overdue", "Due this week", "By vaccine type"], dataParams: "VaccinationDueListCardData", dataSources: "Operational database — patients with vaccinations due or overdue, with vaccine name, dose, and due date.", formattingNotes: "List rows with patient name, vaccine name, dose, due date, and overdue badge.", cannedMessages: ["Vaccination due list", "Overdue vaccines", "Who needs vaccination?", "Vaccine reminders"], intentSummary: "operational → Card: vaccination due list with overdue badges needs list card layout" },
  { kind: "due_patients", family: "Homepage", description: "Patients with pending payment dues.", intent: "operational", whenToShow: "'Patients with due' pill.", permutations: ["This week", "Last 30 days", "All pending"], dataParams: "DuePatientsCardData", dataSources: "Operational database — patients with pending payment dues, total due amounts, and collection period.", formattingNotes: "Summary stats (patient count, total due, as-of date). CTA button for detailed view. Period label in header.", cannedMessages: ["Patients with dues", "Pending payments", "Outstanding dues", "Who owes?"], intentSummary: "operational → Card: due patient summary with CTA needs compact card layout" },
]

const INTENTS = [
  { id: "data_retrieval", label: "Data Retrieval", bg: "bg-blue-50", color: "text-blue-700" },
  { id: "clinical_decision", label: "Clinical Decision", bg: "bg-violet-50", color: "text-violet-700" },
  { id: "action", label: "Action", bg: "bg-emerald-50", color: "text-emerald-700" },
  { id: "comparison", label: "Comparison", bg: "bg-amber-50", color: "text-amber-700" },
  { id: "document_analysis", label: "Doc Analysis", bg: "bg-pink-50", color: "text-pink-700" },
  { id: "clinical_question", label: "Clinical Q", bg: "bg-teal-50", color: "text-teal-700" },
  { id: "operational", label: "Operational", bg: "bg-orange-50", color: "text-orange-700" },
  { id: "follow_up", label: "Follow-up", bg: "bg-indigo-50", color: "text-indigo-700" },
  { id: "ambiguous", label: "Ambiguous", bg: "bg-slate-100", color: "text-slate-600" },
]

const FAMILIES = [...new Set(CARD_SPECS.map(c => c.family))]
const FAMILY_COLORS: Record<string, string> = {
  Summary: "border-blue-200 bg-blue-50 text-blue-700",
  Data: "border-teal-200 bg-teal-50 text-teal-700",
  Action: "border-violet-200 bg-violet-50 text-violet-700",
  Analysis: "border-pink-200 bg-pink-50 text-pink-700",
  Clinical: "border-red-200 bg-red-50 text-red-700",
  Utility: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Safety: "border-red-200 bg-red-50 text-red-700",
  Text: "border-slate-200 bg-slate-50 text-slate-600",
  Operational: "border-orange-200 bg-orange-50 text-orange-700",
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

function ComprehensiveRef({ embedded = false }: { embedded?: boolean }) {
  const [mainTab, setMainTab] = useState<MainTab>("intent-classification")
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogFilter, setCatalogFilter] = useState("all")
  const [activePhase, setActivePhase] = useState("empty")
  const [expandedPrimitive, setExpandedPrimitive] = useState<string | null>(null)
  const [contentPrimitiveSidebarOpen, setContentPrimitiveSidebarOpen] = useState(false)
  const [selectedPrimitiveIndex, setSelectedPrimitiveIndex] = useState(0)
  const [rmTab, setRmTab] = useState<"pipeline" | "card-rules" | "copy-rules" | "clinical-framework">("pipeline")
  const [isDocHeaderVisible, setIsDocHeaderVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const filteredSpecs = useMemo(() => {
    const q = catalogSearch.toLowerCase()
    return CARD_SPECS.filter(c => {
      const matchSearch = !q || c.kind.includes(q) || c.description.toLowerCase().includes(q) || c.family.toLowerCase().includes(q)
      const matchFilter = catalogFilter === "all" || c.intent === catalogFilter || c.family === catalogFilter
      return matchSearch && matchFilter
    })
  }, [catalogSearch, catalogFilter])

  useEffect(() => {
    if (embedded) return

    const element = scrollContainerRef.current
    if (!element) return

    const handleScroll = () => {
      setIsDocHeaderVisible(element.scrollTop > 24)
    }

    handleScroll()
    element.addEventListener("scroll", handleScroll, { passive: true })
    return () => element.removeEventListener("scroll", handleScroll)
  }, [embedded])

  // ── CARD ANATOMY TAB ──
  function renderCardAnatomy() {
    return (
      <div className="space-y-8">
        {/* ── Story bridge from Intent Classification ── */}
        <div className="rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-2">
          <p className="text-[10px] leading-relaxed text-slate-500">
            <strong className="text-violet-600">From Intent Classification:</strong>{" "}
            Once the intent engine decides the response is a <strong className="text-slate-700">UI card</strong>, this is how it&apos;s built.
            Every card follows a <strong className="text-slate-700">4-zone anatomy</strong> with one of <strong className="text-slate-700">18 content zone types</strong>.
          </p>
        </div>

        {/* ── Page header ── */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50/60 via-white to-slate-50/80 px-5 py-4">
          <h3 className="text-[17px] font-bold text-slate-800 mb-0.5">Card Anatomy Blueprint</h3>
          <p className="text-[11px] leading-[1.6] text-slate-500 max-w-2xl">
            An <strong className="text-slate-700">8-section</strong> deep dive — from card architecture and rendering pipeline through the{" "}
            <strong className="text-slate-700">4-zone card structure</strong> (header, content, canned messages, footer),{" "}
            <strong className="text-slate-700">18 content zone types</strong>, and iPad/tablet considerations.
          </p>
        </div>

        {/* ═══ 1. CARD ARCHITECTURE ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">1</span>
            <h4 className="text-[15px] font-bold text-slate-800">Card Architecture</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">How a card is built — from the rendering pipeline through the universal CardShell to shared primitives.</p>

          {/* ── Step 1: Pipeline (compact horizontal strip) ── */}
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-900 px-4 py-3">
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-2">Rendering Pipeline</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
              {[
                { label: "Reply Engine", sub: "produces RxAgentOutput" },
                { label: "ChatBubble", sub: "receives { kind, data }" },
                { label: "CardRenderer", sub: "switch(kind) → component" },
                { label: "CardShell", sub: "universal wrapper" },
                { label: "Feedback Row", sub: "👍👎 + Source + Donut" },
              ].map((step, i) => (
                <span key={step.label} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-600">→</span>}
                  <span className="rounded bg-slate-800 border border-slate-700 px-2 py-1">
                    <span className="text-emerald-400 font-semibold">{step.label}</span>
                    <span className="text-slate-500 ml-1 text-[8px]">{step.sub}</span>
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[8px] text-slate-500">
              Every card is a member of a <strong className="text-emerald-400">discriminated union</strong> — the <code className="text-violet-400">kind</code> field picks the data shape. <strong className="text-emerald-400">63 card kinds.</strong>
            </p>
          </div>

          {/* ── Step 2: Card structure + Live preview ── */}
          <div className="mb-3 grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-[10px] bg-slate-900 px-3 py-3 font-mono text-[9px] leading-[1.5] text-emerald-300">
                <pre>{`┌─ CardShell ──────────────────────────────┐
│ HEADER                                  │
│ [icon] [title/subtitle] [copy] [tag] [^]│
├─────────────────────────────────────────┤
│ CONTENT                                 │
│ rows / tags / tables / charts / lists   │
├─────────────────────────────────────────┤
│ CANNED MESSAGES                         │
│ [Compare prev] [Show trend] [Next]      │
├─────────────────────────────────────────┤
│ FOOTER                                  │
│ 0 / 1 / 2 CTAs                         │
└─────────────────────────────────────────┘`}</pre>
              </div>
              <ul className="space-y-0.5 px-1">
                {[
                  "Header — identity layer: icon, title, metadata, shared controls (copy, collapse).",
                  "Content — main payload: structured rows, tags, charts, tables, or sectioned text.",
                  "Canned Messages — next-step suggestion pills between content and footer.",
                  "Footer — 0, 1, or 2 CTAs. Always the final zone.",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[9px] text-slate-600">
                    <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-violet-400" />{t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-[#F1F1F5] p-4">
              <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
              <LiveCardPreview kind="lab_panel" label="Full Card — all 4 zones" />
            </div>
          </div>

          {/* ── Step 3: CardShell Props + Shared Primitives (side by side) ── */}
          <div className="mb-3 grid gap-3 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[10px] font-bold text-slate-700">CardShell Props</p>
              </div>
              <table className="min-w-full text-[9px]">
                <tbody>
                  {[
                    { prop: "icon / tpIconName", ctrl: "Left icon in header (SVG or TP icon name)" },
                    { prop: "title", ctrl: "Card title text" },
                    { prop: "date / badge", ctrl: "Date badge or custom badge (e.g., '13 flagged')" },
                    { prop: "headerExtra", ctrl: "Slot after badge — used for completeness donut" },
                    { prop: "copyAll", ctrl: "Copy-all button handler for header copy icon" },
                    { prop: "collapsible", ctrl: "Can the card collapse? (boolean)" },
                    { prop: "actions", ctrl: "Canned message pill buttons below body" },
                    { prop: "sidebarLink", ctrl: "CTA at bottom below divider" },
                  ].map(item => (
                    <tr key={item.prop} className="border-b border-slate-50">
                      <td className="px-2.5 py-1 w-32 font-mono text-[8px] text-violet-600">{item.prop}</td>
                      <td className="px-2.5 py-1 text-slate-600">{item.ctrl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[10px] font-bold text-slate-700">Shared Primitives</p>
              </div>
              <div className="divide-y divide-slate-50 text-[9px]">
                {[
                  { name: "InlineDataRow", desc: "Key-value with provenance dots and flags" },
                  { name: "SectionTag", desc: "Section heading with icon — never text-only" },
                  { name: "DataRow", desc: "Simple key-value with optional copy button" },
                  { name: "CheckboxRow / RadioRow", desc: "Multi-select or single-select with reasoning" },
                  { name: "ChatPillButton", desc: "Canned message pill — triggers new query on tap" },
                  { name: "CopyIcon", desc: "Copy-to-clipboard with Linear→Bulk animation" },
                  { name: "DataCompletenessDonut", desc: "18px SVG donut: green=EMR, amber=AI, gray=missing" },
                ].map(item => (
                  <div key={item.name} className="flex items-baseline gap-2 px-2.5 py-1">
                    <span className="font-mono text-[8px] font-semibold text-violet-600 flex-shrink-0 w-32">{item.name}</span>
                    <span className="text-slate-600">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Step 4: Design Foundations — TP Design System tokens ── */}
          <div className="space-y-3">
            {/* Core Colors with TP tokens */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[10px] font-bold text-slate-700">Core Colors — TP Design System</p>
              </div>
              <table className="min-w-full text-[9px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50/40 text-left text-[8px] text-slate-400">
                  <th className="px-2 py-1 font-semibold w-6"></th>
                  <th className="px-2 py-1 font-semibold w-16">Role</th>
                  <th className="px-2 py-1 font-semibold w-24">Icon/Badge</th>
                  <th className="px-2 py-1 font-semibold w-24">Text</th>
                  <th className="px-2 py-1 font-semibold w-24">Background</th>
                  <th className="px-2 py-1 font-semibold">Usage</th>
                </tr></thead>
                <tbody>
                  {[
                    { hex: "#C8102E", role: "Critical", icon: "tp-error-600", text: "tp-error-700 #9F1239", bg: "tp-error-50 #FFF1F2", usage: "Abnormal labs, safety alerts, SBAR critical", dotClass: "bg-[#C8102E]" },
                    { hex: "#D97706", role: "Warning", icon: "tp-warning-600", text: "tp-warning-700 #B45309", bg: "tp-warning-50 #FFFBEB", usage: "Borderline, AI-extracted, overdue", dotClass: "bg-[#D97706]" },
                    { hex: "#059669", role: "Success", icon: "tp-success-600", text: "tp-success-700 #047857", bg: "tp-success-50 #ECFDF5", usage: "Normal values, EMR-verified, improving", dotClass: "bg-[#059669]" },
                    { hex: "#717179", role: "Neutral", icon: "tp-slate-500", text: "tp-slate-700 #454551", bg: "tp-slate-50 #FAFAFB", usage: "Labels, secondary text, dividers", dotClass: "bg-[#717179]" },
                    { hex: "#4B4AD5", role: "Action", icon: "tp-blue-500", text: "tp-blue-600 #3C3BB5", bg: "tp-blue-50 #EEEEFF", usage: "CTAs, pills, links, interactive", dotClass: "bg-[#4B4AD5]" },
                    { hex: "#8A4DBB", role: "AI", icon: "tp-violet-600", text: "tp-violet-800 #572A81", bg: "tp-violet-50 #FAF5FE", usage: "Narratives, agent-generated content", dotClass: "bg-[#8A4DBB]" },
                  ].map(item => (
                    <tr key={item.role} className="border-b border-slate-50">
                      <td className="px-2 py-1"><span className={`inline-block h-3 w-3 rounded-full ${item.dotClass}`} /></td>
                      <td className="px-2 py-1 font-semibold text-slate-700">{item.role}</td>
                      <td className="px-2 py-1 font-mono text-[8px] text-slate-500">{item.icon}</td>
                      <td className="px-2 py-1 font-mono text-[8px] text-slate-500">{item.text}</td>
                      <td className="px-2 py-1 font-mono text-[8px] text-slate-500">{item.bg}</td>
                      <td className="px-2 py-1 text-slate-600">{item.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {/* Typography */}
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <p className="text-[9px] font-bold text-slate-700 mb-1.5">Typography</p>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[8px] font-semibold text-slate-500 w-14">Headings</span>
                    <span className="text-[8px] text-slate-600">Mulish 600-700wt</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[8px] font-semibold text-slate-500 w-14">Body/UI</span>
                    <span className="text-[8px] text-slate-600">Inter 400-500wt</span>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 space-y-0.5">
                    <p className="text-[8px] text-slate-600"><strong className="font-mono text-[#454551]">tp-slate-700</strong> — primary text, key terms</p>
                    <p className="text-[8px] text-slate-600"><strong className="font-mono text-[#A2A2A8]">tp-slate-400</strong> — (parenthetical details)</p>
                    <p className="text-[8px] text-slate-600"><strong className="font-mono text-[#E2E2EA]">tp-slate-200</strong> — dividers &middot; | separators</p>
                  </div>
                </div>
              </div>

              {/* Spacing & Radius */}
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <p className="text-[9px] font-bold text-slate-700 mb-1.5">Spacing &amp; Radius</p>
                <div className="space-y-0.5">
                  {[
                    ["Card padding", "12-16px"],
                    ["Section gap", "8px"],
                    ["Row gap", "4-6px"],
                    ["Card radius", "12px"],
                    ["Inner radius", "8px"],
                    ["Border", "1px tp-slate-200 (#E2E2EA)"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline gap-1.5 text-[8px]">
                      <span className="font-semibold text-slate-500 w-20">{k}</span>
                      <span className="font-mono text-slate-600">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust signals — compact */}
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <p className="text-[9px] font-bold text-slate-700 mb-1.5">Trust Signals</p>
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[8px] font-semibold text-slate-600 mb-0.5">Data Provenance Dots</p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[8px] text-slate-500"><span className="h-[5px] w-[5px] rounded-full bg-[#059669]" />EMR <span className="font-mono text-[7px] text-slate-400">tp-success-600</span></span>
                      <span className="flex items-center gap-1 text-[8px] text-slate-500"><span className="h-[5px] w-[5px] rounded-full bg-[#D97706]" />AI <span className="font-mono text-[7px] text-slate-400">tp-warning-600</span></span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold text-slate-600 mb-0.5">Completeness Donut</p>
                    <p className="text-[8px] text-slate-500 leading-[1.3]">POMR, SBAR, OCR only. Not on summary, labs, DDX, vitals.</p>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <p className="text-[8px] font-semibold text-[#4B4AD5] mb-0.5">For AI/Backend</p>
                    <p className="text-[8px] text-slate-500 leading-[1.3]">kind must match one of 63 kinds. data shape must match TypeScript interface.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 2. HEADER ZONE ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">2</span>
            <h4 className="text-[15px] font-bold text-slate-800">Header Zone</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">Identity layer. Icon, title, optional metadata, and shared controls.</p>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {/* Element spec table */}
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <table className="min-w-full text-[10px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-2.5 py-1.5 font-semibold w-28">Element</th>
                    <th className="px-2.5 py-1.5 font-semibold">Specification</th>
                    <th className="px-2.5 py-1.5 font-semibold w-12 text-center">Always?</th>
                  </tr></thead>
                  <tbody>{HEADER_ELEMENTS.map(h => (
                    <tr key={h.element} className="border-b border-slate-50">
                      <td className="px-2.5 py-1 font-medium text-slate-700">{h.element}</td>
                      <td className="px-2.5 py-1 text-slate-600">{h.spec}</td>
                      <td className="px-2.5 py-1 text-center">{h.always ? <span className="text-emerald-600 font-bold">Yes</span> : <span className="text-slate-300">--</span>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              {/* Merged: mandatory rules + copy logic in one callout */}
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="px-2.5 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-blue-800 mb-1">Mandatory vs optional</p>
                  <ul className="space-y-0.5">
                    {HEADER_MANDATORY_RULES.map((rule, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[9px] leading-[1.45] text-blue-700">
                        <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />{rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-2.5 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-amber-800 mb-1">Copy icon logic</p>
                  <ul className="space-y-0.5">
                    {HEADER_COPY_RULES.map((rule, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[9px] leading-[1.45] text-amber-700">
                        <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />{rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-slate-700 mb-1">Copy functionality types</p>
                  <div className="space-y-0.5">
                    {[
                      ["Copy-all (Header)", "Copies entire card content as formatted text into RxPad or clipboard."],
                      ["Per-item copy", "Individual copy buttons on hover — protocol meds, advice items, lab values."],
                      ["Per-section copy", "Section-level copy for voice-structured-rx, OCR extraction, last visit."],
                    ].map(([type, desc]) => (
                      <p key={type} className="text-[9px] text-slate-600"><strong className="text-slate-700">{type}:</strong> {desc}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Header variant previews in gradient container */}
            <div className="rounded-xl bg-[#F1F1F5] p-4 space-y-3">
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
              <HeaderPreview label="Variant A — mandatory pieces only" title="Lab Panel" iconName="lab" alignCenter />
              <HeaderPreview label="Variant B — full mixed header" title="Last Visit Summary" subtitle="22 Feb'26" tag="Past Visit" iconName="medical-record" showCopy alignCenter />
            </div>
          </div>
        </section>

        {/* ═══ 3. CONTENT ZONE & TYPES ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">3</span>
            <h4 className="text-[15px] font-bold text-slate-800">Content Zone &amp; Types</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">18 content zone types power the content layer. Each maps to a data shape — the bridge between intent classification and visual output.</p>

          {/* Zone type categories overview */}
          <div className="mb-3 rounded-lg border border-violet-100 bg-violet-50/40 px-2.5 py-2">
            <p className="text-[10px] leading-relaxed text-violet-700">
              <strong>Link to Intent Classification:</strong> When the intent engine selects a card type, the{" "}
              <strong>content zone type</strong> is chosen based on the data shape. Time-series data uses <strong>Line/Bar Chart</strong>.
              Key-value pairs use <strong>Inline Data Rows</strong>. Multi-select options use <strong>Checkbox List</strong>.
            </p>
          </div>

          <div className="mb-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Data Display", color: "#3B82F6", zones: ["Inline Data Rows", "Flagged Data Rows", "Comparison Table", "Patient List", "KPI Table"] },
              { label: "Charts & Viz", color: "#059669", zones: ["Line Chart", "Bar Chart", "Donut / Pie Chart", "Heatmap Grid"] },
              { label: "Lists & Selection", color: "#D97706", zones: ["Checkbox List", "Radio List", "Bullet List"] },
              { label: "Specialized", color: "#8B5CF6", zones: ["Medication Display", "Clinical Narrative", "Translation Pair", "Drug Interaction", "Vaccination Schedule", "Timeline"] },
            ].map(cat => (
              <div key={cat.label} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[9px] font-bold" style={{ color: cat.color }}>{cat.label}</span>
                  <span className="ml-auto text-[8px] text-slate-400">{cat.zones.length}</span>
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {cat.zones.map(z => (
                    <span key={z} className="rounded bg-slate-50 px-1 py-[1px] text-[8px] text-slate-600 leading-tight">{z}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed zone grid */}
          <div className="mb-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_ZONE_TYPES_FOR_ANATOMY.map((cz) => (
              <div key={cz.zone} className="rounded-lg border border-slate-100 bg-white px-2.5 py-2 hover:shadow-sm transition-shadow">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="text-[11px]">{cz.icon}</span>
                  <span className="text-[9px] font-bold text-slate-800">{cz.zone}</span>
                </div>
                <p className="mb-0.5 text-[8px] leading-snug text-slate-500">{cz.description}</p>
                <p className="text-[8px] text-slate-400 leading-snug"><strong className="text-slate-500">Used in:</strong> {cz.usedIn}</p>
              </div>
            ))}
          </div>

          {/* Content element spec table */}
          <div className="mb-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full table-fixed text-[10px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="w-36 px-2.5 py-1.5 font-semibold">Element</th>
                <th className="w-[42%] px-2.5 py-1.5 font-semibold">Specification</th>
                <th className="w-[34%] px-2.5 py-1.5 font-semibold">Logic</th>
              </tr></thead>
              <tbody>{CONTENT_ELEMENT_SPECS.map(spec => (
                <tr key={spec.element} className="border-b border-slate-50">
                  <td className="px-2.5 py-1.5 align-top font-medium text-slate-700">{spec.element}</td>
                  <td className="px-2.5 py-1.5 align-top text-slate-600 leading-[1.5]">{spec.spec}</td>
                  <td className="px-2.5 py-1.5 align-top text-[9px] text-slate-500 leading-[1.5]">{spec.logic}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Content primitives — compact grid + sidebar trigger */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-slate-600">{CONTENT_PRIMITIVES.length} content primitives</p>
            <button onClick={() => { setContentPrimitiveSidebarOpen(true); setSelectedPrimitiveIndex(0); }} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 transition-colors">
              View all {CONTENT_PRIMITIVES.length} primitives →
            </button>
          </div>
          <div className="grid gap-1 sm:grid-cols-3 lg:grid-cols-4">
            {CONTENT_PRIMITIVES.map((cp, i) => (
              <button key={cp.name} onClick={() => { setContentPrimitiveSidebarOpen(true); setSelectedPrimitiveIndex(i); }}
                className="rounded-lg border border-slate-100 bg-white px-2 py-1.5 text-left hover:border-violet-200 hover:bg-violet-50/30 transition-colors group">
                <p className="text-[9px] font-semibold text-slate-700 group-hover:text-violet-700">{cp.name}</p>
                <p className="text-[8px] text-slate-400 truncate">{cp.usedIn[0]}{cp.usedIn.length > 1 ? ` +${cp.usedIn.length - 1}` : ""}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ═══ 4. SECTION TAGS ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">4</span>
            <h4 className="text-[15px] font-bold text-slate-800">Section Tags</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">{ALL_SECTION_TAGS.length} documented tags across all cards. Always paired with icons — never text-only.</p>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-[10px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-2.5 py-1.5 font-semibold w-12">Icon</th>
                    <th className="px-2.5 py-1.5 font-semibold w-32">Tag</th>
                    <th className="px-2.5 py-1.5 font-semibold">Used In</th>
                    <th className="px-2.5 py-1.5 font-semibold w-14">Variant</th>
                  </tr></thead>
                  <tbody>{ALL_SECTION_TAGS.map(t => (
                    <tr key={t.tag + t.usedIn} className="border-b border-slate-50">
                      <td className="px-2.5 py-1">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded ${t.variant === "specialty" ? "bg-tp-violet-50 text-tp-violet-600" : "bg-tp-slate-100 text-tp-slate-500"}`}>
                          <TagIconPreview iconName={t.iconName} variant={t.variant} size={12} />
                        </span>
                      </td>
                      <td className="px-2.5 py-1">
                        <SectionTag label={t.tag} icon={t.iconName} variant={t.variant} className="pointer-events-none" />
                      </td>
                      <td className="px-2.5 py-1 text-slate-600">{t.usedIn}</td>
                      <td className="px-2.5 py-1 text-slate-400">{t.variant}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <p className="text-[10px] font-semibold text-slate-700 mb-1">Tag Heading Rules</p>
                <p className="text-[9px] leading-[1.5] text-slate-600 mb-2">
                  Tags are the default visual language for section headings inside cards. Use a tag with its icon instead of plain text labels.
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <div className="rounded border border-slate-200 bg-white px-2.5 py-1.5">
                    <p className="text-[9px] font-semibold text-slate-700 mb-0.5">Inline Pattern</p>
                    <p className="text-[9px] leading-[1.4] text-slate-500 mb-1">Content reads as one continuous line or paragraph.</p>
                    <div className="text-[10px] leading-[1.6] text-slate-700">
                      <SectionTag label="Last Visit" icon={SECTION_TAG_ICON_MAP["Last Visit"]} className="pointer-events-none" />{" "}
                      Presented with fever, cough. Antibiotics for 5 days.
                    </div>
                  </div>
                  <div className="rounded border border-slate-200 bg-white px-2.5 py-1.5">
                    <p className="text-[9px] font-semibold text-slate-700 mb-0.5">Stacked Pattern</p>
                    <p className="text-[9px] leading-[1.4] text-slate-500 mb-1">Bullets, grouped items, or multiple rows below.</p>
                    <div>
                      <SectionTag label="Diagnosis" icon={SECTION_TAG_ICON_MAP["Diagnosis"]} className="pointer-events-none mb-0.5" />
                      <div className="space-y-[1px] pl-[2px] text-[9px] text-slate-600">
                        <p>&#8226; Viral upper respiratory infection</p>
                        <p>&#8226; Rule out secondary bacterial sinusitis</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="mt-2 space-y-0.5">
                  {[
                    "Multi-section cards should use tag headings for consistency across diagnosis, medication, investigations, etc.",
                    "Line/paragraph content: text starts on the same line as the tag. Bullet content: tag on its own line.",
                    "Icon and label colors must always match within a tag.",
                    "Catalog is open-ended — add new tags as needed, then reuse consistently.",
                  ].map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-slate-600">
                      <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <div className="rounded-xl bg-[#F1F1F5] p-4">
                <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
                <LiveCardPreview kind="last_visit" label="Last Visit with icon-led tags" highlightZone="content" />
              </div>
              <div className="rounded-xl bg-[#F1F1F5] p-4">
                <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
                <LiveCardPreview kind="rx_preview" label="Rx Preview with icon-led tags" highlightZone="content" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 5. PILLS / CANNED MESSAGES ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">5</span>
            <h4 className="text-[15px] font-bold text-slate-800">Pills / Canned Messages</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">Next-step suggestions above the footer. Help the doctor continue without typing.</p>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-[10px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-2.5 py-1.5 font-semibold w-24">Aspect</th>
                    <th className="px-2.5 py-1.5 font-semibold">Rule</th>
                  </tr></thead>
                  <tbody>
                    {[
                      ["Placement", "Always above footer, below content."],
                      ["Count", "Max 4 pills. Prefer strongest next steps."],
                      ["Length", "2-4 words each, glanceable and tappable."],
                      ["Type", "Next actions: compare, explain, trend, translate, continue, refine."],
                    ].map(([aspect, rule]) => (
                      <tr key={aspect} className="border-b border-slate-50">
                        <td className="px-2.5 py-1 font-medium text-slate-700">{aspect}</td>
                        <td className="px-2.5 py-1 text-slate-600">{rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-2">
                <p className="text-[10px] font-semibold text-blue-800 mb-1">How to generate canned messages</p>
                <ul className="space-y-0.5">
                  {PILL_LOGIC.generation.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-blue-700">
                      <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />{r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-emerald-700 mb-1">When shown</p>
                  <ul className="space-y-0.5">{PILL_LOGIC.when_shown.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-emerald-600">
                      <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{r}
                    </li>
                  ))}</ul>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-red-700 mb-1">When NOT shown</p>
                  <ul className="space-y-0.5">{PILL_LOGIC.when_not_shown.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-red-600">
                      <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />{r}
                    </li>
                  ))}</ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Visual example</p>
                <div className="flex flex-wrap gap-1">
                  {["Compare prev", "Show trend", "Suggest next steps", "Translate advice"].map((pill) => (
                    <span key={pill} className="inline-flex items-center rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-[#F1F1F5] p-4">
                <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
                <LiveCardPreview kind="lab_panel" label="Canned messages above footer" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 6. FOOTER & CTAs ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">6</span>
            <h4 className="text-[15px] font-bold text-slate-800">Footer &amp; CTAs</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">0, 1, or 2 CTAs. Secondary for actions, tertiary for navigation. Always the final zone.</p>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {/* Footer type table */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full text-[10px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-2.5 py-1.5 font-semibold w-24">Type</th>
                    <th className="px-2.5 py-1.5 font-semibold">When</th>
                    <th className="px-2.5 py-1.5 font-semibold w-36">Example</th>
                  </tr></thead>
                  <tbody>{FOOTER_CONFIG.scenarios.map(s => (
                    <tr key={s.type} className="border-b border-slate-50">
                      <td className="px-2.5 py-1 font-medium text-slate-700">{s.type}</td>
                      <td className="px-2.5 py-1 text-slate-600">{s.when}</td>
                      <td className="px-2.5 py-1 text-slate-400 text-[9px]">{s.example}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[9px] font-semibold text-slate-600 mb-0.5">Footer Rules</p>
                <ul className="space-y-0.5">{FOOTER_CONFIG.rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[9px] text-slate-500">
                    <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />{r}
                  </li>
                ))}</ul>
              </div>

              {/* CTA type split */}
              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-blue-600 px-2.5 py-1.5">
                    <p className="text-[9px] font-bold text-white uppercase tracking-wider">Secondary (Actions)</p>
                    <p className="text-[8px] text-blue-200 mt-0.5">Bordered, no arrow</p>
                  </div>
                  <div className="divide-y divide-slate-50 text-[9px]">
                    {["Send reminder", "Acknowledge", "Confirm and Send", "Submit", "Fill to RxPad", "Send via WhatsApp", "Print prescription", "Extend trial"].map(a => (
                      <p key={a} className="px-2.5 py-1 text-slate-600">{a}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-500 px-2.5 py-1.5">
                    <p className="text-[9px] font-bold text-white uppercase tracking-wider">Tertiary (Navigation)</p>
                    <p className="text-[8px] text-slate-300 mt-0.5">Text link + arrow</p>
                  </div>
                  <div className="divide-y divide-slate-50 text-[9px]">
                    {["View full lab report", "See all past visits", "View detailed history", "Open sidebar tab", "Know more", "View all patients"].map(n => (
                      <p key={n} className="px-2.5 py-1 text-slate-600">{n}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 opacity-70 mb-1">CTA Rules</p>
                <ul className="space-y-0.5">
                  {[
                    "Instant action (send, fill, acknowledge, print) = secondary CTA (bordered).",
                    "Navigation (open page, sidebar) = tertiary CTA (text link + arrow).",
                    "Action CTAs: no arrow. Navigation CTAs: always right arrow.",
                    "Max 2 CTAs per footer. One can be action + one navigation.",
                  ].map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-blue-700">
                      <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA variant previews */}
            <div className="rounded-xl bg-[#F1F1F5] p-4 space-y-2">
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
              <FooterVariantPreview label="Single CTA - Tertiary" variant="tertiary" align="left" ctas={[{ text: "Open Excel", icon: "right", iconKind: "arrow", tone: "blue", hug: true }]} />
              <FooterVariantPreview label="Single CTA - Secondary" variant="secondary" align="left" ctas={[{ text: "Acknowledge", icon: "left", iconKind: "check", tone: "green" }]} />
              <FooterVariantPreview label="Two CTAs - Tertiary" variant="tertiary" ctas={[{ text: "View full report", tone: "blue" }, { text: "Explore details", tone: "blue" }]} />
              <FooterVariantPreview label="Two CTAs - Secondary" variant="secondary" ctas={[{ text: "Confirm & Send", icon: "left", iconKind: "check", tone: "blue" }, { text: "Cancel", tone: "red" }]} />
            </div>
          </div>
        </section>

        {/* ═══ 7. SUPPORT ELEMENTS ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">7</span>
            <h4 className="text-[15px] font-bold text-slate-800">Support Elements</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">Feedback, data completeness, and source provenance signals that live outside the card body.</p>

          <div className="grid gap-3 lg:grid-cols-3">
            {/* Thumbs Up/Down */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[10px] font-bold text-slate-700">Thumbs Up / Down</p>
                <p className="text-[8px] text-slate-400">Response-quality feedback signal</p>
              </div>
              <div className="px-2.5 py-2 space-y-1.5">
                <div className="space-y-0.5 text-[9px] text-slate-600">
                  {[
                    ["Why", "Quick CSAT/DSAT feedback on response usefulness."],
                    ["Where", "Chat response support row, outside card body."],
                    ["When", "AI-generated responses where output quality matters."],
                    ["How", "One-time, binary, low-friction. Never compete with primary actions."],
                  ].map(([k, v]) => (
                    <p key={k}><strong className="text-slate-700">{k}:</strong> {v}</p>
                  ))}
                </div>
                <div className="rounded border border-slate-100 bg-slate-50 px-2 py-1.5">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Live</p>
                  <FeedbackRow messageId="doc-ref-feedback-preview" />
                </div>
              </div>
            </div>

            {/* Data Completeness Donut */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[10px] font-bold text-slate-700">Data Completeness Donut</p>
                <p className="text-[8px] text-slate-400">Trust signal for structured cards</p>
              </div>
              <div className="px-2.5 py-2 space-y-1.5">
                <div className="space-y-0.5 text-[9px] text-slate-600">
                  {[
                    ["Where", "Card header metadata area (headerExtra slot)."],
                    ["When", "Problem-oriented cards where completeness matters."],
                    ["Why", "Judge if card is EMR-backed, partially extracted, or missing data."],
                    ["Skip", "Free-form cards with no fixed completeness expectation."],
                  ].map(([k, v]) => (
                    <p key={k}><strong className="text-slate-700">{k}:</strong> {v}</p>
                  ))}
                </div>
                <div className="rounded border border-slate-100 bg-slate-50 px-2 py-1.5">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Live</p>
                  <DataCompletenessDonut emr={60} ai={25} missing={15} />
                </div>
                <p className="text-[8px] text-blue-600 leading-snug">Exception-based trust signal, not a default badge for all cards.</p>
              </div>
            </div>

            {/* Source Icon */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[10px] font-bold text-slate-700">Source Icon</p>
                <p className="text-[8px] text-slate-400">Provenance cue for trust</p>
              </div>
              <div className="px-2.5 py-2 space-y-1.5">
                <div className="space-y-0.5 text-[9px] text-slate-600">
                  {[
                    ["Why", "Show which source contributed to the response."],
                    ["When", "AI responses where provenance matters."],
                    ["Where", "Response support/meta area, not inside footer."],
                    ["How", "Compact icon + tooltip/popover for details."],
                  ].map(([k, v]) => (
                    <p key={k}><strong className="text-slate-700">{k}:</strong> {v}</p>
                  ))}
                </div>
                <div className="rounded border border-slate-100 bg-slate-50 px-2 py-1.5">
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Live</p>
                  <SourceInfoIcon sources={["EMR Records", "Lab Reports", "Uploaded Documents"]} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 8. iPad / TABLET ═══ */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">8</span>
            <h4 className="text-[15px] font-bold text-slate-800">iPad / Tablet</h4>
          </div>
          <p className="mb-4 ml-9 text-[11px] text-slate-400">Touch-first considerations for hover-dependent interactions.</p>

          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 opacity-70 mb-1">Why this matters</p>
            <ul className="space-y-0.5">
              {[
                "Many doctors use iPads in clinic. Hover-dependent interactions become invisible on touch.",
                "Tooltips triggered by hover never appear — critical information can be lost.",
                "Copy actions that rely on hover-reveal icons become undiscoverable.",
              ].map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[9px] text-amber-700">
                  <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />{r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-[9px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[8px]">
                  <th className="px-2 py-1.5 font-semibold uppercase tracking-wider text-slate-400 w-6">#</th>
                  <th className="px-2 py-1.5 font-semibold uppercase tracking-wider text-slate-400 w-28">Interaction</th>
                  <th className="px-2 py-1.5 font-semibold uppercase tracking-wider text-slate-400">Desktop</th>
                  <th className="px-2 py-1.5 font-semibold uppercase tracking-wider text-slate-400">iPad issue</th>
                  <th className="px-2 py-1.5 font-semibold uppercase tracking-wider text-slate-400">Fix</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: 1, interaction: "Header copy icon", desktop: "Appears on hover", issue: "Never appears", fix: "Always show on touch devices" },
                  { n: 2, interaction: "Tooltip on copy", desktop: "Hover shows tooltip", issue: "No tooltip on tap", fix: "Toast or inline label on tap" },
                  { n: 3, interaction: "Source icon tooltip", desktop: "Hover reveals sources", issue: "Info hidden", fix: "Tap to toggle popover" },
                  { n: 4, interaction: "Donut tooltip", desktop: "Hover shows breakdown", issue: "Percentages hidden", fix: "Tap to expand inline" },
                  { n: 5, interaction: "Pill hover states", desktop: "Background change on hover", issue: "No tap affordance", fix: "Default border/shadow on touch" },
                  { n: 6, interaction: "Table row hover", desktop: "Row highlight on hover", issue: "Dense tables harder to read", fix: "Zebra stripes on touch" },
                  { n: 7, interaction: "Accordion target", desktop: "Full row clickable", issue: "Target too small", fix: "Min 44px tap target (Apple HIG)" },
                  { n: 8, interaction: "Scrollable content", desktop: "Scroll wheel works", issue: "Touch scroll conflicts", fix: "Proper touch-scroll momentum" },
                  { n: 9, interaction: "Footer CTA spacing", desktop: "Comfortable spacing", issue: "Targets too close", fix: "Min 44x44px touch targets" },
                  { n: 10, interaction: "Severity badge", desktop: "Hover for explanation", issue: "Explanation hidden", fix: "Tap to expand inline" },
                  { n: 11, interaction: "Chat input", desktop: "Cmd+Enter to send", issue: "No keyboard shortcuts", fix: "Always-visible send button" },
                  { n: 12, interaction: "Context menu", desktop: "Right-click for options", issue: "No right-click", fix: "Long-press or explicit buttons" },
                ].map(item => (
                  <tr key={item.n} className="border-b border-slate-50 align-top">
                    <td className="px-2 py-1 text-slate-400 font-mono text-[8px]">{item.n}</td>
                    <td className="px-2 py-1 font-semibold text-slate-700">{item.interaction}</td>
                    <td className="px-2 py-1 text-slate-600">{item.desktop}</td>
                    <td className="px-2 py-1 text-red-600">{item.issue}</td>
                    <td className="px-2 py-1 text-emerald-700">{item.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-3">
            {[
              { title: "Always visible actions", desc: "Never hide primary actions behind hover. Copy, expand, source must be discoverable." },
              { title: "44px minimum targets", desc: "Apple HIG: 44x44pt min. All buttons, pills, headers, and CTAs must comply." },
              { title: "Tap replaces hover", desc: "Tooltips become popovers. Hover-reveals become always-visible or tap-to-toggle." },
            ].map(item => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <p className="text-[10px] font-semibold text-slate-800 mb-0.5">{item.title}</p>
                <p className="text-[9px] leading-[1.45] text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Responsive card specs */}
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
              <p className="text-[10px] font-bold text-slate-700">Dr. Agent Panel — Responsive Specs</p>
            </div>
            <table className="min-w-full text-[9px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50/40 text-left text-[8px] text-slate-400">
                <th className="px-2.5 py-1 font-semibold w-32">Property</th>
                <th className="px-2.5 py-1 font-semibold">Value</th>
                <th className="px-2.5 py-1 font-semibold">Notes</th>
              </tr></thead>
              <tbody>
                {[
                  { prop: "Panel min-width", val: "350px", note: "Below this, panel switches to full-width overlay mode" },
                  { prop: "Card max-width", val: "420px", note: "Cards fill available width but cap at this maximum" },
                  { prop: "iPad Landscape", val: "Panel as sidebar", note: "Panel sits alongside RxPad — side-by-side layout" },
                  { prop: "iPad Portrait", val: "Full-width overlay", note: "Panel takes full width as a sheet/overlay" },
                  { prop: "Touch scroll", val: "-webkit-overflow-scrolling: touch", note: "Momentum scrolling for long card content" },
                  { prop: "Min font size", val: "9px", note: "Never go below 9px on touch devices for readability" },
                  { prop: "Tap target min", val: "44 × 44px", note: "Apple HIG compliance — all interactive elements" },
                ].map(item => (
                  <tr key={item.prop} className="border-b border-slate-50">
                    <td className="px-2.5 py-1 font-medium text-slate-700">{item.prop}</td>
                    <td className="px-2.5 py-1 font-mono text-violet-600">{item.val}</td>
                    <td className="px-2.5 py-1 text-slate-500">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ CONTENT PRIMITIVE SIDEBAR ═══ */}
        {contentPrimitiveSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/30" onClick={() => setContentPrimitiveSidebarOpen(false)} />
            <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Content Primitive {selectedPrimitiveIndex + 1} / {CONTENT_PRIMITIVES.length}</p>
                  <h4 className="text-[15px] font-bold text-slate-800">{CONTENT_PRIMITIVES[selectedPrimitiveIndex].name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedPrimitiveIndex(i => Math.max(0, i - 1))} disabled={selectedPrimitiveIndex === 0} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-50">&larr; Prev</button>
                  <button onClick={() => setSelectedPrimitiveIndex(i => Math.min(CONTENT_PRIMITIVES.length - 1, i + 1))} disabled={selectedPrimitiveIndex === CONTENT_PRIMITIVES.length - 1} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-50">Next &rarr;</button>
                  <button onClick={() => setContentPrimitiveSidebarOpen(false)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50">&times;</button>
                </div>
              </div>
              {/* Body */}
              <div className="grid grid-cols-[200px_1fr] divide-x divide-slate-100">
                {/* Left nav */}
                <div className="h-[calc(100vh-56px)] overflow-y-auto bg-slate-50/50">
                  {CONTENT_PRIMITIVES.map((cp, i) => (
                    <button key={cp.name} onClick={() => setSelectedPrimitiveIndex(i)}
                      className={`w-full text-left px-3 py-2 text-[10px] border-b border-slate-100 transition-colors ${i === selectedPrimitiveIndex ? "bg-violet-50 text-violet-700 font-semibold border-l-2 border-l-violet-500" : "text-slate-600 hover:bg-slate-50"}`}>
                      {cp.name}
                    </button>
                  ))}
                </div>
                {/* Right content */}
                <div className="p-5 overflow-y-auto h-[calc(100vh-56px)]">
                  {(() => {
                    const cp = CONTENT_PRIMITIVES[selectedPrimitiveIndex]
                    const catalogEntry = findCatalogCard(cp.exampleCard)
                    return (
                      <div className="space-y-4">
                        <p className="text-[11px] leading-[1.6] text-slate-600">{cp.description}</p>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Used in cards</p>
                          <div className="flex flex-wrap gap-1">{cp.usedIn.map(u => <span key={u} className="rounded-full bg-violet-50 border border-violet-100 px-2 py-0.5 text-[9px] text-violet-600">{u}</span>)}</div>
                        </div>
                        {cp.variations && (
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Variations</p>
                            <div className="flex flex-wrap gap-1">{cp.variations.map(v => <span key={v} className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600">{v}</span>)}</div>
                          </div>
                        )}
                        {cp.fetchFrom && (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Fetch from</p>
                            <p className="text-[10px] leading-[1.5] text-slate-600">{cp.fetchFrom}</p>
                          </div>
                        )}
                        {cp.uiRule && (
                          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                            <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600 mb-0.5">UI rule</p>
                            <p className="text-[10px] leading-[1.5] text-emerald-700">{cp.uiRule}</p>
                          </div>
                        )}
                        {catalogEntry && (
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Live Preview — {catalogEntry.label}</p>
                            <div className="rounded-xl bg-[#F1F1F5] p-4">
                              <div className="w-full max-w-[380px]">
                                <CardRenderer output={catalogEntry.output} onPillTap={noop} onCopy={noop} onSidebarNav={noop} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }

  // ── CARD CATALOG TAB ──
  // Each card shows spec + live preview side by side
  function renderCardCatalog() {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-[16px] font-bold text-slate-800">All {CARD_SPECS.length} Card Types — The Card Bible</h3>
          <p className="text-[11px] text-slate-500 max-w-2xl">
            The complete reference for every UI card in Dr. Agent. Each entry documents: what triggers it (intent &amp; canned messages),
            where data comes from, how it&apos;s formatted, when to show it, what permutations exist, and a live preview with real mock data.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input type="text" placeholder="Search cards..." value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-violet-300 w-52" />
          <select value={catalogFilter} onChange={e => setCatalogFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 outline-none">
            <option value="all">All families</option>
            {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={catalogFilter === "all" || FAMILIES.includes(catalogFilter) ? "all" : catalogFilter}
            onChange={e => setCatalogFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 outline-none">
            <option value="all">All intents</option>
            {INTENTS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
          <span className="ml-auto text-[10px] text-slate-400">{filteredSpecs.length} cards</span>
        </div>

        {/* Family pills */}
        <div className="mb-4 flex flex-wrap gap-[6px]">
          <button
            type="button"
            onClick={() => setCatalogFilter("all")}
            className={`rounded-full px-3 py-[5px] text-[11px] font-medium transition-all ${
              catalogFilter === "all" ? "bg-violet-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({CARD_SPECS.length})
          </button>
          {FAMILIES.map(f => {
            const count = CARD_SPECS.filter(c => c.family === f).length
            return (
              <button key={f} type="button" onClick={() => setCatalogFilter(f)}
                className={`rounded-full px-3 py-[5px] text-[11px] font-medium transition-all ${
                  catalogFilter === f ? "bg-violet-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f} ({count})
              </button>
            )
          })}
        </div>

        {/* Cards — each with spec + live preview */}
        <div className="space-y-4">
          {filteredSpecs.map(card => {
            const catalogEntry = findCatalogCard(card.kind)
            const intent = INTENTS.find(i => i.id === card.intent)
            const familyColor = FAMILY_COLORS[card.family] || "border-slate-200 bg-slate-50 text-slate-600"
            return (
              <div key={card.kind} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {/* Card header bar */}
                <div className={`flex items-center gap-2 px-4 py-2 border-b border-slate-100 ${familyColor.split(" ").map(c => c.startsWith("bg-") ? c : "").join(" ").trim()}`}>
                  <code className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-mono text-violet-700 font-semibold">{card.kind}</code>
                  <span className="text-[11px] font-semibold">{card.family}</span>
                  {intent && (
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${intent.bg} ${intent.color}`}>{intent.label}</span>
                  )}
                </div>

                {/* Content: spec on left, live preview on right */}
                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  {/* Left: Spec info — flowing story */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-slate-700 leading-[1.6]">{card.description}</p>

                    {/* Intent & Triggers */}
                    {card.intentSummary && (
                      <div className="rounded-lg border border-violet-100 bg-violet-50/40 px-2.5 py-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-violet-500 mb-0.5">Intent &amp; Trigger</p>
                        <p className="text-[9px] text-violet-700 leading-[1.45]">{card.intentSummary}</p>
                        {card.cannedMessages?.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {card.cannedMessages.map((cm, i) => (
                              <span key={i} className="rounded-full border border-violet-200 bg-white px-2 py-[2px] text-[8px] font-medium text-violet-600">{cm}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Data Sources */}
                    {card.dataSources && (
                      <div className="flex items-start gap-1.5">
                        <span className="mt-[2px] text-[10px]">&#128451;</span>
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Data sources</span>
                          <p className="text-[10px] text-slate-600 leading-[1.5]">{card.dataSources}</p>
                        </div>
                      </div>
                    )}

                    {/* Formatting Notes */}
                    {card.formattingNotes && (
                      <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Formatting &amp; display</span>
                        <p className="text-[10px] text-slate-600 leading-[1.5] mt-0.5">{card.formattingNotes}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">When shown: </span>
                      <span className="text-[10px] text-slate-600">{card.whenToShow}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Data type: </span>
                      <code className="text-[10px] font-mono text-violet-600">{card.dataParams}</code>
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Permutations</p>
                      <div className="flex flex-wrap gap-1">
                        {card.permutations.map((p, i) => (
                          <span key={i} className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] text-slate-600">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Live card preview in gradient container */}
                  <div>
                    {catalogEntry ? (
                      <div className="rounded-xl bg-[#F1F1F5] p-4">
                        <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
                        <div className="w-full max-w-[380px]">
                          <CardRenderer
                            output={catalogEntry.output}
                            onPillTap={noop}
                            onCopy={noop}
                            onSidebarNav={noop}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[80px] rounded-xl border border-dashed border-slate-200 bg-slate-50">
                        <p className="text-[10px] text-slate-400">No preview data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-400">
          Showing {filteredSpecs.length} of {CARD_SPECS.length} card types
        </div>
      </div>
    )
  }

  // ── Shared doc-section wrapper ──
  const DocSection = ({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: React.ReactNode }) => (
    <div className="relative">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md bg-violet-600 text-[11px] font-bold text-white">{number}</span>
        <h4 className="text-[15px] font-bold text-slate-800">{title}</h4>
      </div>
      <p className="text-[11px] text-slate-500 mb-4 ml-[34px]">{subtitle}</p>
      <div className="ml-[34px]">{children}</div>
    </div>
  )

  // ── Callout box ──
  const Callout = ({ tone, label, children }: { tone: "blue" | "amber" | "emerald" | "rose"; label: string; children: React.ReactNode }) => {
    const styles = {
      blue: "border-blue-200 bg-blue-50/60 text-blue-800",
      amber: "border-amber-200 bg-amber-50/60 text-amber-800",
      emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
      rose: "border-rose-200 bg-rose-50/60 text-rose-800",
    }
    const dotStyles = { blue: "bg-blue-400", amber: "bg-amber-400", emerald: "bg-emerald-400", rose: "bg-rose-400" }
    return (
      <div className={`rounded-lg border px-4 py-3 ${styles[tone]}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1.5">{label}</p>
        <div className={`space-y-1.5 text-[11px] leading-[1.55] [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_span.dot]:mt-[5px] [&_span.dot]:h-[5px] [&_span.dot]:w-[5px] [&_span.dot]:flex-shrink-0 [&_span.dot]:rounded-full [&_span.dot]:${dotStyles[tone]}`}>
          {children}
        </div>
      </div>
    )
  }

  // ── RESPONSE MANAGEMENT TAB ──
  function renderResponseMgmt() {
    const RM_TABS = [
      { id: "pipeline" as const, label: "Pipeline & Phases" },
      { id: "card-rules" as const, label: "Card Rules" },
      { id: "copy-rules" as const, label: "Copy & Provenance" },
      { id: "clinical-framework" as const, label: "Clinical Framework" },
    ]

    return (
      <div className="space-y-8">
        {/* ── Page header ── */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50/80 via-white to-blue-50/60 px-6 py-5">
          <h3 className="text-[18px] font-bold text-slate-800 mb-1">Response Management Bible</h3>
          <p className="text-[12px] leading-[1.6] text-slate-500 max-w-2xl">
            The single operating reference for how Dr. Agent fetches, structures, shows, and copies data.
            Every card means the same thing across Card Anatomy, Card Catalog, and this section.
          </p>
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Historical sidebar sources</p>
              <div className="flex flex-wrap gap-1">
                {HISTORICAL_SOURCE_AREAS.map(area => (
                  <span key={area} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">{area}</span>
                ))}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1.5">RxPad fill targets</p>
              <div className="flex flex-wrap gap-1">
                {RXPAD_PRIMARY_TARGETS.map(area => (
                  <span key={area} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">{area}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sub-tabs ── */}
        <div className="flex gap-0 border-b border-slate-200">
          {RM_TABS.map(tab => (
            <button key={tab.id} onClick={() => setRmTab(tab.id)}
              className={`relative px-5 py-2.5 text-[12px] font-medium transition-colors ${
                rmTab === tab.id
                  ? "text-violet-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}>
              {tab.label}
              {rmTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-violet-600" />}
            </button>
          ))}
        </div>

        {/* ═══ TAB 1: Pipeline & Phases ═══ */}
        {rmTab === "pipeline" && (
          <div className="space-y-10">
            {/* 1. End-to-End Pipeline */}
            <DocSection number="1" title="End-to-End Pipeline" subtitle="From doctor input to rendered card — four sequential stages.">
              <div className="grid gap-3 lg:grid-cols-4">
                {[
                  { s: "1", t: "Input", icon: "keyboard", c: "from-blue-500 to-blue-600", d: "Doctor types or taps pill. Pill = direct PILL_INTENT_MAP lookup (90+ mappings). Text = normalize + keyword rules." },
                  { s: "2", t: "Classify", icon: "filter", c: "from-violet-500 to-violet-600", d: "37 keyword rules top-to-bottom. Operational checked first. Result: 1 of 9 intents + format (text/card)." },
                  { s: "3", t: "Build", icon: "build", c: "from-emerald-500 to-emerald-600", d: "Reply engine: intent + patient data + context = RxAgentOutput. POMR keywords = problem cards." },
                  { s: "4", t: "Render", icon: "screen", c: "from-amber-500 to-amber-600", d: "CardRenderer switch = component. Pills refreshed. Source provenance computed." },
                ].map((step, i) => (
                  <div key={step.s} className="relative rounded-xl border border-slate-200 bg-white px-4 py-4">
                    <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${step.c} text-[13px] font-bold text-white shadow-sm`}>
                      {step.s}
                    </div>
                    <p className="text-[13px] font-semibold text-slate-800 mb-1">{step.t}</p>
                    <p className="text-[11px] leading-[1.55] text-slate-500">{step.d}</p>
                    {i < 3 && <div className="absolute -right-[10px] top-1/2 z-10 hidden text-slate-300 lg:block">&#8594;</div>}
                  </div>
                ))}
              </div>
            </DocSection>

            {/* 2. 4-Layer Pill Priority */}
            <DocSection number="2" title="4-Layer Pill Priority" subtitle="Pills are generated using a layered priority system. Higher layers always override lower ones.">
              <div className="space-y-2">
                {[
                  { l: "Layer 1", p: "P 0-9", label: "Safety", c: "border-l-red-500 bg-red-50/50", tc: "text-red-700", tag: "bg-red-100 text-red-600", d: "ALWAYS shown. SpO2 <90 = 'Review SpO2'. Allergies = 'Allergy Alert'. force:true.", rule: "Cannot be dismissed or deprioritized" },
                  { l: "Layer 2", p: "P 10-29", label: "Clinical Flags", c: "border-l-amber-500 bg-amber-50/50", tc: "text-amber-700", tag: "bg-amber-100 text-amber-600", d: "Lab flags >=3, BP >140, SpO2 declining, specialty data, overdue follow-ups.", rule: "Shown when clinical thresholds are breached" },
                  { l: "Layer 3", p: "P 29-49", label: "Phase-Aware", c: "border-l-violet-500 bg-violet-50/50", tc: "text-violet-700", tag: "bg-violet-100 text-violet-600", d: "empty='Summary', symptoms='DDX', dx='Meds', meds='Translate', complete='Check'. + CKD/DM condition pills.", rule: "Changes based on consultation phase" },
                  { l: "Layer 4", p: "P 60-69", label: "Tab Lens", c: "border-l-blue-500 bg-blue-50/50", tc: "text-blue-700", tag: "bg-blue-100 text-blue-600", d: "Vitals tab='Vital trends', Lab='Lab comparison', History='Med history', Records='OCR'.", rule: "Lowest priority, context-dependent" },
                ].map(layer => (
                  <div key={layer.l} className={`rounded-lg border border-slate-200 border-l-[3px] ${layer.c} px-4 py-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${layer.tag}`}>{layer.l}</span>
                      <span className={`text-[12px] font-semibold ${layer.tc}`}>{layer.label}</span>
                      <span className="text-[10px] text-slate-400 ml-auto font-mono">{layer.p}</span>
                    </div>
                    <p className="text-[11px] leading-[1.5] text-slate-600">{layer.d}</p>
                    <p className="text-[10px] text-slate-400 mt-1 italic">{layer.rule}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* 3. Consultation Phases */}
            <DocSection number="3" title="Consultation Phases" subtitle="The phase engine detects where the doctor is in the consultation and adjusts pill suggestions accordingly.">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {/* Phase selector */}
                <div className="flex border-b border-slate-100 bg-slate-50/60 px-4 py-2 gap-1">
                  {[
                    { id: "empty", l: "Empty", icon: "circle" },
                    { id: "symptoms_entered", l: "Symptoms", icon: "edit" },
                    { id: "dx_accepted", l: "Dx Accepted", icon: "check" },
                    { id: "meds_written", l: "Meds Written", icon: "pill" },
                    { id: "near_complete", l: "Complete", icon: "done" },
                  ].map((p, i) => (
                    <button key={p.id} onClick={() => setActivePhase(p.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                        activePhase === p.id
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white hover:text-slate-700"
                      }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${activePhase === p.id ? "bg-white" : "bg-slate-300"}`} />
                      {p.l}
                    </button>
                  ))}
                </div>
                {/* Phase pills */}
                <div className="px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Suggested pills at this phase</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(activePhase === "empty" ? ["Patient summary", "Suggest DDX", "Lab overview", "Review intake data"] :
                      activePhase === "symptoms_entered" ? ["Suggest DDX", "Compare with last visit", "Vital trends"] :
                      activePhase === "dx_accepted" ? ["Suggest medications", "Suggest investigations", "Draft advice", "Plan follow-up"] :
                      activePhase === "meds_written" ? ["Translate to regional", "Plan follow-up", "Completeness check"] :
                      ["Completeness check", "Translate advice", "Visit summary"]
                    ).map(p => (
                      <span key={p} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </DocSection>

            {/* 4. Homepage vs Patient Context */}
            <DocSection number="4" title="Homepage vs Patient Context" subtitle="Dr. Agent operates differently depending on whether a patient is open or the doctor is on the homepage.">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <table className="min-w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                      <th className="px-4 py-2.5 w-24 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Aspect</th>
                      <th className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />Homepage
                        </span>
                      </th>
                      <th className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />Patient
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Cards", "Operational: queue, revenue, KPIs, analytics", "Clinical: summary, DDX, meds, labs, POMR"],
                      ["Pills", "Homepage engine, tab/rail overrides", "4-layer pipeline, safety forced"],
                      ["Phase", "No phase", "Full state machine"],
                      ["Intent", "Operational + comparison", "All 9 categories"],
                    ].map(([a, h, p]) => (
                      <tr key={a} className="border-b border-slate-50">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{a}</td>
                        <td className="px-4 py-2.5 text-slate-600">{h}</td>
                        <td className="px-4 py-2.5 text-slate-600">{p}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DocSection>
          </div>
        )}

        {/* ═══ TAB 2: Card Rules ═══ */}
        {rmTab === "card-rules" && (
          <div className="space-y-10">
            <DocSection number="1" title="Unified Card Rules" subtitle="Every card answers four questions: when to show, what to fetch, whether to allow copy, and how to structure UI.">
              {/* Group cards by family */}
              {(() => {
                const families = [...new Set(CARD_SPECS.map(c => c.family))]
                return (
                  <div className="space-y-6">
                    {families.map(family => {
                      const cards = CARD_SPECS.filter(c => c.family === family)
                      const familyColor = FAMILY_COLORS[family] || "border-slate-200 bg-slate-50 text-slate-600"
                      return (
                        <div key={family}>
                          {/* Family header */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${familyColor}`}>
                              {family}
                            </span>
                            <span className="text-[10px] text-slate-400">{cards.length} card{cards.length !== 1 ? "s" : ""}</span>
                            <div className="flex-1 border-b border-dashed border-slate-200" />
                          </div>
                          {/* Cards table for this family */}
                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="min-w-full text-[11px]">
                              <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[10px]">
                                  <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-36">Card</th>
                                  <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">When to show</th>
                                  <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">Fetch from</th>
                                  <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">UI rule</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cards.map((card, i) => (
                                  <tr key={card.kind} className={`align-top ${i < cards.length - 1 ? "border-b border-slate-50" : ""}`}>
                                    <td className="px-3 py-2.5">
                                      <code className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-mono text-violet-700">{card.kind}</code>
                                    </td>
                                    <td className="px-3 py-2.5 text-slate-600 leading-[1.5]">{card.whenToShow}</td>
                                    <td className="px-3 py-2.5 text-slate-500 leading-[1.5]">{getCardFetchFrom(card.kind)}</td>
                                    <td className="px-3 py-2.5 text-slate-500 leading-[1.5] italic">{getCardUiRule(card.kind)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </DocSection>
          </div>
        )}

        {/* ═══ TAB 3: Copy & Provenance ═══ */}
        {rmTab === "copy-rules" && (
          <div className="space-y-10">
            {/* 1. Copy Rules */}
            <DocSection number="1" title="Copy Rules" subtitle="Determines when the header copy icon appears and what content can be copied into RxPad.">
              <div className="space-y-3">
                {COPY_RULE_EXPLANATIONS.map((rule, i) => {
                  const tones = [
                    { border: "border-l-slate-400", bg: "bg-white" },
                    { border: "border-l-emerald-500", bg: "bg-emerald-50/30" },
                    { border: "border-l-blue-500", bg: "bg-blue-50/30" },
                    { border: "border-l-violet-500", bg: "bg-violet-50/30" },
                  ]
                  const tone = tones[i % tones.length]
                  return (
                    <div key={rule.title} className={`rounded-lg border border-slate-200 border-l-[3px] ${tone.border} ${tone.bg} px-4 py-3`}>
                      <p className="text-[12px] font-semibold text-slate-800 mb-1">{rule.title}</p>
                      <p className="text-[11px] leading-[1.6] text-slate-600">{rule.body}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5">
                <Callout tone="amber" label="Key principle">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[11px]">
                      <span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />
                      Copy icon appears only for newly generated content or Past Visit exception.
                    </li>
                    <li className="flex items-start gap-2 text-[11px]">
                      <span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />
                      Historical data displayed from sidebar = read-only, no copy icon.
                    </li>
                    <li className="flex items-start gap-2 text-[11px]">
                      <span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />
                      Copy never goes in the footer. Whole-card copy is always a header action.
                    </li>
                  </ul>
                </Callout>
              </div>
            </DocSection>

            {/* 2. Source Provenance */}
            <DocSection number="2" title="Source Provenance" subtitle="Where each card family gets its data, and how source trust is displayed to the doctor.">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                {/* Source mapping */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Data source by card type</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { card: "Summary", src: "EMR + Lab + Records + Visits + Intake", c: "text-blue-600" },
                      { card: "Lab / Trends", src: "Lab Results or Records", c: "text-teal-600" },
                      { card: "DDX / Meds", src: "Context + Protocol", c: "text-violet-600" },
                      { card: "POMR / SBAR", src: "History + Lab + Records (ring)", c: "text-red-600" },
                      { card: "Homepage", src: "No source provenance needed", c: "text-orange-600" },
                    ].map(row => (
                      <div key={row.card} className="flex items-center gap-3 px-4 py-2.5">
                        <span className={`w-24 flex-shrink-0 text-[11px] font-semibold ${row.c}`}>{row.card}</span>
                        <span className="text-[11px] text-slate-600">{row.src}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completeness ring rules */}
                <div className="space-y-3">
                  <Callout tone="blue" label="Completeness ring">
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-[11px]">
                        <span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />
                        Only on POMR, SBAR, and OCR cards.
                      </li>
                      <li className="flex items-start gap-2 text-[11px]">
                        <span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />
                        3 segments: EMR (purple) + AI (blue) + Missing (gray).
                      </li>
                      <li className="flex items-start gap-2 text-[11px]">
                        <span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />
                        Not shown on pure-EMR (always 100%) or pure-AI cards.
                      </li>
                    </ul>
                  </Callout>

                  <Callout tone="emerald" label="Preview — completeness donut">
                    <div className="flex items-center gap-3">
                      <DataCompletenessDonut emr={65} ai={25} missing={10} size={48} />
                      <div className="text-[11px] space-y-0.5">
                        <p><span className="font-semibold text-violet-600">65% EMR</span> — from historical data</p>
                        <p><span className="font-semibold text-blue-600">25% AI</span> — agent-generated</p>
                        <p><span className="font-semibold text-slate-400">10% Missing</span> — data not available</p>
                      </div>
                    </div>
                  </Callout>
                </div>
              </div>
            </DocSection>

            {/* 3. What this bible standardizes */}
            <DocSection number="3" title="Standardization Principles" subtitle="These principles ensure consistency across Card Anatomy, Card Catalog, and Response Management.">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { title: "Four questions", desc: "Every card answers: when to show, fetch from, copy eligibility, and UI structuring." },
                  { title: "Shared copy logic", desc: "Copy behavior is learned once from a shared rule section, not reinterpreted card by card." },
                  { title: "Consistent language", desc: "All three tabs describe the same system with the same terminology and conventions." },
                ].map(item => (
                  <div key={item.title} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[12px] font-semibold text-slate-800 mb-1.5">{item.title}</p>
                    <p className="text-[11px] leading-[1.55] text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* 4. Text Highlighting & Color Hierarchy */}
            <DocSection number="4" title="Text Highlighting and Color Hierarchy" subtitle="Primary clinical terms stay prominent. Supportive context in brackets becomes lighter.">
              <div className="space-y-4">
                <Callout tone="blue" label="Color rules">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Names (conditions, medications, lab values, vitals): tp-slate-700, font-medium</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Bracket content (durations, status, notes, dosage): tp-slate-400, font-normal</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Pipe dividers ( | ): tp-slate-200</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Commas: same color as surrounding text</li>
                  </ul>
                </Callout>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">Live rendering examples</p>
                  </div>
                  <div className="divide-y divide-slate-50 px-4 py-1">
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Diabetes</span><span className="text-slate-400"> (2 years</span><span className="text-slate-200"> | </span><span className="text-slate-400">Active)</span><span className="text-slate-700">, </span><span className="font-medium text-slate-700">Hypertension</span><span className="text-slate-400"> (5 years</span><span className="text-slate-200"> | </span><span className="text-slate-400">Active)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Cycle</span><span className="text-slate-400"> (35-40 days, Irregular)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Pain</span><span className="text-slate-400"> (Moderate, 6/10)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Type 2 DM</span><span className="text-slate-400"> (18 years, on insulin)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Amlodipine 10mg</span><span className="text-slate-400"> (1 tablet</span><span className="text-slate-200"> | </span><span className="text-slate-400">Once daily</span><span className="text-slate-200"> | </span><span className="text-slate-400">After food</span><span className="text-slate-200"> | </span><span className="text-slate-400">30 days)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Fever</span><span className="text-slate-400"> (2 days</span><span className="text-slate-200"> | </span><span className="text-slate-400">Moderate)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Ibuprofen</span><span className="text-slate-400"> (5 years</span><span className="text-slate-200"> | </span><span className="text-slate-400">Active)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Diabetes Mellitus</span><span className="text-slate-400"> (Father, Paternal Uncle)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">Appendectomy</span><span className="text-slate-400"> (2018</span><span className="text-slate-200"> | </span><span className="text-slate-400">Uncomplicated)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">HPV 1</span><span className="text-slate-400"> (Due</span><span className="text-slate-200"> | </span><span className="text-slate-400">14 Jan 2026)</span></p>
                    <p className="py-2 text-[13px]"><span className="font-medium text-slate-700">3 days</span><span className="text-slate-400"> (Recheck BP after medication adjustment)</span></p>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* 5. Data Formatting Convention */}
            <DocSection number="5" title="Data Formatting Convention" subtitle="Standard format for displaying structured clinical data. Primary name highlighted, supportive details in brackets. Follows actual RxPad input field structure.">
              <div className="space-y-4">
                {/* Standard format */}
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-[12px] font-bold text-slate-800 mb-3">Standard format</p>
                  <div className="rounded-lg bg-slate-900 px-4 py-3 font-mono text-[13px] text-emerald-300 leading-[1.7]">
                    <span className="text-amber-300">PrimaryName</span> <span className="text-slate-500">(</span><span className="text-slate-400">supportive detail</span><span className="text-slate-500">)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">Primary name is what the doctor looks for first. Supportive text (status, duration, notes) goes in brackets. Pipe dividers <code className="bg-slate-100 px-1 rounded text-[10px]">|</code> use tp-slate-200 (lightest). Commas use the same color as the text they sit in.</p>
                </div>

                {/* Color layering rule */}
                <Callout tone="blue" label="Color layering">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Primary name: <code className="bg-white/50 px-1 rounded text-[10px]">tp-slate-700, font-medium</code> (darkest, what doctor reads first)</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Supportive text in brackets: <code className="bg-white/50 px-1 rounded text-[10px]">tp-slate-400, font-normal</code> (lighter, secondary context)</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Pipe dividers ( | ): <code className="bg-white/50 px-1 rounded text-[10px]">tp-slate-200</code> (lightest, never competes with text)</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Commas: Same color as surrounding text (tp-slate-400 or tp-slate-700 depending on context)</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Subheading labels inside sections: <code className="bg-white/50 px-1 rounded text-[10px]">tp-slate-400</code> (e.g., "Since:", "Status:", "Relationship:")</li>
                  </ul>
                </Callout>

                {/* RxPad section-specific formatting — based on actual input fields */}
                {(() => {
                  // Helper to render bracket text with dividers in tp-slate-200 and text in tp-slate-400
                  const renderBracket = (bracket: string) => {
                    if (!bracket) return null
                    const parts = bracket.split(" | ")
                    return (
                      <span className="text-slate-400">
                        {" ("}
                        {parts.map((part, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-slate-200"> | </span>}
                            <span>{part}</span>
                          </React.Fragment>
                        ))}
                        {")"}
                      </span>
                    )
                  }

                  return (<>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">RxPad section formatting (based on actual input fields)</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { section: "Symptoms", fields: "Name (Since | Status | Notes)", primary: "Fever", bracket: "2 days | Moderate | No measured temperature" },
                      { section: "Examination", fields: "Name (Notes)", primary: "Lung Infection", bracket: "Mild crepitations in bilateral lower zones" },
                      { section: "Diagnosis", fields: "Name (Since | Status)", primary: "Viral Fever", bracket: "2 days | Active" },
                      { section: "Medication", fields: "Name Dose (Unit/Dose | Frequency | When | Duration | Notes)", primary: "Amlodipine 10mg", bracket: "1 tablet | Once daily | After food | 30 days" },
                      { section: "Advice", fields: "Name (Notes)", primary: "Monitor BP twice daily", bracket: "Record morning and evening readings" },
                      { section: "Lab Investigation", fields: "Test name (Notes)", primary: "Renal Function Panel", bracket: "Fasting sample required" },
                      { section: "Follow-up", fields: "Duration (Notes)", primary: "3 days", bracket: "Recheck BP after medication adjustment" },
                    ].map(item => (
                      <div key={item.section} className="px-4 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-violet-700">{item.section}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.fields}</span>
                        </div>
                        <p className="text-[12px]">
                          <span className="font-medium text-slate-700">{item.primary}</span>
                          {renderBracket(item.bracket)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical sidebar section formatting */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">Historical sidebar section formatting</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { section: "Medical Condition", fields: "Name (Duration | Status)", primary: "Type 2 Diabetes", bracket: "2 years | Active" },
                      { section: "Allergies", fields: "Name (Duration | Status)", primary: "Ibuprofen", bracket: "5 years | Active" },
                      { section: "Family History", fields: "Condition (Relationship)", primary: "Diabetes Mellitus", bracket: "Father, Paternal Uncle" },
                      { section: "Lifestyle", fields: "Name (Duration | Status)", primary: "Smoking", bracket: "10 years | Active" },
                      { section: "Surgical History", fields: "Name (Year | Remarks)", primary: "Appendectomy", bracket: "2018 | Uncomplicated" },
                    ].map(item => (
                      <div key={item.section} className="px-4 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-violet-700">{item.section}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.fields}</span>
                        </div>
                        <p className="text-[12px]">
                          <span className="font-medium text-slate-700">{item.primary}</span>
                          {renderBracket(item.bracket)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialty section formatting */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">Specialty section formatting (Gynec, Obstetric, Vitals, Vaccine, Growth)</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { section: "Gynec — Menarche", parts: [{ l: "Age at:", v: "13 years" }] },
                      { section: "Gynec — Cycle", parts: [{ l: "Type:", v: "Irregular" }, { l: "Interval:", v: "35-40 days" }] },
                      { section: "Gynec — Flow", parts: [{ l: "Volume:", v: "Heavy" }, { l: "Duration:", v: "5 days" }, { l: "Clots:", v: "Yes" }, { l: "Pads/day:", v: "5" }] },
                      { section: "Gynec — Pain", parts: [{ l: "Severity:", v: "None" }, { l: "Occurrence:", v: "Before Menses" }] },
                      { section: "Obstetric — Patient Info", parts: [{ l: "LMP:", v: "14 Jan'26" }, { l: "EDD:", v: "21 Oct'26" }, { l: "Gestation:", v: "14 Weeks 2 Days" }] },
                      { section: "Obstetric — GPLAE", parts: [{ l: "G:", v: "1" }, { l: "P:", v: "0" }, { l: "L:", v: "0" }, { l: "A:", v: "0" }, { l: "E:", v: "0" }] },
                      { section: "Vitals", parts: [{ l: "Temperature:", v: "99.2 Frh" }, { l: "Pulse:", v: "84 /min" }, { l: "SpO2:", v: "97%" }] },
                      { section: "Vaccine", parts: [{ l: "", v: "HPV 1" }, { l: "Status:", v: "Due" }, { l: "Given date:", v: "14 Jan'26" }] },
                      { section: "Growth", parts: [{ l: "Height:", v: "130 cm" }, { l: "Weight:", v: "12.8 kg" }, { l: "BMI:", v: "24.2 kg/m²" }] },
                    ].map(item => (
                      <div key={item.section} className="px-4 py-2.5">
                        <p className="text-[11px] font-semibold text-violet-700 mb-1">{item.section}</p>
                        <p className="text-[12px]">
                          {item.parts.map((p, i) => (
                            <span key={i}>
                              {i > 0 && <span className="text-slate-200"> | </span>}
                              {p.l && <span className="text-slate-400">{p.l} </span>}
                              <span className="font-medium text-slate-700">{p.v}</span>
                            </span>
                          ))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                </>)
                })()}
              </div>
            </DocSection>

            {/* 6. Document Upload Rules */}
            <DocSection number="6" title="Document Upload Rules" subtitle="How Dr. Agent handles uploaded documents, patient association, and contextual analysis.">
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <table className="min-w-full text-[11px]">
                    <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                      <th className="px-3 py-2 font-semibold w-36">Rule</th>
                      <th className="px-3 py-2 font-semibold">Description</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Patient context check</td><td className="px-3 py-2 text-slate-600">When a document is uploaded and the chat context is set to a specific patient, the document is automatically associated with that patient. No follow-up question needed.</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Clinic Overview upload</td><td className="px-3 py-2 text-slate-600">When a document is uploaded in Clinic Overview context, Dr. Agent must determine if the document is patient-specific (prescription, pathology report, discharge summary) or generic (Excel sheet, analytics report).</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Patient-specific docs</td><td className="px-3 py-2 text-slate-600">If the document appears to be a prescription, pathology report, radiology report, discharge summary, or vaccination record, Dr. Agent asks: "This looks like a patient document. Would you like to associate it with a patient?" with Yes/No options.</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Patient search card</td><td className="px-3 py-2 text-slate-600">If doctor says Yes, show a patient search card (follow-up question card) where the doctor can search and select a patient. The document is then saved against that patient.</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Generic documents</td><td className="px-3 py-2 text-slate-600">If the document is generic (Excel, CSV, PDF report, analytics), proceed directly with analysis. No patient association needed. Just summarize or process as requested.</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Doctor says No</td><td className="px-3 py-2 text-slate-600">If doctor declines patient association, proceed with document analysis (OCR extraction, summarization, key findings) without linking to any patient record.</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Document types that need patient</td><td className="px-3 py-2 text-slate-600">Pathology reports, radiology reports, prescriptions, discharge summaries, vaccination records, surgical notes, referral letters.</td></tr>
                      <tr><td className="px-3 py-2 font-medium text-slate-700">Document types that do NOT need patient</td><td className="px-3 py-2 text-slate-600">Excel spreadsheets, CSV files, clinic analytics, billing reports, insurance documents, general reference PDFs, clinical guidelines.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </DocSection>

            {/* 8. Edge Cases & Response Logic */}
            <DocSection number="7" title="Edge Cases and Response Logic" subtitle="How Dr. Agent handles ambiguous queries, large datasets, and multi-parameter requests.">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="divide-y divide-slate-50">
                    {[
                      {
                        scenario: "Patient list with 40+ patients",
                        question: "Doctor asks 'show today's schedule' with 40 patients in queue",
                        response: "Show first 7 patients in the card with a 'View all 40 patients' footer CTA. Clicking the CTA navigates to the appointment queue page (not a new chat card). The card is a preview, not a full list.",
                      },
                      {
                        scenario: "Vital trends without specifying which vital",
                        question: "Doctor asks 'show vital trends' without specifying BP, SpO2, Pulse, etc.",
                        response: "Agent asks a follow-up question: 'Which vital trend would you like to see?' with pill options for each available vital (BP, Pulse, SpO2, Temperature, Weight, BMI). Do not show all 12 vitals in one graph.",
                      },
                      {
                        scenario: "Multiple vital trends at once",
                        question: "Doctor asks 'show BP and SpO2 trends together'",
                        response: "Show max 2-3 parameters in a single chart (each as a separate line/series). If more than 3 requested, split into multiple cards. Graph toggle (Graph/Text + Line/Bar) is always shown.",
                      },
                      {
                        scenario: "Lab trends without specifying parameter",
                        question: "Doctor asks 'show lab trends'",
                        response: "Agent asks follow-up: 'Which lab parameter trend?' with pills for available parameters (HbA1c, eGFR, Creatinine, TSH, LDL, etc.). One parameter per trend card.",
                      },
                      {
                        scenario: "Medication history with multiple diagnoses",
                        question: "Patient has 5 active diagnoses and doctor asks 'show medication history'",
                        response: "Show medications only (drug name + dosage in brackets + date). Do NOT show diagnosis/DX per medication. The medication timeline is purely chronological, not diagnosis-grouped.",
                      },
                      {
                        scenario: "Lab panel reference ranges",
                        question: "Should reference ranges be shown inline or hidden?",
                        response: "Reference ranges are shown inline in a separate column (same as current). They use tp-slate-200 (lightest) so they do not compete with actual values. No eye icon needed.",
                      },
                      {
                        scenario: "Chart cards always show toggles",
                        question: "All chart-based cards (vital trends, lab trends, revenue, patient count, condition bars)",
                        response: "Every chart card must show two toggles: 1) Graph/Text toggle (left) 2) Line/Bar toggle (right, only in graph mode). Text mode shows the same data as a simple table.",
                      },
                      {
                        scenario: "Drug interaction with 10+ medications",
                        question: "CKD patient on 11 medications, multiple interactions possible",
                        response: "Show only the highest severity interaction as the primary card. If multiple critical interactions exist, stack max 2-3 cards. Do not flood the chat with 10 interaction cards.",
                      },
                      {
                        scenario: "Empty data scenarios",
                        question: "Doctor asks for lab trends but patient has no lab history",
                        response: "Show a text response: 'No lab results found for this patient. Consider ordering baseline labs.' Do not show an empty chart card.",
                      },
                    ].map(item => (
                      <div key={item.scenario} className="px-4 py-3">
                        <p className="text-[12px] font-semibold text-slate-700 mb-1">{item.scenario}</p>
                        <p className="text-[11px] text-slate-500 mb-1.5 italic">{item.question}</p>
                        <p className="text-[11px] text-slate-600 leading-[1.55]">{item.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DocSection>
          </div>
        )}

        {/* ═══ TAB 4: Clinical Framework ═══ */}
        {rmTab === "clinical-framework" && (
          <ClinicalFrameworkSection />
        )}

      </div>
    )
  }

  // ── USER SCENARIOS TAB (top-level) ──
  function renderUserScenarios() {
    return (
      <div className="space-y-10">

            {/* ── SECTION HEADER: Operational Context ── */}
            <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/40 px-6 py-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white text-[14px] font-bold">A</span>
                <div>
                  <h3 className="text-[17px] font-bold text-slate-800">Operational Context — Homepage & Clinic Overview</h3>
                  <p className="text-[11px] text-slate-500">Dr. Agent behavior when no patient is open. Focus is on clinic operations, scheduling, analytics, and billing.</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-[10px] font-medium text-orange-700">Appointment Page</span>
                <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-[10px] font-medium text-orange-700">Follow-ups Page</span>
                <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-[10px] font-medium text-orange-700">All Patients Page</span>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 line-through">Pharmacy — not supported</span>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 line-through">IPD — not supported</span>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 line-through">Daycare — not supported</span>
              </div>
            </div>

            {/* ─── A1. First-Time Doctor — No Data ─── */}
            <DocSection number="A1" title="First-Time Doctor — No Data" subtitle="Doctor just signed up. No appointments, no patients, no historical data. This is the onboarding moment.">
              <div className="space-y-4">
                {/* Welcome scenario */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">Scene</span>
                      <span className="text-[12px] font-semibold text-slate-800">Doctor opens Ask Tatva for the first time</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Card shown</p>
                        <p className="text-[11px] font-semibold text-orange-700">welcome_card</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Personalized greeting with empty stats — all counts at 0.</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Intro message</p>
                        <p className="text-[11px] text-slate-600">"Good morning, Dr. [Name]! Welcome to TatvaPractice. I'm Dr. Agent — your clinical AI assistant. Start by adding your first appointment."</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pills available</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">Add appointment</span>
                          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">Setup clinic profile</span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">Ask me anything</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-2.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">What the doctor could ask</p>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {[
                          { q: "How do I add my first patient?", card: "text_step", intent: "operational" },
                          { q: "What can you help me with?", card: "text_list", intent: "operational" },
                          { q: "How does billing work?", card: "text_fact", intent: "operational" },
                          { q: "Can you show me a demo?", card: "text_step", intent: "operational" },
                        ].map(item => (
                          <div key={item.q} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2">
                            <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                            <div>
                              <p className="text-[11px] text-slate-700">"{item.q}"</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">
                                <code className="bg-slate-100 px-1 rounded">{item.card}</code> · {item.intent}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* ─── A2. Doctor with Minimal / Partial Data ─── */}
            <DocSection number="A2" title="Doctor with Minimal Data" subtitle="Doctor has been using TatvaPractice for a few days. Some appointments exist, but limited history. Partial data across billing, patients, follow-ups.">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">Scene</span>
                      <span className="text-[12px] font-semibold text-slate-800">Doctor opens homepage — has 3 appointments today, 1 follow-up pending</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Card shown</p>
                        <p className="text-[11px] font-semibold text-orange-700">welcome_card</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Greeting with partial stats: Queued 3, Follow-ups 1, others at 0. Context line may show "3 patients waiting".</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Canned messages</p>
                        <p className="text-[11px] text-slate-600">Phase-based pills are limited because not all tab data exists. Tab lens pills only appear for tabs that have data.</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pills available</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">Today's schedule</span>
                          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">Follow-ups due</span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">Ask me anything</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-2.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">What the doctor could ask</p>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {[
                          { q: "Who's next in queue?", card: "patient_list", intent: "operational" },
                          { q: "Show today's schedule", card: "patient_list", intent: "operational" },
                          { q: "Any follow-ups pending?", card: "follow_up_list", intent: "operational" },
                          { q: "How many patients seen today?", card: "text_fact", intent: "operational" },
                          { q: "What's my revenue today?", card: "text_fact (no data)", intent: "operational" },
                          { q: "Send reminder to follow-up patients", card: "bulk_action", intent: "operational" },
                        ].map(item => (
                          <div key={item.q} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2">
                            <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                            <div>
                              <p className="text-[11px] text-slate-700">"{item.q}"</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">
                                <code className="bg-slate-100 px-1 rounded">{item.card}</code> · {item.intent}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Callout tone="amber" label="Partial data behavior">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Revenue charts show "No data yet" placeholder if billing module hasn't been used.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Analytics cards (heatmap, condition_bar, analytics_table) are only shown once sufficient data exists (7+ days of usage).</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Patient search always works even with 1 patient in the system.</li>
                  </ul>
                </Callout>
              </div>
            </DocSection>

            {/* ─── A3. Regular Doctor — Full Data ─── */}
            <DocSection number="A3" title="Regular Doctor — Full Data" subtitle="Established clinic. Full appointment queue, historical data, billing data, follow-ups, analytics. This is the primary daily usage scenario.">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">Scene</span>
                      <span className="text-[12px] font-semibold text-slate-800">Doctor opens homepage — full day of appointments, analytics available</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Card shown</p>
                        <p className="text-[11px] font-semibold text-orange-700">welcome_card</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Full stats: Queued 7, Follow-ups 3, Finished 12, Drafts 2, Cancelled 1. Context: "Clinic running on time · Next: Priya Rao (follow-up)".</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Canned messages</p>
                        <p className="text-[11px] text-slate-600">Full set of homepage pills — schedule, follow-ups, revenue, demographics, analytics, search, and bulk actions.</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pills available</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {["Today's schedule", "Follow-ups due", "Revenue today", "Demographics", "Weekly KPIs", "Busiest hours", "Send reminders", "Search patient"].map(p => (
                            <span key={p} className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All possible asks — comprehensive table */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">All possible operational asks — full data scenario</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/40 text-left text-[10px]">
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-8">#</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">Doctor asks</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-32">Card response</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-24">Intent</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { n: 1, q: "Who's next?", card: "patient_list", intent: "operational", note: "Shows queue sorted by token/time" },
                          { n: 2, q: "Today's schedule / How many patients today?", card: "patient_list", intent: "operational", note: "Full queue with status badges" },
                          { n: 3, q: "Search Ramesh Kumar", card: "patient_search", intent: "operational", note: "Name-based search across all patients" },
                          { n: 4, q: "Follow-ups due this week", card: "follow_up_list", intent: "operational", note: "Due + overdue follow-ups" },
                          { n: 5, q: "Overdue follow-ups", card: "follow_up_list", intent: "operational", note: "Filtered to overdue only" },
                          { n: 6, q: "Revenue today / How much collected?", card: "revenue_bar", intent: "operational", note: "Stacked bar — OPD, procedures, pharmacy" },
                          { n: 7, q: "Revenue this week", card: "revenue_bar", intent: "operational", note: "Week view with daily breakdown" },
                          { n: 8, q: "Patient demographics / Gender split", card: "donut_chart", intent: "operational", note: "Donut: male/female/other" },
                          { n: 9, q: "Age distribution", card: "pie_chart", intent: "operational", note: "Pie: 0-18, 18-40, 40-60, 60+" },
                          { n: 10, q: "Patient trends this month", card: "line_graph", intent: "operational", note: "Footfall trend line" },
                          { n: 11, q: "Weekly KPIs / Performance", card: "analytics_table", intent: "operational", note: "Table: patients, avg time, revenue" },
                          { n: 12, q: "Busiest hours / When am I busiest?", card: "heatmap", intent: "operational", note: "Hour × day density grid" },
                          { n: 13, q: "Top conditions / Diagnosis distribution", card: "condition_bar", intent: "operational", note: "Horizontal bars: top 10 diagnoses" },
                          { n: 14, q: "Billing overview / Pending bills", card: "billing_summary", intent: "operational", note: "Session billing with status" },
                          { n: 15, q: "Send reminder to all follow-up patients", card: "bulk_action", intent: "operational", note: "Batch SMS/WhatsApp campaign" },
                          { n: 16, q: "Send appointment reminder", card: "bulk_action", intent: "operational", note: "Filter: tomorrow's appointments" },
                          { n: 17, q: "Download patient report / Export", card: "external_cta", intent: "operational", note: "Excel/Word download CTA" },
                          { n: 18, q: "Referral summary", card: "referral", intent: "operational", note: "Top referrers, specialties" },
                          { n: 19, q: "How many cancelled today?", card: "text_fact", intent: "operational", note: "Quick stat from queue data" },
                          { n: 20, q: "Compare this week vs last week", card: "text_comparison", intent: "comparison", note: "Side-by-side: footfall, revenue, avg" },
                          { n: 21, q: "What drugs do I prescribe most?", card: "condition_bar", intent: "operational", note: "Top medications frequency" },
                          { n: 22, q: "Any pending digitisation?", card: "text_fact", intent: "operational", note: "Count of undigitized records" },
                        ].map(item => (
                          <tr key={item.n} className="border-b border-slate-50 align-top">
                            <td className="px-3 py-2 text-slate-400 font-mono text-[10px]">{item.n}</td>
                            <td className="px-3 py-2 text-slate-700">&ldquo;{item.q}&rdquo;</td>
                            <td className="px-3 py-2"><code className="rounded bg-orange-50 border border-orange-200 px-1.5 py-0.5 text-[10px] text-orange-700">{item.card}</code></td>
                            <td className="px-3 py-2 text-slate-500">{item.intent}</td>
                            <td className="px-3 py-2 text-slate-500 text-[10px]">{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* ─── A4. Operational — Page-Specific Canned Messages ─── */}
            <DocSection number="A4" title="Page-Specific Canned Messages — Operational" subtitle="When the doctor navigates to different pages within operational context, pills change to reflect that page's focus.">
              <div className="space-y-3">
                {[
                  { page: "Appointment Page", pills: ["Today's schedule", "Who's next?", "Queue overview", "Search patient", "Cancelled today", "Pending digitisation"], cardTypes: ["patient_list", "patient_search", "welcome_card", "text_fact"], border: "border-l-orange-500" },
                  { page: "Follow-ups Page", pills: ["Follow-ups due", "Overdue follow-ups", "Send reminder", "This week's follow-ups", "Follow-up trends"], cardTypes: ["follow_up_list", "bulk_action", "line_graph"], border: "border-l-blue-500" },
                  { page: "All Patients Page", pills: ["Search patient", "Demographics", "Patient count", "Recent patients", "Top conditions"], cardTypes: ["patient_search", "donut_chart", "text_fact", "condition_bar"], border: "border-l-violet-500" },
                  { page: "OPD Billing Page", pills: ["Billing overview", "Revenue today", "Pending bills", "Payment split", "Download report"], cardTypes: ["billing_summary", "revenue_bar", "text_fact", "external_cta"], border: "border-l-emerald-500" },
                ].map(item => (
                  <div key={item.page} className={`rounded-xl border border-slate-200 border-l-[3px] ${item.border} bg-white px-4 py-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[12px] font-semibold text-slate-800">{item.page}</p>
                      <div className="flex gap-1">
                        {item.cardTypes.map(c => (
                          <code key={c} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{c}</code>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.pills.map(p => (
                        <span key={p} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>


            {/* ════════════════════════════════════════════════════════════════ */}
            {/* SECTION B: PATIENT CONTEXT                                     */}
            {/* ════════════════════════════════════════════════════════════════ */}

            <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-blue-50/40 px-6 py-5 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white text-[14px] font-bold">B</span>
                <div>
                  <h3 className="text-[17px] font-bold text-slate-800">Patient Context — Inside a Consultation</h3>
                  <p className="text-[11px] text-slate-500">Dr. Agent behavior when a patient is open. Context changes based on the page, consultation phase, patient history, and data completeness.</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">RxPad Page</span>
                <span className="rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">Patient Detail Page</span>
                <span className="rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">Print Preview Page</span>
                <span className="rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">Appointment Queue Click</span>
              </div>
            </div>

            {/* ─── B1. First-Time Patient — No History ─── */}
            <DocSection number="B1" title="First-Time Patient — No History" subtitle="Patient visiting the clinic for the first time. No past visits, no lab results, no chronic conditions. Fresh encounter.">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-50 to-blue-50 px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">Scene</span>
                      <span className="text-[12px] font-semibold text-slate-800">Doctor clicks a new patient from queue — enters RxPad</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phase</p>
                        <p className="text-[11px] font-semibold text-violet-700">Empty</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">RxPad is blank. No symptoms, no diagnosis, no medications entered yet.</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Auto-shown card</p>
                        <p className="text-[11px] font-semibold text-violet-700">patient_summary (minimal)</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Shows basic demographics only: name, age, gender, contact. No history sections. Summary shows "First visit" badge.</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pills at this phase</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {["Review intake data", "Suggest DDX", "Ask me anything"].map(p => (
                            <span key={p} className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Phase progression for first-time patient */}
                    <div className="border-t border-dashed border-slate-200 pt-2.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Consultation phase progression</p>
                      <div className="space-y-2">
                        {[
                          { phase: "Empty", trigger: "Patient opened", pills: ["Review intake data", "Suggest DDX", "Ask me anything"], cards: ["patient_summary (minimal)"], color: "border-l-slate-400 bg-slate-50/30" },
                          { phase: "Symptoms Entered", trigger: "Doctor types chief complaint", pills: ["Suggest DDX", "Initial investigations", "Compare vitals"], cards: ["ddx", "investigation_bundle"], color: "border-l-blue-400 bg-blue-50/30" },
                          { phase: "Dx Accepted", trigger: "Doctor selects a diagnosis", pills: ["Suggest medications", "Suggest investigations", "Draft advice", "Plan follow-up"], cards: ["protocol_meds", "investigation_bundle", "advice_bundle", "follow_up"], color: "border-l-violet-400 bg-violet-50/30" },
                          { phase: "Meds Written", trigger: "Doctor adds medications", pills: ["Translate to regional", "Plan follow-up", "Completeness check"], cards: ["translation", "follow_up", "completeness"], color: "border-l-emerald-400 bg-emerald-50/30" },
                          { phase: "Near Complete", trigger: "Most RxPad fields filled", pills: ["Completeness check", "Translate advice", "Visit summary"], cards: ["completeness", "translation", "rx_preview"], color: "border-l-green-500 bg-green-50/30" },
                        ].map(step => (
                          <div key={step.phase} className={`rounded-lg border border-slate-200 border-l-[3px] ${step.color} px-4 py-2.5`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-semibold text-slate-800">{step.phase}</span>
                              <span className="text-[10px] text-slate-400">— {step.trigger}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-wrap gap-1">
                                {step.pills.map(p => (
                                  <span key={p} className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] text-violet-600">{p}</span>
                                ))}
                              </div>
                              <div className="flex gap-1 ml-auto">
                                {step.cards.map(c => (
                                  <code key={c} className="rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-500">{c}</code>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Callout tone="blue" label="First-time patient behavior">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />No "Last visit details" pill — no previous visit exists.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />No lab trends, vital trends, or med history — all require prior data.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Specialty pills (obstetric, gynec, pediatric, ophthal) only appear if specialty data is entered in this visit.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />If symptom collector intake exists, "Review intake data" pill shows symptom_collector card.</li>
                  </ul>
                </Callout>
              </div>
            </DocSection>

            {/* ─── B2. Regular Patient — Full History ─── */}
            <DocSection number="B2" title="Regular Patient — Full History" subtitle="Returning patient with past visits, lab results, medications, chronic conditions. All sidebar historical modules populated.">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-50 to-blue-50 px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">Scene</span>
                      <span className="text-[12px] font-semibold text-slate-800">Doctor opens regular patient with CKD, DM, labs, past visits, medications</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Auto-shown card</p>
                        <p className="text-[11px] font-semibold text-violet-700">patient_summary (full)</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Comprehensive: vitals, labs, chronic flags, active meds, allergies. Completeness donut in header for POMR.</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Safety pills (forced)</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] text-red-700">Allergy Alert</span>
                          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] text-red-700">Drug interaction</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Layer 1 — always forced if applicable.</p>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Clinical flag pills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {["3 lab flags", "BP attention", "CKD review", "DM glycemic", "Overdue follow-up"].map(p => (
                            <span key={p} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comprehensive table of all possible patient-context asks */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">All possible patient-context asks — regular patient with full data</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/40 text-left text-[10px]">
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-8">#</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-20">Category</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">Doctor asks</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-36">Card response</th>
                          <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-28">Intent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          // Summary & Overview
                          { n: 1, cat: "Summary", q: "Patient summary / Overview", card: "patient_summary", intent: "data_retrieval" },
                          { n: 2, cat: "Summary", q: "Patient's detailed summary", card: "patient_summary", intent: "data_retrieval" },
                          { n: 3, cat: "Summary", q: "Last visit details", card: "last_visit", intent: "data_retrieval" },
                          { n: 4, cat: "Summary", q: "Review intake data", card: "symptom_collector", intent: "data_retrieval" },
                          { n: 5, cat: "Summary", q: "Patient timeline", card: "patient_timeline", intent: "data_retrieval" },
                          // Specialty summaries
                          { n: 6, cat: "Specialty", q: "Obstetric summary / ANC status", card: "obstetric_summary", intent: "data_retrieval" },
                          { n: 7, cat: "Specialty", q: "Gynec summary / Cycle details", card: "gynec_summary", intent: "data_retrieval" },
                          { n: 8, cat: "Specialty", q: "Growth chart / Pediatric summary", card: "pediatric_summary", intent: "data_retrieval" },
                          { n: 9, cat: "Specialty", q: "Vision / Eye summary", card: "ophthal_summary", intent: "data_retrieval" },
                          // Labs
                          { n: 10, cat: "Labs", q: "Lab overview / Lab results", card: "lab_panel", intent: "data_retrieval" },
                          { n: 11, cat: "Labs", q: "HbA1c trend / Lab trend", card: "lab_trend", intent: "comparison" },
                          { n: 12, cat: "Labs", q: "Compare labs / Lab comparison", card: "lab_comparison", intent: "comparison" },
                          { n: 13, cat: "Labs", q: "eGFR trend", card: "lab_trend", intent: "comparison" },
                          // Vitals
                          { n: 14, cat: "Vitals", q: "Vital trends / BP trend", card: "vitals_trend_line", intent: "comparison" },
                          { n: 15, cat: "Vitals", q: "Vitals bar chart", card: "vitals_trend_bar", intent: "comparison" },
                          // Medications & History
                          { n: 16, cat: "Meds", q: "Med history / What medications?", card: "med_history", intent: "data_retrieval" },
                          { n: 17, cat: "Meds", q: "Vaccination schedule", card: "vaccination_schedule", intent: "data_retrieval" },
                          // Clinical Decision
                          { n: 18, cat: "Decision", q: "Suggest DDX / Differential diagnosis", card: "ddx", intent: "clinical_decision" },
                          { n: 19, cat: "Decision", q: "Suggest medications", card: "protocol_meds", intent: "clinical_decision" },
                          { n: 20, cat: "Decision", q: "Suggest investigations", card: "investigation_bundle", intent: "clinical_decision" },
                          { n: 21, cat: "Decision", q: "Clinical guidelines for CKD", card: "clinical_guideline", intent: "clinical_decision" },
                          // Action
                          { n: 22, cat: "Action", q: "Draft advice / Write advice", card: "advice_bundle", intent: "action" },
                          { n: 23, cat: "Action", q: "Plan follow-up", card: "follow_up", intent: "action" },
                          { n: 24, cat: "Action", q: "Translate to Hindi / Regional language", card: "translation", intent: "action" },
                          { n: 25, cat: "Action", q: "Prescription preview", card: "rx_preview", intent: "action" },
                          // Safety & Alerts
                          { n: 26, cat: "Safety", q: "Check drug interactions", card: "drug_interaction", intent: "clinical_question" },
                          { n: 27, cat: "Safety", q: "Allergy check / Allergy alert", card: "allergy_conflict", intent: "clinical_question" },
                          // Clinical Problems
                          { n: 28, cat: "Clinical", q: "CKD status / POMR CKD", card: "pomr_problem_card", intent: "data_retrieval" },
                          { n: 29, cat: "Clinical", q: "Diabetes management / DM review", card: "pomr_problem_card", intent: "data_retrieval" },
                          { n: 30, cat: "Clinical", q: "SBAR / Critical summary", card: "sbar_critical", intent: "data_retrieval" },
                          // Document Analysis
                          { n: 31, cat: "Analysis", q: "Analyze this report (uploaded)", card: "ocr_pathology", intent: "document_analysis" },
                          { n: 32, cat: "Analysis", q: "Extract from discharge summary", card: "ocr_extraction", intent: "document_analysis" },
                          // Utility
                          { n: 33, cat: "Utility", q: "Completeness check", card: "completeness", intent: "operational" },
                          { n: 34, cat: "Utility", q: "Referral summary", card: "referral", intent: "operational" },
                          // Text responses
                          { n: 35, cat: "Clinical Q", q: "What is the dose of Metformin?", card: "text_fact", intent: "clinical_question" },
                          { n: 36, cat: "Clinical Q", q: "Steps for wound care", card: "text_step", intent: "clinical_question" },
                          { n: 37, cat: "Clinical Q", q: "Metformin vs Glimepiride", card: "text_comparison", intent: "clinical_question" },
                          { n: 38, cat: "Clinical Q", q: "JNC guidelines for hypertension", card: "text_quote", intent: "clinical_question" },
                          { n: 39, cat: "Clinical Q", q: "Side effects of Atorvastatin", card: "text_list", intent: "clinical_question" },
                          { n: 40, cat: "Clinical Q", q: "Is SpO2 92 dangerous?", card: "text_alert", intent: "clinical_question" },
                          // Voice
                          { n: 41, cat: "Voice", q: "(Voice input: 'Tab Amoxicillin 500mg TDS for 5 days')", card: "voice_structured_rx", intent: "action" },
                          // Clarification
                          { n: 42, cat: "Utility", q: "(Ambiguous question needing clarification)", card: "follow_up_question", intent: "follow_up" },
                        ].map(item => (
                          <tr key={item.n} className="border-b border-slate-50 align-top">
                            <td className="px-3 py-2 text-slate-400 font-mono text-[10px]">{item.n}</td>
                            <td className="px-3 py-2"><span className="rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[9px] font-medium text-violet-600">{item.cat}</span></td>
                            <td className="px-3 py-2 text-slate-700">&ldquo;{item.q}&rdquo;</td>
                            <td className="px-3 py-2"><code className="rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[10px] text-violet-700">{item.card}</code></td>
                            <td className="px-3 py-2 text-slate-500 text-[10px]">{item.intent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* ─── B3. Page-Specific Canned Messages — Patient Context ─── */}
            <DocSection number="B3" title="Page-Specific Canned Messages — Patient Context" subtitle="When a patient is open, the pills change based on which page the doctor is viewing. Each page surfaces contextually relevant actions.">
              <div className="space-y-3">
                {[
                  {
                    page: "RxPad Page (Main Prescription)",
                    desc: "Primary workspace. Pills follow the 4-layer priority and change with consultation phase (empty → symptoms → dx → meds → complete).",
                    pills: ["Patient summary", "Suggest DDX", "Suggest medications", "Lab overview", "Translate", "Completeness check", "Plan follow-up"],
                    cardTypes: ["patient_summary", "ddx", "protocol_meds", "lab_panel", "translation", "completeness", "follow_up"],
                    border: "border-l-violet-500",
                    phases: true,
                  },
                  {
                    page: "Patient Detail Page",
                    desc: "Viewing patient profile, history tabs (vitals, labs, records, etc.). Pills adapt to the active sidebar tab.",
                    pills: ["Vital trends", "Lab comparison", "Med history", "OCR analysis", "Obstetric summary", "Chronic timeline"],
                    cardTypes: ["vitals_trend_line", "lab_comparison", "med_history", "ocr_extraction", "obstetric_summary", "patient_timeline"],
                    border: "border-l-blue-500",
                    phases: false,
                  },
                  {
                    page: "Print Preview Page",
                    desc: "Doctor previewing the prescription before printing. Pills focus on verification and translation.",
                    pills: ["Completeness check", "Translate to regional", "Prescription preview", "Draft advice"],
                    cardTypes: ["completeness", "translation", "rx_preview", "advice_bundle"],
                    border: "border-l-emerald-500",
                    phases: false,
                  },
                  {
                    page: "Appointment Queue → Patient Click",
                    desc: "Doctor clicks a patient from the queue. Transition from operational to patient context. Auto-shows summary.",
                    pills: ["Patient summary", "Last visit", "Review intake data", "Lab overview"],
                    cardTypes: ["patient_summary", "last_visit", "symptom_collector", "lab_panel"],
                    border: "border-l-orange-500",
                    phases: false,
                  },
                ].map(item => (
                  <div key={item.page} className={`rounded-xl border border-slate-200 border-l-[3px] ${item.border} bg-white overflow-hidden`}>
                    <div className="px-4 py-3">
                      <p className="text-[12px] font-semibold text-slate-800 mb-0.5">{item.page}</p>
                      <p className="text-[10px] text-slate-500 mb-2">{item.desc}</p>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pills</p>
                          <div className="flex flex-wrap gap-1">
                            {item.pills.map(p => (
                              <span key={p} className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-600">{p}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cards</p>
                          <div className="flex flex-wrap gap-1">
                            {item.cardTypes.map(c => (
                              <code key={c} className="rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-500">{c}</code>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {item.phases && (
                      <div className="bg-violet-50/40 px-4 py-2 border-t border-violet-100">
                        <p className="text-[9px] text-violet-600 font-medium">Phase-aware: pills rotate through Empty → Symptoms → Dx Accepted → Meds Written → Complete based on RxPad state.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ─── B4. Patient Detail Page — Tab Lens Scenarios ─── */}
            <DocSection number="B4" title="Patient Detail — Tab Lens Scenarios" subtitle="When the doctor switches between sidebar tabs on the patient detail page, the pill suggestions change to reflect the active data view.">
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[10px]">
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-32">Active Tab</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">Context-specific pills</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-40">Primary cards</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tab: "Past Visits", pills: ["Compare visits", "Recurrence check", "Last visit details"], cards: ["last_visit", "patient_timeline"] },
                      { tab: "Vitals", pills: ["Vital trends", "Graph view", "BP attention"], cards: ["vitals_trend_line", "vitals_trend_bar"] },
                      { tab: "History", pills: ["Med history search", "Chronic timeline", "Med review"], cards: ["med_history", "patient_timeline"] },
                      { tab: "Lab Results", pills: ["Lab comparison", "Annual panel", "Lab trends", "Flag review"], cards: ["lab_comparison", "lab_panel", "lab_trend"] },
                      { tab: "Medical Records", pills: ["OCR analysis", "Report extract", "Upload new"], cards: ["ocr_pathology", "ocr_extraction"] },
                      { tab: "Obstetric", pills: ["Obstetric summary", "ANC schedule", "Fetal monitoring"], cards: ["obstetric_summary"] },
                      { tab: "Gynecology", pills: ["Gynec summary", "Cycle history"], cards: ["gynec_summary"] },
                      { tab: "Vaccine", pills: ["Vaccination schedule", "Overdue vaccines"], cards: ["vaccination_schedule"] },
                      { tab: "Growth", pills: ["Growth chart", "Milestone check", "Pediatric summary"], cards: ["pediatric_summary"] },
                      { tab: "Ophthalmology", pills: ["Vision summary", "IOP trend"], cards: ["ophthal_summary"] },
                    ].map(item => (
                      <tr key={item.tab} className="border-b border-slate-50 align-top">
                        <td className="px-3 py-2.5 font-semibold text-slate-700">{item.tab}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {item.pills.map(p => (
                              <span key={p} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">{p}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {item.cards.map(c => (
                              <code key={c} className="rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-500">{c}</code>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DocSection>

            {/* ─── B5. Safety-Critical Scenarios ─── */}
            <DocSection number="B5" title="Safety-Critical Scenarios" subtitle="These scenarios trigger Layer 1 forced pills. They override all other pills and cannot be dismissed.">
              <div className="space-y-3">
                {[
                  {
                    scenario: "SpO2 drops below 90%",
                    trigger: "Vitals entry or real-time monitoring",
                    forcedPill: "Review SpO2",
                    card: "sbar_critical",
                    response: "SBAR card auto-generated: Situation (SpO2 at 88%), Background (patient history), Assessment (critical hypoxemia), Recommendation (immediate oxygen, escalation).",
                    tone: "border-l-red-500 bg-red-50/30",
                  },
                  {
                    scenario: "Known allergy conflicts with prescribed drug",
                    trigger: "Doctor adds a medication that matches allergy list",
                    forcedPill: "Allergy Alert",
                    card: "allergy_conflict",
                    response: "Allergy conflict card: shows the conflicting drug, allergy, severity, and alternative medications.",
                    tone: "border-l-red-500 bg-red-50/30",
                  },
                  {
                    scenario: "Drug-drug interaction detected",
                    trigger: "Doctor adds a medication that interacts with existing meds",
                    forcedPill: "Drug interaction",
                    card: "drug_interaction",
                    response: "Interaction card: severity (critical/major/moderate), mechanism, clinical significance, and recommendation.",
                    tone: "border-l-amber-500 bg-amber-50/30",
                  },
                  {
                    scenario: "Critical lab value (e.g., K+ > 6.0)",
                    trigger: "Lab result with critical flag",
                    forcedPill: "Critical lab alert",
                    card: "sbar_critical",
                    response: "SBAR format with critical lab highlighted, trend context, and immediate action recommendations.",
                    tone: "border-l-red-500 bg-red-50/30",
                  },
                  {
                    scenario: "BP > 180/120 — Hypertensive crisis",
                    trigger: "Vitals entry flagged as crisis",
                    forcedPill: "BP critical",
                    card: "sbar_critical",
                    response: "Urgent card with prior BP trend, current reading, and emergency protocol recommendation.",
                    tone: "border-l-red-500 bg-red-50/30",
                  },
                ].map(item => (
                  <div key={item.scenario} className={`rounded-xl border border-slate-200 border-l-[3px] ${item.tone} px-4 py-3`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold text-slate-800 mb-0.5">{item.scenario}</p>
                        <p className="text-[10px] text-slate-500 mb-1.5">Trigger: {item.trigger}</p>
                        <p className="text-[11px] text-slate-600 leading-[1.55]">{item.response}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">{item.forcedPill}</span>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{item.card}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ─── B6. Chronic Disease Management Scenarios ─── */}
            <DocSection number="B6" title="Chronic Disease Management Scenarios" subtitle="Scenarios specific to patients with ongoing chronic conditions — CKD, Diabetes, Hypertension, Anaemia. Each condition has dedicated POMR cards and specialized pills.">
              <div className="space-y-3">
                {[
                  {
                    condition: "CKD (Chronic Kidney Disease)",
                    pills: ["CKD review", "eGFR trend", "Dialysis adequacy", "Fluid balance", "Bone mineral", "CV risk in CKD"],
                    cards: ["pomr_problem_card", "lab_trend", "clinical_guideline"],
                    asks: ["What's the current eGFR?", "Is dialysis adequacy maintained?", "Check potassium levels", "KDIGO stage assessment", "Medication adjustment for renal dose"],
                    color: "border-l-purple-500",
                  },
                  {
                    condition: "Diabetes Mellitus",
                    pills: ["DM glycemic control", "HbA1c trend", "Insulin adjustment", "Foot exam reminder", "Eye screening due"],
                    cards: ["pomr_problem_card", "lab_trend", "clinical_guideline"],
                    asks: ["HbA1c trend over 6 months", "Is insulin dose adequate?", "ADA guidelines for type 2", "Metformin vs Glimepiride", "When is next eye screening?"],
                    color: "border-l-blue-500",
                  },
                  {
                    condition: "Hypertension",
                    pills: ["BP trend", "Medication review", "JNC guidelines", "Target BP check", "Lifestyle advice"],
                    cards: ["pomr_problem_card", "vitals_trend_line", "clinical_guideline"],
                    asks: ["BP trend last 3 months", "Is current medication controlling BP?", "JNC 8 recommendations", "Any end-organ damage?", "Drug adjustment for elevated BP"],
                    color: "border-l-teal-500",
                  },
                  {
                    condition: "Anaemia",
                    pills: ["Iron stores", "EPO dosing", "Hemoglobin trend", "Transfusion history", "CBC review"],
                    cards: ["pomr_problem_card", "lab_trend", "lab_panel"],
                    asks: ["Current hemoglobin level?", "Iron stores adequate?", "EPO dose review", "CBC trend over 3 months", "Transfusion need assessment"],
                    color: "border-l-rose-500",
                  },
                ].map(item => (
                  <div key={item.condition} className={`rounded-xl border border-slate-200 border-l-[3px] ${item.color} bg-white overflow-hidden`}>
                    <div className="px-4 py-3">
                      <p className="text-[13px] font-semibold text-slate-800 mb-2">{item.condition}</p>
                      <div className="grid gap-3 lg:grid-cols-3">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Condition-specific pills</p>
                          <div className="flex flex-wrap gap-1">
                            {item.pills.map(p => (
                              <span key={p} className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-600">{p}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Card types</p>
                          <div className="flex flex-wrap gap-1">
                            {item.cards.map(c => (
                              <code key={c} className="rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-500">{c}</code>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Common asks</p>
                          <ul className="space-y-0.5">
                            {item.asks.map(a => (
                              <li key={a} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                                <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ─── B7. Specialty Encounter Scenarios ─── */}
            <DocSection number="B7" title="Specialty Encounter Scenarios" subtitle="When specialty-specific data exists (obstetric, gynecology, pediatric, ophthalmology), dedicated summary cards and pills become available.">
              <div className="space-y-3">
                {[
                  {
                    specialty: "Obstetrics",
                    when: "Patient has active pregnancy / ANC data",
                    autoCard: "obstetric_summary",
                    pills: ["Obstetric summary", "ANC schedule", "Fetal monitoring", "EDD calculator", "High-risk flags"],
                    permutations: ["Active pregnancy", "High-risk pregnancy", "Post-delivery follow-up"],
                    color: "border-l-pink-500",
                  },
                  {
                    specialty: "Gynecology",
                    when: "Patient has gynec history (menarche, cycle, Pap smear data)",
                    autoCard: "gynec_summary",
                    pills: ["Gynec summary", "Cycle history", "Pap smear status", "Menopause assessment"],
                    permutations: ["Regular cycle", "Irregular cycle", "Post-menopausal"],
                    color: "border-l-fuchsia-500",
                  },
                  {
                    specialty: "Pediatrics",
                    when: "Patient is a child (age < 18) with growth/vaccine data",
                    autoCard: "pediatric_summary",
                    pills: ["Growth chart", "Vaccine schedule", "Milestone check", "Overdue vaccines"],
                    permutations: ["Infant (0-1y)", "Child (1-12y)", "Adolescent (12-18y)", "Overdue vaccines"],
                    color: "border-l-cyan-500",
                  },
                  {
                    specialty: "Ophthalmology",
                    when: "Patient has ophthal data (VA, IOP, refraction, slit lamp)",
                    autoCard: "ophthal_summary",
                    pills: ["Vision summary", "IOP trend", "Refraction history", "Fundus review"],
                    permutations: ["Normal vision", "Elevated IOP (glaucoma suspect)", "Refractive error", "Diabetic retinopathy screening"],
                    color: "border-l-indigo-500",
                  },
                ].map(item => (
                  <div key={item.specialty} className={`rounded-xl border border-slate-200 border-l-[3px] ${item.color} bg-white px-4 py-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-slate-800">{item.specialty}</span>
                      <span className="text-[10px] text-slate-400">— {item.when}</span>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-3 mt-2">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Auto-shown card</p>
                        <code className="rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[10px] text-violet-700">{item.autoCard}</code>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pills</p>
                        <div className="flex flex-wrap gap-1">
                          {item.pills.map(p => (
                            <span key={p} className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-600">{p}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Permutations</p>
                        <div className="flex flex-wrap gap-1">
                          {item.permutations.map(p => (
                            <span key={p} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ─── B8. Document Analysis Scenarios ─── */}
            <DocSection number="B8" title="Document Analysis Scenarios" subtitle="When the doctor uploads or scans a document (lab report, discharge summary, prescription), OCR-based cards are triggered.">
              <div className="space-y-3">
                {[
                  { scenario: "Upload pathology / lab report", trigger: "Doctor uploads CBC, lipid, renal, liver report image or PDF", card: "ocr_pathology", details: "OCR extracts parameters, flags abnormals, computes confidence score. Compares with previous values if available.", permutations: ["CBC", "Lipid profile", "Renal function", "Liver function", "Low-confidence OCR"] },
                  { scenario: "Upload discharge summary", trigger: "Doctor uploads discharge summary from another hospital", card: "ocr_extraction", details: "Full text extraction organized by sections: diagnosis, procedures, medications, follow-up instructions.", permutations: ["Discharge summary", "Referral letter", "OP consultation notes"] },
                  { scenario: "Upload old prescription", trigger: "Doctor scans patient's existing prescription from another doctor", card: "ocr_extraction", details: "Extracts medication list, dosages, and instructions. Can be copied into current RxPad.", permutations: ["Single prescription", "Multiple prescriptions", "Illegible portions"] },
                ].map(item => (
                  <div key={item.scenario} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] font-semibold text-slate-800">{item.scenario}</p>
                      <code className="rounded bg-pink-50 border border-pink-200 px-1.5 py-0.5 text-[10px] text-pink-700">{item.card}</code>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-1.5">Trigger: {item.trigger}</p>
                    <p className="text-[11px] text-slate-600 leading-[1.55] mb-2">{item.details}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.permutations.map(p => (
                        <span key={p} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ─── B9. Voice Input Scenarios ─── */}
            <DocSection number="B9" title="Voice Input Scenarios" subtitle="When the doctor uses voice dictation instead of typing, the voice engine parses the input into structured RxPad sections.">
              <div className="space-y-3">
                {[
                  { input: "Tab Amoxicillin 500mg TDS for 5 days, Tab Paracetamol 650mg SOS", card: "voice_structured_rx", result: "Parsed into Medication section: 2 drugs with dose, frequency, duration." },
                  { input: "Patient complains of fever since 3 days, cough, body ache", card: "voice_structured_rx", result: "Parsed into Symptoms section: fever (3 days), cough, body ache." },
                  { input: "Diagnosis: Acute pharyngitis. Advice: warm fluids, gargles, rest", card: "voice_structured_rx", result: "Parsed into Diagnosis + Advice sections." },
                  { input: "Follow up after 5 days if not improving", card: "voice_structured_rx", result: "Parsed into Follow-up section with 5-day interval." },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 text-[10px] mt-0.5">&#127908;</span>
                      <div className="flex-1">
                        <p className="text-[11px] text-slate-700 font-medium mb-1">&ldquo;{item.input}&rdquo;</p>
                        <p className="text-[10px] text-slate-500">{item.result}</p>
                      </div>
                      <code className="rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[9px] text-violet-700 flex-shrink-0">{item.card}</code>
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ─── Coverage Summary ─── */}
            <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50/60 px-6 py-5">
              <h4 className="text-[15px] font-bold text-slate-800 mb-3">Card Coverage Summary</h4>
              <p className="text-[11px] text-slate-500 mb-4">Every card type from the catalog is covered across the scenarios above. Here's the mapping at a glance.</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-2">Operational context cards ({["welcome_card", "patient_list", "patient_search", "follow_up_list", "revenue_bar", "bulk_action", "donut_chart", "pie_chart", "line_graph", "analytics_table", "condition_bar", "heatmap", "billing_summary", "external_cta", "referral"].length})</p>
                  <div className="flex flex-wrap gap-1">
                    {["welcome_card", "patient_list", "patient_search", "follow_up_list", "revenue_bar", "bulk_action", "donut_chart", "pie_chart", "line_graph", "analytics_table", "condition_bar", "heatmap", "billing_summary", "external_cta", "referral"].map(c => (
                      <code key={c} className="rounded bg-orange-50 border border-orange-200 px-1.5 py-0.5 text-[9px] text-orange-700">{c}</code>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-2">Patient context cards ({["patient_summary", "symptom_collector", "last_visit", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary", "lab_panel", "lab_trend", "lab_comparison", "vitals_trend_line", "vitals_trend_bar", "med_history", "patient_timeline", "vaccination_schedule", "ddx", "protocol_meds", "investigation_bundle", "follow_up", "advice_bundle", "rx_preview", "voice_structured_rx", "translation", "drug_interaction", "allergy_conflict", "clinical_guideline", "completeness", "follow_up_question", "pomr_problem_card", "sbar_critical", "ocr_pathology", "ocr_extraction", "referral"].length})</p>
                  <div className="flex flex-wrap gap-1">
                    {["patient_summary", "symptom_collector", "last_visit", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary", "lab_panel", "lab_trend", "lab_comparison", "vitals_trend_line", "vitals_trend_bar", "med_history", "patient_timeline", "vaccination_schedule", "ddx", "protocol_meds", "investigation_bundle", "follow_up", "advice_bundle", "rx_preview", "voice_structured_rx", "translation", "drug_interaction", "allergy_conflict", "clinical_guideline", "completeness", "follow_up_question", "pomr_problem_card", "sbar_critical", "ocr_pathology", "ocr_extraction", "referral"].map(c => (
                      <code key={c} className="rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[9px] text-violet-700">{c}</code>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-500 mb-2">Text response cards ({["text_fact", "text_alert", "text_list", "text_step", "text_quote", "text_comparison"].length})</p>
                  <div className="flex flex-wrap gap-1">
                    {["text_fact", "text_alert", "text_list", "text_step", "text_quote", "text_comparison"].map(c => (
                      <code key={c} className="rounded bg-teal-50 border border-teal-200 px-1.5 py-0.5 text-[9px] text-teal-700">{c}</code>
                    ))}
                  </div>
                </div>
              </div>
            </div>

      </div>
    )
  }

  // ── EMBEDDED CONTENT (tabs inside content for embedded mode) ──
  const embeddedContent = (
    <div>
      <div className="sticky top-0 z-30 bg-[#FAFAFE]/95 pt-2 pb-[10px] border-b border-slate-200 backdrop-blur-md mb-5">
        <div className="flex gap-1">
        {([
          { id: "intent-classification" as MainTab, label: "Intent Classification" },
          { id: "card-anatomy" as MainTab, label: "Card Anatomy & Patterns" },
          { id: "card-catalog" as MainTab, label: "Card Catalog" },
          { id: "response-management" as MainTab, label: "Response Management" },
          { id: "user-scenarios" as MainTab, label: "User Scenarios" },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setMainTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-[12px] font-medium transition-colors ${
              mainTab === tab.id ? "bg-violet-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}>
            {tab.label}
          </button>
        ))}
        </div>
      </div>

      {mainTab === "intent-classification" && <IntentClassificationSection onNavigateTab={(tab) => setMainTab(tab as MainTab)} />}
      {mainTab === "card-anatomy" && renderCardAnatomy()}
      {mainTab === "card-catalog" && renderCardCatalog()}
      {mainTab === "response-management" && renderResponseMgmt()}
      {mainTab === "user-scenarios" && renderUserScenarios()}
    </div>
  )

  if (embedded) return embeddedContent

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFE]">
      {/* ── Fixed header + tabs (always sticky together) ── */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Title bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h1 className="text-[16px] font-bold leading-tight bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Dr. Agent — Documentation</h1>
              <p className="text-[10px] text-slate-400">AI co-pilot for doctors, nurses, admins & clinical operators — surfaces data and takes action</p>
            </div>
          </div>
          <a href="/tp-appointment-screen/scenarios" className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50">Back</a>
        </div>
        {/* Tab bar */}
        <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6">
          <div className="flex gap-1">
            {([
              { id: "intent-classification" as MainTab, label: "Intent Classification" },
              { id: "card-anatomy" as MainTab, label: "Card Anatomy & Patterns" },
              { id: "card-catalog" as MainTab, label: "Card Catalog" },
              { id: "response-management" as MainTab, label: "Response Management" },
              { id: "user-scenarios" as MainTab, label: "User Scenarios" },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setMainTab(tab.id)}
                className={`rounded-lg px-4 py-1.5 text-[11px] font-medium transition-colors ${
                  mainTab === tab.id ? "bg-violet-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      {/* ── Scrollable content area ── */}
      <main className="mx-auto max-w-7xl overflow-hidden px-4 mt-[100px] h-[calc(100vh-100px)] sm:px-6">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto py-6">
          {mainTab === "intent-classification" && <IntentClassificationSection onNavigateTab={(tab) => setMainTab(tab as MainTab)} />}
          {mainTab === "card-anatomy" && renderCardAnatomy()}
          {mainTab === "card-catalog" && renderCardCatalog()}
          {mainTab === "response-management" && renderResponseMgmt()}
          {mainTab === "user-scenarios" && renderUserScenarios()}
        </div>
      </main>
    </div>
  )
}

export function IntentClassificationContent() {
  return <ComprehensiveRef embedded />
}

export default function IntentClassificationPage() {
  return <ComprehensiveRef />
}

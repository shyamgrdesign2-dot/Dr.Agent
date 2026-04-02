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
function LiveCardPreview({ kind, label, highlightZone }: { kind: string; label?: string; highlightZone?: "header" | "content" | "insight" | "footer" }) {
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
            highlightZone === "insight" ? "bg-amber-500 text-white" :
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

const INSIGHT_VARIANTS = [
  { variant: "red", when: "Critical / worsening values", example: "HbA1c worsened from 7.4 → 8.2%. Immediate attention needed." },
  { variant: "amber", when: "Borderline / watch items", example: "Creatinine trending up. Monitor closely." },
  { variant: "purple", when: "AI-generated correlation", example: "BP and weight trends suggest medication adjustment." },
  { variant: "teal", when: "Positive / improving", example: "LDL improved from 162 to 128 after statin initiation." },
]

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
    "Canned messages always sit between the main content/insight area and the footer zone.",
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
type CardSpec = { kind: string; family: string; description: string; intent: string; whenToShow: string; permutations: string[]; dataParams: string }

function getCardFetchFrom(kind: string): string {
  if (["last_visit", "patient_timeline"].includes(kind)) return "Past Visit history and other chronological historical modules"
  if (["lab_panel", "lab_trend", "lab_comparison"].includes(kind)) return "Lab Results history, Records OCR, or mixed lab context"
  if (["vitals_trend_bar", "vitals_trend_line"].includes(kind)) return "Vitals history and encounter vitals"
  if (["patient_summary", "sbar_overview", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary", "symptom_collector"].includes(kind)) {
    return "Mixed patient context: historical sidebar modules + current encounter data"
  }
  if (["protocol_meds", "investigation_bundle", "follow_up", "advice_bundle", "rx_preview", "voice_structured_rx", "ddx"].includes(kind)) {
    return "Newly generated Dr. Agent output using patient context and current RxPad state"
  }
  if (["ocr_pathology", "ocr_extraction", "translation", "drug_interaction", "allergy_conflict", "clinical_guideline"].includes(kind)) {
    return "Generated analysis layer from uploaded records, current RxPad state, or user query context"
  }
  if (["med_history", "vaccination_schedule"].includes(kind)) return "Historical sidebar modules"
  if (["sbar_critical", "pomr_problem_card", "completeness", "follow_up_question"].includes(kind)) return "Mixed historical + current clinical context"
  if (["welcome_card", "patient_list", "patient_search", "follow_up_list", "revenue_bar", "bulk_action", "donut_chart", "pie_chart", "line_graph", "analytics_table", "condition_bar", "heatmap", "billing_summary", "external_cta", "referral"].includes(kind)) {
    return "Homepage or operational analytics datasets"
  }
  return "Context-specific mixed data"
}

function getCardUiRule(kind: string): string {
  if (["patient_summary", "sbar_overview", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary"].includes(kind)) return "Lead with compressed scan-friendly summary blocks, then expand into tag-led structured rows."
  if (["last_visit", "rx_preview", "voice_structured_rx"].includes(kind)) return "Use sectioned content with icon-led tags and expose common header copy when the entire card is copyable."
  if (["lab_panel", "med_history", "vaccination_schedule", "ocr_pathology", "ocr_extraction"].includes(kind)) return "Keep each row or section strongly structured so clinicians can inspect details without losing source meaning."
  if (["lab_trend", "lab_comparison", "vitals_trend_bar", "vitals_trend_line"].includes(kind)) return "Prioritize quick comparison and trend recognition over text density."
  if (["ddx", "investigation_bundle", "follow_up", "advice_bundle", "protocol_meds"].includes(kind)) return "Action cards should make selection or fillability obvious before any secondary explanation."
  if (["welcome_card", "patient_list", "patient_search", "follow_up_list", "revenue_bar", "bulk_action", "donut_chart", "pie_chart", "line_graph", "analytics_table", "condition_bar", "heatmap", "billing_summary", "external_cta", "referral"].includes(kind)) {
    return "Operational cards should stay glanceable, compact, and list/dashboard oriented."
  }
  return "Use the standard card shell with a stable header, structured body, optional insight, and action-aware footer."
}

const CARD_SPECS: CardSpec[] = [
  // Summary
  { kind: "patient_summary", family: "Summary", description: "Comprehensive patient overview — vitals, labs, flags, chronic conditions, medications, narrative.", intent: "data_retrieval", whenToShow: "'Patient summary', 'overview', 'snapshot' or 'Patient's detailed summary' pill.", permutations: ["With/without labs", "With chronic conditions", "With symptom collector", "With specialty alerts", "With vitals abnormals"], dataParams: "SmartSummaryData" },
  { kind: "sbar_overview", family: "Summary", description: "ISBAR-structured patient summary — Situation (narrative), Background (history + allergies), Assessment (vitals + labs), Recommendation (action items).", intent: "data_retrieval", whenToShow: "'Patient summary' pill for SBAR/critical care view. Used in Emergency/On-call context.", permutations: ["Full SBAR with all sections", "Without labs", "With critical vitals", "With follow-up overdue", "With last visit"], dataParams: "SmartSummaryData" },
  { kind: "symptom_collector", family: "Summary", description: "Patient-reported symptoms from pre-visit intake form.", intent: "data_retrieval", whenToShow: "'Pre-visit intake' pill.", permutations: ["Full intake", "Partial intake", "With severity ratings"], dataParams: "SymptomCollectorData" },
  { kind: "last_visit", family: "Summary", description: "Previous visit summary with copy-to-rx action.", intent: "data_retrieval", whenToShow: "'Last visit details' pill.", permutations: ["Recent (<30d)", "Old (>90d amber)", "With meds"], dataParams: "LastVisitCardData" },
  { kind: "obstetric_summary", family: "Summary", description: "ANC status, gravida/para, EDD, gestational weeks, fetal data.", intent: "data_retrieval", whenToShow: "Obstetric data exists + pill tapped.", permutations: ["Active pregnancy", "High-risk", "Post-delivery"], dataParams: "ObstetricData" },
  { kind: "gynec_summary", family: "Summary", description: "Menarche, cycle, LMP, Pap smear, flow/pain.", intent: "data_retrieval", whenToShow: "Gynec data exists + pill tapped.", permutations: ["Regular", "Irregular", "Post-menopausal"], dataParams: "GynecData" },
  { kind: "pediatric_summary", family: "Summary", description: "Growth percentiles, milestones, vaccine status.", intent: "data_retrieval", whenToShow: "Pediatric data exists + pill tapped.", permutations: ["Infant", "Child", "Overdue vaccines"], dataParams: "PediatricsData" },
  { kind: "ophthal_summary", family: "Summary", description: "Visual acuity, IOP, refraction, slit lamp, fundus.", intent: "data_retrieval", whenToShow: "Ophthal data exists + pill tapped.", permutations: ["Normal", "Elevated IOP", "Refractive error"], dataParams: "OphthalData" },
  // Data & Trends
  { kind: "lab_panel", family: "Data", description: "Latest lab results grid with flags and insight.", intent: "data_retrieval", whenToShow: "'Lab overview' or 'N lab values flagged' pill.", permutations: ["All normal", "Mixed flags", "Critical flags", "By category"], dataParams: "LabPanelData" },
  { kind: "vitals_trend_bar", family: "Data", description: "Vitals over time as bar chart with thresholds.", intent: "comparison", whenToShow: "'Vital trends' or 'Bar view' pill.", permutations: ["Single vital", "Multiple overlaid", "With thresholds"], dataParams: "{title, series: VitalTrendSeries[]}" },
  { kind: "vitals_trend_line", family: "Data", description: "Vitals over time as line chart with tone coloring.", intent: "comparison", whenToShow: "'Line graph' pill.", permutations: ["Stable (green)", "Declining (red)", "Improving"], dataParams: "{title, series: VitalTrendSeries[]}" },
  { kind: "lab_trend", family: "Data", description: "Single lab parameter trend over time.", intent: "comparison", whenToShow: "'HbA1c trend' type queries.", permutations: ["Improving", "Worsening", "Stable", "With normal range band"], dataParams: "{title, series, parameterName}" },
  { kind: "lab_comparison", family: "Data", description: "Previous vs current lab values with deltas.", intent: "comparison", whenToShow: "'Compare labs' or 'Lab comparison' pill.", permutations: ["All improved", "Mixed", "No previous data"], dataParams: "{rows: LabComparisonRow[], insight}" },
  { kind: "med_history", family: "Data", description: "Medication history timeline.", intent: "data_retrieval", whenToShow: "'Med history' pill.", permutations: ["Active only", "Full history", "By diagnosis"], dataParams: "{entries: MedHistoryEntry[], insight}" },
  { kind: "patient_timeline", family: "Data", description: "Chronological event timeline.", intent: "data_retrieval", whenToShow: "'Patient timeline' pill.", permutations: ["All events", "Visits only", "By date range"], dataParams: "PatientTimelineCardData" },
  { kind: "vaccination_schedule", family: "Data", description: "Vaccine schedule with status badges.", intent: "data_retrieval", whenToShow: "Patient-level vaccine schedule.", permutations: ["Infant", "Adult", "Pregnancy", "Overdue"], dataParams: "VaccinationScheduleCardData" },
  // Action
  { kind: "ddx", family: "Action", description: "Differential diagnosis — 3 tiers with checkboxes.", intent: "clinical_decision", whenToShow: "'Suggest DDX' pill.", permutations: ["Single complaint", "Multiple complaints", "With lab correlation", "Emergency"], dataParams: "{context, options: DDXOption[]}" },
  { kind: "protocol_meds", family: "Action", description: "Protocol medications with safety notes + copy to RxPad.", intent: "clinical_decision", whenToShow: "'Suggest medications' pill.", permutations: ["Single diagnosis", "Multi-diagnosis", "Pediatric dosing", "Renal-adjusted"], dataParams: "{diagnosis, meds, safetyCheck, copyPayload}" },
  { kind: "investigation_bundle", family: "Action", description: "Suggested tests with rationale + copy.", intent: "clinical_decision", whenToShow: "'Suggest investigations' pill.", permutations: ["Initial workup", "Follow-up", "Pre-surgical", "Missing tests"], dataParams: "{title, items, copyPayload}" },
  { kind: "follow_up", family: "Action", description: "Follow-up schedule radio selection.", intent: "action", whenToShow: "'Plan follow-up' pill.", permutations: ["Acute (3-5d)", "Chronic (2-4wk)", "Post-procedure"], dataParams: "{context, options: FollowUpOption[]}" },
  { kind: "advice_bundle", family: "Action", description: "Patient advice list with copy + share.", intent: "action", whenToShow: "'Draft advice' pill.", permutations: ["General", "Condition-specific", "Post-procedure", "With share"], dataParams: "{title, items, shareMessage, copyPayload}" },
  { kind: "rx_preview", family: "Action", description: "Full prescription preview with tag-based section headers.", intent: "action", whenToShow: "Near consultation completion.", permutations: ["Complete Rx", "Partial (missing)", "Multi-diagnosis"], dataParams: "RxPreviewCardData" },
  { kind: "voice_structured_rx", family: "Action", description: "Voice dictation parsed into RxPad sections.", intent: "action", whenToShow: "After voice input.", permutations: ["Full", "Partial", "With corrections"], dataParams: "VoiceStructuredRxData" },
  // Analysis
  { kind: "ocr_pathology", family: "Analysis", description: "Pathology report OCR with flags and confidence.", intent: "document_analysis", whenToShow: "Upload pathology report.", permutations: ["CBC", "Lipid", "Renal/liver", "Low-confidence"], dataParams: "{title, category, parameters, normalCount, insight}" },
  { kind: "ocr_extraction", family: "Analysis", description: "Full document extraction by section.", intent: "document_analysis", whenToShow: "Upload discharge/prescription.", permutations: ["Discharge summary", "Prescription", "Referral letter"], dataParams: "{title, category, sections, insight}" },
  // Clinical Problem
  { kind: "sbar_critical", family: "Clinical", description: "SBAR emergency triage with completeness ring.", intent: "data_retrieval", whenToShow: "Critical flags (SpO2 <90, critical labs).", permutations: ["Emergency", "Critical lab", "Vital deterioration"], dataParams: "SbarCriticalCardData" },
  { kind: "pomr_problem_card", family: "Clinical", description: "POMR single problem with completeness donut.", intent: "data_retrieval", whenToShow: "Chronic condition pills (CKD, DM, HTN).", permutations: ["CKD", "Diabetes", "HTN", "Anaemia", "High/low completeness"], dataParams: "PomrProblemCardData" },
  // Utility & Safety
  { kind: "translation", family: "Utility", description: "Language translation side-by-side + copy.", intent: "action", whenToShow: "'Translate' pill.", permutations: ["Hindi", "Telugu", "Tamil", "Kannada", "Marathi"], dataParams: "TranslationData & {copyPayload}" },
  { kind: "drug_interaction", family: "Safety", description: "Drug-drug interaction alert with severity.", intent: "clinical_question", whenToShow: "'Check interactions' or auto-triggered.", permutations: ["Critical", "Major", "Moderate", "Clear"], dataParams: "DrugInteractionData" },
  { kind: "allergy_conflict", family: "Safety", description: "Drug-allergy conflict with alternatives.", intent: "clinical_question", whenToShow: "Auto-triggered on allergy match.", permutations: ["Direct match", "Cross-reactivity", "With alternatives"], dataParams: "AllergyConflictData" },
  { kind: "follow_up_question", family: "Utility", description: "Agent asks doctor for clarification.", intent: "follow_up", whenToShow: "Ambiguous input needs clarification.", permutations: ["Single-select", "Multi-select"], dataParams: "{question, options, multiSelect}" },
  { kind: "clinical_guideline", family: "Utility", description: "Evidence-based guideline recommendations.", intent: "clinical_decision", whenToShow: "Guidelines query.", permutations: ["KDIGO", "ADA", "JNC", "NICE"], dataParams: "ClinicalGuidelineCardData" },
  { kind: "referral", family: "Utility", description: "Referral summary — top referrers.", intent: "operational", whenToShow: "'Referral summary' pill.", permutations: ["By referrer", "By specialty", "Trends"], dataParams: "ReferralCardData" },
  // Text
  { kind: "text_fact", family: "Text", description: "Fact box with source citation.", intent: "clinical_question", whenToShow: "Short factual questions.", permutations: ["Medical fact", "Drug info", "Lab range"], dataParams: "{value, context, source}" },
  { kind: "text_alert", family: "Text", description: "Severity-colored alert bar.", intent: "clinical_question", whenToShow: "Urgent message.", permutations: ["Critical", "Warning", "Info"], dataParams: "{message, severity}" },
  { kind: "text_list", family: "Text", description: "Bulleted list.", intent: "clinical_question", whenToShow: "List response.", permutations: ["Short", "Long"], dataParams: "{items}" },
  { kind: "text_step", family: "Text", description: "Numbered steps with blue border.", intent: "clinical_question", whenToShow: "Procedural instructions.", permutations: ["Clinical", "Patient", "Medication"], dataParams: "{steps}" },
  { kind: "text_quote", family: "Text", description: "Clinical quotation with attribution.", intent: "clinical_question", whenToShow: "Citing guidelines.", permutations: ["Guideline", "Textbook", "Research"], dataParams: "{quote, source}" },
  { kind: "text_comparison", family: "Text", description: "Two-column comparison.", intent: "clinical_question", whenToShow: "Comparing two options.", permutations: ["Drug vs Drug", "Treatment comparison"], dataParams: "{labelA, labelB, itemsA, itemsB}" },
  // Homepage
  { kind: "welcome_card", family: "Homepage", description: "Daily greeting with stats.", intent: "operational", whenToShow: "Homepage load.", permutations: ["Weekday", "Weekend"], dataParams: "WelcomeCardData" },
  { kind: "patient_list", family: "Homepage", description: "Today's patient queue.", intent: "operational", whenToShow: "'Today's schedule' pill.", permutations: ["Full day", "Filtered"], dataParams: "PatientListCardData" },
  { kind: "patient_search", family: "Homepage", description: "Patient search with results.", intent: "operational", whenToShow: "Doctor types patient name.", permutations: ["Single match", "Multiple", "No match"], dataParams: "PatientSearchCardData" },
  { kind: "follow_up_list", family: "Homepage", description: "Due/overdue follow-ups.", intent: "operational", whenToShow: "'Follow-ups due' pill.", permutations: ["This week", "Overdue"], dataParams: "FollowUpListCardData" },
  { kind: "revenue_bar", family: "Homepage", description: "Daily revenue stacked bars.", intent: "operational", whenToShow: "'Revenue today' pill.", permutations: ["Today", "This week"], dataParams: "RevenueBarCardData" },
  { kind: "bulk_action", family: "Homepage", description: "Batch SMS/email campaign.", intent: "operational", whenToShow: "'Send reminder' pill.", permutations: ["Follow-up SMS", "Appointment", "Custom"], dataParams: "BulkActionCardData" },
  { kind: "donut_chart", family: "Homepage", description: "Patient distribution donut.", intent: "operational", whenToShow: "'Demographics' pill.", permutations: ["Gender", "Age group", "Payment"], dataParams: "DonutChartCardData" },
  { kind: "pie_chart", family: "Homepage", description: "Filled pie chart.", intent: "operational", whenToShow: "Alternative to donut.", permutations: ["Same as donut"], dataParams: "PieChartCardData" },
  { kind: "line_graph", family: "Homepage", description: "Metric trend line.", intent: "operational", whenToShow: "'Patient trends' pill.", permutations: ["Footfall", "Revenue"], dataParams: "LineGraphCardData" },
  { kind: "analytics_table", family: "Homepage", description: "KPI dashboard table.", intent: "operational", whenToShow: "'Weekly KPIs' pill.", permutations: ["Weekly", "Monthly"], dataParams: "AnalyticsTableCardData" },
  { kind: "condition_bar", family: "Homepage", description: "Top conditions bars.", intent: "operational", whenToShow: "'Diagnosis distribution'.", permutations: ["Top 10", "Chronic"], dataParams: "ConditionBarCardData" },
  { kind: "heatmap", family: "Homepage", description: "Appointment density grid.", intent: "operational", whenToShow: "'Busiest hours' pill.", permutations: ["This week", "Month"], dataParams: "HeatmapCardData" },
  { kind: "billing_summary", family: "Homepage", description: "Session billing overview.", intent: "operational", whenToShow: "'Billing overview' pill.", permutations: ["Today", "By status"], dataParams: "BillingSummaryCardData" },
  { kind: "external_cta", family: "Homepage", description: "External link (Excel/Word download).", intent: "operational", whenToShow: "Export or download ready.", permutations: ["Excel", "Word", "Custom URL"], dataParams: "ExternalCtaCardData" },
  { kind: "anc_schedule_list", family: "Homepage", description: "ANC schedule with overdue/due items per patient.", intent: "operational", whenToShow: "'ANC schedule' pill.", permutations: ["All due", "Overdue only", "By trimester"], dataParams: "ANCScheduleListCardData" },
  { kind: "follow_up_rate", family: "Homepage", description: "Follow-up rate analytics with trend.", intent: "operational", whenToShow: "'Follow-up rate' pill.", permutations: ["Weekly", "Monthly", "With overdue"], dataParams: "FollowUpRateCardData" },
  { kind: "revenue_comparison", family: "Homepage", description: "Revenue comparison between two periods.", intent: "operational", whenToShow: "'Compare revenue' pill.", permutations: ["Week-on-week", "Month-on-month"], dataParams: "RevenueComparisonCardData" },
  { kind: "vaccination_due_list", family: "Homepage", description: "Patients with vaccinations due/overdue.", intent: "operational", whenToShow: "'Vaccination due list' pill.", permutations: ["Overdue", "Due this week", "By vaccine type"], dataParams: "VaccinationDueListCardData" },
  { kind: "due_patients", family: "Homepage", description: "Patients with pending payment dues.", intent: "operational", whenToShow: "'Patients with due' pill.", permutations: ["This week", "Last 30 days", "All pending"], dataParams: "DuePatientsCardData" },
  { kind: "completeness", family: "Utility", description: "Documentation completeness check with filled/empty sections.", intent: "operational", whenToShow: "'Completeness check' pill.", permutations: ["Mostly complete", "Mostly empty", "All filled"], dataParams: "{sections: CompletenessSection[], emptyCount}" },
  { kind: "patient_narrative", family: "Text", description: "Standalone patient narrative as violet-bordered paragraph.", intent: "data_retrieval", whenToShow: "Part of patient summary flow.", permutations: ["Short (1 line)", "Full (3-4 lines)"], dataParams: "{patientNarrative, specialtyTags, followUpOverdueDays}" },
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
      <div className="space-y-10">
        {/* ── Page header ── */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50/80 via-white to-violet-50/60 px-6 py-5">
          <h3 className="text-[18px] font-bold text-slate-800 mb-1">Card Anatomy Blueprint</h3>
          <p className="text-[12px] leading-[1.6] text-slate-500 max-w-2xl">
            Every Dr. Agent card follows a consistent structure: header, content, section tags, insight, canned messages, and footer. This reference defines each zone, its rules, and its variants.
          </p>
        </div>

        {/* ═══ 1. CARD STRUCTURE ═══ */}
        <DocSection number="1" title="Card Structure" subtitle="The base structure every Dr. Agent card follows. Five zones stacked top-to-bottom inside a CardShell.">

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-[12px] bg-slate-900 px-4 py-4 font-mono text-[10px] leading-[1.6] text-emerald-300">
                <pre>{`┌─ CardShell (rounded, gradient stroke) ───────────────────────┐
│ HEADER                                                      │
│ [Blue icon] [Primary title / subtitle] [copy] [tag] [^]    │
├──────────────────────────────────────────────────────────────┤
│ CONTENT                                                     │
│ Inline rows / tags / tables / charts / lists / summaries    │
├──────────────────────────────────────────────────────────────┤
│ INSIGHT                                                     │
│ Optional clinical interpretation / severity callout         │
├──────────────────────────────────────────────────────────────┤
│ CANNED MESSAGES                                             │
│ [Compare prev] [Show trend] [Suggest next steps]            │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
│ 0 CTA / 1 CTA / 2 CTAs                                      │
└──────────────────────────────────────────────────────────────┘`}</pre>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold text-slate-700 mb-2">Basic card structure</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                    <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                    Header is the identity layer: icon, title, optional metadata, and shared controls.
                  </li>
                  <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                    <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                    Content is the main payload layer: structured rows, tags, charts, tables, or sectioned text.
                  </li>
                  <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                    <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                    Insight is optional and only appears when AI interpretation adds value beyond raw data.
                  </li>
                  <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                    <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                    Canned messages always come before the footer. Footer is always the last zone.
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <LiveCardPreview kind="lab_panel" label="Full Card Example — all zones in one card" />
            </div>
          </div>
        </DocSection>

        {/* ═══ 2. HEADER ZONE ═══ */}
        <DocSection number="2" title="Header Zone" subtitle="The identity layer. Icon, title, optional metadata, and shared controls. Header parts are mix-and-match but the mandatory trio stays constant.">

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Spec table */}
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <table className="min-w-full text-[11px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-3 py-2 font-semibold w-32">Element</th>
                    <th className="px-3 py-2 font-semibold">Specification</th>
                    <th className="px-3 py-2 font-semibold w-14">Always?</th>
                  </tr></thead>
                  <tbody>{HEADER_ELEMENTS.map(h => (
                    <tr key={h.element} className="border-b border-slate-50">
                      <td className="px-3 py-1.5 font-medium text-slate-700">{h.element}</td>
                      <td className="px-3 py-1.5 text-slate-600">{h.spec}</td>
                      <td className="px-3 py-1.5 text-center">{h.always ? <span className="text-emerald-600 font-bold">Yes</span> : <span className="text-slate-300">—</span>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-[11px] font-semibold text-blue-800 mb-2">Mandatory vs optional</p>
                <ul className="space-y-1">
                  {HEADER_MANDATORY_RULES.map((rule, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-[10px] leading-[1.45] text-blue-700">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-[11px] font-semibold text-amber-800 mb-2">Header copy icon logic</p>
                <ul className="space-y-1">
                  {HEADER_COPY_RULES.map((rule, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-[10px] leading-[1.45] text-amber-700">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Header-only variants */}
            <div className="space-y-3">
              <HeaderPreview
                label="Variant A — mandatory pieces only"
                title="Lab Panel"
                iconName="lab"
                alignCenter
              />
              <HeaderPreview
                label="Variant B — full mixed header"
                title="Last Visit Summary"
                subtitle="22 Feb'26"
                tag="Past Visit"
                iconName="medical-record"
                showCopy
                alignCenter
              />
            </div>
          </div>
        </DocSection>

        {/* ═══ 3. CONTENT ZONE ═══ */}
        <DocSection number="3" title="Content Zone" subtitle={`${CONTENT_PRIMITIVES.length} content primitives power all cards. Click any primitive below to see its live preview and full specification.`}>

          <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full table-fixed text-[11px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="w-40 px-3 py-2 font-semibold">Element</th>
                <th className="w-[42%] px-3 py-2 font-semibold">Specification</th>
                <th className="w-[34%] px-3 py-2 font-semibold">Logic</th>
              </tr></thead>
              <tbody>{CONTENT_ELEMENT_SPECS.map(spec => (
                <tr key={spec.element} className="border-b border-slate-50">
                  <td className="px-3 py-2 align-top font-medium text-slate-700">{spec.element}</td>
                  <td className="px-3 py-2 align-top text-slate-600 leading-[1.5]">{spec.spec}</td>
                  <td className="px-3 py-2 align-top text-[10px] text-slate-500 leading-[1.5]">{spec.logic}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          <div className="space-y-2">
            {CONTENT_PRIMITIVES.map(cp => {
              const isExpanded = expandedPrimitive === cp.name
              const catalogEntry = findCatalogCard(cp.exampleCard)
              return (
                <div key={cp.name} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  {/* Primitive header — click to expand */}
                  <button
                    type="button"
                    onClick={() => setExpandedPrimitive(isExpanded ? null : cp.name)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-violet-100 text-[10px] font-bold text-violet-600">
                      {isExpanded ? "−" : "+"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800">{cp.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500 leading-[1.5]">{cp.description}</p>
                    </div>
                    <div className="flex flex-shrink-0 flex-wrap gap-1 max-w-[200px] justify-end">
                      {cp.usedIn.slice(0, 3).map(u => (
                        <span key={u} className="rounded bg-violet-50 border border-violet-100 px-1.5 py-0.5 text-[9px] text-violet-600 whitespace-nowrap">{u}</span>
                      ))}
                      {cp.usedIn.length > 3 && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">+{cp.usedIn.length - 3}</span>
                      )}
                    </div>
                  </button>

                  {/* Expanded: Live preview + full details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      <div className="grid gap-4 p-4 lg:grid-cols-2">
                        {/* Left: Details */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Used in cards</p>
                            <div className="flex flex-wrap gap-1">
                              {cp.usedIn.map(u => <span key={u} className="rounded bg-violet-50 border border-violet-100 px-1.5 py-0.5 text-[9px] text-violet-600">{u}</span>)}
                            </div>
                          </div>
                          {cp.variations && (
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Variations</p>
                              <div className="flex flex-wrap gap-1">
                                {cp.variations.map(v => <span key={v} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600">{v}</span>)}
                              </div>
                            </div>
                          )}
                          {cp.fetchFrom && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">Fetch from</p>
                              <p className="text-[10px] leading-[1.5] text-slate-600">{cp.fetchFrom}</p>
                            </div>
                          )}
                          {cp.uiRule && (
                            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-600">UI structuring rule</p>
                              <p className="text-[10px] leading-[1.5] text-emerald-700">{cp.uiRule}</p>
                            </div>
                          )}
                        </div>

                        {/* Right: Live card preview */}
                        {catalogEntry && (
                          <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Live Preview — {catalogEntry.label}
                            </p>
                            <div className="rounded-xl overflow-hidden">
                              <div className="w-full max-w-[380px]">
                                <CardRenderer
                                  output={catalogEntry.output}
                                  onPillTap={noop}
                                  onCopy={noop}
                                  onSidebarNav={noop}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </DocSection>

        {/* ═══ 4. SECTION TAGS ═══ */}
        <DocSection number="4" title="All Section Tags" subtitle={`${ALL_SECTION_TAGS.length} currently documented section tags across all cards. Tags are always paired with icons — never shown as text-only labels.`}>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-[11px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-3 py-2 font-semibold w-14">Icon</th>
                    <th className="px-3 py-2 font-semibold w-36">Tag Label</th>
                    <th className="px-3 py-2 font-semibold">Used In</th>
                    <th className="px-3 py-2 font-semibold w-16">Variant</th>
                  </tr></thead>
                  <tbody>{ALL_SECTION_TAGS.map(t => (
                    <tr key={t.tag + t.usedIn} className="border-b border-slate-50">
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${t.variant === "specialty" ? "bg-tp-violet-50 text-tp-violet-600" : "bg-tp-slate-100 text-tp-slate-500"}`}>
                          <TagIconPreview iconName={t.iconName} variant={t.variant} size={14} />
                        </span>
                      </td>
                      <td className="px-3 py-1.5">
                        <SectionTag
                          label={t.tag}
                          icon={t.iconName}
                          variant={t.variant}
                          className="pointer-events-none"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-slate-600">{t.usedIn}</td>
                      <td className="px-3 py-1.5 text-slate-400">{t.variant}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] font-semibold text-slate-700 mb-1.5">Tag Heading Rules</p>
                <p className="text-[10px] leading-[1.55] text-slate-600">
                  Tags are the default visual language for internal section headings inside Dr. Agent cards. Whenever a card needs to separate one clinical section from another, that section heading should appear as a tag with its relevant icon instead of a plain text label.
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-700 mb-1">Inline Pattern</p>
                    <p className="text-[10px] leading-[1.5] text-slate-500 mb-2">
                      Use this when the content reads like one continuous line, summary line, or paragraph fragment.
                    </p>
                    <div className="text-[11px] leading-[1.7] text-slate-700">
                      <SectionTag label="Last Visit" icon={SECTION_TAG_ICON_MAP["Last Visit"]} className="pointer-events-none" />{" "}
                      Presented with fever, cough, and body ache. Antibiotics started for 5 days.
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-700 mb-1">Stacked Pattern</p>
                    <p className="text-[10px] leading-[1.5] text-slate-500 mb-2">
                      Use this when the section contains bullets, pointers, grouped items, or multiple rows.
                    </p>
                    <div>
                      <SectionTag label="Diagnosis" icon={SECTION_TAG_ICON_MAP["Diagnosis"]} className="pointer-events-none mb-1" />
                      <div className="space-y-[2px] pl-[2px] text-[10px] text-slate-600">
                        <p>• Viral upper respiratory infection</p>
                        <p>• Rule out secondary bacterial sinusitis</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[10px] font-semibold text-slate-700 mb-1">Practical Rules</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                      If a card has multiple internal sections like diagnosis, medication, investigations, advice, or follow-up, each section heading should use the tag pattern for consistency.
                    </li>
                    <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                      If the content is line-based or paragraph-based, the text should start immediately next to the tag on the same line.
                    </li>
                    <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                      If the content is bullet-based, row-based, or pointer-based, keep the tag on its own line and start the list on the next line.
                    </li>
                    <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                      The icon color and the label color inside a tag should always match. If the tag text uses slate, violet, or any other semantic color, the icon must use that same token.
                    </li>
                    <li className="flex items-start gap-1.5 text-[10px] text-slate-600">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                      The catalog is not fixed to a final count. Add a new tag whenever a real new section heading appears, then reuse that same label-icon pair consistently across cards.
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Live preview showing section tags in action */}
            <div className="space-y-3">
              <LiveCardPreview kind="last_visit" label="Last Visit with icon-led tags + common header copy" highlightZone="content" />
              <LiveCardPreview kind="rx_preview" label="Rx Preview with icon-led tags + common header copy" highlightZone="content" />
            </div>
          </div>
        </DocSection>

        {/* ═══ 5. INSIGHT ZONE ═══ */}
        <DocSection number="5" title="Insight Zone" subtitle="AI-generated interpretation that sits below content and above the footer. Uses 4 color variants based on clinical severity.">

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {INSIGHT_VARIANTS.map(iv => (
                <div key={iv.variant} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      iv.variant === "red" ? "bg-red-100 text-red-700" :
                      iv.variant === "amber" ? "bg-amber-100 text-amber-700" :
                      iv.variant === "purple" ? "bg-violet-100 text-violet-700" :
                      "bg-teal-100 text-teal-700"
                    }`}>{iv.variant}</span>
                  </div>
                  <p className="text-[10px] text-slate-600"><strong>When:</strong> {iv.when}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 italic">&quot;{iv.example}&quot;</p>
                </div>
              ))}
            </div>

            {/* Live preview showing insight in a card */}
            <div className="space-y-3">
              <LiveCardPreview kind="lab_panel" label="Card with insight (Lab Panel)" highlightZone="insight" />
              <LiveCardPreview kind="med_history" label="Card with insight (Med History)" highlightZone="insight" />
            </div>
          </div>
        </DocSection>

        {/* ═══ 6. PILLS / CANNED MESSAGES ═══ */}
        <DocSection number="6" title="Pills / Canned Messages" subtitle="Guided next-step suggestions after the card payload. Sit above the footer and help the doctor continue the workflow without typing.">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-[11px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-3 py-2 font-semibold w-32">Aspect</th>
                    <th className="px-3 py-2 font-semibold">Rule</th>
                  </tr></thead>
                  <tbody>
                    {[
                      ["Placement", "Always above the footer zone and below the main content or insight area."],
                      ["Count", "Show a maximum of 4 pills at one time. Prefer the strongest next steps instead of showing every possible action."],
                      ["Length", "Keep each pill short, ideally 2-4 words, so it remains glanceable and tappable."],
                      ["Type", "Use pills for next actions like compare, explain, trend, translate, continue, or refine."],
                    ].map(([aspect, rule]) => (
                      <tr key={aspect} className="border-b border-slate-50">
                        <td className="px-3 py-1.5 font-medium text-slate-700">{aspect}</td>
                        <td className="px-3 py-1.5 text-slate-600">{rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-[11px] font-semibold text-blue-800 mb-2">How to generate canned messages</p>
                <ul className="space-y-1">
                  {PILL_LOGIC.generation.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-blue-700">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />{r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-[11px] font-semibold text-emerald-700 mb-2">When pills ARE shown</p>
                  <ul className="space-y-1">{PILL_LOGIC.when_shown.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-emerald-600">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{r}
                    </li>
                  ))}</ul>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-[11px] font-semibold text-red-700 mb-2">When pills are NOT shown</p>
                  <ul className="space-y-1">{PILL_LOGIC.when_not_shown.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-red-600">
                      <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />{r}
                    </li>
                  ))}</ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Visual example</p>
                <div className="flex flex-wrap gap-1">
                  {["Compare prev", "Show trend", "Suggest next steps", "Translate advice"].map((pill) => (
                    <span key={pill} className="inline-flex items-center rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 px-3 py-1 text-[11px] font-medium text-violet-700">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <LiveCardPreview kind="lab_panel" label="Card with canned messages above footer" />
            </div>
          </div>
        </DocSection>

        {/* ═══ 7. FOOTER ZONE ═══ */}
        <DocSection number="7" title="Footer Zone" subtitle="CTA zone supports 0, 1, or 2 CTAs only. Copy belongs in the header, not the footer. Always the final zone in the card.">

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-[11px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-3 py-2 font-semibold w-28">Footer Type</th>
                    <th className="px-3 py-2 font-semibold">When</th>
                    <th className="px-3 py-2 font-semibold w-44">Example</th>
                  </tr></thead>
                  <tbody>{FOOTER_CONFIG.scenarios.map(s => (
                    <tr key={s.type} className="border-b border-slate-50">
                      <td className="px-3 py-1.5 font-medium text-slate-700">{s.type}</td>
                      <td className="px-3 py-1.5 text-slate-600">{s.when}</td>
                      <td className="px-3 py-1.5 text-slate-400 text-[10px]">{s.example}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-600 mb-1">Footer Rules</p>
                <ul className="space-y-0.5">{FOOTER_CONFIG.rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-500">
                    <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />{r}
                  </li>
                ))}</ul>
              </div>
            </div>

            <div className="space-y-3">
              <FooterVariantPreview
                label="Single CTA - Tertiary"
                variant="tertiary"
                align="left"
                ctas={[{ text: "Open Excel", icon: "right", iconKind: "arrow", tone: "blue", hug: true }]}
              />
              <FooterVariantPreview
                label="Single CTA - Secondary"
                variant="secondary"
                align="left"
                ctas={[{ text: "Acknowledge", icon: "left", iconKind: "check", tone: "green" }]}
              />
              <FooterVariantPreview
                label="Two CTAs - Tertiary"
                variant="tertiary"
                ctas={[
                  { text: "View full report", tone: "blue" },
                  { text: "Explore details", tone: "blue" },
                ]}
              />
              <FooterVariantPreview
                label="Two CTAs - Secondary"
                variant="secondary"
                ctas={[
                  { text: "Confirm & Send", icon: "left", iconKind: "check", tone: "blue" },
                  { text: "Cancel", tone: "red" },
                ]}
              />
            </div>
          </div>
        </DocSection>

        {/* ═══ 8. THUMBS UP / DOWN ═══ */}
        <DocSection number="8" title="Thumbs Up / Thumbs Down" subtitle="Lightweight feedback control in chat. Not a card action — a response-quality signal to learn whether the output satisfied the doctor.">

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="min-w-full text-[11px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-3 py-2 font-semibold w-28">Aspect</th>
                  <th className="px-3 py-2 font-semibold">Guideline</th>
                </tr></thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">Why</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Collect quick CSAT / DSAT feedback on whether the response was useful, relevant, and satisfactory for the doctor.</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">Where</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">In the chat response support row, outside the card body and outside the footer CTA zone.</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">When</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Show on AI-generated responses where we want to learn whether the output quality is helping or not.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-700">How</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Keep it one-time, binary, and low-friction. It should never compete with primary response actions like copy, fill, or footer CTAs.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Live pattern</p>
              <div className="flex items-center gap-3">
                <FeedbackRow messageId="doc-ref-feedback-preview" />
                <p className="text-[10px] text-slate-500">Quick response feedback to learn what is satisfying the user and what needs to improve.</p>
              </div>
            </div>
          </div>
        </DocSection>

        {/* ═══ 9. DATA COMPLETENESS ═══ */}
        <DocSection number="9" title="Data Completeness Donut" subtitle="A selective trust signal shown only on cards with a known expected data set. Helps doctors judge how complete the structured view is.">

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="min-w-full text-[11px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-3 py-2 font-semibold w-28">Aspect</th>
                  <th className="px-3 py-2 font-semibold">Guideline</th>
                </tr></thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">Where</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Show in the card header metadata area using the headerExtra slot.</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">When</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Use only on particular cards such as problem-oriented cards and similar structured views where completeness against an expected schema matters.</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">Why</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Help the doctor quickly judge whether the card is largely EMR-backed, partially extracted, or missing meaningful expected inputs.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-700">Do not show</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Avoid it on free-form or flexible cards that simply display whatever data is available, because there is no fixed completeness expectation there.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Live pattern</p>
                <div className="flex items-center gap-3">
                  <DataCompletenessDonut emr={60} ai={25} missing={15} />
                  <p className="text-[10px] text-slate-500">Best suited for POMR / fixed-structure cards where missingness itself is clinically informative.</p>
                </div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-[11px] font-semibold text-blue-800 mb-2">Implementation note</p>
                <p className="text-[10px] leading-[1.55] text-blue-700">
                  In the current system, this pattern should be treated as an exception-based trust signal, not a default badge for all cards.
                </p>
              </div>
            </div>
          </div>
        </DocSection>

        {/* ═══ 10. SOURCE ICON ═══ */}
        <DocSection number="10" title="Source Icon" subtitle="A trust and provenance cue. Tells the doctor which source data backs the response and where it was derived from.">

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="min-w-full text-[11px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-3 py-2 font-semibold w-28">Aspect</th>
                  <th className="px-3 py-2 font-semibold">Guideline</th>
                </tr></thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">Why</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Build trust and show the doctor which source contributed to the generated response.</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">When</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Show on AI-generated responses where provenance matters and where the user may want to understand the backing source.</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">Where</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Keep it in the response support/meta area, not inside the footer CTA row.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-700">How</td>
                    <td className="px-3 py-2 text-[10px] leading-[1.55] text-slate-600">Use a compact icon with a tooltip, popover, or source detail rather than a heavy inline explanation.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Live pattern</p>
              <div className="flex items-center gap-3">
                <SourceInfoIcon sources={["EMR Records", "Lab Reports", "Uploaded Documents"]} />
                <p className="text-[10px] text-slate-500">A compact provenance cue to explain where the AI-generated response is coming from.</p>
              </div>
            </div>
          </div>
        </DocSection>

        {/* ═══ 11. iPad / TABLET CONSIDERATIONS ═══ */}
        <DocSection number="11" title="iPad / Tablet Considerations" subtitle="Desktop interactions that may not work on iPad or tablet devices. These need alternative UX patterns for touch-first usage.">
          <div className="space-y-4">
            {/* Overview callout */}
            <Callout tone="amber" label="Why this matters">
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Many doctors use iPads in clinic. Hover-dependent interactions become invisible on touch.</li>
                <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Tooltips triggered by hover never appear — critical information can be lost.</li>
                <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Copy actions that rely on hover-reveal icons become undiscoverable.</li>
              </ul>
            </Callout>

            {/* Issues table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[10px]">
                    <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400 w-8">#</th>
                    <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400 w-36">Interaction</th>
                    <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400">Desktop behavior</th>
                    <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400">iPad issue</th>
                    <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400">Recommended fix</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 1, interaction: "Header copy icon", desktop: "Appears on hover over the card header area", issue: "Never appears — doctor cannot discover the copy action", fix: "Always show copy icon on touch devices, or show on first tap then persist" },
                    { n: 2, interaction: "Tooltip on copy", desktop: "Hover shows 'Copy to RxPad' tooltip before clicking", issue: "No tooltip — doctor taps copy without knowing what it does", fix: "Use a brief toast or inline label ('Copied!') on tap instead of pre-action tooltip" },
                    { n: 3, interaction: "Source icon tooltip", desktop: "Hover reveals source provenance (EMR, Lab, Records)", issue: "Source info is completely hidden", fix: "Tap to toggle a small popover/sheet showing source details" },
                    { n: 4, interaction: "Completeness donut tooltip", desktop: "Hover shows EMR%, AI%, Missing% breakdown", issue: "Breakdown percentages never visible", fix: "Tap donut to expand inline or show a small bottom sheet with details" },
                    { n: 5, interaction: "Pill hover states", desktop: "Pills show subtle background change and cursor pointer on hover", issue: "No visual affordance that pills are tappable", fix: "Add a subtle border or shadow to pills by default on touch to hint interactivity" },
                    { n: 6, interaction: "Table row hover", desktop: "Rows in lab panels, med history highlight on hover for readability", issue: "No row highlighting — dense tables harder to read", fix: "Use alternating row colors (zebra stripes) on touch devices for readability" },
                    { n: 7, interaction: "Accordion expand target", desktop: "Full header row is clickable to expand/collapse", issue: "Touch target may be too small if only the chevron is tappable", fix: "Ensure full header row is the tap target (min 44px height per Apple HIG)" },
                    { n: 8, interaction: "Scrollable card content", desktop: "Scroll wheel works inside cards with overflow", issue: "Touch scroll can conflict with page scroll", fix: "Ensure cards use proper touch-scroll momentum and do not trap scroll" },
                    { n: 9, interaction: "Footer CTA spacing", desktop: "CTAs are comfortable at current spacing", issue: "Touch targets may be too close together for fat fingers", fix: "Increase CTA button padding to min 44x44px touch targets on tablet" },
                    { n: 10, interaction: "Drug interaction severity badge", desktop: "Hover on severity badge shows detailed explanation", issue: "Explanation never appears", fix: "Tap badge to expand explanation inline below the badge" },
                    { n: 11, interaction: "Chat input", desktop: "Keyboard shortcuts (Cmd+Enter to send)", issue: "No keyboard shortcuts on iPad virtual keyboard", fix: "Ensure send button is always visible and tappable" },
                    { n: 12, interaction: "Context menu / right-click", desktop: "Right-click for additional options on cards", issue: "No right-click on touch devices", fix: "Use long-press gesture for context menu, or provide explicit action buttons" },
                  ].map(item => (
                    <tr key={item.n} className="border-b border-slate-50 align-top">
                      <td className="px-4 py-2.5 text-slate-400 font-mono text-[10px]">{item.n}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-700">{item.interaction}</td>
                      <td className="px-4 py-2.5 text-slate-600">{item.desktop}</td>
                      <td className="px-4 py-2.5 text-red-600">{item.issue}</td>
                      <td className="px-4 py-2.5 text-emerald-700">{item.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Design principles for touch */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: "Always visible actions", desc: "On touch devices, never hide primary actions behind hover. Copy, expand, and source should be discoverable without hovering." },
                { title: "44px minimum targets", desc: "Apple HIG mandates 44x44pt minimum touch targets. All buttons, pills, accordion headers, and CTAs must meet this." },
                { title: "Tap replaces hover", desc: "Every hover interaction needs a tap equivalent: tooltips become popovers, hover-reveals become always-visible or tap-to-toggle." },
              ].map(item => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-[12px] font-semibold text-slate-800 mb-1.5">{item.title}</p>
                  <p className="text-[11px] leading-[1.55] text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </DocSection>

        {/* ═══ 12. FOOTER CTA RULES ═══ */}
        <DocSection number="12" title="Footer CTA Rules" subtitle="Secondary CTAs for actions, tertiary CTAs for navigation. This rule applies across all cards.">
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="bg-blue-600 px-4 py-2.5">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Secondary CTA (Actions)</p>
                  <p className="text-[10px] text-blue-200 mt-0.5">Bordered button, blue text, no arrow icon</p>
                </div>
                <div className="divide-y divide-slate-50 text-[11px]">
                  {["Send reminder", "Acknowledge", "Confirm and Send", "Submit", "Fill to RxPad", "Send via WhatsApp", "Print prescription", "Extend trial"].map(a => (
                    <p key={a} className="px-4 py-2 text-slate-600">{a}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="bg-slate-500 px-4 py-2.5">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Tertiary CTA (Navigation)</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Text link, with arrow icon, no border</p>
                </div>
                <div className="divide-y divide-slate-50 text-[11px]">
                  {["View full lab report", "See all past visits", "View detailed history", "Open sidebar tab", "Know more", "View all patients"].map(n => (
                    <p key={n} className="px-4 py-2 text-slate-600">{n}</p>
                  ))}
                </div>
              </div>
            </div>
            <Callout tone="blue" label="Rule">
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />If the CTA triggers an instant action (sending, filling, acknowledging, printing), use secondary CTA (bordered).</li>
                <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />If the CTA navigates to another page or opens a sidebar, use tertiary CTA (text link with arrow).</li>
                <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Action CTAs: no arrow icon. Navigation CTAs: always have a right arrow.</li>
                <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Max 2 CTAs per card footer. If 2 CTAs, one can be action and one navigation.</li>
              </ul>
            </Callout>
          </div>
        </DocSection>

      </div>
    )
  }

  // ── CARD CATALOG TAB ──
  // Each card shows spec + live preview side by side
  function renderCardCatalog() {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-[16px] font-bold text-slate-800">All {CARD_SPECS.length} Card Types</h3>
          <p className="text-[11px] text-slate-500">Spec + live preview for each card. Search and filter below.</p>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] leading-[1.55] text-slate-600">
              This catalog should read exactly like the response bible: each card is documented by what it is, when to show it, where its data comes from, how its UI is structured, and what permutations exist. Copy behavior is defined once in the `Copy Rules` section and should be applied consistently across matching cards.
            </p>
          </div>
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
                  {/* Left: Spec info */}
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-700 leading-[1.6]">{card.description}</p>

                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">When shown: </span>
                      <span className="text-[10px] text-slate-600">{card.whenToShow}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Data type: </span>
                      <code className="text-[10px] font-mono text-violet-600">{card.dataParams}</code>
                    </div>

                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Fetch from: </span>
                      <span className="text-[10px] text-slate-600">{getCardFetchFrom(card.kind)}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">UI rule: </span>
                      <span className="text-[10px] text-slate-600">{getCardUiRule(card.kind)}</span>
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

                  {/* Right: Live card preview */}
                  <div>
                    {catalogEntry ? (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Live Preview</p>
                        <div className="rounded-xl overflow-hidden">
                          <div className="w-full max-w-[380px]">
                            <CardRenderer
                              output={catalogEntry.output}
                              onPillTap={noop}
                              onCopy={noop}
                              onSidebarNav={noop}
                            />
                          </div>
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

            {/* 6. Insight Engine */}
            <DocSection number="6" title="Insight Engine" subtitle="When, why, and how Dr. Agent generates clinical insights. Minimal by design. Most cards do NOT show insights.">
              <div className="space-y-4">
                <Callout tone="amber" label="Design philosophy">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Insights are RARE, not default. Most cards should NOT show an insight.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />Show an insight ONLY when the doctor would miss something critical without it.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />If the card data already tells the story (flagged values, status badges), do NOT add an insight.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />If the card IS the recommendation (DDX, Advice, Protocol Meds), do NOT add an insight.</li>
                  </ul>
                </Callout>

                {/* Variant rules */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">4 Insight variants</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { variant: "Red", color: "bg-red-100 text-red-700", when: "Critical or life-threatening", example: "K+ 6.8 mEq/L. Immediate ECG and calcium gluconate needed.", trigger: "Value exceeds critical clinical range (e.g., K+ > 6.0, Glucose < 40, SpO2 < 88%)" },
                      { variant: "Amber", color: "bg-amber-100 text-amber-700", when: "Worsening trend needing attention", example: "HbA1c worsened from 7.4% to 8.2% over 3 months. Consider medication adjustment.", trigger: "Value trending in wrong direction across 2+ data points with clinical significance" },
                      { variant: "Purple", color: "bg-violet-100 text-violet-700", when: "AI correlation across multiple data points", example: "Rising creatinine + declining eGFR + new proteinuria suggest CKD progression.", trigger: "Agent detects a pattern across multiple parameters that individually might not alarm" },
                      { variant: "Teal", color: "bg-teal-100 text-teal-700", when: "Positive improvement", example: "LDL improved from 162 to 128 mg/dL after statin initiation.", trigger: "Value improving toward target after a clinical intervention" },
                    ].map(item => (
                      <div key={item.variant} className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${item.color}`}>{item.variant}</span>
                          <span className="text-[12px] font-medium text-slate-700">{item.when}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-1 italic">{item.example}</p>
                        <p className="text-[10px] text-slate-400">Trigger: {item.trigger}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision matrix */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">Insight decision matrix (all card types)</p>
                  </div>
                  <table className="min-w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/40 text-left text-[10px]">
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-36">Card</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400 w-20">Insight?</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { card: "POMR Problem Card", show: true, reason: "Shows when completeness is critically low OR a key value needs immediate action. The POMR card aggregates data, so the insight highlights what the doctor should focus on first." },
                        { card: "SBAR Critical", show: true, reason: "The card itself IS the alert, but the recommendation section at bottom serves as the 'insight' (always red variant). Built into the card structure." },
                        { card: "Cross-Problem Flags (in Patient Summary)", show: true, reason: "When two conditions interact dangerously (e.g., CKD + NSAIDs, DM + steroids). This is the one insight type that surfaces in the summary view because the interaction isn't visible from individual data." },
                        { card: "Follow-up Card", show: true, reason: "Only when the AI recommends a specific interval with clinical reasoning (e.g., 'Why 3 days: BP was 170/100, needs early recheck'). Amber variant." },
                        { card: "Lab Panel", show: false, reason: "Flagged values (red/high, blue/low) already tell the story. Adding insight text is redundant. If a value is critical, it should trigger an SBAR card instead." },
                        { card: "Lab Comparison", show: false, reason: "Delta arrows and color coding already show worsening/improving. The comparison IS the insight." },
                        { card: "Lab Trends", show: false, reason: "The trend line IS the insight. Doctor reads the chart." },
                        { card: "Vital Trends", show: false, reason: "Same as lab trends. The chart tells the story." },
                        { card: "Med History", show: false, reason: "Timeline layout is sufficient. If polypharmacy is a concern, it should be a cross-problem flag in the summary." },
                        { card: "DDX", show: false, reason: "Doctor makes the diagnosis decision. Agent suggests, doctor decides. Insight would be presumptuous." },
                        { card: "Protocol Meds", show: false, reason: "Safety notes are built into the card. Insight would duplicate the safety check." },
                        { card: "Advice / Investigation", show: false, reason: "The content IS the recommendation. No meta-commentary needed." },
                        { card: "Rx Preview", show: false, reason: "Display card, not analytical. Doctor reviews what they wrote." },
                        { card: "Translation", show: false, reason: "Utility card. No clinical interpretation." },
                        { card: "Drug Interaction", show: false, reason: "Severity badge + mechanism description already serve as the insight." },
                        { card: "Allergy Conflict", show: false, reason: "The alert IS the insight. Red card with alternative suggestions." },
                        { card: "Completeness", show: false, reason: "The checklist IS the insight. No additional commentary needed." },
                        { card: "Vaccination", show: false, reason: "Status badges (Due/Overdue/Given) are sufficient." },
                        { card: "OCR Pathology", show: false, reason: "Extracted values with flags are self-explanatory. If critical, should trigger SBAR." },
                        { card: "OCR Extraction", show: false, reason: "Document sections are displayed as-is. Doctor reads the content." },
                        { card: "Specialty Summaries (Gynec, Obstetric, Pediatric, Ophthal)", show: false, reason: "Alert badges handle the critical cases. Summary data is self-explanatory." },
                        { card: "Homepage cards (Revenue, Queue, Analytics, etc.)", show: false, reason: "Operational data, not clinical. No clinical interpretation needed." },
                        { card: "Text responses (fact, list, step, quote, comparison)", show: false, reason: "These ARE the agent's response. Adding insight to the response is circular." },
                      ].map(item => (
                        <tr key={item.card} className="border-b border-slate-50 align-top">
                          <td className="px-3 py-2 font-medium text-slate-700">{item.card}</td>
                          <td className="px-3 py-2">
                            {item.show ? (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Yes</span>
                            ) : (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">No</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-500 leading-[1.5]">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Per-card insight rules for the 4 cards that DO show insights */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700">Insight rules for cards that show insights (only 4 cards)</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      {
                        card: "POMR Problem Card",
                        trigger: "Completeness below 60% OR any lab value in critical range for that specific problem",
                        priority: "1. Critical lab value for this problem (e.g., eGFR < 15 for CKD) 2. Missing expected tests overdue > 3 months 3. Cross-problem medication conflict",
                        template: "[What is wrong]. [Clinical significance]. [What to do next].",
                        variant: "Red if critical value, Amber if monitoring needed, Purple if AI-detected pattern",
                        example: "eGFR declined from 15 to 11 over 6 months. CKD progression accelerating. Consider nephrology referral for dialysis transition planning.",
                      },
                      {
                        card: "Cross-Problem Flags (Patient Summary)",
                        trigger: "Two or more active conditions have a dangerous interaction that isn't obvious from individual data",
                        priority: "1. Drug-disease interaction (e.g., NSAIDs with CKD) 2. Condition-condition interaction (e.g., DM + steroids) 3. Cumulative risk (e.g., 3+ cardiovascular risk factors)",
                        template: "[Condition A] + [Condition B] interaction: [what the risk is]. [Recommended action].",
                        variant: "Red if life-threatening interaction, Amber if needs monitoring",
                        example: "CKD Stage 5 + NSAID use detected. NSAIDs contraindicated in advanced CKD. Review medication list.",
                      },
                      {
                        card: "SBAR Critical",
                        trigger: "Always present (the card only appears for critical situations). The 'Recommendation' section at the bottom IS the insight.",
                        priority: "Single insight: the recommended next action based on the SBAR assessment",
                        template: "Built into card structure as the 'R' (Recommendation) section of SBAR",
                        variant: "Always Red (the entire card is a critical alert)",
                        example: "Immediate: Administer O2, escalate to senior physician. Prepare for ICU transfer if SpO2 does not improve within 15 minutes.",
                      },
                      {
                        card: "Follow-up Card",
                        trigger: "Agent has a specific clinical reason for recommending a particular follow-up interval",
                        priority: "Show only when the reasoning adds value beyond 'routine follow-up'. Do NOT show for standard intervals.",
                        template: "Why [interval]: [clinical reasoning based on current visit data].",
                        variant: "Always Amber (advisory, not critical)",
                        example: "Why 3 days: BP was 170/100 with new antihypertensive started. Early recheck needed to confirm response and adjust dose.",
                      },
                    ].map(item => (
                      <div key={item.card} className="px-4 py-3">
                        <p className="text-[13px] font-semibold text-violet-700 mb-2">{item.card}</p>
                        <div className="grid gap-2 text-[11px]">
                          <div><span className="font-semibold text-slate-600">Trigger:</span> <span className="text-slate-500">{item.trigger}</span></div>
                          <div><span className="font-semibold text-slate-600">Priority:</span> <span className="text-slate-500">{item.priority}</span></div>
                          <div><span className="font-semibold text-slate-600">Template:</span> <span className="text-slate-500 font-mono">{item.template}</span></div>
                          <div><span className="font-semibold text-slate-600">Variant:</span> <span className="text-slate-500">{item.variant}</span></div>
                          <div className="rounded bg-slate-50 px-3 py-2 mt-1 italic text-slate-500">{item.example}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Callout tone="emerald" label="Backend prompt guidance">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Default behavior: NO insight. Only generate when a clear trigger condition is met.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Max 1 insight per card. If multiple triggers fire, pick the highest priority one.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Insight text: max 2 sentences. First sentence states the finding, second states the action.</li>
                    <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Do not repeat what the data already shows. The insight should reveal something the raw data alone does not.</li>
                  </ul>
                </Callout>
              </div>
            </DocSection>

            {/* 7. Document Upload Rules */}
            <DocSection number="7" title="Document Upload Rules" subtitle="How Dr. Agent handles uploaded documents, patient association, and contextual analysis.">
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
                  { scenario: "Upload pathology / lab report", trigger: "Doctor uploads CBC, lipid, renal, liver report image or PDF", card: "ocr_pathology", details: "OCR extracts parameters, flags abnormals, computes confidence score. Insight compares with previous values if available.", permutations: ["CBC", "Lipid profile", "Renal function", "Liver function", "Low-confidence OCR"] },
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

  // ── MAIN CONTENT ──
  const content = (
    <div>
      {/* Main tabs */}
      <div className={`mb-5 border-b border-slate-200 pb-[10px] ${embedded ? "sticky top-0 z-30 bg-[#FAFAFE]/95 pt-2 backdrop-blur-md" : "sticky top-0 z-30 bg-[#FAFAFE]/95 pt-3 backdrop-blur-md"}`}>
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

      {mainTab === "intent-classification" && <IntentClassificationSection />}
      {mainTab === "card-anatomy" && renderCardAnatomy()}
      {mainTab === "card-catalog" && renderCardCatalog()}
      {mainTab === "response-management" && renderResponseMgmt()}
      {mainTab === "user-scenarios" && renderUserScenarios()}
    </div>
  )

  if (embedded) return content

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFE]">
      <header className={`fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-transform duration-200 ${isDocHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h1 className="text-[18px] font-bold leading-tight bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Dr. Agent — Response Management</h1>
              <p className="text-[11px] text-slate-400">Intent Classification, Card Anatomy, Catalog & Response Pipeline</p>
            </div>
          </div>
          <a href="/tp-appointment-screen/scenarios" className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50">Back</a>
        </div>
      </header>
      <main className={`mx-auto max-w-7xl overflow-hidden px-4 transition-[margin-top,height] duration-200 sm:px-6 ${isDocHeaderVisible ? "mt-[73px] h-[calc(100vh-73px)]" : "mt-0 h-screen"}`}>
        <div ref={scrollContainerRef} className="h-full overflow-y-auto py-8">
          {content}
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

"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUp2, Calendar2, Copy } from "iconsax-reactjs"

// ── Live Card Catalog + CardRenderer ──
import { CardCatalogLive, CATALOG, type CatalogEntry } from "@/app/tp-appointment-screen/scenarios/CardCatalogLive"
import { CardRenderer } from "@/components/tp-rxpad/dr-agent/cards/CardRenderer"
import { SectionTag, SECTION_TAG_ICON_MAP } from "@/components/tp-rxpad/dr-agent/cards/SectionTag"
import { TPMedicalIcon } from "@/components/tp-ui"

// ═══════════════════════════════════════════════════════════════
// DR. AGENT — COMPREHENSIVE SYSTEM REFERENCE
// ═══════════════════════════════════════════════════════════════

type MainTab = "card-anatomy" | "card-catalog" | "response-management"

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
    "Single CTA can be left-aligned or center-aligned based on importance.",
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
  if (["patient_summary", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary", "symptom_collector"].includes(kind)) {
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
  if (["patient_summary", "obstetric_summary", "gynec_summary", "pediatric_summary", "ophthal_summary"].includes(kind)) return "Lead with compressed scan-friendly summary blocks, then expand into tag-led structured rows."
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
  { kind: "symptom_collector", family: "Summary", description: "Patient-reported symptoms from pre-visit intake form.", intent: "data_retrieval", whenToShow: "'Review intake data' pill.", permutations: ["Full intake", "Partial intake", "With severity ratings"], dataParams: "SymptomCollectorData" },
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
  { kind: "completeness", family: "Utility", description: "RxPad form completeness check.", intent: "operational", whenToShow: "'Completeness check' pill.", permutations: ["All complete", "Some empty", "Critical missing"], dataParams: "{sections, emptyCount}" },
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
  Homepage: "border-orange-200 bg-orange-50 text-orange-700",
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

function ComprehensiveRef({ embedded = false }: { embedded?: boolean }) {
  const [mainTab, setMainTab] = useState<MainTab>("card-anatomy")
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogFilter, setCatalogFilter] = useState("all")
  const [activePhase, setActivePhase] = useState("empty")
  const [expandedPrimitive, setExpandedPrimitive] = useState<string | null>(null)
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
      <div className="space-y-12">
        {/* ═══ CARD ANATOMY BLUEPRINT ═══ */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">Card Anatomy Blueprint</h3>
          <p className="text-[11px] text-slate-500 mb-4">
            This is the base structure every Dr. Agent card follows before we break it into header, content, section tags, insight, canned messages, and footer rules.
          </p>

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
        </section>

        {/* ═══ HEADER ZONE ═══ */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">Header Zone</h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Show only the header component here, not the full card body. The header parts can be mixed based on scenario, but the blue primary icon, primary heading, and accordion toggle stay constant.
          </p>

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
        </section>

        {/* ═══ CONTENT ZONE ═══ */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">Content Zone (Middle)</h3>
          <p className="text-[11px] text-slate-500 mb-2">
            {CONTENT_PRIMITIVES.length} content primitives power all cards. Click any primitive to see its live preview.
          </p>
          <p className="text-[11px] text-slate-500 mb-4">
            Inline data rows, key:value pairs, and tags are rendered using the existing SectionTag + InlineDataRow pieces, and this documentation page does not render copy icons for those rows. Copy actions only appear when the data is newly generated/marked copyable (e.g., patient summary + last visit or newly created focused content).
          </p>

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
        </section>

        {/* ═══ SECTION TAGS ═══ */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">All Section Tags</h3>
          <p className="text-[11px] text-slate-500 mb-3">
            {ALL_SECTION_TAGS.length} currently documented section tags across all cards. This is not a hard cap. These tags are always paired with icons in the product, never shown as text-only labels.
          </p>

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
        </section>

        {/* ═══ INSIGHT ZONE ═══ */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">Insight Zone</h3>
          <p className="text-[11px] text-slate-500 mb-3">AI-generated interpretation. Below content, above footer. 4 color variants.</p>

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
        </section>

        {/* ═══ PILLS / CANNED MESSAGES ═══ */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">Pills / Canned Messages</h3>
          <p className="text-[11px] text-slate-500 mb-3">Canned messages are the guided next-step suggestions that appear after the main card payload. They should sit above the footer and help the doctor continue the workflow without typing.</p>
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
        </section>

        {/* ═══ FOOTER ZONE ═══ */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-1">Footer Zone</h3>
          <p className="text-[11px] text-slate-500 mb-3">Footer CTA zone supports 0, 1, or 2 CTAs only. Copy belongs in the header, not in the footer. This is always the final zone in the card.</p>

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
                align="center"
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
        </section>

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

  // ── RESPONSE MANAGEMENT TAB ──
  function renderResponseMgmt() {
    return (
      <div className="space-y-10">
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">Response Management Bible</h3>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] leading-[1.6] text-slate-600">
                This section is the single operating reference for how Dr. Agent fetches, structures, shows, and copies data. The same card should mean the same thing across Card Anatomy, Card Catalog, and Response Management: same `when to show`, same fetch source, same copy rule, and same UI structuring rule.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-semibold text-slate-700">Historical sidebar sources</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {HISTORICAL_SOURCE_AREAS.map(area => (
                      <span key={area} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] text-slate-600">{area}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                  <p className="text-[10px] font-semibold text-blue-700">Primary RxPad fill targets</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {RXPAD_PRIMARY_TARGETS.map(area => (
                      <span key={area} className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[9px] text-blue-700">{area}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-[11px] font-semibold text-amber-800">What this bible standardizes</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-1.5 text-[10px] leading-[1.45] text-amber-700">
                  <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                  Every card should be understandable using the same four questions: when to show, fetch from, copy eligibility, and UI structuring.
                </li>
                <li className="flex items-start gap-1.5 text-[10px] leading-[1.45] text-amber-700">
                  <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                  Copy behavior should be learned once from a shared rule section, not reinterpreted card by card.
                </li>
                <li className="flex items-start gap-1.5 text-[10px] leading-[1.45] text-amber-700">
                  <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                  Card Anatomy, Card Catalog, and Response Management should describe the same system with consistent language.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">Copy Rules</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {COPY_RULE_EXPLANATIONS.map(rule => (
              <div key={rule.title} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">{rule.title}</p>
                <p className="text-[10px] leading-[1.55] text-slate-600">{rule.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">End-to-End Pipeline</h3>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            {[
              { s: "1", t: "Input", c: "bg-blue-100 text-blue-700 border-blue-200", d: "Doctor types or taps pill. Pill = direct PILL_INTENT_MAP lookup (90+ mappings). Text = normalize + keyword rules." },
              { s: "2", t: "Classify", c: "bg-violet-100 text-violet-700 border-violet-200", d: "37 keyword rules top-to-bottom. Operational checked first. Result: 1 of 9 intents + format (text/card)." },
              { s: "3", t: "Build", c: "bg-emerald-100 text-emerald-700 border-emerald-200", d: "Reply engine: intent + patient data + context = RxAgentOutput. POMR keywords = problem cards." },
              { s: "4", t: "Render", c: "bg-amber-100 text-amber-700 border-amber-200", d: "CardRenderer switch = component. Pills refreshed. Source provenance computed." },
            ].map(s => (
              <div key={s.s} className="flex gap-3">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-[12px] font-bold ${s.c}`}>{s.s}</div>
                <div><p className="text-[11px] font-semibold text-slate-800">{s.t}</p><p className="text-[10px] text-slate-600">{s.d}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Layer Pill Pipeline */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">4-Layer Pill Priority</h3>
          <div className="space-y-1.5">
            {[
              { l: "Layer 1: Safety (P 0-9)", c: "bg-red-50 border-red-200 text-red-700", d: "ALWAYS shown. SpO2 <90 = 'Review SpO2'. Allergies = 'Allergy Alert'. force:true." },
              { l: "Layer 2: Clinical Flags (P 10-29)", c: "bg-amber-50 border-amber-200 text-amber-700", d: "Lab flags >=3, BP >140, SpO2 declining, specialty data, overdue follow-ups." },
              { l: "Layer 3: Phase-Aware (P 29-49)", c: "bg-violet-50 border-violet-200 text-violet-700", d: "empty='Summary', symptoms='DDX', dx='Meds', meds='Translate', complete='Check'. + CKD/DM condition pills." },
              { l: "Layer 4: Tab Lens (P 60-69)", c: "bg-blue-50 border-blue-200 text-blue-700", d: "Vitals tab='Vital trends', Lab='Lab comparison', History='Med history', Records='OCR'. Lowest priority." },
            ].map(l => (
              <div key={l.l} className={`rounded-lg border ${l.c} px-3 py-2`}>
                <p className="text-[11px] font-bold">{l.l}</p>
                <p className="text-[10px] opacity-80">{l.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Phase Engine */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">Consultation Phases</h3>
          <div className="flex gap-1 mb-2">
            {[
              { id: "empty", l: "Empty" }, { id: "symptoms_entered", l: "Symptoms" }, { id: "dx_accepted", l: "Dx Accepted" },
              { id: "meds_written", l: "Meds Written" }, { id: "near_complete", l: "Complete" },
            ].map(p => (
              <button key={p.id} onClick={() => setActivePhase(p.id)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ${activePhase === p.id ? "bg-violet-100 text-violet-700 border border-violet-200" : "border border-slate-200 text-slate-500"}`}>
                {p.l}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="flex flex-wrap gap-1">
              {(activePhase === "empty" ? ["Patient summary", "Suggest DDX", "Lab overview", "Review intake data"] :
                activePhase === "symptoms_entered" ? ["Suggest DDX", "Compare with last visit", "Vital trends"] :
                activePhase === "dx_accepted" ? ["Suggest medications", "Suggest investigations", "Draft advice", "Plan follow-up"] :
                activePhase === "meds_written" ? ["Translate to regional", "Plan follow-up", "Completeness check"] :
                ["Completeness check", "Translate advice", "Visit summary"]
              ).map(p => <span key={p} className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700">{p}</span>)}
            </div>
          </div>
        </section>

        {/* Source & Trust */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">Source Provenance</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 space-y-1 text-[10px] text-slate-600">
              {[["Summary", "EMR + Lab + Records + Visits + Intake"], ["Lab/Trends", "Lab Results or Records"], ["DDX/Meds", "Context + Protocol"], ["POMR/SBAR", "History + Lab + Records (ring)"], ["Homepage", "No source"]].map(([c, s]) => (
                <div key={c} className="flex gap-2"><span className="font-semibold text-slate-700 w-20 flex-shrink-0">{c}</span>{s}</div>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-600">
              <p><strong>Completeness ring:</strong> Only on POMR, SBAR, OCR. 3 segments: EMR (purple) + AI (blue) + Missing (gray).</p>
              <p className="mt-1"><strong>Not shown on:</strong> Pure-EMR (always 100%) or pure-AI cards.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">Unified Card Rules</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-[10px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-3 py-2 font-semibold w-32">Card</th>
                <th className="px-3 py-2 font-semibold w-28">Family</th>
                <th className="px-3 py-2 font-semibold">When to show</th>
                <th className="px-3 py-2 font-semibold">Fetch from</th>
                <th className="px-3 py-2 font-semibold">UI rule</th>
              </tr></thead>
              <tbody>
                {CARD_SPECS.map(card => (
                  <tr key={card.kind} className="border-b border-slate-50 align-top">
                    <td className="px-3 py-2 font-mono text-[9px] text-violet-700">{card.kind}</td>
                    <td className="px-3 py-2 text-slate-700">{card.family}</td>
                    <td className="px-3 py-2 text-slate-600 leading-[1.45]">{card.whenToShow}</td>
                    <td className="px-3 py-2 text-slate-600 leading-[1.45]">{getCardFetchFrom(card.kind)}</td>
                    <td className="px-3 py-2 text-slate-600 leading-[1.45]">{getCardUiRule(card.kind)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Homepage vs Patient */}
        <section>
          <h3 className="text-[16px] font-bold text-slate-800 mb-3">Homepage vs Patient Context</h3>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-[10px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-3 py-1.5 w-20">Aspect</th>
                <th className="px-3 py-1.5"><span className="rounded bg-orange-100 px-1 py-0.5 text-orange-700">Homepage</span></th>
                <th className="px-3 py-1.5"><span className="rounded bg-violet-100 px-1 py-0.5 text-violet-700">Patient</span></th>
              </tr></thead>
              <tbody>
                {[["Cards", "Operational: queue, revenue, KPIs, analytics", "Clinical: summary, DDX, meds, labs, POMR"],
                  ["Pills", "Homepage engine, tab/rail overrides", "4-layer pipeline, safety forced"],
                  ["Phase", "No phase", "Full state machine"],
                  ["Intent", "Operational + comparison", "All 9 categories"]
                ].map(([a, h, p]) => (
                  <tr key={a} className="border-b border-slate-50">
                    <td className="px-3 py-1.5 font-medium text-slate-700">{a}</td>
                    <td className="px-3 py-1.5 text-slate-600">{h}</td>
                    <td className="px-3 py-1.5 text-slate-600">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
          { id: "card-anatomy" as MainTab, label: "Card Anatomy & Patterns" },
          { id: "card-catalog" as MainTab, label: "Card Catalog" },
          { id: "response-management" as MainTab, label: "Response Management" },
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

      {mainTab === "card-anatomy" && renderCardAnatomy()}
      {mainTab === "card-catalog" && renderCardCatalog()}
      {mainTab === "response-management" && renderResponseMgmt()}
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
              <h1 className="text-[18px] font-bold leading-tight bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Dr. Agent — System Reference</h1>
              <p className="text-[11px] text-slate-400">Card Anatomy, Catalog & Response Management</p>
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

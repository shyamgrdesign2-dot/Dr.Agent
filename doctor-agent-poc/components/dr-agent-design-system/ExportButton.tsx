"use client"

import React from "react"
import { Download } from "lucide-react"

// ---------------------------------------------------------------------------
// generateDesignSystemMarkdown
//
// Returns the complete Dr. Agent design system specification as a single
// Markdown string.  The output is designed to be self-contained so that any
// AI assistant (or human designer) can recreate the entire design system from
// scratch without access to the source code.
// ---------------------------------------------------------------------------

function generateDesignSystemMarkdown(): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return `# Dr. Agent Design System -- Complete Specification

> Auto-generated reference for AI-assisted design system creation
> Generated: ${dateStr}

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Card Anatomy (CardShell)](#card-anatomy-cardshell)
3. [Content Primitives](#content-primitives)
4. [Action Buttons](#action-buttons)
5. [Card Types Registry](#card-types-registry)
6. [Chat Shell Components](#chat-shell-components)
7. [Animations & Keyframes](#animations--keyframes)
8. [Rules for Creating New Cards](#rules-for-creating-new-cards)
9. [Type Definitions Reference](#type-definitions-reference)

---

## Design Tokens

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| tp-blue-50 | rgba(59,130,246,0.08) | Card icon backgrounds, CopyButton bg |
| tp-blue-100 | #DBEAFE | CopyButton hover bg |
| tp-blue-200 | #BFDBFE | Step border-left accent |
| tp-blue-400 | -- | Pediatrics accent |
| tp-blue-500 | #3B82F6 | Primary actions, icons, CopyButton border/text |
| tp-blue-600 | -- | Selected patient border-left |
| tp-slate-50 | #F8FAFC | Borders, separators, row dividers, collapse toggle bg |
| tp-slate-100 | #F1F5F9 | User bubble bg, SectionTag default bg, patient initial circle bg |
| tp-slate-200 | #E2E8F0 | Input borders, drag handle bar, patient initial bg |
| tp-slate-300 | #CBD5E1 | Checkbox unchecked border, placeholder text, trust text |
| tp-slate-400 | #94A3B8 | Meta text, dates, secondary info, typing dots |
| tp-slate-500 | #64748B | Secondary text, SectionTag default text |
| tp-slate-600 | #475569 | Body text alt, attach icon |
| tp-slate-700 | #334155 | Primary body text |
| tp-slate-800 | #1E293B | Headings, labels, DataRow label |
| tp-slate-900 | -- | Bold markdown text in chat |
| tp-violet-50 | rgba(139,92,246,0.08) | Specialty tags bg, InsightBox purple bg |
| tp-violet-200 | #DDD6FE | Quote left-border |
| tp-violet-500 | #8B5CF6 | Specialty accents, obstetric accent |
| tp-violet-600 | #7C3AED | Specialty text, SectionTag specialty text |
| tp-violet-700 | #6D28D9 | InsightBox purple text |
| tp-error-50 | #FEF2F2 | Error backgrounds, InsightBox red bg |
| tp-error-600 | #DC2626 | Flag text (both high and low arrows) |
| tp-error-700 | #B91C1C | InsightBox red text |
| tp-warning-50 | #FFFBEB | Warning backgrounds, InsightBox amber bg |
| tp-warning-700 | #B45309 | InsightBox amber text |
| tp-success-50 | -- | Today badge bg |
| tp-success-500 | -- | Today appointment green dot |
| tp-success-600 | -- | Today badge text, recording submit icon |

### AI Brand Gradients

\`\`\`css
/* Primary AI gradient (text, icons, shapes) */
AI_GRADIENT:
  linear-gradient(91deg, #D565EA 3.04%, #673AAC 66.74%, #1A1994 130.45%)

/* Soft fill for icon backgrounds (static) */
AI_GRADIENT_SOFT:
  linear-gradient(135deg,
    rgba(213,101,234,0.08) 0%,
    rgba(103,58,172,0.08) 50%,
    rgba(26,25,148,0.08) 100%)

/* Animated soft gradient for AI spark icon backgrounds (6s cycle) */
AI_GRADIENT_SOFT_ANIMATED:
  linear-gradient(135deg,
    rgba(213,101,234,0.18) 0%,
    rgba(139,92,246,0.22) 25%,
    rgba(103,58,172,0.18) 50%,
    rgba(26,25,148,0.15) 75%,
    rgba(213,101,234,0.18) 100%)
  backgroundSize: 200% 200%

/* Gradient border for AI elements */
AI_GRADIENT_BORDER:
  linear-gradient(135deg,
    rgba(213,101,234,0.3) 0%,
    rgba(103,58,172,0.3) 50%,
    rgba(26,25,148,0.3) 100%)

/* Pill background */
AI_PILL_BG:
  linear-gradient(135deg,
    rgba(213,101,234,0.08) 0%,
    rgba(103,58,172,0.08) 50%,
    rgba(26,25,148,0.08) 100%)

/* Pill background on hover */
AI_PILL_BG_HOVER:
  linear-gradient(135deg,
    rgba(213,101,234,0.14) 0%,
    rgba(103,58,172,0.14) 50%,
    rgba(26,25,148,0.14) 100%)

/* Pill border */
AI_PILL_BORDER:
  1px solid rgba(103,58,172,0.15)

/* Pill text gradient (same as AI_GRADIENT, applied via WebkitBackgroundClip: text) */
AI_PILL_TEXT_GRADIENT:
  linear-gradient(91deg, #D565EA 3.04%, #673AAC 66.74%, #1A1994 130.45%)
\`\`\`

### Card Border Gradient

\`\`\`css
/* CardShell outer border uses a double-background trick */
border: 1px solid transparent;
backgroundImage:
  linear-gradient(white, white),
  linear-gradient(180deg,
    rgba(59,130,246,0.18) 0%,
    rgba(59,130,246,0.04) 25%,
    rgba(23,23,37,0.02) 50%,
    rgba(59,130,246,0.04) 75%,
    rgba(59,130,246,0.18) 100%);
backgroundOrigin: border-box;
backgroundClip: padding-box, border-box;
\`\`\`

### Typography Scale

| Size | Usage |
|------|-------|
| 8-9px | Chart labels, ref ranges |
| 9px | Ref ranges, file size text, doc meta |
| 10px | Meta text, dates, secondary info, badges, chips, tooltips, trust indicator, specialty dropdown, search placeholder |
| 11px | Pills, tags, small buttons, SectionTag labels, file names, patient dropdown meta |
| 12px | Primary body text (ALL card content), chat messages, card titles (font-semibold), textarea, search input |
| 13px | Bottom sheet header, patient dropdown name |
| 14px | Card titles (max in content area) |
| 16px | Header title ("Dr. Agent") |

**Font weights used:** normal (400), medium (500), semibold (600), bold (700)

### Spacing

| Value | Usage |
|-------|-------|
| 0.5px | Row separator border width |
| 1px | SectionTag icon-text gap, card action gap |
| 2px | Feedback row margin-top, hover icon gap |
| 3px | DataRow/RadioRow vertical padding (py) |
| 4px | Trust indicator margin-top, dropdown item gap |
| 5px | InsightBox vertical padding, RadioRow icon-text gap |
| 6px | Gap between icon and title, PillBar item gap, AiGradientBg default borderRadius, chat bubble text gap, card-to-cards offset mt |
| 7px | CardShell header gap |
| 8px | Section gaps, inner component padding, CheckboxRow icon-text gap, PillBar horizontal padding, dropdown search bg padding, text_step left-border padding |
| 10px | Card body padding (py), InsightBox horizontal padding, ChatInput container padding, bottom sheet doc row padding, recording pill padding |
| 11px | CardShell header vertical padding |
| 12px | Card horizontal padding (px-3), recording pill horizontal padding |
| 14px | Outer panel padding (AgentHeader px), ChatPillButton horizontal padding |
| 16px | Bottom sheet border-radius (rounded-t-16) |

### Border Radius

| Value | Usage |
|-------|-------|
| 4px | Tags, badges, SectionTag |
| 5px | Bottom sheet checkbox |
| 6px | InsightBox, AiGradientBg default, collapse toggle |
| 7px | Upload button icon container |
| 8px | Inner containers, icon backgrounds (CardShell header icon, patient selector dropdown search), specialty dropdown |
| 10px | Recording bar, bottom sheet doc rows, send button |
| 12px | Pills (rounded-full), input borders, chat bubbles, patient dropdown container |
| 14px | Card outer shell (CardShell) |
| 16px | Bottom sheets (rounded-t-16), patient selector dropdown |
| full | Pill buttons (rounded-full), patient initial circle |

### Card Sizing Constants

\`\`\`typescript
const CARD = {
  radius: 12,
  headerIconSize: 26,    // px
  headerIconRadius: 8,   // px
  titleSize: 14,          // px
  bodySize: 12,           // px
  secondarySize: 10,      // px
  tagSize: 11,            // px
  ctaHeight: 30,          // px
  ctaRadius: 10,          // px
  ctaFontSize: 12,        // px
  padding: { x: 12, y: 8 }, // px
}
\`\`\`

---

## Card Anatomy (CardShell)

Every card in the system wraps its content in \`CardShell\`. This ensures visual consistency across all 51+ card types.

### Outer Container

\`\`\`
rounded-[14px], white bg
gradient border (blue-18% -> blue-4% -> slate-2% -> blue-4% -> blue-18%)
overflow-hidden
\`\`\`

### Header Row

\`\`\`
Layout: flex gap-[7px] px-3 py-[11px]
  - items-center (no date) or items-start (with date)
Background: linear-gradient(180deg, rgba(59,130,246,0.05) 0%, #FFFFFF 100%)
Border bottom: 1px solid var(--tp-slate-50)

Children (left to right):
  1. Icon container
     - 26x26px, flex-shrink-0, rounded-[8px]
     - bg: var(--tp-blue-50)
     - Icon: TPMedicalIcon 15px, color var(--tp-blue-500)
     - OR custom React node passed as icon prop

  2. Title + Date column
     - Title: 12px font-semibold leading-[1.3] text-tp-slate-800
       max-w-[200px] truncate
     - Date (optional): 10px font-normal text-tp-slate-400
       mt-[1px] leading-[1.3] truncate

  3. Copy All icon (optional)
     - DocumentCopy 14px
     - opacity-0 on rest, visible on header hover (for Bulk variant tooltip)
     - OR wrapped in ActionableTooltip

  4. Spacer (flex-1)

  5. Badge (optional)
     - rounded-[4px] px-[6px] py-[3px]
     - 10px font-semibold leading-[1.2]
     - custom bg and color props

  6. Collapse toggle
     - 22x22px, rounded-[6px], bg-tp-slate-50
     - ArrowDown2/ArrowUp2 12px, variant "Linear"
     - hover: bg-tp-slate-100
     - Always present unless collapsible=false
\`\`\`

### Content Area (Body)

\`\`\`
Shown when not collapsed.
Padding: px-3 py-[10px]
Contains: card-specific children
\`\`\`

### Actions Row

\`\`\`
Shown when not collapsed and actions prop provided.
Layout: overflow-x-auto px-3 pt-[2px] pb-[10px]
Inner: flex gap-1 whitespace-nowrap
Contains: ChatPillButton, CopyButton, ExternalButton
\`\`\`

### Footer (Sidebar Link)

\`\`\`
Shown when not collapsed and sidebarLink prop provided.
Padding: px-3 py-[10px]
Border top: 0.5px solid var(--tp-slate-50)
Background: linear-gradient(180deg, #FFFFFF 0%, rgba(59,130,246,0.04) 100%)
Contains: navigation link to sidebar tab
\`\`\`

### CardShell Props Interface

\`\`\`typescript
interface CardShellProps {
  icon: React.ReactNode
  iconBg?: string               // Deprecated: always uses TP blue-50
  title: string
  date?: string
  tpIconName?: string           // If set, renders TPMedicalIcon in the icon slot
  badge?: { label: string; color: string; bg: string }
  copyAll?: () => void
  copyAllTooltip?: string
  collapsible?: boolean         // default: true
  defaultCollapsed?: boolean    // default: false
  actions?: React.ReactNode
  sidebarLink?: React.ReactNode
  children: React.ReactNode
}
\`\`\`

---

## Content Primitives

### DataRow

Displays a label-value pair with optional flag, unit, reference range, and copy action.

\`\`\`
Layout: flex items-center py-[3px]
Border bottom: 0.5px solid var(--tp-slate-50) (except last row when isLast=true)
Hover group: group/row

Left side (flex-1):
  - Label: 12px font-medium text-tp-slate-800
  - Unit: 10px text-tp-slate-400 in parentheses, ml-1
  - Ref range: 9px text-tp-slate-300, ml-1

Right side:
  - Value: 12px font-medium, right-aligned, min-w-[40px]
  - Flag colors:
    - high -> text-tp-error-600 with "up arrow" prefix
    - low  -> text-tp-error-600 with "down arrow" prefix
    - normal -> text-tp-slate-800

Copy icon (optional):
  - DocumentCopy 14px, ml-1
  - opacity-0 -> opacity-100 on row hover (group-hover/row)
\`\`\`

\`\`\`typescript
interface DataRowProps {
  label: string
  unit?: string
  value: string
  flag?: "high" | "low"
  refRange?: string
  isLast?: boolean
  onCopy?: () => void
  copyTooltip?: string
}
\`\`\`

### CheckboxRow

Interactive row with a custom checkbox, label, and optional rationale text.

\`\`\`
Layout: label element, flex cursor-pointer items-center gap-[8px] py-[6px]
Border bottom: 0.5px solid var(--tp-slate-50) (except last)

Checkbox:
  - 18x18px, rounded-[4px], border-[1.5px]
  - Unchecked: border #CBD5E1, bg transparent
  - Checked: border = accentColor, bg = accentColor
  - Checkmark: white SVG 10px (path: M3.5 8.5L6.5 11.5L12.5 4.5)

Label: 12px font-medium text-tp-slate-800

Rationale (optional):
  - 10px text-tp-slate-400
  - ml-auto (right-aligned)
\`\`\`

\`\`\`typescript
interface CheckboxRowProps {
  label: string
  rationale?: string
  checked?: boolean
  accentColor?: string       // default: var(--tp-blue-500)
  onChange?: (checked: boolean) => void
  isLast?: boolean
}
\`\`\`

### RadioRow

Interactive row with a native radio input, label, and optional detail text.

\`\`\`
Layout: label element, flex cursor-pointer items-center gap-[5px] py-[3px]
Border bottom: 0.5px solid var(--tp-slate-50) (except last)

Radio input:
  - 14x14px, flex-shrink-0
  - accentColor: var(--tp-blue-500)

Label: 12px font-medium text-tp-slate-800

Detail (optional):
  - 10px text-tp-slate-400
  - ml-auto (right-aligned)
\`\`\`

\`\`\`typescript
interface RadioRowProps {
  name: string
  label: string
  detail?: string
  checked?: boolean
  onChange?: () => void
  isLast?: boolean
}
\`\`\`

### SectionTag

Inline chip/pill for categorizing card content sections.

\`\`\`
Layout: inline-flex cursor-pointer items-center gap-1
  rounded-[4px] px-1.5 py-[0.5px]
  11px font-medium whitespace-nowrap

Variants:
  - default: bg-tp-slate-100 text-tp-slate-500
    Hover: bg-tp-slate-200 text-tp-slate-700
  - specialty: bg-tp-violet-50 text-tp-violet-600
    (no hover color change)

Icon (optional):
  - If emoji: 10px span
  - If icon name: TPMedicalIcon 11px
    - opacity-60 at rest, opacity-100 on hover
    - Color matches variant (tp-slate-500 or tp-violet-600)

Copy icon (optional):
  - 10px, appears only on hover
  - ml-0.5
\`\`\`

\`\`\`typescript
interface SectionTagProps {
  label: string
  icon?: string              // TPMedicalIcon name or emoji
  onClick?: () => void
  onCopy?: () => void
  variant?: "default" | "specialty"
  tooltip?: string
  copyTooltip?: string
}
\`\`\`

### InsightBox

Colored callout box used to highlight clinical insights within cards.

\`\`\`
Layout: mt-1 rounded-[6px] px-2 py-[5px]
Typography: 12px leading-[1.5]
Prefix: "Insight:" in bold (strong element, mr-1)

Variants:
  - red:    bg-tp-error-50   text-tp-error-700
  - amber:  bg-tp-warning-50 text-tp-warning-700
  - purple: bg-tp-violet-50  text-tp-violet-700
  - teal:   bg-[#E8F6F6]     text-[#0E7E7E]
\`\`\`

\`\`\`typescript
type InsightVariant = "red" | "amber" | "purple" | "teal"

interface InsightBoxProps {
  children: React.ReactNode
  variant: InsightVariant
}
\`\`\`

---

## Action Buttons

### ChatPillButton

AI-branded pill for follow-up suggestions and conversational actions.

\`\`\`
Height: 26px
Shape: rounded-full
Padding: px-[14px]
Typography: 11px font-normal whitespace-nowrap

Background:
  - Rest:  AI_PILL_BG
  - Hover: AI_PILL_BG_HOVER
Border: AI_PILL_BORDER (1px solid rgba(103,58,172,0.15))

Text:
  - background: AI_PILL_TEXT_GRADIENT
  - WebkitBackgroundClip: "text"
  - WebkitTextFillColor: "transparent"
  - fontWeight: 400
\`\`\`

### CopyButton

Blue-outlined pill for copying data to the RxPad.

\`\`\`
Height: 26px
Shape: rounded-full
Padding: px-2.5
Typography: 11px font-medium text-tp-blue-500

Border: 1.5px solid tp-blue-500
Background:
  - Rest:  bg-tp-blue-50
  - Hover: bg-tp-blue-100
\`\`\`

### ExternalButton

Blue-outlined pill for navigating outside the card context.

\`\`\`
Height: 26px
Shape: rounded-full
Padding: px-2.5
Typography: 11px font-medium text-tp-blue-500

Border: 1.5px solid tp-blue-500
Background:
  - Rest:  bg-transparent
  - Hover: bg-tp-blue-50
\`\`\`

---

## Card Types Registry

### A. Summary Cards (A1-A7)

| Kind | Component | Key Data Fields | Icon |
|------|-----------|-----------------|------|
| patient_summary | GPSummaryCard | specialtyTags, todayVitals, keyLabs[], chronicConditions, allergies, activeMeds, familyHistory, lifestyleNotes, patientNarrative, followUpOverdueDays, dueAlerts, recordAlerts, concernTrend, symptomCollectorData, gynecData, ophthalData, obstetricData, pediatricsData | stethoscope |
| obstetric_summary | ObstetricExpandedCard | gravida, para, living, abortion, ectopic, lmp, edd, gestationalWeeks, presentation, fetalMovement, oedema, fundusHeight, amnioticFluid, ancDue[], vaccineStatus[], alerts[], bpLatest | baby |
| gynec_summary | GynecSummaryCard | menarche, cycleLength, cycleRegularity, flowDuration, flowIntensity, padsPerDay, painScore, lmp, lastPapSmear, alerts[] | female |
| pediatric_summary | PediatricSummaryCard | ageDisplay, heightCm, heightPercentile, weightKg, weightPercentile, ofcCm, bmiPercentile, vaccinesPending, vaccinesOverdue, overdueVaccineNames[], milestoneNotes[], feedingNotes[], alerts[] | baby |
| ophthal_summary | OphthalSummaryCard | vaRight, vaLeft, nearVaRight, nearVaLeft, iop, slitLamp, fundus, lastExamDate, glassPrescription, alerts[] | eye |
| symptom_collector | PatientReportedCard | reportedAt, symptoms[], medicalHistory[], familyHistory[], allergies[], lifestyle[], questionsToDoctor[], currentMedications[], lastVisitSummary, suggestedMeds[], isNewPatient | thermometer |
| last_visit | LastVisitCard | visitDate, sections[] (tag, icon, items[], notes), copyAllPayload | medical-record |

### B. Data Cards (B1-B6)

| Kind | Component | Key Data Fields | Icon |
|------|-----------|-----------------|------|
| lab_panel | LabPanelCard | panelDate, flagged[] (name, value, unit, flag, refRange), hiddenNormalCount, insight | Lab |
| vitals_trend_bar | VitalTrendsBarCard | title, series[] (label, values, dates, tone, threshold, unit) | Heart Rate |
| vitals_trend_line | VitalTrendsLineCard | title, series[] | Heart Rate Monitor |
| lab_trend | LabTrendsCard | title, series[], parameterName | Lab |
| lab_comparison | LabComparisonCard | rows[] (parameter, prevValue, currValue, delta, direction, isFlagged), insight | Lab |
| med_history | MedHistoryCard | entries[] (drug, dosage, date, diagnosis, source), insight | pill |

### C. Action Cards (C1-C7)

| Kind | Component | Key Data Fields | Icon |
|------|-----------|-----------------|------|
| ddx | DDXCard | context, options[] (name, bucket: cant_miss/most_likely/consider, selected) | Diagnosis |
| protocol_meds | ProtocolMedsCard | diagnosis, meds[] (name, dosage, timing, duration, notes), safetyCheck, copyPayload | pill |
| investigation_bundle | InvestigationCard | title, items[] (name, rationale, selected), copyPayload | Lab |
| follow_up | FollowUpCard | context, options[] (label, days, recommended, reason) | medical-record |
| advice_bundle | AdviceCard | title, items[], shareMessage, copyPayload | clipboard-activity |
| voice_structured_rx | VoiceStructuredRxCard | voiceText, sections[] (sectionId, title, tpIconName, items[]), copyAllPayload | microphone |
| rx_preview | RxPreviewCard | patientName, date, diagnoses[], medications[], investigations[], advice[], followUp | clipboard-activity |

### D. Analysis Cards (D1-D2)

| Kind | Component | Key Data Fields | Icon |
|------|-----------|-----------------|------|
| ocr_pathology | OCRPathologyCard | title, category, parameters[] (name, value, refRange, flag, confidence), normalCount, insight | test-tube |
| ocr_extraction | OCRFullExtractionCard | title, category, sections[] (heading, icon, items[], copyDestination), insight | document |

### E. Utility & Safety Cards (E1-E5 + CDSS)

| Kind | Component | Key Data Fields | Icon |
|------|-----------|-----------------|------|
| translation | TranslationCard | sourceLanguage, targetLanguage, sourceText, translatedText, copyPayload | -- |
| completeness | CompletenessCard | sections[] (name, filled, count), emptyCount | -- |
| drug_interaction | DrugInteractionCard | drug1, drug2, severity, risk, action | -- |
| allergy_conflict | AllergyConflictCard | drug, allergen, alternative | -- |
| follow_up_question | FollowUpQuestionCard | question, options[], multiSelect | -- |
| referral | ReferralCard | title, totalCount, urgentCount, items[] (patientName, specialist, department, urgency, reason) | -- |
| clinical_guideline | ClinicalGuidelinesCard | title, condition, source, recommendations[], evidenceLevel | -- |
| vaccination_schedule | VaccinationScheduleCard | title, overdueCount, dueCount, givenCount, vaccines[] | injection |
| patient_timeline | PatientTimelineCard | title, events[] (date, type, summary) | -- |

### F. Text-Only Variants (T1-T5)

| Kind | Component | Key Data Fields |
|------|-----------|-----------------|
| text_fact | inline | value, context, source |
| text_alert | inline | message, severity (critical/high/moderate/low) |
| text_list | inline | items[] |
| text_step | inline | steps[] (numbered, blue left-border accent) |
| text_quote | inline | quote, source (violet left-border, italic) |
| text_comparison | inline | labelA, labelB, itemsA[], itemsB[] (side-by-side grid) |

### G. Homepage Operational Cards (H1-H12)

| Kind | Component | Key Data Fields |
|------|-----------|-----------------|
| welcome_card | WelcomeCard | greeting, date, stats[], quickActions[], contextLine, tips[] |
| patient_list | PatientListCard | title, items[] (name, age, gender, time, status, statusTone), totalCount |
| follow_up_list | FollowUpListCard | title, items[] (name, scheduledDate, reason, isOverdue), overdueCount |
| revenue_bar | RevenueBarCard | title, totalRevenue, totalPaid, totalDue, days[] |
| bulk_action | BulkActionCard | action, messagePreview, recipients[], totalCount |
| donut_chart | DonutChartCard | title, segments[] (label, value, color), total, centerLabel |
| pie_chart | PieChartCard | title, segments[], total, centerLabel |
| line_graph | LineGraphCard | title, points[] (label, value), average, changePercent, changeDirection |
| analytics_table | AnalyticsTableCard | title, kpis[] (metric, thisWeek, lastWeek, delta, direction, isGood), insight |
| condition_bar | ConditionBarCard | title, items[] (condition, count, color), note |
| heatmap | HeatmapCard | title, rows[], cols[], cells[][] (value, intensity) |
| billing_summary | BillingSummaryCard | items[] (service, amount, status), totalAmount, totalPaid, balance |
| vaccination_due_list | VaccinationDueListCard | title, overdueCount, dueCount, items[] |
| anc_schedule_list | ANCScheduleListCard | title, overdueCount, dueCount, items[] |

---

## Chat Shell Components

### DrAgentFab (Collapsed State)

The floating action button that opens the Dr. Agent panel when clicked.

\`\`\`
Position: fixed, right edge (right: -1), bottom: 32px
Dimensions: 52w x 192h px
Z-index: 40

Shape: Organic curved glass form
  - Custom SVG clip path
  - Gradient fill: #C860E3 -> #6B3BAF -> #1C1A6E (vertical, opacity 0.60)
  - Glass overlay: blur(20px) saturate(1.5)
  - Glass sheen: white overlays at varying opacity (0.30 top -> 0.04 mid -> 0.18 bottom)
  - Inner shadow: inset 1px 0 0 rgba(255,255,255,0.22)
  - Drop shadow: -2px 1px 4px rgba(30,27,100,0.10)

Hover behavior:
  - Shape: origin-right scaleX(1.12) at rest, scaleX(1.08) on hover (via group-hover)
  - Tooltip appears left of tag: "Open Dr. Agent"
    bg-tp-slate-800, text white, 10px font-medium, rounded-[6px], px-8 py-4
    with right-pointing arrow border

Content (centered vertically, 36px wide):
  - AiBrandSparkIcon (white): 22px
    shimmer animation: sparkShimmer 4s ease-in-out infinite
    (scales 1 -> 1.12, opacity 0.85 -> 1, rotates 0 -> 15deg at midpoint)
  - Vertical text "Dr. Agent": 12px bold, white
    writing-mode: vertical-rl
    tracking: 0.5px
    text-shadow: 0 1px 3px rgba(0,0,0,0.25)
\`\`\`

### AgentHeader (Panel Header)

Top bar of the expanded Dr. Agent panel.

\`\`\`
Height: 52px
Z-index: 20 (relative)

Background:
  linear-gradient(135deg,
    rgba(213,101,234,0.22) 0%,
    rgba(103,58,172,0.18) 40%,
    rgba(26,25,148,0.22) 100%)
Blur: backdrop-filter: blur(12px)
Shadow:
  0 1px 3px rgba(103,58,172,0.06),
  0 2px 8px rgba(26,25,148,0.04)

Contains NoiseOverlay (opacity 0.04) for subtle grain texture.

Layout: flex items-center justify-between px-[14px]

Left side (flex items-center gap-[6px]):
  1. AiGradientBg (28px, borderRadius 8)
     -> AiBrandSparkIcon (16px)
  2. "Dr. Agent" text: 16px font-semibold
     AI gradient fill (WebkitBackgroundClip: text)
  3. Specialty Dropdown button
     - Trigger: rounded-full px-[7px] py-[2px]
       10px text-tp-slate-500, bg-tp-slate-50
       Hover: bg-tp-slate-100 text-tp-slate-700
       Shows activeLabel + chevron 8px (rotates 180deg when open)
     - Panel: absolute, min-w-[110px], rounded-[8px]
       border border-tp-slate-200/60
       bg-white, shadow-[0_4px_16px_rgba(0,0,0,0.08)]
       Items: 11px, px-[10px] py-[5px]
       Active: font-medium bg-tp-slate-50 + checkmark
       Demo notice: 8px italic text-tp-slate-400

Right side:
  - Close button: SidebarRight 18px variant "Linear"
    text-tp-slate-400, hover: text-tp-slate-600
\`\`\`

### PatientSelector (Dropdown)

Context picker for switching between patients.

\`\`\`
Trigger (default, not using renderTrigger):
  - flex items-center gap-[6px] rounded-[8px] px-[4px] py-[4px]
  - Patient name: 12px font-semibold text-tp-slate-800
  - Today dot: 6x6 rounded-full bg-tp-success-500
  - Meta: 10px text-tp-slate-400
  - Chevron: 12px, rotates 180deg when open
  - Hover: bg-tp-slate-50

Dropdown:
  - Position: absolute, centered (left-50% -translate-x-1/2), top-full mt-[4px]
  - Width: 280px, rounded-[12px]
  - bg: rgba(255,255,255,0.92), backdrop-blur 16px
  - border: 1px solid rgba(255,255,255,0.40)
  - shadow-xl

  Universal option (optional):
    - Clinic Overview with Hospital icon (14px Bulk, tp-violet-500)
    - 26x26 icon bg rounded-full bg-tp-violet-50
    - "or" divider: 9px font-medium text-tp-slate-300, centered

  Search input:
    - Wrapper: px-[10px] py-[6px]
    - Input container: rounded-[8px] bg-tp-slate-50 px-[8px] py-[5px]
    - Search icon: 13px tp-slate-400
    - Text: 12px tp-slate-700
    - Placeholder: text-tp-slate-400

  Patient rows:
    - px-[12px] py-[7px]
    - Icon: 26x26 rounded-full bg-tp-slate-100, User 14px Bulk tp-slate-500
    - Name: 13px font-semibold tp-slate-800
    - Gender/age tag: 11px font-normal tp-slate-400 in parens
    - Meta: 11px tp-slate-400
    - Selected: border-l-[2px] border-l-tp-blue-600 bg-tp-blue-50
    - Hover: bg-tp-slate-50
    - Today badge: rounded-[4px] bg-tp-success-50 px-[6px] py-[1px] 10px font-medium tp-success-600
    - Max scroll height: 240px
\`\`\`

### Chat Bubbles

\`\`\`
USER bubble:
  - Outer: flex justify-end, group/msg
  - Container: max-w-[85%], flex-col items-end gap-[2px]
  - Attachment (optional): max-w-[220px], DocumentAttachmentBubble above text
  - Text bubble: rounded-[12px] rounded-br-[0px]
    bg-tp-slate-100, px-3 py-2
    12px leading-[18px] text-tp-slate-700
    whitespace-pre-wrap
  - Hover actions: opacity-0 -> group-hover/msg:opacity-100
    DocumentCopy 14px + Edit2 14px
    h-[16px] w-[16px] text-tp-slate-300, hover text-tp-slate-500

ASSISTANT bubble:
  - Outer: flex justify-start, group/msg, w-full
  - Container: flex-col items-start, w-full

  Text row (flex items-start gap-[6px]):
    - AiGradientBg (20px, borderRadius 6, mt-0.5)
      -> AiBrandSparkIcon (13px)
    - Text: 12px leading-[18px] text-tp-slate-700
      whitespace-pre-wrap break-words
      Supports **bold** markdown -> <strong> font-semibold text-tp-slate-900

  Card output (when rxOutput present):
    - ml-[26px] mt-[6px] w-[calc(100%-26px)]
    - Rendered via CardRenderer

  Feedback row:
    - ml-[26px] mt-[2px]
    - Thumbs up / thumbs down icons
\`\`\`

### TypingIndicator

\`\`\`
Layout: flex items-center gap-[8px]

Left: AiGradientBg (24px, borderRadius 8)
  -> AiBrandSparkIcon (15px)

Right: 3 bouncing dots
  - Each: 5x5px rounded-full bg-tp-slate-400
  - Animation: typingBounce 1.2s ease-in-out infinite
  - Stagger: 0s, 0.15s, 0.30s delay
  - Keyframes:
    0%, 60%, 100%: translateY(0), opacity 0.4
    30%: translateY(-4px), opacity 1
\`\`\`

### ChatInput

\`\`\`
Container: sticky bottom-0, bg-white, px-[10px] pt-[8px] pb-[4px]

--- NORMAL MODE ---

Input wrapper (.chat-input-border):
  - rounded-[12px] px-[10px] py-[8px]
  - Border: 1.6px solid var(--tp-slate-200)
  - Hover border: var(--tp-slate-300)
  - Focus-within: border var(--tp-blue-500), box-shadow 0 0 0 2px rgba(59,130,246,0.10)

Children (flex items-center gap-[8px]):
  1. Attach button: Plus icon 18px (lucide), strokeWidth 1.5
     text-tp-slate-600, hover text-tp-slate-800

  2. Textarea:
     - 12px leading-[1.5] text-tp-slate-800
     - placeholder text-tp-slate-300
     - resize-none, auto-expand
     - minHeight: 20px, maxHeight: 120px (~5 lines)
     - rows=1

  3. Voice/Send toggle (inside the box):
     - Has text -> AiSendIcon (24px, AI gradient fill, circular bg)
     - No text  -> AiVoiceIcon (24px, AI gradient fill, circular bg)

Trust indicator (below input):
  - mt-[4px] mb-[14px], flex items-center justify-center gap-[4px]
  - SecuritySafe 14px Bulk text-tp-slate-300
  - "AI-assisted insights -- always verify with clinical judgement"
    10px leading-[1.3] text-tp-slate-300

--- RECORDING MODE ---

Recording bar (flex items-center gap-[6px]):
  - Bar: h-[36px] flex-1 rounded-[10px] border px-[12px]
    Not paused: border-purple-300/60, bg gradient purple-50/40 to blue-50/40
    Paused: border-tp-slate-300, bg-tp-slate-50

  Contents:
    - Pulse dot: 6x6 rounded-full
      Active: bg-red-500 animate-pulse
      Paused: bg-tp-slate-400
    - Wave animation (active) or "Paused" text (paused)
      Wave: 8 bars, w-[2.5px] rounded-full, AI_GRADIENT fill
      Animation: wave-bar 1s ease-in-out infinite alternate, 0.1s stagger
      Keyframes: 4px -> 16px -> 6px height, 0.4 -> 1 -> 0.5 opacity
    - Spacer (flex-1)
    - Timer: 11px font-medium tabular-nums text-tp-slate-500 (MM:SS)
    - Pause/Resume: 24x24 rounded-full, PauseIcon or ResumeIcon 14px

  Action buttons (outside bar):
    - Submit: 28x28 rounded-full, CheckIcon 14px, text-tp-success-600
    - Discard: 28x28 rounded-full, CrossIcon 12px, text-tp-slate-400
\`\`\`

### PillBar (Suggestion Pills)

\`\`\`
Layout: flex items-center gap-[6px] overflow-x-auto px-[8px]
  scrollbar-hide (scrollbarWidth: "none")

Each pill:
  - h-[26px] shrink-0 rounded-full px-[14px]
  - 11px font-normal whitespace-nowrap
  - Background: AI_PILL_BG (hover: AI_PILL_BG_HOVER when not disabled)
  - Border: AI_PILL_BORDER
  - Text: AI gradient fill (WebkitBackgroundClip text, fontWeight 400)
  - Disabled: opacity-50
  - Force pills: animate-pulse when not disabled
  - Cooldown: 3000ms default, tracks per pill.id
  - Pills sorted by priority (lower = higher priority)
\`\`\`

### DocumentBottomSheet

\`\`\`
Position: absolute inset-0 z-50, flex-col justify-end

Backdrop:
  - absolute inset-0
  - bg-black/30, backdrop-blur-[2px]
  - animate-in fade-in duration-200
  - onClick -> close

Sheet:
  - relative z-10, flex-col
  - rounded-t-[16px] bg-white
  - max-h-[75%] (scrollable content)
  - shadow-[0_-8px_32px_rgba(0,0,0,0.12)]
  - animate-in slide-in-from-bottom-4 duration-300

  Drag handle: h-[4px] w-[36px] rounded-full bg-tp-slate-200, centered

  Header: flex items-center justify-between
    - "Patient Documents" 13px font-semibold text-tp-slate-800
    - Count badge: rounded-full bg-tp-slate-100 px-[7px] py-[1px] 10px font-medium text-tp-slate-500
    - Close X: 22x22 rounded-full, 12px cross icon

  Selection hint:
    - 10px text-tp-slate-400
    - Clear all / Max N warning

  Document rows (scrollable):
    - Each: flex items-center gap-[10px] rounded-[10px] px-[10px] py-[8px]
    - Selected: bg-tp-violet-50/60 ring-1 ring-tp-violet-200/60
    - Hover: bg-tp-slate-50

    Contents:
      - Checkbox: 18x18px rounded-[5px] border
        Unchecked: border-tp-slate-300 bg-white
        Checked: AI_GRADIENT bg, white checkmark 11px
      - Type icon: 32x32 rounded-[8px], colored bg per docType
        TPMedicalIcon 16px in matching color
      - File info: fileName 11px font-medium tp-slate-700 (truncate)
        Meta: 9px tp-slate-400 (type + date + uploadedBy)
      - File size: 9px tp-slate-300

  Upload new document:
    - 28x28 rounded-[7px] border-dashed border-tp-slate-300 bg-tp-slate-50
    - Plus 14px tp-slate-400
    - "Upload new document" 11px font-medium tp-slate-500

  Send button:
    - w-full rounded-[10px] px-4 py-[9px] 12px font-semibold text-white
    - Disabled (0 selected): bg-tp-slate-200 text-tp-slate-400
    - Active: AI_GRADIENT bg, shadow-sm, hover shadow-md, active scale-[0.98]
    - Icon: send arrow 14px

  Document type configuration:
    | Type              | Icon            | Color   | BG                      |
    |-------------------|-----------------|---------|-------------------------|
    | pathology         | test-tube       | #1B8C54 | rgba(27,140,84,0.08)    |
    | radiology         | x-ray           | #3B6FE0 | rgba(59,111,224,0.08)   |
    | prescription      | clipboard-act.  | #C6850C | rgba(198,133,12,0.08)   |
    | discharge_summary | file-text       | #7C3AED | rgba(124,58,237,0.08)   |
    | vaccination       | injection       | #0891B2 | rgba(8,145,178,0.08)    |
    | other             | document        | #64748B | rgba(100,116,139,0.08)  |
\`\`\`

### AiGradientBg (Utility Component)

Reusable animated gradient background wrapper for AI spark icons.

\`\`\`
Props:
  - size: number (default 20)
  - borderRadius: number (default 6)
  - children: React.ReactNode

Styles:
  - width/height: size prop
  - borderRadius: borderRadius prop
  - display: flex, alignItems/justifyContent: center
  - flexShrink: 0
  - background: AI_GRADIENT_SOFT_ANIMATED
  - backgroundSize: 200% 200%
  - animation: aiGradientFlow 6s ease-in-out infinite

@keyframes aiGradientFlow:
  0%:   background-position 0% 50%
  50%:  background-position 100% 50%
  100%: background-position 0% 50%
\`\`\`

---

## Animations & Keyframes

### aiGradientFlow (AiGradientBg)

\`\`\`css
@keyframes aiGradientFlow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
/* Duration: 6s ease-in-out infinite */
\`\`\`

### typingBounce (TypingIndicator)

\`\`\`css
@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
/* Duration: 1.2s ease-in-out infinite */
/* Stagger: 0s, 0.15s, 0.30s per dot */
\`\`\`

### sparkShimmer (DrAgentFab spark icon)

\`\`\`css
@keyframes sparkShimmer {
  0%, 100% { opacity: 0.85; transform: scale(1) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.12) rotate(15deg); }
}
/* Duration: 4s ease-in-out infinite */
\`\`\`

### wave-bar (Recording mode)

\`\`\`css
@keyframes wave-bar {
  0%   { height: 4px; opacity: 0.4; }
  50%  { height: 16px; opacity: 1; }
  100% { height: 6px; opacity: 0.5; }
}
/* Duration: 1s ease-in-out infinite alternate */
/* Stagger: 0.1s per bar (8 bars) */
\`\`\`

---

## Rules for Creating New Cards

### Required Structure

1. Every card MUST use \`CardShell\` as its wrapper
2. Header icon: 26x26px container, rounded-[8px], bg tp-blue-50
3. Icon inside: \`TPMedicalIcon\` 15px in tp-blue-500 color (pass via \`tpIconName\` prop)
4. Title: 12px font-semibold, max 200px with truncate
5. Collapse toggle: always present unless explicitly disabled via \`collapsible={false}\`
6. Use the \`defaultCollapsed\` prop to control initial state

### Content Rules

1. Use 12px as base font size for ALL content inside cards
2. Text color: tp-slate-700 for body, tp-slate-800 for labels/headings
3. Row separators: 0.5px solid tp-slate-50 (NOT full borders)
4. Compose from existing primitives: DataRow, CheckboxRow, RadioRow, SectionTag, InsightBox
5. For custom layouts: maintain 12px text, tp-slate-700 color, existing spacing tokens
6. Never use \`text-sm\`, \`text-base\`, etc. -- always use explicit px values like \`text-[12px]\`

### Action Rules

1. \`ChatPillButton\`: for AI-driven follow-up suggestions (triggers a canned message)
2. \`CopyButton\`: for copying structured data to RxPad (blue, 11px, rounded-full)
3. \`ExternalButton\`: for navigation outside the card (transparent bg, blue border)
4. Pass actions via the \`actions\` prop on CardShell for proper positioning
5. For sidebar navigation links, use the \`sidebarLink\` prop on CardShell

### Color Rules

- **Flags:** tp-error-600 for BOTH high and low values (distinguished by arrow prefix)
- **Severity levels:**
  - critical = tp-error (bg-tp-error-50, text-tp-error-700)
  - high = tp-warning (bg-tp-warning-50, text-tp-warning-700)
  - moderate = yellow variants
  - low = tp-slate variants
- **Specialty colors:**
  - GP = blue (tp-blue-500 accent)
  - Gynec = pink (#EC4899 accent, #FDF2F8 bg)
  - Ophthal = teal (#14B8A6 accent, #F0FDFA bg)
  - Obstetric = violet (tp-violet-500 accent, tp-violet-50 bg)
  - Pediatrics = light blue (tp-blue-400 accent, tp-blue-50 bg)

### Type System Rules

1. Every new card type MUST be added to the \`RxAgentOutput\` discriminated union in \`types.ts\`
2. Use a descriptive \`kind\` string in snake_case
3. Define a typed \`data\` interface for the card's props
4. Add the case to \`CardRenderer.tsx\` switch statement
5. Maintain the exhaustive check at the bottom of the switch

### Do's

- DO use \`cn()\` utility from \`@/lib/utils\` for className merging
- DO use CSS custom properties (\`var(--tp-*)\`) with fallback values
- DO use \`TPMedicalIcon\` from \`@/components/tp-ui\` for medical icons
- DO support \`onPillTap\`, \`onCopy\`, \`onSidebarNav\` callbacks where appropriate
- DO use \`DocumentCopy\` from iconsax-reactjs for copy icons
- DO use the gradient border pattern from CardShell (backgroundImage trick)
- DO maintain consistent py-[3px] for data rows and py-[6px] for checkbox rows

### Don'ts

- NO custom border styles (use the gradient border pattern from CardShell)
- NO font sizes > 14px inside card content area
- NO shadows within cards (only CardShell's gradient border and footer gradient)
- NO padding overrides -- use CardShell's built-in px-3 py-[10px]
- NO hardcoded colors -- use token variables (tp-slate-*, tp-blue-*, etc.)
- NO responsive font sizing -- all fixed px values
- NO \`text-sm\`, \`text-base\`, \`text-lg\` -- only explicit pixel sizes
- NO inline SVG for common icons -- use TPMedicalIcon or iconsax components

---

## Type Definitions Reference

### Core Enums

\`\`\`typescript
type ConsultPhase =
  | "empty"
  | "symptoms_entered"
  | "dx_accepted"
  | "meds_written"
  | "near_complete"

type SpecialtyTabId = "gp" | "gynec" | "ophthal" | "obstetric" | "pediatrics"

type RxTabLens =
  | "dr-agent" | "past-visits" | "vitals" | "history"
  | "lab-results" | "obstetric" | "medical-records"

type PillTone = "primary" | "info" | "warning" | "danger"

type IntentCategory =
  | "data_retrieval" | "clinical_decision" | "action"
  | "comparison" | "document_analysis" | "clinical_question"
  | "operational" | "ambiguous" | "follow_up"

type ResponseFormat = "text" | "hybrid" | "card"
type FlagDirection = "high" | "low"
type SeverityLevel = "critical" | "high" | "moderate" | "low"
type InsightVariant = "red" | "amber" | "purple" | "teal"
type BadgeTone = "warning" | "success" | "info" | "danger"
type PatientDocType = "pathology" | "radiology" | "prescription" | "discharge_summary" | "vaccination" | "other"
\`\`\`

### Specialty Configuration

\`\`\`typescript
interface SpecialtyVisualConfig {
  id: SpecialtyTabId
  label: string
  headerBg: string
  accentColor: string
  lightBg: string
  iconName: string
}

const SPECIALTY_TABS: SpecialtyVisualConfig[] = [
  { id: "gp",         label: "GP",        headerBg: "var(--tp-slate-50)", accentColor: "var(--tp-blue-500)",   lightBg: "var(--tp-blue-50)",   iconName: "stethoscope" },
  { id: "gynec",      label: "Gynec",     headerBg: "#FDF2F8",           accentColor: "#EC4899",              lightBg: "#FDF2F8",             iconName: "female" },
  { id: "ophthal",    label: "Ophthal",   headerBg: "#F0FDFA",           accentColor: "#14B8A6",              lightBg: "#F0FDFA",             iconName: "eye" },
  { id: "obstetric",  label: "Obstetric", headerBg: "var(--tp-violet-50)", accentColor: "var(--tp-violet-500)", lightBg: "var(--tp-violet-50)", iconName: "baby" },
  { id: "pediatrics", label: "Pedia",     headerBg: "var(--tp-blue-50)", accentColor: "var(--tp-blue-400)",   lightBg: "var(--tp-blue-50)",   iconName: "baby" },
]
\`\`\`

### Vital Metadata

\`\`\`typescript
interface VitalMeta {
  key: string
  label: string
  unit: string
  priority: number
  isAbnormal: (val: number) => boolean
  isCritical: (val: number) => boolean
}

/* Vitals in priority order:
   1. BP (mmHg)        - abnormal >= 140 or <= 90,  critical >= 180 or <= 70
   2. SpO2 (%)         - abnormal < 95,             critical < 90
   3. Pulse (bpm)      - abnormal > 100 or < 50,    critical > 130 or < 40
   4. Temp (F)         - abnormal >= 100.4,          critical >= 103
   5. RR (/min)        - abnormal > 20 or < 12,     critical > 30 or < 8
   6. Weight (kg)      - never flagged
   7. Height (cm)      - never flagged
   8. BMI              - abnormal > 30 or < 18.5,    critical > 40 or < 16
  11. Blood Sugar (mg/dL) - abnormal > 140,          critical > 300
*/
\`\`\`

### Section Tag Configuration

\`\`\`typescript
/* Available section tags with sidebar navigation and copy destinations */
const SECTION_TAGS = {
  vitals:        { label: "Today's Vitals",    icon: "Heart Rate",         sidebarTab: "vitals",       copyDestination: "vitals" },
  labs:          { label: "Key Labs",           icon: "Lab",                sidebarTab: "labResults",   copyDestination: "labResults" },
  history:       { label: "Medical History",    icon: "clipboard-activity", sidebarTab: "history",      copyDestination: "history" },
  lastVisit:     { label: "Last Visit",         icon: "medical-record",     sidebarTab: "pastVisits",   copyDestination: "rxpad" },
  symptoms:      { label: "Symptom Reports",    icon: "thermometer",        copyDestination: "rxpad" },
  examination:   { label: "Examination",        icon: "stethoscope",        copyDestination: "rxpad" },
  diagnosis:     { label: "Diagnosis",          icon: "Diagnosis",          copyDestination: "rxpad" },
  medication:    { label: "Medication",         icon: "pill",               sidebarTab: "pastVisits",   copyDestination: "rxpad" },
  investigation: { label: "Lab Investigations", icon: "Lab",                copyDestination: "rxpad" },
  advice:        { label: "Advice",             icon: "clipboard-activity", copyDestination: "rxpad" },
  followUp:      { label: "Follow-up",          icon: "medical-record",     sidebarTab: "followUp",     copyDestination: "followUp" },
  obstetric:     { label: "Obstetric",          icon: "Obstetric",          sidebarTab: "obstetric",    copyDestination: "obstetric" },
  gynec:         { label: "Gynec",              icon: "Gynec",              sidebarTab: "gynec",        copyDestination: "gynec" },
  growth:        { label: "Growth",             icon: "Heart Rate Monitor", sidebarTab: "growth",       copyDestination: "growth" },
  vaccine:       { label: "Vaccine",            icon: "injection",          sidebarTab: "vaccine",      copyDestination: "vaccine" },
}
\`\`\`

### Phase Prompts (Contextual Suggestion Pills)

\`\`\`typescript
/* Pills shown based on consultation phase */
const PHASE_PROMPTS = {
  empty:             ["Patient snapshot", "Last visit", "Abnormal labs", "Current intake"],
  symptoms_entered:  ["Generate DDX", "Last visit compare", "Vitals review", "Lab focus"],
  dx_accepted:       ["Medication plan", "Investigations", "Advice draft", "Follow-up plan"],
  meds_written:      ["Refine advice", "Translate advice", "Follow-up plan", "Completeness check"],
  near_complete:     ["Final checklist", "Translate advice", "Visit review", "Risk recap"],
}
\`\`\`

### Tab Prompts (Context-Aware Pills by Sidebar Tab)

\`\`\`typescript
const TAB_PROMPTS = {
  "dr-agent":        ["Patient snapshot", "Abnormal findings", "Last visit essentials"],
  "past-visits":     ["Last visit essentials", "Previous comparison", "Recurrence check"],
  vitals:            ["Vitals overview", "Concerning vitals", "Trend if relevant"],
  history:           ["Chronic history", "Allergy safety", "Family/lifestyle context"],
  "lab-results":     ["Flagged labs", "Latest panel focus", "Follow-up lab suggestion"],
  obstetric:         ["Obstetric highlights", "ANC due items", "Pregnancy risk checks"],
  "medical-records": ["Latest document insights", "Abnormal OCR findings", "Older record lookup"],
}
\`\`\`

### Sidebar CTA Map

\`\`\`typescript
/* Maps card kind to footer sidebar navigation text and tab */
const SIDEBAR_CTA_MAP = {
  last_visit:        { text: "See all past visits ->",      tab: "pastVisits" },
  vitals_trend_bar:  { text: "View full vitals history ->", tab: "vitals" },
  vitals_trend_line: { text: "View full vitals history ->", tab: "vitals" },
  lab_panel:         { text: "View complete lab report ->",  tab: "labResults" },
  lab_comparison:    { text: "View full lab history ->",    tab: "labResults" },
  ocr_pathology:     { text: "View in Medical Records ->",  tab: "medicalRecords" },
  ocr_extraction:    { text: "View in Medical Records ->",  tab: "medicalRecords" },
  obstetric_summary: { text: "View full obstetric record ->", tab: "obstetric" },
  gynec_summary:     { text: "View gynec history ->",       tab: "gynec" },
  pediatric_summary: { text: "View growth chart ->",        tab: "growth" },
  ophthal_summary:   { text: "View full ophthal history ->", tab: "ophthal" },
  med_history:       { text: "View full medical history ->", tab: "history" },
  patient_summary:   { text: "View full medical history ->", tab: "history" },
}
\`\`\`

### Chat Message Shape

\`\`\`typescript
interface RxAgentChatMessage {
  id: string
  role: "assistant" | "user"
  text: string
  createdAt: string                      // ISO timestamp
  rxOutput?: RxAgentOutput               // Card data (discriminated union)
  attachment?: ChatAttachment            // { type: "pdf"|"image", fileName, pageCount? }
  feedbackGiven?: "up" | "down" | null
}
\`\`\`

### Canned Pill Shape

\`\`\`typescript
interface CannedPill {
  id: string
  label: string
  priority: number        // 0-99, lower = higher priority
  layer: 1 | 2 | 3 | 4   // Safety (1) -> Context-aware (4)
  force?: boolean          // Layer 1 safety pills animate-pulse
  cooldownMs?: number      // Default 3000ms
  tone: PillTone
}
\`\`\`

---

## File Structure

\`\`\`
components/tp-rxpad/dr-agent/
  DrAgentPanel.tsx                    -- Main panel orchestrator
  constants.ts                        -- Design tokens, AI gradients, card sizing
  types.ts                            -- All TypeScript interfaces
  mock-data.ts                        -- Mock patient data for demo

  shell/
    AgentHeader.tsx                   -- Panel header with specialty dropdown
    DrAgentFab.tsx                    -- Floating action button (collapsed)
    PatientSelector.tsx               -- Patient context dropdown
    SpecialtyTabs.tsx                 -- Specialty tab switcher

  chat/
    ChatThread.tsx                    -- Message list + scroll management
    ChatBubble.tsx                    -- User/Assistant message rendering
    ChatInput.tsx                     -- Text input + voice recording
    PillBar.tsx                       -- Suggestion pill strip
    TypingIndicator.tsx               -- AI thinking dots
    AttachPanel.tsx                   -- File attachment UI
    DocumentBottomSheet.tsx           -- Document multi-select sheet
    DocumentAttachmentBubble.tsx      -- Attached file preview

  cards/
    CardShell.tsx                     -- Universal card wrapper
    CardRenderer.tsx                  -- Kind -> Component switch
    DataRow.tsx                       -- Label-value display row
    CheckboxRow.tsx                   -- Interactive checkbox row
    RadioRow.tsx                      -- Interactive radio row
    SectionTag.tsx                    -- Section chip/pill
    InsightBox.tsx                    -- Clinical insight callout
    ActionRow.tsx                     -- Action button container
    CopyIcon.tsx                      -- Copy icon button
    CopyTooltip.tsx                   -- Copy confirmation tooltip
    ActionableTooltip.tsx             -- Hover tooltip with action
    FeedbackRow.tsx                   -- Thumbs up/down feedback
    InlineDataRow.tsx                 -- Compact inline data display
    ViewToggle.tsx                    -- View mode toggler
    SidebarLink.tsx                   -- Footer navigation link

    summary/
      GPSummaryCard.tsx
      ObstetricExpandedCard.tsx
      GynecSummaryCard.tsx
      PediatricSummaryCard.tsx
      OphthalSummaryCard.tsx
      PatientReportedCard.tsx
      LastVisitCard.tsx

    data/
      LabPanelCard.tsx
      VitalTrendsBarCard.tsx
      VitalTrendsLineCard.tsx
      LabTrendsCard.tsx
      LabComparisonCard.tsx
      MedHistoryCard.tsx
      VaccinationScheduleCard.tsx
      PatientTimelineCard.tsx

    action/
      DDXCard.tsx
      ProtocolMedsCard.tsx
      InvestigationCard.tsx
      FollowUpCard.tsx
      AdviceCard.tsx
      VoiceStructuredRxCard.tsx
      RxPreviewCard.tsx

    analysis/
      OCRPathologyCard.tsx
      OCRFullExtractionCard.tsx

    utility/
      TranslationCard.tsx
      CompletenessCard.tsx
      DrugInteractionCard.tsx
      AllergyConflictCard.tsx
      FollowUpQuestionCard.tsx
      ReferralCard.tsx
      ClinicalGuidelinesCard.tsx

    homepage/
      WelcomeCard.tsx
      PatientListCard.tsx
      FollowUpListCard.tsx
      RevenueBarCard.tsx
      BulkActionCard.tsx
      DonutChartCard.tsx
      PieChartCard.tsx
      LineGraphCard.tsx
      AnalyticsTableCard.tsx
      ConditionBarCard.tsx
      HeatmapCard.tsx
      BillingSummaryCard.tsx
      VaccinationDueListCard.tsx
      ANCScheduleListCard.tsx

  shared/
    AiGradientBg.tsx                  -- Animated gradient icon background
    AiTriggerIcon.tsx                 -- AI trigger icon
    AiTriggerChip.tsx                 -- AI trigger chip

  engines/
    intent-engine.ts                  -- Intent classification
    reply-engine.ts                   -- Response generation
    pill-engine.ts                    -- Pill suggestion logic
    phase-engine.ts                   -- Consultation phase detection
    voice-rx-engine.ts                -- Voice to structured Rx
    homepage-pill-engine.ts           -- Homepage pill logic
    homepage-reply-engine.ts          -- Homepage response generation

  utils/
    downloadExcel.ts                  -- Excel export utility
\`\`\`

---

*End of Dr. Agent Design System Specification*
*Total card types: 51+ | Content primitives: 5 | Action button types: 3*
*Generated by ExportButton component*
`
}

// ---------------------------------------------------------------------------
// ExportButton — AI-branded download button
// ---------------------------------------------------------------------------

export function ExportButton() {
  const handleExport = () => {
    const markdown = generateDesignSystemMarkdown()
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "dr-agent-design-system.md"
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-[8px] rounded-[12px] px-[20px] py-[12px] text-[14px] font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
      style={{
        background:
          "linear-gradient(91deg, #D565EA 3.04%, #673AAC 66.74%, #1A1994 130.45%)",
      }}
    >
      <Download size={18} strokeWidth={2} />
      Export Complete Design System
    </button>
  )
}

# Card Catalog & Categorization

## Overview

The Doctor Agent renders **45+ card variants** organized into families. Each card has:
- A **kind** (discriminated union tag in `RxAgentOutput`)
- A **family** (logical grouping)
- A **data type** (TypeScript interface in `types.ts`)
- A **component** (React component in `cards/` subdirectory)

---

## Card Families

### A. Summary Family (7 cards)

Cards that present patient overviews and intake data. Shown at the start of a consultation or when the doctor asks for a patient snapshot.

| Kind | Component | Description | When Shown |
|------|-----------|-------------|------------|
| `patient_summary` | PatientSummaryCard | Full patient overview with vitals, labs, history, trends | Consultation start, "Patient summary" pill |
| `symptom_collector` | SymptomCollectorCard | Patient-reported symptoms from intake form | Consultation start (if intake data exists) |
| `last_visit` | LastVisitCard | Previous visit summary with copy-to-rx | "Last visit" pill, data_retrieval intent |
| `obstetric_summary` | ObstetricSummaryCard | Obstetric data (GP, EDD, ANC, vaccines) | Obstetric patients, specialty tab |
| `gynec_summary` | GynecSummaryCard | Gynecological history | Gynec patients, specialty tab |
| `pediatric_summary` | PediatricSummaryCard | Growth, milestones, vaccines | Pediatric patients, specialty tab |
| `ophthal_summary` | OphthalSummaryCard | Visual acuity, IOP, fundus | Ophthal patients, specialty tab |

### B. Data Family (8 cards)

Cards that display clinical data — labs, vitals, trends, timelines. Read-only or with copy functionality.

| Kind | Component | Description | When Shown |
|------|-----------|-------------|------------|
| `lab_panel` | LabPanelCard | Flagged lab results in grid table | "Lab overview" pill, lab queries |
| `vitals_trend_bar` | VitalsTrendChart (bar) | Vitals over time as bar chart | "Vital trends" pill, comparison intent |
| `vitals_trend_line` | VitalsTrendChart (line) | Vitals over time as line chart | "Graph view" pill |
| `lab_trend` | VitalsTrendChart (lab) | Single lab parameter trend | "HbA1c trend" pill |
| `lab_comparison` | LabComparisonCard | Previous vs current lab values with deltas | "Lab comparison" pill |
| `med_history` | MedHistoryCard | Medication history timeline | "Med history" pill |
| `vaccination_schedule` | VaccinationScheduleCard | Vaccine schedule with status badges | Pediatric context, vaccine queries |
| `patient_timeline` | PatientTimelineCard | Chronological event timeline | "View all records" navigation |

### C. Action Family (7 cards)

Cards that drive clinical decisions — the doctor interacts, selects, and copies to RxPad.

| Kind | Component | Interaction | When Shown |
|------|-----------|-------------|------------|
| `ddx` | DDXCard | Checkbox selection → Copy to Diagnosis | "Suggest DDX" pill, dx_accepted phase |
| `protocol_meds` | ProtocolMedsCard | Review + Copy to Medication | "Protocol meds" pill, dx_accepted phase |
| `investigation_bundle` | InvestigationCard | Checkbox selection → Copy to RxPad | "Suggest investigations" pill |
| `follow_up` | FollowUpCard | Radio selection → Set follow-up | "Plan follow-up" pill |
| `advice_bundle` | AdviceBundleCard | Copy advice → Share with patient | "Generate advice" pill |
| `voice_structured_rx` | VoiceStructuredRxCard | Section-by-section Copy to RxPad | Voice dictation |
| `rx_preview` | RxPreviewCard | Final prescription summary | "Visit summary" pill, near_complete phase |

### D. Analysis Family (2 cards)

Cards that process uploaded documents using OCR.

| Kind | Component | Description | When Shown |
|------|-----------|-------------|------------|
| `ocr_pathology` | OCRPathologyCard | Structured lab report with parameters | Document upload (lab report) |
| `ocr_extraction` | OCRFullExtractionCard | Multi-section document extraction | Document upload (discharge summary, etc.) |

### E. Utility Family (5 cards)

Helper cards for translation, completeness, guidelines, referrals, and follow-up questions.

| Kind | Component | Description | When Shown |
|------|-----------|-------------|------------|
| `translation` | TranslationCard | Source → target language translation | "Translate" pill |
| `completeness` | CompletenessCard | RxPad section fill status | "Completeness check" pill |
| `follow_up_question` | FollowUpQuestionCard | Agent asks doctor for clarification | Agent needs more info |
| `clinical_guideline` | ClinicalGuidelinesCard | Evidence-based recommendations | Clinical question intent |
| `referral` | ReferralCard | Specialist referral with urgency | "Refer patient" action |

### F. Safety Family (2 cards)

Critical safety alerts that interrupt workflow.

| Kind | Component | Description | When Shown |
|------|-----------|-------------|------------|
| `drug_interaction` | DrugInteractionCard | Drug-drug interaction alert | Medication entry triggers check |
| `allergy_conflict` | AllergyConflictCard | Drug-allergy conflict alert | Medication entry triggers check |

### G. Text Family (6 variants)

Lightweight text-only responses (no card shell needed for simple answers).

| Kind | Rendering | Description | When Shown |
|------|-----------|-------------|------------|
| `text_fact` | Inline box | Single fact with source citation | Clinical knowledge queries |
| `text_alert` | Severity-colored bar | Critical/high/moderate/low alerts | Safety warnings |
| `text_list` | Bulleted list | Simple list of items | List-type responses |
| `text_step` | Numbered steps with left accent | Step-by-step instructions | Procedure instructions |
| `text_quote` | Italic blockquote | Clinical reference quotation | Guideline citations |
| `text_comparison` | Two-column grid | Side-by-side comparison | Drug/treatment comparisons |

### H. Homepage / Operational Family (12 cards)

Clinic-level operational cards for the homepage dashboard.

| Kind | Component | Description | When Shown |
|------|-----------|-------------|------------|
| `welcome_card` | WelcomeCard | Daily greeting with stats and tips | Homepage load |
| `patient_list` | PatientListCard | Queue or filtered patient list | "View Queue" pill |
| `follow_up_list` | FollowUpListCard | Upcoming follow-ups with overdue flags | "Follow-ups" pill |
| `revenue_bar` | RevenueBarCard | Daily revenue bar chart | "Revenue" pill |
| `bulk_action` | BulkActionCard | Batch SMS/reminder interface | "Send reminders" pill |
| `donut_chart` | DonutChartCard | Patient distribution donut | "Demographics" pill |
| `pie_chart` | PieChartCard | Consultation type breakdown | Analytics queries |
| `line_graph` | LineGraphCard | Daily patient count trend | "Patient volume" pill |
| `analytics_table` | AnalyticsTableCard | KPI dashboard with week-over-week | "Weekly KPIs" pill |
| `condition_bar` | ConditionBarCard | Top conditions horizontal bars | "Diagnosis breakdown" pill |
| `heatmap` | HeatmapCard | Appointment density heatmap | "Busiest hours" pill |
| `billing_summary` | BillingSummaryCard | Session billing with payment status | Billing queries |

---

## Card Architecture

### Shared Components

All cards build on these primitives:

| Component | File | Purpose |
|-----------|------|---------|
| `CardShell` | `CardShell.tsx` | Outer wrapper: header (icon + title + date + badge), copy button, children, actions (pills), sidebarLink (CTA) |
| `ChatPillButton` | `ActionRow.tsx` | Follow-up action pill buttons below card content |
| `SidebarLink` | `SidebarLink.tsx` | CTA below divider (e.g., "Copy to RxPad", "View full report") |
| `InsightBox` | `InsightBox.tsx` | AI insight callout (red/amber/purple/teal variants) |
| `CopyIcon` | `CopyIcon.tsx` | Copy-to-clipboard icon with Linear/Bulk variant |
| `DataRow` | `DataRow.tsx` | Key-value row with optional copy |
| `CheckboxRow` | `CheckboxRow.tsx` | Multi-select checkbox row |
| `RadioRow` | `RadioRow.tsx` | Single-select radio row |
| `InlineDataRow` | `InlineDataRow.tsx` | Inline key-value pair |
| `SectionTag` | `SectionTag.tsx` | Section heading with icon |

### File Organization

```
cards/
  CardShell.tsx           # Shared card wrapper
  CardRenderer.tsx        # Discriminated union → component router
  ActionRow.tsx           # ChatPillButton + row divider
  SidebarLink.tsx         # CTA link component
  InsightBox.tsx          # AI insight callout
  CopyIcon.tsx            # Copy icon with variants
  CopyTooltip.tsx         # Copy feedback tooltip
  DataRow.tsx             # Key-value row
  CheckboxRow.tsx         # Checkbox row
  RadioRow.tsx            # Radio row
  InlineDataRow.tsx       # Inline data pair
  SectionTag.tsx          # Section heading
  action/                 # Action family cards
    DDXCard.tsx
    FollowUpCard.tsx
    InvestigationCard.tsx
    ProtocolMedsCard.tsx
    RxPreviewCard.tsx
    VoiceStructuredRxCard.tsx
  data/                   # Data family cards
    LabComparisonCard.tsx
    LabPanelCard.tsx
    MedHistoryCard.tsx
    PatientTimelineCard.tsx
    VaccinationScheduleCard.tsx
    VitalsTrendChart.tsx
  homepage/               # Homepage/operational cards
    AnalyticsTableCard.tsx
    BillingSummaryCard.tsx
    BulkActionCard.tsx
    ConditionBarCard.tsx
    DonutChartCard.tsx
    FollowUpListCard.tsx
    HeatmapCard.tsx
    LineGraphCard.tsx
    PatientListCard.tsx
    PieChartCard.tsx
    RevenueBarCard.tsx
    WelcomeCard.tsx
  utility/                # Utility & safety cards
    AllergyConflictCard.tsx
    ClinicalGuidelinesCard.tsx
    CompletenessCard.tsx
    DrugInteractionCard.tsx
    FollowUpQuestionCard.tsx
    OCRFullExtractionCard.tsx
    OCRPathologyCard.tsx
    ReferralCard.tsx
    TranslationCard.tsx
```

---

## Intent → Card Mapping

| Intent Category | Cards Produced |
|----------------|---------------|
| `data_retrieval` | patient_summary, last_visit, lab_panel, med_history, specialty summaries |
| `clinical_decision` | ddx, protocol_meds, investigation_bundle, clinical_guideline |
| `action` | follow_up, advice_bundle, translation, rx_preview |
| `comparison` | lab_comparison, vitals_trend_bar, vitals_trend_line, lab_trend |
| `document_analysis` | ocr_pathology, ocr_extraction |
| `clinical_question` | drug_interaction, text_fact, text_quote, text_alert |
| `operational` | welcome_card, patient_list, follow_up_list, revenue_bar, analytics_table, etc. |
| `follow_up` | follow_up_question |
| `ambiguous` | text response (no card) |

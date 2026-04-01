# Patient Summary — Data Permutations & Structuring

## Overview

The Patient Summary card is the most complex card in the system. Its content is entirely driven by available data — and the data availability varies wildly across patients. This document defines every permutation, what gets shown, what gets hidden, and what fallback text to use.

---

## 1. Data Availability Matrix

### 8 Demo Patients vs Data Signals

| Signal | Shyam GR | Neha G | Anjali P | Vikram S | Priya R | Arjun S | Lakshmi K | Ramesh M | Suresh N |
|--------|----------|--------|----------|----------|---------|---------|-----------|----------|----------|
| **Symptom Collector** | Yes | **No** | Yes | Yes | Yes | Yes | Yes | Yes | **No** |
| **Vitals (today)** | Yes (critical) | Yes (normal) | Yes (normal) | Yes (borderline) | Yes (borderline) | Yes (mild) | Yes (normal) | **No** | Yes (normal) |
| **Lab Flags** | 7 | 2 | 1 | 3 | 2 | 0 | 3 | 0 | 2 |
| **Last Visit** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **No** | Yes |
| **Chronic Conditions** | Yes (2) | Yes (2) | Yes (1) | Yes (3) | Yes (1) | **No** | Yes (3) | **No** | Yes (3) |
| **Active Meds** | Yes (2) | Yes (4) | Yes (3) | Yes (4) | Yes (3) | Yes (2) | Yes (3) | Yes (2) | Yes (4) |
| **Allergies** | Yes (3) | Yes (2) | **No** | Yes (1) | Yes (1) | **No** | Yes (1) | Yes (1) | Yes (1) |
| **Family History** | Yes | Yes | **No** | Yes | Yes | Yes | Yes | **No** | Yes |
| **Specialty Data** | — | — | Gynec+Ophthal | Ophthal | Obstetric | Pediatric | Gynec | — | — |
| **Follow-up Overdue** | 5d | 3d | 0 | 12d | 0 | 0 | 0 | 0 | 0 |
| **Is New Patient** | No | No | No | No | No | No | No | **Yes** | No |
| **Concern Trend** | SpO2 ↓ | SpO2 ↓ | — | — | — | — | — | — | LDL ↓ |

---

## 2. Four Fundamental Permutations

### P1: New Patient, No History, Symptoms Only (`apt-zerodata` — Ramesh M)

**Available:** Symptom collector data only (self-reported symptoms, self-declared allergies, self-declared meds)
**Missing:** Vitals, labs, last visit, chronic conditions, family history, concern trends

**Patient Summary Structure:**
```
┌─ Patient Summary ─────────────────────────────────────┐
│                                                        │
│  🏷️ General Medicine (First Visit)                     │
│                                                        │
│  📋 "New patient. No prior clinical data available."    │
│                                                        │
│  ♦ Symptom Reports                                     │
│    • Knee Pain (1 week, moderate)                      │
│    • Morning Stiffness (3 days, mild)                  │
│                                                        │
│  ♦ Self-Declared Allergies                             │
│    Sulfonamides                                        │
│                                                        │
│  ♦ Current Medications (self-reported)                 │
│    Vitamin D3 60K weekly, Calcium 500mg daily          │
│                                                        │
│  ♦ Medical History (self-reported)                     │
│    Childhood asthma (resolved), Appendectomy 2018      │
│                                                        │
│  [No vitals section — not taken yet]                   │
│  [No labs section — none available]                    │
│  [No concern trend — no historical data]               │
│                                                        │
│  Pills: Pre-visit intake, Suggest DDX, Initial workup     │
└────────────────────────────────────────────────────────┘
```

**Agent intro text:** "This is Ramesh M's first visit. I don't have any prior clinical records. Here's what he reported during intake."

**Key rules:**
- Show "First Visit" badge or "New Patient" tag
- Symptom collector data is the PRIMARY content
- Mark all self-reported data as "(self-reported)" since it's unverified
- Do NOT show empty sections (no "Vitals: —", no "Labs: —")
- Canned pills focus on initial workup

---

### P2: Returning Patient, History Only, No Symptoms (`reg-suresh` — Suresh Nair)

**Available:** Full history (vitals, labs, last visit, chronic conditions, meds, allergies, family history, concern trend)
**Missing:** Symptom collector data (patient did not fill intake form)

**Patient Summary Structure:**
```
┌─ Patient Summary ─────────────────────────────────────┐
│                                                        │
│  🏷️ General Medicine, Cardiology                       │
│  ⚠️ Follow-up: On schedule                              │
│                                                        │
│  📋 "58M with stable IHD post-angioplasty, controlled  │
│     HTN. No new symptoms reported today."               │
│                                                        │
│  ♦ Today's Vitals                                      │
│    BP: 132/84 | Pulse: 74 | SpO2: 98% | Wt: 76kg      │
│                                                        │
│  ♦ Key Labs (2 flagged)                                │
│    ↑ LDL: 118 mg/dL (ref <100)                         │
│    ↑ Triglycerides: 178 mg/dL (ref <150)               │
│                                                        │
│  ♦ Chronic Conditions                                  │
│    IHD (2024), HTN (5yr), Dyslipidemia (3yr)           │
│                                                        │
│  ♦ Active Medications (4)                              │
│    Clopidogrel 75mg, Atorvastatin 40mg, ...            │
│                                                        │
│  ♦ Allergies                                           │
│    Aspirin (GI intolerance)                            │
│                                                        │
│  ♦ Concern Trend: LDL ↓ (improving)                   │
│    142 → 128 → 118                                     │
│                                                        │
│  [No Symptom Reports section — intake not filled]      │
│                                                        │
│  Pills: Patient summary, Lab overview, Last visit      │
└────────────────────────────────────────────────────────┘
```

**Agent intro text:** "Suresh Nair is here for a follow-up. He hasn't filled the symptom collector today. Here's his clinical snapshot from available records."

**Key rules:**
- Do NOT show "Symptom Reports" section at all
- Narrative acknowledges "No new symptoms reported today"
- Historical data is the PRIMARY content
- All sections populated from SmartSummaryData
- Canned pills focus on review and comparison (not intake)

---

### P3: Returning Patient, Both Symptoms + History (`__patient__` — Shyam GR)

**Available:** Everything — symptoms, vitals, labs, history, meds, allergies, family history, trends
**This is the richest state.**

**Patient Summary Structure:**
```
┌─ Patient Summary ─────────────────────────────────────┐
│                                                        │
│  🏷️ General Medicine, Diabetology                      │
│  ⚠️ Follow-up overdue: 5 days                           │
│                                                        │
│  📋 "25M with DM + HTN presenting with fever 3d,       │
│     dry cough 2d. Critical BP 70/60, SpO2 93%."        │
│                                                        │
│  ♦ Today's Vitals (with flags)                         │
│    BP: ⚠️70/60 | Pulse: 78 | SpO2: ⚠️93% | Temp: ⚠️104°F│
│                                                        │
│  ♦ Key Labs (7 flagged)                                │
│    ↑ HbA1c: 8.1% | ↑ FBS: 168 | ↑ TSH: 5.8 | ...     │
│                                                        │
│  ♦ Symptom Reports (from intake)                       │
│    • Fever (3d, high, evening spikes)                  │
│    • Dry Cough (2d, moderate)                          │
│                                                        │
│  ♦ Chronic Conditions                                  │
│    Diabetes (1yr), Hypertension (6mo)                  │
│                                                        │
│  ♦ Active Medications                                  │
│    Telma20, Metsmail 500                               │
│                                                        │
│  ♦ Allergies                                           │
│    Dust, Egg, Prawns                                   │
│                                                        │
│  ♦ Family History                                      │
│    Thyroid (Mom, Aunt), Diabetes (Father)              │
│                                                        │
│  ♦ Concern Trend: SpO2 ↓ (declining)                  │
│    97 → 96 → 94 → 93                                  │
│                                                        │
│  Pills: Review SpO2, Allergy Alert, Suggest DDX        │
└────────────────────────────────────────────────────────┘
```

**Agent intro text:** "Shyam GR is back with fever and cough. Vitals are concerning — BP 70/60, SpO2 93%. He has 7 flagged labs and a declining SpO2 trend."

**Key rules:**
- Vitals shown with flag icons for abnormals
- Symptoms from collector are integrated alongside clinical data
- Concern trend is prominent when declining
- Safety pills (SpO2, Allergy) take priority
- Narrative weaves acute + chronic together

---

### P4: Returning Patient, Symptoms + No Significant History (`apt-arjun` — Arjun S, 4y)

**Available:** Symptoms, vitals, pediatric growth data
**Limited:** No flagged labs, no chronic conditions, minimal history

**Patient Summary Structure:**
```
┌─ Patient Summary ─────────────────────────────────────┐
│                                                        │
│  🏷️ Pediatrics                                         │
│                                                        │
│  📋 "4M with dry cough 3d, reduced appetite 1w.        │
│     Weight 14kg (15th percentile — below expected)."    │
│                                                        │
│  ♦ Today's Vitals                                      │
│    BP: 90/60 | Pulse: 110 | Temp: 99.2°F               │
│                                                        │
│  ♦ Symptom Reports                                     │
│    • Dry Cough (3 days)                                │
│    • Reduced Appetite (1 week)                         │
│                                                        │
│  ♦ Growth                                              │
│    Weight: 14kg (15th %ile), Height: 98cm (25th %ile)  │
│                                                        │
│  ♦ Milestones                                          │
│    Walking (age-appropriate), Speech: 2-word only ⚠️    │
│                                                        │
│  ♦ Vaccines                                            │
│    MMR-2 overdue, 1 pending                            │
│                                                        │
│  [No labs section — none flagged]                      │
│  [No chronic conditions]                               │
│                                                        │
│  Pills: Growth & vaccines, Suggest DDX                  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Section Visibility Rules

| Section | Show When | Hide When |
|---------|-----------|-----------|
| Specialty Tags | Always (even if empty — show "General Medicine") | Never hidden |
| Follow-up Overdue | `followUpOverdueDays > 0` | `followUpOverdueDays === 0` or new patient |
| Patient Narrative | Always (generated from available data) | Never hidden |
| Today's Vitals | `todayVitals` exists and has at least 1 value | No vitals taken today |
| Key Labs | `keyLabs.length > 0` | No flagged labs |
| Symptom Reports | `symptomCollectorData` exists | Patient didn't fill collector |
| Chronic Conditions | `chronicConditions.length > 0` | New patient or no conditions |
| Active Medications | `activeMeds.length > 0` | No active meds |
| Allergies | `allergies.length > 0` | No known allergies |
| Family History | `familyHistory.length > 0` | Not available |
| Lifestyle Notes | `lifestyleNotes.length > 0` | Not available |
| Concern Trend | `concernTrend` exists | No trend data |
| Due Alerts | `dueAlerts.length > 0` | No pending items |
| Record Alerts | `recordAlerts.length > 0` | No record issues |
| Obstetric Data | `obstetricData` exists | Not obstetric patient |
| Gynec Data | `gynecData` exists | Not gynec patient |
| Pediatric Data | `pediatricsData` exists | Not pediatric patient |
| Ophthal Data | `ophthalData` exists | Not ophthal patient |

---

## 4. Agent Intro Text Patterns

The agent generates a text message ABOVE the patient summary card. This text adapts to the available data:

### Pattern: New Patient, No History
```
"This is [Name]'s first visit. No prior clinical records are available.
Here's what [he/she] reported during intake."
```
Followed by: `patient_summary` card (P1 layout)

### Pattern: Returning Patient, No Intake
```
"[Name] is here today. [He/She] hasn't filled the symptom collector.
Here's [his/her] clinical snapshot from available records."
```
Followed by: `patient_summary` card (P2 layout)

### Pattern: Returning Patient, With Intake + Critical Vitals
```
"[Name] is back with [primary symptom]. Vitals are concerning — [flagged vitals].
[He/She] has [N] flagged labs and [trend description]."
```
Followed by: `patient_summary` card (P3 layout)

### Pattern: Returning Patient, With Intake + Normal Vitals
```
"[Name] presents with [primary symptom]. Vitals are within normal range.
[Context: overdue follow-up / flagged labs / specialty note]."
```
Followed by: `patient_summary` card (P3/P4 layout)

### Pattern: Returning Patient, Routine Follow-up
```
"[Name] is here for a routine follow-up. Last visit was [date].
[Summary of what was done last time and what's due]."
```
Followed by: `patient_summary` card (P2 layout)

---

## 5. Short Summary vs Full Summary

### Short Summary (used in: Patient tooltip, appointment card preview)

One-liner format: `"[Conditions] patient, on [key meds], last visited [date] with [chief complaint], [key finding]."`

Generated from: `patientNarrative` + `chronicConditions[0..2]` + `activeMeds[0..2]` + `lastVisit.date` + `lastVisit.diagnosis`

**SBAR alignment note:** The `patientNarrative` field is now the primary source for the SBAR Overview Card's Situation line (Priority 1), ensuring the tooltip summary shown on the appointment queue hover matches the Situation text inside the consultation. This creates a consistent experience as the doctor transitions from queue to consult. See `sbar-overview-card-spec.md` Section 3 for the full priority chain.

**If no history:** `"New patient with [self-reported symptoms]. [Allergy note]."`
**If no symptoms:** `"Returning patient with [conditions]. Last visit [date], [diagnosis]."`

### Full Summary (used in: patient_summary card)

Multi-section card with all available data. See Section 2 for layouts.

---

## 5A. Patient Tooltip Summary — Structure & Formulation

### Overview

On the appointment listing page, hovering over the AI icon shows a **short patient summary tooltip** (`AiPatientTooltip`). This is a concise, one-paragraph clinical snapshot designed for quick context before the doctor opens the consult. The tooltip is tab-aware — queue tab shows clinical summary text, while other tabs (finished, cancelled, draft, pending-digitisation) show structured data.

### Component Architecture

```
AiPatientTooltip (portal-based)
├── Header: AI spark icon + "Dr. Agent" gradient text
├── Content: tab-aware rendering
│   ├── Queue tab → summary text (from PATIENT_TOOLTIP_SUMMARIES)
│   ├── Finished tab → structured: Came for, Diagnosed, Prescribed, Ordered, Follow-up
│   ├── Cancelled tab → structured: Reason, Cancelled at, Notes
│   ├── Draft tab → checklist: Symptoms, Diagnosis, Medications, Advice, Investigations, Follow-up
│   └── Pending Digitisation → structured: Admitted, Status, Pending items
└── Footer: "Click to open Dr. Agent →"
```

### Queue Tab — Summary Text Formula

The `PATIENT_TOOLTIP_SUMMARIES` record stores pre-generated one-liner summaries keyed by patient ID. In production, these would be AI-generated from the patient's `SmartSummaryData`. The formula varies by data availability:

#### Formula A: Returning Patient + Symptoms + History (richest)

**Template:**
```
"Patient with {chronicConditions[0..2]}, on {activeMeds[0..2]},
 last visited on {lastVisit.date} with {lastVisit.symptoms},
 diagnosed {lastVisit.diagnosis},
 suggested {activeMeds[0..1] or suggestedMeds}."
```

**Data sources:**
- `chronicConditions` → first 2-3 conditions with duration
- `activeMeds` → first 2-3 key medications with dosage
- `lastVisit.date` → formatted as "DD Mon'YY"
- `lastVisit.symptoms` → chief complaints (shortened)
- `lastVisit.diagnosis` → primary + secondary diagnoses
- `symptomCollectorData.suggestedMeds` → fallback for suggested meds

**Example (Shyam GR):**
> "Patient with Hypertension 3yr and Diabetes Mellitus 2yr, on Telma 20mg, last visited on 27 Jan'26 with fever, diagnosed Viral fever and Conjunctivitis, suggested Paracetamol 650mg and Azithromycin 500mg."

#### Formula B: Returning Patient + History Only (no symptom collector)

**Template:**
```
"Patient with {chronicConditions[0..2]}, on {activeMeds[0..2]},
 last visited {lastVisit.date}, {lastVisit.diagnosis},
 {concernTrend or keyLabs highlight}."
```

**Data sources:**
- Same as Formula A but without `symptomCollectorData`
- `concernTrend` → if declining trend exists, append metric + value
- `keyLabs` → fallback: mention highest-priority flagged lab

**Example (Neha Gupta — no symptom collector):**
> "Patient with Bronchial Asthma since childhood and Hypothyroidism 3yr, on Budecort 200mcg and Thyronorm 50mcg, last visited 18 Feb'26 with nocturnal cough, diagnosed Acute exacerbation of asthma, SpO2 trending down (96%)."

**Example (Suresh Nair — no symptom collector):**
> "Patient with IHD post-angioplasty (2024), HTN 5yr, on Clopidogrel 75mg, Atorvastatin 40mg, last visited 10 Feb'26, stable IHD, LDL 118 (above target)."

#### Formula C: New Patient + Symptoms Only (no history)

**Template:**
```
"New patient with {symptoms[0..2]} {duration}.
 Allergy: {allergies}. On {currentMedications[0..2]}."
```

**Data sources:**
- `symptomCollectorData.symptoms` → first 2-3 symptoms with duration
- `symptomCollectorData.allergies` → self-reported allergies
- `symptomCollectorData.currentMedications` → self-reported current meds

**Example (Ramesh M):**
> "New patient with Knee Pain and Morning Stiffness 1 week. Allergy: Sulfonamides, on Vit D3 60K (weekly)."

#### Formula D: No Data Available

**Template:**
```
"New patient. No prior clinical data or symptom reports available."
```

This case occurs when a walk-in patient has neither filled the symptom collector NOR has any historical records. The tooltip should still be shown but with minimal text.

### Data Availability → Formula Mapping

| Has History | Has Symptom Collector | Formula | Example Patient |
|-------------|----------------------|---------|-----------------|
| Yes | Yes | A (richest) | Shyam GR, Anjali, Vikram, Priya, Arjun, Lakshmi |
| Yes | No | B (history-only) | Neha Gupta, Suresh Nair |
| No | Yes | C (symptoms-only) | Ramesh M |
| No | No | D (minimal) | (theoretical — no demo patient) |

### Text Highlighting

The `highlightSummaryText()` function applies bold styling to clinical terms within the summary text:

**Highlighted patterns (via regex):**
- **Dates:** `DD Mon'YY` format (e.g., "27 Jan'26") and `DD-MM-YYYY`
- **Conditions:** Hypertension, Diabetes Mellitus, Dyslipidemia, Hypothyroid, PCOS, Migraine, URTI, AUB, Primigravida, Pre-Diabetes
- **Medications:** Telma, Metsmall, Paracetamol, Azithromycin, Sumatriptan, Naproxen, Vitamin D, Rosuvastatin, Melatonin, CoQ10, Thyronorm, Folic Acid, Calcium, Amoxicillin, Salbutamol, Autrin, Tranexamic acid, Iron+Folic (with optional numeric suffixes)

**Rendering:** Matched terms are wrapped in `<span className="font-semibold text-tp-slate-700">` for visual emphasis within the `text-tp-slate-500` body text.

### Symptom Collector Icon on Appointment Page

The appointment listing shows a green virus icon (`hasSymptoms: true`) next to the visit type ONLY for patients who have filled the symptom collector (i.e., have `symptomCollectorData` in their mock data). This icon:
- Indicates pre-visit intake data is available
- Has tooltip: "Symptoms collected — Click to view"
- Clicking opens Dr. Agent panel for that patient

**Consistency rule:** `hasSymptoms === true` on the appointment row ↔ `symptomCollectorData` exists in `SMART_SUMMARY_BY_CONTEXT`. If the icon is absent, opening Dr. Agent shows Patient Summary directly (not Patient Reported card).

### Production AI Integration Notes

In production, the tooltip summary would be generated by an AI model with this structured prompt:

```
Given the following patient data, generate a concise one-paragraph clinical summary
(max 2 sentences, under 200 characters) for a doctor's quick reference tooltip.

Input schema:
- chronicConditions: string[]     // e.g. ["Hypertension (3yr)", "Diabetes (1yr)"]
- activeMeds: string[]            // e.g. ["Telma20 1-0-0-1", "Metsmail 500"]
- lastVisit: { date, symptoms, diagnosis }
- keyLabs: { name, value, flag }[]
- concernTrend: { label, values, tone }
- symptomCollectorData?: { symptoms, allergies, currentMedications }
- isNewPatient: boolean

Rules:
1. Lead with chronic conditions if returning patient, or "New patient" if first visit
2. Include 1-2 key medications
3. Reference last visit date and primary diagnosis
4. If concern trend exists, mention it last
5. Bold-worthy terms: condition names, medication names, dates
6. Do NOT include patient name (shown separately in UI)
```

---

## 6. Homepage Intro Message Structure

When the doctor opens the homepage (no patient selected), the agent shows:

1. **Text intro** (chat bubble): Greeting + daily context
   ```
   "Good morning, Dr. Sharma! You have [N] patients queued today.
   [N] follow-ups are overdue — [names].
   [Patient name] has [N] new flagged lab values since last visit.
   [N] draft prescriptions are pending your review."
   ```

2. **Welcome Card**: Today's schedule with neutral stat boxes (Queued, Follow-ups, Drafts, Finished)

3. **Canned Pills**: View Queue, Pending follow-ups, Revenue overview, Review drafts

---

## 7. Patient Scenarios Coverage

| Permutation | Patient | Key Demonstration |
|-------------|---------|-------------------|
| New + Symptoms + No History | Ramesh M (apt-zerodata) | First-time patient, intake-only data |
| Returning + Symptoms + Full History + Critical Vitals | Shyam GR (__patient__) | Richest state, all sections populated |
| **Returning + No Symptoms + Full History (Today's Queue)** | **Neha G (apt-neha)** | **No intake → Patient Summary shown directly, no symptom icon** |
| Returning + Symptoms + History + Specialty (Obstetric) | Priya R (apt-priya) | Obstetric overlay on GP summary |
| Returning + Symptoms + History + Specialty (Pediatric) | Arjun S (apt-arjun) | Growth/vaccine overlay, no labs |
| Returning + Symptoms + History + Specialty (Gynec) | Lakshmi K (apt-lakshmi) | Gynec overlay, anemia management |
| Returning + Symptoms + History + Multi-specialty | Anjali P (apt-anjali) | Ophthalmology + Gynec on GP base |
| Returning + Symptoms + History + Overdue Follow-up | Vikram S (apt-vikram) | Metabolic syndrome, risk stratification |
| **Returning + No Symptoms + Full History (Registered)** | **Suresh N (reg-suresh)** | **History-only workflow, registered patient** |

---

## 8. SBAR Overview Card (`sbar_overview`) Handling Per Permutation

The `sbar_overview` card is the primary summary shown when a doctor asks for "Patient Summary". It renders using the same `SmartSummaryData` but presents it in SBAR sections. Each section is independently shown/hidden based on data availability.

### P1: New Patient, No History

| Section | Shown? | Content |
|---------|--------|---------|
| **S (Situation)** | Yes | "New patient, no prior clinical data available." |
| **B (Background)** | Hidden | No conditions, no allergies, no meds |
| **A (Assessment)** | Hidden | No vitals, no labs |
| **Last Visit** | Hidden | No prior visits |
| **R (Recommendation)** | Hidden | No actionable items |

### P2: Returning, History Only (No Intake)

| Section | Shown? | Content |
|---------|--------|---------|
| **S (Situation)** | Yes | Composed from chronic conditions + current meds + last visit date |
| **B (Background)** | Yes | Conditions, allergies, active meds (max 6) |
| **A (Assessment)** | Conditional | Vitals if recorded today; Labs if available |
| **Last Visit** | Yes | Date, diagnosis, symptoms from previous visit |
| **R (Recommendation)** | Conditional | Follow-up overdue, critical vitals, due alerts |

### P3: Returning, Full Data (History + Intake)

| Section | Shown? | Content |
|---------|--------|---------|
| **S (Situation)** | Yes | Composed from symptoms + chronic conditions + drug allergies + meds + last visit |
| **B (Background)** | Yes | Full: Conditions, allergies (with drug allergies), active meds |
| **A (Assessment)** | Yes | Today's vitals with flags + key labs with indicators |
| **Last Visit** | Yes | Full previous visit context |
| **R (Recommendation)** | Yes | All applicable: overdue follow-up, critical vitals, due alerts, cross-problem flags |

### P4: Limited History (Partial Data)

| Section | Shown? | Content |
|---------|--------|---------|
| **S (Situation)** | Yes | Whatever is available (may be 1 sentence) |
| **B (Background)** | Partial | Only sub-sections with data (e.g., meds but no allergies) |
| **A (Assessment)** | Partial | Vitals or labs (whichever is available) |
| **Last Visit** | Conditional | Only if prior visit exists |
| **R (Recommendation)** | Conditional | Only critical items |

### Key Rule
Each section is hidden entirely if it has no data. No placeholder dashes, no "N/A" values, no empty labels. The card gracefully degrades from 5 sections (richest) to 1 section (Situation only for new patients).

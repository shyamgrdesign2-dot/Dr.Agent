"use client"

import React, { useState, useCallback } from "react"

// ─────────────────────────────────────────────────────────────
// Patient Short Summary Generation — Complete E2E Documentation
// Covers: data sources, fetch logic, medical history breakdown,
// sentence formation rules, specialty filtering (supported only),
// permutation scenarios, appointment status summaries,
// agent response templates, and acceptance criteria.
// ─────────────────────────────────────────────────────────────

// ── Data Constants ────────────────────────────────────────────

const SOURCE_CHECKLIST = {
  historical: [
    { item: "Past visits", detail: "Previous encounter records — symptoms, diagnosis, treatment, follow-up notes" },
    { item: "Vitals history", detail: "BP, SpO₂, Temp, HR, Weight, BMI trends across visits" },
    { item: "Medical history", detail: "Chronic conditions, allergies, lifestyle, surgical history, family history, additional notes" },
    { item: "Ophthal history", detail: "VA (unaided, with glasses, pinhole, near), IOP (R/L mmHg), anterior/posterior segment, slit lamp, fundus, glass Rx" },
    { item: "Gynec history", detail: "Menarche age, cycle type/interval, flow volume/pads/day, pain level, lifecycle hormonal changes, notes" },
    { item: "Obstetric history", detail: "GPLAE, LMP, EDD, gestation weeks, per-pregnancy details (MOD, baby weight, remarks), examination (oedema, BMI, BP)" },
    { item: "Vaccination history", detail: "Pending/upcoming/given vaccines — with week/age, brand, due/given dates, overdue flags" },
    { item: "Growth history", detail: "Height (cm), weight (kg), BMI, OFC (head circumference) — date-based entries with chart view" },
    { item: "Lab results", detail: "CBC, LFT, KFT, Thyroid, HbA1c, Lipid, Urine — all historical panels with flags" },
    { item: "Uploaded medical records", detail: "External reports, discharge summaries, scanned documents (OCR-ready)" },
  ],
  currentEncounter: [
    { item: "Symptom collector payload", detail: "Self-reported symptoms, duration, severity, questions to doctor — from patient app" },
    { item: "Current visit vitals", detail: "Vitals recorded by nurse/receptionist in this encounter" },
    { item: "Current RxPad entries", detail: "If doctor has already started entering — meds, diagnosis, investigations" },
  ],
  identity: [
    { item: "Patient demographics", detail: "Name, age, gender, UHID, contact" },
    { item: "Appointment context", detail: "New / Follow-up / Walk-in + specialty of the consulting doctor" },
    { item: "Appointment status", detail: "Queue / Finished / Cancelled / Draft / Pending Digitisation — determines summary type" },
  ],
}

const MEDICAL_HISTORY_BREAKDOWN = [
  {
    field: "Chronic Conditions (Medical Conditions)",
    priority: "PRIMARY",
    color: "#EF4444",
    description: "Active chronic diseases — Diabetes, Hypertension, Asthma, COPD, Thyroid disorders, Epilepsy, etc.",
    summaryRule: "ALWAYS include in summary when present. This is the most critical piece of medical history for the doctor.",
    example: "Known case of Type 2 DM (1yr) and Hypertension (6mo).",
  },
  {
    field: "Allergies",
    priority: "HIGH",
    color: "#F59E0B",
    description: "Drug allergies (Sulfonamides, Penicillin), food allergies (Egg, Prawns), environmental (Dust, Pollen).",
    summaryRule: "Include in summary when present — especially drug allergies. Critical for prescription safety.",
    example: "Allergies: Sulfonamides (drug), Dust, Egg.",
  },
  {
    field: "Surgical History",
    priority: "HIGH",
    color: "#F59E0B",
    description: "Past surgeries — Appendectomy, C-section, Knee replacement, CABG, Cataract surgery, etc.",
    summaryRule: "Include when present and clinically relevant to current complaint or specialty context.",
    example: "H/o Appendectomy (2018), L-knee arthroscopy (2022).",
  },
  {
    field: "Family History",
    priority: "CONTEXTUAL",
    color: "#8B5CF6",
    description: "Hereditary conditions in immediate family — DM, HTN, Cancer, Heart disease, Thyroid disorders.",
    summaryRule: "Mention only if space permits and family history is directly relevant (e.g., strong cardiac family history for a cardiac patient).",
    example: "Family h/o: Father — DM + CAD, Mother — Hypothyroid.",
  },
  {
    field: "Lifestyle",
    priority: "CONTEXTUAL",
    color: "#8B5CF6",
    description: "Smoking, alcohol, diet habits, exercise, sleep patterns, occupation-related exposure.",
    summaryRule: "Mention only if directly relevant to current symptoms or specialty (e.g., smoker presenting with cough). Not mandatory in short summary.",
    example: "Smoker (10 pack-years), sedentary lifestyle.",
  },
  {
    field: "Additional History",
    priority: "LOW",
    color: "#94A3B8",
    description: "Any other notes the patient or previous doctor has recorded — travel history, occupational exposure, previous hospital admissions.",
    summaryRule: "Include only if exceptionally relevant. Usually omitted from short summary.",
    example: "Recent travel to malaria-endemic area (2 weeks ago).",
  },
]

const SUMMARY_COMPOSITION_ORDER = [
  {
    step: 1,
    label: "Current Symptoms (from Symptom Collector)",
    condition: "IF symptom collector data exists",
    rule: "Open with patient-reported symptoms. Begin the sentence with the presenting complaint.",
    template: `"Presents with **[symptom1]** ([duration], [severity]) and **[symptom2]** ([duration])."`,
    fallback: "If no symptom collector, skip this and start with Step 2.",
  },
  {
    step: 2,
    label: "Chronic / Concerning Conditions",
    condition: "IF chronic conditions OR high-risk diseases exist",
    rule: "Immediately after symptoms (or as opener if no symptoms), state chronic conditions. Flag concerning diseases like cancer, severe cardiac history, renal failure, etc.",
    template: `"Known case of **[Full Disease Name]** ([duration]). **[Concerning flag if any].**"`,
    fallback: "If no chronic conditions, skip entirely. Do not say 'No chronic conditions'.",
  },
  {
    step: 3,
    label: "Allergies (if drug allergy present)",
    condition: "IF drug allergies exist",
    rule: "Mention drug allergies inline for prescription safety. Food/environmental allergies are lower priority.",
    template: `"**Allergic to [drug name].**"`,
    fallback: "If no allergies, skip. Do not say 'No known allergies' in short summary.",
  },
  {
    step: 4,
    label: "Current Medications",
    condition: "IF active medications exist",
    rule: "List 1-3 key medications only. Do not dump the full medication list.",
    template: `"On **[Med1]** dose freq, **[Med2]** dose freq."`,
    fallback: "If no current meds, skip.",
  },
  {
    step: 5,
    label: "Last Visit One-liner",
    condition: "IF last visit data exists",
    rule: "One sentence capturing: what symptoms brought them last time, what was diagnosed, and what was prescribed/advised.",
    template: `"Last visited [date] for [complaint], treated with [key meds]."`,
    fallback: "If no prior visits, skip.",
  },
]

const SENTENCE_FORMATION_EXAMPLES = [
  {
    scenario: "Full data — Symptoms + Chronic + Meds + Last visit",
    specialty: "General Medicine",
    availableData: ["Symptom collector", "Chronic conditions", "Drug allergy", "Active meds", "Last visit", "Vitals", "Labs"],
    agentOutput: `Presents with **fever** (3d, moderate) and **dry cough** (2d). Known case of **Diabetes Mellitus** (1yr) and **Hypertension** (6mo). **Allergic to Sulfonamides.** On **Metformin** 500mg BD, **Amlodipine** 5mg OD. Last visited **27 Jan** for **viral fever**, treated with **Paracetamol**, **Cetirizine**.`,
    reasoning: "All pieces available. Key clinical terms bolded: symptoms, chronic diseases, allergy, medications. Last visit line bolds date, diagnosis, and medication names. No em-dashes. Full disease names used.",
  },
  {
    scenario: "Symptoms only — New patient with symptom collector",
    specialty: "General Medicine",
    availableData: ["Symptom collector", "Self-reported allergy", "Self-reported meds"],
    agentOutput: `New patient. Presents with **knee pain** (1wk, right knee) and **morning stiffness** (3d). Self-reported **allergy: Sulfonamides.** Currently taking **Vitamin D3** 60K weekly, **Calcium** 500mg daily. No prior visit history available.`,
    reasoning: "New patient with intake data only. Symptoms, allergy, and medication names bolded. Qualifiers simplified. Self-reported label used for unverified data.",
  },
  {
    scenario: "History only — No symptom collector",
    specialty: "Diabetology",
    availableData: ["Chronic conditions", "Active meds", "Labs", "Last visit", "Vitals"],
    agentOutput: `Known case of **Diabetes Mellitus Type 2** (1yr) and **Hypertension** (6mo). On **Metformin** 500mg BD, **Telmisartan** 40mg OD. **HbA1c trending up** (7.2 to 8.1%). Last visited **27 Jan**, follow-up overdue 5d. No intake symptoms submitted today.`,
    reasoning: "No symptom collector. Opens with chronic conditions using full names. Lab trend bolded. Last visit date bolded. 'Last visited' instead of 'Last seen'. No em-dashes.",
  },
  {
    scenario: "Partial data — Only chronic conditions and allergy",
    specialty: "General Medicine",
    availableData: ["Chronic conditions", "Allergies"],
    agentOutput: `Known case of **Bronchial Asthma** (5yr). **Allergic to Penicillin.** No current medications, lab data, or prior visit records available.`,
    reasoning: "Minimal data. Chronic condition and allergy bolded. Honestly states what is missing without filler.",
  },
  {
    scenario: "Zero data — Completely new patient",
    specialty: "Any",
    availableData: [],
    agentOutput: `New patient — no historical clinical data or symptom collector submission available. Recommend: collect symptoms via intake form, record vitals, and begin clinical assessment.`,
    reasoning: "Explicit new-patient fallback. Provides next-action prompts instead of empty summary.",
  },
  {
    scenario: "Pediatric — Growth + vaccine context",
    specialty: "Pediatrics",
    availableData: ["Symptom collector", "Growth data", "Vaccine history", "Vitals"],
    agentOutput: `Presents with **recurrent cough** (2wk) and **low-grade fever** (4d). Weight: 12kg (25th percentile, age-appropriate). OFC: 47cm. **Vaccines up to date** through 18mo schedule. No chronic conditions on record.`,
    reasoning: "Pediatric specialty. Symptoms bolded. Growth (weight, percentile, OFC) and vaccine data prioritized. Gynec/obstetric suppressed.",
  },
  {
    scenario: "Gynec — Menstrual + hormonal context",
    specialty: "Gynecology",
    availableData: ["Symptom collector", "Gynec history", "Chronic conditions", "Last visit"],
    agentOutput: `Presents with **irregular periods** (3mo) and **lower abdominal pain** (1wk). Known case of **PCOS** (2yr), **Hypothyroid** (1yr). Cycle: irregular, 45d interval, moderate flow (3 pads/day), mild dysmenorrhea. LMP: 15 Feb. Last visited 10 Jan, USG normal, TSH slightly elevated. On **Letrozole** 2.5mg, **Thyronorm** 50mcg.`,
    reasoning: "Symptoms, chronic conditions, and medication names bolded. Gynec-specific fields included. No em-dashes in last visit.",
  },
  {
    scenario: "Ophthal — Vision + IOP context",
    specialty: "Ophthalmology",
    availableData: ["Ophthal history", "Chronic conditions", "Active meds", "Vitals"],
    agentOutput: `Known case of **Diabetes Mellitus Type 2** (8yr), presenting for annual fundus screening. Last VA: R 6/9, L 6/12. IOP: R 16, L 18 mmHg. Anterior segment: clear both eyes. Fundus: **mild NPDR** (R). Glass Rx: RE -1.25DS, LE -1.75DS. On **Metformin** 1g BD, **Insulin Glargine** 16U HS.`,
    reasoning: "Ophthal-specific data leads. DM full name used, bolded. Fundus finding (NPDR) bolded as concerning. Medication names bolded. No em-dashes.",
  },
  {
    scenario: "Obstetric — GPLAE + pregnancy context",
    specialty: "Obstetrics",
    availableData: ["Symptom collector", "Obstetric history", "Vitals", "Labs", "Active meds"],
    agentOutput: `G2P1L1A0, LMP 15 Sep, EDD 22 Jun, currently 26wk. Presents with **mild swelling in feet** (1wk). BP: **130/85 (borderline)**. Pedal oedema: mild. Previous pregnancy: NVD, baby 3.2kg, uneventful. On **Iron + Folic acid**, **Calcium**. Recent labs: **Hb 10.2 (mild anemia)**, GCT pending.`,
    reasoning: "GPLAE/LMP/EDD always leads. Symptoms, borderline BP, concerning lab value (low Hb), and medications bolded. No em-dashes.",
  },
  {
    scenario: "Concerning disease — Cancer history",
    specialty: "General Medicine",
    availableData: ["Chronic conditions", "Surgical history", "Active meds", "Labs", "Last visit"],
    agentOutput: `Known case of **Carcinoma Breast** (Stage IIA, diagnosed 2024), post-mastectomy. On **Tamoxifen** 20mg OD. Also: **Hypertension** (3yr) on **Losartan** 50mg. Recent labs: CBC normal, **LFT mildly deranged** (SGPT 58). Last visited 1 month ago for routine oncology follow-up, advised PET-CT.`,
    reasoning: "Concerning disease (cancer) bolded and full name used. All medications, abnormal labs, and chronic conditions bolded. 'Last visited' format with no em-dashes.",
  },
]

const SPECIALTY_RULES = [
  {
    specialty: "General Practice / Medicine",
    include: ["Past visits", "Vitals", "Medical history (all sub-fields)", "Labs", "Meds", "Allergies", "Symptom collector"],
    hide: ["Specialty blocks (ophthal/gynec/obstetric/pediatric) unless clearly present and relevant"],
    priorityNote: "Broadest scope — show everything that is available. Suppress only specialty-specific domains that have no data.",
    dataFields: "All general clinical fields. No specialty-specific sidebar data.",
    shortSummaryFocus: "Symptoms → Chronic → Allergy → Meds → Last visit. Standard composition order.",
  },
  {
    specialty: "Ophthalmology",
    include: ["Ophthal history (VA R/L, near VA, IOP R/L, anterior segment, posterior segment, slit lamp, fundus, glass Rx)", "Vitals", "Relevant labs (HbA1c for diabetic retinopathy)", "Meds", "Allergies", "Last visit"],
    hide: ["Gynec history", "Obstetric history", "Pediatric growth/vaccine", "Surgical history unrelated to eyes"],
    priorityNote: "Ophthal-specific data leads the summary. DM/HTN chronic conditions are relevant (affect eyes). IOP color coding: Green <21, Amber 21-24, Red >24 mmHg.",
    dataFields: "VA (unaided, with glasses, pinhole, near) per eye | IOP (mmHg) per eye with color coding | Anterior segment (R/L) | Posterior segment (R/L) | Slit lamp findings | Fundus examination | Glass prescription | Last exam date | Alerts (digital eye strain, pregnancy vision)",
    shortSummaryFocus: "Lead with VA + IOP readings. Frame chronic conditions in ophthal context (e.g., 'DM (8yr) — for fundus screening').",
  },
  {
    specialty: "Gynecology",
    include: ["Gynec history (menarche age, cycle type/interval, flow volume/pads/day, pain level/status, lifecycle hormonal, notes)", "Vitals", "Medical history", "Relevant labs", "Meds", "Allergies", "Last visit"],
    hide: ["Ophthal history", "Pediatric growth/vaccine", "Obstetric (unless dual gynec-obstetric context)"],
    priorityNote: "Gynec-specific history leads. Hormonal conditions (PCOS, Thyroid) are priority chronic conditions here.",
    dataFields: "Menarche (age, notes) | Cycle (type, interval in days, notes) | Flow (volume, pads/day, notes on clots) | Pain (level, intermittent/persistent, management) | Lifecycle hormonal changes (LA age, type, notes on menopause) | General notes (intermenstrual bleeding, post-coital bleeding)",
    shortSummaryFocus: "Mention cycle regularity, flow, pain in 1 line. Include LMP. Frame chronic conditions in gynec context.",
  },
  {
    specialty: "Obstetrics",
    include: ["Obstetric history (GPLAE, LMP, EDD, gestation, per-pregnancy details, examination data)", "Vitals (BP critical)", "Relevant labs (Hb, GCT, blood group, urine)", "Meds", "Allergies", "Vaccine (TT)"],
    hide: ["Ophthal history", "Gynec-only panels not relevant to pregnancy", "Pediatric growth"],
    priorityNote: "GPLAE/LMP/EDD always lead. BP and Hb are critical vitals. Gestational context frames everything.",
    dataFields: "GPLAE (Gravida, Para, Living, Abortion, Ectopic) with status badge | LMP, EDD, Gestation (wk+d) | Per-pregnancy: LMP, EDD, MOD (NVD/LSCS), delivery date, baby weight, remarks | Examination: date, pedal oedema severity, BMI, BP",
    shortSummaryFocus: "ALWAYS open with 'G_P_L_A_E_, LMP [date], EDD [date], currently [X]wk.' Include BP, oedema, key pregnancy labs.",
  },
  {
    specialty: "Pediatrics",
    include: ["Growth data (height, weight, BMI, OFC — with percentiles)", "Vaccine history (pending/upcoming/given with overdue flags)", "Vitals", "Relevant labs", "Meds", "Allergies", "Last visit", "Symptom collector"],
    hide: ["Gynec history", "Obstetric history", "Ophthal (unless relevant)", "Lifestyle (not applicable for children)"],
    priorityNote: "Growth/development and vaccine status are primary. Age-appropriate context framing.",
    dataFields: "Growth: age, height (cm), weight (kg), BMI, OFC (cm) — date-based with chart view | Vaccines: pending (week/age, name, due/overdue status), upcoming, given (grouped by period, with brand + dates) | Milestones, feeding notes",
    shortSummaryFocus: "Mention weight + percentile + OFC. Vaccine status (up to date / overdue). Age-appropriate framing.",
  },
]

// ── Appointment Status Summary Logic ──────────────────────────

const APPOINTMENT_STATUS_SUMMARIES = [
  {
    status: "Queue",
    color: "#3B82F6",
    icon: "Q",
    summaryType: "Pre-consultation summary",
    description: "Patient is waiting to be seen. This is the standard short summary shown when the doctor opens the appointment.",
    behavior: "Generate the standard short summary following the strict composition order (symptoms → chronic → allergy → meds → last visit). This is the primary use case documented throughout this spec.",
    exampleOutput: `Presents with **fever** (3d, moderate) and **dry cough** (2d). Known case of **Diabetes Mellitus** (1yr) and **Hypertension** (6mo). **Allergic to Sulfonamides.** On **Metformin** 500mg BD, **Amlodipine** 5mg OD. Last visited **27 Jan** for **viral fever**, treated with **Paracetamol**, **Cetirizine**.`,
    dataUsed: "Symptom collector + Historical data + Current vitals (if recorded)",
    hoverSummary: "Same summary shown on appointment list hover tooltip. Character cap ~220 for tooltip context.",
  },
  {
    status: "Finished",
    color: "#10B981",
    icon: "F",
    summaryType: "Post-consultation summary",
    description: "Patient consultation is complete. Summary should reflect WHAT happened during the consultation, not what the patient came in with. Only show fields that have data — skip empty fields entirely.",
    behavior: "Generate a structured consultation outcome summary with labeled fields. Each field on its own line. Only show fields that have data — never hallucinate missing fields. Pull from the completed RxPad data.",
    exampleOutput: `**Came for:** Persistent cough, mild fever\n**Diagnosed:** Acute Bronchitis\n**Prescribed:** Azithromycin 500mg, Levocetrizine 5mg\n**Lab/Inv:** Chest X-ray, CBC\n**Examination:** Bilateral rhonchi, mild pharyngeal congestion\n**Advised:** Steam inhalation, warm fluids, rest\n**Follow-up:** 16 Mar'26`,
    dataUsed: "Completed RxPad data — Diagnosis, Medications, Investigations, Advice, Examination, Surgery, Notes, Follow-up",
    hoverSummary: "Short: 'Came for: cough + fever. Dx: Acute Bronchitis. Rx: Azithromycin, Levocetrizine. F/U: 16 Mar.'",
    compositionOrder: [
      "1. 'Came for:' — Chief complaint (keep it short, no duration unless critical)",
      "2. 'Diagnosed:' — Final diagnosis entered by doctor",
      "3. 'Prescribed:' — Key medications with dosage",
      "4. 'Lab/Inv:' — Investigations ordered (only if any)",
      "5. 'Examination:' — Key examination findings (only if recorded)",
      "6. 'Surgery:' — Procedure performed (only if any)",
      "7. 'Advised:' — Key advice given (only if any)",
      "8. 'Notes:' — Additional doctor notes (only if any)",
      "9. 'Follow-up:' — Follow-up date (only if scheduled)",
    ],
  },
  {
    status: "Cancelled",
    color: "#EF4444",
    icon: "C",
    summaryType: "Cancellation summary",
    description: "Appointment was cancelled. Summary should explain what it was for, why cancelled, and whether rescheduled. Timestamp shown as tertiary metadata, not a heading.",
    behavior: "Generate a short cancellation summary. Only show 'Rescheduled:' if rescheduled. Timestamp appears as small tertiary text at the bottom — not as a labeled heading.",
    exampleOutput: `**Appointment type:** Follow-up (Diabetes + Hypertension review)\n**Reason:** Patient called, couldn't make it\n**Rescheduled:** 25 Mar'26\nCancelled at 10:15 am`,
    exampleNoReason: `**Appointment type:** Follow-up (Diabetes + Hypertension review)\n**Reason:** Not recorded\nCancelled at 10:15 am`,
    dataUsed: "Appointment reason/type + Cancellation reason (if recorded) + Reschedule info (if any) + Cancellation timestamp",
    hoverSummary: "Short: 'Cancelled follow-up (DM + HTN). Rescheduled to 25 Mar.'",
    compositionOrder: [
      "1. 'Appointment type:' — What the appointment was for",
      "2. 'Reason:' — Why cancelled (if recorded, else 'Not recorded')",
      "3. 'Rescheduled:' — New date (ONLY if rescheduled, else omit entirely)",
      "4. Timestamp — Small tertiary text: 'Cancelled at 10:15 am' (not a bold heading)",
    ],
  },
  {
    status: "Draft",
    color: "#F59E0B",
    icon: "D",
    summaryType: "Incomplete consultation summary",
    description: "Doctor started the consultation but hasn't finished/submitted. Shows a checklist of RxPad section fill-state. Applicable ONLY for Point-and-Click RX mode — not for Voice RX or other input types.",
    behavior: "Generate a checklist showing each RxPad section with a check or cross. Timestamp shown as small tertiary text. For Voice RX / non-P&C modes, show a simple 'Draft — in progress' fallback instead of the checklist.",
    exampleOutput: `✓ Symptoms entered\n✓ Diagnosis entered\n✓ Medications: 2 drugs\n✗ Advice empty\n✗ Investigations empty\n✗ Follow-up not set\nLast modified: 1:45 pm`,
    exampleMinimal: `✗ Symptoms empty\n✗ Diagnosis empty\n✗ Medications empty\n✗ Advice empty\n✗ Investigations empty\n✗ Follow-up not set\nOnly vitals recorded.\nLast modified: 11:30 am`,
    dataUsed: "RxPad section fill-state + Last modified timestamp + RX input mode (Point-and-Click / Voice / Template)",
    hoverSummary: "Short: 'Draft — 3/6 sections filled. Last modified: 1:45 pm.'",
    rxModeNote: "Point-and-Click RX only. For Voice RX, show: 'Draft — voice prescription in progress.' For other modes, show: 'Draft — in progress.'",
    compositionOrder: [
      "1. Check RX input mode — if NOT Point-and-Click, use fallback (see note below)",
      "2. Checklist of RxPad sections (✓ filled / ✗ empty):",
      "   — Symptoms (✓ with count or ✗ empty)",
      "   — Diagnosis (✓ entered or ✗ empty)",
      "   — Medications (✓ with drug count or ✗ empty)",
      "   — Advice (✓ entered or ✗ empty)",
      "   — Investigations (✓ with count or ✗ empty)",
      "   — Follow-up (✓ with date or ✗ not set)",
      "3. Timestamp as tertiary text: 'Last modified: 1:45 pm'",
      "4. Fallback: Voice RX → 'Draft — voice prescription in progress.' | Template RX → 'Draft — in progress.'",
    ],
  },
  {
    status: "Pending Digitisation",
    color: "#8B5CF6",
    icon: "P",
    summaryType: "No AI summary",
    description: "This appointment was handwritten and is awaiting digitisation. There is no structured data for the AI to summarize.",
    behavior: "Do NOT show any AI-generated summary. Remove the AI summary section entirely for this status. Show a simple status indicator instead.",
    exampleOutput: `—`,
    dataUsed: "None — no structured data available",
    hoverSummary: "Show: 'Pending digitisation — no digital record available.'",
    compositionOrder: [
      "1. No AI summary generated",
      "2. Show status: 'Awaiting digitisation'",
      "3. If scanned image exists, show 'Scanned copy available' indicator",
    ],
  },
]

const MISSING_DATA_SCENARIOS = [
  {
    case: "Case 1",
    title: "Full history + Symptom collector available",
    historyAvailable: true,
    symptomCollector: true,
    description: "Best case — all data sources present.",
    behavior: "Generate complete summary following strict order: symptoms → chronic → allergy → meds → last visit. Include specialty-relevant data.",
    exampleOpener: `"Presents with [symptoms]. Known case of [chronic]. Allergic to [drug]. On [meds]. Last seen [date] for [reason]."`,
    badge: "Complete",
    badgeColor: "#10B981",
  },
  {
    case: "Case 2",
    title: "History available + No symptom collector",
    historyAvailable: true,
    symptomCollector: false,
    description: "Patient has EMR history but did not fill symptom collector before this visit.",
    behavior: "Start directly with chronic conditions / last visit context. Explicitly note that no intake was submitted today so the doctor knows to ask about current complaints.",
    exampleOpener: `"Known case of [chronic]. On [meds]. Last seen [date] for [reason]. No intake symptoms submitted for today's visit."`,
    badge: "Partial",
    badgeColor: "#F59E0B",
  },
  {
    case: "Case 3",
    title: "No history + Symptom collector available",
    historyAvailable: false,
    symptomCollector: true,
    description: "Likely a new or first-time patient who filled the symptom collector via patient app.",
    behavior: "Use symptom collector data as primary content. Label self-reported data clearly. Note that no prior records exist.",
    exampleOpener: `"New patient. Presents with [symptoms]. Self-reported allergy: [if any]. Currently taking [self-reported meds]. No prior clinical records available."`,
    badge: "Intake only",
    badgeColor: "#3B82F6",
  },
  {
    case: "Case 4",
    title: "Partial history + No symptom collector",
    historyAvailable: "partial" as string,
    symptomCollector: false,
    description: "Patient has some EMR data (e.g., just chronic conditions or just one past visit) but no intake.",
    behavior: "Use whatever is available. Never generate placeholder stubs or empty section labels. State what is missing naturally.",
    exampleOpener: `"Known case of [chronic]. No recent visits, lab data, or intake symptoms available."`,
    badge: "Sparse",
    badgeColor: "#F59E0B",
  },
  {
    case: "Case 5",
    title: "No history + No symptom collector (Zero data)",
    historyAvailable: false,
    symptomCollector: false,
    description: "Completely new patient with zero data in the system and no intake submission.",
    behavior: "Generate explicit new-patient fallback message. Provide next-action prompts to guide the doctor on what to collect.",
    exampleOpener: `"New patient — no historical clinical data or symptom collector submission available. Recommend: collect symptoms via intake form, record vitals, and begin clinical assessment."`,
    badge: "New patient",
    badgeColor: "#6B7280",
  },
  {
    case: "Case 6",
    title: "Full data + Critical vitals/labs",
    historyAvailable: true,
    symptomCollector: true,
    description: "Full data with critical abnormal values that need immediate attention.",
    behavior: "Follow standard order but prefix critical values prominently. Use signal words like 'Critical', 'Declining', 'Abnormal'.",
    exampleOpener: `"BP 70/60 (critical low), SpO₂ 93% (declining). Presents with [symptoms]. Known case of [chronic]..."`,
    badge: "Critical",
    badgeColor: "#EF4444",
  },
]

const AGENT_RESPONSE_RULES = [
  { rule: "Sentence length", detail: "Target 2-4 sentences total. Never exceed 5. Each sentence should carry distinct clinical information." },
  { rule: "Character limit", detail: "Aim for 150-300 characters. Hard cap ~400 characters. Tooltip/hover context: ~220 characters." },
  { rule: "Clinical language", detail: "Use full disease names for primary conditions (Diabetes Mellitus, Hypertension, Carcinoma). Abbreviations OK for secondary context (NVD, LSCS, OD, BD). Avoid shorthand like DM/HTN in the main summary." },
  { rule: "Signal words for urgency", detail: "Use 'Critical', 'Declining', 'Trending up', 'Overdue', 'Flagged', 'Abnormal' to draw attention." },
  { rule: "No empty mentions", detail: "Never say 'No allergies', 'No family history'. If data is absent, simply skip that section." },
  { rule: "Self-reported labeling", detail: "When data comes from symptom collector (not verified EMR), prefix with 'Self-reported' or 'Patient reports'." },
  { rule: "Date formatting", detail: "Use short date format — '27 Jan', '15 Feb'. Include year only if different from current year." },
  { rule: "Medication format", detail: "Drug name + strength + frequency. E.g., 'Metformin 500mg BD'. Max 3 key meds. If more, say '+ 2 others'." },
  { rule: "Specialty context framing", detail: "Frame chronic conditions in specialty context. E.g., Ophthal: 'DM (8yr) — for fundus screening'." },
  { rule: "New patient identification", detail: "When isNewPatient is true, always begin with 'New patient.' to prime the doctor's expectations." },
  { rule: "Follow-up context", detail: "For follow-up appointments, include what the follow-up is for and whether it is overdue." },
  { rule: "No data dumping", detail: "Never list all labs, all vitals, or all past visits. Summarize trends and pick top 2-3 data points." },
  { rule: "Bold key clinical terms", detail: "Bold (**bold**) these in the output: symptom names, chronic disease names, allergy names, medication names, concerning lab values, and any high-risk flags. This helps the doctor's eye catch critical terms instantly." },
  { rule: "No em-dashes", detail: "Do not use em-dashes (—) in the summary. Use commas, periods, or 'and' for sentence flow. E.g., 'Last visited **27 Jan** for **viral fever**, treated with **Paracetamol**' instead of 'Last seen 27 Jan — Rx: Paracetamol'." },
  { rule: "Simplify qualifiers", detail: "Avoid verbose qualifiers like 'evening spikes', 'night worsening'. Use severity (mild/moderate/severe) or omit if not clinically significant. E.g., 'fever (3d, moderate)' not 'fever (3d, evening spikes)'." },
  { rule: "Last visit format", detail: "Use 'Last visited **[date]** for **[diagnosis]**, treated with **[key meds]**'. Bold the date, diagnosis/symptom, and medication names. Not 'Last seen [date] — Dx: X, Rx: Y'." },
  { rule: "Hallucination prevention", detail: "NEVER infer, assume, or fabricate data that is not explicitly present in the source. If a field is missing, skip it entirely. If all data is missing, show the appropriate fallback (e.g., 'New patient — no prior records available.'). Better to show less than to hallucinate." },
  { rule: "Minimize unnecessary detail", detail: "Don't add qualifiers unless clinically relevant. '1 week' duration is fine if needed — but avoid 'evening spikes', 'night worsening' unless they change the clinical picture. If extra detail is important for the doctor to notice, include it even if 4-5 extra words. If not, omit." },
  { rule: "No digital data fallback", detail: "When only images/scans exist (no structured digital data), disable the AI summary tooltip. Show: 'No digitized record available.' For Pending Digitisation status, hide the AI summary section entirely." },
  { rule: "RX mode awareness", detail: "Draft checklist is only applicable for Point-and-Click RX. For Voice RX: show 'Draft — voice prescription in progress.' For Template/other RX modes: show 'Draft — in progress.' The info/tooltip icon should be disabled when checklist is not applicable." },
]

const BACKEND_ALGORITHM = `onAppointmentOpen(patientId, appointmentId):

  // ─── Step 1: Fetch all applicable data sources ───
  demographics   = fetchPatientDemographics(patientId)
  appointmentCtx = fetchAppointmentContext(appointmentId)
  medicalHistory = fetchMedicalHistory(patientId)
  pastVisits     = fetchPastVisits(patientId, limit=5)
  vitalsHistory  = fetchVitalsHistory(patientId)
  labResults     = fetchLabResults(patientId)
  symptomData    = fetchSymptomCollector(appointmentId)
  currentVitals  = fetchCurrentVisitVitals(appointmentId)
  specialtyData  = fetchSpecialtyData(patientId, appointmentCtx.specialty)
  rxPadState     = fetchRxPadState(appointmentId)  // for finished/draft

  // ─── Step 2: Route by appointment status ───
  switch (appointmentCtx.status):
    case 'queue':        return buildPreConsultSummary(...)
    case 'finished':     return buildPostConsultSummary(rxPadState, ...)
    case 'cancelled':    return buildCancellationSummary(appointmentCtx, ...)
    case 'draft':        return buildDraftSummary(rxPadState, ...)
    case 'pending_digi': return { shortSummary: null, showAI: false }

  // ─── Pre-consultation summary (Queue) ───
  buildPreConsultSummary(data):
    summary = normalizeToCanonicalSummary(data)
    visibleDomains = filterBySpecialty(summary, specialty)
    riskSignals = deriveRiskSignals(summary)
    sentences = []
    if (riskSignals.hasCritical) → append critical alert
    if (symptomCollector)        → append symptom opener
    if (chronicConditions)       → append chronic statement
    if (drugAllergies)           → append allergy mention
    if (activeMeds)              → append med snapshot (max 3)
    if (lastVisit)               → append last visit one-liner
    if (empty + newPatient)      → append fallback message
    if (!symptomCollector && !newPatient) → append missing intake note
    return { shortSummary: sentences.join(' '), riskSignals, visibleDomains }

  // ─── Post-consultation summary (Finished) ───
  buildPostConsultSummary(rxPadState):
    sentences = []
    sentences.push(formatChiefComplaint(rxPadState.symptoms))
    sentences.push(formatDiagnosis(rxPadState.diagnosis))
    sentences.push(formatPrescription(rxPadState.medications))
    if (rxPadState.investigations) → append investigations
    if (rxPadState.advice)         → append key advice
    if (rxPadState.followUp)       → append follow-up plan
    return { shortSummary: sentences.join(' ') }

  // ─── Cancellation summary ───
  buildCancellationSummary(appointmentCtx):
    sentences = []
    sentences.push(formatAppointmentPurpose(appointmentCtx))
    sentences.push(formatCancellationReason(appointmentCtx.cancelReason))
    if (appointmentCtx.rescheduledTo) → append reschedule info
    if (patientHasPendingFollowUp)    → append pending context
    return { shortSummary: sentences.join(' ') }

  // ─── Draft summary ───
  buildDraftSummary(rxPadState):
    filled = getSectionsWithData(rxPadState)
    pending = getSectionsWithoutData(rxPadState)
    sentences = ["Draft consultation."]
    sentences.push("Filled: " + summarizeFilledSections(filled))
    sentences.push("Pending: " + pending.join(', '))
    if (patientChronicConditions) → append context reminder
    return { shortSummary: sentences.join(' ') }`

const ACCEPTANCE_CRITERIA = [
  { criterion: "Never fails on missing data", detail: "Summary generation must gracefully handle any combination of missing sources. No null reference errors, no empty outputs." },
  { criterion: "Specialty auto-filtering", detail: "Irrelevant specialty domains are suppressed automatically. Supported: GP, Ophthal, Gynec, Obstetric, Pediatrics." },
  { criterion: "Strict sentence ordering", detail: "Critical alerts → Symptoms → Chronic/concerning → Allergies → Meds → Last visit. Order must never be shuffled." },
  { criterion: "New patient fallback", detail: "When both history AND symptom collector are absent, output explicit 'New patient' message with next-action recommendations." },
  { criterion: "No empty sections in payload", detail: "If a data domain has no data, it is omitted entirely. No empty labels, no placeholder stubs, no 'N/A' values." },
  { criterion: "Critical values surfaced first", detail: "Critical vitals (BP, SpO₂) and critical lab flags appear at the very beginning, before symptoms." },
  { criterion: "Character limit respected", detail: "Short summary stays within 150-400 chars. Tooltip/hover contexts capped at ~220 characters." },
  { criterion: "Self-reported data labeled", detail: "Data from symptom collector is clearly distinguished from verified EMR data." },
  { criterion: "Follow-up overdue flagged", detail: "If appointment is a follow-up and overdue, flag 'Follow-up overdue Xd' prominently." },
  { criterion: "Max 3 medications listed", detail: "Active medications capped at 3. Excess indicated with '+ N others'." },
  { criterion: "Status-aware summary routing", detail: "Queue → pre-consult summary. Finished → post-consult summary. Cancelled → cancellation summary. Draft → completeness snapshot. Pending Digitisation → no AI summary." },
  { criterion: "Hover summary consistency", detail: "Appointment list hover tooltip uses the same summary logic but respects ~220 char cap." },
]

// ── PDF Download Logic ────────────────────────────────────────

function generatePdfContent(): string {
  const lines: string[] = []
  const hr = "═".repeat(80)
  const thinHr = "─".repeat(80)

  lines.push(hr)
  lines.push("PATIENT SHORT SUMMARY GENERATION — COMPLETE SPECIFICATION")
  lines.push("Dr. Agent — TatvaPractice EMR")
  lines.push(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`)
  lines.push(hr)
  lines.push("")

  // 1. Overview
  lines.push("1) CORE OUTCOME")
  lines.push(thinHr)
  lines.push("Primary output: 2-4 sentence short summary text for rapid clinical scan.")
  lines.push("Secondary output: Optional structured summary sections/cards for drill-down.")
  lines.push("UX target: Doctor understands risk + context in under ~5 seconds.")
  lines.push("Trigger: Generated automatically when a patient appointment is opened.")
  lines.push("")

  // 2. Data Sources
  lines.push("2) INPUT DATA SOURCES — FETCH CHECKLIST")
  lines.push(thinHr)
  lines.push("")
  lines.push("A) Historical Clinical Data:")
  SOURCE_CHECKLIST.historical.forEach(s => lines.push(`   • ${s.item} — ${s.detail}`))
  lines.push("")
  lines.push("B) Current Encounter Data:")
  SOURCE_CHECKLIST.currentEncounter.forEach(s => lines.push(`   • ${s.item} — ${s.detail}`))
  lines.push("")
  lines.push("C) Identity & Meta:")
  SOURCE_CHECKLIST.identity.forEach(s => lines.push(`   • ${s.item} — ${s.detail}`))
  lines.push("")

  // 3. Medical History
  lines.push("3) MEDICAL HISTORY — FIELD BREAKDOWN & PRIORITY")
  lines.push(thinHr)
  lines.push("Priority hierarchy: Chronic Conditions → Allergies → Surgical History → Family → Lifestyle → Additional")
  lines.push("")
  MEDICAL_HISTORY_BREAKDOWN.forEach(f => {
    lines.push(`   [${f.priority}] ${f.field}`)
    lines.push(`   ${f.description}`)
    lines.push(`   Rule: ${f.summaryRule}`)
    lines.push(`   Example: ${f.example}`)
    lines.push("")
  })

  // 4. Specialty Rules
  lines.push("4) SPECIALTY RELEVANCE GUARDRAILS")
  lines.push(thinHr)
  lines.push("Supported specialties: GP, Ophthalmology, Gynecology, Obstetrics, Pediatrics")
  lines.push("")
  SPECIALTY_RULES.forEach(r => {
    lines.push(`   ${r.specialty}`)
    lines.push(`   Include: ${r.include.join(", ")}`)
    lines.push(`   Hide: ${r.hide.join(", ")}`)
    lines.push(`   Data fields: ${r.dataFields}`)
    lines.push(`   Short summary: ${r.shortSummaryFocus}`)
    lines.push("")
  })

  // 5. Composition Order
  lines.push("5) SHORT SUMMARY COMPOSITION — STRICT ORDER")
  lines.push(thinHr)
  SUMMARY_COMPOSITION_ORDER.forEach(s => {
    lines.push(`   Step ${s.step}: ${s.label}`)
    lines.push(`   Condition: ${s.condition}`)
    lines.push(`   Rule: ${s.rule}`)
    lines.push(`   Template: ${s.template}`)
    lines.push(`   Fallback: ${s.fallback}`)
    lines.push("")
  })

  // 6. Sentence Formation Patterns
  lines.push("6) SENTENCE FORMATION PATTERNS")
  lines.push(thinHr)
  lines.push('   Pattern A — Symptom opener: "Presents with [symptom] ([duration], [qualifier])."')
  lines.push('   Pattern B — Chronic statement: "Known case of [Condition] ([duration])."')
  lines.push('   Pattern C — Allergy mention: "Allergic to [Drug]."')
  lines.push('   Pattern D — Med snapshot: "On [Med1 dose freq], [Med2 dose freq]." (max 3)')
  lines.push('   Pattern E — Last visit: "Last seen [date] for [complaint] — Dx: [diagnosis], Rx: [treatment]."')
  lines.push('   Pattern F — Critical alert: "BP 70/60 (critical low), SpO₂ 93% (declining)."')
  lines.push('   Pattern G — New patient: "New patient." (prepended)')
  lines.push('   Pattern H — Specialty openers:')
  lines.push('     Obstetric: "G2P1L1A0, LMP [date], EDD [date], currently [X]wk."')
  lines.push('     Ophthal: "Last VA: R 6/9, L 6/12. IOP: R 16, L 18 mmHg."')
  lines.push('     Pediatric: "Weight: 12kg (25th percentile). Vaccines up to date."')
  lines.push('     Gynec: "Cycle: irregular, 45d interval, moderate flow."')
  lines.push("")

  // 7. Agent Examples
  lines.push("7) AGENT RESPONSE EXAMPLES")
  lines.push(thinHr)
  SENTENCE_FORMATION_EXAMPLES.forEach(ex => {
    lines.push(`   [${ex.specialty}] ${ex.scenario}`)
    lines.push(`   Data: ${ex.availableData.join(", ") || "None"}`)
    lines.push(`   Output: ${ex.agentOutput}`)
    lines.push(`   Reasoning: ${ex.reasoning}`)
    lines.push("")
  })

  // 8. Data Scenarios
  lines.push("8) DATA AVAILABILITY SCENARIOS — ALL PERMUTATIONS")
  lines.push(thinHr)
  MISSING_DATA_SCENARIOS.forEach(sc => {
    lines.push(`   ${sc.case}: ${sc.title} [${sc.badge}]`)
    lines.push(`   ${sc.description}`)
    lines.push(`   Behavior: ${sc.behavior}`)
    lines.push(`   Example: ${sc.exampleOpener}`)
    lines.push("")
  })

  // 9. Appointment Status Summaries
  lines.push("9) APPOINTMENT STATUS-BASED SUMMARY LOGIC")
  lines.push(thinHr)
  APPOINTMENT_STATUS_SUMMARIES.forEach(s => {
    lines.push(`   [${s.status}] — ${s.summaryType}`)
    lines.push(`   ${s.description}`)
    lines.push(`   Behavior: ${s.behavior}`)
    lines.push(`   Data used: ${s.dataUsed}`)
    lines.push(`   Hover: ${s.hoverSummary}`)
    if (s.compositionOrder) {
      lines.push("   Composition order:")
      s.compositionOrder.forEach(c => lines.push(`     ${c}`))
    }
    lines.push(`   Example: ${s.exampleOutput}`)
    lines.push("")
  })

  // 10. Response Rules
  lines.push("10) AGENT RESPONSE FORMATTING RULES")
  lines.push(thinHr)
  AGENT_RESPONSE_RULES.forEach((r, i) => {
    lines.push(`   ${i + 1}. ${r.rule}: ${r.detail}`)
  })
  lines.push("")

  // 11. Algorithm
  lines.push("11) BACKEND ALGORITHM (PSEUDOCODE)")
  lines.push(thinHr)
  lines.push(BACKEND_ALGORITHM)
  lines.push("")

  // 12. Acceptance Criteria
  lines.push("12) ACCEPTANCE CRITERIA")
  lines.push(thinHr)
  ACCEPTANCE_CRITERIA.forEach((c, i) => {
    lines.push(`   ${i + 1}. ${c.criterion}: ${c.detail}`)
  })
  lines.push("")
  lines.push(hr)
  lines.push("END OF SPECIFICATION")
  lines.push(hr)

  return lines.join("\n")
}

// ── Sub-Components ────────────────────────────────────────────

/** Renders text with **bold** markdown as <strong> tags — same color, only weight changes */
function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

/** Renders multiline text (with \n) where each line gets **bold** parsing */
function RichBlock({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n")
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i}><RichText text={line} /></div>
      ))}
    </div>
  )
}

/** Renders draft checklist — ✓ lines in green, ✗ lines in red, timestamp lines as tertiary */
function DraftBlock({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n")
  return (
    <div className={className}>
      {lines.map((line, i) => {
        if (line.startsWith("✗")) {
          return <div key={i} className="text-red-600 font-medium"><RichText text={line} /></div>
        }
        if (line.startsWith("✓")) {
          return <div key={i} className="text-emerald-600 font-medium"><RichText text={line} /></div>
        }
        if (line.startsWith("Last modified") || line.startsWith("Cancelled at")) {
          return <div key={i} className="mt-1 text-[9px] text-slate-400 italic"><RichText text={line} /></div>
        }
        return <div key={i}><RichText text={line} /></div>
      })}
    </div>
  )
}

/** Renders cancelled summary — headings bold, timestamp as tertiary text at bottom */
function CancelledBlock({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n")
  return (
    <div className={className}>
      {lines.map((line, i) => {
        if (line.startsWith("Cancelled at")) {
          return <div key={i} className="mt-1 text-[9px] text-slate-400 italic">{line}</div>
        }
        return <div key={i}><RichText text={line} /></div>
      })}
    </div>
  )
}

function SectionCard({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-[14px] font-bold text-slate-800">{title}</h3>
      {children}
    </section>
  )
}

function PriorityBadge({ priority, color }: { priority: string; color: string }) {
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: color }}>
      {priority}
    </span>
  )
}

function DataAvailBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: color, color }}>
      {label}
    </span>
  )
}

function MiniNav({ items, activeId, onSelect }: { items: { id: string; label: string }[]; activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors ${
            activeId === item.id ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ status, color, icon }: { status: string; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
        {icon}
      </span>
      <span className="text-[12px] font-bold" style={{ color }}>{status}</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────

export default function PatientSummaryLogicTab() {
  const [activeExample, setActiveExample] = useState(0)
  const [activeScenario, setActiveScenario] = useState(0)
  const [activeStatus, setActiveStatus] = useState(0)

  const handleDownloadPdf = useCallback(() => {
    const content = generatePdfContent()
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `patient-summary-generation-spec-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="space-y-8">
      {/* ── Hero / Overview ── */}
      <section className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-violet-50/40 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">Patient Short Summary Generation — Complete Specification</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              End-to-end documentation for backend developers on how the Dr. Agent summarizing agent generates short patient summaries.
              Covers data fetching, medical history decomposition, sentence formation logic, specialty-aware filtering,
              all permutation scenarios (including zero-data), appointment status-based summaries, and the exact rules the agent must follow.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="ml-4 shrink-0 flex items-center gap-1.5 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Spec
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Backend-first spec", "Specialty-aware", "Missing-data safe", "Sentence formation rules", "Permutation coverage", "Status-aware summaries", "Hover tooltip logic"].map((tag) => (
            <span key={tag} className="rounded-full border border-blue-200/60 bg-white px-2 py-0.5 text-[10px] font-medium text-blue-700">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Section Nav ── */}
      <div className="sticky top-[120px] z-10 -mx-1 rounded-lg bg-white/90 px-1 py-2 backdrop-blur-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { id: "sec-overview", label: "1. Overview" },
            { id: "sec-flow-diagram", label: "Visual Flow" },
            { id: "sec-sources", label: "2. Data Sources" },
            { id: "sec-medical-history", label: "3. Medical History" },
            { id: "sec-specialty", label: "4. Specialty Rules" },
            { id: "sec-composition", label: "5. Composition Order" },
            { id: "sec-formation", label: "6. Sentence Formation" },
            { id: "sec-examples", label: "7. Agent Examples" },
            { id: "sec-scenarios", label: "8. Data Scenarios" },
            { id: "sec-status", label: "9. Status Summaries" },
            { id: "sec-response-rules", label: "10. Response Rules" },
            { id: "sec-algorithm", label: "11. Algorithm" },
            { id: "sec-acceptance", label: "12. Acceptance" },
          ].map((nav) => (
            <a
              key={nav.id}
              href={`#${nav.id}`}
              className="rounded-full px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {nav.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── 1. Core Overview ── */}
      <SectionCard id="sec-overview" title="1) Core Outcome">
        <div className="space-y-2 text-[11px] text-slate-600">
          <p><strong>Primary output:</strong> A concise 2-4 sentence short summary text for rapid clinical scan by the doctor.</p>
          <p><strong>Secondary output:</strong> Optional structured summary sections/cards for drill-down (vitals card, lab card, etc.).</p>
          <p><strong>UX target:</strong> Doctor must understand patient risk + context in under ~5 seconds of reading.</p>
          <p><strong>Trigger:</strong> Generated automatically when a patient appointment is opened in TatvaPractice EMR.</p>
          <p><strong>Hover tooltip:</strong> Same summary logic used when hovering over patient row in appointment listing page (~220 char cap).</p>
          <p><strong>Status-aware:</strong> Summary content changes based on appointment status (Queue, Finished, Cancelled, Draft, Pending Digitisation).</p>
        </div>
        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
          <p className="text-[11px] font-semibold text-violet-700">Key principle</p>
          <p className="mt-1 text-[10px] text-violet-600">
            The summary is not a data dump. It is a clinically intelligent distillation that highlights what the doctor
            needs to know RIGHT NOW — risk factors, current symptoms, and medication context. Everything else is available
            via drill-down cards.
          </p>
        </div>
      </SectionCard>

      {/* ── Visual Flow Diagram ── */}
      <SectionCard id="sec-flow-diagram" title="How It Works — Visual Flow">
        <p className="mb-4 text-[11px] text-slate-500">
          End-to-end pipeline from appointment open to summary output. The path taken depends on the current appointment status.
        </p>

        {/* ── Top Row: Trigger → Status Check ── */}
        <div className="mb-5 flex items-center gap-2">
          {/* Trigger */}
          <div className="shrink-0 rounded-xl border border-violet-300 bg-violet-50 px-4 py-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">Trigger</p>
            <p className="text-[11px] font-semibold text-violet-700">Appointment Opened</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center text-slate-400">
            <div className="h-px w-6 bg-slate-300" />
            <span className="text-[13px]">&#9654;</span>
          </div>

          {/* Decision */}
          <div className="shrink-0 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500">Decision</p>
            <p className="text-[11px] font-semibold text-amber-700">Check Appointment Status</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center text-slate-400">
            <div className="h-px w-6 bg-slate-300" />
            <span className="text-[13px]">&#9654;</span>
          </div>

          {/* Branch label */}
          <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <p className="text-[10px] font-semibold text-slate-500">5 Status Branches &#8595;</p>
          </div>
        </div>

        {/* ── Branch Paths Grid ── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          {/* ── Queue (Primary) ── */}
          <div className="flex flex-col rounded-xl border border-blue-200 bg-blue-50/60">
            <div className="rounded-t-xl bg-blue-100 px-3 py-2 text-center">
              <span className="inline-block rounded-full bg-blue-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Queue</span>
              <p className="mt-1 text-[9px] text-blue-500">Primary path</p>
            </div>
            <div className="flex flex-1 flex-col gap-0 px-2.5 py-2">
              {[
                "Fetch Data Sources",
                "Medical History Breakdown",
                "Specialty Relevance Filter",
                "Sentence Formation (2-4 lines)",
                "Short Summary Output",
              ].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <div className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-center">
                    <p className="text-[10px] font-medium text-blue-700">{step}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex justify-center py-0.5 text-[11px] text-blue-300">&#8595;</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── Finished ── */}
          <div className="flex flex-col rounded-xl border border-green-200 bg-green-50/60">
            <div className="rounded-t-xl bg-green-100 px-3 py-2 text-center">
              <span className="inline-block rounded-full bg-green-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Finished</span>
            </div>
            <div className="flex flex-1 flex-col gap-0 px-2.5 py-2">
              <div className="rounded-lg border border-green-200 bg-white px-2.5 py-1.5 text-center">
                <p className="text-[10px] font-medium text-green-700">Pull RxPad Data</p>
              </div>
              <div className="flex justify-center py-0.5 text-[11px] text-green-300">&#8595;</div>
              <div className="rounded-lg border border-green-200 bg-white px-2.5 py-1.5">
                <p className="mb-1 text-center text-[10px] font-semibold text-green-700">Structured Labels</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {["Came for", "Diagnosed", "Prescribed", "Lab-Inv", "Follow-up"].map((l) => (
                    <span key={l} className="rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[8px] font-medium text-green-600">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Cancelled ── */}
          <div className="flex flex-col rounded-xl border border-red-200 bg-red-50/60">
            <div className="rounded-t-xl bg-red-100 px-3 py-2 text-center">
              <span className="inline-block rounded-full bg-red-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Cancelled</span>
            </div>
            <div className="flex flex-1 flex-col gap-0 px-2.5 py-2">
              <div className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-center">
                <p className="text-[10px] font-medium text-red-700">Pull Cancellation Data</p>
              </div>
              <div className="flex justify-center py-0.5 text-[11px] text-red-300">&#8595;</div>
              <div className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5">
                <p className="mb-1 text-center text-[10px] font-semibold text-red-700">Structured Labels</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {["Type", "Reason", "Rescheduled", "Cancelled at"].map((l) => (
                    <span key={l} className="rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[8px] font-medium text-red-600">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Draft ── */}
          <div className="flex flex-col rounded-xl border border-amber-200 bg-amber-50/60">
            <div className="rounded-t-xl bg-amber-100 px-3 py-2 text-center">
              <span className="inline-block rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Draft</span>
            </div>
            <div className="flex flex-1 flex-col gap-0 px-2.5 py-2">
              <div className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-center">
                <p className="text-[10px] font-medium text-amber-700">Check RxPad Fill State</p>
              </div>
              <div className="flex justify-center py-0.5 text-[11px] text-amber-300">&#8595;</div>
              <div className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5">
                <p className="mb-1 text-center text-[10px] font-semibold text-amber-700">Checklist</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {["\u2713 Filled", "\u2717 Empty"].map((l) => (
                    <span key={l} className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[8px] font-medium text-amber-600">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Pending Digitisation ── */}
          <div className="flex flex-col rounded-xl border border-purple-200 bg-purple-50/60">
            <div className="rounded-t-xl bg-purple-100 px-3 py-2 text-center">
              <span className="inline-block rounded-full bg-purple-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Pending Dig.</span>
            </div>
            <div className="flex flex-1 flex-col gap-0 px-2.5 py-2">
              <div className="rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-center">
                <p className="text-[10px] font-medium text-purple-700">No AI Summary</p>
              </div>
              <div className="flex justify-center py-0.5 text-[11px] text-purple-300">&#8595;</div>
              <div className="rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-center">
                <p className="text-[10px] font-medium text-purple-700">Status indicator only</p>
              </div>
            </div>
          </div>

        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Legend:</span>
          {[
            { color: "bg-violet-400", label: "Trigger" },
            { color: "bg-amber-400", label: "Decision" },
            { color: "bg-blue-400", label: "Queue (primary)" },
            { color: "bg-green-400", label: "Finished" },
            { color: "bg-red-400", label: "Cancelled" },
            { color: "bg-amber-400", label: "Draft" },
            { color: "bg-purple-400", label: "Pending Dig." },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1 text-[9px] text-slate-500">
              <span className={`inline-block h-2 w-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* ── 2. Data Sources (Fetch Checklist) ── */}
      <SectionCard id="sec-sources" title="2) Input Data Sources — Fetch Checklist">
        <p className="mb-3 text-[11px] text-slate-500">
          When an appointment is opened, backend must attempt to fetch ALL applicable sources. Data may be partial — fetching must never fail if a source is unavailable.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(SOURCE_CHECKLIST).map(([key, items]) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h4 className="mb-2 text-[11px] font-bold text-slate-700 capitalize">
                {key === "historical" ? "A) Historical Clinical Data" : key === "currentEncounter" ? "B) Current Encounter Data" : "C) Identity & Meta"}
              </h4>
              <ul className="space-y-1.5">
                {items.map((s) => (
                  <li key={s.item} className="text-[10px]">
                    <span className="font-semibold text-slate-700">{s.item}</span>
                    <span className="text-slate-500"> — {s.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-semibold text-amber-700">Important: You will rarely get all data</p>
          <p className="mt-0.5 text-[10px] text-amber-600">
            Most patients will have partial data. The summary agent must handle every permutation gracefully — see Section 8 for all scenarios.
          </p>
        </div>
      </SectionCard>

      {/* ── 3. Medical History Breakdown ── */}
      <SectionCard id="sec-medical-history" title="3) Medical History — Field Breakdown & Priority">
        <p className="mb-3 text-[11px] text-slate-500">
          Medical history consists of distinct sub-fields, each with a different priority level for the short summary.
        </p>
        <div className="space-y-3">
          {MEDICAL_HISTORY_BREAKDOWN.map((field) => (
            <div key={field.field} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={field.priority} color={field.color} />
                <h4 className="text-[12px] font-bold text-slate-800">{field.field}</h4>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-600">{field.description}</p>
              <div className="mt-2 rounded border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                <p className="text-[10px] font-semibold text-slate-700">Summary inclusion rule:</p>
                <p className="text-[10px] text-slate-600">{field.summaryRule}</p>
              </div>
              <div className="mt-1.5 rounded border border-blue-100 bg-blue-50 px-2.5 py-1.5">
                <p className="text-[10px] text-blue-600"><span className="font-semibold">Example:</span> {field.example}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-[10px] font-bold text-red-700">Priority Hierarchy for Short Summary</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="rounded-full bg-red-500 px-2 py-0.5 font-bold text-white">1. Chronic Conditions</span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-amber-500 px-2 py-0.5 font-bold text-white">2. Allergies</span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-amber-500 px-2 py-0.5 font-bold text-white">3. Surgical History</span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-violet-500 px-2 py-0.5 font-bold text-white">4. Family</span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-violet-500 px-2 py-0.5 font-bold text-white">5. Lifestyle</span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-slate-400 px-2 py-0.5 font-bold text-white">6. Additional</span>
          </div>
        </div>
      </SectionCard>

      {/* ── 4. Specialty Relevance Rules ── */}
      <SectionCard id="sec-specialty" title="4) Specialty Relevance Guardrails">
        <p className="mb-3 text-[11px] text-slate-500">
          Not all data domains are relevant for all specialties. Supported specialties: <strong>GP, Ophthalmology, Gynecology, Obstetrics, Pediatrics</strong>.
        </p>
        <div className="space-y-3">
          {SPECIALTY_RULES.map((rule) => (
            <div key={rule.specialty} className="rounded-lg border border-slate-200 p-3">
              <h4 className="text-[12px] font-bold text-violet-700">{rule.specialty}</h4>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded border border-green-200 bg-green-50 px-2.5 py-2">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-green-700">Prioritize / Include</p>
                  <ul className="space-y-0.5 text-[10px] text-green-800">
                    {rule.include.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
                <div className="rounded border border-red-200 bg-red-50 px-2.5 py-2">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-red-700">Hide by Default</p>
                  <ul className="space-y-0.5 text-[10px] text-red-800">
                    {rule.hide.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-2 rounded border border-blue-100 bg-blue-50 px-2.5 py-1.5">
                <p className="text-[10px] font-semibold text-blue-700">Sidebar data fields available:</p>
                <p className="text-[10px] text-blue-600">{rule.dataFields}</p>
              </div>
              <div className="mt-1.5 rounded border border-violet-100 bg-violet-50 px-2.5 py-1.5">
                <p className="text-[10px] font-semibold text-violet-700">Short summary focus:</p>
                <p className="text-[10px] text-violet-600">{rule.shortSummaryFocus}</p>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500"><span className="font-semibold">Note:</span> {rule.priorityNote}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
          <p className="text-[10px] font-semibold text-violet-700">Universal rule</p>
          <p className="mt-0.5 text-[10px] text-violet-600">
            If a data domain has no data OR is specialty-irrelevant, do NOT render it at all. No empty placeholders, no &quot;N/A&quot;.
          </p>
        </div>
      </SectionCard>

      {/* ── 5. Summary Composition Order ── */}
      <SectionCard id="sec-composition" title="5) Short Summary Composition — Strict Ordering">
        <p className="mb-3 text-[11px] text-slate-500">
          The short summary must follow this exact sequence. Each step is conditional — include only if data exists.
        </p>
        <div className="space-y-3">
          {SUMMARY_COMPOSITION_ORDER.map((step) => (
            <div key={step.step} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                  {step.step}
                </span>
                <h4 className="text-[12px] font-bold text-slate-800">{step.label}</h4>
              </div>
              <div className="mt-2 ml-8 space-y-1.5">
                <p className="text-[10px] text-slate-500"><span className="font-semibold text-slate-700">Condition:</span> {step.condition}</p>
                <p className="text-[10px] text-slate-600"><span className="font-semibold text-slate-700">Rule:</span> {step.rule}</p>
                <div className="rounded border border-blue-100 bg-blue-50 px-2.5 py-1.5">
                  <p className="text-[10px] font-mono text-blue-700">{step.template}</p>
                </div>
                <p className="text-[10px] text-amber-600"><span className="font-semibold">Fallback:</span> {step.fallback}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold text-slate-700">Critical alert exception</p>
          <p className="mt-0.5 text-[10px] text-slate-600">
            If critical vitals or lab values are detected (e.g., BP 70/60, SpO₂ &lt; 94%), they are prepended BEFORE step 1.
          </p>
        </div>
      </SectionCard>

      {/* ── 6. Sentence Formation Logic ── */}
      <SectionCard id="sec-formation" title="6) Sentence Formation — How the Agent Composes Text">
        <p className="mb-3 text-[11px] text-slate-500">
          The agent constructs natural clinical sentences following these patterns.
        </p>
        <div className="space-y-4">
          {[
            { id: "A", title: "Opening with symptoms", template: '"Presents with **[symptom1]** ([duration], [severity]) and **[symptom2]** ([duration])."', examples: ['"Presents with **fever** (3d, moderate) and **dry cough** (2d)."', '"Presents with **irregular periods** (3mo) and **lower abdominal pain** (1wk)."'] },
            { id: "B", title: "Chronic condition statement", template: '"Known case of **[Full Disease Name]** ([duration]) and **[Full Disease Name]** ([duration])."', examples: ['"Known case of **Diabetes Mellitus** (1yr) and **Hypertension** (6mo)."', '"Known case of **PCOS** (2yr) and **Hypothyroid** (1yr)."'] },
            { id: "C", title: "Allergy mention", template: '"**Allergic to [Drug].** / Known **allergies: [Drug1]**, [Food/Env]."', examples: ['"**Allergic to Sulfonamides.**"', '"Known **allergies: Penicillin**, Dust, Egg."'] },
            { id: "D", title: "Medication snapshot", template: '"On **[Med1]** dose freq, **[Med2]** dose freq." / "On **[Med1]**, **[Med2]** + 3 others."', examples: ['"On **Metformin** 500mg BD, **Amlodipine** 5mg OD."'] },
            { id: "E", title: "Last visit one-liner", template: '"Last visited **[date]** for **[diagnosis/complaint]**, treated with **[key meds]**."', examples: ['"Last visited **27 Jan** for **viral fever**, treated with **Paracetamol**, **Cetirizine**."', '"Last visited **10 Jan**, **USG** normal, **TSH** slightly elevated."'] },
            { id: "F", title: "Critical alert prefix", template: '"**BP 70/60 (critical low)**, **SpO₂ 93% (declining)**."', examples: ['Prepended before all other content. Critical values always bolded.'] },
            { id: "G", title: "New patient identifier", template: '"New patient." (prepended when isNewPatient = true)', examples: ['Always start with this if no prior visit records.'] },
            { id: "H", title: "Specialty-specific openers", template: "Varies by specialty", examples: ['Obstetric: "G2P1L1A0, LMP 15 Sep, EDD 22 Jun, currently 26wk."', 'Ophthal: "Last VA: R 6/9, L 6/12. IOP: R 16, L 18 mmHg."', 'Pediatric: "Weight: 12kg (25th percentile). **Vaccines up to date.**"', 'Gynec: "Cycle: irregular, 45d interval, moderate flow (3 pads/day)."'] },
          ].map((pattern) => (
            <div key={pattern.id} className="rounded-lg border border-slate-200 p-3">
              <h4 className="text-[11px] font-bold text-slate-800">Pattern {pattern.id} — {pattern.title}</h4>
              <div className="mt-2 rounded bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-700">
                <RichText text={pattern.template} />
              </div>
              <ul className="mt-1.5 space-y-0.5 text-[10px] text-slate-600">
                {pattern.examples.map((ex) => <li key={ex}>• <RichText text={ex} /></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-[10px] font-bold text-green-700">Full sentence assembly</p>
          <div className="mt-1.5 rounded bg-white px-3 py-2 font-mono text-[10px] leading-relaxed text-slate-700">
            [Critical alert] + [New patient tag] + [Symptoms] + [Chronic conditions] + [Drug allergy] + [Key meds] + [Last visit] + [Missing data note]
          </div>
        </div>
      </SectionCard>

      {/* ── 7. Agent Response Examples ── */}
      <SectionCard id="sec-examples" title="7) Agent Response Examples — All Specialty & Data Combinations">
        <p className="mb-3 text-[11px] text-slate-500">
          Interactive examples showing exactly how the agent composes summary text for different scenarios.
        </p>
        <MiniNav
          items={SENTENCE_FORMATION_EXAMPLES.map((ex, i) => ({ id: String(i), label: ex.scenario.split(" — ")[0] }))}
          activeId={String(activeExample)}
          onSelect={(id) => setActiveExample(Number(id))}
        />
        <div className="mt-3">
          {(() => {
            const ex = SENTENCE_FORMATION_EXAMPLES[activeExample]
            return (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-[12px] font-bold text-slate-800">{ex.scenario}</h4>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-semibold text-violet-700">{ex.specialty}</span>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold text-slate-500">Available data sources:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ex.availableData.length > 0 ? ex.availableData.map((d) => (
                      <span key={d} className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[9px] font-medium text-green-700">{d}</span>
                    )) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-500">None</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-blue-500">Agent output</p>
                  <RichText text={ex.agentOutput} className="mt-1 block text-[11px] leading-relaxed text-blue-800" />
                </div>
                <div className="mt-2 rounded border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                  <p className="text-[10px] text-slate-600"><span className="font-semibold text-slate-700">Why this formation:</span> {ex.reasoning}</p>
                </div>
              </div>
            )
          })()}
        </div>
      </SectionCard>

      {/* ── 8. Data Availability Scenarios ── */}
      <SectionCard id="sec-scenarios" title="8) Data Availability Scenarios — All Permutations">
        <p className="mb-3 text-[11px] text-slate-500">
          Every possible combination of data availability and the exact behavior the agent must follow.
        </p>
        <MiniNav
          items={MISSING_DATA_SCENARIOS.map((s, i) => ({ id: String(i), label: `${s.case}` }))}
          activeId={String(activeScenario)}
          onSelect={(id) => setActiveScenario(Number(id))}
        />
        <div className="mt-3">
          {(() => {
            const sc = MISSING_DATA_SCENARIOS[activeScenario]
            return (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <DataAvailBadge label={sc.badge} color={sc.badgeColor} />
                  <h4 className="text-[12px] font-bold text-slate-800">{sc.title}</h4>
                </div>
                <p className="mt-2 text-[10px] text-slate-600">{sc.description}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">History data</p>
                    <p className="mt-0.5 text-[11px] font-semibold" style={{ color: sc.historyAvailable === true ? "#10B981" : sc.historyAvailable === "partial" ? "#F59E0B" : "#EF4444" }}>
                      {sc.historyAvailable === true ? "Available" : sc.historyAvailable === "partial" ? "Partial" : "Not available"}
                    </p>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Symptom collector</p>
                    <p className="mt-0.5 text-[11px] font-semibold" style={{ color: sc.symptomCollector ? "#10B981" : "#EF4444" }}>
                      {sc.symptomCollector ? "Available" : "Not available"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[10px] font-semibold text-amber-700">Agent behavior</p>
                  <p className="mt-0.5 text-[10px] text-amber-800">{sc.behavior}</p>
                </div>
                <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-blue-500">Example output</p>
                  <RichText text={sc.exampleOpener} className="mt-1 block text-[10px] leading-relaxed text-blue-800" />
                </div>
              </div>
            )
          })()}
        </div>
      </SectionCard>

      {/* ── 9. Appointment Status-Based Summaries ── */}
      <SectionCard id="sec-status" title="9) Appointment Status-Based Summary Logic">
        <p className="mb-3 text-[11px] text-slate-500">
          The summary content and format changes based on the appointment{"'"}s current status. This determines what the doctor sees both inside the appointment AND on the appointment list hover tooltip.
        </p>
        <MiniNav
          items={APPOINTMENT_STATUS_SUMMARIES.map((s, i) => ({ id: String(i), label: s.status }))}
          activeId={String(activeStatus)}
          onSelect={(id) => setActiveStatus(Number(id))}
        />
        <div className="mt-3">
          {(() => {
            const s = APPOINTMENT_STATUS_SUMMARIES[activeStatus]
            return (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={s.status} color={s.color} icon={s.icon} />
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">{s.summaryType}</span>
                </div>
                <p className="mt-2 text-[10px] text-slate-600">{s.description}</p>

                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[10px] font-semibold text-amber-700">Agent behavior</p>
                  <p className="mt-0.5 text-[10px] text-amber-800">{s.behavior}</p>
                </div>

                {s.compositionOrder && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold text-slate-700">Composition order:</p>
                    <ul className="mt-1 space-y-0.5 text-[10px] text-slate-600">
                      {s.compositionOrder.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                )}

                <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-blue-500">Example output</p>
                  {s.status === "Draft" ? (
                    <DraftBlock text={s.exampleOutput} className="mt-1.5 text-[11px] leading-[1.8]" />
                  ) : s.status === "Cancelled" ? (
                    <CancelledBlock text={s.exampleOutput} className="mt-1.5 text-[11px] leading-[1.8] text-blue-900" />
                  ) : (
                    <RichBlock text={s.exampleOutput} className="mt-1.5 text-[11px] leading-[1.8] text-blue-900" />
                  )}
                </div>

                {(s as typeof APPOINTMENT_STATUS_SUMMARIES[1]).exampleNoReason && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Example (no reason recorded)</p>
                    <CancelledBlock text={(s as typeof APPOINTMENT_STATUS_SUMMARIES[2]).exampleNoReason!} className="mt-1.5 text-[10px] leading-[1.8] text-slate-700" />
                  </div>
                )}

                {(s as typeof APPOINTMENT_STATUS_SUMMARIES[3]).exampleMinimal && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Example (minimal data)</p>
                    {s.status === "Draft" ? (
                      <DraftBlock text={(s as typeof APPOINTMENT_STATUS_SUMMARIES[3]).exampleMinimal!} className="mt-1.5 text-[10px] leading-[1.8]" />
                    ) : (
                      <RichBlock text={(s as typeof APPOINTMENT_STATUS_SUMMARIES[3]).exampleMinimal!} className="mt-1.5 text-[10px] leading-[1.8] text-slate-700" />
                    )}
                  </div>
                )}

                {(s as any).rxModeNote && (
                  <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <p className="text-[10px] font-semibold text-orange-700">RX mode applicability</p>
                    <p className="mt-0.5 text-[10px] text-orange-800">{(s as any).rxModeNote}</p>
                  </div>
                )}

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Data used</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{s.dataUsed}</p>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Hover tooltip</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{s.hoverSummary}</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </SectionCard>

      {/* ── 10. Agent Response Rules ── */}
      <SectionCard id="sec-response-rules" title="10) Agent Response Formatting Rules">
        <div className="grid gap-2 sm:grid-cols-2">
          {AGENT_RESPONSE_RULES.map((rule) => (
            <div key={rule.rule} className="rounded-lg border border-slate-200 p-3">
              <p className="text-[11px] font-bold text-slate-800">{rule.rule}</p>
              <p className="mt-1 text-[10px] text-slate-600">{rule.detail}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 11. Backend Algorithm ── */}
      <SectionCard id="sec-algorithm" title="11) Backend Algorithm (Pseudocode)">
        <p className="mb-3 text-[11px] text-slate-500">
          Complete pseudocode including appointment status routing — from appointment open to final payload.
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <pre className="overflow-x-auto whitespace-pre text-[10px] leading-[1.7] text-slate-700">{BACKEND_ALGORITHM}</pre>
        </div>
      </SectionCard>

      {/* ── 12. Acceptance Criteria ── */}
      <SectionCard id="sec-acceptance" title="12) Acceptance Criteria">
        <div className="space-y-2">
          {ACCEPTANCE_CRITERIA.map((item, i) => (
            <div key={item.criterion} className="flex gap-3 rounded-lg border border-slate-200 p-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-[11px] font-bold text-slate-800">{item.criterion}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Canonical Summary Model ── */}
      <SectionCard title="Appendix: Canonical Summary Object Schema">
        <p className="mb-2 text-[11px] text-slate-500">
          All fetched inputs are normalized into this single object before the agent generates narrative text.
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <pre className="overflow-x-auto text-[10px] leading-[1.7] text-slate-700">
{`interface PatientSummaryCanonical {
  // ─── Identity ───
  patient: { name: string; age: number; gender: 'M' | 'F'; uhid: string }
  specialty: string
  appointmentType: 'new' | 'follow-up' | 'walk-in'
  appointmentStatus: 'queue' | 'finished' | 'cancelled' | 'draft' | 'pending_digi'
  isNewPatient: boolean
  isFollowUp: boolean
  followUpOverdueDays?: number

  // ─── Current Encounter ───
  symptomCollector?: {
    symptoms: { name: string; duration: string; severity?: string; qualifiers?: string[] }[]
    questionsToDoctor?: string[]
    selfReportedAllergies?: string[]
    selfReportedMeds?: string[]
  }
  currentVitals?: { bp?: string; spo2?: number; temp?: number; hr?: number; weight?: number; bmi?: number; isCritical?: boolean }

  // ─── Medical History ───
  chronicConditions?: { name: string; duration: string; status: 'active' | 'resolved' }[]
  concerningConditions?: { name: string; detail: string }[]
  allergies?: { drugs: string[]; food: string[]; environmental: string[] }
  surgicalHistory?: { procedure: string; year: string }[]
  familyHistory?: { relation: string; conditions: string[] }[]
  lifestyle?: { habit: string; detail: string }[]

  // ─── Medications & Labs ───
  activeMeds?: { name: string; dose: string; frequency: string }[]
  keyLabs?: { name: string; value: string; unit: string; flag: 'normal'|'high'|'low'|'critical'; previousValue?: string }[]

  // ─── Past Visits ───
  lastVisit?: { date: string; chiefComplaint: string; diagnosis: string; keyTreatment: string; followUpAdvised?: string }

  // ─── Specialty Data ───
  ophthalData?: { vaRight: string; vaLeft: string; nearVaRight?: string; nearVaLeft?: string; iop: string; slitLamp?: string; fundus: string; glassPrescription?: string; anteriorSegment?: { right: string; left: string }; posteriorSegment?: { right: string; left: string } }
  gynecData?: { menarche?: string; cycleType: string; cycleInterval: number; flowVolume: string; padsPerDay?: number; painLevel: string; lmp?: string; lifecycleHormonal?: string }
  obstetricData?: { gravida: number; para: number; living: number; abortion: number; ectopic: number; lmp: string; edd: string; gestationalWeeks: number; pregnancyHistory?: { mod: string; babyWeight: string; remarks: string }[]; examination?: { oedema: string; bmi: string; bp: string } }
  pediatricsData?: { ageDisplay: string; heightCm: number; heightPercentile?: string; weightKg: number; weightPercentile?: string; ofcCm?: number; vaccinesPending: number; vaccinesOverdue: number; overdueVaccineNames?: string[]; milestoneNotes?: string }

  // ─── RxPad State (for finished/draft) ───
  rxPadState?: { symptoms?: string[]; diagnosis?: string; medications?: { name: string; dose: string; frequency: string; duration: string }[]; investigations?: string[]; advice?: string[]; followUp?: string }
  cancellationReason?: string
  rescheduledTo?: string
}`}
          </pre>
        </div>
      </SectionCard>

      {/* ── Reference ── */}
      <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-[10px] font-semibold text-slate-500">Reference documents</p>
        <ul className="mt-1 space-y-0.5 text-[10px] text-slate-600">
          <li>• <code className="text-violet-600">patient-summary-generation-spec.md</code> — Original spec document</li>
          <li>• <code className="text-violet-600">intent-classifier-and-canned-messages.md</code> — Intent classification and pill behavior</li>
          <li>• <code className="text-violet-600">card-data-structuring.md</code> — Card-level data contracts</li>
        </ul>
      </section>
    </div>
  )
}

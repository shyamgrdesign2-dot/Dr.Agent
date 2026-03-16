// ─────────────────────────────────────────────────────────────
// Doctor Agent v0 — Mock Patient Data (7 patients)
// ─────────────────────────────────────────────────────────────

import type { SmartSummaryData, PatientDocument } from "./types"

export const SMART_SUMMARY_BY_CONTEXT: Record<string, SmartSummaryData> = {
  // ═══════════════ 1. SHYAM GR — GP (Viral Fever + DM + HTN) ═══════════════
  "__patient__": {
    specialtyTags: ["General Medicine", "Diabetology"],
    followUpOverdueDays: 5,
    patientNarrative: "Fever since 3 days with evening spikes, dry cough 2 days, eye redness bilateral",
    familyHistory: ["Thyroid (Mom, Aunt)", "Diabetes (Father)"],
    lifestyleNotes: ["Smoking (2yr)", "Alcohol (occasional)"],
    allergies: ["Dust", "Egg", "Prawns"],
    chronicConditions: ["Diabetes (1yr)", "Hypertension (6mo)"],
    lastVisit: {
      date: "27 Jan'26",
      vitals: "BP: 120/78 | Pulse: 82 | SpO2: 97% | Temp: 101°F | Wt: 94kg",
      symptoms: "Fever (2d, high, evening spikes), Eye redness (2d, bilateral)",
      examination: "Conjunctival congestion bilateral mild, Chest clear, Throat mild pharyngeal congestion",
      diagnosis: "Viral fever, Conjunctivitis",
      medication: "Telma20 1-0-0-1 BF, Metsmail 500 1-0-0-0 BF, Paracetamol 650 SOS",
      labTestsSuggested: "CBC, LFT",
      advice: "Rest, fluids 3L/day, avoid dust exposure, return if fever persists >3d",
      followUp: "2 weeks · Fri, 10 Feb'26",
    },
    labFlagCount: 7,
    todayVitals: { bp: "70/60", pulse: "78", spo2: "93", temp: "104", weight: "94", height: "175", bmi: "30.7" },
    activeMeds: ["Telma20 1-0-0-1", "Metsmail 500 1-0-0-0"],
    keyLabs: [
      { name: "HbA1c", value: "8.1", unit: "%", flag: "high", refRange: "<7%" },
      { name: "Fasting Glucose", value: "168", unit: "mg/dL", flag: "high", refRange: "70-100" },
      { name: "TSH", value: "5.8", unit: "mIU/L", flag: "high", refRange: "0.4-4.0" },
      { name: "LDL", value: "142", unit: "mg/dL", flag: "high", refRange: "<100" },
      { name: "Vitamin D", value: "18", unit: "ng/mL", flag: "low", refRange: "30-100" },
      { name: "Creatinine", value: "1.4", unit: "mg/dL", flag: "high", refRange: "0.7-1.2" },
      { name: "Microalbumin", value: "45", unit: "mg/L", flag: "high", refRange: "<30" },
    ],
    dueAlerts: ["HbA1c recheck (quarterly)", "Lipid Profile (6-monthly)"],
    recordAlerts: ["Uploaded Rx from Dr. Sharma (Cardiology) not reviewed"],
    concernTrend: { label: "SpO₂", values: [97, 96, 94, 93], labels: ["20 Jan", "22 Jan", "24 Jan", "27 Jan"], unit: "%", tone: "red" },
    symptomCollectorData: {
      reportedAt: "Today, 10:15 AM",
      symptoms: [
        { name: "Fever", duration: "3 days", severity: "High", notes: "Evening spikes" },
        { name: "Dry Cough", duration: "2 days", severity: "Moderate", notes: "Night worsening" },
      ],
      medicalHistory: ["Hypertension (3yr)", "Diabetes (2yr)"],
      familyHistory: ["Diabetes (Father)"],
      allergies: ["Dust (3yr)", "Gastric discomfort (2yr)"],
      lifestyle: ["Smoking (2yr)", "Drinking (2yr)"],
      questionsToDoctor: [
        "Is my blood sugar level concerning?",
        "Should I get a chest X-ray for the cough?",
      ],
      currentMedications: ["Telma 20mg 1-0-0-1", "Metsmall 500mg 1-0-0-0"],
      suggestedMeds: ["Paracetamol 650mg", "Azithromycin 500mg"],
      lastVisitSummary: "last visited on 27 Jan'26 with fever, diagnosed Viral fever and Conjunctivitis, suggested Paracetamol 650mg and Azithromycin 500mg",
      isNewPatient: false,
    },
  },

  // ═══════════════ 2. NEHA GUPTA — MASTER PATIENT (ALL specialties, ALL card types) ═══════════════
  // Demonstrates: Returning patient with COMPREHENSIVE data covering every specialty and card type.
  // NO symptomCollectorData — patient came directly without filling intake form.
  // Agent shows Patient Summary directly on open (no Patient Reported card).
  // 32F: Asthma + Hypothyroid + Early Pregnancy (12wk) + PCOS history + Mild Myopia
  "apt-neha": {
    specialtyTags: ["General Medicine", "Pulmonology", "Gynecology", "Obstetrics", "Ophthalmology"],
    followUpOverdueDays: 3,
    patientNarrative: "32-year-old female with bronchial asthma since childhood and hypothyroidism. Recently confirmed pregnancy (12 weeks). PCOS history (resolved). Presenting for asthma follow-up and early ANC.",
    familyHistory: ["Asthma (Mother)", "Thyroid (Maternal Aunt)", "Gestational DM (Elder Sister)", "Breast Cancer (Paternal Aunt)"],
    lifestyleNotes: ["Yoga 3x/week", "Vegetarian", "Non-smoker", "No alcohol"],
    allergies: ["Aspirin (bronchospasm)", "Dust mites", "Penicillin (rash)"],
    chronicConditions: ["Bronchial Asthma (childhood)", "Hypothyroidism (3yr)", "PCOS (2019, resolved)"],
    receptionistIntakeNotes: ["Pregnancy test positive 2 weeks ago", "Wants to discuss medication safety in pregnancy", "Inhaler use increased this week"],
    lastVisit: {
      date: "18 Feb'26",
      vitals: "BP: 110/72 | Pulse: 76 | SpO2: 97% | Temp: 98.4°F | Wt: 56kg",
      symptoms: "Nocturnal cough 1wk, mild wheeze on exertion",
      examination: "Chest: bilateral scattered rhonchi, no crepts. PEFR 320 (expected 380). Abdomen soft, non-tender",
      diagnosis: "Acute exacerbation of bronchial asthma, Hypothyroid on Rx",
      medication: "Budecort 200mcg BD, Deriphyllin retard 150mg BD, Thyronorm 50mcg OD BF, Montelukast 10mg HS",
      labTestsSuggested: "PEFR monitoring, TSH, IgE, CBC, Vitamin D",
      advice: "Avoid dust exposure, use inhaler before exercise, steam inhalation, continue thyroid medication",
      followUp: "2 weeks · 4 Mar'26",
    },
    labFlagCount: 5,
    todayVitals: { bp: "112/74", pulse: "78", spo2: "96", temp: "98.6", weight: "57", height: "160", bmi: "22.3", bloodSugar: "108" },
    activeMeds: ["Budecort 200mcg BD", "Deriphyllin 150mg BD", "Thyronorm 50mcg OD", "Montelukast 10mg HS", "Folic Acid 5mg OD"],
    keyLabs: [
      { name: "TSH", value: "5.2", unit: "mIU/L", flag: "high", refRange: "0.4-4.0" },
      { name: "IgE", value: "380", unit: "IU/mL", flag: "high", refRange: "<100" },
      { name: "Hemoglobin", value: "10.8", unit: "g/dL", flag: "low", refRange: "12-16" },
      { name: "Vitamin D", value: "16", unit: "ng/mL", flag: "low", refRange: "30-100" },
      { name: "Fasting Blood Sugar", value: "108", unit: "mg/dL", flag: "high", refRange: "70-100" },
    ],
    dueAlerts: ["PEFR recheck due", "TSH recheck (quarterly)", "NT Scan due (11-14wk)", "First trimester screening", "Td/TT vaccine due"],
    recordAlerts: ["Allergy testing report from City Chest Hospital uploaded", "USG confirmation of pregnancy (8wk) uploaded"],
    concernTrend: { label: "SpO₂", values: [98, 97, 97, 96], labels: ["Dec'25", "Jan'26", "Feb'26", "Mar'26"], unit: "%", tone: "amber" },
    // NOTE: No symptomCollectorData — master patient for testing ALL card types without intake form
    gynecData: {
      menarche: "13 years",
      cycleLength: "30-35 days",
      cycleRegularity: "Irregular (PCOS history, normalized)",
      flowDuration: "4-5 days",
      flowIntensity: "Moderate",
      padsPerDay: "3",
      lmp: "28 Dec'25",
      lastPapSmear: "Aug 2025",
      alerts: ["PCOS history — monitor for GDM in pregnancy", "Irregular cycles normalized post-treatment"],
    },
    obstetricData: {
      gravida: 1, para: 0, living: 0, abortion: 0, ectopic: 0,
      lmp: "28 Dec'25",
      edd: "4 Oct'26",
      gestationalWeeks: "12wk",
      presentation: "Not applicable (early)",
      fetalMovement: "Not yet",
      oedema: "Nil",
      fundusHeight: "Not palpable",
      amnioticFluid: "Normal (USG)",
      lastExamDate: "3 Mar'26",
      bpLatest: "112/74",
      ancDue: ["NT Scan (11-14wk)", "First Trimester Screening", "Dating Scan"],
      vaccineStatus: ["Td/TT (Not yet)"],
      alerts: ["Asthma in pregnancy — use pregnancy-safe inhalers only", "TSH elevated — adjust Thyronorm dose for pregnancy", "PCOS history — screen for GDM at 24-28wk", "Family hx gestational DM — high alert"],
    },
    ophthalData: {
      vaRight: "6/9",
      vaLeft: "6/12",
      nearVaRight: "N6",
      nearVaLeft: "N8",
      iop: "14/14",
      slitLamp: "Normal",
      fundus: "Normal",
      lastExamDate: "Oct 2025",
      glassPrescription: "RE: -1.25DS, LE: -1.75DS",
      alerts: ["Mild myopia — stable", "Screen for pregnancy-related vision changes", "Review refraction post-delivery"],
    },
  },

  // ═══════════════ 3. ANJALI PATEL — GP + Gynec + Ophthal ═══════════════
  "apt-anjali": {
    specialtyTags: ["General Medicine", "Ophthalmology"],
    followUpOverdueDays: 0,
    patientNarrative: "Headache since 4 days with eye strain, history of migraine",
    familyHistory: ["Migraine (Mother)"],
    lifestyleNotes: ["Screen time >8hr/day", "No exercise"],
    allergies: [],
    chronicConditions: ["Migraine (episodic)"],
    lastVisit: {
      date: "15 Jan'26",
      symptoms: "Headache frontal, photophobia, nausea",
      examination: "Neurological exam normal, no papilledema",
      diagnosis: "Migraine without aura",
      medication: "Sumatriptan 50mg SOS, Paracetamol 500mg SOS",
      labTestsSuggested: "Vitamin D, B12",
    },
    labFlagCount: 1,
    todayVitals: { bp: "110/70", pulse: "72", spo2: "99", temp: "98.4", weight: "58", height: "162" },
    activeMeds: ["Sumatriptan 50mg SOS"],
    keyLabs: [
      { name: "Vitamin D", value: "18", unit: "ng/mL", flag: "low", refRange: "30-100" },
    ],
    dueAlerts: [],
    symptomCollectorData: {
      reportedAt: "Today, 09:45 AM",
      symptoms: [
        { name: "Headache", duration: "4 days", severity: "Moderate", notes: "Frontal, throbbing" },
        { name: "Photophobia", duration: "2 days", severity: "Mild" },
      ],
      medicalHistory: ["Migraine (episodic)"],
      currentMedications: ["Sumatriptan 50mg SOS"],
      suggestedMeds: ["Naproxen 250mg", "Vitamin D 60K"],
      lastVisitSummary: "last visited on 15 Jan'26 with headache and photophobia, diagnosed Migraine without aura, suggested Naproxen 250mg and Vitamin D 60K",
      isNewPatient: false,
    },
    gynecData: {
      menarche: "13 years",
      cycleLength: "28-30 days",
      cycleRegularity: "Regular",
      flowDuration: "4 days",
      flowIntensity: "Moderate",
      lmp: "10 Feb'26",
    },
    ophthalData: {
      vaRight: "6/6",
      vaLeft: "6/6",
      nearVaRight: "N8",
      nearVaLeft: "N8",
      slitLamp: "Normal",
      fundus: "Normal",
      lastExamDate: "15 Jan'26",
      alerts: ["Digital eye strain, recommend 20-20-20 rule"],
    },
  },

  // ═══════════════ 3. VIKRAM SINGH — GP + Ophthal (F/U overdue) ═══════════════
  "apt-vikram": {
    specialtyTags: ["General Medicine", "Cardiology"],
    followUpOverdueDays: 12,
    patientNarrative: "Fatigue since 2 weeks, poor sleep quality, late meals",
    familyHistory: ["CAD (Father)", "DM (Mother)"],
    lifestyleNotes: ["Sedentary", "Late dinners", "Alcohol (weekends)"],
    allergies: ["Sulfa drugs"],
    chronicConditions: ["Hypertension (3yr)", "Dyslipidemia (1yr)", "Pre-diabetes"],
    lastVisit: {
      date: "20 Dec'25",
      symptoms: "Fatigue, poor sleep, occasional chest heaviness on exertion",
      examination: "CVS: S1S2 normal, no murmur. Chest: Clear",
      diagnosis: "HTN Stage I, Dyslipidemia, Fatigue syndrome",
      medication: "Telma40 1-0-0-0 BF, Rosuvastatin 10mg 0-0-0-1, Melatonin 3mg 0-0-0-1",
      labTestsSuggested: "Lipid Panel, HbA1c, TSH, ECG",
      followUp: "2 weeks",
    },
    labFlagCount: 3,
    todayVitals: { bp: "138/88", pulse: "84", spo2: "97", temp: "98.6", weight: "82", height: "172", bmi: "27.7" },
    activeMeds: ["Telma40 1-0-0-0", "Rosuvastatin 10mg 0-0-0-1", "Melatonin 3mg 0-0-0-1"],
    keyLabs: [
      { name: "LDL", value: "138", unit: "mg/dL", flag: "high", refRange: "<100" },
      { name: "HbA1c", value: "6.2", unit: "%", flag: "high", refRange: "<5.7" },
      { name: "Triglycerides", value: "195", unit: "mg/dL", flag: "high", refRange: "<150" },
    ],
    dueAlerts: ["ECG pending", "Lipid recheck overdue"],
    symptomCollectorData: {
      reportedAt: "Today, 10:00 AM",
      symptoms: [
        { name: "Fatigue", duration: "2 weeks", severity: "Moderate", notes: "Persistent, no relief with rest" },
        { name: "Poor Sleep", duration: "2 weeks", severity: "Moderate", notes: "Difficulty staying asleep" },
      ],
      medicalHistory: ["Hypertension (3yr)", "Dyslipidemia (1yr)", "Pre-Diabetes"],
      currentMedications: ["Telma 40mg 1-0-0-0", "Rosuvastatin 10mg 0-0-0-1"],
      suggestedMeds: ["Melatonin 3mg", "CoQ10 100mg"],
      lastVisitSummary: "last visited on 20 Dec'25 with fatigue and poor sleep, diagnosed Fatigue syndrome and Dyslipidemia, suggested Melatonin 3mg and CoQ10 100mg",
      isNewPatient: false,
    },
    ophthalData: {
      vaRight: "6/9",
      vaLeft: "6/9",
      nearVaRight: "N8",
      nearVaLeft: "N8",
      iop: "14/16",
      fundus: "Grade I arteriolar narrowing",
      lastExamDate: "20 Dec'25",
      alerts: ["Presbyopia onset", "Arteriolar narrowing, correlate with HTN control"],
    },
  },

  // ═══════════════ 4. PRIYA RAO — Obstetric (37wk Primigravida) ═══════════════
  "apt-priya": {
    specialtyTags: ["Obstetrics", "High-risk Pregnancy"],
    followUpOverdueDays: 0,
    patientNarrative: "Pedal edema since 3 days, lower back pain 2 days, occasional Braxton-Hicks",
    familyHistory: ["Pre-eclampsia (Mother)", "GDM (Sister)"],
    lifestyleNotes: [],
    allergies: ["Sulfa drugs"],
    chronicConditions: ["Hypothyroid (2yr)"],
    lastVisit: {
      date: "25 Feb'26",
      symptoms: "Routine ANC, mild ankle swelling",
      examination: "Uterus 36wk, cephalic, FHS 142/min, BP 128/82",
      diagnosis: "Routine ANC, Hypothyroid on Rx",
      medication: "Thyronorm 50mcg 1-0-0-0 BF, Folic Acid 5mg 1-0-0-0, Iron+Folic 1-0-0-0 AF, Calcium 500mg 0-1-0-1",
      labTestsSuggested: "CBC, TSH, Urine routine",
      followUp: "1 week",
    },
    labFlagCount: 2,
    todayVitals: { bp: "130/85", pulse: "88", spo2: "98", temp: "98.2", weight: "68" },
    activeMeds: ["Thyronorm 50mcg", "Folic Acid 5mg", "Iron+Folic", "Calcium 500mg"],
    keyLabs: [
      { name: "Hemoglobin", value: "11.2", unit: "g/dL", flag: "low", refRange: "12-16" },
      { name: "TSH", value: "4.8", unit: "mIU/L", flag: "high", refRange: "0.4-4.0" },
    ],
    dueAlerts: ["Dating scan overdue", "TSH recheck due"],
    symptomCollectorData: {
      reportedAt: "Today, 10:30 AM",
      symptoms: [
        { name: "Pedal Edema", duration: "3 days", severity: "Mild", notes: "Bilateral ankle swelling" },
        { name: "Lower Back Pain", duration: "2 days", severity: "Moderate" },
      ],
      medicalHistory: ["Hypothyroid (2yr)"],
      currentMedications: ["Thyronorm 50mcg 1-0-0-0"],
      suggestedMeds: ["Folic Acid 5mg", "Calcium 500mg"],
      lastVisitSummary: "last visited on 25 Feb'26 with routine ANC, diagnosed Routine ANC and Hypothyroid on Rx, suggested Folic Acid 5mg and Calcium 500mg",
      isNewPatient: false,
    },
    obstetricData: {
      gravida: 1, para: 0, living: 0, abortion: 0, ectopic: 0,
      lmp: "14 Jun'25",
      edd: "21 Mar'26",
      gestationalWeeks: "38wk",
      presentation: "Cephalic",
      fetalMovement: "Active",
      oedema: "Pedal edema (Grade I)",
      fundusHeight: "36cm",
      amnioticFluid: "Adequate",
      lastExamDate: "25 Feb'26",
      bpLatest: "130/85",
      ancDue: ["Dating Scan (overdue)", "NT Scan (due)"],
      vaccineStatus: ["Td/TT (Given)", "Tdap (Given)"],
      alerts: ["BP borderline, monitor for pre-eclampsia", "Family history of pre-eclampsia"],
    },
  },

  // ═══════════════ 5. ARJUN S — Pediatric (4y, growth concerns) ═══════════════
  "apt-arjun": {
    specialtyTags: ["Pediatrics"],
    followUpOverdueDays: 0,
    patientNarrative: "Dry cough 3 days, reduced appetite, not eating well since 1 week",
    familyHistory: ["Asthma (Father)"],
    lifestyleNotes: ["Picky eater", "Screen time 3hr/day"],
    allergies: [],
    chronicConditions: [],
    lastVisit: {
      date: "10 Feb'26",
      symptoms: "URTI, mild wheeze",
      examination: "Chest: bilateral wheeze, no crepts. Throat: congested. Ears: normal",
      diagnosis: "Acute URTI with reactive airways",
      medication: "Amoxicillin 250mg TDS 5d, Salbutamol syrup 2ml TDS 3d, Cetirizine syrup 2.5ml OD 5d",
      labTestsSuggested: "CBC if no improvement",
    },
    labFlagCount: 0,
    todayVitals: { bp: "90/60", pulse: "110", spo2: "97", temp: "99.2", weight: "14", height: "98" },
    activeMeds: [],
    keyLabs: [],
    dueAlerts: ["MMR-2 overdue"],
    symptomCollectorData: {
      reportedAt: "Today, 11:00 AM",
      symptoms: [
        { name: "Dry Cough", duration: "3 days", severity: "Moderate", notes: "Worse at night" },
        { name: "Reduced Appetite", duration: "1 week", severity: "Mild" },
      ],
      medicalHistory: [],
      currentMedications: [],
      suggestedMeds: ["Amoxicillin 250mg", "Salbutamol syrup"],
      lastVisitSummary: "last visited on 10 Feb'26 with URTI and wheeze, diagnosed Acute URTI with reactive airways, suggested Amoxicillin 250mg and Salbutamol syrup",
      isNewPatient: false,
    },
    pediatricsData: {
      ageDisplay: "4 years",
      heightCm: 98,
      heightPercentile: "25th",
      weightKg: 14,
      weightPercentile: "15th",
      ofcCm: 50,
      bmiPercentile: "20th",
      vaccinesPending: 3,
      vaccinesOverdue: 1,
      overdueVaccineNames: ["MMR-2"],
      milestoneNotes: ["Speech delay noted by parent, 2-word sentences only"],
      feedingNotes: ["Picky eater", "Milk-dependent", "Poor solid intake"],
      lastGrowthDate: "10 Feb'26",
      alerts: ["Weight below expected (15th %ile)", "Speech delay, consider eval"],
    },
  },

  // ═══════════════ 6. LAKSHMI K — Gynec (Heavy bleeding, perimenopause) ═══════════════
  "apt-lakshmi": {
    specialtyTags: ["Gynecology", "Endocrinology"],
    followUpOverdueDays: 0,
    patientNarrative: "Heavy menstrual bleeding since 6 months, increasing fatigue, irregular cycles",
    familyHistory: ["Breast cancer (Aunt)", "Thyroid (Mother)"],
    lifestyleNotes: ["Vegetarian", "Walks 20min/day"],
    allergies: ["Ibuprofen"],
    chronicConditions: ["PCOS (2018)", "Partial thyroidectomy (2020)", "Hypothyroid on Rx"],
    lastVisit: {
      date: "20 Jan'26",
      symptoms: "Heavy flow 7 days, fatigue, hair thinning",
      examination: "Pallor +, Thyroid scar, P/A soft, P/V: uterus bulky, no tenderness",
      diagnosis: "AUB-Ovulatory dysfunction, Iron deficiency anemia, Hypothyroid",
      medication: "Thyronorm 75mcg 1-0-0-0 BF, Autrin capsule 1-0-0-0 AF, Tranexamic acid 500mg TDS during flow",
      labTestsSuggested: "CBC, TSH, Iron studies, USG pelvis",
      followUp: "6 weeks",
    },
    labFlagCount: 3,
    todayVitals: { bp: "118/76", pulse: "92", spo2: "98", temp: "98.4", weight: "65", height: "158" },
    activeMeds: ["Thyronorm 75mcg", "Autrin capsule", "Tranexamic acid 500mg"],
    keyLabs: [
      { name: "Hemoglobin", value: "9.2", unit: "g/dL", flag: "low", refRange: "12-16" },
      { name: "TSH", value: "6.8", unit: "mIU/L", flag: "high", refRange: "0.4-4.0" },
      { name: "Fasting Blood Sugar", value: "112", unit: "mg/dL", flag: "high", refRange: "70-100" },
    ],
    dueAlerts: ["Pap smear >1yr overdue", "USG pelvis pending"],
    symptomCollectorData: {
      reportedAt: "Today, 10:45 AM",
      symptoms: [
        { name: "Heavy Menstrual Bleeding", duration: "6 months", severity: "High", notes: "5 pads/day" },
        { name: "Fatigue", duration: "3 months", severity: "Moderate", notes: "Increasing" },
      ],
      medicalHistory: ["Hypothyroid", "PCOS"],
      currentMedications: ["Thyronorm 75mcg 1-0-0-0"],
      suggestedMeds: ["Autrin capsule", "Tranexamic acid 500mg"],
      lastVisitSummary: "last visited on 20 Jan'26 with heavy bleeding and fatigue, diagnosed AUB-Ovulatory dysfunction and Iron deficiency anemia, suggested Autrin capsule and Tranexamic acid 500mg",
      isNewPatient: false,
    },
    gynecData: {
      menarche: "13 years",
      cycleLength: "35-40 days",
      cycleRegularity: "Irregular",
      flowDuration: "7 days",
      flowIntensity: "Heavy (5 pads/day)",
      padsPerDay: "5",
      painScore: "Moderate (6/10)",
      lmp: "02 Nov'25",
      lastPapSmear: "Jan 2025 (>1yr ago)",
      alerts: ["Heavy flow + Hb↓ → compound alert", "Perimenopause evaluation needed", "Pap smear overdue"],
    },
  },

  // ═══════════════ 7. RAMESH M — Zero Data (New Patient) ═══════════════
  "apt-zerodata": {
    specialtyTags: [],
    followUpOverdueDays: 0,
    allergies: ["Sulfonamides"],
    chronicConditions: [],
    labFlagCount: 0,
    keyLabs: [],
    dueAlerts: [],
    symptomCollectorData: {
      reportedAt: "Today, 09:30 AM",
      symptoms: [
        { name: "Knee Pain", duration: "1 week", severity: "Moderate", notes: "Right knee, worse on climbing stairs" },
        { name: "Morning Stiffness", duration: "3 days", severity: "Mild", notes: "Lasts about 15-20 minutes" },
      ],
      medicalHistory: [
        "Childhood asthma (resolved)",
        "Appendectomy (2018)",
      ],
      allergies: ["Sulfonamides"],
      currentMedications: [
        "Vit D3 60K (weekly)",
        "Calcium 500mg (daily)",
      ],
      lastVisitSummary: undefined,
      isNewPatient: true,
    },
  },

  // ═══════════════ 8. SURESH NAIR — Returning patient, NO symptom collector ═══════════════
  // Demonstrates: Full historical data available but patient did NOT fill symptom collector
  // Agent must work with historical context only, no self-reported symptoms
  "reg-suresh": {
    specialtyTags: ["General Medicine", "Cardiology"],
    followUpOverdueDays: 0,
    patientNarrative: "58-year-old male with stable ischemic heart disease and controlled hypertension. Post-angioplasty (2024), on dual antiplatelet therapy.",
    familyHistory: ["MI (Father, age 55)", "Stroke (Mother, age 68)"],
    lifestyleNotes: ["Ex-smoker (quit 2023)", "Walks 20 min/day"],
    allergies: ["Aspirin (GI intolerance — switched to Clopidogrel)"],
    chronicConditions: ["Ischemic Heart Disease (2024)", "Hypertension (5yr)", "Dyslipidemia (3yr)"],
    lastVisit: {
      date: "10 Feb'26",
      vitals: "BP: 128/82 | Pulse: 72 | SpO2: 98% | Temp: 98.4°F | Wt: 76kg",
      symptoms: "Routine follow-up, no new complaints",
      examination: "S1S2 normal, no murmur, Chest clear, mild pedal edema resolved",
      diagnosis: "Stable IHD on Rx, HTN controlled",
      medication: "Clopidogrel 75mg OD, Atorvastatin 40mg HS, Metoprolol 25mg BD, Telmisartan 40mg OD",
      labTestsSuggested: "Lipid Profile, Renal Panel, ECG",
      advice: "Continue exercise, low-salt diet, medication compliance",
      followUp: "3 months · 10 May'26",
    },
    labFlagCount: 2,
    todayVitals: { bp: "132/84", pulse: "74", spo2: "98", temp: "98.6", weight: "76", bmi: "26.1" },
    activeMeds: ["Clopidogrel 75mg OD", "Atorvastatin 40mg HS", "Metoprolol 25mg BD", "Telmisartan 40mg OD"],
    keyLabs: [
      { name: "LDL", value: "118", unit: "mg/dL", flag: "high", refRange: "<100" },
      { name: "Triglycerides", value: "178", unit: "mg/dL", flag: "high", refRange: "<150" },
    ],
    dueAlerts: ["ECG due (annual)", "Echo follow-up (post-angioplasty)"],
    recordAlerts: ["Angioplasty records from City Heart Hospital (2024) uploaded"],
    concernTrend: { label: "LDL", values: [142, 128, 118], labels: ["Jun 25", "Oct 25", "Feb 26"], unit: "mg/dL", tone: "teal" },
    // NOTE: No symptomCollectorData — patient came directly without filling intake form
    // Agent must generate summary from historical data only
  },
}

// ─────────────────────────────────────────────────────────────
// Patient Tooltip Summaries — used by appointment page AI tooltip
// ─────────────────────────────────────────────────────────────

export const PATIENT_TOOLTIP_SUMMARIES: Record<string, string> = {
  "__patient__":
    "Patient with Hypertension 3yr and Diabetes Mellitus 2yr, on Telma 20mg, last visited on 27 Jan'26 with fever, diagnosed Viral fever and Conjunctivitis, suggested Paracetamol 650mg and Azithromycin 500mg.",
  "apt-anjali":
    "Patient with Migraine episodic, on Sumatriptan 50mg, last visited on 15 Jan'26 with headache and photophobia, diagnosed Migraine without aura, suggested Naproxen 250mg and Vitamin D 60K.",
  "apt-vikram":
    "Patient with Hypertension 3yr, Dyslipidemia 1yr and Pre-Diabetes, on Telma 40mg, last visited on 20 Dec'25 with fatigue and poor sleep, diagnosed Fatigue syndrome and Dyslipidemia, suggested Melatonin 3mg and CoQ10 100mg.",
  "apt-priya":
    "Patient with Hypothyroid 2yr, on Thyronorm 50mcg, last visited on 25 Feb'26 with routine ANC, diagnosed Routine ANC and Hypothyroid on Rx, suggested Folic Acid 5mg and Calcium 500mg.",
  "apt-arjun":
    "Last visited on 10 Feb'26 with URTI and wheeze, diagnosed Acute URTI with reactive airways, suggested Amoxicillin 250mg and Salbutamol syrup.",
  "apt-lakshmi":
    "Patient with Hypothyroid and PCOS, on Thyronorm 75mcg, last visited on 20 Jan'26 with heavy bleeding and fatigue, diagnosed AUB-Ovulatory dysfunction and Iron deficiency anemia, suggested Autrin capsule and Tranexamic acid 500mg.",
  "apt-neha":
    "Patient with Bronchial Asthma and Hypothyroidism, newly confirmed pregnancy 12wk. On Budecort 200mcg and Thyronorm 50mcg, last visited 18 Feb'26 with nocturnal cough. TSH elevated (5.2), Hb low (10.8), SpO2 trending down (96%). PCOS history. NT Scan due.",
  "apt-zerodata":
    "New patient with Knee Pain and Morning Stiffness 1 week. Allergy: Sulfonamides, on Vit D3 60K (weekly).",
  "reg-suresh":
    "Patient with IHD post-angioplasty (2024), HTN 5yr, on Clopidogrel 75mg, Atorvastatin 40mg, last visited 10 Feb'26, stable IHD, LDL 118 (above target).",
}

// ═══════════════ PATIENT DOCUMENTS (per-patient EMR uploads) ═══════════════

export const PATIENT_DOCUMENTS: Record<string, PatientDocument[]> = {
  "__patient__": [
    { id: "doc-1", fileName: "CBC_Report_Mar2026.pdf", docType: "pathology", uploadedAt: "05 Mar'26", uploadedBy: "Apollo Diagnostics", pageCount: 2, size: "340 KB" },
    { id: "doc-2", fileName: "X-Ray_Chest_Feb2026.pdf", docType: "radiology", uploadedAt: "18 Feb'26", uploadedBy: "Dr. Sharma", pageCount: 1, size: "1.2 MB" },
    { id: "doc-3", fileName: "Previous_Rx_Jan2026.pdf", docType: "prescription", uploadedAt: "10 Jan'26", uploadedBy: "Dr. Meera", pageCount: 1, size: "180 KB" },
    { id: "doc-4", fileName: "Lipid_Panel_Dec2025.pdf", docType: "pathology", uploadedAt: "22 Dec'25", uploadedBy: "SRL Diagnostics", pageCount: 3, size: "520 KB" },
    { id: "doc-5", fileName: "ECG_Report_Dec2025.pdf", docType: "other", uploadedAt: "15 Dec'25", uploadedBy: "Patient", pageCount: 1, size: "890 KB" },
    { id: "doc-6", fileName: "Discharge_Summary_Nov2025.pdf", docType: "discharge_summary", uploadedAt: "02 Nov'25", uploadedBy: "City Hospital", pageCount: 4, size: "1.1 MB" },
    { id: "doc-7", fileName: "Thyroid_Panel_Oct2025.pdf", docType: "pathology", uploadedAt: "18 Oct'25", uploadedBy: "Metropolis Lab", pageCount: 2, size: "280 KB" },
    { id: "doc-8", fileName: "MRI_Brain_Sep2025.pdf", docType: "radiology", uploadedAt: "05 Sep'25", uploadedBy: "Dr. Reddy", pageCount: 6, size: "3.2 MB" },
  ],
  "apt-neha": [
    { id: "doc-n1", fileName: "Lab_Results_Mar2026.pdf", docType: "pathology", uploadedAt: "09 Mar'26", uploadedBy: "Metropolis Lab", pageCount: 2, size: "420 KB" },
    { id: "doc-n2", fileName: "Chest_Xray_Feb2026.pdf", docType: "radiology", uploadedAt: "27 Feb'26", uploadedBy: "City Imaging", pageCount: 1, size: "1.4 MB" },
    { id: "doc-n3", fileName: "Pathology_Panel_Feb2026.pdf", docType: "pathology", uploadedAt: "25 Feb'26", uploadedBy: "Apollo Diagnostics", pageCount: 3, size: "560 KB" },
    { id: "doc-n4", fileName: "Previous_Rx_Feb2026.pdf", docType: "prescription", uploadedAt: "18 Feb'26", uploadedBy: "Dr. Meera", pageCount: 1, size: "190 KB" },
    { id: "doc-n5", fileName: "Insurance_PreAuth_Feb2026.pdf", docType: "other", uploadedAt: "16 Feb'26", uploadedBy: "Patient", pageCount: 2, size: "300 KB" },
  ],
  "apt-lakshmi": [
    { id: "doc-l1", fileName: "Pap_Smear_Report_Feb2026.pdf", docType: "pathology", uploadedAt: "12 Feb'26", uploadedBy: "Path Lab", pageCount: 2, size: "410 KB" },
    { id: "doc-l2", fileName: "Pelvic_Ultrasound_Jan2026.pdf", docType: "radiology", uploadedAt: "25 Jan'26", uploadedBy: "Dr. Anitha", pageCount: 3, size: "1.8 MB" },
    { id: "doc-l3", fileName: "Hormone_Panel_Jan2026.pdf", docType: "pathology", uploadedAt: "18 Jan'26", uploadedBy: "Thyrocare", pageCount: 2, size: "320 KB" },
    { id: "doc-l4", fileName: "Previous_Rx_Dec2025.pdf", docType: "prescription", uploadedAt: "10 Dec'25", uploadedBy: "Dr. Kavitha", pageCount: 1, size: "150 KB" },
    { id: "doc-l5", fileName: "CA125_Report_Nov2025.pdf", docType: "pathology", uploadedAt: "28 Nov'25", uploadedBy: "SRL Diagnostics", pageCount: 1, size: "220 KB" },
  ],
  "apt-anjali": [
    { id: "doc-a1", fileName: "OCT_Scan_Mar2026.pdf", docType: "radiology", uploadedAt: "03 Mar'26", uploadedBy: "Dr. Patel", pageCount: 4, size: "2.1 MB" },
    { id: "doc-a2", fileName: "Visual_Field_Test_Feb2026.pdf", docType: "other", uploadedAt: "15 Feb'26", uploadedBy: "Eye Care Centre", pageCount: 2, size: "680 KB" },
    { id: "doc-a3", fileName: "IOP_Chart_Jan2026.pdf", docType: "other", uploadedAt: "20 Jan'26", uploadedBy: "Dr. Patel", pageCount: 1, size: "180 KB" },
    { id: "doc-a4", fileName: "Fundus_Photo_Dec2025.pdf", docType: "radiology", uploadedAt: "12 Dec'25", uploadedBy: "Retina Clinic", pageCount: 2, size: "3.5 MB" },
  ],
  "apt-priya": [
    { id: "doc-p1", fileName: "NT_Scan_Report_Mar2026.pdf", docType: "radiology", uploadedAt: "08 Mar'26", uploadedBy: "Dr. Sunita", pageCount: 3, size: "1.6 MB" },
    { id: "doc-p2", fileName: "First_Trimester_Screen_Feb2026.pdf", docType: "pathology", uploadedAt: "22 Feb'26", uploadedBy: "Metropolis Lab", pageCount: 2, size: "450 KB" },
    { id: "doc-p3", fileName: "Blood_Group_Rh_Feb2026.pdf", docType: "pathology", uploadedAt: "10 Feb'26", uploadedBy: "Apollo Lab", pageCount: 1, size: "120 KB" },
    { id: "doc-p4", fileName: "ANC_Registration_Jan2026.pdf", docType: "other", uploadedAt: "15 Jan'26", uploadedBy: "Dr. Rao", pageCount: 2, size: "340 KB" },
    { id: "doc-p5", fileName: "Thyroid_Panel_Jan2026.pdf", docType: "pathology", uploadedAt: "12 Jan'26", uploadedBy: "Thyrocare", pageCount: 1, size: "210 KB" },
    { id: "doc-p6", fileName: "Previous_Rx_Dec2025.pdf", docType: "prescription", uploadedAt: "28 Dec'25", uploadedBy: "Dr. Rao", pageCount: 1, size: "180 KB" },
  ],
  "apt-arjun": [
    { id: "doc-ar1", fileName: "Vaccination_Record_Mar2026.pdf", docType: "vaccination", uploadedAt: "01 Mar'26", uploadedBy: "Dr. Nair", pageCount: 2, size: "280 KB" },
    { id: "doc-ar2", fileName: "Growth_Chart_Feb2026.pdf", docType: "other", uploadedAt: "15 Feb'26", uploadedBy: "Dr. Nair", pageCount: 1, size: "350 KB" },
    { id: "doc-ar3", fileName: "CBC_Report_Jan2026.pdf", docType: "pathology", uploadedAt: "20 Jan'26", uploadedBy: "Path Lab", pageCount: 2, size: "310 KB" },
    { id: "doc-ar4", fileName: "Hearing_Screen_Dec2025.pdf", docType: "other", uploadedAt: "10 Dec'25", uploadedBy: "ENT Clinic", pageCount: 1, size: "190 KB" },
    { id: "doc-ar5", fileName: "Previous_Rx_Nov2025.pdf", docType: "prescription", uploadedAt: "25 Nov'25", uploadedBy: "Dr. Nair", pageCount: 1, size: "140 KB" },
  ],
}

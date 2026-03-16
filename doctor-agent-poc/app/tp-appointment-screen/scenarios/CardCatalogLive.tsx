"use client"

import React, { useState } from "react"
import { CardRenderer } from "@/components/tp-rxpad/dr-agent/cards/CardRenderer"
import type { RxAgentOutput } from "@/components/tp-rxpad/dr-agent/types"
import type { RxPadCopyPayload } from "@/components/tp-rxpad/rxpad-sync-context"

// ─────────────────────────────────────────────────────────────
// Live Card Catalog — renders every card variant with mock data
// ─────────────────────────────────────────────────────────────

// Reusable dummy payload
const DUMMY_PAYLOAD: RxPadCopyPayload = { sourceDateLabel: "Demo" }

// ═══════ MOCK DATA FOR ALL 40 CARD KINDS ═══════

interface CatalogEntry {
  kind: string
  family: string
  label: string
  output: RxAgentOutput
}

const CATALOG: CatalogEntry[] = [
  // ── A. Summary Family ──────────────────────────────────────

  {
    kind: "patient_summary",
    family: "Summary",
    label: "Patient Summary (GP)",
    output: {
      kind: "patient_summary",
      data: {
        specialtyTags: ["Hypertension", "Type 2 DM"],
        followUpOverdueDays: 12,
        patientNarrative: "45-year-old male with uncontrolled hypertension and Type 2 diabetes since 2019. Missed last 2 follow-ups.",
        familyHistory: ["Father: MI at 52", "Mother: T2DM"],
        lifestyleNotes: ["Sedentary", "Occasional smoker"],
        allergies: ["Sulfonamides", "Ibuprofen"],
        chronicConditions: ["Hypertension Stage II", "Type 2 DM", "Dyslipidemia"],
        labFlagCount: 3,
        todayVitals: { bp: "152/96", pulse: "82", spo2: "97%", temp: "98.4", weight: "78 kg", bmi: "27.3" },
        activeMeds: ["Amlodipine 5mg OD", "Metformin 500mg BD", "Atorvastatin 10mg HS"],
        keyLabs: [
          { name: "HbA1c", value: "8.2%", flag: "high", refRange: "< 6.5%" },
          { name: "LDL", value: "142", unit: "mg/dL", flag: "high", refRange: "< 100" },
          { name: "Creatinine", value: "1.4", unit: "mg/dL", flag: "high", refRange: "0.7-1.3" },
        ],
        dueAlerts: ["HbA1c recheck due", "Eye screening overdue"],
        recordAlerts: ["Allergies not reviewed in 6 months"],
        concernTrend: { label: "BP Systolic", values: [148, 155, 152, 160, 152], labels: ["Jan", "Feb", "Mar", "Apr", "May"], unit: "mmHg", tone: "red" },
      },
    },
  },

  {
    kind: "symptom_collector",
    family: "Summary",
    label: "Patient-Reported Symptoms",
    output: {
      kind: "symptom_collector",
      data: {
        reportedAt: "9 Mar'26 / 9:15 AM",
        symptoms: [
          { name: "Headache", duration: "3 days", severity: "moderate", notes: "Frontal, throbbing" },
          { name: "Dizziness", duration: "1 week", severity: "mild" },
          { name: "Blurred vision", duration: "2 days", severity: "moderate" },
        ],
        medicalHistory: ["Hypertension since 2019", "Type 2 DM since 2020"],
        allergies: ["Sulfonamides"],
        currentMedications: ["Amlodipine 5mg", "Metformin 500mg"],
        questionsToDoctor: ["Should I increase my BP medication?"],
        isNewPatient: false,
      },
    },
  },

  {
    kind: "last_visit",
    family: "Summary",
    label: "Last Visit Summary",
    output: {
      kind: "last_visit",
      data: {
        visitDate: "22 Feb'26",
        sections: [
          { tag: "Symptoms", icon: "stethoscope", items: [{ label: "Chest tightness", detail: "on exertion" }, { label: "Fatigue" }] },
          { tag: "Diagnosis", icon: "clipboard-activity", items: [{ label: "Unstable Angina", severity: "high" }, { label: "Hypertension Stage II" }] },
          { tag: "Medication", icon: "capsule", items: [{ label: "Amlodipine 5mg", detail: "OD" }, { label: "Aspirin 75mg", detail: "OD" }] },
        ],
        copyAllPayload: DUMMY_PAYLOAD,
      },
    },
  },

  {
    kind: "obstetric_summary",
    family: "Summary",
    label: "Obstetric Summary",
    output: {
      kind: "obstetric_summary",
      data: {
        gravida: 2, para: 1, living: 1, abortion: 0, ectopic: 0,
        lmp: "15 Aug 2025", edd: "22 May 2026", gestationalWeeks: "29w 2d",
        presentation: "Cephalic", fetalMovement: "Active",
        oedema: "Mild pedal", fundusHeight: "28 cm",
        amnioticFluid: "Adequate", bpLatest: "118/76",
        ancDue: ["Anomaly scan", "GCT"],
        vaccineStatus: ["Td Booster: Done", "Flu: Pending"],
        alerts: ["GDM screening due at 28w"],
      },
    },
  },

  {
    kind: "gynec_summary",
    family: "Summary",
    label: "Gynecological Summary",
    output: {
      kind: "gynec_summary",
      data: {
        menarche: "13 years", cycleLength: "28 days", cycleRegularity: "Regular",
        flowDuration: "5 days", flowIntensity: "Moderate", padsPerDay: "3-4",
        painScore: "4/10", lmp: "18 Feb 2026", lastPapSmear: "Mar 2025",
        alerts: ["Pap smear due (> 1 year)"],
      },
    },
  },

  {
    kind: "pediatric_summary",
    family: "Summary",
    label: "Pediatric Summary",
    output: {
      kind: "pediatric_summary",
      data: {
        ageDisplay: "2y 4m", heightCm: 87, heightPercentile: "50th",
        weightKg: 12.5, weightPercentile: "60th", ofcCm: 48.2,
        bmiPercentile: "55th", vaccinesPending: 2, vaccinesOverdue: 1,
        overdueVaccineNames: ["MMR Booster"],
        milestoneNotes: ["Walking independently", "2-word sentences"],
        feedingNotes: ["Breastfeeding + solids", "Good appetite"],
        lastGrowthDate: "Jan 2026",
        alerts: ["MMR Booster overdue by 2 months"],
      },
    },
  },

  {
    kind: "ophthal_summary",
    family: "Summary",
    label: "Ophthalmology Summary",
    output: {
      kind: "ophthal_summary",
      data: {
        vaRight: "6/9", vaLeft: "6/12", nearVaRight: "N6", nearVaLeft: "N8",
        iop: "16 / 18 mmHg", slitLamp: "Early nuclear sclerosis OU",
        fundus: "Cup-to-disc 0.4 OU, no hemorrhages",
        lastExamDate: "Nov 2025", glassPrescription: "-1.5 / -2.0 Sph",
        alerts: ["IOP borderline left eye", "Follow-up in 3 months"],
      },
    },
  },

  // ── B. Data Family ─────────────────────────────────────────

  {
    kind: "lab_panel",
    family: "Data",
    label: "Lab Panel (Flagged Results)",
    output: {
      kind: "lab_panel",
      data: {
        panelDate: "5 Mar'26",
        flagged: [
          { name: "HbA1c", value: "8.2%", flag: "high", refRange: "< 6.5%" },
          { name: "LDL Cholesterol", value: "162", unit: "mg/dL", flag: "high", refRange: "< 100" },
          { name: "Hemoglobin", value: "10.8", unit: "g/dL", flag: "low", refRange: "13-17" },
        ],
        hiddenNormalCount: 14,
        insight: "HbA1c has worsened from 7.4% to 8.2% over 3 months. Consider medication adjustment.",
      },
    },
  },

  {
    kind: "vitals_trend_bar",
    family: "Data",
    label: "Vitals Trend (Bar Chart)",
    output: {
      kind: "vitals_trend_bar",
      data: {
        title: "Blood Pressure Trend",
        series: [
          { label: "Systolic", values: [148, 155, 152, 160, 152, 145], dates: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], tone: "warn", threshold: 140, thresholdLabel: "Target", unit: "mmHg" },
          { label: "Diastolic", values: [92, 96, 94, 98, 96, 90], dates: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], tone: "ok", threshold: 90, thresholdLabel: "Target", unit: "mmHg" },
        ],
      },
    },
  },

  {
    kind: "vitals_trend_line",
    family: "Data",
    label: "Vitals Trend (Line Chart)",
    output: {
      kind: "vitals_trend_line",
      data: {
        title: "Weight Trend (6 months)",
        series: [
          { label: "Weight", values: [82, 80, 79, 78.5, 78, 77], dates: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], tone: "ok", unit: "kg" },
        ],
      },
    },
  },

  {
    kind: "lab_trend",
    family: "Data",
    label: "Lab Trend (Over Time)",
    output: {
      kind: "lab_trend",
      data: {
        title: "HbA1c Trend",
        parameterName: "HbA1c",
        series: [
          { label: "HbA1c", values: [7.1, 7.4, 7.8, 8.2], dates: ["Jun 25", "Sep 25", "Dec 25", "Mar 26"], tone: "critical", threshold: 6.5, thresholdLabel: "Target", unit: "%" },
        ],
      },
    },
  },

  {
    kind: "lab_comparison",
    family: "Data",
    label: "Lab Comparison (Previous vs Current)",
    output: {
      kind: "lab_comparison",
      data: {
        rows: [
          { parameter: "HbA1c", prevValue: "7.4%", currValue: "8.2%", prevDate: "Dec 25", currDate: "Mar 26", delta: "+0.8%", direction: "up", isFlagged: true },
          { parameter: "LDL", prevValue: "128", currValue: "162", prevDate: "Dec 25", currDate: "Mar 26", delta: "+34", direction: "up", isFlagged: true },
          { parameter: "Creatinine", prevValue: "1.2", currValue: "1.4", prevDate: "Dec 25", currDate: "Mar 26", delta: "+0.2", direction: "up", isFlagged: true },
          { parameter: "TSH", prevValue: "2.8", currValue: "2.6", prevDate: "Dec 25", currDate: "Mar 26", delta: "-0.2", direction: "down", isFlagged: false },
        ],
        insight: "3 of 4 parameters worsened. HbA1c and LDL need immediate attention.",
      },
    },
  },

  {
    kind: "med_history",
    family: "Data",
    label: "Medication History",
    output: {
      kind: "med_history",
      data: {
        entries: [
          { drug: "Amlodipine 5mg", dosage: "OD", date: "Jan 2024", diagnosis: "Hypertension", source: "prescribed" },
          { drug: "Metformin 500mg", dosage: "BD", date: "Mar 2024", diagnosis: "Type 2 DM", source: "prescribed" },
          { drug: "Atorvastatin 10mg", dosage: "HS", date: "Jun 2024", diagnosis: "Dyslipidemia", source: "prescribed" },
          { drug: "Aspirin 75mg", dosage: "OD", date: "Sep 2025", diagnosis: "Cardiac prophylaxis", source: "uploaded" },
        ],
        insight: "Patient on 4 active medications. Last medication change was 6 months ago.",
      },
    },
  },

  // ── C. Action Family ───────────────────────────────────────

  {
    kind: "ddx",
    family: "Action",
    label: "Differential Diagnosis",
    output: {
      kind: "ddx",
      data: {
        context: "45M with headache, dizziness, blurred vision, BP 152/96",
        options: [
          { name: "Hypertensive urgency", bucket: "cant_miss" },
          { name: "Tension headache", bucket: "most_likely", selected: true },
          { name: "Migraine with aura", bucket: "most_likely" },
          { name: "Vertebrobasilar insufficiency", bucket: "consider" },
          { name: "Intracranial mass", bucket: "cant_miss" },
        ],
      },
    },
  },

  {
    kind: "protocol_meds",
    family: "Action",
    label: "Protocol-Based Medications",
    output: {
      kind: "protocol_meds",
      data: {
        diagnosis: "Hypertensive Urgency",
        meds: [
          { name: "Nifedipine", dosage: "10mg", timing: "Sublingual STAT", duration: "Single dose", notes: "Monitor BP q15min" },
          { name: "Amlodipine", dosage: "10mg", timing: "OD", duration: "Ongoing", notes: "Increase from 5mg" },
          { name: "Telmisartan", dosage: "40mg", timing: "OD", duration: "Ongoing", notes: "Add ARB for dual therapy" },
        ],
        safetyCheck: "No contraindications found. eGFR > 30, K+ normal.",
        copyPayload: DUMMY_PAYLOAD,
      },
    },
  },

  {
    kind: "investigation_bundle",
    family: "Action",
    label: "Investigation Bundle",
    output: {
      kind: "investigation_bundle",
      data: {
        title: "Recommended Investigations",
        items: [
          { name: "Renal Function Panel", rationale: "Creatinine elevated; monitor eGFR", selected: true },
          { name: "Urine Microalbumin", rationale: "Screen for diabetic nephropathy" },
          { name: "Fundoscopy", rationale: "Hypertensive retinopathy screening", selected: true },
          { name: "ECG", rationale: "Baseline cardiac assessment" },
        ],
        copyPayload: DUMMY_PAYLOAD,
      },
    },
  },

  {
    kind: "follow_up",
    family: "Action",
    label: "Follow-Up Scheduling",
    output: {
      kind: "follow_up",
      data: {
        context: "Post hypertensive urgency management with medication adjustment",
        options: [
          { label: "3 days", days: 3, recommended: true, reason: "Recheck BP after medication change" },
          { label: "1 week", days: 7, reason: "Standard post-adjustment review" },
          { label: "2 weeks", days: 14 },
          { label: "1 month", days: 30 },
        ],
      },
    },
  },

  {
    kind: "advice_bundle",
    family: "Action",
    label: "Patient Advice",
    output: {
      kind: "advice_bundle",
      data: {
        title: "Lifestyle Advice for Hypertension",
        items: [
          "Reduce salt intake to < 5g/day",
          "Walk briskly for 30 minutes daily",
          "Monitor BP at home twice daily (morning & evening)",
          "Avoid smoking and limit alcohol",
          "Take medications at the same time every day",
        ],
        shareMessage: "Here are your doctor's recommendations for managing blood pressure.",
        copyPayload: DUMMY_PAYLOAD,
      },
    },
  },

  {
    kind: "voice_structured_rx",
    family: "Action",
    label: "Voice-to-Structured Rx",
    output: {
      kind: "voice_structured_rx",
      data: {
        voiceText: "Patient has headache for 3 days, dizziness, BP 152/96. Diagnosis hypertensive urgency. Give nifedipine 10mg sublingual stat, increase amlodipine to 10mg OD, add telmisartan 40mg. Order renal panel and ECG. Follow up in 3 days.",
        sections: [
          { sectionId: "symptoms", title: "Symptoms", tpIconName: "stethoscope", items: [{ name: "Headache", detail: "3 days" }, { name: "Dizziness" }] },
          { sectionId: "diagnosis", title: "Diagnosis", tpIconName: "clipboard-activity", items: [{ name: "Hypertensive Urgency" }] },
          { sectionId: "medication", title: "Medication", tpIconName: "capsule", items: [{ name: "Nifedipine 10mg", detail: "SL STAT" }, { name: "Amlodipine 10mg", detail: "OD" }, { name: "Telmisartan 40mg", detail: "OD" }] },
          { sectionId: "investigation", title: "Investigation", tpIconName: "test-tube", items: [{ name: "Renal Function Panel" }, { name: "ECG" }] },
        ],
        copyAllPayload: DUMMY_PAYLOAD,
      },
    },
  },

  // ── D. Analysis Family ─────────────────────────────────────

  {
    kind: "ocr_pathology",
    family: "Analysis",
    label: "OCR Pathology Report",
    output: {
      kind: "ocr_pathology",
      data: {
        title: "Complete Blood Count",
        category: "Hematology",
        parameters: [
          { name: "Hemoglobin", value: "10.8 g/dL", refRange: "13.0 - 17.0", flag: "low", confidence: "high" },
          { name: "WBC", value: "11,200 /uL", refRange: "4,000 - 11,000", flag: "high", confidence: "high" },
          { name: "Platelets", value: "245,000 /uL", refRange: "150,000 - 400,000", confidence: "high" },
          { name: "MCV", value: "72 fL", refRange: "80 - 100", flag: "low", confidence: "medium" },
        ],
        normalCount: 8,
        insight: "Microcytic anemia with mild leukocytosis. Consider iron studies and peripheral smear.",
      },
    },
  },

  {
    kind: "ocr_extraction",
    family: "Analysis",
    label: "OCR Full Extraction",
    output: {
      kind: "ocr_extraction",
      data: {
        title: "Discharge Summary - City Hospital",
        category: "Discharge Summary",
        sections: [
          { heading: "Diagnosis", icon: "clipboard-activity", items: ["Acute coronary syndrome", "Hypertension Stage II", "Type 2 DM"], copyDestination: "Diagnosis" },
          { heading: "Medications", icon: "capsule", items: ["Aspirin 75mg OD", "Clopidogrel 75mg OD", "Atorvastatin 40mg HS", "Metoprolol 25mg BD"], copyDestination: "Medication" },
          { heading: "Investigations", icon: "test-tube", items: ["Troponin I: 2.4 ng/mL (H)", "ECG: ST depression V4-V6", "Echo: EF 50%"], copyDestination: "Lab Results" },
        ],
        insight: "Critical findings: Troponin elevated, reduced EF. Needs cardiac follow-up within 1 week.",
      },
    },
  },

  // ── E. Utility & Safety Family ─────────────────────────────

  {
    kind: "translation",
    family: "Utility",
    label: "Translation Card",
    output: {
      kind: "translation",
      data: {
        sourceLanguage: "Hindi",
        targetLanguage: "English",
        sourceText: "Mujhe kal raat se sar mein bahut dard ho raha hai aur chakkar bhi aa rahe hain.",
        translatedText: "I have been having severe headache since last night and also experiencing dizziness.",
        copyPayload: DUMMY_PAYLOAD,
      },
    },
  },

  {
    kind: "drug_interaction",
    family: "Safety",
    label: "Drug Interaction Alert",
    output: {
      kind: "drug_interaction",
      data: {
        drug1: "Metformin 500mg",
        drug2: "Contrast Dye (IV)",
        severity: "high",
        risk: "Lactic acidosis risk with concurrent use of metformin and iodinated contrast media.",
        action: "Hold Metformin 48 hours before and after contrast administration. Monitor renal function.",
      },
    },
  },

  {
    kind: "allergy_conflict",
    family: "Safety",
    label: "Allergy Conflict Alert",
    output: {
      kind: "allergy_conflict",
      data: {
        drug: "Sulfasalazine",
        allergen: "Sulfonamides",
        alternative: "Mesalamine (5-ASA) - sulfa-free alternative",
      },
    },
  },

  {
    kind: "follow_up_question",
    family: "Utility",
    label: "Follow-Up Question",
    output: {
      kind: "follow_up_question",
      data: {
        question: "Which specific lab panel would you like to review?",
        options: ["Complete Blood Count", "Renal Function Panel", "Lipid Profile", "Thyroid Function"],
        multiSelect: false,
      },
    },
  },

  // ── F. Text-Only Family ────────────────────────────────────

  {
    kind: "text_fact",
    family: "Text",
    label: "Text Fact",
    output: {
      kind: "text_fact",
      data: {
        value: "The recommended target HbA1c for most adults with Type 2 DM is < 7.0% (ADA 2026 guidelines).",
        context: "Clinical Reference",
        source: "ADA Standards of Care 2026",
      },
    },
  },

  {
    kind: "text_alert",
    family: "Text",
    label: "Text Alert (Critical)",
    output: {
      kind: "text_alert",
      data: {
        message: "**Critical:** Patient's eGFR has dropped below 30 mL/min. Immediate nephrology referral recommended.",
        severity: "critical",
      },
    },
  },

  {
    kind: "text_list",
    family: "Text",
    label: "Text List",
    output: {
      kind: "text_list",
      data: {
        items: [
          "Blood pressure monitoring twice daily",
          "Salt restriction < 5g/day",
          "Regular exercise 30 min/day",
          "Medication compliance check",
          "Follow-up in 3 days",
        ],
      },
    },
  },

  // ── G. Homepage / Operational Family ───────────────────────

  {
    kind: "text_list",
    family: "Homepage",
    label: "Intro Text (above Welcome Card)",
    output: {
      kind: "text_list",
      data: {
        items: [
          "Good morning, Dr. Sharma! You have 7 patients queued today.",
          "2 follow-ups are overdue — Meera Joshi (post-surgery) and Rohit Das (lab review).",
          "Rajesh Sharma (10:00 AM) has 3 new flagged lab values since his last visit.",
          "2 draft prescriptions are pending your review.",
        ],
      },
    },
  },

  {
    kind: "welcome_card",
    family: "Homepage",
    label: "Welcome Card",
    output: {
      kind: "welcome_card",
      data: {
        greeting: "Good morning, Dr. Sharma!",
        date: "Mon, 9 Mar'26",
        contextLine: "Clinic running on time · Next: Priya Rao (follow-up)",
        stats: [
          { label: "Queued", value: 7, color: "#64748B", tab: "Queue" },
          { label: "Follow-ups", value: 3, color: "#64748B", tab: "Follow-ups" },
          { label: "Finished", value: 0, color: "#64748B", tab: "Finished" },
          { label: "Drafts", value: 2, color: "#64748B", tab: "Draft" },
          { label: "Cancelled", value: 1, color: "#64748B", tab: "Cancelled" },
          { label: "P.Digitisation", value: 2, color: "#64748B", tab: "Pending Digitisation" },
        ],
      },
    },
  },

  {
    kind: "patient_list",
    family: "Homepage",
    label: "Patient List (Queue)",
    output: {
      kind: "patient_list",
      data: {
        title: "Today's Queue",
        items: [
          { name: "Rajesh Sharma", age: 45, gender: "M", time: "10:00 AM", status: "Waiting", statusTone: "warning" },
          { name: "Priya Patel", age: 32, gender: "F", time: "10:15 AM", status: "In Progress", statusTone: "info" },
          { name: "Amit Kumar", age: 58, gender: "M", time: "10:30 AM", status: "Queued", statusTone: "warning" },
          { name: "Sneha Gupta", age: 28, gender: "F", time: "10:45 AM", status: "Checked-in", statusTone: "success" },
        ],
        totalCount: 7,
      },
    },
  },

  {
    kind: "follow_up_list",
    family: "Homepage",
    label: "Follow-Up List",
    output: {
      kind: "follow_up_list",
      data: {
        title: "Upcoming Follow-Ups",
        items: [
          { name: "Vikram Singh", scheduledDate: "09 Mar 2026", reason: "BP recheck", isOverdue: false },
          { name: "Meera Joshi", scheduledDate: "05 Mar 2026", reason: "Post-surgery review", isOverdue: true },
          { name: "Rohit Das", scheduledDate: "07 Mar 2026", reason: "Lab results review", isOverdue: true },
        ],
        overdueCount: 2,
      },
    },
  },

  {
    kind: "revenue_bar",
    family: "Homepage",
    label: "Revenue Bar Chart",
    output: {
      kind: "revenue_bar",
      data: {
        title: "This Week's Revenue",
        totalRevenue: 48500,
        totalPaid: 35200,
        totalDue: 13300,
        totalRefunded: 1200,
        days: [
          { label: "Mon", paid: 8200, due: 1800, refunded: 220 },
          { label: "Tue", paid: 7500, due: 2500, refunded: 180 },
          { label: "Wed", paid: 6800, due: 3200, refunded: 310 },
          { label: "Thu", paid: 7200, due: 2800, refunded: 240 },
          { label: "Fri", paid: 5500, due: 3000, refunded: 250 },
        ],
      },
    },
  },

  {
    kind: "bulk_action",
    family: "Homepage",
    label: "Bulk Action Card",
    output: {
      kind: "bulk_action",
      data: {
        action: "Send Follow-Up Reminders",
        messagePreview: "Dear patient, this is a reminder for your follow-up appointment at the clinic.",
        recipients: ["Vikram Singh", "Meera Joshi", "Rohit Das", "Anita Verma"],
        totalCount: 4,
      },
    },
  },

  {
    kind: "donut_chart",
    family: "Homepage",
    label: "Donut Chart",
    output: {
      kind: "donut_chart",
      data: {
        title: "Patient Distribution by Status",
        segments: [
          { label: "Completed", value: 12, color: "#22C55E" },
          { label: "In Progress", value: 3, color: "#3B82F6" },
          { label: "Waiting", value: 5, color: "#F59E0B" },
          { label: "Cancelled", value: 1, color: "#EF4444" },
        ],
        total: 21,
        centerLabel: "Total",
      },
    },
  },

  {
    kind: "pie_chart",
    family: "Homepage",
    label: "Pie Chart",
    output: {
      kind: "pie_chart",
      data: {
        title: "Consultation Types This Week",
        segments: [
          { label: "Follow-up", value: 42, color: "#8B5CF6" },
          { label: "New Visit", value: 28, color: "#3B82F6" },
          { label: "Emergency", value: 8, color: "#EF4444" },
          { label: "Teleconsult", value: 22, color: "#22C55E" },
        ],
        total: 100,
        centerLabel: "Consults",
      },
    },
  },

  {
    kind: "line_graph",
    family: "Homepage",
    label: "Line Graph",
    output: {
      kind: "line_graph",
      data: {
        title: "Daily Patient Count (This Week)",
        points: [
          { label: "Mon", value: 18 },
          { label: "Tue", value: 22 },
          { label: "Wed", value: 15 },
          { label: "Thu", value: 24 },
          { label: "Fri", value: 20 },
          { label: "Sat", value: 12 },
        ],
        average: 18.5,
        changePercent: "+12%",
        changeDirection: "up",
      },
    },
  },

  {
    kind: "analytics_table",
    family: "Homepage",
    label: "Analytics Table",
    output: {
      kind: "analytics_table",
      data: {
        title: "Weekly KPI Dashboard",
        kpis: [
          { metric: "Patients Seen", thisWeek: "87", lastWeek: "72", delta: "+20.8%", direction: "up", isGood: true },
          { metric: "Avg Wait Time", thisWeek: "12 min", lastWeek: "18 min", delta: "-33%", direction: "down", isGood: true },
          { metric: "Revenue", thisWeek: "48.5K", lastWeek: "42.1K", delta: "+15.2%", direction: "up", isGood: true },
          { metric: "No-Shows", thisWeek: "3", lastWeek: "5", delta: "-40%", direction: "down", isGood: true },
        ],
        insight: "Strong week across all metrics. Wait times improved significantly with new queue management.",
      },
    },
  },

  {
    kind: "condition_bar",
    family: "Homepage",
    label: "Condition Distribution",
    output: {
      kind: "condition_bar",
      data: {
        title: "Top Conditions This Month",
        items: [
          { condition: "Hypertension", count: 34, color: "#EF4444" },
          { condition: "Type 2 DM", count: 28, color: "#F59E0B" },
          { condition: "URTI", count: 22, color: "#3B82F6" },
          { condition: "Arthritis", count: 15, color: "#8B5CF6" },
          { condition: "Anxiety/Depression", count: 12, color: "#22C55E" },
        ],
        note: "Hypertension remains the most common condition, consistent with last month.",
      },
    },
  },

  {
    kind: "heatmap",
    family: "Homepage",
    label: "Appointment Heatmap",
    output: {
      kind: "heatmap",
      data: {
        title: "Appointment Density (This Week)",
        rows: ["9 AM", "10 AM", "11 AM", "12 PM", "2 PM", "3 PM", "4 PM"],
        cols: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        cells: [
          [{ value: 3, intensity: "high" }, { value: 2, intensity: "medium" }, { value: 1, intensity: "low" }, { value: 3, intensity: "high" }, { value: 2, intensity: "medium" }, { value: 1, intensity: "low" }],
          [{ value: 3, intensity: "high" }, { value: 3, intensity: "high" }, { value: 2, intensity: "medium" }, { value: 3, intensity: "high" }, { value: 3, intensity: "high" }, { value: 2, intensity: "medium" }],
          [{ value: 2, intensity: "medium" }, { value: 3, intensity: "high" }, { value: 3, intensity: "high" }, { value: 2, intensity: "medium" }, { value: 2, intensity: "medium" }, { value: 1, intensity: "low" }],
          [{ value: 1, intensity: "low" }, { value: 1, intensity: "low" }, { value: 1, intensity: "low" }, { value: 1, intensity: "low" }, { value: 1, intensity: "low" }, { value: 0, intensity: "low" }],
          [{ value: 2, intensity: "medium" }, { value: 2, intensity: "medium" }, { value: 2, intensity: "medium" }, { value: 3, intensity: "high" }, { value: 2, intensity: "medium" }, { value: 1, intensity: "low" }],
          [{ value: 3, intensity: "high" }, { value: 2, intensity: "medium" }, { value: 1, intensity: "low" }, { value: 2, intensity: "medium" }, { value: 3, intensity: "high" }, { value: 0, intensity: "low" }],
          [{ value: 1, intensity: "low" }, { value: 1, intensity: "low" }, { value: 1, intensity: "low" }, { value: 1, intensity: "low" }, { value: 2, intensity: "medium" }, { value: 0, intensity: "low" }],
        ],
      },
    },
  },
  // ── H. New Card Variants ──────────────────────────────────

  {
    kind: "referral",
    family: "Utility",
    label: "Referral Card",
    output: {
      kind: "referral",
      data: {
        title: "Doctor Referral Summary (Incoming)",
        totalReferrers: 2,
        totalPatients: 5,
        items: [
          { doctorName: "Dr. Arun Mehta", doctorPhone: "9876501122", specialty: "Cardiology", patientsReferred: 3, topReason: "Chest pain and HTN review" },
          { doctorName: "Dr. Sanjay Nair", doctorPhone: "9822207711", specialty: "Ophthalmology", patientsReferred: 2, topReason: "Retinopathy screening" },
        ],
      },
    },
  },

  {
    kind: "vaccination_schedule",
    family: "Data",
    label: "Vaccination Schedule",
    output: {
      kind: "vaccination_schedule",
      data: {
        title: "Immunization Schedule",
        overdueCount: 1,
        dueCount: 2,
        givenCount: 1,
        vaccines: [
          { patientName: "Arjun S", name: "Td Booster", dose: "Booster", dueDate: "01 Mar 2026", status: "overdue" as const },
          { patientName: "Neha Gupta", name: "Influenza", dose: "Annual", dueDate: "15 Mar 2026", status: "due" as const },
          { patientName: "Vikram Singh", name: "Hepatitis B", dose: "Dose 3", dueDate: "25 Mar 2026", status: "due" as const },
          { patientName: "Priya Rao", name: "Pneumococcal", dose: "PCV13", dueDate: "20 Feb 2026", status: "given" as const },
        ],
      },
    },
  },

  {
    kind: "clinical_guideline",
    family: "Utility",
    label: "Clinical Guidelines",
    output: {
      kind: "clinical_guideline",
      data: {
        title: "Hypertension Management",
        condition: "Stage II Hypertension (BP ≥ 140/90)",
        source: "AHA/ACC 2024 Guidelines",
        recommendations: [
          "Start dual therapy: ACEi/ARB + CCB or thiazide diuretic",
          "Target BP < 130/80 for high-risk patients",
          "Lifestyle modifications: DASH diet, exercise 150min/week, sodium < 2.3g/day",
          "Recheck BP in 1 month; if at goal, follow-up every 3-6 months",
        ],
        evidenceLevel: "A",
      },
    },
  },

  {
    kind: "patient_timeline",
    family: "Data",
    label: "Patient Timeline",
    output: {
      kind: "patient_timeline",
      data: {
        title: "Clinical Timeline",
        events: [
          { date: "Mar 2026", type: "visit", summary: "Current visit — headache, dizziness, BP 152/96" },
          { date: "Feb 2026", type: "lab", summary: "HbA1c 8.2%, LDL 162 mg/dL — both elevated" },
          { date: "Dec 2025", type: "visit", summary: "Routine follow-up — BP stable at 138/88" },
          { date: "Sep 2025", type: "procedure", summary: "Coronary angiography — 40% LAD stenosis" },
          { date: "Aug 2025", type: "admission", summary: "Admitted for acute chest pain — ACS ruled out" },
        ],
      },
    },
  },

  {
    kind: "rx_preview",
    family: "Action",
    label: "Prescription Preview",
    output: {
      kind: "rx_preview",
      data: {
        patientName: "Rajesh Sharma, 45M",
        date: "09 Mar 2026",
        diagnoses: ["Hypertensive Urgency", "Type 2 Diabetes Mellitus"],
        medications: [
          "Nifedipine 10mg — SL STAT",
          "Amlodipine 10mg — OD (increased from 5mg)",
          "Telmisartan 40mg — OD (new)",
          "Metformin 500mg — BD (continue)",
        ],
        investigations: ["Renal Function Panel", "ECG", "Urine Microalbumin"],
        advice: ["Monitor BP twice daily", "Reduce salt intake", "Brisk walk 30 min daily"],
        followUp: "3 days — recheck BP after medication adjustment",
      },
    },
  },

  {
    kind: "billing_summary",
    family: "Homepage",
    label: "Billing Summary",
    output: {
      kind: "billing_summary",
      data: {
        title: "Advance Deposits: This Week",
        mode: "deposit",
        items: [
          { referenceNo: "ADV-2900567", patientName: "Tony Danza", amount: 500, status: "deposited" },
          { referenceNo: "ADV-2900571", patientName: "Templeton Peck", amount: 500, status: "deposited" },
          { referenceNo: "ADV-2900572", patientName: "Capt. Trunk", amount: 500, status: "debited" },
          { referenceNo: "ADV-2900573", patientName: "Michael Knight", amount: 800, status: "refunded" },
        ],
        totalBilledAmount: 3892,
        totalPaidFullyAmount: 1500,
        totalDueAmount: 500,
        totalRefundedAmount: 800,
        totalAdvanceReceived: 1500,
        totalAdvanceRefunded: 800,
        totalAdvanceDebited: 500,
      },
    },
  },
  {
    kind: "external_cta",
    family: "Homepage",
    label: "External CTA (Excel/Word Link)",
    output: {
      kind: "external_cta",
      data: {
        title: "Export ready: Excel",
        description: "Your requested data is prepared in spreadsheet format. Use the link below to open or download the file.",
        ctaLabel: "Open Excel file",
        ctaUrl: "https://example.com/exports/daily-collection.xlsx",
        openInNewTab: true,
      },
    },
  },

  // ── I. New Text Variants ─────────────────────────────────

  {
    kind: "text_step",
    family: "Text",
    label: "Text Step (Instructions)",
    output: {
      kind: "text_step",
      data: {
        steps: [
          "Stop Metformin 48 hours before the procedure",
          "Ensure adequate hydration (2-3L water/day)",
          "Get pre-procedure blood work: Creatinine, eGFR",
          "Resume Metformin only after eGFR is confirmed normal post-procedure",
        ],
      },
    },
  },

  {
    kind: "text_quote",
    family: "Text",
    label: "Text Quote (Clinical Reference)",
    output: {
      kind: "text_quote",
      data: {
        quote: "In patients with Stage II hypertension and diabetes, a target BP of < 130/80 mmHg is recommended to reduce cardiovascular risk.",
        source: "AHA/ACC 2024 Hypertension Guidelines, Section 4.2",
      },
    },
  },

  {
    kind: "text_comparison",
    family: "Text",
    label: "Text Comparison",
    output: {
      kind: "text_comparison",
      data: {
        labelA: "ACE Inhibitor",
        labelB: "ARB",
        itemsA: ["Cough (common side effect)", "Contraindicated with ARB", "Lower cost", "Angioedema risk"],
        itemsB: ["Better tolerated", "No cough", "Similar efficacy", "Preferred if ACEi intolerant"],
      },
    },
  },
]

// ═══════ FAMILY METADATA ═══════

const FAMILIES = [
  { id: "all", label: "All Cards", count: CATALOG.length },
  { id: "Summary", label: "Summary", count: CATALOG.filter(c => c.family === "Summary").length },
  { id: "Data", label: "Data", count: CATALOG.filter(c => c.family === "Data").length },
  { id: "Action", label: "Action", count: CATALOG.filter(c => c.family === "Action").length },
  { id: "Analysis", label: "Analysis", count: CATALOG.filter(c => c.family === "Analysis").length },
  { id: "Utility", label: "Utility", count: CATALOG.filter(c => c.family === "Utility").length },
  { id: "Safety", label: "Safety", count: CATALOG.filter(c => c.family === "Safety").length },
  { id: "Text", label: "Text", count: CATALOG.filter(c => c.family === "Text").length },
  { id: "Homepage", label: "Homepage", count: CATALOG.filter(c => c.family === "Homepage").length },
]

// ═══════ COMPONENT ═══════

function downloadAsHTML(entries: CatalogEntry[]) {
  // Capture rendered card HTML from the DOM
  const container = document.getElementById("card-catalog-grid")
  if (!container) return

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Doctor Agent — Card Catalog (${entries.length} cards)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; padding: 24px; background: #F8FAFC; color: #334155; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    .meta { font-size: 12px; color: #94A3B8; margin-bottom: 24px; }
    .card-entry { margin-bottom: 20px; page-break-inside: avoid; }
    .card-label { font-size: 11px; color: #64748B; margin-bottom: 6px; }
    .card-label code { background: #F1F5F9; padding: 1px 6px; border-radius: 4px; font-size: 10px; }
    .card-label .family { background: #EFF6FF; color: #2563EB; padding: 1px 8px; border-radius: 10px; font-size: 9px; margin-left: 8px; }
  </style>
</head>
<body>
  <h1>Doctor Agent — Card Catalog</h1>
  <p class="meta">Exported ${new Date().toLocaleDateString()} — ${entries.length} card variants</p>
  ${entries.map(e => `
  <div class="card-entry">
    <div class="card-label"><code>${e.kind}</code> <strong>${e.label}</strong> <span class="family">${e.family}</span></div>
    <pre style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:11px;overflow-x:auto;white-space:pre-wrap;">${JSON.stringify(e.output, null, 2)}</pre>
  </div>`).join("\n")}
</body>
</html>`

  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `card-catalog-${entries.length}-cards.html`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadAsJSON(entries: CatalogEntry[]) {
  const data = entries.map(e => ({
    kind: e.kind,
    family: e.family,
    label: e.label,
    data: e.output.data,
  }))
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `card-catalog-${entries.length}-cards.json`
  a.click()
  URL.revokeObjectURL(url)
}

function printAsPDF() {
  window.print()
}

export function CardCatalogLive() {
  const [activeFamily, setActiveFamily] = useState("all")

  const filtered = activeFamily === "all"
    ? CATALOG
    : CATALOG.filter(c => c.family === activeFamily)

  return (
    <div>
      {/* Download toolbar */}
      <div className="mb-3 flex items-center gap-[8px] rounded-[8px] bg-gray-50 px-3 py-[8px] print:hidden">
        <span className="text-[11px] font-medium text-gray-500">Export:</span>
        <button
          type="button"
          onClick={() => downloadAsHTML(filtered)}
          className="rounded-[6px] bg-white px-2.5 py-[4px] text-[11px] font-medium text-blue-600 shadow-sm ring-1 ring-gray-200 hover:bg-blue-50 transition-all"
        >
          HTML
        </button>
        <button
          type="button"
          onClick={() => downloadAsJSON(filtered)}
          className="rounded-[6px] bg-white px-2.5 py-[4px] text-[11px] font-medium text-blue-600 shadow-sm ring-1 ring-gray-200 hover:bg-blue-50 transition-all"
        >
          JSON
        </button>
        <button
          type="button"
          onClick={printAsPDF}
          className="rounded-[6px] bg-white px-2.5 py-[4px] text-[11px] font-medium text-blue-600 shadow-sm ring-1 ring-gray-200 hover:bg-blue-50 transition-all"
        >
          PDF (Print)
        </button>
        <span className="ml-auto text-[10px] text-gray-400">{filtered.length} cards</span>
      </div>

      {/* Family filter bar */}
      <div className="mb-4 flex flex-wrap gap-[6px] print:hidden">
        {FAMILIES.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFamily(f.id)}
            className={`rounded-full px-3 py-[5px] text-[11px] font-medium transition-all ${
              activeFamily === f.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div id="card-catalog-grid" className="columns-1 md:columns-2 gap-6">
        {filtered.map((entry, idx) => (
          <div key={entry.kind + idx} className="mb-6 break-inside-avoid">
            {/* Label */}
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                {entry.kind}
              </span>
              <span className="text-[11px] font-semibold text-gray-700">{entry.label}</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-medium text-blue-600">
                {entry.family}
              </span>
            </div>

            {/* Live card rendering */}
            <div className="w-full">
              <CardRenderer
                output={entry.output}
                onPillTap={(label) => { /* no-op for demo */ }}
                onCopy={() => { /* no-op for demo */ }}
                onSidebarNav={() => { /* no-op for demo */ }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Count */}
      <div className="mt-4 text-center text-[11px] text-gray-400">
        Showing {filtered.length} of {CATALOG.length} card variants
      </div>
    </div>
  )
}

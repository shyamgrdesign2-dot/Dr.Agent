"use client"

/**
 * ══════════════════════════════════════════════════════════════════
 * Rx Experiment — Clinical Prescription Figma Component Set Export
 * ══════════════════════════════════════════════════════════════════
 *
 * 7 component groups for point-and-click Rx writing workflow.
 * Each group becomes a separate Figma component set.
 *
 * Groups:
 *   A: SearchChipCard  — Section cards with search + chips     (16)
 *   B: VitalField      — Individual vital sign input fields     (24)
 *   C: MedicationRow   — Table row variants for med list        (11)
 *   D: RichTextArea    — Text editor with formatting toolbar    (9)
 *   E: FollowUpSelector— Date + duration chip picker            (3)
 *   F: NotesField      — Simple text area                       (2)
 *   G: RxChip          — Atomic selectable chip                  (32)
 *
 * Tiers: Core (26) / All States (78) / Full (97)
 *
 * All token values sourced from lib/component-tokens.ts
 * ══════════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { Download, Copy, Check, Code2 } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   TOKENS — TP Design System values for Rx components
   ═══════════════════════════════════════════════════════════════════ */

const T = {
  fontFamily: "Inter, sans-serif",

  card: {
    bg: "#FFFFFF", border: "#E2E2EA", radius: "16px",
    padding: "18px", shadow: "0 1px 3px rgba(23,23,37,0.08)",
  },

  input: {
    height: 42, radius: "10px", border: "#E2E2EA",
    borderFocus: "#4B4AD5", borderError: "#E11D48",
    bg: "#FFFFFF", bgDisabled: "#F8F8FC",
    text: "#171725", placeholder: "#A2A2A8", iconColor: "#A2A2A8",
    fontSize: "14px", shadow: "0 1px 2px rgba(23,23,37,0.04)",
    focusRing: "0 0 0 3px rgba(75,74,213,0.10)",
  },

  table: {
    headerBg: "#F8F8FC", headerText: "#454551",
    rowBg: "#FFFFFF", rowHover: "#F8F8FC",
    border: "#F1F1F5", cellPadX: 16, cellPadY: 12,
    radius: "12px", fontSize: "14px",
  },

  chip: {
    bg: "#F1F1F5", bgHover: "#E2E2EA",
    bgSelected: "#EEEEFF", bgDisabled: "#F8F8FC",
    text: "#454551", textSelected: "#4B4AD5", textDisabled: "#A2A2A8",
    radius: "8px", fontSize: "13px", fontWeight: "500",
    sm: { px: 8, py: 4, fontSize: "11px" },
    md: { px: 12, py: 6, fontSize: "13px" },
  },

  toolbar: {
    iconSize: 20, iconColor: "#717179", iconActive: "#4B4AD5",
    gap: 4, bg: "#F8F8FC", radius: "8px", padding: "6px 8px",
  },

  section: {
    symptoms: "#4B4AD5", examinations: "#10B981",
    diagnosis: "#F59E0B", labInvestigation: "#E11D48",
    medication: "#4B4AD5", advice: "#7C3AED",
    followUp: "#10B981", notes: "#717179",
  },

  text: {
    heading: "#171725", body: "#454551",
    muted: "#717179", faint: "#A2A2A8",
  },
}

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type ComponentGroup = "SearchChipCard" | "VitalField" | "MedicationRow" | "RichTextArea" | "FollowUpSelector" | "NotesField" | "RxChip"
type ExportTier = "core" | "all-states" | "full"

type SectionType = "Symptoms" | "Examinations" | "Diagnosis" | "LabInvestigation"
type CardState = "Empty" | "WithChips" | "Searching" | "ChipSelected"

type VitalType = "BloodPressure" | "Temperature" | "Weight" | "Height" | "Pulse" | "SpO2" | "BMI" | "RespiratoryRate"
type VitalState = "Empty" | "Filled" | "Error"

type MedRowType = "Header" | "Data" | "Search"
type MedRowState = "Empty" | "Filled" | "Editing" | "Hover"
type MedSearchState = "Empty" | "Searching"

type RichTextState = "Empty" | "WithContent" | "Dictating"
type ToolbarMode = "Full" | "Minimal" | "Hidden"

type FollowUpState = "Empty" | "DateSelected" | "ChipSelected"
type NotesState = "Empty" | "Filled"

type ChipType = "Symptom" | "Diagnosis" | "Duration" | "Medicine"
type ChipState = "Default" | "Hover" | "Selected" | "Disabled"
type ChipSize = "Small" | "Medium"

/* ═══════════════════════════════════════════════════════════════════
   INLINE SVG ICONS (17 icons for HTML export)
   ═══════════════════════════════════════════════════════════════════ */

function ico(name: string, size = 20, color = T.input.iconColor): string {
  const s = String(size)
  const map: Record<string, string> = {
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
    gripVertical: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
    trash2: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
    bold: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>`,
    list: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
    listOrdered: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>`,
    mic: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    share: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>`,
    maximize: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>`,
    thermometer: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>`,
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    activity: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`,
  }
  return map[name] || ""
}

/* ═══════════════════════════════════════════════════════════════════
   CONFIG MAPS
   ═══════════════════════════════════════════════════════════════════ */

const SECTION_CFG: Record<SectionType, { title: string; color: string; icon: string; chips: string[] }> = {
  Symptoms: { title: "Symptoms", color: T.section.symptoms, icon: "activity", chips: ["Fever", "Cough", "Headache", "Body Pain", "Cold", "Sore Throat", "Nausea", "Fatigue"] },
  Examinations: { title: "Examinations", color: T.section.examinations, icon: "thermometer", chips: ["BP Check", "Auscultation", "Palpation", "Percussion", "ENT Exam", "Eye Exam"] },
  Diagnosis: { title: "Diagnosis", color: T.section.diagnosis, icon: "activity", chips: ["Viral Fever", "URTI", "Gastritis", "Migraine", "Hypertension", "Diabetes"] },
  LabInvestigation: { title: "Lab Investigation", color: T.section.labInvestigation, icon: "activity", chips: ["CBC", "LFT", "RFT", "HbA1c", "Lipid Profile", "Thyroid", "Urine R/M", "ESR"] },
}

const VITAL_CFG: Record<VitalType, { label: string; unit: string; placeholder: string; value: string }> = {
  BloodPressure: { label: "Blood Pressure", unit: "mmHg", placeholder: "120/80", value: "130/85" },
  Temperature: { label: "Temperature", unit: "\u00B0F", placeholder: "98.6", value: "101.2" },
  Weight: { label: "Weight", unit: "kg", placeholder: "0", value: "72" },
  Height: { label: "Height", unit: "cm", placeholder: "0", value: "175" },
  Pulse: { label: "Pulse", unit: "bpm", placeholder: "72", value: "88" },
  SpO2: { label: "SpO\u2082", unit: "%", placeholder: "98", value: "96" },
  BMI: { label: "BMI", unit: "kg/m\u00B2", placeholder: "0.0", value: "23.5" },
  RespiratoryRate: { label: "Resp. Rate", unit: "/min", placeholder: "16", value: "22" },
}

const CHIP_LABELS: Record<ChipType, string> = {
  Symptom: "Fever", Diagnosis: "Viral Fever", Duration: "5 Days", Medicine: "Paracetamol",
}

const FOLLOWUP_DURATIONS = ["2 Days", "5 Days", "1 Week", "2 Weeks", "1 Month"]

const MED_COLS = ["Medicine", "Dose", "Frequency", "When", "Duration", "Note"]
const MED_FILLED = ["Paracetamol 500mg", "1 tab", "TID", "After food", "5 days", "If fever"]

/* ═══════════════════════════════════════════════════════════════════
   DIMENSION ARRAYS
   ═══════════════════════════════════════════════════════════════════ */

const ALL_SECTIONS: SectionType[] = ["Symptoms", "Examinations", "Diagnosis", "LabInvestigation"]
const ALL_CARD_STATES: CardState[] = ["Empty", "WithChips", "Searching", "ChipSelected"]
const ALL_VITAL_TYPES: VitalType[] = ["BloodPressure", "Temperature", "Weight", "Height", "Pulse", "SpO2", "BMI", "RespiratoryRate"]
const ALL_VITAL_STATES: VitalState[] = ["Empty", "Filled", "Error"]
const ALL_CHIP_TYPES: ChipType[] = ["Symptom", "Diagnosis", "Duration", "Medicine"]
const ALL_CHIP_STATES: ChipState[] = ["Default", "Hover", "Selected", "Disabled"]
const ALL_CHIP_SIZES: ChipSize[] = ["Small", "Medium"]
const ALL_RICH_STATES: RichTextState[] = ["Empty", "WithContent", "Dictating"]
const ALL_TOOLBAR_MODES: ToolbarMode[] = ["Full", "Minimal", "Hidden"]
const ALL_FOLLOWUP_STATES: FollowUpState[] = ["Empty", "DateSelected", "ChipSelected"]
const ALL_NOTES_STATES: NotesState[] = ["Empty", "Filled"]
const ALL_MED_ROW_STATES: MedRowState[] = ["Empty", "Filled", "Editing", "Hover"]
const ALL_GROUPS: ComponentGroup[] = ["SearchChipCard", "VitalField", "MedicationRow", "RichTextArea", "FollowUpSelector", "NotesField", "RxChip"]

/* ═══════════════════════════════════════════════════════════════════
   VARIANT COUNTING
   ═══════════════════════════════════════════════════════════════════ */

function getGroupCount(group: ComponentGroup, tier: ExportTier): number {
  switch (group) {
    case "SearchChipCard": {
      const s = tier === "core" ? 2 : 4, st = tier === "core" ? 2 : 4
      return s * st
    }
    case "VitalField": {
      const vt = tier === "core" ? 4 : 8, vs = tier === "core" ? 2 : 3
      return vt * vs
    }
    case "MedicationRow": {
      const ds = tier === "core" ? 2 : 4, ac = tier === "core" ? 1 : 2
      const ss = tier === "core" ? 1 : 2
      return 1 + (ds * ac) + ss
    }
    case "RichTextArea": {
      const rs = tier === "core" ? 2 : 3
      const tb = tier === "core" ? 1 : (tier === "all-states" ? 2 : 3)
      return rs * tb
    }
    case "FollowUpSelector": return tier === "core" ? 2 : 3
    case "NotesField": return 2
    case "RxChip": {
      const ct = tier === "core" ? 2 : 4, cs = tier === "core" ? 2 : 4
      const sz = tier === "full" ? 2 : 1
      return ct * cs * sz
    }
  }
}

function getTotalCount(tier: ExportTier): number {
  return ALL_GROUPS.reduce((sum, g) => sum + getGroupCount(g, tier), 0)
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED HTML HELPERS
   ═══════════════════════════════════════════════════════════════════ */

/** Light tint from a hex color (mix with white at 10%) */
function tint(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * 0.88)
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`
}

/** Action button (ghost icon button) */
function actionBtn(iconName: string): string {
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;cursor:pointer">${ico(iconName, 16, T.text.muted)}</span>`
}

/** Search input bar */
function searchBar(placeholder: string, value = "", isActive = false): string {
  const bdr = isActive ? T.input.borderFocus : T.input.border
  const bw = isActive ? "2px" : "1px"
  const txt = value || `<span style="color:${T.input.placeholder}">${placeholder}</span>`
  const ring = isActive ? `;box-shadow:${T.input.focusRing}` : ""
  return `<span style="display:flex;align-items:center;gap:8px;height:${T.input.height}px;border-radius:${T.input.radius};border:${bw} solid ${bdr};padding:0 12px;background:${T.input.bg};font-size:${T.input.fontSize};font-family:${T.fontFamily}${ring}">${ico("search", 18, T.input.iconColor)}<span style="flex:1;color:${value ? T.input.text : T.input.placeholder};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${value || placeholder}</span></span>`
}

/** Single chip HTML */
function chipHTML(label: string, state: ChipState, size: ChipSize): string {
  const sz = size === "Small" ? T.chip.sm : T.chip.md
  const bgMap: Record<ChipState, string> = { Default: T.chip.bg, Hover: T.chip.bgHover, Selected: T.chip.bgSelected, Disabled: T.chip.bgDisabled }
  const textMap: Record<ChipState, string> = { Default: T.chip.text, Hover: T.chip.text, Selected: T.chip.textSelected, Disabled: T.chip.textDisabled }
  const opacity = state === "Disabled" ? ";opacity:0.6" : ""
  return `<span style="display:inline-flex;align-items:center;padding:${sz.py}px ${sz.px}px;border-radius:${T.chip.radius};background:${bgMap[state]};color:${textMap[state]};font-size:${sz.fontSize};font-weight:${T.chip.fontWeight};font-family:${T.fontFamily};cursor:${state === "Disabled" ? "not-allowed" : "pointer"};white-space:nowrap${opacity}">${label}</span>`
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP A: SearchChipCard HTML Builder
   ═══════════════════════════════════════════════════════════════════ */

function makeSearchChipCard(section: SectionType, state: CardState): string {
  const cfg = SECTION_CFG[section]
  const figmaName = `Section=${section}, State=${state}`
  const safeId = figmaName.replace(/\s/g, "").replace(/,/g, "_")

  // Header
  const header = `<span style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="width:32px;height:32px;border-radius:8px;background:${tint(cfg.color)};display:flex;align-items:center;justify-content:center">${ico(cfg.icon, 18, cfg.color)}</span><span style="flex:1;font-size:16px;font-weight:600;color:${T.text.heading};font-family:${T.fontFamily}">${cfg.title}</span><span style="display:flex;gap:2px">${actionBtn("copy")}${actionBtn("share")}${actionBtn("maximize")}</span></span>`

  // Search bar
  const isSearching = state === "Searching"
  const searchVal = isSearching ? "Fev" : ""
  const search = searchBar(`Search ${cfg.title.toLowerCase()}\u2026`, searchVal, isSearching)

  // Chips
  let chips = ""
  if (state !== "Empty") {
    const chipCount = state === "Searching" ? 3 : cfg.chips.length
    const selectedIdx = state === "ChipSelected" ? [0, 2] : []
    const chipItems = cfg.chips.slice(0, chipCount).map((c, i) => {
      const cState = selectedIdx.includes(i) ? "Selected" : "Default"
      return chipHTML(c, cState as ChipState, "Medium")
    }).join("")
    chips = `<span style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${chipItems}</span>`
  }

  return `<section id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;flex-direction:column;width:360px;padding:${T.card.padding};border-radius:${T.card.radius};border:1px solid ${T.card.border};background:${T.card.bg};box-shadow:${T.card.shadow};font-family:${T.fontFamily}">${header}${search}${chips}</section>`
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP B: VitalField HTML Builder
   ═══════════════════════════════════════════════════════════════════ */

function makeVitalField(vitalType: VitalType, state: VitalState): string {
  const cfg = VITAL_CFG[vitalType]
  const figmaName = `VitalType=${vitalType}, State=${state}`
  const safeId = figmaName.replace(/\s/g, "").replace(/,/g, "_")

  const borderColor = state === "Error" ? T.input.borderError : (state === "Filled" ? "#A2A2A8" : T.input.border)
  const borderWidth = state === "Error" ? "2px" : "1px"
  const textColor = state === "Empty" ? T.input.placeholder : T.input.text
  const textValue = state === "Empty" ? cfg.placeholder : cfg.value
  const ringStyle = state === "Error" ? `;box-shadow:0 0 0 3px rgba(225,29,72,0.10)` : ""

  // Error message
  const errorMsg = state === "Error" ? `<span style="font-size:12px;color:${T.input.borderError};margin-top:4px">Value out of range</span>` : ""

  return `<label id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;flex-direction:column;gap:4px;font-family:${T.fontFamily};width:160px"><span style="font-size:12px;font-weight:500;color:${T.text.body}">${cfg.label}</span><span style="display:flex;align-items:center;height:38px;border-radius:${T.input.radius};border:${borderWidth} solid ${borderColor};background:${T.input.bg};padding:0 10px;gap:6px${ringStyle}"><span style="flex:1;font-size:14px;color:${textColor};font-family:${T.fontFamily}">${textValue}</span><span style="font-size:12px;color:${T.text.faint};font-weight:500;white-space:nowrap">${cfg.unit}</span></span>${errorMsg}</label>`
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP C: MedicationRow HTML Builder
   ═══════════════════════════════════════════════════════════════════ */

function makeMedHeader(): string {
  const figmaName = "RowType=Header"
  const safeId = "RowType_Header"

  const cells = MED_COLS.map(col =>
    `<span style="flex:${col === "Medicine" ? 2 : 1};padding:${T.table.cellPadY}px ${T.table.cellPadX}px;font-size:12px;font-weight:600;color:${T.table.headerText};text-transform:uppercase;letter-spacing:0.05em">${col}</span>`
  ).join("")

  return `<article id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;align-items:center;width:800px;border-radius:${T.table.radius} ${T.table.radius} 0 0;background:${T.table.headerBg};border:1px solid ${T.table.border};font-family:${T.fontFamily}"><span style="width:36px;display:flex;justify-content:center">${ico("gripVertical", 16, T.text.faint)}</span>${cells}<span style="width:36px"></span></article>`
}

function makeMedDataRow(state: MedRowState, actions: string): string {
  const figmaName = `RowType=Data, State=${state}, Actions=${actions}`
  const safeId = figmaName.replace(/\s/g, "").replace(/,/g, "_")

  const hasActions = actions === "True"
  const bgColor = state === "Hover" ? T.table.rowHover : T.table.rowBg
  const isEmpty = state === "Empty"
  const isEditing = state === "Editing"

  const cells = MED_COLS.map((col, i) => {
    const flex = col === "Medicine" ? 2 : 1
    let content = isEmpty ? `<span style="color:${T.input.placeholder}">${col}</span>` : MED_FILLED[i]
    let cellBorder = ""

    if (isEditing && i === 0) {
      cellBorder = `;border:2px solid ${T.input.borderFocus};border-radius:6px;box-shadow:${T.input.focusRing}`
      content = `${MED_FILLED[i]}<span style="display:inline;border-left:2px solid ${T.input.borderFocus};margin-left:2px;animation:blink 1s step-end infinite"></span>`
    }

    if (col === "When" && !isEmpty) {
      content = `<span style="display:inline-flex;align-items:center;gap:4px">${MED_FILLED[i]}${ico("chevronDown", 14, T.text.faint)}</span>`
    }

    return `<span style="flex:${flex};padding:${T.table.cellPadY}px ${T.table.cellPadX}px;font-size:${T.table.fontSize};color:${isEmpty ? T.input.placeholder : T.text.body};font-family:${T.fontFamily}${cellBorder}">${content}</span>`
  }).join("")

  const dragHandle = hasActions ? `<span style="width:36px;display:flex;justify-content:center;cursor:grab">${ico("gripVertical", 16, T.text.faint)}</span>` : `<span style="width:36px"></span>`
  const deleteBtn = hasActions ? `<span style="width:36px;display:flex;justify-content:center;cursor:pointer">${ico("trash2", 16, "#E11D48")}</span>` : `<span style="width:36px"></span>`

  return `<article id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;align-items:center;width:800px;background:${bgColor};border:1px solid ${T.table.border};border-top:none;font-family:${T.fontFamily}">${dragHandle}${cells}${deleteBtn}</article>`
}

function makeMedSearchRow(state: MedSearchState): string {
  const figmaName = `RowType=Search, State=${state}`
  const safeId = figmaName.replace(/\s/g, "").replace(/,/g, "_")
  const isSearching = state === "Searching"

  const searchContent = `<span style="display:flex;align-items:center;gap:8px;flex:1;height:36px;border-radius:8px;border:${isSearching ? "2px" : "1px"} solid ${isSearching ? T.input.borderFocus : T.input.border};padding:0 10px;background:${T.input.bg};font-size:13px;font-family:${T.fontFamily}${isSearching ? `;box-shadow:${T.input.focusRing}` : ""}">${ico("search", 16, T.input.iconColor)}<span style="flex:1;color:${isSearching ? T.input.text : T.input.placeholder}">${isSearching ? "Parace" : "Search medicine\u2026"}</span></span>`

  const chips = isSearching
    ? `<span style="display:flex;gap:6px;margin-left:8px">${chipHTML("Paracetamol 500mg", "Default", "Small")}${chipHTML("Paracetamol 650mg", "Default", "Small")}</span>`
    : ""

  return `<article id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;align-items:center;width:800px;padding:8px ${T.table.cellPadX}px;background:${T.card.bg};border:1px solid ${T.table.border};border-top:none;border-radius:0 0 ${T.table.radius} ${T.table.radius};font-family:${T.fontFamily}">${searchContent}${chips}</article>`
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP D: RichTextArea HTML Builder
   ═══════════════════════════════════════════════════════════════════ */

function makeRichTextArea(state: RichTextState, toolbar: ToolbarMode): string {
  const figmaName = `State=${state}, Toolbar=${toolbar}`
  const safeId = `Rich_${figmaName.replace(/\s/g, "").replace(/,/g, "_")}`

  const isEmpty = state === "Empty"
  const isDictating = state === "Dictating"
  const textContent = isEmpty
    ? `<span style="color:${T.input.placeholder}">Type your advice here\u2026</span>`
    : isDictating
    ? `Take rest for 2 days. Drink plenty of fluids.<span style="display:inline;border-left:2px solid ${T.section.advice};margin-left:2px;animation:blink 1s step-end infinite"></span>`
    : "Take rest for 2 days. Drink plenty of fluids. Avoid oily and spicy food. Follow-up if symptoms persist."

  // Toolbar
  let toolbarHTML = ""
  if (toolbar !== "Hidden") {
    const toolbarIcons = toolbar === "Full"
      ? [
          { name: "bold", active: false },
          { name: "list", active: false },
          { name: "listOrdered", active: false },
          { name: "mic", active: isDictating },
          { name: "sparkles", active: false },
        ]
      : [{ name: "bold", active: false }]

    const buttons = toolbarIcons.map(({ name, active }) =>
      `<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;cursor:pointer;${active ? `background:${tint(T.section.advice)}` : ""}">${ico(name, T.toolbar.iconSize, active ? T.toolbar.iconActive : T.toolbar.iconColor)}</span>`
    ).join("")

    const autofillBtn = toolbar === "Full"
      ? `<span style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:500;color:${T.section.advice};background:${tint(T.section.advice)};cursor:pointer;white-space:nowrap">Autofill From OPD</span>`
      : ""

    toolbarHTML = `<span style="display:flex;align-items:center;gap:${T.toolbar.gap}px;padding:${T.toolbar.padding};background:${T.toolbar.bg};border-radius:0 0 ${T.input.radius} ${T.input.radius};border-top:1px solid ${T.card.border}">${buttons}${autofillBtn}</span>`
  }

  const textAreaBorderRadius = toolbar !== "Hidden"
    ? `${T.input.radius} ${T.input.radius} 0 0`
    : T.input.radius

  return `<section id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;flex-direction:column;width:360px;font-family:${T.fontFamily}"><span style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="width:32px;height:32px;border-radius:8px;background:${tint(T.section.advice)};display:flex;align-items:center;justify-content:center">${ico("sparkles", 18, T.section.advice)}</span><span style="font-size:16px;font-weight:600;color:${T.text.heading}">Advice</span></span><span style="display:flex;flex-direction:column;border:1px solid ${T.card.border};border-radius:${T.input.radius};box-shadow:${T.input.shadow}"><span style="min-height:80px;padding:12px;font-size:${T.input.fontSize};color:${T.input.text};line-height:1.6;border-radius:${textAreaBorderRadius};background:${T.input.bg}">${textContent}</span>${toolbarHTML}</span></section>`
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP E: FollowUpSelector HTML Builder
   ═══════════════════════════════════════════════════════════════════ */

function makeFollowUpSelector(state: FollowUpState): string {
  const figmaName = `State=${state}`
  const safeId = `FollowUp_${state}`

  const hasDate = state === "DateSelected"
  const hasChip = state === "ChipSelected"

  // Date input
  const dateValue = hasDate ? "2025-03-15" : ""
  const dateBorder = hasDate ? "#A2A2A8" : T.input.border
  const dateInput = `<span style="display:flex;align-items:center;gap:8px;height:${T.input.height}px;border-radius:${T.input.radius};border:1px solid ${dateBorder};padding:0 12px;background:${T.input.bg};flex:1">${ico("calendar", 18, T.input.iconColor)}<span style="flex:1;font-size:${T.input.fontSize};color:${dateValue ? T.input.text : T.input.placeholder};font-family:${T.fontFamily}">${dateValue || "Select date"}</span></span>`

  // Duration chips
  const durationChips = FOLLOWUP_DURATIONS.map((d, i) => {
    const isSelected = hasChip && i === 2 // "1 Week" selected
    return chipHTML(d, isSelected ? "Selected" : "Default", "Medium")
  }).join("")

  return `<section id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;flex-direction:column;width:360px;padding:${T.card.padding};border-radius:${T.card.radius};border:1px solid ${T.card.border};background:${T.card.bg};box-shadow:${T.card.shadow};font-family:${T.fontFamily}"><span style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="width:32px;height:32px;border-radius:8px;background:${tint(T.section.followUp)};display:flex;align-items:center;justify-content:center">${ico("calendar", 18, T.section.followUp)}</span><span style="font-size:16px;font-weight:600;color:${T.text.heading}">Follow-up</span></span>${dateInput}<span style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${durationChips}</span></section>`
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP F: NotesField HTML Builder
   ═══════════════════════════════════════════════════════════════════ */

function makeNotesField(state: NotesState): string {
  const figmaName = `State=${state}`
  const safeId = `Notes_${state}`

  const isEmpty = state === "Empty"
  const textContent = isEmpty
    ? `<span style="color:${T.input.placeholder}">Add additional notes\u2026</span>`
    : "Patient advised to avoid strenuous activity. Referred to specialist if no improvement in 1 week."

  return `<section id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;flex-direction:column;width:360px;padding:${T.card.padding};border-radius:${T.card.radius};border:1px solid ${T.card.border};background:${T.card.bg};box-shadow:${T.card.shadow};font-family:${T.fontFamily}"><span style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="width:32px;height:32px;border-radius:8px;background:${tint(T.section.notes)};display:flex;align-items:center;justify-content:center">${ico("list", 18, T.section.notes)}</span><span style="font-size:16px;font-weight:600;color:${T.text.heading}">Notes</span></span><span style="min-height:80px;padding:12px;font-size:${T.input.fontSize};color:${isEmpty ? T.input.placeholder : T.input.text};line-height:1.6;border-radius:${T.input.radius};border:1px solid ${T.input.border};background:${T.input.bg}">${textContent}</span></section>`
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP G: RxChip HTML Builder (atomic)
   ═══════════════════════════════════════════════════════════════════ */

function makeRxChip(chipType: ChipType, state: ChipState, size: ChipSize): string {
  const figmaName = `ChipType=${chipType}, State=${state}, Size=${size}`
  const safeId = figmaName.replace(/\s/g, "").replace(/,/g, "_")
  const label = CHIP_LABELS[chipType]

  const sz = size === "Small" ? T.chip.sm : T.chip.md
  const bgMap: Record<ChipState, string> = { Default: T.chip.bg, Hover: T.chip.bgHover, Selected: T.chip.bgSelected, Disabled: T.chip.bgDisabled }
  const textMap: Record<ChipState, string> = { Default: T.chip.text, Hover: T.chip.text, Selected: T.chip.textSelected, Disabled: T.chip.textDisabled }
  const opacity = state === "Disabled" ? ";opacity:0.6" : ""

  return `<span id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:inline-flex;align-items:center;padding:${sz.py}px ${sz.px}px;border-radius:${T.chip.radius};background:${bgMap[state]};color:${textMap[state]};font-size:${sz.fontSize};font-weight:${T.chip.fontWeight};font-family:${T.fontFamily};cursor:${state === "Disabled" ? "not-allowed" : "pointer"};white-space:nowrap${opacity}">${label}</span>`
}

/* ═══════════════════════════════════════════════════════════════════
   HTML EXPORT GENERATOR — Pure design system output
   ═══════════════════════════════════════════════════════════════════ */

function generateExperimentHTML(tier: ExportTier, groups?: ComponentGroup[]): string {
  const activeGroups = groups || ALL_GROUPS
  const elements: string[] = []

  // Group A: SearchChipCard
  if (activeGroups.includes("SearchChipCard")) {
    const sections: SectionType[] = tier === "core" ? ["Symptoms", "Diagnosis"] : ALL_SECTIONS
    const states: CardState[] = tier === "core" ? ["Empty", "WithChips"] : ALL_CARD_STATES
    for (const s of sections) for (const st of states) elements.push(makeSearchChipCard(s, st))
  }

  // Group B: VitalField
  if (activeGroups.includes("VitalField")) {
    const types: VitalType[] = tier === "core"
      ? ["BloodPressure", "Temperature", "Weight", "Pulse"]
      : ALL_VITAL_TYPES
    const states: VitalState[] = tier === "core" ? ["Empty", "Filled"] : ALL_VITAL_STATES
    for (const vt of types) for (const vs of states) elements.push(makeVitalField(vt, vs))
  }

  // Group C: MedicationRow
  if (activeGroups.includes("MedicationRow")) {
    elements.push(makeMedHeader())
    const dataStates: MedRowState[] = tier === "core" ? ["Empty", "Filled"] : ALL_MED_ROW_STATES
    const actions = tier === "core" ? ["True"] : ["True", "False"]
    for (const ds of dataStates) for (const ac of actions) elements.push(makeMedDataRow(ds, ac))
    const searchStates: MedSearchState[] = tier === "core" ? ["Empty"] : ["Empty", "Searching"]
    for (const ss of searchStates) elements.push(makeMedSearchRow(ss))
  }

  // Group D: RichTextArea
  if (activeGroups.includes("RichTextArea")) {
    const states: RichTextState[] = tier === "core" ? ["Empty", "WithContent"] : ALL_RICH_STATES
    const toolbars: ToolbarMode[] = tier === "core" ? ["Full"] : (tier === "all-states" ? ["Full", "Minimal"] : ALL_TOOLBAR_MODES)
    for (const st of states) for (const tb of toolbars) elements.push(makeRichTextArea(st, tb))
  }

  // Group E: FollowUpSelector
  if (activeGroups.includes("FollowUpSelector")) {
    const states: FollowUpState[] = tier === "core" ? ["Empty", "ChipSelected"] : ALL_FOLLOWUP_STATES
    for (const st of states) elements.push(makeFollowUpSelector(st))
  }

  // Group F: NotesField
  if (activeGroups.includes("NotesField")) {
    for (const st of ALL_NOTES_STATES) elements.push(makeNotesField(st))
  }

  // Group G: RxChip
  if (activeGroups.includes("RxChip")) {
    const types: ChipType[] = tier === "core" ? ["Symptom", "Medicine"] : ALL_CHIP_TYPES
    const states: ChipState[] = tier === "core" ? ["Default", "Selected"] : ALL_CHIP_STATES
    const sizes: ChipSize[] = tier === "full" ? ALL_CHIP_SIZES : ["Medium"]
    for (const ct of types) for (const cs of states) for (const sz of sizes) elements.push(makeRxChip(ct, cs, sz))
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TP Rx Component Set</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Inter, sans-serif; background: #F8F8FC; padding: 40px; display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; }
@keyframes blink { 50% { opacity: 0; } }
</style>
</head>
<body>
${elements.join("\n")}
</body>
</html>`
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORT HANDLERS
   ═══════════════════════════════════════════════════════════════════ */

function downloadExperimentHTML(tier: ExportTier, groups?: ComponentGroup[]) {
  const html = generateExperimentHTML(tier, groups)
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `tp-rx-component-set-${tier}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ═══════════════════════════════════════════════════════════════════
   FIGMA RENAME SCRIPT
   ═══════════════════════════════════════════════════════════════════ */

const FIGMA_RENAME_SCRIPT = `// Figma Plugin Console Script — Auto-rename imported Rx component layers
// Run after importing HTML via html.to.design.
// Walks every imported frame and renames using the title/data-name attribute.

function renameRxLayers() {
  const page = figma.currentPage;
  let renamed = 0;

  // Target layer names from html.to.design (based on HTML tag)
  const targetNames = ["section", "label", "article", "span"];

  function walk(node) {
    if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
      const name = node.name.toLowerCase();
      if (targetNames.includes(name)) {
        // Try to find the figma name from child text or node properties
        const figmaName = findFigmaName(node);
        if (figmaName) {
          node.name = figmaName;
          renamed++;
        }
      }
      if ("children" in node) {
        for (const child of node.children) { walk(child); }
      }
    }
  }

  function findFigmaName(node) {
    // html.to.design often preserves title/class as custom data
    // Check if the frame has a name matching variant pattern
    if (node.name.includes("=")) return node.name;

    // Heuristic: use size/position to determine group
    const w = node.width;
    const h = node.height;

    // SearchChipCard: ~360px wide, section tag
    // VitalField: ~160px wide, label tag
    // MedicationRow: ~800px wide, article tag
    // RichTextArea: ~360px wide, section tag
    // FollowUpSelector: ~360px wide, section tag
    // NotesField: ~360px wide, section tag
    // RxChip: small span

    return null; // Manual rename needed if auto-detect fails
  }

  walk(page);
  figma.notify("Renamed " + renamed + " Rx component layers");
}

renameRxLayers();
figma.closePlugin();`

function copyRenameScript() {
  navigator.clipboard.writeText(FIGMA_RENAME_SCRIPT)
}

/* ═══════════════════════════════════════════════════════════════════
   TIER INFO
   ═══════════════════════════════════════════════════════════════════ */

const TIER_INFO: Record<ExportTier, { label: string; desc: string }> = {
  core: {
    label: "Core",
    desc: "Essential variants only — key sections, default states, medium chips",
  },
  "all-states": {
    label: "All States",
    desc: "All sections and states — single chip size",
  },
  full: {
    label: "Full",
    desc: "Every combination — all sections, states, chip sizes, toolbar modes",
  },
}

/* ═══════════════════════════════════════════════════════════════════
   GROUP INFO
   ═══════════════════════════════════════════════════════════════════ */

const GROUP_INFO: Record<ComponentGroup, { label: string; tag: string; desc: string; color: string }> = {
  SearchChipCard: { label: "Search + Chips Card", tag: "A", desc: "Section cards with search input and selectable chip grid", color: T.section.symptoms },
  VitalField: { label: "Vital Field", tag: "B", desc: "Individual vital sign input with label and unit suffix", color: T.section.examinations },
  MedicationRow: { label: "Medication Row", tag: "C", desc: "Table rows for medication list — header, data, and search", color: T.section.medication },
  RichTextArea: { label: "Rich Text Area", tag: "D", desc: "Text editor with formatting toolbar, dictation, and magic pen", color: T.section.advice },
  FollowUpSelector: { label: "Follow-up Selector", tag: "E", desc: "Date picker with quick-select duration chips", color: T.section.followUp },
  NotesField: { label: "Notes Field", tag: "F", desc: "Simple text area for additional notes", color: T.section.notes },
  RxChip: { label: "Rx Chip", tag: "G", desc: "Atomic selectable chip used across all sections", color: T.section.symptoms },
}

/* ═══════════════════════════════════════════════════════════════════
   REACT PREVIEW — Renders each group's variants in-app
   ═══════════════════════════════════════════════════════════════════ */

function PreviewGroup({ group, tier }: { group: ComponentGroup; tier: ExportTier }) {
  switch (group) {
    case "SearchChipCard": {
      const sections: SectionType[] = tier === "core" ? ["Symptoms", "Diagnosis"] : ALL_SECTIONS
      const states: CardState[] = tier === "core" ? ["Empty", "WithChips"] : ALL_CARD_STATES
      return (
        <div className="space-y-4">
          {sections.map(s => (
            <div key={s}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-2">{s}</p>
              <div className="flex flex-wrap gap-4">
                {states.map(st => (
                  <div key={st} className="flex flex-col items-center gap-1">
                    <div dangerouslySetInnerHTML={{ __html: makeSearchChipCard(s, st) }} />
                    <span className="text-[9px] text-tp-slate-300">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    case "VitalField": {
      const types: VitalType[] = tier === "core" ? ["BloodPressure", "Temperature", "Weight", "Pulse"] : ALL_VITAL_TYPES
      const states: VitalState[] = tier === "core" ? ["Empty", "Filled"] : ALL_VITAL_STATES
      return (
        <div className="space-y-3">
          {states.map(vs => (
            <div key={vs}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-2">{vs}</p>
              <div className="flex flex-wrap gap-3">
                {types.map(vt => (
                  <div key={vt} dangerouslySetInnerHTML={{ __html: makeVitalField(vt, vs) }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    case "MedicationRow": {
      const dataStates: MedRowState[] = tier === "core" ? ["Empty", "Filled"] : ALL_MED_ROW_STATES
      const actions = tier === "core" ? ["True"] : ["True", "False"]
      const searchStates: MedSearchState[] = tier === "core" ? ["Empty"] : (["Empty", "Searching"] as MedSearchState[])
      return (
        <div className="space-y-3 overflow-x-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400">Header</p>
          <div dangerouslySetInnerHTML={{ __html: makeMedHeader() }} />
          {dataStates.map(ds => (
            <div key={ds}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mt-3 mb-1">{ds}</p>
              {actions.map(ac => (
                <div key={ac} className="mb-1">
                  <div dangerouslySetInnerHTML={{ __html: makeMedDataRow(ds, ac) }} />
                  <span className="text-[8px] text-tp-slate-300">Actions={ac}</span>
                </div>
              ))}
            </div>
          ))}
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mt-3">Search Row</p>
          {searchStates.map(ss => (
            <div key={ss} className="mb-1">
              <div dangerouslySetInnerHTML={{ __html: makeMedSearchRow(ss) }} />
              <span className="text-[8px] text-tp-slate-300">{ss}</span>
            </div>
          ))}
        </div>
      )
    }

    case "RichTextArea": {
      const states: RichTextState[] = tier === "core" ? ["Empty", "WithContent"] : ALL_RICH_STATES
      const toolbars: ToolbarMode[] = tier === "core" ? ["Full"] : (tier === "all-states" ? ["Full", "Minimal"] : ALL_TOOLBAR_MODES)
      return (
        <div className="space-y-4">
          {toolbars.map(tb => (
            <div key={tb}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-2">Toolbar: {tb}</p>
              <div className="flex flex-wrap gap-4">
                {states.map(st => (
                  <div key={st} className="flex flex-col items-center gap-1">
                    <div dangerouslySetInnerHTML={{ __html: makeRichTextArea(st, tb) }} />
                    <span className="text-[9px] text-tp-slate-300">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    case "FollowUpSelector": {
      const states: FollowUpState[] = tier === "core" ? ["Empty", "ChipSelected"] : ALL_FOLLOWUP_STATES
      return (
        <div className="flex flex-wrap gap-4">
          {states.map(st => (
            <div key={st} className="flex flex-col items-center gap-1">
              <div dangerouslySetInnerHTML={{ __html: makeFollowUpSelector(st) }} />
              <span className="text-[9px] text-tp-slate-300">{st}</span>
            </div>
          ))}
        </div>
      )
    }

    case "NotesField":
      return (
        <div className="flex flex-wrap gap-4">
          {ALL_NOTES_STATES.map(st => (
            <div key={st} className="flex flex-col items-center gap-1">
              <div dangerouslySetInnerHTML={{ __html: makeNotesField(st) }} />
              <span className="text-[9px] text-tp-slate-300">{st}</span>
            </div>
          ))}
        </div>
      )

    case "RxChip": {
      const types: ChipType[] = tier === "core" ? ["Symptom", "Medicine"] : ALL_CHIP_TYPES
      const states: ChipState[] = tier === "core" ? ["Default", "Selected"] : ALL_CHIP_STATES
      const sizes: ChipSize[] = tier === "full" ? ALL_CHIP_SIZES : ["Medium"]
      return (
        <div className="space-y-3">
          {sizes.map(sz => (
            <div key={sz}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-2">Size: {sz}</p>
              <div className="space-y-2">
                {types.map(ct => (
                  <div key={ct} className="flex items-center gap-2">
                    <span className="text-[10px] text-tp-slate-400 w-20 text-right font-medium shrink-0">{ct}</span>
                    <div className="flex gap-2">
                      {states.map(cs => (
                        <div key={cs} className="flex flex-col items-center gap-1">
                          <div dangerouslySetInnerHTML={{ __html: makeRxChip(ct, cs, sz) }} />
                          <span className="text-[8px] text-tp-slate-300">{cs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE COMPONENT (React in-app preview)
   ═══════════════════════════════════════════════════════════════════ */

export function RxExperiment() {
  const [copied, setCopied] = useState(false)
  const [tier, setTier] = useState<ExportTier>("core")
  const [activeGroup, setActiveGroup] = useState<ComponentGroup>("SearchChipCard")

  const handleCopyScript = () => {
    copyRenameScript()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalCount = getTotalCount(tier)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-tp-blue-200 bg-gradient-to-r from-tp-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-tp-slate-900 font-heading">
              Rx Components — Figma Component Set Export
            </h3>
            <p className="text-sm text-tp-slate-600 mt-1 max-w-xl">
              Export <strong>{totalCount} Rx component variants</strong> across 7 groups.
              Clinical prescription workflow — search cards, vitals, medication table,
              rich text, follow-up, notes, and chips.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-tp-slate-300 bg-white text-tp-slate-700 hover:bg-tp-slate-50 transition-colors"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Code2 size={18} />}
              {copied ? "Copied!" : "Copy Rename Script"}
            </button>
            <button
              onClick={() => downloadExperimentHTML(tier)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "#4B4AD5" }}
            >
              <Download size={18} />
              Export All ({totalCount})
            </button>
          </div>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="flex gap-3 flex-wrap">
        {(Object.entries(TIER_INFO) as [ExportTier, typeof TIER_INFO[ExportTier]][]).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setTier(key)}
            className={`flex-1 min-w-[200px] p-4 rounded-xl border-2 text-left transition-all ${
              tier === key
                ? "border-tp-blue-500 bg-tp-blue-50"
                : "border-tp-slate-200 bg-white hover:border-tp-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-bold ${tier === key ? "text-tp-blue-700" : "text-tp-slate-800"}`}>
                {info.label}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                tier === key ? "bg-tp-blue-100 text-tp-blue-700" : "bg-tp-slate-100 text-tp-slate-500"
              }`}>
                {getTotalCount(key)}
              </span>
            </div>
            <p className="text-xs text-tp-slate-500">{info.desc}</p>
          </button>
        ))}
      </div>

      {/* Group Tabs */}
      <div className="flex gap-2 flex-wrap">
        {ALL_GROUPS.map(g => {
          const info = GROUP_INFO[g]
          const count = getGroupCount(g, tier)
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeGroup === g
                  ? "text-white shadow-md"
                  : "bg-tp-slate-100 text-tp-slate-600 hover:bg-tp-slate-200"
              }`}
              style={activeGroup === g ? { backgroundColor: info.color } : undefined}
            >
              <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded"
                style={activeGroup === g ? {} : { backgroundColor: "rgba(0,0,0,0.06)" }}
              >
                {info.tag}
              </span>
              {info.label}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeGroup === g ? "bg-white/20" : "bg-tp-slate-200"
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Group Description */}
      <div className="rounded-lg border border-tp-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-lg text-white"
              style={{ backgroundColor: GROUP_INFO[activeGroup].color }}>
              {GROUP_INFO[activeGroup].tag}
            </span>
            <span className="text-sm font-bold text-tp-slate-800">{GROUP_INFO[activeGroup].label}</span>
          </div>
          <button
            onClick={() => downloadExperimentHTML(tier, [activeGroup])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-tp-slate-300 text-tp-slate-600 hover:bg-tp-slate-50 transition-colors"
          >
            <Download size={14} />
            Export Group ({getGroupCount(activeGroup, tier)})
          </button>
        </div>
        <p className="text-xs text-tp-slate-500">{GROUP_INFO[activeGroup].desc}</p>

        {/* Variant properties for this group */}
        <div className="flex flex-wrap gap-2 mt-3">
          {getGroupProperties(activeGroup, tier).map(({ prop, values }) => (
            <span key={prop} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-tp-slate-50 text-[10px]">
              <span className="font-bold text-tp-slate-700">{prop}:</span>
              <span className="text-tp-slate-500">{values}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Preview Content */}
      <div className="rounded-xl border border-tp-slate-200 bg-white p-6 overflow-x-auto">
        <PreviewGroup group={activeGroup} tier={tier} />
      </div>

      {/* Workflow */}
      <div className="rounded-xl border border-tp-slate-200 bg-tp-slate-50 p-5">
        <h4 className="text-sm font-bold text-tp-slate-800 mb-3">Workflow: HTML → Figma Component Sets</h4>
        <ol className="text-sm text-tp-slate-600 space-y-2 list-decimal list-inside">
          <li>Select export tier and click <strong>&quot;Export All&quot;</strong> or <strong>&quot;Export Group&quot;</strong></li>
          <li>In Figma → run <strong>html.to.design</strong> plugin → File tab → upload the HTML</li>
          <li>Select all imported frames of one group (e.g., all &quot;section&quot; frames of similar size)</li>
          <li>Right-click → <strong>Combine as Variants</strong></li>
          <li>Repeat for each component group</li>
          <li><strong>Optional:</strong> Use the <strong>Rename Script</strong> to auto-name layers</li>
        </ol>
      </div>

      {/* Rename script */}
      <div className="rounded-xl border border-tp-slate-700 bg-[#1E1E2E] p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-tp-slate-300">Figma Auto-Rename Script</h4>
          <button
            onClick={handleCopyScript}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-tp-slate-300 bg-tp-slate-700/50 hover:bg-tp-slate-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="text-[11px] text-green-400 leading-relaxed overflow-x-auto font-mono max-h-48 overflow-y-auto">
          {FIGMA_RENAME_SCRIPT.slice(0, 600)}...
        </pre>
        <p className="text-[10px] text-tp-slate-500 mt-3">
          Paste this in Figma → Plugins → Development → Open Console. It walks imported frames and renames them
          with the appropriate variant properties for each group.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   VARIANT PROPERTY DISPLAY HELPER
   ═══════════════════════════════════════════════════════════════════ */

function getGroupProperties(group: ComponentGroup, tier: ExportTier): { prop: string; values: string }[] {
  switch (group) {
    case "SearchChipCard":
      return [
        { prop: "Section", values: tier === "core" ? "Symptoms, Diagnosis" : "Symptoms, Examinations, Diagnosis, LabInvestigation" },
        { prop: "State", values: tier === "core" ? "Empty, WithChips" : "Empty, WithChips, Searching, ChipSelected" },
      ]
    case "VitalField":
      return [
        { prop: "VitalType", values: tier === "core" ? "BP, Temp, Weight, Pulse" : "BP, Temp, Weight, Height, Pulse, SpO2, BMI, RespRate" },
        { prop: "State", values: tier === "core" ? "Empty, Filled" : "Empty, Filled, Error" },
      ]
    case "MedicationRow":
      return [
        { prop: "RowType", values: "Header, Data, Search" },
        { prop: "State", values: tier === "core" ? "Empty, Filled" : "Empty, Filled, Editing, Hover" },
        { prop: "Actions", values: tier === "core" ? "True" : "True, False" },
      ]
    case "RichTextArea":
      return [
        { prop: "State", values: tier === "core" ? "Empty, WithContent" : "Empty, WithContent, Dictating" },
        { prop: "Toolbar", values: tier === "core" ? "Full" : (tier === "all-states" ? "Full, Minimal" : "Full, Minimal, Hidden") },
      ]
    case "FollowUpSelector":
      return [
        { prop: "State", values: tier === "core" ? "Empty, ChipSelected" : "Empty, DateSelected, ChipSelected" },
      ]
    case "NotesField":
      return [
        { prop: "State", values: "Empty, Filled" },
      ]
    case "RxChip":
      return [
        { prop: "ChipType", values: tier === "core" ? "Symptom, Medicine" : "Symptom, Diagnosis, Duration, Medicine" },
        { prop: "State", values: tier === "core" ? "Default, Selected" : "Default, Hover, Selected, Disabled" },
        { prop: "Size", values: tier === "full" ? "Small, Medium" : "Medium" },
      ]
  }
}

"use client"

/**
 * ══════════════════════════════════════════════════════════════════
 * Input Experiment — Comprehensive Figma Component Set Export
 * ══════════════════════════════════════════════════════════════════
 *
 * Produces clean HTML for html.to.design import. Key features:
 *   - 4 Figma variant properties: InputType, Size, State, Anatomy
 *   - 5 input types × 3 sizes × 8 states × 3 anatomy variants
 *   - Tiered export: Core (120) / Core+Sizes (360) / Full (432)
 *   - Pure design system HTML — no scaffolding, labels, or instructions
 *   - Uses ONLY TP design tokens from component-tokens.ts
 *   - <label> elements for proper Figma layer naming
 *
 * All token values sourced from lib/component-tokens.ts (inputTokens)
 * and form-showcase.tsx (inputSizeMap)
 * ══════════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import {
  Download, Copy, Check, Code2,
  Mail, Lock, Eye, Search, ChevronDown,
} from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   TOKENS — Single source of truth from TP design system (inputTokens)
   ═══════════════════════════════════════════════════════════════════ */

const TOKENS = {
  // Anatomy
  radius: "10px",                     // TP.input.radius
  fontFamily: "Inter, sans-serif",    // TP.cta.font.family / body
  iconColor: "#A2A2A8",              // TP.input.icon.color
  borderWidthDefault: "1px",          // Default border
  borderWidthActive: "2px",           // Focus/error/feedback border

  // Size scale (from form-showcase inputSizeMap)
  sizes: {
    sm: { height: 36, iconSize: 16, fontSize: 13, px: 10 },
    md: { height: 42, iconSize: 18, fontSize: 14, px: 12 },
    lg: { height: 48, iconSize: 20, fontSize: 14, px: 14 },
  },

  // Label & helper anatomy
  label: { fontSize: "14px", fontWeight: "500", color: "#454551" },
  helper: { fontSize: "12px", color: "#717179" },
  gap: 6,        // vertical gap between label / input row / helper

  // Background
  bg: {
    default: "#FFFFFF",
    disabled: "#F8F8FC",
  },

  // Border colors by state
  border: {
    default: "#E2E2EA",
    hover: "#D0D5DD",
    focus: "#4B4AD5",
    filled: "#A2A2A8",
    error: "#E11D48",
    success: "#10B981",
    warning: "#F59E0B",
    disabled: "#F1F1F5",
  },

  // Text colors
  text: {
    default: "#171725",
    placeholder: "#A2A2A8",
    disabled: "#A2A2A8",
    error: "#E11D48",
    success: "#10B981",
    warning: "#D97706",
  },

  // Focus rings (box-shadow)
  ring: {
    default: "0 0 0 3px rgba(75,74,213,0.10)",
    error: "0 0 0 3px rgba(225,29,72,0.10)",
    success: "0 0 0 3px rgba(16,185,129,0.10)",
    warning: "0 0 0 3px rgba(245,158,11,0.10)",
  },

  // Subtle resting shadow
  restingShadow: "0 1px 2px rgba(23,23,37,0.04)",
}

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type InputTypeName = "Text" | "Email" | "Password" | "Search" | "Select" | "Textarea"
type SizeName = "Small" | "Medium" | "Large"
type StateName = "Default" | "Hover" | "Focus" | "Filled" | "Error" | "Success" | "Warning" | "Disabled"
type AnatomyName = "Bare" | "WithLabel" | "WithLabelHelper"
type ExportTier = "core" | "core-sizes" | "full"

interface InputStateStyle {
  borderColor: string
  borderWidth: string
  bg: string
  textColor: string
  shadow: string
  opacity: number
  feedbackColor: string
  feedbackText: string
}

/* ═══════════════════════════════════════════════════════════════════
   INPUT TYPE CONFIGURATIONS
   ═══════════════════════════════════════════════════════════════════ */

interface InputTypeConfig {
  leftIcon: string | null     // SVG key
  rightIcon: string | null    // SVG key
  placeholder: string
  filledValue: string
  label: string
  isTextarea?: boolean
}

const INPUT_TYPE_CONFIG: Record<InputTypeName, InputTypeConfig> = {
  Text: {
    leftIcon: null, rightIcon: null,
    placeholder: "Enter text", filledValue: "John Smith", label: "Full name",
  },
  Email: {
    leftIcon: "mail", rightIcon: null,
    placeholder: "email@example.com", filledValue: "john@example.com", label: "Email address",
  },
  Password: {
    leftIcon: "lock", rightIcon: "eye",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    filledValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    label: "Password",
  },
  Search: {
    leftIcon: "search", rightIcon: null,
    placeholder: "Search\u2026", filledValue: "Patient records", label: "Search",
  },
  Select: {
    leftIcon: null, rightIcon: "chevronDown",
    placeholder: "Select option", filledValue: "Option selected", label: "Category",
  },
  Textarea: {
    leftIcon: null, rightIcon: null,
    placeholder: "Enter description\u2026",
    filledValue: "Patient shows improvement in mobility after 2 weeks of therapy.",
    label: "Notes",
    isTextarea: true,
  },
}

/* ═══════════════════════════════════════════════════════════════════
   STATE STYLE RESOLVER
   ═══════════════════════════════════════════════════════════════════ */

function getInputStateStyle(state: StateName): InputStateStyle {
  const base = { opacity: 1 }
  switch (state) {
    case "Default":
      return { ...base, borderColor: TOKENS.border.default, borderWidth: TOKENS.borderWidthDefault,
        bg: TOKENS.bg.default, textColor: TOKENS.text.placeholder,
        shadow: TOKENS.restingShadow, feedbackColor: TOKENS.helper.color,
        feedbackText: "Helper text goes here" }
    case "Hover":
      return { ...base, borderColor: TOKENS.border.hover, borderWidth: TOKENS.borderWidthDefault,
        bg: TOKENS.bg.default, textColor: TOKENS.text.placeholder,
        shadow: TOKENS.restingShadow, feedbackColor: TOKENS.helper.color,
        feedbackText: "Helper text goes here" }
    case "Focus":
      return { ...base, borderColor: TOKENS.border.focus, borderWidth: TOKENS.borderWidthActive,
        bg: TOKENS.bg.default, textColor: TOKENS.text.placeholder,
        shadow: TOKENS.ring.default, feedbackColor: TOKENS.helper.color,
        feedbackText: "Helper text goes here" }
    case "Filled":
      return { ...base, borderColor: TOKENS.border.filled, borderWidth: TOKENS.borderWidthDefault,
        bg: TOKENS.bg.default, textColor: TOKENS.text.default,
        shadow: "none", feedbackColor: TOKENS.helper.color,
        feedbackText: "Helper text goes here" }
    case "Error":
      return { ...base, borderColor: TOKENS.border.error, borderWidth: TOKENS.borderWidthActive,
        bg: TOKENS.bg.default, textColor: TOKENS.text.default,
        shadow: TOKENS.ring.error, feedbackColor: TOKENS.text.error,
        feedbackText: "This field is required" }
    case "Success":
      return { ...base, borderColor: TOKENS.border.success, borderWidth: TOKENS.borderWidthActive,
        bg: TOKENS.bg.default, textColor: TOKENS.text.default,
        shadow: TOKENS.ring.success, feedbackColor: TOKENS.text.success,
        feedbackText: "Verified successfully" }
    case "Warning":
      return { ...base, borderColor: TOKENS.border.warning, borderWidth: TOKENS.borderWidthActive,
        bg: TOKENS.bg.default, textColor: TOKENS.text.default,
        shadow: TOKENS.ring.warning, feedbackColor: TOKENS.text.warning,
        feedbackText: "Missing characters" }
    case "Disabled":
      return { borderColor: TOKENS.border.disabled, borderWidth: TOKENS.borderWidthDefault,
        bg: TOKENS.bg.disabled, textColor: TOKENS.text.disabled,
        shadow: "none", opacity: 0.5, feedbackColor: TOKENS.helper.color,
        feedbackText: "Helper text goes here" }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SIZE RESOLVER
   ═══════════════════════════════════════════════════════════════════ */

function getSizeValues(size: SizeName) {
  const map = { Small: TOKENS.sizes.sm, Medium: TOKENS.sizes.md, Large: TOKENS.sizes.lg }
  return map[size]
}

/* ═══════════════════════════════════════════════════════════════════
   DIMENSION ARRAYS
   ═══════════════════════════════════════════════════════════════════ */

const BASE_INPUT_TYPES: InputTypeName[] = ["Text", "Email", "Password", "Search", "Select"]
const ALL_INPUT_TYPES: InputTypeName[] = [...BASE_INPUT_TYPES, "Textarea"]
const ALL_SIZES: SizeName[] = ["Small", "Medium", "Large"]
const ALL_STATES: StateName[] = ["Default", "Hover", "Focus", "Filled", "Error", "Success", "Warning", "Disabled"]
const ALL_ANATOMIES: AnatomyName[] = ["Bare", "WithLabel", "WithLabelHelper"]

/** Get count for a given tier */
function getComboCount(tier: ExportTier): number {
  const types = tier === "full" ? ALL_INPUT_TYPES : BASE_INPUT_TYPES
  const sizes: SizeName[] = tier === "core" ? ["Medium"] : ALL_SIZES
  return types.length * sizes.length * ALL_STATES.length * ALL_ANATOMIES.length
}

/** Whether Filled/Error/Success/Warning show value (not placeholder) */
function showsValue(state: StateName): boolean {
  return state === "Filled" || state === "Error" || state === "Success" || state === "Warning"
}

/* ═══════════════════════════════════════════════════════════════════
   INLINE SVG ICONS (for HTML export — no external dependencies)
   ═══════════════════════════════════════════════════════════════════ */

function svgIcon(key: string, size: number, color: string): string {
  const s = String(size)
  const icons: Record<string, string> = {
    mail: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    lock: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  }
  return icons[key] || ""
}

/* ═══════════════════════════════════════════════════════════════════
   REACT PREVIEW INPUT (for in-app showcase)
   ═══════════════════════════════════════════════════════════════════ */

function ExperimentInput({
  inputType, size, state, anatomy,
}: {
  inputType: InputTypeName
  size: SizeName
  state: StateName
  anatomy: AnatomyName
}) {
  const config = INPUT_TYPE_CONFIG[inputType]
  const stStyle = getInputStateStyle(state)
  const sz = getSizeValues(size)
  const isTextarea = config.isTextarea
  const textContent = showsValue(state) ? config.filledValue : config.placeholder
  const textColor = stStyle.textColor

  // Icon components for React preview
  const leftIconMap: Record<string, React.ReactNode> = {
    mail: <Mail size={sz.iconSize} style={{ flexShrink: 0, color: TOKENS.iconColor }} />,
    lock: <Lock size={sz.iconSize} style={{ flexShrink: 0, color: TOKENS.iconColor }} />,
    search: <Search size={sz.iconSize} style={{ flexShrink: 0, color: TOKENS.iconColor }} />,
  }
  const rightIconMap: Record<string, React.ReactNode> = {
    eye: <Eye size={sz.iconSize} style={{ flexShrink: 0, color: TOKENS.iconColor }} />,
    chevronDown: <ChevronDown size={sz.iconSize} style={{ flexShrink: 0, color: TOKENS.iconColor }} />,
  }

  const inputRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: isTextarea ? "flex-start" : "center",
    gap: "8px",
    height: isTextarea ? "auto" : `${sz.height}px`,
    minHeight: isTextarea ? "80px" : undefined,
    paddingLeft: `${sz.px}px`,
    paddingRight: `${sz.px}px`,
    paddingTop: isTextarea ? "10px" : undefined,
    paddingBottom: isTextarea ? "10px" : undefined,
    borderRadius: TOKENS.radius,
    border: `${stStyle.borderWidth} solid ${stStyle.borderColor}`,
    backgroundColor: stStyle.bg,
    boxShadow: stStyle.shadow,
    opacity: stStyle.opacity,
    width: "240px",
  }

  return (
    <div
      title={`InputType=${inputType}, Size=${size}, State=${state}, Anatomy=${anatomy}`}
      style={{ display: "flex", flexDirection: "column", gap: `${TOKENS.gap}px`, fontFamily: TOKENS.fontFamily }}
    >
      {(anatomy === "WithLabel" || anatomy === "WithLabelHelper") && (
        <span style={{ fontSize: TOKENS.label.fontSize, fontWeight: Number(TOKENS.label.fontWeight), color: TOKENS.label.color }}>
          {config.label}
        </span>
      )}
      <div style={inputRowStyle}>
        {config.leftIcon && leftIconMap[config.leftIcon]}
        <span style={{
          flex: 1, fontSize: `${sz.fontSize}px`, color: textColor,
          fontFamily: TOKENS.fontFamily, lineHeight: isTextarea ? "1.5" : "1",
          whiteSpace: isTextarea ? "normal" : "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {textContent}
        </span>
        {config.rightIcon && rightIconMap[config.rightIcon]}
      </div>
      {anatomy === "WithLabelHelper" && (
        <span style={{ fontSize: TOKENS.helper.fontSize, color: stStyle.feedbackColor }}>
          {stStyle.feedbackText}
        </span>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   FIGMA RENAME SCRIPT
   ═══════════════════════════════════════════════════════════════════ */

const FIGMA_RENAME_SCRIPT = `// Figma Plugin Console Script — Auto-rename imported input layers
// Run after importing HTML via html.to.design.
// Walks every "label" frame and renames using visual properties.

function renameInputLayers() {
  const page = figma.currentPage;
  let renamed = 0;

  function walk(node) {
    if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
      if (node.name.toLowerCase() === "label") {
        const childCount = node.children ? node.children.length : 0;
        const anatomy = childCount >= 3 ? "WithLabelHelper" : childCount === 2 ? "WithLabel" : "Bare";
        const inputRow = findInputRow(node);
        const height = inputRow ? inputRow.height : 42;
        const sizeName = getSizeFromHeight(height);
        const borderColor = inputRow ? getBorderColor(inputRow) : "";
        const stateName = getStateFromBorder(borderColor, node.opacity);
        const inputType = detectInputType(inputRow);

        if (inputType) {
          node.name = "InputType=" + inputType + ", Size=" + sizeName
            + ", State=" + stateName + ", Anatomy=" + anatomy;
          renamed++;
        }
      }
      if ("children" in node) {
        for (const child of node.children) { walk(child); }
      }
    }
  }

  function findInputRow(node) {
    if (!node.children) return null;
    for (const child of node.children) {
      if (child.height >= 36 && child.height <= 100 && child.cornerRadius > 0) return child;
    }
    return node.children.length > 1 ? node.children[1] : node.children[0];
  }

  function getBorderColor(node) {
    const strokes = node.strokes;
    if (strokes && strokes.length > 0 && strokes[0].type === "SOLID") {
      return rgbToHex(strokes[0].color);
    }
    return "";
  }

  function rgbToHex(c) {
    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function getSizeFromHeight(h) {
    if (h <= 38) return "Small";
    if (h <= 44) return "Medium";
    return "Large";
  }

  function getStateFromBorder(hex, opacity) {
    if (opacity < 1) return "Disabled";
    const map = {
      "#4B4AD5": "Focus",
      "#E11D48": "Error",
      "#10B981": "Success",
      "#F59E0B": "Warning",
      "#D0D5DD": "Hover",
      "#A2A2A8": "Filled",
      "#E2E2EA": "Default",
      "#F1F1F5": "Disabled",
    };
    return map[hex] || "Default";
  }

  function detectInputType(inputRow) {
    if (!inputRow || !inputRow.children) return "Text";
    const svgCount = inputRow.children.filter(c =>
      c.type === "FRAME" || c.type === "VECTOR" || c.name === "svg"
    ).length;
    const hasText = inputRow.children.some(c => c.type === "TEXT");
    if (inputRow.height > 60) return "Textarea";
    if (svgCount >= 2) return "Password";
    if (svgCount === 1) {
      const first = inputRow.children[0];
      const last = inputRow.children[inputRow.children.length - 1];
      if (last && (last.type === "FRAME" || last.name === "svg") && first.type === "TEXT") return "Select";
      return "Email"; // heuristic: left icon could be mail, search, etc.
    }
    return "Text";
  }

  walk(page);
  figma.notify("Renamed " + renamed + " input layers");
}

renameInputLayers();
figma.closePlugin();`

/* ═══════════════════════════════════════════════════════════════════
   HTML EXPORT GENERATOR — Pure design system output
   ═══════════════════════════════════════════════════════════════════ */

function generateExperimentHTML(tier: ExportTier): string {
  const types: InputTypeName[] = tier === "full" ? ALL_INPUT_TYPES : BASE_INPUT_TYPES
  const sizes: SizeName[] = tier === "core" ? ["Medium"] : ALL_SIZES

  /** Build a single input component HTML */
  function makeInput(
    inputType: InputTypeName, sz: SizeName, st: StateName, anatomy: AnatomyName,
  ): string {
    const config = INPUT_TYPE_CONFIG[inputType]
    const stStyle = getInputStateStyle(st)
    const sizeVals = getSizeValues(sz)
    const isTextarea = !!config.isTextarea
    const textContent = showsValue(st) ? config.filledValue : config.placeholder

    const figmaName = `InputType=${inputType}, Size=${sz}, State=${st}, Anatomy=${anatomy}`
    const safeId = figmaName.replace(/\s/g, "").replace(/,/g, "_")

    // Input row inline style
    const rowParts: string[] = [
      `display:flex`,
      `align-items:${isTextarea ? "flex-start" : "center"}`,
      `gap:8px`,
      ...(isTextarea
        ? [`min-height:80px`, `padding:10px ${sizeVals.px}px`]
        : [`height:${sizeVals.height}px`, `padding:0 ${sizeVals.px}px`]),
      `border-radius:${TOKENS.radius}`,
      `border:${stStyle.borderWidth} solid ${stStyle.borderColor}`,
      `background-color:${stStyle.bg}`,
      stStyle.shadow !== "none" ? `box-shadow:${stStyle.shadow}` : "",
      stStyle.opacity < 1 ? `opacity:${stStyle.opacity}` : "",
    ].filter(Boolean)

    // Build inner content
    const iconSize = sizeVals.iconSize
    const iconClr = TOKENS.iconColor
    const parts: string[] = []

    if (config.leftIcon) {
      parts.push(`<span style="display:inline-flex;flex-shrink:0">${svgIcon(config.leftIcon, iconSize, iconClr)}</span>`)
    }

    parts.push(`<span style="flex:1;font-size:${sizeVals.fontSize}px;color:${stStyle.textColor};font-family:${TOKENS.fontFamily};line-height:${isTextarea ? "1.5" : "1"};white-space:${isTextarea ? "normal" : "nowrap"};overflow:hidden;text-overflow:ellipsis">${textContent}</span>`)

    if (config.rightIcon) {
      parts.push(`<span style="display:inline-flex;flex-shrink:0">${svgIcon(config.rightIcon, iconSize, iconClr)}</span>`)
    }

    // Build full component
    const htmlParts: string[] = []

    // Label text (for WithLabel and WithLabelHelper)
    if (anatomy === "WithLabel" || anatomy === "WithLabelHelper") {
      htmlParts.push(`<span style="font-size:${TOKENS.label.fontSize};font-weight:${TOKENS.label.fontWeight};color:${TOKENS.label.color}">${config.label}</span>`)
    }

    // Input row
    htmlParts.push(`<span style="${rowParts.join(";")}">${parts.join("")}</span>`)

    // Helper/feedback text (for WithLabelHelper)
    if (anatomy === "WithLabelHelper") {
      htmlParts.push(`<span style="font-size:${TOKENS.helper.fontSize};color:${stStyle.feedbackColor}">${stStyle.feedbackText}</span>`)
    }

    return `<label id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}" style="display:flex;flex-direction:column;gap:${TOKENS.gap}px;font-family:${TOKENS.fontFamily}">${htmlParts.join("")}</label>`
  }

  // ── Build all inputs ──
  const inputs: string[] = []
  for (const inputType of types) {
    for (const sz of sizes) {
      for (const st of ALL_STATES) {
        for (const anatomy of ALL_ANATOMIES) {
          inputs.push(makeInput(inputType, sz, st, anatomy))
        }
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TP Input Component Set</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Inter, sans-serif; background: #F8F8FC; padding: 40px; display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
</style>
</head>
<body>
${inputs.join("\n")}
</body>
</html>`
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORT HANDLERS
   ═══════════════════════════════════════════════════════════════════ */

function downloadExperimentHTML(tier: ExportTier) {
  const html = generateExperimentHTML(tier)
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `tp-input-component-set-${tier}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function copyRenameScript() {
  navigator.clipboard.writeText(FIGMA_RENAME_SCRIPT)
}

/* ═══════════════════════════════════════════════════════════════════
   TIER INFO
   ═══════════════════════════════════════════════════════════════════ */

const TIER_INFO: Record<ExportTier, { label: string; desc: string }> = {
  core: {
    label: "Core",
    desc: "Medium size only — all input types, states, and anatomy variants",
  },
  "core-sizes": {
    label: "Core + Sizes",
    desc: "All sizes — all input types, states, and anatomy variants",
  },
  full: {
    label: "Full",
    desc: "Everything + Textarea type — all sizes, states, anatomy variants",
  },
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE COMPONENT (React in-app preview)
   ═══════════════════════════════════════════════════════════════════ */

export function InputExperiment() {
  const [copied, setCopied] = useState(false)
  const [tier, setTier] = useState<ExportTier>("core")
  const [previewType, setPreviewType] = useState<InputTypeName>("Text")

  const handleCopyScript = () => {
    copyRenameScript()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buttonCount = getComboCount(tier)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-tp-blue-200 bg-gradient-to-r from-tp-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-tp-slate-900 font-heading">
              Input — Figma Component Set Export
            </h3>
            <p className="text-sm text-tp-slate-600 mt-1 max-w-xl">
              Export <strong>{buttonCount} input variants</strong> with 4 Figma variant properties:
              InputType, Size, State, and Anatomy.
              Pure design system HTML — no scaffolding.
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
              Export HTML ({buttonCount})
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
                {getComboCount(key)}
              </span>
            </div>
            <p className="text-xs text-tp-slate-500">{info.desc}</p>
          </button>
        ))}
      </div>

      {/* Variant Properties Overview */}
      <div className="rounded-lg border border-tp-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-tp-slate-400 mb-3">Figma Variant Properties</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { prop: "InputType", values: tier === "full" ? "6" : "5", items: tier === "full" ? "Text, Email, Password, Search, Select, Textarea" : "Text, Email, Password, Search, Select" },
            { prop: "Size", values: tier === "core" ? "1 (MD)" : "3", items: tier === "core" ? "Medium" : "Small, Medium, Large" },
            { prop: "State", values: "8", items: "Default, Hover, Focus, Filled, Error, Success, Warning, Disabled" },
            { prop: "Anatomy", values: "3", items: "Bare, WithLabel, WithLabelHelper" },
          ].map(({ prop, values, items }) => (
            <div key={prop} className="rounded-lg bg-tp-slate-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-tp-slate-700">{prop}</span>
                <span className="text-[10px] font-mono bg-tp-slate-200 text-tp-slate-600 px-1.5 rounded">{values}</span>
              </div>
              <p className="text-[10px] text-tp-slate-500 leading-tight">{items}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Input type selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-tp-slate-400">Preview type:</span>
        <div className="flex gap-1.5 flex-wrap">
          {BASE_INPUT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setPreviewType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewType === t
                  ? "bg-tp-blue-100 text-tp-blue-700 border border-tp-blue-300"
                  : "bg-tp-slate-100 text-tp-slate-600 border border-transparent hover:bg-tp-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Grid — States × Anatomy */}
      <div className="space-y-6">
        {ALL_ANATOMIES.map((anatomy) => (
          <div key={anatomy}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-3">
              {previewType} — {anatomy}
            </p>
            <div className="space-y-3">
              {ALL_STATES.map((st) => (
                <div key={st} className="flex items-start gap-3">
                  <span className="text-[10px] text-tp-slate-400 w-16 text-right font-medium shrink-0 pt-1">{st}</span>
                  <ExperimentInput
                    inputType={previewType}
                    size="Medium"
                    state={st}
                    anatomy={anatomy}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Sizes preview */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-3">
            {previewType} — All Sizes (Default, WithLabel)
          </p>
          <div className="space-y-3">
            {ALL_SIZES.map((sz) => (
              <div key={sz} className="flex items-start gap-3">
                <span className="text-[10px] text-tp-slate-400 w-16 text-right font-medium shrink-0 pt-1">{sz}</span>
                <ExperimentInput
                  inputType={previewType}
                  size={sz}
                  state="Default"
                  anatomy="WithLabel"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="rounded-xl border border-tp-slate-200 bg-tp-slate-50 p-5">
        <h4 className="text-sm font-bold text-tp-slate-800 mb-3">Workflow: HTML → Figma Component Set</h4>
        <ol className="text-sm text-tp-slate-600 space-y-2 list-decimal list-inside">
          <li>Select export tier and click <strong>&quot;Export HTML&quot;</strong></li>
          <li>In Figma → run <strong>html.to.design</strong> plugin → File tab → upload the HTML</li>
          <li>Select all imported &quot;label&quot; frames</li>
          <li>Right-click → <strong>Combine as Variants</strong></li>
          <li><strong>Optional:</strong> Use the <strong>Rename Script</strong> to auto-name layers by their visual properties</li>
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
          Paste this in Figma → Plugins → Development → Open Console. It walks every &quot;label&quot; frame and renames it
          with InputType, Size, State, and Anatomy properties.
        </p>
      </div>
    </div>
  )
}

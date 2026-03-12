"use client"

/**
 * ══════════════════════════════════════════════════════════════════
 * Button Experiment — Comprehensive Figma Component Set Export
 * ══════════════════════════════════════════════════════════════════
 *
 * Produces clean HTML for html.to.design import. Key features:
 *   - 5 Figma variant properties: Variant, Size, State, Icon, Type
 *   - 6 color variants × 3 sizes × 5 states × 5 icon positions × 2 types
 *   - Tiered export: Core (270) / Core+Sizes (450) / Full (810)
 *   - Pure design system HTML — no scaffolding, labels, or instructions
 *   - Uses ONLY TP design tokens from component-tokens.ts
 *   - <button> elements for proper Figma layer naming
 *
 * All token values sourced from lib/component-tokens.ts (ctaTokens)
 * ══════════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { Download, Plus, Loader2, ArrowRight, ChevronDown, Copy, Check, Code2 } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   TOKENS — Single source of truth from TP design system (ctaTokens)
   ═══════════════════════════════════════════════════════════════════ */

const TOKENS = {
  // Anatomy
  radius: "10px",           // TP.cta.radius
  fontFamily: "Inter, sans-serif", // TP.cta.font.family
  fontSize: "14px",         // TP.cta.font.size
  fontWeight: "600",        // TP.cta.font.weight
  iconSize: 20,             // TP.cta.icon.size (locked)
  borderWidth: "1.5px",     // TP.cta.border.width
  gap: 6,                   // Internal gap between icon + label

  // Size scale
  height: { sm: 32, md: 38, lg: 44 },  // TP.cta.height.*
  paddingX: 14,             // TP.cta.padding.x
  paddingY: 8,              // TP.cta.padding.y
  dropdownPadR: 8,          // Compact right padding for dropdown chevron area

  // Variant color tokens
  primary: {
    bg: "#4B4AD5", bgHover: "#3C3AB3", bgDisabled: "#E2E2EA",
    text: "#FFFFFF", textDisabled: "#A2A2A8",
    focusRing: "0 0 0 4px rgba(75,74,213,0.15)",
  },
  outline: {
    bg: "transparent", bgHover: "#EEEEFF", bgDisabled: "transparent",
    text: "#4B4AD5", textDisabled: "#A2A2A8",
    border: "#4B4AD5", borderDisabled: "#E2E2EA",
    focusRing: "0 0 0 4px rgba(75,74,213,0.15)",
  },
  ghost: {
    bg: "transparent", bgHover: "#EEEEFF",
    text: "#4B4AD5", textDisabled: "#A2A2A8",
    focusRing: "0 0 0 4px rgba(75,74,213,0.15)",
  },
  tonal: {
    bg: "#EEEEFF", bgHover: "#D8D8FF",
    text: "#4B4AD5", textDisabled: "#A2A2A8",
    disabledBg: "#F1F1F5",
    focusRing: "0 0 0 4px rgba(75,74,213,0.15)",
  },
  neutral: {
    bg: "#F1F1F5", bgHover: "#E2E2EA",
    text: "#454551", textDisabled: "#A2A2A8",
    disabledBg: "#F8F8FC",
    focusRing: "0 0 0 4px rgba(75,74,213,0.15)",
  },
  destructive: {
    bg: "#E11D48", bgHover: "#BE123C", bgDisabled: "#E2E2EA",
    text: "#FFFFFF", textDisabled: "#A2A2A8",
    focusRing: "0 0 0 4px rgba(225,29,72,0.15)",
  },
  // Loading
  loadingOpacity: 0.7,      // TP.cta.loading.opacity
}

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type VariantName = "Primary" | "Outline" | "Ghost" | "Tonal" | "Neutral" | "Destructive"
type SizeName = "Small" | "Medium" | "Large"
type StateName = "Default" | "Hover" | "Focus" | "Loading" | "Disabled"
type IconPosition = "None" | "Left" | "Right" | "Both" | "Only"
type ButtonType = "Standard" | "Dropdown"
type ExportTier = "core" | "core-sizes" | "full"

interface ButtonVariantStyle {
  bg: string
  text: string
  border?: string
  shadow?: string
  opacity?: number
}

/* ═══════════════════════════════════════════════════════════════════
   VARIANT STYLE RESOLVER
   ═══════════════════════════════════════════════════════════════════ */

function getVariantStyle(variant: VariantName, state: StateName): ButtonVariantStyle {
  switch (variant) {
    case "Primary":
      if (state === "Hover") return { bg: TOKENS.primary.bgHover, text: TOKENS.primary.text }
      if (state === "Focus") return { bg: TOKENS.primary.bg, text: TOKENS.primary.text, shadow: TOKENS.primary.focusRing }
      if (state === "Loading") return { bg: TOKENS.primary.bg, text: TOKENS.primary.text, opacity: TOKENS.loadingOpacity }
      if (state === "Disabled") return { bg: TOKENS.primary.bgDisabled, text: TOKENS.primary.textDisabled }
      return { bg: TOKENS.primary.bg, text: TOKENS.primary.text }

    case "Outline":
      if (state === "Hover") return { bg: TOKENS.outline.bgHover, text: TOKENS.outline.text, border: TOKENS.outline.border }
      if (state === "Focus") return { bg: "transparent", text: TOKENS.outline.text, border: TOKENS.outline.border, shadow: TOKENS.outline.focusRing }
      if (state === "Loading") return { bg: "transparent", text: TOKENS.outline.text, border: TOKENS.outline.border, opacity: TOKENS.loadingOpacity }
      if (state === "Disabled") return { bg: "transparent", text: TOKENS.outline.textDisabled, border: TOKENS.outline.borderDisabled }
      return { bg: "transparent", text: TOKENS.outline.text, border: TOKENS.outline.border }

    case "Ghost":
      if (state === "Hover") return { bg: TOKENS.ghost.bgHover, text: TOKENS.ghost.text }
      if (state === "Focus") return { bg: "transparent", text: TOKENS.ghost.text, shadow: TOKENS.ghost.focusRing }
      if (state === "Loading") return { bg: "transparent", text: TOKENS.ghost.text, opacity: TOKENS.loadingOpacity }
      if (state === "Disabled") return { bg: "transparent", text: TOKENS.ghost.textDisabled }
      return { bg: "transparent", text: TOKENS.ghost.text }

    case "Tonal":
      if (state === "Hover") return { bg: TOKENS.tonal.bgHover, text: TOKENS.tonal.text }
      if (state === "Focus") return { bg: TOKENS.tonal.bg, text: TOKENS.tonal.text, shadow: TOKENS.tonal.focusRing }
      if (state === "Loading") return { bg: TOKENS.tonal.bg, text: TOKENS.tonal.text, opacity: TOKENS.loadingOpacity }
      if (state === "Disabled") return { bg: TOKENS.tonal.disabledBg, text: TOKENS.tonal.textDisabled }
      return { bg: TOKENS.tonal.bg, text: TOKENS.tonal.text }

    case "Neutral":
      if (state === "Hover") return { bg: TOKENS.neutral.bgHover, text: TOKENS.neutral.text }
      if (state === "Focus") return { bg: TOKENS.neutral.bg, text: TOKENS.neutral.text, shadow: TOKENS.neutral.focusRing }
      if (state === "Loading") return { bg: TOKENS.neutral.bg, text: TOKENS.neutral.text, opacity: TOKENS.loadingOpacity }
      if (state === "Disabled") return { bg: TOKENS.neutral.disabledBg, text: TOKENS.neutral.textDisabled }
      return { bg: TOKENS.neutral.bg, text: TOKENS.neutral.text }

    case "Destructive":
      if (state === "Hover") return { bg: TOKENS.destructive.bgHover, text: TOKENS.destructive.text }
      if (state === "Focus") return { bg: TOKENS.destructive.bg, text: TOKENS.destructive.text, shadow: TOKENS.destructive.focusRing }
      if (state === "Loading") return { bg: TOKENS.destructive.bg, text: TOKENS.destructive.text, opacity: TOKENS.loadingOpacity }
      if (state === "Disabled") return { bg: TOKENS.destructive.bgDisabled, text: TOKENS.destructive.textDisabled }
      return { bg: TOKENS.destructive.bg, text: TOKENS.destructive.text }

    default:
      return { bg: TOKENS.primary.bg, text: TOKENS.primary.text }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SIZE RESOLVER
   ═══════════════════════════════════════════════════════════════════ */

function getSizeValues(size: SizeName) {
  const heightMap = { Small: TOKENS.height.sm, Medium: TOKENS.height.md, Large: TOKENS.height.lg }
  const h = heightMap[size]
  return {
    height: h,
    px: TOKENS.paddingX,
    py: TOKENS.paddingY,
    iconSize: TOKENS.iconSize,
    gap: TOKENS.gap,
    // Icon-only: perfect square, centered icon
    iconOnlyPad: Math.floor((h - TOKENS.iconSize) / 2),
  }
}

/* ═══════════════════════════════════════════════════════════════════
   DIMENSION ARRAYS
   ═══════════════════════════════════════════════════════════════════ */

const ALL_VARIANTS: VariantName[] = ["Primary", "Outline", "Ghost", "Tonal", "Neutral", "Destructive"]
const ALL_SIZES: SizeName[] = ["Small", "Medium", "Large"]
const ALL_STATES: StateName[] = ["Default", "Hover", "Focus", "Loading", "Disabled"]
const ALL_ICONS: IconPosition[] = ["None", "Left", "Right", "Both", "Only"]
const ALL_TYPES: ButtonType[] = ["Standard", "Dropdown"]

/** Check if a combination is valid (Icon=Only + Type=Dropdown is invalid) */
function isValidCombo(icon: IconPosition, type: ButtonType): boolean {
  return !(icon === "Only" && type === "Dropdown")
}

/** Get button combinations for a given tier */
function getComboCount(tier: ExportTier): number {
  let count = 0
  const sizes = tier === "core" ? (["Medium"] as SizeName[]) : ALL_SIZES
  const types = tier === "core-sizes" ? (["Standard"] as ButtonType[]) : ALL_TYPES

  for (const _v of ALL_VARIANTS)
    for (const _sz of sizes)
      for (const _st of ALL_STATES)
        for (const icon of ALL_ICONS)
          for (const type of types)
            if (isValidCombo(icon, type)) count++

  return count
}

/* ═══════════════════════════════════════════════════════════════════
   INLINE SVG ICONS (for HTML export — no external dependencies)
   ═══════════════════════════════════════════════════════════════════ */

const SVG = {
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  loader: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
}

/* ═══════════════════════════════════════════════════════════════════
   REACT PREVIEW BUTTON (for in-app showcase)
   ═══════════════════════════════════════════════════════════════════ */

function ExperimentButton({
  variant, size, state, icon = "None", type = "Standard",
}: {
  variant: VariantName
  size: SizeName
  state: StateName
  icon?: IconPosition
  type?: ButtonType
}) {
  const style = getVariantStyle(variant, state)
  const sz = getSizeValues(size)
  const isIconOnly = icon === "Only"
  const isDropdown = type === "Dropdown"
  const isLoading = state === "Loading"

  // Compute padding
  const padL = isIconOnly ? sz.iconOnlyPad : sz.px
  const padR = isDropdown ? TOKENS.dropdownPadR : (isIconOnly ? sz.iconOnlyPad : sz.px)

  // Left icon
  const showLeftIcon = !isLoading && (icon === "Left" || icon === "Both" || icon === "Only")
  // Right icon
  const showRightIcon = !isLoading && (icon === "Right" || icon === "Both")

  return (
    <button
      type="button"
      title={`Variant=${variant}, Size=${size}, State=${state}, Icon=${icon}, Type=${type}`}
      disabled={state === "Disabled"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: `${sz.gap}px`,
        height: `${sz.height}px`,
        ...(isIconOnly ? { width: `${sz.height}px`, minWidth: `${sz.height}px` } : {}),
        paddingLeft: padL,
        paddingRight: padR,
        paddingTop: isIconOnly ? sz.iconOnlyPad : sz.py,
        paddingBottom: isIconOnly ? sz.iconOnlyPad : sz.py,
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: TOKENS.radius,
        border: style.border ? `${TOKENS.borderWidth} solid ${style.border}` : "none",
        boxShadow: style.shadow || "none",
        opacity: style.opacity ?? 1,
        fontFamily: TOKENS.fontFamily,
        fontSize: TOKENS.fontSize,
        fontWeight: Number(TOKENS.fontWeight),
        cursor: state === "Disabled" ? "not-allowed" : "pointer",
        whiteSpace: "nowrap" as const,
        lineHeight: "1",
      }}
    >
      {isLoading && <Loader2 size={sz.iconSize} className="animate-spin" style={{ flexShrink: 0 }} />}
      {showLeftIcon && <Plus size={sz.iconSize} style={{ flexShrink: 0 }} />}
      {!isIconOnly && <span>{isLoading ? "Loading\u2026" : "Button"}</span>}
      {showRightIcon && <ArrowRight size={sz.iconSize} style={{ flexShrink: 0 }} />}
      {isDropdown && (
        <>
          <span style={{
            width: "1px", alignSelf: "stretch",
            margin: `0 ${sz.gap / 2}px`,
            backgroundColor: "currentColor", opacity: 0.2,
          }} />
          <ChevronDown size={sz.iconSize} style={{ flexShrink: 0 }} />
        </>
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   FIGMA RENAME SCRIPT
   ═══════════════════════════════════════════════════════════════════ */

const FIGMA_RENAME_SCRIPT = `// Figma Plugin Console Script — Auto-rename imported button layers
// Run after importing HTML via html.to.design.
// Walks every "button" frame and renames using visual properties.

function renameButtonLayers() {
  const page = figma.currentPage;
  let renamed = 0;

  function walk(node) {
    if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
      if (node.name.toLowerCase() === "button") {
        const fills = node.fills;
        const bg = fills && fills.length > 0 && fills[0].type === "SOLID"
          ? rgbToHex(fills[0].color) : "transparent";
        const variantName = getVariantFromBg(bg);
        const sizeName = getSizeFromHeight(node.height);
        const stateName = getStateFromOpacity(node.opacity, bg);
        const childCount = node.children ? node.children.length : 0;
        const iconPos = getIconPosition(node);
        const hasChevron = detectChevron(node);
        const typeName = hasChevron ? "Dropdown" : "Standard";

        if (variantName) {
          node.name = "Variant=" + variantName + ", Size=" + sizeName + ", State=" + stateName + ", Icon=" + iconPos + ", Type=" + typeName;
          renamed++;
        }
      }
      if ("children" in node) {
        for (const child of node.children) { walk(child); }
      }
    }
  }

  function rgbToHex(c) {
    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function getVariantFromBg(hex) {
    const map = {
      "#4B4AD5": "Primary", "#3C3AB3": "Primary",
      "#E11D48": "Destructive", "#BE123C": "Destructive",
      "#EEEEFF": "Tonal", "#D8D8FF": "Tonal",
      "#F1F1F5": "Neutral", "#E2E2EA": "Neutral",
    };
    if (map[hex]) return map[hex];
    if (hex === "transparent" || hex === "#FFFFFF" || hex === "#000000") return null;
    return null;
  }

  function getSizeFromHeight(h) {
    if (h <= 34) return "Small";
    if (h <= 40) return "Medium";
    return "Large";
  }

  function getStateFromOpacity(opacity, bg) {
    if (opacity < 1) return "Loading";
    if (bg === "#E2E2EA") return "Disabled";
    return "Default";
  }

  function getIconPosition(node) {
    if (!node.children) return "None";
    const svgs = node.children.filter(c => c.type === "VECTOR" || c.name === "svg" || c.type === "FRAME");
    const hasText = node.children.some(c => c.type === "TEXT");
    if (!hasText && svgs.length > 0) return "Only";
    if (svgs.length >= 3) return "Both"; // left + right + possibly divider
    if (svgs.length === 2) return "Both";
    if (svgs.length === 1) {
      const textIdx = node.children.findIndex(c => c.type === "TEXT");
      const svgIdx = node.children.indexOf(svgs[0]);
      return svgIdx < textIdx ? "Left" : "Right";
    }
    return "None";
  }

  function detectChevron(node) {
    if (!node.children) return false;
    const last = node.children[node.children.length - 1];
    return last && last.width < 24 && last.height < 24 && node.children.length > 2;
  }

  walk(page);
  figma.notify("Renamed " + renamed + " button layers");
}

renameButtonLayers();
figma.closePlugin();`

/* ═══════════════════════════════════════════════════════════════════
   HTML EXPORT GENERATOR — Pure design system output
   ═══════════════════════════════════════════════════════════════════ */

function generateExperimentHTML(tier: ExportTier): string {
  const sizes: SizeName[] = tier === "core" ? ["Medium"] : ALL_SIZES
  const types: ButtonType[] = tier === "core-sizes" ? ["Standard"] : ALL_TYPES

  /** Build inline CSS style string for a button */
  function inlineStyle(
    v: VariantName, st: StateName, sz: SizeName,
    iconPos: IconPosition, btnType: ButtonType,
  ): string {
    const style = getVariantStyle(v, st)
    const s = getSizeValues(sz)
    const isIconOnly = iconPos === "Only"
    const isDropdown = btnType === "Dropdown"

    const padL = isIconOnly ? s.iconOnlyPad : s.px
    const padR = isDropdown ? TOKENS.dropdownPadR : (isIconOnly ? s.iconOnlyPad : s.px)
    const padTB = isIconOnly ? s.iconOnlyPad : s.py

    const parts: string[] = [
      `display:inline-flex`,
      `align-items:center`,
      `justify-content:center`,
      `gap:${s.gap}px`,
      `height:${s.height}px`,
      ...(isIconOnly ? [`width:${s.height}px`, `min-width:${s.height}px`] : []),
      `padding:${padTB}px ${padR}px ${padTB}px ${padL}px`,
      `background-color:${style.bg}`,
      `color:${style.text}`,
      `border-radius:${TOKENS.radius}`,
      style.border ? `border:${TOKENS.borderWidth} solid ${style.border}` : `border:none`,
      style.shadow ? `box-shadow:${style.shadow}` : ``,
      style.opacity ? `opacity:${style.opacity}` : ``,
      `font-family:${TOKENS.fontFamily}`,
      `font-size:${TOKENS.fontSize}`,
      `font-weight:${TOKENS.fontWeight}`,
      `cursor:${st === "Disabled" ? "not-allowed" : "pointer"}`,
      `white-space:nowrap`,
      `line-height:1`,
      `appearance:none`,
      `outline:none`,
    ]

    return parts.filter(Boolean).join(";")
  }

  /** Build inner HTML for a button */
  function innerContent(
    st: StateName, iconPos: IconPosition, btnType: ButtonType,
  ): string {
    const isLoading = st === "Loading"
    const isIconOnly = iconPos === "Only"
    const isDropdown = btnType === "Dropdown"
    const showLeftIcon = !isLoading && (iconPos === "Left" || iconPos === "Both" || iconPos === "Only")
    const showRightIcon = !isLoading && (iconPos === "Right" || iconPos === "Both")
    const label = isLoading ? "Loading\u2026" : "Button"

    const parts: string[] = []

    // Loading spinner
    if (isLoading) {
      parts.push(`<span style="display:inline-flex;flex-shrink:0;animation:spin 1s linear infinite">${SVG.loader}</span>`)
    }

    // Left icon
    if (showLeftIcon) {
      parts.push(`<span style="display:inline-flex;flex-shrink:0">${SVG.plus}</span>`)
    }

    // Label (skip for icon-only)
    if (!isIconOnly) {
      parts.push(`<span>${label}</span>`)
    }

    // Right icon
    if (showRightIcon) {
      parts.push(`<span style="display:inline-flex;flex-shrink:0">${SVG.arrowRight}</span>`)
    }

    // Dropdown divider + chevron
    if (isDropdown) {
      parts.push(`<span style="width:1px;align-self:stretch;margin:0 3px;background-color:currentColor;opacity:0.2"></span>`)
      parts.push(`<span style="display:inline-flex;flex-shrink:0">${SVG.chevronDown}</span>`)
    }

    return parts.join("")
  }

  /** Build a single <button> HTML string */
  function makeButton(
    v: VariantName, sz: SizeName, st: StateName,
    iconPos: IconPosition, btnType: ButtonType,
  ): string {
    const figmaName = `Variant=${v}, Size=${sz}, State=${st}, Icon=${iconPos}, Type=${btnType}`
    const safeId = figmaName.replace(/\s/g, "").replace(/,/g, "_")
    const disabled = st === "Disabled" ? " disabled" : ""

    return `<button type="button" id="${safeId}" class="${figmaName}" data-name="${figmaName}" data-figma-name="${figmaName}" aria-label="${figmaName}" title="${figmaName}"${disabled} style="${inlineStyle(v, st, sz, iconPos, btnType)}">${innerContent(st, iconPos, btnType)}</button>`
  }

  // ── Build full HTML ──
  const buttons: string[] = []

  for (const v of ALL_VARIANTS) {
    for (const sz of sizes) {
      for (const st of ALL_STATES) {
        for (const iconPos of ALL_ICONS) {
          for (const btnType of types) {
            if (!isValidCombo(iconPos, btnType)) continue
            buttons.push(makeButton(v, sz, st, iconPos, btnType))
          }
        }
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TP Button Component Set</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Inter, sans-serif; background: #F8F8FC; padding: 40px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
button { font-family: inherit; }
</style>
</head>
<body>
${buttons.join("\n")}
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
  a.download = `tp-button-component-set-${tier}.html`
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
    desc: "Medium size only — all variants, states, icon positions, and types",
  },
  "core-sizes": {
    label: "Core + Sizes",
    desc: "All sizes, standard type only — all variants, states, icon positions",
  },
  full: {
    label: "Full",
    desc: "Every combination — all variants, sizes, states, icon positions, and types",
  },
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE COMPONENT (React in-app preview)
   ═══════════════════════════════════════════════════════════════════ */

export function ButtonExperiment() {
  const [copied, setCopied] = useState(false)
  const [tier, setTier] = useState<ExportTier>("core")
  const [previewVariant, setPreviewVariant] = useState<VariantName>("Primary")

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
              Figma Component Set Export
            </h3>
            <p className="text-sm text-tp-slate-600 mt-1 max-w-xl">
              Export <strong>{buttonCount} buttons</strong> with 5 Figma variant properties:
              Variant, Size, State, Icon Position, and Type.
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { prop: "Variant", values: "6", items: "Primary, Outline, Ghost, Tonal, Neutral, Destructive" },
            { prop: "Size", values: tier === "core" ? "1 (MD)" : "3", items: tier === "core" ? "Medium" : "Small, Medium, Large" },
            { prop: "State", values: "5", items: "Default, Hover, Focus, Loading, Disabled" },
            { prop: "Icon", values: "5", items: "None, Left, Right, Both, Only" },
            { prop: "Type", values: tier === "core-sizes" ? "1" : "2", items: tier === "core-sizes" ? "Standard" : "Standard, Dropdown" },
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

      {/* Variant preview selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-tp-slate-400">Preview variant:</span>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_VARIANTS.map((v) => (
            <button
              key={v}
              onClick={() => setPreviewVariant(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewVariant === v
                  ? "bg-tp-blue-100 text-tp-blue-700 border border-tp-blue-300"
                  : "bg-tp-slate-100 text-tp-slate-600 border border-transparent hover:bg-tp-slate-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Button Preview Grid */}
      <div className="space-y-6">
        {/* Standard type */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-3">
            {previewVariant} — Standard
          </p>
          <div className="space-y-3">
            {ALL_STATES.map((st) => (
              <div key={st} className="flex items-center gap-3">
                <span className="text-[10px] text-tp-slate-400 w-14 text-right font-medium shrink-0">{st}</span>
                <div className="flex flex-wrap items-center gap-3">
                  {ALL_ICONS.map((iconPos) => (
                    <div key={iconPos} className="flex flex-col items-center gap-1">
                      <ExperimentButton
                        variant={previewVariant}
                        size="Medium"
                        state={st}
                        icon={iconPos}
                        type="Standard"
                      />
                      <span className="text-[8px] text-tp-slate-300 font-medium">{iconPos}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dropdown type */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-3">
            {previewVariant} — Dropdown
          </p>
          <div className="space-y-3">
            {ALL_STATES.map((st) => (
              <div key={st} className="flex items-center gap-3">
                <span className="text-[10px] text-tp-slate-400 w-14 text-right font-medium shrink-0">{st}</span>
                <div className="flex flex-wrap items-center gap-3">
                  {ALL_ICONS.filter(i => i !== "Only").map((iconPos) => (
                    <div key={iconPos} className="flex flex-col items-center gap-1">
                      <ExperimentButton
                        variant={previewVariant}
                        size="Medium"
                        state={st}
                        icon={iconPos}
                        type="Dropdown"
                      />
                      <span className="text-[8px] text-tp-slate-300 font-medium">{iconPos}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes preview */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tp-slate-400 mb-3">
            {previewVariant} — All Sizes (Default State)
          </p>
          <div className="space-y-3">
            {ALL_SIZES.map((sz) => (
              <div key={sz} className="flex items-center gap-3">
                <span className="text-[10px] text-tp-slate-400 w-14 text-right font-medium shrink-0">{sz}</span>
                <div className="flex flex-wrap items-center gap-3">
                  {ALL_ICONS.map((iconPos) => (
                    <ExperimentButton
                      key={iconPos}
                      variant={previewVariant}
                      size={sz}
                      state="Default"
                      icon={iconPos}
                      type="Standard"
                    />
                  ))}
                  {/* Also show dropdown for this size */}
                  <span className="text-[8px] text-tp-slate-300 mx-1">|</span>
                  {ALL_ICONS.filter(i => i !== "Only").map((iconPos) => (
                    <ExperimentButton
                      key={`dd-${iconPos}`}
                      variant={previewVariant}
                      size={sz}
                      state="Default"
                      icon={iconPos}
                      type="Dropdown"
                    />
                  ))}
                </div>
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
          <li>Select all imported button frames</li>
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
          Paste this in Figma → Plugins → Development → Open Console. It walks every &quot;button&quot; frame and renames it
          with Variant, Size, State, Icon, and Type properties.
        </p>
      </div>
    </div>
  )
}

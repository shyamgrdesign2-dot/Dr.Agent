"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { IconFamilyShowcase } from "@/components/design-system/icon-family-showcase"
import { TokenPanel } from "@/components/design-system/token-badge"
import {
  shadowTokens,
  radiusTokens,
  borderTokens,
  typographyTokens as typTokenGroup,
} from "@/lib/component-tokens"

// ─── SHADOWS (improved with layered, natural depth) ───

const shadowScale = [
  { token: "TP.shadow.xs", name: "shadow-xs", value: "0 1px 2px 0 rgba(23,23,37,0.04)", usage: "Subtle lift for inputs, small cards", cssVar: "--tp-shadow-xs", twClass: "shadow-xs" },
  { token: "TP.shadow.sm", name: "shadow-sm", value: "0 1px 3px 0 rgba(23,23,37,0.08), 0 1px 2px -1px rgba(23,23,37,0.06)", usage: "Default card shadow, dropdowns", cssVar: "--tp-shadow-sm", twClass: "shadow-sm" },
  { token: "TP.shadow.md", name: "shadow-md", value: "0 4px 8px -2px rgba(23,23,37,0.08), 0 2px 4px -2px rgba(23,23,37,0.06)", usage: "Elevated cards, modals, popovers", cssVar: "--tp-shadow-md", twClass: "shadow-md" },
  { token: "TP.shadow.lg", name: "shadow-lg", value: "0 12px 24px -4px rgba(23,23,37,0.08), 0 4px 8px -4px rgba(23,23,37,0.04)", usage: "Floating elements, prominent modals", cssVar: "--tp-shadow-lg", twClass: "shadow-lg" },
  { token: "TP.shadow.xl", name: "shadow-xl", value: "0 20px 40px -8px rgba(23,23,37,0.12), 0 8px 16px -6px rgba(23,23,37,0.06)", usage: "Hero overlays, command palettes", cssVar: "--tp-shadow-xl", twClass: "shadow-xl" },
  { token: "TP.shadow.2xl", name: "shadow-2xl", value: "0 32px 64px -12px rgba(23,23,37,0.20)", usage: "Maximum elevation, full-screen overlays", cssVar: "--tp-shadow-2xl", twClass: "shadow-2xl" },
]

// ─── CORNER RADIUS ───

const radiusScale = [
  { token: "TP.radius.2", name: "rounded-sm", px: 2, usage: "Micro elements, inline tags", cssVar: "--tp-radius-2" },
  { token: "TP.radius.4", name: "rounded", px: 4, usage: "Small chips, badges", cssVar: "--tp-radius-4" },
  { token: "TP.radius.6", name: "rounded-md", px: 6, usage: "Compact inputs, toggles", cssVar: "--tp-radius-6" },
  { token: "TP.radius.8", name: "rounded-lg", px: 8, usage: "Standard inputs, small cards", cssVar: "--tp-radius-8" },
  { token: "TP.radius.10", name: "rounded-[10px]", px: 10, usage: "Buttons (small)", cssVar: "--tp-radius-10" },
  { token: "TP.radius.12", name: "rounded-xl", px: 12, usage: "CTA default, medium cards", cssVar: "--tp-radius-12" },
  { token: "TP.radius.14", name: "rounded-[14px]", px: 14, usage: "Large inputs", cssVar: "--tp-radius-14" },
  { token: "TP.radius.16", name: "rounded-2xl", px: 16, usage: "Cards, dialogs", cssVar: "--tp-radius-16" },
  { token: "TP.radius.18", name: "rounded-[18px]", px: 18, usage: "Large cards", cssVar: "--tp-radius-18" },
  { token: "TP.radius.20", name: "rounded-[20px]", px: 20, usage: "Feature cards, modals", cssVar: "--tp-radius-20" },
  { token: "TP.radius.24", name: "rounded-3xl", px: 24, usage: "Hero cards, banners", cssVar: "--tp-radius-24" },
  { token: "TP.radius.42", name: "rounded-[42px]", px: 42, usage: "Pill shapes, full-round buttons", cssVar: "--tp-radius-42" },
  { token: "TP.radius.84", name: "rounded-[84px]", px: 84, usage: "Circle elements, avatars", cssVar: "--tp-radius-84" },
  { token: "TP.radius.full", name: "rounded-full", px: 9999, usage: "Perfect circle, status dots", cssVar: "--tp-radius-full" },
]

// ─── BORDER WIDTHS + COLORS ───

const borderWidths = [
  { token: "TP.border.width.default", name: "border", px: 1, usage: "Default borders, dividers, table lines", cssVar: "--tp-border-width-default" },
  { token: "TP.border.width.medium", name: "border-[1.5px]", px: 1.5, usage: "CTA outlines, emphasis borders", cssVar: "--tp-border-width-medium" },
  { token: "TP.border.width.strong", name: "border-2", px: 2, usage: "Focus rings, selected states", cssVar: "--tp-border-width-strong" },
  { token: "TP.border.width.heavy", name: "border-[3px]", px: 3, usage: "Active tab indicator, heavy emphasis", cssVar: "--tp-border-width-heavy" },
  { token: "TP.border.width.accent", name: "border-4", px: 4, usage: "Section dividers, hero accents", cssVar: "--tp-border-width-accent" },
]

const borderColors = [
  { token: "TP.border.color.default", name: "border-tp-slate-200", hex: "#E2E2EA", usage: "Default borders, card outlines, table rules", cssVar: "--tp-border-default" },
  { token: "TP.border.color.subtle", name: "border-tp-slate-100", hex: "#F1F1F5", usage: "Inner dividers, row separators", cssVar: "--tp-border-subtle" },
  { token: "TP.border.color.strong", name: "border-tp-slate-300", hex: "#D0D5DD", usage: "Emphasized borders, input hover", cssVar: "--tp-border-strong" },
  { token: "TP.border.color.focus", name: "border-tp-blue-500", hex: "#4B4AD5", usage: "Focus state, active inputs", cssVar: "--tp-border-focus" },
  { token: "TP.border.color.error", name: "border-tp-error-500", hex: "#E11D48", usage: "Error state inputs", cssVar: "--tp-border-error" },
  { token: "TP.border.color.success", name: "border-tp-success-500", hex: "#10B981", usage: "Success state inputs", cssVar: "--tp-border-success" },
  { token: "TP.border.color.disabled", name: "border-tp-slate-100", hex: "#F1F1F5", usage: "Disabled input borders", cssVar: "--tp-border-disabled" },
]

// ─── TYPOGRAPHY TOKENS (tokenized names) ───

const typographyTokensList = [
  { token: "TP.text.display", element: "h1", family: "Mulish", size: "48px", weight: "700", lineHeight: "56px", tracking: "-0.02em", usage: "Hero titles, major page headers", cssVar: "--tp-text-display" },
  { token: "TP.text.h1", element: "h1", family: "Mulish", size: "36px", weight: "700", lineHeight: "44px", tracking: "-0.02em", usage: "Page titles, section headers", cssVar: "--tp-text-h1" },
  { token: "TP.text.h2", element: "h2", family: "Mulish", size: "30px", weight: "600", lineHeight: "38px", tracking: "-0.01em", usage: "Section titles, card headers", cssVar: "--tp-text-h2" },
  { token: "TP.text.h3", element: "h3", family: "Mulish", size: "24px", weight: "600", lineHeight: "32px", tracking: "-0.01em", usage: "Sub-section headers", cssVar: "--tp-text-h3" },
  { token: "TP.text.h4", element: "h4", family: "Mulish", size: "20px", weight: "600", lineHeight: "28px", tracking: "0", usage: "Card titles, widget headers", cssVar: "--tp-text-h4" },
  { token: "TP.text.h5", element: "h5", family: "Mulish", size: "16px", weight: "600", lineHeight: "24px", tracking: "0", usage: "Small section titles, labels", cssVar: "--tp-text-h5" },
  { token: "TP.text.h6", element: "h6", family: "Mulish", size: "14px", weight: "600", lineHeight: "20px", tracking: "0.01em", usage: "Overlines, uppercase labels", cssVar: "--tp-text-h6" },
  { token: "TP.text.body.lg", element: "p", family: "Inter", size: "18px", weight: "400", lineHeight: "28px", tracking: "0", usage: "Intro text, feature descriptions", cssVar: "--tp-text-body-lg" },
  { token: "TP.text.body.base", element: "p", family: "Inter", size: "16px", weight: "400", lineHeight: "24px", tracking: "0", usage: "Default body text, paragraphs", cssVar: "--tp-text-body-base" },
  { token: "TP.text.body.sm", element: "p", family: "Inter", size: "14px", weight: "400", lineHeight: "20px", tracking: "0", usage: "Secondary text, captions, table cells", cssVar: "--tp-text-body-sm" },
  { token: "TP.text.body.xs", element: "span", family: "Inter", size: "12px", weight: "500", lineHeight: "16px", tracking: "0.01em", usage: "Badges, timestamps, micro-text", cssVar: "--tp-text-body-xs" },
  { token: "TP.text.label.lg", element: "label", family: "Inter", size: "16px", weight: "600", lineHeight: "24px", tracking: "0", usage: "Large form labels, section controls", cssVar: "--tp-text-label-lg" },
  { token: "TP.text.label.md", element: "label", family: "Inter", size: "14px", weight: "600", lineHeight: "20px", tracking: "0", usage: "Default form labels, CTA text", cssVar: "--tp-text-label-md" },
  { token: "TP.text.label.sm", element: "label", family: "Inter", size: "12px", weight: "600", lineHeight: "16px", tracking: "0.01em", usage: "Small labels, tag text", cssVar: "--tp-text-label-sm" },
  { token: "TP.text.overline", element: "span", family: "Inter", size: "11px", weight: "700", lineHeight: "14px", tracking: "0.08em", usage: "Section overlines, category labels", cssVar: "--tp-text-overline" },
]

// ─── HOVER/FOCUS INTERACTION STYLES ───

const hoverStyles = [
  { token: "TP.hover.primary", name: "Primary", borderColor: "#4B4AD5", bg: "#FFFFFF", cssVar: "--tp-hover-primary" },
  { token: "TP.hover.secondary", name: "Secondary", borderColor: "#717179", bg: "#FFFFFF", cssVar: "--tp-hover-secondary" },
  { token: "TP.hover.error", name: "Error", borderColor: "#E11D48", bg: "#FFFFFF", cssVar: "--tp-hover-error" },
  { token: "TP.hover.warning", name: "Warning", borderColor: "#F59E0B", bg: "#FFFFFF", cssVar: "--tp-hover-warning" },
  { token: "TP.hover.success", name: "Success", borderColor: "#10B981", bg: "#FFFFFF", cssVar: "--tp-hover-success" },
]

const focusedStyles = [
  { token: "TP.focus.primary", name: "Primary", borderColor: "#4B4AD5", bg: "#EEEEFF", cssVar: "--tp-focus-primary" },
  { token: "TP.focus.secondary", name: "Secondary", borderColor: "#717179", bg: "#F1F1F5", cssVar: "--tp-focus-secondary" },
  { token: "TP.focus.error", name: "Error", borderColor: "#E11D48", bg: "#FFF1F2", cssVar: "--tp-focus-error" },
  { token: "TP.focus.warning", name: "Warning", borderColor: "#F59E0B", bg: "#FFFBEB", cssVar: "--tp-focus-warning" },
  { token: "TP.focus.success", name: "Success", borderColor: "#10B981", bg: "#ECFDF5", cssVar: "--tp-focus-success" },
]

/* ── Inline copy helper ── */
function CopyableToken({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 rounded bg-tp-blue-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-tp-blue-700 hover:bg-tp-blue-100 border border-tp-blue-100 transition-colors"
      title={`Copy: ${text}`}
    >
      {label || text}
      {copied ? <Check size={9} className="text-tp-success-500" /> : <Copy size={9} className="opacity-0 group-hover:opacity-100" />}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHADOW SHOWCASE — with inline token names, CSS vars, values
   ═══════════════════════════════════════════════════════════════ */

export function ShadowShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Box Shadows
      </h3>
      <p className="text-xs text-tp-slate-400 mb-6">
        Layered elevation scale using TP Slate 900 alpha values. Natural depth with ambient + direct light layers.
      </p>

      {/* Normal Styles */}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-4">Normal Styles</h4>
      <p className="text-xs text-tp-slate-400 mb-4">Regular usage for components on the screen like buttons, cards, images and dropdowns.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {shadowScale.map((s) => (
          <div key={s.name} className="group flex flex-col gap-3">
            <div
              className="h-24 rounded-xl bg-card flex items-center justify-center border border-tp-slate-100"
              style={{ boxShadow: s.value }}
            >
              <span className="text-sm font-mono font-semibold text-tp-slate-700">{s.name}</span>
            </div>
            <div className="px-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <CopyableToken text={s.token} />
                <span className="text-[10px] font-mono text-tp-slate-400">{s.cssVar}</span>
              </div>
              <p className="text-xs font-medium text-tp-slate-600">{s.usage}</p>
              <code className="text-[10px] font-mono text-tp-slate-400 break-all leading-tight block">
                {s.value}
              </code>
              <span className="inline-block text-[10px] font-mono text-tp-violet-600 bg-tp-violet-50 px-1.5 py-0.5 rounded border border-tp-violet-100">{s.twClass}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hover Styles */}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-4">Hover Styles</h4>
      <p className="text-xs text-tp-slate-400 mb-4">
        Used for hover effects when the user&apos;s cursor is inside the area of the component. Primarily used for hover variants inside atomic components.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
        {hoverStyles.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-2">
            <div
              className="w-full h-28 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: s.bg,
                border: `2px solid ${s.borderColor}`,
                boxShadow: `0 4px 12px -2px ${s.borderColor}20, 0 2px 4px -2px ${s.borderColor}10`,
              }}
            />
            <CopyableToken text={s.token} />
            <span className="text-[10px] font-mono text-tp-slate-400">{s.cssVar}</span>
            <span className="text-xs font-semibold text-tp-slate-700">{s.name}</span>
            <span className="text-[10px] font-mono text-tp-slate-400">border: {s.borderColor}</span>
          </div>
        ))}
      </div>

      {/* Focused Styles */}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-4">Focused Styles</h4>
      <p className="text-xs text-tp-slate-400 mb-4">
        Used for focused effects for drawing user attention and occasionally on sub-components when user is performing nested activity inside parent component.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {focusedStyles.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-2">
            <div
              className="w-full h-28 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: s.bg,
                border: `2px solid ${s.borderColor}`,
                boxShadow: `0 0 0 4px ${s.borderColor}15, 0 4px 12px -2px ${s.borderColor}20`,
              }}
            />
            <CopyableToken text={s.token} />
            <span className="text-[10px] font-mono text-tp-slate-400">{s.cssVar}</span>
            <span className="text-xs font-semibold text-tp-slate-700">{s.name}</span>
            <span className="text-[10px] font-mono text-tp-slate-400">bg: {s.bg} / border: {s.borderColor}</span>
          </div>
        ))}
      </div>

      {/* Token panel for complete shadow spec */}
      <TokenPanel
        title="Complete Shadow & Elevation Tokens"
        tokens={shadowTokens.tokens}
        defaultOpen={false}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RADIUS SHOWCASE — with inline tokens and CSS vars
   ═══════════════════════════════════════════════════════════════ */

export function RadiusShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Corner Radius
      </h3>
      <p className="text-xs text-tp-slate-400 mb-6">
        Scale from 2px to full-round. CTA default is 12px. Increases in 2px steps up to 24px, then jumps to pill (42px) and circle (84px+).
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {radiusScale.map((r) => (
          <div key={r.name} className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 flex items-center justify-center"
              style={{
                border: "2px solid #4B4AD5",
                borderRadius: `${r.px === 9999 ? "9999" : r.px}px`,
                backgroundColor: "#EEEEFF",
              }}
            >
              <span className="text-xs font-mono font-bold text-tp-blue-700">{r.px === 9999 ? "Full" : r.px}</span>
            </div>
            <CopyableToken text={r.token} />
            <span className="text-[10px] font-mono text-tp-slate-400 text-center">{r.cssVar}</span>
            <span className="inline-block text-[10px] font-mono text-tp-violet-600 bg-tp-violet-50 px-1.5 py-0.5 rounded border border-tp-violet-100">{r.name}</span>
            <span className="text-[10px] text-tp-slate-400 text-center leading-tight">{r.usage}</span>
          </div>
        ))}
      </div>

      <TokenPanel
        title="Complete Border Radius Tokens"
        tokens={radiusTokens.tokens}
        defaultOpen={false}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BORDER SHOWCASE — with inline token names, CSS vars, and hex
   ═══════════════════════════════════════════════════════════════ */

export function BorderShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Borders
      </h3>
      <p className="text-xs text-tp-slate-400 mb-6">
        Border widths and semantic colors. Each width has a defined use case, and colors map to TP Slate and functional token palettes.
      </p>

      {/* Border Widths */}
      <div className="mb-8">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-4">Widths</h4>
        <div className="flex flex-col gap-4">
          {borderWidths.map((b) => (
            <div key={b.token} className="flex items-center gap-4">
              <div className="w-48 flex-shrink-0 flex flex-wrap items-center gap-1.5">
                <CopyableToken text={b.token} />
              </div>
              <div
                className="flex-1 h-0"
                style={{ borderTop: `${b.px}px solid #4B4AD5` }}
              />
              <span className="text-xs font-mono text-tp-slate-500 w-12 text-right flex-shrink-0">{b.px}px</span>
              <span className="inline-block text-[10px] font-mono text-tp-violet-600 bg-tp-violet-50 px-1.5 py-0.5 rounded border border-tp-violet-100 flex-shrink-0 hidden md:inline-block">{b.name}</span>
              <span className="text-xs text-tp-slate-400 w-48 text-right flex-shrink-0 hidden lg:block">{b.usage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Border Colors */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-4">Semantic Border Colors</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {borderColors.map((c) => (
            <div
              key={c.token}
              className="flex flex-col gap-2 px-3 py-3 rounded-lg bg-card"
              style={{ border: `2px solid ${c.hex}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <CopyableToken text={c.token} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono text-tp-slate-400">{c.cssVar}</span>
                <span className="text-[10px] font-mono text-tp-slate-500">{c.hex}</span>
              </div>
              <span className="inline-block text-[10px] font-mono text-tp-violet-600 bg-tp-violet-50 px-1.5 py-0.5 rounded border border-tp-violet-100 w-fit">{c.name}</span>
              <div className="text-[10px] text-tp-slate-400">{c.usage}</div>
            </div>
          ))}
        </div>
      </div>

      <TokenPanel
        title="Complete Border Tokens"
        tokens={borderTokens.tokens}
        defaultOpen={false}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ICON SHOWCASE
   ═══════════════════════════════════════════════════════════════ */

export function IconShowcase() {
  return (
    <IconFamilyShowcase />
  )
}

/* ═══════════════════════════════════════════════════════════════
   TYPOGRAPHY TOKEN SHOWCASE — with inline token, CSS var, usage
   ═══════════════════════════════════════════════════════════════ */

export function TypographyTokenShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Typography Tokens
      </h3>
      <p className="text-xs text-tp-slate-400 mb-6">
        Tokenized typography scale for design handoff. Token names follow <code className="text-tp-blue-600">TP.text.*</code> naming convention. Click any token to copy.
      </p>

      {/* Font families summary */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          { token: "TP.font.heading", family: "Mulish", role: "Headings & display", weights: "600, 700, 800", cssVar: "--font-heading" },
          { token: "TP.font.body", family: "Inter", role: "Body, labels, UI", weights: "400, 500, 600, 700", cssVar: "--font-sans" },
          { token: "TP.font.mono", family: "System Monospace", role: "Code, tokens", weights: "400, 500", cssVar: "--font-mono" },
        ].map((f) => (
          <div key={f.family} className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-tp-slate-800">{f.family}</span>
              <CopyableToken text={f.token} />
            </div>
            <p className="text-xs text-tp-slate-500">{f.role}</p>
            <p className="text-[10px] text-tp-slate-400 mt-1 font-mono">Weights: {f.weights}</p>
            <span className="inline-block mt-1 text-[10px] font-mono text-tp-slate-400">{f.cssVar}</span>
          </div>
        ))}
      </div>

      {/* Token table */}
      <div className="border border-tp-slate-200 rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-tp-slate-50 border-b border-tp-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700 whitespace-nowrap">Token</th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700 whitespace-nowrap hidden md:table-cell">CSS Var</th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">Family</th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">Size</th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">Weight</th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">Line H.</th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700 hidden lg:table-cell">Tracking</th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700 hidden xl:table-cell">Preview</th>
              </tr>
            </thead>
            <tbody>
              {typographyTokensList.map((t) => (
                <tr key={t.token} className="border-b border-tp-slate-100 last:border-b-0 hover:bg-tp-blue-50/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <CopyableToken text={t.token} />
                  </td>
                  <td className="px-4 py-3 text-tp-slate-400 font-mono text-[10px] whitespace-nowrap hidden md:table-cell">{t.cssVar}</td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">{t.family}</td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">{t.size}</td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">{t.weight}</td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">{t.lineHeight}</td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs hidden lg:table-cell">{t.tracking}</td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span
                      style={{
                        fontFamily: t.family === "Mulish" ? "var(--font-heading)" : "var(--font-sans)",
                        fontSize: `min(${t.size}, 20px)`,
                        fontWeight: Number(t.weight),
                        lineHeight: "1.4",
                        color: "#171725",
                      }}
                    >
                      {"Aa Bb Cc"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full typography token panel */}
      <TokenPanel
        title="Complete Typography Tokens"
        tokens={typTokenGroup.tokens}
        defaultOpen={false}
      />
    </div>
  )
}

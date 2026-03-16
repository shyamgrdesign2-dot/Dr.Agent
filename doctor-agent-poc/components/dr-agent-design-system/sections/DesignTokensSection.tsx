"use client"

import {
  AI_GRADIENT,
  AI_GRADIENT_SOFT,
  AI_GRADIENT_SOFT_ANIMATED,
  AI_PILL_BG,
  AI_PILL_BORDER,
  AI_PILL_TEXT_GRADIENT,
} from "@/components/tp-rxpad/dr-agent/constants"

// ─────────────────────────────────────────────────────────────
// Design Tokens Section — Colors, Typography, Spacing, Radius, AI Gradients
// ─────────────────────────────────────────────────────────────

const COLORS = [
  { token: "tp-blue-50", value: "rgba(59,130,246,0.08)", usage: "Card icon backgrounds", hex: "#EFF6FF" },
  { token: "tp-blue-500", value: "#3B82F6", usage: "Primary actions, icons", hex: "#3B82F6" },
  { token: "tp-slate-50", value: "#F8FAFC", usage: "Borders, separators", hex: "#F8FAFC" },
  { token: "tp-slate-100", value: "#F1F5F9", usage: "User bubble bg, hover states", hex: "#F1F5F9" },
  { token: "tp-slate-200", value: "#E2E8F0", usage: "Input borders", hex: "#E2E8F0" },
  { token: "tp-slate-300", value: "#CBD5E1", usage: "Checkbox unchecked border", hex: "#CBD5E1" },
  { token: "tp-slate-400", value: "#94A3B8", usage: "Meta text, dates", hex: "#94A3B8" },
  { token: "tp-slate-500", value: "#64748B", usage: "Secondary text", hex: "#64748B" },
  { token: "tp-slate-600", value: "#475569", usage: "Body text alt", hex: "#475569" },
  { token: "tp-slate-700", value: "#334155", usage: "Primary body text", hex: "#334155" },
  { token: "tp-slate-800", value: "#1E293B", usage: "Headings, labels", hex: "#1E293B" },
  { token: "tp-violet-50", value: "rgba(139,92,246,0.08)", usage: "Specialty tag bg", hex: "#F5F3FF" },
  { token: "tp-violet-200", value: "#DDD6FE", usage: "Quote borders", hex: "#DDD6FE" },
  { token: "tp-violet-500", value: "#8B5CF6", usage: "Specialty accents", hex: "#8B5CF6" },
  { token: "tp-violet-600", value: "#7C3AED", usage: "Specialty text", hex: "#7C3AED" },
  { token: "tp-violet-700", value: "#6D28D9", usage: "Specialty emphasis", hex: "#6D28D9" },
  { token: "tp-error-50", value: "#FEF2F2", usage: "Error backgrounds", hex: "#FEF2F2" },
  { token: "tp-error-600", value: "#DC2626", usage: "Flag text (high/low)", hex: "#DC2626" },
  { token: "tp-error-700", value: "#B91C1C", usage: "Error text", hex: "#B91C1C" },
  { token: "tp-warning-50", value: "#FFFBEB", usage: "Warning backgrounds", hex: "#FFFBEB" },
  { token: "tp-warning-700", value: "#B45309", usage: "Warning text", hex: "#B45309" },
]

const TYPOGRAPHY = [
  { size: "9px", usage: "Ref ranges, tertiary info", weight: "normal", example: "70-100 mg/dL" },
  { size: "10px", usage: "Meta text, dates, secondary info", weight: "normal", example: "05 Mar'26 · Dr. Sharma" },
  { size: "11px", usage: "Pills, tags, small buttons", weight: "medium", example: "Compare prev" },
  { size: "12px", usage: "Primary body text (ALL card content)", weight: "normal/medium", example: "HbA1c elevated — consider intensifying" },
  { size: "14px", usage: "Card titles (max in content)", weight: "semibold", example: "Lab Panel Results" },
  { size: "16px", usage: "Header title (Dr. Agent)", weight: "semibold", example: "Dr. Agent" },
]

const SPACING = [
  { value: "3px", usage: "Row vertical padding (DataRow, CheckboxRow)" },
  { value: "6px", usage: "Gap between icon and title in header" },
  { value: "8px", usage: "Section gaps, small padding" },
  { value: "10px", usage: "Card body padding (py), small component padding" },
  { value: "12px", usage: "Card horizontal padding (px-3)" },
  { value: "14px", usage: "Outer panel padding, header px" },
]

const RADIUS = [
  { value: "4px", usage: "Tags, badges", example: "SectionTag, Badge" },
  { value: "6px", usage: "InsightBox, AiGradientBg", example: "Insight callouts" },
  { value: "8px", usage: "Inner containers, icon backgrounds", example: "Icon bg, dropdowns" },
  { value: "12px", usage: "Pills, input borders, chat bubbles", example: "ChatPill, ChatInput" },
  { value: "14px", usage: "Card outer shell", example: "CardShell" },
  { value: "16px", usage: "Bottom sheets, panels", example: "DocumentBottomSheet" },
]

const GRADIENTS = [
  { name: "AI_GRADIENT", value: AI_GRADIENT, usage: "Text fills, brand accents" },
  { name: "AI_GRADIENT_SOFT", value: AI_GRADIENT_SOFT, usage: "Static icon backgrounds" },
  { name: "AI_GRADIENT_SOFT_ANIMATED", value: AI_GRADIENT_SOFT_ANIMATED, usage: "Animated icon backgrounds (6s flow)" },
  { name: "AI_PILL_BG", value: AI_PILL_BG, usage: "Chat pill backgrounds" },
  { name: "AI_PILL_TEXT_GRADIENT", value: AI_PILL_TEXT_GRADIENT, usage: "Pill text gradient fill" },
  { name: "AI_PILL_BORDER", value: AI_PILL_BORDER, usage: "Pill border (1px)" },
  { name: "Card Gradient Border", value: "linear-gradient(180deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 25%, rgba(23,23,37,0.02) 50%, rgba(59,130,246,0.04) 75%, rgba(59,130,246,0.18) 100%)", usage: "CardShell border" },
  { name: "Header BG", value: "linear-gradient(135deg, rgba(213,101,234,0.22) 0%, rgba(103,58,172,0.18) 40%, rgba(26,25,148,0.22) 100%)", usage: "AgentHeader background" },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-6 text-[14px] font-semibold text-tp-slate-800 border-b border-tp-slate-100 pb-2">{children}</h3>
}

export function DesignTokensSection() {
  return (
    <section id="design-tokens" className="mb-12">
      <h2 className="mb-6 text-[20px] font-bold text-tp-slate-800">
        Design Tokens
      </h2>

      {/* Colors */}
      <SectionHeading>Color Palette</SectionHeading>
      <div className="grid grid-cols-1 gap-[6px] sm:grid-cols-2 lg:grid-cols-3">
        {COLORS.map((c) => (
          <div key={c.token} className="flex items-center gap-3 rounded-[8px] border border-tp-slate-100 px-3 py-2">
            <div
              className="h-8 w-8 flex-shrink-0 rounded-[6px] border border-tp-slate-200"
              style={{ background: c.hex }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-tp-slate-800 truncate">{c.token}</p>
              <p className="text-[10px] text-tp-slate-400 truncate">{c.value}</p>
              <p className="text-[9px] text-tp-slate-400 truncate">{c.usage}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <SectionHeading>Typography Scale</SectionHeading>
      <div className="overflow-hidden rounded-[8px] border border-tp-slate-100">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="bg-tp-slate-50 text-[10px] font-medium text-tp-slate-500">
              <th className="px-3 py-2">Size</th>
              <th className="px-3 py-2">Weight</th>
              <th className="px-3 py-2">Usage</th>
              <th className="px-3 py-2">Example</th>
            </tr>
          </thead>
          <tbody>
            {TYPOGRAPHY.map((t) => (
              <tr key={t.size} className="border-t border-tp-slate-50">
                <td className="px-3 py-2 font-mono text-tp-blue-500 font-semibold">{t.size}</td>
                <td className="px-3 py-2 text-tp-slate-500">{t.weight}</td>
                <td className="px-3 py-2 text-tp-slate-700">{t.usage}</td>
                <td className="px-3 py-2 text-tp-slate-400" style={{ fontSize: t.size }}>{t.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Spacing */}
      <SectionHeading>Spacing Scale</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {SPACING.map((s) => (
          <div key={s.value} className="rounded-[8px] border border-tp-slate-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <div
                className="bg-tp-blue-500 rounded-[2px]"
                style={{ width: s.value, height: "16px" }}
              />
              <span className="font-mono text-[12px] font-semibold text-tp-blue-500">{s.value}</span>
            </div>
            <p className="mt-1 text-[10px] text-tp-slate-500">{s.usage}</p>
          </div>
        ))}
      </div>

      {/* Border Radius */}
      <SectionHeading>Border Radius</SectionHeading>
      <div className="flex flex-wrap gap-3">
        {RADIUS.map((r) => (
          <div key={r.value} className="flex flex-col items-center gap-1">
            <div
              className="h-12 w-12 border-2 border-tp-blue-500 bg-tp-blue-50"
              style={{ borderRadius: r.value }}
            />
            <span className="font-mono text-[11px] font-semibold text-tp-blue-500">{r.value}</span>
            <span className="text-[9px] text-tp-slate-400 text-center max-w-[80px]">{r.usage}</span>
          </div>
        ))}
      </div>

      {/* AI Gradients */}
      <SectionHeading>AI Brand Gradients</SectionHeading>
      <div className="space-y-2">
        {GRADIENTS.map((g) => (
          <div key={g.name} className="flex items-center gap-3 rounded-[8px] border border-tp-slate-100 px-3 py-2">
            <div
              className="h-8 w-24 flex-shrink-0 rounded-[6px] border border-white/20"
              style={{ background: g.value }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-tp-slate-800">{g.name}</p>
              <p className="text-[9px] text-tp-slate-400 truncate max-w-[400px]">{g.value}</p>
              <p className="text-[9px] text-tp-violet-500">{g.usage}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

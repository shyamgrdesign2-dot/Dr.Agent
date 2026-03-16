import React from "react"
import {
  Wand2,
  CheckCircle2,
  Info,
  Shield,
  Cpu,
  ChevronRight,
  Plus,
  Copy,
} from "lucide-react"
import {
  designTokens,
  gradients,
  getColor,
  ctaVariants,
  typographyScale,
  spacingScale,
  gridSystem,
  type ColorGroup,
  type FunctionalGroup,
} from "@/lib/design-tokens"

const primary = designTokens.primary as ColorGroup
const secondary = designTokens.secondary as ColorGroup
const tpSlate = designTokens.tpSlate as ColorGroup
const functional = designTokens.functional as FunctionalGroup

function getSubColor(subgroupIdx: number, tokenNum: number): string {
  const sub = functional.subgroups[subgroupIdx]
  if (!sub || !Array.isArray(sub.colors)) {
    return getColor(tpSlate, 500)
  }
  return sub.colors.find((c) => c.token === tokenNum)?.value ?? "#000"
}

/* ── CTA Spec Demo ── */

export function CtaSpecDemo() {
  return (
    <div className="flex flex-col gap-12">
      {/* Shared spec callout */}
      <div className="border border-tp-slate-200 rounded-xl p-6 bg-tp-slate-25">
        <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-4">
          CTA Hard Constraints
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Icon Size</span>
            <code className="text-xs font-mono text-tp-slate-500">20px</code>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Radius</span>
            <code className="text-xs font-mono text-tp-slate-500">
              10px smooth
            </code>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Label</span>
            <code className="text-xs font-mono text-tp-slate-500">
              14px / Semibold / Inter
            </code>
          </div>
        </div>
      </div>

      {/* Each CTA variant */}
      {ctaVariants.map((variant) => (
        <div key={variant.name}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-tp-slate-900 font-heading">
              {variant.name} CTA
            </h3>
            <p className="text-sm text-tp-slate-600">{variant.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* On Light Surface */}
            <div className="border border-tp-slate-200 rounded-xl p-6 bg-card">
              <span className="text-xs font-mono uppercase tracking-wider text-tp-slate-400 mb-4 block">
                On Light Surface
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {/* Default */}
                {variant.name === "Link" ? (
                  <button
                    className="inline-flex items-center gap-2 underline underline-offset-4 transition-colors"
                    style={{
                      color: variant.onLight.text,
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Link Action
                    <span className="inline-flex flex-shrink-0"><ChevronRight size={20} /></span>
                  </button>
                ) : (
                  <>
                    <button
                      className="inline-flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor: variant.onLight.bg,
                        color: variant.onLight.text,
                        border:
                          variant.onLight.border !== "none"
                            ? `1.5px solid ${variant.onLight.border}`
                            : "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontWeight: 600,
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        minHeight: "38px",
                      }}
                    >
                      <span className="inline-flex flex-shrink-0"><Plus size={20} /></span>
                      {variant.name} Default
                    </button>
                    <button
                      className="inline-flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor: variant.onLight.hoverBg,
                        color: variant.onLight.text,
                        border:
                          variant.onLight.border !== "none"
                            ? `1.5px solid ${variant.onLight.border}`
                            : "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontWeight: 600,
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        minHeight: "38px",
                      }}
                    >
                      Hover
                    </button>
                    <button
                      className="inline-flex items-center gap-2 cursor-not-allowed"
                      style={{
                        backgroundColor: variant.onLight.disabledBg,
                        color: variant.onLight.disabledText,
                        border:
                          variant.onLight.border !== "none"
                            ? `1.5px solid ${variant.onLight.disabledText}`
                            : "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontWeight: 600,
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        minHeight: "38px",
                      }}
                      disabled
                    >
                      Disabled
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* On Dark Surface */}
            <div
              className="rounded-xl p-6"
              style={{ background: gradients.primary.variants.card }}
            >
              <span
                className="text-xs font-mono uppercase tracking-wider mb-4 block"
                style={{ color: "rgba(255,255,255,0.68)" }}
              >
                On Dark Surface
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {variant.name === "Link" ? (
                  <button
                    className="inline-flex items-center gap-2 underline underline-offset-4 transition-colors"
                    style={{
                      color: variant.onDark.text,
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Link Action
                    <span className="inline-flex flex-shrink-0"><ChevronRight size={20} /></span>
                  </button>
                ) : (
                  <>
                    <button
                      className="inline-flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor: variant.onDark.bg,
                        color: variant.onDark.text,
                        border:
                          variant.onDark.border !== "none"
                            ? `1.5px solid ${variant.onDark.border}`
                            : "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontWeight: 600,
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        minHeight: "38px",
                      }}
                    >
                      <span className="inline-flex flex-shrink-0"><Plus size={20} /></span>
                      {variant.name} Default
                    </button>
                    <button
                      className="inline-flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor: variant.onDark.hoverBg,
                        color: variant.onDark.text,
                        border:
                          variant.onDark.border !== "none"
                            ? `1.5px solid ${variant.onDark.border}`
                            : "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontWeight: 600,
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        minHeight: "38px",
                      }}
                    >
                      Hover
                    </button>
                    <button
                      className="inline-flex items-center gap-2 cursor-not-allowed"
                      style={{
                        backgroundColor: variant.onDark.disabledBg,
                        color: variant.onDark.disabledText,
                        border:
                          variant.onDark.border !== "none"
                            ? `1.5px solid ${variant.onDark.disabledText}`
                            : "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontWeight: 600,
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        minHeight: "38px",
                      }}
                      disabled
                    >
                      Disabled
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Button Quick Demo ── */

export function ButtonDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-center">
        <button
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            backgroundColor: getColor(primary, 500),
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "8px 14px",
            fontWeight: 600,
            fontSize: "14px",
            minHeight: "38px",
          }}
        >
          <span className="inline-flex flex-shrink-0"><Plus size={20} /></span>
          Primary Action
        </button>
        <button
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            backgroundColor: "transparent",
            color: getColor(primary, 500),
            border: `1.5px solid ${getColor(primary, 500)}`,
            borderRadius: "10px",
            padding: "8px 14px",
            fontWeight: 600,
            fontSize: "14px",
            minHeight: "38px",
          }}
        >
          Secondary Outline
        </button>
        <button
          className="inline-flex items-center gap-2 underline underline-offset-4 transition-colors"
          style={{
            color: getColor(primary, 500),
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Tertiary Link
          <span className="inline-flex flex-shrink-0"><ChevronRight size={20} /></span>
        </button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <button
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            backgroundColor: getColor(secondary, 500),
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "8px 14px",
            fontWeight: 600,
            fontSize: "14px",
            minHeight: "38px",
          }}
        >
          Violet Action
        </button>
        <button
          className="inline-flex items-center gap-2 shadow-sm"
          style={{
            background: gradients.ai.css,
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "8px 14px",
            fontWeight: 600,
            fontSize: "14px",
            minHeight: "38px",
          }}
        >
          <span className="inline-flex flex-shrink-0"><Wand2 size={20} /></span>
          AI Assist
        </button>
        <button
          className="inline-flex items-center gap-2 cursor-not-allowed"
          style={{
            backgroundColor: getColor(tpSlate, 200),
            color: getColor(tpSlate, 400),
            borderRadius: "10px",
            padding: "8px 14px",
            fontWeight: 600,
            fontSize: "14px",
            minHeight: "38px",
          }}
          disabled
        >
          Disabled
        </button>
      </div>
    </div>
  )
}

/* ── Gradient Demo ── */

export function GradientDemo() {
  return (
    <div className="flex flex-col gap-8">
      {Object.entries(gradients).map(([key, gradient]) => (
        <div key={key}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-4">
            {gradient.name}
          </h3>
          <p className="text-sm text-tp-slate-600 mb-4 max-w-xl">
            {gradient.description}
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {(["hero", "card", "subtle"] as const).map((variant) => (
              <div
                key={variant}
                className="rounded-xl p-6 min-h-[160px] flex flex-col justify-between shadow-sm"
                style={{ background: gradient.variants[variant] }}
              >
                <div>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium mb-3"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.18)",
                      color: "rgba(255,255,255,0.96)",
                    }}
                  >
                    {variant.toUpperCase()}
                  </span>
                  <h4
                    style={{ color: "rgba(255,255,255,0.96)" }}
                    className="font-bold text-lg font-heading"
                  >
                    {variant === "hero"
                      ? "Full Intensity"
                      : variant === "card"
                        ? "Card Softened"
                        : "Subtle Tint"}
                  </h4>
                </div>
                <p
                  style={{ color: "rgba(255,255,255,0.68)" }}
                  className="text-sm mt-2"
                >
                  {variant === "hero"
                    ? "Large hero banners, section headers."
                    : variant === "card"
                      ? "Feature cards, highlights."
                      : "Nested sections, subtle backgrounds."}
                </p>
              </div>
            ))}
          </div>

          {/* Gradient stops */}
          <div className="flex flex-wrap gap-3 mt-4">
            {gradient.stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div
                  className="w-6 h-6 rounded border border-foreground/10"
                  style={{ backgroundColor: stop.color }}
                />
                <span className="font-mono text-tp-slate-500">{stop.color}</span>
                <span className="text-tp-slate-400">@{stop.position}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Noise rules */}
      <div className="border border-tp-slate-200 rounded-xl p-6 bg-tp-slate-25">
        <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-3">
          Noise & Texture Rules
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Hero Noise</span>
            <span className="text-tp-slate-600">
              Opacity 8%, Blend Overlay, Scale 1.0x
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Card Noise</span>
            <span className="text-tp-slate-600">
              Opacity 6%, Blend Overlay, Scale 0.8x
            </span>
          </div>
        </div>
      </div>

      {/* Text on gradient rules */}
      <div className="border border-tp-slate-200 rounded-xl p-6 bg-tp-slate-25">
        <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-3">
          Text on Gradient (Readability Contract)
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Title</span>
            <code className="text-xs font-mono text-tp-slate-500">
              rgba(255,255,255,0.96)
            </code>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Body</span>
            <code className="text-xs font-mono text-tp-slate-500">
              rgba(255,255,255,0.82)
            </code>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-tp-slate-800">Meta</span>
            <code className="text-xs font-mono text-tp-slate-500">
              rgba(255,255,255,0.68)
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Card Demo ── */

export function CardDemo() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Primary Gradient Card */}
      <div
        className="p-6 rounded-2xl shadow-sm relative overflow-hidden"
        style={{ background: gradients.primary.variants.card }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Wand2
                size={24}
                style={{ color: "rgba(255,255,255,0.96)" }}
              />
            </div>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.96)",
              }}
            >
              Brand
            </span>
          </div>
          <h3
            className="text-lg font-bold mb-2 font-heading"
            style={{ color: "rgba(255,255,255,0.96)" }}
          >
            TP Blue Surface
          </h3>
          <p
            className="mb-4 text-sm"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            Primary brand gradient at card intensity for feature highlights
            and brand moments.
          </p>
          <span
            className="text-sm font-semibold cursor-pointer"
            style={{ color: "rgba(255,255,255,0.96)" }}
          >
            {"Learn More \u2192"}
          </span>
        </div>
      </div>

      {/* AI Gradient Card */}
      <div
        className="p-6 rounded-2xl shadow-sm relative overflow-hidden"
        style={{ background: gradients.ai.variants.card }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Cpu
                size={24}
                style={{ color: "rgba(255,255,255,0.96)" }}
              />
            </div>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.96)",
              }}
            >
              AI
            </span>
          </div>
          <h3
            className="text-lg font-bold mb-2 font-heading"
            style={{ color: "rgba(255,255,255,0.96)" }}
          >
            Ask TatvaPractice
          </h3>
          <p
            className="mb-4 text-sm"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            AI-powered surface using the AI gradient. Reserved for CDSS,
            voice AI, and intelligence features.
          </p>
          <span
            className="text-sm font-semibold cursor-pointer"
            style={{ color: "rgba(255,255,255,0.96)" }}
          >
            {"Get AI Help \u2192"}
          </span>
        </div>
      </div>

      {/* Neutral Card */}
      <div
        className="bg-card p-6 rounded-2xl shadow-sm border"
        style={{ borderColor: getColor(tpSlate, 200) }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: "#F1F1F5" }}
          >
            <CheckCircle2
              size={24}
              style={{ color: getColor(primary, 500) }}
            />
          </div>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: getSubColor(0, 100),
              color: getSubColor(0, 700),
            }}
          >
            Active
          </span>
        </div>
        <h3
          className="text-lg font-bold mb-2 font-heading"
          style={{ color: getColor(tpSlate, 900) }}
        >
          Standard Surface
        </h3>
        <p
          className="mb-4 text-sm"
          style={{ color: getColor(tpSlate, 600) }}
        >
          Neutral surface card for information, actions, and clinical data.
          No gradients on dense data surfaces.
        </p>
        <span
          className="text-sm font-semibold hover:underline cursor-pointer"
          style={{ color: getColor(primary, 500) }}
        >
          {"View Details \u2192"}
        </span>
      </div>

      {/* Secondary Gradient Card */}
      <div
        className="p-6 rounded-2xl shadow-sm relative overflow-hidden"
        style={{ background: gradients.secondary.variants.card }}
      >
        <div className="relative z-10">
          <h3
            className="text-lg font-bold mb-2 font-heading"
            style={{ color: "rgba(255,255,255,0.96)" }}
          >
            Premium Feature
          </h3>
          <p
            className="mb-4 text-sm"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            Secondary gradient surface for depth, trust, and premium feature
            sections.
          </p>
          <button
            className="w-full py-2 font-bold"
            style={{
              backgroundColor: "rgba(255,255,255,0.30)",
              color: "rgba(255,255,255,0.96)",
              borderRadius: "10px",
              fontSize: "14px",
              border: "1.5px solid rgba(255,255,255,0.40)",
            }}
          >
            Unlock Premium
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Alert Demo ── */

export function AlertDemo() {
  return (
    <div className="flex flex-col gap-4">
      {/* Success: Rx confirmed */}
      <div
        className="p-4 rounded-lg flex items-start gap-3 border"
        style={{
          backgroundColor: getSubColor(0, 50),
          borderColor: getSubColor(0, 500),
        }}
      >
        <CheckCircle2
          size={20}
          style={{ color: getSubColor(0, 600) }}
        />
        <div>
          <h4
            className="font-semibold text-sm"
            style={{ color: getSubColor(0, 800) }}
          >
            Prescription Saved
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: getSubColor(0, 700) }}
          >
            Rx for Amoxicillin 500mg has been confirmed and sent to pharmacy.
          </p>
        </div>
      </div>

      {/* Warning: Drug interaction */}
      <div
        className="p-4 rounded-lg flex items-start gap-3 border"
        style={{
          backgroundColor: getSubColor(1, 50),
          borderColor: getSubColor(1, 500),
        }}
      >
        <Info
          size={20}
          style={{ color: getSubColor(1, 600) }}
        />
        <div>
          <h4
            className="font-semibold text-sm"
            style={{ color: getSubColor(1, 800) }}
          >
            Drug Interaction Detected
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: getSubColor(1, 700) }}
          >
            Warfarin + Aspirin: Increased bleeding risk. Review before confirming.
          </p>
        </div>
      </div>

      {/* Error: Allergy alert */}
      <div
        className="p-4 rounded-lg flex items-start gap-3 border"
        style={{
          backgroundColor: getSubColor(2, 50),
          borderColor: getSubColor(2, 500),
        }}
      >
        <Shield
          size={20}
          style={{ color: getSubColor(2, 600) }}
        />
        <div>
          <h4
            className="font-semibold text-sm"
            style={{ color: getSubColor(2, 800) }}
          >
            Allergy Alert -- Penicillin
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: getSubColor(2, 700) }}
          >
            Patient has a documented severe allergy. Prescription cannot proceed.
          </p>
        </div>
      </div>

      {/* Info: Protocol reference */}
      <div
        className="p-4 rounded-lg flex items-start gap-3 border"
        style={{
          backgroundColor: getSubColor(3, 50),
          borderColor: getSubColor(3, 500),
        }}
      >
        <Info
          size={20}
          style={{ color: getSubColor(3, 600) }}
        />
        <div>
          <h4
            className="font-semibold text-sm"
            style={{ color: getSubColor(3, 800) }}
          >
            Clinical Guideline Available
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: getSubColor(3, 700) }}
          >
            WHO protocol for hypertension management (2024) is linked to this diagnosis.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Typography Demo ── */

export function TypographyDemo() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Typography scale table */}
      <div className="border border-tp-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-tp-slate-50 border-b border-tp-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Family
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Size
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Weight
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Line Height
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700 hidden lg:table-cell">
                  Letter Spacing
                </th>
              </tr>
            </thead>
            <tbody>
              {typographyScale.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-tp-slate-100 last:border-b-0"
                >
                  <td className="px-4 py-3 font-semibold text-tp-slate-900">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">
                    {row.fontFamily}
                  </td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">
                    {row.size}
                  </td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">
                    {row.weight}
                  </td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs">
                    {row.lineHeight}
                  </td>
                  <td className="px-4 py-3 text-tp-slate-600 font-mono text-xs hidden lg:table-cell">
                    {row.letterSpacing}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual preview */}
      <div
        className="p-6 border rounded-xl"
        style={{ borderColor: getColor(tpSlate, 300) }}
      >
        <div
          className="border-b pb-4 mb-6"
          style={{ borderColor: getColor(tpSlate, 200) }}
        >
          <span className="text-xs font-mono uppercase text-tp-slate-400">
            Display & Headings (Mulish)
          </span>
        </div>
        <h1
          className="text-5xl font-bold mb-4 tracking-tight font-heading"
          style={{ color: getColor(tpSlate, 900) }}
        >
          TatvaPractice
        </h1>
        <h2
          className="text-3xl font-bold mb-3 tracking-tight font-heading"
          style={{ color: getColor(tpSlate, 800) }}
        >
          Design System
        </h2>
        <h3
          className="text-2xl font-semibold mb-2 font-heading"
          style={{ color: getColor(tpSlate, 800) }}
        >
          Clinical-grade design
        </h3>
        <h4
          className="text-xl font-semibold mb-2 font-heading"
          style={{ color: getColor(tpSlate, 700) }}
        >
          Card Title
        </h4>
        <h5
          className="text-base font-semibold mb-2 font-heading"
          style={{ color: getColor(tpSlate, 700) }}
        >
          Section Label
        </h5>
        <h6
          className="text-sm font-semibold uppercase tracking-wider font-heading"
          style={{ color: getColor(tpSlate, 500) }}
        >
          Overline
        </h6>
      </div>

      <div
        className="p-6 border rounded-xl"
        style={{ borderColor: getColor(tpSlate, 300) }}
      >
        <div
          className="border-b pb-4 mb-6"
          style={{ borderColor: getColor(tpSlate, 200) }}
        >
          <span className="text-xs font-mono uppercase text-tp-slate-400">
            Body & Content (Inter)
          </span>
        </div>
        <div className="mb-4">
          <span className="font-mono text-xs text-tp-slate-400 block mb-1">
            Body LG (18px / 28px)
          </span>
          <p
            className="text-lg leading-relaxed"
            style={{ color: getColor(tpSlate, 700) }}
          >
            The TatvaPractice design system is built for an EMR SaaS platform, with
            reusable components guided by locked brand colors and gradient
            rules to build scalable clinical and AI-powered applications.
          </p>
        </div>
        <div className="mb-4">
          <span className="font-mono text-xs text-tp-slate-400 block mb-1">
            Body Base (16px / 24px)
          </span>
          <p
            className="text-base leading-relaxed"
            style={{ color: getColor(tpSlate, 600) }}
          >
            TP Blue is the core identity color (trust, stability). TP Violet
            represents information and education. The AI gradient (Pink to
            Indigo) is reserved exclusively for intelligence features,
            creating a clear visual distinction across all surfaces.
          </p>
        </div>
        <div className="mb-4">
          <span className="font-mono text-xs text-tp-slate-400 block mb-1">
            Body SM (14px / 20px)
          </span>
          <p
            className="text-sm leading-relaxed"
            style={{ color: getColor(tpSlate, 500) }}
          >
            Supporting text for descriptions, captions, and secondary
            information. Enough contrast to be legible without competing with
            the content hierarchy.
          </p>
        </div>
        <div>
          <span className="font-mono text-xs text-tp-slate-400 block mb-1">
            Caption (12px / 16px)
          </span>
          <p
            className="text-xs leading-normal font-medium"
            style={{ color: getColor(tpSlate, 400) }}
          >
            Badges, timestamps, micro-text. Use sparingly.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Spacing Demo ── */

export function SpacingDemo() {
  const [copied, setCopied] = React.useState<string | null>(null)

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="border border-tp-slate-200 rounded-xl p-6 bg-tp-slate-25 mb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-3">
          Base Unit: 2px
        </h3>
        <p className="text-sm text-tp-slate-600">
          All spacing tokens are derived from a 2px base step. Cards use 18px
          internal padding as the default.
        </p>
      </div>

      <div className="border border-tp-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-tp-slate-50 border-b border-tp-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Token
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  px
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  CSS Variable
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Tailwind
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Usage
                </th>
                <th className="px-4 py-3 text-left font-semibold text-tp-slate-700">
                  Preview
                </th>
              </tr>
            </thead>
            <tbody>
              {spacingScale.map((s) => {
                const cssVar = `--tp-space-${s.px}`
                const twClass = `p-[${s.px}px]`
                const tokenName = `TP.space.${s.px}`
                return (
                  <tr
                    key={s.token}
                    className="border-b border-tp-slate-100 last:border-b-0 hover:bg-tp-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void copyText(tokenName)}
                        className="inline-flex items-center gap-1 rounded-md bg-tp-blue-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-tp-blue-700 hover:bg-tp-blue-100 border border-tp-blue-100 transition-colors"
                      >
                        {tokenName}
                        {copied === tokenName ? (
                          <CheckCircle2 size={9} className="text-green-500" />
                        ) : (
                          <span className="w-[9px]" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-tp-slate-600">
                      {s.px}px
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void copyText(cssVar)}
                        className="inline-flex items-center gap-1 rounded-md bg-tp-slate-100 px-2 py-0.5 font-mono text-[11px] text-tp-slate-600 hover:bg-tp-slate-200 border border-tp-slate-200 transition-colors"
                      >
                        {cssVar}
                        {copied === cssVar ? (
                          <CheckCircle2 size={9} className="text-green-500" />
                        ) : (
                          <span className="w-[9px]" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void copyText(twClass)}
                        className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[11px] text-purple-600 hover:bg-purple-100 border border-purple-100 transition-colors"
                      >
                        {twClass}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-tp-slate-600 text-xs">
                      {s.usage}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="h-3 rounded-sm"
                        style={{
                          width: `${Math.min(s.px * 2, 160)}px`,
                          backgroundColor: getColor(primary, 200),
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ── Grid Demo ── */

export function GridDemo() {
  const [copied, setCopied] = React.useState<string | null>(null)

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1200)
  }

  const gridTokenMap: Record<string, { cols: string; margin: string; gutter: string }> = {
    "Desktop (>=1280px)": { cols: "TP.grid.desktop.cols", margin: "TP.grid.margin.desktop", gutter: "TP.grid.gutter.desktop" },
    "Tablet (>=768px)": { cols: "TP.grid.tablet.cols", margin: "TP.grid.margin.tablet", gutter: "TP.grid.gutter.tablet" },
    "Mobile (<768px)": { cols: "TP.grid.mobile.cols", margin: "TP.grid.margin.mobile", gutter: "TP.grid.gutter.mobile" },
  }

  function CopyChip({ text, variant = "blue" }: { text: string; variant?: "blue" | "slate" }) {
    const styles = variant === "blue"
      ? "bg-tp-blue-50 text-tp-blue-700 hover:bg-tp-blue-100 border-tp-blue-100"
      : "bg-tp-slate-100 text-tp-slate-600 hover:bg-tp-slate-200 border-tp-slate-200"
    return (
      <button
        onClick={() => void copyText(text)}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold border transition-colors ${styles}`}
      >
        {text}
        {copied === text ? (
          <CheckCircle2 size={9} className="text-green-500" />
        ) : (
          <Copy size={9} className="opacity-40" />
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {gridSystem.map((grid) => {
        const tokens = gridTokenMap[grid.breakpoint]
        return (
          <div
            key={grid.breakpoint}
            className="border border-tp-slate-200 rounded-xl p-6 bg-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-tp-slate-900 font-heading">
                {grid.breakpoint}
              </h3>
              <span className="text-xs font-mono px-2 py-1 rounded bg-tp-slate-100 text-tp-slate-600">
                {grid.columns} columns
              </span>
            </div>
            <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${grid.columns}, 1fr)` }}>
              {Array.from({ length: grid.columns }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded"
                  style={{ backgroundColor: getColor(primary, 100) }}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-tp-slate-400">Margin</span>
                <span className="font-mono text-tp-slate-700">{grid.margin}</span>
                {tokens && <CopyChip text={tokens.margin} />}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-tp-slate-400">Gutter</span>
                <span className="font-mono text-tp-slate-700">{grid.gutter}</span>
                {tokens && <CopyChip text={tokens.gutter} />}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-tp-slate-400">Columns</span>
                <span className="font-mono text-tp-slate-700">{grid.columns}</span>
                {tokens && <CopyChip text={tokens.cols} />}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-tp-slate-100 flex items-center gap-1 text-[10px] text-tp-slate-400">
              <span>Usage:</span>
              <span className="text-tp-slate-600">{grid.usage}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { CardRenderer } from "@/components/tp-rxpad/dr-agent/cards/CardRenderer"
import type { RxAgentOutput } from "@/components/tp-rxpad/dr-agent/types"
import type { CatalogEntry } from "../catalog-data"

// ─────────────────────────────────────────────────────────────
// Card Catalog Section — Renders all 50+ cards from catalog data
// ─────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-tp-blue-50", text: "text-tp-blue-700", border: "border-tp-blue-200" },
  B: { bg: "bg-[#E8F6F6]", text: "text-[#0E7E7E]", border: "border-[#0E7E7E]/20" },
  C: { bg: "bg-tp-violet-50", text: "text-tp-violet-700", border: "border-tp-violet-200" },
  D: { bg: "bg-tp-warning-50", text: "text-tp-warning-700", border: "border-tp-warning-200" },
  E: { bg: "bg-tp-error-50", text: "text-tp-error-700", border: "border-tp-error-200" },
  F: { bg: "bg-[#F0FDF4]", text: "text-[#15803D]", border: "border-[#15803D]/20" },
  G: { bg: "bg-tp-slate-50", text: "text-tp-slate-600", border: "border-tp-slate-200" },
}

interface CardCatalogSectionProps {
  entries: CatalogEntry[]
}

export function CardCatalogSection({ entries }: CardCatalogSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("A")

  // Group entries by category
  const grouped = entries.reduce<Record<string, CatalogEntry[]>>((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = []
    acc[entry.category].push(entry)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  return (
    <section id="card-catalog" className="mb-12">
      <h2 className="mb-2 text-[20px] font-bold text-tp-slate-800">
        Card Catalog ({entries.length} Cards)
      </h2>
      <p className="mb-4 text-[12px] text-tp-slate-500">
        All card types rendered with sample data. Click a category to expand/collapse.
      </p>

      {/* Category nav */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.G
          const isActive = expandedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setExpandedCategory(isActive ? null : cat)}
              className={`rounded-full border px-3 py-[4px] text-[11px] font-medium transition-all ${colors.border} ${
                isActive ? `${colors.bg} ${colors.text}` : "bg-white text-tp-slate-500 hover:bg-tp-slate-50"
              }`}
            >
              {cat}. {grouped[cat][0]?.categoryName} ({grouped[cat].length})
            </button>
          )
        })}
      </div>

      {/* Card grid */}
      {categories.map((cat) => {
        if (expandedCategory !== null && expandedCategory !== cat) return null
        const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.G

        return (
          <div key={cat} className="mb-8">
            <div className={`mb-4 flex items-center gap-2 rounded-[8px] border px-3 py-2 ${colors.bg} ${colors.border}`}>
              <span className={`text-[14px] font-bold ${colors.text}`}>{cat}.</span>
              <span className={`text-[13px] font-semibold ${colors.text}`}>{grouped[cat][0]?.categoryName}</span>
              <span className={`ml-auto text-[11px] ${colors.text} opacity-70`}>{grouped[cat].length} cards</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {grouped[cat].map((entry) => (
                <div key={entry.kind} className="flex flex-col">
                  {/* Card label */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-[4px] px-[6px] py-[2px] text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                      {entry.label.split(" — ")[0]}
                    </span>
                    <span className="text-[11px] font-medium text-tp-slate-700 truncate">
                      {entry.label.split(" — ")[1] || entry.label}
                    </span>
                  </div>

                  {/* Kind identifier */}
                  <code className="mb-2 inline-block self-start rounded bg-tp-slate-50 px-2 py-[2px] font-mono text-[10px] text-tp-violet-600">
                    kind: &quot;{entry.kind}&quot;
                  </code>

                  {/* Live card render */}
                  <div className="w-full max-w-[380px]">
                    <CardRenderer
                      output={{ kind: entry.kind, data: entry.data } as RxAgentOutput}
                      onPillTap={() => {}}
                      onCopy={() => {}}
                      onSidebarNav={() => {}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

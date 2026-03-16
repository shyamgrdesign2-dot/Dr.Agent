"use client"

import React from "react"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { AI_GRADIENT } from "@/components/tp-rxpad/dr-agent/constants"

import { DesignTokensSection } from "./sections/DesignTokensSection"
import { CardAnatomySection } from "./sections/CardAnatomySection"
import { CardCatalogSection } from "./sections/CardCatalogSection"
import { ChatShellSection } from "./sections/ChatShellSection"
import { CardRulesSection } from "./sections/CardRulesSection"
import { ExportButton } from "./ExportButton"
import { CATALOG_ENTRIES } from "./catalog-data"

// ─────────────────────────────────────────────────────────────
// Dr. Agent Design System Page — Complete reference for cards
// and chat shell components
// ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "design-tokens", label: "Design Tokens" },
  { id: "card-anatomy", label: "Card Anatomy" },
  { id: "card-catalog", label: "Card Catalog" },
  { id: "chat-shell", label: "Chat Shell" },
  { id: "card-rules", label: "Card Rules" },
]

export function DrAgentDesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFE]">
      {/* ── Sticky Header Bar ── */}
      <header className="sticky top-0 z-50 border-b border-tp-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px]"
              style={{ background: AI_GRADIENT }}
            >
              <AiBrandSparkIcon size={20} className="[filter:brightness(0)_invert(1)]" />
            </div>
            <div>
              <h1
                className="text-[18px] font-bold leading-tight"
                style={{
                  background: AI_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Dr. Agent Design System
              </h1>
              <p className="text-[11px] text-tp-slate-400">
                Complete card & chat shell reference for AI-assisted design generation
              </p>
            </div>
          </div>

          <ExportButton />
        </div>

        {/* Section nav */}
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
          <nav className="flex gap-1 pb-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap rounded-full px-3 py-[4px] text-[11px] font-medium text-tp-slate-500 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-700"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Card Types", value: CATALOG_ENTRIES.length, color: "#3B82F6" },
            { label: "Shell Components", value: 10, color: "#8B5CF6" },
            { label: "Content Primitives", value: 7, color: "#10B981" },
            { label: "Design Tokens", value: "50+", color: "#F59E0B" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] border border-tp-slate-100 bg-white px-4 py-3"
            >
              <p className="text-[24px] font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-[11px] text-tp-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <DesignTokensSection />
        <CardAnatomySection />
        <CardCatalogSection entries={CATALOG_ENTRIES} />
        <ChatShellSection />
        <CardRulesSection />

        {/* Footer */}
        <footer className="mt-12 border-t border-tp-slate-100 pt-6 pb-8 text-center">
          <p className="text-[11px] text-tp-slate-400">
            Dr. Agent Design System v1.0 · {CATALOG_ENTRIES.length} card types · Generated for AI-assisted design workflows
          </p>
          <p className="mt-1 text-[10px] text-tp-slate-300">
            Use the &ldquo;Export Complete Design System&rdquo; button to download a self-contained .md file for handoff to design tools.
          </p>
        </footer>
      </main>
    </div>
  )
}

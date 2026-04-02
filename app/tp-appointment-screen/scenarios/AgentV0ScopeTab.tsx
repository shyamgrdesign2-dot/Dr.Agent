"use client"

import React, { useState } from "react"

// ═══════════════════════════════════════════════════════════════
// DR. AGENT V0 — SCOPE & SPECIFICATION
// Documents the simplified V0 variant: what's included,
// what's excluded, pill filtering, guard behavior,
// and the default-on mode toggle.
// ═══════════════════════════════════════════════════════════════

// ── Shared helpers ──

function DocSection({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md bg-violet-600 text-[11px] font-bold text-white">{number}</span>
        <h4 className="text-[15px] font-bold text-slate-800">{title}</h4>
      </div>
      <p className="text-[11px] text-slate-500 mb-4 ml-[34px]">{subtitle}</p>
      <div className="ml-[34px]">{children}</div>
    </div>
  )
}

function Callout({ tone, label, children }: { tone: "blue" | "amber" | "emerald" | "rose"; label: string; children: React.ReactNode }) {
  const styles = {
    blue: "border-blue-200 bg-blue-50/60 text-blue-800",
    amber: "border-amber-200 bg-amber-50/60 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
    rose: "border-rose-200 bg-rose-50/60 text-rose-800",
  }
  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1.5">{label}</p>
      <div className="space-y-1.5 text-[11px] leading-[1.55]">
        {children}
      </div>
    </div>
  )
}

function SpecTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full text-[11px]">
        <thead>
          <tr className="bg-slate-50 text-left">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Data ──

const V0_ALLOWED_CARDS: { kind: string; label: string; category: string }[] = [
  { kind: "sbar_overview", label: "SBAR Clinical Overview", category: "Summary" },
  { kind: "patient_summary", label: "Patient Summary Snapshot", category: "Summary" },
  { kind: "symptom_collector", label: "Pre-visit Intake", category: "Intake" },
  { kind: "last_visit", label: "Last Visit Summary", category: "History" },
  { kind: "medical_history", label: "Medical History (Expanded)", category: "History" },

  { kind: "vitals_summary", label: "Today's Vitals Table", category: "Assessment" },
  { kind: "obstetric_summary", label: "Obstetric Summary", category: "Specialty" },
  { kind: "gynec_summary", label: "Gynecology Summary", category: "Specialty" },
  { kind: "pediatric_summary", label: "Pediatric Summary", category: "Specialty" },
  { kind: "ophthal_summary", label: "Ophthalmology Summary", category: "Specialty" },
]

const EXCLUDED_CARD_GROUPS = [
  { group: "Clinical Decision", cards: "DDX, Protocol Meds, Investigation Bundle, Completeness Checker", reason: "V0 is context-only — no clinical decision support" },
  { group: "Safety", cards: "Drug Interaction, Allergy Conflict", reason: "Requires active medication analysis" },
  { group: "Analytics", cards: "Lab Comparison, Vital Trends, Lab Panel Details", reason: "Advanced analysis beyond summary scope" },
  { group: "Workflow", cards: "Advice Bundle, Follow-up, Referral, Translation", reason: "Action-oriented cards not in V0" },
  { group: "Homepage/Operational", cards: "Schedule Overview, Analytics, Revenue, Condition Distribution", reason: "Homepage uses full panel, not V0" },
]

const V0_PILLS = [
  { label: "Patient summary", kind: "sbar_overview, patient_summary", condition: "Always" },
  { label: "Medical history", kind: "medical_history", condition: "Always" },
  { label: "Today's vitals", kind: "vitals_summary", condition: "When vitals recorded" },
  { label: "Last visit", kind: "last_visit", condition: "When prior visit exists" },
  { label: "Pre-visit intake", kind: "symptom_collector", condition: "When intake submitted" },
  { label: "Obstetric summary", kind: "obstetric_summary", condition: "Obstetric patient" },
  { label: "Gynec summary", kind: "gynec_summary", condition: "Gynec patient" },
  { label: "Growth & vaccines", kind: "pediatric_summary", condition: "Pediatric patient" },
  { label: "Vision summary", kind: "ophthal_summary", condition: "Ophthal patient" },
]

// ── Sub-sections ──

type SubTab = "overview" | "scope" | "pills" | "guard"
const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "overview", label: "Overview & Architecture" },
  { id: "scope", label: "Allowed & Excluded" },
  { id: "pills", label: "Pill System" },
  { id: "guard", label: "Guard & Behavior" },
]

// ── Component ──

export default function AgentV0ScopeTab() {
  const [subTab, setSubTab] = useState<SubTab>("overview")

  return (
    <div>
      {/* Intro */}
      <div className="mb-6 rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-blue-50/40 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 text-[10px] font-bold text-white">V0</span>
          <h2 className="text-[16px] font-bold text-slate-800">Dr. Agent V0 — Simplified Variant</h2>
        </div>
        <p className="text-[12px] leading-relaxed text-slate-600">
          V0 is a <strong>summary-only variant</strong> of Dr. Agent. It provides patient context intelligence — summaries, history, vitals — but strips away all clinical action features (DDX, protocol meds, drug interactions, investigations). Designed for clinics that need a lightweight AI co-pilot focused on <strong>context surfacing</strong>, not clinical decision support.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">Default: ON</span>
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">10 Card Types</span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Summary-Only Pills</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">No Clinical Actions</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="mb-6 flex gap-1.5 rounded-lg bg-slate-100 p-1">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
              subTab === t.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {subTab === "overview" && <OverviewSection />}
      {subTab === "scope" && <ScopeSection />}
      {subTab === "pills" && <PillSystemSection />}
      {subTab === "guard" && <GuardBehaviorSection />}
    </div>
  )
}

// ═══ Sub-tab: Overview & Architecture ═══

function OverviewSection() {
  return (
    <div className="space-y-8">
      <DocSection number="1" title="What V0 Does" subtitle="Summary-only AI co-pilot — context surfacing without clinical actions.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">What V0 Includes</p>
            <ul className="space-y-1 text-[11px] text-emerald-800">
              <li>• Patient summary narratives (SBAR-based)</li>
              <li>• Medical history overview</li>
              <li>• Today{"'"}s vitals display</li>
              <li>• Last visit summary</li>
              <li>• Pre-visit intake from patient app</li>
              <li>• Specialty summaries (OB/GYN/Peds/Ophthal)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">What V0 Excludes</p>
            <ul className="space-y-1 text-[11px] text-rose-800">
              <li>• Differential diagnosis (DDX)</li>
              <li>• Protocol medication suggestions</li>
              <li>• Drug interaction checks</li>
              <li>• Investigation suggestions</li>
              <li>• Advice drafting & translation</li>
              <li>• Follow-up planning</li>
              <li>• Lab comparison & vital trends</li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection number="2" title="Default Mode" subtitle="V0 is enabled by default — the user must explicitly switch to the full variant.">
        <Callout tone="blue" label="Mode Toggle">
          <p>The <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">useV0Mode()</code> hook manages state:</p>
          <ul className="mt-2 space-y-1 ml-2">
            <li>• <strong>Default:</strong> V0 ON (simplified experience)</li>
            <li>• <strong>Storage:</strong> <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">localStorage</code> key <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">dr-agent-v0-mode</code></li>
            <li>• <strong>Cross-page sync:</strong> Custom event <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">v0-mode-change</code> fires on toggle</li>
            <li>• <strong>Persistence:</strong> Survives refresh — only changes when user explicitly toggles</li>
          </ul>
        </Callout>
      </DocSection>

      <DocSection number="3" title="Entry Points" subtitle="Where V0 appears across the app.">
        <SpecTable
          headers={["Entry Point", "V0 Behavior", "Notes"]}
          rows={[
            ["RxPad Panel", "V0 agent panel", "Summary-only experience within prescription workflow"],
            ["Patient Details Page", "V0 agent panel via FAB", "Floating action button opens V0 panel"],
            [<span key="hp" className="font-semibold text-amber-700">Homepage</span>, <span key="hpv" className="font-semibold text-slate-800">Full panel (NOT V0)</span>, "Operational features always available on homepage"],
          ]}
        />
      </DocSection>

      <DocSection number="4" title="Component Architecture" subtitle="V0 uses a standalone panel component.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Component", value: "DrAgentPanelV0", desc: "Standalone, separate from DrAgentPanel" },
            { label: "Patient Search", value: "Built-in", desc: "Own search within V0 panel" },
            { label: "Patient Selector", value: "Shared", desc: "Same bottom sheet as full variant" },
            { label: "Floating Chip", value: "Scroll-aware", desc: "Patient context chip floats on scroll" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <p className="mt-1 text-[12px] font-bold text-slate-800">{item.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </DocSection>
    </div>
  )
}

// ═══ Sub-tab: Allowed & Excluded ═══

function ScopeSection() {
  return (
    <div className="space-y-8">
      <DocSection number="1" title="Allowed Card Types (11)" subtitle="Only these card kinds are rendered in V0 — everything else is stripped.">
        <SpecTable
          headers={["Card Kind", "Description", "Category"]}
          rows={V0_ALLOWED_CARDS.map((c) => [
            <code key={c.kind} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-violet-700">{c.kind}</code>,
            c.label,
            <span key={`cat-${c.kind}`} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              c.category === "Summary" ? "bg-violet-100 text-violet-700" :
              c.category === "History" ? "bg-blue-100 text-blue-700" :
              c.category === "Assessment" ? "bg-emerald-100 text-emerald-700" :
              c.category === "Intake" ? "bg-amber-100 text-amber-700" :
              "bg-rose-100 text-rose-700"
            }`}>{c.category}</span>,
          ])}
        />
      </DocSection>

      <DocSection number="2" title="Excluded Card Groups" subtitle="These entire card families are unavailable in V0.">
        <SpecTable
          headers={["Card Group", "Cards", "Reason"]}
          rows={EXCLUDED_CARD_GROUPS.map((g) => [
            <span key={g.group} className="font-semibold text-slate-800">{g.group}</span>,
            <span key={`cards-${g.group}`} className="text-slate-500">{g.cards}</span>,
            g.reason,
          ])}
        />
      </DocSection>

      <DocSection number="3" title="UI Element Comparison" subtitle="What's visible in V0 vs the full variant.">
        <SpecTable
          headers={["UI Element", "Full Variant", "V0 Variant"]}
          rows={[
            ["Gradient PillBar (above input)", <span key="f1" className="font-medium text-emerald-600">All pills</span>, <span key="v1" className="font-medium text-emerald-600">Summary pills only</span>],
            ["SidebarPillBar (secondary sidebar)", <span key="f2" className="font-medium text-emerald-600">Visible</span>, <span key="v2" className="font-medium text-rose-500">Hidden</span>],
            ["RxPad AiTriggerChips", <span key="f3" className="font-medium text-emerald-600">Visible</span>, <span key="v3" className="font-medium text-rose-500">Hidden</span>],
            ["Inline suggestion chips (below messages)", <span key="f4" className="font-medium text-emerald-600">Below messages</span>, <span key="v4" className="font-medium text-rose-500">Hidden</span>],
            ["Clinical action cards", <span key="f5" className="font-medium text-emerald-600">45+ card types</span>, <span key="v5" className="font-medium text-rose-500">10 summary types only</span>],
          ]}
        />
      </DocSection>
    </div>
  )
}

// ═══ Sub-tab: Pill System ═══

function PillSystemSection() {
  return (
    <div className="space-y-8">
      <DocSection number="1" title="V0 Pill Generation" subtitle="V0 uses a dedicated pill list — not the generic pill-engine.">
        <Callout tone="blue" label="Why dedicated pills?">
          <p>The generic <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">generatePills()</code> from pill-engine produces labels like &ldquo;Vital trends&rdquo;, &ldquo;Flagged lab results&rdquo;, &ldquo;Lab overview&rdquo; — none of which map to V0-allowed card kinds. V0 builds its own pill list using labels that are known to exist in <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">PILL_TO_CARD_KINDS</code> and map to <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">V0_ALLOWED_KINDS</code>.</p>
        </Callout>
      </DocSection>

      <DocSection number="2" title="Available Pills" subtitle="Each pill maps to a V0-allowed card kind and appears conditionally.">
        <SpecTable
          headers={["Pill Label", "Maps To Card Kind(s)", "Availability"]}
          rows={V0_PILLS.map((p) => [
            <span key={p.label} className="font-medium">{p.label}</span>,
            <code key={`kind-${p.label}`} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">{p.kind}</code>,
            <span key={`cond-${p.label}`} className={p.condition === "Always" ? "font-medium text-emerald-600" : "text-slate-500"}>{p.condition}</span>,
          ])}
        />
      </DocSection>

      <DocSection number="3" title="Pill Lifecycle" subtitle="How pills appear, disappear, and interact with loading state.">
        <div className="space-y-3">
          {[
            { step: "1", title: "Generated on patient select", desc: "When a patient is selected, the V0 pill list is computed from available data (vitals, last visit, intake, specialty)." },
            { step: "2", title: "Hidden during loading", desc: "While the AI is generating a response (isTyping = true), the PillBar is completely hidden — no grayed-out/disabled pills." },
            { step: "3", title: "Shown after response", desc: "Once the response is complete, pills reappear above the input box." },
            { step: "4", title: "Filtered by shown cards", desc: "If a pill's card kind has already been rendered in the conversation, that pill is removed from the list." },
            { step: "5", title: "Tap triggers card", desc: "Tapping a pill sends it as a user message. The intent engine maps it to the corresponding card kind." },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">{item.step}</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-800">{item.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>
    </div>
  )
}

// ═══ Sub-tab: Guard & Behavior ═══

function GuardBehaviorSection() {
  return (
    <div className="space-y-8">
      <DocSection number="1" title="V0 Guard — Unsupported Intents" subtitle="How the system handles queries that produce non-V0 cards.">
        <div className="space-y-3">
          {[
            { step: "1", title: "Reply engine processes normally", desc: "The query goes through the standard intent engine and reply engine — no early filtering." },
            { step: "2", title: "V0 guard strips unsupported cards", desc: "If the reply contains a card not in V0_ALLOWED_KINDS, the card is removed." },
            { step: "3", title: "Fallback text if no cards remain", desc: "A helpful message is shown: \"I can help with patient summaries, vitals, and clinical history. Try asking for a patient summary, today's vitals, or medical history.\"" },
            { step: "4", title: "No inline suggestions", desc: "V0 never renders inline suggestion chips below messages — the suggestions field is omitted from assistant messages." },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">{item.step}</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-800">{item.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection number="2" title="Welcome Screen — Canned Action Priority" subtitle="V0 shows 4 canned actions on the welcome screen using smart selection.">
        <SpecTable
          headers={["Priority", "Candidate", "Title", "Condition"]}
          rows={[
            ["1", <span key="c1" className="font-semibold">Intake</span>, "\"Details from patient\"", "Only when symptom collector data exists"],
            ["2", <span key="c2" className="font-semibold">Summary</span>, "\"Patient summary\"", "Always available"],
            ["3", <span key="c3" className="font-semibold">History</span>, "\"Medical history\"", "Always available"],
            ["4", <span key="c4" className="font-semibold">Specialty</span>, "Varies by specialty", "Only when specialty data exists"],
            ["5 (fallback)", <span key="c5" className="font-semibold">Vitals</span>, "\"Today's vitals\"", "Always available as fallback"],
          ]}
        />
        <div className="mt-3">
          <Callout tone="amber" label="Selection Rules (pick 4)">
            <ul className="space-y-1 ml-2">
              <li>• <strong>With intake + specialty:</strong> Intake → Summary → History → Specialty</li>
              <li>• <strong>With intake + no specialty:</strong> Intake → Summary → History → Vitals</li>
              <li>• <strong>No intake + specialty:</strong> Summary → History → Specialty → Vitals</li>
              <li>• <strong>No intake + no specialty:</strong> Summary → History → Vitals → Past visit details</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      <DocSection number="3" title="V0 Conditional Elements" subtitle="How other UI components respond to V0 mode.">
        <SpecTable
          headers={["Component", "File", "V0 Behavior"]}
          rows={[
            [<span key="sb" className="font-medium">SidebarPillBar</span>, <code key="sbf" className="text-[10px] font-mono text-slate-500">ContentPanel.tsx</code>, "Hidden via !isV0Mode guard"],
            [<span key="ai" className="font-medium">AiTriggerChip</span>, <code key="aif" className="text-[10px] font-mono text-slate-500">RxPadFunctional.tsx</code>, "All 5 chips hidden via !isV0Mode"],
            [<span key="sg" className="font-medium">Inline Suggestions</span>, <code key="sgf" className="text-[10px] font-mono text-slate-500">DrAgentPanelV0.tsx</code>, "suggestions field omitted from messages"],
            [<span key="pb" className="font-medium">PillBar</span>, <code key="pbf" className="text-[10px] font-mono text-slate-500">DrAgentPanelV0.tsx</code>, "Dedicated V0 pill list, hidden during loading"],
          ]}
        />
      </DocSection>
    </div>
  )
}

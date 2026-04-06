"use client"

import React, { useState } from "react"

// ═══════════════════════════════════════════════════════════════
// DR. AGENT V0 — SCOPE & SPECIFICATION
// Canned-message-driven, summary-only agent variant.
// No free-text input. Doctors interact exclusively through
// pre-built message pills. A short clinical narrative is
// auto-surfaced the moment a patient is selected.
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
  { kind: "text_fact", label: "Short Summary (auto)", category: "Summary" },
  { kind: "sbar_overview", label: "SBAR Clinical Overview", category: "Summary" },
  { kind: "patient_summary", label: "Patient Summary Snapshot", category: "Summary" },
  { kind: "symptom_collector", label: "Reported by Patient", category: "Intake" },
  { kind: "last_visit", label: "Past Visit Summaries", category: "History" },
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
  { label: "Past visit summaries", kind: "last_visit", condition: "When prior visit exists" },
  { label: "Reported by patient", kind: "symptom_collector", condition: "When intake submitted" },
  { label: "Obstetric summary", kind: "obstetric_summary", condition: "Obstetric patient" },
  { label: "Gynec summary", kind: "gynec_summary", condition: "Gynec patient" },
  { label: "Growth & vaccines", kind: "pediatric_summary", condition: "Pediatric patient" },
  { label: "Vision summary", kind: "ophthal_summary", condition: "Ophthal patient" },
]

const SHORT_SUMMARY_SCENARIOS = [
  { scenario: "Full data + intake", history: "Yes", symptoms: "Yes", result: "Complete narrative with symptoms lead" },
  { scenario: "Full data, no intake", history: "Yes", symptoms: "No", result: "Chronic conditions + meds focus" },
  { scenario: "Specialty patient", history: "Yes", symptoms: "Varies", result: "Specialty lead-in (obstetric/gynec/peds/ophthal)" },
  { scenario: "Minimal data", history: "Partial", symptoms: "No", result: "Available data only, no stubs" },
  { scenario: "New patient + intake", history: "No", symptoms: "Yes", result: "\"New patient. Presents with [symptoms]\"" },
  { scenario: "Zero data", history: "No", symptoms: "No", result: "\"New patient, no prior clinical data available\"" },
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
          <h2 className="text-[16px] font-bold text-slate-800">Dr. Agent V0 — Canned-Message Summary Agent</h2>
        </div>
        <p className="text-[12px] leading-relaxed text-slate-600">
          V0 is a <strong>summary-only, canned-message-driven</strong> agent variant. There is no free-text input — doctors interact exclusively through pre-built message pills. When a patient is selected, a short clinical narrative is auto-surfaced as the first response, giving the doctor immediate context before they tap a single pill. Designed for clinics that want AI-assisted <strong>context surfacing</strong> without clinical decision support.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">Default: ON</span>
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">No Free-Text Input</span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Auto Short Summary</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">Canned Pills Only</span>
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
      <DocSection number="1" title="What V0 Does" subtitle="A canned-message-driven co-pilot that surfaces patient context — no free-text, no clinical actions.">
        <p className="text-[11px] text-slate-600 leading-relaxed mb-4">
          V0 strips the agent down to its most essential behavior: showing the doctor what they need to know about a patient, using only pre-built message pills. There is no input box. The doctor never types a question — they tap a pill, and the agent responds with the relevant summary card. The moment a patient is selected, V0 auto-generates a short clinical narrative so the doctor has immediate context without pressing anything.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">What V0 Includes</p>
            <ul className="space-y-1 text-[11px] text-emerald-800">
              <li>• Auto short summary on patient select</li>
              <li>• Canned message pills (the only interaction)</li>
              <li>• Medical history overview</li>
              <li>• Today{"'"}s vitals display</li>
              <li>• Past visit summaries</li>
              <li>• Patient-reported symptoms (intake)</li>
              <li>• Specialty summaries (OB/GYN/Peds/Ophthal)</li>
              <li>• Trust mark: &ldquo;Your data stays private&rdquo;</li>
            </ul>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">What V0 Excludes</p>
            <ul className="space-y-1 text-[11px] text-rose-800">
              <li>• Free-text input box</li>
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

      <DocSection number="2" title="The Doctor Flow" subtitle="From appointment list to V0 panel — every step the doctor takes.">
        <div className="space-y-3">
          {[
            { step: "1", title: "Appointment list", desc: "Doctor sees today's appointments. Each row has a small AI icon on the right side." },
            { step: "2", title: "Hover on AI icon", desc: "A short tooltip appears showing the patient's clinical narrative (the same short summary text). The CTA reads \"Open Doctor Agent\"." },
            { step: "3", title: "Click \"Open Doctor Agent\"", desc: "The V0 panel slides open on the right. If the agent panel was already open for a different patient, it switches context to the clicked patient." },
            { step: "4", title: "Short summary auto-shown", desc: "A text_fact card with the patient's short narrative is automatically rendered as the first response — no pill tap required." },
            { step: "5", title: "Canned pills visible below chat", desc: "Below the conversation area, a row of canned message pills is always visible. The doctor taps one to explore deeper." },
            { step: "6", title: "Trust mark at bottom", desc: "Below the pills, a subtle trust line reads: \"Your data stays private · AI assists, you decide\"." },
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

      <DocSection number="3" title="Patient Short Summary Generation" subtitle="The auto-generated clinical narrative — the heart of V0's first impression.">
        <Callout tone="blue" label="What is the short summary?">
          <p>A <strong>1-3 sentence clinical narrative</strong> auto-generated from SmartSummaryData. This exact text appears in two places: the appointment AI icon tooltip and the V0 panel{"'"}s first auto-response. It gives the doctor immediate patient context — chief concern, chronic conditions, active medications — without requiring any interaction.</p>
        </Callout>

        <div className="mt-4 mb-4">
          <p className="text-[11px] font-semibold text-slate-700 mb-2">Composition Pipeline (5 steps)</p>
          <div className="space-y-2">
            {[
              { step: "1", title: "Specialty lead-in", desc: "If the patient is obstetric, gynec, pediatric, or ophthal, the summary opens with a specialty-specific lead. Example: \"G2P1 at 26wk\" for obstetric patients." },
              { step: "2", title: "Chief concern", desc: "Current symptoms or reason for visit. Pulled from intake data when available. Self-reported data is prefixed with \"Patient reports\"." },
              { step: "3", title: "Chronic conditions", desc: "Top 2-3 conditions with duration. Example: \"Known case of Type 2 Diabetes (1yr), Hypertension (3yr)\". First mention uses full name — no abbreviations." },
              { step: "4", title: "Drug allergies", desc: "Listed only when present. If absent, the summary skips this entirely — it never says \"No known allergies\"." },
              { step: "5", title: "Active medications", desc: "Top 2-3 medications listed with overflow. Example: \"On Metformin, Amlodipine + 4 others\". Maximum 3 named, the rest collapsed." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">{item.step}</span>
                <div>
                  <p className="text-[11px] font-semibold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Callout tone="amber" label="Character Limits">
            <p><strong>Target range:</strong> 150-300 characters. <strong>Hard cap:</strong> 400 characters. The summary is meant to be scanned in under 5 seconds — if it gets longer, the pipeline truncates at the medication step.</p>
          </Callout>
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-semibold text-slate-700 mb-2">Data Sources</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Primary source is the <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono">patientNarrative</code> field in SmartSummaryData. If unavailable, the system falls back to <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono">sbarSituation</code> from the SBAR engine.
          </p>
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-semibold text-slate-700 mb-2">Permutations — 6 Scenarios</p>
          <SpecTable
            headers={["Scenario", "History", "Symptoms", "Result"]}
            rows={SHORT_SUMMARY_SCENARIOS.map((s) => [
              <span key={s.scenario} className="font-medium">{s.scenario}</span>,
              <span key={`h-${s.scenario}`} className={s.history === "Yes" ? "text-emerald-600 font-medium" : s.history === "No" ? "text-rose-500 font-medium" : "text-amber-600 font-medium"}>{s.history}</span>,
              <span key={`sy-${s.scenario}`} className={s.symptoms === "Yes" ? "text-emerald-600 font-medium" : s.symptoms === "No" ? "text-rose-500 font-medium" : "text-amber-600 font-medium"}>{s.symptoms}</span>,
              s.result,
            ])}
          />
        </div>

        <div className="mb-4">
          <Callout tone="emerald" label="Formatting Rules">
            <ul className="space-y-1 ml-2">
              <li>• <strong>Bold:</strong> condition names, drug names, critical values</li>
              <li>• <strong>No abbreviations</strong> for primary conditions on first mention (use &ldquo;Diabetes&rdquo; not &ldquo;DM&rdquo;)</li>
              <li>• <strong>Max 3 medications</strong> listed, excess as &ldquo;+ N others&rdquo;</li>
              <li>• <strong>Never say &ldquo;No allergies&rdquo;</strong> — skip the allergy line entirely if absent</li>
              <li>• <strong>Self-reported data</strong> prefixed with &ldquo;Patient reports&rdquo;</li>
            </ul>
          </Callout>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-700 mb-2">Display Format</p>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
            Rendered as a <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono">text_fact</code> card with clinical term highlighting via <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono">highlightClinicalText</code>.
          </p>
          <SpecTable
            headers={["Card Field", "Value"]}
            rows={[
              ["kind", <code key="k" className="text-[10px] font-mono text-violet-700">text_fact</code>],
              ["value", "The narrative text (highlighted via highlightClinicalText)"],
              ["context", "Specialty tags when applicable"],
              ["source", <span key="src" className="font-medium">&ldquo;EMR + AI Summary&rdquo;</span>],
            ]}
          />
        </div>
      </DocSection>

      <DocSection number="4" title="Default Mode & Welcome Screen" subtitle="V0 is enabled by default — the welcome screen only appears when no patient is selected.">
        <Callout tone="blue" label="Mode Toggle">
          <p>The <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">useV0Mode()</code> hook manages state:</p>
          <ul className="mt-2 space-y-1 ml-2">
            <li>• <strong>Default:</strong> V0 ON (simplified experience)</li>
            <li>• <strong>Storage:</strong> <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">localStorage</code> key <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">dr-agent-v0-mode</code></li>
            <li>• <strong>Welcome screen:</strong> Only shown in homepage mode (no patient selected). Once a patient is selected, the short summary replaces the welcome screen.</li>
          </ul>
        </Callout>
      </DocSection>
    </div>
  )
}

// ═══ Sub-tab: Allowed & Excluded ═══

function ScopeSection() {
  return (
    <div className="space-y-8">
      <DocSection number="1" title="Allowed Card Types (11)" subtitle="Only these card kinds are rendered in V0 — everything else is stripped.">
        <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
          The <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono">text_fact</code> card is new in V0 — it auto-appears as the first response when a patient is selected, showing the short clinical narrative. All other cards are triggered by canned message pills.
        </p>
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
            ["Free-text input box", <span key="f0" className="font-medium text-emerald-600">Present</span>, <span key="v0" className="font-medium text-rose-500">Removed entirely</span>],
            ["Auto short summary", <span key="f0b" className="font-medium text-rose-500">Not present</span>, <span key="v0b" className="font-medium text-emerald-600">Auto on patient select</span>],
            ["Canned message pills", <span key="f1" className="font-medium text-emerald-600">Above input + sidebar</span>, <span key="v1" className="font-medium text-emerald-600">Below chat, always visible</span>],
            ["SidebarPillBar", <span key="f2" className="font-medium text-emerald-600">Visible</span>, <span key="v2" className="font-medium text-rose-500">Hidden</span>],
            ["RxPad AiTriggerChips", <span key="f3" className="font-medium text-emerald-600">Visible</span>, <span key="v3" className="font-medium text-rose-500">Hidden</span>],
            ["Inline suggestion chips", <span key="f4" className="font-medium text-emerald-600">Below messages</span>, <span key="v4" className="font-medium text-rose-500">Hidden</span>],
            ["Trust mark", <span key="f5" className="font-medium text-rose-500">Not shown</span>, <span key="v5" className="font-medium text-emerald-600">&ldquo;Your data stays private&rdquo;</span>],
            ["Clinical action cards", <span key="f6" className="font-medium text-emerald-600">45+ card types</span>, <span key="v6" className="font-medium text-rose-500">11 summary types only</span>],
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
      <DocSection number="1" title="Pills Are the Only Interaction" subtitle="V0 has no input box — canned message pills are how doctors navigate patient data.">
        <Callout tone="rose" label="No Free-Text Input">
          <p>Unlike the full variant, V0 completely removes the text input box. Doctors cannot type questions or commands. Every interaction flows through pre-built message pills displayed below the chat area. This deliberate constraint keeps the experience focused and prevents out-of-scope queries that V0 cannot answer.</p>
        </Callout>
        <div className="mt-3">
          <Callout tone="blue" label="Why dedicated pills?">
            <p>The generic <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">generatePills()</code> from pill-engine produces labels like &ldquo;Vital trends&rdquo;, &ldquo;Flagged lab results&rdquo; — none of which map to V0-allowed card kinds. V0 builds its own pill list using labels known to exist in <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">PILL_TO_CARD_KINDS</code> and map to <code className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-mono">V0_ALLOWED_KINDS</code>.</p>
          </Callout>
        </div>
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

      <DocSection number="3" title="Pill Lifecycle" subtitle="How pills appear, get used, and disappear from the conversation.">
        <div className="space-y-3">
          {[
            { step: "1", title: "Auto short summary first", desc: "When a patient is selected, the short summary text_fact card auto-renders as the first response. No pill tap needed — the doctor sees context immediately." },
            { step: "2", title: "Pills always visible below chat", desc: "Canned message pills are displayed below the conversation area, always visible. They do not sit inside or above an input box (there is no input box)." },
            { step: "3", title: "Tap triggers card", desc: "Tapping a pill sends it as a user message. The intent engine maps it to the corresponding card kind, and the response appears in the chat." },
            { step: "4", title: "Used pills are removed", desc: "Once a pill has been tapped and its card rendered, that pill is removed from the visible list. This prevents duplicate requests and gives the doctor a clear sense of what they have not yet explored." },
            { step: "5", title: "Hidden during loading", desc: "While the AI is generating a response (isTyping = true), the pill area is hidden — no grayed-out or disabled pills." },
            { step: "6", title: "Reappear after response", desc: "Once the response is complete, remaining (unused) pills reappear below the chat." },
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

      <DocSection number="2" title="Welcome Screen — Homepage Only" subtitle="The welcome screen with canned actions only appears when no patient is selected.">
        <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
          In V0, the welcome screen is strictly a homepage-mode concept. Once a patient is selected (via the appointment list AI icon or the patient search), the welcome screen is replaced by the auto-generated short summary. The welcome screen is never shown alongside patient data.
        </p>
        <SpecTable
          headers={["Priority", "Candidate", "Title", "Condition"]}
          rows={[
            ["1", <span key="c1" className="font-semibold">Intake</span>, "\"Reported by patient\"", "Only when symptom collector data exists"],
            ["2", <span key="c2" className="font-semibold">Summary</span>, "\"Patient summary\"", "Always available"],
            ["3", <span key="c3" className="font-semibold">History</span>, "\"Medical history\"", "Always available"],
            ["4", <span key="c4" className="font-semibold">Specialty</span>, "Varies by specialty", "Only when specialty data exists"],
            ["5 (fallback)", <span key="c5" className="font-semibold">Vitals</span>, "\"Today's vitals\"", "Always available as fallback"],
          ]}
        />
      </DocSection>

      <DocSection number="3" title="V0 Conditional Elements" subtitle="How other UI components respond to V0 mode.">
        <SpecTable
          headers={["Component", "File", "V0 Behavior"]}
          rows={[
            [<span key="ip" className="font-medium">Input Box</span>, <code key="ipf" className="text-[10px] font-mono text-slate-500">DrAgentPanelV0.tsx</code>, "Completely removed — not hidden, not disabled"],
            [<span key="sb" className="font-medium">SidebarPillBar</span>, <code key="sbf" className="text-[10px] font-mono text-slate-500">ContentPanel.tsx</code>, "Hidden via !isV0Mode guard"],
            [<span key="ai" className="font-medium">AiTriggerChip</span>, <code key="aif" className="text-[10px] font-mono text-slate-500">RxPadFunctional.tsx</code>, "All 5 chips hidden via !isV0Mode"],
            [<span key="sg" className="font-medium">Inline Suggestions</span>, <code key="sgf" className="text-[10px] font-mono text-slate-500">DrAgentPanelV0.tsx</code>, "suggestions field omitted from messages"],
            [<span key="pb" className="font-medium">Canned Pills</span>, <code key="pbf" className="text-[10px] font-mono text-slate-500">DrAgentPanelV0.tsx</code>, "Below chat, always visible, removed after use"],
            [<span key="tt" className="font-medium">AI Icon Tooltip</span>, <code key="ttf" className="text-[10px] font-mono text-slate-500">AppointmentRow.tsx</code>, "Shows short summary + \"Open Doctor Agent\" CTA"],
            [<span key="tm" className="font-medium">Trust Mark</span>, <code key="tmf" className="text-[10px] font-mono text-slate-500">DrAgentPanelV0.tsx</code>, "\"Your data stays private · AI assists, you decide\""],
          ]}
        />
      </DocSection>
    </div>
  )
}

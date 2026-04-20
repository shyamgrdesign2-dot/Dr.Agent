"use client"

import React from "react"
import { SbarOverviewCard } from "@/components/tp-rxpad/dr-agent/cards/summary/SbarOverviewCard"
import { SMART_SUMMARY_BY_CONTEXT } from "@/components/tp-rxpad/dr-agent/mock-data"

// ─────────────────────────────────────────────────────────────
// Patient Summary Generation Spec — 9-section rewrite
// Covers SBAR cards, card Situation quotes, quick clinical snapshot (chat), and UX entry.
// ─────────────────────────────────────────────────────────────

/* ── Shared helpers ────────────────────────────────────────── */

function Badge({ n }: { n: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-bold text-violet-600">
      {n}
    </span>
  )
}

function SectionHeader({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-violet-50/60 border border-violet-100 px-4 py-3">
      <Badge n={n} />
      <div>
        <h4 className="text-[14px] font-bold text-slate-800">{title}</h4>
        <p className="text-[10px] text-tp-slate-400 leading-snug">{subtitle}</p>
      </div>
    </div>
  )
}

function StoryBridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-2 text-[10px] leading-relaxed text-violet-700">
      {children}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">{children}</th>
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 text-[10px] text-tp-slate-700 ${className}`}>{children}</td>
}

function PriorityPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

/* ── Main Component ────────────────────────────────────────── */

export default function PatientSummaryLogicTab() {
  return (
    <div className="space-y-8">

      {/* ── Page Header ── */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50/60 via-white to-slate-50/80 px-5 py-4">
        <h3 className="text-[17px] font-bold text-slate-800 mb-0.5">Patient Summary — Generation Spec</h3>
        <p className="text-[11px] leading-[1.6] text-slate-500 max-w-2xl">
          How Dr. Agent turns <strong className="text-slate-700">SmartSummaryData</strong> into three related outputs: the <strong className="text-slate-700">quoted Situation</strong> on summary cards, the <strong className="text-slate-700">quick clinical snapshot</strong> in chat (&quot;situation at a glance&quot;), and the <strong className="text-slate-700">full SBAR / detailed summary</strong> behind explicit actions (e.g. patient summary pills). <strong className="text-slate-700">9 sections</strong> cover pipeline, SBAR, snapshot generation, narrative rules, and product behavior.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: Overview & Data Pipeline
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader n={1} title="Overview & Data Pipeline" subtitle="From SmartSummaryData to card quotes, chat snapshot, and full SBAR" />

        {/* Pipeline strip */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-0 min-w-[700px] justify-center">
            {[
              { label: "EMR Modules", sub: "16 data sources" },
              { label: "SmartSummaryData", sub: "Canonical object" },
              { label: "Narrative core", sub: "buildCoreNarrative" },
              { label: "Outputs", sub: "Card · Chat · Full SBAR" },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center" style={{ width: 160 }}>
                  <div className="flex h-10 w-full items-center justify-center rounded-lg bg-violet-50 border border-violet-200">
                    <span className="text-[11px] font-semibold text-violet-700">{s.label}</span>
                  </div>
                  <p className="mt-1 text-[9px] text-tp-slate-400">{s.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center pt-0 -mx-1" style={{ minWidth: 20 }}>
                    <div className="h-[1.5px] w-4 bg-violet-200" />
                    <svg width="6" height="8" viewBox="0 0 6 8" className="shrink-0 text-violet-300">
                      <path d="M0 0 L6 4 L0 8Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Data sources table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>Source Category</Th>
                <Th>Items</Th>
                <Th>Detail</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Historical */}
              <tr className="align-top">
                <Td className="font-semibold text-violet-700 whitespace-nowrap">Historical (10)</Td>
                <Td>Past visits, Vitals history, Medical history, Ophthal / Gynec / Obstetric / Pediatric modules, Vaccination, Growth, Lab results, Uploads</Td>
                <Td className="text-tp-slate-400">Previous encounter records, specialty-specific panels, trend data, scanned documents (OCR-ready)</Td>
              </tr>
              {/* Current Encounter */}
              <tr className="align-top">
                <Td className="font-semibold text-blue-700 whitespace-nowrap">Current Encounter (3)</Td>
                <Td>Symptom collector, Current vitals, RxPad entries</Td>
                <Td className="text-tp-slate-400">Self-reported symptoms from patient app, nurse-recorded vitals, in-progress prescriptions</Td>
              </tr>
              {/* Identity */}
              <tr className="align-top">
                <Td className="font-semibold text-slate-700 whitespace-nowrap">Identity & Meta (3)</Td>
                <Td>Demographics, Appointment context, Status</Td>
                <Td className="text-tp-slate-400">Name/age/gender, new vs follow-up, queue/finished/cancelled/draft/pending</Td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-violet-100 bg-white overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-violet-50/80 border-b border-violet-100">
                <Th>Output</Th>
                <Th>Primary API</Th>
                <Th>When it appears</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="align-top">
                <Td className="font-semibold text-violet-700">Card Situation (quote)</Td>
                <Td><code className="text-violet-600">buildCardSituationQuote()</code></Td>
                <Td className="text-tp-slate-400">Top of <strong>SbarOverviewCard</strong> / <strong>GPSummaryCard</strong> — intake-first when symptom collector exists; short fallback otherwise (details live in sections below).</Td>
              </tr>
              <tr className="align-top">
                <Td className="font-semibold text-violet-700">Quick clinical snapshot</Td>
                <Td><code className="text-violet-600">buildQuickClinicalSnapshotText()</code></Td>
                <Td className="text-tp-slate-400">Chat <code className="text-[9px]">text_quote</code> after &quot;Quick clinical snapshot&quot; (homepage / row AI icon) — demographics + symptoms + compact history; block grows with content (full panel width, no inner scroll).</Td>
              </tr>
              <tr className="align-top">
                <Td className="font-semibold text-violet-700">Full patient summary / SBAR</Td>
                <Td>Section builders + <code className="text-violet-600">buildCoreNarrative</code> for Situation line</Td>
                <Td className="text-tp-slate-400">Canned pills / &quot;Patient summary&quot; / detailed actions — full SBAR assembly and cards, not the same string as the chat snapshot.</Td>
              </tr>
            </tbody>
          </table>
        </div>

        <StoryBridge>
          <strong>Key principle:</strong> Most patients have partial data. The pipeline handles every permutation gracefully — missing sources are silently skipped, never shown as empty labels. <strong>Do not assume</strong> one narrative string powers chat, card quote, and SBAR; each path has intentional scope (see §3).
        </StoryBridge>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: SBAR Framework
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader n={2} title="SBAR Framework" subtitle="Situation, Background, Assessment, Recommendation — the internal structuring model" />

        {/* SBAR 4-row table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>Section</Th>
                <Th>Content</Th>
                <Th>Visibility Rule</Th>
                <Th>Hidden When</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { letter: "S", name: "Situation", border: "border-l-4 border-l-violet-500", content: "Opening paragraph from buildCardSituationQuote() + highlightClinicalText: 14px slate body, decorative quote marks, not italic, no violet callout border (SbarOverviewCard). Intake-first when symptom collector exists; else short fallback.", visible: "Paragraph always has text", hidden: "— (buildCardSituationQuote always returns non-empty copy)" },
                { letter: "B", name: "Background", border: "border-l-4 border-l-blue-500", content: "Patient Summary card: rendered as History — chronic conditions and allergies only (SectionSummaryBar + formatWithHierarchy). No meds/surgical/family block in SbarOverviewCard.", visible: "Chronic conditions and/or allergies exist", hidden: "No chronic conditions AND no allergies" },
                { letter: "A", name: "Assessment", border: "border-l-4 border-l-emerald-500", content: "Today’s vitals (BP, Pulse, SpO₂, Temp, Weight, RR when present) via InlineDataRow. Key labs: up to four from keyLabs (slice 0-4), shortened names, per-value flags.", visible: "Vitals and/or key labs present", hidden: "No vitals AND no key labs" },
                { letter: "R", name: "Recommendation", border: "border-l-4 border-l-amber-500", content: "Bulleted list: overdue follow-up, critical BP / low SpO₂ / very high fever, due alerts, cross-problem flags — merged then capped at four (buildRecommendations).", visible: "At least one recommendation string", hidden: "Empty recommendation list" },
              ].map((s) => (
                <tr key={s.letter} className={`align-top ${s.border}`}>
                  <Td className="font-bold whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white">{s.letter}</span>
                      {s.name}
                    </span>
                  </Td>
                  <Td>{s.content}</Td>
                  <Td className="text-emerald-700">{s.visible}</Td>
                  <Td className="text-tp-slate-400">{s.hidden}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live SBAR card preview */}
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <StoryBridge>
              <strong>UI label:</strong> The card title shown to doctors is &quot;Patient Summary&quot;, not &quot;SBAR Patient Summary&quot;. SBAR is an internal framework label only. The doctor understands risk + context in under 5 seconds.
            </StoryBridge>
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-[10px]">
              <p className="text-[11px] font-bold text-slate-700">Section rendering details</p>
              {[
                { label: "Situation (quote)", detail: "buildCardSituationQuote() + highlightClinicalText() in a plain 14px / leading-[1.6] text-tp-slate-500 paragraph; light gray quote marks (select-none). Not italic; no violet border or callout (SbarOverviewCard + GPSummaryCard). Intake-first when symptomCollectorData exists." },
                { label: "History (B)", detail: "SectionSummaryBar “History” then Chronic + Allergies inline only; formatWithHierarchy on conditions; allergies font-medium text-tp-slate-700. No medications row in this card." },
                { label: "Assessment — Vitals", detail: "SectionSummaryBar “Today’s Vitals” + InlineDataRow. Order: BP, Pulse, SpO₂, Temp, Weight, RR for keys present on todayVitals. Flags use InlineDataRow / FlagArrow (not a prose ↑ prefix)." },
                { label: "Assessment — Labs", detail: "SectionSummaryBar “Key Labs” + InlineDataRow. At most four labs from keyLabs (slice 0–4). Shortened names (e.g. Creat, F.Glucose). Flag styling from lab objects." },
                { label: "Last Visit", detail: "buildLastVisitLine() (date; symptoms trimmed to two comma-separated chunks; diagnosis; medication). SectionSummaryBar + inline line with pipe separators; Sx:/Dx:/Rx: labels in text-tp-slate-400." },
                { label: "Recommendations", detail: "SectionSummaryBar “Recommendations” (Due Alerts icon) + bulleted list. Max four strings total from buildRecommendations. highlightRecommendation for emphasis." },
              ].map((r) => (
                <div key={r.label} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-violet-600 w-[120px]">{r.label}</span>
                  <span className="text-tp-slate-400">{r.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live card */}
          <div className="lg:sticky lg:top-[140px] lg:self-start">
            <div className="bg-[#F1F1F5] rounded-xl p-4">
              <SbarOverviewCard data={SMART_SUMMARY_BY_CONTEXT["__patient__"]} />
            </div>
            <p className="mt-1.5 text-center text-[9px] text-tp-slate-400">Live render — returning patient with full history</p>
          </div>
        </div>
      </section>

      {/* ── Note: Optional additions to the SBAR card ── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">!</span>
          <p className="text-[11px] font-bold text-amber-800">Note — Optional: Last Visit Summary</p>
        </div>
        <p className="text-[10px] text-amber-700 leading-[1.6]">
          Although <strong>Last Visit</strong> is not part of the core SBAR protocol, including a brief last visit summary (date, diagnosis, key treatment) inside the patient summary card helps the doctor understand <strong>continuity of care</strong> — what happened in the previous consultation, what was prescribed, and what follow-up was planned. This context is especially valuable for returning patients where the current visit is a follow-up to a prior diagnosis.
        </p>
        <p className="text-[10px] text-amber-700 leading-[1.6] mt-1">
          <strong>Display format (current `SbarOverviewCard`):</strong> Below labs when present: `SectionSummaryBar` &quot;Last Visit&quot; + single inline row with pipe-separated date, Sx, Dx, Rx — <span className="font-mono text-[9px] bg-amber-100 px-1 rounded">27 Jan&apos;26 | Sx: Fever (2d) | Dx: Viral fever | Rx: Paracetamol 650mg</span>
        </p>
      </div>

      {/* ── Note: Data availability ── */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">i</span>
          <p className="text-[11px] font-bold text-blue-800">Data Availability — Graceful Degradation</p>
        </div>
        <p className="text-[10px] text-blue-700 leading-[1.6]">
          The patient summary card can <strong>only generate with available data</strong>. Each SBAR section is independently shown or hidden — if no data exists for a section, it is silently omitted (no empty placeholders, no &quot;N/A&quot; labels). For <strong>new patients with zero data</strong>, a minimal fallback is shown: <em>&quot;New patient, no prior clinical data available.&quot;</em> with suggested next actions. The card never fails — it always renders something meaningful, from a full multi-section summary down to a single-line new patient message.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: Quick clinical snapshot (chat) & product rules
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader
          n={3}
          title="Quick clinical snapshot (chat)"
          subtitle="buildQuickClinicalSnapshotText — situation at a glance vs. card Situation quote vs. full summary"
        />

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>Aspect</Th>
                <Th>Quick snapshot (chat)</Th>
                <Th>Card Situation quote</Th>
                <Th>Full patient summary / SBAR</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="align-top">
                <Td className="font-semibold whitespace-nowrap">Function</Td>
                <Td><code className="text-violet-600">buildQuickClinicalSnapshotText</code></Td>
                <Td><code className="text-violet-600">buildCardSituationQuote</code></Td>
                <Td>Reply engine + section cards; core narrative via <code className="text-violet-600">buildCoreNarrative</code></Td>
              </tr>
              <tr className="align-top">
                <Td className="font-semibold whitespace-nowrap">Primary goal</Td>
                <Td>One readable block for triage: who + what they present with + compact history (conditions, allergies, meds, last visit).</Td>
                <Td>Short quote at top of summary card: prioritize <strong>intake</strong> when collector data exists; otherwise minimal context.</Td>
                <Td>Complete SBAR sections (Background, Assessment, Recommendations, etc.) and detailed cards.</Td>
              </tr>
              <tr className="align-top">
                <Td className="font-semibold whitespace-nowrap">Symptoms</Td>
                <Td>Collector symptoms if present (all listed in opener); else narrative symptom parts. History clause <strong>strips symptoms</strong> to avoid duplication.</Td>
                <Td>Up to 6 intake symptoms in quote; optional patient question + brief intake medical history lines.</Td>
                <Td>Woven into Situation / intake cards as designed per template.</Td>
              </tr>
              <tr className="align-top">
                <Td className="font-semibold whitespace-nowrap">Length</Td>
                <Td>Generous history budget (e.g. ~1100 chars for history clause); <code className="text-[9px]">text_quote</code> in chat expands in height with no max-height / inner scroll.</Td>
                <Td>Hard cap ~420 chars on quote string.</Td>
                <Td>Per-section layout; no single char cap for whole card.</Td>
              </tr>
              <tr className="align-top">
                <Td className="font-semibold whitespace-nowrap">Trigger</Td>
                <Td>User / system sends <code className="text-violet-600">QUICK_CLINICAL_SNAPSHOT_PROMPT</code> (&quot;Quick clinical snapshot&quot;).</Td>
                <Td>Rendered whenever summary card mounts with data.</Td>
                <Td>Explicit canned actions (e.g. &quot;Patient&apos;s detailed summary&quot;, SBAR overview pill).</Td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <p className="text-[11px] font-bold text-slate-700">How the quick snapshot is composed (engineering checklist)</p>
          <ol className="space-y-2 list-decimal list-inside text-[10px] text-tp-slate-600">
            <li><strong className="text-tp-slate-700">Specialty hint:</strong> Derived from data (obstetric → pediatrics → gynec → ophthal → GP) for <code className="text-violet-600">buildCoreNarrative</code> limits.</li>
            <li><strong className="text-tp-slate-700">Core slice:</strong> <code className="text-violet-600">buildCoreNarrative</code> with capped conditions / allergies / meds (e.g. 4 / 3 / 3) for the history sentence.</li>
            <li><strong className="text-tp-slate-700">Demographics line:</strong> <code className="text-violet-600">extractDemographicsLine</code> from patient narrative / sbar situation (age, gender, obstetric phrasing).</li>
            <li><strong className="text-tp-slate-700">Opener:</strong> Specialty lead-in (if any) + demographics + &quot;presenting with …&quot; when symptoms exist.</li>
            <li><strong className="text-tp-slate-700">History clause:</strong> Plain text from narrative parts <strong>without</strong> duplicating symptoms already in the opener.</li>
            <li><strong className="text-tp-slate-700">Fallback:</strong> If result would be empty or only &quot;Patient.&quot;, use trimmed <code className="text-violet-600">patientNarrative</code> / <code className="text-violet-600">sbarSituation</code> when available.</li>
          </ol>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
          <p className="text-[11px] font-bold text-emerald-900 mb-1.5">Product: appointment row AI icon</p>
          <ul className="text-[10px] text-emerald-900 space-y-1 list-disc list-inside leading-relaxed">
            <li><strong>First click</strong> on a patient&apos;s AI icon (per patient, per page session) may auto-send the quick snapshot once.</li>
            <li><strong>Later clicks</strong> on the same patient only <strong>open</strong> Dr. Agent and restore the saved thread — no new auto-messages.</li>
            <li><strong>Switching patients</strong> (e.g. Ramesh → Shyam): if the target patient already has a thread, the click only <strong>switches context</strong>; no new quick snapshot.</li>
            <li>Chat threads for full and V0 panels can be <strong>lifted</strong> to the appointments page so closing the panel does not lose history or re-trigger first-click behavior incorrectly.</li>
          </ul>
        </div>

        <StoryBridge>
          <strong>Design intent:</strong> The quick snapshot answers &quot;what do I need to know in 10 seconds?&quot; The card Situation line answers &quot;what did intake / demographics establish before I scroll?&quot; Full SBAR answers &quot;what is the structured record?&quot; Keep these scopes separate to avoid repeating the entire EMR in chat or in the card opener paragraph.
        </StoryBridge>
      </section>

      {/* Section 4: Short Summary (Narrative) Generation */}
      <section className="space-y-4">
        <SectionHeader n={4} title="Short Summary (Narrative) Generation" subtitle="Core narrative assembly (buildCoreNarrative) — ordering reference for symptoms → chronic → allergy → meds → last visit" />

        {/* Horizontal numbered flow */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white px-5 py-5">
          <div className="flex items-start gap-0 min-w-[800px]">
            {[
              { n: 1, label: "Current Symptoms", cond: "IF symptom collector", tmpl: "Presents with [symptom] (duration, severity)", fallback: "Skip, start at step 2" },
              { n: 2, label: "Chronic Conditions", cond: "IF chronic diseases exist", tmpl: "Known case of [Disease] (duration)", fallback: "Skip entirely" },
              { n: 3, label: "Drug Allergies", cond: "IF drug allergies exist", tmpl: "Allergic to [Drug]", fallback: "Skip (never say 'No allergies')" },
              { n: 4, label: "Current Medications", cond: "IF active meds exist", tmpl: "On [Med1] dose freq, [Med2]...", fallback: "Skip" },
              { n: 5, label: "Last Visit", cond: "IF prior visits exist", tmpl: "Last visited [date] for [Dx], treated with [Rx]", fallback: "Skip" },
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center" style={{ width: 150 }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-[12px] font-bold text-violet-600">
                    {s.n}
                  </div>
                  <p className="mt-1.5 text-[10px] font-semibold text-slate-700 text-center leading-tight">{s.label}</p>
                  <p className="mt-1 text-[8px] text-emerald-600 text-center">{s.cond}</p>
                  <p className="mt-0.5 text-[8px] text-tp-slate-400 text-center leading-snug max-w-[130px]">{s.tmpl}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center pt-3" style={{ minWidth: 12 }}>
                    <div className="h-[1.5px] w-3 bg-slate-200" />
                    <svg width="5" height="7" viewBox="0 0 5 7" className="shrink-0 text-slate-300">
                      <path d="M0 0 L5 3.5 L0 7Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Character rules — legacy short narrative vs. newer snapshot paths */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Legacy short narrative", value: "150-300 chars", note: "2-4 sentences where a tight prose cap still applies (e.g. some hover / list previews)." },
            { label: "Legacy hard cap", value: "~400 chars", note: "Older truncation: exceeding may trim to first 2 composed parts." },
            { label: "Card Situation quote", value: "~420 chars", note: "buildCardSituationQuote — intake-first quote at top of summary cards." },
            { label: "Quick clinical snapshot", value: "~1100+ history", note: "History clause budget in buildQuickClinicalSnapshotText; chat text_quote grows with content." },
          ].map((r) => (
            <div key={r.label} className="rounded-lg border border-slate-200 bg-white p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-tp-slate-400">{r.label}</p>
              <p className="text-[16px] font-bold text-violet-600 mt-0.5">{r.value}</p>
              <p className="text-[9px] text-tp-slate-400 mt-0.5">{r.note}</p>
            </div>
          ))}
        </div>

        {/* 3 example narratives */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { ctx: "Full data (GP)", text: "Presents with fever (3d, moderate) and dry cough (2d). Known case of Diabetes Mellitus (1yr) and Hypertension (6mo). Allergic to Sulfonamides. On Metformin 500mg BD. Last visited 27 Jan for viral fever." },
            { ctx: "New patient (intake only)", text: "New patient. Presents with knee pain (1wk, right knee) and morning stiffness (3d). Self-reported allergy: Sulfonamides. Currently taking Vitamin D3 60K weekly." },
            { ctx: "Zero data", text: "New patient, no historical clinical data or symptom collector submission available. Recommend: collect symptoms via intake form, record vitals, and begin clinical assessment." },
          ].map((ex) => (
            <div key={ex.ctx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-violet-600 mb-1.5">{ex.ctx}</p>
              <p className="text-[10px] leading-relaxed text-tp-slate-700">{ex.text}</p>
            </div>
          ))}
        </div>

        <StoryBridge>
          <strong>Priority override (manual text):</strong> Where a single authored string drives the UI (e.g. some legacy flows), <code className="text-violet-800">patientNarrative</code> wins when present; <code className="text-violet-800">sbarSituation</code> is expanded and used next. <strong>Quick snapshot</strong> still composes from <code className="text-violet-600">buildCoreNarrative</code> but falls back to those fields when the composed opener would be empty (see §3).
        </StoryBridge>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: Medical History Priority
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader n={5} title="Medical History Priority" subtitle="6 sub-fields with distinct inclusion rules for the Background section" />

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>Field</Th>
                <Th>Priority</Th>
                <Th>Summary Rule</Th>
                <Th>Example</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { field: "Chronic Conditions", priority: "PRIMARY", color: "#EF4444", rule: "ALWAYS include. Most critical piece of history.", example: "Known case of Type 2 DM (1yr) and Hypertension (6mo)" },
                { field: "Allergies", priority: "HIGH", color: "#F59E0B", rule: "Include when present. Drug allergies are critical for Rx safety.", example: "Allergies: Sulfonamides (drug), Dust, Egg" },
                { field: "Surgical History", priority: "HIGH", color: "#F59E0B", rule: "Include when clinically relevant to current complaint.", example: "H/o Appendectomy (2018), L-knee arthroscopy (2022)" },
                { field: "Family History", priority: "CONTEXTUAL", color: "#8B5CF6", rule: "Only if space permits and directly relevant.", example: "Father: DM + CAD. Mother: Hypothyroid" },
                { field: "Lifestyle", priority: "CONTEXTUAL", color: "#8B5CF6", rule: "Only if relevant to current symptoms or specialty.", example: "Smoker (10 pack-years), sedentary lifestyle" },
                { field: "Additional Notes", priority: "BACKGROUND", color: "#94A3B8", rule: "Only if exceptionally relevant. Usually omitted.", example: "Recent travel to malaria-endemic area (2wk ago)" },
              ].map((f) => (
                <tr key={f.field} className="align-top">
                  <Td className="font-semibold whitespace-nowrap">{f.field}</Td>
                  <Td><PriorityPill label={f.priority} color={f.color} /></Td>
                  <Td className="text-tp-slate-400">{f.rule}</Td>
                  <Td className="text-tp-slate-400 italic">{f.example}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Priority flow */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-[10px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-tp-slate-400">Hierarchy:</span>
          {[
            { label: "Chronic", color: "#EF4444" },
            { label: "Allergies", color: "#F59E0B" },
            { label: "Surgical", color: "#F59E0B" },
            { label: "Family", color: "#8B5CF6" },
            { label: "Lifestyle", color: "#8B5CF6" },
            { label: "Additional", color: "#94A3B8" },
          ].map((p, i, arr) => (
            <React.Fragment key={p.label}>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: p.color }}>{p.label}</span>
              {i < arr.length - 1 && <span className="text-slate-300">&rarr;</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: Specialty Filtering
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader n={6} title="Specialty Filtering" subtitle="5 supported specialties with include/hide rules and summary lead-ins" />

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>Specialty</Th>
                <Th>Include (prioritize)</Th>
                <Th>Hide</Th>
                <Th>Summary Lead-in</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { spec: "General Practice", include: "All general clinical fields: visits, vitals, history, labs, meds, allergies, symptoms", hide: "Specialty blocks (ophthal/gynec/obstetric/pediatric) unless relevant", leadin: "Symptoms -> Chronic -> Allergy -> Meds -> Last visit" },
                { spec: "Ophthalmology", include: "VA (R/L), IOP (R/L), anterior/posterior segment, fundus, glass Rx, DM/HTN history", hide: "Gynec, Obstetric, Pediatric growth/vaccine", leadin: "\"Last VA: R 6/9, L 6/12. IOP: R 16, L 18 mmHg.\"" },
                { spec: "Gynecology", include: "Gynec history (menarche, cycle, flow, pain, hormonal), LMP, PCOS/Thyroid context", hide: "Ophthal, Pediatric growth/vaccine", leadin: "\"Cycle: irregular, 45d interval, moderate flow (3 pads/day).\"" },
                { spec: "Obstetrics", include: "GPLAE, LMP, EDD, gestation, per-pregnancy details, BP (critical), Hb, GCT", hide: "Ophthal, Gynec-only panels, Pediatric growth", leadin: "\"G2P1L1A0, LMP 15 Sep, EDD 22 Jun, currently 26wk.\"" },
                { spec: "Pediatrics", include: "Growth (height, weight, BMI, OFC with percentiles), vaccines (pending/overdue), milestones", hide: "Gynec, Obstetric, Ophthal (unless relevant), Lifestyle", leadin: "\"Weight: 12kg (25th percentile). Vaccines up to date.\"" },
              ].map((s) => (
                <tr key={s.spec} className="align-top">
                  <Td className="font-semibold text-violet-700 whitespace-nowrap">{s.spec}</Td>
                  <Td>{s.include}</Td>
                  <Td className="text-tp-slate-400">{s.hide}</Td>
                  <Td className="font-mono text-[9px] text-blue-600">{s.leadin}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <StoryBridge>
          <strong>Universal rule:</strong> If a data domain has no data OR is specialty-irrelevant, it is not rendered at all. No empty placeholders, no &quot;N/A&quot;. IOP color coding (Ophthal): Green &lt;21, Amber 21-24, Red &gt;24 mmHg.
        </StoryBridge>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7: Appointment Status Routing
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader n={7} title="Appointment Status Routing" subtitle="Summary content and format change based on the appointment's current status" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { status: "Queue", color: "#3B82F6", type: "Pre-consult summary", whats: "Standard SBAR summary: symptoms -> chronic -> allergy -> meds -> last visit. Primary use case.", hover: "Same summary, ~220 char cap" },
            { status: "Finished", color: "#10B981", type: "Post-consult summary", whats: "Structured labels from RxPad: Came for, Diagnosed, Prescribed, Lab/Inv, Examination, Advised, Follow-up. Only show fields with data.", hover: "'Came for: cough. Dx: Bronchitis. Rx: Azithromycin. F/U: 16 Mar.'" },
            { status: "Cancelled", color: "#EF4444", type: "Cancellation summary", whats: "Appointment type, cancellation reason (or 'Not recorded'), rescheduled date (if any). Timestamp as tertiary text.", hover: "'Cancelled follow-up (DM+HTN). Rescheduled to 25 Mar.'" },
            { status: "Draft", color: "#F59E0B", type: "Incomplete checklist", whats: "RxPad section fill-state checklist (P&C mode only). For Voice RX: 'Draft, voice prescription in progress.' Last modified timestamp.", hover: "'Draft, 3/6 sections filled. Last modified: 1:45 pm.'" },
            { status: "Pending", color: "#8B5CF6", type: "No AI summary", whats: "No structured data available. AI summary section is hidden entirely. Show 'Awaiting digitisation' status indicator only.", hover: "'Pending digitisation, no digital record available.'" },
          ].map((s) => (
            <div key={s.status} className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
              <div className="px-3 py-2.5 text-center" style={{ backgroundColor: `${s.color}10`, borderBottom: `2px solid ${s.color}` }}>
                <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: s.color }}>
                  {s.status}
                </span>
                <p className="mt-1 text-[9px] text-tp-slate-400">{s.type}</p>
              </div>
              <div className="flex-1 px-3 py-2.5 space-y-2">
                <p className="text-[10px] leading-relaxed text-tp-slate-700">{s.whats}</p>
                <div className="rounded-md bg-slate-50 px-2 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-tp-slate-400">Hover tooltip</p>
                  <p className="text-[9px] text-tp-slate-400 mt-0.5">{s.hover}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <StoryBridge>
          <strong>Routing logic:</strong> Appointment opens &rarr; check status &rarr; Queue path runs full SBAR assembly. Finished/Cancelled/Draft pull from RxPad or cancellation data. Pending Digitisation disables AI entirely.
        </StoryBridge>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 8: Formatting Rules
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader n={8} title="Formatting Rules" subtitle="Top 10 agent response rules for clinical narrative composition" />

        {/* Top 10 rules */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <ol className="space-y-2">
            {[
              { rule: "Bold key clinical terms", detail: "Symptom names, chronic diseases, allergy names, medication names, concerning lab values, and high-risk flags." },
              { rule: "Full disease names", detail: "Use Diabetes Mellitus (not DM), Hypertension (not HTN) for primary conditions. Abbreviations OK in secondary context." },
              { rule: "No empty mentions", detail: "Never say 'No allergies' or 'No family history'. If absent, skip the section entirely." },
              { rule: "Medication format", detail: "Drug name + strength + frequency. Max 3 meds listed; excess as '+ N others'." },
              { rule: "Last visit format", detail: "'Last visited [date] for [diagnosis], treated with [key meds].' Bold date, Dx, and med names." },
              { rule: "Self-reported labeling", detail: "Data from symptom collector prefixed with 'Self-reported' or 'Patient reports'." },
              { rule: "Signal words for urgency", detail: "'Critical', 'Declining', 'Trending up', 'Overdue', 'Flagged', 'Abnormal' to draw attention." },
              { rule: "Simplify qualifiers", detail: "Use severity (mild/moderate/severe). Avoid verbose qualifiers like 'evening spikes'." },
              { rule: "No hallucination", detail: "NEVER infer or fabricate missing data. Better to show less than to hallucinate." },
              { rule: "No em-dashes", detail: "Use commas, periods, or 'and' for sentence flow. No em-dashes in summary text." },
            ].map((r, i) => (
              <li key={r.rule} className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-600 mt-0.5">
                  {i + 1}
                </span>
                <div className="text-[10px]">
                  <strong className="text-tp-slate-700">{r.rule}:</strong>{" "}
                  <span className="text-tp-slate-400">{r.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Color hierarchy visual */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold text-slate-700 mb-3">Color Hierarchy (TP Design System)</p>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { swatch: "bg-slate-700", token: "tp-slate-700", usage: "Primary: condition names, dates, values" },
              { swatch: "bg-slate-400", token: "tp-slate-400", usage: "Qualifiers: brackets, labels, durations" },
              { swatch: "bg-slate-200", token: "tp-slate-200/300", usage: "Dividers: | separators, bullet markers" },
            ].map((c, i, arr) => (
              <React.Fragment key={c.token}>
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-5 w-5 rounded ${c.swatch}`} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">{c.token}</p>
                    <p className="text-[9px] text-tp-slate-400">{c.usage}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <span className="text-slate-300 text-[12px]">&rarr;</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Flag colors */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-wider text-tp-slate-400">Vital/Lab flags:</span>
            {[
              { swatch: "bg-red-500", label: "Critical (BP>=160, SpO2<92)" },
              { swatch: "bg-amber-500", label: "High (BP>=140, Temp>=101)" },
              { swatch: "bg-blue-500", label: "Low (Hb low, BP<=90 dia)" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-1.5">
                <span className={`inline-block h-3 w-3 rounded ${f.swatch}`} />
                <span className="text-[9px] text-tp-slate-400">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentence pattern examples */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold text-slate-700 mb-3">Sentence Patterns</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { id: "A", pattern: "Symptom opener", example: "\"Presents with fever (3d, moderate) and dry cough (2d).\"" },
              { id: "B", pattern: "Chronic statement", example: "\"Known case of Diabetes Mellitus (1yr) and Hypertension (6mo).\"" },
              { id: "C", pattern: "Allergy mention", example: "\"Allergic to Sulfonamides.\"" },
              { id: "D", pattern: "Med snapshot", example: "\"On Metformin 500mg BD, Amlodipine 5mg OD.\"" },
              { id: "E", pattern: "Last visit", example: "\"Last visited 27 Jan for viral fever, treated with Paracetamol.\"" },
              { id: "F", pattern: "Critical alert", example: "\"BP 70/60 (critical low), SpO2 93% (declining).\" (prepended)" },
              { id: "G", pattern: "New patient tag", example: "\"New patient.\" (prepended when isNewPatient = true)" },
              { id: "H", pattern: "Specialty openers", example: "Obstetric: G2P1L1A0, LMP... | Ophthal: VA R/L... | Peds: Weight..." },
            ].map((p) => (
              <div key={p.id} className="flex gap-2 rounded-md bg-slate-50 px-3 py-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-violet-100 text-[9px] font-bold text-violet-600">{p.id}</span>
                <div className="text-[10px]">
                  <span className="font-semibold text-tp-slate-700">{p.pattern}: </span>
                  <span className="text-tp-slate-400">{p.example}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md bg-slate-50 border border-slate-100 px-3 py-2 font-mono text-[9px] text-slate-600">
            Assembly: [F: Critical] + [G: New patient] + [A: Symptoms] + [B: Chronic] + [C: Allergy] + [D: Meds] + [E: Last visit]
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 9: Data Scenarios & Edge Cases
      ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <SectionHeader n={9} title="Data Scenarios & Edge Cases" subtitle="6 permutations covering every data availability combination + acceptance checklist" />

        {/* Scenario matrix */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>Scenario</Th>
                <Th>History</Th>
                <Th>Symptoms</Th>
                <Th>Result</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { scenario: "Full data available", history: "Yes", histColor: "#10B981", symptoms: "Yes", symColor: "#10B981", badge: "Complete", badgeColor: "#10B981", result: "Full SBAR: symptoms -> chronic -> allergy -> meds -> last visit" },
                { scenario: "History only, no intake", history: "Yes", histColor: "#10B981", symptoms: "No", symColor: "#EF4444", badge: "Partial", badgeColor: "#F59E0B", result: "Open with chronic conditions. Note 'No intake symptoms submitted today.'" },
                { scenario: "Intake only, new patient", history: "No", histColor: "#EF4444", symptoms: "Yes", symColor: "#10B981", badge: "Intake only", badgeColor: "#3B82F6", result: "'New patient. Presents with...' Label self-reported data clearly." },
                { scenario: "Partial history, no intake", history: "Partial", histColor: "#F59E0B", symptoms: "No", symColor: "#EF4444", badge: "Sparse", badgeColor: "#F59E0B", result: "Use whatever is available. State what is missing naturally." },
                { scenario: "Zero data (new patient)", history: "No", histColor: "#EF4444", symptoms: "No", symColor: "#EF4444", badge: "New patient", badgeColor: "#6B7280", result: "Explicit fallback with next-action prompts: collect symptoms, record vitals." },
                { scenario: "Full data + critical vitals", history: "Yes", histColor: "#10B981", symptoms: "Yes", symColor: "#10B981", badge: "Critical", badgeColor: "#EF4444", result: "Prefix critical values before symptoms: 'BP 70/60 (critical low)...'" },
              ].map((s) => (
                <tr key={s.scenario} className="align-top">
                  <Td>
                    <span className="font-semibold text-tp-slate-700">{s.scenario}</span>
                    <span className="ml-1.5 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ backgroundColor: s.badgeColor }}>{s.badge}</span>
                  </Td>
                  <Td><span style={{ color: s.histColor }} className="font-semibold">{s.history}</span></Td>
                  <Td><span style={{ color: s.symColor }} className="font-semibold">{s.symptoms}</span></Td>
                  <Td className="text-tp-slate-400">{s.result}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Acceptance criteria checklist */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold text-slate-700 mb-3">Acceptance Criteria (12 key items)</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {[
              "Never fails on missing data — graceful handling of all source combinations",
              "Specialty auto-filtering — irrelevant domains suppressed (GP, Ophthal, Gynec, Obstetric, Peds)",
              "Strict sentence ordering — Critical alerts -> Symptoms -> Chronic -> Allergy -> Meds -> Last visit (where that ordering applies to composed narrative)",
              "New patient fallback — explicit message with next-action recommendations when zero data",
              "No empty sections — missing domains omitted entirely, no 'N/A' or placeholder stubs",
              "Critical values surface first — BP, SpO2, critical labs appear before symptoms in tight summaries",
              "Length rules per surface — card Situation quote ~420 chars; chat quick snapshot uses a larger history budget (text_quote expands vertically); legacy hover/list lines may stay shorter",
              "Self-reported data labeled — symptom collector data distinguished from verified EMR",
              "Status-aware routing — Queue/Finished/Cancelled/Draft/Pending each has distinct summary logic",
              "Patient Summary (SbarOverviewCard): each block hidden when its data is empty; situation paragraph remains",
              "Card Situation quote is intake-first — when symptomCollectorData exists, the quoted block reflects intake + short context, not the full EMR narrative",
              "Appointment AI icon — first open per patient may auto-send quick snapshot once; later opens switch context only and do not spawn duplicate auto-messages",
            ].map((item, i) => (
              <div key={i} className="flex gap-2 items-start rounded-md bg-slate-50 px-3 py-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-600 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[10px] text-tp-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <StoryBridge>
          <strong>Per-section rules (`SbarOverviewCard`):</strong> Situation paragraph always has copy from `buildCardSituationQuote` (including soft fallback text when needed). **History** omitted if no chronic conditions and no allergies. **Vitals** and **Key Labs** rows omitted when empty. **Recommendations** omitted when `buildRecommendations` returns nothing (and list is capped at four). **Last Visit** omitted when there is no `lastVisit` data.
        </StoryBridge>
      </section>

      {/* ── Footer Reference ── */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-tp-slate-400 mb-1">Reference</p>
        <div className="flex flex-wrap gap-4 text-[10px] text-tp-slate-400">
          <span><code className="text-violet-600">SbarOverviewCard</code> / <code className="text-violet-600">GPSummaryCard</code></span>
          <span><code className="text-violet-600">SmartSummaryData</code> — canonical data model</span>
          <span><code className="text-violet-600">buildCoreNarrative()</code> — shared narrative parts</span>
          <span><code className="text-violet-600">buildCardSituationQuote()</code> — card quote</span>
          <span><code className="text-violet-600">buildQuickClinicalSnapshotText()</code> — chat snapshot</span>
          <span><code className="text-violet-600">highlightClinicalText()</code> — term highlighting</span>
          <span><code className="text-violet-600">formatWithHierarchy()</code> — Background renderer</span>
          <span><code className="text-violet-600">expandAbbreviation()</code> — DM to Diabetes etc.</span>
        </div>
      </div>

    </div>
  )
}

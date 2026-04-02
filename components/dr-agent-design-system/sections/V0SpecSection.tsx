"use client"

const V0_ALLOWED_CARDS = [
  { kind: "sbar_overview", label: "SBAR Clinical Overview" },
  { kind: "patient_summary", label: "Patient Summary Snapshot" },
  { kind: "symptom_collector", label: "Pre-visit Intake" },
  { kind: "last_visit", label: "Last Visit Summary" },
  { kind: "obstetric_summary", label: "Obstetric Summary" },
  { kind: "gynec_summary", label: "Gynecology Summary" },
  { kind: "pediatric_summary", label: "Pediatric Summary" },
  { kind: "ophthal_summary", label: "Ophthalmology Summary" },
  { kind: "med_history", label: "Medication History" },
  { kind: "vitals_summary", label: "Today's Vitals Table" },
  { kind: "medical_history", label: "Medical History (Expanded)" },
]

const EXCLUDED_FEATURES = [
  { feature: "SidebarPillBar", description: "AI pills at bottom of secondary sidebar content panels" },
  { feature: "RxPad AiTriggerChips", description: "Action chips inside RxPad (Suggest DDX, Check interactions, etc.)" },
  { feature: "Inline suggestion chips", description: "Outline chips below assistant messages in chat" },
  { feature: "Clinical action cards", description: "DDX, protocol meds, investigations, drug interactions, allergy conflicts" },
  { feature: "Workflow cards", description: "Advice bundle, follow-up planning, completeness checker, referral" },
  { feature: "Analytics cards", description: "Lab comparison, vital trends, lab panel details" },
  { feature: "Homepage/operational cards", description: "Schedule overview, analytics, revenue, condition distribution" },
]

const V0_PILLS = [
  { label: "Patient summary", mapsTo: "sbar_overview, patient_summary", always: true },
  { label: "Medical history", mapsTo: "medical_history", always: true },
  { label: "Today's vitals", mapsTo: "vitals_summary", always: false },
  { label: "Last visit", mapsTo: "last_visit", always: false },
  { label: "Pre-visit intake", mapsTo: "symptom_collector", always: false },
  { label: "Obstetric summary", mapsTo: "obstetric_summary", always: false },
  { label: "Gynec summary", mapsTo: "gynec_summary", always: false },
  { label: "Growth & vaccines", mapsTo: "pediatric_summary", always: false },
  { label: "Vision summary", mapsTo: "ophthal_summary", always: false },
]

export function V0SpecSection() {
  return (
    <section id="v0-spec" className="mb-12">
      <h2 className="mb-2 text-[20px] font-bold text-tp-slate-800">
        V0 Mode — Simplified Variant
      </h2>
      <p className="mb-6 text-[12px] text-tp-slate-500">
        V0 is a simplified, summary-only variant of Dr. Agent. It provides the same core patient context intelligence (summaries, history, vitals) but strips away all advanced clinical action features. Designed for clinics that need a lightweight AI co-pilot focused purely on context surfacing.
      </p>

      {/* V0 default callout */}
      <div className="mb-4 rounded-[10px] border border-tp-blue-200 bg-tp-blue-50 px-4 py-3">
        <p className="text-[12px] font-semibold text-tp-blue-700">
          V0 is enabled by default
        </p>
        <p className="mt-1 text-[11px] text-tp-blue-600">
          When the app loads, Dr. Agent starts in V0 (simplified) mode. Users can explicitly disable V0 to access the full variant with clinical action cards, sidebar pills, RxPad AI chips, and inline suggestion chips.
        </p>
      </div>

      {/* Entry points */}
      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">Entry Points</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-tp-slate-100 text-left text-tp-slate-500">
                <th className="px-4 py-2 font-semibold">Entry Point</th>
                <th className="px-4 py-2 font-semibold">V0 Behavior</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">RxPad Panel</td>
                <td className="px-4 py-2 text-tp-slate-600">V0 agent panel (summary-only experience)</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">Patient Details Page</td>
                <td className="px-4 py-2 text-tp-slate-600">V0 agent panel via FAB button</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-tp-slate-700">Homepage</td>
                <td className="px-4 py-2 text-tp-slate-600">Uses <span className="font-semibold text-tp-slate-800">full panel</span> (not V0) — operational features always available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture */}
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Component</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">DrAgentPanelV0</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">Standalone panel, separate from DrAgentPanel.</p>
        </div>
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Mode Toggle</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">useV0Mode()</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">localStorage persistence, cross-page sync via custom events.</p>
        </div>
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Default State</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">V0 Enabled</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">Starts in V0 mode. User disables explicitly for full variant.</p>
        </div>
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Patient Selector</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">Shared Bottom Sheet</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">Radio selection, circular avatars, gender/age/phone metadata.</p>
        </div>
      </div>

      {/* Allowed card types */}
      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">Allowed Card Types ({V0_ALLOWED_CARDS.length} kinds)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-tp-slate-100 text-left text-tp-slate-500">
                <th className="px-4 py-2 font-semibold">Card Kind</th>
                <th className="px-4 py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {V0_ALLOWED_CARDS.map((card) => (
                <tr key={card.kind} className="border-b border-tp-slate-100 last:border-0">
                  <td className="px-4 py-2">
                    <code className="rounded bg-tp-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-tp-slate-700">{card.kind}</code>
                  </td>
                  <td className="px-4 py-2 text-tp-slate-600">{card.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* What's excluded */}
      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-red-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-red-700">What&apos;s Excluded in V0</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-tp-slate-100 text-left text-tp-slate-500">
                <th className="px-4 py-2 font-semibold">Feature / Card Group</th>
                <th className="px-4 py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {EXCLUDED_FEATURES.map((item) => (
                <tr key={item.feature} className="border-b border-tp-slate-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-tp-slate-700">{item.feature}</td>
                  <td className="px-4 py-2 text-tp-slate-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* V0 vs Full comparison */}
      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">V0 vs Full — UI Element Comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-tp-slate-100 text-left text-tp-slate-500">
                <th className="px-4 py-2 font-semibold">UI Element</th>
                <th className="px-4 py-2 font-semibold">Full Variant</th>
                <th className="px-4 py-2 font-semibold">V0 Variant</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">Gradient PillBar (above input)</td>
                <td className="px-4 py-2 text-green-600 font-medium">All pills</td>
                <td className="px-4 py-2 text-green-600 font-medium">Summary pills only</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">SidebarPillBar</td>
                <td className="px-4 py-2 text-green-600 font-medium">Visible</td>
                <td className="px-4 py-2 text-red-500 font-medium">Hidden</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">RxPad AiTriggerChips</td>
                <td className="px-4 py-2 text-green-600 font-medium">Visible</td>
                <td className="px-4 py-2 text-red-500 font-medium">Hidden</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">Inline suggestion chips</td>
                <td className="px-4 py-2 text-green-600 font-medium">Below messages</td>
                <td className="px-4 py-2 text-red-500 font-medium">Hidden</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-tp-slate-700">Clinical action cards</td>
                <td className="px-4 py-2 text-green-600 font-medium">45+ card types</td>
                <td className="px-4 py-2 text-red-500 font-medium">11 summary types only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pill filtering */}
      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">V0 Pill Filtering & Availability</p>
        </div>
        <p className="px-4 pt-3 pb-1 text-[11px] text-tp-slate-500">
          V0 generates its own dedicated pill list (not the generic pill-engine). Each pill maps to a V0-allowed card kind via <code className="rounded bg-tp-slate-50 px-1 py-0.5 text-[10px]">PILL_TO_CARD_KINDS</code>. Pills are hidden once their corresponding card has been shown in the conversation. Pills are also hidden during loading state — they only appear after the AI response is fully generated.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-tp-slate-100 text-left text-tp-slate-500">
                <th className="px-4 py-2 font-semibold">Pill Label</th>
                <th className="px-4 py-2 font-semibold">Maps To Card Kind(s)</th>
                <th className="px-4 py-2 font-semibold">Availability</th>
              </tr>
            </thead>
            <tbody>
              {V0_PILLS.map((pill) => (
                <tr key={pill.label} className="border-b border-tp-slate-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-tp-slate-700">{pill.label}</td>
                  <td className="px-4 py-2">
                    <code className="rounded bg-tp-slate-50 px-1.5 py-0.5 text-[10px] text-tp-slate-600">{pill.mapsTo}</code>
                  </td>
                  <td className="px-4 py-2 text-tp-slate-600">{pill.always ? "Always" : "When data exists"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guard behavior */}
      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-amber-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-amber-700">Guard Behavior — Unsupported Intents</p>
        </div>
        <div className="px-4 py-3 text-[11px] text-tp-slate-600">
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>The reply engine processes the query normally and returns cards.</li>
            <li>V0 guard strips any cards not in <code className="rounded bg-tp-slate-50 px-1 py-0.5 text-[10px]">V0_ALLOWED_KINDS</code>.</li>
            <li>If no cards remain, a <span className="font-semibold text-tp-slate-800">helpful text fallback</span> is shown: <em>&ldquo;I can help with patient summaries, vitals, and clinical history. Try asking for a patient summary, today&apos;s vitals, or medical history.&rdquo;</em></li>
            <li>No inline suggestion chips are rendered (V0 never includes them).</li>
          </ol>
        </div>
      </div>

      {/* Canned action smart priority */}
      <div className="overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">Canned Action Smart Priority (Welcome Screen)</p>
        </div>
        <p className="px-4 pt-3 pb-1 text-[11px] text-tp-slate-500">
          V0 uses the same 4-card selection logic as the full variant. Candidates are evaluated in order and the top 4 are displayed:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-tp-slate-100 text-left text-tp-slate-500">
                <th className="px-4 py-2 font-semibold">Candidate</th>
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">When Available</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">Intake</td>
                <td className="px-4 py-2 text-tp-slate-600">&ldquo;Details from patient&rdquo;</td>
                <td className="px-4 py-2 text-tp-slate-600">Only when symptom collector data exists</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">Summary</td>
                <td className="px-4 py-2 text-tp-slate-600">&ldquo;Patient summary&rdquo;</td>
                <td className="px-4 py-2 text-tp-slate-600">Always available</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">History</td>
                <td className="px-4 py-2 text-tp-slate-600">&ldquo;Medical history&rdquo;</td>
                <td className="px-4 py-2 text-tp-slate-600">Always available</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 font-medium text-tp-slate-700">Specialty</td>
                <td className="px-4 py-2 text-tp-slate-600">Varies by specialty</td>
                <td className="px-4 py-2 text-tp-slate-600">Only when specialty data exists</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-tp-slate-700">Vitals</td>
                <td className="px-4 py-2 text-tp-slate-600">&ldquo;Today&apos;s vitals&rdquo;</td>
                <td className="px-4 py-2 text-tp-slate-600">Always available as fallback</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

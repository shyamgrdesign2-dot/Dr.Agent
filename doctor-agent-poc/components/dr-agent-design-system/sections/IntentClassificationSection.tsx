"use client"

const INTENT_CATEGORIES = [
  "data_retrieval",
  "clinical_decision",
  "action",
  "comparison",
  "document_analysis",
  "clinical_question",
  "operational",
  "ambiguous",
  "follow_up",
]

export function IntentClassificationSection() {
  return (
    <section id="intent-classification" className="mb-12">
      <h2 className="mb-2 text-[20px] font-bold text-tp-slate-800">
        Intent Classification & Output Decision Layer
      </h2>
      <p className="mb-6 text-[12px] text-tp-slate-500">
        Every user prompt first passes through a synthetic intent layer. The layer decides whether the response should be text-only or UI card-first, and which card family is best for fast clinical action.
      </p>

      <div className="mb-4 rounded-[10px] border border-tp-blue-200 bg-tp-blue-50 px-4 py-3">
        <p className="text-[12px] font-semibold text-tp-blue-700">
          Output modes used by Doctor Agent
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-tp-slate-700">Text output</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-tp-slate-700">UI card output</span>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Step 1</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">Prompt normalization</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">Clean text, detect pills, parse explicit shortcuts.</p>
        </div>
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Step 2</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">Intent classification</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">Map to intent category using intent rules and pill overrides.</p>
        </div>
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Step 3</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">Output-format decision</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">Choose text when concise, choose card when visual/actionable.</p>
        </div>
        <div className="rounded-[10px] border border-tp-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-tp-slate-400">Step 4</p>
          <p className="mt-1 text-[12px] font-semibold text-tp-slate-800">Renderer selection</p>
          <p className="mt-1 text-[11px] leading-[1.5] text-tp-slate-500">Select card kind + payload and render via CardRenderer.</p>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">Decision Rules (Text vs Card)</p>
        </div>
        <div className="px-4 py-3 text-[11px] text-tp-slate-600">
          <ul className="space-y-1.5">
            <li>Use <span className="font-semibold text-tp-slate-800">text output</span> for short factual responses, quick clarifications, or low-complexity guidance without structured actions.</li>
            <li>Use <span className="font-semibold text-tp-slate-800">UI card output</span> for structured clinical/operational data, comparisons, selections, or copy/fill workflows.</li>
            <li>Prefer card output when information benefits from visual hierarchy, status badges, trend charts, checklists, or explicit next-step CTAs.</li>
            <li>For ambiguous requests, start concise with text and escalate to cards only when the user asks for drill-down/action.</li>
          </ul>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">Intent Categories Used In Engine</p>
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {INTENT_CATEGORIES.map((item) => (
            <span key={item} className="rounded-full border border-tp-slate-200 bg-white px-2.5 py-1 text-[11px] text-tp-slate-700">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-tp-slate-200 bg-white">
        <div className="border-b border-tp-slate-100 bg-tp-slate-50 px-4 py-2">
          <p className="text-[12px] font-semibold text-tp-slate-700">Intent-to-Output Mapping Examples</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-tp-slate-100 text-left text-tp-slate-500">
                <th className="px-4 py-2 font-semibold">User Prompt Type</th>
                <th className="px-4 py-2 font-semibold">Classified Intent</th>
                <th className="px-4 py-2 font-semibold">Preferred Output</th>
                <th className="px-4 py-2 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 text-tp-slate-700">"What is the normal HbA1c range?"</td>
                <td className="px-4 py-2 text-tp-slate-600">clinical_question</td>
                <td className="px-4 py-2 font-semibold text-tp-slate-800">Text</td>
                <td className="px-4 py-2 text-tp-slate-600">Short factual answer is fastest to consume.</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 text-tp-slate-700">"Show key labs and compare with previous."</td>
                <td className="px-4 py-2 text-tp-slate-600">comparison</td>
                <td className="px-4 py-2 font-semibold text-tp-slate-800">UI card</td>
                <td className="px-4 py-2 text-tp-slate-600">Tabular and trend visuals improve clinical scan speed.</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 text-tp-slate-700">"Suggest DDX for current symptoms."</td>
                <td className="px-4 py-2 text-tp-slate-600">clinical_decision</td>
                <td className="px-4 py-2 font-semibold text-tp-slate-800">UI card</td>
                <td className="px-4 py-2 text-tp-slate-600">Needs confidence tiers + actionable selection.</td>
              </tr>
              <tr className="border-b border-tp-slate-100">
                <td className="px-4 py-2 text-tp-slate-700">"Translate this advice to Hindi."</td>
                <td className="px-4 py-2 text-tp-slate-600">action</td>
                <td className="px-4 py-2 font-semibold text-tp-slate-800">UI card</td>
                <td className="px-4 py-2 text-tp-slate-600">Target output is structured and reusable in workflow.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-tp-slate-700">"How many follow-ups are pending today?"</td>
                <td className="px-4 py-2 text-tp-slate-600">operational</td>
                <td className="px-4 py-2 font-semibold text-tp-slate-800">UI card</td>
                <td className="px-4 py-2 text-tp-slate-600">Operational snapshots are clearer with counts + CTAs.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

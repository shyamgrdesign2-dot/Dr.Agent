"use client"

import React from "react"

// ─────────────────────────────────────────────────────────────
// Dr. Agent — Introduction
// What it is, why it exists, how it works.
// ─────────────────────────────────────────────────────────────

export default function ClinicalResearchTab() {
  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════════════════════════
          HERO — What is Dr. Agent?
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-8">
        <span className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-700">
          Introducing Dr. Agent
        </span>
        <h2 className="mb-4 text-[24px] font-extrabold leading-tight text-slate-900">
          The AI co-pilot built on top of the EMR
        </h2>
        <p className="max-w-3xl text-[14px] leading-relaxed text-slate-600">
          <strong className="text-violet-700">Dr. Agent</strong> is an{" "}
          <strong className="text-slate-800">AI-powered intelligence layer</strong> that sits on top of the EMR
          and works alongside the doctor throughout their entire workflow. From{" "}
          <strong className="text-slate-800">summarising patient history</strong> and{" "}
          <strong className="text-slate-800">surfacing clinical insights</strong> to{" "}
          <strong className="text-slate-800">generating prescriptions</strong>,{" "}
          <strong className="text-slate-800">running clinic analytics</strong>, and{" "}
          <strong className="text-slate-800">handling operational tasks</strong>{" "}
          — it turns the EMR from a passive record system into an active assistant that reads, reasons,
          and acts. Everything happens inside a single conversational interface with{" "}
          <strong className="text-slate-800">60 structured UI card types</strong>,{" "}
          <strong className="text-slate-800">10 intent categories</strong>, and{" "}
          <strong className="text-slate-800">5 specialty modes</strong> — no switching apps, no extra clicks.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          THE PROBLEM — Why this exists
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-[18px] font-bold text-slate-800">The Problem</h3>
        <p className="max-w-3xl text-[13px] leading-relaxed text-slate-600">
          Doctors already have the data — EMR records, lab results, uploaded reports, patient intake, historical
          sidebars. But the effort to{" "}
          <strong className="text-slate-800">assemble, interpret, and act on it</strong> still falls entirely on
          the doctor. Context is scattered across tabs, trend data is invisible, documentation is manual,
          and operational insights (revenue, follow-ups, patient load) live in completely separate systems.
          The result: doctors spend as much time navigating software as they do on clinical work.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          THE APPROACH — How we solve it
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-[18px] font-bold text-slate-800">The Approach</h3>
        <p className="max-w-3xl text-[13px] leading-relaxed text-slate-600">
          Instead of building a separate AI tool, we embedded Dr. Agent{" "}
          <strong className="text-slate-800">directly inside the EMR interface</strong>. It reads the same data
          the doctor would read, structures it into purpose-built UI cards, and connects every output
          to an action — copy to RxPad, jump to a sidebar section, or trigger the next clinical step.
          The doctor stays in one place; the agent does the legwork.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          THE DESIGN SHIFT
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-[18px] font-bold text-slate-800">The Design Shift</h3>
        <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-slate-600">
          We stopped thinking of AI as a chat window and started treating it as a{" "}
          <strong className="text-slate-800">response layer inside the doctor's working UI</strong>.
          Every AI output is a native element — a card, a pill, a sidebar link, a copy action — not a text bubble.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-4">
            <h4 className="mb-2 text-[13px] font-semibold text-violet-700">AI-Augmented UI</h4>
            <div className="space-y-1.5">
              {[
                "Responses render as structured cards with sections, data rows, and trust signals",
                "Section tags group outputs by function: Summary, Safety, Investigation, Treatment, Operational",
                "Inline actions: copy to RxPad, expand/collapse, jump to sidebar, flag for review",
                "Specialty-aware layouts adapt for GP, gynec, ophthal, obstetric, and pediatric contexts",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  <span className="text-[12px] leading-relaxed text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
            <h4 className="mb-2 text-[13px] font-semibold text-blue-700">A2UI Thinking (Agent-to-UI)</h4>
            <div className="space-y-1.5">
              {[
                "Intent engine classifies every input into 10 categories and routes to the right card type",
                "Canned pills are computed from live patient data, not generic suggestions",
                "Sidebar links connect AI responses to historical sections in the EMR",
                "Every card includes feedback (helpful / not helpful) to close the learning loop",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span className="text-[12px] leading-relaxed text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHY UI CARDS
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-[18px] font-bold text-slate-800">Why UI Cards Became the Core</h3>
        <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-slate-600">
          Cards give us a repeatable way to package one response at a time. Each card is a self-contained
          unit — context, data, trust signals, and actions in one place. A shared design system lets us
          maintain <strong className="text-slate-800">60 card types</strong> with consistent interaction patterns.
        </p>

        <div className="space-y-1.5">
          {[
            "60 card types spanning clinical, analytical, and operational workflows",
            "Each card is contextual — sections appear or hide based on available patient data",
            "Progressive disclosure: collapsed view for scanning, expanded for detail",
            "Copy action row on every card for moving data into RxPad or documentation",
            "Cards cover: patient summaries, SBAR, DDX, lab panels, drug interactions, protocol meds, investigations, advice, follow-ups, vital trends, lab comparisons, billing, analytics, and more",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span className="text-[12px] leading-relaxed text-slate-600">{item}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          See <strong className="text-slate-500">Card System & Spec</strong> tab for the complete card catalog with live previews.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW THE WORKFLOW IS SUPPORTED
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-[18px] font-bold text-slate-800">How the Workflow is Supported</h3>
        <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-slate-600">
          A response is only useful if it moves the doctor forward. Every output connects to something
          actionable — a prescription field, a sidebar section, a next question, a clinical or operational decision.
        </p>

        <div className="space-y-1.5 mb-5">
          {[
            "Canned pills guide the next best step instead of relying on free-text prompting",
            "Copy/fill actions push data directly into RxPad: medications, investigations, diagnosis, advice",
            "Sidebar links open historical sections so the doctor can verify context without switching views",
            "5 specialty modes (GP, Gynec, Ophthal, Obstetric, Pediatrics) auto-adapt card content and layout",
            "Symptom Collector captures structured patient data before the visit, feeding into summaries and DDX",
            "Vital trends and lab comparisons surface declining patterns across visits",
            "Operational cards handle clinic analytics, follow-up tracking, revenue insights, and patient lists",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
              <span className="text-[12px] leading-relaxed text-slate-600">{item}</span>
            </div>
          ))}
        </div>

        {/* Patient Context */}
        <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-blue-50/40 p-5">
          <h4 className="mb-2 text-[13px] font-semibold text-violet-700">Patient Context — The Foundation</h4>
          <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
            Before any card is generated, Dr. Agent assembles a{" "}
            <strong className="text-slate-800">complete patient picture</strong> from every available source.
            This pre-built context is what makes every response specific and relevant.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { source: "EMR Records", detail: "Diagnoses, labs, prescriptions, encounter notes" },
              { source: "Uploaded Documents", detail: "OCR-extracted data from scans, reports, and handwritten Rx" },
              { source: "Symptom Collector", detail: "Patient-reported symptoms captured pre-visit" },
              { source: "Historical Visits", detail: "Past consultation notes and treatment history" },
              { source: "Lab & Vitals", detail: "Current values, trends, and flagged abnormalities" },
              { source: "Specialty Data", detail: "Gynec, obstetric, ophthal, and pediatric records" },
            ].map((item) => (
              <div key={item.source} className="rounded-lg border border-violet-100 bg-white/80 px-3 py-2">
                <p className="mb-0.5 text-[11px] font-semibold text-violet-600">{item.source}</p>
                <p className="text-[10px] leading-relaxed text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHAT DR. AGENT DELIVERS
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h3 className="mb-4 text-[18px] font-bold text-slate-800">What Dr. Agent Delivers</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "60 Response Cards",
              color: "#3B82F6",
              description: "Structured card types spanning clinical summaries, safety checks, DDX, prescriptions, lab analysis, billing, analytics, and operational flows.",
            },
            {
              title: "Guided Navigation",
              color: "#8B5CF6",
              description: "Canned pills computed from patient data, sidebar links, specialty views, and progressive exploration — no free-text prompting needed.",
            },
            {
              title: "RxPad Integration",
              color: "#059669",
              description: "One-click copy of medications, investigations, diagnosis, and advice directly into the prescription pad.",
            },
            {
              title: "Trust & Provenance",
              color: "#D97706",
              description: "Source tagging on every data point (EMR / AI-extracted / Missing), completeness indicators, and tiered recommendations.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: item.color }} />
              <h4 className="mb-1.5 text-[13px] font-bold text-slate-800">{item.title}</h4>
              <p className="text-[11px] leading-relaxed text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SYSTEM AT A GLANCE
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h4 className="mb-3 text-[13px] font-bold text-slate-700">System at a Glance</h4>
        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
          {[
            { label: "Card types", value: "60" },
            { label: "Intent categories", value: "10" },
            { label: "Specialty modes", value: "5 (GP, Gynec, Ophthal, Obstetric, Pediatrics)" },
            { label: "Consult phases", value: "5 (empty → symptoms → dx → meds → near-complete)" },
            { label: "Copy destinations", value: "RxPad (Medications, Investigations, Diagnosis, Advice)" },
            { label: "Response formats", value: "Card, Hybrid (card + text), Text" },
          ].map((item) => (
            <div key={item.label} className="flex items-baseline gap-2 py-1">
              <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
              <span className="text-[11px] font-bold text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER — Deeper reading
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-[12px] leading-relaxed text-slate-500">
          For the complete response pipeline, card rules, and clinical frameworks (SBAR / POMR / Timeline),
          see the <strong className="text-violet-600">Response System</strong> tab.
          For the full card catalog with live previews of all 60 card types,
          see <strong className="text-violet-600">Card System & Spec</strong>.
        </p>
      </section>

    </div>
  )
}

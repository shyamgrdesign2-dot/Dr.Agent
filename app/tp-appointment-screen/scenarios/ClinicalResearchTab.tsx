"use client"

import React from "react"

// ─────────────────────────────────────────────────────────────
// Dr. Agent — Introduction
// What it is, why it exists, how it works.
// ─────────────────────────────────────────────────────────────

// ── Consultation Time Dissection (Internal Research) ──────────

const CONSULTATION_DISSECTION = {
  title: "How Doctors Actually Spend Their Consultation Time",
  description:
    "Through our in-depth research with practicing doctors — shadowing consultations and timing each phase — we observed how a typical 8-12 minute outpatient consultation actually breaks down. This time dissection became the foundation for everything Dr.Agent optimises.",
  phases: [
    {
      label: "Reading & Context-Building",
      minutes: "2-3 min",
      percent: 25,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      description:
        "The doctor opens the patient file, scans previous visit notes, checks lab results, and pieces together the clinical picture. For a chronic patient, this involves flipping between multiple tabs, deciphering handwritten referrals, and mentally constructing the patient's trajectory. This is where the most time is wasted.",
      agentRole: "Dr.Agent eliminates this by pre-building the PatientSummaryCard. The complete picture is ready before the patient walks in.",
    },
    {
      label: "Patient Interview & Examination",
      minutes: "3-4 min",
      percent: 35,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
      description:
        "Active clinical time — asking about symptoms, current complaints, medication compliance, lifestyle changes. This is the irreducible core of the consultation that cannot and should not be automated. The doctor's clinical judgment and patient rapport happen here.",
      agentRole: "The Symptom Collector pre-captures structured symptom data before the consultation, so the doctor starts the interview with context instead of from scratch.",
    },
    {
      label: "Diagnosis & Decision-Making",
      minutes: "1-2 min",
      percent: 15,
      color: "#059669",
      bgColor: "#ECFDF5",
      description:
        "Forming a differential diagnosis, deciding on investigations, choosing treatment protocols. Experienced doctors do this rapidly through pattern recognition — but miss edge cases when fatigued or rushed.",
      agentRole: "Dr.Agent surfaces DDX suggestions, flags drug interactions, and highlights cross-problem risks — acting as a safety net for clinical decision-making.",
    },
    {
      label: "Prescribing & Documentation",
      minutes: "2-3 min",
      percent: 25,
      color: "#D97706",
      bgColor: "#FFFBEB",
      description:
        "Writing prescriptions, ordering investigations, documenting findings, typing advice. This is mechanical work that consumes a quarter of the consultation — time that could be spent with the patient.",
      agentRole: "One-click copy from Dr.Agent to RxPad — medications, investigations, and advice generated contextually and ready to review, not type from scratch.",
    },
  ],
  keyInsight:
    "The fundamental insight: doctors spend 50% of consultation time on information retrieval and documentation — tasks that AI can handle — and only 50% on irreducible clinical work (examination + decision-making). Dr.Agent's job is to compress the first 50% to near-zero, giving the doctor back 4-5 minutes per patient.",
}

// ── Research Process (Dual Track) ────────────────────────────

const RESEARCH_TRACKS = [
  {
    track: "Consultation",
    label: "Doctor Shadowing & Symptom Collection",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    description:
      "Through in-depth research with doctors during live consultations, we shadowed GPs and specialists to understand the real consultation workflow — timing each phase, identifying bottlenecks, and discovering that pre-consultation symptom collection could save 2-3 minutes per patient. This led to the Symptom Collector feature and the time-dissection model that drives Dr.Agent's architecture.",
    findings: [
      "Doctors spend ~25% of consultation time just reading and building context from fragmented records",
      "Symptom collection before the consultation saves 2-3 minutes of doctor's active interview time",
      "Documentation and prescription writing consumes another 25% — most of it is mechanical and repetitive",
      "The irreducible clinical core (examination + decision) is only ~50% of actual consultation time",
      "Pre-built patient summaries transform consultations from 'information gathering' to 'clinical discussion'",
    ],
  },
  {
    track: "Cross-Specialty",
    label: "Javed & Team — Specialist Interviews",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    description:
      "Javed and team conducted in-depth interviews with nephrologists, cardiologists, endocrinologists, and general practitioners, focusing on how specialists consume patient information across departments. The core question: when a chronic disease patient walks into your consultation room, what do you need to know in the first 30 seconds vs. the first 5 minutes?",
    findings: [
      "Doctors think in layers — fast triage first, then structured problem review, then deep-dive trajectory analysis",
      "Cross-specialty handovers follow the ISBAR (Introduction-Situation-Background-Assessment-Recommendation) framework",
      "Most specialist EMR views are fragmented — doctors see only their own department's recent notes",
      "Redundant investigations are ordered because previous results from other departments are buried in the record",
      "Trend data (disease trajectory over months) is almost never available in a consumable format",
      "A confident display of uncertain data is more dangerous than showing no data at all — provenance matters",
    ],
  },
]

const RESEARCH_CONVERGENCE = {
  title: "Where Both Research Tracks Converge",
  description:
    "The consultation dissection and Javed's cross-specialty interviews independently arrived at the same core problem: doctors waste too much cognitive effort on information assembly. Our doctor shadowing quantified it (50% of time on non-clinical tasks), while Javed's specialist interviews qualified it (layered cognition, provenance needs, cross-specialty gaps). Together, they shaped Dr.Agent's three-layer architecture.",
  convergencePoints: [
    {
      internal: "Pre-consultation context building takes 2-3 minutes",
      external: "SBAR gives the 30-second triage scan doctors actually need",
      outcome: "PatientSummaryCard with SBAR situation bar replaces 3 minutes of file-reading with a 30-second scan",
    },
    {
      internal: "Symptom Collector pre-captures structured patient input",
      external: "Doctors think in problems, not data types (POMR framework)",
      outcome: "AI-generated DDX and per-problem cards that connect symptoms to diagnosis workflow",
    },
    {
      internal: "Documentation phase is mechanical and time-consuming",
      external: "AI recommendations must be gated by data quality",
      outcome: "One-click copy to RxPad with ACT/VERIFY/GATHER tiers — fast but safe",
    },
    {
      internal: "Doctors miss patterns when rushed (15-20 patients/day)",
      external: "Longitudinal trajectory is invisible in snapshot views",
      outcome: "VitalsTrendCard and ConcernTrend — AI surfaces declining patterns the doctor might miss at 4pm",
    },
  ],
}

// ── Component ────────────────────────────────────────────────

export default function ClinicalResearchTab() {
  return (
    <div className="space-y-10">

      {/* ══════════════════════════════════════════════════════════
          SECTION 1: HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-8">
        <span className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-700">
          Introducing Dr. Agent
        </span>
        <h2 className="mb-4 text-[24px] font-extrabold leading-tight text-slate-900">
          The AI co-pilot for every consultation
        </h2>
        <p className="mb-3 max-w-3xl text-[14px] leading-relaxed text-slate-600">
          <strong className="text-violet-700">Dr. Agent</strong> is not a chatbot. It is an{" "}
          <strong className="text-slate-800">intelligence layer woven directly into the doctor's consultation workflow</strong>{" "}
          — reading EMR records, uploaded reports, patient intake, and historical data, then surfacing{" "}
          <strong className="text-slate-800">structured response cards</strong> that the doctor can read, verify, and act on without leaving the screen.
        </p>
        <p className="mb-3 max-w-3xl text-[14px] leading-relaxed text-slate-600">
          The problem it solves is simple but expensive:{" "}
          <strong className="text-violet-700">doctors spend 50% of every consultation</strong> on information retrieval and documentation — reading old notes, piecing together history, writing prescriptions, typing advice.
          That is time taken away from the patient. Dr. Agent compresses those tasks to near-zero.
        </p>
        <p className="max-w-3xl text-[14px] leading-relaxed text-slate-600">
          How? <strong className="text-slate-800">Pre-built patient context</strong> ready before the patient walks in.{" "}
          <strong className="text-slate-800">20+ response card types</strong> for summaries, labs, safety checks, DDX, and treatment plans.{" "}
          <strong className="text-slate-800">One-click copy to RxPad</strong> for prescriptions, investigations, and advice.{" "}
          <strong className="text-slate-800">Canned pills</strong> that guide the doctor through the consultation step by step — no free-text prompting required.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2: CONSULTATION TIME DISSECTION
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h3 className="mb-1 text-[18px] font-bold text-slate-800">{CONSULTATION_DISSECTION.title}</h3>
        <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-500">
          {CONSULTATION_DISSECTION.description}
        </p>

        <div className="space-y-4">
          {CONSULTATION_DISSECTION.phases.map((phase) => (
            <div
              key={phase.label}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {/* Progress bar header */}
              <div className="relative h-2 w-full bg-slate-100">
                <div
                  className="absolute left-0 top-0 h-full rounded-r-full transition-all"
                  style={{ width: `${phase.percent}%`, backgroundColor: phase.color }}
                />
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="rounded-lg px-2.5 py-1 text-[12px] font-bold text-white"
                    style={{ backgroundColor: phase.color }}
                  >
                    {phase.percent}%
                  </span>
                  <h4 className="text-[15px] font-bold text-slate-800">{phase.label}</h4>
                  <span className="text-[12px] text-slate-400">{phase.minutes}</span>
                </div>

                <p className="mb-4 text-[13px] leading-relaxed text-slate-600">{phase.description}</p>

                {/* What Dr.Agent does */}
                <div className="rounded-lg border-l-4 pl-4" style={{ borderColor: phase.color, backgroundColor: phase.bgColor }}>
                  <div className="py-3 pr-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: phase.color }}>
                      What Dr.Agent does
                    </p>
                    <p className="text-[13px] leading-relaxed text-slate-700">{phase.agentRole}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Insight Callout */}
        <div className="mt-5 rounded-xl border-l-4 border-violet-400 bg-gradient-to-r from-violet-50 to-blue-50/50 py-4 pl-5 pr-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Key Insight</p>
          <p className="mt-1 text-[14px] font-medium leading-relaxed text-slate-700">
            {CONSULTATION_DISSECTION.keyInsight}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3: DUAL RESEARCH TRACK
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h3 className="mb-1 text-[18px] font-bold text-slate-800">How We Discovered the Problem</h3>
        <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-500">
          Two parallel research tracks ran simultaneously — one focused on the doctor's minute-by-minute consultation workflow, the other on how specialists consume and share patient data across departments.
        </p>

        <div className="space-y-4">
          {RESEARCH_TRACKS.map((track) => (
            <div
              key={track.track}
              className="overflow-hidden rounded-xl border bg-white"
              style={{ borderColor: track.borderColor }}
            >
              <div className="px-6 py-4" style={{ backgroundColor: track.bgColor }}>
                <span className="mb-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: track.color }}>
                  {track.track} Track
                </span>
                <h4 className="mt-1 text-[15px] font-bold text-slate-800">{track.label}</h4>
              </div>

              <div className="px-6 py-5">
                <p className="mb-4 text-[13px] leading-relaxed text-slate-600">{track.description}</p>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Findings</p>
                  {track.findings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: track.color }} />
                      <span className="text-[13px] leading-relaxed text-slate-600">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4: RESEARCH CONVERGENCE
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h3 className="mb-1 text-[18px] font-bold text-slate-800">{RESEARCH_CONVERGENCE.title}</h3>
        <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-500">
          {RESEARCH_CONVERGENCE.description}
        </p>

        <div className="space-y-3">
          {RESEARCH_CONVERGENCE.convergencePoints.map((point, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid gap-0 sm:grid-cols-3">
                {/* Internal finding */}
                <div className="border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">Doctor Shadowing</p>
                  <p className="text-[12px] leading-relaxed text-slate-600">{point.internal}</p>
                </div>
                {/* External finding */}
                <div className="border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-violet-500">Specialist Interviews</p>
                  <p className="text-[12px] leading-relaxed text-slate-600">{point.external}</p>
                </div>
                {/* Outcome */}
                <div className="bg-emerald-50/50 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">What We Built</p>
                  <p className="text-[12px] font-medium leading-relaxed text-slate-700">{point.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5: THE DESIGN SHIFT
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-[18px] font-bold text-slate-800">The Design Shift</h3>
        <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-600">
          We moved away from thinking about AI as a separate chat assistant and started treating it as a{" "}
          <strong className="text-slate-800">response layer embedded inside the doctor's working UI</strong>.
          Every AI output is designed to appear as a native element of the consultation screen — not a floating window or a separate app.
        </p>

        <div className="space-y-5">
          {/* AI-Augmented UI */}
          <div>
            <h4 className="mb-2 text-[14px] font-semibold text-violet-700">AI-Augmented UI</h4>
            <p className="mb-3 text-[13px] leading-relaxed text-slate-500">
              The output must appear as native UI elements, not text dumps. Every response is a structured card, tag, signal, or action that fits naturally into the doctor's workflow.
            </p>
            <div className="space-y-2 pl-1">
              {[
                "Response cards with structured sections, headers, and data rows — not free-text paragraphs",
                "Section tags visually group cards by clinical function (Summary, Safety, Investigation, Treatment)",
                "Trust signals (source dots, completeness bars) embedded directly in data displays",
                "Inline actions: copy to RxPad, jump to sidebar, expand/collapse, flag for review",
                "Specialty-aware outputs that adapt layout and content based on gynec, ophthal, obstetric, or pediatric context",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                  <span className="text-[13px] leading-relaxed text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* A2UI Thinking */}
          <div>
            <h4 className="mb-2 text-[14px] font-semibold text-violet-700">A2UI Thinking (Agent-to-UI Interface)</h4>
            <p className="mb-3 text-[13px] leading-relaxed text-slate-500">
              Every interaction between the AI engine and the UI is a deliberate bridge. The agent does not "chat" — it generates structured outputs that the UI renders as purpose-built components.
            </p>
            <div className="space-y-2 pl-1">
              {[
                "Every card, pill, copy action, and sidebar jump is an agent-to-interface bridge",
                "The intent engine classifies doctor input and routes to the correct card type — no generic text fallback",
                "Canned pills are pre-computed from patient data, not generic suggestions",
                "Sidebar navigation links connect AI responses to historical data sections in the EMR",
                "Feedback rows (helpful/not helpful) on every card close the learning loop",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                  <span className="text-[13px] leading-relaxed text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6: WHY UI CARDS BECAME THE CORE
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-[18px] font-bold text-slate-800">Why UI Cards Became the Core</h3>
        <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-600">
          Cards gave us a <strong className="text-slate-800">repeatable way to package one clinical response</strong> at a time
          without overwhelming the doctor. Each card is a self-contained unit that carries context, data, trust signals,
          and actions in one place.
        </p>

        <div className="space-y-2 pl-1">
          {[
            "A card carries context, payload, trust signals, next steps, and copy actions in one contained unit",
            "A shared design system with consistent rules lets us derive 20+ card types while keeping interaction patterns identical",
            "Section tags group cards visually: Summary, Safety, Investigation, Treatment, Clinical Question, Operational",
            "Card types span the full clinical workflow: PatientSummary, SBAR, DDX, LabPanel, ProtocolMeds, InvestigationBundle, DrugInteraction, Advice, FollowUp, VitalsTrend, LabComparison, and more",
            "Each card is contextual to the patient's data — sections appear or hide based on what data exists",
            "Cards support progressive disclosure: collapsed view for scanning, expanded view for detail",
            "Every card includes a copy action row for moving data directly into the RxPad or documentation",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              <span className="text-[13px] leading-relaxed text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7: HOW THE WORKFLOW IS SUPPORTED
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-[18px] font-bold text-slate-800">How the Workflow is Supported</h3>
        <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-600">
          A response is only useful if it can <strong className="text-slate-800">move the doctor forward inside the product</strong>.
          Every output connects to something actionable — a prescription field, a sidebar section, a next question, or a clinical decision.
        </p>

        <div className="space-y-2 pl-1 mb-6">
          {[
            "Canned pills guide the next best step instead of forcing free-text prompting every time",
            "Copy/fill actions connect directly into RxPad sections (medications, investigations, advice, diagnosis) and historical sidebars",
            "Sidebar links and specialty views create multiple entry points instead of locking the doctor into one route",
            "Specialty summaries (gynecology, ophthalmology, obstetrics, pediatrics) auto-adapt based on patient data",
            "Symptom Collector captures structured data from the patient before the visit, feeding directly into the SBAR situation line and DDX",
            "Vital trends and lab comparisons surface declining patterns the doctor might miss during a busy clinic day",
            "Follow-up tracking highlights overdue reviews, pending investigations, and missed appointments",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
              <span className="text-[13px] leading-relaxed text-slate-600">{item}</span>
            </div>
          ))}
        </div>

        {/* Patient Context sub-section */}
        <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-blue-50/40 p-5">
          <h4 className="mb-2 text-[14px] font-semibold text-violet-700">Patient Context — The Foundation</h4>
          <p className="mb-3 text-[13px] leading-relaxed text-slate-600">
            Before a single card is generated, Dr. Agent builds a <strong className="text-slate-800">complete patient picture</strong> by
            assembling data from multiple sources. This pre-built context is what enables every response to be specific, relevant, and trustworthy.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { source: "EMR Records", detail: "Structured diagnoses, lab results, prescriptions, encounter notes from TatvaPractice" },
              { source: "Uploaded Documents", detail: "OCR-extracted data from scanned reports, handwritten prescriptions, and lab printouts" },
              { source: "Symptom Collector", detail: "Patient-reported symptoms, severity, duration, and associated complaints captured pre-visit" },
              { source: "Historical Visits", detail: "Past consultation notes, treatment history, and previous visit summaries" },
              { source: "Lab & Vitals", detail: "Current and trending lab values, today's vitals, and flagged abnormalities" },
              { source: "Specialty Data", detail: "Gynec, obstetric, ophthal, and pediatric-specific records when applicable" },
            ].map((item) => (
              <div key={item.source} className="rounded-lg border border-violet-100 bg-white/80 px-3 py-2.5">
                <p className="mb-0.5 text-[11px] font-semibold text-violet-600">{item.source}</p>
                <p className="text-[11px] leading-relaxed text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Each data point carries a trust level (EMR / AI-extracted / Not available). See{" "}
            <strong className="text-slate-500">Response System → Clinical Framework</strong> for the full trust model.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 8: WHAT DR. AGENT DELIVERS
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h3 className="mb-4 text-[18px] font-bold text-slate-800">What Dr. Agent Delivers</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "20+ Response Cards",
              color: "#3B82F6",
              description: "Structured card types for patient summaries, SBAR overviews, DDX, lab panels, protocol medications, investigation bundles, drug interactions, advice, follow-ups, vital trends, and more.",
            },
            {
              title: "Guided Navigation",
              color: "#8B5CF6",
              description: "Canned pills computed from patient data, sidebar links to historical sections, specialty views, and progressive exploration — no free-text prompting needed.",
            },
            {
              title: "RxPad Integration",
              color: "#059669",
              description: "One-click copy of medications, investigations, diagnosis, and advice directly into the prescription pad. Review and fill, not type from scratch.",
            },
            {
              title: "Trust & Provenance",
              color: "#D97706",
              description: "Source tagging on every data point (EMR / AI-extracted / Missing), data completeness indicators, and tiered recommendations (ACT / VERIFY / GATHER).",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: item.color }} />
              <h4 className="mb-2 text-[13px] font-bold text-slate-800">{item.title}</h4>
              <p className="text-[12px] leading-relaxed text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 9: FOOTER POINTER
      ══════════════════════════════════════════════════════════ */}
      <section className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-[12px] leading-relaxed text-slate-500">
          For the detailed clinical framework — the{" "}
          <strong className="text-slate-600">SBAR / POMR / Timeline three-layer model</strong>, data trust levels,
          design principles, concept-to-feature mapping, and the CKD reference case — see the{" "}
          <strong className="text-violet-600">Response System</strong> tab →{" "}
          <strong className="text-violet-600">Clinical Framework</strong>.
        </p>
      </section>

    </div>
  )
}

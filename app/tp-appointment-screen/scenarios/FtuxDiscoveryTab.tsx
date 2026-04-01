"use client"

import React, { useState } from "react"

// ═══════════════════════════════════════════════════════════════
// DR. AGENT — FTUX & DISCOVERY DOCUMENTATION
// Documents the complete first-time user experience:
// discovery touchpoints, AI Suit page, trial lifecycle,
// expired states, and conversion CTAs.
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
  const dotColors = { blue: "bg-blue-400", amber: "bg-amber-400", emerald: "bg-emerald-400", rose: "bg-rose-400" }
  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1.5">{label}</p>
      <div className={`space-y-1.5 text-[11px] leading-[1.55] [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_span.dot]:mt-[5px] [&_span.dot]:h-[5px] [&_span.dot]:w-[5px] [&_span.dot]:flex-shrink-0 [&_span.dot]:rounded-full [&_span.dot]:${dotColors[tone]}`}>
        {children}
      </div>
    </div>
  )
}

// ── Data constants ──

const DISCOVERY_TOUCHPOINTS = [
  {
    id: "ai-hub",
    title: "AI Hub Icon in Top Nav Bar",
    location: "Homepage top bar, near notification bell",
    description: "A new AI sparkle icon with purple gradient background. Red dot badge indicates new AI features are available. Clicking opens the AI Suit page.",
    specs: [
      { label: "Container", value: "42px square, #f1f1f5 bg, rounded-[10.5px]" },
      { label: "Icon", value: "AiBrandSparkIcon (sparkle SVG) with AI_GRADIENT_SOFT background" },
      { label: "Badge dot", value: "10.5px diameter, #E11D48 (rose), position top:-1.14 right:-1.14" },
      { label: "Gradient", value: "linear-gradient(135deg, #D565EA 0%, #673AAC 45%, #1A1994 100%)" },
    ],
    action: "Opens AI Suit page/drawer listing all AI features",
    figma: "258:8536",
    color: "border-l-violet-500",
  },
  {
    id: "notification",
    title: "In-App Push Notification",
    location: "Notification bell in top bar",
    description: "Push notification about new Dr. Agent AI feature. Notification bell badge count increments. Tapping the notification navigates to the AI Suit page.",
    specs: [
      { label: "Trigger", value: "Sales team or system sends notification via backend" },
      { label: "Badge", value: "Notification bell shows incremented count (e.g. 3 -> 4)" },
      { label: "Content", value: "\"Introducing Dr. Agent - your clinical AI assistant! Try it free for 3 days.\"" },
    ],
    action: "Tapping notification navigates to AI Suit page",
    color: "border-l-amber-500",
  },
  {
    id: "sidebar-nav",
    title: "Ask Tatva Sidebar Nav Item",
    location: "Secondary navigation panel in appointment screen",
    description: "Existing nav item with a green gradient 'New' badge. Already implemented. Clicking opens the Dr. Agent panel directly.",
    specs: [
      { label: "Badge text", value: "\"New\"" },
      { label: "Badge gradient", value: "linear-gradient(257.32deg, rgb(22,163,74) 0%, rgb(68,207,119) 47.222%, rgb(22,163,74) 94.444%)" },
      { label: "Component", value: "TPSecondaryNavPanel + TPSecondaryNavItem" },
    ],
    action: "Opens Dr. Agent panel directly (if trial active) or shows trial CTA",
    figma: "44:2228",
    color: "border-l-emerald-500",
  },
]

const AI_SUIT_FEATURES = [
  {
    id: "doctor-agent",
    name: "Doctor Agent",
    badge: "New",
    badgeColor: "bg-emerald-500",
    description: "AI-powered clinical assistant that helps with patient summaries, differential diagnosis, medication suggestions, and more.",
    promotion: { text: "Just for you! Get 3 days free trial", emoji: "party", ctaText: "Get Free Trial", ctaColor: "bg-emerald-600" },
    ctas: [{ label: "Know more", variant: "outlined" as const }, { label: "Buy Now", variant: "filled" as const }],
    highlighted: true,
  },
  {
    id: "voice-rx",
    name: "Voice Rx",
    description: "AI-powered voice recognition for seamless prescription generation. Dictate and auto-structure into RxPad sections.",
    ctas: [{ label: "Know more", variant: "outlined" as const }, { label: "Buy Now", variant: "filled" as const }],
    highlighted: false,
  },
  {
    id: "ask-tatva",
    name: "Ask Tatva",
    description: "Conversational AI assistant for clinical queries, drug information, and guideline references.",
    ctas: [{ label: "Know more", variant: "outlined" as const }, { label: "Buy Now", variant: "filled" as const }],
    highlighted: false,
  },
  {
    id: "ddx",
    name: "DDx",
    description: "AI-powered differential diagnosis engine using symptom patterns and patient context.",
    ctas: [{ label: "Know more", variant: "outlined" as const }, { label: "Buy Now", variant: "filled" as const }],
    highlighted: false,
  },
]

const KNOW_MORE_TABS = [
  { id: "basic-info", label: "Basic Info", description: "What is Dr. Agent? Feature overview, value proposition, and key capabilities explained in simple terms." },
  { id: "how-it-works", label: "How it works", description: "Step-by-step guide with video walkthrough showing Dr. Agent in action during a consultation." },
  { id: "contact-support", label: "Contact Support", description: "Direct support contact, callback request form, and FAQ for common questions." },
]

const TRIAL_STATES = [
  {
    state: "pre-trial",
    label: "Pre-Trial (Discovery)",
    color: "#64748B",
    bg: "bg-slate-50/50",
    borderColor: "border-l-slate-400",
    trigger: "Doctor has not activated trial yet",
    description: "AI Hub icon shows red dot badge. AI Suit page shows the 3-day free trial promotion banner. Dr. Agent is not accessible yet.",
    uiElements: ["AI Hub icon with red dot badge", "AI Suit page with promotion banner", "'Get Free Trial' green CTA button", "'Know more' and 'Buy Now' buttons"],
  },
  {
    state: "active",
    label: "Trial Active (3 days)",
    color: "#16A34A",
    bg: "bg-emerald-50/30",
    borderColor: "border-l-emerald-500",
    trigger: "Doctor clicks 'Get Free Trial'",
    description: "Dr. Agent is fully accessible. FAB appears on right edge of RxPad. Trial countdown bar shows remaining days. All AI features enabled.",
    uiElements: ["DrAgentFab on right edge of RxPad", "Trial countdown bar at top of Dr. Agent panel", "Green '3-day free trial' tag in sidebar", "Full Dr. Agent panel with all features"],
  },
  {
    state: "expiring-soon",
    label: "Expiring Soon (Last day)",
    color: "#F59E0B",
    bg: "bg-amber-50/30",
    borderColor: "border-l-amber-500",
    trigger: "Less than 24 hours remaining in trial",
    description: "Warning indicators appear. Amber countdown in Dr. Agent panel header. Subtle nudge to upgrade or extend.",
    uiElements: ["Amber warning banner in Dr. Agent panel", "Countdown shows 'Expiring today'", "'Upgrade now' CTA becomes more prominent"],
  },
  {
    state: "expired",
    label: "Trial Expired",
    color: "#EF4444",
    bg: "bg-red-50/30",
    borderColor: "border-l-red-500",
    trigger: "Trial period ends (3 days elapsed)",
    description: "Full-screen expired modal appears. Dr. Agent features are locked/disabled. Doctor can extend trial by 7 days (one-time) or purchase unlimited access.",
    uiElements: ["Full-screen expired modal overlay", "'Know More' page shows expired state", "Dr. Agent panel shows locked overlay", "'Extend Your Free Trial' (7 days) CTA", "'Get Unlimited Access' primary CTA", "'Request a call back' secondary CTA"],
  },
  {
    state: "extended",
    label: "Extended Trial (7 days)",
    color: "#8B5CF6",
    bg: "bg-violet-50/30",
    borderColor: "border-l-violet-500",
    trigger: "Doctor clicks 'Extend Your Free Trial' from expired modal",
    description: "One-time extension of 7 additional days. Same experience as active trial but with violet-themed countdown indicating extension period.",
    uiElements: ["Same as active trial state", "Violet extension badge instead of green", "7-day countdown bar", "No further extension available after this"],
  },
  {
    state: "converted",
    label: "Paid / Unlimited Access",
    color: "#3B82F6",
    bg: "bg-blue-50/30",
    borderColor: "border-l-blue-500",
    trigger: "Doctor purchases via 'Get Unlimited Access' or sales team",
    description: "All trial banners removed. Full permanent access to Dr. Agent. Premium experience with no restrictions.",
    uiElements: ["No trial banners or countdown", "Full Dr. Agent access without restrictions", "Premium badge (optional) in sidebar nav"],
  },
]

const CONVERSION_CTAS = [
  { cta: "Get Free Trial", behavior: "Activates initial 3-day free trial. Doctor gets immediate access to all Dr. Agent features.", locations: ["AI Suit page (Doctor Agent card)"], color: "bg-emerald-600 text-white" },
  { cta: "Get Unlimited Access", behavior: "Navigates to purchase/subscription page. Opens payment flow or directs to admin.", locations: ["Know More page footer", "Expired modal", "Trial countdown bar"], color: "bg-violet-600 text-white" },
  { cta: "Request a call back", behavior: "Opens callback form with doctor's phone number pre-filled. Sends request to sales team for follow-up.", locations: ["Know More page footer", "Expired modal"], color: "border border-slate-300 bg-white text-slate-700" },
  { cta: "Extend Your Free Trial", behavior: "Activates a one-time 7-day extension. Only available from the expired modal. Cannot be used again.", locations: ["Expired modal only"], color: "bg-amber-500 text-white" },
  { cta: "Know more", behavior: "Navigates to the Dr. Agent 'Know More' page with Basic Info, How it works, and Contact Support tabs.", locations: ["AI Suit page (all features)"], color: "border border-slate-300 bg-white text-slate-700" },
  { cta: "Buy Now", behavior: "Direct purchase flow. Same as 'Get Unlimited Access' but from the AI Suit listing.", locations: ["AI Suit page (all features)"], color: "bg-violet-600 text-white" },
]

const EXPIRED_MODAL_BENEFITS = [
  "Seamless clinic management all in one place",
  "Secure and instant access to patient records",
  "Effortless e-prescriptions with less paperwork",
  "Generate AI-powered prescriptions in seconds and more",
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FtuxDiscoveryTab() {
  const [activeKnowMoreTab, setActiveKnowMoreTab] = useState("basic-info")

  return (
    <div className="space-y-10">

      {/* ── Page header ── */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50/80 via-white to-emerald-50/40 px-6 py-5">
        <h3 className="text-[18px] font-bold text-slate-800 mb-1">Dr. Agent — Discovery & First-Time Experience</h3>
        <p className="text-[12px] leading-[1.6] text-slate-500 max-w-2xl">
          How doctors discover, try, and adopt Dr. Agent. This documents the complete journey from first impression
          to paid conversion, including discovery touchpoints, trial activation, expiry handling, and upgrade paths.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "3-day free trial", color: "bg-emerald-100 border-emerald-200 text-emerald-700" },
            { label: "7-day extension", color: "bg-violet-100 border-violet-200 text-violet-700" },
            { label: "Unlimited access", color: "bg-blue-100 border-blue-200 text-blue-700" },
          ].map(item => (
            <span key={item.label} className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${item.color}`}>{item.label}</span>
          ))}
        </div>
      </div>

      {/* ═══ Section 1: What is Dr. Agent ═══ */}
      <DocSection number="1" title="What is Dr. Agent?" subtitle="The core value proposition that doctors see when they first encounter Dr. Agent. This content powers the Know More page, the AI Suit listing, and the trial activation modal.">
        <div className="space-y-4">
          {/* Hero value prop */}
          <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #673AAC 0%, #1A1994 60%, #0F172A 100%)" }}>
            <div className="relative px-6 py-6">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: "#D565EA" }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                    <svg width="16" height="16" viewBox="4 4 16 16" fill="none"><path d="M18.08 11.61C18.45 11.66 18.45 12.34 18.08 12.39C14.1 12.96 12.96 14.1 12.39 18.08C12.34 18.45 11.66 18.45 11.61 18.08C11.04 14.1 9.9 12.96 5.92 12.39C5.55 12.34 5.55 11.66 5.92 11.61C9.9 11.04 11.04 9.9 11.61 5.92C11.66 5.55 12.34 5.55 12.39 5.92C12.96 9.9 14.1 11.04 18.08 11.61Z" fill="white" /></svg>
                  </div>
                  <span className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Introducing</span>
                </div>
                <h2 className="text-[22px] font-bold text-white leading-tight mb-2">Dr. Agent</h2>
                <p className="text-[12px] text-white/70 leading-[1.6] max-w-lg">
                  Your AI-powered clinical co-pilot that understands your patient context, surfaces the right information at the right moment,
                  and helps you make faster, more confident clinical decisions — all within TatvaPractice.
                </p>
              </div>
            </div>
          </div>

          {/* Key capabilities grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Patient Summaries", desc: "Instant overview of vitals, labs, chronic conditions, medications, and flags. Saves 2-3 minutes of manual chart review per patient.", icon: "&#128202;" },
              { title: "Differential Diagnosis", desc: "AI-powered DDx engine suggests probable diagnoses based on symptoms, labs, and patient history. Three confidence tiers.", icon: "&#129658;" },
              { title: "Medication Suggestions", desc: "Protocol-based medication recommendations with dose calculations, drug interactions, and allergy conflict checks.", icon: "&#128138;" },
              { title: "One-Click Copy to RxPad", desc: "Copy symptoms, diagnosis, medications, advice, or investigations directly into your prescription — no re-typing.", icon: "&#128221;" },
              { title: "Lab Trends & Comparisons", desc: "Visual trends for HbA1c, eGFR, cholesterol, and more. Compare current vs previous values at a glance.", icon: "&#128200;" },
              { title: "Smart Clinical Guidelines", desc: "KDIGO, ADA, JNC, and NICE guidelines surfaced contextually based on the patient's conditions.", icon: "&#127891;" },
            ].map(cap => (
              <div key={cap.title} className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[18px]" dangerouslySetInnerHTML={{ __html: cap.icon }} />
                  <span className="text-[12px] font-semibold text-slate-800">{cap.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-[1.55]">{cap.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works - brief */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100">
              <p className="text-[12px] font-bold text-slate-700">How does Dr. Agent work?</p>
            </div>
            <div className="px-4 py-3">
              <div className="grid gap-3 lg:grid-cols-4">
                {[
                  { step: "1", title: "Open patient", desc: "Click a patient from your queue. Dr. Agent automatically loads their context.", color: "from-blue-500 to-blue-600" },
                  { step: "2", title: "Ask or tap a pill", desc: "Type a question or tap a smart suggestion pill. Dr. Agent understands your clinical intent.", color: "from-violet-500 to-violet-600" },
                  { step: "3", title: "Review the card", desc: "Get a structured response card — summaries, DDx, meds, labs, or advice — all formatted for quick scanning.", color: "from-emerald-500 to-emerald-600" },
                  { step: "4", title: "Copy to RxPad", desc: "One tap copies the content directly into your prescription fields. No manual re-entry needed.", color: "from-amber-500 to-amber-600" },
                ].map(s => (
                  <div key={s.step} className="text-center">
                    <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-[13px] font-bold text-white shadow-sm`}>{s.step}</div>
                    <p className="text-[12px] font-semibold text-slate-800 mb-0.5">{s.title}</p>
                    <p className="text-[10px] text-slate-500 leading-[1.5]">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Callout tone="blue" label="What doctors need to know">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Dr. Agent works inside TatvaPractice — no separate app, no extra login, no switching screens.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />It reads the same EMR data the doctor already sees in the sidebar — vitals, labs, history, records.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />The doctor is always in control. Dr. Agent suggests — the doctor decides, reviews, and confirms.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />All data stays within TatvaPractice. No external data sharing or third-party AI services.</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      {/* ═══ Section 2: Trial Activation Modal ═══ */}
      <DocSection number="2" title="Trial Activation Modal" subtitle="When the doctor clicks 'Get Free Trial', this modal confirms activation. Same visual language as the expired modal but with a positive/inviting tone.">
        <div className="space-y-4">
          {/* Modal mockup */}
          <div className="rounded-xl border-2 border-emerald-200 overflow-hidden shadow-lg">
            <div className="grid lg:grid-cols-2">
              {/* Left — Hero */}
              <div className="relative px-6 py-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #673AAC 0%, #1A1994 60%, #0F172A 100%)" }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ background: "#D565EA" }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                      <svg width="16" height="16" viewBox="4 4 16 16" fill="none"><path d="M18.08 11.61C18.45 11.66 18.45 12.34 18.08 12.39C14.1 12.96 12.96 14.1 12.39 18.08C12.34 18.45 11.66 18.45 11.61 18.08C11.04 14.1 9.9 12.96 5.92 12.39C5.55 12.34 5.55 11.66 5.92 11.61C9.9 11.04 11.04 9.9 11.61 5.92C11.66 5.55 12.34 5.55 12.39 5.92C12.96 9.9 14.1 11.04 18.08 11.61Z" fill="white" /></svg>
                    </div>
                    <span className="text-white/50 text-[10px] uppercase tracking-wider">Introducing</span>
                  </div>
                  <h2 className="text-[22px] font-bold text-white leading-tight mb-2">Dr. Agent</h2>
                  <p className="text-[12px] text-white/70 leading-[1.6] mb-4">Your AI-powered clinical assistant for faster, smarter consultations.</p>

                  <div className="space-y-2.5 mb-5">
                    {[
                      "Instant patient summaries — vitals, labs, history at a glance",
                      "AI differential diagnosis with evidence-based suggestions",
                      "Protocol medications with safety checks",
                      "One-click copy to RxPad — no re-typing",
                      "Clinical guidelines at your fingertips",
                    ].map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-[8px] text-white">&#10003;</span>
                        <span className="text-[11px] text-white/75 leading-[1.4]">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-3 py-2">
                    <p className="text-[10px] text-emerald-300 font-semibold">No commitment. No credit card.</p>
                    <p className="text-[11px] text-white/70">Try all features free for <strong className="text-white">3 days</strong>.</p>
                  </div>
                </div>
              </div>

              {/* Right — Actions */}
              <div className="bg-white px-6 py-6 flex flex-col">
                <h3 className="text-[16px] font-bold text-slate-800 mb-1">Start Your Free Trial</h3>
                <p className="text-[11px] text-slate-500 mb-4">Experience the full power of Dr. Agent for 3 days.</p>

                <div className="space-y-2 mb-6 flex-1">
                  {[
                    "Seamless clinic management all in one place",
                    "Secure and instant access to patient records",
                    "Effortless e-prescriptions with less paperwork",
                    "Generate AI-powered prescriptions in seconds",
                    "Clinical decision support with latest guidelines",
                    "Smart patient summaries save 2-3 min per consultation",
                  ].map(b => (
                    <div key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-[9px]">&#10003;</span>
                      <span className="text-[11px] text-slate-600 leading-[1.4]">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="rounded-xl py-2.5 text-center text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)" }}>
                    Get 3 Days Free Trial
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-300 bg-white py-2 text-center text-[11px] font-semibold text-slate-700">Request a call back</div>
                    <div className="rounded-xl bg-violet-600 py-2 text-center text-[11px] font-semibold text-white">Get Unlimited Access</div>
                  </div>
                </div>
                <p className="mt-3 text-center text-[9px] text-slate-400">Contact Support: +91-9974042363 | Support@tatvacare.in</p>
              </div>
            </div>
          </div>

          <Callout tone="emerald" label="UX principles for trial activation">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />The modal should feel inviting, not pushy. Green CTA emphasizes "free" and "no commitment".</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Benefits list mirrors what the doctor will actually experience — practical, time-saving, clinical value.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Three exit paths: start trial (primary), request callback (warm lead), buy now (immediate conversion).</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />The modal is closeable (X button) — never force the doctor. They can discover Dr. Agent later.</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      {/* ═══ Section 3: Trial Activation Success ═══ */}
      <DocSection number="3" title="Trial Activation Success" subtitle="Shown immediately after the doctor clicks 'Get 3 Days Free Trial'. A celebratory confirmation with a tutorial video to get started.">
        <div className="space-y-4">
          {/* Success modal mockup */}
          <div className="rounded-xl border-2 border-emerald-200 overflow-hidden shadow-lg">
            <div className="grid lg:grid-cols-2">
              {/* Left — Success celebration */}
              <div className="relative px-6 py-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #059669 0%, #10B981 40%, #34D399 100%)" }}>
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl bg-white" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15 blur-2xl bg-yellow-300" />
                <div className="relative z-10">
                  {/* Close button */}
                  <div className="flex justify-end mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white/70 text-[14px] cursor-pointer hover:bg-white/30 transition-colors">&#10005;</div>
                  </div>

                  {/* Celebration icon */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                      <span className="text-[36px]">&#127881;</span>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h2 className="text-[24px] font-bold text-white leading-tight mb-1">Congratulations!</h2>
                    <p className="text-[14px] text-white/85 font-medium">Your 3-day free trial is now active</p>
                  </div>

                  <div className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Trial period</p>
                        <p className="text-[16px] font-bold text-white">3 Days Free</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Expires on</p>
                        <p className="text-[14px] font-semibold text-white">26 Mar 2026</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      "All Dr. Agent features unlocked",
                      "Patient summaries, DDx, medications, lab trends",
                      "Unlimited queries during trial period",
                      "One-click copy to RxPad enabled",
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/25 text-[8px] text-white">&#10003;</span>
                        <span className="text-[11px] text-white/85">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl bg-white/20 backdrop-blur-sm py-2.5 text-center text-[13px] font-bold text-white cursor-pointer hover:bg-white/30 transition-colors">
                    Start Using Dr. Agent
                  </div>
                </div>
              </div>

              {/* Right — Tutorial video + quick start */}
              <div className="bg-white px-6 py-6 flex flex-col">
                {/* Close button (right side) */}
                <div className="flex justify-end mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[14px] cursor-pointer hover:bg-slate-200 transition-colors">&#10005;</div>
                </div>

                <h3 className="text-[16px] font-bold text-slate-800 mb-1">See How Dr. Agent Works</h3>
                <p className="text-[11px] text-slate-500 mb-4">Watch a quick walkthrough before you start.</p>

                {/* Video placeholder */}
                <div className="rounded-xl overflow-hidden mb-4 flex-1 min-h-[180px]" style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)" }}>
                  <div className="relative h-full flex flex-col items-center justify-center px-4 py-6">
                    <div className="absolute top-3 left-3">
                      <span className="rounded bg-white/80 px-2 py-0.5 text-[9px] font-bold text-slate-600">OPD Billing</span>
                    </div>
                    {/* Play button */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 shadow-xl cursor-pointer hover:scale-105 transition-transform mb-3">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <p className="text-[18px] font-bold text-slate-800 leading-tight text-center">How<br />Dr. Agent<br />Works?</p>
                    <div className="absolute bottom-3 right-3">
                      <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">04:02</span>
                    </div>
                  </div>
                </div>

                {/* Quick start tips */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick start</p>
                  <div className="space-y-2">
                    {[
                      { step: "1", text: "Open any patient from your queue" },
                      { step: "2", text: "Click the Dr. Agent tab in the sidebar" },
                      { step: "3", text: "Tap a pill or type your question" },
                    ].map(tip => (
                      <div key={tip.step} className="flex items-center gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-violet-100 text-[10px] font-bold text-violet-700">{tip.step}</span>
                        <span className="text-[11px] text-slate-600">{tip.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Callout tone="emerald" label="Success modal UX rules">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Celebration tone with green gradient and party emoji — the doctor just made a positive decision.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Trial expiry date shown upfront so there are no surprises. Full transparency builds trust.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Tutorial video on the right gives the doctor immediate context on how to use the feature — reduces first-session confusion.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />The modal has a close button (X) on both panels — the doctor can dismiss anytime and start exploring on their own.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Quick start tips at the bottom provide a 3-step getting-started guide so the doctor knows exactly what to do next.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />"Start Using Dr. Agent" CTA on the left panel closes the modal and opens the Dr. Agent panel directly.</li>
            </ul>
          </Callout>

          {/* Flow diagram: what happens after closing */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">After closing the success modal</p>
            <div className="flex items-center gap-2 flex-wrap">
              {["Doctor closes modal", "Dr. Agent tab appears in sidebar", "Green 'Trial: 3 days' badge visible", "FAB on right edge of RxPad", "Full Dr. Agent features enabled"].map((step, i) => (
                <React.Fragment key={step}>
                  <span className={`rounded-lg px-3 py-1.5 text-[10px] font-medium ${i === 0 ? "border border-slate-200 bg-slate-50 text-slate-600" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{step}</span>
                  {i < 4 && <span className="text-slate-300 text-[14px]">&#8594;</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      {/* ═══ Section 4: Discovery Touchpoints ═══ */}
      <DocSection number="4" title="Discovery Touchpoints" subtitle="Three primary channels through which doctors discover Dr. Agent. Each touchpoint funnels into the AI Suit page.">
        <div className="space-y-4">
          {/* Discovery flow overview */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Discovery funnel</p>
            <div className="flex items-center gap-2 flex-wrap">
              {["AI Hub Icon (Top Nav)", "In-App Notification", "Sidebar Nav Item"].map((step, i) => (
                <React.Fragment key={step}>
                  <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-700">{step}</span>
                  {i < 2 && <span className="text-slate-300 text-[14px]">&#8594;</span>}
                </React.Fragment>
              ))}
              <span className="text-slate-300 text-[14px]">&#8594;</span>
              <span className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">AI Suit Page</span>
              <span className="text-slate-300 text-[14px]">&#8594;</span>
              <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">Free Trial</span>
            </div>
          </div>

          {/* Touchpoint cards */}
          {DISCOVERY_TOUCHPOINTS.map((tp, i) => (
            <div key={tp.id} className={`rounded-xl border border-slate-200 border-l-[3px] ${tp.color} bg-white overflow-hidden`}>
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100 text-[10px] font-bold text-violet-700">{i + 1}</span>
                  <span className="text-[13px] font-semibold text-slate-800">{tp.title}</span>
                  {tp.figma && <code className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">Figma: {tp.figma}</code>}
                </div>
                <p className="text-[10px] text-slate-400 mb-2">Location: {tp.location}</p>
                <p className="text-[11px] text-slate-600 leading-[1.55] mb-3">{tp.description}</p>

                {/* Specs */}
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 overflow-hidden">
                  <table className="min-w-full text-[11px]">
                    <tbody>
                      {tp.specs.map(spec => (
                        <tr key={spec.label} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-1.5 font-semibold text-slate-700 w-28">{spec.label}</td>
                          <td className="px-3 py-1.5 text-slate-500 font-mono text-[10px]">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Action:</span>
                  <span className="text-[10px] text-violet-600 font-medium">{tp.action}</span>
                </div>
              </div>
            </div>
          ))}

          <Callout tone="blue" label="Design principle">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Discovery should feel organic — the AI Hub icon blends into the existing toolbar pattern.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Red dot badge is the only attention grabber. No pop-ups, no modals during normal workflow.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />Salespeople may also introduce the feature. The in-app notification is the digital equivalent of that handoff.</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      {/* ═══ Section 5: AI Suit Page ═══ */}
      <DocSection number="5" title="AI Suit Page" subtitle="The central hub listing all AI features available in TatvaPractice. Doctor Agent appears first with a promotional banner.">
        <div className="space-y-4">
          {/* Page header mockup */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
              <span className="text-slate-400 text-[14px]">&#8592;</span>
              <span className="text-[14px] font-bold text-slate-800">AI Suit</span>
              <code className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">Figma: 257:11370</code>
            </div>

            <div className="p-4 space-y-3">
              {AI_SUIT_FEATURES.map(feature => (
                <div key={feature.id} className={`rounded-xl border ${feature.highlighted ? "border-violet-200 bg-violet-50/20" : "border-slate-200 bg-white"} px-4 py-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    {/* Icon placeholder */}
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: feature.highlighted ? "linear-gradient(135deg, rgba(213,101,234,0.18) 0%, rgba(139,92,246,0.22) 50%, rgba(103,58,172,0.18) 100%)" : "#f1f1f5" }}>
                      <svg width="14" height="14" viewBox="4 4 16 16" fill="none"><path d="M18.08 11.61C18.45 11.66 18.45 12.34 18.08 12.39C14.1 12.96 12.96 14.1 12.39 18.08C12.34 18.45 11.66 18.45 11.61 18.08C11.04 14.1 9.9 12.96 5.92 12.39C5.55 12.34 5.55 11.66 5.92 11.61C9.9 11.04 11.04 9.9 11.61 5.92C11.66 5.55 12.34 5.55 12.39 5.92C12.96 9.9 14.1 11.04 18.08 11.61Z" fill={feature.highlighted ? "#673AAC" : "#717179"} /></svg>
                    </span>
                    <span className="text-[13px] font-bold text-slate-800">{feature.name}</span>
                    {feature.badge && (
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold text-white ${feature.badgeColor}`}>{feature.badge}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-[1.5] mb-2">{feature.description}</p>

                  {/* Promotion banner */}
                  {feature.promotion && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 mb-3 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-800 font-medium">{feature.promotion.text} <span className="text-[13px]">&#127881;</span></span>
                      <span className={`rounded-md ${feature.promotion.ctaColor} px-2.5 py-1 text-[10px] font-bold text-white`}>{feature.promotion.ctaText}</span>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex gap-2">
                    {feature.ctas.map(cta => (
                      <span key={cta.label} className={`rounded-lg px-4 py-1.5 text-[11px] font-semibold ${
                        cta.variant === "filled"
                          ? "bg-violet-600 text-white"
                          : "border border-slate-300 bg-white text-slate-700"
                      }`}>{cta.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Callout tone="emerald" label="Promotion banner rules">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Promotion banner only shows for features with an active free trial offer.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />Once trial is activated, the banner changes to show remaining days.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-400" />After trial expires, the banner shows the expired state with upgrade CTA.</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      {/* ═══ Section 6: Know More Page ═══ */}
      <DocSection number="6" title="Know More Page" subtitle="Detailed information page with 3 tabs. Shows different footer CTAs based on trial state (active vs expired).">
        <div className="space-y-4">
          {/* Tab selector mockup */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50/60 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
              <span className="text-slate-400 text-[14px]">&#8592;</span>
              <span className="text-[14px] font-bold text-slate-800">Dr. Agent</span>
            </div>
            <div className="border-b border-slate-100">
              <div className="flex gap-0 px-4">
                {KNOW_MORE_TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveKnowMoreTab(tab.id)}
                    className={`relative px-4 py-2.5 text-[12px] font-medium transition-colors ${
                      activeKnowMoreTab === tab.id ? "text-violet-700" : "text-slate-400 hover:text-slate-600"
                    }`}>
                    {tab.label}
                    {activeKnowMoreTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-violet-600" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-4">
              {KNOW_MORE_TABS.map(tab => (
                activeKnowMoreTab === tab.id && (
                  <div key={tab.id}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1">{tab.label}</p>
                    <p className="text-[11px] text-slate-600 leading-[1.55]">{tab.description}</p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Two states side by side */}
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Active trial footer */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">Footer — Trial Active</p>
              <code className="text-[9px] text-slate-400">Figma: 257:17237</code>
              <div className="mt-2 rounded-lg bg-emerald-100 border border-emerald-200 px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] text-emerald-800 font-medium">Just for you! Get 3 days free trial <span className="text-[13px]">&#127881;</span></span>
                <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">Get Free Trial</span>
              </div>
              <div className="mt-2 flex gap-2">
                <span className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-[11px] font-semibold text-slate-700">Request a call back</span>
                <span className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-center text-[11px] font-semibold text-white">Get Unlimited Access</span>
              </div>
            </div>

            {/* Expired footer */}
            <div className="rounded-xl border border-red-200 bg-red-50/30 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-2">Footer — Trial Expired</p>
              <code className="text-[9px] text-slate-400">Figma: 257:17594</code>
              <div className="mt-2 text-center py-2">
                <p className="text-[12px] text-red-600 font-semibold">Your <strong>Dr. Agent</strong> has expired.</p>
                <p className="text-[11px] text-red-500">Upgrade now to continue a hassle free experience!</p>
              </div>
              <div className="mt-2 flex gap-2">
                <span className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-[11px] font-semibold text-slate-700">Request a call back</span>
                <span className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-center text-[11px] font-semibold text-white">Get Unlimited Access</span>
              </div>
            </div>
          </div>
        </div>
      </DocSection>

      {/* ═══ Section 7: Trial Lifecycle ═══ */}
      <DocSection number="7" title="Trial Lifecycle" subtitle="Complete state machine for the trial period. Each state has specific UI indicators and available actions.">
        <div className="space-y-3">
          {TRIAL_STATES.map((ts, i) => (
            <div key={ts.state} className="relative">
              {/* Connecting line */}
              {i < TRIAL_STATES.length - 1 && (
                <div className="absolute left-[9px] top-[36px] bottom-[-12px] w-[2px] bg-slate-200" />
              )}
              <div className={`rounded-xl border border-slate-200 border-l-[3px] ${ts.borderColor} ${ts.bg} px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white" style={{ backgroundColor: ts.color }}>
                    <span className="text-[8px] font-bold text-white">{i + 1}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800">{ts.label}</span>
                  <span className="ml-auto rounded px-1.5 py-0.5 text-[9px] font-mono" style={{ backgroundColor: ts.color + "18", color: ts.color }}>{ts.state}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1.5 ml-[26px]">Trigger: {ts.trigger}</p>
                <p className="text-[11px] text-slate-600 leading-[1.55] ml-[26px] mb-2">{ts.description}</p>
                <div className="ml-[26px] flex flex-wrap gap-1">
                  {ts.uiElements.map(el => (
                    <span key={el} className="rounded bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">{el}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Callout tone="amber" label="Edge cases">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />If trial expires mid-consultation, do NOT show the expired modal immediately. Wait until the consultation ends or the doctor navigates away.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />The 7-day extension is a one-time offer. After the extension expires, only "Get Unlimited Access" and "Request a call back" are available.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-amber-400" />If doctor closes the expired modal without taking action, the Dr. Agent panel shows a persistent locked overlay with the same CTAs.</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      {/* ═══ Section 8: Expired Modal & Locked State ═══ */}
      <DocSection number="8" title="Expired Modal & Locked State" subtitle="Full-screen overlay shown when the trial expires. Designed to convert while being respectful of the doctor's workflow.">
        <div className="space-y-4">
          {/* Modal mockup */}
          <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left side */}
              <div className="px-6 py-8 text-white">
                <h4 className="text-[22px] font-bold mb-2">Your free trial<br />has Expired!</h4>
                <p className="text-[12px] opacity-80 mb-4">Your <strong>free trial</strong> has expired <strong>3 days</strong> ago.<br />Upgrade now to continue a hassle free access!</p>
                <div className="rounded-lg bg-amber-400/90 px-4 py-3 mb-2">
                  <p className="text-[11px] font-bold text-amber-900 mb-0.5">Wait! Just for You...</p>
                  <p className="text-[10px] text-amber-800">Need more time? Extend your free trial by <strong>7 days</strong> — limited-time only!</p>
                </div>
                <span className="inline-block rounded-lg bg-red-500 px-4 py-2 text-[12px] font-bold text-white mt-1">Extend Your Free Trial</span>
              </div>
              {/* Right side */}
              <div className="bg-white px-6 py-8 rounded-tl-2xl">
                <h4 className="text-[16px] font-bold text-slate-800 mb-1">Don't Lose Your Digital Advantage!</h4>
                <p className="text-[11px] text-slate-500 mb-4">Upgrade your plan to continue</p>
                <div className="space-y-2 mb-4">
                  {EXPIRED_MODAL_BENEFITS.map(benefit => (
                    <div key={benefit} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-[10px]">&#10003;</span>
                      <span className="text-[11px] text-slate-600">{benefit}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-violet-600 font-medium mb-4">Upgrade now and get an exclusive <strong>20% off</strong>.</p>
                <div className="flex gap-2">
                  <span className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-[11px] font-semibold text-slate-700">Request a call back</span>
                  <span className="flex-1 rounded-lg bg-violet-600 px-3 py-2.5 text-center text-[11px] font-semibold text-white">Get Unlimited Access</span>
                </div>
                <p className="mt-3 text-center text-[10px] text-slate-400">Contact Support: +91-9974042363 | Support@tatvacare.in</p>
              </div>
            </div>
          </div>
          <code className="text-[9px] text-slate-400">Figma: 257:10601</code>

          <Callout tone="rose" label="Locked state behavior">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-rose-400" />After closing the expired modal, Dr. Agent panel shows a semi-transparent locked overlay.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-rose-400" />The DrAgentFab on the right edge remains visible but clicking it re-shows the expired modal.</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-rose-400" />Pills and canned messages are not generated. Chat input is disabled with placeholder text: "Upgrade to continue using Dr. Agent".</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      {/* ═══ Section 9: Conversion CTAs ═══ */}
      <DocSection number="9" title="Conversion CTAs" subtitle="All call-to-action buttons across the FTUX flow, their behavior, and where they appear.">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[10px]">
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400 w-40">CTA</th>
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400">Behavior</th>
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-wider text-slate-400 w-48">Locations</th>
                </tr>
              </thead>
              <tbody>
                {CONVERSION_CTAS.map(item => (
                  <tr key={item.cta} className="border-b border-slate-50 align-top">
                    <td className="px-4 py-2.5">
                      <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-semibold ${item.color}`}>{item.cta}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 leading-[1.55]">{item.behavior}</td>
                    <td className="px-4 py-2.5">
                      <div className="space-y-0.5">
                        {item.locations.map(loc => (
                          <p key={loc} className="text-[10px] text-slate-500">{loc}</p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout tone="blue" label="Analytics events to track">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" /><code className="bg-blue-100 px-1 rounded text-[10px]">dr_agent_discovery_click</code> — Doctor clicks AI Hub icon or notification</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" /><code className="bg-blue-100 px-1 rounded text-[10px]">dr_agent_trial_activated</code> — Doctor activates free trial</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" /><code className="bg-blue-100 px-1 rounded text-[10px]">dr_agent_trial_expired</code> — Trial period ends</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" /><code className="bg-blue-100 px-1 rounded text-[10px]">dr_agent_trial_extended</code> — Doctor extends trial by 7 days</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" /><code className="bg-blue-100 px-1 rounded text-[10px]">dr_agent_upgrade_clicked</code> — Doctor clicks "Get Unlimited Access"</li>
              <li className="flex items-start gap-2 text-[11px]"><span className="dot mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" /><code className="bg-blue-100 px-1 rounded text-[10px]">dr_agent_callback_requested</code> — Doctor requests a call back</li>
            </ul>
          </Callout>
        </div>
      </DocSection>

    </div>
  )
}

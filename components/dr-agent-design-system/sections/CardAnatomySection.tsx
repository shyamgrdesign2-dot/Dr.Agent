"use client"

import React from "react"
import { CardShell } from "@/components/tp-rxpad/dr-agent/cards/CardShell"
import { DataRow } from "@/components/tp-rxpad/dr-agent/cards/DataRow"
import { CheckboxRow } from "@/components/tp-rxpad/dr-agent/cards/CheckboxRow"
import { RadioRow } from "@/components/tp-rxpad/dr-agent/cards/RadioRow"
import { InsightBox } from "@/components/tp-rxpad/dr-agent/cards/InsightBox"
import { SectionTag } from "@/components/tp-rxpad/dr-agent/cards/SectionTag"
import { ChatPillButton } from "@/components/tp-rxpad/dr-agent/cards/ActionRow"
import { SidebarLink } from "@/components/tp-rxpad/dr-agent/cards/SidebarLink"
import { Activity } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Card Anatomy Section — Generic card blueprint + all primitives
// ─────────────────────────────────────────────────────────────

function SpecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 mt-4 flex items-center gap-2">
      <div className="h-[2px] w-3 rounded-full bg-tp-violet-500" />
      <span className="text-[11px] font-semibold text-tp-violet-600">{children}</span>
    </div>
  )
}

function SpecNote({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[10px] text-tp-slate-400 leading-[1.5] pl-5">{children}</p>
}

function CardPreview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-2 text-[13px] font-semibold text-tp-slate-700">{title}</h4>
      <div className="w-full max-w-[380px]">
        {children}
      </div>
    </div>
  )
}

export function CardAnatomySection() {
  return (
    <section id="card-anatomy" className="mb-12">
      <h2 className="mb-2 text-[20px] font-bold text-tp-slate-800">
        Card Anatomy Blueprint
      </h2>
      <p className="mb-6 text-[12px] text-tp-slate-500">
        Every AI response card follows this universal structure. Mix and match content primitives to create any new card type.
      </p>

      {/* ── ASCII Blueprint ── */}
      <div className="mb-8 overflow-x-auto rounded-[10px] bg-tp-slate-800 px-5 py-4 font-mono text-[11px] leading-[1.6] text-green-400">
        <pre>{`┌─ Card (rounded-14, gradient border) ─────────────────────────┐
│  HEADER (blue-50 gradient top, border-bottom slate-50)       │
│  [Icon 26×26] [Title 12px] [Date 10px] [📋] → [Badge] [▼▲] │
│  ↑ Fill icon goes AGAINST the heading, not as a CTA          │
├──────────────────────────────────────────────────────────────┤
│  CONTENT AREA (px-3 py-[10px])                               │
│  Supports any combination of:                                │
│  • DataRow    — label + unit + value + flag + ref range      │
│  • CheckboxRow — label + checkbox + rationale                │
│  • RadioRow   — label + radio + detail                       │
│  • SectionTag  — icon + label (clickable)                    │
│  • InsightBox  — 4 variants (red / amber / purple / teal)    │
│  • Tables, Charts, Lists, Custom React nodes                 │
├──────────────────────────────────────────────────────────────┤
│  CANNED MESSAGES (horizontal scroll, gap-1)                  │
│  [ChatPill] [ChatPill] [ChatPill]                            │
│  ↑ Always above footer. If no footer, these sit at bottom.   │
├──────────────────────────────────────────────────────────────┤
│  FOOTER (blue gradient bottom, border-top slate-50)          │
│  Max 2 CTAs with vertical divider in center:                 │
│  [View full report]  │  [Explore details]                    │
│  ↑ rounded-10, no bg, text-only TP style                    │
│  Divider: 1px × 20px, gradient (transparent→slate→transparent)│
│  1 CTA → show navigation arrow (→) beside the CTA text      │
│  2 CTAs → NO arrow, just text-only CTAs with divider         │
└──────────────────────────────────────────────────────────────┘`}</pre>
      </div>

      {/* ── Live Full Card Example ── */}
      <CardPreview title="Full Card Example (all zones)">
        <CardShell
          icon={<Activity size={15} />}
          title="Lab Panel Results"
          date="05 Mar'26"
          badge={{ label: "3 flagged", color: "#DC2626", bg: "#FEF2F2" }}
          copyAll={() => {}}
          copyAllTooltip="Fill to RxPad"
          actions={
            <>
              <ChatPillButton label="Compare prev" />
              <ChatPillButton label="Show HbA1c trend" />
              <ChatPillButton label="Suggest next steps" />
            </>
          }
          sidebarLink={
            <div className="flex items-center">
              <button type="button" className="flex-1 inline-flex items-center justify-center gap-[4px] rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60">
                View full report
              </button>
              <div className="h-[20px]" style={{ width: "1px", background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }} />
              <button type="button" className="flex-1 inline-flex items-center justify-center gap-[4px] rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60">
                Explore details
              </button>
            </div>
          }
        >
          <DataRow label="HbA1c" unit="%" value="8.1" flag="high" refRange="<7%" />
          <DataRow label="Fasting Glucose" unit="mg/dL" value="168" flag="high" refRange="70-100" />
          <DataRow label="Vitamin D" unit="ng/mL" value="18" flag="low" refRange="30-100" isLast />
          <InsightBox variant="amber">HbA1c trending up — glycemic control needs attention</InsightBox>
        </CardShell>
      </CardPreview>

      {/* ── Individual Primitives ── */}
      <h3 className="mb-4 mt-8 text-[16px] font-bold text-tp-slate-800 border-b border-tp-slate-100 pb-2">
        Content Primitives
      </h3>

      {/* DataRow */}
      <SpecLabel>DataRow</SpecLabel>
      <SpecNote>Label + optional unit + value + optional flag indicator. Used for lab results, vitals, measurements. Flags: high (↑ red) / low (↓ red) / normal (black).</SpecNote>
      <CardPreview title="">
        <div className="rounded-[8px] border border-tp-slate-100 px-3 py-2">
          <DataRow label="Hemoglobin" unit="g/dL" value="11.2" flag="low" refRange="12-16" />
          <DataRow label="WBC" unit="/µL" value="12,400" flag="high" refRange="4000-11000" />
          <DataRow label="Platelets" unit="L" value="2.1" refRange="1.5-4.0" isLast />
        </div>
      </CardPreview>

      {/* CheckboxRow */}
      <SpecLabel>CheckboxRow</SpecLabel>
      <SpecNote>Selectable items with optional rationale. Used for DDX options, investigations, advice items. AccentColor customizable per card.</SpecNote>
      <CardPreview title="">
        <div className="rounded-[8px] border border-tp-slate-100 px-3 py-2">
          <CheckboxRow label="CBC with ESR" rationale="Fever workup" checked />
          <CheckboxRow label="Chest X-Ray PA" rationale="Rule out pneumonia" />
          <CheckboxRow label="CRP" rationale="Inflammatory marker" accentColor="#EF4444" isLast />
        </div>
      </CardPreview>

      {/* RadioRow */}
      <SpecLabel>RadioRow</SpecLabel>
      <SpecNote>Single-select options. Used for follow-up scheduling, question responses. Recommended item shown with badge.</SpecNote>
      <CardPreview title="">
        <div className="rounded-[8px] border border-tp-slate-100 px-3 py-2">
          <RadioRow name="follow-up-demo" label="3 days" detail="Review CBC" checked />
          <RadioRow name="follow-up-demo" label="1 week" detail="Post-fever check" />
          <RadioRow name="follow-up-demo" label="2 weeks" detail="HbA1c recheck" isLast />
        </div>
      </CardPreview>

      {/* SectionTag */}
      <SpecLabel>SectionTag</SpecLabel>
      <SpecNote>Inline tag chips for section headers. Two variants: default (neutral slate bg + text) and specialty (violet bg + text). Every SectionTag MUST include an icon from TPMedicalIcon library. For specialty/violet tags, the icon must use the same violet token as the text. Has hover shade. Clicking navigates to that data section in the sidebar.</SpecNote>
      <CardPreview title="">
        <div className="flex flex-wrap gap-2 rounded-[8px] border border-tp-slate-100 px-3 py-3">
          <SectionTag label="Vitals" icon="Heart Rate" />
          <SectionTag label="Symptoms" icon="Virus" />
          <SectionTag label="Diagnosis" icon="Diagnosis" />
          <SectionTag label="Medication" icon="Tablets" />
          <SectionTag label="Obstetric" icon="Obstetric" variant="specialty" />
          <SectionTag label="Gynec" icon="Gynec" variant="specialty" />
        </div>
      </CardPreview>

      {/* InsightBox */}
      <SpecLabel>InsightBox</SpecLabel>
      <SpecNote>Callout box for clinical insights. Four color variants for different severity/context.</SpecNote>
      <CardPreview title="">
        <div className="space-y-2 rounded-[8px] border border-tp-slate-100 px-3 py-3">
          <InsightBox variant="red">Critical — SpO₂ dropped below 95% threshold</InsightBox>
          <InsightBox variant="amber">HbA1c trending up — glycemic control worsening</InsightBox>
          <InsightBox variant="purple">Consider specialist referral for cardiac evaluation</InsightBox>
          <InsightBox variant="teal">All vitals within normal range — stable patient</InsightBox>
        </div>
      </CardPreview>

      {/* Canned Messages (ChatPills) */}
      <SpecLabel>Canned Messages (ChatPillButton)</SpecLabel>
      <SpecNote>AI gradient-styled pills for follow-up suggestions. These always sit ABOVE the footer. If no footer exists, they appear at the bottom of the card content.</SpecNote>
      <CardPreview title="">
        <div className="rounded-[8px] border border-tp-slate-100 px-3 py-3">
          <div className="flex flex-wrap gap-1">
            <ChatPillButton label="Compare prev" />
            <ChatPillButton label="Show HbA1c trend" />
            <ChatPillButton label="Suggest meds" />
            <ChatPillButton label="Drug interactions" />
          </div>
        </div>
      </CardPreview>

      {/* Footer CTAs */}
      <SpecLabel>Footer CTAs (Max 2, Divided)</SpecLabel>
      <SpecNote>Maximum 2 CTAs in the footer, separated by a gradient vertical divider. Left CTA + divider + right CTA. Use TP secondary/tertiary button style: rounded-10, no background, text-only. Fill icon goes in the header, NOT as a footer CTA. Arrow rule: 1 CTA → show navigation arrow (→) beside the CTA, 2 CTAs → no arrows.</SpecNote>

      {/* 2-CTA footer example */}
      <p className="mb-2 text-[10px] font-medium text-tp-slate-600 pl-5">2 CTAs — no navigation arrow:</p>
      <CardPreview title="">
        <div className="rounded-[8px] border border-tp-slate-100 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #FFFFFF 0%, rgba(59,130,246,0.04) 100%)" }}>
          <div className="flex items-center px-3 py-[10px]" style={{ borderTop: "0.5px solid var(--tp-slate-50, #F8FAFC)" }}>
            <button type="button" className="flex-1 inline-flex items-center justify-center rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60">
              View full report
            </button>
            <div className="h-[20px]" style={{ width: "1px", background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }} />
            <button type="button" className="flex-1 inline-flex items-center justify-center rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60">
              Explore details
            </button>
          </div>
        </div>
      </CardPreview>

      {/* 1-CTA footer example with navigation arrow */}
      <p className="mb-2 text-[10px] font-medium text-tp-slate-600 pl-5">1 CTA — with navigation arrow (→):</p>
      <CardPreview title="">
        <div className="rounded-[8px] border border-tp-slate-100 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #FFFFFF 0%, rgba(59,130,246,0.04) 100%)" }}>
          <div className="flex items-center justify-start px-3 py-[10px]" style={{ borderTop: "0.5px solid var(--tp-slate-50, #F8FAFC)" }}>
            <button type="button" className="group/link inline-flex items-center gap-[4px] rounded-[10px] py-[5px] px-2 text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60">
              <span>View full report</span>
              <svg width={10} height={10} viewBox="0 0 16 16" fill="none" className="flex-shrink-0 transition-transform duration-200 group-hover/link:translate-x-[2px]">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </CardPreview>

      {/* Spec annotation */}
      <div className="mt-2 mb-4 rounded-[8px] border border-tp-blue-100 bg-tp-blue-50 px-3 py-2">
        <p className="text-[10px] font-semibold text-tp-blue-700 mb-1">Footer Layout Rules</p>
        <ul className="space-y-[3px] text-[10px] text-tp-blue-600">
          <li>• Maximum <strong>2 CTAs</strong> per card footer</li>
          <li>• Vertical divider in center: <strong>1px × 20px</strong>, linear-gradient <code className="bg-white/60 px-1 rounded">transparent → #CBD5E1 → transparent</code></li>
          <li>• Left CTA: typically &quot;View full report&quot;</li>
          <li>• Right CTA: contextual action (e.g. &quot;Explore details&quot;, &quot;Track trends&quot;, &quot;View history&quot;)</li>
          <li>• Both CTAs: flex-1 centered, rounded-10, no bg, text-only TP secondary style</li>
          <li>• <strong>Arrow rule:</strong> 1 CTA → left-aligned, with navigation arrow (→) beside text. 2 CTAs → NO arrows, text-only, flex-1 centered.</li>
        </ul>
      </div>
    </section>
  )
}

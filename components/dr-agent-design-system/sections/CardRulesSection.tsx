"use client"

// ─────────────────────────────────────────────────────────────
// Card Rules Section — Structured rules for creating new cards
// ─────────────────────────────────────────────────────────────

function RuleBlock({ title, items, variant = "do" }: { title: string; items: string[]; variant?: "do" | "dont" | "rule" }) {
  const colors = {
    do: { bg: "bg-[#E8F6F6]", text: "text-[#0E7E7E]", bullet: "bg-[#0E7E7E]", border: "border-[#0E7E7E]/20" },
    dont: { bg: "bg-tp-error-50", text: "text-tp-error-700", bullet: "bg-tp-error-600", border: "border-tp-error-200" },
    rule: { bg: "bg-tp-blue-50", text: "text-tp-blue-700", bullet: "bg-tp-blue-500", border: "border-tp-blue-200" },
  }[variant]

  return (
    <div className={`rounded-[10px] border ${colors.border} ${colors.bg} px-4 py-3`}>
      <h4 className={`text-[13px] font-semibold ${colors.text} mb-2`}>{title}</h4>
      <ul className="space-y-[6px]">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] leading-[1.5]">
            <div className={`mt-[5px] h-[5px] w-[5px] flex-shrink-0 rounded-full ${colors.bullet}`} />
            <span className={colors.text}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CardRulesSection() {
  return (
    <section id="card-rules" className="mb-12">
      <h2 className="mb-2 text-[20px] font-bold text-tp-slate-800">
        Rules for Creating New Cards
      </h2>
      <p className="mb-6 text-[12px] text-tp-slate-500">
        Follow these rules to ensure any new card type looks native to the Dr. Agent design system.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <RuleBlock
          title="Required Structure"
          variant="rule"
          items={[
            "Every card MUST use CardShell as its wrapper component",
            "Header icon: 26×26px container, rounded-[8px], bg tp-blue-50",
            "Icon inside: TPMedicalIcon 15px in tp-blue-500 color (or Lucide icon 15px)",
            "Title: 12px font-semibold, max 200px width with truncate",
            "Collapse toggle: always present by default (collapsible=true)",
            "Card type must be added to the RxAgentOutput discriminated union in types.ts",
            "Card renderer case must be added to CardRenderer.tsx switch statement",
          ]}
        />

        <RuleBlock
          title="Content Area Rules"
          variant="rule"
          items={[
            "Use 12px as base font size for ALL content inside cards",
            "Text color: tp-slate-700 for body, tp-slate-800 for labels/headings",
            "Row separators: 0.5px solid tp-slate-50 (NOT full borders)",
            "Compose from primitives: DataRow, CheckboxRow, RadioRow, SectionTag, InsightBox",
            "For custom layouts: maintain 12px text, tp-slate-700 color, and existing spacing",
            "Add InsightBox at end of content for clinical context (choose appropriate variant)",
            "Fill payloads must conform to RxPadCopyPayload interface for RxPad sync",
          ]}
        />

        <RuleBlock
          title="Canned Messages & Footer CTAs"
          variant="rule"
          items={[
            "ChatPillButton (canned messages): AI-driven follow-up suggestions — always ABOVE the footer",
            "Fill functionality: use the copy icon (Copy) against the heading in the header — NOT as a CTA button",
            "Fill visibility rule: show fill controls only for newly generated data; hide for already-fetched historical data",
            "Historical exception: Last Visit may expose Fill to RxPad for quick carry-forward",
            "Destination label must be explicit: Fill to RxPad / Fill to Vitals / Fill to Medical History / Fill to Obstetric History, etc.",
            "RxPad destination is restricted to Symptoms, Examination, Diagnosis, Medication, Advice, Lab Investigation, Surgery, Additional Notes, and Follow-up",
            "Footer CTAs: Max 2 CTAs with gradient vertical divider (transparent→#CBD5E1→transparent, 1px × 20px)",
            "Left CTA: typically 'View full report' — right CTA: contextual (e.g. 'Explore details', 'Track trends')",
            "Use TP secondary/tertiary style: rounded-10, no background, text-only, flex-1 centered",
            "Arrow rule: 1 CTA → left-aligned with navigation arrow (→) beside the text. 2 CTAs → NO arrows, text-only, flex-1 centered",
            "ALL CTAs live in the footer zone — the footer is not just for sidebar links",
            "If no footer, canned messages sit at the bottom of the card content",
            "Always provide at least one relevant canned message for continuity",
            "AI gradient is ONLY for AI icon backgrounds (30% opacity) and AI icons (100% opacity)",
          ]}
        />

        <RuleBlock
          title="Graph Card Toggle Rules"
          variant="rule"
          items={[
            "Every graph/chart card MUST have a Graph/Text toggle (ViewToggle) — users must be able to view data in tabular text form too",
            "Graph cards MUST also have a Line/Bar chart type toggle (ChartTypeToggle) — small, iconless, sits on the right end",
            "Toggle row layout: ViewToggle (Graph|Text) left-aligned, ChartTypeToggle (Line|Bar) right-aligned, same row, mb-[6px]",
            "ChartTypeToggle is only visible when Graph mode is active — hidden in Text mode",
            "Both toggles match at 26px height, rounded-[7px], bg-tp-slate-100, sliding white indicator with shadow",
            "ViewToggle has mini SVG icons (line chart + text lines) + text labels. ChartTypeToggle is text-only (no icons)",
            "This toggle pattern eliminates the need for 'View line graph' / 'View bar chart' CTAs — handle it in-card",
            "Default chart type depends on card: VitalTrendsBarCard defaults to 'bar', VitalTrendsLineCard defaults to 'line', LabTrendsCard defaults to 'line'",
          ]}
        />

        <RuleBlock
          title="Color & Severity Rules"
          variant="rule"
          items={[
            "Flags: tp-error-600 for BOTH high (↑) and low (↓) values",
            "Severity: critical=tp-error, high=tp-warning, moderate=yellow, low=tp-slate",
            "InsightBox variants: red (danger), amber (warning), purple (info), teal (success)",
            "Specialty colors: GP=blue, Gynec=pink, Ophthal=teal, Obstetric=violet, Pedia=lightblue",
            "SectionSummaryBar / SectionTag: 30px row height, 18px icon, 14px semibold label; default fill tp-slate-100 at 70% opacity (bg-tp-slate-100/70); specialty variant = violet bg + text",
            "SectionTag rule: when tag text uses a specialty color (e.g., violet), icon color must match the same token",
            "Badge backgrounds should be subtle (50-level) with darker text (600-700 level)",
          ]}
        />

        <RuleBlock
          title="Do's"
          variant="do"
          items={[
            "Reuse existing primitives (DataRow, CheckboxRow, RadioRow) before building custom",
            "Keep cards collapsible — users will have many cards in a thread",
            "Use copyAll icon in header for structured data (diagnosis, meds, labs, advice)",
            "Add InsightBox with clinical context — doctors value quick insights",
            "Use SectionSummaryBar (full width) to introduce subsections; use SectionTag only for true inline tag+value rows",
            "Put max 2 CTAs in the footer with center gradient divider (fades at edges), TP secondary/tertiary style",
            "Use canned messages (ChatPills) above footer for AI follow-up suggestions",
            "Use badges to surface counts (e.g., '3 flagged', '5 overdue')",
            "Support feedback (thumbs up/down) via the chat bubble wrapper",
            "Use AI gradient ONLY at 30% opacity for icon bg, 100% for the icon itself",
          ]}
        />

        <RuleBlock
          title="Don'ts"
          variant="dont"
          items={[
            "No custom border styles — use the gradient border pattern from CardShell",
            "No font sizes > 14px inside card content area (14px is max for titles)",
            "No shadows within cards — only CardShell has the outer gradient shadow",
            "No padding overrides — use CardShell's built-in px-3 py-[10px]",
            "No hardcoded color hex values — always use tp-* token variables",
            "No inline styles for colors — use Tailwind classes mapped to design tokens",
            "Don't create cards without collapsible toggle (unless it's a text-only variant)",
            "Don't use more than one InsightBox per card — keep insights focused",
            "Don't put CopyButton or ExternalButton as separate CTAs — copy icon goes in the header",
            "Don't use AI gradient for non-AI elements — it's reserved for AI icons only",
            "Don't add AI icon prefix to PillBar — pills render directly without leading icon",
          ]}
        />
      </div>

      {/* Font Contract Summary */}
      <div className="mt-6 rounded-[10px] border border-tp-slate-200 bg-tp-slate-50 px-4 py-3">
        <h4 className="text-[13px] font-semibold text-tp-slate-800 mb-2">Quick Reference — Font Contract</h4>
        <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
          {[
            { size: "9px", use: "Ref ranges" },
            { size: "10px", use: "Meta, dates" },
            { size: "11px", use: "Pills, tags" },
            { size: "12px", use: "Body text" },
            { size: "14px", use: "Card title" },
            { size: "16px", use: "Header" },
          ].map((f) => (
            <div key={f.size} className="flex items-center gap-2">
              <span className="font-mono font-bold text-tp-blue-500">{f.size}</span>
              <span className="text-tp-slate-500">{f.use}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Contract */}
      <div className="mt-3 rounded-[10px] border border-tp-slate-200 bg-tp-slate-50 px-4 py-3">
        <h4 className="text-[13px] font-semibold text-tp-slate-800 mb-2">Quick Reference — Spacing Contract</h4>
        <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3">
          {[
            { px: "px-3 py-[10px]", use: "Content area" },
            { px: "py-[3px]", use: "DataRow" },
            { px: "py-[6px]", use: "CheckboxRow" },
            { px: "gap-1", use: "Action buttons" },
            { px: "gap-[6px]", use: "Header icon-to-title" },
            { px: "px-3 py-[11px]", use: "Header padding" },
          ].map((s) => (
            <div key={s.px} className="flex items-center gap-2">
              <code className="font-mono text-[10px] text-tp-violet-600 bg-tp-violet-50 px-1 rounded">{s.px}</code>
              <span className="text-tp-slate-500">{s.use}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Follow-up content panel — matches Figma DetailedSectionView (Follow-up).
 * Shows a date input with calendar icon and quick-select buttons.
 */
import React from "react";

// ─── Quick select chip ────────────────────────────────────────────────────────

function QuickChip({ label }: { label: string }) {
  return (
    <div className="bg-white h-[28px] relative rounded-[10px] shrink-0 cursor-pointer">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex h-full items-center justify-center px-[8px] py-[9px] relative">
          <p className="font-sans font-medium leading-[20px] not-italic relative shrink-0 text-tp-blue-500 text-[14px] tracking-[0.1px] whitespace-nowrap">
            {label}
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-tp-blue-500 border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

// ─── Calendar icon (SVG) ──────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="var(--tp-slate-700)" strokeWidth="1.2" />
      <path d="M2 8h16" stroke="var(--tp-slate-700)" strokeWidth="1.2" />
      <path d="M6 2v4M14 2v4" stroke="var(--tp-slate-700)" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="5" y="11" width="2" height="2" rx="0.5" fill="var(--tp-slate-700)" />
      <rect x="9" y="11" width="2" height="2" rx="0.5" fill="var(--tp-slate-700)" />
      <rect x="13" y="11" width="2" height="2" rx="0.5" fill="var(--tp-slate-700)" />
      <rect x="5" y="14" width="2" height="2" rx="0.5" fill="var(--tp-slate-700)" />
      <rect x="9" y="14" width="2" height="2" rx="0.5" fill="var(--tp-slate-700)" />
    </svg>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function FollowUpContent() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full overflow-y-auto">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[12px] relative w-full">
        {/* Date input */}
        <div className="content-stretch flex items-start relative shrink-0 w-full">
          <div className="bg-white flex-[1_0_0] h-[40px] min-h-px min-w-px relative rounded-[10px]">
            <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex gap-[10px] items-center justify-center px-[12px] py-[9px] relative size-full">
                <p className="flex-[1_0_0] font-sans font-normal leading-[normal] min-h-px min-w-px not-italic relative text-tp-slate-400 text-[14px] tracking-[0.1px] whitespace-pre-wrap">
                  Enter follow-up date
                </p>
                <CalendarIcon />
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-tp-slate-100 border-solid inset-0 pointer-events-none rounded-[10px]" />
          </div>
        </div>

        {/* Quick select chips */}
        <div className="content-stretch flex gap-[12px] h-[28px] items-start relative shrink-0 flex-wrap">
          <QuickChip label="2 days" />
          <QuickChip label="2 weeks" />
          <QuickChip label="2 Months" />
        </div>
      </div>
    </div>
  );
}

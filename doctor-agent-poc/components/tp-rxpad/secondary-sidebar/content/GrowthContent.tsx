/**
 * Growth content panel — date-based expandable cards.
 */
import React, { useState } from "react";
import clsx from "clsx";
import { ArrowSquareDown, ArrowSquareUp } from "iconsax-reactjs";
import { ActionButton, useStickyHeaderState } from "../detail-shared";
import { tpSectionCardStyle } from "../tokens";

type GrowthRow = { label: string; unit: string; value: string };
type GrowthEntry = { id: string; dateLabel: string; rows: GrowthRow[] };

const GROWTH_ENTRIES: GrowthEntry[] = [
  {
    id: "g-27",
    dateLabel: "Today (27 Jan'26)",
    rows: [
      { label: "Age", unit: "years", value: "3" },
      { label: "Height", unit: "cm", value: "130" },
      { label: "Weight", unit: "kg", value: "12.8" },
      { label: "BMI", unit: "kg/m²", value: "24.2" },
      { label: "OFC", unit: "cm", value: "49" },
    ],
  },
  {
    id: "g-26",
    dateLabel: "26 Jan'26",
    rows: [
      { label: "Age", unit: "years", value: "3" },
      { label: "Height", unit: "cm", value: "129.8" },
      { label: "Weight", unit: "kg", value: "12.6" },
      { label: "BMI", unit: "kg/m²", value: "24.0" },
      { label: "OFC", unit: "cm", value: "49" },
    ],
  },
  {
    id: "g-24",
    dateLabel: "24 Jan'26",
    rows: [
      { label: "Age", unit: "years", value: "3" },
      { label: "Height", unit: "cm", value: "129.5" },
      { label: "Weight", unit: "kg", value: "12.5" },
      { label: "BMI", unit: "kg/m²", value: "23.8" },
      { label: "OFC", unit: "cm", value: "48.8" },
    ],
  },
  {
    id: "g-22",
    dateLabel: "22 Jan'26",
    rows: [
      { label: "Age", unit: "years", value: "3" },
      { label: "Height", unit: "cm", value: "129.3" },
      { label: "Weight", unit: "kg", value: "12.4" },
      { label: "BMI", unit: "kg/m²", value: "23.7" },
      { label: "OFC", unit: "cm", value: "48.8" },
    ],
  },
  {
    id: "g-20",
    dateLabel: "20 Jan'26",
    rows: [
      { label: "Age", unit: "years", value: "3" },
      { label: "Height", unit: "cm", value: "129.1" },
      { label: "Weight", unit: "kg", value: "12.3" },
      { label: "BMI", unit: "kg/m²", value: "23.6" },
      { label: "OFC", unit: "cm", value: "48.7" },
    ],
  },
];

function SeeChartButton() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start p-[12px] relative shrink-0 w-full border-b border-tp-slate-100">
      <div className="h-[36px] relative shrink-0 w-full cursor-pointer rounded-[10px]">
        <div aria-hidden="true" className="absolute border border-tp-blue-500 border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[4px] items-center justify-center px-[15px] py-px relative size-full">
            <p className="font-sans font-medium leading-[22px] text-tp-blue-500 text-[14px] text-center whitespace-nowrap">
              See Chart
            </p>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M6 4l4 4-4 4" stroke="var(--tp-blue-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrowthDateCard({
  entry,
  expanded,
  onToggle,
}: {
  entry: GrowthEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { headerRef, isStuck } = useStickyHeaderState();

  return (
    <div className="relative shrink-0 w-full" style={tpSectionCardStyle}>
      <button
        ref={headerRef as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onToggle}
        className={clsx(
          "bg-tp-slate-100 sticky top-0 z-[2] shrink-0 w-full text-left",
          expanded
            ? isStuck
              ? "rounded-tl-none rounded-tr-none"
              : "rounded-tl-[10px] rounded-tr-[10px]"
            : "rounded-[10px]",
        )}
      >
        <div className="content-stretch flex items-center justify-between px-[10px] py-[8px] w-full">
          <p className="font-['Inter',sans-serif] font-semibold leading-[20px] text-tp-slate-700 text-[14px] whitespace-nowrap">
            {entry.dateLabel}
          </p>
          <div className="relative shrink-0 size-[18px]">
            {expanded ? (
              <ArrowSquareUp color="var(--tp-slate-500)" size={18} strokeWidth={1.5} variant="Linear" />
            ) : (
              <ArrowSquareDown color="var(--tp-slate-500)" size={18} strokeWidth={1.5} variant="Linear" />
            )}
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
          {entry.rows.map((row) => (
            <div
              key={`${entry.id}-${row.label}`}
              className="flex w-full items-center justify-between gap-3 bg-white px-[12px] py-[8px]"
            >
              <span className="min-w-0 flex-1 font-sans text-[14px] leading-[20px] text-tp-slate-700">
                {row.label} <span className="text-[14px] leading-[20px] text-tp-slate-400">({row.unit})</span>
              </span>
              <span className="shrink-0 text-right font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700 whitespace-nowrap">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function GrowthContent() {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROWTH_ENTRIES.map((entry, index) => [entry.id, index === 0]))
  );

  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <SeeChartButton />
      <div className="flex-[1_0_0] min-h-px min-w-px overflow-y-auto relative w-full" data-sticky-scroll-root="true">
        <div className="content-stretch flex flex-col gap-[12px] items-center p-[12px] relative w-full">
          {GROWTH_ENTRIES.map((entry) => (
            <GrowthDateCard
              key={entry.id}
              entry={entry}
              expanded={Boolean(expandedState[entry.id])}
              onToggle={() => {
                setExpandedState((prev) => ({
                  ...prev,
                  [entry.id]: !prev[entry.id],
                }));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

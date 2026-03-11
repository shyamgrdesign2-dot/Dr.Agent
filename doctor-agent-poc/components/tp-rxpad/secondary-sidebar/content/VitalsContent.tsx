/**
 * Vitals content panel with per-date accordion.
 * Each date can expand/collapse and provides mock values.
 */
import React, { useState } from "react";
import clsx from "clsx";
import { ArrowSquareDown, ArrowSquareUp } from "iconsax-reactjs";
import { ActionButton, useStickyHeaderState } from "../detail-shared";
import { tpSectionCardStyle } from "../tokens";
import { AiTriggerIcon } from "../../dr-agent/shared/AiTriggerIcon";

type VitalRow = {
  label: string;
  unit: string;
  value: string;
};

type VitalDateBlock = {
  id: string;
  dateLabel: string;
  rows: VitalRow[];
};

const VITALS_BY_DATE: VitalDateBlock[] = [
  {
    id: "today-27",
    dateLabel: "Today (27 Jan'26)",
    rows: [
      { label: "Temperature", unit: "Frh", value: "95" },
      { label: "Pulse", unit: "/min", value: "68" },
      { label: "Resp. Rate", unit: "/min", value: "18" },
      { label: "Systolic", unit: "mmhg", value: "120" },
      { label: "Diastolic", unit: "mmhg", value: "75" },
      { label: "SpO2", unit: "%", value: "98" },
      { label: "Height", unit: "cms", value: "172" },
      { label: "Weight", unit: "kgs", value: "68" },
      { label: "BMI", unit: "kg/m²", value: "23.0" },
      { label: "BMR", unit: "kcals", value: "1680" },
      { label: "BSA", unit: "m²", value: "1.82" },
    ],
  },
  {
    id: "d-26",
    dateLabel: "26 Jan'26",
    rows: [
      { label: "Temperature", unit: "Frh", value: "99.2" },
      { label: "Pulse", unit: "/min", value: "84" },
      { label: "Resp. Rate", unit: "/min", value: "20" },
      { label: "Systolic", unit: "mmhg", value: "124" },
      { label: "Diastolic", unit: "mmhg", value: "78" },
      { label: "SpO2", unit: "%", value: "97" },
      { label: "Weight", unit: "kgs", value: "68.4" },
      { label: "BMI", unit: "kg/m²", value: "23.1" },
    ],
  },
  {
    id: "d-24",
    dateLabel: "24 Jan'26",
    rows: [
      { label: "Temperature", unit: "Frh", value: "98.6" },
      { label: "Pulse", unit: "/min", value: "79" },
      { label: "Resp. Rate", unit: "/min", value: "18" },
      { label: "Systolic", unit: "mmhg", value: "118" },
      { label: "Diastolic", unit: "mmhg", value: "74" },
      { label: "SpO2", unit: "%", value: "99" },
      { label: "Weight", unit: "kgs", value: "68.0" },
      { label: "BMI", unit: "kg/m²", value: "22.9" },
    ],
  },
  {
    id: "d-22",
    dateLabel: "22 Jan'26",
    rows: [
      { label: "Temperature", unit: "Frh", value: "98.4" },
      { label: "Pulse", unit: "/min", value: "76" },
      { label: "Resp. Rate", unit: "/min", value: "17" },
      { label: "Systolic", unit: "mmhg", value: "116" },
      { label: "Diastolic", unit: "mmhg", value: "72" },
      { label: "SpO2", unit: "%", value: "99" },
      { label: "Weight", unit: "kgs", value: "67.8" },
      { label: "BMI", unit: "kg/m²", value: "22.8" },
    ],
  },
  {
    id: "d-20",
    dateLabel: "20 Jan'26",
    rows: [
      { label: "Temperature", unit: "Frh", value: "98.5" },
      { label: "Pulse", unit: "/min", value: "80" },
      { label: "Resp. Rate", unit: "/min", value: "18" },
      { label: "Systolic", unit: "mmhg", value: "119" },
      { label: "Diastolic", unit: "mmhg", value: "75" },
      { label: "SpO2", unit: "%", value: "98" },
      { label: "Weight", unit: "kgs", value: "68.2" },
      { label: "BMI", unit: "kg/m²", value: "23.0" },
    ],
  },
];

function VitalsDateCard({
  block,
  expanded,
  onToggle,
}: {
  block: VitalDateBlock;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { headerRef, isStuck } = useStickyHeaderState();

  return (
    <div className="relative shrink-0 w-full" style={tpSectionCardStyle}>
      <button
        type="button"
        ref={headerRef as React.Ref<HTMLButtonElement>}
        onClick={onToggle}
        className={clsx(
          "group bg-tp-slate-100 sticky top-0 z-[2] shrink-0 w-full text-left",
          expanded
            ? isStuck
              ? "rounded-tl-none rounded-tr-none"
              : "rounded-tl-[10px] rounded-tr-[10px]"
            : "rounded-[10px]",
        )}
      >
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[10px] py-[8px] relative w-full">
            <p className="font-['Inter',sans-serif] font-semibold leading-[20px] not-italic text-tp-slate-700 text-[14px] tracking-[0.012px] whitespace-nowrap">
              {block.dateLabel}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <AiTriggerIcon
                  tooltip="Analyze vitals"
                  signalLabel={`Analyze vitals for ${block.dateLabel}`}
                  sectionId="vitals"
                  size={12}
                  as="span"
                />
              </span>
              <div className="relative shrink-0 size-[18px]">
                {expanded ? (
                  <ArrowSquareUp color="var(--tp-slate-500)" size={18} strokeWidth={1.5} variant="Linear" />
                ) : (
                  <ArrowSquareDown color="var(--tp-slate-500)" size={18} strokeWidth={1.5} variant="Linear" />
                )}
              </div>
            </div>
          </div>
        </div>
      </button>

      {expanded
        ? block.rows.map((row) => (
            <div
              key={`${block.id}-${row.label}`}
              className="flex items-center justify-between bg-white px-[12px] py-[8px]"
            >
              <span className="font-sans text-[14px] leading-[20px] text-tp-slate-700">
                {row.label} <span className="text-[14px] leading-[20px] text-tp-slate-400">({row.unit})</span>
              </span>
              <span className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">{row.value}</span>
            </div>
          ))
        : null}
    </div>
  );
}

export function VitalsContent() {
  const [expandedByDate, setExpandedByDate] = useState<Record<string, boolean>>({
    "today-27": true,
    "d-26": false,
    "d-24": false,
    "d-22": false,
    "d-20": false,
  });

  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <ActionButton label="Add/Edit Details" icon="plus" />
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full overflow-y-auto" data-sticky-scroll-root="true">
        <div className="content-stretch flex flex-col gap-[12px] items-start p-[12px] w-full">
          {VITALS_BY_DATE.map((block) => (
            <VitalsDateCard
              key={block.id}
              block={block}
              expanded={Boolean(expandedByDate[block.id])}
              onToggle={() =>
                setExpandedByDate((prev) => ({
                  ...prev,
                  [block.id]: !prev[block.id],
                }))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

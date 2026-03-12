/**
 * Medical Records content panel — matches Figma DetailedSectionView (Medical Records).
 * Shows filter chips and stacked record cards with document thumbnails.
 */
import React, { useState } from "react";
import { Eye, EyeSlash, Import, NoteText, Trash } from "iconsax-reactjs";
import { MoreVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const imgImage = "/assets/254812c5250025b09cfb4d7901db6be9343f3ff7.png";
const imgEka111 = "/assets/afc7c9e55f8624dd8cba9c2017f7a975fba9d2d2.png";
const img10Px = "/assets/d3845f2c9996392b9c624116f1a98744aa11f42e.png";

// ─── Add New Records button ───────────────────────────────────────────────────

function AddRecordsButton() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start p-[12px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-tp-slate-100 border-b border-solid inset-0 pointer-events-none" />
      <div className="h-[36px] relative rounded-[10px] shrink-0 w-full cursor-pointer">
        <div aria-hidden="true" className="absolute border border-tp-blue-500 border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[4px] items-center justify-center px-[15px] py-px relative size-full">
            <div className="relative shrink-0 size-[24px]">
              <svg className="absolute block size-full" fill="none" viewBox="0 0 24 24">
                <path d="M6 12H18" stroke="var(--tp-blue-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                <path d="M12 18V6" stroke="var(--tp-blue-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="font-sans font-medium leading-[22px] not-italic relative shrink-0 text-tp-blue-500 text-[14px] text-center whitespace-nowrap">
              Add New Records
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

const FILTERS = ["All", "Pathology", "Radiology", "Prescription", "Other"] as const;
type FilterType = typeof FILTERS[number];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      className={`content-stretch flex h-[28px] items-center justify-center px-[12px] py-[6px] relative rounded-[8px] shrink-0 cursor-pointer ${active ? "bg-tp-slate-200" : "bg-white"}`}
      onClick={onClick}
    >
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${active ? "border-tp-slate-200" : "border-tp-slate-100"}`} />
      <p className="font-sans font-medium leading-[20px] not-italic relative shrink-0 text-tp-slate-700 text-[14px] tracking-[0.1px] whitespace-nowrap">
        {label}
      </p>
    </div>
  );
}

// ─── Three-dots icon ─────────────────────────────────────────────────────────

function DotsIcon() {
  return (
    <div className="flex items-center justify-center relative shrink-0 size-[16px]">
      <MoreVertical color="var(--tp-slate-500)" size={16} strokeWidth={1.5} />
    </div>
  );
}

// ─── Report icon ──────────────────────────────────────────────────────────────

function ReportIcon() {
  return (
    <div className="inline-flex size-[24px] items-center justify-center rounded-full bg-tp-slate-200/70">
      <NoteText color="var(--tp-slate-500)" size={14} strokeWidth={1.5} variant="Linear" />
    </div>
  );
}

const RECORD_ACTIONS = [
  { id: "view", label: "View", icon: Eye },
  { id: "download", label: "Download", icon: Import },
  { id: "hide", label: "Hide", icon: EyeSlash },
  { id: "delete", label: "Delete", icon: Trash },
] as const;

function RecordActionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="inline-flex items-center justify-center rounded-md p-1 hover:bg-tp-slate-100">
          <DotsIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[170px] rounded-[10px] border border-tp-slate-100">
        {RECORD_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem key={action.id} className="gap-2 text-tp-slate-700">
              <Icon color="var(--tp-violet-500)" size={16} variant="Bulk" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Record card ─────────────────────────────────────────────────────────────

type RecordVariant = "pathology-img" | "prescription-img" | "pdf" | "pathology-blank";

function RecordCard({
  type,
  label,
  date,
  note,
}: {
  type: RecordVariant;
  label: string;
  date: string;
  note: string;
}) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full overflow-hidden rounded-[10px] border border-tp-slate-100 bg-white">
      {/* Thumbnail */}
      <div className="h-[82px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full overflow-clip">
        <div
          aria-hidden="true"
          className="absolute border-tp-slate-100 border-solid inset-0 pointer-events-none rounded-tl-[10px] rounded-tr-[10px]"
          style={{ borderWidth: "0.5px", borderBottomWidth: 0 }}
        />
        {type === "pathology-img" && (
          <div className="w-full h-full bg-tp-slate-50 relative overflow-hidden">
            <img alt="pathology report" className="absolute inset-0 object-cover w-full h-full opacity-80 blur-[0.65px]" src={imgImage} />
          </div>
        )}
        {type === "prescription-img" && (
          <div className="w-full h-full bg-tp-slate-50 relative overflow-hidden">
            <img alt="prescription" className="absolute inset-0 object-cover w-full h-full" src={imgEka111} />
          </div>
        )}
        {type === "pdf" && (
          <div className="w-full h-full bg-tp-slate-100 relative overflow-hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-[4px] opacity-60">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="4" width="20" height="24" rx="2" fill="var(--tp-slate-300)" />
                <rect x="9" y="9" width="14" height="2" rx="1" fill="white" />
                <rect x="9" y="13" width="14" height="2" rx="1" fill="white" />
                <rect x="9" y="17" width="8" height="2" rx="1" fill="white" />
              </svg>
              <p className="font-sans text-tp-slate-400 text-[7px] leading-[10px] whitespace-nowrap">
                20240121_190912.pdf
              </p>
            </div>
          </div>
        )}
        {type === "pathology-blank" && (
          <div className="w-full h-full bg-tp-slate-50 relative overflow-hidden">
            <img alt="pathology report" className="absolute inset-0 object-cover w-full h-full opacity-80 blur-[0.65px]" src={imgImage} />
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="absolute right-[10px] top-[10px] inline-flex items-center justify-center rounded-md p-0.5 hover:bg-white/60"
              aria-label="View upload note"
            >
              <ReportIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="max-w-[220px] rounded-lg bg-tp-slate-900 px-2.5 py-1.5 text-[11px] leading-[16px] text-white">
            {note}
          </TooltipContent>
        </Tooltip>
      </div>
      {/* Label bar */}
      <div className="bg-tp-slate-200 relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
        <div
          aria-hidden="true"
          className="absolute border border-tp-slate-100 border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[10px]"
          style={{ borderWidth: "0.5px" }}
        />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[6px] relative w-full">
            <div className="content-stretch flex flex-col items-start not-italic relative shrink-0 text-tp-slate-700 tracking-[0.1px] w-[103px]">
              <p className="font-sans font-semibold leading-[20px] relative shrink-0 text-[14px]">{label}</p>
              <p className="font-sans font-normal leading-[20px] relative shrink-0 text-[14px] text-tp-slate-500">{date}</p>
            </div>
            <div className="flex items-center justify-center relative shrink-0">
              <RecordActionMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function MedicalRecordsContent() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <AddRecordsButton />
      {/* Filter chips */}
      <div className="bg-white content-start flex flex-wrap gap-[8px] items-start p-[12px] relative shrink-0 w-full">
        {FILTERS.map((f) => (
          <FilterChip key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
        ))}
      </div>
      {/* Record list */}
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full">
        <div className="overflow-x-clip overflow-y-auto size-full">
          <div className="content-stretch flex flex-col gap-[16px] items-start p-[12px] relative w-full">
            <RecordCard
              type="pathology-img"
              label="Pathology"
              date="10 Aug'26"
              note="Uploaded by Dr. Shyam: pathology panel from last follow-up."
            />
            <RecordCard
              type="prescription-img"
              label="Prescription"
              date="10 Aug'26"
              note="Scanned written prescription shared by patient at intake."
            />
            <RecordCard
              type="pdf"
              label="Prescription"
              date="10 Aug'26"
              note="Digitized PDF export generated from hospital EMR."
            />
            <RecordCard
              type="pathology-blank"
              label="Pathology"
              date="10 Aug'26"
              note="Follow-up pathology receipt uploaded by front desk."
            />
            <RecordCard
              type="pathology-img"
              label="Pathology"
              date="10 Aug'26"
              note="Previous lab copy attached for trend comparison."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

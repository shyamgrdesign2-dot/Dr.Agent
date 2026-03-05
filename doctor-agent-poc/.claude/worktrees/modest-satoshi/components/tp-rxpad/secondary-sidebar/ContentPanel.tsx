/**
 * Right content panel.
 * Contains a gradient section header + the scrollable section content.
 */
import React from "react";
import svgPaths from "./imports/svg-g7iuydxwol";

// ─── Content imports ──────────────────────────────────────────────────────────

import { DrAgentContent }          from "./content/DrAgentContent";
import { PastVisitsContent }        from "./content/PastVisitsContent";
import { VitalsContent }            from "./content/VitalsContent";
import { HistoryContent }           from "./content/HistoryContent";
import { GynecHistoryContent }      from "./content/GynecHistoryContent";
import { ObstetricHistoryContent }  from "./content/ObstetricHistoryContent";
import { VaccineContent }           from "./content/VaccineContent";
import { GrowthContent }            from "./content/GrowthContent";
import { MedicalRecordsContent }    from "./content/MedicalRecordsContent";
import { LabResultsContent }        from "./content/LabResultsContent";
import { PersonalNotesContent }     from "./content/PersonalNotesContent";
import { EmptyStateContent }        from "./content/EmptyStateContent";

import type { NavItemId } from "./types";
import { rxSidebarTokens } from "./tokens";

// ─── Section title map ────────────────────────────────────────────────────────

const SECTION_TITLES: Record<NavItemId, string> = {
  drAgent:       "Dr Agent",
  pastVisits:    "Past Visit",
  vitals:        "Vitals",
  history:       "History",
  ophthal:       "Ophthal",
  gynec:         "Gynec History",
  obstetric:     "Obstetric History",
  vaccine:       "Vaccination",
  growth:        "Growth",
  medicalRecords:"Medical Records",
  labResults:    "Lab Results",
  personalNotes: "Personal Notes",
};

// ─── Section header (gradient bar) ───────────────────────────────────────────

function SectionHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <div
      className="h-[40px] shrink-0 w-full relative"
      style={{ backgroundImage: "linear-gradient(101.381deg, rgb(55,54,166) 2.0111%, rgb(38,38,136) 83.764%)" }}
    >
      <div className="content-stretch flex gap-[24px] items-center px-[12px] py-[8px] relative size-full">
        {/* Title */}
        <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative">
          <p className={`${rxSidebarTokens.titleClass} not-italic relative shrink-0 text-white whitespace-nowrap`}>
            {title}
          </p>
        </div>
        {/* Filter / settings icon */}
        <button
          type="button"
          className="relative shrink-0 rounded-[4px] transition-opacity hover:opacity-80"
          onClick={onClose}
          aria-label="Collapse section panel"
        >
          <div className="content-stretch flex flex-col items-start p-[3.36px] relative">
            <div className="overflow-clip relative shrink-0 size-[17.28px]">
              <div className="absolute inset-[12.5%]">
                <div className="absolute inset-[-5.56%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.4 14.4">
                    <path d={svgPaths.p3558c040} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.44" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-[12.5%_62.5%_12.5%_37.5%]">
                <div className="absolute inset-[-5.56%_-0.72px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.44 14.4">
                    <path d="M0.72 0.72V13.68" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.44" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-[37.5%_33.33%_37.5%_54.17%]">
                <div className="absolute inset-[-16.67%_-33.33%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.6 5.76">
                    <path d={svgPaths.pcf85200} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.44" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Content switcher ─────────────────────────────────────────────────────────

function SectionContent({ activeId }: { activeId: NavItemId }) {
  switch (activeId) {
    case "drAgent":        return <DrAgentContent />;
    case "pastVisits":     return <PastVisitsContent />;
    case "vitals":         return <VitalsContent />;
    case "history":        return <HistoryContent />;
    case "gynec":          return <GynecHistoryContent />;
    case "obstetric":      return <ObstetricHistoryContent />;
    case "vaccine":        return <VaccineContent />;
    case "growth":         return <GrowthContent />;
    case "medicalRecords": return <MedicalRecordsContent />;
    case "labResults":     return <LabResultsContent />;
    case "personalNotes":  return <PersonalNotesContent />;
    case "ophthal":
    default:               return <EmptyStateContent sectionLabel={SECTION_TITLES[activeId]} />;
  }
}

// ─── Public export ────────────────────────────────────────────────────────────

type Props = {
  activeId: NavItemId;
  onClose?: () => void;
};

export function ContentPanel({ activeId, onClose }: Props) {
  return (
    <div className="bg-white content-stretch flex h-full w-[250px] min-w-[250px] max-w-[250px] shrink-0 flex-col items-center relative xl:w-[clamp(250px,26vw,350px)] xl:max-w-[350px]">
      <div aria-hidden="true" className={`absolute ${rxSidebarTokens.panelBorderClass} border-r border-solid inset-[0_-1px_0_0] pointer-events-none`} />
      <SectionHeader title={SECTION_TITLES[activeId]} onClose={onClose} />
      {/* flex-[1_0_0] + min-h-px → constrains height so inner overflow-y-auto works */}
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full">
        <div className="absolute inset-0 flex flex-col">
          <SectionContent activeId={activeId} />
        </div>
      </div>
    </div>
  );
}

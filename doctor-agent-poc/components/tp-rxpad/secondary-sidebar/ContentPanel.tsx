/**
 * Right content panel.
 * Contains a gradient section header + the scrollable section content.
 */
import React from "react";
import { SidebarLeft } from "iconsax-reactjs";

// ─── Content imports ──────────────────────────────────────────────────────────

// DrAgentContent removed — Dr.Agent lives in its own panel, not in the sidebar
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
import { SidebarPillBar } from "./SidebarPillBar";

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
        {/* Collapse icon */}
        <button
          type="button"
          className="text-white/80 transition-opacity hover:text-white"
          onClick={onClose}
          aria-label="Collapse section panel"
        >
          <SidebarLeft size={16} variant="Linear" />
        </button>
      </div>
    </div>
  );
}

// ─── Content switcher ─────────────────────────────────────────────────────────

function SectionContent({ activeId }: { activeId: NavItemId }) {
  switch (activeId) {
    // drAgent no longer in sidebar — falls through to pastVisits
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
          <div className="flex-1 overflow-y-auto">
            <SectionContent activeId={activeId} />
          </div>
          {/* Pill bar at bottom of every content panel */}
          <SidebarPillBar sectionId={activeId} />
        </div>
      </div>
    </div>
  );
}

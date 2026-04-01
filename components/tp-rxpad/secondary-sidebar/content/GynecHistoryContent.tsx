/**
 * Gynec History content panel — always-open section cards.
 */
import React from "react";
import {
  ActionButton,
  SectionCard,
  ContentRow,
  SectionScrollArea,
  Grey,
  Sep,
} from "../detail-shared";
import { AiTriggerIcon } from "../../dr-agent/shared/AiTriggerIcon";

type GynecSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const GYNEC_SECTIONS: GynecSection[] = [
  {
    id: "lmp",
    title: "LMP",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>LMP: </Grey><span>15 Feb&apos;26</span>
      </p>
    ),
  },
  {
    id: "menarche",
    title: "Menarche",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Age at: </Grey><span>13 years</span>
      </p>
    ),
  },
  {
    id: "cycle",
    title: "Cycle",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Type: </Grey><span>Irregular</span>
        <Sep />
        <Grey>Interval: </Grey><span>35-40 days</span>
      </p>
    ),
  },
  {
    id: "flow",
    title: "Flow",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Volume: </Grey><span>Heavy</span>
        <Sep />
        <Grey>Duration: </Grey><span>5 days</span>
        <Sep />
        <Grey>Clots: </Grey><span>Yes</span>
        <Sep />
        <Grey>Pads/day: </Grey><span>5</span>
      </p>
    ),
  },
  {
    id: "pain",
    title: "Pain",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Severity: </Grey><span>None</span>
        <Sep />
        <Grey>Occurrence: </Grey><span>Before Menses</span>
      </p>
    ),
  },
  {
    id: "lifecycle",
    title: "Lifecycle Hormonal Changes",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Stage: </Grey><span>Perimenopause</span>
      </p>
    ),
  },
  {
    id: "notes",
    title: "Notes",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        Patient reports good medication adherence and tracks cycles on mobile app.
      </p>
    ),
  },
];

export function GynecHistoryContent() {
  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <ActionButton label="Add/Edit Details" icon="plus" />
      <SectionScrollArea>
        {GYNEC_SECTIONS.map((section) => (
          <SectionCard
            key={section.id}
            title={section.title}
            hideChevron
            titleAddon={
              <AiTriggerIcon
                tooltip={`Summarize ${section.title.toLowerCase()}`}
                signalLabel={`Summarize ${section.title.toLowerCase()}`}
                sectionId="gynec"
                size={12}
              />
            }
          >
            <ContentRow>{section.content}</ContentRow>
          </SectionCard>
        ))}
      </SectionScrollArea>
    </div>
  );
}

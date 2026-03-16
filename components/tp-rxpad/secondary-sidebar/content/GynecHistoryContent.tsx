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
    id: "menarche",
    title: "Menarche",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Age at: </Grey>
        <span>12 years </span>
        <Sep />
        <Grey>Notes: </Grey>
        <span>Menarche reported at expected age with no early-cycle complications</span>
      </p>
    ),
  },
  {
    id: "cycle",
    title: "Cycle",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Type: </Grey>
        <span>Regular </span>
        <Sep />
        <Grey>Cycle Interval: </Grey>
        <span>28 days </span>
        <Sep />
        <Grey>Notes: </Grey>
        <span>Last three cycles regular, no missed cycle in past 6 months</span>
      </p>
    ),
  },
  {
    id: "flow",
    title: "Flow",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Volume: </Grey>
        <span>Moderate </span>
        <Sep />
        <Grey>No of pads per day: </Grey>
        <span>3 </span>
        <Sep />
        <Grey>Notes: </Grey>
        <span>No passage of clots reported in recent cycles</span>
      </p>
    ),
  },
  {
    id: "pain",
    title: "Pain",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>Level: </Grey>
        <span>Mild dysmenorrhea </span>
        <Sep />
        <Grey>Status: </Grey>
        <span>Intermittent </span>
        <Sep />
        <Grey>Notes: </Grey>
        <span>Improves with hydration and over-the-counter analgesics</span>
      </p>
    ),
  },
  {
    id: "lifecycle",
    title: "Lifecycle Hormonal Changes",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        <Grey>LA at: </Grey>
        <span>Not attained </span>
        <Sep />
        <Grey>LA type: </Grey>
        <span>NA </span>
        <Sep />
        <Grey>LA Notes: </Grey>
        <span>No menopausal symptoms currently reported</span>
      </p>
    ),
  },
  {
    id: "notes",
    title: "Notes",
    content: (
      <p className="whitespace-pre-wrap leading-[20px]">
        Patient reports good medication adherence and tracks cycles on mobile app.
        No intermenstrual bleeding or post-coital bleeding reported in recent visits.
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

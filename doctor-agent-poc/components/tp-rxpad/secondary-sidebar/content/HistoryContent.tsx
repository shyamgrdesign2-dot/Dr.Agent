/**
 * Medical History content panel — always-open section cards.
 */
import React from "react";
import { ActionButton, SectionCard } from "../detail-shared";
import { AiTriggerIcon } from "../../dr-agent/shared/AiTriggerIcon";

type HistoryItem = { name: string; detail?: string };
type Section = { id: string; title: string; items: HistoryItem[] };

const SECTIONS: Section[] = [
  {
    id: "medical",
    title: "Medical Conditions",
    items: [
      { name: "Type 2 Diabetes", detail: "Since: 2 years | Status: Active | HbA1c (27 Jan'26): 7.4%" },
      { name: "Hypertension", detail: "Since: 1 year | Status: Controlled | Home BP log reviewed" },
      { name: "Hypothyroidism", detail: "Since: 8 months | Status: Stable | TSH recheck advised in 6 weeks" },
    ],
  },
  {
    id: "allergies",
    title: "Allergies",
    items: [
      { name: "Dust Mite Allergy", detail: "Since: 1 year | Status: Active | Trigger: sweeping/closed spaces" },
      { name: "NSAID Sensitivity", detail: "Status: Suspected | Reaction: gastric discomfort" },
    ],
  },
  {
    id: "family",
    title: "Family History",
    items: [
      { name: "Diabetes Mellitus", detail: "Relatives: Father, Paternal Uncle | Early-onset pattern in family" },
      { name: "Cardiovascular Disease", detail: "Relative: Maternal Grandfather | MI at 62 years" },
    ],
  },
  {
    id: "mental",
    title: "Mental Health",
    items: [
      { name: "Stress", detail: "Work-related stress reported | Sleep hygiene counselling provided" },
      { name: "Mood", detail: "No depressive red flags on current screening" },
    ],
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    items: [
      { name: "Smoking", detail: "6 cigarettes/day | Counselling started | Quit target: 3 months" },
      { name: "Exercise", detail: "Walks 25 minutes/day | 5 days/week" },
      { name: "Sleep", detail: "Average 6 hours/night | Irregular bedtime on weekdays" },
    ],
  },
];

function HistoryCard({ title, items }: { title: string; items: HistoryItem[] }) {
  return (
    <SectionCard
      title={title}
      hideChevron
      titleAddon={
        <AiTriggerIcon
          tooltip={`Analyze ${title.toLowerCase()}`}
          signalLabel={`Analyze ${title}`}
          sectionId="history"
          size={12}
        />
      }
    >
      <div className="bg-white px-[12px] py-[12px] flex flex-col gap-[10px]">
        {items.map((item) => (
          <div key={`${title}-${item.name}`}>
            <p className="font-sans font-medium text-[14px] text-tp-slate-700 leading-[20px]">
              {item.name}
            </p>
            {item.detail ? (
              <p className="mt-[4px] font-sans text-[14px] text-tp-slate-400 leading-[20px]">
                {item.detail}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function HistoryContent() {
  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <ActionButton label="Add/Edit Details" icon="plus" />
      <div className="overflow-x-clip overflow-y-auto size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start p-[12px] w-full">
          {SECTIONS.map((section) => (
            <HistoryCard
              key={section.id}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

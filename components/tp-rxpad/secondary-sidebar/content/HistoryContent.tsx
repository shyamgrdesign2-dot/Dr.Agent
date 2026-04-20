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
      { name: "Type 2 Diabetes", detail: "2 years | Active" },
      { name: "Hypertension", detail: "5 years | Active" },
      { name: "Dyslipidemia", detail: "1 year | Active" },
    ],
  },
  {
    id: "allergies",
    title: "Allergies",
    items: [
      { name: "Dust", detail: "3 years | Active" },
      { name: "Ibuprofen", detail: "5 years | Active | Gastric intolerance" },
    ],
  },
  {
    id: "family",
    title: "Family History",
    items: [
      { name: "Diabetes Mellitus", detail: "Father, Paternal Uncle" },
      { name: "Hypertension", detail: "Mother" },
      { name: "Thyroid disorder", detail: "Mother, Maternal Grandmother" },
    ],
  },
  {
    id: "surgical",
    title: "Surgical History",
    items: [
      { name: "Appendectomy", detail: "2018 | Uncomplicated, laparoscopic" },
      { name: "Right knee arthroscopy", detail: "2022 | Meniscus tear repair, full recovery" },
    ],
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    items: [
      { name: "Smoking", detail: "10 years | Active | 6 cigarettes/day, quit target 3 months" },
      { name: "Alcohol", detail: "8 years | Active | Occasional, social drinking" },
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
          tooltip={`Summarize ${title.toLowerCase()}`}
          signalLabel={`Summarize ${title.toLowerCase()}`}
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

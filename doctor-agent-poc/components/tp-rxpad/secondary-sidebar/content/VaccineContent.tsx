/**
 * Vaccination content panel — expandable section cards.
 */
import React, { useState } from "react";
import {
  ActionButton,
  SectionCard,
  SectionScrollArea,
  Grey,
  Sep,
  Red,
} from "../detail-shared";
import { AiTriggerIcon } from "../../dr-agent/shared/AiTriggerIcon";

function VaccineItemRow({
  week,
  name,
  status,
  statusColor = "normal",
  givenDate = "14 Jan'26",
}: {
  week: string;
  name: string;
  status: string;
  statusColor?: "normal" | "due" | "overdue";
  givenDate?: string;
}) {
  const statusEl =
    statusColor === "overdue" ? <Red>{status}</Red> :
    statusColor === "due" ? <span className="text-tp-warning-500">{status}</span> :
    <span>{status}</span>;

  return (
    <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
      <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
        {week}
      </p>
      <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
        <span className="font-sans font-medium">{name}</span>
        <span>{" ("}</span>
        <Grey>Status: </Grey>
        {statusEl}
        <span className="text-tp-slate-300">{" | "}</span>
        <Grey>Given date: </Grey>
        <span>{givenDate} )</span>
      </p>
    </div>
  );
}

function GivenVaccineItem({
  name,
  givenDate = "14 Jan'25",
  dueDate = "14 Jan'26",
}: {
  name: string;
  givenDate?: string;
  dueDate?: string;
}) {
  return (
    <li className="list-disc ms-[18px] whitespace-pre-wrap text-[14px] leading-[20px] font-sans text-tp-slate-700">
      <span className="font-sans font-medium">{name}</span>
      <span>{" ("}</span>
      <Grey>Given date: </Grey>
      <span>{givenDate} </span>
      <Sep />
      <Grey>Brand: </Grey>
      <span>Pneumovax 23 Vaccine </span>
      <Sep />
      <Grey>Due date: </Grey>
      <span>{dueDate})</span>
    </li>
  );
}

function GivenVaccineGroup({ week, vaccines }: { week: string; vaccines: string[] }) {
  return (
    <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
      <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
        {week}
      </p>
      <ul className="font-sans text-[14px] text-tp-slate-700 flex flex-col gap-[4px]">
        {vaccines.map((v, i) => (
          <GivenVaccineItem key={`${week}-${v}-${i}`} name={v} />
        ))}
      </ul>
    </div>
  );
}

export function VaccineContent() {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({
    pending: true,
    upcoming: true,
    given: true,
  });

  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <ActionButton label="Add/Edit Details" icon="plus" />
      <SectionScrollArea>
        <SectionCard
          title="Pending Vaccine (4)"
          expanded={expandedState.pending}
          onToggle={() => setExpandedState((prev) => ({ ...prev, pending: !prev.pending }))}
          titleAddon={
            <AiTriggerIcon
              tooltip="Analyze pending vaccines"
              signalLabel="Analyze Pending Vaccines"
              sectionId="vaccine"
              size={12}
              as="span"
            />
          }
        >
          <VaccineItemRow week="12-18 Weeks" name="HPV 1" status="Due" statusColor="due" />
          <div className="w-full border-t border-tp-slate-100" />
          <VaccineItemRow week="18 Weeks" name="Tdap Booster" status="Due" statusColor="due" />
        </SectionCard>

        <SectionCard
          title="Upcoming Vaccine (2)"
          expanded={expandedState.upcoming}
          onToggle={() => setExpandedState((prev) => ({ ...prev, upcoming: !prev.upcoming }))}
          titleAddon={
            <AiTriggerIcon
              tooltip="Analyze upcoming vaccines"
              signalLabel="Analyze Upcoming Vaccines"
              sectionId="vaccine"
              size={12}
              as="span"
            />
          }
        >
          <VaccineItemRow week="13 Weeks" name="PPSV23" status="Overdue" statusColor="overdue" />
          <div className="w-full border-t border-tp-slate-100" />
          <VaccineItemRow week="20 Weeks" name="Influenza" status="Due in 2 weeks" />
        </SectionCard>

        <SectionCard
          title="Given Vaccine (20)"
          expanded={expandedState.given}
          onToggle={() => setExpandedState((prev) => ({ ...prev, given: !prev.given }))}
          titleAddon={
            <AiTriggerIcon
              tooltip="Analyze given vaccines"
              signalLabel="Analyze Given Vaccines"
              sectionId="vaccine"
              size={12}
              as="span"
            />
          }
        >
          <GivenVaccineGroup week="Birth" vaccines={["IPV B-1"]} />
          <div className="w-full border-t border-tp-slate-100" />
          <GivenVaccineGroup week="6 Weeks" vaccines={["DTP B1", "Hib B1"]} />
          <div className="w-full border-t border-tp-slate-100" />
          <GivenVaccineGroup week="10 Weeks" vaccines={["HEP A-2", "PPSV 23", "PPSV 23 (2)"]} />
          <div className="w-full border-t border-tp-slate-100" />
          <GivenVaccineGroup week="2-3 years" vaccines={["PPSV 23"]} />
        </SectionCard>
      </SectionScrollArea>
    </div>
  );
}

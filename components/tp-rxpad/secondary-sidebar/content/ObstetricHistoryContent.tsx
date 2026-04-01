/**
 * Obstetric History content panel — expandable sections.
 * Patient Info is intentionally non-collapsible (no chevron).
 */
import React, { useState } from "react";
import {
  ActionButton,
  SectionCard,
  ContentRow,
  SectionScrollArea,
  Grey,
  Sep,
} from "../detail-shared";
import { AiTriggerIcon } from "../../dr-agent/shared/AiTriggerIcon";

function PatientInfoCard() {
  return (
    <SectionCard
      title="Patient Info"
      hideChevron
      titleAddon={
        <AiTriggerIcon
          tooltip="Summarize patient info"
          signalLabel="Summarize patient info"
          sectionId="obstetric"
          size={12}
        />
      }
    >
      <ContentRow>
        <p className="whitespace-pre-wrap leading-[20px]">
          <Grey>LMP: </Grey><span>14 Jan&apos;26 </span>
          <Sep />
          <Grey>EDD: </Grey><span>21 Oct&apos;26 </span>
          <Sep />
          <Grey>C.E.D.D: </Grey><span>25 Oct&apos;26 </span>
          <Sep />
          <Grey>Gestation: </Grey><span>14 Weeks 2 Days </span>
          <Sep />
          <Grey>Patient Blood Group: </Grey><span>B+ve </span>
          <Sep />
          <Grey>Husband&apos;s Blood Group: </Grey><span>O+ve </span>
          <Sep />
          <Grey>Marital Status: </Grey><span>Married </span>
          <Sep />
          <Grey>Marriage Duration: </Grey><span>3 Years 6 Months </span>
          <Sep />
          <Grey>Consanguineous: </Grey><span>No</span>
        </p>
      </ContentRow>
    </SectionCard>
  );
}

function GPLAECard() {
  return (
    <SectionCard
      title="GPLAE"
      hideChevron
      titleAddon={(
        <>
          <span className="inline-flex items-center rounded-full border border-tp-blue-200 bg-tp-blue-50 px-[8px] py-[2px] font-sans text-[10px] font-medium leading-[14px] text-tp-blue-600">
            Primigravida
          </span>
          <AiTriggerIcon
            tooltip="Summarize GPLAE"
            signalLabel="Summarize GPLAE"
            sectionId="obstetric"
            size={12}
          />
        </>
      )}
    >
      <ContentRow>
        <p className="whitespace-pre-wrap leading-[20px]">
          <span>G: 1 </span>
          <Sep />
          <span>P: 0 </span>
          <Sep />
          <span>L: 0 </span>
          <Sep />
          <span>A: 0 </span>
          <Sep />
          <span>E: 0</span>
        </p>
      </ContentRow>
    </SectionCard>
  );
}

function GravidaEntry({
  no,
  data,
}: {
  no: number;
  data: {
    mode: string;
    dateOrAge: string;
    gender: string;
    weight: string;
    remarks?: string;
  };
}) {
  return (
    <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
      <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
        Gravida no: {no}
      </p>
      <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-normal break-words">
        <Grey>Mode of Delivery: </Grey><span>{data.mode} </span>
        <Sep />
        <Grey>Date of Delivery: </Grey><span>{data.dateOrAge} </span>
        <Sep />
        <Grey>Gender: </Grey><span>{data.gender} </span>
        <Sep />
        <Grey>Baby&apos;s Weight: </Grey><span>{data.weight}</span>
        {data.remarks ? (
          <>
            <Sep />
            <Grey>Remarks: </Grey>
            <span>{data.remarks}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}

function PregnancyHistoryCard({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <SectionCard
      title="Pregnancy History"
      expanded={expanded}
      onToggle={onToggle}
      titleAddon={
        <AiTriggerIcon
          tooltip="Summarize pregnancy history"
          signalLabel="Summarize pregnancy history"
          sectionId="obstetric"
          size={12}
          as="span"
        />
      }
    >
      <GravidaEntry
        no={1}
        data={{
          mode: "LSCS",
          dateOrAge: "14 Nov'24",
          gender: "Male",
          weight: "3.2 Kgs",
        }}
      />
      <div className="w-full border-t border-tp-slate-100" />
      <GravidaEntry
        no={2}
        data={{
          mode: "NVD",
          dateOrAge: "22 Mar'22",
          gender: "Female",
          weight: "2.8 Kgs",
          remarks: "Uneventful delivery, breastfeeding initiated within first hour.",
        }}
      />
    </SectionCard>
  );
}

function ExaminationCard({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <SectionCard
      title="Current Examination"
      expanded={expanded}
      onToggle={onToggle}
      titleAddon={
        <AiTriggerIcon
          tooltip="Summarize examination"
          signalLabel="Summarize examination"
          sectionId="obstetric"
          as="span"
          size={12}
        />
      }
    >
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          17 Jan&apos;26
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Pallor: </Grey><span>Absent </span>
          <Sep />
          <Grey>Oedema: </Grey><span>Mild </span>
          <Sep />
          <Grey>BMI: </Grey><span>23 Kg/m² </span>
          <Sep />
          <Grey>BP: </Grey><span>128/82 mmHg </span>
          <Sep />
          <Grey>Fundus Height: </Grey><span>14 cm </span>
          <Sep />
          <Grey>Presentation: </Grey><span>Cephalic </span>
          <Sep />
          <Grey>Liquor: </Grey><span>Adequate </span>
          <Sep />
          <Grey>Fetal Heart Rate: </Grey><span>142 bpm</span>
        </p>
      </div>
      <div className="w-full border-t border-tp-slate-100" />
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          24 Jan&apos;26
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Pallor: </Grey><span>Absent </span>
          <Sep />
          <Grey>Oedema: </Grey><span>Absent </span>
          <Sep />
          <Grey>BMI: </Grey><span>23.2 Kg/m² </span>
          <Sep />
          <Grey>BP: </Grey><span>122/80 mmHg </span>
          <Sep />
          <Grey>Fundus Height: </Grey><span>16 cm </span>
          <Sep />
          <Grey>Presentation: </Grey><span>Cephalic </span>
          <Sep />
          <Grey>Liquor: </Grey><span>Adequate </span>
          <Sep />
          <Grey>Fetal Heart Rate: </Grey><span>138 bpm</span>
        </p>
      </div>
    </SectionCard>
  );
}

function ANCSchedulerCard({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <SectionCard
      title="ANC Scheduler"
      expanded={expanded}
      onToggle={onToggle}
      titleAddon={
        <AiTriggerIcon
          tooltip="Summarize ANC scheduler"
          signalLabel="Summarize ANC scheduler"
          sectionId="obstetric"
          as="span"
          size={12}
        />
      }
    >
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          Complete Blood Count
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Week Range: </Grey><span>8-12 Weeks </span>
          <Sep />
          <Grey>Due Date: </Grey><span>11 Mar&apos;26 </span>
          <Sep />
          <Grey>Status: </Grey><span>Done </span>
          <Sep />
          <Grey>Remarks: </Grey><span>All values within normal limits</span>
        </p>
      </div>
      <div className="w-full border-t border-tp-slate-100" />
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          Glucose Tolerance Test
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Week Range: </Grey><span>24-28 Weeks </span>
          <Sep />
          <Grey>Due Date: </Grey><span>08 Jul&apos;26 </span>
          <Sep />
          <Grey>Status: </Grey><span>Due</span>
        </p>
      </div>
    </SectionCard>
  );
}

function ImmunisationHistoryCard({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <SectionCard
      title="Immunisation History"
      expanded={expanded}
      onToggle={onToggle}
      titleAddon={
        <AiTriggerIcon
          tooltip="Summarize immunisation history"
          signalLabel="Summarize immunisation history"
          sectionId="obstetric"
          as="span"
          size={12}
        />
      }
    >
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          Tetanus Toxoid (TT-1)
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Status: </Grey><span>Done </span>
          <Sep />
          <Grey>Given Date: </Grey><span>20 Feb&apos;26 </span>
          <Sep />
          <Grey>Remarks: </Grey><span>No adverse reaction</span>
        </p>
      </div>
      <div className="w-full border-t border-tp-slate-100" />
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          Tetanus Toxoid (TT-2)
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Status: </Grey><span>Due </span>
          <Sep />
          <Grey>Remarks: </Grey><span>Scheduled for next visit</span>
        </p>
      </div>
    </SectionCard>
  );
}

export function ObstetricHistoryContent() {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({
    pregnancy: true,
    examination: true,
    anc: true,
    immunisation: true,
  });

  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <ActionButton label="Add/Edit Details" icon="plus" />
      <SectionScrollArea>
        <PatientInfoCard />
        <GPLAECard />
        <PregnancyHistoryCard
          expanded={expandedState.pregnancy}
          onToggle={() => setExpandedState((prev) => ({ ...prev, pregnancy: !prev.pregnancy }))}
        />
        <ExaminationCard
          expanded={expandedState.examination}
          onToggle={() => setExpandedState((prev) => ({ ...prev, examination: !prev.examination }))}
        />
        <ANCSchedulerCard
          expanded={expandedState.anc}
          onToggle={() => setExpandedState((prev) => ({ ...prev, anc: !prev.anc }))}
        />
        <ImmunisationHistoryCard
          expanded={expandedState.immunisation}
          onToggle={() => setExpandedState((prev) => ({ ...prev, immunisation: !prev.immunisation }))}
        />
      </SectionScrollArea>
    </div>
  );
}

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

function PatientInfoCard() {
  return (
    <SectionCard title="Patient Info" hideChevron>
      <ContentRow>
        <p className="whitespace-pre-wrap leading-[20px]">
          <Grey>LMP: </Grey><span>14 Jan'26 </span>
          <Sep />
          <Grey>EDD: </Grey><span>21 Oct'26 </span>
          <Sep />
          <Grey>Gestation: </Grey><span>14 Weeks 2 Days</span>
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
        <span className="inline-flex items-center rounded-full border border-tp-blue-200 bg-tp-blue-50 px-[8px] py-[2px] font-sans text-[10px] font-medium leading-[14px] text-tp-blue-600">
          Primigravida
        </span>
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
  hasRemarks,
}: {
  no: number;
  hasRemarks?: boolean;
}) {
  return (
    <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
      <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
        Gravida no: {no}
      </p>
      <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-normal break-words">
        <Grey>LMP: </Grey><span>14 Jan'25 </span>
        <Sep />
        <Grey>EDD: </Grey><span>21 Oct'25 </span>
        <Sep />
        <Grey>Gestation: </Grey><span>40 Weeks </span>
        <Sep />
        <Grey>MOD: </Grey><span>NVD </span>
        <Sep />
        <Grey>Delivery Date: </Grey><span>14 Nov'25 </span>
        <Sep />
        <Grey>Baby Weight: </Grey><span>2.8 Kgs</span>
        {hasRemarks ? (
          <>
            <Sep />
            <Grey>Remarks: </Grey>
            <span>Postnatal period was uneventful; breastfeeding initiated within first hour.</span>
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
    <SectionCard title="Pregnancy History" expanded={expanded} onToggle={onToggle}>
      <GravidaEntry no={1} />
      <div className="w-full border-t border-tp-slate-100" />
      <GravidaEntry no={2} hasRemarks />
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
    <SectionCard title="Examination" expanded={expanded} onToggle={onToggle}>
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          17 Jan'26
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Pedal Oedema: </Grey><span>Mild </span>
          <Sep />
          <Grey>BMI: </Grey><span>23 Kg/m² </span>
          <Sep />
          <Grey>BP: </Grey><span>128/82 mmHg</span>
        </p>
      </div>
      <div className="w-full border-t border-tp-slate-100" />
      <div className="relative shrink-0 w-full px-[10px] py-[8px] flex flex-col gap-[4px]">
        <p className="font-sans font-semibold text-[14px] leading-[20px] text-tp-slate-700">
          24 Jan'26
        </p>
        <p className="font-sans text-[14px] leading-[20px] text-tp-slate-700 whitespace-pre-wrap">
          <Grey>Pedal Oedema: </Grey><span>Absent </span>
          <Sep />
          <Grey>BMI: </Grey><span>23.2 Kg/m² </span>
          <Sep />
          <Grey>BP: </Grey><span>122/80 mmHg</span>
        </p>
      </div>
    </SectionCard>
  );
}

export function ObstetricHistoryContent() {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({
    pregnancy: true,
    examination: true,
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
      </SectionScrollArea>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  Add,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  Buildings2,
  Calendar2,
  CallCalling,
  Card,
  DocumentText,
  DocumentUpload,
  Edit2,
  Hospital,
  MedalStar,
  Note1,
  Printer,
  ReceiptText,
  Refresh2,
  User,
} from "iconsax-reactjs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TPClinicalTable } from "@/components/tp-ui/tp-clinical-table";
import { TPMedicalIcon } from "@/components/tp-ui/medical-icons";
import { TPButton as Button, TPSplitButton } from "@/components/tp-ui/button-system";
import { AppointmentBanner } from "@/components/appointments/AppointmentBanner";
import rxHeaderStyles from "@/components/tp-rxpad/imports/RxpadHeader.module.scss";
import { APPOINTMENT_PATIENTS, type AppointmentPatientProfile } from "@/lib/appointment-patients";
import { DrAgentFab } from "@/components/tp-rxpad/dr-agent/shell/DrAgentFab";
import { DrAgentPanel } from "@/components/tp-rxpad/dr-agent/DrAgentPanel";
import { getVeloraReply } from "@/components/tp-rxpad/dr-agent/velora/velora-router";
import { cn } from "@/lib/utils";

/**
 * Local reserve class — kept so any global CSS rule that targets it
 * (padding-right when the Dr. Agent panel is docked) still applies.
 * Originally exported from `@/components/tp-rxpad/DrAgentLayoutShell`
 * in the dental project; inlined here to avoid pulling the dental shell.
 */
const DR_AGENT_MAIN_RESERVE_CLASS = "dr-agent-main-reserve";

const HISTORY_VIOLET = "var(--tp-violet-500)";

const VITALS_ROWS = [
  { name: "SPO2(%)", v1: "95", v2: "94" },
  { name: "Height (cms)", v1: "98.6", v2: "95" },
  { name: "Temperature (Frh)", v1: "95", v2: "94" },
  { name: "Pulse(/min)", v1: "66", v2: "65" },
  { name: "BP(mm Hg)", v1: "120/80", v2: "120/80" },
];

const LAB_ROWS = [
  { name: "Hemoglobin(g/dl)", v1: "14.2", v2: "13.8" },
  { name: "WBC", v1: "7800", v2: "7200" },
  { name: "Platelets", v1: "2.45", v2: "2.38" },
];

/** Matches `TPClinicalTable` styling for history cards. */
const VITALS_LAB_TABLE_COLUMNS = [
  { id: "name", header: "Name", accessor: (r: any) => r.name },
  { id: "v1", header: "10 Oct, 22", accessor: (r: any) => r.v1 },
  { id: "v2", header: "5 Oct, 22", accessor: (r: any) => r.v2 },
];

const MEDICAL_HISTORY_ROWS = [
  {
    id: "medical-problems",
    topic: "Medical problems",
    details: (
      <>
        <span className="font-medium text-[#454551]">Hypothyroidism</span>
        <span> — Since </span>
        <span className="font-medium text-[#454551]">3–6 months</span>
        <span>, medication </span>
        <span className="font-medium text-[#454551]">no</span>
      </>
    ),
  },
  {
    id: "lifestyle",
    topic: "Lifestyle",
    details: (
      <>
        <span className="font-medium text-[#454551]">Smoking</span>
        <span> — yes, since </span>
        <span className="font-medium text-[#454551]">2 years</span>
        <span>, quantity </span>
        <span className="font-medium text-[#454551]">2 units/day</span>
      </>
    ),
  },
];

const MEDICAL_HISTORY_COLUMNS = [
  {
    id: "topic",
    header: "Topic",
    minWidth: "38%",
    accessor: (r: any) => <span className="text-[#a2a2a8]">{r.topic}</span>,
  },
  {
    id: "details",
    header: "Details",
    accessor: (r: any) => <span className="leading-relaxed">{r.details}</span>,
  },
];

const MEDICATIONS = [
  "Hydroxychloroquine 400 Tablet (400mg, once a week)",
  "Vitamin C 1000 Tablet (1000mg, once a day)",
  "Zinc 50 tablet (50mg, once a day)",
  "Crocin 650mg tablet (650mg, SOS, in case of fever)",
  "cetirizine 10mg tablet (10mg, Once a day, In case of throat pain & cough)",
  "alex syrup (2/3 teaspoon, 3 times a day, SOS incase of cough)",
];

const LAB_TESTS = [
  "Complete Blood Count(CBC) Test",
  "ESR Test",
  "Urea",
  "Creat",
];

const VISIT_PAGES = 8;

/** Mock Rx metadata — used in header + tooltips. */
const RX_VISIT_DATE = "10 Oct 2023";
const RX_VISIT_TIME = "5:13 pm";
const RX_VISIT_DATETIME = `${RX_VISIT_DATE}, ${RX_VISIT_TIME}`;

function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-white shadow-[0_1px_3px_rgba(23,23,37,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function HistorySectionCard({
  title,
  iconName,
  onOpenSidebar,
  children,
}: {
  title: string;
  iconName: string;
  onOpenSidebar?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CardShell className="overflow-hidden">
      <div className="flex w-full items-center gap-3 px-3 py-[10px] sm:px-[14px]">
        <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center">
          <TPMedicalIcon name={iconName} variant="bulk" size={20} color={HISTORY_VIOLET} />
        </span>
        <span className="min-w-0 flex-1 font-sans text-[13px] font-medium leading-snug text-tp-slate-600">
          {title}
        </span>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-[10px] border border-tp-slate-200 bg-white text-tp-slate-500 transition-colors hover:border-tp-slate-300 hover:bg-tp-slate-50/90 hover:text-tp-slate-700"
          aria-label={`Open ${title} in sidebar`}
          onClick={() => onOpenSidebar?.()}
        >
          <ArrowRight2 size={18} variant="Linear" color="currentColor" strokeWidth={1.75} />
        </button>
      </div>
      <div className="p-0">{children}</div>
    </CardShell>
  );
}

function HistorySectionCards() {
  return (
    <>
      <HistorySectionCard title="Vitals & Body Composition" iconName="Heart Rate">
        <TPClinicalTable
          columns={VITALS_LAB_TABLE_COLUMNS}
          data={VITALS_ROWS}
          rowKey={(row: any) => row.name}
        />
      </HistorySectionCard>
      <HistorySectionCard title="Medical History" iconName="clipboard-activity">
        <TPClinicalTable
          columns={MEDICAL_HISTORY_COLUMNS}
          data={MEDICAL_HISTORY_ROWS}
          rowKey={(row: any) => row.id}
        />
      </HistorySectionCard>
      <HistorySectionCard title="Lab Results" iconName="Lab">
        <TPClinicalTable columns={VITALS_LAB_TABLE_COLUMNS} data={LAB_ROWS} rowKey={(row: any) => row.name} />
      </HistorySectionCard>
    </>
  );
}

type RxTab = "digital" | "transcript";

function DigitalRxPanel({
  visitIndex,
  setVisitIndex,
  rxTab,
  setRxTab,
}: {
  visitIndex: number;
  setVisitIndex: React.Dispatch<React.SetStateAction<number>>;
  rxTab: RxTab;
  setRxTab: (tab: RxTab) => void;
}) {
  const isDigital = rxTab === "digital";
  const docKind = isDigital ? "digital Rx" : "transcript";

  return (
    <CardShell className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 bg-white">
        {/* Row 1 — visit identity: doctor | pagination | date */}
        <div className="flex h-[48px] items-center px-4">
          <div className="grid h-full w-full grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-self-start">
              <p className="font-sans text-[14px] font-semibold leading-tight text-tp-slate-900">Dr Umesh</p>
              <span className="inline-flex shrink-0 items-center rounded-[6px] bg-tp-slate-100 px-2 py-[2px] font-sans text-[12px] font-medium leading-tight text-tp-slate-600">
                Cardiology
              </span>
            </div>

            <div className="flex items-center justify-center gap-[2px] sm:justify-self-center">
              <button
                type="button"
                aria-label="Previous visit"
                className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-tp-slate-500 transition-colors hover:bg-tp-slate-50 hover:text-tp-slate-700 disabled:pointer-events-none disabled:opacity-30"
                disabled={visitIndex <= 0}
                onClick={() => setVisitIndex((i) => Math.max(0, i - 1))}
              >
                <ArrowLeft2 size={16} variant="Linear" color="currentColor" />
              </button>
              <span className="min-w-[44px] text-center font-sans text-[12px] font-semibold tabular-nums text-tp-slate-700">
                {visitIndex + 1} / {VISIT_PAGES}
              </span>
              <button
                type="button"
                aria-label="Next visit"
                className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-tp-slate-500 transition-colors hover:bg-tp-slate-50 hover:text-tp-slate-700 disabled:pointer-events-none disabled:opacity-30"
                disabled={visitIndex >= VISIT_PAGES - 1}
                onClick={() => setVisitIndex((i) => Math.min(VISIT_PAGES - 1, i + 1))}
              >
                <ArrowRight2 size={16} variant="Linear" color="currentColor" />
              </button>
            </div>

            <div className="text-left font-sans sm:text-right sm:justify-self-end">
              <p className="whitespace-nowrap text-[12px] font-medium leading-tight text-tp-slate-500">
                {RX_VISIT_DATETIME}
              </p>
            </div>
          </div>
        </div>

        {/* Hairline separator between identity row and controls row */}
        <div className="h-px w-full shrink-0 bg-tp-slate-100" aria-hidden />

        {/* Row 2 — view toggle + actions */}
        <div className="flex h-[48px] items-center justify-between px-4">
          {/* Segmented pill toggle — floating white active pane on slate-100 track */}
          <div className="inline-flex h-[32px] items-center rounded-[10px] bg-tp-slate-100 p-[3px]">
            <button
              type="button"
              onClick={() => setRxTab("digital")}
              className={cn(
                "inline-flex h-[26px] items-center rounded-[8px] px-[14px] font-sans text-[12px] font-semibold transition-colors",
                rxTab === "digital"
                  ? "bg-white text-tp-blue-700 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                  : "text-tp-slate-600 hover:text-tp-slate-900",
              )}
            >
              Digital Rx
            </button>
            <button
              type="button"
              onClick={() => setRxTab("transcript")}
              className={cn(
                "inline-flex h-[26px] items-center rounded-[8px] px-[14px] font-sans text-[12px] font-semibold transition-colors",
                rxTab === "transcript"
                  ? "bg-white text-tp-blue-700 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                  : "text-tp-slate-600 hover:text-tp-slate-900",
              )}
            >
              Transcript
            </button>
          </div>

          <TooltipProvider delayDuration={280}>
            <div className="flex items-center gap-[2px]">
              <TooltipPrimitive.Root>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Repeat this ${docKind}`}
                    className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-tp-slate-600 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-900"
                  >
                    <Refresh2 size={16} variant="Linear" color="currentColor" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6} className="max-w-[240px] text-balance">
                  {isDigital
                    ? `Repeat this digital Rx from ${RX_VISIT_DATETIME}`
                    : `Repeat this transcript from ${RX_VISIT_DATETIME}`}
                </TooltipContent>
              </TooltipPrimitive.Root>
              <TooltipPrimitive.Root>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={isDigital ? "Print this digital Rx" : "Print this transcript"}
                    className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-tp-slate-600 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-900"
                  >
                    <Printer size={16} variant="Linear" color="currentColor" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {isDigital ? "Print this digital Rx" : "Print this transcript"}
                </TooltipContent>
              </TooltipPrimitive.Root>
              <TooltipPrimitive.Root>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={isDigital ? "Edit this digital Rx" : "Edit this transcript"}
                    className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-tp-slate-600 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-900"
                  >
                    <Edit2 size={16} variant="Linear" color="currentColor" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {isDigital ? "Edit this digital Rx" : "Edit this transcript"}
                </TooltipContent>
              </TooltipPrimitive.Root>
              <div className="mx-[2px] h-[18px] w-px bg-tp-slate-200" aria-hidden />
              <TooltipPrimitive.Root>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="More options"
                    className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-tp-slate-600 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-900"
                  >
                    <MoreVertical size={16} strokeWidth={1.75} className="text-tp-slate-600" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {isDigital ? "More actions for this digital Rx" : "More actions for this transcript"}
                </TooltipContent>
              </TooltipPrimitive.Root>
            </div>
          </TooltipProvider>
        </div>
        <div className="h-px w-full shrink-0 bg-tp-slate-100" aria-hidden />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 pt-4 pb-[18px]">
        {rxTab === "transcript" ? (
          <p className="font-sans text-[13px] leading-relaxed text-tp-slate-500">
            Consultation transcript will appear here when available from SmartScribe.
          </p>
        ) : (
          <div className="space-y-6">
            <section>
              <h4 className="font-sans text-[14px] font-medium text-tp-slate-900">Chief Complaints</h4>
              <ol className="mt-2 list-decimal pl-5 font-sans text-[12px] text-tp-slate-600">
                <li>Mild symptom (Mild, patient should be on home isolation)</li>
              </ol>
            </section>
            <section>
              <h4 className="font-sans text-[14px] font-medium text-tp-slate-900">Investigations</h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5 font-sans text-[12px] text-tp-slate-600">
                {LAB_TESTS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </section>
            <section>
              <h4 className="font-sans text-[14px] font-medium text-tp-slate-900">Medication</h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5 font-sans text-[12px] leading-relaxed text-tp-slate-600">
                {MEDICATIONS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </section>
            <section>
              <h4 className="font-sans text-[14px] font-medium text-tp-slate-900">Advice</h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5 font-sans text-[12px] text-tp-slate-600">
                <li>Follow social distancing</li>
                <li>Practice hand hygiene</li>
                <li>Wear masks</li>
              </ol>
            </section>
            <section>
              <h4 className="font-sans text-[14px] font-medium text-tp-slate-900">Follow-up</h4>
              <p className="mt-2 font-sans text-[12px] text-tp-slate-600">03/07/2024</p>
            </section>
            <section>
              <h4 className="font-sans text-[14px] font-medium text-tp-slate-900">Vitals &amp; Body Compositions</h4>
              <p className="mt-2 font-sans text-[12px] leading-relaxed text-tp-slate-600">
                Temperature: 95Frh, Pulse: 68/min, Resp. Rate: 95/min, Systolic:120mmHg, Diastolic: 75mmHg, SPO2:
                95%, Height: 175cms, Weight: 68kgs, BMI: 22.20kg/m², BMR : 1693.75kcals, BSA: 1.82m²
              </p>
            </section>
          </div>
        )}
      </div>
    </CardShell>
  );
}

function EmptyModuleBody({
  title,
  message,
  icon: Icon,
  ctaLabel,
  ctaIcon,
}: {
  title: string;
  message: string;
  icon?: any;
  ctaLabel?: string;
  ctaIcon?: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      {Icon ? <Icon size={80} variant="Bulk" color="var(--tp-slate-300)" /> : null}
      <p className="font-sans text-[16px] font-semibold text-tp-slate-800">{title}</p>
      <p className="font-sans text-[13px] leading-relaxed text-tp-slate-500">{message}</p>
      {ctaLabel ? (
        <Button
          variant="solid"
          theme="primary"
          size="md"
          surface="light"
          className="mt-3 whitespace-nowrap"
          leftIcon={ctaIcon}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}

function PatientDetailContentShell({
  children,
  className,
  bodyClassName,
}: {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      data-tp-figma-capture="patient-detail-module-shell"
      className={cn(
        "relative z-10 flex h-full min-h-0 min-w-0 w-full flex-1 flex-col rounded-[16px] bg-white shadow-[0_1px_3px_rgba(23,23,37,0.06)]",
        bodyClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}

type NavKind = "opd" | "placeholder";
type PlaceholderKey = "reports" | "certificates" | "bill" | "ipd" | "daycare";

type NavItem = {
  id: string;
  label: string;
  bannerTitle: string;
  kind: NavKind;
  placeholderKey?: PlaceholderKey;
};

const NAV_CONFIG: NavItem[] = [
  { id: "opd-summary", label: "OPD Visit Summary", bannerTitle: "OPD Visit Summary", kind: "opd" },
  { id: "reports", label: "Reports", bannerTitle: "Reports", kind: "placeholder", placeholderKey: "reports" },
  {
    id: "certificates",
    label: "Certificates",
    bannerTitle: "Certificates",
    kind: "placeholder",
    placeholderKey: "certificates",
  },
  { id: "add-edit-bill", label: "Add/Edit Bill", bannerTitle: "Add/Edit Bill", kind: "placeholder", placeholderKey: "bill" },
  {
    id: "ipd-discharge",
    label: "IPD Discharge Summary",
    bannerTitle: "IPD Discharge Summary",
    kind: "placeholder",
    placeholderKey: "ipd",
  },
  {
    id: "daycare-discharge",
    label: "Daycare Discharge Summary",
    bannerTitle: "Daycare Discharge Summary",
    kind: "placeholder",
    placeholderKey: "daycare",
  },
];

/** Short 1-word label used in the compact icon-rail when the Dr. Agent panel is open. */
function shortNavLabel(full: string): string {
  const map: Record<string, string> = {
    "OPD Visit Summary": "OPD",
    "Reports": "Reports",
    "Certificates": "Certs",
    "Add/Edit Bill": "Billing",
    "IPD Discharge Summary": "IPD",
    "Daycare Discharge Summary": "Daycare",
  };
  return map[full] ?? full;
}

function SecondaryNavIcon({ item, selected }: { item: NavItem; selected: boolean }) {
  const iconSize = 20;
  const idleColor = "var(--tp-slate-700)";
  const activeColor = "var(--tp-slate-0)";

  if (item.id === "opd-summary") {
    return (
      <DocumentText
        size={iconSize}
        variant={selected ? "Bulk" : "Linear"}
        color={selected ? activeColor : idleColor}
      />
    );
  }
  if (item.id === "reports") {
    return <Note1 size={iconSize} variant={selected ? "Bulk" : "Linear"} color={selected ? activeColor : idleColor} />;
  }
  if (item.id === "certificates") {
    return <MedalStar size={iconSize} variant={selected ? "Bulk" : "Linear"} color={selected ? activeColor : idleColor} />;
  }
  if (item.id === "add-edit-bill") {
    return <ReceiptText size={iconSize} variant={selected ? "Bulk" : "Linear"} color={selected ? activeColor : idleColor} />;
  }
  if (item.id === "ipd-discharge") {
    return <Hospital size={iconSize} variant={selected ? "Bulk" : "Linear"} color={selected ? activeColor : idleColor} />;
  }
  if (item.id === "daycare-discharge") {
    return <Buildings2 size={iconSize} variant={selected ? "Bulk" : "Linear"} color={selected ? activeColor : idleColor} />;
  }
  return <DocumentText size={iconSize} variant="Linear" color={idleColor} />;
}

const EMPTY_STATE_CTA: Record<PlaceholderKey, { label: string; icon: React.ReactElement }> = {
  reports: { label: "Upload report", icon: <DocumentUpload size={18} variant="Linear" strokeWidth={1.5} /> },
  certificates: { label: "Add new certificate", icon: <Add size={18} strokeWidth={1.5} /> },
  bill: { label: "Add new bill", icon: <Add size={18} strokeWidth={1.5} /> },
  ipd: { label: "Add IPD summary", icon: <Add size={18} strokeWidth={1.5} /> },
  daycare: { label: "Add daycare summary", icon: <Add size={18} strokeWidth={1.5} /> },
};

const PLACEHOLDER_COPY: Record<PlaceholderKey, { title: string; message: string; icon: any }> = {
  reports: {
    title: "Reports",
    message: "Investigation and imaging reports linked to this patient will show here.",
    icon: Note1,
  },
  certificates: {
    title: "Certificates",
    message: "Medical certificates and fitness notes will appear in this section.",
    icon: DocumentText,
  },
  bill: {
    title: "Add/Edit Bill",
    message: "Create invoices, record payments, and manage billing from here.",
    icon: ReceiptText,
  },
  ipd: {
    title: "IPD Discharge Summary",
    message: "Inpatient discharge summaries will be listed here when available.",
    icon: Hospital,
  },
  daycare: {
    title: "Daycare Discharge Summary",
    message: "Daycare procedure summaries will appear here.",
    icon: Buildings2,
  },
};

const BANNER_GHOST_BTN_CLASS =
  "!bg-white/[0.13] !text-white !backdrop-blur-[4px] hover:!bg-white/[0.22] whitespace-nowrap";
const BANNER_SOLID_BTN_CLASS = "whitespace-nowrap";

function renderBannerActions(activeConfig: NavItem | undefined, { goTypeRx }: { goTypeRx: () => void }) {
  if (!activeConfig) return null;

  // OPD summary lives in the Rx authoring flow → offer the Type RX split button.
  if (activeConfig.kind === "opd") {
    return (
      <TPSplitButton
        size="md"
        variant="solid"
        theme="primary"
        surface="dark"
        className={BANNER_SOLID_BTN_CLASS}
        primaryAction={{ label: "Type RX", onClick: goTypeRx }}
        secondaryActions={[
          { id: "type-rx", label: "Type RX", onClick: goTypeRx },
          { id: "voice-rx", label: "Voice RX", onClick: goTypeRx },
          { id: "snap-rx", label: "Snap RX", onClick: goTypeRx },
          { id: "smart-sync", label: "SmartSync", onClick: goTypeRx },
        ]}
      />
    );
  }

  const actionByKey: Record<PlaceholderKey, { label: string; icon: React.ReactElement }> = {
    reports: { label: "Upload report", icon: <DocumentUpload size={20} variant="Linear" strokeWidth={1.5} /> },
    certificates: { label: "Add new certificate", icon: <Add size={20} strokeWidth={1.5} /> },
    bill: { label: "Add new bill", icon: <Add size={20} strokeWidth={1.5} /> },
    ipd: { label: "Add IPD summary", icon: <Add size={20} strokeWidth={1.5} /> },
    daycare: { label: "Add daycare summary", icon: <Add size={20} strokeWidth={1.5} /> },
  };
  const key = activeConfig.placeholderKey;
  const meta = key ? actionByKey[key] : undefined;
  if (!meta) return null;
  return (
    <Button
      variant="outline"
      theme="primary"
      size="md"
      surface="dark"
      className={BANNER_GHOST_BTN_CLASS}
      leftIcon={meta.icon}
    >
      {meta.label}
    </Button>
  );
}

function PatientDetailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams?.get("patientId") ?? "apt-1";
  const fromPage = searchParams?.get("from") ?? "appointments";

  const [activeNav, setActiveNav] = useState<string>("opd-summary");
  const [rxTab, setRxTab] = useState<RxTab>("digital");
  const [visitIndex, setVisitIndex] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const navFromUrl = searchParams?.get("nav");
  useEffect(() => {
    if (!navFromUrl) return;
    if (NAV_CONFIG.some((n) => n.id === navFromUrl)) {
      setActiveNav(navFromUrl);
    }
  }, [navFromUrl]);

  // URL-param adapter: use catalog entry when patientId is one of apt-*,
  // otherwise synthesize the full AppointmentPatientProfile from URL params
  // so external callers (RxPadPage, DrAgentPage) that pass name/gender/age
  // for non-catalog patients render correctly.
  const headerPatient: AppointmentPatientProfile = useMemo(() => {
    const fromCatalog = APPOINTMENT_PATIENTS[patientId];
    if (fromCatalog) return fromCatalog;
    const name = searchParams?.get("name") ?? "Patient";
    const genderRaw = (searchParams?.get("gender") ?? "M").toUpperCase();
    const genderShort: "M" | "F" = genderRaw.startsWith("F") ? "F" : "M";
    const age = Number.parseInt(searchParams?.get("age") ?? "30", 10) || 30;
    return {
      name,
      genderLabel: genderShort === "F" ? "Female" : "Male",
      genderShort,
      age,
      dob: "—",
      mobile: "—",
      patientCode: `PAT-${patientId}`,
      bloodGroup: "—",
    };
  }, [patientId, searchParams]);

  const profileFields = useMemo(
    () => [
      {
        key: "patient-id",
        label: "Patient ID",
        value: headerPatient.patientCode,
        icon: <Card color="var(--tp-violet-500)" size={18} strokeWidth={1.5} variant="Linear" />,
      },
      {
        key: "mobile",
        label: "Mobile Number",
        value: headerPatient.mobile.replace(/^\+91-/, ""),
        icon: <CallCalling color="var(--tp-violet-500)" size={18} strokeWidth={1.5} variant="Linear" />,
      },
      {
        key: "dob",
        label: "DOB",
        value: headerPatient.dob,
        icon: <Calendar2 color="var(--tp-violet-500)" size={18} strokeWidth={1.5} variant="Linear" />,
      },
    ],
    [headerPatient],
  );

  const activeConfig = NAV_CONFIG.find((n) => n.id === activeNav) ?? NAV_CONFIG[0];

  const handleBack = () => {
    if (fromPage === "rxpad") {
      router.push(`/Rxpad?patientId=${patientId}`);
    } else {
      router.push("/tp-appointment-screen");
    }
  };

  const goTypeRx = () => {
    router.push(`/Rxpad?patientId=${patientId}`);
  };

  const onNavClick = (item: NavItem) => {
    setActiveNav(item.id);
  };

  const bannerActions = renderBannerActions(activeConfig, { goTypeRx });

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-tp-slate-100">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Secondary nav — expanded (220px) when Dr. Agent is closed; compact icon-rail (80px)
            with icon-above-label when Dr. Agent is open, matching the appointments home rail. */}
        <nav
          className={cn(
            "relative flex shrink-0 flex-col overflow-hidden border-r border-tp-slate-100 bg-white transition-[width] duration-200",
            isAgentOpen ? "w-[80px]" : "w-[220px]",
          )}
          aria-label="Patient sections"
        >
          {/* Back — icon only in compact, icon+label in expanded */}
          <div className={cn("shrink-0 pt-3 pb-2", isAgentOpen ? "flex justify-center px-2" : "px-3")}>
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              title={isAgentOpen ? "Go back" : undefined}
              className={cn(
                "inline-flex h-[32px] items-center font-sans text-[14px] font-medium text-tp-slate-600 transition-colors hover:bg-tp-slate-50 hover:text-tp-blue-600",
                isAgentOpen
                  ? "w-[32px] justify-center rounded-[8px]"
                  : "gap-[6px] rounded-[8px] pl-[6px] pr-[10px]",
              )}
            >
              <ArrowLeft2 size={16} color="currentColor" variant="Linear" />
              {!isAgentOpen && <span>Back</span>}
            </button>
          </div>
          <div className="h-px shrink-0 bg-tp-slate-100" aria-hidden />

          {/* Profile — avatar + name/meta (full row); in compact, just a centered avatar circle */}
          <div className={cn("shrink-0 pt-3 pb-3", isAgentOpen ? "flex justify-center px-2" : "px-3")}>
            {isAgentOpen ? (
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                title={`${headerPatient.name} · ${headerPatient.genderShort} · ${headerPatient.age}Y`}
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-tp-slate-100 transition-colors hover:bg-tp-slate-200/75"
                aria-label="Patient profile"
              >
                <User color="var(--tp-slate-500)" size={22} variant="Bulk" />
              </button>
            ) : (
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-[10px] bg-tp-slate-100 px-2 py-2 text-left transition-colors hover:bg-tp-slate-200/75 data-[state=open]:bg-tp-slate-200/80"
                  >
                    <div className={rxHeaderStyles.avatarRing} data-name="Profile Image">
                      <div className={rxHeaderStyles.avatarIcon} data-name="User">
                        <User color="var(--tp-slate-500)" size={22.857} variant="Bulk" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-[14px] font-semibold text-tp-slate-900">{headerPatient.name}</p>
                      <p className="flex items-center font-sans text-[12px] font-medium">
                        <span className="text-tp-slate-500">{headerPatient.genderShort}</span>
                        <span className="w-[14px] shrink-0 text-center text-tp-slate-300" aria-hidden>
                          ·
                        </span>
                        <span className="text-tp-slate-500">{`${headerPatient.age}Y`}</span>
                      </p>
                    </div>
                    <div
                      className={clsx(
                        rxHeaderStyles.chevronWrap,
                        rxHeaderStyles.chevronSpin,
                        isProfileOpen && rxHeaderStyles.chevronSpinOpen,
                      )}
                      aria-hidden
                    >
                      <ArrowDown2 color="var(--tp-slate-700)" size={18} strokeWidth={2} variant="Linear" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6} className={rxHeaderStyles.menuContent}>
                  <div className={rxHeaderStyles.menuArrowOuter} />
                  <div className={rxHeaderStyles.menuArrowInner} />
                  <div className={rxHeaderStyles.menuFields}>
                    {profileFields.map((item) => (
                      <div key={item.key} className={rxHeaderStyles.menuFieldRow}>
                        <div className={rxHeaderStyles.menuIconCircle}>{item.icon}</div>
                        <div className={rxHeaderStyles.menuFieldText}>
                          <p className={rxHeaderStyles.menuLabel}>{item.label}</p>
                          <p className={rxHeaderStyles.menuValue}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={rxHeaderStyles.menuActions}>
                    <button
                      type="button"
                      className={rxHeaderStyles.menuActionBtn}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Edit2 color="currentColor" size={20} strokeWidth={1.5} variant="Linear" />
                      <span className={rxHeaderStyles.menuActionLabel}>Edit patient details</span>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="h-px shrink-0 bg-tp-slate-100" aria-hidden />

          <div className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-4 pt-3",
            isAgentOpen ? "gap-[4px]" : "gap-[2px]",
          )}>
            {NAV_CONFIG.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavClick(item)}
                  title={isAgentOpen ? item.label : undefined}
                  className={cn(
                    "group da-patient-nav-item relative transition-colors",
                    active && "da-patient-nav-item--active",
                    isAgentOpen
                      ? "mx-[6px] flex flex-col items-center gap-[4px] rounded-[10px] px-[4px] py-[8px]"
                      : "flex w-full flex-row items-center gap-3 px-3 py-[10px] text-left",
                  )}
                >
                  {active && !isAgentOpen ? (
                    <span
                      className="absolute bottom-[6px] left-0 top-[6px] w-[3px] rounded-r-[12px] bg-tp-blue-500"
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-colors",
                      active ? "bg-tp-blue-500" : "bg-tp-slate-100",
                    )}
                  >
                    <SecondaryNavIcon item={item} selected={active} />
                  </span>
                  <span
                    className={cn(
                      "font-sans leading-snug",
                      isAgentOpen
                        ? "w-full text-center text-[10px]"
                        : "min-w-0 flex-1 truncate text-[14px] text-left",
                      active ? "font-semibold text-tp-slate-900" : "font-medium text-tp-slate-700",
                    )}
                    title={!isAgentOpen ? item.label : undefined}
                  >
                    {isAgentOpen ? shortNavLabel(item.label) : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main column: banner (fixed at top, non-scrolling) + scroll container below.
            Banner is effectively sticky because it lives outside the scroll area.
            Page background inherits the outer slate-100 (same as the home appointments page). */}
        <div
          className={cn(
            "static flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-200",
            DR_AGENT_MAIN_RESERVE_CLASS,
            isAgentOpen && "md:pr-[350px] lg:pr-[400px]",
          )}
        >
          {/* Banner — outside the scroll container, so it never scrolls away. */}
          <div className="shrink-0">
            <AppointmentBanner title={activeConfig.bannerTitle} actions={bannerActions} />
          </div>

          {/*
            Body wrapper — NO overflow on this element so the content can overlay the banner via
            -mt-[60px]. Scroll is pushed one level down: each column (History / RX) manages its
            own vertical scroll so the banner above stays put.
          */}
          <div className="relative z-10 flex min-w-0 w-full flex-1 min-h-0 flex-col -mt-[60px] px-3 pb-6 sm:px-4 md:px-5 lg:px-[18px]">
            <div className="relative flex min-w-0 w-full max-w-none flex-1 flex-col overflow-visible min-h-0">
              {activeConfig.kind === "opd" ? (
                <div className="relative z-10 flex w-full min-w-0 flex-1 min-h-0 flex-col gap-4 py-0 md:gap-5 lg:flex-row lg:items-stretch">
                  {/* History column — its own vertical scroll so long stacks of cards stay
                      contained and never push past the sticky banner. */}
                  <section
                    className="flex w-full min-w-0 flex-col gap-4 overflow-y-auto pb-4 lg:w-[280px] lg:min-w-[250px] lg:flex-none lg:shrink-0"
                    aria-label="Historical data"
                  >
                    <HistorySectionCards />
                  </section>
                  {/* Rx column — fixed column, internal scroll is handled inside DigitalRxPanel. */}
                  <section
                    className="flex min-w-0 flex-1 min-h-0 flex-col overflow-hidden max-lg:min-h-[min(520px,80vh)] lg:min-w-[350px]"
                    aria-label="Prescription"
                  >
                    <DigitalRxPanel
                      visitIndex={visitIndex}
                      setVisitIndex={setVisitIndex}
                      rxTab={rxTab}
                      setRxTab={setRxTab}
                    />
                  </section>
                </div>
              ) : (
                <PatientDetailContentShell bodyClassName="flex min-h-[min(480px,72vh)] flex-1 flex-col items-center justify-center overflow-y-auto">
                  <EmptyModuleBody
                    title={PLACEHOLDER_COPY[activeConfig.placeholderKey!].title}
                    message={PLACEHOLDER_COPY[activeConfig.placeholderKey!].message}
                    icon={PLACEHOLDER_COPY[activeConfig.placeholderKey!].icon}
                    ctaLabel={EMPTY_STATE_CTA[activeConfig.placeholderKey!]?.label}
                    ctaIcon={EMPTY_STATE_CTA[activeConfig.placeholderKey!]?.icon}
                  />
                </PatientDetailContentShell>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dr. Agent — docked panel + floating FAB, same pattern as RxPadPage. */}
      {isAgentOpen ? (
        <div className="pointer-events-none fixed right-0 top-0 z-40 hidden h-screen w-[350px] md:block lg:w-[400px]">
          <div className="pointer-events-auto h-full w-full">
            <DrAgentPanel onClose={() => setIsAgentOpen(false)} initialPatientId={patientId} replyOverride={getVeloraReply} />
          </div>
        </div>
      ) : null}
      {!isAgentOpen ? (
        <DrAgentFab onClick={() => setIsAgentOpen(true)} hasNudge={false} />
      ) : null}

      {/* Nav item active/hover tints — mirror the home-page primary sidebar exactly. */}
      <style jsx global>{`
        .da-patient-nav-item:hover {
          background-color: rgba(75, 74, 213, 0.08);
        }
        .da-patient-nav-item--active,
        .da-patient-nav-item--active:hover {
          background-color: rgba(75, 74, 213, 0.12);
        }
      `}</style>
    </div>
  );
}

export function PatientDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-tp-slate-100 font-sans text-tp-slate-500">
          Loading…
        </div>
      }
    >
      <PatientDetailInner />
    </Suspense>
  );
}

export default PatientDetailPage;

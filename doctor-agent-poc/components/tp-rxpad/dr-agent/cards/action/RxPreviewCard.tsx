"use client"

import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { FooterCTA } from "../FooterCTA"
import { SectionTag, SECTION_TAG_ICON_MAP } from "../SectionTag"
import { Printer, ArrowRight2 } from "iconsax-reactjs"
import type { RxPreviewCardData } from "../../types"

interface Props {
  data: RxPreviewCardData
  onPillTap?: (label: string) => void
}

function Section({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="mb-[6px]">
      <div className="mb-[3px]">
        <SectionTag label={label} icon={SECTION_TAG_ICON_MAP[label]} />
      </div>
      <div className="space-y-[1px] pl-[2px]">
        {items.map((item, i) => (
          <p key={i} className="text-[12px] leading-[1.45] text-tp-slate-700">• {item}</p>
        ))}
      </div>
    </div>
  )
}

export function RxPreviewCard({ data, onPillTap }: Props) {
  return (
    <CardShell
      icon={<span />}
      tpIconName="clipboard-activity"
      title="Prescription Preview"
      date={data.date}
      actions={
        <ChatPillButton label="Edit Rx" onClick={() => onPillTap?.("Edit Rx")} />
      }
      sidebarLink={
        <div className="flex items-center">
          <FooterCTA
            label="Print prescription"
            iconLeft={<Printer size={14} variant="Linear" />}
            fullWidth
            align="center"
          />
          <div className="h-[20px] flex-shrink-0" style={{ width: "1px", background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }} />
          <FooterCTA
            label="Share digitally"
            iconRight={<ArrowRight2 size={14} variant="Linear" />}
            fullWidth
            align="center"
          />
        </div>
      }
    >
      {/* Patient */}
      <div className="mb-[8px] rounded-[6px] bg-tp-slate-50 px-2.5 py-[4px] text-[12px]">
        <span className="font-medium text-tp-slate-600">Patient:</span>{" "}
        <span className="text-tp-slate-800">{data.patientName}</span>
      </div>

      <Section label="Diagnoses" items={data.diagnoses} />
      <Section label="Medications" items={data.medications} />
      <Section label="Investigations" items={data.investigations} />
      <Section label="Advice" items={data.advice} />

      {data.followUp && (
        <div>
          <div className="mb-[3px]">
            <SectionTag label="Follow-up" icon={SECTION_TAG_ICON_MAP["Follow-up"]} />
          </div>
          <p className="text-[12px] text-tp-slate-700 pl-[2px]">{data.followUp}</p>
        </div>
      )}
    </CardShell>
  )
}

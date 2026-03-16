"use client"

import { CardShell } from "../CardShell"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import type { RxPreviewCardData } from "../../types"

interface Props {
  data: RxPreviewCardData
  onPillTap?: (label: string) => void
}

function Section({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="mb-[6px]">
      <p className="mb-[2px] text-[9px] font-medium uppercase tracking-wider text-tp-slate-400">{label}</p>
      <div className="space-y-[1px]">
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
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-[4px] rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60"
          >
            Print prescription
          </button>
          <div className="h-[20px] flex-shrink-0" style={{ width: "1px", background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }} />
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-[4px] rounded-[10px] py-[5px] text-[11px] font-medium text-tp-blue-500 transition-colors hover:bg-tp-blue-50/60"
          >
            Share digitally
          </button>
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
          <p className="mb-[2px] text-[9px] font-medium uppercase tracking-wider text-tp-slate-400">Follow-up</p>
          <p className="text-[12px] text-tp-slate-700">{data.followUp}</p>
        </div>
      )}
    </CardShell>
  )
}

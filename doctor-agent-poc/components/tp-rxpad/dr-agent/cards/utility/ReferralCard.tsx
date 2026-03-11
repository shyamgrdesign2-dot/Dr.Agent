"use client"

import { CardShell } from "../CardShell"
import { SidebarLink } from "../SidebarLink"
import { cn } from "@/lib/utils"
import type { ReferralCardData } from "../../types"

interface Props {
  data: ReferralCardData
  onPillTap?: (label: string) => void
}

const URGENCY_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  routine: { label: "Routine", color: "#22C55E", bg: "#F0FDF4" },
  urgent: { label: "Urgent", color: "#F59E0B", bg: "#FFFBEB" },
  emergency: { label: "Emergency", color: "#DC2626", bg: "#FEE2E2" },
}

export function ReferralCard({ data, onPillTap }: Props) {
  const copyAll = () => {
    const text = data.items
      .map(r => `${r.patientName} → ${r.specialist} (${r.department}) [${r.urgency}] — ${r.reason}`)
      .join("\n")
    navigator.clipboard.writeText(text)
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="hospital"
      title={data.title}
      badge={
        data.urgentCount > 0
          ? { label: `${data.urgentCount} urgent`, color: "#F59E0B", bg: "#FFFBEB" }
          : undefined
      }
      copyAll={copyAll}
      sidebarLink={
        <SidebarLink
          text={`Print all referral letters (${data.totalCount})`}
          onClick={() => onPillTap?.("Print referral letters")}
        />
      }
    >
      {/* Patient-wise referral list */}
      <div className="space-y-[6px]">
        {data.items.map((item, i) => {
          const badge = URGENCY_BADGE[item.urgency] ?? URGENCY_BADGE.routine
          return (
            <div
              key={`${item.patientName}-${i}`}
              className="rounded-[8px] border border-tp-slate-100 bg-white px-[8px] py-[6px]"
            >
              {/* Row 1: Patient name + urgency badge + action */}
              <div className="flex items-center justify-between mb-[3px]">
                <div className="flex items-center gap-[6px] min-w-0">
                  <span className="text-[11px] font-medium text-tp-slate-800 truncate">
                    {item.patientName}
                  </span>
                  <span
                    className="shrink-0 rounded-[4px] px-1.5 py-[1px] text-[9px] font-medium uppercase"
                    style={{ color: badge.color, backgroundColor: badge.bg }}
                  >
                    {badge.label}
                  </span>
                </div>
                <button
                  className="shrink-0 ml-2 rounded-[6px] border border-tp-violet-200 bg-white px-2 py-[2px] text-[10px] font-medium text-tp-violet-600 hover:bg-tp-violet-50 transition-colors"
                  onClick={() => onPillTap?.(`Send referral for ${item.patientName}`)}
                >
                  Send referral
                </button>
              </div>

              {/* Row 2: Specialist + department */}
              <p className="text-[10px] text-tp-slate-600 truncate">
                → {item.specialist} · {item.department}
              </p>

              {/* Row 3: Reason */}
              <p className="text-[10px] text-tp-slate-400 truncate mt-[1px]">
                {item.reason}
              </p>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}

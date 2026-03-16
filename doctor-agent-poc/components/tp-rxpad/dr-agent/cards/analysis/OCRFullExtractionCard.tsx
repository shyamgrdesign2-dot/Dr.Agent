"use client"

import { CardShell } from "../CardShell"
import { InsightBox } from "../InsightBox"
import { SidebarLink } from "../SidebarLink"
import { TPMedicalIcon } from "@/components/tp-ui"
import { Copy } from "iconsax-reactjs"
import type { OCRSection } from "../../types"

interface OCRFullExtractionCardProps {
  data: {
    title: string
    category: string
    sections: OCRSection[]
    insight: string
  }
  onCopySection?: (
    heading: string,
    items: string[],
    dest: string
  ) => void
  onCopyItem?: (item: string, dest: string) => void
}

export function OCRFullExtractionCard({
  data,
  onCopySection,
  onCopyItem,
}: OCRFullExtractionCardProps) {
  return (
    <CardShell
      icon={<span />}
      tpIconName="medical-record"
      title={data.title}
      badge={{
        label: "Auto-Analyzed",
        color: "#7C3AED",
        bg: "#EDE9FE",
      }}
      copyAll={() => {
        const text = data.sections.map(s => `${s.heading}:\n${s.items.map(i => `  • ${i}`).join('\n')}`).join('\n\n')
        navigator.clipboard?.writeText(text)
      }}
      copyAllTooltip="Fill complete digitized report to Medical Records"
      sidebarLink={<SidebarLink text="View original" />}
    >
      {/* Category line */}
      <div className="mb-1 text-[10px] text-tp-slate-400">
        {data.category}
      </div>

      {/* Sections */}
      {data.sections.map((section) => (
        <div key={section.heading} className="mb-2">
          {/* Section header bar */}
          <div className="flex items-center gap-1.5 rounded-[6px] bg-tp-slate-50 px-2 py-[4px]">
            <TPMedicalIcon name={section.icon} variant="bulk" size={11} className="text-tp-slate-500" />
            <span className="flex-1 text-[12px] font-semibold text-tp-slate-700">
              {section.heading}
            </span>
            <button
              type="button"
              onClick={() =>
                onCopySection?.(
                  section.heading,
                  section.items,
                  section.copyDestination
                )
              }
              className="flex h-[20px] items-center gap-1 rounded-[6px] border border-tp-slate-200 bg-white px-1.5 text-tp-slate-600 transition-all hover:text-tp-slate-500 hover:border-tp-slate-300 hover:bg-tp-slate-50"
              title={`Fill all ${section.heading} to ${section.copyDestination}`}
            >
              <Copy size={10} variant="Linear" className="text-tp-blue-500" />
            </button>
          </div>

          {/* Items */}
          <div className="mt-[3px] space-y-[1px] pl-2">
            {section.items.map((item, i) => (
              <div
                key={`${section.heading}-${i}`}
                className="group/item flex items-start gap-1 text-[12px] leading-[1.45] text-tp-slate-600"
              >
                <span className="flex-1">• {item}</span>
                <button
                  type="button"
                  onClick={() => onCopyItem?.(item, section.copyDestination)}
                  className="mt-[1px] flex-shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100 text-tp-slate-600 hover:text-tp-slate-500"
                  title={`Fill to ${section.copyDestination}`}
                >
                  <Copy size={14} variant="Linear" className="text-tp-blue-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Insight */}
      <InsightBox variant="purple">{data.insight}</InsightBox>
    </CardShell>
  )
}

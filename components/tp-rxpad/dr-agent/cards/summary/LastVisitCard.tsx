"use client"

import React from "react"
import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"
import { ChatPillButton } from "../ActionRow"
import { SidebarLink } from "../SidebarLink"
import type { LastVisitCardData, LastVisitCardSection } from "../../types"

/* ── icon map: section tag → TP Medical Icon name ── */
const SECTION_ICON_MAP: Record<string, string> = {
  Symptoms: "thermometer",
  Examination: "stethoscope",
  Diagnosis: "Diagnosis",
  Medication: "pill",
  Investigation: "Lab",
  Advice: "clipboard-activity",
  "Follow-up": "medical-record",
}

/** Sections where copy-to-RxPad makes sense */
const COPYABLE_SECTIONS = new Set([
  "Symptoms",
  "Examination",
  "Diagnosis",
  "Medication",
  "Investigation",
  "Advice",
  "Follow-up",
  "Surgery",
  "Additional Notes",
])

interface LastVisitCardProps {
  data: LastVisitCardData
  onPillTap?: (label: string) => void
  onSidebarNav?: (tab: string) => void
  onCopy?: () => void
}

/* ── helper: fill text to RxPad ── */
function copyText(text: string) {
  navigator.clipboard?.writeText(text)
}

/* ── helper: build copy payload for a section ── */
function copySectionText(section: LastVisitCardSection): string {
  return section.items
    .filter((item) => item.label || item.detail)
    .map((item) => item.detail && item.detail !== item.label ? `${item.label}: ${item.detail}` : item.label)
    .join(", ")
}

/* ── helper: map section items to InlineDataRow values ── */
function sectionToInlineValues(section: LastVisitCardSection) {
  // All sections: use bracket format "Name (detail)" so color hierarchy
  // renders name as primary (dark) and detail as secondary (lighter)
  // Items without detail just show the label.
  // All items combined into a single row, comma-separated.
  const formatted = section.items.map((item) => {
    if (item.detail && item.detail !== item.label) {
      return `${item.label} (${item.detail})`
    }
    return item.label
  }).filter(Boolean)

  if (formatted.length === 0) return []

  return [{
    key: "",
    value: formatted.join(", "),
  }]
}

export function LastVisitCard({
  data,
  onPillTap,
  onSidebarNav,
  onCopy,
}: LastVisitCardProps) {
  /* Build section list with dividers */
  const sections = data.sections.map((section, sIdx) => {
    const iconName = SECTION_ICON_MAP[section.tag]
    const values = sectionToInlineValues(section)

    return {
      id: `${section.tag}-${sIdx}`,
      tag: section.tag,
      iconName,
      values,
      notes: section.notes,
      onCopy: () => copyText(copySectionText(section)),
      allowCopy: COPYABLE_SECTIONS.has(section.tag),
    }
  })

  return (
    <CardShell
      icon={<span />}
      tpIconName="medical-record"
      title="Last Visit Summary"
      badge={
        data.visitDate
          ? { label: data.visitDate, color: "#6D28D9", bg: "#EDE9FE" }
          : undefined
      }
      copyAll={onCopy}
      copyAllTooltip="Fill last visit data to RxPad"
      collapsible
      dataSources={["EMR Records"]}
      actions={
        <ChatPillButton
          label="Compare previous visit"
          onClick={() => onPillTap?.("Compare previous visit")}
        />
      }
      sidebarLink={
        onSidebarNav ? (
          <SidebarLink
            text="See all past visits"
            onClick={() => onSidebarNav("pastVisits")}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-[8px]">
        {sections.map((section) => (
          <React.Fragment key={section.id}>
            <div className="flex flex-col gap-[2px]">
              <InlineDataRow
                tag={section.tag}
                tagIcon={section.iconName}
                values={section.values}
                onTagClick={() => onSidebarNav?.("pastVisits")}
                onTagCopy={section.onCopy}
                source="existing"
                allowCopyToRxPad={section.allowCopy}
              />
              {/* Section notes as subtle italic line */}
              {section.notes && (
                <p className="pl-1 text-[16px] italic leading-[1.6] text-tp-slate-400">
                  {section.notes}
                </p>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </CardShell>
  )
}

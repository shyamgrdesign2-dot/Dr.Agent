"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { useTouchDevice } from "@/hooks/use-touch-device"
import { CardShell } from "../CardShell"
import { CopyIcon } from "../CopyIcon"
import { ActionableTooltip } from "../ActionableTooltip"
import { TPMedicalIcon } from "@/components/tp-ui"
import { Microphone2 } from "iconsax-reactjs"
import type { VoiceStructuredRxData, VoiceRxItem } from "../../types"
import type { RxPadCopyPayload } from "@/components/tp-rxpad/rxpad-sync-context"

interface VoiceStructuredRxCardProps {
  data: VoiceStructuredRxData
  onCopy?: (payload: RxPadCopyPayload) => void
}

/** Format a VoiceRxItem to a plain text string for clipboard copy */
function formatVoiceItem(item: VoiceRxItem): string {
  return item.detail ? `${item.name} (${item.detail})` : item.name
}

export function VoiceStructuredRxCard({ data, onCopy }: VoiceStructuredRxCardProps) {
  const isTouch = useTouchDevice()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)

  const handleCopyItem = (item: VoiceRxItem, key: string) => {
    navigator.clipboard?.writeText(formatVoiceItem(item))
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1200)
  }

  const handleCopySection = (sectionId: string, items: VoiceRxItem[]) => {
    const text = items.map(formatVoiceItem).join("\n")
    navigator.clipboard?.writeText(text)
    setCopiedKey(`section-${sectionId}`)
    setTimeout(() => setCopiedKey(null), 1200)
  }

  return (
    <CardShell
      icon={<Microphone2 size={14} variant="Bulk" color="var(--tp-blue-500, #4B4AD5)" />}
      title="Structured Transcript"
      badge={{ label: "Just now", color: "#64748B", bg: "#F1F5F9" }}
      copyAll={() => onCopy?.(data.copyAllPayload)}
      copyAllTooltip="Fill structured transcript to RxPad"
      collapsible
      defaultCollapsed={false}
    >
      <div className="flex flex-col gap-[8px]">
        {/* Toggle original voice text */}
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="text-left text-[14px] font-medium text-tp-slate-400 hover:text-tp-slate-500 transition-colors"
        >
          {showOriginal ? "▾ Hide original text" : "▸ Show original text"}
        </button>

        {showOriginal && (
          <p className="text-[14px] italic leading-[1.7] text-tp-slate-400 bg-tp-slate-50 rounded-[6px] px-[8px] py-[6px]">
            &ldquo;{data.voiceText}&rdquo;
          </p>
        )}

        {/* Structured sections */}
        {data.sections.map((section) => (
          <div key={section.sectionId}>
            {/* Section header bar with hover copy icon */}
            <div className="group/section-header flex items-center gap-[5px] rounded-[4px] bg-tp-slate-50 px-2 py-[3px]">
              <TPMedicalIcon
                name={section.tpIconName}
                variant="bulk"
                size={12}
                color="var(--tp-slate-500, #64748B)"
              />
              <span className="flex-1 text-[12px] font-medium text-tp-slate-600">
                {section.title}
              </span>
              <span className={cn("transition-opacity", isTouch ? "opacity-70" : "opacity-0 group-hover/section-header:opacity-100")}>
                <ActionableTooltip
                  label={`Fill ${section.title.toLowerCase()} to RxPad`}
                  onAction={() => handleCopySection(section.sectionId, section.items)}
                >
                  <CopyIcon size={14} onClick={() => handleCopySection(section.sectionId, section.items)} />
                </ActionableTooltip>
              </span>
            </div>

            {/* Bullet items with per-item hover copy — structured name (detail) format */}
            <ul className="mt-1 flex flex-col gap-[2px] pl-1">
              {section.items.map((item, idx) => {
                const itemKey = `${section.sectionId}-${idx}`
                return (
                  <li
                    key={idx}
                    className="group/voice-item flex items-start gap-[6px] rounded-[4px] px-1 -mx-1 py-[2px] text-[14px] leading-[1.6] text-tp-slate-700 transition-colors hover:bg-tp-slate-50/80"
                  >
                    <span className="mt-[1px] flex-shrink-0 text-tp-slate-400">
                      •
                    </span>
                    <span className="flex-1 font-normal text-tp-slate-700">
                      {item.name}
                      {item.detail && (
                        <span className="ml-1 text-tp-slate-400">({item.detail})</span>
                      )}
                    </span>
                    <span className={cn("flex-shrink-0 transition-opacity", isTouch ? "opacity-70" : "opacity-0 group-hover/voice-item:opacity-100")}>
                      {copiedKey === itemKey ? (
                        <span className="text-[14px] text-tp-success-500 font-medium">Copied</span>
                      ) : (
                        <ActionableTooltip
                          label={`Fill to RxPad`}
                          onAction={() => handleCopyItem(item, itemKey)}
                        >
                          <CopyIcon
                            size={14}
                            onClick={() => handleCopyItem(item, itemKey)}
                          />
                        </ActionableTooltip>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

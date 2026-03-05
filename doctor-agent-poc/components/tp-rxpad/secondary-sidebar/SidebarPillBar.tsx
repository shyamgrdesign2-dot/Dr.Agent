"use client"

import { type SidebarPill, SIDEBAR_TAB_PILLS } from "./sidebar-pills"
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"

/**
 * Pill bar rendered at the bottom of each sidebar content panel.
 * Tapping a pill publishes a signal that the floating agent picks up
 * and injects as a user message in the chat.
 *
 * Design: sticky bottom, AI gradient pills matching chat canned pills,
 * fade overlay above for smooth content transition.
 * Spec ref: Part 4, Ch 01 — Sidebar Tab AI Pills
 */

const AI_PILL_CLASS =
  "rounded-full border-[0.5px] border-tp-violet-200/75 [background:linear-gradient(135deg,rgba(242,77,182,0.08)_0%,rgba(150,72,254,0.06)_52%,rgba(75,74,213,0.06)_100%)] px-2 py-0.5 text-[10px] font-medium text-tp-violet-700/90 transition-colors hover:bg-tp-violet-50/70"

const DANGER_PILL_CLASS =
  "rounded-full border-[0.5px] border-tp-error-200 bg-tp-error-50 px-2 py-0.5 text-[10px] font-medium text-tp-error-700 transition-colors hover:bg-tp-error-100"

export function SidebarPillBar({ sectionId }: { sectionId: string }) {
  const { publishSignal } = useRxPadSync()
  const pills = SIDEBAR_TAB_PILLS[sectionId]

  if (!pills || pills.length === 0) return null

  function handlePillClick(pill: SidebarPill) {
    publishSignal({
      type: "sidebar_pill_tap" as any,
      label: `${pill.icon} ${pill.label}`,
      sectionId,
    })
  }

  return (
    <>
      {/* Fade overlay — content fades out behind the pill bar */}
      <div className="pointer-events-none sticky bottom-[38px] z-[9] -mb-[2px] h-6 shrink-0 bg-gradient-to-t from-white/95 to-transparent" />

      {/* Pill bar */}
      <div className="sticky bottom-0 z-10 shrink-0 bg-white/95 px-2 pb-2 pt-1.5 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <div className="inline-flex min-w-max items-center gap-1.5">
            <span className="mr-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-[linear-gradient(91deg,rgba(213,101,234,0.2)_3%,rgba(103,58,172,0.18)_67%,rgba(26,25,148,0.15)_130%)]">
              <span className="text-[8px]">✦</span>
            </span>
            {pills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillClick(pill)}
                className={`inline-flex items-center gap-1 whitespace-nowrap ${pill.danger ? DANGER_PILL_CLASS : AI_PILL_CLASS}`}
              >
                <span className="text-[10px]">{pill.icon}</span>
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

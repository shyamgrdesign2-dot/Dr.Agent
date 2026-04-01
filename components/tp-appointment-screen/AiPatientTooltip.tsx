"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { AiBrandSparkIcon, AI_GRADIENT, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import { highlightClinicalText } from "@/components/tp-rxpad/dr-agent/shared/highlightClinicalText"

// ─────────────────────────────────────────────────────────────
// AiPatientTooltip — hover tooltip over AI icon on appointment rows
// Portal-based rendering to escape overflow-hidden parents
// ─────────────────────────────────────────────────────────────

interface AiPatientTooltipProps {
  patientId: string
  summary?: string
  tabVariant?: "queue" | "finished" | "cancelled" | "draft" | "pending-digitisation"
  /** Structured data for non-queue tabs */
  rowData?: {
    finishedData?: { symptoms: string; diagnosis: string; medication: string; investigations: string; followUp?: string; completedAt: string }
    cancelReason?: string; cancelledAt?: string; cancelNotes?: string
    draftStatus?: { symptoms: boolean; diagnosis: boolean; medCount: number; advice: boolean; investigations: boolean; followUp: boolean; lastModified: string }
    dischargeData?: { admittedDate: string; ward: string; bed: string; currentStatus: string; pending: { dischargeSummary: boolean; billing: boolean; pendingLabs?: string; notes?: string } }
  }
  onClick: () => void
}

/* highlightSummaryText removed — now using shared highlightClinicalText from @/components/tp-rxpad/dr-agent/shared/highlightClinicalText */

/** Build tooltip content for non-queue tabs */
function buildTabTooltipContent(tab: string | undefined, rowData?: AiPatientTooltipProps["rowData"]): React.ReactNode | null {
  if (!tab || tab === "queue" || !rowData) return null

  if (tab === "finished" && rowData.finishedData) {
    const d = rowData.finishedData
    return (
      <div className="space-y-[3px] text-[11px] text-tp-slate-600">
        <p><span className="font-semibold text-tp-slate-700">Came for:</span> {d.symptoms}</p>
        <p><span className="font-semibold text-tp-slate-700">Diagnosed:</span> {d.diagnosis}</p>
        <p><span className="font-semibold text-tp-slate-700">Prescribed:</span> {d.medication}</p>
        <p><span className="font-semibold text-tp-slate-700">Ordered:</span> {d.investigations}</p>
        {d.followUp && <p><span className="font-semibold text-tp-slate-700">Follow-up:</span> {d.followUp}</p>}
      </div>
    )
  }

  if (tab === "cancelled") {
    return (
      <div className="space-y-[3px] text-[11px] text-tp-slate-600">
        <p><span className="font-semibold text-tp-slate-700">Reason:</span> {rowData.cancelReason || "No cancellation reason recorded"}</p>
        {rowData.cancelledAt && <p><span className="font-semibold text-tp-slate-700">Cancelled at:</span> {rowData.cancelledAt}</p>}
        {rowData.cancelNotes && <p><span className="font-semibold text-tp-slate-700">Notes:</span> {rowData.cancelNotes}</p>}
      </div>
    )
  }

  if (tab === "draft" && rowData.draftStatus) {
    const d = rowData.draftStatus
    const check = (filled: boolean) => filled ? "✓" : "✗"
    const color = (filled: boolean) => filled ? "text-tp-green-600" : "text-tp-error-500"
    return (
      <div className="space-y-[2px] text-[11px]">
        <p className={color(d.symptoms)}>{check(d.symptoms)} Symptoms {d.symptoms ? "entered" : "empty"}</p>
        <p className={color(d.diagnosis)}>{check(d.diagnosis)} Diagnosis {d.diagnosis ? "entered" : "empty"}</p>
        <p className={color(d.medCount > 0)}>{check(d.medCount > 0)} Medications{d.medCount > 0 ? `: ${d.medCount} drugs` : ": empty"}</p>
        <p className={color(d.advice)}>{check(d.advice)} Advice {d.advice ? "entered" : "empty"}</p>
        <p className={color(d.investigations)}>{check(d.investigations)} Investigations {d.investigations ? "entered" : "empty"}</p>
        <p className={color(d.followUp)}>{check(d.followUp)} Follow-up {d.followUp ? "set" : "not set"}</p>
        <p className="text-[10px] text-tp-slate-400 mt-[2px]">Last modified: {d.lastModified}</p>
      </div>
    )
  }

  if (tab === "pending-digitisation" && rowData.dischargeData) {
    const d = rowData.dischargeData
    const check = (done: boolean) => done ? "✓" : "✗"
    const color = (done: boolean) => done ? "text-tp-green-600" : "text-tp-error-500"
    return (
      <div className="space-y-[2px] text-[11px]">
        <p className="text-tp-slate-700"><span className="font-semibold">Admitted:</span> {d.admittedDate} · {d.ward}, {d.bed}</p>
        <p className="text-tp-slate-700"><span className="font-semibold">Status:</span> {d.currentStatus}</p>
        <div className="mt-[4px] space-y-[1px]">
          <p className="text-[10px] font-semibold text-tp-slate-500 uppercase tracking-wider">Pending Items</p>
          <p className={color(d.pending.dischargeSummary)}>{check(d.pending.dischargeSummary)} Discharge summary</p>
          <p className={color(d.pending.billing)}>{check(d.pending.billing)} Final billing</p>
          {d.pending.pendingLabs && <p className="text-tp-error-500">✗ {d.pending.pendingLabs}</p>}
          {d.pending.notes && <p className="text-[10px] text-tp-slate-400 italic">{d.pending.notes}</p>}
        </div>
      </div>
    )
  }

  return null
}

export function AiPatientTooltip({ patientId, summary, tabVariant, rowData, onClick }: AiPatientTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const [pos, setPos] = useState<{
    top: number
    left: number
    arrowRight: number
  } | null>(null)

  /* ── Position calculation ──────────────────────────── */

  const updatePosition = useCallback(() => {
    if (!containerRef.current || !tooltipRef.current) return

    const triggerRect = containerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const MARGIN = 8
    const GAP = 10

    const tooltipW = 300 // fixed width

    // Position: right-aligned with the trigger button, above it
    let left = triggerRect.right - tooltipW
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - tooltipW - MARGIN))

    // Arrow points at center of trigger
    const triggerCenterX = triggerRect.left + triggerRect.width / 2
    const arrowRight = Math.max(10, Math.min(triggerRect.right - triggerCenterX, tooltipW - 10))

    const top = triggerRect.top - GAP - tooltipRect.height

    setPos({ top, left, arrowRight })
  }, [])

  // Reposition when tooltip is visible
  useEffect(() => {
    if (!isVisible) {
      setPos(null)
      return
    }
    requestAnimationFrame(updatePosition)
  }, [isVisible, updatePosition])

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isVisible) return
    const reposition = () => requestAnimationFrame(updatePosition)
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)
    return () => {
      window.removeEventListener("scroll", reposition, true)
      window.removeEventListener("resize", reposition)
    }
  }, [isVisible, updatePosition])

  /* ── Hover/click handlers ──────────────────────────── */

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  const handleMouseEnter = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    showTimerRef.current = setTimeout(() => setIsVisible(true), 300)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    hideTimerRef.current = setTimeout(() => setIsVisible(false), 200)
  }, [])

  const handleClick = useCallback(() => {
    clearTimers()
    setIsVisible(false)
    onClick()
  }, [onClick, clearTimers])

  /* ── Portal tooltip ────────────────────────────────── */

  const tabContent = buildTabTooltipContent(tabVariant, rowData)
  const hasContent = summary || tabContent

  const tooltip =
    isVisible && hasContent && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999]"
            style={
              pos
                ? { top: pos.top, left: pos.left, width: 300, opacity: 1, transition: "opacity 120ms ease-out" }
                : { top: -9999, left: -9999, width: 300, opacity: 0 }
            }
            onMouseEnter={() => {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="rounded-[12px] bg-white overflow-hidden"
              style={{
                boxShadow: "0 4px 20px rgba(103,58,172,0.12)",
                border: "1px solid rgba(103,58,172,0.15)",
              }}
            >
              {/* Top accent gradient line */}
              <div className="h-[2px] w-full" style={{ background: AI_GRADIENT }} />

              <div className="px-[12px] py-[10px]">
                {/* Header: spark + Dr. Agent */}
                <div className="flex items-center gap-[5px] mb-[8px]">
                  <AiBrandSparkIcon size={18} withBackground />
                  <span
                    className="text-[10px] font-semibold leading-[1.2]"
                    style={{
                      background: AI_GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Dr. Agent
                  </span>
                </div>

                {/* Summary text — tab-aware content */}
                {tabContent ? (
                  <div className="mb-[8px]">{tabContent}</div>
                ) : summary ? (
                  <p className="whitespace-normal break-words text-[12px] italic leading-[1.6] text-tp-slate-500 mb-[8px]">
                    {highlightClinicalText(summary)}
                  </p>
                ) : null}

                {/* Footer */}
                <div className="flex items-center justify-end">
                  <span className="text-[10px] text-tp-slate-400">
                    Click to open Dr. Agent →
                  </span>
                </div>
              </div>
            </div>

            {/* Downward-pointing arrow */}
            <div className="flex justify-end" style={{ paddingRight: pos ? pos.arrowRight - 6 : 16 }}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "6px solid white",
                  filter: "drop-shadow(0 1px 1px rgba(103,58,172,0.1))",
                }}
              />
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* AI Spark button */}
      <button
        type="button"
        aria-label="AI action"
        onClick={handleClick}
        className="shrink-0 inline-flex size-[42px] items-center justify-center rounded-[10px] transition-all hover:opacity-80 hover:scale-105"
      >
        <AiBrandSparkIcon size={42} withBackground />
      </button>

      {tooltip}
    </div>
  )
}

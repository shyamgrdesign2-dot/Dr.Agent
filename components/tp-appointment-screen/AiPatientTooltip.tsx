"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { highlightClinicalText } from "@/components/tp-rxpad/dr-agent/shared/highlightClinicalText"

// ─────────────────────────────────────────────────────────────
// AiPatientTooltip
//
// • Click AI icon → parent opens Dr. Agent (auto user message + loader there)
// • Hover: teaser pill until snapshot exists in agent; after delivery, hover shows summary
// ─────────────────────────────────────────────────────────────

interface AiPatientTooltipProps {
  patientId: string
  summary?: string
  tabVariant?: "queue" | "finished" | "cancelled" | "draft" | "pending-digitisation"
  rowData?: {
    finishedData?: { symptoms: string; diagnosis: string; medication: string; investigations: string; followUp?: string; completedAt: string }
    cancelReason?: string; cancelledAt?: string; cancelNotes?: string
    draftStatus?: { symptoms: boolean; diagnosis: boolean; medCount: number; advice: boolean; investigations: boolean; followUp: boolean; lastModified: string }
    dischargeData?: { admittedDate: string; ward: string; bed: string; currentStatus: string; pending: { dischargeSummary: boolean; billing: boolean; pendingLabs?: string; notes?: string } }
  }
  /** Opens Dr. Agent (send canned snapshot prompt from parent) */
  onOpenAgent: () => void
  /** True after agent has shown this patient’s quick snapshot — then hover reveals summary */
  summaryHoverUnlocked?: boolean
}

/** Build tooltip content for non-queue tabs */
function buildTabTooltipContent(tab: string | undefined, rowData?: AiPatientTooltipProps["rowData"]): React.ReactNode | null {
  if (!tab || tab === "queue" || !rowData) return null

  if (tab === "finished" && rowData.finishedData) {
    const d = rowData.finishedData
    return (
      <div className="space-y-[3px] text-[12px] text-tp-slate-600">
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
      <div className="space-y-[3px] text-[12px] text-tp-slate-600">
        <p><span className="font-semibold text-tp-slate-700">Reason:</span> {rowData.cancelReason || "No cancellation reason recorded"}</p>
        {rowData.cancelledAt && <p><span className="font-semibold text-tp-slate-700">Cancelled at:</span> {rowData.cancelledAt}</p>}
        {rowData.cancelNotes && <p><span className="font-semibold text-tp-slate-700">Notes:</span> {rowData.cancelNotes}</p>}
      </div>
    )
  }

  if (tab === "draft" && rowData.draftStatus) {
    const d = rowData.draftStatus
    const check = (filled: boolean) => (filled ? "\u2713" : "\u2717")
    const color = (filled: boolean) => (filled ? "text-tp-green-600" : "text-tp-error-500")
    return (
      <div className="space-y-[2px] text-[12px]">
        <p className={color(d.symptoms)}>{check(d.symptoms)} Symptoms {d.symptoms ? "entered" : "empty"}</p>
        <p className={color(d.diagnosis)}>{check(d.diagnosis)} Diagnosis {d.diagnosis ? "entered" : "empty"}</p>
        <p className={color(d.medCount > 0)}>{check(d.medCount > 0)} Medications{d.medCount > 0 ? `: ${d.medCount} drugs` : ": empty"}</p>
        <p className={color(d.advice)}>{check(d.advice)} Advice {d.advice ? "entered" : "empty"}</p>
        <p className={color(d.investigations)}>{check(d.investigations)} Investigations {d.investigations ? "entered" : "empty"}</p>
        <p className={color(d.followUp)}>{check(d.followUp)} Follow-up {d.followUp ? "set" : "not set"}</p>
        <p className="text-[11px] text-tp-slate-400 mt-[2px]">Last modified: {d.lastModified}</p>
      </div>
    )
  }

  if (tab === "pending-digitisation" && rowData.dischargeData) {
    const d = rowData.dischargeData
    const check = (done: boolean) => (done ? "\u2713" : "\u2717")
    const color = (done: boolean) => (done ? "text-tp-green-600" : "text-tp-error-500")
    return (
      <div className="space-y-[2px] text-[12px]">
        <p className="text-tp-slate-700"><span className="font-semibold">Admitted:</span> {d.admittedDate} · {d.ward}, {d.bed}</p>
        <p className="text-tp-slate-700"><span className="font-semibold">Status:</span> {d.currentStatus}</p>
        <div className="mt-[4px] space-y-[1px]">
          <p className="text-[11px] font-semibold text-tp-slate-500 uppercase tracking-wider">Pending Items</p>
          <p className={color(d.pending.dischargeSummary)}>{check(d.pending.dischargeSummary)} Discharge summary</p>
          <p className={color(d.pending.billing)}>{check(d.pending.billing)} Final billing</p>
          {d.pending.pendingLabs && (
            <p className="text-tp-error-500">
              {"\u2717 "}
              {d.pending.pendingLabs}
            </p>
          )}
          {d.pending.notes && <p className="text-[11px] text-tp-slate-400 italic">{d.pending.notes}</p>}
        </div>
      </div>
    )
  }

  return null
}

export function AiPatientTooltip({
  patientId: _patientId,
  summary,
  tabVariant,
  rowData,
  onOpenAgent,
  summaryHoverUnlocked = false,
}: AiPatientTooltipProps) {
  const [phase, setPhase] = useState<"idle" | "hover" | "summary">("idle")

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const supportsHover = useRef(
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  )

  const [pos, setPos] = useState<{ top: number; left: number; arrowRight: number } | null>(null)
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null)

  const tabContent = buildTabTooltipContent(tabVariant, rowData)
  const hasHoverCardContent = !!(summary || tabContent)

  const updatePosition = useCallback(() => {
    if (!containerRef.current || !tooltipRef.current) return

    const triggerRect = containerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const MARGIN = 8
    const GAP = 10
    const tooltipW = 300

    let left = triggerRect.right - tooltipW
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - tooltipW - MARGIN))

    const triggerCenterX = triggerRect.left + triggerRect.width / 2
    const arrowRight = Math.max(10, Math.min(triggerRect.right - triggerCenterX, tooltipW - 10))

    const top = triggerRect.top - GAP - tooltipRect.height

    setPos({ top, left, arrowRight })
  }, [])

  const updateHoverPosition = useCallback(() => {
    if (!containerRef.current) return

    const triggerRect = containerRef.current.getBoundingClientRect()
    const pillW = 160

    const left = triggerRect.left + triggerRect.width / 2 - pillW / 2
    const top = triggerRect.top - 36

    setHoverPos({
      top,
      left: Math.max(8, Math.min(left, window.innerWidth - pillW - 8)),
    })
  }, [])

  useEffect(() => {
    if (phase !== "summary") {
      setPos(null)
      return
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition)
    })
  }, [phase, updatePosition])

  useEffect(() => {
    if (phase !== "hover") {
      setHoverPos(null)
      return
    }
    updateHoverPosition()
  }, [phase, updateHoverPosition])

  useEffect(() => {
    if (phase === "idle") return
    const reposition = () => {
      requestAnimationFrame(() => {
        if (phase === "hover") updateHoverPosition()
        else updatePosition()
      })
    }
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)
    return () => {
      window.removeEventListener("scroll", reposition, true)
      window.removeEventListener("resize", reposition)
    }
  }, [phase, updatePosition, updateHoverPosition])

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  useEffect(() => {
    if (phase !== "summary") return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      ) return
      setPhase("idle")
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhase("idle")
    }
    const rafId = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    })
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [phase])

  const handleMouseEnter = useCallback(() => {
    if (!supportsHover.current) return
    if (phase === "summary") return
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)

    if (summaryHoverUnlocked && hasHoverCardContent) {
      showTimerRef.current = setTimeout(() => setPhase("summary"), 300)
    } else {
      showTimerRef.current = setTimeout(() => setPhase("hover"), 400)
    }
  }, [phase, summaryHoverUnlocked, hasHoverCardContent])

  const handleMouseLeave = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    if (phase === "hover") {
      setPhase("idle")
    }
    if (phase === "summary") {
      hideTimerRef.current = setTimeout(() => setPhase("idle"), 200)
    }
  }, [phase])

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      clearTimers()
      setPhase("idle")
      onOpenAgent()
    },
    [onOpenAgent, clearTimers],
  )

  const hoverPill =
    phase === "hover" && supportsHover.current && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={
              hoverPos
                ? { top: hoverPos.top, left: hoverPos.left, opacity: 1, transition: "opacity 150ms ease-out" }
                : { top: -9999, left: -9999, opacity: 0 }
            }
          >
            <div
              className="rounded-[6px] px-[12px] py-[6px] text-[11px] font-medium text-white whitespace-nowrap"
              style={{ background: "#171725" }}
            >
              Patient&apos;s quick summary
            </div>
            <div className="flex justify-center">
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "5px solid #171725",
                }}
              />
            </div>
          </div>,
          document.body,
        )
      : null

  const expandedTooltip =
    phase === "summary" && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999]"
            style={
              pos
                ? { top: pos.top, left: pos.left, width: 300, opacity: 1, transition: "opacity 150ms ease-out" }
                : { top: -9999, left: -9999, width: 300, opacity: 0 }
            }
            onMouseEnter={() => {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            }}
            onMouseLeave={() => {
              hideTimerRef.current = setTimeout(() => setPhase("idle"), 200)
            }}
          >
            <div
              className="rounded-[12px] bg-white overflow-hidden"
              style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div className="h-[2.5px]" style={{ background: "linear-gradient(90deg, #D565EA 0%, #8B5CF6 40%, #4F46E5 100%)" }} />

              <div className="px-[14px] py-[12px]" style={{ animation: "fadeIn 300ms ease-out" }}>
                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                <div className="flex items-center gap-[6px] mb-[8px]">
                  <AiBrandSparkIcon size={18} withBackground />
                  {tabVariant === "finished" ? (
                    <p className="text-[12px] font-semibold text-tp-slate-700">Consultation Summary</p>
                  ) : tabVariant === "cancelled" ? (
                    <p className="text-[12px] font-semibold text-tp-slate-700">Cancellation Details</p>
                  ) : tabVariant === "draft" || tabVariant === "pending-digitisation" ? (
                    <p className="text-[12px] font-semibold text-tp-slate-700">Dr. Agent</p>
                  ) : (
                    <p className="text-[12px] font-semibold text-tp-slate-700">Patient Summary</p>
                  )}
                </div>

                {tabContent ? (
                  <div className="mb-[10px]">{tabContent}</div>
                ) : summary ? (
                  <p className="whitespace-normal break-words text-[12px] leading-[18px] text-tp-slate-500 mb-[10px]">
                    {highlightClinicalText(summary)}
                  </p>
                ) : (
                  <p className="text-[12px] text-tp-slate-400 mb-[10px]">No summary available for this patient.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end" style={{ paddingRight: pos ? pos.arrowRight - 6 : 16 }}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "6px solid white",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.06))",
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
      <button
        type="button"
        aria-label="Open Dr. Agent with quick clinical snapshot"
        onClick={handleIconClick}
        className="shrink-0 inline-flex size-[42px] items-center justify-center rounded-[10px] transition-all hover:opacity-80 hover:scale-105"
      >
        <AiBrandSparkIcon size={42} withBackground />
      </button>

      {hoverPill}
      {expandedTooltip}
    </div>
  )
}

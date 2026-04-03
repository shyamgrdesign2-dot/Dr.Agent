"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { highlightClinicalText } from "@/components/tp-rxpad/dr-agent/shared/highlightClinicalText"

// ─────────────────────────────────────────────────────────────
// AiPatientTooltip — 3-phase progressive disclosure
//
// Phase 1: Hover (desktop) → dark pill "Patient's quick summary"
// Phase 2: Click → shimmer loader → patient summary tooltip
// Phase 3: CTA → opens full agent panel
// ─────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Fetching patient data",
  "Analyzing clinical history",
  "Preparing summary",
]

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
  onClick: () => void
  onViewSummary?: () => void
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
    const check = (filled: boolean) => filled ? "✓" : "✗"
    const color = (filled: boolean) => filled ? "text-tp-green-600" : "text-tp-error-500"
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
    const check = (done: boolean) => done ? "✓" : "✗"
    const color = (done: boolean) => done ? "text-tp-green-600" : "text-tp-error-500"
    return (
      <div className="space-y-[2px] text-[12px]">
        <p className="text-tp-slate-700"><span className="font-semibold">Admitted:</span> {d.admittedDate} · {d.ward}, {d.bed}</p>
        <p className="text-tp-slate-700"><span className="font-semibold">Status:</span> {d.currentStatus}</p>
        <div className="mt-[4px] space-y-[1px]">
          <p className="text-[11px] font-semibold text-tp-slate-500 uppercase tracking-wider">Pending Items</p>
          <p className={color(d.pending.dischargeSummary)}>{check(d.pending.dischargeSummary)} Discharge summary</p>
          <p className={color(d.pending.billing)}>{check(d.pending.billing)} Final billing</p>
          {d.pending.pendingLabs && <p className="text-tp-error-500">✗ {d.pending.pendingLabs}</p>}
          {d.pending.notes && <p className="text-[11px] text-tp-slate-400 italic">{d.pending.notes}</p>}
        </div>
      </div>
    )
  }

  return null
}

/** Shimmer line component */
function ShimmerLine({ width }: { width: string }) {
  return (
    <div
      className="h-[10px] rounded-full overflow-hidden"
      style={{ width }}
    >
      <div
        className="h-full w-full"
        style={{
          background: "linear-gradient(90deg, #F1F1F5 25%, #E2E2EA 37%, #F1F1F5 63%)",
          backgroundSize: "200% 100%",
          animation: "tooltipShimmer 1.5s ease-in-out infinite",
        }}
      />
    </div>
  )
}

export function AiPatientTooltip({ patientId, summary, tabVariant, rowData, onClick, onViewSummary }: AiPatientTooltipProps) {
  // Phase: idle → hover (desktop) → loading (click) → summary (loaded)
  const [phase, setPhase] = useState<"idle" | "hover" | "loading" | "summary">("idle")
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  // Track if summary was ever generated — once true, hover shows summary directly
  const [summaryGenerated, setSummaryGenerated] = useState(false)

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const hoverPillRef = useRef<HTMLDivElement>(null)

  // Detect if device supports hover (desktop vs iPad)
  const supportsHover = useRef(
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  )

  const [pos, setPos] = useState<{ top: number; left: number; arrowRight: number } | null>(null)
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null)

  /* ── Position calculation for expanded tooltip ──────── */

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

  /* ── Position for small hover pill ──────────────────── */

  const updateHoverPosition = useCallback(() => {
    if (!containerRef.current) return

    const triggerRect = containerRef.current.getBoundingClientRect()
    const pillW = 160 // approx width of "Patient's quick summary"

    const left = triggerRect.left + triggerRect.width / 2 - pillW / 2
    const top = triggerRect.top - 36 // pill height + gap

    setHoverPos({
      top,
      left: Math.max(8, Math.min(left, window.innerWidth - pillW - 8)),
    })
  }, [])

  // Reposition expanded tooltip — double-RAF to ensure DOM has painted new content
  useEffect(() => {
    if (phase !== "loading" && phase !== "summary") {
      setPos(null)
      return
    }
    // First RAF: let React commit the render. Second RAF: DOM has painted, measure correctly.
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition)
    })
  }, [phase, updatePosition])

  // Reposition hover pill
  useEffect(() => {
    if (phase !== "hover") {
      setHoverPos(null)
      return
    }
    updateHoverPosition()
  }, [phase, updateHoverPosition])

  // Scroll/resize repositioning
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

  /* ── Rotating loading messages ──────────────────────── */

  useEffect(() => {
    if (phase !== "loading") {
      setLoadingMsgIndex(0)
      return
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [phase])

  /* ── Timer cleanup ──────────────────────────────────── */

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current)
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  /* ── Click outside to close ─────────────────────────── */

  useEffect(() => {
    if (phase !== "loading" && phase !== "summary") return
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
    // Defer listener registration by one frame so the click that opened
    // the tooltip doesn't immediately trigger the click-outside handler
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

  /* ── Hover handlers (desktop only) ──────────────────── */

  const handleMouseEnter = useCallback(() => {
    if (!supportsHover.current) return
    if (phase === "loading" || phase === "summary") return // don't override expanded state
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    // If summary was previously generated, show it directly on hover (no dark pill)
    if (summaryGenerated) {
      showTimerRef.current = setTimeout(() => setPhase("summary"), 300)
    } else {
      showTimerRef.current = setTimeout(() => setPhase("hover"), 400)
    }
  }, [phase, summaryGenerated])

  const handleMouseLeave = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    if (phase === "hover") {
      setPhase("idle")
    }
    // If showing summary via hover (after first generation), auto-hide on leave
    if (phase === "summary" && summaryGenerated) {
      hideTimerRef.current = setTimeout(() => setPhase("idle"), 200)
    }
  }, [phase, summaryGenerated])

  /* ── Click handler → Phase 2 (loading → summary) ───── */

  const handleClick = useCallback(() => {
    clearTimers()

    // If already showing summary, close it
    if (phase === "summary") {
      setPhase("idle")
      return
    }

    // Start loading phase
    setPhase("loading")

    // Simulate data fetch — transition to summary after 1.5s
    loadTimerRef.current = setTimeout(() => {
      setPhase("summary")
      setSummaryGenerated(true)
    }, 1500)
  }, [phase, clearTimers])

  /* ── View Detailed Summary → Open agent panel ───────── */

  const handleViewSummary = useCallback(() => {
    clearTimers()
    setPhase("idle")
    if (onViewSummary) onViewSummary()
    else onClick()
  }, [onClick, onViewSummary, clearTimers])

  /* ── Render: Small dark hover pill (Phase 1) ────────── */

  const hoverPill =
    phase === "hover" && supportsHover.current && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={hoverPillRef}
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
            {/* Small arrow pointing down */}
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

  /* ── Render: Expanded tooltip (Phase 2 + 3) ─────────── */

  const tabContent = buildTabTooltipContent(tabVariant, rowData)
  const hasContent = summary || tabContent

  const expandedTooltip =
    (phase === "loading" || phase === "summary") && typeof document !== "undefined"
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
              // Keep tooltip alive while hovering over it
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            }}
            onMouseLeave={() => {
              // When mouse leaves tooltip, hide if this is a hover-triggered summary
              if (phase === "summary" && summaryGenerated) {
                hideTimerRef.current = setTimeout(() => setPhase("idle"), 200)
              }
            }}
          >
            {/* Inject shimmer + ellipsis keyframes */}
            <style>{`
              @keyframes tooltipShimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              @keyframes tooltipSlideIn {
                0% { transform: translateY(8px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
              @keyframes tooltipSlideOut {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-8px); opacity: 0; }
              }
              @keyframes tooltipEllipsisFade {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
              }
            `}</style>

            <div
              className="rounded-[12px] bg-white overflow-hidden"
              style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {/* Gradient accent top bar */}
              <div className="h-[2.5px]" style={{ background: "linear-gradient(90deg, #D565EA 0%, #8B5CF6 40%, #4F46E5 100%)" }} />

              <div className="px-[14px] py-[12px]">
                {phase === "loading" ? (
                  /* ── SHIMMER LOADING STATE ── */
                  <div>
                    {/* Header with AI icon — no loading text here */}
                    <div className="flex items-center gap-[6px] mb-[10px]">
                      <AiBrandSparkIcon size={18} withBackground />
                      <p className="text-[12px] font-semibold text-tp-slate-700">Patient Summary</p>
                    </div>

                    {/* Shimmer lines */}
                    <div className="space-y-[8px] mb-[14px]">
                      <ShimmerLine width="100%" />
                      <ShimmerLine width="85%" />
                      <ShimmerLine width="70%" />
                      <ShimmerLine width="50%" />
                    </div>

                    {/* Carousel loader — same pattern as TypingIndicator */}
                    <div className="flex items-center justify-center overflow-hidden h-[14px]">
                      <span
                        key={loadingMsgIndex}
                        className="inline-flex items-center whitespace-nowrap text-[10px] font-medium"
                        style={{
                          color: "#8B8B96",
                          animation: "tooltipSlideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                        }}
                      >
                        {LOADING_MESSAGES[loadingMsgIndex]}
                        <span className="inline ml-0" style={{ letterSpacing: "0.5px" }}>
                          <span className="inline-block" style={{ animation: "tooltipEllipsisFade 1.4s ease-in-out infinite", animationDelay: "0ms", opacity: 0.3 }}>.</span>
                          <span className="inline-block" style={{ animation: "tooltipEllipsisFade 1.4s ease-in-out infinite", animationDelay: "180ms", opacity: 0.3 }}>.</span>
                          <span className="inline-block" style={{ animation: "tooltipEllipsisFade 1.4s ease-in-out infinite", animationDelay: "360ms", opacity: 0.3 }}>.</span>
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  /* ── SUMMARY LOADED STATE ── */
                  <div style={{ animation: "fadeIn 300ms ease-out" }}>
                    <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                    {/* Header — tab-aware */}
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

                    {/* Content — tab-aware */}
                    {tabContent ? (
                      <div className="mb-[10px]">{tabContent}</div>
                    ) : summary ? (
                      <p className="whitespace-normal break-words text-[12px] leading-[18px] text-tp-slate-500 mb-[10px]">
                        {highlightClinicalText(summary)}
                      </p>
                    ) : (
                      <p className="text-[12px] text-tp-slate-400 mb-[10px]">No summary available for this patient.</p>
                    )}

                    {/* CTA: View Detailed Summary */}
                    <button
                      type="button"
                      onClick={handleViewSummary}
                      className="w-full flex items-center justify-center rounded-[8px] py-[6px] text-[12px] font-semibold transition-all hover:bg-purple-50/30"
                      style={{
                        border: "1px solid rgba(139, 92, 246, 0.25)",
                        background: "transparent",
                      }}
                    >
                      <span
                        style={{
                          background: "linear-gradient(90deg, #D565EA 0%, #8B5CF6 30%, #4F46E5 60%, #8B5CF6 100%)",
                          backgroundSize: "200% 100%",
                          animation: "aiShimmer 3s ease-in-out infinite",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        View Detailed Summary
                      </span>
                    </button>
                  </div>
                )}
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
      {/* AI Spark button */}
      <button
        type="button"
        aria-label="Patient's quick summary"
        onClick={handleClick}
        className="shrink-0 inline-flex size-[42px] items-center justify-center rounded-[10px] transition-all hover:opacity-80 hover:scale-105"
      >
        <AiBrandSparkIcon size={42} withBackground />
      </button>

      {hoverPill}
      {expandedTooltip}
    </div>
  )
}

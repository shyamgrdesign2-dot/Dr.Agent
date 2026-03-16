"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { DrAgentFab } from "@/components/tp-rxpad/dr-agent/shell/DrAgentFab"
import { RxPad } from "@/components/rx/rxpad/RxPad"
import { DrAgentPanel } from "@/components/tp-rxpad/dr-agent/DrAgentPanel"
import { RxPadSyncProvider, useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"
import { RX_CONTEXT_OPTIONS } from "@/components/tp-rxpad/dr-agent/constants"
import {
  TPRxPadSecondarySidebar,
  TPRxPadShell,
  TPRxPadTopNav,
} from "@/components/tp-ui"

function RxPadPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get("patientId") ?? "__patient__"
  const patient = useMemo(
    () => RX_CONTEXT_OPTIONS.find((p) => p.id === patientId) ?? RX_CONTEXT_OPTIONS[0],
    [patientId],
  )
  const { lastSignal } = useRxPadSync()
  const [isAgentOpen, setIsAgentOpen] = useState(true)
  const [hasNudge, setHasNudge] = useState(false)

  const handleSidebarSectionSelect = useCallback(
    (sectionId: string | null) => {
      if (isAgentOpen && sectionId && sectionId !== "drAgent") {
        setIsAgentOpen(false)
      }
    },
    [isAgentOpen],
  )

  useEffect(() => {
    if (!lastSignal) return
    if (lastSignal.type === "sidebar_pill_tap" || lastSignal.type === "ai_trigger") {
      // Pill tap or AI trigger → always open agent and clear nudge
      if (!isAgentOpen) {
        setIsAgentOpen(true)
        setHasNudge(false)
      }
    } else if (!isAgentOpen) {
      setHasNudge(true)
    }
  }, [lastSignal, isAgentOpen])

  return (
    <TPRxPadShell
      topNav={
        <TPRxPadTopNav
          className="relative h-[62px] w-full bg-white"
          onBack={() => router.push("/")}
          patientName={patient.label}
          patientMeta={`${patient.gender === "M" ? "Male" : "Female"}, ${patient.age}y`}
          onVisitSummary={() =>
            router.push(
              `/patient-details?patientId=${encodeURIComponent(patientId)}&name=${encodeURIComponent(patient.label)}&gender=${patient.gender}&age=${patient.age}&from=rxpad`,
            )
          }
        />
      }
      sidebar={
        <TPRxPadSecondarySidebar
          collapseExpandedOnly={isAgentOpen}
          onSectionSelect={handleSidebarSectionSelect}
        />
      }
    >
      <div className="relative flex h-full min-w-0">
        <div className={`min-w-0 flex-1 ${isAgentOpen ? "md:pr-[320px] lg:pr-[392px]" : ""}`}>
          <RxPad patientId={patientId} />
        </div>
        {isAgentOpen ? (
          <div className="pointer-events-none fixed right-0 top-[62px] z-30 hidden h-[calc(100vh-62px)] w-[320px] md:block lg:w-[392px]">
            <div className="pointer-events-auto h-full w-full">
              <DrAgentPanel onClose={() => setIsAgentOpen(false)} initialPatientId={patientId} />
            </div>
          </div>
        ) : null}
        {!isAgentOpen && (
          <DrAgentFab
            onClick={() => { setIsAgentOpen(true); setHasNudge(false) }}
            hasNudge={hasNudge}
          />
        )}
      </div>
    </TPRxPadShell>
  )
}

export function RxPadPage() {
  return (
    <Suspense fallback={null}>
      <RxPadSyncProvider>
        <RxPadPageInner />
      </RxPadSyncProvider>
    </Suspense>
  )
}

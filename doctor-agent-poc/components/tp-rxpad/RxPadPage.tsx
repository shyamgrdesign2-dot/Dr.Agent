"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import { RxPad } from "@/components/rx/rxpad/RxPad"
import { RxPadFloatingAgent } from "@/components/tp-rxpad/RxPadFloatingAgent"
import { RxPadSyncProvider, useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"
import {
  TPRxPadSecondarySidebar,
  TPRxPadShell,
  TPRxPadTopNav,
} from "@/components/tp-ui"

function RxPadPageInner() {
  const router = useRouter()
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
    if (lastSignal && !isAgentOpen) {
      setHasNudge(true)
    }
  }, [lastSignal, isAgentOpen])

  return (
    <TPRxPadShell
      topNav={
        <TPRxPadTopNav
          className="relative h-[62px] w-full bg-white"
          onBack={() => router.push("/")}
          onVisitSummary={() =>
            router.push(
              "/patient-details?patientId=pat0061&name=Shyam%20GR&gender=M&age=25&from=rxpad",
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
        <div className={`min-w-0 flex-1 ${isAgentOpen ? "md:pr-[392px]" : ""}`}>
          <RxPad />
        </div>
        {isAgentOpen ? (
          <div className="pointer-events-none fixed right-0 top-[62px] z-30 hidden h-[calc(100vh-62px)] w-[392px] md:block">
            <div className="pointer-events-auto h-full w-full">
              <RxPadFloatingAgent onClose={() => setIsAgentOpen(false)} />
            </div>
          </div>
        ) : null}
        {!isAgentOpen && (
          <div className="fixed right-0 top-1/2 z-40 -translate-y-1/2">
            <button
              type="button"
              onClick={() => {
                setIsAgentOpen(true)
                setHasNudge(false)
              }}
              aria-label="Open doctor agent"
              className="relative flex h-[132px] w-[34px] flex-col items-center justify-center gap-2 overflow-visible rounded-l-[16px] border-[0.5px] border-r-0 border-tp-violet-300/70 bg-[linear-gradient(180deg,rgba(242,77,182,0.16)_0%,rgba(150,72,254,0.16)_52%,rgba(75,74,213,0.16)_100%)] backdrop-blur-sm"
            >
              <span className="absolute -left-[6px] top-1/2 h-9 w-[7px] -translate-y-1/2 rounded-l-full bg-[linear-gradient(180deg,rgba(242,77,182,0.45)_0%,rgba(150,72,254,0.45)_55%,rgba(75,74,213,0.45)_100%)]" />
              <span
                className="inline-flex size-5 items-center justify-center rounded-[8px] border-[0.5px] border-white/60 bg-white/75"
                style={{ background: AI_GRADIENT_SOFT }}
              >
                <AiBrandSparkIcon size={12} />
              </span>
              <span className="[writing-mode:vertical-rl] text-[11px] font-medium tracking-[0.2px] text-tp-violet-700">
                Dr.Agent
              </span>
              {hasNudge ? <span className="absolute right-1 top-1 inline-flex size-1.5 rounded-full bg-tp-error-500" /> : null}
            </button>
          </div>
        )}
      </div>
    </TPRxPadShell>
  )
}

export function RxPadPage() {
  return (
    <RxPadSyncProvider>
      <RxPadPageInner />
    </RxPadSyncProvider>
  )
}

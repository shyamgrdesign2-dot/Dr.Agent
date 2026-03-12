"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

export interface RxPadMedicationSeed {
  medicine: string
  unitPerDose: string
  frequency: string
  when: string
  duration: string
  note: string
}

export interface RxPadVitalsSeed {
  bpSystolic?: string
  bpDiastolic?: string
  temperature?: string
  heartRate?: string
  respiratoryRate?: string
  weight?: string
  surgeryProcedure?: string
}

export interface RxPadCopyPayload {
  sourceDateLabel: string
  symptoms?: string[]
  examinations?: string[]
  diagnoses?: string[]
  medications?: RxPadMedicationSeed[]
  advice?: string
  followUp?: string
  labInvestigations?: string[]
  additionalNotes?: string
  vitals?: RxPadVitalsSeed
}

export interface RxPadCopyRequest {
  id: number
  payload: RxPadCopyPayload
}

interface RxPadSyncContextValue {
  lastCopyRequest: RxPadCopyRequest | null
  requestCopyToRxPad: (payload: RxPadCopyPayload) => void
}

const RxPadSyncContext = createContext<RxPadSyncContextValue>({
  lastCopyRequest: null,
  requestCopyToRxPad: () => {},
})

export function RxPadSyncProvider({ children }: { children: React.ReactNode }) {
  const [lastCopyRequest, setLastCopyRequest] = useState<RxPadCopyRequest | null>(null)
  const [sequence, setSequence] = useState(0)

  const requestCopyToRxPad = useCallback((payload: RxPadCopyPayload) => {
    setSequence((prev) => {
      const next = prev + 1
      setLastCopyRequest({ id: next, payload })
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ lastCopyRequest, requestCopyToRxPad }),
    [lastCopyRequest, requestCopyToRxPad],
  )

  return <RxPadSyncContext.Provider value={value}>{children}</RxPadSyncContext.Provider>
}

export function useRxPadSync() {
  return useContext(RxPadSyncContext)
}

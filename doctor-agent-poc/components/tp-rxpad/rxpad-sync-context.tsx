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
  targetSection?:
    | "rxpad"
    | "vitals"
    | "history"
    | "ophthal"
    | "gynec"
    | "obstetric"
    | "vaccine"
    | "growth"
    | "labResults"
    | "medicalRecords"
    | "followUp"
  symptoms?: string[]
  examinations?: string[]
  diagnoses?: string[]
  medications?: RxPadMedicationSeed[]
  advice?: string
  followUp?: string
  followUpDate?: string
  followUpNotes?: string
  labInvestigations?: string[]
  additionalNotes?: string
  vitals?: RxPadVitalsSeed
}

export interface RxPadCopyRequest {
  id: number
  payload: RxPadCopyPayload
}

export interface RxPadSignal {
  id: number
  type: "symptoms_changed" | "medications_changed" | "section_focus" | "sidebar_pill_tap"
  label?: string
  count?: number
  sectionId?: string
}

interface RxPadSyncContextValue {
  lastCopyRequest: RxPadCopyRequest | null
  lastSignal: RxPadSignal | null
  requestCopyToRxPad: (payload: RxPadCopyPayload) => void
  publishSignal: (signal: Omit<RxPadSignal, "id">) => void
}

const RxPadSyncContext = createContext<RxPadSyncContextValue>({
  lastCopyRequest: null,
  lastSignal: null,
  requestCopyToRxPad: () => {},
  publishSignal: () => {},
})

export function RxPadSyncProvider({ children }: { children: React.ReactNode }) {
  const [lastCopyRequest, setLastCopyRequest] = useState<RxPadCopyRequest | null>(null)
  const [lastSignal, setLastSignal] = useState<RxPadSignal | null>(null)
  const [copySequence, setCopySequence] = useState(0)
  const [signalSequence, setSignalSequence] = useState(0)

  const requestCopyToRxPad = useCallback((payload: RxPadCopyPayload) => {
    setCopySequence((prev) => {
      const next = prev + 1
      setLastCopyRequest({ id: next, payload })
      return next
    })
  }, [])

  const publishSignal = useCallback((signal: Omit<RxPadSignal, "id">) => {
    setSignalSequence((prev) => {
      const next = prev + 1
      setLastSignal({ id: next, ...signal })
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ lastCopyRequest, lastSignal, requestCopyToRxPad, publishSignal }),
    [lastCopyRequest, lastSignal, requestCopyToRxPad, publishSignal],
  )

  return <RxPadSyncContext.Provider value={value}>{children}</RxPadSyncContext.Provider>
}

export function useRxPadSync() {
  return useContext(RxPadSyncContext)
}

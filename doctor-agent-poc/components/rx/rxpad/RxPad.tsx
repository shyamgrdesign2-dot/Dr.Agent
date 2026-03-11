"use client"

import { RxPadFunctional } from "./RxPadFunctional"

/**
 * RxPad content area.
 * The current implementation intentionally renders the exact reference UI
 * from the shared zip component. Functional behaviors will be layered later.
 */
export function RxPad({ patientId }: { patientId?: string }) {
  return (
    <RxPadFunctional patientId={patientId} />
  )
}

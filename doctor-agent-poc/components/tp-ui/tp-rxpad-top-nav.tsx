"use client"

import React from "react"

import RxpadHeader from "@/components/tp-rxpad/imports/RxpadHeader"

export interface TPRxPadTopNavProps {
  className?: string
  onBack?: () => void
  onVisitSummary?: () => void
  patientName?: string
  patientMeta?: string
}

export function TPRxPadTopNav({ className, onBack, onVisitSummary, patientName, patientMeta }: TPRxPadTopNavProps) {
  return <RxpadHeader className={className} onBack={onBack} onVisitSummary={onVisitSummary} patientName={patientName} patientMeta={patientMeta} />
}

"use client"

import React from "react"

import RxpadHeader from "@/components/tp-rxpad/imports/RxpadHeader"

export interface TPRxPadTopNavProps {
  className?: string
  onBack?: () => void
  onVisitSummary?: () => void
}

export function TPRxPadTopNav({ className, onBack, onVisitSummary }: TPRxPadTopNavProps) {
  return <RxpadHeader className={className} onBack={onBack} onVisitSummary={onVisitSummary} />
}

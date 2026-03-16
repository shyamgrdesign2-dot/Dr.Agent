"use client"

import React from "react"

import RxpadHeader from "@/components/tp-rxpad/imports/RxpadHeader"

export interface TPRxPadTopNavProps {
  className?: string
  onBack?: () => void
}

export function TPRxPadTopNav({ className, onBack }: TPRxPadTopNavProps) {
  return <RxpadHeader className={className} onBack={onBack} />
}

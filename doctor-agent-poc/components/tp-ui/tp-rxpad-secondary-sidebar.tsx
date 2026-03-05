"use client"

import React from "react"

import { SecondarySidebar } from "@/components/tp-rxpad/secondary-sidebar/SecondarySidebar"
import type { NavItemId } from "@/components/tp-rxpad/secondary-sidebar/types"

interface TPRxPadSecondarySidebarProps {
  collapseExpandedOnly?: boolean
  onSectionSelect?: (id: NavItemId | null) => void
}

export function TPRxPadSecondarySidebar({
  collapseExpandedOnly = false,
  onSectionSelect,
}: TPRxPadSecondarySidebarProps) {
  return <SecondarySidebar collapseExpandedOnly={collapseExpandedOnly} onSectionSelect={onSectionSelect} />
}

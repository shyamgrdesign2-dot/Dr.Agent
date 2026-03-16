"use client"

import React from "react"

import {
  SecondaryNavPanel,
  type NavBadge as TPSecondaryNavBadge,
  type NavItem as TPSecondaryNavItem,
} from "@/components/ui/secondary-nav-panel"

export type { TPSecondaryNavBadge, TPSecondaryNavItem }

export function TPSecondaryNavPanel(
  props: React.ComponentProps<typeof SecondaryNavPanel>,
) {
  return <SecondaryNavPanel {...props} />
}

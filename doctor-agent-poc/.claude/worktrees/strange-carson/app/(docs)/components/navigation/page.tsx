"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { SecondaryNavShowcase } from "@/components/design-system/secondary-nav-showcase"
import {
  TabsShowcase,
  SegmentedControlShowcase,
  DropdownShowcase,
  SearchDropdownShowcase,
} from "@/components/design-system/navigation-showcase"
import { SearchCommandShowcase } from "@/components/design-system/search-command-showcase"
import { TokenPanel } from "@/components/design-system/token-badge"
import { navigationTokens } from "@/lib/component-tokens"

export default function NavigationPage() {
  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Secondary nav, tabs, segmented controls, dropdowns, and command palette. Wayfinding and menu patterns for app navigation."
        badge="Components"
      />

      <div className="flex flex-col gap-8">
        <ComponentCard><SecondaryNavShowcase /></ComponentCard>
        <ComponentCard><TabsShowcase /></ComponentCard>
        <ComponentCard><SegmentedControlShowcase /></ComponentCard>
        <ComponentCard><DropdownShowcase /></ComponentCard>
        <ComponentCard><SearchDropdownShowcase /></ComponentCard>
        <ComponentCard><SearchCommandShowcase /></ComponentCard>
      </div>

      <TokenPanel title="Navigation Design Tokens" tokens={navigationTokens.tokens} defaultOpen={false} />
    </div>
  )
}

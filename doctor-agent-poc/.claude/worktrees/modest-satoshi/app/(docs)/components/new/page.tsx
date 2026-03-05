"use client"

import { PageHeader } from "@/components/docs/page-header"
import { NewComponentsShowcase } from "@/components/design-system/new-components-showcase"

export default function NewComponentsPage() {
  return (
    <div>
      <PageHeader
        title="New Components"
        description="20 new TP-branded components — drawers, dropdowns, popovers, command palette, date/time pickers, file upload, stepper, rating, timeline, tree view, color picker, transfer list, and more."
        badge="Components"
      />
      <NewComponentsShowcase />
    </div>
  )
}

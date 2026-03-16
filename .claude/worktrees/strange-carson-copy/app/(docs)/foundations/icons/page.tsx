"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { IconShowcase } from "@/components/design-system/foundation-showcase"

export default function IconsPage() {
  return (
    <div>
      <PageHeader
        title="Icons"
        description="Iconsax icon library (Linear variant, 18px default). 993 icons across 24 categories for consistent iconography."
        badge="Foundations"
      />

      <ComponentCard>
        <IconShowcase />
      </ComponentCard>
    </div>
  )
}

"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { TypographyDemo } from "@/components/design-system/component-demos"
import { TypographyTokenShowcase } from "@/components/design-system/foundation-showcase"

export default function TypographyPage() {
  return (
    <div>
      <PageHeader
        title="Typography"
        description="Type scale, font families (Inter, Mulish), and text styles. Consistent typographic hierarchy for clinical workflows."
        badge="Foundations"
      />

      <div className="flex flex-col gap-8">
        <ComponentCard>
          <TypographyDemo />
        </ComponentCard>
        <ComponentCard>
          <TypographyTokenShowcase />
        </ComponentCard>
      </div>
    </div>
  )
}

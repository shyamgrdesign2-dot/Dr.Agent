"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import {
  ShadowShowcase,
  RadiusShowcase,
  BorderShowcase,
} from "@/components/design-system/foundation-showcase"
import { GradientDemo } from "@/components/design-system/component-demos"

export default function ShadowsPage() {
  return (
    <div>
      <PageHeader
        title="Shadows & Radius"
        description="Elevation scale, border radius tokens, border styles, and gradient definitions. Foundation tokens with embedded TP token references."
        badge="Foundations"
      />

      <div className="flex flex-col gap-8">
        <ComponentCard>
          <ShadowShowcase />
        </ComponentCard>
        <ComponentCard>
          <RadiusShowcase />
        </ComponentCard>
        <ComponentCard>
          <BorderShowcase />
        </ComponentCard>
        <ComponentCard>
          <GradientDemo />
        </ComponentCard>
      </div>
    </div>
  )
}

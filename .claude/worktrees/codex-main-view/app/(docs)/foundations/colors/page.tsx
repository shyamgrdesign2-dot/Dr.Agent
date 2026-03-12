"use client"

import { PageHeader } from "@/components/docs/page-header"
import { useCopy } from "@/components/docs/copy-provider"
import { PrimitiveColorShowcase, SemanticColorShowcase } from "@/components/design-system/color-showcase"
import { ComponentCard } from "@/components/design-system/design-system-section"

export default function ColorsPage() {
  const { handleCopy } = useCopy()

  return (
    <div>
      <PageHeader
        title="Colors"
        description="Full primitive palette used as source-of-truth for semantic mapping. Component-facing token system for text, background, border, icon, and status. Click any swatch to copy."
        badge="Foundations"
      />

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-tp-slate-900">Primitive Colors</h2>
        <ComponentCard>
          <PrimitiveColorShowcase onCopy={handleCopy} />
        </ComponentCard>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-tp-slate-900">Semantic Colors</h2>
        <ComponentCard>
          <SemanticColorShowcase onCopy={handleCopy} />
        </ComponentCard>
      </section>
    </div>
  )
}

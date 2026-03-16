"use client"

import { PageHeader } from "@/components/docs/page-header"
import { useCopy } from "@/components/docs/copy-provider"
import { CtaShowcase } from "@/components/design-system/cta-showcase"
import { TokenPanel } from "@/components/design-system/token-badge"
import { ctaTokens } from "@/lib/component-tokens"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { ButtonExperiment } from "@/components/design-system/button-experiment"

export default function ButtonsPage() {
  const { handleCopy } = useCopy()

  return (
    <div>
      <PageHeader
        title="Buttons"
        description="CTA anatomy, states, themes and sizes. Click any button to copy its JSX. Includes solid, outline, ghost, tonal, and link variants across primary, neutral, and error themes."
        badge="Components"
      />

      <CtaShowcase onCopy={handleCopy} />

      <TokenPanel title="CTA / Button Design Tokens" tokens={ctaTokens.tokens} defaultOpen={false} />

      {/* ── Figma Component Set Experiment ── */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-tp-slate-900 font-heading flex items-center gap-2">
          Experiment
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-tp-blue-600 bg-tp-blue-100">
            Figma Variants
          </span>
        </h2>
        <ComponentCard>
          <ButtonExperiment />
        </ComponentCard>
      </section>
    </div>
  )
}

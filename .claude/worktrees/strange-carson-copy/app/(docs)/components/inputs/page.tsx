"use client"

import { PageHeader } from "@/components/docs/page-header"
import { FormShowcase } from "@/components/design-system/form-showcase"
import { TokenPanel } from "@/components/design-system/token-badge"
import { inputTokens, toggleTokens } from "@/lib/component-tokens"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { InputExperiment } from "@/components/design-system/input-experiment"

export default function InputsPage() {
  return (
    <div>
      <PageHeader
        title="Inputs"
        description="Text inputs, search, select, checkbox, radio, toggle — each with Lucide icons, three sizes (S/M/L), and full state coverage."
        badge="Components"
      />

      <div className="flex flex-col gap-8">
        <FormShowcase />
      </div>

      <TokenPanel title="Input Field Design Tokens" tokens={inputTokens.tokens} defaultOpen={false} />
      <TokenPanel title="Checkbox, Radio & Switch Tokens" tokens={toggleTokens.tokens} defaultOpen={false} />

      {/* ── Figma Component Set Experiment ── */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-tp-slate-900 font-heading flex items-center gap-2">
          Experiment
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-tp-blue-600 bg-tp-blue-100">
            Figma Variants
          </span>
        </h2>
        <ComponentCard>
          <InputExperiment />
        </ComponentCard>
      </section>
    </div>
  )
}

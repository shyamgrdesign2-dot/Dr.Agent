"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { RxExperiment } from "@/components/design-system/rx-experiment"

export default function RxComponentsPage() {
  return (
    <div>
      <PageHeader
        title="Rx Components"
        description="Point-and-click prescription writing components — search + chips cards, vitals grid, medication table, rich text editor, follow-up selector, notes field, and atomic chips. All 7 groups export as Figma component sets."
        badge="Components"
      />

      <div className="flex flex-col gap-8">
        {/* ── Figma Component Set Experiment ── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-tp-slate-900 font-heading flex items-center gap-2">
            Rx Component Sets
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-tp-blue-600 bg-tp-blue-100">
              Figma Variants
            </span>
          </h2>
          <ComponentCard>
            <RxExperiment />
          </ComponentCard>
        </section>
      </div>
    </div>
  )
}

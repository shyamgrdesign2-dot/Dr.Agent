"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import {
  DataTableShowcase,
  PaginationShowcase,
  TooltipShowcase,
  ModalShowcase,
} from "@/components/design-system/data-showcase"
import { TokenPanel } from "@/components/design-system/token-badge"
import { dataDisplayTokens } from "@/lib/component-tokens"

export default function DataDisplayPage() {
  return (
    <div>
      <PageHeader
        title="Data Display"
        description="Tables, pagination, tooltips, and modals. Data presentation and overlay patterns for clinical data workflows."
        badge="Components"
      />

      <div className="flex flex-col gap-8">
        <ComponentCard><DataTableShowcase /></ComponentCard>
        <ComponentCard><PaginationShowcase /></ComponentCard>
        <ComponentCard><TooltipShowcase /></ComponentCard>
        <ComponentCard><ModalShowcase /></ComponentCard>
      </div>

      <TokenPanel title="Data Display Design Tokens" tokens={dataDisplayTokens.tokens} defaultOpen={false} />
    </div>
  )
}

"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { SpacingDemo, GridDemo } from "@/components/design-system/component-demos"
import { TokenPanel } from "@/components/design-system/token-badge"
import { spacingTokens } from "@/lib/component-tokens"

export default function SpacingPage() {
  return (
    <div>
      <PageHeader
        title="Spacing & Grid"
        description="Spacing scale, grid system, and layout breakpoints. Consistent spatial rhythm for layouts and component internals."
        badge="Foundations"
      />

      <div className="flex flex-col gap-8">
        <ComponentCard>
          <SpacingDemo />
        </ComponentCard>
        <ComponentCard>
          <GridDemo />
        </ComponentCard>
      </div>

      <TokenPanel title="Spacing & Grid Design Tokens" tokens={spacingTokens.tokens} defaultOpen={false} />
    </div>
  )
}

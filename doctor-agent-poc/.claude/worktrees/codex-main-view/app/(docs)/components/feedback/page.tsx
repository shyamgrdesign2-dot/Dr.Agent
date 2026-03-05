"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import { ToastShowcase } from "@/components/design-system/feedback-showcase"
import { BannerShowcase } from "@/components/design-system/tags-showcase"
import { AlertDemo } from "@/components/design-system/component-demos"
import { TokenPanel } from "@/components/design-system/token-badge"
import { feedbackTokens } from "@/lib/component-tokens"

export default function FeedbackPage() {
  return (
    <div>
      <PageHeader
        title="Feedback"
        description="Toasts, alerts, and banners. User feedback patterns for success, error, warning, and informational states."
        badge="Components"
      />

      <div className="flex flex-col gap-8">
        <ComponentCard><ToastShowcase /></ComponentCard>
        <ComponentCard><BannerShowcase /></ComponentCard>
        <ComponentCard><AlertDemo /></ComponentCard>
      </div>

      <TokenPanel title="Feedback & Alert Design Tokens" tokens={feedbackTokens.tokens} defaultOpen={false} />
    </div>
  )
}

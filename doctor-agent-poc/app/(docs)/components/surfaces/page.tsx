"use client"

import { PageHeader } from "@/components/docs/page-header"
import { ComponentCard } from "@/components/design-system/design-system-section"
import {
  AvatarShowcase,
  BadgeShowcase,
  DividerShowcase,
  SliderShowcase,
  RatingShowcase,
  ProgressShowcase,
  SkeletonShowcase,
  ListShowcase,
  BreadcrumbsShowcase,
  StepperShowcase,
  AccordionShowcase,
  CardShowcase,
} from "@/components/design-system/extras-showcase"
import {
  LabelShowcase,
  ChipShowcase,
} from "@/components/design-system/tags-showcase"
import { TokenPanel } from "@/components/design-system/token-badge"
import { surfaceTokens, overlayTokens } from "@/lib/component-tokens"

export default function SurfacesPage() {
  return (
    <div>
      <PageHeader
        title="Surfaces & Misc"
        description="Avatars, badges, cards, dividers, sliders, ratings, progress, skeletons, lists, breadcrumbs, steppers, accordions, labels, and chips."
        badge="Components"
      />

      <div className="flex flex-col gap-8">
        <ComponentCard><CardShowcase /></ComponentCard>
        <ComponentCard><AccordionShowcase /></ComponentCard>
        <ComponentCard><AvatarShowcase /></ComponentCard>
        <ComponentCard><BadgeShowcase /></ComponentCard>
        <ComponentCard><LabelShowcase /></ComponentCard>
        <ComponentCard><ChipShowcase /></ComponentCard>
        <ComponentCard><DividerShowcase /></ComponentCard>
        <ComponentCard><SliderShowcase /></ComponentCard>
        <ComponentCard><RatingShowcase /></ComponentCard>
        <ComponentCard><ProgressShowcase /></ComponentCard>
        <ComponentCard><SkeletonShowcase /></ComponentCard>
        <ComponentCard><ListShowcase /></ComponentCard>
        <ComponentCard><BreadcrumbsShowcase /></ComponentCard>
        <ComponentCard><StepperShowcase /></ComponentCard>
      </div>

      <TokenPanel title="Surface & Card Design Tokens" tokens={surfaceTokens.tokens} defaultOpen={false} />
      <TokenPanel title="Overlay & Popup Design Tokens" tokens={overlayTokens.tokens} defaultOpen={false} />
    </div>
  )
}

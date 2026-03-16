"use client"

import { Link1 } from "iconsax-reactjs"
import { CardShell } from "../CardShell"
import type { ExternalCtaCardData } from "../../types"

interface Props {
  data: ExternalCtaCardData
}

export function ExternalCtaCard({ data }: Props) {
  const target = data.openInNewTab === false ? "_self" : "_blank"
  const rel = target === "_blank" ? "noreferrer noopener" : undefined

  return (
    <CardShell
      icon={<Link1 size={14} variant="Bulk" color="var(--tp-blue-500, #3B82F6)" />}
      title={data.title}
    >
      <div className="rounded-[10px] border border-tp-slate-100 bg-tp-slate-50/60 px-[8px] py-[7px]">
        <p className="text-[11px] leading-[1.45] text-tp-slate-600">{data.description}</p>
      </div>

      <div className="mt-[8px]">
        <a
          href={data.ctaUrl}
          target={target}
          rel={rel}
          className="inline-flex items-center gap-[4px] rounded-[10px] border border-tp-blue-200 bg-tp-blue-50/60 px-[10px] py-[6px] text-[11px] font-medium text-tp-blue-600 transition-colors hover:bg-tp-blue-100"
        >
          {data.ctaLabel}
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </CardShell>
  )
}

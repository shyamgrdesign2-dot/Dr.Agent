"use client"

import { useState } from "react"
import { CardShell } from "../CardShell"
import { cn } from "@/lib/utils"
import type { AllergyConflictData } from "../../types"

interface AllergyConflictCardProps {
  data: AllergyConflictData
  onOverride?: () => void
}

export function AllergyConflictCard({
  data,
  onOverride,
}: AllergyConflictCardProps) {
  const [overridden, setOverridden] = useState(false)

  const handleOverride = () => {
    setOverridden(true)
    onOverride?.()
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="first-aid"
      title="Allergy Conflict"
      badge={{ label: "DANGER", color: "#DC2626", bg: "#FEE2E2" }}
      sidebarLink={
        <button
          type="button"
          onClick={handleOverride}
          disabled={overridden}
          className={cn(
            "inline-flex h-[28px] items-center rounded-[10px] px-4 text-[11px] font-medium transition-all",
            overridden
              ? "cursor-default border border-tp-slate-200 bg-tp-slate-50 text-tp-slate-400"
              : "border-[1.5px] border-tp-error-500 bg-transparent text-tp-error-600 hover:bg-tp-error-50"
          )}
        >
          {overridden
            ? "Override applied"
            : "Override — I accept the risk"}
        </button>
      }
    >
      {/* Drug → Allergen */}
      <div className="mb-2 text-[12px] font-semibold text-tp-error-700">
        {data.drug} → {data.allergen}
      </div>

      {/* Contraindicated label */}
      <div className="mb-1 flex items-center gap-1.5">
        <span className="inline-flex rounded-[4px] bg-tp-error-100 px-1.5 py-[2px] text-[10px] font-semibold uppercase text-tp-error-700">
          Contraindicated
        </span>
      </div>

      {/* Alternative suggestion */}
      <div className="mt-1 rounded-[6px] bg-tp-slate-50 px-2 py-[5px] text-[12px] leading-[1.45] text-tp-slate-600">
        <strong className="text-tp-slate-800">
          Alternative:
        </strong>{" "}
        {data.alternative}
      </div>
    </CardShell>
  )
}

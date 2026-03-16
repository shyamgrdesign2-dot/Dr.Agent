"use client"

import { cn } from "@/lib/utils"
import { Copy } from "iconsax-reactjs"

interface DataRowProps {
  label: string
  unit?: string
  value: string
  flag?: "high" | "low"
  refRange?: string
  isLast?: boolean
  onCopy?: () => void
  copyTooltip?: string
}

export function DataRow({ label, unit, value, flag, refRange, isLast, onCopy, copyTooltip }: DataRowProps) {
  const valueColor = flag === "high"
    ? "text-tp-error-600"
    : flag === "low"
      ? "text-tp-error-600"
      : "text-tp-slate-800"

  return (
    <div className={cn(
      "group/row flex items-center py-[3px]",
    )}
    style={!isLast ? { borderBottom: "0.5px solid var(--tp-slate-50, #F8FAFC)" } : undefined}
    >
      <div className="flex-1 text-[12px] text-tp-slate-500 leading-[1.4]">
        <span className="font-medium text-tp-slate-800">{label}</span>
        {unit && <span className="ml-1 text-[10px] text-tp-slate-400">({unit})</span>}
        {refRange && <span className="ml-1 text-[9px] text-tp-slate-300">{refRange}</span>}
      </div>
      <div className={cn("min-w-[40px] text-right text-[12px] font-medium", valueColor)}>
        {flag === "high" && "↑"}{flag === "low" && "↓"}{value}
      </div>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="ml-1 flex-shrink-0 opacity-0 transition-opacity group-hover/row:opacity-100 text-tp-slate-600 hover:text-tp-slate-500"
          title={copyTooltip ?? `Fill ${label}`}
        >
          <Copy size={14} variant="Linear" className="text-tp-blue-500" />
        </button>
      )}
    </div>
  )
}

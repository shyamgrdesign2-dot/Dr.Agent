"use client"

import { cn } from "@/lib/utils"

interface RadioRowProps {
  name: string
  label: string
  detail?: string
  checked?: boolean
  onChange?: () => void
  isLast?: boolean
}

export function RadioRow({ name, label, detail, checked = false, onChange, isLast }: RadioRowProps) {
  return (
    <label className={cn(
      "flex cursor-pointer items-center gap-[5px] py-[3px] text-[12px]",
    )}
    style={!isLast ? { borderBottom: "0.5px solid var(--tp-slate-50, #F8FAFC)" } : undefined}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-[14px] w-[14px] flex-shrink-0"
        style={{ accentColor: "var(--tp-blue-500)" }}
      />
      <strong className="font-medium text-tp-slate-800">{label}</strong>
      {detail && (
        <span className="ml-auto text-[10px] text-tp-slate-400">{detail}</span>
      )}
    </label>
  )
}

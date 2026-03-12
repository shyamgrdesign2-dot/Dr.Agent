"use client"

import * as React from "react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPNumberInput — TP-branded number stepper input.
 * Tokens: height 42px, radius 8px, border 1.5px, tp-blue focus ring.
 */

interface TPNumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  className?: string
}

export function TPNumberInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  label,
  className,
}: TPNumberInputProps) {
  const canDecrement = value - step >= min
  const canIncrement = value + step <= max

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === "" || raw === "-") return
    const n = parseFloat(raw)
    if (!isNaN(n)) {
      onChange(Math.min(max, Math.max(min, n)))
    }
  }

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-tp-slate-700">{label}</label>
      )}
      <div className="inline-flex items-center rounded-lg border border-tp-slate-300 bg-white focus-within:border-tp-blue-500 focus-within:ring-2 focus-within:ring-tp-blue-500/20">
        <button
          type="button"
          disabled={disabled || !canDecrement}
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-[42px] w-10 items-center justify-center rounded-l-lg text-tp-slate-500 hover:bg-tp-slate-50 hover:text-tp-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease"
        >
          <Minus size={16} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="h-[42px] w-16 border-x border-tp-slate-200 bg-transparent text-center text-sm font-semibold text-tp-slate-900 outline-none disabled:opacity-50"
        />
        <button
          type="button"
          disabled={disabled || !canIncrement}
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-[42px] w-10 items-center justify-center rounded-r-lg text-tp-slate-500 hover:bg-tp-slate-50 hover:text-tp-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

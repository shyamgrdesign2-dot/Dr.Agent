"use client"

import * as React from "react"
import { useState } from "react"
import { Palette } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * TPColorPicker — TP-branded color picker with preset palette + hex input.
 * Popover with TP palette swatches and custom hex input.
 */

const TP_PALETTE = [
  // Blues
  "#EEEEFF", "#B8B8FA", "#8584F2", "#4B4AD5", "#212077",
  // Violets
  "#F3E8FF", "#D4A8F0", "#B96FE0", "#A461D8", "#6B2FA0",
  // Ambers
  "#FFF8E0", "#FFE68A", "#F5B832", "#D99B1A", "#8C6200",
  // Greens
  "#ECFDF5", "#6EE7B7", "#10B981", "#059669", "#065F46",
  // Reds
  "#FEF2F2", "#FCA5A5", "#EF4444", "#DC2626", "#991B1B",
  // Slates
  "#F5F5F8", "#D1D1D6", "#A2A2A8", "#71717A", "#171725",
]

interface TPColorPickerProps {
  value: string
  onChange: (color: string) => void
  presets?: string[]
  className?: string
}

export function TPColorPicker({
  value,
  onChange,
  presets = TP_PALETTE,
  className,
}: TPColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(value)

  const handleHexSubmit = () => {
    const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-[42px] items-center gap-2 rounded-lg border border-tp-slate-300 bg-white px-3 text-sm transition-colors hover:border-tp-slate-400 focus:border-tp-blue-500 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/20",
            className,
          )}
        >
          <div
            className="h-5 w-5 shrink-0 rounded-md border border-tp-slate-200"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-tp-slate-700">{value}</span>
          <Palette size={16} className="ml-1 text-tp-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 rounded-xl border-tp-slate-200 bg-white p-3 shadow-lg"
        align="start"
      >
        {/* Palette grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color)
                setHexInput(color)
              }}
              className={cn(
                "h-7 w-full rounded-md border transition-all hover:scale-110",
                value === color
                  ? "border-tp-blue-500 ring-2 ring-tp-blue-500/30"
                  : "border-tp-slate-200",
              )}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>

        {/* Hex input */}
        <div className="mt-3 flex gap-2">
          <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-tp-slate-300 px-2 focus-within:border-tp-blue-500 focus-within:ring-2 focus-within:ring-tp-blue-500/20">
            <span className="text-xs text-tp-slate-400">#</span>
            <input
              type="text"
              value={hexInput.replace("#", "")}
              onChange={(e) => setHexInput(`#${e.target.value}`)}
              onBlur={handleHexSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleHexSubmit()}
              maxLength={6}
              className="h-8 w-full bg-transparent text-sm font-mono text-tp-slate-900 outline-none"
              placeholder="000000"
            />
          </div>
          <div
            className="h-8 w-8 shrink-0 rounded-lg border border-tp-slate-200"
            style={{ backgroundColor: value }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Clock } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * TPTimePicker — TP-branded time selection with scrollable HH:MM columns.
 * Tokens: input 42px/8px, tp-blue-500 primary.
 */

interface TPTimePickerProps {
  value?: string // "HH:MM" 24h format
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
  use24h?: boolean
  className?: string
}

const hours24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
const hours12 = Array.from({ length: 12 }, (_, i) => ((i === 0 ? 12 : i)).toString().padStart(2, "0"))
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

function ScrollColumn({
  items,
  selected,
  onSelect,
}: {
  items: string[]
  selected: string
  onSelect: (val: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      const idx = items.indexOf(selected)
      if (idx >= 0) {
        const el = ref.current.children[idx] as HTMLElement
        el?.scrollIntoView({ block: "center", behavior: "smooth" })
      }
    }
  }, [selected, items])

  return (
    <div ref={ref} className="h-48 w-14 overflow-y-auto scrollbar-thin">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className={cn(
            "flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors",
            selected === item
              ? "bg-tp-blue-500 text-white"
              : "text-tp-slate-600 hover:bg-tp-blue-50 hover:text-tp-blue-700",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export function TPTimePicker({
  value = "09:00",
  onChange,
  placeholder = "Select time",
  disabled = false,
  use24h = true,
  className,
}: TPTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [h, m] = value.split(":")
  const [period, setPeriod] = useState<"AM" | "PM">(() => {
    const hour = parseInt(h || "9", 10)
    return hour >= 12 ? "PM" : "AM"
  })

  const hourItems = use24h ? hours24 : hours12

  const displayTime = () => {
    if (!value) return ""
    if (use24h) return value
    const hour = parseInt(h, 10)
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const p = hour >= 12 ? "PM" : "AM"
    return `${h12.toString().padStart(2, "0")}:${m} ${p}`
  }

  const handleHourChange = (newH: string) => {
    if (use24h) {
      onChange?.(`${newH}:${m}`)
    } else {
      let h24 = parseInt(newH, 10)
      if (period === "PM" && h24 !== 12) h24 += 12
      if (period === "AM" && h24 === 12) h24 = 0
      onChange?.(`${h24.toString().padStart(2, "0")}:${m}`)
    }
  }

  const handleMinuteChange = (newM: string) => {
    onChange?.(`${h}:${newM}`)
  }

  const handlePeriodChange = (p: "AM" | "PM") => {
    setPeriod(p)
    let hour = parseInt(h, 10)
    if (p === "PM" && hour < 12) hour += 12
    if (p === "AM" && hour >= 12) hour -= 12
    onChange?.(`${hour.toString().padStart(2, "0")}:${m}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-[42px] w-full items-center gap-2 rounded-lg border border-tp-slate-300 bg-white px-3 text-left text-sm transition-colors hover:border-tp-slate-400 focus:border-tp-blue-500 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-tp-slate-400",
            value && "text-tp-slate-900",
            className,
          )}
        >
          <Clock size={18} className="shrink-0 text-tp-slate-400" />
          <span className="flex-1 truncate">{displayTime() || placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto rounded-xl border-tp-slate-200 bg-white p-3 shadow-lg"
        align="start"
      >
        <div className="flex gap-2">
          <div>
            <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-tp-slate-400">
              Hour
            </p>
            <ScrollColumn
              items={hourItems}
              selected={use24h ? h : (() => {
                const hour = parseInt(h, 10)
                const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                return h12.toString().padStart(2, "0")
              })()}
              onSelect={handleHourChange}
            />
          </div>
          <div className="flex items-center text-tp-slate-300 font-bold">:</div>
          <div>
            <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-tp-slate-400">
              Min
            </p>
            <ScrollColumn items={minutes} selected={m} onSelect={handleMinuteChange} />
          </div>
          {!use24h && (
            <div className="ml-1">
              <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-tp-slate-400">
                &nbsp;
              </p>
              <div className="flex flex-col gap-1">
                {(["AM", "PM"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePeriodChange(p)}
                    className={cn(
                      "flex h-9 w-12 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                      period === p
                        ? "bg-tp-blue-500 text-white"
                        : "text-tp-slate-500 hover:bg-tp-blue-50",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

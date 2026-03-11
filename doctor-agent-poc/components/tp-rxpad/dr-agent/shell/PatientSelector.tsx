"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Hospital, User } from "iconsax-reactjs"
import type { RxContextOption } from "../types"
import { RX_CONTEXT_OPTIONS } from "../constants"

// -----------------------------------------------------------------
// PatientSelector -- dropdown context picker for patient switching
// Supports:
//   - `renderTrigger` for custom trigger element
//   - `externalPatients` to override default patient list
//   - `showUniversalOption` for sticky "Clinic Overview" context
//   - Search filter within dropdown
// -----------------------------------------------------------------

interface PatientSelectorProps {
  selectedId: string
  onSelect: (id: string) => void
  /** Custom trigger renderer. Receives toggle fn and open state. */
  renderTrigger?: (toggle: () => void, isOpen: boolean) => React.ReactNode
  /** Override the default patient list (e.g. homepage queue patients) */
  externalPatients?: RxContextOption[]
  /** Show a sticky "Clinic Overview" universal context option at top */
  showUniversalOption?: boolean
  /** ID to use when "Clinic Overview" is selected */
  universalOptionId?: string
  className?: string
}

export function PatientSelector({
  selectedId,
  onSelect,
  renderTrigger,
  externalPatients,
  showUniversalOption,
  universalOptionId,
  className,
}: PatientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const patients = externalPatients ?? RX_CONTEXT_OPTIONS

  const selected: RxContextOption | undefined =
    patients.find((o) => o.id === selectedId) ?? patients[0]

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setSearch("")
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id)
      setOpen(false)
    },
    [onSelect],
  )

  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  // Filter patients by search
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients
    const q = search.toLowerCase()
    return patients.filter(
      (p) => p.label.toLowerCase().includes(q) || p.meta.toLowerCase().includes(q),
    )
  }, [patients, search])

  /** Patient initial circle */
  function InitialCircle({ label }: { label: string }) {
    return (
      <div className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-full bg-tp-slate-200 text-[10px] font-semibold text-tp-slate-600">
        {label.charAt(0).toUpperCase()}
      </div>
    )
  }

  const isUniversalSelected = universalOptionId ? selectedId === universalOptionId : false

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* -- Trigger -- */}
      {renderTrigger ? (
        renderTrigger(toggle, open)
      ) : (
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center gap-[6px] rounded-[8px] px-[4px] py-[4px] transition-colors hover:bg-tp-slate-50"
        >
          {/* Name + meta */}
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="flex items-center gap-[4px]">
              <span className="truncate text-[12px] font-semibold leading-[1.3] text-tp-slate-800">
                {isUniversalSelected ? "Clinic Overview" : selected?.label}
              </span>
              {!isUniversalSelected && selected?.isToday && (
                <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-tp-success-500" />
              )}
            </div>
            <span className="truncate text-[10px] leading-[1.3] text-tp-slate-400">
              {isUniversalSelected ? "Operational queries, billing, analytics" : selected?.meta}
            </span>
          </div>

          {/* Chevron */}
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            className={cn(
              "flex-shrink-0 text-tp-slate-400 transition-transform duration-150",
              open && "rotate-180",
            )}
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* -- Dropdown -- */}
      {open && (
        <div
          className="absolute left-1/2 top-full z-50 mt-[4px] w-[280px] -translate-x-1/2 rounded-[12px] border border-white/40 shadow-xl"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* Sticky "Clinic Overview" universal option — matches patient row height */}
          {showUniversalOption && universalOptionId && (
            <>
              <button
                type="button"
                onClick={() => handleSelect(universalOptionId)}
                className={cn(
                  "flex w-full items-center gap-[8px] px-[12px] py-[7px] text-left transition-colors",
                  isUniversalSelected
                    ? "border-l-[2px] border-l-tp-blue-600 bg-tp-blue-50"
                    : "border-l-[2px] border-l-transparent hover:bg-tp-slate-50",
                )}
              >
                <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-tp-violet-50 text-tp-violet-500">
                  <Hospital size={14} variant="Bulk" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-semibold leading-[1.3] text-tp-slate-800">
                    Clinic Overview
                  </span>
                  <span className="text-[11px] leading-[1.3] text-tp-slate-400">
                    Schedule, billing, analytics
                  </span>
                </div>
                {isUniversalSelected && (
                  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="ml-auto flex-shrink-0 text-tp-blue-500">
                    <path d="M3 7.5L6 10.5L11 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* "or" divider */}
              <div className="relative mx-[10px] my-[2px]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-tp-slate-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-[8px] text-[9px] font-medium text-tp-slate-300">or</span>
                </div>
              </div>
            </>
          )}

          {/* Search input */}
          <div className="px-[10px] py-[6px]">
            <div className="flex items-center gap-[6px] rounded-[8px] bg-tp-slate-50 px-[8px] py-[5px]">
              <svg width={13} height={13} viewBox="0 0 12 12" fill="none" className="flex-shrink-0 text-tp-slate-400">
                <circle cx={5} cy={5} r={3.5} stroke="currentColor" strokeWidth={1.5} />
                <path d="M8 8L10.5 10.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or mobile"
                className="w-full bg-transparent text-[12px] text-tp-slate-700 placeholder:text-tp-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Patient list */}
          <div className="max-h-[240px] overflow-y-auto py-[4px]">
            {filteredPatients.length === 0 ? (
              <div className="px-[12px] py-[12px] text-center text-[12px] text-tp-slate-400">
                No patients found
              </div>
            ) : (
              filteredPatients.map((option) => {
                const isSelected = option.id === selectedId
                const genderAge = [option.gender === "M" ? "M" : option.gender === "F" ? "F" : "", option.age ? `${option.age}y` : ""].filter(Boolean).join(", ")
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={cn(
                      "flex w-full items-center gap-[8px] px-[12px] py-[7px] text-left transition-colors",
                      isSelected
                        ? "border-l-[2px] border-l-tp-blue-600 bg-tp-blue-50"
                        : "border-l-[2px] border-l-transparent hover:bg-tp-slate-50",
                    )}
                  >
                    {/* Patient icon */}
                    <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-tp-slate-100 text-tp-slate-500">
                      <User size={14} variant="Bulk" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-[4px] truncate text-[13px] leading-[1.3] text-tp-slate-800">
                        <span className="font-semibold">{option.label}</span>
                        {genderAge && <span className="text-[11px] font-normal text-tp-slate-400">({genderAge})</span>}
                      </span>
                      <span className="truncate text-[11px] leading-[1.3] text-tp-slate-400">
                        {option.meta}
                      </span>
                    </div>

                    {option.isToday && (
                      <span className="flex-shrink-0 rounded-[4px] bg-tp-success-50 px-[6px] py-[1px] text-[10px] font-medium text-tp-success-600">
                        Today
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

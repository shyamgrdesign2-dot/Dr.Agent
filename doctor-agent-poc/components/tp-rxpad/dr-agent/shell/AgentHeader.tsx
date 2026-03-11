"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { SpecialtyTabId } from "../types"
import { SidebarRight } from "iconsax-reactjs"
import { AI_GRADIENT } from "../constants"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { NoiseOverlay } from "@/components/tp-ui/noise-overlay"

// -----------------------------------------------------------------
// Specialty → Auto-switch patient mapping
// -----------------------------------------------------------------

const SPECIALTY_PATIENT_MAP: Record<SpecialtyTabId, string> = {
  gp: "__patient__",         // Shyam GR
  gynec: "apt-lakshmi",      // Lakshmi K
  ophthal: "apt-anjali",     // Anjali Patel
  obstetric: "apt-priya",    // Priya Rao
  pediatrics: "apt-arjun",   // Arjun S
}

const SPECIALTY_OPTIONS: { id: SpecialtyTabId; label: string }[] = [
  { id: "gp", label: "GP" },
  { id: "gynec", label: "Gynec" },
  { id: "ophthal", label: "Ophthal" },
  { id: "obstetric", label: "Obstetric" },
  { id: "pediatrics", label: "Pediatrics" },
]

// -----------------------------------------------------------------
// AgentHeader — Clean, minimal header
// -----------------------------------------------------------------

interface AgentHeaderProps {
  availableSpecialties: SpecialtyTabId[]
  activeSpecialty: SpecialtyTabId
  onSpecialtyChange: (tab: SpecialtyTabId) => void
  onPatientChange: (id: string) => void
  selectedPatientId: string
  onClose: () => void
  className?: string
}

export function AgentHeader({
  activeSpecialty,
  onSpecialtyChange,
  onPatientChange,
  onClose,
  className,
}: AgentHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [dropdownOpen])

  const activeLabel = SPECIALTY_OPTIONS.find((o) => o.id === activeSpecialty)?.label ?? "GP"

  function handleSpecialtySelect(id: SpecialtyTabId) {
    setDropdownOpen(false)
    onSpecialtyChange(id)
    const patientId = SPECIALTY_PATIENT_MAP[id]
    if (patientId) {
      onPatientChange(patientId)
    }
  }

  return (
    <div className={cn("relative z-20", className)}>
      {/* Header — AI gradient bg with blur */}
      <div
        className="relative overflow-hidden flex items-center justify-between px-[14px] py-[14px]"
        style={{
          background: "linear-gradient(135deg, rgba(213,101,234,0.22) 0%, rgba(103,58,172,0.18) 40%, rgba(26,25,148,0.22) 100%)",
          boxShadow: "0 1px 3px rgba(103,58,172,0.06), 0 2px 8px rgba(26,25,148,0.04)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Subtle noise grain */}
        <NoiseOverlay opacity={0.04} />

        {/* Left: spark icon + title + specialty dropdown */}
        <div className="relative z-10 flex items-center gap-[6px]">
          <AiBrandSparkIcon size={18} className="flex-shrink-0" />
          <span
            className="text-[16px] font-semibold leading-[1.2]"
            style={{
              background: AI_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dr. Agent
          </span>

          {/* Specialty Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className={cn(
                "flex items-center gap-[3px] rounded-full px-[7px] py-[2px]",
                "text-[10px] leading-[1.3] text-tp-slate-500",
                "bg-tp-slate-50 transition-colors duration-150",
                "hover:bg-tp-slate-100 hover:text-tp-slate-700",
                dropdownOpen && "bg-tp-slate-100 text-tp-slate-700",
              )}
            >
              <span>{activeLabel}</span>
              <svg
                width={8}
                height={8}
                viewBox="0 0 10 10"
                fill="none"
                className={cn(
                  "flex-shrink-0 transition-transform duration-150",
                  dropdownOpen && "rotate-180",
                )}
              >
                <path
                  d="M2.5 3.75L5 6.25L7.5 3.75"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div
                className={cn(
                  "absolute left-0 top-full z-50 mt-[4px]",
                  "min-w-[110px] rounded-[8px] border border-tp-slate-200/60",
                  "bg-white py-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
                )}
              >
                {/* Demo notice */}
                <div className="border-b border-tp-slate-100 px-[10px] py-[4px]">
                  <p className="text-[8px] leading-[1.3] text-tp-slate-400 italic">
                    Demo only — not in production
                  </p>
                </div>

                {SPECIALTY_OPTIONS.map((opt) => {
                  const isActive = opt.id === activeSpecialty
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSpecialtySelect(opt.id)}
                      className={cn(
                        "flex w-full items-center px-[10px] py-[5px] text-left text-[11px] leading-[1.3]",
                        "transition-colors duration-100",
                        isActive
                          ? "font-medium text-tp-slate-800 bg-tp-slate-50"
                          : "text-tp-slate-600 hover:bg-tp-slate-50 hover:text-tp-slate-800",
                      )}
                    >
                      {opt.label}
                      {isActive && (
                        <svg
                          width={10}
                          height={10}
                          viewBox="0 0 10 10"
                          fill="none"
                          className="ml-auto flex-shrink-0 text-tp-slate-500"
                        >
                          <path
                            d="M2 5.5L4 7.5L8 3"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: close button */}
        <button
          type="button"
          onClick={onClose}
          className="relative z-10 text-tp-slate-400 transition-colors hover:text-tp-slate-600"
          aria-label="Minimize agent"
        >
          <SidebarRight size={18} variant="Linear" />
        </button>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { DoctorViewType, SpecialtyTabId } from "../types"
import { SidebarRight } from "iconsax-reactjs"
import { AI_GRADIENT } from "../constants"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { AiGradientBg } from "../shared/AiGradientBg"
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
// Doctor View Type options (controls summary depth per doctor context)
// -----------------------------------------------------------------

const DOCTOR_VIEW_OPTIONS: { id: DoctorViewType; label: string; shortLabel: string }[] = [
  { id: "specialist_first_visit", label: "Specialist", shortLabel: "Specialist" },
  { id: "treating_physician", label: "Treating Doctor", shortLabel: "Treating" },
  { id: "emergency_oncall", label: "Emergency", shortLabel: "Emergency" },
]

// -----------------------------------------------------------------
// Intake Mode options
// -----------------------------------------------------------------

export type IntakeMode = "with_intake" | "without_intake"

const INTAKE_OPTIONS: { id: IntakeMode; label: string }[] = [
  { id: "with_intake", label: "With previous intake" },
  { id: "without_intake", label: "Without previous intake" },
]

// -----------------------------------------------------------------
// AgentHeader — Clean, minimal header with unified dropdown
// -----------------------------------------------------------------

interface AgentHeaderProps {
  availableSpecialties: SpecialtyTabId[]
  activeSpecialty: SpecialtyTabId
  onSpecialtyChange: (tab: SpecialtyTabId) => void
  onPatientChange: (id: string) => void
  selectedPatientId: string
  onClose: () => void
  className?: string
  /** Doctor view type — controls summary depth and pill selection */
  doctorViewType?: DoctorViewType
  onDoctorViewChange?: (type: DoctorViewType) => void
  /** Show doctor view selector (only for patients with POMR/SBAR data) */
  showDoctorViewSelector?: boolean
  /** Intake mode — with or without pre-visit intake */
  intakeMode?: IntakeMode
  onIntakeModeChange?: (mode: IntakeMode) => void
}

export function AgentHeader({
  activeSpecialty,
  onSpecialtyChange,
  onPatientChange,
  onClose,
  className,
  doctorViewType,
  onDoctorViewChange,
  showDoctorViewSelector,
  intakeMode = "with_intake",
  onIntakeModeChange,
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

  const activeSpecLabel = SPECIALTY_OPTIONS.find((o) => o.id === activeSpecialty)?.label ?? "GP"
  const activeDoctorLabel = DOCTOR_VIEW_OPTIONS.find((o) => o.id === doctorViewType)?.shortLabel
  const activeIntakeLabel = intakeMode === "with_intake" ? "Intake" : "No intake"

  // Build compact badge text for the dropdown trigger
  const badgeParts: string[] = [activeSpecLabel]
  if (showDoctorViewSelector && activeDoctorLabel) {
    badgeParts.push(activeDoctorLabel)
  }

  function handleSpecialtySelect(id: SpecialtyTabId) {
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
        className="relative overflow-visible flex items-center justify-between px-[14px]"
        style={{
          height: 52,
          background: "linear-gradient(135deg, rgba(213,101,234,0.12) 0%, rgba(103,58,172,0.10) 40%, rgba(26,25,148,0.12) 100%)",
          boxShadow: "0 1px 2px rgba(103,58,172,0.04), 0 2px 6px rgba(26,25,148,0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Subtle noise grain */}
        <NoiseOverlay opacity={0.04} />

        {/* Left: spark icon + title + unified dropdown */}
        <div className="relative z-10 flex items-center gap-[6px]">
          <AiGradientBg size={28} borderRadius={8}>
            <AiBrandSparkIcon size={16} className="flex-shrink-0" />
          </AiGradientBg>
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

          {/* Unified Dropdown — Specialty + Doctor Type + Intake */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className={cn(
                "flex items-center gap-[4px] rounded-full px-[7px] py-[2px]",
                "text-[10px] leading-[1.3] text-tp-slate-400",
                "bg-white/30 backdrop-blur-sm transition-colors duration-150",
                "hover:bg-white/50 hover:text-tp-slate-600",
                dropdownOpen && "bg-white/50 text-tp-slate-600",
              )}
            >
              {/* Compact badge chips */}
              {badgeParts.map((part, i) => (
                <React.Fragment key={part}>
                  {i > 0 && <span className="text-tp-slate-300">·</span>}
                  <span>{part}</span>
                </React.Fragment>
              ))}
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

            {/* Dropdown panel — multi-section */}
            {dropdownOpen && (
              <div
                className={cn(
                  "absolute left-0 top-full z-[120] mt-[4px]",
                  "min-w-[180px] rounded-[10px] border border-tp-slate-100/80",
                  "bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(0,0,0,0.08)]",
                )}
              >
                {/* Demo notice */}
                <div className="border-b border-tp-slate-100 px-[10px] py-[4px]">
                  <p className="text-[8px] leading-[1.3] text-tp-slate-400 italic">
                    Demo only — not in production
                  </p>
                </div>

                {/* ── Section 1: Specialty ── */}
                <div className="px-[10px] pt-[6px] pb-[2px]">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-tp-slate-400 mb-[3px]">Specialty</p>
                  <div className="flex flex-wrap gap-[4px] pb-[6px]">
                    {SPECIALTY_OPTIONS.map((opt) => {
                      const isActive = opt.id === activeSpecialty
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSpecialtySelect(opt.id)}
                          className={cn(
                            "rounded-full px-[8px] py-[3px] text-[10px] leading-[1.3] transition-all duration-100",
                            isActive
                              ? "bg-tp-slate-700 text-white font-medium"
                              : "bg-tp-slate-50 text-tp-slate-500 hover:bg-tp-slate-100 hover:text-tp-slate-700",
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── Section 2: Doctor Type (View As) ── */}
                {showDoctorViewSelector && doctorViewType && onDoctorViewChange && (
                  <>
                    <div className="mx-[10px] border-t border-tp-slate-100" />
                    <div className="px-[10px] pt-[6px] pb-[2px]">
                      <p className="text-[8px] font-semibold uppercase tracking-wider text-tp-slate-400 mb-[3px]">View as</p>
                      <div className="flex flex-wrap gap-[4px] pb-[6px]">
                        {DOCTOR_VIEW_OPTIONS.map((opt) => {
                          const isActive = opt.id === doctorViewType
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => onDoctorViewChange(opt.id)}
                              className={cn(
                                "rounded-full px-[8px] py-[3px] text-[10px] leading-[1.3] transition-all duration-100",
                                isActive
                                  ? "bg-tp-violet-600 text-white font-medium"
                                  : "bg-tp-slate-50 text-tp-slate-500 hover:bg-tp-violet-50 hover:text-tp-violet-700",
                              )}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Section 3: Intake Mode ── */}
                {onIntakeModeChange && (
                  <>
                    <div className="mx-[10px] border-t border-tp-slate-100" />
                    <div className="px-[10px] pt-[6px] pb-[6px]">
                      <p className="text-[8px] font-semibold uppercase tracking-wider text-tp-slate-400 mb-[3px]">Intake</p>
                      <div className="flex gap-[4px]">
                        {INTAKE_OPTIONS.map((opt) => {
                          const isActive = opt.id === intakeMode
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => onIntakeModeChange(opt.id)}
                              className={cn(
                                "rounded-full px-[8px] py-[3px] text-[10px] leading-[1.3] transition-all duration-100",
                                isActive
                                  ? "bg-tp-blue-600 text-white font-medium"
                                  : "bg-tp-slate-50 text-tp-slate-500 hover:bg-tp-blue-50 hover:text-tp-blue-700",
                              )}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: close button */}
        <button
          type="button"
          onClick={onClose}
          className="relative z-10 text-tp-slate-500 transition-colors hover:text-tp-slate-700"
          aria-label="Minimize agent"
        >
          <SidebarRight size={18} variant="Linear" />
        </button>
      </div>
    </div>
  )
}

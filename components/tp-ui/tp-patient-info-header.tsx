"use client"

import * as React from "react"
import {
  ArrowLeft,
  Eye,
  FileText,
  LogIn,
  MoreVertical,
  ChevronDown,
  User,
  Settings,
  Save,
  LayoutTemplate,
  StickyNote,
} from "lucide-react"
import { TutorialPlayIcon } from "@/components/tp-ui/TutorialPlayIcon"
import { cn } from "@/lib/utils"

/**
 * TPPatientInfoHeader — Patient context bar matching RxpadHeader exactly.
 *
 * Figma reference specs (from RxpadHeader.tsx):
 *   Height:        62px
 *   Background:    white
 *   Back button:   80px wide, white bg, border-[#f1f1f5] right/bottom
 *   Avatar:        40px circle, bg-[#f1f1f5]
 *   Name:          Poppins SemiBold 14px, #454551, max-w-[150px]
 *   Age/gender:    Roboto Regular 12px, #454551, pipe separator #E2E2EA
 *   Toolbar:       bg-[#f1f1f5], h-[42px], rounded-[10.5px]
 *   Preview:       bg-[#f1f1f5] + icon + text
 *   Draft:         border-[#4b4ad5] 1.05px + icon + text
 *   End:           bg-[#4b4ad5] + icon + text (white)
 *   Bottom border: 0.5px #F1F1F5
 */

interface TPPatientInfoHeaderProps {
  patient: {
    name: string
    age: number
    gender: "Male" | "Female" | "Other" | string
    bloodGroup?: string
    uhid?: string
    phone?: string
    avatarUrl?: string
  }
  visitInfo?: {
    type: string
    date: string
    tokenNumber?: number
  }
  onBack?: () => void
  onPreview?: () => void
  onDraft?: () => void
  onEnd?: () => void
  actions?: React.ReactNode
  className?: string
}

/* ── Divider ── */
function HeaderDivider() {
  return (
    <div
      className="shrink-0 opacity-80"
      style={{
        width: "1.05px",
        height: 42,
        background:
          "linear-gradient(to bottom, rgba(208,213,221,0.2) 0%, #d0d5dd 50%, rgba(208,213,221,0.2) 100%)",
      }}
    />
  )
}

/* ── Toolbar icon button ── */
function HeaderIconButton({
  children,
  label,
  onClick,
  badge,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 items-center justify-center bg-[#f1f1f5] rounded-[10.5px]"
      style={{ width: 42, height: 42, padding: "8.4px" }}
      aria-label={label}
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          className="absolute flex items-center justify-center"
          style={{
            width: 10.5,
            height: 10.5,
            top: -1.4,
            right: -1.4,
            borderRadius: "50%",
            backgroundColor: "#E11D48",
            border: "1.05px solid white",
          }}
        />
      )}
    </button>
  )
}

export function TPPatientInfoHeader({
  patient,
  visitInfo,
  onBack,
  onPreview,
  onDraft,
  onEnd,
  actions,
  className,
}: TPPatientInfoHeaderProps) {
  const genderShort = patient.gender === "Male" ? "M" : patient.gender === "Female" ? "F" : patient.gender.charAt(0)

  return (
    <header
      className={cn("relative flex shrink-0 items-center bg-white", className)}
      style={{ height: 62 }}
      data-name="Rxpad_Header"
    >
      <div className="flex items-center gap-[16px] pr-[16px] py-[10px] size-full">
        {/* ── Back button — 80px panel ── */}
        <button
          type="button"
          onClick={onBack}
          className="relative flex shrink-0 items-center justify-center bg-white"
          style={{
            width: 80,
            height: 60,
            padding: "20px 15px",
            borderRight: "0.5px solid #f1f1f5",
            borderBottom: "0.5px solid #f1f1f5",
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} color="#454551" />
        </button>

        {/* ── Patient info ── */}
        <div className="flex flex-1 items-center min-h-px min-w-[280px]">
          <div className="flex items-center gap-[6px] shrink-0">
            {/* Avatar */}
            <div
              className="relative flex shrink-0 items-center justify-center bg-[#f1f1f5] rounded-full overflow-hidden"
              style={{ width: 40, height: 40 }}
            >
              {patient.avatarUrl ? (
                <img
                  src={patient.avatarUrl}
                  alt={patient.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={22} color="#545460" />
              )}
            </div>

            {/* Name + demographics */}
            <div className="flex flex-col items-start shrink-0" style={{ width: 108 }}>
              <div className="flex items-center gap-[2px] w-full">
                <p
                  className="shrink-0 text-[#454551] truncate"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    maxWidth: 150,
                    lineHeight: "normal",
                  }}
                >
                  {patient.name}
                </p>
                <ChevronDown size={16} color="#454551" className="shrink-0" />
              </div>
              <div
                className="flex items-start w-full"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "18px",
                  letterSpacing: "0.1px",
                }}
              >
                <span className="shrink-0 text-[#454551]">{genderShort}</span>
                <span className="shrink-0 text-[#e2e2ea] text-center" style={{ width: 8 }}>|</span>
                <span className="shrink-0 text-[#454551]">{patient.age}y</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-[14px] shrink-0">
          {/* Tutorial */}
          <div className="shrink-0 flex items-center justify-center" style={{ width: 42, height: 42 }}>
            <TutorialPlayIcon size={28} />
          </div>

          <HeaderDivider />

          {/* Template */}
          <HeaderIconButton label="Template">
            <LayoutTemplate size={20} color="#454551" />
          </HeaderIconButton>

          {/* Save */}
          <HeaderIconButton label="Save">
            <Save size={20} color="#454551" />
          </HeaderIconButton>

          {/* Customisation */}
          <HeaderIconButton label="Customisation">
            <Settings size={20} color="#454551" />
          </HeaderIconButton>

          {/* Custom Canvas */}
          <HeaderIconButton label="Custom Canvas" badge={1}>
            <StickyNote size={20} color="#454551" />
          </HeaderIconButton>

          <HeaderDivider />

          {/* Preview */}
          <button
            type="button"
            onClick={onPreview}
            className="flex shrink-0 items-center justify-center gap-[6.3px] bg-[#f1f1f5] rounded-[10.5px]"
            style={{ height: 42, padding: "8px 16px" }}
          >
            <Eye size={20} color="#454551" />
            <span
              className="shrink-0 text-center text-[#454551]"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "14.7px",
                lineHeight: "normal",
              }}
            >
              Preview
            </span>
          </button>

          {/* Draft */}
          <button
            type="button"
            onClick={onDraft}
            className="relative flex shrink-0 items-center justify-center gap-[6.3px] rounded-[10.5px]"
            style={{
              height: 42,
              padding: "8px 16px",
              border: "1.05px solid #4b4ad5",
              borderRadius: "11.025px",
            }}
          >
            <FileText size={20} color="#4B4AD5" />
            <span
              className="shrink-0 text-center text-[#4b4ad5]"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "14.7px",
                lineHeight: "normal",
              }}
            >
              Draft
            </span>
          </button>

          {/* End Visit */}
          <button
            type="button"
            onClick={onEnd}
            className="flex shrink-0 items-center justify-center gap-[6.3px] bg-[#4b4ad5] rounded-[10.5px]"
            style={{ height: 42, padding: "8px 16px" }}
          >
            <LogIn size={20} color="white" />
            <span
              className="shrink-0 text-center text-white"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "14.7px",
                lineHeight: "normal",
              }}
            >
              End
            </span>
          </button>

          {/* More options */}
          <div className="flex shrink-0 items-center justify-center" style={{ width: 25.2, height: 25.2 }}>
            <MoreVertical size={20} color="#454551" />
          </div>

          {/* Custom actions */}
          {actions}
        </div>
      </div>

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "0.5px", backgroundColor: "#f1f1f5" }}
      />
    </header>
  )
}

"use client"

import { useState } from "react"
import { Calendar2 } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { CopyIcon } from "./CopyIcon"
import { TPMedicalIcon } from "@/components/tp-ui"

export const SECTION_TAG_ICON_MAP: Record<string, string> = {
  "Vitals": "Heart Rate",
  "Today's Vitals": "Heart Rate",
  "Symptoms": "Virus",
  "Diagnosis": "Diagnosis",
  "Diagnoses": "Diagnosis",
  "Medication": "Tablets",
  "Medications": "Tablets",
  "Active Meds": "Tablets",
  "Current Medications": "Tablets",
  "Investigation": "test-tube-02",
  "Investigations": "test-tube-02",
  "Key Labs": "Lab",
  "Chronic Conditions": "medical-service",
  "Family History": "medical-report",
  "Allergies": "mask",
  "Lifestyle": "health care",
  "Due Alerts": "emergency",
  "History": "medical-record",
  "Last Visit": "medical-report",
  "Advice": "medical book",
  "Follow-up": "iconsax:calendar",
  "Basic Info": "health-file-02",
  "ANC Status": "Obstetric",
  "Last Exam": "medical-report",
  "Menstrual History": "Gynec",
  "Screening": "ultrasound-monitor-02",
  "OD (Right)": "eye",
  "OS (Left)": "eye",
  "Findings": "clipboard-activity",
  "Growth": "health-file-03",
  "Vaccines": "injection",
}

interface SectionTagProps {
  label: string
  icon?: string
  onClick?: () => void
  onCopy?: () => void
  variant?: "default" | "specialty"
  className?: string
  /** Tooltip shown on hover over the entire tag, e.g. "Open detailed vitals" */
  tooltip?: string
  /** Tooltip shown on hover over the fill icon, e.g. "Fill all vitals" */
  copyTooltip?: string
}

/** Returns true if the string starts with an emoji character */
function isEmoji(str: string): boolean {
  if (!str) return false
  return /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}]/u.test(str)
}

export function SectionTag({
  label,
  icon,
  onClick,
  onCopy,
  variant = "default",
  className,
  tooltip,
  copyTooltip,
}: SectionTagProps) {
  const [hovered, setHovered] = useState(false)
  const resolvedIcon = icon || SECTION_TAG_ICON_MAP[label]

  const bg = variant === "specialty"
    ? "bg-tp-violet-50 text-tp-violet-600"
    : "bg-tp-slate-100 text-tp-slate-500"
  const foregroundClassName = variant === "specialty"
    ? hovered ? "text-tp-violet-700" : "text-tp-violet-600"
    : hovered ? "text-tp-slate-700" : "text-tp-slate-500"
  const foregroundColor = variant === "specialty"
    ? hovered ? "var(--tp-violet-700, #6D28D9)" : "var(--tp-violet-600, #7C3AED)"
    : hovered ? "var(--tp-slate-700, #334155)" : "var(--tp-slate-500, #64748B)"

  return (
    <span
      className={cn(
        "group/tag inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-[4px] px-1.5 py-[0.5px] text-[12px] font-medium align-middle transition-colors",
        bg,
        hovered && variant === "specialty" && "bg-tp-violet-100",
        hovered && variant !== "specialty" && "bg-tp-slate-200",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      title={tooltip}
    >
      {/* Icon rendered INSIDE the tag chip, matching tag text color */}
      {resolvedIcon && (
        isEmoji(resolvedIcon)
          ? <span className="text-[12px]">{resolvedIcon}</span>
          : resolvedIcon === "iconsax:calendar"
            ? (
              <Calendar2
                size={12}
                variant="Bulk"
                color={foregroundColor}
                className={cn(
                  "inline-block align-middle transition-opacity",
                  hovered ? "opacity-100" : "opacity-60",
                  foregroundClassName,
                )}
              />
            )
          : (
            <TPMedicalIcon
              name={resolvedIcon}
              variant="bulk"
              size={12}
              color={foregroundColor}
              className={cn(
                "inline-block align-middle transition-opacity",
                hovered ? "opacity-100" : "opacity-60",
                foregroundClassName,
              )}
            />
          )
      )}
      <span className={cn("transition-colors", foregroundClassName)}>
        {label}
      </span>
      {onCopy && hovered && (
        <CopyIcon
          size={10}
          onClick={(e) => { e.stopPropagation(); onCopy() }}
          className="ml-0.5"
        />
      )}
    </span>
  )
}

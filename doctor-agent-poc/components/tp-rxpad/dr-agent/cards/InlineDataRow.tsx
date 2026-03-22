"use client"

import { SectionTag } from "./SectionTag"
import { ActionableTooltip } from "./ActionableTooltip"
import { CopyIcon } from "./CopyIcon"
import { cn } from "@/lib/utils"

interface InlineValue {
  key: string
  value: string
  flag?: "normal" | "high" | "low" | "warning" | "success"
}

interface InlineDataRowProps {
  tag: string
  tagIcon?: string
  tagVariant?: "default" | "specialty"
  values: InlineValue[]
  onTagClick?: () => void
  onTagCopy?: () => void
  className?: string
  /** "existing" = data already in the system (no copy), "new"/"uploaded" = keep copy. Default keeps copy. */
  source?: "existing" | "new" | "uploaded"
  /** Override: if true, show copy even for existing data */
  allowCopyToRxPad?: boolean
  /** Fill destination label used in tooltips, defaults to "RxPad" */
  copyDestination?: string
  /** Optional trailing note shown in lighter italic text (e.g. doctor name) */
  trailingNote?: string
}

const FLAG_STYLES: Record<string, string> = {
  normal: "text-tp-slate-800",
  high: "text-tp-error-600 font-medium",
  low: "text-tp-error-600 font-medium",
  warning: "text-tp-warning-600 font-medium",
  success: "text-tp-success-600 font-medium",
}

/** Tooltip mapping for known tag labels */
const TAG_TOOLTIPS: Record<string, { tooltip: string; copyTooltip: string }> = {
  "Today's Vitals": { tooltip: "Open detailed vitals", copyTooltip: "Fill all vitals to RxPad" },
  "Key Labs":       { tooltip: "Open lab results",     copyTooltip: "Fill all lab values to RxPad" },
  "History":        { tooltip: "Open medical history",  copyTooltip: "Fill history to RxPad" },
  "Last Visit":     { tooltip: "Open past visits",     copyTooltip: "Fill last visit to RxPad" },
  "Symptoms":       { tooltip: "View symptoms",        copyTooltip: "Fill all symptoms to RxPad" },
  "Examination":    { tooltip: "View examination",     copyTooltip: "Fill examination to RxPad" },
  "Diagnosis":      { tooltip: "View diagnosis",       copyTooltip: "Fill diagnosis to RxPad" },
  "Medication":     { tooltip: "View medication",      copyTooltip: "Fill medication to RxPad" },
  "Investigation":  { tooltip: "View investigations",  copyTooltip: "Fill investigations to RxPad" },
  "Advice":         { tooltip: "View advice",          copyTooltip: "Fill advice to RxPad" },
  "Follow-up":      { tooltip: "View follow-up",       copyTooltip: "Fill follow-up to RxPad" },
}

/** Truncate text for display */
function truncate(text: string, maxLen: number = 30): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + "..."
}

/** Check if a value is compound (contains comma-separated sub-values) */
function isCompoundValue(value: string): boolean {
  return value.includes(", ")
}

/** Split compound value into individual sub-values */
function splitCompoundValue(value: string): string[] {
  return value.split(", ").map((s) => s.trim()).filter(Boolean)
}

/** Extract a clean display name from a sub-value, e.g. "Diabetes (1yr)" -> "Diabetes" */
function extractDisplayName(subValue: string): string {
  // Remove parenthetical suffixes like "(1yr)", "(6mo)" for tooltip label
  const match = subValue.match(/^([^(]+)/)
  return match ? match[1].trim() : subValue.trim()
}

export function InlineDataRow({
  tag,
  tagIcon,
  tagVariant,
  values,
  onTagClick,
  onTagCopy,
  className,
  source,
  allowCopyToRxPad,
  copyDestination = "RxPad",
  trailingNote,
}: InlineDataRowProps) {
  const showCopy = source !== "existing" || allowCopyToRxPad === true
  const tooltips = TAG_TOOLTIPS[tag]
  const destinationLabel = copyDestination.trim() || "RxPad"
  const sectionCopyTooltip = destinationLabel === "RxPad"
    ? (tooltips?.copyTooltip || `Fill all ${tag.toLowerCase()} to RxPad`)
    : `Fill all ${tag.toLowerCase()} to ${destinationLabel}`

  const handleCopyText = (text: string) => {
    navigator.clipboard?.writeText(text)
  }

  const handleCopyAll = () => {
    const text = values.map((v) => `${v.key}: ${v.value}`).join("\n")
    navigator.clipboard?.writeText(text)
    onTagCopy?.()
  }

  /** Render a single (non-compound) value with ActionableTooltip */
  const renderSimpleValue = (v: InlineValue) => {
    const flagPrefix = v.flag === "high" ? "\u2191" : v.flag === "low" ? "\u2193" : ""
    const displayValue = `${flagPrefix}${v.value}`
    const copyText = `${v.key}: ${displayValue}`
    const tooltipLabel = `Fill ${truncate(copyText)} to ${destinationLabel}`

    if (!showCopy) {
      return (
        <span className="inline-flex items-baseline">
          <span className="text-tp-slate-400">{v.key}:&nbsp;</span>
          <span className={cn(FLAG_STYLES[v.flag || "normal"])}>
            {displayValue}
          </span>

        </span>
      )
    }

    return (
      <ActionableTooltip
        label={tooltipLabel}
        onAction={() => handleCopyText(copyText)}
      >
        <span className="inline-flex items-baseline cursor-pointer">
          <span className="text-tp-slate-400">{v.key}:&nbsp;</span>
          <span className={cn(FLAG_STYLES[v.flag || "normal"])}>
            {displayValue}
          </span>

        </span>
      </ActionableTooltip>
    )
  }

  /** Render a compound value (comma-separated) with individual sub-value tooltips */
  const renderCompoundValue = (v: InlineValue) => {
    const subValues = splitCompoundValue(v.value)
    const count = subValues.length
    const keyTooltipLabel = `Fill ${count} ${v.key.toLowerCase()} to ${destinationLabel}`
    const keyCopyText = `${v.key}: ${v.value}`

    if (!showCopy) {
      return (
        <span className="inline">
          <span className="text-tp-slate-400">{v.key}:&nbsp;</span>
          {subValues.map((sub, j) => (
            <span key={j}>
              <span className={cn(FLAG_STYLES[v.flag || "normal"])}>
                {sub}
              </span>
              {j < subValues.length - 1 && (
                <span className="text-tp-slate-800">, </span>
              )}
            </span>
          ))}
        </span>
      )
    }

    return (
      <span className="inline">
        {/* Key label — hovering copies all sub-values */}
        <ActionableTooltip
          label={keyTooltipLabel}
          onAction={() => handleCopyText(keyCopyText)}
        >
          <span className="text-tp-slate-400 cursor-pointer">{v.key}:&nbsp;</span>
        </ActionableTooltip>

        {/* Each sub-value gets its own tooltip */}
        {subValues.map((sub, j) => {
          const displayName = extractDisplayName(sub)
          const subTooltipLabel = `Fill ${truncate(displayName)} to ${destinationLabel}`

          return (
            <span key={j}>
              <ActionableTooltip
                label={subTooltipLabel}
                onAction={() => handleCopyText(sub)}
              >
                <span className={cn(FLAG_STYLES[v.flag || "normal"], "cursor-pointer")}>
                  {sub}
                </span>
              </ActionableTooltip>
              {j < subValues.length - 1 && (
                <span className="text-tp-slate-800">, </span>
              )}
            </span>
          )
        })}
      </span>
    )
  }

  return (
    <div
      className={cn(
        "relative rounded-[4px] px-[3px] -mx-[3px] text-[12px] leading-[1.7] text-tp-slate-800 transition-colors",
        showCopy
          ? "group/section pr-[20px] hover:bg-tp-slate-50/80"
          : "",
        className,
      )}
    >
      {/* Tag */}
      <SectionTag
        label={tag}
        icon={tagIcon}
        variant={tagVariant}
        onClick={onTagClick}
        onCopy={showCopy ? onTagCopy : undefined}
        tooltip={tooltips?.tooltip}
        copyTooltip={showCopy ? tooltips?.copyTooltip : undefined}
      />{" "}

      {/* Values — inline wrapping */}
      {values.map((v, i) => (
        <span key={v.key}>
          {isCompoundValue(v.value)
            ? renderCompoundValue(v)
            : renderSimpleValue(v)
          }
          {i < values.length - 1 && (
            <span className="mx-[3px] text-tp-slate-300">|</span>
          )}
        </span>
      ))}

      {/* Trailing note — lighter italic text (e.g. doctor name on last visit) */}
      {trailingNote && (
        <span className="ml-[4px] text-[10px] italic text-tp-slate-400 font-normal">
          — {trailingNote}
        </span>
      )}

      {/* Section copy icon */}
      {showCopy && values.length > 0 && (
        <ActionableTooltip
          label={sectionCopyTooltip}
          onAction={handleCopyAll}
          className="absolute right-0 top-[2px] opacity-0 group-hover/section:opacity-100 transition-opacity"
        >
          <CopyIcon size={14} onClick={handleCopyAll} />
        </ActionableTooltip>
      )}
    </div>
  )
}

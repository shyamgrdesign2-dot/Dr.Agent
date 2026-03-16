"use client"

import { useState, useCallback } from "react"
import {
  Search,
  XCircle,
  Plus,
} from "lucide-react"
import { Eraser, Grid5, Ram, Trash } from "iconsax-reactjs"

/**
 * RxPad Section Wrapper
 * ─────────────────────
 * Reusable container for each RxPad section (Symptoms, Examinations, Diagnosis, etc.).
 *
 * Design tokens (from Figma reference):
 *   - Section bg: TP Slate 0 (white)
 *   - Section border: 1px TP Slate 200
 *   - Section radius: 12px
 *   - Header: 44px, flex between title + actions
 *   - Title: 14px semibold, Mulish, TP Slate 900
 *   - Title icon: 18px, TP Blue 500
 *   - Action icons: 16px, TP Slate 400 → TP Slate 600 on hover
 *   - Inner padding: 12px horizontal, 8px vertical for content
 */

interface RxPadSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  showHeaderActions?: boolean
  onTemplateClick?: () => void
  onSaveClick?: () => void
  onClearClick?: () => void
  clearDisabled?: boolean
  /** Autofill badge content */
  autofillLabel?: string
}

export function RxPadSection({
  title,
  icon,
  children,
  showHeaderActions = true,
  onTemplateClick,
  onSaveClick,
  onClearClick,
  clearDisabled = false,
  autofillLabel,
}: RxPadSectionProps) {
  return (
    <div className="rounded-[16px] border border-tp-slate-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-8 px-[18px] pt-[18px]">
        <div className="inline-flex items-center gap-[4px]">
          <span className="inline-flex h-[32px] w-[32px] items-center justify-center text-tp-violet-500">{icon}</span>
          <h3
            className="text-[16px] font-semibold leading-[24px] text-tp-slate-700"
            style={{ fontFamily: "Inter, var(--font-body), sans-serif", letterSpacing: "0.1px" }}
          >
            {title}
          </h3>
        </div>

        {showHeaderActions ? (
          <div className="inline-flex items-center gap-[14px]">
            <button
              type="button"
              className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-tp-slate-100 text-tp-slate-700 hover:bg-tp-slate-200"
              title="Template"
              onClick={onTemplateClick}
            >
              <Grid5 color="var(--tp-slate-700)" size={18} strokeWidth={1.5} variant="Linear" />
            </button>
            <button
              type="button"
              className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-tp-slate-100 text-tp-slate-700 hover:bg-tp-slate-200"
              title="Save"
              onClick={onSaveClick}
            >
              <Ram color="var(--tp-slate-700)" size={18} strokeWidth={1.5} variant="Linear" />
            </button>
            <button
              type="button"
              className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-tp-slate-100 text-tp-slate-700 hover:bg-tp-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Clear"
              onClick={onClearClick}
              disabled={clearDisabled}
            >
              <Eraser color="var(--tp-slate-700)" size={18} strokeWidth={1.5} variant="Linear" />
            </button>
          </div>
        ) : null}
      </div>

      {autofillLabel && (
        <div className="px-[18px] pt-2">
          <button className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-tp-success-500 to-tp-success-400 px-2.5 py-1 text-[10px] font-semibold text-white transition-opacity hover:opacity-90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            {autofillLabel}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-[18px]">
        {children}
      </div>
    </div>
  )
}

/**
 * Search + Chip Input for Symptoms, Examinations, Diagnosis, Lab Investigation.
 * Follows the Figma pattern: search bar → suggestion chips → selected chips.
 */
export function ChipSearchInput({
  placeholder,
  suggestions,
  selectedItems,
  onAdd,
  onRemove,
}: {
  placeholder: string
  suggestions: string[]
  selectedItems: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
}) {
  const [query, setQuery] = useState("")

  const filtered = query.length > 0
    ? suggestions.filter(s =>
        s.toLowerCase().includes(query.toLowerCase()) &&
        !selectedItems.includes(s)
      ).slice(0, 8)
    : suggestions.filter(s => !selectedItems.includes(s)).slice(0, 10)

  const handleAdd = useCallback((item: string) => {
    onAdd(item)
    setQuery("")
  }, [onAdd])

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-tp-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full rounded-lg border border-tp-slate-200 bg-tp-slate-50
            py-2 pl-9 pr-3 text-xs text-tp-slate-800
            placeholder:text-tp-slate-400
            focus:border-tp-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-tp-blue-500/20
            transition-colors
          "
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              handleAdd(query.trim())
            }
          }}
        />
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5">
        {filtered.map((s) => (
          <button
            key={s}
            onClick={() => handleAdd(s)}
            className="
              rounded-full border border-tp-slate-200 bg-tp-slate-50
              px-2.5 py-1 text-[11px] text-tp-slate-600
              hover:border-tp-blue-300 hover:bg-tp-blue-50 hover:text-tp-blue-600
              transition-colors
            "
          >
            {s}
          </button>
        ))}
      </div>

      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-tp-slate-100">
          {selectedItems.map((item) => (
            <span
              key={item}
              className="
                inline-flex items-center gap-1 rounded-full
                bg-tp-blue-50 border border-tp-blue-200
                pl-2.5 pr-1.5 py-0.5 text-[11px] font-medium text-tp-blue-700
              "
            >
              {item}
              <button
                onClick={() => onRemove(item)}
                className="rounded-full p-0.5 hover:bg-tp-blue-100 transition-colors"
              >
                <XCircle size={12} strokeWidth={1.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Medication table row for the Rx section.
 */
export interface MedicationRowData {
  id: string
  medicine: string
  unitPerDose: string
  frequency: string
  when: string
  duration: string
  note: string
}

export function MedicationTable({
  rows,
  onUpdate,
  onRemove,
  onAdd,
}: {
  rows: MedicationRowData[]
  onUpdate: (id: string, field: keyof MedicationRowData, value: string) => void
  onRemove: (id: string) => void
  onAdd: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-tp-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-tp-slate-50 text-tp-slate-500 font-['Inter',sans-serif]">
              <th className="px-2 py-2 text-left font-semibold w-[4%]" />
              <th className="px-2 py-2 text-left font-semibold min-w-[160px]">MEDICINE</th>
              <th className="px-2 py-2 text-left font-semibold min-w-[80px]">UNIT PER DOSE</th>
              <th className="px-2 py-2 text-left font-semibold min-w-[80px]">FREQUENCY</th>
              <th className="px-2 py-2 text-left font-semibold min-w-[90px]">WHEN</th>
              <th className="px-2 py-2 text-left font-semibold min-w-[80px]">DURATION</th>
              <th className="px-2 py-2 text-left font-semibold min-w-[60px]">NOTE</th>
              <th className="px-2 py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-t border-tp-slate-100 hover:bg-tp-slate-50/50">
                <td className="px-2 py-1.5 text-tp-slate-400 cursor-grab">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="4" cy="3" r="1" /><circle cx="8" cy="3" r="1" />
                    <circle cx="4" cy="6" r="1" /><circle cx="8" cy="6" r="1" />
                    <circle cx="4" cy="9" r="1" /><circle cx="8" cy="9" r="1" />
                  </svg>
                </td>
                <td className="px-2 py-1.5">
                  <div className="text-xs font-medium text-tp-slate-800">{row.medicine}</div>
                </td>
                <td className="px-2 py-1.5 text-tp-slate-700">{row.unitPerDose}</td>
                <td className="px-2 py-1.5">
                  <span className="rounded border border-tp-slate-200 px-1.5 py-0.5 text-tp-slate-700">{row.frequency}</span>
                </td>
                <td className="px-2 py-1.5 text-tp-slate-700">{row.when}</td>
                <td className="px-2 py-1.5 text-tp-slate-700">{row.duration}</td>
                <td className="px-2 py-1.5">
                  <span className="rounded bg-tp-slate-100 px-1.5 py-0.5 text-[10px] text-tp-slate-500">{row.note || "Note"}</span>
                </td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => onRemove(row.id)}
                    className="rounded p-1 text-tp-slate-400 hover:bg-tp-error-50 hover:text-tp-error-500 transition-colors"
                  >
                    <Trash color="currentColor" size={18} strokeWidth={1.5} variant="Linear" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Search to add */}
      <div className="relative">
        <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-tp-slate-400" />
        <input
          type="text"
          placeholder="Search Medication (Rx)"
          className="
            w-full rounded-lg border border-tp-slate-200 bg-tp-slate-50
            py-2 pl-9 pr-3 text-xs text-tp-slate-800
            placeholder:text-tp-slate-400
            focus:border-tp-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-tp-blue-500/20
            transition-colors
          "
        />
      </div>
    </div>
  )
}

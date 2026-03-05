"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Pencil,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronUp,
  User,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react"

// ─── DATA TABLE ───

const tableData = [
  { name: "Andrew Chapman", email: "andrewc@mail.com", role: "Doctor", status: "Active", date: "Feb 14, 2026" },
  { name: "Sarah Mitchell", email: "sarahm@mail.com", role: "Nurse", status: "Active", date: "Feb 12, 2026" },
  { name: "James Wilson", email: "jamesw@mail.com", role: "Admin", status: "Pending", date: "Feb 10, 2026" },
  { name: "Emily Chen", email: "emilyc@mail.com", role: "Doctor", status: "Active", date: "Feb 08, 2026" },
  { name: "Michael Brown", email: "michaelb@mail.com", role: "Receptionist", status: "Inactive", date: "Jan 28, 2026" },
  { name: "Lisa Taylor", email: "lisat@mail.com", role: "Nurse", status: "Active", date: "Jan 25, 2026" },
]

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "#ECFDF5", text: "#047857", dot: "#10B981" },
  Pending: { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
  Inactive: { bg: "#F1F1F5", text: "#545460", dot: "#A2A2A8" },
}

type SortDir = "asc" | "desc" | null

export function DataTableShowcase() {
  const [selected, setSelected] = useState<number[]>([0, 3])
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const toggleRow = (i: number) => {
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const toggleAll = () => {
    setSelected((prev) =>
      prev.length === tableData.length ? [] : tableData.map((_, i) => i)
    )
  }

  const handleSort = (col: number) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc")
      if (sortDir === "desc") setSortCol(null)
    } else {
      setSortCol(col)
      setSortDir("asc")
    }
  }

  const headers = ["Member", "Role", "Status", "Date", "Action"]

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Data Table</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Sortable table with row selection, status labels (pill radius), and neutral CTA-style action buttons. Constraint: No toolbar row -- actions live in a sticky right column with an inset shadow (-4px) for scroll separation. Sort icons use filled triangles (TP Blue when active, TP Slate 300 when inactive). Row selection highlights entire row in TP Blue 50. Action buttons use 8px radius with TP Slate 100 background and darken on hover.
      </p>

      <div
        className="border border-tp-slate-200 overflow-hidden bg-card"
        style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(23,23,37,0.06)" }}
      >
        {/* Table with sticky action column */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "700px" }}>
            <thead>
              <tr className="bg-tp-slate-50 border-b border-tp-slate-200">
                <th className="px-4 py-3 w-12">
                  <button
                    onClick={toggleAll}
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: selected.length === tableData.length ? "#4B4AD5" : "#FFFFFF",
                      border: selected.length === tableData.length ? "none" : "1.5px solid #D0D5DD",
                      borderRadius: "6px",
                      boxShadow: selected.length === tableData.length ? "0 1px 2px rgba(75,74,213,0.2)" : "0 1px 2px rgba(23,23,37,0.05)",
                    }}
                  >
                    {selected.length === tableData.length && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                    {selected.length > 0 && selected.length < tableData.length && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6H9" stroke="#4B4AD5" strokeWidth="2" strokeLinecap="round" /></svg>
                    )}
                  </button>
                </th>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-left font-semibold text-tp-slate-700 whitespace-nowrap ${i === 4 ? "sticky right-0 bg-tp-slate-50" : ""}`}
                    style={i === 4 ? { boxShadow: "-4px 0 8px -4px rgba(23,23,37,0.08)" } : undefined}
                  >
                    {i < 4 ? (
                      <button
                        className="inline-flex items-center gap-1.5 hover:text-tp-slate-900 transition-colors"
                        onClick={() => handleSort(i)}
                      >
                        {h}
                        {sortCol === i && sortDir === "asc" ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3L11 8H3L7 3Z" fill="#4B4AD5" /></svg>
                        ) : sortCol === i && sortDir === "desc" ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 11L3 6H11L7 11Z" fill="#4B4AD5" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 3L10 6.5H4L7 3Z" fill="#D0D5DD" />
                            <path d="M7 11L4 7.5H10L7 11Z" fill="#D0D5DD" />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <span>{h}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => {
                const sc = statusColors[row.status] || statusColors.Active
                const isSelected = selected.includes(i)
                return (
                  <tr
                    key={i}
                    className="border-b border-tp-slate-100 last:border-b-0 transition-colors hover:bg-tp-slate-50/60"
                    style={{
                      backgroundColor: isSelected ? "#EEEEFF" : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRow(i)}
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          backgroundColor: isSelected ? "#4B4AD5" : "#FFFFFF",
                          border: isSelected ? "none" : "1.5px solid #D0D5DD",
                          borderRadius: "6px",
                          boxShadow: isSelected ? "0 1px 2px rgba(75,74,213,0.2)" : "0 1px 2px rgba(23,23,37,0.05)",
                        }}
                      >
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#EEEEFF" }}
                        >
                          <span className="inline-flex flex-shrink-0"><User size={16} className="text-tp-blue-500" /></span>
                        </span>
                        <div>
                          <span className="font-medium text-tp-slate-900 block leading-tight">{row.name}</span>
                          <span className="text-xs text-tp-slate-400">{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-tp-slate-600 font-medium">{row.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1"
                        style={{
                          borderRadius: "100px",
                          backgroundColor: sc.bg,
                          color: sc.text,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sc.dot }}
                        />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-tp-slate-500 text-xs font-mono">{row.date}</td>
                    {/* Sticky action column with shadow */}
                    <td
                      className="px-4 py-3 sticky right-0"
                      style={{
                        backgroundColor: isSelected ? "#EEEEFF" : "#FFFFFF",
                        boxShadow: "-4px 0 8px -4px rgba(23,23,37,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <button
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: "#F1F1F5",
                            color: "#545460",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E2EA" }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F1F5" }}
                        >
                          <span className="inline-flex flex-shrink-0"><Eye size={16} /></span>
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: "#F1F1F5",
                            color: "#545460",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E2EA" }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F1F5" }}
                        >
                          <span className="inline-flex flex-shrink-0"><Pencil size={16} /></span>
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: "#F1F1F5",
                            color: "#545460",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FFE4E6"; e.currentTarget.style.color = "#E11D48" }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F1F5"; e.currentTarget.style.color = "#545460" }}
                        >
                          <span className="inline-flex flex-shrink-0"><Trash2 size={16} /></span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── PAGINATION ───

export function PaginationShowcase() {
  const [current, setCurrent] = useState(1)
  const [perPage, setPerPage] = useState(10)

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Pagination</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Multiple pagination styles: numbered, prev/next, compact, and per-page selector. Constraint: Active page uses TP Blue 500 fill with white text + subtle blue shadow. Page buttons are 32x32px with 8px radius. The per-page selector variant includes a native select dropdown. Compact variant shows a bordered page number input for direct entry.
      </p>

      <div className="flex flex-col gap-8">
        {/* Numbered */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Numbered Pagination</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-tp-slate-400 hover:bg-tp-slate-100 transition-colors">
              <ChevronsLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-tp-slate-400 hover:bg-tp-slate-100 transition-colors">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3, "...", 10].map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === "number" && setCurrent(p)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: current === p ? "#4B4AD5" : "transparent",
                  color: current === p ? "#FFFFFF" : p === "..." ? "#A2A2A8" : "#454551",
                  boxShadow: current === p ? "0 1px 3px rgba(75,74,213,0.25)" : "none",
                }}
              >
                {p}
              </button>
            ))}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-tp-slate-400 hover:bg-tp-slate-100 transition-colors">
              <ChevronRight size={16} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-tp-slate-400 hover:bg-tp-slate-100 transition-colors">
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>

        {/* Prev/Next text style */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Prev / Next with text</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-tp-slate-500 hover:bg-tp-slate-100 rounded-lg transition-colors flex items-center gap-1">
              <ChevronLeft size={14} />
              Previous
            </button>
            {[1, 2, 3, "...", 10].map((p, i) => (
              <button
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: p === 1 ? "#4B4AD5" : "transparent",
                  color: p === 1 ? "#FFFFFF" : p === "..." ? "#A2A2A8" : "#454551",
                  boxShadow: p === 1 ? "0 1px 3px rgba(75,74,213,0.25)" : "none",
                }}
              >
                {p}
              </button>
            ))}
            <button className="px-3 py-1.5 text-sm font-medium text-tp-slate-500 hover:bg-tp-slate-100 rounded-lg transition-colors flex items-center gap-1">
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Per-page selector */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">With Per-Page Selector</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-tp-slate-600">Show</span>
              <div
                className="relative inline-flex items-center px-3 border border-tp-slate-200 bg-card"
                style={{ height: "32px", borderRadius: "8px" }}
              >
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="bg-transparent outline-none text-sm font-semibold text-tp-slate-800 appearance-none pr-5"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 text-tp-slate-400 pointer-events-none" />
              </div>
              <span className="text-sm text-tp-slate-600">per page</span>
            </div>
            <span className="text-xs text-tp-slate-400">Page 1 of 10</span>
          </div>
        </div>

        {/* Compact */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Compact</span>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-tp-slate-200 text-tp-slate-400 hover:bg-tp-slate-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-tp-slate-600">Page</span>
            <div
              className="w-12 h-8 rounded-lg border border-tp-slate-200 flex items-center justify-center text-sm font-semibold text-tp-slate-800 bg-card"
            >
              1
            </div>
            <span className="text-sm text-tp-slate-600">of 10</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-tp-slate-200 text-tp-slate-400 hover:bg-tp-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TOOLTIPS ───

function Tooltip({ text, header, dark, closable, size = "md" }: {
  text: string
  header?: string
  dark?: boolean
  closable?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const bg = dark ? "#171725" : "#FFFFFF"
  const textColor = dark ? "#D0D5DD" : "#545460"
  const headerColor = dark ? "#FFFFFF" : "#171725"
  const closeColor = dark ? "#A2A2A8" : "#A2A2A8"
  const maxW = size === "sm" ? "180px" : size === "lg" ? "320px" : "240px"

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className="px-3 py-2.5 text-xs"
        style={{
          backgroundColor: bg,
          color: textColor,
          border: "none",
          borderRadius: "8px",
          maxWidth: maxW,
          boxShadow: dark
            ? "0 12px 24px -4px rgba(23,23,37,0.30)"
            : "0 4px 16px -2px rgba(23,23,37,0.12), 0 2px 6px -2px rgba(23,23,37,0.06)",
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {header && <div className="font-bold text-[13px] mb-1" style={{ color: headerColor }}>{header}</div>}
            <div style={{ lineHeight: "1.5" }}>{text}</div>
          </div>
          {closable && (
            <button className="flex-shrink-0 mt-0.5 hover:opacity-70 transition-opacity inline-flex items-center justify-center" style={{ color: closeColor }}>
              <span className="inline-flex flex-shrink-0"><XCircle size={14} /></span>
            </button>
          )}
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center -mt-[5px]">
        <div
          className="w-2.5 h-2.5 rotate-45"
          style={{
            backgroundColor: bg,
            boxShadow: dark ? "none" : "2px 2px 4px rgba(23,23,37,0.06)",
          }}
        />
      </div>
    </div>
  )
}

export function TooltipShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Tooltips</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Light and dark theme tooltips with simple, header+body, and closable variants. Three sizes (S, M, L). 8px radius. Constraint: Light tooltips use shadow only (no border/stroke) to appear floating. Dark tooltips use deeper shadow for contrast on light backgrounds.
      </p>

      <div className="flex flex-col gap-8">
        {/* Light - Simple */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Light Theme - Simple</span>
          <div className="flex flex-wrap gap-6 items-start">
            <Tooltip text="Here is a tooltip" size="sm" />
            <Tooltip text="Here is a tooltip" size="md" />
            <Tooltip text="Here is a tooltip" size="lg" />
          </div>
        </div>

        {/* Light - With Close */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Light Theme - Closable</span>
          <div className="flex flex-wrap gap-6 items-start">
            <Tooltip text="Here is a tooltip" closable size="sm" />
            <Tooltip text="Here is a tooltip" closable size="md" />
            <Tooltip text="Here is a tooltip" closable size="lg" />
          </div>
        </div>

        {/* Light - With Header */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Light Theme - Header + Body</span>
          <div className="flex flex-wrap gap-6 items-start">
            <Tooltip header="Here is a tooltip" text="Here is some helpful explainer text to assist or guide the user in understanding how a certain feature works." size="md" />
            <Tooltip header="Here is a tooltip" text="Here is some helpful explainer text to assist or guide the user in understanding how a certain feature works." closable size="md" />
            <Tooltip header="Here is a tooltip" text="Here is some helpful explainer text to assist or guide the user in understanding how a certain feature works." size="lg" />
          </div>
        </div>

        {/* Dark - Simple */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Dark Theme - Simple</span>
          <div className="flex flex-wrap gap-6 items-start">
            <Tooltip text="Here is a tooltip" dark size="sm" />
            <Tooltip text="Here is a tooltip" dark size="md" />
            <Tooltip text="Here is a tooltip" dark size="lg" />
          </div>
        </div>

        {/* Dark - With Close */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Dark Theme - Closable</span>
          <div className="flex flex-wrap gap-6 items-start">
            <Tooltip text="Here is a tooltip" dark closable size="sm" />
            <Tooltip text="Here is a tooltip" dark closable size="md" />
            <Tooltip text="Here is a tooltip" dark closable size="lg" />
          </div>
        </div>

        {/* Dark - With Header */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Dark Theme - Header + Body</span>
          <div className="flex flex-wrap gap-6 items-start">
            <Tooltip header="Here is a tooltip" text="Here is some helpful explainer text to assist or guide the user in understanding how a certain feature works." dark size="md" />
            <Tooltip header="Here is a tooltip" text="Here is some helpful explainer text to assist or guide the user in understanding how a certain feature works." dark closable size="md" />
            <Tooltip header="Here is a tooltip" text="Here is some helpful explainer text to assist or guide the user in understanding how a certain feature works." dark size="lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MODAL / DIALOG ───

export function ModalShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Modal / Dialog</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Centered overlay dialogs. Confirmation (destructive), success, and info variants. 16px radius, layered shadow.
      </p>

      <div className="flex flex-wrap gap-8 items-start">
        {/* Destructive Confirmation */}
        <div
          className="bg-card border border-tp-slate-200 flex flex-col"
          style={{
            borderRadius: "16px",
            width: "380px",
            boxShadow: "0 20px 40px -8px rgba(23,23,37,0.12), 0 8px 16px -6px rgba(23,23,37,0.06)",
            overflow: "hidden",
          }}
        >
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFF1F2" }}
              >
                <span className="inline-flex flex-shrink-0"><AlertCircle size={20} className="text-tp-error-500" /></span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-tp-slate-900 font-heading">Delete Patient Record</h4>
                <p className="text-sm text-tp-slate-500 mt-1 leading-relaxed">This action cannot be undone. Are you sure you want to permanently delete this record?</p>
              </div>
              <button className="text-tp-slate-400 hover:text-tp-slate-700 transition-colors flex-shrink-0 inline-flex items-center justify-center">
                <span className="inline-flex flex-shrink-0"><XCircle size={20} /></span>
              </button>
            </div>
          </div>
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-tp-slate-100 bg-tp-slate-50/50">
            <button
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: "#F1F1F5", color: "#454551" }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: "#E11D48", color: "#FFFFFF", boxShadow: "0 1px 3px rgba(225,29,72,0.2)" }}
            >
              Delete Record
            </button>
          </div>
        </div>

        {/* Success / Info modal */}
        <div
          className="bg-card border border-tp-slate-200 flex flex-col"
          style={{
            borderRadius: "16px",
            width: "380px",
            boxShadow: "0 20px 40px -8px rgba(23,23,37,0.12), 0 8px 16px -6px rgba(23,23,37,0.06)",
            overflow: "hidden",
          }}
        >
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#ECFDF5" }}
              >
                <span className="inline-flex flex-shrink-0"><CheckCircle2 size={20} className="text-tp-success-500" /></span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-tp-slate-900 font-heading">Rx Saved Successfully</h4>
                <p className="text-sm text-tp-slate-500 mt-1 leading-relaxed">Prescription for Amoxicillin 500mg has been saved and sent to the pharmacy.</p>
              </div>
              <button className="text-tp-slate-400 hover:text-tp-slate-700 transition-colors flex-shrink-0 inline-flex items-center justify-center">
                <span className="inline-flex flex-shrink-0"><XCircle size={20} /></span>
              </button>
            </div>
          </div>
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-tp-slate-100 bg-tp-slate-50/50">
            <button
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: "#4B4AD5", color: "#FFFFFF", boxShadow: "0 1px 3px rgba(75,74,213,0.25)" }}
            >
              Done
            </button>
          </div>
        </div>

        {/* Info modal */}
        <div
          className="bg-card border border-tp-slate-200 flex flex-col"
          style={{
            borderRadius: "16px",
            width: "380px",
            boxShadow: "0 20px 40px -8px rgba(23,23,37,0.12), 0 8px 16px -6px rgba(23,23,37,0.06)",
            overflow: "hidden",
          }}
        >
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#F0F9FF" }}
              >
                <span className="inline-flex flex-shrink-0"><Info size={20} className="text-tp-blue-500" /></span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-tp-slate-900 font-heading">System Maintenance</h4>
                <p className="text-sm text-tp-slate-500 mt-1 leading-relaxed">Scheduled maintenance on Feb 20, 2026 from 2:00 AM to 4:00 AM. Service may be briefly unavailable.</p>
              </div>
              <button className="text-tp-slate-400 hover:text-tp-slate-700 transition-colors flex-shrink-0 inline-flex items-center justify-center">
                <span className="inline-flex flex-shrink-0"><XCircle size={20} /></span>
              </button>
            </div>
          </div>
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-tp-slate-100 bg-tp-slate-50/50">
            <button
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: "#F1F1F5", color: "#454551" }}
            >
              Dismiss
            </button>
            <button
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: "#4B4AD5", color: "#FFFFFF", boxShadow: "0 1px 3px rgba(75,74,213,0.25)" }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

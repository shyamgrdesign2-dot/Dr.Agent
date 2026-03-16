"use client"

import React, { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { CloseCircle } from "iconsax-reactjs"
import type { PatientDocument, PatientDocType, CannedPill } from "../types"
import { AI_GRADIENT, AI_PILL_BG, AI_PILL_BORDER, AI_PILL_TEXT_GRADIENT } from "../constants"
import { TPMedicalIcon } from "@/components/tp-ui"

// -----------------------------------------------------------------
// DocumentBottomSheet — Bottom sheet within the Dr. Agent panel
//
// Shows all uploaded documents for the selected patient. Doctors
// can multi-select up to 5 docs to send to the chat for analysis,
// summary, or comparison. Also has an "Upload new" option.
//
// Appears with a dark backdrop that blocks interaction with chat
// content behind it. Slides up from bottom with animation.
// -----------------------------------------------------------------

/** Default canned suggestions for document context */
const DOC_CANNED_SUGGESTIONS: Array<{ id: string; label: string }> = [
  { id: "doc-summarize", label: "Summarize document" },
  { id: "doc-compare", label: "Compare documents" },
  { id: "doc-extract", label: "Extract key findings" },
  { id: "doc-abnormal", label: "Check abnormalities" },
]

interface DocumentBottomSheetProps {
  documents: PatientDocument[]
  onSendDocuments: (docs: PatientDocument[]) => void
  onUploadNew: () => void
  onClose: () => void
  onCannedAction?: (label: string) => void
  maxSelect?: number
}

/** Map doc type → icon & color */
const DOC_TYPE_CONFIG: Record<
  PatientDocType,
  { iconName: string; iconColor: string; bgColor: string; label: string }
> = {
  pathology: {
    iconName: "test-tube",
    iconColor: "#1B8C54",
    bgColor: "rgba(27,140,84,0.08)",
    label: "Pathology",
  },
  radiology: {
    iconName: "x-ray",
    iconColor: "#3B6FE0",
    bgColor: "rgba(59,111,224,0.08)",
    label: "Radiology",
  },
  prescription: {
    iconName: "clipboard-activity",
    iconColor: "#C6850C",
    bgColor: "rgba(198,133,12,0.08)",
    label: "Prescription",
  },
  discharge_summary: {
    iconName: "file-text",
    iconColor: "#7C3AED",
    bgColor: "rgba(124,58,237,0.08)",
    label: "Discharge",
  },
  vaccination: {
    iconName: "injection",
    iconColor: "#0891B2",
    bgColor: "rgba(8,145,178,0.08)",
    label: "Vaccination",
  },
  other: {
    iconName: "document",
    iconColor: "#64748B",
    bgColor: "rgba(100,116,139,0.08)",
    label: "Document",
  },
}

export function DocumentBottomSheet({
  documents,
  onSendDocuments,
  onUploadNew,
  onClose,
  onCannedAction,
  maxSelect = 2,
}: DocumentBottomSheetProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [maxWarning, setMaxWarning] = useState(false)

  const toggleDoc = useCallback(
    (docId: string) => {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(docId)) {
          next.delete(docId)
          setMaxWarning(false)
        } else {
          if (next.size >= maxSelect) {
            setMaxWarning(true)
            setTimeout(() => setMaxWarning(false), 2000)
            return prev
          }
          next.add(docId)
        }
        return next
      })
    },
    [maxSelect],
  )

  const handleSend = useCallback(() => {
    const docs = documents.filter((d) => selected.has(d.id))
    if (docs.length > 0) {
      onSendDocuments(docs)
    }
  }, [documents, selected, onSendDocuments])

  const selectedCount = selected.size

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop — blocks interaction */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="relative z-10 flex max-h-[75%] flex-col rounded-t-[16px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-4 duration-300">
        {/* Drag handle bar */}
        <div className="flex justify-center pt-[10px] pb-[2px]">
          <div className="h-[4px] w-[36px] rounded-full bg-tp-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-tp-slate-100 px-4 pb-[10px] pt-[6px]">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-tp-slate-800">
              Patient Documents
            </h3>
            <span className="rounded-full bg-tp-slate-100 px-[7px] py-[1px] text-[10px] font-medium text-tp-slate-500">
              {documents.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-tp-slate-700 transition-colors hover:bg-tp-slate-100"
            aria-label="Close"
          >
            <CloseCircle size={16} variant="Bulk" />
          </button>
        </div>

        {/* Selection hint */}
        <div className="flex items-center justify-between border-b border-tp-slate-50 px-4 py-[6px]">
          <p className="text-[10px] text-tp-slate-400">
            {selectedCount > 0
              ? `${selectedCount} selected`
              : "Select documents to analyze"}
          </p>
          {maxWarning && (
            <p className="text-[10px] font-medium text-tp-amber-600 animate-in fade-in duration-150">
              Max {maxSelect} documents
            </p>
          )}
          {selectedCount > 0 && !maxWarning && (
            <button
              type="button"
              onClick={() => { setSelected(new Set()); setMaxWarning(false) }}
              className="text-[10px] font-medium text-tp-slate-400 transition-colors hover:text-tp-slate-600"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Document list — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-[6px]">
          {documents.map((doc) => {
            const config = DOC_TYPE_CONFIG[doc.docType] ?? DOC_TYPE_CONFIG.other
            const isSelected = selected.has(doc.id)

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggleDoc(doc.id)}
                className={cn(
                  "flex w-full items-center gap-[10px] rounded-[10px] px-[10px] py-[8px] text-left transition-all duration-150",
                  isSelected
                    ? "bg-tp-violet-50/60 ring-1 ring-tp-violet-200/60"
                    : "hover:bg-tp-slate-50",
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all duration-150",
                    isSelected
                      ? "border-transparent"
                      : "border-tp-slate-300 bg-white",
                  )}
                  style={
                    isSelected
                      ? { background: AI_GRADIENT }
                      : undefined
                  }
                >
                  {isSelected && (
                    <svg
                      width={11}
                      height={11}
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="white"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Doc type icon */}
                <div
                  className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px]"
                  style={{ background: config.bgColor }}
                >
                  <TPMedicalIcon
                    name={config.iconName}
                    variant="bulk"
                    size={16}
                    color={config.iconColor}
                  />
                </div>

                {/* File info */}
                <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
                  <span className="truncate text-[11px] font-medium text-tp-slate-700">
                    {doc.fileName}
                  </span>
                  <span className="text-[9px] text-tp-slate-400">
                    {config.label} · {doc.uploadedAt} · {doc.uploadedBy}
                  </span>
                </div>

                {/* File size */}
                <span className="shrink-0 text-[9px] text-tp-slate-300">
                  {doc.size}
                </span>
              </button>
            )
          })}
        </div>

        {/* Upload new document row */}
        <div className="border-t border-tp-slate-100 px-3 py-[6px]">
          <button
            type="button"
            onClick={onUploadNew}
            className="flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[7px] text-left transition-colors hover:bg-tp-slate-50"
          >
            <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] border border-dashed border-tp-slate-300 bg-tp-slate-50">
              <Plus size={14} className="text-tp-slate-400" />
            </div>
            <span className="text-[11px] font-medium text-tp-slate-500">
              Upload new document
            </span>
          </button>
        </div>

        {/* Canned message suggestions — above send */}
        {selectedCount > 0 && (
          <div className="border-t border-tp-slate-100 px-4 py-[8px]">
            <p className="text-[9px] font-medium text-tp-slate-400 mb-[6px]">Suggested actions</p>
            <div className="flex flex-wrap gap-[6px]">
              {DOC_CANNED_SUGGESTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onCannedAction?.(s.label)}
                  className="flex h-[26px] shrink-0 items-center rounded-full px-[14px] text-[11px] font-normal transition-all whitespace-nowrap"
                  style={{ background: AI_PILL_BG, border: AI_PILL_BORDER }}
                >
                  <span
                    style={{
                      background: AI_PILL_TEXT_GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Send button — footer */}
        <div className="border-t border-tp-slate-100 px-4 py-[10px]">
          <button
            type="button"
            onClick={handleSend}
            disabled={selectedCount === 0}
            className={cn(
              "flex w-full items-center justify-center gap-[6px] rounded-[10px] px-4 py-[9px] text-[12px] font-semibold text-white transition-all duration-200",
              selectedCount === 0
                ? "cursor-not-allowed bg-tp-slate-200 text-tp-slate-400"
                : "shadow-sm hover:shadow-md active:scale-[0.98]",
            )}
            style={
              selectedCount > 0
                ? { background: AI_GRADIENT }
                : undefined
            }
          >
            {selectedCount === 0 ? (
              "Select documents to send"
            ) : (
              <>
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
                Send {selectedCount} document{selectedCount > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

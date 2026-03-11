"use client"
import React, { useState } from "react"
import { Flash } from "iconsax-reactjs"
import { CardShell } from "../CardShell"
import type { BulkActionCardData } from "../../types"

interface Props { data: BulkActionCardData; onPillTap?: (label: string) => void }

export function BulkActionCard({ data, onPillTap }: Props) {
  const [confirmed, setConfirmed] = useState(false)
  const visibleRecipients = data.recipients.slice(0, 3)
  const remainingCount = data.totalCount - visibleRecipients.length

  return (
    <CardShell
      icon={<Flash size={14} variant="Bulk" color="var(--tp-blue-500, #3B82F6)" />}
      title={data.action}
      badge={{ label: "ACTION", color: "#92400E", bg: "#FEF3C7" }}
    >
      {confirmed ? (
        <div className="rounded-[8px] bg-tp-green-50 p-[10px] text-center">
          <p className="text-[12px] font-semibold text-tp-green-700">Action confirmed</p>
          <p className="mt-[2px] text-[10px] text-tp-green-600">Sent to {data.totalCount} recipients</p>
        </div>
      ) : (
        <>
          {/* Message Preview */}
          <div className="mb-[10px] rounded-[8px] bg-tp-slate-50 p-[8px]">
            <p className="mb-[2px] text-[9px] font-semibold uppercase tracking-wider text-tp-slate-400">Message Preview</p>
            <p className="text-[11px] text-tp-slate-700 italic">&ldquo;{data.messagePreview}&rdquo;</p>
          </div>

          {/* Recipients */}
          <div className="mb-[8px]">
            <p className="mb-[3px] text-[9px] font-semibold uppercase tracking-wider text-tp-slate-400">Recipients ({data.totalCount})</p>
            <div className="space-y-[2px]">
              {visibleRecipients.map((name, i) => (
                <p key={i} className="text-[11px] text-tp-slate-700">&bull; {name}</p>
              ))}
              {remainingCount > 0 && (
                <p className="text-[10px] text-tp-slate-400">+ {remainingCount} more</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-[8px]">
            <button
              type="button"
              className="flex-1 h-[28px] rounded-[10px] border-[1.5px] border-tp-blue-500 bg-transparent text-[11px] font-medium text-tp-blue-600 hover:bg-tp-blue-50 transition-all"
              onClick={() => setConfirmed(true)}
            >
              Confirm &amp; Send
            </button>
            <button
              type="button"
              className="flex-1 h-[28px] rounded-[10px] border-[1.5px] border-tp-error-400 bg-transparent text-[11px] font-medium text-tp-error-600 hover:bg-tp-error-50 transition-all"
              onClick={() => onPillTap?.("Cancel bulk action")}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </CardShell>
  )
}

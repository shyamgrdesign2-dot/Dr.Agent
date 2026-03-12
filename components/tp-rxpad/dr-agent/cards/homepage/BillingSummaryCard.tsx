"use client"

import { CardShell } from "../CardShell"
import { SidebarLink } from "../SidebarLink"
import { cn } from "@/lib/utils"
import type { BillingSummaryCardData } from "../../types"

interface Props {
  data: BillingSummaryCardData
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  paid_fully: { color: "#22C55E", bg: "#F0FDF4" },
  due: { color: "#F59E0B", bg: "#FFFBEB" },
  refunded: { color: "#DC2626", bg: "#FEE2E2" },
  deposited: { color: "#7C3AED", bg: "#F5F3FF" },
  debited: { color: "#D97706", bg: "#FFFBEB" },
}

export function BillingSummaryCard({ data }: Props) {
  const statusLabel = (status: string) => {
    if (status === "paid_fully") return "Paid fully"
    if (status === "due") return "Due"
    if (status === "refunded") return "Refunded"
    if (status === "deposited") return "Deposit"
    if (status === "debited") return "Debited"
    return status
  }

  return (
    <CardShell
      icon={<span />}
      tpIconName="receipt"
      title={data.title}
      sidebarLink={<SidebarLink text="Generate invoice" />}
    >
      <div className="mb-[8px] grid grid-cols-2 gap-[6px]">
        {(data.mode === "billing" || data.mode === "combined") && (
          <>
            <div className="rounded-[8px] bg-tp-slate-50 px-[7px] py-[5px]">
              <p className="text-[9px] uppercase tracking-wide text-tp-slate-400">Total billed amount</p>
              <p className="text-[13px] font-semibold text-tp-slate-800">₹{data.totalBilledAmount.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-[8px] px-[7px] py-[5px]" style={{ backgroundColor: "rgba(34,197,94,0.08)" }}>
              <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--tp-success-500, #22C55E)" }}>Paid fully</p>
              <p className="text-[13px] font-semibold" style={{ color: "var(--tp-success-600, #16A34A)" }}>₹{data.totalPaidFullyAmount.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-[8px] px-[7px] py-[5px]" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
              <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--tp-warning-500, #F59E0B)" }}>Due</p>
              <p className="text-[13px] font-semibold" style={{ color: "var(--tp-warning-600, #D97706)" }}>₹{data.totalDueAmount.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-[8px] px-[7px] py-[5px]" style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
              <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--tp-danger-500, #EF4444)" }}>Refunded</p>
              <p className="text-[13px] font-semibold" style={{ color: "var(--tp-danger-600, #DC2626)" }}>₹{data.totalRefundedAmount.toLocaleString("en-IN")}</p>
            </div>
          </>
        )}
        {(data.mode === "deposit" || data.mode === "combined") && (
          <>
            <div className="rounded-[8px] bg-tp-slate-50 px-[7px] py-[5px]">
              <p className="text-[9px] uppercase tracking-wide text-tp-slate-400">Total advance received</p>
              <p className="text-[13px] font-semibold text-tp-slate-800">₹{data.totalAdvanceReceived.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-[8px] px-[7px] py-[5px]" style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
              <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--tp-danger-500, #EF4444)" }}>Total advance refunded</p>
              <p className="text-[13px] font-semibold" style={{ color: "var(--tp-danger-600, #DC2626)" }}>₹{data.totalAdvanceRefunded.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-[8px] px-[7px] py-[5px]" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
              <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--tp-warning-500, #F59E0B)" }}>Total advance debited</p>
              <p className="text-[13px] font-semibold" style={{ color: "var(--tp-warning-600, #D97706)" }}>₹{data.totalAdvanceDebited.toLocaleString("en-IN")}</p>
            </div>
          </>
        )}
      </div>

      {/* Status table */}
      <div className="overflow-hidden rounded-[8px] border border-tp-slate-100">
        <div className="grid grid-cols-5 gap-[1px] bg-tp-slate-100 px-[8px] py-[4px] text-[9px] font-medium text-tp-slate-500 uppercase tracking-wider">
          <span>Ref</span>
          <span>Patient</span>
          <span>Total amount</span>
          <span>Paid amount</span>
          <span>Status</span>
        </div>
        {data.items.map((item, i) => {
          const style = STATUS_STYLE[item.status] ?? STATUS_STYLE.due
          return (
            <div
              key={i}
              className={cn(
                "grid grid-cols-5 gap-[1px] px-[8px] py-[6px] text-[11px]",
                i % 2 === 0 ? "bg-white" : "bg-tp-slate-50",
              )}
            >
              <span className="font-medium text-tp-slate-700 truncate">{item.referenceNo}</span>
              <span className="text-tp-slate-700 truncate">{item.patientName}</span>
              <span className="text-tp-slate-700">₹{(item.billedAmount ?? item.amount).toLocaleString("en-IN")}</span>
              <span className="text-tp-slate-700">₹{(item.paidAmount ?? item.amount).toLocaleString("en-IN")}</span>
              <span>
                <span
                  className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-medium"
                  style={{ color: style.color, backgroundColor: style.bg }}
                >
                  {statusLabel(item.status)}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}

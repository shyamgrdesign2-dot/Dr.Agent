"use client"

import { CardShell } from "../CardShell"
import { SidebarLink } from "../SidebarLink"
import { cn } from "@/lib/utils"
import type { BillingSummaryCardData } from "../../types"

interface Props {
  data: BillingSummaryCardData
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  paid: { color: "#22C55E", bg: "#F0FDF4" },
  pending: { color: "#F59E0B", bg: "#FFFBEB" },
  waived: { color: "#64748B", bg: "#F1F5F9" },
}

export function BillingSummaryCard({ data }: Props) {
  return (
    <CardShell
      icon={<span />}
      tpIconName="receipt"
      title="Billing Summary"
      sidebarLink={<SidebarLink text="Generate invoice" />}
    >
      {/* Grid-based billing table */}
      <div className="overflow-hidden rounded-[8px] border border-tp-slate-100">
        {/* Header */}
        <div className="grid grid-cols-3 gap-[1px] bg-tp-slate-100 px-[8px] py-[4px] text-[9px] font-medium text-tp-slate-500 uppercase tracking-wider">
          <span>Service</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {/* Rows */}
        {data.items.map((item, i) => {
          const style = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending
          return (
            <div
              key={i}
              className={cn(
                "grid grid-cols-3 gap-[1px] px-[8px] py-[6px] text-[11px]",
                i % 2 === 0 ? "bg-white" : "bg-tp-slate-50",
              )}
            >
              <span className="font-medium text-tp-slate-700 truncate">{item.service}</span>
              <span className="text-tp-slate-700">₹{item.amount.toLocaleString("en-IN")}</span>
              <span>
                <span
                  className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-medium"
                  style={{ color: style.color, backgroundColor: style.bg }}
                >
                  {item.status}
                </span>
              </span>
            </div>
          )
        })}
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-[1px] bg-tp-slate-100 px-[8px] py-[5px] text-[11px] font-medium">
          <span className="text-tp-slate-600">Total</span>
          <span className="text-tp-slate-800">₹{data.totalAmount.toLocaleString("en-IN")}</span>
          <span className="text-tp-success-600">Paid ₹{data.totalPaid.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Balance */}
      {data.balance > 0 && (
        <div className="mt-[6px] rounded-[6px] bg-tp-warning-50 px-2.5 py-[4px] text-[12px] font-medium text-tp-warning-700">
          Balance Due: ₹{data.balance.toLocaleString("en-IN")}
        </div>
      )}
    </CardShell>
  )
}

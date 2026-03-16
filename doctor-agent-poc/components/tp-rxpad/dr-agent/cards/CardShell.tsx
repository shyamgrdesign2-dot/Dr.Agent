"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { CopyIcon } from "./CopyIcon"
import { ActionableTooltip } from "./ActionableTooltip"
import { TPMedicalIcon } from "@/components/tp-ui"
import { Copy, ArrowDown2, ArrowUp2 } from "iconsax-reactjs"

interface CardShellProps {
  icon: React.ReactNode
  iconBg?: string               // Deprecated: always uses TP blue-50
  title: string
  date?: string
  tpIconName?: string
  badge?: { label: string; color: string; bg: string }
  copyAll?: () => void
  copyAllTooltip?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  actions?: React.ReactNode
  sidebarLink?: React.ReactNode
  children: React.ReactNode
}

export function CardShell({
  icon,
  title,
  date,
  tpIconName,
  badge,
  copyAll,
  copyAllTooltip,
  collapsible = true,
  defaultCollapsed = false,
  actions,
  sidebarLink,
  children,
}: CardShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [copyHovered, setCopyHovered] = useState(false)

  return (
    <div
      className="w-full overflow-hidden rounded-[14px] bg-white"
      style={{
        border: "1px solid transparent",
        backgroundImage: "linear-gradient(white, white), linear-gradient(180deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 25%, rgba(23,23,37,0.02) 50%, rgba(59,130,246,0.04) 75%, rgba(59,130,246,0.18) 100%)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {/* Header */}
      <div
        className={cn("flex gap-[7px] px-3 py-[11px]", date ? "items-start" : "items-center")}
        style={{
          background: "linear-gradient(180deg, rgba(59,130,246,0.05) 0%, #FFFFFF 100%)",
          borderBottom: "1px solid var(--tp-slate-50, #F8FAFC)",
        }}
      >
        {/* Icon — always TP blue */}
        <div
          className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px]"
          style={{ background: "var(--tp-blue-50, rgba(59, 130, 246, 0.08))" }}
        >
          {tpIconName ? (
            <TPMedicalIcon name={tpIconName} variant="bulk" size={15} color="var(--tp-blue-500, #3B82F6)" />
          ) : (
            <span style={{ color: "var(--tp-blue-500, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
          )}
        </div>

        {/* Title + Date */}
        <div className="flex min-w-0 flex-col text-tp-slate-800">
          <span className="max-w-[200px] text-[12px] font-semibold leading-[1.3] truncate" title={title}>
            {title}
          </span>
          {date && (
            <span className="mt-[1px] max-w-[200px] text-[10px] font-normal text-tp-slate-400 leading-[1.3] truncate">
              {date}
            </span>
          )}
        </div>

        {/* Copy All — horizontally aligned with primary heading text */}
        {copyAll && (
          <div className="flex-shrink-0">
            {copyAllTooltip ? (
              <ActionableTooltip label={copyAllTooltip} onAction={() => copyAll()}>
                <span
                  className={cn("cursor-pointer transition-colors", copyHovered ? "text-tp-blue-600" : "text-tp-blue-500")}
                  onMouseEnter={() => setCopyHovered(true)}
                  onMouseLeave={() => setCopyHovered(false)}
                >
                  <Copy size={14} variant={copyHovered ? "Bulk" : "Linear"} />
                </span>
              </ActionableTooltip>
            ) : (
              <CopyIcon size={14} onClick={() => copyAll()} />
            )}
          </div>
        )}

        {/* Spacer — pushes badge and chevron to the right */}
        <span className="flex-1" />

        {/* Badge */}
        {badge && (
          <span
            className="rounded-[4px] px-[6px] py-[3px] text-[10px] font-semibold leading-[1.2]"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        )}

        {/* Collapse toggle — line icon, no stroke bg */}
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px] bg-tp-slate-50 text-tp-slate-600 transition-colors hover:bg-tp-slate-100"
          >
            {collapsed ? <ArrowDown2 size={12} variant="Linear" /> : <ArrowUp2 size={12} variant="Linear" />}
          </button>
        )}
      </div>

      {/* Body */}
      {!collapsed && (
        <>
          <div className="px-3 py-[10px]">
            {children}
          </div>

          {/* Actions row — single-line horizontal scroll */}
          {actions && (
            <div className="overflow-x-auto px-3 pt-[2px] pb-[10px]">
              <div className="flex gap-1 whitespace-nowrap">
                {actions}
              </div>
            </div>
          )}

          {/* Sidebar link (below actions, with bottom gradient) */}
          {sidebarLink && (
            <div
              className="px-3 py-[10px]"
              style={{
                borderTop: "0.5px solid var(--tp-slate-50, #F8FAFC)",
                background: "linear-gradient(180deg, #FFFFFF 0%, rgba(59,130,246,0.04) 100%)",
              }}
            >
              {sidebarLink}
            </div>
          )}
        </>
      )}
    </div>
  )
}

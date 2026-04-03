"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { CopyIcon } from "./CopyIcon"
import { ActionableTooltip } from "./ActionableTooltip"
import { TPMedicalIcon } from "@/components/tp-ui"
import { Copy, ArrowDown2, ArrowUp2, InfoCircle } from "iconsax-reactjs"

/** Small info icon with hover tooltip showing data sources */
export function SourceInfoIcon({ sources }: { sources: string[] }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative ml-[4px] flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered((v) => !v)}
    >
      <button
        type="button"
        className="flex h-[20px] w-[20px] items-center justify-center rounded-full text-tp-violet-400 transition-colors hover:text-tp-violet-600 hover:bg-tp-violet-50"
        aria-label="Data sources"
      >
        <InfoCircle size={14} variant="Bold" />
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute right-0 top-full z-[100] mt-[4px] min-w-[160px] max-w-[220px] rounded-[8px] border border-tp-slate-100/80 bg-white/95 px-[10px] py-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <p className="mb-[4px] text-[12px] font-semibold tracking-wider text-tp-slate-400">Sources</p>
          <div className="flex flex-col gap-[3px]">
            {sources.map((src, i) => (
              <div key={i} className="flex items-center gap-[5px]">
                <div className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-tp-violet-400" />
                <span className="text-[14px] leading-[1.4] text-tp-slate-600">{src}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
  /** Extra content rendered between badge and collapse chevron (e.g. donut icon) */
  headerExtra?: React.ReactNode
  /** Data source label(s) for provenance tooltip — shown as info icon when no donut chart */
  dataSources?: string[]
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
  headerExtra,
  dataSources,
  children,
}: CardShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [copyHovered, setCopyHovered] = useState(false)

  return (
    <div
      className="w-full overflow-hidden rounded-[14px] bg-white"
      style={{
        border: "1px solid transparent",
        backgroundImage: "linear-gradient(white, white), linear-gradient(180deg, rgba(75,74,213,0.18) 0%, rgba(75,74,213,0.04) 25%, rgba(23,23,37,0.02) 50%, rgba(75,74,213,0.04) 75%, rgba(75,74,213,0.18) 100%)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {/* Header */}
      <div
        className={cn("flex gap-[7px] px-3 py-[11px]", date ? "items-start" : "items-center")}
        style={{
          background: "linear-gradient(180deg, rgba(75,74,213,0.05) 0%, #FFFFFF 100%)",
          borderBottom: "1px solid var(--tp-slate-50, #F8FAFC)",
        }}
      >
        {/* Icon — always TP blue */}
        <div
          className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[8px]"
          style={{ background: "var(--tp-blue-50, rgba(75, 74, 213, 0.08))" }}
        >
          {tpIconName ? (
            <TPMedicalIcon name={tpIconName} variant="bulk" size={15} color="var(--tp-blue-500, #4B4AD5)" />
          ) : (
            <span style={{ color: "var(--tp-blue-500, #4B4AD5)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
          )}
        </div>

        {/* Title + Date */}
        <div className="flex min-w-0 flex-col text-tp-slate-800">
          <span className="group/title relative max-w-[200px] text-[13px] font-semibold leading-[1.4] truncate">
            {title}
            {/* Instant tooltip on truncated title */}
            <span className="pointer-events-none absolute bottom-full left-0 mb-1 hidden whitespace-nowrap rounded-[4px] bg-tp-slate-800 px-2 py-1 text-[10px] font-normal text-white shadow-md group-hover/title:block z-50">
              {title}
            </span>
          </span>
          {date && (
            <span className="mt-[1px] max-w-[200px] text-[11px] font-normal text-tp-slate-400 leading-[1.4] truncate">
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

        {/* Badge — truncated with tooltip if too long */}
        {badge && (
          <span
            className="group/badge relative max-w-[100px] truncate rounded-[4px] px-[6px] py-[3px] text-[12px] font-semibold leading-[1.2]"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
            <span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden whitespace-nowrap rounded-[4px] bg-tp-slate-800 px-2 py-1 text-[10px] font-normal text-white shadow-md group-hover/badge:block z-50">
              {badge.label}
            </span>
          </span>
        )}

        {/* Header Extra (e.g. data completeness donut) — gap-[6px] from badge */}
        {headerExtra && <div className="ml-[4px] flex-shrink-0">{headerExtra}</div>}

        {/* Source indicator removed from header — now rendered in ChatBubble feedback area */}

        {/* Collapse toggle — line icon, no stroke bg */}
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px] bg-tp-slate-100 text-tp-slate-600 transition-colors hover:bg-tp-slate-200"
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
              className="px-3 py-[8px]"
              style={{
                borderTop: "0.5px solid var(--tp-slate-50, #F8FAFC)",
                background: "linear-gradient(180deg, #FFFFFF 0%, rgba(75,74,213,0.04) 100%)",
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

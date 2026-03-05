"use client"

import * as React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

/**
 * TPClinicalTabs — Tab system matching Figma reference exactly.
 *
 * Figma reference specs:
 *   Active tab:     3px bottom bar, bg-[#4b4ad5], rounded-[10px]
 *   Active text:    text-[#4b4ad5], Inter Semi Bold 12px
 *   Inactive text:  text-[#454551] opacity-60
 *   Icon container: bg-[#eef] when active, 20px icon
 *   Tab labels:     Inter Semi Bold 12px, tracking-[0.1px]
 *   Bottom shadow:  inset 0px -1px 0px 0px rgba(68,68,79,0.1)
 *   Count badge:    inline after label text
 */

interface ClinicalTab {
  id: string
  label: string
  count?: number
  /** Icon element for active (filled) state */
  iconActive: React.ReactNode
  /** Icon element for inactive (outline) state */
  iconInactive: React.ReactNode
}

interface TPClinicalTabsProps {
  tabs: ClinicalTab[]
  activeTab: string
  onTabChange: (id: string) => void
  variant?: "underline" | "pill"
  size?: "sm" | "md"
  className?: string
}

export function TPClinicalTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
  size = "md",
  className,
}: TPClinicalTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})

  const updateIndicator = useCallback(() => {
    if (variant !== "underline" || !containerRef.current) return
    const activeEl = containerRef.current.querySelector<HTMLElement>(
      `[data-tab-id="${activeTab}"]`,
    )
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      })
    }
  }, [activeTab, variant])

  useEffect(() => {
    updateIndicator()
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [updateIndicator])

  if (variant === "pill") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-[6px] rounded-[10px] px-3 font-semibold transition-all duration-150",
                size === "sm" ? "h-9 text-xs" : "h-[42px] text-[12px]",
                isActive
                  ? "bg-[#eef] text-[#4b4ad5]"
                  : "text-[#454551]/60 hover:bg-[#f1f1f5] hover:text-[#454551]",
              )}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.1px",
              }}
            >
              <span
                className={cn(
                  "shrink-0 flex items-center justify-center rounded-[8px]",
                  isActive ? "bg-[#eef]" : "",
                )}
                style={{ width: 20, height: 20 }}
              >
                {isActive ? tab.iconActive : tab.iconInactive}
              </span>
              <span>{tab.label}</span>
              {tab.count != null && (
                <span
                  className={cn(
                    "ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                    isActive
                      ? "bg-[#4b4ad5]/10 text-[#4b4ad5]"
                      : "bg-[#e2e2ea] text-[#454551]/60",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Underline variant — matching Figma reference
  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="flex items-center gap-0 overflow-x-auto scrollbar-none"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative inline-flex items-center gap-[6px] whitespace-nowrap px-4 transition-colors duration-150",
                size === "sm" ? "h-9" : "h-[42px]",
                isActive
                  ? "text-[#4b4ad5]"
                  : "text-[#454551]/60 hover:text-[#454551]",
              )}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.1px",
              }}
            >
              {/* Icon with optional bg container */}
              <span
                className={cn(
                  "shrink-0 flex items-center justify-center rounded-[8px]",
                  isActive ? "bg-[#eef]" : "",
                )}
                style={{ width: 24, height: 24, padding: 2 }}
              >
                {isActive ? tab.iconActive : tab.iconInactive}
              </span>
              <span>{tab.label}</span>
              {tab.count != null && (
                <span
                  className={cn(
                    "ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                    isActive
                      ? "bg-[#4b4ad5]/10 text-[#4b4ad5]"
                      : "bg-[#e2e2ea] text-[#454551]/60",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom shadow line — matches Figma inset shadow */}
      <div
        className="w-full"
        style={{
          height: 1,
          boxShadow: "inset 0px -1px 0px 0px rgba(68,68,79,0.1)",
        }}
      />

      {/* Animated indicator — 3px height, primary color, rounded */}
      <div
        className="absolute bottom-0 bg-[#4b4ad5] transition-all duration-200 ease-out"
        style={{
          ...indicatorStyle,
          height: 3,
          borderRadius: 10,
        }}
      />
    </div>
  )
}

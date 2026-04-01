/**
 * SecondaryNavPanel — 80px left sidebar
 * Mixed icon source:
 * - TP medical icon library for clinical nav items
 * - iconsax for requested utility nav items
 */
import React, { useEffect, useRef, useState } from "react"
import { ArrowDown2, DocumentText, Glass, Note1, Ruler } from "iconsax-reactjs"

import { TPMedicalIcon } from "@/components/tp-ui"

import type { NavItemId } from "./types"
import { rxSidebarTokens } from "./tokens"

const NAV_BG: React.CSSProperties = {
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 80 1133\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(64.518 65.21 -19.503 89.302 -155.96 413.08)\\'><stop stop-color=\\'rgba(22,21,88,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(35,34,119,1)\\' offset=\\'0.25\\'/><stop stop-color=\\'rgba(49,48,151,1)\\' offset=\\'0.5\\'/><stop stop-color=\\'rgba(75,74,213,1)\\' offset=\\'1\\'/></radialGradient></defs></svg>'), linear-gradient(90deg,rgb(255,255,255) 0%,rgb(255,255,255) 100%)",
}

function IconPill({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`content-stretch flex flex-col items-center justify-center p-[6px] relative rounded-[10px] shrink-0 ${
        active ? rxSidebarTokens.navIconActiveBgClass : rxSidebarTokens.navIconBgClass
      }`}
    >
      <div className="flex h-[20px] w-[20px] items-center justify-center overflow-hidden">{children}</div>
    </div>
  )
}

function MedicalNavIcon({ active, name }: { active: boolean; name: string }) {
  return (
    <IconPill active={active}>
      <TPMedicalIcon
        name={name}
        variant={active ? "bulk" : "line"}
        size={20}
        color={active ? "var(--tp-blue-500)" : "#FFFFFF"}
        className="block h-[20px] w-[20px]"
      />
    </IconPill>
  )
}

function IconsaxNavIcon({
  active,
  Icon,
}: {
  active: boolean
  Icon: React.ComponentType<any>
}) {
  return (
    <IconPill active={active}>
      <Icon
        size={20}
        variant={active ? "Bulk" : "Linear"}
        color={active ? "var(--tp-blue-500)" : "#FFFFFF"}
        strokeWidth={1.5}
      />
    </IconPill>
  )
}

function SelectionArrow() {
  return (
    <div className="pointer-events-none absolute right-[-2px] top-1/2 z-20 h-0 w-0 -translate-y-1/2 border-y-[8px] border-y-transparent border-r-[8px] border-r-white" />
  )
}

function NavDivider() {
  return (
    <div className="h-0 relative shrink-0 w-full">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 1">
          <line stroke="url(#divGrad)" strokeOpacity="0.3" x2="80" y1="0.5" y2="0.5" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="divGrad" x1="9.27" x2="70.92" y1="1" y2="1">
              <stop stopColor="white" stopOpacity="0" />
              <stop offset="0.5" stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

type NavIconConfig =
  | { kind: "medical"; name: string }
  | { kind: "iconsax"; Icon: React.ComponentType<any> }

const NAV_ITEMS: Array<{
  id: NavItemId
  label: string
  icon: NavIconConfig
}> = [
  { id: "pastVisits", label: "Past Visits", icon: { kind: "iconsax", Icon: Note1 } },
  { id: "vitals", label: "Vitals", icon: { kind: "medical", name: "Heart Rate" } },
  { id: "history", label: "History", icon: { kind: "medical", name: "clipboard-activity" } },
  { id: "ophthal", label: "Ophthal", icon: { kind: "iconsax", Icon: Glass } },
  { id: "gynec", label: "Gynec", icon: { kind: "medical", name: "Gynec" } },
  { id: "obstetric", label: "Obstetric", icon: { kind: "medical", name: "Obstetric" } },
  { id: "vaccine", label: "Vaccine", icon: { kind: "medical", name: "injection" } },
  { id: "growth", label: "Growth", icon: { kind: "iconsax", Icon: Ruler } },
  { id: "medicalRecords", label: "Records", icon: { kind: "medical", name: "health-file-03" } },
  { id: "labResults", label: "Lab Results", icon: { kind: "medical", name: "Lab" } },
  { id: "personalNotes", label: "Personal Notes", icon: { kind: "iconsax", Icon: DocumentText } },
]

function DrAgentGlyph({ active }: { active: boolean }) {
  return (
    <div
      className="relative h-[32px] w-[32px] overflow-hidden rounded-[10px]"
      style={{
        background: active
          ? "radial-gradient(120% 120% at 20% 20%, #6F4E99 0%, #3A2258 55%, #24123D 100%)"
          : "radial-gradient(120% 120% at 20% 20%, #F4ECFF 0%, #E8DBFF 58%, #DCC7FF 100%)",
      }}
    >
      <svg
        className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.0841 11.612C18.4509 11.6649 18.4509 12.3351 18.0841 12.388C14.1035 12.9624 12.9624 14.1035 12.388 18.0841C12.3351 18.4509 11.6649 18.4509 11.612 18.0841C11.0376 14.1035 9.89647 12.9624 5.91594 12.388C5.5491 12.3351 5.5491 11.6649 5.91594 11.612C9.89647 11.0376 11.0376 9.89647 11.612 5.91594C11.6649 5.5491 12.3351 5.5491 12.388 5.91594C12.9624 9.89647 14.1035 11.0376 18.0841 11.612Z"
          fill={active ? "#FFFFFF" : "url(#drAgentAiGrad)"}
        />
        {!active ? (
          <defs>
            <linearGradient id="drAgentAiGrad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8A4DBB" />
              <stop offset="1" stopColor="#4B4AD5" />
            </linearGradient>
          </defs>
        ) : null}
      </svg>
    </div>
  )
}

function NavItem({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: NavItemId
  label: string
  icon: NavIconConfig
  active: boolean
  onClick: (id: NavItemId) => void
}) {
  const [hovered, setHovered] = useState(false)

  const rowBg = active
    ? rxSidebarTokens.navItemSelectedBg
    : hovered
      ? rxSidebarTokens.navItemHoverBg
      : "transparent"

  return (
    <div
      className="relative shrink-0 cursor-pointer"
      style={{ width: rxSidebarTokens.railWidth, backgroundColor: rowBg }}
      onClick={() => onClick(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="content-stretch flex items-center relative w-full">
        <div
          className="content-stretch flex flex-col items-center relative shrink-0"
          style={{
            gap: rxSidebarTokens.itemGap,
            paddingInline: rxSidebarTokens.itemPaddingX,
            paddingBlock: rxSidebarTokens.itemPaddingY,
            width: rxSidebarTokens.railWidth,
          }}
        >
          {icon.kind === "medical" ? (
            <MedicalNavIcon active={active} name={icon.name} />
          ) : (
            <IconsaxNavIcon active={active} Icon={icon.Icon} />
          )}
          <p
            className={`${rxSidebarTokens.navLabelClass} min-w-full not-italic overflow-hidden relative shrink-0 text-center text-ellipsis text-white w-[min-content] whitespace-pre-wrap`}
          >
            {label}
          </p>
        </div>
        {active ? <div className="absolute bg-white bottom-0 left-0 rounded-br-[12px] rounded-tr-[12px] top-0 w-[3px]" /> : null}
      </div>
      {active ? <SelectionArrow /> : null}
    </div>
  )
}

function DrAgentItem({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  const rowBg = active
    ? rxSidebarTokens.navItemSelectedBg
    : hovered
      ? rxSidebarTokens.navItemHoverBg
      : "transparent"

  return (
    <div
      className="relative shrink-0 cursor-pointer"
      style={{ width: rxSidebarTokens.railWidth, backgroundColor: rowBg }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="content-stretch flex flex-col items-center relative shrink-0"
        style={{
          gap: rxSidebarTokens.itemGap,
          paddingInline: rxSidebarTokens.itemPaddingX,
          paddingBlock: rxSidebarTokens.itemPaddingY,
          width: rxSidebarTokens.railWidth,
        }}
      >
        <DrAgentGlyph active={active} />

        <p
          className={`${rxSidebarTokens.navLabelClass} min-w-full not-italic overflow-hidden relative shrink-0 text-center text-ellipsis w-[min-content] whitespace-pre-wrap`}
          style={{
            background: "linear-gradient(90deg, #f4e6ff, #c0c0ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dr.Agent
        </p>
      </div>
      {active ? <div className="absolute bg-white bottom-0 left-0 rounded-br-[12px] rounded-tr-[12px] top-0 w-[3px]" /> : null}
      {active ? <SelectionArrow /> : null}
    </div>
  )
}

type Props = {
  active: NavItemId | null
  onSelect: (id: NavItemId) => void
}

export function NavPanel({ active, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const updateHint = () => {
      const hasOverflow = node.scrollHeight > node.clientHeight + 2
      const atTop = node.scrollTop <= 2
      setShowScrollHint(hasOverflow && atTop)
    }

    updateHint()
    node.addEventListener("scroll", updateHint, { passive: true })
    window.addEventListener("resize", updateHint)

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateHint)
      observer.observe(node)
    }

    return () => {
      node.removeEventListener("scroll", updateHint)
      window.removeEventListener("resize", updateHint)
      observer?.disconnect()
    }
  }, [])

  return (
    <div className="relative h-full shrink-0" style={{ width: rxSidebarTokens.railWidth }}>
      <div
        ref={scrollRef}
        className="content-stretch flex flex-col gap-[4px] h-full items-center overflow-x-visible overflow-y-auto relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ ...NAV_BG, width: rxSidebarTokens.railWidth }}
      >
        {/* Dr.Agent removed from sidebar nav — lives only in its own panel */}

        {NAV_ITEMS.map(({ id, label, icon }) => (
          <NavItem
            key={id}
            id={id}
            label={label}
            icon={icon}
            active={active === id}
            onClick={onSelect}
          />
        ))}
      </div>

      {showScrollHint ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex h-16 items-end justify-center bg-gradient-to-t from-[#2a2996]/90 via-[#2a2996]/45 to-transparent pb-2">
          <div className="inline-flex h-7 w-7 animate-bounce items-center justify-center rounded-full bg-white/15">
            <ArrowDown2 color="#FFFFFF" size={16} strokeWidth={1.5} variant="Linear" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

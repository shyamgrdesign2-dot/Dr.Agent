"use client"

import { useState } from "react"
import {
  Activity,
  BookOpen,
  FlaskConical,
  Eye,
  FolderOpen,
  HeartPulse,
  Heart,
  Users,
  Receipt,
  Ruler,
  type LucideIcon,
} from "lucide-react"

export interface NavBadge {
  text: string
  gradient: string
}

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: NavBadge
}

const SECONDARY_NAV_TOKENS = {
  panelWidth: 80,
  panelHeight: 740,
  itemPaddingX: 6,
  itemPaddingY: 12,
  iconLabelGap: 6,
  iconContainerSize: 32,
  iconContainerRadius: 10,
  iconSize: 20,
  highlightBarWidth: 3,
  highlightBarRadius: 12,
  arrowWidth: 8,
  arrowHeight: 16,
  labelWidth: 68,
  labelSize: 12,
  labelLineHeight: 18,
  labelTracking: 0.1,
  badgeSize: 10,
  badgePaddingLeft: 4,
  badgePaddingRight: 2,
  badgePaddingY: 4,
  badgeRadius: 30,
  bottomFadeHeight: 120,
} as const

const navItems: NavItem[] = [
  { id: "past-visits", label: "Past Visits", icon: Receipt },
  {
    id: "vitals",
    label: "Vitals",
    icon: Activity,
    badge: {
      text: "New",
      gradient: "linear-gradient(257.32deg, rgb(22, 163, 74) 0%, rgb(68, 207, 119) 47.222%, rgb(22, 163, 74) 94.444%)",
    },
  },
  {
    id: "history",
    label: "History",
    icon: BookOpen,
    badge: {
      text: "Trial",
      gradient: "linear-gradient(257.32deg, rgb(241, 82, 35) 0%, rgb(255, 152, 122) 47.222%, rgb(241, 82, 35) 94.444%)",
    },
  },
  { id: "ophthal", label: "Ophthal", icon: Eye },
  { id: "gynec", label: "Gynec", icon: Heart },
  { id: "obstetric", label: "Obstetric", icon: Users },
  { id: "vaccine", label: "Vaccine", icon: HeartPulse },
  { id: "growth", label: "Growth", icon: Ruler },
  { id: "records", label: "Records", icon: FolderOpen },
  { id: "lab-results", label: "Lab Results", icon: FlaskConical },
]

type SidebarVariant = "rx" | "primary"

/**
 * Standalone side navigation component.
 * Figma-aligned constraints:
 * - width: 80px
 * - height: 740px
 * - item padding: 12px 6px
 * - item internal gap: 6px
 * - label width: 68px
 * - bottom fade: 120px
 */
export function SecondaryNavPanel({
  items,
  activeId,
  onSelect,
  variant = "rx",
}: {
  items: NavItem[]
  activeId: string
  onSelect: (id: string) => void
  variant?: SidebarVariant
}) {
  const isRx = variant === "rx"
  const panelBackground = isRx
    ? `radial-gradient(ellipse at -180% 40%, var(--tp-blue-900) 0%, var(--tp-blue-800) 25%, var(--tp-blue-700) 50%, var(--tp-blue-500) 100%)`
    : "var(--tp-slate-0)"

  const bottomFade = isRx
    ? "linear-gradient(180deg, rgba(22, 21, 88, 0.00) 0%, #161558 100%)"
    : "linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 80.62%)"

  return (
    <nav
      className="relative flex flex-col overflow-x-clip"
      style={{
        width: SECONDARY_NAV_TOKENS.panelWidth,
        height: SECONDARY_NAV_TOKENS.panelHeight,
        alignItems: "flex-start",
        borderRadius: 0,
        background: panelBackground,
      }}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {items.map((item) => {
        const Icon = item.icon
        const isActive = activeId === item.id
        const itemTextColor = isRx ? "var(--tp-slate-0)" : "var(--tp-slate-700)"
        const iconDefaultBg = isRx ? "rgba(255,255,255,0.25)" : "rgba(75,74,213,0.10)"
        const iconHoverBg = isRx ? "rgba(255,255,255,0.28)" : "rgba(75,74,213,0.15)"
        const iconDefaultColor = isRx ? "var(--tp-slate-0)" : "var(--tp-blue-500)"
        const iconActiveBg = isRx ? "var(--tp-slate-0)" : "var(--tp-blue-500)"
        const iconActiveColor = isRx ? "var(--tp-blue-500)" : "var(--tp-slate-0)"
        const itemHoverBg = isRx ? "rgba(255,255,255,0.12)" : "rgba(75,74,213,0.08)"

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="group relative flex shrink-0 items-center transition-colors"
            style={{
              width: SECONDARY_NAV_TOKENS.panelWidth,
              backgroundColor: isActive ? (isRx ? "rgba(255,255,255,0.2)" : "rgba(75,74,213,0.12)") : "transparent",
            }}
          >
            <div
              className="flex flex-1 flex-col items-center"
              style={{
                gap: SECONDARY_NAV_TOKENS.iconLabelGap,
                paddingInline: SECONDARY_NAV_TOKENS.itemPaddingX,
                paddingBlock: SECONDARY_NAV_TOKENS.itemPaddingY,
              }}
            >
              <span
                className="relative flex shrink-0 items-center justify-center transition-colors group-hover:scale-[1.02]"
                style={{
                  width: SECONDARY_NAV_TOKENS.iconContainerSize,
                  height: SECONDARY_NAV_TOKENS.iconContainerSize,
                  borderRadius: SECONDARY_NAV_TOKENS.iconContainerRadius,
                  backgroundColor: isActive
                    ? iconActiveBg
                    : iconDefaultBg,
                }}
              >
                {!isActive && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: iconHoverBg }}
                  />
                )}
                <Icon
                  size={SECONDARY_NAV_TOKENS.iconSize}
                  color={isActive ? iconActiveColor : iconDefaultColor}
                />
              </span>

              <span
                className="overflow-hidden text-center font-medium leading-[18px]"
                style={{
                  width: SECONDARY_NAV_TOKENS.labelWidth,
                  minWidth: SECONDARY_NAV_TOKENS.labelWidth,
                  maxWidth: SECONDARY_NAV_TOKENS.labelWidth,
                  fontFamily: "var(--font-sans)",
                  fontSize: SECONDARY_NAV_TOKENS.labelSize,
                  lineHeight: `${SECONDARY_NAV_TOKENS.labelLineHeight}px`,
                  letterSpacing: `${SECONDARY_NAV_TOKENS.labelTracking}px`,
                  color: itemTextColor,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                }}
              >
                {item.label}
              </span>
            </div>

            {isActive && (
              <span
                className="absolute left-0 top-0 bottom-0"
                style={{
                  width: SECONDARY_NAV_TOKENS.highlightBarWidth,
                  backgroundColor: isRx ? "var(--tp-slate-0)" : "var(--tp-blue-500)",
                  borderTopRightRadius: SECONDARY_NAV_TOKENS.highlightBarRadius,
                  borderBottomRightRadius: SECONDARY_NAV_TOKENS.highlightBarRadius,
                }}
              />
            )}

            {isActive && isRx && (
              <span
                className="absolute"
                style={{
                  right: 0,
                  top: item.badge ? 40 : "50%",
                  transform: item.badge ? "none" : "translateY(-50%)",
                }}
              >
                <svg
                  width={SECONDARY_NAV_TOKENS.arrowWidth}
                  height={SECONDARY_NAV_TOKENS.arrowHeight}
                  viewBox="0 0 8 16"
                  fill="var(--tp-slate-0)"
                  style={{ display: "block" }}
                >
                  <path d="M8 0L0 8L8 16V0Z" />
                </svg>
              </span>
            )}

            {item.badge && (
              <span
                className="absolute flex items-center justify-center font-medium"
                style={{
                  top: 20.5,
                  right: 0,
                  fontSize: SECONDARY_NAV_TOKENS.badgeSize,
                  lineHeight: "normal",
                  color: "var(--tp-slate-0)", // semantic: text.inverse
                  backgroundImage: item.badge.gradient,
                  borderTopLeftRadius: SECONDARY_NAV_TOKENS.badgeRadius,
                  borderBottomLeftRadius: SECONDARY_NAV_TOKENS.badgeRadius,
                  paddingLeft: SECONDARY_NAV_TOKENS.badgePaddingLeft,
                  paddingRight: SECONDARY_NAV_TOKENS.badgePaddingRight,
                  paddingBlock: SECONDARY_NAV_TOKENS.badgePaddingY,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {item.badge.text}
              </span>
            )}

            {!isActive && (
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: itemHoverBg }}
              />
            )}
          </button>
        )
      })}
      </div>

      {/* Bottom fade — exact Figma spec: position absolute, bottom 0 */}
      <div
        className="pointer-events-none absolute left-0 z-10"
        style={{
          width: SECONDARY_NAV_TOKENS.panelWidth,
          height: SECONDARY_NAV_TOKENS.bottomFadeHeight,
          bottom: 0,
          background: bottomFade,
        }}
      />
    </nav>
  )
}

export function SecondaryNavShowcase() {
  const [activeId, setActiveId] = useState("past-visits")
  const [activeIdAlt, setActiveIdAlt] = useState("vitals")

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Secondary Nav Panel
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Primary (white) for homepage/top-level; Rx (dark blue) for in-Rx flows. Both 80px rail, Lucide icons.
        Primary: unselected <code className="text-tp-blue-500">TP.icon.clickable.light.bg</code> (10% blue) + blue 500 icon; selected blue 500 bg + white icon; no arrow.
        Rx: unselected <code className="text-tp-blue-500">TP.icon.clickable.dark.bg</code> (25% white) + white icon; selected white bg + blue 500 icon; 3px left bar + right arrow.
      </p>
      <div className="flex flex-wrap gap-8 items-start">
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">Primary (white surface) — no arrow</span>
          <SecondaryNavPanel
            items={navItems}
            activeId={activeId}
            onSelect={setActiveId}
            variant="primary"
          />
        </div>
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">Rx (dark blue surface) — with arrow</span>
          <SecondaryNavPanel
            items={navItems}
            activeId={activeIdAlt}
            onSelect={setActiveIdAlt}
            variant="rx"
          />
        </div>

        {/* Token mapping & specs */}
        <div className="flex-1 min-w-[240px]">
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Design Token Mapping</span>
          <div className="flex flex-col gap-3 text-xs text-tp-slate-600">
            {/* Background */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 shrink-0 rounded mt-0.5" style={{ background: "linear-gradient(135deg, var(--tp-blue-900), var(--tp-blue-500))" }} />
              <div>
                <strong>Panel background</strong>
                <div className="text-tp-slate-400 mt-0.5">
                  Radial gradient: <code>TP Blue/900</code> → <code>TP Blue/800</code> → <code>TP Blue/700</code> → <code>TP Blue/500</code>
                </div>
              </div>
            </div>

            {/* Active state */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 shrink-0 rounded bg-white border border-tp-slate-200 mt-0.5" />
              <div>
                <strong>Active item</strong>
                <div className="text-tp-slate-400 mt-0.5">
                  Icon container: <code>bg.surface</code> (TP Slate/0) &bull;
                  Icon: <code>icon.active</code> (TP Blue/500) &bull;
                  Left bar: 3px <code>text.inverse</code>, radius/lg right &bull;
                  Right arrow: 8×16 <code>text.inverse</code> triangle &bull;
                  Container bg: <code>color/white/-20%</code>
                </div>
              </div>
            </div>

            {/* Inactive state */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 shrink-0 rounded mt-0.5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
              <div>
                <strong>Inactive item</strong>
                <div className="text-tp-slate-400 mt-0.5">
                  Icon container: <code>color/white/-20%</code> (rgba(255,255,255,0.2)) &bull;
                  Icon: <code>icon.inverse</code> (TP Slate/0)
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 shrink-0 rounded bg-tp-blue-500 mt-0.5" />
              <div>
                <strong>Label typography</strong>
                <div className="text-tp-slate-400 mt-0.5">
                  Inter Medium 12/18 &bull; tracking: 0.1px &bull; color: <code>text.inverse</code> (TP Slate/0) &bull; centered, ellipsis on overflow
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 shrink-0 rounded mt-0.5" style={{ background: "linear-gradient(257deg, #16A34A, #44CF77)" }} />
              <div>
                <strong>Badges</strong>
                <div className="text-tp-slate-400 mt-0.5">
                  "New": green gradient pill (Success family) &bull;
                  "Trial": orange gradient pill &bull;
                  Text: <code>text.inverse</code>, Inter Medium 10px &bull;
                  Shape: left-rounded 30px, flush right edge
                </div>
              </div>
            </div>

            {/* Bottom fade */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 shrink-0 rounded mt-0.5" style={{ background: "linear-gradient(to bottom, transparent, var(--tp-blue-900))" }} />
              <div>
                <strong>Bottom fade</strong>
                <div className="text-tp-slate-400 mt-0.5">
                  120px gradient overlay: transparent → <code>TP Blue/900</code>
                </div>
              </div>
            </div>

            {/* Measurements card */}
            <div className="mt-2 p-3 rounded-lg bg-tp-slate-50 border border-tp-slate-100">
              <p className="text-[11px] text-tp-slate-500 font-semibold mb-1.5">Spacing & Dimensions</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-tp-slate-500">
                <span><strong>Panel width:</strong> 80px</span>
                <span><strong>Panel size:</strong> 80×740px</span>
                <span><strong>Item padding:</strong> 12×6px</span>
                <span><strong>Icon-label gap:</strong> 6px (spacing/1.5)</span>
                <span><strong>Label width:</strong> 68px fixed</span>
                <span><strong>Icon container:</strong> 32px, r:10px</span>
                <span><strong>Icon size:</strong> 20×20px</span>
                <span><strong>Highlight bar:</strong> 3px × full h</span>
                <span><strong>Arrow:</strong> 8×16px triangle</span>
                <span><strong>Badge padding:</strong> 4/2×4px</span>
                <span><strong>Bottom fade:</strong> 120px tall</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

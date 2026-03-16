"use client"

import * as React from "react"
import {
  Bell,
  Settings,
  Search,
  Menu,
  ArrowLeft,
  Eye,
  FileText,
  LogIn,
  MoreVertical,
  ChevronDown,
  User,
  Building2,
  Save,
  LayoutTemplate,
  StickyNote,
} from "lucide-react"
import { TutorialPlayIcon } from "@/components/tp-ui/TutorialPlayIcon"
import { cn } from "@/lib/utils"

/**
 * TPTopNavBar — Clinical application header bar.
 *
 * Matches Figma HomeHeader / RxpadHeader exactly:
 *   Height        62px
 *   Background    white
 *   Border        0.5px #F1F1F5 (bottom)
 *   Toolbar icon  42px, bg-[#f1f1f5], rounded-[10.5px]
 *   Badge dot     10.5px, #E11D48
 *   Avatar        42px, rounded-full
 *   Divider       gradient, 1.05px wide, 42px tall
 */

interface NavAction {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  badge?: number
  /** Text label shown next to icon (e.g., "Preview") */
  text?: string
  /** Button variant for styled actions */
  variant?: "default" | "outline" | "primary"
}

interface TPTopNavBarProps {
  variant?: "default" | "clinical"
  /** Left section content */
  leftContent?: React.ReactNode
  /** App title */
  title?: string
  subtitle?: string
  /** Action icons in the right area */
  actions?: NavAction[]
  /** Profile display */
  profile?: {
    name: string
    avatarUrl?: string
    initials?: string
  }
  /** Patient context — shown in clinical variant */
  patient?: {
    name: string
    age: number
    gender: string
    bloodGroup?: string
    uhid?: string
  }
  /** Clinic name for dropdown */
  clinicName?: string
  /** Back button handler (clinical variant) */
  onBack?: () => void
  /** Optional search area */
  showSearch?: boolean
  onSearchClick?: () => void
  /** Mobile hamburger */
  onMenuClick?: () => void
  className?: string
}

/* ── Divider matching Figma exactly ── */
function NavDivider() {
  return (
    <div
      className="shrink-0 opacity-80"
      style={{
        width: "1.05px",
        height: 42,
        background:
          "linear-gradient(to bottom, rgba(208,213,221,0.2) 0%, #d0d5dd 50%, rgba(208,213,221,0.2) 100%)",
      }}
    />
  )
}

/* ── Icon button (42px container) ── */
function ToolbarIconButton({
  children,
  label,
  onClick,
  badge,
  className: extraClass,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  badge?: number
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-[#f1f1f5] rounded-[10.5px]",
        extraClass,
      )}
      style={{ width: 42, height: 42, padding: "8.4px" }}
      aria-label={label}
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          className="absolute flex items-center justify-center"
          style={{
            width: 10.5,
            height: 10.5,
            top: -1.14,
            right: -1.14,
            borderRadius: "50%",
            backgroundColor: "#E11D48",
            border: "1.05px solid white",
          }}
        />
      )}
    </button>
  )
}

export function TPTopNavBar({
  variant = "default",
  leftContent,
  title,
  subtitle,
  actions = [],
  profile,
  patient,
  clinicName = "Rajeshwar eye clinic",
  onBack,
  showSearch = false,
  onSearchClick,
  onMenuClick,
  className,
}: TPTopNavBarProps) {
  // ── Clinical / RxPad variant ──
  if (variant === "clinical") {
    return (
      <header
        className={cn("relative flex shrink-0 items-center bg-white", className)}
        style={{ height: 62 }}
        data-name="Rxpad_Header"
      >
        <div className="flex items-center gap-[16px] pr-[16px] py-[10px] size-full">
          {/* Back button — 80px panel */}
          <button
            type="button"
            onClick={onBack}
            className="relative flex shrink-0 items-center justify-center bg-white"
            style={{
              width: 80,
              height: 60,
              padding: "20px 15px",
              borderRight: "0.5px solid #f1f1f5",
              borderBottom: "0.5px solid #f1f1f5",
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={24} color="#454551" />
          </button>

          {/* Patient info */}
          <div className="flex flex-1 items-center min-h-px min-w-[280px]">
            <div className="flex items-center gap-[6px] shrink-0">
              {/* Avatar */}
              <div
                className="relative flex shrink-0 items-center justify-center bg-[#f1f1f5] rounded-full"
                style={{ width: 40, height: 40 }}
              >
                <User size={22} color="#545460" />
              </div>

              {/* Name + age */}
              <div className="flex flex-col items-start shrink-0" style={{ width: 108 }}>
                <div className="flex items-center gap-[2px] w-full">
                  <p
                    className="shrink-0 text-[#454551]"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      maxWidth: 150,
                      lineHeight: "normal",
                    }}
                  >
                    {patient?.name || "Patient Name"}
                  </p>
                  <ChevronDown size={16} color="#454551" className="shrink-0" />
                </div>
                <div
                  className="flex items-start w-full"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: "18px",
                    letterSpacing: "0.1px",
                  }}
                >
                  <span className="shrink-0 text-[#454551]">
                    {patient?.gender || "M"}
                  </span>
                  <span className="shrink-0 text-[#e2e2ea] text-center w-[8px]">|</span>
                  <span className="shrink-0 text-[#454551]">
                    {patient?.age ? `${patient.age}y` : "25y"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar actions */}
          <div className="flex items-center gap-[14px] shrink-0">
            {/* Tutorial icon */}
            <div className="shrink-0 flex items-center justify-center" style={{ width: 42, height: 42 }}>
              <TutorialPlayIcon size={28} />
            </div>

            <NavDivider />

            {/* Template */}
            <ToolbarIconButton label="Template">
              <LayoutTemplate size={20} color="#454551" />
            </ToolbarIconButton>

            {/* Save */}
            <ToolbarIconButton label="Save">
              <Save size={20} color="#454551" />
            </ToolbarIconButton>

            {/* Customisation */}
            <ToolbarIconButton label="Customisation">
              <Settings size={20} color="#454551" />
            </ToolbarIconButton>

            {/* Custom Canvas */}
            <ToolbarIconButton label="Custom Canvas" badge={1}>
              <StickyNote size={20} color="#454551" />
            </ToolbarIconButton>

            <NavDivider />

            {/* Preview */}
            <button
              type="button"
              className="flex shrink-0 items-center justify-center gap-[6.3px] bg-[#f1f1f5] rounded-[10.5px]"
              style={{ height: 42, padding: "8px 16px" }}
            >
              <Eye size={20} color="#454551" />
              <span
                className="shrink-0 text-center text-[#454551]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "14.7px",
                  lineHeight: "normal",
                }}
              >
                Preview
              </span>
            </button>

            {/* Draft */}
            <button
              type="button"
              className="relative flex shrink-0 items-center justify-center gap-[6.3px] rounded-[10.5px]"
              style={{
                height: 42,
                padding: "8px 16px",
                border: "1.05px solid #4b4ad5",
                borderRadius: "11.025px",
              }}
            >
              <FileText size={20} color="#4B4AD5" />
              <span
                className="shrink-0 text-center text-[#4b4ad5]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "14.7px",
                  lineHeight: "normal",
                }}
              >
                Draft
              </span>
            </button>

            {/* End Visit */}
            <button
              type="button"
              className="flex shrink-0 items-center justify-center gap-[6.3px] bg-[#4b4ad5] rounded-[10.5px]"
              style={{ height: 42, padding: "8px 16px" }}
            >
              <LogIn size={20} color="white" />
              <span
                className="shrink-0 text-center text-white"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "14.7px",
                  lineHeight: "normal",
                }}
              >
                End
              </span>
            </button>

            {/* More options */}
            <div className="flex shrink-0 items-center justify-center" style={{ width: 25.2, height: 25.2 }}>
              <MoreVertical size={20} color="#454551" />
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "0.5px", backgroundColor: "#f1f1f5" }}
        />
      </header>
    )
  }

  // ── Default / Home variant ──
  return (
    <header
      className={cn("relative flex shrink-0 items-center bg-white", className)}
      style={{ height: 62 }}
      data-name="Home_Header"
    >
      <div className="flex items-center gap-[16px] px-[18px] py-[10px] size-full">
        {/* ── Left: Brand Logo ── */}
        <div className="flex flex-1 items-center min-h-px min-w-[280px]">
          {leftContent ? (
            leftContent
          ) : (
            <div className="relative shrink-0" style={{ width: 140, height: 40 }}>
              {/* Brand text fallback */}
              <div className="absolute inset-0 flex items-center">
                <span
                  className="text-[#454551]"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {title || "TatvaPractice"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Toolbar ── */}
        <div className="flex items-center gap-[14px] shrink-0">
          {/* Tutorial */}
          <div className="shrink-0 flex items-center justify-center" style={{ width: 42, height: 42 }}>
            <TutorialPlayIcon size={28} />
          </div>

          <NavDivider />

          {/* Notifications */}
          <ToolbarIconButton label="Notifications" badge={3}>
            <Bell size={20} color="#454551" />
          </ToolbarIconButton>

          {/* Ask Tatva AI button */}
          <div
            className="relative shrink-0 overflow-hidden rounded-[11px] bg-white"
            style={{ width: 42, height: 42 }}
          >
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-400 to-blue-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                <path d="M11 2L2 7v10l9 5 9-5V7l-9-5z" fill="#4b4ad5" opacity="0.8" />
                <path d="M11 12L2 7M11 12l9-5M11 12v10" stroke="#4b4ad5" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          <NavDivider />

          {/* Clinic dropdown */}
          <button
            type="button"
            className="flex shrink-0 items-center justify-center gap-[6.3px] bg-[#f1f1f5] rounded-[10.5px]"
            style={{ height: 42, padding: "8px 16px" }}
          >
            <Building2 size={20} color="#454551" />
            <div className="flex items-center" style={{ width: 138.6 }}>
              <span
                className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[#454551]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: "14.7px",
                  lineHeight: "normal",
                }}
              >
                {clinicName}
              </span>
            </div>
            <ChevronDown size={20} color="#454551" />
          </button>

          {/* Profile avatar */}
          {profile && (
            <div className="relative shrink-0" style={{ width: 42, height: 42 }}>
              {/* Gradient ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(180deg, #FFDE00 0%, #FD5900 100%)",
                }}
              />
              {/* Inner avatar */}
              <div
                className="absolute rounded-full overflow-hidden bg-white"
                style={{
                  top: "7.89%",
                  left: "7.89%",
                  right: "7.89%",
                  bottom: "7.89%",
                  border: "0.93px solid white",
                }}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <span
                      className="text-[#454551]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13 }}
                    >
                      {profile.initials || profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "0.5px", backgroundColor: "#f1f1f5" }}
      />
    </header>
  )
}

/**
 * Default action configurations for common use cases.
 */
export function defaultNavActions(): NavAction[] {
  return [
    {
      icon: <Bell size={20} color="#454551" />,
      label: "Notifications",
      badge: 3,
    },
    {
      icon: <Settings size={20} color="#454551" />,
      label: "Settings",
    },
  ]
}

"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Mail,
  Home,
  ChevronRight,
  CheckCircle2,
  Star,
  ChevronDown,
  Plus,
  Minus,
  Settings,
  FileText,
  Calendar,
  Shield,
  Users,
  BarChart2,
  Image,
  Music,
} from "lucide-react"

// ─── AVATAR ───

function Avatar({
  size = "md",
  src,
  initials,
  icon,
  status,
  square,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  src?: string
  initials?: string
  icon?: boolean
  status?: "online" | "offline" | "busy" | "away"
  square?: boolean
}) {
  const dims = {
    xs: { wh: 24, font: 10, icon: 12, dot: 7 },
    sm: { wh: 32, font: 12, icon: 14, dot: 8 },
    md: { wh: 40, font: 14, icon: 18, dot: 10 },
    lg: { wh: 48, font: 16, icon: 20, dot: 12 },
    xl: { wh: 64, font: 20, icon: 24, dot: 14 },
  }[size]

  const statusColorMap = {
    online: "#10B981",
    offline: "#A2A2A8",
    busy: "#E11D48",
    away: "#F59E0B",
  }

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: `${dims.wh}px`,
          height: `${dims.wh}px`,
          borderRadius: square ? "8px" : "50%",
          backgroundColor: src ? "transparent" : "#EEEEFF",
          border: "2px solid #FFFFFF",
          boxShadow: "0 1px 3px rgba(23,23,37,0.08)",
        }}
      >
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : initials ? (
          <span
            className="font-bold"
            style={{
              fontSize: `${dims.font}px`,
              color: "#4B4AD5",
              fontFamily: "var(--font-sans)",
            }}
          >
            {initials}
          </span>
        ) : (
          <span className="inline-flex flex-shrink-0"><User size={dims.icon} style={{ color: "#4B4AD5" }} /></span>
        )}
      </div>
      {status && (
        <span
          className="absolute border-2 border-white rounded-full"
          style={{
            width: `${dims.dot}px`,
            height: `${dims.dot}px`,
            backgroundColor: statusColorMap[status],
            bottom: square ? "-1px" : "0",
            right: square ? "-1px" : "0",
          }}
        />
      )}
    </div>
  )
}

export function AvatarShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Avatar</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        User identity indicator with image, initials, and icon fallback. Five sizes (XS to XL), status indicators, and avatar groups.
      </p>

      <div className="flex flex-col gap-6">
        {/* Sizes */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Sizes</span>
          <div className="flex items-end gap-4">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Avatar size={s} initials="TP" />
                <span className="text-[10px] font-mono text-tp-slate-400">{s.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Variants</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg" initials="AC" />
              <span className="text-[10px] text-tp-slate-400">Initials</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg" icon />
              <span className="text-[10px] text-tp-slate-400">Icon</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg" initials="TP" square />
              <span className="text-[10px] text-tp-slate-400">Square</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Status Indicators</span>
          <div className="flex items-center gap-4">
            {(["online", "offline", "busy", "away"] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Avatar size="lg" initials="TP" status={s} />
                <span className="text-[10px] text-tp-slate-400 capitalize">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Avatar Group */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Avatar Group (Stacked)</span>
          <div className="flex items-center">
            {["AC", "SM", "JW", "EC", "MB"].map((init, i) => (
              <div key={init} style={{ marginLeft: i > 0 ? "-10px" : 0, zIndex: 5 - i }}>
                <Avatar size="md" initials={init} />
              </div>
            ))}
            <div
              className="flex items-center justify-center"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#F1F1F5",
                border: "2px solid #FFFFFF",
                marginLeft: "-10px",
                zIndex: 0,
              }}
            >
              <span className="text-xs font-bold text-tp-slate-500">+3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BADGE ───

export function BadgeShowcase() {
  const badges = [
    { count: 3, color: "#E11D48" },
    { count: 12, color: "#E11D48" },
    { count: 99, color: "#E11D48" },
    { count: 0, color: "#A2A2A8" },
  ]

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Badge</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Notification count overlays on icons and avatars. Dot variant for unread indicators. Uses TP Error red for emphasis.
      </p>

      <div className="flex flex-col gap-6">
        {/* On icons */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">On Icons</span>
          <div className="flex items-center gap-8">
            {badges.map((b, i) => (
              <div key={i} className="relative inline-flex">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#F1F1F5" }}
                >
                  {i === 0 ? <span className="inline-flex flex-shrink-0"><Bell size={20} style={{ color: "#545460" }} /></span> :
                   i === 1 ? <span className="inline-flex flex-shrink-0"><Mail size={20} style={{ color: "#545460" }} /></span> :
                   i === 2 ? <span className="inline-flex flex-shrink-0"><Users size={20} style={{ color: "#545460" }} /></span> :
                   <span className="inline-flex flex-shrink-0"><Bell size={20} style={{ color: "#545460" }} /></span>}
                </div>
                {b.count > 0 ? (
                  <span
                    className="absolute flex items-center justify-center font-bold"
                    style={{
                      top: "-4px",
                      right: "-4px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 5px",
                      borderRadius: "100px",
                      backgroundColor: b.color,
                      color: "#FFFFFF",
                      fontSize: "10px",
                      border: "2px solid #FFFFFF",
                    }}
                  >
                    {b.count > 99 ? "99+" : b.count}
                  </span>
                ) : (
                  <span
                    className="absolute"
                    style={{
                      top: "0",
                      right: "0",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: b.color,
                      border: "2px solid #FFFFFF",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* On Avatars */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">On Avatars</span>
          <div className="flex items-center gap-6">
            <div className="relative inline-flex">
              <Avatar size="lg" initials="JW" />
              <span
                className="absolute flex items-center justify-center font-bold"
                style={{
                  top: "-2px",
                  right: "-2px",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 5px",
                  borderRadius: "100px",
                  backgroundColor: "#E11D48",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  border: "2px solid #FFFFFF",
                }}
              >
                5
              </span>
            </div>
            <div className="relative inline-flex">
              <Avatar size="lg" initials="SM" />
              <span
                className="absolute"
                style={{
                  top: "0",
                  right: "0",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  border: "2px solid #FFFFFF",
                }}
              />
            </div>
          </div>
        </div>

        {/* Dot badge standalone */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Inline Badge</span>
          <div className="flex items-center gap-6">
            {[
              { label: "Messages", count: 4, color: "#4B4AD5" },
              { label: "Alerts", count: 12, color: "#E11D48" },
              { label: "Updates", count: 0, color: "#10B981" },
            ].map((b) => (
              <span key={b.label} className="inline-flex items-center gap-2 text-sm font-medium text-tp-slate-700">
                {b.label}
                <span
                  className="inline-flex items-center justify-center text-[10px] font-bold"
                  style={{
                    minWidth: "20px",
                    height: "20px",
                    padding: "0 6px",
                    borderRadius: "100px",
                    backgroundColor: b.count > 0 ? b.color : "#F1F1F5",
                    color: b.count > 0 ? "#FFFFFF" : "#717179",
                  }}
                >
                  {b.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DIVIDER ───

export function DividerShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Divider</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Horizontal and vertical separators using TP Slate border tokens. Supports text labels for section breaks.
      </p>

      <div className="flex flex-col gap-6">
        {/* Horizontal */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Horizontal</span>
          <div className="flex flex-col gap-4 max-w-md">
            <div className="h-px" style={{ backgroundColor: "#E2E2EA" }} />
            <div className="h-px" style={{ backgroundColor: "#F1F1F5" }} />
            <div className="h-0.5" style={{ backgroundColor: "#D0D5DD" }} />
          </div>
        </div>

        {/* With label */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">With Label</span>
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: "#E2E2EA" }} />
              <span className="text-xs font-semibold text-tp-slate-400 uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#E2E2EA" }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: "#E2E2EA" }} />
              <span className="text-xs text-tp-slate-400">Section Break</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#E2E2EA" }} />
            </div>
          </div>
        </div>

        {/* Vertical */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Vertical</span>
          <div className="flex items-center gap-4 h-10">
            <span className="text-sm text-tp-slate-700">Item 1</span>
            <div className="h-full w-px" style={{ backgroundColor: "#E2E2EA" }} />
            <span className="text-sm text-tp-slate-700">Item 2</span>
            <div className="h-full w-px" style={{ backgroundColor: "#E2E2EA" }} />
            <span className="text-sm text-tp-slate-700">Item 3</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SLIDER ───

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  disabled,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  disabled?: boolean
  label?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between">
          <span style={{ fontSize: "12px", fontWeight: 400, color: "#717179" }}>{label}</span>
          <span className="text-xs font-mono font-semibold text-tp-slate-700">{value}</span>
        </div>
      )}
      <div
        className="relative h-2 rounded-full cursor-pointer"
        style={{
          backgroundColor: disabled ? "#F1F1F5" : "#E2E2EA",
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={(e) => {
          if (disabled) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          onChange(Math.round(min + x * (max - min)))
        }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: disabled ? "#A2A2A8" : "#4B4AD5" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2"
          style={{
            left: `calc(${pct}% - 10px)`,
            borderColor: disabled ? "#A2A2A8" : "#4B4AD5",
            boxShadow: "0 2px 4px rgba(23,23,37,0.12)",
          }}
        />
      </div>
    </div>
  )
}

export function SliderShowcase() {
  const [v1, setV1] = useState(40)
  const [v2, setV2] = useState(70)
  const [v3, setV3] = useState(25)

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Slider</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Continuous range selector. TP Blue track fill with drag handle. Label shows current value. 8px track height, 20px handle.
      </p>

      <div className="flex flex-col gap-6 max-w-md">
        <Slider value={v1} onChange={setV1} label="Volume" />
        <Slider value={v2} onChange={setV2} label="Brightness" />
        <Slider value={v3} onChange={setV3} label="Disabled" disabled />
      </div>
    </div>
  )
}

// ─── RATING ───

export function RatingShowcase() {
  const [rating, setRating] = useState(3)
  const [hover, setHover] = useState(0)

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Rating</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Star-based rating input. Hover preview, click to select. TP Amber fill. Three sizes.
      </p>

      <div className="flex flex-col gap-6">
        {/* Interactive */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Interactive (Hover + Click)</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  style={{ color: (hover || rating) >= i ? "#F59E0B" : "#D0D5DD" }}
                />
              </button>
            ))}
            <span className="text-sm font-semibold text-tp-slate-700 ml-2">{rating}.0</span>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Sizes</span>
          <div className="flex flex-col gap-3">
            {[
              { size: 16, label: "Small" },
              { size: 24, label: "Medium" },
              { size: 32, label: "Large" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={s.size}
                    style={{ color: i <= 4 ? "#F59E0B" : "#D0D5DD" }}
                  />
                ))}
                <span className="text-xs text-tp-slate-400 ml-2">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Read only */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Read-Only Variants</span>
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((r) => (
              <div key={r} className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={20}
                    style={{ color: i <= r ? "#F59E0B" : "#D0D5DD" }}
                  />
                ))}
                <span className="text-xs font-mono text-tp-slate-500 ml-2">{r}.0</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PROGRESS (LINEAR + CIRCULAR) ───

function LinearProgress({ value, color = "#4B4AD5", size = "md", label }: {
  value: number
  color?: string
  size?: "sm" | "md" | "lg"
  label?: string
}) {
  const h = size === "sm" ? 4 : size === "lg" ? 12 : 8
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between">
          <span style={{ fontSize: "12px", fontWeight: 400, color: "#717179" }}>{label}</span>
          <span className="text-xs font-mono font-semibold text-tp-slate-700">{value}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: `${h}px`, backgroundColor: "#F1F1F5" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function CircularProgress({ value, color = "#4B4AD5", size = 64, strokeWidth = 5 }: {
  value: number
  color?: string
  size?: number
  strokeWidth?: number
}) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F1F5" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold text-tp-slate-700">{value}%</span>
    </div>
  )
}

export function ProgressShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Progress</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Linear and circular progress indicators. Three sizes for linear (S/M/L), labeled and color variants. TP Blue default.
      </p>

      <div className="flex flex-col gap-8">
        {/* Linear */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Linear</span>
          <div className="flex flex-col gap-4 max-w-md">
            <LinearProgress value={72} label="Upload progress" />
            <LinearProgress value={45} label="Storage used" color="#10B981" />
            <LinearProgress value={88} label="Danger zone" color="#E11D48" />
          </div>
        </div>

        {/* Linear sizes */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Linear Sizes</span>
          <div className="flex flex-col gap-4 max-w-md">
            <LinearProgress value={60} size="sm" label="Small (4px)" />
            <LinearProgress value={60} size="md" label="Medium (8px)" />
            <LinearProgress value={60} size="lg" label="Large (12px)" />
          </div>
        </div>

        {/* Circular */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Circular</span>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <CircularProgress value={72} size={48} strokeWidth={4} />
              <span className="text-[10px] text-tp-slate-400">48px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CircularProgress value={45} size={64} color="#10B981" />
              <span className="text-[10px] text-tp-slate-400">64px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CircularProgress value={88} size={80} strokeWidth={6} color="#E11D48" />
              <span className="text-[10px] text-tp-slate-400">80px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CircularProgress value={60} size={96} strokeWidth={7} color="#F59E0B" />
              <span className="text-[10px] text-tp-slate-400">96px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SKELETON ───

export function SkeletonShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Skeleton</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Placeholder loading shapes with pulse animation. Text, circular, and rectangular variants. Matches content dimensions for seamless loading states.
      </p>

      <div className="flex flex-col gap-6">
        {/* Text lines */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Text Lines</span>
          <div className="flex flex-col gap-2 max-w-md">
            <div className="h-4 rounded-md animate-pulse" style={{ backgroundColor: "#E2E2EA", width: "75%" }} />
            <div className="h-4 rounded-md animate-pulse" style={{ backgroundColor: "#E2E2EA", width: "100%" }} />
            <div className="h-4 rounded-md animate-pulse" style={{ backgroundColor: "#E2E2EA", width: "60%" }} />
          </div>
        </div>

        {/* Card skeleton */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Card Skeleton</span>
          <div
            className="p-4 border border-tp-slate-200 bg-card flex flex-col gap-3"
            style={{ borderRadius: "12px", maxWidth: "320px" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: "#E2E2EA" }} />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3.5 rounded-md animate-pulse" style={{ backgroundColor: "#E2E2EA", width: "50%" }} />
                <div className="h-3 rounded-md animate-pulse" style={{ backgroundColor: "#F1F1F5", width: "35%" }} />
              </div>
            </div>
            <div className="h-32 rounded-lg animate-pulse" style={{ backgroundColor: "#F1F1F5" }} />
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 rounded-md animate-pulse" style={{ backgroundColor: "#E2E2EA" }} />
              <div className="h-3.5 rounded-md animate-pulse" style={{ backgroundColor: "#E2E2EA", width: "80%" }} />
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Table Skeleton</span>
          <div className="border border-tp-slate-200 rounded-xl overflow-hidden bg-card max-w-lg">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < 3 ? "1px solid #F1F1F5" : "none" }}
              >
                <div className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: "#E2E2EA" }} />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-3 rounded animate-pulse" style={{ backgroundColor: "#E2E2EA", width: `${60 + (i * 10) % 30}%` }} />
                  <div className="h-2.5 rounded animate-pulse" style={{ backgroundColor: "#F1F1F5", width: "40%" }} />
                </div>
                <div className="w-14 h-6 rounded-full animate-pulse" style={{ backgroundColor: "#F1F1F5" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LIST ───

export function ListShowcase() {
  const items = [
    { icon: <Home size={18} />, primary: "Dashboard", secondary: "Overview and stats" },
    { icon: <Calendar size={18} />, primary: "Appointments", secondary: "View and schedule" },
    { icon: <Users size={18} />, primary: "Patients", secondary: "Manage records" },
    { icon: <BarChart2 size={18} />, primary: "Reports", secondary: "Analytics and data" },
    { icon: <Settings size={18} />, primary: "Settings", secondary: "Preferences" },
  ]

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">List</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Structured list items with icon, primary/secondary text, and action. Supports single-select and navigation patterns.
      </p>

      <div className="flex flex-wrap gap-8 items-start">
        {/* Navigation list */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Navigation List</span>
          <div
            className="border border-tp-slate-200 bg-card overflow-hidden"
            style={{ borderRadius: "12px", width: "280px" }}
          >
            {items.map((item, i) => (
              <button
                key={i}
                className="flex items-center gap-3 px-4 py-3 text-left w-full transition-colors hover:bg-tp-slate-50"
                style={{
                  borderBottom: i < items.length - 1 ? "1px solid #F1F1F5" : "none",
                  backgroundColor: i === 0 ? "#EEEEFF" : undefined,
                }}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: i === 0 ? "#4B4AD5" : "#F1F1F5",
                    color: i === 0 ? "#FFFFFF" : "#717179",
                  }}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-medium block"
                    style={{ color: i === 0 ? "#4B4AD5" : "#454551" }}
                  >
                    {item.primary}
                  </span>
                  <span className="text-xs text-tp-slate-400">{item.secondary}</span>
                </div>
                <span className="inline-flex flex-shrink-0"><ChevronRight size={16} style={{ color: i === 0 ? "#4B4AD5" : "#D0D5DD" }} /></span>
              </button>
            ))}
          </div>
        </div>

        {/* Simple list */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Simple List</span>
          <div
            className="border border-tp-slate-200 bg-card overflow-hidden"
            style={{ borderRadius: "12px", width: "280px" }}
          >
            {["Account Information", "Email Preferences", "Security", "Billing", "Notifications"].map((item, i) => (
              <button
                key={i}
                className="flex items-center justify-between px-4 py-3 text-left w-full transition-colors hover:bg-tp-slate-50"
                style={{ borderBottom: i < 4 ? "1px solid #F1F1F5" : "none" }}
              >
                <span className="text-sm font-medium text-tp-slate-700">{item}</span>
                <span className="inline-flex flex-shrink-0"><ChevronRight size={16} className="text-tp-slate-300" /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BREADCRUMBS ───

export function BreadcrumbsShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Breadcrumbs</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Navigation trail showing page hierarchy. Chevron and slash separators. Last item is current page (non-linked).
      </p>

      <div className="flex flex-col gap-6">
        {/* Chevron separator */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Chevron Separator</span>
          <nav className="flex items-center gap-1.5">
            {["Home", "Patients", "Andrew Chapman", "Prescriptions"].map((item, i, arr) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {i > 0 && <span className="inline-flex flex-shrink-0"><ChevronRight size={14} className="text-tp-slate-300" /></span>}
                <span
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: i === arr.length - 1 ? "#171725" : "#717179",
                    cursor: i === arr.length - 1 ? "default" : "pointer",
                  }}
                >
                  {item}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Slash separator */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">Slash Separator</span>
          <nav className="flex items-center gap-2">
            {["Dashboard", "Reports", "Monthly"].map((item, i, arr) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-tp-slate-300">/</span>}
                <span
                  className="text-sm font-medium"
                  style={{
                    color: i === arr.length - 1 ? "#171725" : "#4B4AD5",
                    textDecoration: i === arr.length - 1 ? "none" : "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {item}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* With home icon */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">With Home Icon</span>
          <nav className="flex items-center gap-1.5">
            <span className="inline-flex flex-shrink-0"><Home size={16} style={{ color: "#A2A2A8" }} /></span>
            {["Settings", "Security", "Two-Factor"].map((item, i, arr) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <span className="inline-flex flex-shrink-0"><ChevronRight size={14} style={{ color: "#D1D1D6" }} /></span>
                <span
                  className="text-sm font-medium"
                  style={{ color: i === arr.length - 1 ? "#171725" : "#717179" }}
                >
                  {item}
                </span>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

// ─── STEPPER ───

export function StepperShowcase() {
  const steps = [
    { label: "Patient Info", status: "complete" as const },
    { label: "Medical History", status: "complete" as const },
    { label: "Diagnosis", status: "active" as const },
    { label: "Treatment Plan", status: "upcoming" as const },
    { label: "Review", status: "upcoming" as const },
  ]

  const verticalSteps = [
    { label: "Account created", desc: "Your account has been set up", status: "complete" as const },
    { label: "Verify email", desc: "Check your inbox for verification", status: "complete" as const },
    { label: "Complete profile", desc: "Add your details and preferences", status: "active" as const },
    { label: "Start using app", desc: "You're all set!", status: "upcoming" as const },
  ]

  const statusColors = {
    complete: { bg: "#4B4AD5", border: "#4B4AD5", text: "#FFFFFF" },
    active: { bg: "#FFFFFF", border: "#4B4AD5", text: "#4B4AD5" },
    upcoming: { bg: "#FFFFFF", border: "#E2E2EA", text: "#A2A2A8" },
  }

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Stepper</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Multi-step progress indicator. Horizontal and vertical orientations. Complete, active, and upcoming states. TP Blue for progress.
      </p>

      <div className="flex flex-col gap-8">
        {/* Horizontal */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Horizontal</span>
          <div className="flex items-center">
            {steps.map((step, i) => {
              const sc = statusColors[step.status]
              return (
                <div key={i} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundColor: sc.bg,
                        border: `2px solid ${sc.border}`,
                        color: sc.text,
                      }}
                    >
                      {step.status === "complete" ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <span
                      className="text-xs font-medium whitespace-nowrap"
                      style={{
                        color: step.status === "upcoming" ? "#A2A2A8" : step.status === "active" ? "#4B4AD5" : "#454551",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-3"
                      style={{
                        backgroundColor: step.status === "complete" ? "#4B4AD5" : "#E2E2EA",
                        marginTop: "-24px",
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Vertical */}
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-4">Vertical</span>
          <div className="flex flex-col max-w-sm">
            {verticalSteps.map((step, i) => {
              const sc = statusColors[step.status]
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: sc.bg,
                        border: `2px solid ${sc.border}`,
                        color: sc.text,
                      }}
                    >
                      {step.status === "complete" ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    {i < verticalSteps.length - 1 && (
                      <div
                        className="w-0.5 flex-1 min-h-8"
                        style={{
                          backgroundColor: step.status === "complete" ? "#4B4AD5" : "#E2E2EA",
                        }}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <span
                      className="text-sm font-semibold block"
                      style={{
                        color: step.status === "upcoming" ? "#A2A2A8" : step.status === "active" ? "#4B4AD5" : "#454551",
                      }}
                    >
                      {step.label}
                    </span>
                    <span className="text-xs text-tp-slate-400">{step.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ACCORDION ───

export function AccordionShowcase() {
  const [openItems, setOpenItems] = useState<number[]>([0])
  const items = [
    { title: "What is TatvaPractice?", content: "TatvaPractice is an EMR SaaS platform designed for modern healthcare practices. It streamlines patient management, prescriptions, appointments, and clinical workflows in a unified, intuitive interface." },
    { title: "How does billing work?", content: "Billing is handled through integrated payment processing. You can generate invoices, process insurance claims, and accept online payments directly from the platform with full PCI compliance." },
    { title: "Can I customize my templates?", content: "Yes, all clinical templates including prescriptions, notes, and reports are fully customizable. You can create your own templates or modify existing ones to match your practice workflow." },
    { title: "Is data encrypted?", content: "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We are HIPAA compliant and undergo regular security audits to ensure your patient data remains protected." },
  ]

  const toggleItem = (i: number) => {
    setOpenItems((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Accordion</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Expandable content sections. Chevron rotates on open. Smooth height animation. Border-separated items with 12px radius.
      </p>

      <div className="max-w-2xl">
        <div
          className="border border-tp-slate-200 bg-card overflow-hidden"
          style={{ borderRadius: "12px" }}
        >
          {items.map((item, i) => {
            const isOpen = openItems.includes(i)
            return (
              <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid #F1F1F5" : "none" }}>
                <button
                  className="flex items-center justify-between w-full px-5 py-4 text-left transition-colors hover:bg-tp-slate-50/50"
                  onClick={() => toggleItem(i)}
                >
                  <span className="text-sm font-semibold text-tp-slate-800">{item.title}</span>
                  <span className="inline-flex flex-shrink-0"><ChevronDown
                    size={18}
                    className="text-tp-slate-400 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
                  /></span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{
                    maxHeight: isOpen ? "200px" : "0",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 pb-4">
                    <p className="text-sm text-tp-slate-500 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── CARD ───

export function CardShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Card</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Content container with elevation variants. Supports header, body, footer sections. 16px radius, layered shadow system.
      </p>

      <div className="flex flex-wrap gap-6 items-start">
        {/* Basic card */}
        <div
          className="bg-card border border-tp-slate-200 overflow-hidden"
          style={{
            borderRadius: "16px",
            width: "280px",
            boxShadow: "0 1px 3px 0 rgba(23,23,37,0.08), 0 1px 2px -1px rgba(23,23,37,0.06)",
          }}
        >
          <div
            className="h-36 flex items-center justify-center"
            style={{ backgroundColor: "#F1F1F5" }}
          >
            <span className="inline-flex flex-shrink-0"><Image size={32} className="text-tp-slate-300" /></span>
          </div>
          <div className="p-4">
            <h4 className="text-sm font-bold text-tp-slate-900 mb-1">Card Title</h4>
            <p className="text-xs text-tp-slate-500 leading-relaxed">
              Brief description of the content inside this card component.
            </p>
          </div>
          <div className="px-4 py-3 border-t border-tp-slate-100 flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: "#F1F1F5", color: "#454551" }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: "#4B4AD5", color: "#FFFFFF" }}
            >
              Action
            </button>
          </div>
        </div>

        {/* Stat card */}
        <div
          className="bg-card border border-tp-slate-200 p-5 overflow-hidden"
          style={{
            borderRadius: "16px",
            width: "220px",
            boxShadow: "0 1px 3px 0 rgba(23,23,37,0.08), 0 1px 2px -1px rgba(23,23,37,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-tp-slate-500 uppercase tracking-wider">Revenue</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#EEEEFF" }}
            >
              <span className="inline-flex flex-shrink-0"><BarChart2 size={16} style={{ color: "#4B4AD5" }} /></span>
            </div>
          </div>
          <div className="text-2xl font-bold text-tp-slate-900 mb-1 font-heading">$24,580</div>
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>+12.5% from last month</span>
        </div>

        {/* Profile card */}
        <div
          className="bg-card border border-tp-slate-200 overflow-hidden"
          style={{
            borderRadius: "16px",
            width: "280px",
            boxShadow: "0 1px 3px 0 rgba(23,23,37,0.08), 0 1px 2px -1px rgba(23,23,37,0.06)",
          }}
        >
          <div
            className="h-16"
            style={{ background: "linear-gradient(135deg, #4B4AD5 0%, #3C3BB5 100%)" }}
          />
          <div className="px-4 pb-4" style={{ marginTop: "-20px" }}>
            <Avatar size="xl" initials="AC" />
            <h4 className="text-sm font-bold text-tp-slate-900 mt-2">Andrew Chapman</h4>
            <p className="text-xs text-tp-slate-500">Senior Doctor / Cardiology</p>
            <div className="flex items-center gap-2 mt-3">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5"
                style={{ borderRadius: "100px", backgroundColor: "#ECFDF5", color: "#047857" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#10B981" }} />
                Available
              </span>
              <span className="text-xs text-tp-slate-400">12 years exp.</span>
            </div>
          </div>
        </div>

        {/* Elevated card */}
        <div
          className="bg-card p-5 overflow-hidden"
          style={{
            borderRadius: "16px",
            width: "280px",
            boxShadow: "0 12px 24px -4px rgba(23,23,37,0.08), 0 4px 8px -4px rgba(23,23,37,0.04)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#FFF1F2" }}
            >
              <span className="inline-flex flex-shrink-0"><Shield size={20} style={{ color: "#E11D48" }} /></span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-tp-slate-900">Security Alert</h4>
              <span className="text-xs text-tp-slate-400">2 min ago</span>
            </div>
          </div>
          <p className="text-sm text-tp-slate-500 leading-relaxed mb-3">
            Unusual login detected from a new device. Please verify your identity.
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: "#E11D48", color: "#FFFFFF" }}
            >
              Verify Now
            </button>
            <button
              className="flex-1 py-2 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: "#F1F1F5", color: "#454551" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { XCircle, ChevronRight, User } from "lucide-react"

// ─── COLOR SCHEMES (7 brand colors: TP Blue, TP Violet, TP Amber, Success, Error, Warning, Neutral) ───

const tagColors = [
  {
    name: "Blue",
    light: { bg: "#EEEEFF", text: "#4B4AD5" },
    medium: { bg: "#D8D8FA", text: "#3C3BB5" },
    dark: { bg: "#4B4AD5", text: "#FFFFFF" },
    filled: { bg: "#161558", text: "#FFFFFF" },
    dot: "#4B4AD5",
    outline: "#4B4AD5",
  },
  {
    name: "Violet",
    light: { bg: "#FAF5FE", text: "#8A4DBB" },
    medium: { bg: "#EDDFF7", text: "#703A9E" },
    dark: { bg: "#A461D8", text: "#FFFFFF" },
    filled: { bg: "#3E1C64", text: "#FFFFFF" },
    dot: "#A461D8",
    outline: "#A461D8",
  },
  {
    name: "Amber",
    light: { bg: "#FFFBEB", text: "#B45309" },
    medium: { bg: "#FEF3C7", text: "#92400E" },
    dark: { bg: "#F59E0B", text: "#FFFFFF" },
    filled: { bg: "#78350F", text: "#FFFFFF" },
    dot: "#F59E0B",
    outline: "#D97706",
  },
  {
    name: "Success",
    light: { bg: "#ECFDF5", text: "#047857" },
    medium: { bg: "#D1FAE5", text: "#065F46" },
    dark: { bg: "#10B981", text: "#FFFFFF" },
    filled: { bg: "#064E3B", text: "#FFFFFF" },
    dot: "#10B981",
    outline: "#10B981",
  },
  {
    name: "Error",
    light: { bg: "#FFF1F2", text: "#9F1239" },
    medium: { bg: "#FFE4E6", text: "#881337" },
    dark: { bg: "#E11D48", text: "#FFFFFF" },
    filled: { bg: "#4C0519", text: "#FFFFFF" },
    dot: "#E11D48",
    outline: "#E11D48",
  },
  {
    name: "Warning",
    light: { bg: "#FFFBEB", text: "#B45309" },
    medium: { bg: "#FEF3C7", text: "#92400E" },
    dark: { bg: "#F59E0B", text: "#FFFFFF" },
    filled: { bg: "#78350F", text: "#FFFFFF" },
    dot: "#F59E0B",
    outline: "#D97706",
  },
  {
    name: "Neutral",
    light: { bg: "#F1F1F5", text: "#454551" },
    medium: { bg: "#E2E2EA", text: "#2C2C35" },
    dark: { bg: "#545460", text: "#FFFFFF" },
    filled: { bg: "#171725", text: "#FFFFFF" },
    dot: "#717179",
    outline: "#717179",
  },
]

type Intensity = "light" | "medium" | "dark" | "filled"

// ─── TAG COMPONENT (pill radius: 100px) ───

function Tag({
  label,
  color,
  intensity = "light",
  dot,
  avatar,
  dismissible,
  outline,
  onDismiss,
}: {
  label: string
  color: (typeof tagColors)[number]
  intensity?: Intensity
  dot?: boolean
  avatar?: boolean
  dismissible?: boolean
  outline?: boolean
  onDismiss?: () => void
}) {
  const style = color[intensity]
  const bg = outline ? "transparent" : style.bg
  const text = outline ? color.outline : style.text
  const border = outline ? `1.5px solid ${color.outline}` : "none"

  return (
    <span
      className="inline-flex items-center gap-1.5 font-semibold flex-shrink-0"
      style={{
        height: "26px",
        padding: "0 10px",
        paddingLeft: dot || avatar ? "6px" : "10px",
        borderRadius: "100px",
        backgroundColor: bg,
        color: text,
        border,
        fontSize: "12px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {dot && (
        <span
          className="block rounded-full flex-shrink-0"
          style={{
            width: "6px",
            height: "6px",
            backgroundColor:
              intensity === "dark" || intensity === "filled" ? "rgba(255,255,255,0.6)" : color.dot,
          }}
        />
      )}
      {avatar && (
        <span
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: "20px",
            height: "20px",
            backgroundColor:
              intensity === "dark" || intensity === "filled" ? "rgba(255,255,255,0.2)" : color.dot,
          }}
        >
          <User
            size={10}
            style={{
              color:
                intensity === "dark" || intensity === "filled"
                  ? "rgba(255,255,255,0.8)"
                  : "#FFFFFF",
            }}
          />
        </span>
      )}
      {label}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex items-center justify-center rounded-sm flex-shrink-0 hover:opacity-70 transition-opacity"
          style={{ color: text, marginLeft: "2px" }}
        >
          <span className="inline-flex flex-shrink-0"><XCircle size={12} /></span>
        </button>
      )}
    </span>
  )
}

// ─── BANNER (pill radius) ───

function Banner({
  label,
  message,
  color,
  intensity = "light",
}: {
  label: string
  message: string
  color: (typeof tagColors)[number]
  intensity?: "light" | "filled"
}) {
  const style = intensity === "filled" ? color.filled : color.light
  const labelBg = intensity === "filled" ? "rgba(255,255,255,0.2)" : color.dot

  return (
    <div
      className="inline-flex items-center gap-2 px-3 font-medium"
      style={{
        height: "32px",
        borderRadius: "10px",
        backgroundColor: style.bg,
        color: style.text,
        fontSize: "13px",
        fontFamily: "var(--font-sans)",
        border: intensity === "light" ? `1px solid ${color.dot}20` : "none",
      }}
    >
      <span
        className="px-2 py-0.5 rounded-full font-bold"
        style={{
          backgroundColor: labelBg,
          color: intensity === "filled" ? style.text : "#FFFFFF",
          fontSize: "11px",
        }}
      >
        {label}
      </span>
      <span>{message}</span>
      <ChevronRight size={14} style={{ opacity: 0.6 }} />
    </div>
  )
}

// ─── MAIN EXPORTS ───

export function LabelShowcase() {
  const intensities: { key: Intensity; label: string }[] = [
    { key: "light", label: "Light" },
    { key: "medium", label: "Medium" },
    { key: "dark", label: "Dark" },
    { key: "filled", label: "Filled" },
  ]

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Labels / Tags
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        7 brand color families across 4 intensity levels + outline variant. Constraint: All tags use pill radius (100px) because they are compact status indicators -- the round shape groups them visually as metadata. Height is fixed at 26px with 12px font. Light intensity uses 50-level bg + 600-level text. Filled uses 900-level bg + white text. Dot indicators are 6px circles. Outline variant uses 1.5px border with no fill.
      </p>

      {intensities.map((int) => (
        <div key={int.key} className="mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-2.5">
            {int.label} + Dot
          </span>
          <div className="flex flex-wrap gap-2">
            {tagColors.map((c) => (
              <Tag key={c.name} label={c.name} color={c} intensity={int.key} dot />
            ))}
          </div>
        </div>
      ))}

      <div className="mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-2.5">
          Outline
        </span>
        <div className="flex flex-wrap gap-2">
          {tagColors.map((c) => (
            <Tag key={c.name} label={c.name} color={c} outline dot />
          ))}
        </div>
      </div>

      <div className="mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-2.5">
          Avatar (Light)
        </span>
        <div className="flex flex-wrap gap-2">
          {tagColors.map((c) => (
            <Tag key={c.name} label={c.name} color={c} intensity="light" avatar />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChipShowcase() {
  const intensities: { key: Intensity; label: string }[] = [
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
    { key: "filled", label: "Filled" },
  ]

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Dismissible Chips
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Removable chips with pill radius (100px), dot and avatar variants across all brand colors.
      </p>

      {intensities.map((int) => (
        <div key={int.key} className="mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-2.5">
            Dot + Dismiss ({int.label})
          </span>
          <div className="flex flex-wrap gap-2">
            {tagColors.map((c) => (
              <Tag key={c.name} label="Label 1" color={c} intensity={int.key} dot dismissible />
            ))}
          </div>
        </div>
      ))}

      <div className="mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-2.5">
          Avatar + Dismiss (Light)
        </span>
        <div className="flex flex-wrap gap-2">
          {tagColors.map((c) => (
            <Tag key={c.name} label="Label 1" color={c} intensity="light" avatar dismissible />
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-2.5">
          Outline + Dismiss
        </span>
        <div className="flex flex-wrap gap-2">
          {tagColors.map((c) => (
            <Tag key={c.name} label="Label 1" color={c} outline dot dismissible />
          ))}
        </div>
      </div>
    </div>
  )
}

export function BannerShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Banner / Announcement Bars
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Notification bars with 10px border-radius, label badge, and directional arrow. Constraint: Banners use a softer 10px radius (not pill) because they span wider and a full-round shape would feel disproportionate at this width.
      </p>

      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-3">
          Light
        </span>
        <div className="flex flex-wrap gap-3">
          {tagColors.slice(0, 6).map((c) => (
            <Banner key={c.name} label="New" message={"We've got a new update!"} color={c} />
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-3">
          Filled
        </span>
        <div className="flex flex-wrap gap-3">
          {tagColors.slice(0, 6).map((c) => (
            <Banner
              key={c.name}
              label="New"
              message={"We've got a new update!"}
              color={c}
              intensity="filled"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

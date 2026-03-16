"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { CheckCircle2, ChevronDown, Copy, RefreshCw } from "lucide-react"

// ─── I18N-READY LABELS (replace with t() in production) ───

const LABELS = {
  copyHint: "Click to copy",
  copied: "Copied!",
  button: "Button",
  textOnly: "Text only",
  leftIcon: "Left icon",
  rightIcon: "Right icon",
  leftRight: "Left + Right",
  dropdown: "Dropdown",
  iconOnly: "Icon only",
  solid: "Solid",
  outline: "Outline",
  default: "Default",
  hover: "Hover",
  focused: "Focused",
  disabled: "Disabled",
  solidInverted: "Solid (inverted)",
  outlineOverlay: "Outline (30% white overlay)",
  linkWhite: "Link (white text)",
  ghost: "Ghost",
  patientRecordToolbar: "Patient Record Toolbar",
  prescriptionActions: "Prescription Actions",
  appointmentCard: "Appointment Card",
  dangerZone: "Danger Zone",
  selectState: "Select state",
  stateMaster: "State (master)",
  link: "Link",
  primary: "Primary",
  secondary: "Secondary",
  neutral: "Neutral",
  warning: "Warning",
  error: "Error",
  success: "Success",
  loading: "Loading",
} as const

/** Icon wrapper — flex-shrink-0, currentColor inheritance */
function IconWrap({ children, size }: { children: React.ReactNode; size?: number }) {
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center [&_svg]:shrink-0"
      style={{ ...(size ? { width: size, height: size } : {}), color: "inherit" }}
      aria-hidden
    >
      {children}
    </span>
  )
}

// ─── TYPES ───

type CtaTheme = "primary" | "neutral" | "error"
type CtaType = "solid" | "outline" | "ghost" | "link"
type CtaSize = "sm" | "md" | "lg"
type CtaState = "default" | "hover" | "focused" | "disabled" | "loading"

interface CtaTokens {
  bg: string
  text: string
  border: string
  hoverBg: string
  focusBg: string
  focusRing: string
  disabledBg: string
  disabledText: string
  disabledBorder: string
}

// ─── TOKEN MAP ───

const themeTokens: Record<CtaTheme, CtaTokens> = {
  primary: {
    bg: "#4B4AD5",
    text: "#FFFFFF",
    border: "#4B4AD5",
    hoverBg: "#3C3BB5",
    focusBg: "#4B4AD5",
    focusRing: "#B5B4F2",
    disabledBg: "#E2E2EA",
    disabledText: "#A2A2A8",
    disabledBorder: "#E2E2EA",
  },
  neutral: {
    bg: "#F1F1F5",
    text: "#454551",
    border: "#E2E2EA",
    hoverBg: "#E2E2EA",
    focusBg: "#F1F1F5",
    focusRing: "#D0D5DD",
    disabledBg: "#FAFAFB",
    disabledText: "#A2A2A8",
    disabledBorder: "#F1F1F5",
  },
  error: {
    bg: "#E11D48",
    text: "#FFFFFF",
    border: "#E11D48",
    hoverBg: "#C8102E",
    focusBg: "#E11D48",
    focusRing: "#FDA4AF",
    disabledBg: "#E2E2EA",
    disabledText: "#A2A2A8",
    disabledBorder: "#E2E2EA",
  },
}

const sizeMap: Record<CtaSize, { height: number; px: number; py: number; iconSize: number; fontSize: number; gap: number; label: string }> = {
  sm: { height: 36, px: 14, py: 8, iconSize: 20, fontSize: 12, gap: 6, label: "S -- 36px" },
  md: { height: 42, px: 14, py: 8, iconSize: 24, fontSize: 14, gap: 6, label: "M -- 42px" },
  lg: { height: 48, px: 14, py: 8, iconSize: 28, fontSize: 16, gap: 6, label: "L -- 48px" },
}

// ─── STYLE BUILDER ───

function getStyles(
  theme: CtaTheme,
  type: CtaType,
  size: CtaSize,
  state: CtaState,
  iconOnly?: boolean,
  dropdown?: boolean,
  surface?: "light" | "dark"
): React.CSSProperties {
  const isDark = surface === "dark"
  const t = themeTokens[theme]
  const s = sizeMap[size]
  const isDisabled = state === "disabled"
  const isLoading = state === "loading"

  /** Icon-only: perfect square (width = height), centered icon */
  const iconOnlyPadding = iconOnly
    ? Math.floor((s.height - s.iconSize) / 2)
    : undefined

  /** Dropdown: minimal right padding (8px) for compact chevron area */
  const padR = dropdown ? 8 : (iconOnlyPadding ?? s.px)
  const padL = type === "link" ? 0 : (iconOnlyPadding ?? s.px)
  const padTB = type === "link" ? 0 : (iconOnlyPadding !== undefined ? iconOnlyPadding : s.py)

  const base: React.CSSProperties = {
    height: type === "link" ? "auto" : `${s.height}px`,
    paddingLeft: padL,
    paddingRight: padR,
    paddingTop: padTB,
    paddingBottom: padTB,
    ...(iconOnly && type !== "link"
      ? { width: s.height, minWidth: s.height, maxWidth: s.height }
      : {}),
    borderRadius: type === "link" ? 0 : "10px",
    fontSize: `${s.fontSize}px`,
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    cursor: isDisabled ? "not-allowed" : isLoading ? "wait" : "pointer",
    transition: "all 150ms ease",
    opacity: isDisabled ? 0.7 : isLoading ? 0.85 : 1,
  }

  if (type === "solid") {
    const bg = isDark
      ? (isDisabled ? "rgba(255,255,255,0.10)" : state === "hover" || state === "focused" ? "#E2E2EA" : "#FFFFFF")
      : (isDisabled ? t.disabledBg : state === "hover" ? t.hoverBg : t.bg)
    const color = isDark ? (isDisabled ? "rgba(255,255,255,0.30)" : "#161558") : (isDisabled ? t.disabledText : t.text)
    return {
      ...base,
      backgroundColor: bg,
      color,
      border: "none",
      boxShadow: state === "focused" && isDark ? "0 0 0 3px rgba(255,255,255,0.30)" : state === "focused" ? `0 0 0 3px ${t.focusRing}` : undefined,
    }
  }

  if (type === "outline") {
    const hoverBg = isDark
      ? (isDisabled ? "rgba(255,255,255,0.08)" : state === "hover" || state === "focused" ? "rgba(255,255,255,0.20)" : "transparent")
      : (state === "hover" ? (theme === "primary" ? "#EEEEFF" : theme === "error" ? "#FFF1F2" : "#FAFAFB") : "transparent")
    const bg = !isDark && isDisabled ? "transparent" : hoverBg
    const textColor = isDark ? (isDisabled ? "rgba(255,255,255,0.30)" : "#FFFFFF") : (isDisabled ? t.disabledText : theme === "neutral" ? t.text : t.border)
    const borderColor = isDark ? (isDisabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.40)") : (isDisabled ? t.disabledBorder : t.border)
    return {
      ...base,
      backgroundColor: isDark ? (isDisabled ? "rgba(255,255,255,0.08)" : state === "hover" || state === "focused" ? "rgba(255,255,255,0.20)" : "transparent") : (!isDisabled ? hoverBg : "transparent"),
      color: textColor,
      border: `1.5px solid ${borderColor}`,
      boxShadow: state === "focused" && isDark ? "0 0 0 3px rgba(255,255,255,0.20)" : state === "focused" ? `0 0 0 3px ${t.focusRing}` : undefined,
    }
  }

  if (type === "ghost") {
    const hoverBg = isDark
      ? (state === "hover" ? "rgba(255,255,255,0.12)" : "transparent")
      : (state === "hover" ? (theme === "primary" ? "#EEEEFF" : theme === "error" ? "#FFF1F2" : "#F1F1F5") : "transparent")
    const bg = isDisabled ? "transparent" : hoverBg
    const textColor = isDark ? (isDisabled ? "rgba(255,255,255,0.30)" : "#FFFFFF") : (isDisabled ? t.disabledText : theme === "neutral" ? "#454551" : t.border)
    return {
      ...base,
      backgroundColor: bg,
      color: textColor,
      border: "none",
      boxShadow: state === "focused" ? `0 0 0 3px ${t.focusRing}` : undefined,
    }
  }

  // link
  const textColor = isDark ? (isDisabled ? "rgba(255,255,255,0.30)" : "#FFFFFF") : (isDisabled ? t.disabledText : theme === "neutral" ? "#454551" : t.border)
  return {
    ...base,
    backgroundColor: "transparent",
    color: textColor,
    border: "none",
    textDecoration: "underline",
    textUnderlineOffset: "4px",
    height: "auto",
    padding: 0,
  }
}

// ─── CODE GENERATOR ───

function generateCode(
  theme: CtaTheme,
  type: CtaType,
  size: CtaSize,
  anatomy: string
): string {
  const s = sizeMap[size]
  const t = themeTokens[theme]

  const variant = type === "solid"
    ? `variant="solid"`
    : type === "outline"
      ? `variant="outline"`
      : type === "ghost"
        ? `variant="ghost"`
        : `variant="link"`

  const sizeStr = size === "sm" ? `size="sm"` : size === "lg" ? `size="lg"` : `size="md"`
  const themeStr = `theme="${theme}"`
  const iconStr = `size={${s.iconSize}} strokeWidth={1.5}`

  const lines: string[] = [`<Button ${variant} ${themeStr} ${sizeStr}>`]

  if (anatomy.includes("left-icon")) {
    lines[0] = `<Button ${variant} ${themeStr} ${sizeStr}>`
    lines.push(`  <TickCircle ${iconStr} />`)
  }
  if (anatomy.includes("text")) {
    lines.push(`  Button`)
  }
  if (anatomy.includes("right-icon") && !anatomy.includes("dropdown")) {
    lines.push(`  <TickCircle ${iconStr} />`)
  }
  if (anatomy.includes("dropdown")) {
    lines.push(`  <span className="border-l border-current/20 h-full mx-2" />`)
    lines.push(`  <ArrowDown2 ${iconStr} />`)
  }
  if (anatomy === "icon-only") {
    lines.length = 0
    lines.push(`<IconButton ${variant} ${themeStr} ${sizeStr}>`)
    lines.push(`  <TickCircle ${iconStr} />`)
    lines.push(`</IconButton>`)
    return lines.join("\n")
  }

  lines.push(`</Button>`)
  return lines.join("\n")
}

// ─── SINGLE BUTTON RENDERER ───

const DEFAULT_DROPDOWN_OPTIONS = ["Option A", "Option B"]

function CtaButton({
  theme,
  type,
  size,
  state,
  leftIcon,
  rightIcon,
  dropdown,
  iconOnly,
  label = LABELS.button,
  onCopy,
  surface = "light",
  dropdownOptions,
}: {
  theme: CtaTheme
  type: CtaType
  size: CtaSize
  state: CtaState
  leftIcon?: boolean
  rightIcon?: boolean
  dropdown?: boolean
  iconOnly?: boolean
  label?: string
  onCopy?: (code: string) => void
  surface?: "light" | "dark"
  /** When provided with dropdown=true, clicking opens a real dropdown (no icons in menu) instead of copying */
  dropdownOptions?: string[]
}) {
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const s = sizeMap[size]
  const styles = getStyles(theme, type, size, state, iconOnly, dropdown, surface)
  const iconSize = s.iconSize
  const isInteractiveDropdown = dropdown && (dropdownOptions ?? DEFAULT_DROPDOWN_OPTIONS).length > 0
  const options = dropdownOptions ?? DEFAULT_DROPDOWN_OPTIONS

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const anatomy = iconOnly
    ? "icon-only"
    : [
        leftIcon ? "left-icon" : "",
        "text",
        rightIcon ? "right-icon" : "",
        dropdown ? "dropdown" : "",
      ].filter(Boolean).join("+")

  const code = generateCode(theme, type, size, anatomy)

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy?.(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleButtonClick = () => {
    if (isInteractiveDropdown && state !== "disabled" && state !== "loading") {
      setDropdownOpen((o) => !o)
    } else {
      onCopy?.(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const accessibleLabel = iconOnly
    ? LABELS.button
    : `${label}${dropdown ? `, ${LABELS.dropdown.toLowerCase()}` : ""}`

  return (
    <div
      ref={containerRef}
      className="relative inline-flex flex-col items-center"
      role="group"
      onMouseEnter={() => setShowCode(true)}
      onMouseLeave={() => { setShowCode(false); setCopied(false) }}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center flex-shrink-0"
        style={{ ...styles, gap: s.gap }}
        disabled={state === "disabled" || state === "loading"}
        onClick={handleButtonClick}
        aria-label={accessibleLabel}
        title={LABELS.copyHint}
        data-cta-theme={theme}
        data-cta-type={type}
        data-cta-size={size}
      >
        {state === "loading" ? (
          <>
            <IconWrap size={iconSize}>
              <RefreshCw size={iconSize} className="animate-spin" />
            </IconWrap>
            {!iconOnly && <span className="truncate">{label}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <IconWrap size={iconSize}>
                <CheckCircle2 size={iconSize} />
              </IconWrap>
            )}
            {!iconOnly && <span className="truncate">{label}</span>}
            {iconOnly && (
              <IconWrap size={iconSize}>
                <CheckCircle2 size={iconSize} />
              </IconWrap>
            )}
          </>
        )}
        {rightIcon && !dropdown && state !== "loading" && (
          <IconWrap size={iconSize}>
            <CheckCircle2 size={iconSize} />
          </IconWrap>
        )}
        {dropdown && state !== "loading" && (
          <>
            <span
              className="flex-shrink-0 self-stretch mx-1"
              style={{
                borderLeft: `1px solid ${
                  state === "disabled"
                    ? "currentColor"
                    : type === "solid" && (theme === "neutral" || surface === "dark")
                      ? "rgba(69,69,81,0.25)"
                      : type === "solid"
                        ? "rgba(255,255,255,0.3)"
                        : "currentColor"
                }`,
                opacity: state === "disabled" ? 0.5 : 0.4,
              }}
              aria-hidden
            />
            <IconWrap size={iconSize}>
              <ChevronDown size={iconSize} className={`transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
            </IconWrap>
          </>
        )}
      </button>
      {/* Dropdown menu — text only, no icons, width matches button */}
      {dropdownOpen && isInteractiveDropdown && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 w-full min-w-[120px] rounded-lg border border-tp-slate-200 bg-white py-1 shadow-lg"
          style={{ boxShadow: "0 10px 15px -3px rgba(23,23,37,0.12), 0 4px 6px -4px rgba(23,23,37,0.08)" }}
          role="menu"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm font-medium text-tp-slate-800 hover:bg-tp-slate-100 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {/* Code preview popover on hover */}
      {showCode && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-[60]"
          style={{ bottom: `calc(100% + 8px)` }}
        >
          <div
            className="px-3 py-2.5 rounded-lg text-left"
            style={{
              backgroundColor: "#171725",
              boxShadow: "0 10px 15px -3px rgba(23,23,37,0.20), 0 4px 6px -4px rgba(23,23,37,0.15)",
              minWidth: "200px",
              maxWidth: "320px",
            }}
          >
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }} role="status" aria-live="polite">
                {copied ? LABELS.copied : LABELS.copyHint}
              </span>
              <button
                type="button"
                onClick={handleCopyClick}
                className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold hover:bg-white/15 transition-colors"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Copy
              </button>
            </div>
            <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap" style={{ color: "#B5B4F2" }}>
              {code}
            </pre>
          </div>
          {/* Arrow */}
          <div className="flex justify-center">
            <div
              className="w-2 h-2 rotate-45 -mt-1"
              style={{ backgroundColor: "#171725" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SECTION WRAPPER ───

function ShowcaseSection({
  title,
  description,
  children,
  id,
}: {
  title: string
  description?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-2xl border border-tp-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(23,23,37,0.06)] ring-1 ring-tp-slate-100/50"
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <h3 id={id ? `${id}-heading` : undefined} className="text-base font-semibold text-tp-slate-900 tracking-tight mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-tp-slate-500 mt-1.5 mb-5 leading-relaxed">{description}</p>
      )}
      {!description && <div className="mb-5" />}
      {children}
    </div>
  )
}

function VariantLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`text-[11px] block mt-2 text-center ${dark ? "text-white/70" : "text-tp-slate-400"}`}>
      {children}
    </span>
  )
}

// ─── STATE SECTION (type tabs + theme + states × anatomy) ───

const ANATOMY_VARIANTS = [
  { id: "textOnly", label: "Text only", props: {} },
  { id: "leftIcon", label: "Left icon", props: { leftIcon: true } },
  { id: "rightIcon", label: "Right icon", props: { rightIcon: true } },
  { id: "dropdown", label: "Dropdown", props: { dropdown: true } },
  { id: "iconOnly", label: "Icon only", props: { iconOnly: true } },
] as const

function StateSection({ onCopy }: { onCopy: (code: string) => void }) {
  const [type, setType] = useState<CtaType>("solid")
  const [theme, setTheme] = useState<CtaTheme>("primary")

  const variants = type === "ghost" || type === "link"
    ? ANATOMY_VARIANTS.filter((a) => a.id !== "dropdown")
    : ANATOMY_VARIANTS

  return (
    <ShowcaseSection
      id="cta-state"
      title="State"
      description="Type and theme toggles. States × anatomy variants."
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold text-tp-slate-600 mb-2">Type</p>
          <div className="inline-flex rounded-lg border border-tp-slate-200 p-0.5 bg-tp-slate-50">
            {(["solid", "outline", "ghost", "link"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  type === t ? "bg-white text-tp-slate-800 shadow-sm border border-tp-slate-200" : "text-tp-slate-500 hover:text-tp-slate-700"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-tp-slate-600 mb-2">Theme</p>
          <div className="inline-flex rounded-lg border border-tp-slate-200 p-0.5 bg-tp-slate-50">
            {(["primary", "neutral", "error"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  theme === t ? "bg-white text-tp-slate-800 shadow-sm border border-tp-slate-200" : "text-tp-slate-500 hover:text-tp-slate-700"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-tp-slate-600 mb-3">State × Anatomy</p>
          <div className="space-y-4">
            {(["default", "hover", "focused", "disabled"] as const).map((state) => (
              <div key={state}>
                <p className="text-[11px] font-semibold text-tp-slate-500 mb-2">{state.charAt(0).toUpperCase() + state.slice(1)}</p>
                <div className="flex flex-wrap items-end gap-3">
                  {variants.map((a) => (
                    <div key={a.id} className="flex flex-col items-center">
                      <CtaButton theme={theme} type={type} size="md" state={state} onCopy={onCopy} {...a.props} />
                      <VariantLabel>{a.label}</VariantLabel>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShowcaseSection>
  )
}

// ─── MAIN EXPORT ───

export function CtaShowcase({
  onCopy,
  lang = "en",
}: {
  onCopy: (text: string, msg: string) => void
  lang?: string
}) {
  const handleCopy = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code)
      onCopy(code, "JSX copied to clipboard")
    },
    [onCopy]
  )

  return (
    <div className="flex flex-col gap-8" lang={lang}>
      {/* ─── CTA Hard Constraints ─── */}
      <div className="rounded-2xl border border-tp-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(23,23,37,0.06)] ring-1 ring-tp-slate-100/50" role="region" aria-labelledby="cta-constraints-heading">
        <h3 id="cta-constraints-heading" className="text-sm font-bold uppercase tracking-wider text-tp-slate-600 mb-4">
          CTA Hard Constraints
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm">
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">Radius</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">10px</code>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">Label</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">12–16px / 600</code>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">Icon-Text Gap</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">6px</code>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">Padding</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">14px × 8px</code>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">Icon</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">20–28px</code>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">S</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">36px H</code>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">M</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">42px H</code>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">L</span>
            <code className="text-xs font-mono font-medium text-tp-slate-800">48px H</code>
          </div>
        </div>
        <p className="text-xs text-tp-slate-600 mt-5 leading-relaxed">
          Primary for brand actions, Neutral for secondary, Error for destructive. <strong>Dropdown buttons are interactive</strong> — click to see Option A / Option B. Hover and click Copy to grab JSX.
        </p>
        <div className="mt-4 rounded-lg border border-tp-blue-200/60 bg-tp-blue-50/50 p-3">
          <p className="text-xs font-semibold text-tp-slate-800 mb-1">Lucide icons</p>
          <p className="text-xs text-tp-slate-700">Linear, strokeWidth 1.5. S: 20px, M: 24px, L: 28px. Dropdown menu: text only, no icons.</p>
        </div>
      </div>

      {/* ─── ANATOMY ─── */}
      <ShowcaseSection
        id="cta-anatomy"
        title="Anatomy"
        description="Size and type first, then theme variants. Click dropdown buttons to see the menu. Hover and click Copy to grab JSX."
      >
        {/* Size first, then Type */}
        <div className="space-y-6 pb-6 border-b border-tp-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-3">Size</p>
            <div className="flex flex-wrap items-end gap-4">
              {(["sm", "md", "lg"] as const).map((size) => (
                <div key={size} className="flex flex-col items-center">
                  <CtaButton theme="primary" type="outline" size={size} state="default" leftIcon onCopy={handleCopy} />
                  <VariantLabel>{sizeMap[size].label}</VariantLabel>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-3">Type</p>
            <div className="flex flex-wrap items-end gap-4">
              {(["solid", "outline", "ghost", "link"] as const).map((type) => (
                <div key={type} className="flex flex-col items-center">
                  <CtaButton theme="primary" type={type} size="md" state="default" leftIcon={type !== "link"} onCopy={handleCopy} />
                  <VariantLabel>{type.charAt(0).toUpperCase() + type.slice(1)}</VariantLabel>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Theme sections: Primary, Neutral, Error — each with full anatomy */}
        {(["primary", "neutral", "error"] as const).map((theme) => (
          <div key={theme} className="pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-3">
              {theme === "primary" ? "Primary Theme" : theme === "neutral" ? "Neutral (Secondary) Theme" : "Error Theme"}
            </span>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col items-center">
                <CtaButton theme={theme} type="solid" size="md" state="default" onCopy={handleCopy} />
                <VariantLabel>Text only</VariantLabel>
              </div>
              <div className="flex flex-col items-center">
                <CtaButton theme={theme} type="solid" size="md" state="default" leftIcon onCopy={handleCopy} />
                <VariantLabel>Left icon</VariantLabel>
              </div>
              <div className="flex flex-col items-center">
                <CtaButton theme={theme} type="solid" size="md" state="default" leftIcon rightIcon onCopy={handleCopy} />
                <VariantLabel>Both icons</VariantLabel>
              </div>
              <div className="flex flex-col items-center">
                <CtaButton theme={theme} type="solid" size="md" state="default" dropdown onCopy={handleCopy} />
                <VariantLabel>With dropdown</VariantLabel>
              </div>
              <div className="flex flex-col items-center">
                <CtaButton theme={theme} type="solid" size="md" state="default" iconOnly onCopy={handleCopy} />
                <VariantLabel>Icon only</VariantLabel>
              </div>
            </div>
          </div>
        ))}
        {/* Dropdown CTA variants */}
        <div className="mt-8 pt-6 border-t border-tp-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 mb-3">Dropdown CTA</p>
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col items-center">
              <CtaButton theme="primary" type="solid" size="md" state="default" dropdown label="More Actions" onCopy={handleCopy} />
              <VariantLabel>Primary solid</VariantLabel>
            </div>
            <div className="flex flex-col items-center">
              <CtaButton theme="primary" type="outline" size="md" state="default" dropdown label="More Options" onCopy={handleCopy} />
              <VariantLabel>Primary outline</VariantLabel>
            </div>
            <div className="flex flex-col items-center">
              <CtaButton theme="neutral" type="solid" size="md" state="default" dropdown label="More Options" onCopy={handleCopy} />
              <VariantLabel>Neutral solid</VariantLabel>
            </div>
            <div className="flex flex-col items-center">
              <CtaButton theme="neutral" type="outline" size="md" state="default" dropdown label="More Options" onCopy={handleCopy} />
              <VariantLabel>Neutral outline</VariantLabel>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      {/* ─── STATE ─── */}
      <StateSection onCopy={handleCopy} />

      {/* ─── ON DARK SURFACES ─── */}
      {[
        { label: "On Primary Depth", bg: "radial-gradient(101.06% 60.94% at 50% 55.44%, #4B4AD5 0%, #161558 39.08%, #2E2D96 78.16%, #4B4AD5 100%)" },
        { label: "On Violet Depth", bg: "radial-gradient(99.09% 59.99% at 50% 55.44%, #8A4DBB 0%, #3E1C64 39.08%, #572A81 78.16%, #A461D8 100%)" },
      ].map((surf, i) => (
        <div key={surf.label} id={i === 0 ? "cta-on-dark" : undefined} className="border rounded-xl p-6 overflow-hidden scroll-mt-24" style={{ background: surf.bg }}>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.68)" }}>
            {surf.label}
          </h3>
          <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.50)" }}>
            Solid inverts to white. Outline: 30% overlay. Ghost: transparent, white text. Left icon, dropdown, icon only variants.
          </p>
          {(["solid", "outline", "ghost", "link"] as const).map((type) => {
            const darkAnatomies = type === "solid" || type === "outline"
              ? [
                  { label: "Text", props: {} },
                  { label: "Left icon", props: { leftIcon: true } },
                  { label: "Dropdown", props: { dropdown: true } },
                  { label: "Icon only", props: { iconOnly: true } },
                ]
              : [
                  { label: "Text", props: {} },
                  { label: "Left icon", props: { leftIcon: true } },
                  { label: "Icon only", props: { iconOnly: true } },
                ]
            const states: CtaState[] = type === "link"
              ? ["default", "disabled"]
              : type === "ghost"
                ? ["default", "hover", "disabled"]
                : ["default", "hover", "focused", "disabled"]
            return (
              <div key={type} className="mb-8 last:mb-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider block mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
                <div className="space-y-4">
                  {states.map((state) => (
                    <div key={state} className="flex flex-wrap items-center gap-4">
                      <span className="w-16 text-[10px] font-medium uppercase shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {state}
                      </span>
                      {darkAnatomies.map((a) => (
                        <div key={a.label} className="flex flex-col items-center">
                          <CtaButton theme="primary" type={type} size="md" state={state} surface="dark" onCopy={handleCopy} {...a.props} />
                          <VariantLabel dark>{a.label}</VariantLabel>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* ─── DROPDOWN CTA ─── */}
      <ShowcaseSection
        id="cta-split"
        title="Dropdown CTA"
        description="Theme and type variants. Click to open the menu."
      >
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center">
            <CtaButton theme="primary" type="solid" size="md" state="default" dropdown label="Save Changes" onCopy={handleCopy} />
            <VariantLabel>Solid — Save</VariantLabel>
          </div>
          <div className="flex flex-col items-center">
            <CtaButton theme="primary" type="outline" size="md" state="default" dropdown label="More Actions" onCopy={handleCopy} />
            <VariantLabel>Outline — Primary</VariantLabel>
          </div>
          <div className="flex flex-col items-center">
            <CtaButton theme="neutral" type="outline" size="md" state="default" dropdown label="More Options" onCopy={handleCopy} />
            <VariantLabel>Outline — Neutral</VariantLabel>
          </div>
          <div className="flex flex-col items-center">
            <CtaButton theme="primary" type="solid" size="md" state="loading" dropdown label="Saving..." onCopy={handleCopy} />
            <VariantLabel>Loading</VariantLabel>
          </div>
        </div>
      </ShowcaseSection>

      {/* ─── 5. REAL-WORLD EXAMPLES ─── */}
      <ShowcaseSection
        id="cta-real-world"
        title="5. Real-World Examples"
        description="CTAs in the TatvaPractice EMR workspace."
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Record Toolbar */}
          <div className="rounded-xl border border-tp-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500 mb-2">{LABELS.patientRecordToolbar}</p>
            <p className="text-xs text-tp-slate-600 mb-4">Primary save, secondary actions (print, settings), and discard.</p>
            <div className="flex flex-wrap items-center gap-2">
              <CtaButton theme="primary" type="solid" size="sm" state="default" leftIcon label="Save Changes" onCopy={handleCopy} />
              <CtaButton theme="neutral" type="outline" size="sm" state="default" leftIcon label="Print" onCopy={handleCopy} />
              <CtaButton theme="neutral" type="ghost" size="sm" state="default" iconOnly onCopy={handleCopy} />
              <CtaButton theme="error" type="ghost" size="sm" state="default" label="Discard" onCopy={handleCopy} />
            </div>
          </div>

          {/* Prescription Actions */}
          <div className="rounded-xl border border-tp-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500 mb-2">{LABELS.prescriptionActions}</p>
            <p className="text-xs text-tp-slate-600 mb-4">Confirm Rx, split for export/share, link for drug info.</p>
            <div className="flex flex-wrap items-center gap-2">
              <CtaButton theme="primary" type="solid" size="md" state="default" label="Confirm Rx" onCopy={handleCopy} />
              <CtaButton theme="primary" type="outline" size="md" state="default" dropdown label="More Actions" onCopy={handleCopy} />
              <CtaButton theme="primary" type="link" size="md" state="default" label="View Drug Info" onCopy={handleCopy} />
            </div>
          </div>

          {/* Appointment Card */}
          <div className="rounded-xl border border-tp-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500 mb-2">{LABELS.appointmentCard}</p>
            <p className="text-xs text-tp-slate-600 mb-4">Primary check-in, neutral reschedule, error cancel.</p>
            <div className="flex flex-wrap items-center gap-2">
              <CtaButton theme="primary" type="solid" size="lg" state="default" label="Check In Patient" onCopy={handleCopy} />
              <CtaButton theme="neutral" type="outline" size="lg" state="default" label="Reschedule" onCopy={handleCopy} />
              <CtaButton theme="error" type="outline" size="lg" state="default" label="Cancel" onCopy={handleCopy} />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-tp-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500 mb-2">{LABELS.dangerZone}</p>
            <p className="text-xs text-tp-slate-600 mb-4">Destructive actions with clear hierarchy.</p>
            <div className="flex flex-wrap items-center gap-2">
              <CtaButton theme="error" type="solid" size="md" state="default" label="Delete Record" onCopy={handleCopy} />
              <CtaButton theme="error" type="outline" size="md" state="default" label="Remove Allergy" onCopy={handleCopy} />
              <CtaButton theme="error" type="ghost" size="md" state="default" label="Reset" onCopy={handleCopy} />
            </div>
          </div>
        </div>
      </ShowcaseSection>


    </div>
  )
}

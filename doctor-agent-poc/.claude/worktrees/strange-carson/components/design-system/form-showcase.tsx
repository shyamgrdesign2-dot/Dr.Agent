"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Eye,
  EyeOff,
  ChevronDown,
  Search,
  Filter,
  X,
  Info,
  Globe,
  CreditCard,
  Lock,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Upload,
  Calendar,
} from "lucide-react"
import { ComponentBlock, ComponentCategory } from "@/components/design-system/design-system-section"

// ─── TYPES ───

type InputSize = "sm" | "md" | "lg"
type InputFeedback = "normal" | "error" | "warning" | "success"

// ─── CONSTANTS ───

const INPUT_BORDER_RADIUS = "10px"
const INPUT_BORDER_WIDTH = "1px"
const ICON_COLOR = "#A2A2A8"

const inputSizeMap: Record<InputSize, {
  height: number
  iconSize: number
  fontSize: number
  px: number
  label: string
}> = {
  sm: { height: 36, iconSize: 16, fontSize: 13, px: 10, label: "S — 36px" },
  md: { height: 42, iconSize: 18, fontSize: 14, px: 12, label: "M — 42px" },
  lg: { height: 48, iconSize: 20, fontSize: 14, px: 14, label: "L — 48px" },
}

// ─── HELPERS ───

function InfoHint({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group">
      <Info size={14} style={{ color: "#A2A2A8" }} className="cursor-help flex-shrink-0" />
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-tp-slate-900 px-2.5 py-1.5 text-[10px] leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}

function FormIcon({ children, size = "md" }: { children: React.ReactNode; size?: InputSize }) {
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center [&_svg]:shrink-0"
      style={{ color: ICON_COLOR }}
    >
      {children}
    </span>
  )
}

// ─── TOGGLE ───

function Toggle({ checked, onChange, size = "md", disabled = false }: {
  checked: boolean
  onChange: (v: boolean) => void
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}) {
  const dims = size === "sm" ? { w: 36, h: 20, dot: 14, t: 3 }
    : size === "lg" ? { w: 52, h: 28, dot: 22, t: 3 }
    : { w: 44, h: 24, dot: 18, t: 3 }

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className="relative inline-flex items-center flex-shrink-0 transition-colors duration-200"
      style={{
        width: `${dims.w}px`,
        height: `${dims.h}px`,
        borderRadius: `${dims.h}px`,
        backgroundColor: disabled ? "#E2E2EA" : checked ? "#4B4AD5" : "#D0D5DD",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        className="block rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: `${dims.dot}px`,
          height: `${dims.dot}px`,
          backgroundColor: "#FFFFFF",
          transform: `translateX(${checked ? dims.w - dims.dot - dims.t : dims.t}px)`,
          boxShadow: "0 1px 3px rgba(23,23,37,0.12)",
        }}
      />
    </button>
  )
}

// ─── CHECKBOX ───

function Checkbox({ checked, onChange, indeterminate, disabled, label, description }: {
  checked: boolean
  onChange: (v: boolean) => void
  indeterminate?: boolean
  disabled?: boolean
  label?: string
  description?: string
}) {
  const isActive = checked || indeterminate

  return (
    <label
      className="inline-flex items-start gap-2.5"
      style={{
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <button
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="flex-shrink-0 flex items-center justify-center transition-all duration-150"
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          backgroundColor: isActive ? "#4B4AD5" : "#FFFFFF",
          border: isActive ? "none" : "1.5px solid #D0D5DD",
          boxShadow: isActive
            ? "0 1px 2px rgba(75,74,213,0.2)"
            : "0 1px 2px rgba(23,23,37,0.05)",
          marginTop: "1px",
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {indeterminate && !checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6H9" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-tp-slate-700 leading-tight">{label}</span>}
          {description && <span className="text-xs text-tp-slate-400 mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  )
}

// ─── RADIO ───

function Radio({ checked, onChange, disabled, label, description }: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label?: string
  description?: string
}) {
  return (
    <label
      className="inline-flex items-start gap-2.5"
      style={{
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <button
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange()}
        className="flex-shrink-0 flex items-center justify-center transition-all duration-150"
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: checked ? "2px solid #4B4AD5" : "1.5px solid #D0D5DD",
          backgroundColor: "#FFFFFF",
          boxShadow: checked
            ? "0 1px 2px rgba(75,74,213,0.15)"
            : "0 1px 2px rgba(23,23,37,0.05)",
          marginTop: "1px",
        }}
      >
        {checked && (
          <span
            className="block rounded-full"
            style={{ width: "10px", height: "10px", backgroundColor: "#4B4AD5" }}
          />
        )}
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-tp-slate-700 leading-tight">{label}</span>}
          {description && <span className="text-xs text-tp-slate-400 mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  )
}

// ─── TEXT INPUT ───

function TextInput({
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  disabled,
  error,
  focused: forceFocused,
  label,
  hint,
  feedback = "normal",
  feedbackMessage,
  rightAccessory,
  labelInfo,
  supportInfo,
  size = "md",
  onBlur,
  onKeyDown,
}: {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  type?: string
  icon?: React.ReactNode
  disabled?: boolean
  error?: string
  focused?: boolean
  label?: string
  hint?: string
  feedback?: InputFeedback
  feedbackMessage?: string
  rightAccessory?: React.ReactNode
  labelInfo?: string
  supportInfo?: string
  size?: InputSize
  onBlur?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}) {
  const [focused, setFocused] = useState(false)
  const isFocused = forceFocused ?? focused
  const hasError = !!error || feedback === "error"
  const isFilled = !!value && value.length > 0 && !isFocused && !hasError && feedback === "normal"
  const s = inputSizeMap[size]

  const borderColor = hasError ? "#E11D48"
    : feedback === "warning" ? "#F59E0B"
    : feedback === "success" ? "#10B981"
    : isFocused ? "#4B4AD5"
    : isFilled ? "#A2A2A8"
    : "#E2E2EA"

  const ringColor = hasError ? "rgba(225,29,72,0.10)"
    : feedback === "warning" ? "rgba(245,158,11,0.10)"
    : feedback === "success" ? "rgba(16,185,129,0.10)"
    : "rgba(75,74,213,0.10)"

  const showRing = isFocused || (feedback !== "normal")
  const borderWidth = (isFocused || hasError || feedback !== "normal") ? "2px" : INPUT_BORDER_WIDTH

  const msg = error || feedbackMessage

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="font-sans inline-flex items-center gap-1.5"
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#717179",
            letterSpacing: "0.01em",
          }}
        >
          {label}
          {labelInfo && <InfoHint text={labelInfo} />}
        </label>
      )}
      <div
        className="flex items-center gap-2 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          paddingLeft: `${s.px}px`,
          paddingRight: `${s.px}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${borderWidth} solid ${borderColor}`,
          backgroundColor: disabled ? "#F1F1F5" : "#FFFFFF",
          opacity: disabled ? 0.5 : 1,
          boxShadow: showRing ? `0 0 0 3px ${ringColor}` : "0 1px 2px rgba(23,23,37,0.04)",
        }}
      >
        {icon && <FormIcon size={size}>{icon}</FormIcon>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.() }}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
        {rightAccessory && <span className="inline-flex items-center flex-shrink-0">{rightAccessory}</span>}
      </div>
      {msg && (
        <span className="text-xs inline-flex items-center gap-1.5" style={{ color: hasError ? "#E11D48" : feedback === "warning" ? "#D97706" : feedback === "success" ? "#059669" : "#717179" }}>
          {msg}
          {supportInfo && <InfoHint text={supportInfo} />}
        </span>
      )}
      {hint && !msg && (
        <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
          {hint}
          {supportInfo && <InfoHint text={supportInfo} />}
        </span>
      )}
    </div>
  )
}

// ─── PASSWORD INPUT WITH EYE TOGGLE ───

function PasswordInputWithToggle({
  label,
  placeholder = "Enter password",
  value,
  onChange,
  size = "md",
}: {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  size?: InputSize
}) {
  const [visible, setVisible] = useState(false)
  const s = inputSizeMap[size]

  return (
    <TextInput
      label={label}
      labelInfo="Use 8+ chars with upper, lower, number and symbol."
      supportInfo="Click the eye icon to mask/unmask password."
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={visible ? "text" : "password"}
      icon={<Lock size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />}
      size={size}
      rightAccessory={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="inline-flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
          style={{ color: "#A2A2A8" }}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible
            ? <EyeOff size={s.iconSize} style={{ color: "inherit" }} />
            : <Eye size={s.iconSize} style={{ color: "inherit" }} />
          }
        </button>
      }
    />
  )
}

// ─── MOBILE INPUT WITH COUNTRY CODE DROPDOWN + SEARCH ───

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
]

function formatIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

function MobileInputWithCountry({
  label,
  value,
  onChange,
  size = "md",
}: {
  label?: string
  value?: string
  onChange?: (v: string) => void
  size?: InputSize
}) {
  const [countryCode, setCountryCode] = useState("+91")
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [internalValue, setInternalValue] = useState(value ?? "")
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : COUNTRY_CODES

  const handleMobileChange = (raw: string) => {
    const formatted = countryCode === "+91" ? formatIndianMobile(raw) : raw.replace(/\D/g, "").slice(0, 15)
    setInternalValue(formatted)
    onChange?.(formatted)
  }

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Select country code and enter number." />
        </label>
      )}
      <div
        className="flex items-center gap-0 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center gap-1.5 pl-3 pr-2 flex-shrink-0">
          <FormIcon size={size}><Phone size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} /></FormIcon>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium text-tp-slate-700 hover:text-tp-slate-900 transition-colors"
            style={{ fontSize: `${s.fontSize}px` }}
            onClick={() => { setOpen((o) => !o); setSearch("") }}
          >
            {countryCode}
            <ChevronDown size={12} style={{ color: ICON_COLOR, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms", flexShrink: 0 }} />
          </button>
        </div>
        <span className="h-5 w-px bg-tp-slate-200 flex-shrink-0" />
        <input
          type="tel"
          placeholder={countryCode === "+91" ? "98765 43210" : "Enter number"}
          value={internalValue}
          onChange={(e) => handleMobileChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400 px-3"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-0 w-[220px] rounded-lg border border-tp-slate-200 bg-white py-1 shadow-xl max-h-64 flex flex-col" style={{ borderRadius: INPUT_BORDER_RADIUS }}>
          <div className="px-2 py-1.5 border-b border-tp-slate-100">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-tp-slate-50">
              <Search size={14} style={{ color: ICON_COLOR, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 bg-transparent outline-none text-xs text-tp-slate-900 placeholder:text-tp-slate-400"
                style={{ fontFamily: "var(--font-sans)" }}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-tp-slate-500 text-center">No countries found</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setCountryCode(c.code); setOpen(false); setSearch("") }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                    countryCode === c.code ? "bg-tp-blue-50 text-tp-blue-600 font-medium" : "text-tp-slate-700 hover:bg-tp-slate-50"
                  }`}
                >
                  <span className="text-sm">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-tp-slate-400">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        {countryCode === "+91" ? "Indian format: XXXXX XXXXX (10 digits)" : "Country code is required for international formatting."}
        <InfoHint text={`Example: ${countryCode} 98765 43210`} />
      </span>
    </div>
  )
}

// ─── CARD NUMBER INPUT ───

function CardNumberInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const s = inputSizeMap[size]
  const format = (raw: string) =>
    raw.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim()

  const digits = value.replace(/\s/g, "")
  const cardType = digits.startsWith("4") ? "Visa"
    : /^5[1-5]/.test(digits) ? "Mastercard"
    : /^3[47]/.test(digits) ? "Amex"
    : digits.length > 0 ? "Card" : ""

  return (
    <TextInput
      label={label}
      labelInfo="Card number accepts 16 digits."
      supportInfo="Auto-formats into 4-digit groups."
      placeholder="1234 5678 9012 3456"
      value={value}
      onChange={(v) => setValue(format(v))}
      type="text"
      icon={<CreditCard size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />}
      size={size}
      hint={cardType ? `Detected: ${cardType}` : "Only numeric values are accepted."}
      rightAccessory={cardType ? (
        <span className="text-[10px] font-semibold text-tp-blue-600 bg-tp-blue-50 px-1.5 py-0.5 rounded flex-shrink-0" style={{ borderRadius: "4px" }}>{cardType}</span>
      ) : undefined}
    />
  )
}

// ─── CURRENCY INPUT WITH SELECTOR ───

function CurrencyInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [open, setOpen] = useState(false)
  const currencies = ["INR", "USD", "GBP", "EUR", "AED"]
  const symbols: Record<string, string> = { INR: "\u20B9", USD: "$", GBP: "\u00A3", EUR: "\u20AC", AED: "AED" }
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Select currency and enter amount." />
        </label>
      )}
      <div
        className="flex items-center gap-0 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center gap-1.5 pl-3 pr-2 flex-shrink-0">
          <FormIcon size={size}><DollarSign size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} /></FormIcon>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium text-tp-slate-700 hover:text-tp-slate-900 transition-colors"
            style={{ fontSize: `${s.fontSize}px` }}
            onClick={() => setOpen((o) => !o)}
          >
            {currency}
            <ChevronDown size={12} style={{ color: ICON_COLOR, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms", flexShrink: 0 }} />
          </button>
        </div>
        <span className="h-5 w-px bg-tp-slate-200 flex-shrink-0" />
        <input
          type="text"
          inputMode="decimal"
          placeholder={`${symbols[currency] || ""} 0.00`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400 px-3"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-0 w-[140px] border border-tp-slate-200 bg-white py-1 shadow-xl" style={{ borderRadius: INPUT_BORDER_RADIUS }}>
          {currencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCurrency(c); setOpen(false) }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                currency === c ? "bg-tp-blue-50 text-tp-blue-600 font-medium" : "text-tp-slate-700 hover:bg-tp-slate-50"
              }`}
            >
              <span>{c}</span>
              <span className="text-xs text-tp-slate-400">{symbols[c]}</span>
            </button>
          ))}
        </div>
      )}
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Switch currency from dropdown.
        <InfoHint text="Supports INR, USD, GBP, EUR, AED." />
      </span>
    </div>
  )
}

// ─── ADDRESS INPUT ───

function AddressInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const s = inputSizeMap[size]

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Full postal address with pincode." />
        </label>
      )}
      <div
        className="flex items-start gap-2 py-2.5 transition-all duration-150"
        style={{
          minHeight: "80px",
          paddingLeft: `${s.px}px`,
          paddingRight: `${s.px}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
        }}
      >
        <span className="inline-flex flex-shrink-0 items-center justify-center mt-0.5" style={{ color: ICON_COLOR }}>
          <MapPin size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />
        </span>
        <textarea
          placeholder="Enter full address..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400 resize-none"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
      </div>
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Include street, city, state and pincode.
        <InfoHint text="Address auto-complete can be added later." />
      </span>
    </div>
  )
}

// ─── DURATION INPUT (HH:MM) ───

function DurationInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  const s = inputSizeMap[size]

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Duration in hours and minutes." />
        </label>
      )}
      <div
        className="flex items-center gap-0 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center pl-3 pr-2 flex-shrink-0">
          <FormIcon size={size}><Clock size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} /></FormIcon>
        </div>
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="HH"
          value={hours}
          onChange={(e) => setHours(e.target.value.replace(/\D/g, "").slice(0, 2))}
          className="w-10 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400 text-center"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
        <span className="font-semibold text-tp-slate-400" style={{ fontSize: `${s.fontSize}px` }}>:</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="MM"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value.replace(/\D/g, "").slice(0, 2))}
          className="w-10 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400 text-center"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
        <span className="text-xs text-tp-slate-400 pr-3 ml-auto">hrs</span>
      </div>
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Enter duration as HH:MM.
        <InfoHint text="Used for appointment slots, session durations." />
      </span>
    </div>
  )
}

// ─── PERCENTAGE INPUT (NEW) ───

function PercentageInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const [feedback, setFeedback] = useState<InputFeedback>("normal")
  const s = inputSizeMap[size]

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "")
    const parsed = parseFloat(cleaned)
    if (cleaned === "" || cleaned === ".") {
      setValue(cleaned)
      setFeedback("normal")
    } else if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      setValue(cleaned)
      setFeedback("normal")
    } else if (!isNaN(parsed) && parsed > 100) {
      setValue(cleaned)
      setFeedback("error")
    }
  }

  return (
    <TextInput
      label={label}
      labelInfo="Accepts values from 0 to 100."
      placeholder="0"
      value={value}
      onChange={handleChange}
      size={size}
      feedback={feedback}
      feedbackMessage={feedback === "error" ? "Value must be between 0 and 100" : "Enter a percentage value."}
      rightAccessory={
        <span className="font-semibold text-tp-slate-500 flex-shrink-0" style={{ fontSize: `${s.fontSize}px` }}>%</span>
      }
    />
  )
}

// ─── UNITS INPUT (NEW) ───

function UnitsInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const [unit, setUnit] = useState("mg")
  const [open, setOpen] = useState(false)
  const units = ["mg", "ml", "kg", "g", "cm", "mm", "L", "mcg"]
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Enter value and select unit from dropdown." />
        </label>
      )}
      <div
        className="flex items-center gap-0 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
          overflow: "hidden",
        }}
      >
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400 px-3"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
        <span className="h-5 w-px bg-tp-slate-200 flex-shrink-0" />
        <button
          type="button"
          className="flex items-center gap-1 px-3 flex-shrink-0 font-medium text-tp-slate-700 hover:text-tp-slate-900 transition-colors"
          style={{ fontSize: `${s.fontSize}px` }}
          onClick={() => setOpen((o) => !o)}
        >
          {unit}
          <ChevronDown size={12} style={{ color: ICON_COLOR, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms", flexShrink: 0 }} />
        </button>
      </div>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-0 w-[100px] border border-tp-slate-200 bg-white py-1 shadow-xl" style={{ borderRadius: INPUT_BORDER_RADIUS }}>
          {units.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => { setUnit(u); setOpen(false) }}
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                unit === u ? "bg-tp-blue-50 text-tp-blue-600 font-medium" : "text-tp-slate-700 hover:bg-tp-slate-50"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      )}
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Select measurement unit from dropdown.
        <InfoHint text="Common units: mg, ml, kg, g, cm, mm." />
      </span>
    </div>
  )
}

// ─── BASIC DATE INPUT (NEW) ───

function BasicDateInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const s = inputSizeMap[size]

  const formatDate = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  }

  return (
    <TextInput
      label={label}
      labelInfo="Date format: DD/MM/YYYY"
      placeholder="DD/MM/YYYY"
      value={value}
      onChange={(v) => setValue(formatDate(v))}
      icon={<Calendar size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />}
      size={size}
      hint="Auto-formats as you type."
    />
  )
}

// ─── BASIC TIME INPUT (NEW) ───

function BasicTimeInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const [period, setPeriod] = useState<"AM" | "PM">("AM")
  const s = inputSizeMap[size]

  const formatTime = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Time format: HH:MM AM/PM" />
        </label>
      )}
      <div
        className="flex items-center gap-0 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center pl-3 pr-2 flex-shrink-0">
          <FormIcon size={size}><Clock size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} /></FormIcon>
        </div>
        <input
          type="text"
          placeholder="HH:MM"
          value={value}
          onChange={(e) => setValue(formatTime(e.target.value))}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
        <button
          type="button"
          onClick={() => setPeriod((p) => p === "AM" ? "PM" : "AM")}
          className="flex-shrink-0 px-3 font-semibold text-tp-blue-600 hover:text-tp-blue-700 transition-colors"
          style={{ fontSize: `${s.fontSize}px` }}
        >
          {period}
        </button>
      </div>
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Click AM/PM to toggle period.
        <InfoHint text="Used for appointment scheduling." />
      </span>
    </div>
  )
}

// ─── MULTI-SELECTOR INPUT (chips/pills) (NEW) ───

function MultiSelectorInput({
  label,
  options,
  size = "md",
}: {
  label?: string
  options: string[]
  size?: InputSize
}) {
  const [selected, setSelected] = useState<string[]>([])
  const s = inputSizeMap[size]

  const toggleItem = (item: string) => {
    setSelected((prev) => prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item])
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Click chips to select/deselect. Use Select All or Clear." />
        </label>
      )}
      <div
        className="flex flex-col gap-2.5 p-3 border bg-white transition-all duration-150"
        style={{
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-tp-slate-500">{selected.length} of {options.length} selected</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-[10px] font-semibold text-tp-blue-600 hover:text-tp-blue-700 transition-colors"
              onClick={() => setSelected([...options])}
            >
              Select all
            </button>
            <span className="text-tp-slate-300">|</span>
            <button
              type="button"
              className="text-[10px] font-semibold text-tp-slate-500 hover:text-tp-slate-700 transition-colors"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleItem(opt)}
              className="transition-colors border"
              style={{
                padding: size === "sm" ? "4px 10px" : size === "lg" ? "8px 16px" : "6px 12px",
                borderRadius: "20px",
                fontSize: `${s.fontSize - 2}px`,
                fontWeight: 500,
                backgroundColor: selected.includes(opt) ? "#EEEEFF" : "#FFFFFF",
                color: selected.includes(opt) ? "#4B4AD5" : "#717179",
                borderColor: selected.includes(opt) ? "#C7C6F5" : "#E2E2EA",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MULTI-SELECT TAG INPUT ───

function MultiSelectTagInput({
  label,
  options,
  size = "md",
}: {
  label?: string
  options: string[]
  size?: InputSize
}) {
  const [selected, setSelected] = useState<string[]>(["Doctor"])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const available = options.filter((opt) => !selected.includes(opt))
  const filtered = search.trim()
    ? available.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    : available

  return (
    <div className="relative flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Select multiple values. Selected options appear as tags." />
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-2 bg-white px-3 py-2 text-left transition-all duration-150 hover:border-tp-slate-300"
        style={{
          minHeight: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
        }}
      >
        {selected.length === 0 && <span className="text-tp-slate-400" style={{ fontSize: `${s.fontSize}px` }}>Select specialties</span>}
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-md bg-tp-blue-50 px-2.5 py-1 text-xs font-medium text-tp-blue-600 border border-tp-blue-100"
          >
            {tag}
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                setSelected((prev) => prev.filter((v) => v !== tag))
              }}
              className="cursor-pointer text-tp-blue-400 hover:text-tp-blue-600 transition-colors inline-flex"
            >
              <X size={14} style={{ color: "currentColor" }} />
            </span>
          </span>
        ))}
        <span className="ml-auto inline-flex items-center flex-shrink-0">
          <ChevronDown size={14} style={{ color: ICON_COLOR, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms", flexShrink: 0 }} />
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-0 border border-tp-slate-200 bg-white shadow-xl flex flex-col" style={{ borderRadius: INPUT_BORDER_RADIUS, maxHeight: "220px" }}>
          <div className="px-2 py-1.5 border-b border-tp-slate-100 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-tp-slate-50">
              <Search size={12} style={{ color: ICON_COLOR, flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none text-xs text-tp-slate-700 placeholder:text-tp-slate-400"
                style={{ fontFamily: "var(--font-sans)" }}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-tp-slate-500 text-center">
                {available.length === 0 ? "All options selected" : `No results for "${search}"`}
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-tp-slate-700 hover:bg-tp-slate-50 transition-colors"
                  onClick={() => setSelected((prev) => [...prev, opt])}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Remove tags with close icon or add more from dropdown.
        <InfoHint text="Great for filters, recipients, categories, and member roles." />
      </span>
    </div>
  )
}

// ─── FILE UPLOAD INPUT ───

function FileUploadInput({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [fileName, setFileName] = useState("")
  const id = "tp-upload-input"
  const s = inputSizeMap[size]

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Supports files from local system." />
        </label>
      )}
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2.5 border border-dashed border-tp-slate-300 bg-white text-tp-slate-600 hover:border-tp-blue-300 hover:bg-tp-blue-50/30 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          paddingLeft: `${s.px}px`,
          paddingRight: `${s.px}px`,
          fontSize: `${s.fontSize}px`,
        }}
      >
        <FormIcon size={size}><Upload size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} /></FormIcon>
        <span className="inline-flex rounded-md bg-tp-blue-50 px-2.5 py-1 text-xs font-semibold text-tp-blue-600 border border-tp-blue-100">
          Upload
        </span>
        <span className="truncate text-tp-slate-500" style={{ fontSize: `${s.fontSize}px` }}>{fileName || "Choose file..."}</span>
      </label>
      <input
        id={id}
        type="file"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
      />
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Accepted formats can be validated in next phase.
        <InfoHint text="Examples: .pdf, .png, .jpg, .csv" />
      </span>
    </div>
  )
}

// ─── OTP / PIN INPUT (with auto-advance) ───

function PinInput4({ label }: { label?: string }) {
  const [pin, setPin] = useState(["", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, value: string) => {
    const d = value.replace(/\D/g, "").slice(-1)
    setPin((prev) => {
      const next = [...prev]
      next[idx] = d
      return next
    })
    if (d && idx < 3) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
    if (pasted.length > 0) {
      const newPin = [...pin]
      for (let i = 0; i < pasted.length; i++) {
        newPin[i] = pasted[i]
      }
      setPin(newPin)
      const nextFocus = Math.min(pasted.length, 3)
      inputRefs.current[nextFocus]?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="One-time 4 digit code entry. Auto-advances on input." />
        </label>
      )}
      <div className="flex items-center gap-3">
        {pin.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el }}
            value={digit}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={idx === 0 ? handlePaste : undefined}
            className="h-[48px] w-[48px] text-center text-lg font-semibold text-tp-slate-800 outline-none transition-all duration-150 focus:border-tp-blue-500 focus:ring-[3px] focus:ring-tp-blue-500/10"
            style={{
              fontFamily: "var(--font-sans)",
              borderRadius: INPUT_BORDER_RADIUS,
              border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Auto-advances on input. Supports paste.
        <InfoHint text="Used for OTP, quick verification, and lock screens." />
      </span>
    </div>
  )
}

// ─── FILTER INPUT BOX ───

function FilterInputBox({ label, size = "md" }: { label?: string; size?: InputSize }) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<string[]>(["Active"])
  const all = ["Active", "Pending", "Doctor", "Nurse", "High Priority"]
  const addable = all.filter((f) => !filters.includes(f))
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  return (
    <div className="relative flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Filter chips inside input for quick query building." />
        </label>
      )}
      <div
        className="flex flex-wrap items-center gap-2 bg-white px-3 py-2 transition-all duration-150"
        style={{
          minHeight: `${s.height}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          boxShadow: "0 1px 2px rgba(23,23,37,0.04)",
        }}
      >
        <FormIcon size={size}><Filter size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} /></FormIcon>
        {filters.map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 rounded-md bg-tp-slate-100 px-2.5 py-1 text-xs font-medium text-tp-slate-700 border border-tp-slate-200">
            {f}
            <span
              role="button"
              tabIndex={0}
              onClick={() => setFilters((prev) => prev.filter((v) => v !== f))}
              className="cursor-pointer text-tp-slate-400 hover:text-tp-slate-600 transition-colors inline-flex"
            >
              <X size={12} style={{ color: "currentColor" }} />
            </span>
          </span>
        ))}
        <button
          type="button"
          className="ml-auto text-xs font-semibold text-tp-blue-600 hover:text-tp-blue-700 transition-colors flex-shrink-0"
          onClick={() => setOpen((o) => !o)}
        >
          + Add filter
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-0 border border-tp-slate-200 bg-white py-1 shadow-xl max-h-48 overflow-y-auto" style={{ borderRadius: INPUT_BORDER_RADIUS }}>
          {addable.length === 0 ? (
            <div className="px-3 py-3 text-xs text-tp-slate-500 text-center">All filters applied</div>
          ) : (
            addable.map((f) => (
              <button key={f} type="button" className="w-full px-3 py-2 text-left text-sm text-tp-slate-700 hover:bg-tp-slate-50 transition-colors" onClick={() => { setFilters((prev) => [...prev, f]); setOpen(false) }}>
                {f}
              </button>
            ))
          )}
        </div>
      )}
      <span className="text-xs text-tp-slate-400 inline-flex items-center gap-1.5">
        Ideal for analytics and data-table filter bars.
        <InfoHint text="Can be connected to backend query params." />
      </span>
    </div>
  )
}

// ─── AUTOCOMPLETE (combobox — type to filter, select) ───

const AUTOCOMPLETE_OPTIONS = ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown", "Dr. Davis", "Dr. Miller", "Dr. Wilson"]

function AutocompleteInput({ label, placeholder = "Search or select...", size = "md" }: { label?: string; placeholder?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const filtered = value.trim()
    ? AUTOCOMPLETE_OPTIONS.filter(o => o.toLowerCase().includes(value.toLowerCase()))
    : AUTOCOMPLETE_OPTIONS

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      {label && (
        <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
          <InfoHint text="Type to filter, click to select." />
        </label>
      )}
      <div
        className="flex items-center gap-2 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          paddingLeft: `${s.px}px`,
          paddingRight: `${s.px}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${open ? "2px" : INPUT_BORDER_WIDTH} solid ${open ? "#4B4AD5" : "#E2E2EA"}`,
          backgroundColor: "#FFFFFF",
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : "0 1px 2px rgba(23,23,37,0.04)",
        }}
      >
        <FormIcon size={size}><Search size={s.iconSize} style={{ color: ICON_COLOR }} /></FormIcon>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
        <FormIcon size={size}>
          <ChevronDown size={s.iconSize} style={{ color: ICON_COLOR, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms", pointerEvents: "none", flexShrink: 0 }} />
        </FormIcon>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-0 border border-tp-slate-200 bg-white py-1 shadow-xl max-h-48 overflow-y-auto" style={{ borderRadius: INPUT_BORDER_RADIUS }}>
          {filtered.length ? filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-medium text-tp-slate-800 hover:bg-tp-slate-100 transition-colors"
              onClick={() => { setValue(opt); setOpen(false) }}
            >
              {opt}
            </button>
          )) : (
            <div className="px-3 py-3 text-sm text-tp-slate-500 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── SEARCH INPUT WITH RESULTS ───

const MOCK_SEARCH_RESULTS = ["Patient records", "Prescription history", "Lab results", "Appointment schedule", "Insurance claims"]

function SearchInputWithResults({ placeholder = "Search...", size = "md" }: { placeholder?: string; size?: InputSize }) {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const filtered = value.trim()
    ? MOCK_SEARCH_RESULTS.filter(r => r.toLowerCase().includes(value.toLowerCase()))
    : MOCK_SEARCH_RESULTS.slice(0, 3)
  const showDropdown = open && (value.length > 0 || filtered.length > 0)

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <div
        className="flex items-center gap-2 transition-all duration-150"
        style={{
          height: `${s.height}px`,
          paddingLeft: `${s.px}px`,
          paddingRight: `${s.px}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${open ? "2px" : INPUT_BORDER_WIDTH} solid ${open ? "#4B4AD5" : "#E2E2EA"}`,
          backgroundColor: "#FFFFFF",
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : "0 1px 2px rgba(23,23,37,0.04)",
        }}
      >
        <FormIcon size={size}><Search size={s.iconSize} style={{ color: ICON_COLOR }} /></FormIcon>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="flex-1 min-w-0 bg-transparent outline-none text-tp-slate-900 placeholder:text-tp-slate-400"
          style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}
        />
      </div>
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-0 border border-tp-slate-200 bg-white py-1 shadow-xl max-h-48 overflow-y-auto" style={{ borderRadius: INPUT_BORDER_RADIUS }}>
          {filtered.length ? (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full px-3 py-2 text-left text-sm font-medium text-tp-slate-800 hover:bg-tp-slate-100 transition-colors"
                onClick={() => { setValue(opt); setOpen(false) }}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-sm text-tp-slate-500 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── TEXTAREA ───

function TextareaInput({
  placeholder,
  value,
  onChange,
  label,
  hint,
  error,
  disabled,
  rows = 3,
  size = "md",
}: {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  rows?: number
  size?: InputSize
}) {
  const s = inputSizeMap[size]

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        rows={rows}
        className="w-full px-3 py-2.5 bg-white text-tp-slate-900 placeholder:text-tp-slate-400 outline-none resize-y transition-all duration-150 disabled:bg-tp-slate-100 disabled:opacity-50 focus:border-tp-blue-500 focus:ring-[3px] focus:ring-tp-blue-500/10"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: `${s.fontSize}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: error ? "2px solid #E11D48" : `${INPUT_BORDER_WIDTH} solid #E2E2EA`,
          boxShadow: error ? "0 0 0 3px rgba(225,29,72,0.10)" : undefined,
        }}
      />
      {error && <span className="text-xs text-tp-error-600">{error}</span>}
      {hint && !error && <span className="text-xs text-tp-slate-400">{hint}</span>}
    </div>
  )
}

// ─── CUSTOM SELECT (functional dropdown) ───

function CustomSelect({ label, options, disabled, size = "md" }: {
  label?: string
  options: string[]
  disabled?: boolean
  size?: InputSize
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(options[0] ?? "")
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const s = inputSizeMap[size]

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const filteredOptions = search.trim()
    ? options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    : options

  return (
    <div className="relative flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="font-sans" style={{ fontSize: "12px", fontWeight: 500, color: "#717179", letterSpacing: "0.01em" }}>
          {label}
        </label>
      )}
      <div
        className="relative flex items-center gap-2 cursor-pointer select-none transition-all duration-150"
        style={{
          height: `${s.height}px`,
          paddingLeft: `${s.px}px`,
          paddingRight: `${s.px}px`,
          borderRadius: INPUT_BORDER_RADIUS,
          border: `${open ? "2px" : INPUT_BORDER_WIDTH} solid ${open ? "#4B4AD5" : "#E2E2EA"}`,
          backgroundColor: disabled ? "#F1F1F5" : "#FFFFFF",
          opacity: disabled ? 0.5 : 1,
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : "0 1px 2px rgba(23,23,37,0.04)",
        }}
        onClick={() => !disabled && setOpen((o) => !o)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex-1 text-tp-slate-900 truncate" style={{ fontFamily: "var(--font-sans)", fontSize: `${s.fontSize}px` }}>{selected}</span>
        <FormIcon size={size}>
          <ChevronDown size={s.iconSize} style={{ color: ICON_COLOR, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms", pointerEvents: "none", flexShrink: 0 }} />
        </FormIcon>
      </div>
      {open && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-0 w-full min-w-0 border border-tp-slate-200 bg-white shadow-xl flex flex-col"
          style={{ borderRadius: INPUT_BORDER_RADIUS, maxHeight: "220px" }}
          role="listbox"
        >
          <div className="px-2 py-1.5 border-b border-tp-slate-100 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-tp-slate-50">
              <Search size={12} style={{ color: ICON_COLOR, flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => { e.stopPropagation(); setSearch(e.target.value) }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none text-xs text-tp-slate-700 placeholder:text-tp-slate-400"
                style={{ fontFamily: "var(--font-sans)" }}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-tp-slate-500 text-center">No results for &ldquo;{search}&rdquo;</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={selected === opt}
                  className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selected === opt ? "bg-tp-blue-50 text-tp-blue-600" : "text-tp-slate-800 hover:bg-tp-slate-100"
                  }`}
                  onClick={() => { setSelected(opt); setOpen(false) }}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UNIFIED INPUT STATE SECTION ───

type UnifiedInputType = "regular" | "email" | "password" | "website" | "mobile" | "search" | "select"

function UnifiedInputStateSection() {
  const [inputType, setInputType] = useState<UnifiedInputType>("email")
  const [size, setSize] = useState<InputSize>("md")
  const [state, setState] = useState<"default" | "focused" | "filled" | "disabled" | "viewOnly">("default")
  const [feedback, setFeedback] = useState<InputFeedback>("normal")
  const [emailValue, setEmailValue] = useState("")
  const [emailError, setEmailError] = useState("")
  const [mobileValue, setMobileValue] = useState("")

  const s = inputSizeMap[size]

  const iconMap: Record<string, React.ReactNode> = {
    regular: undefined,
    email: <Mail size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />,
    password: <Lock size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />,
    website: <Globe size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />,
    mobile: <Phone size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />,
    search: <Search size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />,
    select: undefined,
  }

  const placeholderMap: Record<string, string> = {
    regular: "Enter full name",
    email: "hussain@finesse.com",
    password: "Enter password",
    website: "https://",
    mobile: "+91 98765 43210",
    search: "Search...",
    select: "Select option...",
  }

  const filledMap: Record<string, string> = {
    regular: "Hussain Mohammed",
    email: "hussain@finesse.com",
    password: "SecureP@ss123",
    website: "https://tatvapractice.com",
    mobile: "98765 43210",
    search: "patient records",
    select: "Option A",
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleEmailBlur = () => {
    if (emailValue && !emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && emailValue && !emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email address")
    }
  }

  const feedbackMessage = feedback === "normal" ? "Helping text for user"
    : feedback === "error" ? "This field is required"
    : feedback === "warning" ? "Missing characters"
    : "Verified successfully"

  const renderPreview = () => {
    if (state === "viewOnly") {
      return (
        <div className="flex flex-col gap-1.5">
          <label className="font-sans inline-flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500, color: "#717179" }}>
            View-Only
            <InfoHint text="Non-editable display state." />
          </label>
          <div
            className="flex items-center gap-2"
            style={{
              height: `${s.height}px`,
              paddingLeft: `${s.px}px`,
              paddingRight: `${s.px}px`,
              borderRadius: INPUT_BORDER_RADIUS,
              backgroundColor: "#FAFAFB",
              border: "1px dashed #E2E2EA",
            }}
          >
            {iconMap[inputType] && <FormIcon size={size}>{iconMap[inputType]}</FormIcon>}
            <span className="text-tp-slate-600" style={{ fontSize: `${s.fontSize}px` }}>{filledMap[inputType]}</span>
          </div>
        </div>
      )
    }

    if (inputType === "select") {
      return (
        <CustomSelect
          label={state.charAt(0).toUpperCase() + state.slice(1)}
          options={["Select option...", "Option A", "Option B", "Option C"]}
          disabled={state === "disabled"}
          size={size}
        />
      )
    }

    if (inputType === "search") {
      if (state === "default" || state === "focused") {
        return (
          <div>
            <p className="text-[10px] font-semibold text-tp-slate-500 mb-2">With results dropdown (type to see)</p>
            <SearchInputWithResults placeholder="Search..." size={size} />
          </div>
        )
      }
      return (
        <TextInput
          placeholder="Search..."
          value={state === "filled" ? "patient records" : undefined}
          icon={<Search size={s.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />}
          disabled={state === "disabled"}
          size={size}
          feedback={feedback}
          feedbackMessage={feedback !== "normal" ? feedbackMessage : undefined}
        />
      )
    }

    if (inputType === "password") {
      return (
        <PasswordInputWithToggle
          label={state.charAt(0).toUpperCase() + state.slice(1)}
          value={state === "filled" ? filledMap.password : undefined}
          size={size}
        />
      )
    }

    if (inputType === "mobile") {
      return (
        <MobileInputWithCountry
          label={state.charAt(0).toUpperCase() + state.slice(1)}
          value={state === "filled" ? filledMap.mobile : mobileValue}
          onChange={setMobileValue}
          size={size}
        />
      )
    }

    if (inputType === "email") {
      return (
        <TextInput
          label={state.charAt(0).toUpperCase() + state.slice(1)}
          labelInfo="Email validation on blur and Enter key."
          placeholder={placeholderMap[inputType]}
          type="email"
          icon={iconMap[inputType]}
          focused={state === "focused"}
          value={state === "filled" ? filledMap[inputType] : emailValue}
          onChange={setEmailValue}
          disabled={state === "disabled"}
          size={size}
          feedback={emailError ? "error" : feedback}
          feedbackMessage={emailError || (feedback !== "normal" ? feedbackMessage : "We'll never share your email.")}
          supportInfo="Email format validation on blur and Enter."
          onBlur={handleEmailBlur}
          onKeyDown={handleEmailKeyDown}
        />
      )
    }

    return (
      <TextInput
        label={state.charAt(0).toUpperCase() + state.slice(1)}
        labelInfo="Field label guidance and validation context."
        placeholder={placeholderMap[inputType]}
        type={inputType === "website" ? "url" : "text"}
        icon={iconMap[inputType]}
        focused={state === "focused"}
        value={state === "filled" ? filledMap[inputType] : undefined}
        disabled={state === "disabled"}
        size={size}
        feedback={feedback}
        feedbackMessage={feedback !== "normal" ? feedbackMessage : undefined}
        supportInfo="Support text can provide examples, constraints or warnings."
      />
    )
  }

  return (
    <ComponentBlock
      id="form-unified-state"
      badge="Input"
      title="Input State Controller"
      description="Universal state controller: select type, size, interaction state, and feedback level. All combinations render in real-time below."
    >
      <div className="flex flex-col gap-6">
        {/* Type toggle */}
        <div>
          <p className="text-xs font-semibold text-tp-slate-600 mb-2">Type</p>
          <div className="inline-flex rounded-lg border border-tp-slate-200 p-0.5 bg-tp-slate-50 flex-wrap">
            {(["regular", "email", "password", "website", "mobile", "search", "select"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setInputType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  inputType === t ? "bg-white text-tp-slate-800 shadow-sm border border-tp-slate-200" : "text-tp-slate-500 hover:text-tp-slate-700"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Size toggle */}
        <div>
          <p className="text-xs font-semibold text-tp-slate-600 mb-2">Size</p>
          <div className="inline-flex rounded-lg border border-tp-slate-200 p-0.5 bg-tp-slate-50">
            {(["sm", "md", "lg"] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSize(sz)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  size === sz ? "bg-white text-tp-slate-800 shadow-sm border border-tp-slate-200" : "text-tp-slate-500 hover:text-tp-slate-700"
                }`}
              >
                {inputSizeMap[sz].label}
              </button>
            ))}
          </div>
        </div>

        {/* State toggle */}
        <div>
          <p className="text-xs font-semibold text-tp-slate-600 mb-2">State</p>
          <div className="inline-flex rounded-lg border border-tp-slate-200 p-0.5 bg-tp-slate-50 flex-wrap">
            {(["default", "focused", "filled", "disabled", "viewOnly"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setState(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  state === st ? "bg-white text-tp-slate-800 shadow-sm border border-tp-slate-200" : "text-tp-slate-500 hover:text-tp-slate-700"
                }`}
              >
                {st === "viewOnly" ? "View-Only" : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback toggle */}
        <div>
          <p className="text-xs font-semibold text-tp-slate-600 mb-2">Feedback</p>
          <div className="inline-flex rounded-lg border border-tp-slate-200 p-0.5 bg-tp-slate-50">
            {(["normal", "error", "warning", "success"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFeedback(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  feedback === f ? "bg-white text-tp-slate-800 shadow-sm border border-tp-slate-200" : "text-tp-slate-500 hover:text-tp-slate-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="max-w-md p-5 rounded-xl border border-tp-slate-100 bg-white/80">
          {renderPreview()}
        </div>
      </div>
    </ComponentBlock>
  )
}

// ─── CHECKBOX SECTION ───

function CheckboxSection() {
  const [c1, setC1] = useState(true)
  const [c2, setC2] = useState(false)
  return (
    <ComponentBlock
      id="form-checkbox"
      badge="Selection"
      title="Checkbox"
      description="Multi-select. 20x20px, 6px radius. Checked: TP Blue 500. Indeterminate: horizontal dash."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-8">
          <Checkbox checked={c1} onChange={setC1} label="Checked" description="This option is selected" />
          <Checkbox checked={c2} onChange={setC2} label="Unchecked" description="Click to select" />
          <Checkbox checked={false} onChange={() => {}} indeterminate label="Indeterminate" description="Partial selection" />
          <Checkbox checked={true} onChange={() => {}} disabled label="Disabled" description="Cannot change" />
        </div>
        <div className="p-3 border border-tp-slate-200 rounded-lg bg-tp-slate-50">
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">Checkbox Group</span>
          <div className="flex flex-col gap-3">
            <Checkbox checked={c1} onChange={setC1} label="Email notifications" />
            <Checkbox checked={c2} onChange={setC2} label="SMS notifications" />
            <Checkbox checked={false} onChange={() => {}} label="Push notifications" />
          </div>
        </div>
      </div>
    </ComponentBlock>
  )
}

// ─── TOGGLE SECTION ───

function ToggleSection() {
  const [t1, setT1] = useState(true)
  const [t2, setT2] = useState(false)
  const [t3, setT3] = useState(true)
  return (
    <ComponentBlock
      id="form-toggle"
      badge="Switch"
      title="Toggle / Switch"
      description="Binary on/off. S (36x20), M (44x24), L (52x28). Active: TP Blue 500. Inactive: TP Slate 300."
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-6">
          {(["sm", "md", "lg"] as const).map((sz) => (
            <div key={sz} className="flex flex-col items-center gap-2">
              <Toggle checked={t1} onChange={setT1} size={sz} />
              <span className="text-[10px] font-mono text-tp-slate-400">{sz.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Toggle checked={t1} onChange={setT1} />
            <span className="text-sm text-tp-slate-700">Active</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle checked={t2} onChange={setT2} />
            <span className="text-sm text-tp-slate-700">Inactive</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle checked={t3} onChange={setT3} disabled />
            <span className="text-sm text-tp-slate-400">Disabled</span>
          </div>
        </div>
      </div>
    </ComponentBlock>
  )
}

// ─── RADIO SECTION ───

function RadioSection() {
  const [selected, setSelected] = useState("option1")
  return (
    <ComponentBlock
      id="form-radio"
      badge="Selection"
      title="Radio Button"
      description="Single-select per group. 20x20px circle. Selected: 2px TP Blue border, 10px inner dot."
    >
      <div className="flex flex-col gap-3 max-w-md">
        <Radio checked={selected === "option1"} onChange={() => setSelected("option1")} label="Option 1" description="Default selection" />
        <Radio checked={selected === "option2"} onChange={() => setSelected("option2")} label="Option 2" description="Alternative choice" />
        <Radio checked={selected === "option3"} onChange={() => setSelected("option3")} label="Option 3" description="Another option" />
        <Radio checked={false} onChange={() => {}} disabled label="Option 4" description="Disabled state" />
      </div>
    </ComponentBlock>
  )
}

// ─── REAL-WORLD EXAMPLES ───

function RealWorldExamples() {
  const [gender, setGender] = useState("male")
  const [notifications, setNotifications] = useState(true)

  return (
    <ComponentBlock
      id="form-real-world"
      badge="Examples"
      title="Real-World Form Compositions"
      description="Composite forms showing how inputs work together in real scenarios. All at M size."
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Patient Registration */}
        <div className="p-5 rounded-xl border border-tp-slate-200 bg-white space-y-4">
          <h4 className="text-sm font-bold text-tp-slate-800 font-heading">Patient Registration</h4>
          <TextInput label="Full Name" placeholder="Enter full name" size="md" />
          <TextInput
            label="Email"
            placeholder="patient@email.com"
            icon={<Mail size={inputSizeMap.md.iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />}
            size="md"
          />
          <MobileInputWithCountry label="Mobile" size="md" />
          <BasicDateInput label="Date of Birth" size="md" />
          <div>
            <label className="font-sans block mb-2" style={{ fontSize: "12px", fontWeight: 500, color: "#717179" }}>Gender</label>
            <div className="flex gap-4">
              <Radio checked={gender === "male"} onChange={() => setGender("male")} label="Male" />
              <Radio checked={gender === "female"} onChange={() => setGender("female")} label="Female" />
              <Radio checked={gender === "other"} onChange={() => setGender("other")} label="Other" />
            </div>
          </div>
        </div>

        {/* Prescription Entry */}
        <div className="p-5 rounded-xl border border-tp-slate-200 bg-white space-y-4">
          <h4 className="text-sm font-bold text-tp-slate-800 font-heading">Prescription Entry</h4>
          <AutocompleteInput label="Medicine" placeholder="Search medicine..." size="md" />
          <UnitsInput label="Dosage" size="md" />
          <DurationInput label="Duration" size="md" />
          <CustomSelect label="Frequency" options={["Once daily", "Twice daily", "Three times", "As needed"]} size="md" />
          <TextareaInput label="Special Instructions" placeholder="Take after meals..." rows={2} size="md" />
        </div>

        {/* Search & Filter */}
        <div className="p-5 rounded-xl border border-tp-slate-200 bg-white space-y-4">
          <h4 className="text-sm font-bold text-tp-slate-800 font-heading">Search & Filter</h4>
          <SearchInputWithResults placeholder="Search patients..." size="md" />
          <FilterInputBox label="Active Filters" size="md" />
          <BasicDateInput label="From Date" size="md" />
          <BasicDateInput label="To Date" size="md" />
        </div>

        {/* Settings Panel */}
        <div className="p-5 rounded-xl border border-tp-slate-200 bg-white space-y-4">
          <h4 className="text-sm font-bold text-tp-slate-800 font-heading">Settings Panel</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-tp-slate-700">Email notifications</span>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-tp-slate-700">SMS alerts</span>
            <Toggle checked={false} onChange={() => {}} />
          </div>
          <CustomSelect label="Language" options={["English", "Hindi", "Tamil", "Telugu"]} size="md" />
          <CustomSelect label="Time Zone" options={["IST (UTC+5:30)", "EST (UTC-5)", "PST (UTC-8)", "GMT (UTC+0)"]} size="md" />
          <PercentageInput label="Opacity" size="md" />
        </div>
      </div>
    </ComponentBlock>
  )
}

// ─── MAIN FORM SHOWCASE ───

export function FormShowcase() {
  return (
    <ComponentCategory>
      {/* Hard Constraints */}
      <ComponentBlock
        id="form-constraints"
        badge="Specs"
        title="Form Controls Hard Constraints"
        description="Icon family: Iconsax (Linear) for inputs and CTAs. Placeholder: TP.text.placeholder (#A2A2A8). Focus: 2px TP Blue + 3px ring. Three sizes: S (36px), M (42px), L (48px)."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-sm">
          {[
            { label: "Sizes", value: "S 36 / M 42 / L 48" },
            { label: "Radius", value: "10px" },
            { label: "Label", value: "12px / 500" },
            { label: "Icons", value: "Iconsax, Linear" },
            { label: "Border", value: "1px default" },
            { label: "Focus", value: "2px + 3px ring" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 p-3 rounded-lg bg-white/80 border border-tp-slate-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-slate-500">{label}</span>
              <code className="text-xs font-mono font-medium text-tp-slate-800">{value}</code>
            </div>
          ))}
        </div>
      </ComponentBlock>

      {/* Size Anatomy */}
      <ComponentBlock
        id="form-size-anatomy"
        badge="Anatomy"
        title="Input Size Anatomy"
        description="Three sizes mirror the CTA pattern: S (36px), M (42px, default), L (48px). All share 10px radius, 1px border."
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-end gap-6 flex-wrap">
            {(["sm", "md", "lg"] as const).map((sz) => (
              <div key={sz} className="flex flex-col items-center gap-2 min-w-[200px]">
                <TextInput
                  placeholder="Placeholder text"
                  icon={<Mail size={inputSizeMap[sz].iconSize} style={{ color: ICON_COLOR, flexShrink: 0 }} />}
                  size={sz}
                  hint={`Height: ${inputSizeMap[sz].height}px`}
                />
                <span className="text-[10px] font-mono text-tp-slate-400">{inputSizeMap[sz].label}</span>
              </div>
            ))}
          </div>
        </div>
      </ComponentBlock>

      {/* Unified State Controller */}
      <UnifiedInputStateSection />

      {/* Text Input Types (anatomy) */}
      <ComponentBlock
        id="form-text-types"
        badge="Input"
        title="Text Input — Types"
        description="End-to-end input variants with Iconsax (Linear) icons. All at M size, 10px radius, 1px border."
      >
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          <TextInput
            label="Regular"
            labelInfo="No prefix icon required for plain text fields."
            supportInfo="Keep this minimal for generic data entry."
            placeholder="Enter full name"
          />
          <TextInput
            label="Email"
            labelInfo="Use this for communication identifiers."
            supportInfo="Email format validation can be shown here."
            placeholder="hussain@finesse.com"
            icon={<Mail size={18} style={{ color: ICON_COLOR, flexShrink: 0 }} />}
          />
          <PasswordInputWithToggle label="Password" />
          <TextInput
            label="Website"
            labelInfo="Use full URL including protocol."
            supportInfo="Example: https://tatvapractice.com"
            placeholder="https://"
            icon={<Globe size={inputSizeMap.md.iconSize} style={{ color: ICON_COLOR }} />}
          />
          <MobileInputWithCountry label="Mobile Number" />
          <CardNumberInput label="Card Number" />
          <CurrencyInput label="Currency" />
          <AddressInput label="Address" />
          <DurationInput label="Duration" />
          <PercentageInput label="Percentage" />
          <UnitsInput label="Units (Dosage)" />
          <BasicDateInput label="Date" />
          <BasicTimeInput label="Time" />
        </div>
      </ComponentBlock>

      {/* Textarea */}
      <ComponentBlock
        id="form-textarea"
        badge="Input"
        title="Textarea"
        description="Multi-line input. Same tokens as Text Input (10px radius, 1px border). Resizable vertically."
      >
        <div className="max-w-md space-y-4">
          <TextareaInput label="Notes" placeholder="Enter additional notes..." hint="Optional" />
          <TextareaInput label="With error" placeholder="Required field" error="This field is required" />
        </div>
      </ComponentBlock>

      {/* Select */}
      <ComponentBlock
        id="form-select"
        badge="Input"
        title="Select Input"
        description="Click to open dropdown. Iconsax ArrowDown2 (Linear) as chevron indicator. Dropdown sits tight against input (0px gap)."
      >
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
          <CustomSelect label="Select" options={["Select option...", "Option A", "Option B", "Option C"]} />
          <CustomSelect label="Disabled Select" options={["Select option..."]} disabled />
        </div>
      </ComponentBlock>

      {/* Autocomplete */}
      <ComponentBlock
        id="form-autocomplete"
        badge="Input"
        title="Autocomplete"
        description="Combobox: type to filter, click to select. Iconsax SearchNormal1 prefix + ArrowDown2 suffix."
      >
        <div className="max-w-md">
          <AutocompleteInput label="Select doctor" placeholder="Search or select..." />
        </div>
      </ComponentBlock>

      {/* Multi-Selector (chips) */}
      <ComponentBlock
        id="form-multi-selector"
        badge="Input"
        title="Multi-Selector (Chips)"
        description="Selectable chip pills with Select All / Clear actions. Click to toggle selection."
      >
        <div className="max-w-md">
          <MultiSelectorInput
            label="Specialties"
            options={["Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics", "ENT", "Ophthalmology"]}
          />
        </div>
      </ComponentBlock>

      {/* Advanced Input Patterns */}
      <ComponentBlock
        id="form-advanced-inputs"
        badge="Input"
        title="Advanced Input Patterns"
        description="Multi-select tags with CloseCircle remove, file upload with DocumentUpload icon, OTP with auto-advance, and filter chips with Filter icon."
      >
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          <MultiSelectTagInput
            label="Multi-select Tags"
            options={["Doctor", "Nurse", "Admin", "Reception", "Pharmacist"]}
          />
          <FileUploadInput label="Upload Document" />
          <PinInput4 label="4-digit OTP" />
          <FilterInputBox label="Filter Input" />
        </div>
      </ComponentBlock>

      {/* Selection Controls */}
      <CheckboxSection />
      <RadioSection />
      <ToggleSection />

      {/* Real-World Examples */}
      <RealWorldExamples />
    </ComponentCategory>
  )
}

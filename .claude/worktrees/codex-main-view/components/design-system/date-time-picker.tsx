"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Pencil, Clock, Keyboard } from "lucide-react"
import { ComponentBlock } from "@/components/design-system/design-system-section"

// ─── Design Tokens (TatvaPractice) ───
const TP = {
  blue: {
    50: "#EEEEFF",
    100: "#D8D8FA",
    500: "#4B4AD5",
  },
  slate: {
    100: "#F1F1F5",
    200: "#E2E2EA",
    400: "#A2A2A8",
    500: "#717179",
    600: "#545460",
    700: "#454551",
    800: "#2C2C35",
    900: "#171725",
  },
  error: "#E11D48",
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

// ─── Date Picker Modal (Material-style: Calendar + Text Input modes) ───
type DatePickerMode = "calendar" | "text"
type DatePickerType = "single" | "range"

export function DatePickerModal({
  open,
  onClose,
  onConfirm,
  value,
  valueRange,
  type = "single",
  title = "Select date",
  confirmText = "OK",
  cancelText = "Cancel",
}: {
  open: boolean
  onClose: () => void
  onConfirm: (value: string | [string, string]) => void
  value?: string
  valueRange?: [string, string]
  type?: DatePickerType
  title?: string
  confirmText?: string
  cancelText?: string
}) {
  const [mode, setMode] = useState<DatePickerMode>("calendar")
  const singleDate = value ? parseDDMMYYYY(value) : new Date()
  const [startDate, setStartDate] = useState<Date | null>(valueRange?.[0] ? parseDDMMYYYY(valueRange[0]) : null)
  const [endDate, setEndDate] = useState<Date | null>(valueRange?.[1] ? parseDDMMYYYY(valueRange[1]) : null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? parseDDMMYYYY(value) : null)
  const [viewMonth, setViewMonth] = useState(singleDate.getMonth())
  const [viewYear, setViewYear] = useState(singleDate.getFullYear())
  const [textInput, setTextInput] = useState(value ?? "")
  const [textInputStart, setTextInputStart] = useState(valueRange?.[0] ?? "")
  const [textInputEnd, setTextInputEnd] = useState(valueRange?.[1] ?? "")

  useEffect(() => {
    if (open) {
      setTextInput(value ?? "")
      setTextInputStart(valueRange?.[0] ?? "")
      setTextInputEnd(valueRange?.[1] ?? "")
    }
  }, [open, value, valueRange])

  const prevMode = useRef<DatePickerMode>("calendar")
  useEffect(() => {
    if (prevMode.current !== "text" && mode === "text") {
      if (type === "single" && selectedDate) setTextInput(formatDate(selectedDate))
      if (type === "range") {
        if (startDate) setTextInputStart(formatDate(startDate))
        if (endDate) setTextInputEnd(formatDate(endDate))
      }
    }
    prevMode.current = mode
  }, [mode, type, selectedDate, startDate, endDate])

  useEffect(() => {
    if (value) {
      const d = parseDDMMYYYY(value)
      setSelectedDate(d)
      setViewMonth(d.getMonth())
      setViewYear(d.getFullYear())
    }
  }, [value, open])

  useEffect(() => {
    if (valueRange) {
      setStartDate(valueRange[0] ? parseDDMMYYYY(valueRange[0]) : null)
      setEndDate(valueRange[1] ? parseDDMMYYYY(valueRange[1]) : null)
    }
  }, [valueRange, open])

  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`

  const headerText =
    type === "range"
      ? startDate && endDate
        ? `${formatDate(startDate)} – ${formatDate(endDate)}`
        : startDate
          ? formatDate(startDate) + " – ..."
          : "Select date range"
      : selectedDate
        ? formatDate(selectedDate)
        : "Select date"

  const isComplete =
    type === "single"
      ? mode === "text"
        ? (() => { const p = parseDDMMYYYY(textInput); return !isNaN(p.getTime()) })()
        : !!selectedDate
      : type === "range"
        ? mode === "text"
          ? (() => {
              const ps = parseDDMMYYYY(textInputStart)
              const pe = parseDDMMYYYY(textInputEnd)
              return !isNaN(ps.getTime()) && !isNaN(pe.getTime()) && ps <= pe
            })()
          : !!startDate && !!endDate && startDate <= endDate
        : false

  const handleConfirm = () => {
    if (type === "single") {
      const d = mode === "text" ? parseDDMMYYYY(textInput) : selectedDate
      if (d && !isNaN(d.getTime())) onConfirm(formatDate(d))
    } else if (type === "range") {
      const s = mode === "text" ? parseDDMMYYYY(textInputStart) : startDate
      const e = mode === "text" ? parseDDMMYYYY(textInputEnd) : endDate
      if (s && e && !isNaN(s.getTime()) && !isNaN(e.getTime()) && s <= e) onConfirm([formatDate(s), formatDate(e)])
    }
    onClose()
  }

  if (!open) return null

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-[328px] rounded-xl bg-white p-4 shadow-xl"
        style={{ boxShadow: "0 12px 24px -4px rgba(23,23,37,0.12), 0 4px 8px -4px rgba(23,23,37,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-tp-slate-800">{title}</h3>
          <button
            type="button"
            onClick={() => setMode(mode === "calendar" ? "text" : "calendar")}
            className="rounded-lg p-2 text-tp-slate-500 hover:bg-tp-slate-100 hover:text-tp-slate-700"
            title={mode === "calendar" ? "Switch to text input" : "Switch to calendar"}
          >
            {mode === "calendar" ? <Pencil size={18} /> : <Calendar size={18} />}
          </button>
        </div>

        {/* Selection display */}
        <div
          className="mb-4 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ backgroundColor: TP.blue[50], color: TP.blue[500] }}
        >
          {headerText}
        </div>

        {mode === "calendar" ? (
          <>
            {/* Month/Year nav */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11)
                    setViewYear((y) => y - 1)
                  } else setViewMonth((m) => m - 1)
                }}
                className="rounded p-1 text-tp-slate-500 hover:bg-tp-slate-100"
              >
                ‹
              </button>
              <span className="text-sm font-semibold text-tp-slate-800">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0)
                    setViewYear((y) => y + 1)
                  } else setViewMonth((m) => m + 1)
                }}
                className="rounded p-1 text-tp-slate-500 hover:bg-tp-slate-100"
              >
                ›
              </button>
            </div>

            {/* Calendar grid */}
            <div className="mb-4 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1 text-center text-[10px] font-semibold text-tp-slate-500">
                  {d}
                </div>
              ))}
              {cells.map((day, i) => {
                if (!day) return <div key={i} />
                const d = new Date(viewYear, viewMonth, day)
                const isSelected =
                  type === "single"
                    ? selectedDate?.getTime() === d.getTime()
                    : false
                const isInRange =
                  type === "range" && startDate && endDate
                    ? d >= startDate && d <= endDate
                    : false
                const isStart = type === "range" && startDate && d.getTime() === startDate.getTime()
                const isEnd = type === "range" && endDate && d.getTime() === endDate.getTime()

                const handleClick = () => {
                  if (type === "single") {
                    setSelectedDate(d)
                  } else {
                    if (!startDate || (startDate && endDate)) {
                      setStartDate(d)
                      setEndDate(null)
                    } else if (d >= startDate) {
                      setEndDate(d)
                    } else {
                      setStartDate(d)
                      setEndDate(null)
                    }
                  }
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={handleClick}
                    className={`h-8 rounded text-sm ${
                      day
                        ? "hover:bg-tp-blue-50 text-tp-slate-800"
                        : "invisible"
                    } ${isSelected || isStart || isEnd ? "!bg-tp-blue-500 !text-white" : ""} ${isInRange && !isStart && !isEnd ? "bg-tp-blue-100" : ""}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="mb-4 space-y-3">
            {type === "single" ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-tp-slate-600">Date (DD/MM/YYYY)</label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value)
                    const parsed = parseDDMMYYYY(e.target.value)
                    if (!isNaN(parsed.getTime())) setSelectedDate(parsed)
                  }}
                  className="w-full rounded-lg border border-tp-slate-200 px-3 py-2 text-sm outline-none focus:border-tp-blue-500 focus:ring-2 focus:ring-tp-blue-500/10"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-tp-slate-600">Start date</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={textInputStart}
                    onChange={(e) => {
                      setTextInputStart(e.target.value)
                      const parsed = parseDDMMYYYY(e.target.value)
                      if (!isNaN(parsed.getTime())) setStartDate(parsed)
                    }}
                    className="w-full rounded-lg border border-tp-slate-200 px-3 py-2 text-sm outline-none focus:border-tp-blue-500 focus:ring-2 focus:ring-tp-blue-500/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-tp-slate-600">End date</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={textInputEnd}
                    onChange={(e) => {
                      setTextInputEnd(e.target.value)
                      const parsed = parseDDMMYYYY(e.target.value)
                      if (!isNaN(parsed.getTime())) setEndDate(parsed)
                    }}
                    className="w-full rounded-lg border border-tp-slate-200 px-3 py-2 text-sm outline-none focus:border-tp-blue-500 focus:ring-2 focus:ring-tp-blue-500/10"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-tp-slate-200 px-3 py-2 text-sm font-semibold text-tp-slate-700 hover:bg-tp-slate-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isComplete}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{
              backgroundColor: isComplete ? TP.blue[500] : TP.slate[200],
              cursor: isComplete ? "pointer" : "not-allowed",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Time Picker Modal (Material-style: Clock + Keyboard modes) ───
type TimePickerMode = "clock" | "keyboard"

export function TimePickerModal({
  open,
  onClose,
  onConfirm,
  value,
  format24 = true,
  title = "Select time",
  confirmText = "OK",
  cancelText = "Cancel",
}: {
  open: boolean
  onClose: () => void
  onConfirm: (value: string) => void
  value?: string
  format24?: boolean
  title?: string
  confirmText?: string
  cancelText?: string
}) {
  const [mode, setMode] = useState<TimePickerMode>(format24 ? "keyboard" : "clock")
  const [hour, setHour] = useState(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number)
      return Number.isNaN(h) ? 0 : h % 24
    }
    return 0
  })
  const [minute, setMinute] = useState(() => {
    if (value) {
      const [, m] = value.split(":").map(Number)
      return Number.isNaN(m) ? 0 : Math.min(59, Math.max(0, m))
    }
    return 0
  })
  const [amPm, setAmPm] = useState<"AM" | "PM">(() => {
    if (value) {
      const [h] = value.split(":").map(Number)
      return (h ?? 0) < 12 ? "AM" : "PM"
    }
    return "AM"
  })

  useEffect(() => {
    if (value && open) {
      const [h, m] = value.split(":").map(Number)
      setHour(Number.isNaN(h) ? 0 : h % 24)
      setMinute(Number.isNaN(m) ? 0 : Math.min(59, Math.max(0, m)))
      setAmPm((h ?? 0) < 12 ? "AM" : "PM")
    }
  }, [value, open])

  const displayHour = format24 ? hour : (hour % 12 || 12)
  const displayMinute = String(minute).padStart(2, "0")

  const setHourFrom12h = (h12: number, ampm: "AM" | "PM") => {
    if (ampm === "AM") setHour(h12 === 12 ? 0 : h12)
    else setHour(h12 === 12 ? 12 : h12 + 12)
  }

  const handleConfirm = () => {
    let h = hour
    if (!format24) {
      h = amPm === "PM" ? ((hour % 12 || 12) === 12 ? 12 : (hour % 12) + 12) : (hour % 12 || 12) === 12 ? 0 : hour % 12
    }
    onConfirm(`${String(h).padStart(2, "0")}:${displayMinute}`)
    onClose()
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const clock12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const hourFor12h = hour % 12 || 12

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-[328px] rounded-xl bg-white p-4 shadow-xl"
        style={{ boxShadow: "0 12px 24px -4px rgba(23,23,37,0.12), 0 4px 8px -4px rgba(23,23,37,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-tp-slate-800">{title}</h3>
          <button
            type="button"
            onClick={() => setMode(mode === "clock" ? "keyboard" : "clock")}
            className="rounded-lg p-2 text-tp-slate-500 hover:bg-tp-slate-100 hover:text-tp-slate-700"
            title={mode === "clock" ? "Switch to keyboard input" : "Switch to clock"}
          >
            {mode === "clock" ? <Keyboard size={18} /> : <Clock size={18} />}
          </button>
        </div>

        {mode === "clock" ? (
          <>
            {format24 ? (
              <div className="mb-4 grid grid-cols-6 gap-1">
                {Array.from({ length: 24 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHour(i)}
                    className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                      hour === i ? "bg-tp-blue-500 text-white" : "bg-tp-slate-100 text-tp-slate-700 hover:bg-tp-slate-200"
                    }`}
                  >
                    {String(i).padStart(2, "0")}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative mx-auto mb-4 aspect-square w-52">
                <div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: TP.slate[200] }}
                />
                {clock12.map((n, i) => {
                  const angle = (i / 12) * 360 - 90
                  const radius = 42
                  const x = 50 + radius * Math.cos(toRad(angle))
                  const y = 50 + radius * Math.sin(toRad(angle))
                  const isSelected = hourFor12h === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setHourFrom12h(n, amPm)}
                      className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-semibold transition-colors"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        backgroundColor: isSelected ? TP.blue[500] : "transparent",
                        color: isSelected ? "white" : TP.slate[800],
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="flex flex-col items-center rounded-lg px-4 py-2"
                    style={{ backgroundColor: TP.blue[50] }}
                  >
                    <span className="text-[10px] font-medium text-tp-slate-500">Min</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={minute}
                      onChange={(e) => setMinute(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                      className="w-12 border-0 bg-transparent text-center text-lg font-semibold text-tp-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            )}
            {!format24 && (
              <div className="mb-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAmPm("AM")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${amPm === "AM" ? "bg-tp-blue-500 text-white" : "bg-tp-slate-100 text-tp-slate-600 hover:bg-tp-slate-200"}`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setAmPm("PM")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${amPm === "PM" ? "bg-tp-blue-500 text-white" : "bg-tp-slate-100 text-tp-slate-600 hover:bg-tp-slate-200"}`}
                >
                  PM
                </button>
              </div>
            )}
            {format24 && (
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-tp-slate-600">Minute</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => setMinute(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                  className="w-full rounded-lg border border-tp-slate-200 px-3 py-2 text-sm outline-none focus:border-tp-blue-500 focus:ring-2 focus:ring-tp-blue-500/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            )}
          </>
        ) : (
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-tp-slate-600">Hour</label>
                <input
                  type="number"
                  min={format24 ? 0 : 1}
                  max={format24 ? 23 : 12}
                  value={displayHour}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (format24) setHour(Math.min(23, Math.max(0, Number.isNaN(v) ? 0 : v)))
                    else setHourFrom12h(Math.min(12, Math.max(1, Number.isNaN(v) ? 1 : v)), amPm)
                  }}
                  className="w-full rounded-lg border border-tp-slate-200 px-3 py-2 text-sm outline-none focus:border-tp-blue-500 focus:ring-2 focus:ring-tp-blue-500/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-tp-slate-600">Minute</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => setMinute(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                  className="w-full rounded-lg border border-tp-slate-200 px-3 py-2 text-sm outline-none focus:border-tp-blue-500 focus:ring-2 focus:ring-tp-blue-500/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>
            {!format24 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAmPm("AM")
                    setHour(hour >= 12 ? hour - 12 : hour)
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${amPm === "AM" ? "bg-tp-blue-500 text-white" : "bg-tp-slate-100 text-tp-slate-600 hover:bg-tp-slate-200"}`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAmPm("PM")
                    setHour(hour < 12 ? hour + 12 : hour)
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${amPm === "PM" ? "bg-tp-blue-500 text-white" : "bg-tp-slate-100 text-tp-slate-600 hover:bg-tp-slate-200"}`}
                >
                  PM
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-tp-slate-200 px-3 py-2 text-sm font-semibold text-tp-slate-700 hover:bg-tp-slate-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: TP.blue[500] }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function parseDDMMYYYY(s: string): Date {
  const parts = s.trim().split(/[/\-.]/).map(Number)
  if (parts.length >= 3) {
    const [d, m, y] = parts
    if (d && m && y) return new Date(y, m - 1, d)
  }
  return new Date(NaN)
}

// ─── Date Input with Picker (Modal Input variant) ───
export function DateInputWithPicker({
  label,
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  disabled,
}: {
  label?: string
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="font-sans text-xs font-normal text-tp-slate-600" style={{ letterSpacing: "0.01em" }}>
          {label}
        </label>
      )}
      <div
        className="flex cursor-pointer items-center gap-2 px-3"
        style={{
          height: "42px",
          borderRadius: "8px",
          border: `1.5px solid ${open ? TP.blue[500] : TP.slate[200]}`,
          backgroundColor: disabled ? TP.slate[100] : "#FFFFFF",
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : "0 1px 2px rgba(23,23,37,0.04)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={() => !disabled && setOpen(true)}
        tabIndex={disabled ? -1 : 0}
      >
        <span className="text-tp-slate-400">
          <Calendar size={18} />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value ?? ""}
          readOnly
          className="flex-1 bg-transparent text-sm text-tp-slate-900 outline-none placeholder:text-tp-slate-400"
          style={{ fontFamily: "var(--font-sans)", cursor: "pointer" }}
        />
      </div>
      <DatePickerModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(v) => {
          if (typeof v === "string") onChange?.(v)
          setOpen(false)
        }}
        value={value}
        type="single"
      />
    </div>
  )
}

// ─── Date Range Input with Picker ───
export function DateRangeInputWithPicker({
  label,
  value,
  onChange,
  placeholder = "Start – End",
  disabled,
}: {
  label?: string
  value?: [string, string]
  onChange?: (v: [string, string]) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const display = value ? `${value[0]} – ${value[1]}` : ""

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans text-xs font-normal text-tp-slate-600" style={{ letterSpacing: "0.01em" }}>
          {label}
        </label>
      )}
      <div
        className="flex cursor-pointer items-center gap-2 px-3"
        style={{
          height: "42px",
          borderRadius: "8px",
          border: `1.5px solid ${open ? TP.blue[500] : TP.slate[200]}`,
          backgroundColor: disabled ? TP.slate[100] : "#FFFFFF",
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : "0 1px 2px rgba(23,23,37,0.04)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={() => !disabled && setOpen(true)}
      >
        <span className="text-tp-slate-400">
          <Calendar size={18} />
        </span>
        <span className="flex-1 text-sm text-tp-slate-900 placeholder:text-tp-slate-400" style={{ fontFamily: "var(--font-sans)" }}>
          {display || placeholder}
        </span>
      </div>
      <DatePickerModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(v) => {
          if (Array.isArray(v)) onChange?.(v)
          setOpen(false)
        }}
        valueRange={value}
        type="range"
        title="Select date range"
      />
    </div>
  )
}

// ─── Time Input with Picker ───
export function TimeInputWithPicker({
  label,
  value,
  onChange,
  placeholder = "HH:MM",
  disabled,
  format24 = true,
}: {
  label?: string
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  format24?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans text-xs font-normal text-tp-slate-600" style={{ letterSpacing: "0.01em" }}>
          {label}
        </label>
      )}
      <div
        className="flex cursor-pointer items-center gap-2 px-3"
        style={{
          height: "42px",
          borderRadius: "8px",
          border: `1.5px solid ${open ? TP.blue[500] : TP.slate[200]}`,
          backgroundColor: disabled ? TP.slate[100] : "#FFFFFF",
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : "0 1px 2px rgba(23,23,37,0.04)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={() => !disabled && setOpen(true)}
      >
        <span className="text-tp-slate-400">
          <Clock size={18} />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value ?? ""}
          readOnly
          className="flex-1 bg-transparent text-sm text-tp-slate-900 outline-none placeholder:text-tp-slate-400"
          style={{ fontFamily: "var(--font-sans)", cursor: "pointer" }}
        />
      </div>
      <TimePickerModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(v) => {
          onChange?.(v)
          setOpen(false)
        }}
        value={value}
        format24={format24}
      />
    </div>
  )
}

// ─── DateTime Input (combined) ───
export function DateTimeInputWithPicker({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  disabled,
  format24 = true,
}: {
  label?: string
  dateValue?: string
  timeValue?: string
  onDateChange?: (v: string) => void
  onTimeChange?: (v: string) => void
  disabled?: boolean
  format24?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans text-xs font-normal text-tp-slate-600" style={{ letterSpacing: "0.01em" }}>
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <DateInputWithPicker
            value={dateValue}
            onChange={onDateChange}
            placeholder="DD/MM/YYYY"
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <TimeInputWithPicker
            value={timeValue}
            onChange={onTimeChange}
            placeholder="HH:MM"
            disabled={disabled}
            format24={format24}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Showcase Component ───
export function DateTimePickerShowcase() {
  const [singleDate, setSingleDate] = useState("")
  const [dateRange, setDateRange] = useState<[string, string] | undefined>()
  const [timeValue, setTimeValue] = useState("")
  const [dateTime, setDateTime] = useState({ date: "", time: "" })

  return (
    <ComponentBlock
      id="date-time-picker"
      badge="Input"
      title="Date & Time Pickers"
      description="Material-style variants: Calendar/Text input modes for date, Clock/Keyboard modes for time. TatvaPractice themed."
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500">Single Date</h4>
          <DateInputWithPicker
            label="Select date"
            value={singleDate}
            onChange={setSingleDate}
            placeholder="DD/MM/YYYY"
          />
          {singleDate && <p className="text-xs text-tp-slate-500">Selected: {singleDate}</p>}
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500">Date Range</h4>
          <DateRangeInputWithPicker
            label="Select date range"
            value={dateRange}
            onChange={(v) => setDateRange(v)}
          />
          {dateRange && <p className="text-xs text-tp-slate-500">Selected: {dateRange[0]} – {dateRange[1]}</p>}
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500">Time (24h)</h4>
          <TimeInputWithPicker label="Select time" value={timeValue} onChange={setTimeValue} format24 />
          {timeValue && <p className="text-xs text-tp-slate-500">Selected: {timeValue}</p>}
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-tp-slate-500">Date + Time</h4>
          <DateTimeInputWithPicker
            label="Appointment"
            dateValue={dateTime.date}
            timeValue={dateTime.time}
            onDateChange={(v) => setDateTime((d) => ({ ...d, date: v }))}
            onTimeChange={(v) => setDateTime((d) => ({ ...d, time: v }))}
          />
          {(dateTime.date || dateTime.time) && (
            <p className="text-xs text-tp-slate-500">
              Selected: {dateTime.date || "—"} {dateTime.time || ""}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 rounded-lg border border-tp-slate-200 bg-tp-slate-50 p-4">
        <p className="text-xs font-semibold text-tp-slate-600">Material Android parity</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-tp-slate-600">
          <li>DatePicker: INPUT_MODE_CALENDAR + INPUT_MODE_TEXT toggle</li>
          <li>DatePicker: SingleDateSelector + RangeDateSelector</li>
          <li>TimePicker: INPUT_MODE_CLOCK + INPUT_MODE_KEYBOARD toggle</li>
          <li>TimePicker: 12h/24h format, AM/PM for 12h</li>
          <li>Confirm/Cancel actions, header selection display</li>
        </ul>
      </div>
    </ComponentBlock>
  )
}

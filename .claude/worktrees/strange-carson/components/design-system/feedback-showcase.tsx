"use client"

import { useState } from "react"
import { XCircle, Info, ChevronLeft, ChevronRight } from "lucide-react"

// ─── TOAST / SNACKBAR ───

const toastVariants = [
  {
    name: "Dark / Neutral",
    bg: "#171725",
    text: "#FFFFFF",
    closeColor: "#FFFFFF",
    dismissColor: "#FFFFFF",
  },
  {
    name: "Error",
    bg: "#E11D48",
    text: "#FFFFFF",
    closeColor: "#FFFFFF",
    dismissColor: "#FFFFFF",
  },
  {
    name: "Warning",
    bg: "#E8A230",
    text: "#FFFFFF",
    closeColor: "#FFFFFF",
    dismissColor: "#FFFFFF",
  },
  {
    name: "Success",
    bg: "#3CC08E",
    text: "#FFFFFF",
    closeColor: "#FFFFFF",
    dismissColor: "#FFFFFF",
  },
]

function ToastBar({
  variant,
  action,
}: {
  variant: (typeof toastVariants)[number]
  action: "close" | "dismiss"
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 w-full"
      style={{
        backgroundColor: variant.bg,
        borderRadius: "12px",
        color: variant.text,
      }}
    >
      <span className="inline-flex flex-shrink-0 items-center justify-center"><Info size={20} style={{ color: variant.text, opacity: 0.8 }} /></span>
      <span className="flex-1 text-sm font-medium">Assist text for the user</span>
      {action === "close" ? (
        <button
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          style={{ color: variant.closeColor }}
        >
          <span className="inline-flex flex-shrink-0"><XCircle size={20} style={{ color: "inherit" }} /></span>
        </button>
      ) : (
        <button
          className="flex-shrink-0 text-sm font-bold hover:opacity-70 transition-opacity"
          style={{ color: variant.dismissColor }}
        >
          Dismiss
        </button>
      )}
    </div>
  )
}

export function ToastShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Toast / Snackbar
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Full-width notification bars in 4 feedback states (Dark, Error, Warning, Success). Two
        action variants: close (X icon) and dismiss (text button). 12px radius.
      </p>

      <div className="flex flex-col gap-6">
        {/* Close (X) variant */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-3">
            Close (X) Action
          </span>
          <div className="flex flex-col gap-3 max-w-lg">
            {toastVariants.map((v) => (
              <ToastBar key={v.name + "-close"} variant={v} action="close" />
            ))}
          </div>
        </div>

        {/* Dismiss text variant */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tp-slate-600 block mb-3">
            Dismiss (Text) Action
          </span>
          <div className="flex flex-col gap-3 max-w-lg">
            {toastVariants.map((v) => (
              <ToastBar key={v.name + "-dismiss"} variant={v} action="dismiss" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DATE RANGE PICKER ───

const presets = ["Week", "2 Weeks", "Month", "3 Months", "6 Months", "Year", "Other"]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function CalendarMonth({
  year,
  month,
  startDate,
  endDate,
  onSelectDate,
}: {
  year: number
  month: number
  startDate: Date | null
  endDate: Date | null
  onSelectDate: (d: Date) => void
}) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false
    const current = new Date(year, month, day)
    return current > startDate && current < endDate
  }

  const isStart = (day: number) => {
    if (!startDate) return false
    return (
      startDate.getFullYear() === year &&
      startDate.getMonth() === month &&
      startDate.getDate() === day
    )
  }

  const isEnd = (day: number) => {
    if (!endDate) return false
    return (
      endDate.getFullYear() === year &&
      endDate.getMonth() === month &&
      endDate.getDate() === day
    )
  }

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-base font-bold text-tp-slate-900 mb-3 font-heading">
        {months[month]} {year}
      </h4>
      <div className="grid grid-cols-7 gap-0">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-tp-slate-400 py-1.5"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-9" />
          }

          const isStartDay = isStart(day)
          const isEndDay = isEnd(day)
          const inRange = isInRange(day)
          const isSelected = isStartDay || isEndDay

          return (
            <button
              key={day}
              onClick={() => onSelectDate(new Date(year, month, day))}
              className="h-9 flex items-center justify-center text-sm relative transition-colors"
              style={{
                backgroundColor: isSelected
                  ? "#3BAFDA"
                  : inRange
                    ? "#E8F4FD"
                    : "transparent",
                color: isSelected ? "#FFFFFF" : inRange ? "#0369A1" : "#454551",
                borderRadius: isStartDay
                  ? "50% 0 0 50%"
                  : isEndDay
                    ? "0 50% 50% 0"
                    : inRange
                      ? "0"
                      : "50%",
                fontWeight: isSelected ? 700 : 400,
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatDate(d: Date | null) {
  if (!d) return ""
  const day = d.getDate()
  const month = months[d.getMonth()].slice(0, 3)
  const year = d.getFullYear()
  return `${day} ${month}, ${year}`
}

export function DatePickerShowcase() {
  const [activePreset, setActivePreset] = useState("2 Weeks")
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 0, 21))
  const [endDate, setEndDate] = useState<Date | null>(new Date(2024, 1, 4))
  const [leftMonth, setLeftMonth] = useState(0) // January
  const [leftYear, setLeftYear] = useState(2024)

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear

  const goBack = () => {
    if (leftMonth === 0) {
      setLeftMonth(11)
      setLeftYear(leftYear - 1)
    } else {
      setLeftMonth(leftMonth - 1)
    }
  }

  const goForward = () => {
    if (leftMonth === 11) {
      setLeftMonth(0)
      setLeftYear(leftYear + 1)
    } else {
      setLeftMonth(leftMonth + 1)
    }
  }

  const handleSelectDate = (d: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(d)
      setEndDate(null)
    } else {
      if (d < startDate) {
        setEndDate(startDate)
        setStartDate(d)
      } else {
        setEndDate(d)
      }
    }
  }

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Date Range Picker
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Dual-month calendar with preset sidebar (Week, 2 Weeks, Month, etc.), range selection with
        highlighted range, date input fields, and Cancel/Set actions.
      </p>

      <div
        className="border border-tp-slate-200 bg-card overflow-hidden inline-flex"
        style={{
          borderRadius: "16px",
          boxShadow:
            "0 20px 40px -8px rgba(23,23,37,0.12), 0 8px 16px -6px rgba(23,23,37,0.06)",
        }}
      >
        {/* Preset Sidebar */}
        <div className="py-5 px-4 border-r border-tp-slate-100 flex flex-col gap-1" style={{ minWidth: "130px" }}>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setActivePreset(p)}
              className="text-left px-3 py-2 text-sm rounded-lg transition-colors font-medium"
              style={{
                backgroundColor: activePreset === p ? "#EEEEFF" : "transparent",
                color: activePreset === p ? "#4B4AD5" : "#717179",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Calendar Area */}
        <div className="p-5 flex flex-col">
          <div className="flex items-start gap-8">
            {/* Navigation arrows */}
            <div className="flex-1 min-w-0">
              <CalendarMonth
                year={leftYear}
                month={leftMonth}
                startDate={startDate}
                endDate={endDate}
                onSelectDate={handleSelectDate}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-tp-slate-900 font-heading">
                  {months[rightMonth]} {rightYear}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={goBack}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-tp-slate-400 hover:bg-tp-slate-100 transition-colors"
                  >
                    <span className="inline-flex flex-shrink-0"><ChevronLeft size={16} /></span>
                  </button>
                  <button
                    onClick={goForward}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-tp-slate-400 hover:bg-tp-slate-100 transition-colors"
                  >
                    <span className="inline-flex flex-shrink-0"><ChevronRight size={16} /></span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0">
                {weekDays.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-tp-slate-400 py-1.5"
                  >
                    {d}
                  </div>
                ))}
                {(() => {
                  const daysInMonth = getDaysInMonth(rightYear, rightMonth)
                  const firstDay = getFirstDayOfMonth(rightYear, rightMonth)
                  const cells: (number | null)[] = []
                  for (let i = 0; i < firstDay; i++) cells.push(null)
                  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

                  return cells.map((day, i) => {
                    if (day === null) return <div key={`empty-r-${i}`} className="h-9" />

                    const current = new Date(rightYear, rightMonth, day)
                    const isStartDay =
                      startDate &&
                      startDate.getFullYear() === rightYear &&
                      startDate.getMonth() === rightMonth &&
                      startDate.getDate() === day
                    const isEndDay =
                      endDate &&
                      endDate.getFullYear() === rightYear &&
                      endDate.getMonth() === rightMonth &&
                      endDate.getDate() === day
                    const inRange =
                      startDate && endDate && current > startDate && current < endDate
                    const isSelected = isStartDay || isEndDay

                    return (
                      <button
                        key={day}
                        onClick={() => handleSelectDate(new Date(rightYear, rightMonth, day))}
                        className="h-9 flex items-center justify-center text-sm relative transition-colors"
                        style={{
                          backgroundColor: isSelected
                            ? "#3BAFDA"
                            : inRange
                              ? "#E8F4FD"
                              : "transparent",
                          color: isSelected ? "#FFFFFF" : inRange ? "#0369A1" : "#454551",
                          borderRadius: isStartDay
                            ? "50% 0 0 50%"
                            : isEndDay
                              ? "0 50% 50% 0"
                              : inRange
                                ? "0"
                                : "50%",
                          fontWeight: isSelected ? 700 : 400,
                        }}
                      >
                        {day}
                      </button>
                    )
                  })
                })()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-tp-slate-100">
            <div
              className="flex-1 px-3 py-2 border border-tp-slate-200 rounded-lg text-sm text-tp-slate-700"
              style={{ minWidth: "130px" }}
            >
              {formatDate(startDate) || "Start date"}
            </div>
            <div
              className="flex-1 px-3 py-2 border border-tp-slate-200 rounded-lg text-sm text-tp-slate-700"
              style={{ minWidth: "130px" }}
            >
              {formatDate(endDate) || "End date"}
            </div>
            <button
              className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: "#F1F1F5", color: "#454551" }}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{
                backgroundColor: "#3BAFDA",
                color: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(59,175,218,0.25)",
              }}
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

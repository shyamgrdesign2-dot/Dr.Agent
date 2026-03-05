"use client"

import { useState, useRef, useEffect } from "react"
import {
  CheckCircle2,
  ChevronDown,
  User,
  Copy,
  Settings,
  Paintbrush,
  FileText,
  Layers,
  Trash2,
  Archive,
  Pencil,
  Upload,
  LayoutGrid,
  Home,
  BarChart2,
  Users,
  Calendar,
  Bell,
  BarChart,
  Star,
} from "lucide-react"

// ─── DROPDOWN MENU (with sections, keyboard shortcuts, dividers) ───

function DropdownMenu({
  items,
  open,
  title,
}: {
  items: {
    label: string
    icon?: React.ReactNode
    shortcut?: string
    checked?: boolean
    separator?: boolean
    danger?: boolean
    section?: string
  }[]
  open: boolean
  title?: string
}) {
  if (!open) return null
  return (
    <div
      className="border border-tp-slate-200 bg-card py-1.5 flex flex-col"
      style={{
        borderRadius: "12px",
        minWidth: "220px",
        boxShadow:
          "0 12px 24px -4px rgba(23,23,37,0.08), 0 4px 8px -4px rgba(23,23,37,0.04)",
      }}
    >
      {title && (
        <div className="px-3 py-1.5 mb-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-tp-slate-400">
            {title}
          </span>
        </div>
      )}
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-px bg-tp-slate-100 my-1.5 mx-2" />
        ) : item.section ? (
          <div key={i} className="px-3 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-tp-slate-400">
              {item.section}
            </span>
          </div>
        ) : (
          <button
            key={i}
            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-tp-slate-50 transition-colors text-left mx-1.5 rounded-md"
            style={{ color: item.danger ? "#E11D48" : "#454551" }}
          >
            {item.icon && (
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span className="flex-1 font-medium">{item.label}</span>
            {item.shortcut && (
              <span className="text-[11px] font-mono text-tp-slate-400 flex items-center gap-0.5">
                {item.shortcut}
              </span>
            )}
            {item.checked && <span className="inline-flex flex-shrink-0"><CheckCircle2 size={16} style={{ color: "#4B4AD5" }} /></span>}
          </button>
        ),
      )}
    </div>
  )
}

// ─── SEARCH DROPDOWN ───

function SearchDropdown({ variant }: { variant: "avatar" | "dot" | "simple" }) {
  const items = [
    { name: "Jane Foster", email: "@JaneFoster" },
    { name: "Tony Stark", email: "@TonyStark" },
    { name: "Steve Rogers", email: "@SteveRogers" },
    { name: "Bruce Banner", email: "@BruceBanner" },
    { name: "Natasha Romanoff", email: "@NatashaR" },
  ]

  return (
    <div className="flex flex-col" style={{ width: "260px" }}>
      <label
        className="mb-1.5 font-sans"
        style={{ fontSize: "12px", fontWeight: 400, color: "#717179" }}
      >
        {"Search member*"}
      </label>
      <div
        className="flex items-center gap-2 px-3 mb-1"
        style={{
          height: "42px",
          borderRadius: "8px",
          border: "2px solid #4B4AD5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 0 0 3px rgba(75,74,213,0.10)",
        }}
      >
        <span className="inline-flex flex-shrink-0"><User size={16} style={{ color: "#A2A2A8" }} /></span>
        <span className="text-sm text-tp-slate-900">Jane f</span>
        <span className="flex-1" />
        <span className="inline-flex flex-shrink-0"><ChevronDown size={16} style={{ color: "#A2A2A8" }} /></span>
      </div>
      <div
        className="border border-tp-slate-200 bg-card overflow-hidden"
        style={{
          borderRadius: "10px",
          boxShadow:
            "0 12px 24px -4px rgba(23,23,37,0.08), 0 4px 8px -4px rgba(23,23,37,0.04)",
        }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-tp-slate-50 transition-colors w-full text-left"
            style={{ backgroundColor: i === 4 ? "#EEEEFF" : undefined }}
          >
            {variant === "avatar" && (
              <span className="w-7 h-7 rounded-full bg-tp-slate-200 flex items-center justify-center flex-shrink-0">
                <span className="inline-flex flex-shrink-0"><User size={14} style={{ color: "#717179" }} /></span>
              </span>
            )}
            {variant === "dot" && (
              <span className="w-2 h-2 rounded-full bg-tp-blue-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-medium text-tp-slate-800 block">{item.name}</span>
              <span className="text-xs text-tp-slate-400">{item.email}</span>
            </div>
            {i === 4 && <span className="inline-flex flex-shrink-0"><CheckCircle2 size={16} style={{ color: "#4B4AD5" }} /></span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── SEGMENTED CONTROL (with sliding background + optional icons) ───

const segIconMap: Record<string, React.ElementType> = {
  "Own Letterhead": FileText,
  "Upload Letterhead": Layers,
  "Custom": Settings,
  "Daily": Calendar,
  "Weekly": Calendar,
  "Monthly": Calendar,
  "Light": LayoutGrid,
  "System": Settings,
  "Dark": LayoutGrid,
  "Grid": Layers,
  "List": FileText,
  "Board": LayoutGrid,
}

function SegmentedControl({
  items,
  activeIndex,
  showIcons = false,
}: {
  items: string[]
  activeIndex: number
  showIcons?: boolean
}) {
  const [active, setActive] = useState(activeIndex)
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const buttons = container.querySelectorAll("button")
    const btn = buttons[active]
    if (btn) {
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      })
    }
  }, [active])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex p-1"
      style={{ borderRadius: "10px", backgroundColor: "#F1F1F5" }}
    >
      <div
        className="absolute top-1 transition-all duration-200 ease-out"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          height: "calc(100% - 8px)",
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(23,23,37,0.08), 0 1px 2px -1px rgba(23,23,37,0.06)",
        }}
      />
      {items.map((item, i) => {
        const Icon = showIcons ? segIconMap[item] : undefined
        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="relative z-10 px-5 py-2 text-sm font-semibold transition-colors inline-flex items-center gap-1.5"
            style={{
              borderRadius: "8px",
              color: active === i ? "#171725" : "#717179",
            }}
          >
            {Icon && <span className="inline-flex flex-shrink-0"><Icon size={18} /></span>}
            {item}
          </button>
        )
      })}
    </div>
  )
}

// ─── UNDERLINE TABS WITH ICONS (animated indicator) ───

const tabIconMap: Record<string, React.ElementType> = {
  Prescription: FileText,
  "Header & Footer": Layers,
  "Page Format": BarChart,
  "Menu one": Home,
  "Menu two": BarChart2,
  "Menu three": Users,
  "Menu four": Calendar,
  Others: Star,
  Overview: Home,
  Patients: Users,
  Appointments: Calendar,
  Notifications: Bell,
  Reports: BarChart,
}

function UnderlineTabs({
  items,
  activeIndex,
}: {
  items: { label: string; badge?: number }[]
  activeIndex: number
}) {
  const [active, setActive] = useState(activeIndex)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = tabsRef.current
    if (!container) return
    const buttons = container.querySelectorAll("button")
    const btn = buttons[active]
    if (btn) {
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      })
    }
  }, [active])

  return (
    <div ref={tabsRef} className="relative flex border-b border-tp-slate-200">
      <div
        className="absolute bottom-0 h-[3px] bg-tp-blue-500 transition-all duration-200 ease-out"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          borderRadius: "3px 3px 0 0",
        }}
      />
      {items.map((item, i) => {
        const Icon = tabIconMap[item.label]
        const isActive = active === i
        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="relative px-4 py-3 text-sm font-medium transition-colors inline-flex items-center gap-1.5"
            style={{
              color: isActive ? "#4B4AD5" : "#717179",
              marginBottom: "-1px",
            }}
          >
            {Icon && <span className="inline-flex flex-shrink-0"><Icon size={18} style={{ color: isActive ? "#4B4AD5" : "#717179" }} /></span>}
            {item.label}
            {item.badge !== undefined && (
              <span
                className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                style={{
                  backgroundColor: active === i ? "#EEEEFF" : "#F1F1F5",
                  color: active === i ? "#4B4AD5" : "#717179",
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── PILL TABS WITH ICONS ───

function PillTabs({
  items,
  activeIndex,
}: {
  items: string[]
  activeIndex: number
}) {
  const [active, setActive] = useState(activeIndex)

  return (
    <div className="inline-flex gap-1">
      {items.map((item, i) => {
        const Icon = tabIconMap[item]
        const isActive = active === i
        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center gap-1.5"
            style={{
              borderRadius: "8px",
              backgroundColor: isActive ? "#EEEEFF" : "transparent",
              color: isActive ? "#4B4AD5" : "#717179",
            }}
          >
            {Icon && <span className="inline-flex flex-shrink-0"><Icon size={18} style={{ color: isActive ? "#4B4AD5" : "#717179" }} /></span>}
            {item}
          </button>
        )
      })}
    </div>
  )
}

// ─── MAIN EXPORTS ───

export function DropdownShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Dropdown / Context Menu
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Menu overlays with icons, keyboard shortcuts, sections, dividers, and danger items. Constraint: 12px radius for the container, 6px radius for individual items. Menu items have 1.5px inner padding on left/right (mx-1.5). Separators use TP Slate 100. Keyboard shortcuts use mono font at 11px. Danger items use TP Error 500 for both icon and label.
      </p>
      <div className="flex flex-wrap gap-8 items-start">
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">Basic Menu</span>
          <DropdownMenu
            open
            items={[
              {
                label: "Dashboard",
                icon: <LayoutGrid size={14} style={{ color: "#A2A2A8" }} />,
              },
              {
                label: "Patients",
                icon: <LayoutGrid size={14} style={{ color: "#A2A2A8" }} />,
              },
              {
                label: "Appointments",
                icon: <LayoutGrid size={14} style={{ color: "#A2A2A8" }} />,
              },
              {
                label: "Reports",
                icon: <LayoutGrid size={14} style={{ color: "#A2A2A8" }} />,
              },
            ]}
          />
        </div>

        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">Context Menu</span>
          <DropdownMenu
            open
            items={[
              {
                label: "Rename",
                icon: <Pencil size={14} style={{ color: "#717179" }} />,
                shortcut: "\u2318 R",
              },
              {
                label: "Copy Link",
                icon: <Copy size={14} style={{ color: "#717179" }} />,
                shortcut: "\u2318 C",
              },
              {
                label: "Color & icons",
                icon: <Paintbrush size={14} style={{ color: "#717179" }} />,
              },
              {
                label: "Space Settings",
                icon: <Settings size={14} style={{ color: "#717179" }} />,
              },
              {
                label: "Templates",
                icon: <FileText size={14} style={{ color: "#717179" }} />,
              },
              { separator: true, label: "" },
              {
                label: "Duplicate",
                icon: <Layers size={14} style={{ color: "#717179" }} />,
              },
              {
                label: "Archive",
                icon: <Archive size={14} style={{ color: "#717179" }} />,
                shortcut: "\u2318 A",
              },
              { separator: true, label: "" },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                danger: true,
                shortcut: "\u2318 \u232B",
              },
            ]}
          />
        </div>

        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">
            Grouped Sections
          </span>
          <DropdownMenu
            open
            items={[
              { section: "Navigation", label: "" },
              {
                label: "Overview",
                icon: <LayoutGrid size={14} style={{ color: "#A2A2A8" }} />,
              },
              {
                label: "Analytics",
                icon: <LayoutGrid size={14} style={{ color: "#A2A2A8" }} />,
              },
              { separator: true, label: "" },
              { section: "Actions", label: "" },
              {
                label: "Export as PDF",
                icon: <Upload size={14} style={{ color: "#717179" }} />,
                shortcut: "\u2318 E",
              },
              {
                label: "Share Link",
                icon: <Copy size={14} style={{ color: "#717179" }} />,
                shortcut: "\u2318 L",
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export function SearchDropdownShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Search Dropdown
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Combobox-style search dropdown with three result item variants: avatar (user photo/initial), dot (color indicator), and plain text. Constraint: Focused input uses TP Blue 500 border + 3px focus ring. Selected item gets TP Blue 50 background + check icon. Dropdown uses 10px radius, lighter shadow than context menus. Input and dropdown are separate layers (input can be used independently).
      </p>
      <div className="flex flex-wrap gap-8 items-start">
        <SearchDropdown variant="avatar" />
        <SearchDropdown variant="dot" />
        <SearchDropdown variant="simple" />
      </div>
    </div>
  )
}

export function SegmentedControlShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">
        Segmented Control
      </h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Pill-style toggle groups with animated sliding background indicator. Constraint: Active segment uses white card with shadow to "pop" off the gray track. Icons are optional and follow the same neutral icon color rules (active = TP Slate 900, inactive = TP Slate 500).
      </p>
      <div className="flex flex-col gap-6">
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">Text Only</span>
          <SegmentedControl items={["Daily", "Weekly", "Monthly"]} activeIndex={1} />
        </div>
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">With Icons</span>
          <SegmentedControl items={["Own Letterhead", "Upload Letterhead", "Custom"]} activeIndex={0} showIcons />
        </div>
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-2">Compact With Icons</span>
          <SegmentedControl items={["Grid", "List", "Board"]} activeIndex={0} showIcons />
        </div>
      </div>
    </div>
  )
}

export function TabsShowcase() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500 mb-1">Tabs</h3>
      <p className="text-xs text-tp-slate-400 mb-5">
        Underline and pill tab variants with icons, animated active indicator and optional badge counts. Constraint: Selected tab icons use dual-tone (filled) style for emphasis, while unselected tabs use linear (outline) style. This visual weight difference reinforces which tab is active.
      </p>
      <div className="flex flex-col gap-8">
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">
            Underline Tabs with Icons
          </span>
          <UnderlineTabs
            items={[
              { label: "Prescription" },
              { label: "Header & Footer" },
              { label: "Page Format" },
            ]}
            activeIndex={0}
          />
        </div>
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">
            Underline Tabs with Icons + Badges
          </span>
          <UnderlineTabs
            items={[
              { label: "Menu one", badge: 3 },
              { label: "Menu two", badge: 12 },
              { label: "Menu three", badge: 5 },
              { label: "Menu four" },
              { label: "Others" },
            ]}
            activeIndex={0}
          />
        </div>
        <div>
          <span className="text-xs font-semibold text-tp-slate-600 block mb-3">
            Pill Tabs with Icons
          </span>
          <PillTabs
            items={["Menu one", "Menu two", "Menu three", "Menu four", "Others"]}
            activeIndex={0}
          />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Command,
  User,
  FileText,
  Calendar,
  ChevronRight,
  Pencil,
  Copy,
  Trash2,
  Settings,
  Keyboard,
  Clock,
} from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ComponentBlock } from "@/components/design-system/design-system-section"

const TP = {
  blue: { 50: "#EEEEFF", 100: "#D8D8FA", 500: "#4B4AD5", 600: "#3C3BB5" },
  slate: { 100: "#F1F1F5", 200: "#E2E2EA", 400: "#A2A2A8", 500: "#717179", 600: "#545460", 800: "#2C2C35", 900: "#171725" },
  error: "#E11D48",
}

const CMD = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"

// ─── SaaS-style search bar (full-width, CTAs inside, ⌘K hint) ───
function SaasSearchBar() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div className="relative w-full max-w-2xl" ref={ref}>
      <div
        className="flex items-center gap-2 rounded-xl border-2 bg-white px-4 transition-all"
        style={{
          height: "48px",
          borderColor: open ? TP.blue[500] : TP.slate[200],
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : "0 1px 3px rgba(23,23,37,0.06)",
        }}
      >
        <Search size={18} className="text-tp-slate-400 shrink-0" />
        <input
          type="text"
          placeholder={`Search patients, appointments... (${CMD}K)`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-sm text-tp-slate-900 outline-none placeholder:text-tp-slate-400"
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-tp-blue-500 hover:bg-tp-blue-50 transition-colors"
          >
            <Plus size={14} />
            Quick Add
          </button>
          <button
            type="button"
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: TP.blue[500] }}
          >
            New Patient
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-tp-slate-500 hover:bg-tp-slate-100 hover:text-tp-slate-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="min-w-[200px] rounded-xl border-tp-slate-200"
              style={{ boxShadow: "0 12px 24px -4px rgba(23,23,37,0.12)" }}
            >
              <DropdownMenuItem>
                <Settings size={14} />
                Search settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Keyboard size={14} />
                Keyboard shortcuts
                <DropdownMenuShortcut>{CMD}K</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Clock size={14} />
                View recent searches
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {open && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-tp-slate-200 bg-white py-2 shadow-xl"
          style={{ boxShadow: "0 12px 24px -4px rgba(23,23,37,0.12), 0 4px 8px -4px rgba(23,23,37,0.06)" }}
        >
          <div className="px-3 py-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-tp-slate-400">Recent</span>
          </div>
          {[
            { label: "Jane Foster", meta: "Patient · Last visit 2d ago", shortcut: `${CMD}1` },
            { label: "Tony Stark", meta: "Patient · Appointment tomorrow", shortcut: `${CMD}2` },
          ].map((item, i) => (
            <button
              key={i}
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-tp-slate-50 transition-colors group"
            >
              <span className="w-8 h-8 rounded-full bg-tp-slate-200 flex items-center justify-center shrink-0">
                <User size={14} className="text-tp-slate-500" />
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-tp-slate-800">{item.label}</span>
                <span className="block text-xs text-tp-slate-500">{item.meta}</span>
              </div>
              <span className="text-[10px] font-mono text-tp-slate-400 tabular-nums opacity-0 group-hover:opacity-100">
                {item.shortcut}
              </span>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-tp-slate-400 hover:bg-tp-slate-200 hover:text-tp-slate-600 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal size={14} />
              </button>
            </button>
          ))}
          <div className="h-px bg-tp-slate-100 my-2 mx-3" />
          <div className="px-3 py-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-tp-slate-400">Quick Actions</span>
          </div>
          {[
            { label: "New prescription", shortcut: `${CMD}N` },
            { label: "Schedule appointment", shortcut: `${CMD}S` },
          ].map((item, i) => (
            <button
              key={i}
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-tp-slate-50 transition-colors"
            >
              <FileText size={16} className="text-tp-slate-500 shrink-0" />
              <span className="flex-1 text-sm font-medium text-tp-slate-800">{item.label}</span>
              <span className="text-[10px] font-mono text-tp-slate-400">{item.shortcut}</span>
            </button>
          ))}
          <div className="px-3 py-2 border-t border-tp-slate-100 mt-2">
            <p className="text-[10px] text-tp-slate-500">
              Press <kbd className="font-mono px-1 py-0.5 rounded bg-tp-slate-100">{CMD}K</kbd> to open command palette
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Command palette (⌘K modal) ───
function CommandPaletteDemo() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [])

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-xl border border-tp-slate-200 bg-white px-4 py-3 text-left hover:border-tp-blue-200 hover:bg-tp-blue-50/50 transition-colors w-full max-w-md"
      >
        <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-tp-slate-100">
          <Command size={20} className="text-tp-slate-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-tp-slate-800">Command Palette</p>
          <p className="text-xs text-tp-slate-500">Press {CMD}K to search actions, navigate, create</p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>Command Palette</DialogTitle>
          </DialogHeader>
          <CommandPrimitive
            className="flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-tp-slate-200 px-3" style={{ height: "48px" }}>
              <Search size={18} className="text-tp-slate-400 shrink-0" />
              <CommandPrimitive.Input
                placeholder="Type a command or search..."
                className="flex-1 h-10 bg-transparent text-sm outline-none placeholder:text-tp-slate-400"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-tp-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-tp-slate-500">
                {CMD}K
              </kbd>
            </div>
            <CommandPrimitive.List className="max-h-[320px] overflow-y-auto py-2">
              <CommandPrimitive.Group
                heading="Recent"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-tp-slate-400"
              >
                <CommandPrimitive.Item
                  value="jane foster"
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-tp-blue-50 outline-none rounded-none"
                >
                  <User size={16} className="text-tp-slate-500 shrink-0" />
                  <span className="flex-1 text-sm font-medium">Jane Foster</span>
                  <span className="text-[10px] font-mono text-tp-slate-400">{CMD}1</span>
                </CommandPrimitive.Item>
                <CommandPrimitive.Item
                  value="tony stark"
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-tp-blue-50 outline-none rounded-none"
                >
                  <User size={16} className="text-tp-slate-500 shrink-0" />
                  <span className="flex-1 text-sm font-medium">Tony Stark</span>
                  <span className="text-[10px] font-mono text-tp-slate-400">{CMD}2</span>
                </CommandPrimitive.Item>
              </CommandPrimitive.Group>
              <CommandPrimitive.Separator className="h-px bg-tp-slate-100 my-2" />
              <CommandPrimitive.Group
                heading="Actions"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-tp-slate-400"
              >
                <CommandPrimitive.Item
                  value="new patient"
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-tp-blue-50 outline-none rounded-none"
                >
                  <Plus size={16} className="text-tp-slate-500 shrink-0" />
                  <span className="flex-1 text-sm font-medium">New Patient</span>
                  <span className="text-[10px] font-mono text-tp-slate-400">{CMD}N</span>
                </CommandPrimitive.Item>
                <CommandPrimitive.Item
                  value="new prescription"
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-tp-blue-50 outline-none rounded-none"
                >
                  <FileText size={16} className="text-tp-slate-500 shrink-0" />
                  <span className="flex-1 text-sm font-medium">New Prescription</span>
                  <span className="text-[10px] font-mono text-tp-slate-400">{CMD}P</span>
                </CommandPrimitive.Item>
                <CommandPrimitive.Item
                  value="schedule appointment"
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-tp-blue-50 outline-none rounded-none"
                >
                  <Calendar size={16} className="text-tp-slate-500 shrink-0" />
                  <span className="flex-1 text-sm font-medium">Schedule Appointment</span>
                  <span className="text-[10px] font-mono text-tp-slate-400">{CMD}S</span>
                </CommandPrimitive.Item>
              </CommandPrimitive.Group>
              <CommandPrimitive.Separator className="h-px bg-tp-slate-100 my-2" />
              <CommandPrimitive.Group
                heading="Navigation"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-tp-slate-400"
              >
                <CommandPrimitive.Item
                  value="dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-tp-blue-50 outline-none rounded-none"
                >
                  <span className="flex-1 text-sm font-medium">Go to Dashboard</span>
                  <ChevronRight size={14} className="text-tp-slate-400" />
                </CommandPrimitive.Item>
                <CommandPrimitive.Item
                  value="patients"
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer data-[selected=true]:bg-tp-blue-50 outline-none rounded-none"
                >
                  <span className="flex-1 text-sm font-medium">Go to Patients</span>
                  <ChevronRight size={14} className="text-tp-slate-400" />
                </CommandPrimitive.Item>
              </CommandPrimitive.Group>
              <CommandPrimitive.Empty className="py-8 text-center text-sm text-tp-slate-500">
                No results found.
              </CommandPrimitive.Empty>
            </CommandPrimitive.List>
            <div className="flex items-center justify-between border-t border-tp-slate-100 px-3 py-2 text-[10px] text-tp-slate-500">
              <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
              <span><kbd className="font-mono">↵</kbd> Select</span>
              <span><kbd className="font-mono">Esc</kbd> Close</span>
            </div>
          </CommandPrimitive>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Context menu (right-click) with submenus and shortcuts ───
function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="rounded-xl border-2 border-dashed border-tp-slate-200 bg-tp-slate-50 p-8 text-center cursor-context-menu select-none"
        >
          <p className="text-sm font-semibold text-tp-slate-700">Right-click here</p>
          <p className="text-xs text-tp-slate-500 mt-1">Context menu with shortcuts and submenus</p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="min-w-[220px] rounded-xl border-tp-slate-200"
        style={{ boxShadow: "0 12px 24px -4px rgba(23,23,37,0.12)" }}
      >
        <ContextMenuItem>
          <Pencil size={14} />
          Rename
          <ContextMenuShortcut>{CMD}R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy size={14} />
          Copy Link
          <ContextMenuShortcut>{CMD}C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            Share
            <ChevronRight size={14} />
          </ContextMenuSubTrigger>
          <ContextMenuSubContent
            className="rounded-xl border-tp-slate-200"
            style={{ boxShadow: "0 12px 24px -4px rgba(23,23,37,0.12)" }}
          >
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
            <ContextMenuItem>Slack</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-tp-error-600 focus:text-tp-error-600 focus:bg-tp-error-50">
          <Trash2 size={14} />
          Delete
          <ContextMenuShortcut>{CMD}⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Search row with three-dots and CTA (for result items) ───
function SearchResultRow({
  primary,
  secondary,
  shortcut,
  selected,
  onSelect,
  onMenu,
}: {
  primary: string
  secondary?: string
  shortcut?: string
  selected?: boolean
  onSelect?: () => void
  onMenu?: (e: React.MouseEvent) => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group cursor-pointer ${
        selected ? "bg-tp-blue-50" : "hover:bg-tp-slate-50"
      }`}
    >
      <span className="w-8 h-8 rounded-full bg-tp-slate-200 flex items-center justify-center shrink-0">
        <User size={14} className="text-tp-slate-500" />
      </span>
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-tp-slate-800">{primary}</span>
        {secondary && <span className="block text-xs text-tp-slate-500">{secondary}</span>}
      </div>
      {shortcut && (
        <span className="text-[10px] font-mono text-tp-slate-400 tabular-nums opacity-0 group-hover:opacity-100">
          {shortcut}
        </span>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMenu?.(e) }}
        className="rounded p-1 text-tp-slate-400 hover:bg-tp-slate-200 hover:text-tp-slate-600 opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal size={14} />
      </button>
    </div>
  )
}

// ─── Compact search with inline CTA (single primary action) ───
function CompactSearchWithCta() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div className="flex items-center gap-2 w-full max-w-md" ref={ref}>
      <div
        className="flex flex-1 items-center gap-2 rounded-lg border px-3 transition-colors"
        style={{
          height: "42px",
          borderColor: open ? TP.blue[500] : TP.slate[200],
          boxShadow: open ? "0 0 0 3px rgba(75,74,213,0.10)" : undefined,
        }}
        onClick={() => setOpen(true)}
      >
        <Search size={18} className="text-tp-slate-400 shrink-0" />
        <span className="flex-1 text-sm text-tp-slate-500">Search...</span>
        <kbd className="text-[10px] font-mono text-tp-slate-400">{CMD}K</kbd>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
        style={{ height: "42px", backgroundColor: TP.blue[500] }}
      >
        New
      </button>
    </div>
  )
}

// ─── Main export ───
export function SearchCommandShowcase() {
  return (
    <>
      <ComponentBlock
        id="saas-search"
        badge="Search"
        title="SaaS-Style Search Bar"
        description="Full-width search with CTAs inside (Quick Add, New Patient), three-dots menu, and ⌘K hint. Dropdown shows Recent, Quick Actions, each row with shortcut and three-dots. Material Design inspired."
      >
        <div className="space-y-4">
          <SaasSearchBar />
          <p className="text-xs text-tp-slate-500">
            Click to focus: dropdown shows recent items + quick actions. Each row exposes shortcut on hover and three-dots for more. Press {CMD}K to open command palette.
          </p>
        </div>
      </ComponentBlock>

      <ComponentBlock
        id="command-palette"
        badge="Command"
        title="Command Palette"
        description="⌘K modal with grouped items (Recent, Actions, Navigation), keyboard shortcuts per item, and footer hints. Use for global search and command execution."
      >
        <CommandPaletteDemo />
      </ComponentBlock>

      <ComponentBlock
        id="context-menu"
        badge="Menu"
        title="Context Menu"
        description="Right-click menu with keyboard shortcuts, submenus (Share → Copy link, Email, Slack), and destructive item. Material-style dividers and item density."
      >
        <ContextMenuDemo />
      </ComponentBlock>

      <ComponentBlock
        id="search-row-variant"
        badge="Search"
        title="Search Result Row"
        description="Individual result row with avatar, label, shortcut hint, and three-dots for per-item actions. Reusable in search dropdowns and command results."
      >
        <div className="border border-tp-slate-200 rounded-xl p-2 w-full max-w-md">
          <SearchResultRow primary="Jane Foster" secondary="Patient · Last visit 2d ago" shortcut="⌘1" selected />
          <SearchResultRow primary="Tony Stark" secondary="Patient · Appointment tomorrow" shortcut="⌘2" />
        </div>
      </ComponentBlock>

      <ComponentBlock
        id="compact-search-cta"
        badge="Search"
        title="Compact Search + CTA"
        description="Smaller search bar with primary CTA (e.g. New) beside it. For dense toolbars and header layouts."
      >
        <CompactSearchWithCta />
      </ComponentBlock>
    </>
  )
}

"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { ChevronRight, ChevronLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPTransferList — TP-branded dual-list selector.
 * Two panels with checkboxes, move buttons, and search.
 */

export interface TPTransferItem {
  id: string
  label: string
}

interface TPTransferListProps {
  available: TPTransferItem[]
  selected: TPTransferItem[]
  onTransfer: (available: TPTransferItem[], selected: TPTransferItem[]) => void
  availableTitle?: string
  selectedTitle?: string
  className?: string
}

function ListPanel({
  title,
  items,
  checked,
  onToggle,
  onToggleAll,
  searchable,
}: {
  title: string
  items: TPTransferItem[]
  checked: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  searchable?: boolean
}) {
  const [search, setSearch] = useState("")
  const filtered = useMemo(
    () =>
      search
        ? items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
        : items,
    [items, search],
  )

  const allChecked = filtered.length > 0 && filtered.every((i) => checked.has(i.id))

  return (
    <div className="flex w-full flex-col rounded-xl border border-tp-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tp-slate-100 px-3 py-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={onToggleAll}
            className="h-4 w-4 rounded border-tp-slate-300 text-tp-blue-500 focus:ring-tp-blue-500/20"
          />
          <span className="text-xs font-semibold text-tp-slate-700">{title}</span>
        </label>
        <span className="text-xs text-tp-slate-400">
          {checked.size}/{items.length}
        </span>
      </div>

      {/* Search */}
      {searchable !== false && items.length > 5 && (
        <div className="border-b border-tp-slate-100 px-2 py-1.5">
          <div className="flex items-center gap-1.5 rounded-lg bg-tp-slate-50 px-2">
            <Search size={14} style={{ flexShrink: 0 }} className="text-tp-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-7 w-full bg-transparent text-xs text-tp-slate-900 outline-none placeholder:text-tp-slate-400"
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="max-h-52 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-xs text-tp-slate-400">No items</p>
        ) : (
          filtered.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-tp-slate-700 hover:bg-tp-slate-50"
            >
              <input
                type="checkbox"
                checked={checked.has(item.id)}
                onChange={() => onToggle(item.id)}
                className="h-4 w-4 rounded border-tp-slate-300 text-tp-blue-500 focus:ring-tp-blue-500/20"
              />
              <span className="truncate">{item.label}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

export function TPTransferList({
  available,
  selected,
  onTransfer,
  availableTitle = "Available",
  selectedTitle = "Selected",
  className,
}: TPTransferListProps) {
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set())
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set())

  const toggleLeft = (id: string) => {
    setLeftChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleRight = (id: string) => {
    setRightChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAllLeft = () => {
    if (available.every((i) => leftChecked.has(i.id))) {
      setLeftChecked(new Set())
    } else {
      setLeftChecked(new Set(available.map((i) => i.id)))
    }
  }

  const toggleAllRight = () => {
    if (selected.every((i) => rightChecked.has(i.id))) {
      setRightChecked(new Set())
    } else {
      setRightChecked(new Set(selected.map((i) => i.id)))
    }
  }

  const moveRight = () => {
    const toMove = available.filter((i) => leftChecked.has(i.id))
    const newAvailable = available.filter((i) => !leftChecked.has(i.id))
    const newSelected = [...selected, ...toMove]
    onTransfer(newAvailable, newSelected)
    setLeftChecked(new Set())
  }

  const moveLeft = () => {
    const toMove = selected.filter((i) => rightChecked.has(i.id))
    const newSelected = selected.filter((i) => !rightChecked.has(i.id))
    const newAvailable = [...available, ...toMove]
    onTransfer(newAvailable, newSelected)
    setRightChecked(new Set())
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ListPanel
        title={availableTitle}
        items={available}
        checked={leftChecked}
        onToggle={toggleLeft}
        onToggleAll={toggleAllLeft}
      />

      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={moveRight}
          disabled={leftChecked.size === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-tp-slate-200 bg-white text-tp-slate-500 hover:bg-tp-blue-50 hover:text-tp-blue-600 disabled:opacity-40 transition-colors"
          aria-label="Move right"
        >
          <ChevronRight size={16} style={{ flexShrink: 0 }} />
        </button>
        <button
          type="button"
          onClick={moveLeft}
          disabled={rightChecked.size === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-tp-slate-200 bg-white text-tp-slate-500 hover:bg-tp-blue-50 hover:text-tp-blue-600 disabled:opacity-40 transition-colors"
          aria-label="Move left"
        >
          <ChevronLeft size={16} style={{ flexShrink: 0 }} />
        </button>
      </div>

      <ListPanel
        title={selectedTitle}
        items={selected}
        checked={rightChecked}
        onToggle={toggleRight}
        onToggleAll={toggleAllRight}
      />
    </div>
  )
}

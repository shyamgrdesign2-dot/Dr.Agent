"use client"

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Calendar2, Notepad2, Trash } from "iconsax-reactjs"
import {
  ChevronDown,
  GripVertical,
  Plus,
  Search,
} from "lucide-react"

import {
  diagnosisSuggestions,
  examinationSuggestions,
  medicationSuggestions,
  symptomSuggestions,
} from "../sample-data"
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context"
import { AiTriggerChip } from "@/components/tp-rxpad/dr-agent/shared/AiTriggerChip"
import { PER_PATIENT_RXPAD_DATA, checkDrugInteraction, checkTableInteractions } from "./per-patient-rxpad-data"
import {
  TPMedicalIcon,
  TPRxPadSearchInput,
  TPRxPadSection,
  TPSnackbar,
  TPTooltip,
} from "@/components/tp-ui"

type TableRow = {
  id: string
  [key: string]: string
}

type ColumnConfig = {
  key: string
  label: string
  width: number
  minWidth?: number
  maxWidth?: number
  placeholder?: string
  multiline?: boolean
  maxLines?: 1 | 2 | 3
  editable?: boolean
  restrictToOptions?: boolean
  showDropdownToggle?: boolean
  getOptions?: (query: string, row: TableRow) => string[]
}

type TableModuleConfig = {
  id: string
  title: string
  icon: React.ReactNode
  columns: ColumnConfig[]
  primaryKey: string
  rows: TableRow[]
  onChangeRows: (rows: TableRow[]) => void
  searchPlaceholder: string
  cannedChips: string[]
  searchSuggestions?: string[]
  onRowAdded?: (text: string) => void
  onSaveClick?: () => void
  onTemplateClick?: () => void
  onClearClick?: () => void
  /** Optional content rendered right-aligned after the search input area */
  afterSearch?: React.ReactNode
  /** Optional tag renderer for search dropdown options (e.g. "AI Suggested") */
  getOptionTag?: (option: string) => React.ReactNode
  /** data-rxpad-module attribute for scroll targeting */
  moduleDataAttr?: string
  /** Set of row IDs to highlight (e.g. drug interaction warnings) */
  highlightedRowIds?: Set<string>
  /** Tooltip text for highlighted rows, keyed by row ID */
  highlightedRowTooltips?: Record<string, string>
}

type ActiveMenu = {
  mode: "cell" | "search"
  rowId?: string
  colKey?: string
  query: string
  highlightedIndex: number
  anchorRect: DOMRect
}

function getRowId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function rowHasValues(row: TableRow) {
  return Object.entries(row).some(([key, value]) => key !== "id" && value.trim().length > 0)
}

function getColumnMinWidth(column: ColumnConfig) {
  return column.minWidth ?? column.width
}

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  if (!node) return null
  let current: HTMLElement | null = node.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    const scrollable = /(auto|scroll)/.test(style.overflowY)
    if (scrollable && current.scrollHeight > current.clientHeight) {
      return current
    }
    current = current.parentElement
  }
  return null
}

function snapFieldToViewportTop(element: HTMLElement, offset = 96) {
  if (typeof window === "undefined") return
  const scrollParent = getScrollParent(element)
  if (scrollParent) {
    const parentRect = scrollParent.getBoundingClientRect()
    const fieldRect = element.getBoundingClientRect()
    const delta = fieldRect.top - parentRect.top - offset
    scrollParent.scrollTo({
      top: Math.max(0, scrollParent.scrollTop + delta),
      behavior: "smooth",
    })
    return
  }
  const targetTop = window.scrollY + element.getBoundingClientRect().top - offset
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" })
}

function firstPositiveInteger(value: string) {
  const match = value.match(/\d+/)
  if (!match) return 1
  const parsed = Number.parseInt(match[0], 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function pluralize(base: string, count: number) {
  return `${count} ${base}${count > 1 ? "s" : ""}`
}

function getSinceOptions(query: string) {
  const n = firstPositiveInteger(query)
  return [
    pluralize("hour", n),
    pluralize("day", n),
    pluralize("month", n),
    pluralize("year", n),
  ]
}

function getMedicationUnitOptions(query: string) {
  const n = firstPositiveInteger(query)
  return [
    pluralize("tablet", n),
    pluralize("unit", n),
    pluralize("capsule", n),
  ]
}

function getFrequencyOptions(query: string) {
  const n = firstPositiveInteger(query)
  const options = [
    `${n}-0-${n}`,
    `${n}-0-0-${n}`,
    `${n}-${n}-${n}`,
    `${n}-0-${Math.max(1, n - 1)}`,
    `${n}-1-${n}`,
    "1-0-1",
    "1-0-0-1",
    "0-1-0",
    "SOS",
  ]
  return Array.from(new Set(options))
}

const MEDICATION_WHEN_OPTIONS = [
  "Before Breakfast",
  "After Breakfast",
  "Before Lunch",
  "After Lunch",
  "Before Dinner",
  "After Dinner",
  "Before Food",
  "After Food",
  "With Food",
]

const ADVICE_SUGGESTIONS = [
  "Stay hydrated daily",
  "Take steam inhalation",
  "Avoid oily foods",
  "Complete medication course",
  "Monitor blood pressure",
  "Regular morning walk",
  "Salt restricted diet",
  "Follow sleep hygiene",
]

const LAB_INVESTIGATION_BASE_OPTIONS = [
  "Complete Blood Count",
  "Liver Function Test",
  "Renal Function Test",
  "Lipid Profile",
  "Thyroid Profile",
  "HbA1c",
  "Fasting Blood Sugar",
  "Urine Routine",
  "Chest X-Ray",
  "ECG",
]

const SURGERY_SUGGESTIONS = [
  "Thoracic Relief Procedure",
  "Pulmonary Enhancement Surgery",
  "Abdominal Reconstruction Surgery",
  "Urological Restoration Procedure",
  "Articular Repair Surgery",
  "Laparoscopic Appendectomy",
  "Sinus Endoscopy",
  "Tonsillectomy",
]

function getDurationOptions(query: string) {
  const n = firstPositiveInteger(query)
  const options = [
    "Stat",
    "To Be Continued",
    "Only If Required",
    pluralize("day", n),
    pluralize("week", n),
    pluralize("month", n),
    pluralize("year", n),
  ]
  return Array.from(new Set(options))
}

function getSeedQuery(query: string, fallback: string) {
  const next = query.trim()
  if (next.length > 0) return next
  return fallback
}

function filterByQuery(options: string[], query: string) {
  const needle = normalizeText(query)
  if (!needle) return options
  const filtered = options.filter((option) => normalizeText(option).includes(needle))
  return filtered.length > 0 ? filtered : options
}

const CUSTOM_OPTION_PREFIX = "__custom__:"

function toCustomOption(value: string) {
  return `${CUSTOM_OPTION_PREFIX}${value.trim()}`
}

function isCustomOption(value: string) {
  return value.startsWith(CUSTOM_OPTION_PREFIX)
}

function getOptionValue(value: string) {
  return isCustomOption(value) ? value.slice(CUSTOM_OPTION_PREFIX.length) : value
}

function getOptionLabel(value: string) {
  return isCustomOption(value) ? `Add custom: ${getOptionValue(value)}` : value
}

function withCustomOption(options: string[], query: string) {
  const trimmed = query.trim()
  if (!trimmed) return options
  const customOption = toCustomOption(trimmed)
  const hasCustomAlready = options.some(
    (option) =>
      isCustomOption(option) &&
      normalizeText(getOptionValue(option)) === normalizeText(trimmed),
  )
  if (hasCustomAlready) return options
  return [...options, customOption]
}

function getCatalogOptions(catalog: string[], query: string, limit = 10) {
  const needle = normalizeText(query)
  const filtered = needle
    ? catalog.filter((option) => normalizeText(option).includes(needle))
    : catalog
  return withCustomOption(filtered.slice(0, limit), query)
}

function moveSelectedOptionToTop(options: string[], selectedValue: string) {
  const selected = normalizeText(selectedValue)
  if (!selected) return options
  const selectedIndex = options.findIndex(
    (option) => !isCustomOption(option) && normalizeText(getOptionValue(option)) === selected,
  )
  if (selectedIndex <= 0) return options
  const next = [...options]
  const [picked] = next.splice(selectedIndex, 1)
  next.unshift(picked)
  return next
}

function useTabletMode() {
  const [tabletMode, setTabletMode] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const widthQuery = window.matchMedia("(max-width: 1180px)")
    const touchQuery = window.matchMedia("(hover: none), (pointer: coarse)")

    const update = () => {
      const isTabletWidth = window.innerWidth <= 1180
      const touchLike = touchQuery.matches || window.navigator.maxTouchPoints > 0
      setTabletMode(isTabletWidth && touchLike)
    }

    update()
    widthQuery.addEventListener("change", update)
    touchQuery.addEventListener("change", update)
    window.addEventListener("resize", update)

    return () => {
      widthQuery.removeEventListener("change", update)
      touchQuery.removeEventListener("change", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return tabletMode
}

function buildDefaultRow(
  moduleId: string,
  columns: ColumnConfig[],
  primaryKey: string,
  seedText = "",
): TableRow {
  const row: TableRow = { id: getRowId(moduleId) }
  for (const column of columns) {
    if (column.key === primaryKey && seedText.trim()) {
      row[column.key] = seedText.trim()
      continue
    }
    row[column.key] = ""
  }
  return row
}

function EditableTableModule({
  id,
  title,
  icon,
  columns,
  primaryKey,
  rows,
  onChangeRows,
  searchPlaceholder,
  cannedChips,
  searchSuggestions = [],
  onRowAdded,
  onSaveClick,
  onTemplateClick,
  onClearClick,
  afterSearch,
  getOptionTag,
  moduleDataAttr,
  highlightedRowIds,
  highlightedRowTooltips,
}: TableModuleConfig) {
  const isTablet = useTabletMode()
  const [searchText, setSearchText] = useState("")
  const [activeMenu, setActiveMenu] = useState<ActiveMenu | null>(null)
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null)
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null)
  const [activeCell, setActiveCell] = useState<{ rowId: string; colKey: string } | null>(null)
  const [editingCellValues, setEditingCellValues] = useState<Record<string, string>>({})
  const [isActionSticky, setIsActionSticky] = useState(false)
  const [menuIndicator, setMenuIndicator] = useState({
    hasOverflow: false,
    thumbTop: 0,
    thumbHeight: 18,
  })

  const moduleRootRef = useRef<HTMLDivElement | null>(null)
  const tableWrapRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const menuListRef = useRef<HTMLDivElement | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})
  const transparentDragImageRef = useRef<HTMLImageElement | null>(null)
  const rowTopByIdRef = useRef<Record<string, number>>({})
  const dragPreviewTargetRef = useRef<string | null>(null)
  const colIndexByKey = useMemo(
    () => Object.fromEntries(columns.map((column, idx) => [column.key, idx])),
    [columns],
  )
  const searchCatalog = useMemo(
    () => (searchSuggestions.length > 0 ? searchSuggestions : cannedChips),
    [cannedChips, searchSuggestions],
  )
  const searchCatalogKey = useMemo(() => searchCatalog.join("||"), [searchCatalog])
  const [dynamicSearchCatalog, setDynamicSearchCatalog] = useState<string[]>(searchCatalog)
  const shouldFilterCellOnOpen = useCallback(
    (column: ColumnConfig) =>
      column.key === primaryKey && Boolean(column.getOptions) && !column.restrictToOptions,
    [primaryKey],
  )

  useEffect(() => {
    setDynamicSearchCatalog(searchCatalog)
  }, [searchCatalog, searchCatalogKey])

  useEffect(() => {
    // Keep committed primary-field values discoverable in future dropdown searches.
    setDynamicSearchCatalog((prev) => {
      const seen = new Set(prev.map((item) => normalizeText(item)))
      const additions: string[] = []
      for (const row of rows) {
        const value = (row[primaryKey] ?? "").trim()
        if (!value) continue
        const key = normalizeText(value)
        if (seen.has(key)) continue
        seen.add(key)
        additions.push(value)
      }
      if (additions.length === 0) return prev
      return [...additions, ...prev]
    })
  }, [rows, primaryKey])
  const totalColumnWidth = useMemo(
    () =>
      Math.max(
        1,
        columns.reduce((sum, column) => sum + Math.max(column.width, getColumnMinWidth(column)), 0),
      ),
    [columns],
  )

  const getResponsiveColumnStyle = useCallback(
    (column: ColumnConfig): React.CSSProperties => ({
      width: `${(column.width / totalColumnWidth) * 100}%`,
      minWidth: getColumnMinWidth(column),
      maxWidth: column.maxWidth,
    }),
    [totalColumnWidth],
  )

  const setCellValue = useCallback(
    (rowId: string, key: string, value: string) => {
      onChangeRows(
        rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                [key]: value,
              }
            : row,
        ),
      )
    },
    [onChangeRows, rows],
  )

  const registerCustomValue = useCallback((value: string) => {
    const nextValue = value.trim()
    if (!nextValue) return
    setDynamicSearchCatalog((prev) => {
      const exists = prev.some((item) => normalizeText(item) === normalizeText(nextValue))
      if (exists) return prev
      return [nextValue, ...prev]
    })
  }, [])

  const beginDropdownEditing = useCallback((key: string, value: string) => {
    setEditingCellValues((prev) => {
      if (prev[key] === value) return prev
      return { ...prev, [key]: value }
    })
  }, [])

  const endDropdownEditing = useCallback((key: string) => {
    setEditingCellValues((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const ensureCellVisibleInTable = useCallback((element: HTMLElement) => {
    const wrapper = tableWrapRef.current
    if (!wrapper) return
    const wrapperRect = wrapper.getBoundingClientRect()
    const cellRect = element.getBoundingClientRect()
    const rightSafetyInset = 62
    const leftSafetyInset = 8

    if (cellRect.right > wrapperRect.right - rightSafetyInset) {
      const delta = cellRect.right - (wrapperRect.right - rightSafetyInset)
      wrapper.scrollBy({ left: delta + 8, behavior: "smooth" })
    } else if (cellRect.left < wrapperRect.left + leftSafetyInset) {
      const delta = wrapperRect.left + leftSafetyInset - cellRect.left
      wrapper.scrollBy({ left: -delta - 8, behavior: "smooth" })
    }
  }, [])

  const addRow = useCallback(
    (seedText = "") => {
      const row = buildDefaultRow(id, columns, primaryKey, seedText)
      onChangeRows([...rows, row])
      onRowAdded?.(seedText)
    },
    [columns, id, onChangeRows, onRowAdded, primaryKey, rows],
  )

  const hasAnyData = useMemo(() => rows.some((row) => rowHasValues(row)), [rows])

  const handleTemplateClick = useCallback(() => {
    if (onTemplateClick) {
      onTemplateClick()
      return
    }
    addRow(cannedChips[0] ?? "")
  }, [addRow, cannedChips, onTemplateClick])

  const handleSaveClick = useCallback(() => {
    onSaveClick?.()
  }, [onSaveClick])

  const handleClearClick = useCallback(() => {
    if (onClearClick) {
      onClearClick()
      return
    }
    onChangeRows([])
  }, [onChangeRows, onClearClick])

  const removeRow = useCallback(
    (rowId: string) => {
      onChangeRows(rows.filter((row) => row.id !== rowId))
    },
    [onChangeRows, rows],
  )

  const moveRow = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return
      const sourceIndex = rows.findIndex((row) => row.id === sourceId)
      const targetIndex = rows.findIndex((row) => row.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return
      const clone = [...rows]
      const [picked] = clone.splice(sourceIndex, 1)
      clone.splice(targetIndex, 0, picked)
      onChangeRows(clone)
    },
    [onChangeRows, rows],
  )

  const focusCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const nextRow = rows[rowIndex]
      const nextColumn = columns[colIndex]
      if (!nextRow || !nextColumn) return
      const key = `${nextRow.id}:${nextColumn.key}`
      const element = inputRefs.current[key]
      if (!element) return
      element.focus()
      const len = element.value.length
      element.setSelectionRange(len, len)
    },
    [columns, rows],
  )

  const focusOwnSearch = useCallback(() => {
    const node = searchInputRef.current
    if (!node) return
    node.focus()
    node.select()
    if (isTablet) {
      snapFieldToViewportTop(node)
    }
  }, [isTablet])

  const focusNextModuleSearch = useCallback(() => {
    if (typeof document === "undefined") return
    const current = searchInputRef.current
    if (!current) return
    const allSearches = Array.from(
      document.querySelectorAll<HTMLInputElement>('[data-rx-module-search="true"]'),
    )
    const idx = allSearches.findIndex((node) => node === current)
    if (idx < 0 || idx >= allSearches.length - 1) {
      current.focus()
      current.select()
      return
    }
    const next = allSearches[idx + 1]
    next.focus()
    next.select()
    if (isTablet) {
      snapFieldToViewportTop(next)
    }
  }, [isTablet])

  const focusPreviousModuleSearch = useCallback(() => {
    if (typeof document === "undefined") return
    const current = searchInputRef.current
    if (!current) return
    const allSearches = Array.from(
      document.querySelectorAll<HTMLInputElement>('[data-rx-module-search="true"]'),
    )
    const idx = allSearches.findIndex((node) => node === current)
    if (idx <= 0) {
      current.focus()
      current.select()
      return
    }
    const prev = allSearches[idx - 1]
    prev.focus()
    prev.select()
    if (isTablet) {
      snapFieldToViewportTop(prev)
    }
  }, [isTablet])

  const focusFirstCellInModule = useCallback(
    (moduleRoot: HTMLElement | null) => {
      if (!moduleRoot) return false

      const firstCell = moduleRoot.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        '[data-rx-cell-input="true"]',
      )
      if (firstCell) {
        firstCell.focus()
        const len = firstCell.value.length
        firstCell.setSelectionRange(len, len)
        if (isTablet) {
          snapFieldToViewportTop(firstCell)
        }
        return true
      }

      const moduleSearch = moduleRoot.querySelector<HTMLInputElement>('[data-rx-module-search="true"]')
      if (moduleSearch) {
        moduleSearch.focus()
        moduleSearch.select()
        if (isTablet) {
          snapFieldToViewportTop(moduleSearch)
        }
        return true
      }

      return false
    },
    [isTablet],
  )

  const focusNextModuleFirstCell = useCallback(() => {
    if (typeof document === "undefined") return
    const currentRoot = moduleRootRef.current
    if (!currentRoot) {
      focusNextModuleSearch()
      return
    }
    const allRoots = Array.from(document.querySelectorAll<HTMLElement>('[data-rx-module-root="true"]'))
    const idx = allRoots.findIndex((node) => node === currentRoot)
    if (idx < 0 || idx >= allRoots.length - 1) {
      focusOwnSearch()
      return
    }
    const nextRoot = allRoots[idx + 1]
    if (!focusFirstCellInModule(nextRoot)) {
      focusNextModuleSearch()
    }
  }, [focusFirstCellInModule, focusNextModuleSearch, focusOwnSearch])

  const focusPreviousModuleLastCell = useCallback(() => {
    if (typeof document === "undefined") return
    const currentRoot = moduleRootRef.current
    if (!currentRoot) {
      focusPreviousModuleSearch()
      return
    }
    const allRoots = Array.from(document.querySelectorAll<HTMLElement>('[data-rx-module-root="true"]'))
    const idx = allRoots.findIndex((node) => node === currentRoot)
    if (idx <= 0) {
      focusOwnSearch()
      return
    }
    const prevRoot = allRoots[idx - 1]
    const cells = Array.from(
      prevRoot.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-rx-cell-input="true"]'),
    )
    const lastCell = cells[cells.length - 1]
    if (lastCell) {
      lastCell.focus()
      const len = lastCell.value.length
      lastCell.setSelectionRange(len, len)
      if (isTablet) {
        snapFieldToViewportTop(lastCell)
      }
      return
    }
    focusPreviousModuleSearch()
  }, [focusOwnSearch, focusPreviousModuleSearch, isTablet])

  const focusNextFromCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const lastColIndex = columns.length - 1
      if (colIndex < lastColIndex) {
        focusCell(rowIndex, colIndex + 1)
        return
      }
      if (rowIndex < rows.length - 1) {
        focusCell(rowIndex + 1, 0)
        return
      }
      focusOwnSearch()
    },
    [columns.length, focusCell, focusOwnSearch, rows.length],
  )

  const focusPreviousFromCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const lastColIndex = columns.length - 1
      if (colIndex > 0) {
        focusCell(rowIndex, colIndex - 1)
        return
      }
      if (rowIndex > 0) {
        focusCell(rowIndex - 1, lastColIndex)
        return
      }
      focusOwnSearch()
    },
    [columns.length, focusCell, focusOwnSearch],
  )

  const closeMenu = useCallback(() => setActiveMenu(null), [])

  const optionsForMenu = useMemo(() => {
    if (!activeMenu) return []
    if (activeMenu.mode === "search") {
      return getCatalogOptions(dynamicSearchCatalog, activeMenu.query, 10)
    }
    const rowId = activeMenu.rowId ?? ""
    const colKey = activeMenu.colKey ?? ""
    const row = rows.find((item) => item.id === rowId)
    const column = columns.find((item) => item.key === colKey)
    if (!row || !column?.getOptions) return []
    if (column.key === primaryKey && !column.restrictToOptions) {
      const filtered = getCatalogOptions(dynamicSearchCatalog, activeMenu.query, 10)
      return moveSelectedOptionToTop(filtered, row[colKey] ?? "")
    }
    const filtered = filterByQuery(column.getOptions(activeMenu.query, row), activeMenu.query)
    return moveSelectedOptionToTop(filtered, row[colKey] ?? "")
  }, [activeMenu, columns, rows, dynamicSearchCatalog, primaryKey])

  const getMenuHighlightedIndex = useCallback(
    (row: TableRow, column: ColumnConfig, query: string, selectedValue: string) => {
      if (!column.getOptions) return 0
      const options =
        column.key === primaryKey && !column.restrictToOptions
          ? moveSelectedOptionToTop(getCatalogOptions(dynamicSearchCatalog, query, 10), selectedValue)
          : moveSelectedOptionToTop(
              filterByQuery(column.getOptions(query, row), query),
              selectedValue,
            )
      if (options.length === 0) return 0
      const selected = normalizeText(selectedValue)
      const selectedIndex = options.findIndex(
        (option) => !isCustomOption(option) && normalizeText(getOptionValue(option)) === selected,
      )
      return selectedIndex >= 0 ? selectedIndex : 0
    },
    [dynamicSearchCatalog, primaryKey],
  )

  const openCellMenu = useCallback(
    (
      row: TableRow,
      column: ColumnConfig,
      anchorRect: DOMRect,
      selectedValue: string,
      query: string,
      showAllOptions = false,
    ) => {
      if (!column.getOptions) return
      const nextQuery = showAllOptions ? "" : query
      setActiveMenu({
        mode: "cell",
        rowId: row.id,
        colKey: column.key,
        query: nextQuery,
        highlightedIndex: getMenuHighlightedIndex(row, column, nextQuery, selectedValue),
        anchorRect,
      })
    },
    [getMenuHighlightedIndex],
  )

  const openSearchMenu = useCallback(
    (query: string, showAllOptions = false) => {
      const anchorRect = searchInputRef.current?.getBoundingClientRect()
      if (!anchorRect) return
      const nextQuery = showAllOptions ? "" : query
      const options = getCatalogOptions(dynamicSearchCatalog, nextQuery, 10)
      const selected = normalizeText(query)
      const selectedIndex = options.findIndex(
        (option) => !isCustomOption(option) && normalizeText(getOptionValue(option)) === selected,
      )
      setActiveMenu({
        mode: "search",
        query: nextQuery,
        highlightedIndex: selectedIndex >= 0 ? selectedIndex : 0,
        anchorRect,
      })
    },
    [dynamicSearchCatalog],
  )

  useEffect(() => {
    if (!activeMenu) return
    const updateAnchor = () => {
      const anchor =
        activeMenu.mode === "search"
          ? searchInputRef.current
          : inputRefs.current[`${activeMenu.rowId ?? ""}:${activeMenu.colKey ?? ""}`]
      if (!anchor) return
      setActiveMenu((current) => {
        if (!current) return current
        return {
          ...current,
          anchorRect: anchor.getBoundingClientRect(),
        }
      })
    }
    updateAnchor()
    window.addEventListener("resize", updateAnchor)
    window.addEventListener("scroll", updateAnchor, true)
    return () => {
      window.removeEventListener("resize", updateAnchor)
      window.removeEventListener("scroll", updateAnchor, true)
    }
  }, [activeMenu])

  useEffect(() => {
    const node = menuListRef.current
    if (!activeMenu || !node) {
      setMenuIndicator((prev) =>
        prev.hasOverflow || prev.thumbTop !== 0
          ? { hasOverflow: false, thumbTop: 0, thumbHeight: 18 }
          : prev,
      )
      return
    }

    const updateIndicator = () => {
      const clientHeight = node.clientHeight
      const scrollHeight = node.scrollHeight
      const scrollTop = node.scrollTop
      const hasOverflow = scrollHeight > clientHeight + 1

      const trackPadding = 8
      const trackHeight = Math.max(0, clientHeight - trackPadding * 2)
      const thumbHeight = hasOverflow
        ? Math.max(18, Math.min(trackHeight, (clientHeight / scrollHeight) * trackHeight))
        : trackHeight
      const maxThumbTop = Math.max(0, trackHeight - thumbHeight)
      const thumbTop =
        hasOverflow && scrollHeight > clientHeight
          ? (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop
          : 0

      setMenuIndicator((prev) => {
        if (
          prev.hasOverflow === hasOverflow &&
          Math.abs(prev.thumbTop - thumbTop) < 0.5 &&
          Math.abs(prev.thumbHeight - thumbHeight) < 0.5
        ) {
          return prev
        }
        return { hasOverflow, thumbTop, thumbHeight }
      })
    }

    updateIndicator()
    node.addEventListener("scroll", updateIndicator, { passive: true })
    window.addEventListener("resize", updateIndicator)

    return () => {
      node.removeEventListener("scroll", updateIndicator)
      window.removeEventListener("resize", updateIndicator)
    }
  }, [activeMenu, optionsForMenu.length])

  useEffect(() => {
    const node = menuListRef.current
    if (!activeMenu || !node) return
    const index = activeMenu.highlightedIndex
    if (index < 0) return

    const target = node.querySelector<HTMLElement>(`[data-rx-menu-index="${index}"]`)
    if (!target) return

    const targetTop = target.offsetTop
    const targetBottom = targetTop + target.offsetHeight
    const viewTop = node.scrollTop
    const viewBottom = viewTop + node.clientHeight

    if (targetTop < viewTop) {
      node.scrollTo({ top: Math.max(0, targetTop - 4), behavior: "smooth" })
      return
    }
    if (targetBottom > viewBottom) {
      node.scrollTo({ top: targetBottom - node.clientHeight + 4, behavior: "smooth" })
    }
  }, [
    activeMenu?.mode,
    activeMenu?.rowId,
    activeMenu?.colKey,
    activeMenu?.highlightedIndex,
    optionsForMenu.length,
  ])

  useEffect(() => {
    if (rows.length > 0) return
    setActiveCell(null)
    setActiveMenu(null)
  }, [rows.length])

  useLayoutEffect(() => {
    const wrapper = tableWrapRef.current
    const tbody = wrapper?.querySelector("tbody")
    if (!tbody) {
      rowTopByIdRef.current = {}
      return
    }

    const rowElements = Array.from(
      tbody.querySelectorAll<HTMLTableRowElement>("tr[data-row-id]"),
    )

    const nextTopById: Record<string, number> = {}
    for (const rowElement of rowElements) {
      const rowId = rowElement.dataset.rowId
      if (!rowId) continue
      const nextTop = rowElement.getBoundingClientRect().top
      nextTopById[rowId] = nextTop

      const prevTop = rowTopByIdRef.current[rowId]
      if (prevTop == null) continue
      const deltaY = prevTop - nextTop
      if (Math.abs(deltaY) < 1) continue

      rowElement.style.transition = "transform 0s"
      rowElement.style.transform = `translateY(${deltaY}px)`
      rowElement.getBoundingClientRect()
      rowElement.style.transition = "transform 220ms cubic-bezier(0.22,1,0.36,1)"
      rowElement.style.transform = ""
    }

    rowTopByIdRef.current = nextTopById
  }, [rows])

  useEffect(() => {
    if (!draggingRowId) return

    const handleDocumentDragOver = (event: DragEvent) => {
      if (event.clientX === 0 && event.clientY === 0) return
      const wrapper = tableWrapRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      const withinX = event.clientX >= rect.left && event.clientX <= rect.right
      const withinY = event.clientY >= rect.top && event.clientY <= rect.bottom

      if (!withinX || !withinY) {
        setDragOverRowId(null)
      }
    }

    const handleDocumentDrop = () => {
      setDraggingRowId(null)
      setDragOverRowId(null)
      dragPreviewTargetRef.current = null
    }

    const handleDocumentDragEnd = () => {
      setDraggingRowId(null)
      setDragOverRowId(null)
      dragPreviewTargetRef.current = null
    }

    document.addEventListener("dragover", handleDocumentDragOver)
    document.addEventListener("drop", handleDocumentDrop)
    document.addEventListener("dragend", handleDocumentDragEnd)

    return () => {
      document.removeEventListener("dragover", handleDocumentDragOver)
      document.removeEventListener("drop", handleDocumentDrop)
      document.removeEventListener("dragend", handleDocumentDragEnd)
    }
  }, [draggingRowId])

  useEffect(() => {
    const wrapper = tableWrapRef.current
    if (!wrapper || rows.length === 0) {
      setIsActionSticky(false)
      return
    }

    const updateStickyState = () => {
      const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth + 1
      setIsActionSticky(hasOverflow)
    }

    updateStickyState()
    window.addEventListener("resize", updateStickyState)
    wrapper.addEventListener("scroll", updateStickyState, { passive: true })

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateStickyState)
      observer.observe(wrapper)
      const table = wrapper.querySelector("table")
      if (table) {
        observer.observe(table)
      }
    }

    return () => {
      window.removeEventListener("resize", updateStickyState)
      wrapper.removeEventListener("scroll", updateStickyState)
      observer?.disconnect()
    }
  }, [rows.length, columns.length])

  const stickyActionHeaderClass = isActionSticky
    ? "sticky right-0 z-40 border-l border-tp-slate-200/80 bg-tp-slate-50 shadow-[-8px_7px_14px_-12px_rgba(15,23,42,0.18)] before:pointer-events-none before:absolute before:inset-y-0 before:-left-2 before:w-2 before:content-[''] before:bg-gradient-to-l before:from-tp-slate-900/6 before:to-transparent"
    : ""

  const stickyActionCellClass = isActionSticky
    ? "sticky right-0 z-40 border-l border-tp-slate-200/80 bg-white shadow-[-8px_7px_14px_-12px_rgba(15,23,42,0.18)] before:pointer-events-none before:absolute before:inset-y-0 before:-left-2 before:w-2 before:content-[''] before:bg-gradient-to-l before:from-tp-slate-900/6 before:to-transparent"
    : ""

  const menuPosition = activeMenu
    ? (() => {
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280
      const activeColumn =
        activeMenu.mode === "cell"
          ? columns.find((column) => column.key === activeMenu.colKey)
          : undefined
      const allowWideCellDropdown = Boolean(activeColumn && shouldFilterCellOnOpen(activeColumn))

      const desiredWidth = (() => {
        if (activeMenu.mode === "search") {
          return Math.max(activeMenu.anchorRect.width, isTablet ? 620 : 760)
        }
        if (allowWideCellDropdown) {
          return activeMenu.anchorRect.width + (isTablet ? 32 : 40)
        }
        return activeMenu.anchorRect.width
      })()

      const minWidth = activeMenu.mode === "search" ? 220 : 120
      const width = Math.min(desiredWidth, Math.max(minWidth, viewportWidth - 16))
      const rawLeft = Math.max(8, activeMenu.anchorRect.left)
      const left = Math.min(rawLeft, Math.max(8, viewportWidth - width - 8))
        return {
          left,
          top: activeMenu.anchorRect.bottom + 6,
          width,
        }
      })()
    : null

  const regularOptionEntries = useMemo(
    () =>
      optionsForMenu
        .map((option, index) => ({ option, index }))
        .filter((entry) => !isCustomOption(entry.option)),
    [optionsForMenu],
  )

  const customOptionEntry = useMemo(() => {
    const index = optionsForMenu.findIndex((option) => isCustomOption(option))
    if (index < 0) return null
    return { option: optionsForMenu[index], index }
  }, [optionsForMenu])
  const showMenuFooter = activeMenu?.mode === "search" || Boolean(customOptionEntry)

  const sideColumnStyle: React.CSSProperties = {
    width: 50,
    minWidth: 50,
    maxWidth: 50,
  }

  return (
    <div {...(moduleDataAttr ? { "data-rxpad-module": moduleDataAttr } : {})}>
    <TPRxPadSection
      title={title}
      icon={icon}
      onTemplateClick={handleTemplateClick}
      onSaveClick={handleSaveClick}
      onClearClick={handleClearClick}
      clearDisabled={!hasAnyData}
    >
      <div ref={moduleRootRef} data-rx-module-root="true" className="space-y-[18px]">
        {rows.length > 0 ? (
          <div
            ref={tableWrapRef}
            className="relative overflow-x-auto rounded-[10px] border border-tp-slate-100"
            onDragOver={(event) => {
              if (!draggingRowId) return
              event.preventDefault()
            }}
            onDragLeave={(event) => {
              if (!draggingRowId) return
              const rect = event.currentTarget.getBoundingClientRect()
              const withinX = event.clientX >= rect.left && event.clientX <= rect.right
              const withinY = event.clientY >= rect.top && event.clientY <= rect.bottom
              if (withinX && withinY) return
              setDragOverRowId(null)
            }}
          >
            <table className="min-w-full w-max table-fixed font-['Inter',sans-serif] text-[14px]">
              <colgroup>
                <col style={sideColumnStyle} />
                {columns.map((column) => (
                  <col key={`col-${column.key}`} style={getResponsiveColumnStyle(column)} />
                ))}
                <col style={sideColumnStyle} />
              </colgroup>
              <thead>
                <tr className="h-[38px] bg-tp-slate-50 font-['Inter',sans-serif] text-[12px] text-tp-slate-500">
                <th className="border-r border-tp-slate-100 px-0 py-2 text-center font-semibold" style={sideColumnStyle} />
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="border-r border-tp-slate-100 px-3 py-2 text-left text-[12px] font-semibold"
                    style={getResponsiveColumnStyle(column)}
                  >
                    {column.label}
                  </th>
                ))}
                <th
                  className={[
                    "relative px-0 py-2 text-center text-[12px] font-semibold",
                    stickyActionHeaderClass,
                  ].join(" ")}
                  style={sideColumnStyle}
                />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                (() => {
                  const isDraggingRow = draggingRowId === row.id
                  const isDropTargetRow = dragOverRowId === row.id && !isDraggingRow
                  const isHighlighted = highlightedRowIds?.has(row.id)
                  const highlightTooltip = highlightedRowTooltips?.[row.id]
                  return (
                <tr
                  key={row.id}
                  data-row-id={row.id}
                  title={highlightTooltip}
                  className={[
                    "h-[52px] border-t border-tp-slate-100 align-middle transition-colors duration-150 will-change-transform",
                    isHighlighted ? "bg-tp-warning-50/40 border-l-2 border-l-tp-warning-300" : "bg-white",
                    isDraggingRow ? "bg-tp-blue-50/45" : "",
                    isDropTargetRow ? "bg-tp-blue-50/65" : "hover:bg-tp-slate-50/50",
                  ].join(" ")}
                  onDragOver={(event) => {
                    if (!draggingRowId) return
                    event.preventDefault()
                    setDragOverRowId(row.id)
                    if (draggingRowId !== row.id && dragPreviewTargetRef.current !== row.id) {
                      dragPreviewTargetRef.current = row.id
                      moveRow(draggingRowId, row.id)
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    if (!draggingRowId) return
                    setDragOverRowId(null)
                    setDraggingRowId(null)
                    dragPreviewTargetRef.current = null
                  }}
                >
                  <td className="border-r border-tp-slate-100 p-0 text-center align-middle" style={sideColumnStyle}>
                    <button
                      type="button"
                      data-drag-handle="true"
                      draggable
                      className={[
                        "inline-flex h-[52px] w-full cursor-grab items-center justify-center transition-colors active:cursor-grabbing",
                        isDraggingRow
                          ? "bg-tp-blue-50 text-tp-blue-600"
                          : "text-tp-slate-400 hover:bg-tp-slate-100 hover:text-tp-slate-600",
                      ].join(" ")}
                      aria-label="Drag to reorder row"
                      onDragStart={(event) => {
                        setDraggingRowId(row.id)
                        setDragOverRowId(row.id)
                        dragPreviewTargetRef.current = row.id
                        event.dataTransfer.effectAllowed = "move"
                        try {
                          event.dataTransfer.setData("application/x-rx-row-id", row.id)
                        } catch {
                          // keep drag alive in strict browser modes without polluting clipboard text
                        }

                        if (!transparentDragImageRef.current) {
                          const transparent = new Image()
                          transparent.src =
                            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                          transparentDragImageRef.current = transparent
                        }
                        event.dataTransfer.setDragImage(transparentDragImageRef.current, 0, 0)
                      }}
                      onDragEnd={() => {
                        setDraggingRowId(null)
                        setDragOverRowId(null)
                        dragPreviewTargetRef.current = null
                      }}
                    >
                      <GripVertical size={18} strokeWidth={1.5} />
                    </button>
                  </td>

                  {columns.map((column) => {
                    const key = `${row.id}:${column.key}`
                    const hasDropdown = Boolean(column.getOptions)
                    const showDropdownToggle = column.showDropdownToggle ?? true
                    const isMultiline = false
                    const isMenuOpen = Boolean(
                      activeMenu &&
                      activeMenu.rowId === row.id &&
                      activeMenu.colKey === column.key,
                    )
                    const value = row[column.key] ?? ""
                    const displayValue = hasDropdown ? (editingCellValues[key] ?? value) : value
                    const fieldClass = [
                      "h-[52px] w-full border-0 bg-transparent px-3 py-0",
                      "font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#454551]",
                      "focus:bg-tp-blue-50/30 focus:outline-none focus:ring-0",
                      "relative z-20",
                      "rounded-none",
                      hasDropdown ? "pr-8" : "",
                      isMultiline ? "overflow-hidden whitespace-normal break-words py-[10px] leading-[18px]" : "overflow-hidden text-ellipsis whitespace-nowrap",
                    ].join(" ")

                    return (
                      <td
                        key={column.key}
                        className={`border-r border-tp-slate-100 p-0 align-middle transition-colors ${
                          activeCell?.rowId === row.id && activeCell?.colKey === column.key ? "bg-tp-blue-50/20" : ""
                        }`}
                        style={getResponsiveColumnStyle(column)}
                      >
                        <div className="relative h-[52px]">
                          {activeCell?.rowId === row.id && activeCell?.colKey === column.key ? (
                            <span className="pointer-events-none absolute inset-[2px] z-10 rounded-[6px] border border-tp-blue-500 shadow-[0_0_0_2px_rgba(75,74,213,0.16)]" />
                          ) : null}
                          {isMultiline ? (
                            <textarea
                              data-rx-cell-input="true"
                              ref={(node) => {
                                inputRefs.current[key] = node
                              }}
                              value={displayValue}
                              title={displayValue || undefined}
                              rows={column.maxLines ?? 2}
                              placeholder={column.placeholder}
                              className={fieldClass}
                              style={{ maxHeight: `${(column.maxLines ?? 2) * 18 + 20}px`, resize: "none" }}
                              onFocus={(event) => {
                                setActiveCell({ rowId: row.id, colKey: column.key })
                                if (hasDropdown) {
                                  beginDropdownEditing(key, value)
                                  ensureCellVisibleInTable(event.currentTarget)
                                  const len = event.currentTarget.value.length
                                  event.currentTarget.setSelectionRange(len, len)
                                }
                                if (isTablet) {
                                  snapFieldToViewportTop(event.currentTarget)
                                }
                                if (hasDropdown) {
                                  openCellMenu(
                                    row,
                                    column,
                                    event.currentTarget.getBoundingClientRect(),
                                    value,
                                    value,
                                    !shouldFilterCellOnOpen(column),
                                  )
                                }
                              }}
                              onClick={(event) => {
                                if (hasDropdown) {
                                  beginDropdownEditing(key, value)
                                  ensureCellVisibleInTable(event.currentTarget)
                                }
                                if (hasDropdown) {
                                  openCellMenu(
                                    row,
                                    column,
                                    event.currentTarget.getBoundingClientRect(),
                                    value,
                                    value,
                                    !shouldFilterCellOnOpen(column),
                                  )
                                }
                              }}
                              onChange={(event) => {
                                const next = event.currentTarget.value
                                if (hasDropdown) {
                                  beginDropdownEditing(key, next)
                                } else {
                                  setCellValue(row.id, column.key, next)
                                }
                                openCellMenu(
                                  row,
                                  column,
                                  event.currentTarget.getBoundingClientRect(),
                                  next,
                                  next,
                                )
                              }}
                              onBlur={() => {
                                window.setTimeout(() => {
                                  if (hasDropdown) {
                                    endDropdownEditing(key)
                                  }
                                  setActiveMenu((current) => {
                                    if (!current) return current
                                    if (current.rowId !== row.id || current.colKey !== column.key) return current
                                    return null
                                  })
                                  setActiveCell((current) => {
                                    if (!current) return current
                                    if (current.rowId !== row.id || current.colKey !== column.key) return current
                                    return null
                                  })
                                }, 80)
                              }}
                              onKeyDown={(event) => {
                                const colIndex = colIndexByKey[column.key]
                                const menuOpened =
                                  activeMenu &&
                                  activeMenu.rowId === row.id &&
                                  activeMenu.colKey === column.key &&
                                  optionsForMenu.length > 0

                                if (menuOpened && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                                  event.preventDefault()
                                  const delta = event.key === "ArrowDown" ? 1 : -1
                                  setActiveMenu((current) => {
                                    if (!current) return current
                                    const next = (current.highlightedIndex + delta + optionsForMenu.length) % optionsForMenu.length
                                    return { ...current, highlightedIndex: next }
                                  })
                                  return
                                }

                                if (menuOpened && event.key === "Enter") {
                                  event.preventDefault()
                                  const picked = optionsForMenu[activeMenu.highlightedIndex] ?? optionsForMenu[0]
                                  if (picked) {
                                    const pickedValue = getOptionValue(picked)
                                    setCellValue(row.id, column.key, pickedValue)
                                    if (isCustomOption(picked)) {
                                      registerCustomValue(pickedValue)
                                    }
                                    endDropdownEditing(key)
                                  }
                                  closeMenu()
                                  focusNextFromCell(rowIndex, colIndex)
                                  return
                                }

                                if (event.key === "Escape") {
                                  closeMenu()
                                  return
                                }

                                if (event.key === "ArrowUp") {
                                  event.preventDefault()
                                  if (rowIndex <= 0) {
                                    focusPreviousModuleLastCell()
                                  } else {
                                    focusCell(rowIndex - 1, colIndex)
                                  }
                                  return
                                }
                                if (event.key === "ArrowDown") {
                                  event.preventDefault()
                                  if (rowIndex >= rows.length - 1) {
                                    focusOwnSearch()
                                  } else {
                                    focusCell(rowIndex + 1, colIndex)
                                  }
                                  return
                                }
                                if (event.key === "ArrowLeft") {
                                  event.preventDefault()
                                  focusPreviousFromCell(rowIndex, colIndex)
                                  return
                                }
                                if (event.key === "ArrowRight") {
                                  event.preventDefault()
                                  focusNextFromCell(rowIndex, colIndex)
                                  return
                                }
                                if (event.key === "Enter") {
                                  event.preventDefault()
                                  focusNextFromCell(rowIndex, colIndex)
                                }
                              }}
                            />
                          ) : (
                            <input
                              data-rx-cell-input="true"
                              ref={(node) => {
                                inputRefs.current[key] = node
                              }}
                              value={displayValue}
                              title={displayValue || undefined}
                              placeholder={column.placeholder}
                              className={fieldClass}
                              onFocus={(event) => {
                                setActiveCell({ rowId: row.id, colKey: column.key })
                                if (hasDropdown) {
                                  beginDropdownEditing(key, value)
                                  ensureCellVisibleInTable(event.currentTarget)
                                  const len = event.currentTarget.value.length
                                  event.currentTarget.setSelectionRange(len, len)
                                }
                                if (isTablet) {
                                  snapFieldToViewportTop(event.currentTarget)
                                }
                                if (hasDropdown) {
                                  openCellMenu(
                                    row,
                                    column,
                                    event.currentTarget.getBoundingClientRect(),
                                    value,
                                    value,
                                    !shouldFilterCellOnOpen(column),
                                  )
                                }
                              }}
                              onClick={(event) => {
                                if (hasDropdown) {
                                  beginDropdownEditing(key, value)
                                  ensureCellVisibleInTable(event.currentTarget)
                                }
                                if (hasDropdown) {
                                  openCellMenu(
                                    row,
                                    column,
                                    event.currentTarget.getBoundingClientRect(),
                                    value,
                                    value,
                                    !shouldFilterCellOnOpen(column),
                                  )
                                }
                              }}
                              onChange={(event) => {
                                const next = event.currentTarget.value
                                if (hasDropdown) {
                                  beginDropdownEditing(key, next)
                                } else {
                                  setCellValue(row.id, column.key, next)
                                }
                                openCellMenu(
                                  row,
                                  column,
                                  event.currentTarget.getBoundingClientRect(),
                                  next,
                                  next,
                                )
                              }}
                              onBlur={() => {
                                window.setTimeout(() => {
                                  if (hasDropdown) {
                                    endDropdownEditing(key)
                                  }
                                  setActiveMenu((current) => {
                                    if (!current) return current
                                    if (current.rowId !== row.id || current.colKey !== column.key) return current
                                    return null
                                  })
                                  setActiveCell((current) => {
                                    if (!current) return current
                                    if (current.rowId !== row.id || current.colKey !== column.key) return current
                                    return null
                                  })
                                }, 80)
                              }}
                              onKeyDown={(event) => {
                                const colIndex = colIndexByKey[column.key]
                                const menuOpened =
                                  activeMenu &&
                                  activeMenu.rowId === row.id &&
                                  activeMenu.colKey === column.key &&
                                  optionsForMenu.length > 0

                                if (menuOpened && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                                  event.preventDefault()
                                  const delta = event.key === "ArrowDown" ? 1 : -1
                                  setActiveMenu((current) => {
                                    if (!current) return current
                                    const next = (current.highlightedIndex + delta + optionsForMenu.length) % optionsForMenu.length
                                    return { ...current, highlightedIndex: next }
                                  })
                                  return
                                }

                                if (menuOpened && event.key === "Enter") {
                                  event.preventDefault()
                                  const picked = optionsForMenu[activeMenu.highlightedIndex] ?? optionsForMenu[0]
                                  if (picked) {
                                    const pickedValue = getOptionValue(picked)
                                    setCellValue(row.id, column.key, pickedValue)
                                    if (isCustomOption(picked)) {
                                      registerCustomValue(pickedValue)
                                    }
                                    endDropdownEditing(key)
                                  }
                                  closeMenu()
                                  focusNextFromCell(rowIndex, colIndex)
                                  return
                                }

                                if (event.key === "Escape") {
                                  closeMenu()
                                  return
                                }

                                if (event.key === "ArrowUp") {
                                  event.preventDefault()
                                  if (rowIndex <= 0) {
                                    focusPreviousModuleLastCell()
                                  } else {
                                    focusCell(rowIndex - 1, colIndex)
                                  }
                                  return
                                }
                                if (event.key === "ArrowDown") {
                                  event.preventDefault()
                                  if (rowIndex >= rows.length - 1) {
                                    focusOwnSearch()
                                  } else {
                                    focusCell(rowIndex + 1, colIndex)
                                  }
                                  return
                                }
                                if (event.key === "ArrowLeft") {
                                  event.preventDefault()
                                  focusPreviousFromCell(rowIndex, colIndex)
                                  return
                                }
                                if (event.key === "ArrowRight") {
                                  event.preventDefault()
                                  focusNextFromCell(rowIndex, colIndex)
                                  return
                                }
                                if (event.key === "Enter") {
                                  event.preventDefault()
                                  focusNextFromCell(rowIndex, colIndex)
                                }
                              }}
                            />
                          )}
                          {hasDropdown && showDropdownToggle ? (
                            <TPTooltip title="Use ↑ ↓ to navigate options, press Enter to select" placement="top" arrow>
                              <button
                                type="button"
                                aria-label="Toggle options"
                                className="absolute right-[6px] top-1/2 z-10 inline-flex h-[20px] w-[20px] -translate-y-1/2 items-center justify-center text-tp-slate-500"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  const inputNode = inputRefs.current[key]
                                  if (!inputNode) return
                                  if (isMenuOpen) {
                                    closeMenu()
                                    return
                                  }
                                  inputNode.focus()
                                  openCellMenu(
                                    row,
                                    column,
                                    inputNode.getBoundingClientRect(),
                                    value,
                                    value,
                                    !shouldFilterCellOnOpen(column),
                                  )
                                }}
                              >
                                <ChevronDown
                                  size={14}
                                  strokeWidth={1.5}
                                  className={`transition-transform duration-150 ${isMenuOpen ? "rotate-180" : ""}`}
                                />
                              </button>
                            </TPTooltip>
                          ) : null}
                        </div>
                      </td>
                    )
                  })}

                  <td
                    className={[
                      "relative p-0 text-center align-middle",
                      stickyActionCellClass,
                    ].join(" ")}
                    style={sideColumnStyle}
                  >
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="inline-flex h-[52px] w-full items-center justify-center text-tp-slate-700 hover:bg-tp-slate-100 hover:text-tp-slate-700"
                      aria-label="Delete row"
                    >
                      <Trash color="currentColor" size={18} strokeWidth={1.5} variant="Linear" />
                    </button>
                  </td>
                </tr>
                  )
                })()
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <TPRxPadSearchInput
          ref={searchInputRef}
          data-rx-module-search="true"
          value={searchText}
          onFocus={() => {
            openSearchMenu(searchText)
          }}
          onClick={() => {
            openSearchMenu(searchText)
          }}
          onChange={(event) => {
            const next = event.currentTarget.value
            setSearchText(next)
            openSearchMenu(next)
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setActiveMenu((current) => (current?.mode === "search" ? null : current))
            }, 90)
          }}
          onKeyDown={(event) => {
            const searchMenuOpen = activeMenu?.mode === "search" && optionsForMenu.length > 0

            if (searchMenuOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
              event.preventDefault()
              const delta = event.key === "ArrowDown" ? 1 : -1
              setActiveMenu((current) => {
                if (!current || current.mode !== "search") return current
                const next = (current.highlightedIndex + delta + optionsForMenu.length) % optionsForMenu.length
                return { ...current, highlightedIndex: next }
              })
              return
            }

            if (searchMenuOpen && event.key === "Enter") {
              event.preventDefault()
              const picked = optionsForMenu[activeMenu.highlightedIndex] ?? optionsForMenu[0]
              const value = picked ? getOptionValue(picked).trim() : searchText.trim()
              if (!value) {
                focusNextModuleFirstCell()
                return
              }
              if (picked && isCustomOption(picked)) {
                registerCustomValue(value)
              }
              const nextRowIndex = rows.length
              addRow(value)
              setSearchText("")
              closeMenu()
              window.requestAnimationFrame(() => {
                focusCell(nextRowIndex, 0)
              })
              return
            }

            if (searchMenuOpen && event.key === "Escape") {
              event.preventDefault()
              closeMenu()
              return
            }

            if (event.key === "Enter") {
              event.preventDefault()
              const value = searchText.trim()
              if (!value) {
                focusNextModuleFirstCell()
                return
              }
              openSearchMenu(value)
              return
            }

            if (event.key === "ArrowDown") {
              event.preventDefault()
              focusNextModuleFirstCell()
              return
            }

            if (event.key === "ArrowUp") {
              event.preventDefault()
              if (rows.length > 0) {
                focusCell(rows.length - 1, Math.max(0, columns.length - 1))
              } else {
                focusPreviousModuleLastCell()
              }
              return
            }

            if (event.key === "ArrowRight") {
              event.preventDefault()
              focusNextModuleSearch()
              return
            }

            if (event.key === "ArrowLeft") {
              event.preventDefault()
              focusPreviousModuleSearch()
            }
          }}
          placeholder={searchPlaceholder}
        />

        {isTablet ? (
          <div className="flex flex-wrap gap-3">
            {cannedChips.map((chip) => (
              <button
                key={`${id}-${chip}`}
                type="button"
                className="inline-flex h-[36px] items-center rounded-[10px] bg-tp-slate-100 px-3 text-[12px] font-medium text-tp-slate-600 transition-colors hover:bg-tp-slate-200 hover:text-tp-slate-700"
                onClick={() => addRow(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}

        {/* AI trigger chips — right-aligned after search area */}
        {afterSearch && (
          <div className="flex justify-end mt-[6px]">
            {afterSearch}
          </div>
        )}
      </div>

      {activeMenu && menuPosition && optionsForMenu.length > 0 && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[130] flex flex-col overflow-hidden rounded-[10px] border border-tp-slate-100 bg-white shadow-lg"
              style={{
                left: menuPosition.left,
                top: menuPosition.top,
                width: menuPosition.width,
              }}
            >
              {activeMenu.mode === "search" && activeMenu.query.trim().length === 0 ? (
                <div className="flex items-center justify-between border-b border-tp-slate-100 px-2 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tp-slate-400">
                    Frequently used
                  </span>
                </div>
              ) : null}
              <div className="relative">
                <div
                  ref={menuListRef}
                  className="max-h-[220px] overflow-y-auto space-y-0.5 bg-tp-slate-50/35 p-1 pr-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={{
                    msOverflowStyle: "none",
                  }}
                >
                  {regularOptionEntries.length === 0 ? (
                    <div className="flex items-center gap-2 px-[10px] py-[9px] text-[13px] font-medium text-tp-slate-400">
                      <Search size={14} strokeWidth={1.5} className="text-tp-slate-400/90" />
                      <span>No results found</span>
                    </div>
                  ) : null}
                  {regularOptionEntries.map(({ option, index }) => (
                    <button
                      key={`${activeMenu.mode}-${activeMenu.colKey ?? "search"}-${option}`}
                      type="button"
                      data-rx-menu-index={index}
                      className={[
                        "w-full rounded-[8px] px-[10px] py-[7px] text-left text-[14px] font-medium font-['Inter',sans-serif] flex items-center gap-2",
                        index === activeMenu.highlightedIndex
                          ? "bg-tp-slate-100 text-tp-slate-700"
                          : "text-tp-slate-700 hover:bg-tp-slate-100",
                      ].join(" ")}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        const value = getOptionValue(option).trim()
                        if (!value) {
                          closeMenu()
                          return
                        }
                        if (activeMenu.mode === "search") {
                          const nextRowIndex = rows.length
                          addRow(value)
                          setSearchText("")
                          closeMenu()
                          window.requestAnimationFrame(() => {
                            focusCell(nextRowIndex, 0)
                          })
                          return
                        }
                        if (activeMenu.rowId && activeMenu.colKey) {
                          setCellValue(activeMenu.rowId, activeMenu.colKey, value)
                          endDropdownEditing(`${activeMenu.rowId}:${activeMenu.colKey}`)
                        }
                        closeMenu()
                      }}
                    >
                      <span className="flex-1 truncate">{getOptionLabel(option)}</span>
                      {activeMenu.mode === "search" && getOptionTag?.(getOptionValue(option))}
                    </button>
                  ))}
                </div>
                {menuIndicator.hasOverflow ? (
                  <>
                    <div className="pointer-events-none absolute bottom-2 right-1 top-2 w-[3px] rounded-full bg-tp-slate-200/90" />
                    <div
                      className="pointer-events-none absolute right-1 w-[3px] rounded-full bg-tp-slate-400/80"
                      style={{
                        top: `${menuIndicator.thumbTop + 8}px`,
                        height: `${menuIndicator.thumbHeight}px`,
                      }}
                    />
                  </>
                ) : null}
              </div>
              {showMenuFooter ? (
                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-tp-slate-100 bg-white px-2 py-1.5 text-[11px] text-tp-slate-500 max-lg:flex-col max-lg:items-stretch">
                  {customOptionEntry ? (
                    <button
                      type="button"
                    className={[
                      "inline-flex items-center gap-2 rounded-[8px] border border-dashed px-[10px] py-[6px] text-[12px] font-semibold font-['Inter',sans-serif] max-lg:order-1 max-lg:w-full",
                      customOptionEntry.index === activeMenu.highlightedIndex
                        ? "border-tp-blue-300 bg-tp-blue-50 text-tp-blue-700"
                        : "border-tp-blue-200 bg-tp-blue-50/60 text-tp-blue-600 hover:bg-tp-blue-50",
                    ].join(" ")}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        const value = getOptionValue(customOptionEntry.option).trim()
                        if (!value) {
                          closeMenu()
                          return
                        }
                        registerCustomValue(value)
                        if (activeMenu.mode === "search") {
                          const nextRowIndex = rows.length
                          addRow(value)
                          setSearchText("")
                          closeMenu()
                          window.requestAnimationFrame(() => {
                            focusCell(nextRowIndex, 0)
                          })
                          return
                        }
                        if (activeMenu.rowId && activeMenu.colKey) {
                          setCellValue(activeMenu.rowId, activeMenu.colKey, value)
                          endDropdownEditing(`${activeMenu.rowId}:${activeMenu.colKey}`)
                        }
                        closeMenu()
                      }}
                    >
                      <Plus size={14} strokeWidth={1.5} />
                      <span className="max-w-[220px] truncate max-lg:max-w-full">
                        {`Add custom: "${getOptionValue(customOptionEntry.option)}"`}
                      </span>
                    </button>
                  ) : <span />}
                  {activeMenu.mode === "search" ? (
                    <div className="flex items-center gap-3 max-lg:order-2 max-lg:flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <kbd className="rounded border border-tp-slate-200 bg-tp-slate-50 px-1 py-0.5 text-[10px] font-semibold text-tp-slate-600">↑</kbd>
                        Up
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <kbd className="rounded border border-tp-slate-200 bg-tp-slate-50 px-1 py-0.5 text-[10px] font-semibold text-tp-slate-600">↓</kbd>
                        Down
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <kbd className="rounded border border-tp-slate-200 bg-tp-slate-50 px-1 py-0.5 text-[10px] font-semibold text-tp-slate-600">↵</kbd>
                        Enter
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <kbd className="rounded border border-tp-slate-200 bg-tp-slate-50 px-1 py-0.5 text-[10px] font-semibold text-tp-slate-600">Esc</kbd>
                        Close
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}

    </TPRxPadSection>
    </div>
  )
}

/* ── Medication allergy/interaction check helper ── */

/** Known drug-allergy keyword pairs: allergy keyword → matching drug substrings */
const DRUG_ALLERGY_MAP: Record<string, string[]> = {
  ibuprofen: ["ibuprofen", "brufen", "advil"],
  "sulfa drugs": ["sulfamethoxazole", "trimethoprim", "bactrim", "cotrimoxazole", "sulfa"],
  sulfa: ["sulfamethoxazole", "trimethoprim", "bactrim", "cotrimoxazole", "sulfa"],
  aspirin: ["aspirin", "disprin", "ecosprin"],
  penicillin: ["amoxicillin", "ampicillin", "penicillin", "augmentin"],
}

interface MedicationAlert {
  rowId: string
  medName: string
  allergen: string
}

function checkMedicationAlerts(
  medRows: TableRow[],
  allergies: string[],
): MedicationAlert[] {
  if (allergies.length === 0) return []
  const alerts: MedicationAlert[] = []
  const normalizedAllergies = allergies.map((a) => a.replace(/\s*\([^)]*\)/g, "").trim().toLowerCase())

  for (const row of medRows) {
    const medName = (row.medicine ?? "").trim().toLowerCase()
    if (!medName) continue

    for (let ai = 0; ai < normalizedAllergies.length; ai++) {
      const allergy = normalizedAllergies[ai]
      // Direct name match
      if (medName.includes(allergy) || allergy.includes(medName.split(" ")[0])) {
        alerts.push({ rowId: row.id, medName: row.medicine ?? "", allergen: allergies[ai] })
        break
      }
      // Drug-allergy map match
      const mappedDrugs = DRUG_ALLERGY_MAP[allergy]
      if (mappedDrugs?.some((drug) => medName.includes(drug))) {
        alerts.push({ rowId: row.id, medName: row.medicine ?? "", allergen: allergies[ai] })
        break
      }
    }
  }
  return alerts
}

export function RxPadFunctional({ patientId = "__patient__" }: { patientId?: string }) {
  const { lastCopyRequest, publishSignal, patientAllergies } = useRxPadSync()
  const lastHandledCopyId = useRef<number>(0)
  const symptomInitRef = useRef(false)
  const medInitRef = useRef(false)
  const dxInitRef = useRef(false)
  const symptomCountRef = useRef(0)
  const medCountRef = useRef(0)
  const dxCountRef = useRef(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Per-patient initial data
  const patientData = PER_PATIENT_RXPAD_DATA[patientId] ?? PER_PATIENT_RXPAD_DATA["__patient__"]
  const ddxSuggestions = patientData.ddxSuggestions

  const [symptomRows, setSymptomRows] = useState<TableRow[]>(() =>
    patientData.symptoms.map((r) => ({ ...r, id: getRowId("symptoms") })),
  )
  const [examinationRows, setExaminationRows] = useState<TableRow[]>(() =>
    patientData.examinations.map((r) => ({ ...r, id: getRowId("exam") })),
  )
  const [diagnosisRows, setDiagnosisRows] = useState<TableRow[]>(() =>
    patientData.diagnoses.map((r) => ({ ...r, id: getRowId("diagnosis") })),
  )
  const [medicationRows, setMedicationRows] = useState<TableRow[]>(() =>
    patientData.medications.map((r) => ({ ...r, id: getRowId("med") })),
  )
  const [adviceRows, setAdviceRows] = useState<TableRow[]>(() =>
    patientData.advice.map((r) => ({ ...r, id: getRowId("advice") })),
  )
  const [labRows, setLabRows] = useState<TableRow[]>(() =>
    patientData.labs.map((r) => ({ ...r, id: getRowId("lab") })),
  )
  const [surgeryRows, setSurgeryRows] = useState<TableRow[]>(() =>
    patientData.surgeries.map((r) => ({ ...r, id: getRowId("surgery") })),
  )

  const [additionalNotes, setAdditionalNotes] = useState(patientData.additionalNotes)
  const [followUpDate, setFollowUpDate] = useState(patientData.followUpDate)
  const [followUpNotes, setFollowUpNotes] = useState(patientData.followUpNotes)

  useEffect(() => {
    if (!symptomInitRef.current) {
      symptomInitRef.current = true
      symptomCountRef.current = symptomRows.length
      return
    }

    const currentCount = symptomRows.length
    const previousCount = symptomCountRef.current
    symptomCountRef.current = currentCount
    if (currentCount <= previousCount) return

    const latest = symptomRows[currentCount - 1]?.name?.trim()
    publishSignal({
      type: "symptoms_changed",
      label: latest || "Symptoms updated",
      count: currentCount,
    })
  }, [symptomRows, publishSignal])

  useEffect(() => {
    if (!medInitRef.current) {
      medInitRef.current = true
      medCountRef.current = medicationRows.length
      return
    }

    const currentCount = medicationRows.length
    const previousCount = medCountRef.current
    medCountRef.current = currentCount
    if (currentCount <= previousCount) return

    const latest = medicationRows[currentCount - 1]?.medicine?.trim()
    publishSignal({
      type: "medications_changed",
      label: latest || "Medication updated",
      count: currentCount,
    })
  }, [medicationRows, publishSignal])

  useEffect(() => {
    if (!dxInitRef.current) {
      dxInitRef.current = true
      dxCountRef.current = diagnosisRows.length
      return
    }

    const currentCount = diagnosisRows.length
    const previousCount = dxCountRef.current
    dxCountRef.current = currentCount
    if (currentCount <= previousCount) return

    const latest = diagnosisRows[currentCount - 1]?.name?.trim()
    publishSignal({
      type: "diagnosis_changed",
      label: latest || "Diagnosis updated",
      count: currentCount,
    })
  }, [diagnosisRows, publishSignal])

  /* Medication allergy alerts — recomputed when meds or allergies change */
  const medicationAlerts = useMemo(
    () => checkMedicationAlerts(medicationRows, patientAllergies),
    [medicationRows, patientAllergies],
  )

  /* Drug-drug interaction check for medication table */
  const tableInteractions = useMemo(
    () => checkTableInteractions(medicationRows as { id: string; medicine?: string }[]),
    [medicationRows],
  )
  const interactionRowIds = useMemo(
    () => new Set(tableInteractions.map((t) => t.rowId)),
    [tableInteractions],
  )

  /* Existing med names for search dropdown interaction check */
  const existingMedNames = useMemo(
    () => medicationRows.map((r) => (r.medicine ?? "").trim()).filter(Boolean),
    [medicationRows],
  )

  useEffect(() => {
    if (!lastCopyRequest || lastHandledCopyId.current === lastCopyRequest.id) return
    lastHandledCopyId.current = lastCopyRequest.id
    const payload = lastCopyRequest.payload

    if (payload.symptoms?.length) {
      setSymptomRows((prev) => [
        ...prev,
        ...payload.symptoms.map((item) => ({
          id: getRowId("symptoms"),
          name: item,
          since: "1 day",
          status: "Moderate",
          note: `From ${payload.sourceDateLabel}`,
        })),
      ])
    }
    if (payload.examinations?.length) {
      setExaminationRows((prev) => [
        ...prev,
        ...payload.examinations.map((item) => ({
          id: getRowId("exam"),
          name: item,
          note: `From ${payload.sourceDateLabel}`,
        })),
      ])
    }
    if (payload.diagnoses?.length) {
      setDiagnosisRows((prev) => [
        ...prev,
        ...payload.diagnoses.map((item) => ({
          id: getRowId("diagnosis"),
          name: item,
          since: "1 day",
          status: "Suspected",
          note: `From ${payload.sourceDateLabel}`,
        })),
      ])
    }
    if (payload.medications?.length) {
      setMedicationRows((prev) => [
        ...prev,
        ...payload.medications.map((item) => ({
          id: getRowId("med"),
          medicine: item.medicine,
          unitPerDose: item.unitPerDose,
          frequency: item.frequency,
          when: item.when,
          duration: item.duration,
          note: item.note || `From ${payload.sourceDateLabel}`,
        })),
      ])
    }
    if (payload.labInvestigations?.length) {
      setLabRows((prev) => [
        ...prev,
        ...payload.labInvestigations.map((item) => ({
          id: getRowId("lab"),
          investigation: item,
          note: `From ${payload.sourceDateLabel}`,
        })),
      ])
    }
    if (payload.advice) {
      setAdviceRows((prev) => [
        ...prev,
        {
          id: getRowId("advice"),
          advice: payload.advice,
          note: `From ${payload.sourceDateLabel}`,
        },
      ])
    }
    if (payload.followUpDate) {
      setFollowUpDate(payload.followUpDate)
    }
    if (payload.followUpNotes) {
      setFollowUpNotes(payload.followUpNotes)
    } else if (payload.targetSection === "followUp" && payload.additionalNotes) {
      setFollowUpNotes(payload.additionalNotes)
    } else if (payload.followUp) {
      setFollowUpNotes(payload.followUp)
    }
    if (payload.additionalNotes) {
      setAdditionalNotes(payload.additionalNotes)
    }

    setToastMessage(`Details from ${payload.sourceDateLabel} added to RxPad`)
  }, [lastCopyRequest])

  // ── Consume pending copies from sessionStorage (homepage → RxPad navigation) ──
  const pendingCopyConsumedRef = useRef(false)
  useEffect(() => {
    if (pendingCopyConsumedRef.current) return
    pendingCopyConsumedRef.current = true
    try {
      const raw = sessionStorage.getItem("pendingRxPadCopy")
      if (!raw) return
      sessionStorage.removeItem("pendingRxPadCopy")
      const payloads = JSON.parse(raw) as Array<Record<string, unknown>>
      for (const p of payloads) {
        if (p.symptoms && Array.isArray(p.symptoms)) {
          setSymptomRows((prev) => [...prev, ...(p.symptoms as string[]).map((s) => ({ id: getRowId("symptoms"), name: s, since: "1 day", status: "Moderate", note: `From ${p.sourceDateLabel ?? "Dr. Agent"}` }))])
        }
        if (p.examinations && Array.isArray(p.examinations)) {
          setExaminationRows((prev) => [...prev, ...(p.examinations as string[]).map((s) => ({ id: getRowId("exam"), name: s, note: `From ${p.sourceDateLabel ?? "Dr. Agent"}` }))])
        }
        if (p.diagnoses && Array.isArray(p.diagnoses)) {
          setDiagnosisRows((prev) => [...prev, ...(p.diagnoses as string[]).map((s) => ({ id: getRowId("diagnosis"), name: s, since: "1 day", status: "Suspected", note: `From ${p.sourceDateLabel ?? "Dr. Agent"}` }))])
        }
        if (p.labInvestigations && Array.isArray(p.labInvestigations)) {
          setLabRows((prev) => [...prev, ...(p.labInvestigations as string[]).map((s) => ({ id: getRowId("lab"), investigation: s, note: `From ${p.sourceDateLabel ?? "Dr. Agent"}` }))])
        }
      }
      if (payloads.length > 0) {
        setToastMessage("Pre-populated from Dr. Agent")
      }
    } catch { /* ignore parse errors */ }
  }, [])

  function setFollowUpByOffset(days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    const iso = date.toISOString().slice(0, 10)
    setFollowUpDate(iso)
  }

  const symptomsColumns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "name",
        label: "SYMPTOMS NAME",
        width: 275,
        minWidth: 220,
        maxWidth: 320,
        placeholder: "e.g. Fever",
        showDropdownToggle: false,
        getOptions: (query) => getCatalogOptions(symptomSuggestions, query),
      },
      {
        key: "since",
        label: "SINCE",
        width: 130,
        minWidth: 120,
        maxWidth: 140,
        placeholder: "e.g. 2 days",
        getOptions: (query, row) => getSinceOptions(getSeedQuery(query, row.since ?? "")),
        restrictToOptions: true,
      },
      {
        key: "status",
        label: "STATUS",
        width: 150,
        minWidth: 135,
        maxWidth: 170,
        placeholder: "e.g. Moderate",
        getOptions: (query) => filterByQuery(["Severe", "Moderate", "Mild"], query),
        restrictToOptions: true,
      },
      { key: "note", label: "NOTE", width: 180, minWidth: 140, maxWidth: 220, multiline: true, maxLines: 2, placeholder: "Notes" },
    ],
    [],
  )

  const examinationsColumns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "name",
        label: "EXAMINATION NAME",
        width: 300,
        minWidth: 240,
        maxWidth: 360,
        placeholder: "e.g. Left knee tenderness",
        showDropdownToggle: false,
        getOptions: (query) => getCatalogOptions(examinationSuggestions, query),
      },
      { key: "note", label: "NOTE", width: 180, minWidth: 140, maxWidth: 220, multiline: true, maxLines: 2, placeholder: "Notes" },
    ],
    [],
  )

  const diagnosisColumns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "name",
        label: "DIAGNOSIS NAME",
        width: 300,
        minWidth: 240,
        maxWidth: 360,
        placeholder: "e.g. Viral pharyngitis",
        showDropdownToggle: false,
        getOptions: (query) => getCatalogOptions(diagnosisSuggestions, query),
      },
      {
        key: "since",
        label: "SINCE",
        width: 130,
        minWidth: 120,
        maxWidth: 140,
        placeholder: "e.g. 2 days",
        getOptions: (query, row) => getSinceOptions(getSeedQuery(query, row.since ?? "")),
        restrictToOptions: true,
      },
      {
        key: "status",
        label: "STATUS",
        width: 150,
        minWidth: 135,
        maxWidth: 170,
        placeholder: "e.g. Suspected",
        getOptions: (query) => filterByQuery(["Suspected", "Ruled Out", "Confirmed"], query),
        restrictToOptions: true,
      },
      { key: "note", label: "NOTE", width: 180, minWidth: 140, maxWidth: 220, multiline: true, maxLines: 2, placeholder: "Notes" },
    ],
    [],
  )

  const medicationColumns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "medicine",
        label: "MEDICINE NAME",
        width: 240,
        minWidth: 200,
        maxWidth: 300,
        multiline: true,
        maxLines: 2,
        placeholder: "e.g. Paracetamol 650mg",
        showDropdownToggle: false,
        getOptions: (query) => getCatalogOptions(medicationSuggestions, query),
      },
      {
        key: "unitPerDose",
        label: "UNIT PER DOSE",
        width: 140,
        minWidth: 120,
        maxWidth: 160,
        placeholder: "e.g. 1 tablet",
        getOptions: (query) => getMedicationUnitOptions(query),
        restrictToOptions: true,
      },
      {
        key: "frequency",
        label: "FREQUENCY",
        width: 150,
        minWidth: 130,
        maxWidth: 170,
        placeholder: "e.g. 1-0-1",
        getOptions: (query) => getFrequencyOptions(query),
        restrictToOptions: true,
      },
      {
        key: "when",
        label: "WHEN",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        placeholder: "e.g. After Food",
        getOptions: (query) => filterByQuery(MEDICATION_WHEN_OPTIONS, query),
        restrictToOptions: true,
      },
      {
        key: "duration",
        label: "DURATION",
        width: 150,
        minWidth: 130,
        maxWidth: 190,
        placeholder: "e.g. 5 days",
        getOptions: (query, row) => getDurationOptions(getSeedQuery(query, row.duration ?? "")),
      },
      { key: "note", label: "NOTE", width: 190, minWidth: 150, maxWidth: 240, multiline: true, maxLines: 2, placeholder: "Notes" },
    ],
    [],
  )

  const adviceColumns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "advice",
        label: "ADVICE NAME",
        width: 420,
        minWidth: 320,
        maxWidth: 560,
        multiline: true,
        maxLines: 3,
        placeholder: "e.g. Drink warm water",
        showDropdownToggle: false,
        getOptions: (query) => getCatalogOptions(ADVICE_SUGGESTIONS, query),
      },
      { key: "note", label: "NOTE", width: 220, minWidth: 160, maxWidth: 260, multiline: true, maxLines: 2, placeholder: "Notes" },
    ],
    [],
  )

  const labColumns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "investigation",
        label: "INVESTIGATION NAME",
        width: 420,
        minWidth: 320,
        maxWidth: 560,
        multiline: true,
        maxLines: 2,
        placeholder: "e.g. Complete blood count",
        showDropdownToggle: false,
        getOptions: (query) => getCatalogOptions(LAB_INVESTIGATION_BASE_OPTIONS, query),
      },
      { key: "note", label: "NOTE", width: 220, minWidth: 160, maxWidth: 260, multiline: true, maxLines: 2, placeholder: "Notes" },
    ],
    [],
  )

  const surgeryColumns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "surgery",
        label: "SURGERY NAME",
        width: 420,
        minWidth: 320,
        maxWidth: 560,
        multiline: true,
        maxLines: 2,
        placeholder: "e.g. Laparoscopic appendectomy",
        showDropdownToggle: false,
        getOptions: (query) => getCatalogOptions(SURGERY_SUGGESTIONS, query),
      },
      { key: "note", label: "NOTE", width: 220, minWidth: 160, maxWidth: 260, multiline: true, maxLines: 2, placeholder: "Notes" },
    ],
    [],
  )

  return (
    <div className="space-y-4 p-4 max-lg:p-3 [&_input]:[caret-color:var(--tp-blue-500)] [&_textarea]:[caret-color:var(--tp-blue-500)] [&_input]:[caret-width:2px] [&_textarea]:[caret-width:2px]">
      <EditableTableModule
        id="symptoms"
        title="Symptoms"
        icon={<TPMedicalIcon name="Virus" variant="bulk" size={24} color="var(--tp-violet-500)" />}
        columns={symptomsColumns}
        primaryKey="name"
        rows={symptomRows}
        onChangeRows={setSymptomRows}
        searchPlaceholder="Search & Add Symptoms"
        searchSuggestions={symptomSuggestions}
        cannedChips={symptomSuggestions.slice(0, 12)}
        afterSearch={
          symptomRows.length >= 1 ? (
            <AiTriggerChip
              label="Suggest DDX"
              signalLabel="Generate differential diagnosis based on current symptoms"
              sectionId="symptoms"
              onAfterClick={() => {
                setTimeout(() => {
                  document.querySelector('[data-rxpad-module="diagnosis"]')?.scrollIntoView({ behavior: "smooth", block: "start" })
                }, 100)
              }}
            />
          ) : null
        }
      />

      <EditableTableModule
        id="examinations"
        title="Examinations"
        icon={<TPMedicalIcon name="medical service" variant="bulk" size={24} color="var(--tp-violet-500)" />}
        columns={examinationsColumns}
        primaryKey="name"
        rows={examinationRows}
        onChangeRows={setExaminationRows}
        searchPlaceholder="Search & Add Examinations"
        searchSuggestions={examinationSuggestions}
        cannedChips={examinationSuggestions.slice(0, 12)}
      />

      <EditableTableModule
        id="diagnosis"
        title="Diagnosis"
        icon={<TPMedicalIcon name="Diagnosis" variant="bulk" size={24} color="var(--tp-violet-500)" />}
        columns={diagnosisColumns}
        primaryKey="name"
        rows={diagnosisRows}
        onChangeRows={setDiagnosisRows}
        searchPlaceholder="Search & Add Diagnosis"
        searchSuggestions={diagnosisSuggestions}
        cannedChips={diagnosisSuggestions.slice(0, 12)}
        moduleDataAttr="diagnosis"
        getOptionTag={(option) => {
          const match = ddxSuggestions.some((d) => option.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(option.toLowerCase()))
          return match ? (
            <span className="shrink-0 inline-flex items-center gap-0.5 rounded bg-tp-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-tp-blue-600 whitespace-nowrap">
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" fill="currentColor" opacity={0.7} /></svg>
              DDx Match
            </span>
          ) : null
        }}
        afterSearch={
          diagnosisRows.length >= 1 ? (
            <AiTriggerChip
              label="Suggest lab tests"
              signalLabel="Suggest lab investigations based on diagnosis"
              sectionId="diagnosis"
            />
          ) : null
        }
      />

      <EditableTableModule
        id="medication"
        title="Medication (Rx)"
        icon={<TPMedicalIcon name="Tablets" variant="bulk" size={24} color="var(--tp-violet-500)" />}
        columns={medicationColumns}
        primaryKey="medicine"
        rows={medicationRows}
        onChangeRows={setMedicationRows}
        searchPlaceholder="Search & Add Medication (Rx)"
        searchSuggestions={medicationSuggestions}
        getOptionTag={(option) => {
          const hit = checkDrugInteraction(option, existingMedNames)
          return hit ? (
            <span className="shrink-0 text-[9px] text-tp-warning-600 whitespace-nowrap">⚠ Interacts with {hit.interactsWith.split(" ")[0]}</span>
          ) : null
        }}
        highlightedRowIds={interactionRowIds}
        highlightedRowTooltips={Object.fromEntries(tableInteractions.map((t) => [t.rowId, `⚠ ${t.description} — interacts with ${t.interactsWith}`]))}
        cannedChips={[
          "Paracetamol 650mg",
          "Amoxicillin 500mg",
          "Pantoprazole 40mg",
          "Cetirizine 10mg",
          "Ondansetron 4mg",
          "ORS Sachet",
          "Multivitamin",
          "Ibuprofen 400mg",
        ]}
        afterSearch={
          <div className="flex items-center gap-2 flex-wrap">
            {medicationAlerts.map((alert) => (
              <AiTriggerChip
                key={alert.rowId}
                label={`⚠ ${alert.medName} — Allergy: ${alert.allergen}`}
                signalLabel={`Check drug interaction for ${alert.medName} — patient has ${alert.allergen} allergy`}
                sectionId="medication"
                className="!border-tp-amber-300 !text-[10px]"
              />
            ))}
            {medicationRows.length >= 2 && (
              <AiTriggerChip
                label="Check interactions"
                signalLabel="Check drug interactions for current medications"
                sectionId="medication"
              />
            )}
          </div>
        }
      />

      <EditableTableModule
        id="advice"
        title="Advices"
        icon={<TPMedicalIcon name="health care" variant="bulk" size={24} color="var(--tp-violet-500)" />}
        columns={adviceColumns}
        primaryKey="advice"
        rows={adviceRows}
        onChangeRows={setAdviceRows}
        searchPlaceholder="Search & Add Advice"
        cannedChips={ADVICE_SUGGESTIONS}
        afterSearch={
          <div className="flex items-center gap-2">
            {adviceRows.length >= 1 && (
              <AiTriggerChip
                label="Translate advices"
                signalLabel="Translate advice to patient's language"
                sectionId="advice"
              />
            )}
            <AiTriggerChip
              label="Generate advices"
              signalLabel="Generate advice based on this consultation"
              sectionId="advice"
            />
          </div>
        }
      />

      <EditableTableModule
        id="lab"
        title="Lab Investigation"
        icon={<TPMedicalIcon name="Test Tube" variant="bulk" size={24} color="var(--tp-violet-500)" />}
        columns={labColumns}
        primaryKey="investigation"
        rows={labRows}
        onChangeRows={setLabRows}
        searchPlaceholder="Search & Add Lab Investigation"
        cannedChips={LAB_INVESTIGATION_BASE_OPTIONS}
        afterSearch={
          diagnosisRows.length >= 1 ? (
            <AiTriggerChip
              label="Suggest investigations"
              signalLabel="Suggest lab investigations based on diagnosis"
              sectionId="lab"
            />
          ) : null
        }
      />

      <EditableTableModule
        id="surgery"
        title="Surgery"
        icon={<TPMedicalIcon name="surgical-scissors-02" variant="bulk" size={24} color="var(--tp-violet-500)" />}
        columns={surgeryColumns}
        primaryKey="surgery"
        rows={surgeryRows}
        onChangeRows={setSurgeryRows}
        searchPlaceholder="Search & Add Surgery"
        cannedChips={SURGERY_SUGGESTIONS}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TPRxPadSection
          title="Additional Notes"
          icon={<Notepad2 size={24} variant="Bulk" color="var(--tp-violet-500)" />}
          showHeaderActions={false}
        >
          <textarea
            value={additionalNotes}
            onChange={(event) => setAdditionalNotes(event.currentTarget.value)}
            rows={5}
            className="w-full rounded-[10px] border border-tp-slate-300 bg-white px-3 py-2 text-[14px] font-['Inter',sans-serif] text-tp-slate-700 placeholder:text-tp-slate-400 transition-colors hover:border-tp-slate-400 focus:border-tp-blue-500 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/20"
            placeholder="Enter additional notes"
          />
        </TPRxPadSection>

        <TPRxPadSection
          title="Follow-up"
          icon={<Calendar2 size={24} variant="Bulk" color="var(--tp-violet-500)" />}
          showHeaderActions={false}
        >
          <div className="space-y-2">
            <input
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.currentTarget.value)}
              className="h-[42px] w-full rounded-[10px] border border-tp-slate-300 bg-white px-3 py-2 text-[14px] font-['Inter',sans-serif] text-tp-slate-700 placeholder:text-tp-slate-400 transition-colors hover:border-tp-slate-400 focus:border-tp-blue-500 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/20"
              placeholder="Select follow-up date"
            />
            <textarea
              value={followUpNotes}
              onChange={(event) => setFollowUpNotes(event.currentTarget.value)}
              rows={3}
              className="w-full rounded-[10px] border border-tp-slate-300 bg-white px-3 py-2 text-[14px] font-['Inter',sans-serif] text-tp-slate-700 placeholder:text-tp-slate-400 transition-colors hover:border-tp-slate-400 focus:border-tp-blue-500 focus:outline-none focus:ring-2 focus:ring-tp-blue-500/20"
              placeholder="Follow-up notes/instructions for patient reminder"
            />
            <div className="flex flex-wrap gap-2">
              {[
                { label: "2 days", days: 2 },
                { label: "1 week", days: 7 },
                { label: "1 month", days: 30 },
                { label: "3 months", days: 90 },
              ].map((quick) => (
                <button
                  key={quick.label}
                  type="button"
                  className="rounded-lg border border-tp-blue-200 bg-tp-blue-50 px-3 py-1.5 text-[14px] font-medium font-['Inter',sans-serif] text-tp-blue-600 hover:bg-tp-blue-100"
                  onClick={() => setFollowUpByOffset(quick.days)}
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>
        </TPRxPadSection>
      </div>

      <TPSnackbar
        open={Boolean(toastMessage)}
        message={toastMessage ?? ""}
        severity="success"
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={1800}
        onClose={() => setToastMessage(null)}
      />
    </div>
  )
}

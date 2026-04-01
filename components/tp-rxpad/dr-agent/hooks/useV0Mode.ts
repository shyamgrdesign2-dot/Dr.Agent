"use client"

import { useState, useEffect, useCallback } from "react"

const V0_KEY = "dr-agent-v0-mode"

/**
 * Shared V0 mode hook — persists toggle state in localStorage
 * and syncs across pages/components via storage + custom events.
 */
export function useV0Mode() {
  const [isV0Mode, setIsV0ModeState] = useState(false)

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(V0_KEY)
    if (stored === "true") setIsV0ModeState(true)
  }, [])

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === V0_KEY) setIsV0ModeState(e.newValue === "true")
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setIsV0Mode = useCallback((val: boolean) => {
    setIsV0ModeState(val)
    localStorage.setItem(V0_KEY, String(val))
    // Dispatch custom event for same-page listeners
    window.dispatchEvent(new CustomEvent("v0-mode-change", { detail: val }))
  }, [])

  // Listen for same-page custom events
  useEffect(() => {
    function onCustom(e: Event) {
      setIsV0ModeState((e as CustomEvent).detail)
    }
    window.addEventListener("v0-mode-change", onCustom)
    return () => window.removeEventListener("v0-mode-change", onCustom)
  }, [])

  return { isV0Mode, setIsV0Mode }
}

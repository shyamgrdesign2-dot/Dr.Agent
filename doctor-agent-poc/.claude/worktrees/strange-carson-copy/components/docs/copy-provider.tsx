"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { CopyToast } from "@/components/design-system/copy-toast"

interface CopyContextValue {
  /** Copy text to clipboard and show a toast */
  handleCopy: (text: string, message: string) => void
}

const CopyContext = createContext<CopyContextValue | null>(null)

export function useCopy() {
  const ctx = useContext(CopyContext)
  if (!ctx) throw new Error("useCopy must be used within <CopyProvider>")
  return ctx
}

/** Wraps pages with shared copy-to-clipboard toast state */
export function CopyProvider({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)

  const handleCopy = useCallback((text: string, message: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setToastMessage(message)
    setToastVisible(true)
  }, [])

  return (
    <CopyContext.Provider value={{ handleCopy }}>
      {children}
      <CopyToast
        message={toastMessage}
        show={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </CopyContext.Provider>
  )
}

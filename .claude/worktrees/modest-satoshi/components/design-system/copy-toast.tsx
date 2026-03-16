"use client"

import { useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

interface CopyToastProps {
  message: string
  show: boolean
  onClose: () => void
}

export function CopyToast({ message, show, onClose }: CopyToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-tp-slate-900 text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <span className="inline-flex flex-shrink-0 items-center justify-center"><CheckCircle2 size={16} className="text-tp-blue-300" /></span>
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { DocsSidebar } from "./docs-sidebar"
import { ExportPanel } from "@/components/design-system/export-panel"
import { useCopy } from "./copy-provider"

export function DocsHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { handleCopy } = useCopy()

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-tp-slate-200/80 bg-white/90 backdrop-blur-sm px-4 lg:px-6">
        {/* Mobile hamburger */}
        <button
          className="mr-3 rounded-lg p-1.5 text-tp-slate-500 hover:bg-tp-slate-100 hover:text-tp-slate-700 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        {/* Logo (mobile only) */}
        <Link href="/" className="mr-auto lg:hidden">
          <span className="text-sm font-bold text-tp-slate-900">TP Design System</span>
        </Link>

        {/* Spacer for desktop */}
        <div className="mr-auto hidden lg:block" />

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ExportPanel onExport={(msg) => handleCopy("", msg)} />
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-tp-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                className="rounded-lg p-1.5 text-tp-slate-500 hover:bg-tp-slate-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X size={22} />
              </button>
            </div>
            <DocsSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

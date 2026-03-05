"use client"

import Link from "next/link"
import { docsNavigation } from "@/lib/docs-navigation"
import {
  Palette,
  Type,
  LayoutGrid,
  Circle,
  Star,
  MousePointer,
  Pencil,
  Table,
  Bell,
  Route,
  Layers,
  Zap,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  Colorfilter: Palette, Text: Type, Grid2: LayoutGrid, Blur: Circle, Star, Mouse: MousePointer, Edit2: Pencil, TableDocument: Table, Notification: Bell, Routing2: Route, Layer: Layers, Flash: Zap,
}

export default function DocsOverview() {
  return (
    <div>
      {/* Hero */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#4B4AD5] via-[#6C5CE7] to-[#A461D8] p-8 text-white shadow-lg lg:p-12">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            TatvaPractice
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight font-heading lg:text-4xl">
            Design System
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 lg:text-base">
            MUI-based component library themed for clinical workflows. Locked brand
            colors, gradient rules, semantic tokens, and production-ready components.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              React 19
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              Next.js 16
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              MUI 7
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              Tailwind 4
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              Lucide
            </span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
      </div>

      {/* Navigation Cards */}
      {docsNavigation.map((group) => (
        <div key={group.label} className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-tp-slate-400">
            {group.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const Icon = iconMap[item.icon]
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group rounded-xl border border-tp-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(23,23,37,0.06)] ring-1 ring-tp-slate-100/50 transition-all hover:border-tp-blue-200 hover:shadow-md hover:ring-tp-blue-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tp-blue-50 text-tp-blue-600 group-hover:bg-tp-blue-100 transition-colors">
                      {Icon && <Icon size={20} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-tp-slate-900 group-hover:text-tp-blue-700 transition-colors">
                        {item.label}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-xs leading-relaxed text-tp-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

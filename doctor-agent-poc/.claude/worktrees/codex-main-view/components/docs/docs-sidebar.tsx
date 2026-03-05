"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  LayoutDashboard,
} from "lucide-react"

/** Map icon name string → component for sidebar rendering */
const iconMap: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  Colorfilter: Palette,
  Text: Type,
  Grid2: LayoutGrid,
  Blur: Circle,
  Star,
  Mouse: MousePointer,
  Edit2: Pencil,
  TableDocument: Table,
  Notification: Bell,
  Routing2: Route,
  Layer: Layers,
  Flash: Zap,
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const Icon = iconMap[name]
  if (!Icon) return null
  return (
    <Icon
      size={18}
      className={active ? "text-tp-blue-600" : "text-tp-slate-400 group-hover:text-tp-slate-600"}
    />
  )
}

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex h-full flex-col" aria-label="Documentation">
      {/* Logo area */}
      <div className="shrink-0 px-5 pt-6 pb-4">
        <Link href="/" className="block" onClick={onNavigate}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-tp-slate-400">
            TatvaPractice
          </p>
          <p className="mt-0.5 text-[15px] font-bold text-tp-slate-900 tracking-tight">
            Design System
          </p>
        </Link>
      </div>

      {/* Overview link */}
      <div className="px-3">
        <Link
          href="/"
          onClick={onNavigate}
          className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-tp-blue-50 text-tp-blue-700"
              : "text-tp-slate-600 hover:bg-tp-slate-50 hover:text-tp-slate-900"
          }`}
        >
          <LayoutDashboard
            size={18}
            className={pathname === "/" ? "text-tp-blue-600" : "text-tp-slate-400 group-hover:text-tp-slate-600"}
          />
          Overview
        </Link>
      </div>

      {/* Nav groups */}
      <div className="mt-4 flex-1 overflow-y-auto px-3 pb-6">
        {docsNavigation.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-tp-slate-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-tp-blue-50 text-tp-blue-700"
                        : "text-tp-slate-600 hover:bg-tp-slate-50 hover:text-tp-slate-900"
                    }`}
                  >
                    <NavIcon name={item.icon} active={isActive} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}

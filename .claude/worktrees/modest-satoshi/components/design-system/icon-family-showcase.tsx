"use client"

import { useMemo, useState } from "react"
import {
  Home,
  LayoutGrid,
  Bell,
  Settings,
  User,
  HeartPulse,
  Calendar,
  FileText,
  Activity,
  Clipboard,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
  Search,
  Copy,
  Star,
  BarChart2,
  Clock,
  type LucideIcon,
} from "lucide-react"

type IconTone = "neutral" | "brand" | "inverse"
type IconState = "default" | "hover" | "active"

const iconSet: { name: string; icon: LucideIcon }[] = [
  { name: "Home", icon: Home },
  { name: "Grid", icon: LayoutGrid },
  { name: "Bell", icon: Bell },
  { name: "Settings", icon: Settings },
  { name: "User", icon: User },
  { name: "Vitals", icon: HeartPulse },
  { name: "Calendar", icon: Calendar },
  { name: "File", icon: FileText },
  { name: "Activity", icon: Activity },
  { name: "Clipboard", icon: Clipboard },
  { name: "Add", icon: Plus },
  { name: "Edit", icon: Pencil },
  { name: "Delete", icon: Trash2 },
  { name: "Upload", icon: Upload },
  { name: "Download", icon: Download },
  { name: "Success", icon: CheckCircle2 },
  { name: "Close", icon: XCircle },
  { name: "Warning", icon: AlertTriangle },
  { name: "Info", icon: Info },
  { name: "Shield", icon: Shield },
  { name: "Search", icon: Search },
  { name: "Copy", icon: Copy },
  { name: "Star", icon: Star },
  { name: "Chart", icon: BarChart2 },
  { name: "Clock", icon: Clock },
]

const semanticContexts = [
  {
    title: "Neutral / Default",
    token: "TP.icon.default",
    bg: "var(--tp-slate-100)",
    fg: "var(--tp-slate-600)",
    note: "Tables, form adornments, neutral clickable icons.",
  },
  {
    title: "Neutral / Hover",
    token: "TP.icon.hover",
    bg: "var(--tp-slate-200)",
    fg: "var(--tp-slate-800)",
    note: "Hover and focused neutral interactions.",
  },
  {
    title: "Neutral / Active",
    token: "TP.icon.active-neutral",
    bg: "var(--tp-slate-300)",
    fg: "var(--tp-slate-900)",
    note: "Selected neutral actions in dense utility zones.",
  },
  {
    title: "Brand / Default",
    token: "TP.icon.brand-soft",
    bg: "rgba(75,74,213,0.1)",
    fg: "var(--tp-blue-500)",
    note: "Primary sidebar default on light surfaces.",
  },
  {
    title: "Brand / Active",
    token: "TP.icon.brand-active",
    bg: "var(--tp-blue-500)",
    fg: "var(--tp-slate-0)",
    note: "Selected tab/sidebar items and key clickables.",
  },
  {
    title: "Informative / Violet",
    token: "TP.icon.informative",
    bg: "rgba(164,97,216,0.15)",
    fg: "var(--tp-violet-600)",
    note: "Informative and educational only (non-clickable).",
  },
] as const

function getToneColor(tone: IconTone) {
  if (tone === "brand") return "var(--tp-blue-500)"
  if (tone === "inverse") return "var(--tp-slate-0)"
  return "var(--tp-slate-500)"
}

function IconTile({
  icon: Icon,
  name,
  state,
  tone,
}: {
  icon: LucideIcon
  name: string
  state: IconState
  tone: IconTone
}) {
  const color = getToneColor(tone)
  const bgClass =
    state === "active" ? "bg-tp-blue-50 border-tp-blue-100" : "bg-tp-slate-50 border-transparent"

  return (
    <div className={`rounded-xl border bg-white p-3 ${state === "active" ? "border-tp-blue-200" : "border-tp-slate-200"}`}>
      <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg border ${bgClass}`}>
        <Icon
          size={20}
          color={color}
        />
      </div>
      <p className="truncate text-[11px] font-medium text-tp-slate-700">{name}</p>
      <p className="mt-0.5 text-[10px] text-tp-slate-500">{state}</p>
    </div>
  )
}

export function IconFamilyShowcase() {
  const [selectedState, setSelectedState] = useState<IconState>("default")
  const [surface, setSurface] = useState<"light" | "dark">("light")

  const surfaceTone = useMemo<IconTone>(() => {
    if (surface === "dark") return "inverse"
    return selectedState === "default" ? "neutral" : "brand"
  }, [selectedState, surface])

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-tp-slate-500">Icon Family</h3>
        <p className="mt-1 text-xs text-tp-slate-600">
          Lucide icon set used in product. Icons are stroked at <strong>default</strong> state and
          filled / colored for <strong>active</strong> and <strong>hover</strong> states.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {(["default", "hover", "active"] as const).map((state) => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                selectedState === state ? "bg-tp-blue-50 text-tp-blue-700" : "bg-tp-slate-100 text-tp-slate-600"
              }`}
            >
              {state}
            </button>
          ))}
          <button
            onClick={() => setSurface((prev) => (prev === "light" ? "dark" : "light"))}
            className="rounded-md bg-tp-slate-100 px-2.5 py-1 text-xs font-semibold text-tp-slate-700"
          >
            Surface: {surface}
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${surface === "dark" ? "border-white/20 bg-tp-blue-800" : "border-tp-slate-200 bg-white"}`}>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${surface === "dark" ? "text-white/80" : "text-tp-slate-500"}`}>
              Default Set
            </p>
            <div className="grid grid-cols-2 gap-2">
              {iconSet.slice(0, 4).map((item) => (
                <IconTile
                  key={`set1-${item.name}`}
                  icon={item.icon}
                  name={item.name}
                  state={selectedState}
                  tone={surfaceTone}
                />
              ))}
            </div>
          </div>

          <div>
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${surface === "dark" ? "text-white/80" : "text-tp-slate-500"}`}>
              Clinical Set
            </p>
            <div className="grid grid-cols-2 gap-2">
              {iconSet.slice(4, 8).map((item) => (
                <IconTile
                  key={`set2-${item.name}`}
                  icon={item.icon}
                  name={item.name}
                  state={selectedState}
                  tone={surfaceTone}
                />
              ))}
            </div>
          </div>

          <div>
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${surface === "dark" ? "text-white/80" : "text-tp-slate-500"}`}>
              Utility Set
            </p>
            <div className="grid grid-cols-2 gap-2">
              {iconSet.slice(8, 12).map((item) => (
                <IconTile
                  key={`set3-${item.name}`}
                  icon={item.icon}
                  name={item.name}
                  state={selectedState}
                  tone={surfaceTone}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-tp-slate-800">Semantic Icon Contexts</p>
        <p className="mt-1 text-xs text-tp-slate-600">
          Standardized icon color systems for neutral, clickable brand, and informative contexts.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {semanticContexts.map((ctx) => (
            <div key={ctx.title} className="rounded-lg border border-tp-slate-200 bg-tp-slate-50/40 p-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: ctx.bg }}
                >
                  <span className="inline-flex flex-shrink-0"><Calendar size={20} color={ctx.fg} /></span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-tp-slate-800">{ctx.title}</p>
                  <p className="truncate text-[11px] font-mono text-tp-slate-500">{ctx.token}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-tp-slate-600">{ctx.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-tp-slate-200 bg-tp-slate-50 p-4 text-xs text-tp-slate-600">
        <p className="font-semibold text-tp-slate-700">Constraints</p>
        <p className="mt-1">
          Sizes: 16/20/24. For clickable nav patterns (sidebar, tabs, segmented): default uses stroke weight 1.5,
          active and hover states use color fills via className or style props. Lucide icons do not have variant
          props — use color and strokeWidth props instead.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

/* ── TokenBadge ──────────────────────────────────────────────
   Small inline chip that shows a token name + optional value.
   Click to copy the token name. Used throughout the design
   system docs to annotate every element with its token ref.
   ──────────────────────────────────────────────────────────── */

interface TokenBadgeProps {
  /** Token name, e.g. "TP.bg.surface" */
  token: string
  /** Resolved value, e.g. "#FFFFFF" or "16px" */
  value?: string
  /** Visual variant */
  variant?: "default" | "subtle" | "dark"
  /** Additional class names */
  className?: string
}

export function TokenBadge({ token, value, variant = "default", className = "" }: TokenBadgeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const base = "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold cursor-pointer transition-all group"
  const variants = {
    default: "bg-tp-blue-50 text-tp-blue-700 hover:bg-tp-blue-100 border border-tp-blue-100",
    subtle: "bg-tp-slate-100 text-tp-slate-600 hover:bg-tp-slate-200 border border-tp-slate-200",
    dark: "bg-tp-slate-800 text-tp-slate-200 hover:bg-tp-slate-700 border border-tp-slate-700",
  }

  return (
    <button onClick={handleCopy} className={`${base} ${variants[variant]} ${className}`} title={`Copy: ${token}`}>
      <span className="truncate max-w-[200px]">{token}</span>
      {value && (
        <span className={`${variant === "dark" ? "text-tp-slate-400" : "text-tp-slate-400"} font-normal`}>
          {value}
        </span>
      )}
      {copied ? (
        <Check size={10} className="text-tp-success-500 shrink-0" />
      ) : (
        <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  )
}

/* ── TokenRow ─────────────────────────────────────────────────
   Full-width row with token name, value, CSS variable, and
   Tailwind class — used in foundation tables.
   ──────────────────────────────────────────────────────────── */

interface TokenRowProps {
  token: string
  value: string
  cssVar?: string
  twClass?: string
  usage?: string
}

export function TokenRow({ token, value, cssVar, twClass, usage }: TokenRowProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5 text-[11px]">
      <button
        onClick={() => void copy(token, "token")}
        className="inline-flex items-center gap-1 rounded-md bg-tp-blue-50 px-2 py-0.5 font-mono font-semibold text-tp-blue-700 hover:bg-tp-blue-100 border border-tp-blue-100 transition-colors"
      >
        {token}
        {copied === "token" ? <Check size={9} className="text-tp-success-500" /> : <Copy size={9} className="opacity-0 group-hover:opacity-100" />}
      </button>
      <span className="font-mono text-tp-slate-500">{value}</span>
      {cssVar && (
        <button
          onClick={() => void copy(cssVar, "css")}
          className="inline-flex items-center gap-1 rounded-md bg-tp-slate-100 px-2 py-0.5 font-mono text-tp-slate-600 hover:bg-tp-slate-200 border border-tp-slate-200 transition-colors"
        >
          {cssVar}
          {copied === "css" && <Check size={9} className="text-tp-success-500" />}
        </button>
      )}
      {twClass && (
        <button
          onClick={() => void copy(twClass, "tw")}
          className="inline-flex items-center gap-1 rounded-md bg-tp-violet-50 px-2 py-0.5 font-mono text-tp-violet-600 hover:bg-tp-violet-100 border border-tp-violet-100 transition-colors"
        >
          {twClass}
          {copied === "tw" && <Check size={9} className="text-tp-success-500" />}
        </button>
      )}
      {usage && <span className="text-tp-slate-400">{usage}</span>}
    </div>
  )
}

/* ── TokenPanel ───────────────────────────────────────────────
   Collapsible panel that shows all tokens used by a component.
   Placed directly below each component demo.
   ──────────────────────────────────────────────────────────── */

interface TokenSpec {
  token: string
  value: string
  cssVar?: string
  property?: string
  description?: string
}

interface TokenPanelProps {
  title?: string
  tokens: TokenSpec[]
  defaultOpen?: boolean
}

export function TokenPanel({ title = "Design Tokens", tokens, defaultOpen = false }: TokenPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const copyToken = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1200)
  }

  return (
    <div className="mt-4 rounded-xl border border-tp-slate-200 bg-tp-slate-50/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-tp-slate-600 hover:bg-tp-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tp-blue-500" />
          {title}
          <span className="text-tp-slate-400 font-normal">({tokens.length} tokens)</span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-tp-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-tp-slate-50 border-b border-tp-slate-200">
                  <th className="px-4 py-2 text-left font-semibold text-tp-slate-600 whitespace-nowrap">Property</th>
                  <th className="px-4 py-2 text-left font-semibold text-tp-slate-600 whitespace-nowrap">Token</th>
                  <th className="px-4 py-2 text-left font-semibold text-tp-slate-600 whitespace-nowrap">Value</th>
                  <th className="px-4 py-2 text-left font-semibold text-tp-slate-600 whitespace-nowrap hidden lg:table-cell">CSS Variable</th>
                  <th className="px-4 py-2 text-left font-semibold text-tp-slate-600 whitespace-nowrap hidden xl:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t, i) => (
                  <tr key={`${t.token}-${i}`} className="border-b border-tp-slate-100 last:border-b-0 hover:bg-tp-blue-50/30 transition-colors">
                    <td className="px-4 py-2 text-tp-slate-500 whitespace-nowrap">{t.property || "—"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => void copyToken(t.token, i)}
                        className="inline-flex items-center gap-1 rounded bg-tp-blue-50 px-1.5 py-0.5 font-mono font-semibold text-tp-blue-700 hover:bg-tp-blue-100 transition-colors"
                      >
                        {t.token}
                        {copiedIdx === i ? (
                          <Check size={9} className="text-tp-success-500" />
                        ) : (
                          <Copy size={9} className="opacity-40" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-2 font-mono text-tp-slate-600 whitespace-nowrap">
                      {t.value.startsWith("#") || t.value.startsWith("rgb") ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm border border-tp-slate-200 shrink-0" style={{ backgroundColor: t.value }} />
                          {t.value}
                        </span>
                      ) : (
                        t.value
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-tp-slate-400 whitespace-nowrap hidden lg:table-cell">{t.cssVar || "—"}</td>
                    <td className="px-4 py-2 text-tp-slate-400 hidden xl:table-cell">{t.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

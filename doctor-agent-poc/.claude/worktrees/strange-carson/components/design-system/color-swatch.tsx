"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import type { SemanticToken } from "@/lib/design-tokens"

interface SwatchProps {
  token: number | string
  value: string
  usage?: string
  /** CSS variable prefix e.g. "tp-blue" to generate --tp-blue-500 */
  cssPrefix?: string
  onCopy: (text: string, message: string) => void
}

export function ColorSwatch({ token, value, usage, cssPrefix, onCopy }: SwatchProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const isDark = typeof token === "number" ? token >= 500 : true

  const cssVar = cssPrefix ? `--${cssPrefix}-${token}` : null
  const twClass = cssPrefix ? `${cssPrefix}-${token}` : null

  const handleCopyItem = async (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopiedItem(label)
    onCopy(text, `Copied ${label}`)
    setTimeout(() => setCopiedItem(null), 1200)
  }

  return (
    <div className="group relative flex flex-col gap-2 text-left">
      <button
        className="h-24 w-full rounded-xl shadow-sm border border-foreground/5 transition-transform group-hover:scale-105 flex items-end justify-between p-3 cursor-pointer"
        onClick={() => onCopy(value, `Copied ${value} (${token})`)}
        style={{ backgroundColor: value }}
        aria-label={`Copy color ${value}, token ${token}`}
      >
        <span
          className={`text-xs font-bold font-mono ${isDark ? "text-primary-foreground/90" : "text-tp-slate-900/70"}`}
        >
          {token}
        </span>
        <div
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full ${isDark ? "bg-primary-foreground/20 text-primary-foreground" : "bg-foreground/10 text-tp-slate-900"}`}
        >
          <span className="inline-flex flex-shrink-0"><Copy size={14} /></span>
        </div>
      </button>
      <div className="flex flex-col gap-1 px-1">
        <span className="text-xs font-mono text-tp-slate-500 uppercase">{value}</span>
        {cssVar && (
          <button
            onClick={(e) => void handleCopyItem(cssVar, cssVar, e)}
            className="inline-flex items-center gap-1 self-start rounded bg-tp-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-tp-slate-500 hover:bg-tp-slate-200 hover:text-tp-slate-700 border border-tp-slate-200 transition-colors cursor-pointer"
          >
            {cssVar}
            {copiedItem === cssVar ? <Check size={8} className="text-green-500" /> : <Copy size={8} className="opacity-0 group-hover:opacity-60" />}
          </button>
        )}
        {twClass && (
          <button
            onClick={(e) => void handleCopyItem(`text-${twClass}`, twClass, e)}
            className="inline-flex items-center gap-1 self-start rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[9px] text-purple-500 hover:bg-purple-100 hover:text-purple-700 border border-purple-100 transition-colors cursor-pointer"
          >
            text-{twClass}
            {copiedItem === twClass ? <Check size={8} className="text-green-500" /> : null}
          </button>
        )}
        {usage && (
          <span className="text-[10px] text-tp-slate-600 leading-tight">{usage}</span>
        )}
      </div>
    </div>
  )
}

interface SemanticSwatchProps {
  token: SemanticToken
  onCopy: (text: string, message: string) => void
}

export function SemanticSwatch({ token, onCopy }: SemanticSwatchProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const isGradient = token.value === "AI Gradient" || token.value.startsWith("rgba")
  const previewBg = isGradient
    ? "linear-gradient(91deg, #D565EA 3.04%, #673AAC 66.74%, #1A1994 130.45%)"
    : token.value

  // Generate CSS variable from semantic token name: TP.text.primary → --tp-text-primary
  const cssVar = `--${token.token.replace(/\./g, "-").toLowerCase()}`

  const handleCopyItem = async (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopiedItem(label)
    onCopy(text, `Copied ${label}`)
    setTimeout(() => setCopiedItem(null), 1200)
  }

  return (
    <div
      className="group flex items-start gap-4 p-4 rounded-xl border border-tp-slate-200 hover:border-tp-slate-300 hover:bg-tp-slate-50 transition-all bg-card text-left w-full"
    >
      <div
        className="w-14 h-14 rounded-lg shadow-inner border border-foreground/5 flex-shrink-0 cursor-pointer"
        style={{ background: previewBg }}
        onClick={() => onCopy(token.value, `Copied ${token.value}`)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <button
            className="font-bold text-tp-slate-900 text-sm font-mono truncate cursor-pointer hover:text-tp-blue-700 transition-colors"
            onClick={(e) => void handleCopyItem(token.token, "token", e)}
          >
            {token.token}
            {copiedItem === "token" && <Check size={12} className="inline ml-1 text-green-500" />}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-tp-slate-500 bg-tp-slate-100 px-2 py-0.5 rounded-full">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: previewBg }}
            />
            {token.source}
          </span>
          {!isGradient && (
            <code className="text-xs font-mono text-tp-slate-400">
              {token.value}
            </code>
          )}
          <button
            onClick={(e) => void handleCopyItem(cssVar, "css", e)}
            className="inline-flex items-center gap-1 rounded bg-tp-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-tp-slate-500 hover:bg-tp-slate-200 hover:text-tp-slate-700 border border-tp-slate-200 transition-colors cursor-pointer"
          >
            {cssVar}
            {copiedItem === "css" ? <Check size={8} className="text-green-500" /> : <Copy size={8} className="opacity-0 group-hover:opacity-60" />}
          </button>
        </div>
        <p className="text-xs text-tp-slate-600 leading-relaxed">{token.usage}</p>
      </div>
      <button
        className="opacity-0 group-hover:opacity-100 text-tp-slate-400 self-center inline-flex flex-shrink-0 cursor-pointer hover:text-tp-blue-500 transition-colors"
        onClick={(e) => void handleCopyItem(token.token, "token", e)}
      >
        <span className="inline-flex flex-shrink-0"><Copy size={16} /></span>
      </button>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Download, FileText, ChevronDown, Upload, CheckCircle2, Star, Package, Code2, Layout } from "lucide-react"
import {
  exportForFigma,
  exportFormats,
  type FigmaExportFormat,
} from "@/lib/export-figma"
import { exportReactLibrary } from "@/lib/export-library"
import { exportComponentSpecs } from "@/lib/export-component-specs"
import { exportFigmaHtml } from "@/lib/export-figma-html"

type ExportStatus = FigmaExportFormat | "react-library" | "component-specs" | "figma-html" | null

export function ExportPanel({
  onExport,
}: {
  onExport?: (msg: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [exported, setExported] = useState<ExportStatus>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleExport(format: FigmaExportFormat) {
    exportForFigma(format)
    setExported(format)
    const fmt = exportFormats.find((f) => f.id === format)
    onExport?.(`Exported ${fmt?.name} JSON`)
    setTimeout(() => setExported(null), 2000)
  }

  async function handleReactLibrary() {
    setExported("react-library")
    setProgress("Starting export...")
    try {
      await exportReactLibrary((step) => setProgress(step))
      onExport?.("Exported React Component Library ZIP")
    } catch (err) {
      console.error("Library export failed:", err)
      setProgress("Export failed — check console")
    }
    setTimeout(() => {
      setExported(null)
      setProgress(null)
    }, 2000)
  }

  function handleComponentSpecs() {
    exportComponentSpecs()
    setExported("component-specs")
    onExport?.("Exported Component Specifications JSON")
    setTimeout(() => setExported(null), 2000)
  }

  function handleFigmaHtml() {
    exportFigmaHtml()
    setExported("figma-html")
    onExport?.("Exported Figma HTML Preview")
    setTimeout(() => setExported(null), 2000)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all shadow-sm text-white"
        style={{
          backgroundColor: "#4B4AD5",
          borderRadius: "12px",
          fontSize: "14px",
        }}
      >
        <span className="inline-flex flex-shrink-0"><Download size={18} /></span>
        <span className="hidden sm:inline">Export Library</span>
        <span className="inline-flex flex-shrink-0"><ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        /></span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[500px] rounded-xl border border-tp-slate-200 bg-card shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          {/* ─── React Library Export (Hero) ─── */}
          <div className="px-5 py-4 border-b border-tp-slate-100" style={{ background: "linear-gradient(135deg, #EEEEFF 0%, #FAF5FE 100%)" }}>
            <button
              onClick={handleReactLibrary}
              className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-tp-blue-300 bg-white hover:border-tp-blue-500 transition-all text-left shadow-sm hover:shadow-md"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: exported === "react-library" ? "#ECFDF5" : "#4B4AD5" }}
              >
                {exported === "react-library" ? (
                  <CheckCircle2 size={22} style={{ color: "#10B981" }} />
                ) : (
                  <Package size={22} style={{ color: "#FFFFFF" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-tp-slate-900">React Component Library</span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: "#4B4AD5" }}
                  >
                    New
                  </span>
                  <code className="text-[10px] font-mono text-tp-slate-400 bg-tp-slate-100 px-1.5 py-0.5 rounded">.zip</code>
                </div>
                <p className="text-xs text-tp-slate-500 mt-1 leading-relaxed">
                  Complete source-code package with all 47 components, design tokens, MUI theme, Tailwind config, and setup instructions. Drop into any React/Next.js project.
                </p>
                {progress && exported === "react-library" && (
                  <p className="text-[11px] text-tp-blue-500 mt-1 font-medium">{progress}</p>
                )}
              </div>
              <Download size={16} className="text-tp-blue-400 flex-shrink-0 mt-1" />
            </button>
          </div>

          {/* ─── Figma / Designer Exports ─── */}
          <div className="px-5 py-3 border-b border-tp-slate-100 bg-tp-slate-50">
            <h3 className="text-xs font-bold text-tp-slate-600 uppercase tracking-wider">
              Figma & Designer Exports
            </h3>
          </div>

          <div className="p-3 flex flex-col gap-2">
            {/* Component Specs */}
            <button
              onClick={handleComponentSpecs}
              className="group w-full flex items-start gap-3 p-3 rounded-lg border border-tp-slate-100 hover:border-tp-blue-200 hover:bg-tp-blue-50 transition-all text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: exported === "component-specs" ? "#ECFDF5" : "#EEEEFF" }}
              >
                {exported === "component-specs" ? (
                  <CheckCircle2 size={18} style={{ color: "#10B981" }} />
                ) : (
                  <Code2 size={18} style={{ color: "#4B4AD5" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-tp-slate-900">Component Specs</span>
                  <code className="text-[10px] font-mono text-tp-slate-400 bg-tp-slate-100 px-1.5 py-0.5 rounded">.json</code>
                </div>
                <p className="text-xs text-tp-slate-500 mt-0.5 leading-relaxed">
                  Detailed specifications for all 47 components — props, variants, states, and token references for Figma component building.
                </p>
              </div>
              <Upload size={14} className="text-tp-slate-300 group-hover:text-tp-blue-400 transition-colors flex-shrink-0 mt-1" />
            </button>

            {/* HTML Preview for html.to.design */}
            <button
              onClick={handleFigmaHtml}
              className="group w-full flex items-start gap-3 p-3 rounded-lg border border-tp-slate-100 hover:border-tp-blue-200 hover:bg-tp-blue-50 transition-all text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: exported === "figma-html" ? "#ECFDF5" : "#EEEEFF" }}
              >
                {exported === "figma-html" ? (
                  <CheckCircle2 size={18} style={{ color: "#10B981" }} />
                ) : (
                  <Layout size={18} style={{ color: "#4B4AD5" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-tp-slate-900">Figma Import (HTML)</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-tp-blue-600 bg-tp-blue-100">
                    html.to.design
                  </span>
                  <code className="text-[10px] font-mono text-tp-slate-400 bg-tp-slate-100 px-1.5 py-0.5 rounded">.html</code>
                </div>
                <p className="text-xs text-tp-slate-500 mt-0.5 leading-relaxed">
                  Self-contained HTML page rendering all components with TP styling. Import directly into Figma using the html.to.design plugin.
                </p>
              </div>
              <Upload size={14} className="text-tp-slate-300 group-hover:text-tp-blue-400 transition-colors flex-shrink-0 mt-1" />
            </button>
          </div>

          {/* ─── Token Formats ─── */}
          <div className="px-5 py-3 border-b border-tp-slate-100 bg-tp-slate-50">
            <h3 className="text-xs font-bold text-tp-slate-600 uppercase tracking-wider">
              Token Formats
            </h3>
          </div>

          <div className="p-3 flex flex-col gap-2">
            {exportFormats.map((fmt) => {
              const isRecommended = fmt.recommended
              return (
                <button
                  key={fmt.id}
                  onClick={() => handleExport(fmt.id)}
                  className={`group w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                    isRecommended
                      ? "border-tp-blue-200 bg-tp-blue-50/40 hover:bg-tp-blue-50"
                      : "border-tp-slate-100 hover:border-tp-blue-200 hover:bg-tp-blue-50"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor:
                        exported === fmt.id
                          ? "#ECFDF5"
                          : isRecommended
                            ? "#4B4AD5"
                            : "#EEEEFF",
                    }}
                  >
                    {exported === fmt.id ? (
                      <span className="inline-flex flex-shrink-0"><CheckCircle2 size={18} style={{ color: "#10B981" }} /></span>
                    ) : isRecommended ? (
                      <span className="inline-flex flex-shrink-0"><Star size={18} style={{ color: "#FFFFFF" }} /></span>
                    ) : (
                      <span className="inline-flex flex-shrink-0"><FileText size={18} style={{ color: "#4B4AD5" }} /></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-tp-slate-900">
                        {fmt.name}
                      </span>
                      {isRecommended && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: "#4B4AD5" }}
                        >
                          Recommended
                        </span>
                      )}
                      <code className="text-[10px] font-mono text-tp-slate-400 bg-tp-slate-100 px-1.5 py-0.5 rounded">
                        .json
                      </code>
                    </div>
                    <p className="text-xs text-tp-slate-500 mt-0.5 leading-relaxed">
                      {fmt.description}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-mono text-tp-slate-400">
                      {fmt.filename}
                    </span>
                  </div>
                  <Upload
                    size={14}
                    className="text-tp-slate-300 group-hover:text-tp-blue-400 transition-colors flex-shrink-0 mt-1"
                  />
                </button>
              )
            })}
          </div>

          <div className="px-5 py-3 border-t border-tp-slate-100 bg-tp-slate-50">
            <p className="text-[11px] text-tp-slate-400 leading-relaxed">
              <strong>v3.0.0</strong> — 47 components, 600+ tokens. For Figma
              plugin import, use{" "}
              <a
                href="https://tokens.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tp-blue-500 underline underline-offset-2 hover:text-tp-blue-600"
              >
                Tokens Studio
              </a>
              {" "}or{" "}
              <a
                href="https://html.to.design"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tp-blue-500 underline underline-offset-2 hover:text-tp-blue-600"
              >
                html.to.design
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

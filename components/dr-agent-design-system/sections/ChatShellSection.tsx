"use client"

import React from "react"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { AiGradientBg } from "@/components/tp-rxpad/dr-agent/shared/AiGradientBg"
import { TypingIndicator } from "@/components/tp-rxpad/dr-agent/chat/TypingIndicator"
import { ChatPillButton } from "@/components/tp-rxpad/dr-agent/cards/ActionRow"
import { SecuritySafe, CloseCircle } from "iconsax-reactjs"
import { Plus, Pause, Check, X } from "lucide-react"
import { AI_GRADIENT, AI_GRADIENT_SOFT } from "@/components/tp-rxpad/dr-agent/constants"

// ─────────────────────────────────────────────────────────────
// Chat Shell Section — Documents all chat shell components
// ─────────────────────────────────────────────────────────────

function ShellLabel({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div className="mb-3 mt-8" id={id}>
      <h3 className="text-[14px] font-semibold text-tp-slate-800">{title}</h3>
      <p className="text-[11px] text-tp-slate-400 mt-1">{description}</p>
    </div>
  )
}

function SpecTable({ rows }: { rows: Array<{ prop: string; value: string }> }) {
  return (
    <div className="mt-2 mb-4 overflow-hidden rounded-[8px] border border-tp-slate-100 text-[10px]">
      <table className="w-full">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-tp-slate-50" : "bg-white"}>
              <td className="px-3 py-[5px] font-mono font-medium text-tp-violet-600 w-[180px]">{r.prop}</td>
              <td className="px-3 py-[5px] text-tp-slate-600">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LivePreview({ children, width = 380 }: { children: React.ReactNode; width?: number }) {
  return (
    <div className="rounded-[10px] border border-tp-slate-200 bg-white p-3 overflow-hidden" style={{ maxWidth: width }}>
      {children}
    </div>
  )
}

/* ── Inline SVG recreations for demo ── */

function AiVoiceIconDemo() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="aiv-demo" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="3.04%" stopColor="#D565EA" />
          <stop offset="66.74%" stopColor="#673AAC" />
          <stop offset="130.45%" stopColor="#1A1994" />
        </linearGradient>
      </defs>
      <path opacity="0.4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="url(#aiv-demo)" />
      <path d="M6 14.8896C5.59 14.8896 5.25 14.5496 5.25 14.1396V9.84961C5.25 9.43961 5.59 9.09961 6 9.09961C6.41 9.09961 6.75 9.43961 6.75 9.84961V14.1396C6.75 14.5596 6.41 14.8896 6 14.8896Z" fill="url(#aiv-demo)" />
      <path d="M9 16.3197C8.59 16.3197 8.25 15.9797 8.25 15.5697V8.42969C8.25 8.01969 8.59 7.67969 9 7.67969C9.41 7.67969 9.75 8.01969 9.75 8.42969V15.5697C9.75 15.9897 9.41 16.3197 9 16.3197Z" fill="url(#aiv-demo)" />
      <path d="M12 17.75C11.59 17.75 11.25 17.41 11.25 17V7C11.25 6.59 11.59 6.25 12 6.25C12.41 6.25 12.75 6.59 12.75 7V17C12.75 17.41 12.41 17.75 12 17.75Z" fill="url(#aiv-demo)" />
      <path d="M15 16.3197C14.59 16.3197 14.25 15.9797 14.25 15.5697V8.42969C14.25 8.01969 14.59 7.67969 15 7.67969C15.41 7.67969 15.75 8.01969 15.75 8.42969V15.5697C15.75 15.9897 15.41 16.3197 15 16.3197Z" fill="url(#aiv-demo)" />
      <path d="M18 14.8896C17.59 14.8896 17.25 14.5496 17.25 14.1396V9.84961C17.25 9.43961 17.59 9.09961 18 9.09961C18.41 9.09961 18.75 9.43961 18.75 9.84961V14.1396C18.75 14.5596 18.41 14.8896 18 14.8896Z" fill="url(#aiv-demo)" />
    </svg>
  )
}

function AiSendIconDemo() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ais-demo" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="3.04%" stopColor="#D565EA" />
          <stop offset="66.74%" stopColor="#673AAC" />
          <stop offset="130.45%" stopColor="#1A1994" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#ais-demo)" />
      <path d="M12 16V8M12 8L8 12M12 8L16 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChatShellSection() {
  return (
    <section id="chat-shell" className="mb-12">
      <h2 className="mb-2 text-[20px] font-bold text-tp-slate-800">
        Chat Shell Design System
      </h2>
      <p className="mb-6 text-[12px] text-tp-slate-500">
        Complete component reference for the Dr. Agent chat interface — from collapsed FAB to expanded panel with all sub-components.
      </p>

      {/* ── 5.1 FAB (Collapsed State) ── */}
      <ShellLabel
        id="fab"
        title="5.1 DrAgentFab (Collapsed State)"
        description="Organic curved glass shape fixed at viewport right edge. Contains shimmer-animated spark icon + vertical text."
      />
      <LivePreview width={200}>
        {/* Actual FAB uses organic SVG clip-path shape — NOT a simple rounded rect */}
        <div className="relative mx-auto" style={{ width: 52, height: 192 }}>
          {/* Shape body — scaleX(1.12) matches actual */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 46, height: 192, transform: "scaleX(1.12)", filter: "drop-shadow(-2px 1px 4px rgba(30,27,100,0.10))" }}>
            {/* SVG gradient shape */}
            <svg className="absolute inset-0" width="46" height="192" viewBox="0 0 46 192" fill="none">
              <path d="M43.6776 13.3837C39.7742 19.5797 34.888 26.0634 28.0685 28.7317C18.776 32.3895 12.6839 37.5225 12.6838 47.1872L12.6838 140.428C12.6839 150.093 18.776 155.226 28.0685 158.884C34.888 161.552 39.7742 168.036 43.6776 174.232Q45.4504 177.045 45.4504 174L45.4504 13.5Q45.4504 10.5699 43.6776 13.3837Z" fill="url(#fab-gradient-demo)" opacity="0.60" />
              <defs>
                <linearGradient id="fab-gradient-demo" x1="29.07" y1="177" x2="29.07" y2="10.57" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C860E3" />
                  <stop offset="0.5" stopColor="#6B3BAF" />
                  <stop offset="1" stopColor="#1C1A6E" />
                </linearGradient>
              </defs>
            </svg>
            {/* Glass body — clipped to SVG path shape */}
            <div className="absolute inset-0" style={{
              clipPath: "path('M43.6776 13.3837C39.7742 19.5797 34.888 26.0634 28.0685 28.7317C18.776 32.3895 12.6839 37.5225 12.6838 47.1872L12.6838 140.428C12.6839 150.093 18.776 155.226 28.0685 158.884C34.888 161.552 39.7742 168.036 43.6776 174.232Q45.4504 177.045 45.4504 174L45.4504 13.5Q45.4504 10.5699 43.6776 13.3837Z')",
              backdropFilter: "blur(20px) saturate(1.5)",
            }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.04) 65%, rgba(255,255,255,0.18) 100%)" }} />
              <div className="absolute inset-0" style={{ boxShadow: "inset 1px 0 0 rgba(255,255,255,0.22), inset 0 1px 0 rgba(255,255,255,0.15)" }} />
            </div>
          </div>
          {/* Content layer — spark icon + vertical text */}
          <div className="absolute z-[1] flex flex-col items-center justify-center gap-[6px]" style={{ right: 0, top: "50%", transform: "translateY(-50%)", width: 36, height: 100 }}>
            <svg width={22} height={22} viewBox="4 4 16 16" fill="none" className="animate-[sparkShimmer_4s_ease-in-out_infinite]">
              <path d="M18.0841 11.612C18.4509 11.6649 18.4509 12.3351 18.0841 12.388C14.1035 12.9624 12.9624 14.1035 12.388 18.0841C12.3351 18.4509 11.6649 18.4509 11.612 18.0841C11.0376 14.1035 9.89647 12.9624 5.91594 12.388C5.5491 12.3351 5.5491 11.6649 5.91594 11.612C9.89647 11.0376 11.0376 9.89647 11.612 5.91594C11.6649 5.5491 12.3351 5.5491 12.388 5.91594C12.9624 9.89647 14.1035 11.0376 18.0841 11.612Z" fill="white" />
            </svg>
            <span className="select-none text-[12px] font-bold tracking-[0.5px] text-white [writing-mode:vertical-rl]" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>
              Dr. Agent
            </span>
          </div>
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "Dimensions", value: "52w × 192h px (shape body 46w, scaleX 1.12)" },
        { prop: "Position", value: "fixed, right edge (right: -1), bottom 32px" },
        { prop: "Shape", value: "Organic SVG path — curved inward on left, flat on right (NOT a rounded rect)" },
        { prop: "Gradient", value: "#C860E3 → #6B3BAF → #1C1A6E (vertical), 60% opacity" },
        { prop: "Glass Effect", value: "backdrop blur(20px) saturate(1.5), glass sheen overlays" },
        { prop: "Shadow", value: "drop-shadow(-2px 1px 4px rgba(30,27,100,0.10))" },
        { prop: "Hover", value: "scaleX(1.08) transition, tooltip appears left" },
        { prop: "Spark Icon", value: "22px white, sparkShimmer 4s ease-in-out cycle" },
        { prop: "Text", value: "12px bold, vertical writing-mode, tracking 0.5px, text-shadow" },
      ]} />

      {/* ── 5.2 AgentHeader ── */}
      <ShellLabel
        id="agent-header"
        title="5.2 AgentHeader (52px)"
        description="AI gradient header with blur. Contains spark icon, Dr. Agent title, specialty dropdown, and close button."
      />
      <LivePreview>
        <div
          className="relative overflow-hidden flex items-center justify-between px-[14px]"
          style={{
            height: 52,
            background: "linear-gradient(135deg, rgba(213,101,234,0.12) 0%, rgba(103,58,172,0.10) 40%, rgba(26,25,148,0.12) 100%)",
            boxShadow: "0 1px 2px rgba(103,58,172,0.04), 0 2px 6px rgba(26,25,148,0.03)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-[6px]">
            <AiGradientBg size={28} borderRadius={8}>
              <AiBrandSparkIcon size={16} />
            </AiGradientBg>
            <span className="text-[16px] font-semibold" style={{ background: AI_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Dr. Agent
            </span>
            <span className="rounded-full bg-white/30 backdrop-blur-sm px-[7px] py-[2px] text-[10px] font-medium text-tp-slate-400">
              GP ▾
            </span>
          </div>
          <div className="flex items-center justify-center text-tp-slate-500 hover:text-tp-slate-700 transition-colors">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22H14.97C19.97 22 21.97 20 21.97 15Z" />
              <path d="M14.97 2V22" />
              <path d="M7.96997 9.44L10.53 12L7.96997 14.56" />
            </svg>
          </div>
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "Height", value: "52px fixed" },
        { prop: "Background", value: "linear-gradient(135deg, rgba(213,101,234,0.12)→rgba(103,58,172,0.10)→rgba(26,25,148,0.12)) — subtle glass" },
        { prop: "Blur", value: "backdrop-filter: blur(16px)" },
        { prop: "Shadow", value: "0 1px 2px rgba(103,58,172,0.04), 0 2px 6px rgba(26,25,148,0.03) — very subtle" },
        { prop: "Spark Icon", value: "AiGradientBg 28px (borderRadius 8) → AiBrandSparkIcon 16px" },
        { prop: "Title", value: "16px font-semibold, AI_GRADIENT text fill" },
        { prop: "Specialty", value: "10px, rounded-full, bg-white/30 backdrop-blur-sm, text tp-slate-400 — glass pill" },
        { prop: "Close Button", value: "SidebarRight 18px Linear, tp-slate-500, hover tp-slate-700 — subtle default" },
      ]} />

      {/* ── 5.3 PatientSelector ── */}
      <ShellLabel
        id="patient-selector"
        title="5.3 PatientSelector"
        description="Dropdown for selecting the active patient. Shows search, patient list, and optional Clinic Overview option."
      />
      <LivePreview width={300}>
        <div className="rounded-[12px] border border-white/40 shadow-xl" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)" }}>
          {/* Clinic Overview — universal option */}
          <button type="button" className="flex w-full items-center gap-[8px] px-[12px] py-[7px] text-left border-l-[2px] border-l-transparent hover:bg-tp-slate-50">
            <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-tp-slate-100 text-tp-slate-500">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" opacity={0.7}><path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.35 15.57C16.21 15.81 15.96 15.94 15.7 15.94C15.57 15.94 15.44 15.91 15.32 15.83L12.22 14.02C11.55 13.63 11.07 12.74 11.07 11.97V7.51C11.07 7.1 11.41 6.76 11.82 6.76C12.23 6.76 12.57 7.1 12.57 7.51V11.97C12.57 12.25 12.84 12.72 13.08 12.85L16.18 14.66C16.54 14.87 16.67 15.32 16.46 15.67L16.35 15.57Z"/></svg>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[13px] font-semibold leading-[1.3] text-tp-slate-800">Clinic Overview</span>
              <span className="text-[11px] leading-[1.3] text-tp-slate-400">Schedule, billing, analytics</span>
            </div>
          </button>
          {/* Divider */}
          <div className="relative mx-[10px] my-[2px]">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-tp-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-[8px] text-[9px] font-medium text-tp-slate-300">or</span></div>
          </div>
          {/* Search input */}
          <div className="px-[10px] py-[6px]">
            <div className="flex items-center gap-[6px] rounded-[8px] bg-tp-slate-50 px-[8px] py-[5px]">
              <svg width={13} height={13} viewBox="0 0 12 12" fill="none" className="flex-shrink-0 text-tp-slate-400">
                <circle cx={5} cy={5} r={3.5} stroke="currentColor" strokeWidth={1.5} />
                <path d="M8 8L10.5 10.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
              <input readOnly placeholder="Search by name, ID, or mobile" className="w-full bg-transparent text-[12px] text-tp-slate-700 placeholder:text-tp-slate-400 outline-none" />
            </div>
          </div>
          {/* Patient list */}
          {[
            { name: "Shyam GR", meta: "M, 28y · UHID12345", selected: true, today: true },
            { name: "Lakshmi K", meta: "F, 32y · UHID12346", selected: false, today: true },
            { name: "Arjun S", meta: "M, 2y · UHID12347", selected: false, today: false },
          ].map((p) => (
            <button key={p.name} type="button"
              className={`flex w-full items-center gap-[8px] px-[12px] py-[7px] text-left ${p.selected ? "border-l-[2px] border-l-tp-blue-600 bg-tp-blue-50" : "border-l-[2px] border-l-transparent hover:bg-tp-slate-50"}`}>
              <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-tp-slate-100 text-tp-slate-500">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" opacity={0.7}><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"/><path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z"/></svg>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-[4px] truncate text-[13px] leading-[1.3] text-tp-slate-800">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-[11px] font-normal text-tp-slate-400">({p.meta.split(" · ")[0]})</span>
                </span>
                <span className="truncate text-[11px] leading-[1.3] text-tp-slate-400">{p.meta.split(" · ")[1]}</span>
              </div>
              {p.today && <span className="flex-shrink-0 rounded-[4px] bg-tp-success-50 px-[6px] py-[1px] text-[10px] font-medium text-tp-success-600">Today</span>}
            </button>
          ))}
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "Dropdown Width", value: "280px" },
        { prop: "Background", value: "rgba(255,255,255,0.92) + backdrop-blur 16px" },
        { prop: "Border Radius", value: "12px" },
        { prop: "Clinic Overview Icon", value: "26×26 rounded-full, bg-tp-slate-100, text-tp-slate-500 (SAME as patient icon)" },
        { prop: "Patient Icon", value: "26×26 rounded-full, bg-tp-slate-100, text-tp-slate-500 (neutral, no color variety)" },
        { prop: "Search Input", value: "12px, rounded-8, bg tp-slate-50" },
        { prop: "Selected Row", value: "border-l-2 tp-blue-600, bg tp-blue-50" },
        { prop: "Patient Rows", value: "Icon 26px + name 13px semibold + gender/age 11px + meta 11px" },
      ]} />

      {/* ── 5.4 Chat Bubbles ── */}
      <ShellLabel
        id="chat-bubbles"
        title="5.4 Chat Bubbles (User + Assistant)"
        description="User bubbles are right-aligned with slate background. Assistant bubbles are left-aligned with spark icon and no background."
      />
      <LivePreview>
        <div className="space-y-3 bg-[#FAFAFE] p-3 rounded-[8px]">
          {/* User Bubble */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-[12px] rounded-br-[0px] bg-tp-slate-100 px-3 py-2 text-[12px] leading-[18px] text-tp-slate-700">
              Can you show me the latest lab results?
            </div>
          </div>
          {/* Assistant Bubble */}
          <div className="flex justify-start items-start gap-[6px]">
            <AiGradientBg size={20} borderRadius={6}>
              <AiBrandSparkIcon size={13} />
            </AiGradientBg>
            <div className="text-[12px] leading-[18px] text-tp-slate-700">
              Here are the flagged results from the latest CBC panel. <strong className="font-semibold">3 parameters</strong> are outside the normal range.
            </div>
          </div>
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "User — Alignment", value: "justify-end, max-w-[85%]" },
        { prop: "User — Background", value: "tp-slate-100, rounded-12 rounded-br-0" },
        { prop: "User — Text", value: "12px, leading-18, tp-slate-700, px-3 py-2" },
        { prop: "Assistant — Icon", value: "AiGradientBg(20px, radius 6) → AiBrandSparkIcon(13px)" },
        { prop: "Assistant — Text", value: "12px, leading-18, tp-slate-700, no background" },
        { prop: "Assistant — Cards", value: "Rendered at ml-[26px], mt-[6px], w-[calc(100%-26px)]" },
      ]} />

      {/* ── 5.5 Typing Indicator ── */}
      <ShellLabel
        id="typing-indicator"
        title="5.5 Typing Indicator"
        description="Shows when the AI is generating a response. Animated gradient icon + bouncing dots."
      />
      <LivePreview width={200}>
        <TypingIndicator />
      </LivePreview>
      <SpecTable rows={[
        { prop: "Icon", value: "AiGradientBg(20px, borderRadius 8) → AiBrandSparkIcon(15px)" },
        { prop: "Dots", value: "3 dots, 5px diameter, tp-slate-400" },
        { prop: "Animation", value: "typingBounce 1.2s ease-in-out infinite, staggered 0.15s" },
        { prop: "Bounce", value: "0%→translateY(0) opacity 0.4, 30%→translateY(-4px) opacity 1" },
      ]} />

      {/* ── 5.6 ChatInput ── */}
      <ShellLabel
        id="chat-input"
        title="5.6 ChatInput — Normal + Recording Modes"
        description="Multi-mode input: text entry with voice/send toggle, and recording mode with wave bars + timer."
      />
      {/* Normal Mode */}
      <p className="mb-2 text-[11px] font-medium text-tp-slate-600">Normal Mode:</p>
      <LivePreview>
        <div>
          <div className="flex items-end gap-[6px] rounded-[12px] border-[1.6px] border-tp-slate-200 px-[10px] py-[8px]">
            <button type="button" className="flex-shrink-0 text-tp-slate-700 mb-[2px]"><Plus size={20} strokeWidth={2} /></button>
            <div className="shrink-0 self-stretch" style={{ width: 1, background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }} />
            <div className="flex-1 text-[12px] text-tp-slate-400 leading-[1.5] py-[1px]">Ask about this patient...</div>
            <div className="flex-shrink-0 mb-[1px]"><AiVoiceIconDemo /></div>
          </div>
          <div className="flex items-center gap-[4px] mt-[6px] px-1">
            <SecuritySafe size={14} className="text-tp-slate-300" />
            <span className="text-[10px] text-tp-slate-300">AI-assisted insights — always verify with clinical judgement</span>
          </div>
        </div>
      </LivePreview>

      {/* With Text (Send Button) */}
      <p className="mb-2 mt-3 text-[11px] font-medium text-tp-slate-600">With Text (Send button):</p>
      <LivePreview>
        <div className="flex items-end gap-[6px] rounded-[12px] border-[1.6px] border-tp-blue-500 px-[10px] py-[8px]" style={{ boxShadow: "0 0 0 2px rgba(59,130,246,0.10)" }}>
          <button type="button" className="flex-shrink-0 text-tp-slate-700 mb-[2px]"><Plus size={20} strokeWidth={2} /></button>
          <div className="shrink-0 self-stretch" style={{ width: 1, background: "linear-gradient(180deg, transparent 0%, #CBD5E1 50%, transparent 100%)" }} />
          <div className="flex-1 text-[12px] text-tp-slate-700 leading-[1.5] py-[1px]">Show me the HbA1c trend</div>
          <div className="flex-shrink-0 mb-[1px]"><AiSendIconDemo /></div>
        </div>
      </LivePreview>

      {/* Recording Mode */}
      <p className="mb-2 mt-3 text-[11px] font-medium text-tp-slate-600">Recording Mode:</p>
      <LivePreview>
        <div className="flex items-center gap-[8px] rounded-[12px] bg-tp-slate-50 px-3 py-[10px]" style={{ height: 44 }}>
          <div className="h-[7px] w-[7px] rounded-full bg-red-500 animate-pulse" />
          <div className="flex items-end gap-[3px]">
            {[14, 20, 10, 24, 16, 20, 8, 14, 18, 12].map((h, i) => (
              <div key={i} className="w-[3px] rounded-full" style={{ height: h, background: AI_GRADIENT }} />
            ))}
          </div>
          <span className="font-mono text-[12px] font-medium text-tp-slate-500 tabular-nums">00:12</span>
          <span className="flex-1" />
          <button type="button" className="h-[28px] w-[28px] rounded-full bg-tp-slate-100 text-tp-slate-600 flex items-center justify-center transition-colors hover:bg-tp-slate-200">
            <Pause size={14} fill="currentColor" strokeWidth={0} />
          </button>
          <button type="button" className="h-[28px] w-[28px] rounded-full bg-green-100 text-green-600 flex items-center justify-center transition-colors hover:bg-green-200">
            <Check size={14} strokeWidth={2.5} />
          </button>
          <button type="button" className="h-[28px] w-[28px] rounded-full bg-red-100 text-red-500 flex items-center justify-center transition-colors hover:bg-red-200">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "Normal — Border", value: "1.6px, rounded-12, default tp-slate-200, focus tp-blue-500 + 2px ring" },
        { prop: "Normal — Textarea", value: "12px, leading-1.5, auto-expand 1→5 lines (20-120px)" },
        { prop: "Normal — Plus", value: "18px lucide Plus, tp-slate-400" },
        { prop: "Normal — Voice/Send", value: "30px SVG, AI gradient fill, toggles on text presence" },
        { prop: "Trust Indicator", value: "SecuritySafe 14px + 10px text, tp-slate-300" },
        { prop: "Recording — Height", value: "44px, rounded-12, bg tp-slate-50" },
        { prop: "Recording — Dot", value: "7px red, pulse animation when recording" },
        { prop: "Recording — Waves", value: "10 bars, 3px width, AI gradient, staggered animation" },
        { prop: "Recording — Timer", value: "12px mono, tabular-nums, tp-slate-500" },
        { prop: "Recording — Pause", value: "Lucide Pause 14px solid fill, 28×28 rounded-full, bg tp-slate-100 text tp-slate-600" },
        { prop: "Recording — Submit", value: "Lucide Check 14px, 28×28 rounded-full, bg green-100 text green-600" },
        { prop: "Recording — Discard", value: "Lucide X 14px, 28×28 rounded-full, bg red-100 text red-500" },
      ]} />

      {/* ── 5.7 PillBar ── */}
      <ShellLabel
        id="pill-bar"
        title="5.7 PillBar (Canned Suggestions)"
        description="Horizontal scroll of AI-gradient-styled pills for quick actions and follow-up suggestions."
      />
      <LivePreview>
        <div className="flex gap-[6px] overflow-x-auto px-[8px] py-1" style={{ scrollbarWidth: "none" }}>
          <ChatPillButton label="Show patient summary" />
          <ChatPillButton label="Lab trend" />
          <ChatPillButton label="Compare with previous" />
          <ChatPillButton label="Drug interactions" />
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "Layout", value: "flex row, gap-6, overflow-x-auto, hidden scrollbar" },
        { prop: "Pill Height", value: "26px, rounded-full, px-14" },
        { prop: "Pill Text", value: "11px, AI gradient text fill (WebkitBackgroundClip)" },
        { prop: "Pill BG", value: "AI_PILL_BG, hover: AI_PILL_BG_HOVER" },
        { prop: "Pill Border", value: "1px solid rgba(103,58,172,0.15)" },
        { prop: "No AI icon prefix", value: "Pills render directly without any leading icon" },
      ]} />

      {/* ── 5.8 DocumentBottomSheet ── */}
      <ShellLabel
        id="document-bottom-sheet"
        title="5.8 DocumentBottomSheet"
        description="Bottom sheet overlay for selecting patient documents to send to chat. Multi-select up to 2 documents. Includes canned message suggestions above send button."
      />
      <LivePreview>
        <div className="relative rounded-[12px] bg-black/5 p-2" style={{ minHeight: 380 }}>
          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 rounded-t-[16px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            {/* Drag handle bar */}
            <div className="flex justify-center pt-[10px] pb-[2px]">
              <div className="h-[4px] w-[36px] rounded-full bg-tp-slate-200" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-tp-slate-100 px-4 pb-[10px] pt-[6px]">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-tp-slate-800">Patient Documents</h3>
                <span className="rounded-full bg-tp-slate-100 px-[7px] py-[1px] text-[10px] font-medium text-tp-slate-500">3</span>
              </div>
              <button type="button" className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-tp-slate-700 transition-colors hover:bg-tp-slate-100">
                <CloseCircle size={16} variant="Bulk" />
              </button>
            </div>
            {/* Selection hint */}
            <div className="flex items-center justify-between border-b border-tp-slate-50 px-4 py-[6px]">
              <p className="text-[10px] text-tp-slate-400">1 selected</p>
              <button type="button" className="text-[10px] font-medium text-tp-slate-400 hover:text-tp-slate-600">Clear all</button>
            </div>
            {/* Document rows */}
            <div className="overflow-y-auto px-2 py-[6px]">
              {[
                { name: "CBC_Report_Mar2026.pdf", type: "Pathology", date: "05 Mar'26", size: "1.2 MB", checked: true, iconColor: "#1B8C54", bgColor: "rgba(27,140,84,0.08)" },
                { name: "X-Ray_Chest_Feb2026.pdf", type: "Radiology", date: "28 Feb'26", size: "3.8 MB", checked: false, iconColor: "#3B6FE0", bgColor: "rgba(59,111,224,0.08)" },
                { name: "Discharge_Summary.pdf", type: "Discharge", date: "15 Feb'26", size: "0.8 MB", checked: false, iconColor: "#7C3AED", bgColor: "rgba(124,58,237,0.08)" },
              ].map((doc) => (
                <div key={doc.name}
                  className={`flex w-full items-center gap-[10px] rounded-[10px] px-[10px] py-[8px] ${doc.checked ? "bg-tp-violet-50/60 ring-1 ring-tp-violet-200/60" : ""}`}>
                  {/* Checkbox */}
                  <div className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border ${doc.checked ? "border-transparent" : "border-tp-slate-300 bg-white"}`}
                    style={doc.checked ? { background: AI_GRADIENT } : undefined}>
                    {doc.checked && (
                      <svg width={11} height={11} viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {/* Doc type icon */}
                  <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: doc.bgColor }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill={doc.iconColor}><path d="M16 2H8C4 2 3 4 3 6V18C3 20 4 22 8 22H16C20 22 21 20 21 18V6C21 4 20 2 16 2ZM8.5 14.25C8.5 14.66 8.16 15 7.75 15C7.34 15 7 14.66 7 14.25V9.75C7 9.34 7.34 9 7.75 9C8.16 9 8.5 9.34 8.5 9.75V14.25ZM13 14.25C13 14.66 12.66 15 12.25 15C11.84 15 11.5 14.66 11.5 14.25V9.75C11.5 9.34 11.84 9 12.25 9C12.66 9 13 9.34 13 9.75V14.25ZM17.5 14.25C17.5 14.66 17.16 15 16.75 15C16.34 15 16 14.66 16 14.25V9.75C16 9.34 16.34 9 16.75 9C17.16 9 17.5 9.34 17.5 9.75V14.25Z" /></svg>
                  </div>
                  {/* File info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
                    <span className="truncate text-[11px] font-medium text-tp-slate-700">{doc.name}</span>
                    <span className="text-[9px] text-tp-slate-400">{doc.type} · {doc.date} · Dr. Shyam</span>
                  </div>
                  <span className="shrink-0 text-[9px] text-tp-slate-300">{doc.size}</span>
                </div>
              ))}
            </div>
            {/* Upload new document row */}
            <div className="border-t border-tp-slate-100 px-3 py-[6px]">
              <button type="button" className="flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[7px] text-left hover:bg-tp-slate-50">
                <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] border border-dashed border-tp-slate-300 bg-tp-slate-50">
                  <Plus size={14} className="text-tp-slate-400" />
                </div>
                <span className="text-[11px] font-medium text-tp-slate-500">Upload new document</span>
              </button>
            </div>
            {/* Canned message suggestions */}
            <div className="border-t border-tp-slate-100 px-4 py-[8px]">
              <p className="text-[9px] font-medium text-tp-slate-400 mb-[6px]">Suggested actions</p>
              <div className="flex flex-wrap gap-[6px]">
                <ChatPillButton label="Summarize document" />
                <ChatPillButton label="Compare documents" />
                <ChatPillButton label="Extract key findings" />
                <ChatPillButton label="Check abnormalities" />
              </div>
            </div>
            {/* Send button */}
            <div className="border-t border-tp-slate-100 px-4 py-[10px]">
              <button type="button" className="flex w-full items-center justify-center gap-[6px] rounded-[10px] px-4 py-[9px] text-[12px] font-semibold text-white shadow-sm"
                style={{ background: AI_GRADIENT }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
                Send 1 document
              </button>
            </div>
          </div>
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "Backdrop", value: "bg-black/30, blur 2px, click to close" },
        { prop: "Sheet", value: "rounded-t-16, white, slide-in-from-bottom-4 animation" },
        { prop: "Drag Handle", value: "4px × 36px, rounded-full, tp-slate-200" },
        { prop: "Close Icon", value: "CloseCircle Bulk 16px, text-tp-slate-700" },
        { prop: "Doc Row — Checkbox", value: "18×18px, rounded-5, AI_GRADIENT when checked" },
        { prop: "Doc Row — Icon", value: "32×32px, rounded-8, color-coded by doc type" },
        { prop: "Doc Row — Filename", value: "11px font-medium, truncate" },
        { prop: "Doc Row — Meta", value: "9px, tp-slate-400: 'Type · Date · Doctor'" },
        { prop: "Upload Row", value: "28×28 dashed border, Plus 14px, tp-slate-400" },
        { prop: "Canned Messages", value: "ChatPillButton row above Send — Summarize, Compare, Extract, Check" },
        { prop: "Send Button", value: "AI_GRADIENT bg, 12px semibold white, rounded-10, full width, send icon 14px" },
        { prop: "Max Select", value: "2 documents (configurable via maxSelect prop)" },
      ]} />

      {/* ── 5.9 AiGradientBg ── */}
      <ShellLabel
        id="ai-gradient-bg"
        title="5.9 AiGradientBg (Animated Wrapper)"
        description="Reusable animated gradient background for AI spark icons ONLY. Use 30% opacity for the background, 100% opacity for the icon inside. 6-second flowing cycle."
      />
      <LivePreview width={360}>
        <div className="space-y-4">
          {/* Standard usage — sizes */}
          <div>
            <p className="text-[10px] font-medium text-tp-slate-500 mb-2">Sizes (icon bg at 30% opacity, icon at 100%):</p>
            <div className="flex items-center gap-4">
              {[16, 20, 24, 28, 32].map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div style={{ opacity: 0.3 }} className="relative">
                    <AiGradientBg size={s} borderRadius={s < 20 ? 4 : s < 28 ? 6 : 8}>
                      <div style={{ opacity: 1 / 0.3 }}>
                        <AiBrandSparkIcon size={Math.round(s * 0.6)} />
                      </div>
                    </AiGradientBg>
                  </div>
                  <span className="text-[9px] text-tp-slate-400">{s}px</span>
                </div>
              ))}
            </div>
          </div>
          {/* Rule callout */}
          <div className="rounded-[8px] border border-tp-warning-200 bg-tp-warning-50 px-3 py-2">
            <p className="text-[10px] font-semibold text-tp-warning-700 mb-1">Gradient Usage Rule</p>
            <ul className="space-y-[3px] text-[10px] text-tp-warning-600">
              <li>• This gradient is ONLY for AI icon backgrounds and AI icons</li>
              <li>• Icon background: use at <strong>30% opacity</strong></li>
              <li>• Icon itself: use at <strong>100% opacity</strong></li>
              <li>• Do NOT use this gradient for non-AI elements</li>
            </ul>
          </div>
        </div>
      </LivePreview>
      <SpecTable rows={[
        { prop: "Gradient", value: "AI_GRADIENT_SOFT_ANIMATED (5-stop linear-gradient 135deg)" },
        { prop: "BG Opacity", value: "30% (0.3) — subtle tinted background for AI icon containers" },
        { prop: "Icon Opacity", value: "100% — full gradient on the spark/AI icon itself" },
        { prop: "Usage", value: "ONLY for AI icons and their backgrounds — not for general UI" },
        { prop: "Background Size", value: "200% 200%" },
        { prop: "Animation", value: "aiGradientFlow 6s ease-in-out infinite" },
        { prop: "Keyframes", value: "0%→(0% 50%), 50%→(100% 50%), 100%→(0% 50%)" },
        { prop: "Props", value: "size (default 20), borderRadius (default 6), className, children" },
      ]} />

      {/* ── Panel Layout Overview ── */}
      <ShellLabel
        id="panel-layout"
        title="5.10 Panel Layout Overview"
        description="Complete layout wireframe of the expanded Dr. Agent panel."
      />
      <div className="overflow-x-auto rounded-[10px] bg-tp-slate-800 px-5 py-4 font-mono text-[10px] leading-[1.6] text-green-400 max-w-[420px]">
        <pre>{`┌─ DrAgentPanel (flex-col, h-full) ────────┐
│ ┌─ AgentHeader (52px, sticky) ─────────┐│
│ │ [✦ Dr.Agent] [Specialty ▾]   [Close] ││
│ └──────────────────────────────────────┘│
│ ┌─ PatientStrip (sticky, auto-hide) ───┐│
│ │ [Avatar] [Name] [Meta]     [Change ▾]││
│ └──────────────────────────────────────┘│
│ ┌─ ChatThread (flex-1, scrollable) ────┐│
│ │ [Assistant bubble + card]             ││
│ │ [User bubble]                         ││
│ │ [Assistant bubble + card]             ││
│ │ [TypingIndicator]                     ││
│ └──────────────────────────────────────┘│
│ ┌─ PillBar (fade + sticky bottom) ─────┐│
│ │ [Pill] [Pill] [Pill] [Pill] →        ││
│ └──────────────────────────────────────┘│
│ ┌─ ChatInput ──────────────────────────┐│
│ │ [+] [Textarea]           [🎤 / ↑]   ││
│ │ 🔒 AI-assisted insights...           ││
│ └──────────────────────────────────────┘│
│                                          │
│ ┌─ DocumentBottomSheet (overlay) ──────┐│
│ │ (Backdrop + Sheet when open)         ││
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘`}</pre>
      </div>
    </section>
  )
}

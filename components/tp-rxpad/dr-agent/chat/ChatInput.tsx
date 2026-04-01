"use client"

import { useCallback, useState, useEffect, useRef, useId, type KeyboardEvent } from "react"
// KeyboardEvent used for both HTMLInputElement and HTMLTextAreaElement
import { cn } from "@/lib/utils"
import { ChevronDown, Plus } from "lucide-react"
import { SecuritySafe } from "iconsax-reactjs"
import { AI_GRADIENT } from "../constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CannedPill } from "../types"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  quickActions?: CannedPill[]
  onQuickActionTap?: (label: string) => void
  onAttach?: () => void
  onVoiceTranscription?: (text: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  /** When true, shows animated AI gradient border (used when text is pre-filled from external trigger) */
  isPrefilled?: boolean
  /** Patient name shown in chip (truncatable) */
  patientName?: string
  /** Patient meta shown after name (e.g. "M/76y") — never truncated */
  patientMeta?: string
  /** Called when patient chip is clicked — opens patient selector */
  onPatientClick?: () => void
  /** When true, patient chip is locked (no chevron, tooltip on click). Used in RxPad/patient-detail where context can't be switched. */
  patientLocked?: boolean
  /** Tooltip message shown when clicking locked patient chip */
  patientLockedMessage?: string
}

/* ── Inline SVG Icons (14-16px) ── */

function PaperclipIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

/** Voice-circle Bulk icon with AI gradient fill */
function AiVoiceIcon({ size = 24 }: { size?: number }) {
  const gid = useId().replace(/[:]/g, "")
  const grad = `url(#aiv${gid})`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`aiv${gid}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="3.04%" stopColor="#D565EA" />
          <stop offset="66.74%" stopColor="#673AAC" />
          <stop offset="130.45%" stopColor="#1A1994" />
        </linearGradient>
      </defs>
      <path opacity="0.4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={grad} />
      <path d="M6 14.8896C5.59 14.8896 5.25 14.5496 5.25 14.1396V9.84961C5.25 9.43961 5.59 9.09961 6 9.09961C6.41 9.09961 6.75 9.43961 6.75 9.84961V14.1396C6.75 14.5596 6.41 14.8896 6 14.8896Z" fill={grad} />
      <path d="M9 16.3197C8.59 16.3197 8.25 15.9797 8.25 15.5697V8.42969C8.25 8.01969 8.59 7.67969 9 7.67969C9.41 7.67969 9.75 8.01969 9.75 8.42969V15.5697C9.75 15.9897 9.41 16.3197 9 16.3197Z" fill={grad} />
      <path d="M12 17.75C11.59 17.75 11.25 17.41 11.25 17V7C11.25 6.59 11.59 6.25 12 6.25C12.41 6.25 12.75 6.59 12.75 7V17C12.75 17.41 12.41 17.75 12 17.75Z" fill={grad} />
      <path d="M15 16.3197C14.59 16.3197 14.25 15.9797 14.25 15.5697V8.42969C14.25 8.01969 14.59 7.67969 15 7.67969C15.41 7.67969 15.75 8.01969 15.75 8.42969V15.5697C15.75 15.9897 15.41 16.3197 15 16.3197Z" fill={grad} />
      <path d="M18 14.8896C17.59 14.8896 17.25 14.5496 17.25 14.1396V9.84961C17.25 9.43961 17.59 9.09961 18 9.09961C18.41 9.09961 18.75 9.43961 18.75 9.84961V14.1396C18.75 14.5596 18.41 14.8896 18 14.8896Z" fill={grad} />
    </svg>
  )
}

/** Arrow-up-04 Bulk icon with AI gradient fill */
function AiSendIcon({ size = 24 }: { size?: number }) {
  const gid = useId().replace(/[:]/g, "")
  const grad = `url(#ais${gid})`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={`ais${gid}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="3.04%" stopColor="#D565EA" />
          <stop offset="66.74%" stopColor="#673AAC" />
          <stop offset="130.45%" stopColor="#1A1994" />
        </linearGradient>
      </defs>
      <path opacity="0.4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={grad} />
      <path d="M15.53 10.9704L12.53 7.97043C12.24 7.68043 11.76 7.68043 11.47 7.97043L8.47 10.9704C8.18 11.2604 8.18 11.7404 8.47 12.0304C8.76 12.3204 9.24 12.3204 9.53 12.0304L11.25 10.3104V15.5004C11.25 15.9104 11.59 16.2504 12 16.2504C12.41 16.2504 12.75 15.9104 12.75 15.5004V10.3104L14.47 12.0304C14.62 12.1804 14.81 12.2504 15 12.2504C15.19 12.2504 15.38 12.1804 15.53 12.0304C15.82 11.7404 15.82 11.2604 15.53 10.9704Z" fill={grad} />
    </svg>
  )
}

function MicIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

/** Play/Resume triangle icon — right-facing filled triangle */
function ResumeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="5 13 10 18 19 6" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/* ── Recording wave animation bars ── */
function WaveAnimation() {
  return (
    <div className="flex items-center gap-[3px] h-[20px]">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-full"
          style={{
            background: AI_GRADIENT,
            animation: `wave-bar 1s ease-in-out ${i * 0.1}s infinite alternate`,
            height: "6px",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave-bar {
          0% { height: 4px; opacity: 0.4; }
          50% { height: 16px; opacity: 1; }
          100% { height: 6px; opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

/* ── Recording timer — pauses when isPaused is true ── */
function RecordingTimer({ isPaused }: { isPaused: boolean }) {
  const [elapsed, setElapsed] = useState(0)
  const lastTickRef = useRef(Date.now())

  useEffect(() => {
    if (isPaused) return // Don't tick when paused
    lastTickRef.current = Date.now()
    const interval = setInterval(() => {
      const now = Date.now()
      setElapsed((prev) => prev + Math.round((now - lastTickRef.current) / 1000))
      lastTickRef.current = now
    }, 1000)
    return () => clearInterval(interval)
  }, [isPaused])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0")
  const ss = String(elapsed % 60).padStart(2, "0")

  return (
    <span className="text-[14px] font-medium tabular-nums text-tp-slate-500">
      {mm}:{ss}
    </span>
  )
}

/** Patient chip — shows name + (meta) inside input box. Locked mode for RxPad. */
function PatientChip({ name, meta, locked, lockedMessage, onClick }: {
  name: string; meta?: string; locked?: boolean; lockedMessage?: string; onClick?: () => void
}) {
  const [showLockedTip, setShowLockedTip] = useState(false)

  const handleClick = () => {
    if (locked) {
      setShowLockedTip(true)
      setTimeout(() => setShowLockedTip(false), 2500)
    } else {
      onClick?.()
    }
  }

  // Split meta "M/76y" into gender and age with divider
  const metaParts = meta ? meta.split("/") : []
  const gender = metaParts[0] || ""
  const age = metaParts[1] || ""

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-[4px] transition-all",
          locked ? "cursor-default" : "hover:opacity-85",
        )}
        style={{ background: "var(--tp-slate-100, #F1F5F9)", borderRadius: 6, padding: "3px 5px 3px 6px", height: 24, maxWidth: 175, minWidth: 0 }}
        aria-label={`Patient context: ${name}`}
      >
        {/* Bulk user icon */}
        <span className="flex-shrink-0 text-tp-slate-600">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <path opacity="0.4" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="currentColor" />
            <path d="M12 14.5c-5.01 0-9.09 3.36-9.09 7.5 0 .28.22.5.5.5h17.18c.28 0 .5-.22.5-.5 0-4.14-4.08-7.5-9.09-7.5Z" fill="currentColor" />
          </svg>
        </span>
        {/* Name — darker, truncatable */}
        <span className="truncate" style={{ fontSize: 10, fontWeight: 600, color: "#3D3D4E", lineHeight: "12px" }}>{name}</span>
        {/* (Gender | Age) — brackets darker, divider lighter */}
        {meta && (
          <span className="flex-shrink-0 whitespace-nowrap flex items-center" style={{ fontSize: 10, lineHeight: "12px" }}>
            <span style={{ color: "#B0B7C3", fontWeight: 400 }}>(</span>
            <span style={{ color: "#B0B7C3", fontWeight: 400 }}>{gender}</span>
            {age && <>
              <span className="mx-[2px]" style={{ color: "#D0D5DD", fontWeight: 400 }}>|</span>
              <span style={{ color: "#B0B7C3", fontWeight: 400 }}>{age}</span>
            </>}
            <span style={{ color: "#B0B7C3", fontWeight: 400 }}>)</span>
          </span>
        )}
        {/* Chevron — bigger, darker, only when not locked */}
        {!locked && (
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ color: "#667085" }}>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {/* Locked tooltip */}
      {showLockedTip && (
        <div className="absolute left-0 bottom-full mb-[6px] z-50">
          <div className="rounded-[6px] bg-tp-slate-800 px-[8px] py-[5px] text-[12px] leading-[1.4] text-white shadow-lg whitespace-normal" style={{ maxWidth: 200 }}>
            {lockedMessage || "Context switching is not available on this page"}
            <div className="absolute left-[16px] top-full border-[4px] border-transparent border-t-tp-slate-800" />
          </div>
        </div>
      )}
    </div>
  )
}

export function ChatInput({
  value,
  onChange,
  onSend,
  quickActions = [],
  onQuickActionTap,
  onAttach,
  onVoiceTranscription,
  disabled = false,
  placeholder = "Ask about this patient...",
  className,
  isPrefilled = false,
  patientName,
  patientMeta,
  onPatientClick,
  patientLocked = false,
  patientLockedMessage,
}: ChatInputProps) {
  const hasText = value.trim().length > 0
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const maxH = 120 // ~5 lines
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`
    el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden"
  }, [])

  useEffect(() => {
    autoResize()
  }, [value, autoResize])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && hasText && !disabled) {
        e.preventDefault()
        onSend()
      }
    },
    [hasText, disabled, onSend],
  )

  const handleMicClick = useCallback(() => {
    setIsRecording(true)
    setIsPaused(false)
  }, [])

  const handlePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  const handleDiscard = useCallback(() => {
    setIsRecording(false)
    setIsPaused(false)
  }, [])

  const handleSendRecording = useCallback(() => {
    const mockTranscribedText =
      "Patient complaining of fever since 3 days, dry cough and body ache since 2 days. " +
      "On examination, throat congested, bilateral chest clear, no lymphadenopathy. " +
      "Diagnosis: Acute viral pharyngitis with allergic rhinitis. " +
      "Prescribing Paracetamol 650mg 1-0-1 after food for 5 days, Cetirizine 10mg 0-0-1 for 5 days, Pantoprazole 40mg 1-0-0 before breakfast for 5 days. " +
      "Advising rest, warm fluids, steam inhalation, salt gargle twice daily. " +
      "Suggest test CBC, ESR if fever persists. " +
      "Follow up in 5 days if not better."

    if (onVoiceTranscription) {
      onVoiceTranscription(mockTranscribedText)
    } else {
      onChange(mockTranscribedText)
    }
    setIsRecording(false)
    setIsPaused(false)
  }, [onChange, onVoiceTranscription])

  return (
    <div
      className={cn(
        "sticky bottom-0 bg-white px-[10px] pt-[8px] pb-[4px]",
        className,
      )}
    >
      {/* ── Recording mode ── */}
      {isRecording ? (
        <div className="flex items-center gap-[6px]">
          <div
            className={cn(
              "flex h-[36px] flex-1 items-center gap-[10px] rounded-[10px] border px-[12px]",
              isPaused
                ? "border-tp-slate-300 bg-tp-slate-50"
                : "border-purple-300/60 bg-gradient-to-r from-purple-50/40 to-blue-50/40",
            )}
          >
            <span
              className={cn(
                "h-[6px] w-[6px] shrink-0 rounded-full",
                isPaused ? "bg-tp-slate-400" : "bg-red-500 animate-pulse",
              )}
            />
            {isPaused ? (
              <span className="text-[14px] text-tp-slate-400">Paused</span>
            ) : (
              <WaveAnimation />
            )}
            <span className="flex-1" />
            <RecordingTimer isPaused={isPaused} />
            <button
              type="button"
              onClick={handlePause}
              className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-tp-slate-500 transition-colors hover:bg-tp-slate-100"
              title={isPaused ? "Resume recording" : "Pause recording"}
            >
              {isPaused ? <ResumeIcon /> : <PauseIcon />}
            </button>
          </div>
          <button
            type="button"
            onClick={handleSendRecording}
            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-tp-success-600 transition-colors hover:bg-tp-success-50"
            title="Submit for transcription"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-tp-slate-400 transition-colors hover:bg-tp-slate-100 hover:text-tp-slate-600"
            title="Discard recording"
          >
            <CrossIcon />
          </button>
        </div>
      ) : (
        /* ── Normal input mode — Figma spec: two-row layout ── */
        <div
          className={cn(
            "chat-input-border flex flex-col justify-end rounded-[12px]",
            isPrefilled && "chat-input-prefilled",
            disabled && "opacity-50",
          )}
          style={{ padding: "8px 10.5px", gap: 12 }}
        >
          <style jsx>{`
            .chat-input-border {
              border: 1px solid #E2E2EA;
              transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }
            .chat-input-border:focus-within {
              border-color: #A78BFA;
              box-shadow: 0 0 0 2px rgba(167,139,250,0.10);
            }
            .chat-input-border textarea::placeholder {
              color: #D0D5DD;
              line-height: 16px;
            }
            /* Animated AI gradient border for pre-filled state */
            .chat-input-border.chat-input-prefilled {
              border-color: transparent;
              background-image: linear-gradient(white, white),
                linear-gradient(135deg, #D565EA, #673AAC, #1A1994, #D565EA, #673AAC);
              background-origin: border-box;
              background-clip: padding-box, border-box;
              background-size: 100% 100%, 300% 300%;
              animation: aiGradientBorderFlow 3s ease-in-out infinite;
              box-shadow: 0 0 0 2px rgba(103,58,172,0.08);
            }
            .chat-input-border.chat-input-prefilled:focus-within {
              border-color: transparent;
              box-shadow: 0 0 0 3px rgba(103,58,172,0.12);
            }
            @keyframes aiGradientBorderFlow {
              0% { background-position: 0% 0%, 0% 50%; }
              50% { background-position: 0% 0%, 100% 50%; }
              100% { background-position: 0% 0%, 0% 50%; }
            }
          `}</style>

          {/* Row 1: Textarea — 12px font per Figma */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent px-[4px]",
              "text-[14px] leading-[16px] text-tp-slate-800",
              "focus:outline-none",
            )}
            style={{ minHeight: 28, maxHeight: 120, color: "#1D2939", fontWeight: 400, lineHeight: "16px" }}
          />

          {/* Row 2: Patient chip (left) + mic/divider/send (right) */}
          <div className="flex items-center justify-between" style={{ height: 24 }}>
            {/* Patient/context selector chip */}
            {patientName ? (
              <PatientChip
                name={patientName}
                meta={patientMeta}
                locked={patientLocked}
                lockedMessage={patientLockedMessage}
                onClick={onPatientClick}
              />
            ) : <div />}

            {/* Right side: attachment + divider + send/mic */}
            <div className="flex items-center gap-[6px]">
              {/* Attachment button — Figma SVG (hidden when onAttach is undefined, e.g. V0 mode) */}
              {onAttach && (
                <>
                  <button
                    type="button"
                    onClick={onAttach}
                    disabled={disabled}
                    className={cn(
                      "flex shrink-0 items-center justify-center transition-all hover:opacity-80",
                      disabled && "pointer-events-none",
                    )}
                    title="Add files and more"
                  >
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <path d="M0 12C0 5.37258 5.37258 0 12 0V0C18.6274 0 24 5.37258 24 12V12C24 18.6274 18.6274 24 12 24V24C5.37258 24 0 18.6274 0 12V12Z" fill="var(--tp-slate-100, #F1F5F9)" />
                      <path d="M7.625 12H16.375" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 7.625V16.375" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Divider */}
                  <div className="self-stretch shrink-0" style={{ width: 1, background: "linear-gradient(180deg, rgba(208,213,221,0.2) 0%, #D0D5DD 50%, rgba(208,213,221,0.2) 100%)", opacity: 0.8 }} />
                </>
              )}

              {/* Send button (when text) / Speak button (when empty) — Figma SVGs */}
              {hasText ? (
                <button
                  type="button"
                  onClick={onSend}
                  disabled={disabled}
                  className={cn(
                    "flex shrink-0 items-center justify-center transition-all hover:opacity-90",
                    disabled && "pointer-events-none",
                  )}
                  title="Send message"
                >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path d="M0 12C0 5.37258 5.37258 0 12 0V0C18.6274 0 24 5.37258 24 12V12C24 18.6274 18.6274 24 12 24V24C5.37258 24 0 18.6274 0 12V12Z" fill="url(#sendGrad)" />
                    <path d="M8.2063 10.4812L12 6.68745L15.7938 10.4812" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17.3125V6.79375" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="sendGrad" x1="-0.0224" y1="10.3128" x2="24.0296" y2="10.365" gradientUnits="userSpaceOnUse">
                        <stop offset="0.0304" stopColor="#D565EA" />
                        <stop offset="0.6674" stopColor="#673AAC" />
                        <stop offset="1" stopColor="#1A1994" />
                      </linearGradient>
                    </defs>
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={disabled}
                  className={cn(
                    "flex shrink-0 items-center justify-center transition-all hover:opacity-90",
                    disabled && "pointer-events-none",
                  )}
                  title="Use voice to dictate"
                >
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <path d="M0 12C0 5.37258 5.37258 0 12 0V0C18.6274 0 24 5.37258 24 12V12C24 18.6274 18.6274 24 12 24V24C5.37258 24 0 18.6274 0 12V12Z" fill="url(#micGrad)" />
                    <path d="M5.73891 15.0152C5.31108 15.0152 4.9563 14.6605 4.9563 14.2326V9.75611C4.9563 9.32829 5.31108 8.97351 5.73891 8.97351C6.16673 8.97351 6.52152 9.32829 6.52152 9.75611V14.2326C6.52152 14.6709 6.16673 15.0152 5.73891 15.0152Z" fill="white" />
                    <path d="M8.86934 16.5075C8.44152 16.5075 8.08673 16.1527 8.08673 15.7249V8.27446C8.08673 7.84663 8.44152 7.49185 8.86934 7.49185C9.29717 7.49185 9.65195 7.84663 9.65195 8.27446V15.7249C9.65195 16.1632 9.29717 16.5075 8.86934 16.5075Z" fill="white" />
                    <path d="M11.9998 18C11.572 18 11.2172 17.6452 11.2172 17.2174V6.78261C11.2172 6.35478 11.572 6 11.9998 6C12.4276 6 12.7824 6.35478 12.7824 6.78261V17.2174C12.7824 17.6452 12.4276 18 11.9998 18Z" fill="white" />
                    <path d="M15.1302 16.5075C14.7024 16.5075 14.3476 16.1527 14.3476 15.7249V8.27446C14.3476 7.84663 14.7024 7.49185 15.1302 7.49185C15.558 7.49185 15.9128 7.84663 15.9128 8.27446V15.7249C15.9128 16.1632 15.558 16.5075 15.1302 16.5075Z" fill="white" />
                    <path d="M18.2606 15.0152C17.8328 15.0152 17.478 14.6605 17.478 14.2326V9.75611C17.478 9.32829 17.8328 8.97351 18.2606 8.97351C18.6885 8.97351 19.0433 9.32829 19.0433 9.75611V14.2326C19.0433 14.6709 18.6885 15.0152 18.2606 15.0152Z" fill="white" />
                    <defs>
                      <linearGradient id="micGrad" x1="-0.0224" y1="10.3128" x2="24.0296" y2="10.365" gradientUnits="userSpaceOnUse">
                        <stop offset="0.0304" stopColor="#D565EA" />
                        <stop offset="0.6674" stopColor="#673AAC" />
                        <stop offset="1" stopColor="#1A1994" />
                      </linearGradient>
                    </defs>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trust indicator — centered */}
      <div className="mt-[4px] mb-[14px] flex items-center justify-center gap-[4px]">
        <SecuritySafe size={12} variant="Bulk" className="shrink-0 text-tp-slate-300" />
        <span className="text-[11px] leading-[1.4] text-tp-slate-300">
          Your data stays private · AI assists, you decide
        </span>
      </div>
    </div>
  )
}

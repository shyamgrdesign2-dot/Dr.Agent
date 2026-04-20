"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { RxAgentChatMessage, SpecialtyTabId, PatientDocument } from "../types"
import { ChatBubble } from "./ChatBubble"
import { TypingIndicator } from "./TypingIndicator"

interface ChatThreadProps {
  messages: RxAgentChatMessage[]
  isTyping?: boolean
  onFeedback?: (messageId: string, feedback: "up" | "down") => void
  onPillTap?: (label: string) => void
  onCopy?: (payload: unknown) => void
  onSidebarNav?: (tab: string) => void
  className?: string
  /** Active specialty — passed through to card renderers for specialty-aware narratives */
  activeSpecialty?: SpecialtyTabId
  /** Patient documents — passed through for source provenance in ChatBubble */
  patientDocuments?: PatientDocument[]
  /** Callback when a patient is selected from search card */
  onPatientSelect?: (patientId: string) => void
  /** Context-aware hint for the typing indicator (e.g. "Looking up patient records") */
  typingHint?: string
  /** Callback when user edits a message — parent truncates and re-sends */
  onEditMessage?: (messageId: string, newText: string) => void
}

export function ChatThread({
  messages,
  isTyping = false,
  onFeedback,
  onPillTap,
  onCopy,
  onSidebarNav,
  className,
  activeSpecialty,
  patientDocuments,
  onPatientSelect,
  typingHint,
  onEditMessage,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Track which message IDs have already been "seen" — skip animation for those
  const seenRef = useRef<Set<string>>(new Set())
  const prevMessageCountRef = useRef(0)
  const [, forceRender] = useState(0)

  // Mark all current messages as seen on mount (so initial load doesn't animate)
  useEffect(() => {
    if (seenRef.current.size === 0 && messages.length > 0) {
      messages.forEach((m) => seenRef.current.add(m.id))
      forceRender((n) => n + 1)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Only scroll to bottom when typing indicator appears — no auto-scroll on new messages
  useEffect(() => {
    if (isTyping) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length, isTyping])

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col px-[8px] pt-[14px] pb-[12px] bg-transparent",
        className,
      )}
    >
      {messages.map((message, index) => {
        // Spacing: 6px between same-role, 16px between different roles for clear separation
        const prevMessage = index > 0 ? messages[index - 1] : null
        const isSameRole = prevMessage?.role === message.role
        const spacing = index === 0 ? "" : isSameRole ? "mt-[6px]" : "mt-[16px]"

        // Stream-in animation: only for NEW assistant messages WITHOUT text.
        // Text-bearing messages use the typewriter hook in ChatBubble instead,
        // so the CSS opacity animation would hide the typewriter effect.
        const isNew = !seenRef.current.has(message.id)
        const isAssistant = message.role === "assistant"
        if (isNew) seenRef.current.add(message.id)
        const animate = isNew && isAssistant && !message.text

        return (
          <div
            key={message.id}
            className={cn(spacing, animate && "chat-stream-in")}
            style={animate ? { animationDelay: `${(index - (messages.length - 1)) * 0 + 50}ms` } as React.CSSProperties : undefined}
          >
            <ChatBubble
              message={message}
              onFeedback={onFeedback}
              onPillTap={onPillTap}
              onCopy={onCopy}
              onSidebarNav={onSidebarNav}
              activeSpecialty={activeSpecialty}
              patientDocuments={patientDocuments}
              onPatientSelect={onPatientSelect}
              onEditMessage={onEditMessage}
            />
          </div>
        )
      })}

      {/* Typing indicator — contextual thinking state */}
      {isTyping && (
        <div className="mt-[10px]">
          <TypingIndicator queryHint={typingHint} />
        </div>
      )}

      {/* Bottom sentinel for auto-scroll */}
      <div ref={bottomRef} />

      {/* Stream-in animation for new assistant messages */}
      <style>{`
        @keyframes chatStreamIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(2px);
          }
          50% {
            opacity: 0.7;
            transform: translateY(3px);
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .chat-stream-in {
          animation: chatStreamIn 550ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .da-suggestion-scroll::-webkit-scrollbar { height: 0; display: none; }
        .da-suggestion-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"
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
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages or when typing starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, isTyping])

  return (
    <div
      className={cn(
        "flex flex-col px-[8px] pt-[14px] pb-[12px]",
        "bg-gradient-to-b from-[rgba(213,101,234,0.02)] via-white to-[rgba(26,25,148,0.02)]",
        className,
      )}
    >
      {messages.map((message, index) => {
        // Spacing: 6px between same-role, 16px between different roles for clear separation
        const prevMessage = index > 0 ? messages[index - 1] : null
        const isSameRole = prevMessage?.role === message.role
        const spacing = index === 0 ? "" : isSameRole ? "mt-[6px]" : "mt-[16px]"

        return (
          <div key={message.id} className={spacing}>
            <ChatBubble
              message={message}
              onFeedback={onFeedback}
              onPillTap={onPillTap}
              onCopy={onCopy}
              onSidebarNav={onSidebarNav}
              activeSpecialty={activeSpecialty}
              patientDocuments={patientDocuments}
              onPatientSelect={onPatientSelect}
            />
          </div>
        )
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="mt-[10px] flex justify-start">
          <TypingIndicator />
        </div>
      )}

      {/* Bottom sentinel for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  )
}

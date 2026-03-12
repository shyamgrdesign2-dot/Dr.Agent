"use client"

import React, { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { RxAgentChatMessage } from "../types"
import { CardRenderer } from "../cards/CardRenderer"
import { FeedbackRow } from "../cards/FeedbackRow"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { AiGradientBg } from "../shared/AiGradientBg"
import { DocumentCopy, Edit2 } from "iconsax-reactjs"
import { DocumentAttachmentBubble } from "./DocumentAttachmentBubble"

/** Convert light markdown (bold + links) into rich text. */
function renderAssistantMarkdown(text: string, onPillTap?: (label: string) => void): React.ReactNode {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={i} className="font-semibold text-tp-slate-900">{token.slice(2, -2)}</strong>
    }

    if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const match = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (!match) return <span key={i}>{token}</span>
      const [, label, href] = match

      if (href.startsWith("action:")) {
        const actionLabel = decodeURIComponent(href.slice("action:".length))
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPillTap?.(actionLabel || label)}
            className="font-medium text-tp-blue-600 underline underline-offset-2 transition-colors hover:text-tp-blue-700"
          >
            {label}
          </button>
        )
      }

      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-tp-blue-600 underline underline-offset-2 transition-colors hover:text-tp-blue-700"
        >
          {label}
        </a>
      )
    }

    return <span key={i}>{token}</span>
  })
}

// -----------------------------------------------------------------
// ChatBubble
//
// ASSISTANT layout:
//   [AI Spark 20px]  Text content (plain, no bubble)
//                    Card output (standalone, not inside a bubble)
//                    thumbs-up  thumbs-down
//
// USER layout:
//   Right-aligned bubble with rounded corners
// -----------------------------------------------------------------

interface ChatBubbleProps {
  message: RxAgentChatMessage
  onFeedback?: (messageId: string, feedback: "up" | "down") => void
  onPillTap?: (label: string) => void
  onCopy?: (payload: unknown) => void
  onSidebarNav?: (tab: string) => void
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    let hours = d.getHours()
    const mm = d.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "pm" : "am"
    hours = hours % 12
    if (hours === 0) hours = 12
    return `${hours}:${mm} ${ampm}`
  } catch {
    return ""
  }
}

export function ChatBubble({
  message,
  onFeedback,
  onPillTap,
  onCopy,
  onSidebarNav,
}: ChatBubbleProps) {
  const isUser = message.role === "user"
  const timestamp = useMemo(() => formatTime(message.createdAt), [message.createdAt])

  // ---- USER bubble ----
  if (isUser) {
    return (
      <div className="group/msg flex w-full justify-end">
        <div className="flex max-w-[85%] flex-col items-end gap-[2px]">
          {/* Attachment card (PDF) — shown above text bubble */}
          {message.attachment && (
            <div className="w-full max-w-[220px]">
              <DocumentAttachmentBubble attachment={message.attachment} />
            </div>
          )}
          {message.text && (
          <div className="rounded-[12px] rounded-br-[0px] bg-tp-slate-100 px-3 py-2 text-[12px] leading-[18px] text-tp-slate-700">
              <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          )}
          {/* Hover action icons */}
          <div className="flex items-center gap-[2px] opacity-0 group-hover/msg:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(message.text)}
              className="flex h-[16px] w-[16px] items-center justify-center text-tp-slate-300 transition-colors hover:text-tp-slate-500"
              title="Copy"
            >
              <DocumentCopy size={14} variant="Linear" />
            </button>
            <button
              type="button"
              onClick={() => {}}
              className="flex h-[16px] w-[16px] items-center justify-center text-tp-slate-300 transition-colors hover:text-tp-slate-500"
              title="Edit"
            >
              <Edit2 size={14} variant="Linear" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- ASSISTANT layout ----
  return (
    <div className="group/msg flex w-full justify-start">
      <div className="flex w-full flex-col items-start">
        {/* Top row: AI icon + text */}
        {message.text && (
          <div className="flex items-start gap-[6px]">
            {/* AI Spark icon */}
            <AiGradientBg size={20} borderRadius={6} className="mt-0.5">
              <AiBrandSparkIcon size={13} />
            </AiGradientBg>

            {/* Plain text (no bubble/border/bg) */}
            <p className="text-[12px] leading-[18px] text-tp-slate-700 whitespace-pre-wrap break-words">
              {renderAssistantMarkdown(message.text, onPillTap)}
            </p>
          </div>
        )}

        {/* If there is no text but we have a card, still show the icon row */}
        {!message.text && message.rxOutput && (
          <div className="flex items-start gap-[6px]">
            <AiGradientBg size={20} borderRadius={6} className="mt-0.5">
              <AiBrandSparkIcon size={13} />
            </AiGradientBg>
          </div>
        )}

        {/* Card output -- offset to align under text (past the 20px icon + 6px gap) */}
        {message.rxOutput && (
          <div className="ml-[26px] mt-[6px] w-[calc(100%-26px)]">
            <CardRenderer
              output={message.rxOutput}
              onPillTap={onPillTap}
              onCopy={onCopy}
              onSidebarNav={onSidebarNav}
            />
          </div>
        )}

        {/* Feedback row — thumbs up/down only */}
        <div className="ml-[26px] mt-[2px] flex items-center gap-[6px]">
          {message.feedbackGiven === null && onFeedback && (
            <FeedbackRow
              messageId={message.id}
              initialFeedback={null}
              onFeedback={onFeedback}
            />
          )}
          {message.feedbackGiven && (
            <FeedbackRow
              messageId={message.id}
              initialFeedback={message.feedbackGiven}
              onFeedback={onFeedback}
            />
          )}
        </div>
      </div>
    </div>
  )
}

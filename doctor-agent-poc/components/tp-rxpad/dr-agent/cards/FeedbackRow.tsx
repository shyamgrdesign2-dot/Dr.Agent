"use client"

import { useState } from "react"
import { Like1, Dislike } from "iconsax-reactjs"
import { cn } from "@/lib/utils"

interface FeedbackRowProps {
  messageId: string
  initialFeedback?: "up" | "down" | null
  onFeedback?: (messageId: string, feedback: "up" | "down") => void
}

export function FeedbackRow({ messageId, initialFeedback, onFeedback }: FeedbackRowProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(initialFeedback ?? null)

  const handleFeedback = (type: "up" | "down") => {
    if (feedback) return // One-time only
    setFeedback(type)
    onFeedback?.(messageId, type)
  }

  return (
    <div className="flex items-center gap-[4px]">
      <button
        type="button"
        onClick={() => handleFeedback("up")}
        disabled={feedback !== null}
        className={cn(
          "flex h-[20px] w-[20px] items-center justify-center rounded transition-all",
          feedback === "up"
            ? "text-tp-success-500"
            : feedback === "down"
              ? "text-tp-slate-200"
              : "text-tp-slate-400 hover:text-tp-success-500",
        )}
      >
        <Like1 size={14} variant={feedback === "up" ? "Bold" : "Linear"} />
      </button>
      <button
        type="button"
        onClick={() => handleFeedback("down")}
        disabled={feedback !== null}
        className={cn(
          "flex h-[20px] w-[20px] items-center justify-center rounded transition-all",
          feedback === "down"
            ? "text-tp-error-500"
            : feedback === "up"
              ? "text-tp-slate-200"
              : "text-tp-slate-400 hover:text-tp-error-500",
        )}
      >
        <Dislike size={14} variant={feedback === "down" ? "Bold" : "Linear"} />
      </button>
    </div>
  )
}

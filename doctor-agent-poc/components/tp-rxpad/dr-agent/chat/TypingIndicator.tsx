"use client"

import { cn } from "@/lib/utils"
import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"

// -----------------------------------------------------------------
// TypingIndicator -- AI spark icon + bouncing dots
// -----------------------------------------------------------------

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-[8px]", className)}>
      {/* AI Spark icon (same treatment as assistant bubbles) */}
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px]"
        style={{ background: AI_GRADIENT_SOFT }}
      >
        <AiBrandSparkIcon size={15} />
      </div>

      {/* Bouncing dots */}
      <div className="inline-flex items-center gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-[5px] w-[5px] rounded-full bg-tp-slate-400"
            style={{
              animation: "typingBounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes typingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

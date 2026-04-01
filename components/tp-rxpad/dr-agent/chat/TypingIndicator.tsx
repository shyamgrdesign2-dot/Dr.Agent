"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { AiBrandSparkIcon } from "@/components/doctor-agent/ai-brand"
import { AiGradientBg } from "../shared/AiGradientBg"

// -----------------------------------------------------------------
// TypingIndicator -- contextual AI thinking states
//
// Layout:  [AI Spark 20px]  Looking up patient records...
//
// Vertical carousel that slides status messages bottom-to-top.
// The queryHint drives the initial text; if absent, cycles through
// STATUS_MESSAGES every 2.5s with a smooth slide transition.
// Trailing animated ellipsis is part of the text (same color).
// -----------------------------------------------------------------

/** Fallback status messages when no query hint is provided */
const STATUS_MESSAGES = [
  "Reviewing clinical data",
  "Looking up patient records",
  "Analyzing vitals and labs",
  "Preparing response",
]

interface TypingIndicatorProps {
  className?: string
  /** Context-aware hint based on the user's query intent */
  queryHint?: string
}

export function TypingIndicator({ className, queryHint }: TypingIndicatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayText, setDisplayText] = useState(queryHint || STATUS_MESSAGES[0])
  const nextTextRef = useRef("")

  // Cycle fallback messages with slide-up carousel
  useEffect(() => {
    if (queryHint) {
      setDisplayText(queryHint)
      return
    }
    const interval = setInterval(() => {
      const nextIdx = (currentIndex + 1) % STATUS_MESSAGES.length
      nextTextRef.current = STATUS_MESSAGES[nextIdx]
      setIsTransitioning(true)

      // After slide-out completes, swap text and slide in
      setTimeout(() => {
        setDisplayText(STATUS_MESSAGES[nextIdx])
        setCurrentIndex(nextIdx)
        setIsTransitioning(false)
      }, 280)
    }, 2800)
    return () => clearInterval(interval)
  }, [queryHint, currentIndex])

  return (
    <div className={cn("flex items-start gap-[8px]", className)}>
      {/* AI Spark icon */}
      <AiGradientBg size={20} borderRadius={6} className="mt-[1px] shrink-0">
        <AiBrandSparkIcon size={13} />
      </AiGradientBg>

      {/* Carousel container — fixed height, overflow hidden for slide effect */}
      <div className="typing-carousel-wrap">
        <span
          className={cn(
            "typing-carousel-item",
            isTransitioning ? "typing-slide-out" : "typing-slide-in",
          )}
        >
          {displayText}
          <span className="typing-ellipsis" aria-hidden="true">
            <span className="typing-ellipsis-dot" style={{ animationDelay: "0ms" }}>.</span>
            <span className="typing-ellipsis-dot" style={{ animationDelay: "180ms" }}>.</span>
            <span className="typing-ellipsis-dot" style={{ animationDelay: "360ms" }}>.</span>
          </span>
        </span>
      </div>

      <style>{`
        .typing-carousel-wrap {
          overflow: hidden;
          height: 16px;
          display: flex;
          align-items: center;
          padding-top: 2px;
        }

        .typing-carousel-item {
          display: inline-flex;
          align-items: center;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 16px;
          color: #8B8B96;
          white-space: nowrap;
          will-change: transform, opacity;
        }

        /* Slide in from below */
        .typing-slide-in {
          animation: typingSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* Slide out upward */
        .typing-slide-out {
          animation: typingSlideOut 0.28s cubic-bezier(0.55, 0, 1, 0.45) forwards;
        }

        @keyframes typingSlideIn {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes typingSlideOut {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-10px);
            opacity: 0;
          }
        }

        /* Animated ellipsis — same color as text, staggered fade */
        .typing-ellipsis {
          display: inline;
          letter-spacing: 0.5px;
          margin-left: 0px;
        }

        .typing-ellipsis-dot {
          display: inline-block;
          animation: ellipsisFade 1.4s ease-in-out infinite;
          opacity: 0.3;
        }

        @keyframes ellipsisFade {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

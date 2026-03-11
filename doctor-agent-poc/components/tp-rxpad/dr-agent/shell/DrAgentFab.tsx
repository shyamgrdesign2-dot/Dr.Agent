"use client"

import React from "react"

interface DrAgentFabProps {
  onClick: () => void
  hasNudge?: boolean
}

const SHAPE_PATH =
  "M43.6776 13.3837C39.7742 19.5797 34.888 26.0634 28.0685 28.7317C18.776 32.3895 12.6839 37.5225 12.6838 47.1872L12.6838 140.428C12.6839 150.093 18.776 155.226 28.0685 158.884C34.888 161.552 39.7742 168.036 43.6776 174.232Q45.4504 177.045 45.4504 174L45.4504 13.5Q45.4504 10.5699 43.6776 13.3837Z"

/** White spark icon — cropped viewBox for large visible star, with subtle shimmer animation */
function WhiteSparkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="4 4 16 16"
      fill="none"
      aria-hidden="true"
      className="animate-[sparkShimmer_4s_ease-in-out_infinite]"
    >
      <style>{`
        @keyframes sparkShimmer {
          0%, 100% { opacity: 0.85; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.12) rotate(15deg); }
        }
      `}</style>
      <path
        d="M18.0841 11.612C18.4509 11.6649 18.4509 12.3351 18.0841 12.388C14.1035 12.9624 12.9624 14.1035 12.388 18.0841C12.3351 18.4509 11.6649 18.4509 11.612 18.0841C11.0376 14.1035 9.89647 12.9624 5.91594 12.388C5.5491 12.3351 5.5491 11.6649 5.91594 11.612C9.89647 11.0376 11.0376 9.89647 11.612 5.91594C11.6649 5.5491 12.3351 5.5491 12.388 5.91594C12.9624 9.89647 14.1035 11.0376 18.0841 11.612Z"
        fill="white"
      />
    </svg>
  )
}

/**
 * Dr. Agent edge tag — organic curved glass shape, right viewport edge.
 * Positioned at ~40% from top to align with the appointments table area.
 * Left-pointing chevron to indicate "open panel from right".
 */
export function DrAgentFab({ onClick, hasNudge = false }: DrAgentFabProps) {
  return (
    <div
      className="group fixed z-40 cursor-pointer"
      style={{ bottom: 32, right: -1, width: 52, height: 192 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Open Dr. Agent"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick()
      }}
    >
      {/* Tooltip — appears on hover, left of tag */}
      <div className="pointer-events-none absolute right-[56px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="relative whitespace-nowrap rounded-[6px] bg-tp-slate-800 px-[8px] py-[4px] text-[10px] font-medium text-white shadow-lg">
          Open Dr. Agent
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-[4px] border-transparent border-l-tp-slate-800" />
        </div>
      </div>

      {/* Shape body — default slightly expanded, hover stretches more */}
      <div
        className="absolute origin-right transition-all duration-200 ease-out group-hover:scale-x-[1.08]"
        style={{
          top: 0,
          right: 0,
          width: 46,
          height: 192,
          transform: "scaleX(1.12)",
          filter: "drop-shadow(-2px 1px 4px rgba(30,27,100,0.10))",
        }}
      >
        {/* SVG gradient shape — reduced opacity so glass shows through */}
        <svg
          className="pointer-events-none absolute inset-0"
          width="46"
          height="192"
          viewBox="0 0 46 192"
          fill="none"
          aria-hidden="true"
        >
          <path d={SHAPE_PATH} fill="url(#fab-gradient)" opacity="0.60" />
          <defs>
            <linearGradient
              id="fab-gradient"
              x1="29.07"
              y1="177"
              x2="29.07"
              y2="10.57"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#C860E3" />
              <stop offset="0.5" stopColor="#6B3BAF" />
              <stop offset="1" stopColor="#1C1A6E" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glass body — clipped to shape, stronger glass effect */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `path('${SHAPE_PATH}')`,
            WebkitClipPath: `path('${SHAPE_PATH}')`,
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          }}
        >
          {/* Glass sheen layers */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.04) 65%, rgba(255,255,255,0.18) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              boxShadow: "inset 1px 0 0 rgba(255,255,255,0.22), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          />
        </div>
      </div>

      {/* Content layer — not stretched */}
      <div
        className="absolute z-[1] flex flex-col items-center justify-center gap-[6px]"
        style={{
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 36,
          height: 100,
        }}
      >
        {/* Spark icon — bare, no background */}
        <WhiteSparkIcon size={22} />

        {/* Vertical "Dr. Agent" label */}
        <span
          className="select-none text-[12px] font-bold tracking-[0.5px] text-white [writing-mode:vertical-rl]"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
        >
          Dr. Agent
        </span>
      </div>

    </div>
  )
}

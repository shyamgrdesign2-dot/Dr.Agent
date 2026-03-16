"use client"

/**
 * TutorialPlayIcon — Custom concentric-circle play button icon
 * matching the Dr. Agent design system tutorial icon spec.
 *
 * Features:
 *   - Outer purple ring (gradient stroke)
 *   - Inner filled purple circle
 *   - White play triangle
 *
 * Default size: 28px (toolbar use without background container)
 */
export function TutorialPlayIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx="24"
        cy="24"
        r="21"
        stroke="url(#tpTutRing)"
        strokeWidth="3.5"
        fill="none"
      />
      {/* Inner filled circle */}
      <circle
        cx="24"
        cy="24"
        r="15"
        fill="url(#tpTutFill)"
      />
      {/* Play triangle */}
      <path
        d="M20.5 15L33 24L20.5 33V15Z"
        fill="white"
      />
      <defs>
        <linearGradient id="tpTutRing" x1="3" y1="3" x2="45" y2="45">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <radialGradient id="tpTutFill" cx="0.45" cy="0.4" r="0.55">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  )
}

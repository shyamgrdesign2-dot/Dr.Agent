"use client"

/**
 * TutorialPlayIcon — concentric-circle play icon used in RxPad/home headers.
 * Uses exact #8A4DBB purple geometry to stay visually consistent.
 */
export function TutorialPlayIcon({ size = 42 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M21.0002 8.71582C27.7849 8.7159 33.2854 14.2163 33.2854 21.001C33.2851 27.7856 27.7848 33.2851 21.0002 33.2852C14.2156 33.2851 8.71524 27.7855 8.71499 21.001C8.71499 14.2163 14.2155 8.71596 21.0002 8.71582ZM18.8356 16.6175C18.3239 16.3321 17.6842 16.6895 17.6841 17.2614V24.9867C17.6843 25.5585 18.3239 25.916 18.8356 25.6307L25.7467 21.768C26.2583 21.4819 26.2583 20.7663 25.7467 20.4801L18.8356 16.6175Z"
        fill="#8A4DBB"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M21.0002 2.1C31.4384 2.1 39.9002 10.5618 39.9002 21C39.9002 31.4382 31.4384 39.9 21.0002 39.9C10.5621 39.8999 2.1002 31.4381 2.1002 21C2.1002 10.5619 10.5621 2.10014 21.0002 2.1ZM21.0002 4.43481C11.8516 4.43495 4.43501 11.8513 4.43501 21C4.43501 30.1487 11.8516 37.565 21.0002 37.5652C30.149 37.5652 37.5654 30.1488 37.5654 21C37.5654 11.8512 30.149 4.43481 21.0002 4.43481Z"
        fill="#8A4DBB"
        fillRule="evenodd"
      />
    </svg>
  )
}

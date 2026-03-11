"use client"

interface SidebarLinkProps {
  text: string
  onClick?: () => void
}

export function SidebarLink({ text, onClick }: SidebarLinkProps) {
  // Strip any trailing arrow characters from text (→, \u2192, etc.)
  const cleanText = text.replace(/[\s]*[→\u2192\u279C\u2794]+[\s]*$/g, "").trim()

  return (
    <button
      type="button"
      onClick={onClick}
      className="group/link flex w-full items-center gap-[4px] rounded-[4px] py-1 text-left text-[10px] font-medium text-tp-blue-500 transition-all hover:bg-tp-blue-50/60 hover:text-tp-blue-600 px-1 -mx-1"
    >
      <span className="group-hover/link:underline">{cleanText}</span>
      <svg
        width="10"
        height="10"
        viewBox="0 0 16 16"
        fill="none"
        className="flex-shrink-0 transition-transform duration-200 group-hover/link:translate-x-[2px]"
      >
        <path
          d="M6 3L11 8L6 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

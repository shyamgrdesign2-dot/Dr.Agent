import type { CSSProperties } from "react";

/**
 * TP RxPad Secondary Sidebar component contract.
 * Keep all reusable dimensions/typography/surface references here so
 * section implementations stay aligned with design-system primitives.
 */
export const rxSidebarTokens = {
  railWidth: 80,
  panelMinWidth: 250,
  panelMaxWidth: 350,
  panelPreferredWidth: "clamp(250px, 26vw, 350px)",
  itemGap: 6,
  itemPaddingX: 6,
  itemPaddingY: 14,
  iconContainerSize: 34,
  iconGlyphSize: 20,
  iconRadius: 10,
  contentRadius: 10,
  bodyTextClass: "font-sans text-[14px] leading-[20px] tracking-[0.012px]",
  bodyStrongClass: "font-['Inter',sans-serif] font-semibold text-[14px] leading-[20px] tracking-[0.012px]",
  bodyMediumClass: "font-sans font-medium text-[14px] leading-[20px] tracking-[0.012px]",
  titleClass: "font-sans font-semibold text-[14px] leading-[24px] tracking-[0.1px]",
  navLabelClass: "font-sans font-medium text-[12px] leading-[18px] tracking-[0.1px]",
  navItemSelectedBg: "var(--tp-icon-clickable-dark-bg)",
  navItemHoverBg: "rgba(255,255,255,0.12)",
  navIconBgClass: "bg-[var(--tp-icon-clickable-dark-bg)]",
  navIconActiveBgClass: "bg-tp-slate-0",
  panelBorderClass: "border-tp-slate-100",
} as const;

export const tpSectionCardStyle: CSSProperties = {
  border: "0.8px solid var(--tp-slate-100)",
  borderRadius: `${rxSidebarTokens.contentRadius}px`,
};

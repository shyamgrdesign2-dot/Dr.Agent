/**
 * Shared primitives for all detailed section content panels.
 *
 * KEY DESIGN DECISION: SectionCard does NOT use `overflow-clip/hidden` on its
 * wrapper. This allows `position: sticky` on the card header to work correctly
 * relative to the parent scroll container. The rounded border is achieved via
 * `border` + `border-radius` only.
 */
import React from "react";
import clsx from "clsx";
import { ArrowSquareDown, ArrowSquareUp } from "iconsax-reactjs";
import { rxSidebarTokens, tpSectionCardStyle } from "./tokens";

function getNearestScrollContainer(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll") {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export function useStickyHeaderState(offset = 0) {
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [isStuck, setIsStuck] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const node = headerRef.current;
    if (!node) return;

    const scrollRoot =
      (node.closest('[data-sticky-scroll-root="true"]') as HTMLElement | null) ??
      getNearestScrollContainer(node);
    if (!scrollRoot) return;

    let frame = 0;

    const update = () => {
      const rootRect = scrollRoot.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const atStickyTop = nodeRect.top <= rootRect.top + offset + 0.5;
      setIsStuck(scrollRoot.scrollTop > 0 && atStickyTop);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    scrollRoot.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(scrollRoot);
    observer.observe(node);

    return () => {
      window.cancelAnimationFrame(frame);
      scrollRoot.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer.disconnect();
    };
  }, [offset]);

  return { headerRef, isStuck };
}

// ─── Add/Edit Details button (outlined, indigo) ───────────────────────────────

export function ActionButton({
  label = "Add/Edit Details",
  icon = "plus",
}: {
  label?: string;
  icon?: "plus" | "none";
}) {
  return (
    <div className={`bg-white content-stretch flex flex-col items-start p-[12px] relative shrink-0 w-full border-b ${rxSidebarTokens.panelBorderClass}`}>
      <div className="h-[36px] relative shrink-0 w-full cursor-pointer">
        <div aria-hidden="true" className="absolute border border-tp-blue-500 border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="flex flex-row items-center justify-center size-full rounded-[10px]">
          <div className="content-stretch flex gap-[4px] items-center justify-center px-[15px] py-px relative size-full">
            {icon === "plus" && (
              <div className="relative shrink-0 size-[24px]">
                <svg className="absolute block size-full" fill="none" viewBox="0 0 24 24">
                  <path d="M6 12H18" stroke="var(--tp-blue-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M12 18V6" stroke="var(--tp-blue-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
            )}
            <p className="font-sans font-medium leading-[22px] not-italic relative shrink-0 text-tp-blue-500 text-[14px] text-center whitespace-nowrap">
              {label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
// NO overflow-clip → sticky header works relative to scroll container.
// Rounded visual via border-radius on the outer div.

type SectionCardProps = {
  title: string;
  titleAddon?: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  hideChevron?: boolean;
  children?: React.ReactNode;
};

function SectionCardHeader({
  title,
  titleAddon,
  expanded = true,
  onToggle,
  hideChevron = false,
}: {
  title: string;
  titleAddon?: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  hideChevron?: boolean;
}) {
  const { headerRef, isStuck } = useStickyHeaderState();
  const HeaderTag = onToggle ? "button" : "div";
  const radiusClass = expanded
    ? isStuck
      ? "rounded-tl-none rounded-tr-none"
      : "rounded-tl-[10px] rounded-tr-[10px]"
    : "rounded-[10px]";

  return (
    <HeaderTag
      ref={headerRef as React.Ref<any>}
      type={onToggle ? "button" : undefined}
      onClick={onToggle}
      className={clsx(
        "group bg-tp-slate-100 sticky top-0 z-[2] shrink-0 w-full text-left",
        radiusClass,
        onToggle ? "cursor-pointer" : "",
      )}
    >
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[10px] py-[8px] relative w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`flex flex-col font-semibold justify-end leading-[0] not-italic relative shrink-0 text-tp-slate-700 ${rxSidebarTokens.bodyStrongClass}`}>
              <p className="leading-[18px] whitespace-pre-wrap">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {titleAddon && (
              <span className="opacity-0 transition-opacity group-hover/section-card:opacity-100">
                {titleAddon}
              </span>
            )}
            {!hideChevron ? (
              <div className="flex items-center justify-center relative shrink-0">
                <div className="flex-none transition-transform duration-150">
                  <div className="relative size-[18px]">
                    {expanded ? (
                      <ArrowSquareUp color="var(--tp-slate-500)" size={18} strokeWidth={1.5} variant="Linear" />
                    ) : (
                      <ArrowSquareDown color="var(--tp-slate-500)" size={18} strokeWidth={1.5} variant="Linear" />
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </HeaderTag>
  );
}

export function SectionCard({
  title,
  titleAddon,
  expanded = true,
  onToggle,
  hideChevron = false,
  children,
}: SectionCardProps) {
  return (
    <div className="group/section-card relative shrink-0 w-full" style={tpSectionCardStyle}>
      <SectionCardHeader title={title} titleAddon={titleAddon} expanded={expanded} onToggle={onToggle} hideChevron={hideChevron} />
      {expanded ? (
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
          {children}
        </div>
      ) : null}
    </div>
  );
}

// ─── Scrollable section list wrapper ─────────────────────────────────────────
// overflow-y-auto here is the scroll container for sticky to work.

export function SectionScrollArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px overflow-y-auto relative w-full" data-sticky-scroll-root="true">
      <div className="content-stretch flex flex-col gap-[12px] items-center p-[12px] relative w-full">
        {children}
      </div>
    </div>
  );
}

// ─── Content row (px-10 py-6, full width) ─────────────────────────────────────

export function ContentRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[10px] py-[6px] relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="content-stretch flex flex-col gap-[2px] items-start justify-center relative w-full">
              <div className="font-sans font-normal text-tp-slate-700 text-[14px] leading-[20px] tracking-[0.012px] relative w-full">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

export function Grey({ children }: { children: React.ReactNode }) {
  return <span className="text-tp-slate-400">{children}</span>;
}

export function Sep() {
  return <span className="text-tp-slate-300">{" | "}</span>;
}

export function Bold({ children }: { children: React.ReactNode }) {
  return <span className={clsx("font-semibold", rxSidebarTokens.bodyStrongClass)}>{children}</span>;
}

export function Red({ children }: { children: React.ReactNode }) {
  return <span className="text-tp-error-500">{children}</span>;
}

// ─── Collapsed card (past date) ───────────────────────────────────────────────

export function CollapsedCard({ text }: { text: string }) {
  return (
    <div className="relative shrink-0 w-full" style={tpSectionCardStyle}>
      <div className="bg-tp-slate-100 relative shrink-0 w-full rounded-[10px]">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[10px] py-[8px] relative w-full">
            <div className={`flex flex-col font-medium justify-end leading-[0] not-italic relative shrink-0 text-tp-slate-700 whitespace-nowrap ${rxSidebarTokens.bodyMediumClass}`}>
              <p className="leading-[18px]">{text}</p>
            </div>
            <div className="relative shrink-0 size-[18px]">
              <ArrowSquareDown color="var(--tp-slate-500)" size={18} strokeWidth={1.5} variant="Linear" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

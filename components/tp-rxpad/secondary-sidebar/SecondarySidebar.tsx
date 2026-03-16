/**
 * SecondarySidebar — top-level orchestrator.
 * Manages active section state and renders:
 *   • NavPanel   (80px, dark-purple gradient, scrollable, with 3-state icons)
 *   • ContentPanel (250px, white, section-scrollable, sticky section headers)
 */
import { useEffect, useRef, useState } from "react";
import { NavPanel }     from "./NavPanel";
import { ContentPanel } from "./ContentPanel";
import type { NavItemId } from "./types";
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context";
import { SECTIONS_WITH_DATA, SECTIONS_EMPTY } from "./types";

/** All valid NavItemIds for validation */
const ALL_NAV_IDS = new Set<string>([...SECTIONS_WITH_DATA, ...SECTIONS_EMPTY]);

interface SecondarySidebarProps {
  collapseExpandedOnly?: boolean
  onSectionSelect?: (id: NavItemId | null) => void
}

export function SecondarySidebar({ collapseExpandedOnly = false, onSectionSelect }: SecondarySidebarProps) {
  const [activeId, setActiveId] = useState<NavItemId | null>("pastVisits");
  const { lastSignal, publishSignal } = useRxPadSync()
  const lastSignalIdRef = useRef<number>(0)

  useEffect(() => {
    if (!collapseExpandedOnly) return
    setActiveId((prev) => (prev === null ? prev : null))
    onSectionSelect?.(null)
  }, [collapseExpandedOnly])

  // Listen for section_focus signals from Dr. Agent panel (or elsewhere)
  // and open the corresponding sidebar section
  useEffect(() => {
    if (!lastSignal || lastSignal.id === lastSignalIdRef.current) return
    lastSignalIdRef.current = lastSignal.id

    if (lastSignal.type === "section_focus" && lastSignal.sectionId) {
      const targetId = lastSignal.sectionId as NavItemId
      if (ALL_NAV_IDS.has(targetId)) {
        setActiveId(targetId)
        onSectionSelect?.(targetId)
      }
    }
  }, [lastSignal, onSectionSelect])

  function handleSelect(id: NavItemId) {
    setActiveId((prev) => {
      const next = prev === id ? null : id
      if (next) {
        publishSignal({ type: "section_focus", sectionId: next })
      }
      onSectionSelect?.(next)
      return next
    });
  }

  return (
    // overflow-visible → the white selection arrow on the right edge isn't clipped
    <div className="content-stretch flex items-start relative h-full overflow-visible">
      <NavPanel active={activeId} onSelect={handleSelect} />
      {activeId && !collapseExpandedOnly ? (
        <ContentPanel activeId={activeId} onClose={() => setActiveId(null)} />
      ) : null}
    </div>
  );
}

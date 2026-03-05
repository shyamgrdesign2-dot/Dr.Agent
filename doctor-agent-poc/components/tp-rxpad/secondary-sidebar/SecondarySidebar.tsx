/**
 * SecondarySidebar — top-level orchestrator.
 * Manages active section state and renders:
 *   • NavPanel   (80px, dark-purple gradient, scrollable, with 3-state icons)
 *   • ContentPanel (250px, white, section-scrollable, sticky section headers)
 */
import { useEffect, useState } from "react";
import { NavPanel }     from "./NavPanel";
import { ContentPanel } from "./ContentPanel";
import type { NavItemId } from "./types";
import { useRxPadSync } from "@/components/tp-rxpad/rxpad-sync-context";

interface SecondarySidebarProps {
  collapseExpandedOnly?: boolean
  onSectionSelect?: (id: NavItemId | null) => void
}

export function SecondarySidebar({ collapseExpandedOnly = false, onSectionSelect }: SecondarySidebarProps) {
  const [activeId, setActiveId] = useState<NavItemId | null>("pastVisits");
  const { publishSignal } = useRxPadSync()

  useEffect(() => {
    if (!collapseExpandedOnly) return
    setActiveId((prev) => (prev === null ? prev : null))
    onSectionSelect?.(null)
  }, [collapseExpandedOnly])

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

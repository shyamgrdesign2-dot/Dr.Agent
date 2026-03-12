/**
 * SecondarySidebar — top-level orchestrator.
 * Manages active section state and renders:
 *   • NavPanel   (80px, dark-purple gradient, scrollable, with 3-state icons)
 *   • ContentPanel (250px, white, section-scrollable, sticky section headers)
 */
import { useState } from "react";
import { NavPanel }     from "./NavPanel";
import { ContentPanel } from "./ContentPanel";
import type { NavItemId } from "./types";

export function SecondarySidebar() {
  const [activeId, setActiveId] = useState<NavItemId | null>("pastVisits");

  function handleSelect(id: NavItemId) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  return (
    // overflow-visible → the white selection arrow on the right edge isn't clipped
    <div className="content-stretch flex items-start relative h-full overflow-visible">
      <NavPanel active={activeId} onSelect={handleSelect} />
      {activeId ? <ContentPanel activeId={activeId} onClose={() => setActiveId(null)} /> : null}
    </div>
  );
}

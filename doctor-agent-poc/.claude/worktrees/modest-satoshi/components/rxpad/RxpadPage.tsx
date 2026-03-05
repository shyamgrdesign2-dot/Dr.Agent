"use client"

import { useState } from "react"
import { Pill, ShoppingCart, Activity, FileText, BarChart3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { SecondaryNavPanel, type NavItem } from "@/components/ui/secondary-nav-panel"
import { TopHeader } from "@/components/shared/TopHeader"
import { RxpadBanner } from "./RxpadBanner"

type RxpadScreen = "main" | "pastVisits" | "vitals" | "medicalRecords" | "labResults"

const navItems: NavItem[] = [
  { id: "rxpad", label: "Rxpad", icon: Pill },
  { id: "past-visits", label: "Past Visits", icon: ShoppingCart },
  { id: "vitals", label: "Vitals", icon: Activity },
  { id: "medical-records", label: "Medical Records", icon: FileText },
  { id: "lab-results", label: "Lab Results", icon: BarChart3 },
]

export function RxpadPage() {
  const [activeRailItem, setActiveRailItem] = useState(navItems[0].id)
  const [currentScreen, setCurrentScreen] = useState<RxpadScreen>("main")

  const handleScreenChange = (itemId: string) => {
    setActiveRailItem(itemId)

    // Map nav item id to screen
    switch (itemId) {
      case "rxpad":
        setCurrentScreen("main")
        break
      case "past-visits":
        setCurrentScreen("pastVisits")
        break
      case "vitals":
        setCurrentScreen("vitals")
        break
      case "medical-records":
        setCurrentScreen("medicalRecords")
        break
      case "lab-results":
        setCurrentScreen("labResults")
        break
      default:
        setCurrentScreen("main")
    }
  }

  return (
    <div className="min-h-screen bg-tp-slate-100 font-sans text-tp-slate-900">
      <TopHeader />

      <div className="flex h-[calc(100vh-62px)]">
        {/* Secondary Sidebar - Blue rx variant */}
        <aside className="hidden h-full shrink-0 md:block">
          <SecondaryNavPanel
            items={navItems}
            activeId={activeRailItem}
            onSelect={handleScreenChange}
            variant="rx"
            height="100%"
            bottomSpacerPx={96}
            renderIcon={({ item, isActive, iconSize }) => {
              const Icon = item.icon as React.ComponentType<any>
              return (
                <Icon
                  size={iconSize}
                  variant={isActive ? "Bulk" : "Linear"}
                  color={isActive ? "var(--tp-slate-0)" : "var(--tp-slate-700)"}
                />
              )
            }}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <section className="flex h-full flex-col overflow-hidden">
            {/* Mobile nav strip - visible only on small screens */}
            <div className="shrink-0 px-3 py-3 md:hidden">
              <div className="flex items-center gap-2 overflow-x-auto">
                {navItems.map((item) => {
                  const isActive = item.id === activeRailItem
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleScreenChange(item.id)}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "border-tp-blue-500 bg-tp-blue-50 text-tp-blue-700"
                          : "border-tp-slate-200 bg-white text-tp-slate-600",
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Banner - Fixed */}
            <div className="shrink-0">
              <RxpadBanner title="Rxpad" />
            </div>

            {/* Content Area - with banner overlap */}
            <div className="relative z-10 -mt-[60px] flex flex-1 flex-col px-3 pb-3 sm:px-4 lg:px-[18px]">
              <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-tp-slate-200 bg-white">
                {/* Content placeholder based on current screen */}
                <div className="flex flex-1 items-center justify-center p-6">
                  {currentScreen === "main" && (
                    <div className="text-center">
                      <Pill size={48} className="mx-auto mb-4 text-tp-blue-500" />
                      <h2 className="text-lg font-semibold text-tp-slate-700 mb-2">
                        Prescription Pad
                      </h2>
                      <p className="text-sm text-tp-slate-500">
                        Select an option from the sidebar or navigation to get started.
                      </p>
                    </div>
                  )}

                  {currentScreen === "pastVisits" && (
                    <div className="text-center">
                      <ShoppingCart size={48} className="mx-auto mb-4 text-tp-blue-500" />
                      <h2 className="text-lg font-semibold text-tp-slate-700 mb-2">
                        Past Visits
                      </h2>
                      <p className="text-sm text-tp-slate-500">
                        Past visits content coming soon...
                      </p>
                    </div>
                  )}

                  {currentScreen === "vitals" && (
                    <div className="text-center">
                      <Activity size={48} className="mx-auto mb-4 text-tp-blue-500" />
                      <h2 className="text-lg font-semibold text-tp-slate-700 mb-2">
                        Vitals
                      </h2>
                      <p className="text-sm text-tp-slate-500">
                        Vitals content coming soon...
                      </p>
                    </div>
                  )}

                  {currentScreen === "medicalRecords" && (
                    <div className="text-center">
                      <FileText size={48} className="mx-auto mb-4 text-tp-blue-500" />
                      <h2 className="text-lg font-semibold text-tp-slate-700 mb-2">
                        Medical Records
                      </h2>
                      <p className="text-sm text-tp-slate-500">
                        Medical records content coming soon...
                      </p>
                    </div>
                  )}

                  {currentScreen === "labResults" && (
                    <div className="text-center">
                      <BarChart3 size={48} className="mx-auto mb-4 text-tp-blue-500" />
                      <h2 className="text-lg font-semibold text-tp-slate-700 mb-2">
                        Lab Results
                      </h2>
                      <p className="text-sm text-tp-slate-500">
                        Lab results content coming soon...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

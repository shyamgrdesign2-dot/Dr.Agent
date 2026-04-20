"use client"

import { CopyProvider } from "@/components/docs/copy-provider"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { DocsHeader } from "@/components/docs/docs-header"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CopyProvider>
      <div className="flex min-h-screen bg-[#F5F5F8]">
        {/* Desktop sidebar — fixed */}
        <aside className="hidden w-60 shrink-0 border-r border-tp-slate-200/80 bg-white lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <DocsSidebar />
          </div>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <DocsHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[960px] px-6 py-10 lg:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CopyProvider>
  )
}

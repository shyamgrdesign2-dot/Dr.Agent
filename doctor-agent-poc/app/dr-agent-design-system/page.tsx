import { Suspense } from "react"
import { DrAgentDesignSystemPage } from "@/components/dr-agent-design-system/DrAgentDesignSystemPage"

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-tp-slate-400">Loading design system...</div>}>
      <DrAgentDesignSystemPage />
    </Suspense>
  )
}

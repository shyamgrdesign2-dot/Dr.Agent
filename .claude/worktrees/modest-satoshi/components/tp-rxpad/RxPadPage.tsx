"use client"

import { useRouter } from "next/navigation"

import { RxPad } from "@/components/rx/rxpad/RxPad"
import { RxPadSyncProvider } from "@/components/tp-rxpad/rxpad-sync-context"
import {
  TPRxPadSecondarySidebar,
  TPRxPadShell,
  TPRxPadTopNav,
} from "@/components/tp-ui"

export function RxPadPage() {
  const router = useRouter()

  return (
    <RxPadSyncProvider>
      <TPRxPadShell
        topNav={
          <TPRxPadTopNav
            className="relative h-[62px] w-full bg-white"
            onBack={() => router.push("/tp-appointment-screen")}
          />
        }
        sidebar={<TPRxPadSecondarySidebar />}
      >
        <RxPad />
      </TPRxPadShell>
    </RxPadSyncProvider>
  )
}

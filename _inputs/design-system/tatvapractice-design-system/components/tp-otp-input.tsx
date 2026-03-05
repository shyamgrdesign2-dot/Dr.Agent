"use client"

import * as React from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

/**
 * TPOTPInput — TP-branded OTP code entry (wraps shadcn InputOTP).
 * Tokens: slot 42px height, 8px radius, focus ring tp-blue-500.
 */

function TPOTPInput({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof InputOTP>) {
  return (
    <InputOTP
      containerClassName={cn("gap-2", containerClassName)}
      className={className}
      {...props}
    />
  )
}

function TPOTPGroup({ className, ...props }: React.ComponentProps<typeof InputOTPGroup>) {
  return <InputOTPGroup className={cn("gap-2", className)} {...props} />
}

function TPOTPSlot({
  className,
  ...props
}: React.ComponentProps<typeof InputOTPSlot>) {
  return (
    <InputOTPSlot
      className={cn(
        "h-[42px] w-[42px] rounded-lg border border-tp-slate-300 text-base font-semibold text-tp-slate-900 shadow-none first:rounded-lg first:border last:rounded-lg data-[active=true]:border-tp-blue-500 data-[active=true]:ring-2 data-[active=true]:ring-tp-blue-500/20",
        className,
      )}
      {...props}
    />
  )
}

function TPOTPSeparator({ ...props }: React.ComponentProps<typeof InputOTPSeparator>) {
  return <InputOTPSeparator {...props} />
}

export { TPOTPInput, TPOTPGroup, TPOTPSlot, TPOTPSeparator }

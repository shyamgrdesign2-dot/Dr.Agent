"use client"

import * as React from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/**
 * TPDrawer — TP-branded slide-out panel (wraps shadcn Sheet).
 * Tokens: radius 20px, overlay rgba(23,23,37,0.5), shadow xl.
 */

type TPDrawerSize = "sm" | "md" | "lg" | "xl" | "full"

const sizeMap: Record<TPDrawerSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-full",
}

interface TPDrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function TPDrawer({ open, onOpenChange, children }: TPDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children}
    </Sheet>
  )
}

const TPDrawerTrigger = SheetTrigger

interface TPDrawerContentProps
  extends Omit<React.ComponentProps<typeof SheetContent>, "side"> {
  side?: "left" | "right" | "top" | "bottom"
  size?: TPDrawerSize
}

function TPDrawerContent({
  className,
  side = "right",
  size = "md",
  children,
  ...props
}: TPDrawerContentProps) {
  const isHorizontal = side === "left" || side === "right"
  return (
    <SheetContent
      side={side}
      className={cn(
        "border-tp-slate-200 bg-white",
        isHorizontal && [
          "rounded-l-[20px]",
          sizeMap[size],
        ],
        !isHorizontal && "rounded-t-[20px]",
        className,
      )}
      {...props}
    >
      {children}
    </SheetContent>
  )
}

function TPDrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SheetHeader
      className={cn("border-b border-tp-slate-100 px-6 py-4", className)}
      {...props}
    />
  )
}

function TPDrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SheetFooter
      className={cn("border-t border-tp-slate-100 px-6 py-4", className)}
      {...props}
    />
  )
}

function TPDrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetTitle>) {
  return (
    <SheetTitle
      className={cn("text-base font-semibold text-tp-slate-900", className)}
      {...props}
    />
  )
}

function TPDrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetDescription>) {
  return (
    <SheetDescription
      className={cn("text-sm text-tp-slate-500", className)}
      {...props}
    />
  )
}

const TPDrawerClose = SheetClose

export {
  TPDrawer,
  TPDrawerTrigger,
  TPDrawerContent,
  TPDrawerHeader,
  TPDrawerFooter,
  TPDrawerTitle,
  TPDrawerDescription,
  TPDrawerClose,
}

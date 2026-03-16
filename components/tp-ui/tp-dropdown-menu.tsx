"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/**
 * TPDropdownMenu — TP-branded dropdown menu (wraps shadcn DropdownMenu).
 * Tokens: radius 12px, border tp-slate-200, hover tp-blue-50, shadow md.
 */

const TPDropdownMenu = DropdownMenu
const TPDropdownMenuTrigger = DropdownMenuTrigger
const TPDropdownMenuGroup = DropdownMenuGroup
const TPDropdownMenuSub = DropdownMenuSub
const TPDropdownMenuRadioGroup = DropdownMenuRadioGroup

function TPDropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      sideOffset={sideOffset}
      className={cn(
        "rounded-xl border-tp-slate-200 bg-white p-1.5 shadow-md",
        className,
      )}
      {...props}
    />
  )
}

function TPDropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      className={cn(
        "rounded-lg px-3 py-2 text-[13px] font-medium text-tp-slate-700 focus:bg-tp-blue-50 focus:text-tp-blue-700",
        className,
      )}
      {...props}
    />
  )
}

function TPDropdownMenuCheckboxItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuCheckboxItem>) {
  return (
    <DropdownMenuCheckboxItem
      className={cn(
        "rounded-lg px-3 py-2 text-[13px] font-medium text-tp-slate-700 focus:bg-tp-blue-50 focus:text-tp-blue-700",
        className,
      )}
      {...props}
    />
  )
}

function TPDropdownMenuRadioItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioItem>) {
  return (
    <DropdownMenuRadioItem
      className={cn(
        "rounded-lg px-3 py-2 text-[13px] font-medium text-tp-slate-700 focus:bg-tp-blue-50 focus:text-tp-blue-700",
        className,
      )}
      {...props}
    />
  )
}

function TPDropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel>) {
  return (
    <DropdownMenuLabel
      className={cn(
        "px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-tp-slate-400",
        className,
      )}
      {...props}
    />
  )
}

function TPDropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      className={cn("my-1 bg-tp-slate-100", className)}
      {...props}
    />
  )
}

function TPDropdownMenuSubTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger>) {
  return (
    <DropdownMenuSubTrigger
      className={cn(
        "rounded-lg px-3 py-2 text-[13px] font-medium text-tp-slate-700 focus:bg-tp-blue-50",
        className,
      )}
      {...props}
    />
  )
}

function TPDropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      className={cn(
        "rounded-xl border-tp-slate-200 bg-white p-1.5 shadow-md",
        className,
      )}
      {...props}
    />
  )
}

const TPDropdownMenuShortcut = DropdownMenuShortcut

export {
  TPDropdownMenu,
  TPDropdownMenuTrigger,
  TPDropdownMenuContent,
  TPDropdownMenuGroup,
  TPDropdownMenuItem,
  TPDropdownMenuCheckboxItem,
  TPDropdownMenuRadioGroup,
  TPDropdownMenuRadioItem,
  TPDropdownMenuLabel,
  TPDropdownMenuSeparator,
  TPDropdownMenuShortcut,
  TPDropdownMenuSub,
  TPDropdownMenuSubTrigger,
  TPDropdownMenuSubContent,
}

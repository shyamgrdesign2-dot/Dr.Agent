"use client"

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

/**
 * TPCommand — TP-branded command palette (wraps shadcn Command / cmdk).
 * Tokens: TP colors, SearchNormal1 icon, radius 12px.
 */

function TPCommand({
  className,
  ...props
}: React.ComponentProps<typeof Command>) {
  return (
    <Command
      className={cn(
        "rounded-xl border border-tp-slate-200 bg-white text-tp-slate-900",
        className,
      )}
      {...props}
    />
  )
}

function TPCommandDialog({
  className,
  ...props
}: React.ComponentProps<typeof CommandDialog>) {
  return (
    <CommandDialog
      className={cn("rounded-xl", className)}
      {...props}
    />
  )
}

function TPCommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  return (
    <CommandInput
      className={cn("text-sm text-tp-slate-900 placeholder:text-tp-slate-400", className)}
      {...props}
    />
  )
}

function TPCommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  return (
    <CommandList
      className={cn("max-h-[320px]", className)}
      {...props}
    />
  )
}

function TPCommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandEmpty> & { className?: string }) {
  return (
    <CommandEmpty
      className={cn("py-8 text-center text-sm text-tp-slate-400", className)}
      {...props}
    />
  )
}

function TPCommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return (
    <CommandGroup
      className={cn(
        "[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-tp-slate-400",
        className,
      )}
      {...props}
    />
  )
}

function TPCommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandItem>) {
  return (
    <CommandItem
      className={cn(
        "rounded-lg px-3 py-2 text-[13px] font-medium text-tp-slate-700 data-[selected=true]:bg-tp-blue-50 data-[selected=true]:text-tp-blue-700",
        className,
      )}
      {...props}
    />
  )
}

function TPCommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandSeparator>) {
  return (
    <CommandSeparator
      className={cn("bg-tp-slate-100", className)}
      {...props}
    />
  )
}

const TPCommandShortcut = CommandShortcut

export {
  TPCommand,
  TPCommandDialog,
  TPCommandInput,
  TPCommandList,
  TPCommandEmpty,
  TPCommandGroup,
  TPCommandItem,
  TPCommandSeparator,
  TPCommandShortcut,
}

"use client"

import { forwardRef, useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import {
  getButtonTokens,
  BUTTON_SIZE_TOKENS,
} from "@/lib/button-system/tokens"
import type {
  TPSplitButtonProps,
  TPSplitButtonAction,
  TPButtonTheme,
  TPButtonSize,
  TPButtonSurface,
} from "@/lib/button-system/types"
import { TPButtonIcon } from "./TPButtonIcon"

/**
 * Split CTA — Material UI-style divider between primary action and dropdown.
 * Clear visual separation with spacing.
 */
export const TPSplitButton = forwardRef<HTMLDivElement, TPSplitButtonProps>(
  function TPSplitButton(
    {
      primaryAction,
      secondaryActions,
      variant = "solid",
      theme = "primary",
      size = "md",
      disabled = false,
      loading = false,
      surface = "light",
      open: controlledOpen,
      onOpenChange,
      className = "",
    },
    ref
  ) {
    const [internalOpen, setInternalOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    const setOpen = (v: boolean) => {
      if (!isControlled) setInternalOpen(v)
      onOpenChange?.(v)
    }

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const tokens = getButtonTokens(theme, surface)
    const dims = BUTTON_SIZE_TOKENS[size]
    const isDisabled = disabled || loading

    const bg = isDisabled ? tokens.disabledBg : tokens.bg
    const textColor = isDisabled ? tokens.disabledText : tokens.text
    const borderColor = isDisabled ? tokens.disabledBorder : tokens.border

    const separatorColor =
      variant === "solid" && surface === "light"
        ? "rgba(255,255,255,0.35)"
        : variant === "solid" && surface === "dark"
          ? "rgba(0,0,0,0.15)"
          : variant === "tonal" && surface === "light"
            ? borderColor
            : variant === "outline" || variant === "ghost"
              ? theme === "neutral"
                ? "#A2A2A8"
                : borderColor
              : "currentColor"

    const separatorOpacity = variant === "solid" ? 0.5 : theme === "neutral" && variant === "outline" ? 0.65 : 0.5

    const buttonBg =
      variant === "solid"
        ? bg
        : variant === "tonal"
          ? theme === "primary"
            ? "#EEEEFF"
            : theme === "error"
              ? "#FFF1F2"
              : "#F1F1F5"
          : "transparent"
    const buttonBorder = "none"
    const buttonText =
      variant === "ghost" && theme === "neutral"
        ? "#454551"
        : variant === "ghost"
          ? tokens.border
          : variant === "tonal" && theme === "neutral"
            ? "#454551"
            : variant === "tonal"
              ? tokens.border
              : variant === "outline" && theme === "neutral"
                ? "#454551"
                : variant === "outline"
                  ? tokens.border
                  : textColor

    const baseButtonStyle: React.CSSProperties = {
      height: dims.height,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "Inter, sans-serif",
      cursor: isDisabled ? "not-allowed" : "pointer",
      transition: "all 150ms ease",
      opacity: isDisabled ? 0.7 : 1,
      color: buttonText,
      backgroundColor: buttonBg,
      border: buttonBorder,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: dims.iconTextGap,
    }

    const dropdownTriggerColor =
      loading && variant === "solid" ? "#FFFFFF" : loading && variant === "outline" ? "#454551" : buttonText

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={`relative inline-flex ${className}`}
      >
        <div
          className="inline-flex overflow-hidden rounded-[10px]"
          style={{
            border:
              variant === "outline"
                ? `1.5px solid ${borderColor}`
                : variant === "ghost" || variant === "tonal"
                  ? "none"
                  : "none",
            backgroundColor: variant === "solid" || variant === "tonal" ? buttonBg : "transparent",
            boxShadow:
              variant === "solid"
                ? "0 1px 3px rgba(23,23,37,0.08)"
                : variant === "tonal"
                  ? "0 1px 2px rgba(23,23,37,0.06)"
                  : "none",
          }}
        >
          {/* Primary action — ~75% width, MUI-style */}
          <button
            type="button"
            disabled={isDisabled}
            onClick={primaryAction.onClick}
            className="inline-flex flex-1 items-center justify-center border-0 pl-4 pr-2 transition-colors hover:opacity-90 disabled:cursor-not-allowed"
            style={{
              ...baseButtonStyle,
              borderRadius: 0,
              borderRight: "none",
              minWidth: 0,
            }}
          >
            {loading ? (
              <TPButtonIcon size={dims.iconSize}>
                <span
                  className="animate-spin rounded-full"
                  style={{
                    width: dims.iconSize,
                    height: dims.iconSize,
                    border: `2px solid ${variant === "solid" ? "#FFFFFF" : "#454551"}`,
                    borderTopColor: "transparent",
                  }}
                  aria-hidden
                />
              </TPButtonIcon>
            ) : (
              <>
                {primaryAction.icon && (
                  <TPButtonIcon size={dims.iconSize}>
                    {primaryAction.icon}
                  </TPButtonIcon>
                )}
                <span className="truncate">{primaryAction.label}</span>
              </>
            )}
          </button>

          {/* Divider — M3 2dp spacing between leading and trailing */}
          <div
            className="flex-shrink-0"
            style={{
              width: 1,
              minWidth: 1,
              margin: "0 1px",
              alignSelf: "stretch",
              backgroundColor: separatorColor,
              opacity: separatorOpacity,
            }}
            aria-hidden
          />

          {/* Dropdown trigger — fixed width with spacing */}
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => setOpen(!open)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="More actions"
            className="inline-flex flex-shrink-0 items-center justify-center px-2 transition-colors hover:opacity-90 disabled:cursor-not-allowed"
            style={{
              ...baseButtonStyle,
              color: dropdownTriggerColor,
              borderRadius: 0,
              width: dims.height,
              minWidth: dims.height,
              borderLeft: "none",
            }}
          >
            <TPButtonIcon size={dims.iconSize}>
            <ChevronDown
              size={dims.iconSize}
              className="transition-transform duration-200 ease-out"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </TPButtonIcon>
          </button>
        </div>

        {/* Dropdown menu */}
        {open && (
          <div
            className="absolute left-0 top-full z-50 mt-1 overflow-hidden"
            style={{
              minWidth: "100%",
              borderRadius: 12,
              boxShadow:
                "0 12px 24px -4px rgba(23,23,37,0.08), 0 4px 8px -4px rgba(23,23,37,0.04)",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E2EA",
            }}
          >
            {secondaryActions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={action.disabled}
                onClick={() => {
                  action.onClick?.()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-tp-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  color: action.danger ? "#E11D48" : "#454551",
                }}
              >
                {action.icon && (
                  <TPButtonIcon size={16}>{action.icon}</TPButtonIcon>
                )}
                <span className="flex-1">{action.label}</span>
                {action.shortcut && (
                  <span className="font-mono text-[11px] text-tp-slate-400">
                    {action.shortcut}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

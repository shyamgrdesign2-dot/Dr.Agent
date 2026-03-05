"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPStepper — TP-branded multi-step indicator.
 * Active: tp-blue-500, Completed: tp-success-500, Pending: tp-slate-300.
 */

interface TPStepperStep {
  label: string
  description?: string
}

interface TPStepperProps {
  steps: TPStepperStep[]
  activeStep: number
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function TPStepper({
  steps,
  activeStep,
  orientation = "horizontal",
  className,
}: TPStepperProps) {
  const isHorizontal = orientation === "horizontal"

  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "items-start" : "flex-col",
        className,
      )}
    >
      {steps.map((step, idx) => {
        const isCompleted = idx < activeStep
        const isActive = idx === activeStep
        const isLast = idx === steps.length - 1

        return (
          <div
            key={idx}
            className={cn(
              "flex",
              isHorizontal ? "flex-1 items-start" : "items-start",
            )}
          >
            <div className={cn("flex", isHorizontal ? "flex-col items-center" : "items-start gap-3")}>
              {/* Step indicator */}
              <div className="flex items-center">
                {isHorizontal && !isLast && idx > 0 && null}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isCompleted && "bg-tp-success-500 text-white",
                    isActive && "bg-tp-blue-500 text-white",
                    !isCompleted && !isActive && "border-2 border-tp-slate-300 text-tp-slate-400",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    idx + 1
                  )}
                </div>
              </div>

              {/* Label */}
              <div className={cn(isHorizontal ? "mt-2 text-center" : "")}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-tp-blue-700",
                    isCompleted && "text-tp-slate-900",
                    !isActive && !isCompleted && "text-tp-slate-400",
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-xs text-tp-slate-400">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              isHorizontal ? (
                <div className="mx-2 mt-4 h-0.5 flex-1 rounded-full bg-tp-slate-200">
                  <div
                    className="h-full rounded-full bg-tp-success-500 transition-all"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              ) : (
                <div className="ml-4 mt-1 mb-1 w-0.5 self-stretch rounded-full bg-tp-slate-200" style={{ minHeight: 24 }}>
                  <div
                    className="w-full rounded-full bg-tp-success-500 transition-all"
                    style={{ height: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { CardShell } from "../CardShell"
import { CheckboxRow } from "../CheckboxRow"
import { RadioRow } from "../RadioRow"

interface FollowUpQuestionCardProps {
  data: {
    question: string
    options: string[]
    multiSelect: boolean
  }
  onSubmit?: (selected: string[]) => void
}

export function FollowUpQuestionCard({
  data,
  onSubmit,
}: FollowUpQuestionCardProps) {
  const [selected, setSelected] = useState<
    Record<string, boolean>
  >(() => {
    const init: Record<string, boolean> = {}
    data.options.forEach((opt) => {
      init[opt] = false
    })
    return init
  })

  const handleCheckboxToggle = useCallback(
    (option: string, checked: boolean) => {
      setSelected((prev) => ({ ...prev, [option]: checked }))
    },
    []
  )

  const handleRadioSelect = useCallback(
    (option: string) => {
      setSelected(() => {
        const next: Record<string, boolean> = {}
        data.options.forEach((opt) => {
          next[opt] = opt === option
        })
        return next
      })
    },
    [data.options]
  )

  const selectedOptions = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k)

  return (
    <CardShell
      icon={<span />}
      tpIconName="Diagnosis"
      title={data.question}
      sidebarLink={
        <button
          type="button"
          disabled={selectedOptions.length === 0}
          className="inline-flex h-[28px] items-center rounded-[10px] border-[1.5px] border-tp-blue-500 bg-transparent px-4 text-[11px] font-medium text-tp-blue-600 hover:bg-tp-blue-50 disabled:border-tp-slate-200 disabled:text-tp-slate-400 transition-all"
          onClick={() => onSubmit?.(selectedOptions)}
        >
          Submit{selectedOptions.length > 0 ? ` (${selectedOptions.length})` : ""}
        </button>
      }
    >
      {data.multiSelect
        ? data.options.map((option, i) => (
            <CheckboxRow
              key={option}
              label={option}
              checked={selected[option] ?? false}
              onChange={(checked) =>
                handleCheckboxToggle(option, checked)
              }
              isLast={i === data.options.length - 1}
            />
          ))
        : data.options.map((option, i) => (
            <RadioRow
              key={option}
              name="follow-up-question"
              label={option}
              checked={selected[option] ?? false}
              onChange={() => handleRadioSelect(option)}
              isLast={i === data.options.length - 1}
            />
          ))}
    </CardShell>
  )
}

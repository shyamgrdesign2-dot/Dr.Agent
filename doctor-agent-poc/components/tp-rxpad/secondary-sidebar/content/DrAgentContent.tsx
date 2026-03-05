"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, SendHorizontal } from "lucide-react"

import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import {
  type AgentChatMessage,
  type AgentPatientContext,
  buildAgentMockReply,
  buildAgentWelcomeMessage,
  createAgentMessage,
} from "@/components/doctor-agent/mock-agent"
import { cn } from "@/lib/utils"

const AGENT_PATIENTS: AgentPatientContext[] = [
  { id: "apt-1", name: "Shyam GR", gender: "M", age: 25, visitType: "Follow-up" },
  { id: "apt-2", name: "Anjali Patel", gender: "F", age: 28, visitType: "New" },
  { id: "apt-3", name: "Vikram Singh", gender: "M", age: 42, visitType: "New" },
]

const QUICK_PROMPTS = [
  "Summarize symptoms",
  "Draft diagnosis",
  "Suggest tests",
  "Plan follow-up",
]

function formatPatientLabel(patient: AgentPatientContext) {
  return `${patient.name} (${patient.gender}, ${patient.age}y)`
}

function buildInitialThreads() {
  return AGENT_PATIENTS.reduce<Record<string, AgentChatMessage[]>>((acc, patient) => {
    acc[patient.id] = [createAgentMessage("assistant", buildAgentWelcomeMessage(patient))]
    return acc
  }, {})
}

function DynamicOutputCard({
  title,
  subtitle,
  bullets,
  actions,
}: {
  title: string
  subtitle: string
  bullets: string[]
  actions: string[]
}) {
  return (
    <div className="rounded-[10px] border border-tp-violet-100 bg-white p-2 shadow-[0_8px_16px_-14px_rgba(103,58,172,0.55)]">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="inline-flex size-5 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={12} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-tp-slate-700">{title}</p>
          <p className="truncate text-[9px] text-tp-slate-500">{subtitle}</p>
        </div>
      </div>
      <ul className="mb-1.5 space-y-0.5">
        {bullets.map((point) => (
          <li key={point} className="text-[10px] leading-[14px] text-tp-slate-600">
            <span className="mr-1 text-tp-violet-500">•</span>
            {point}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-full border border-tp-violet-200 bg-tp-violet-50 px-1.5 py-0.5 text-[9px] font-semibold text-tp-violet-600"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DrAgentContent() {
  const [selectedPatientId, setSelectedPatientId] = useState(AGENT_PATIENTS[0]?.id ?? "")
  const [threads, setThreads] = useState<Record<string, AgentChatMessage[]>>(() => buildInitialThreads())
  const [inputValue, setInputValue] = useState("")
  const [pendingReplies, setPendingReplies] = useState<Record<string, number>>({})
  const timersRef = useRef<number[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const selectedPatient = useMemo(
    () => AGENT_PATIENTS.find((patient) => patient.id === selectedPatientId) ?? AGENT_PATIENTS[0],
    [selectedPatientId],
  )

  const messages = selectedPatient ? (threads[selectedPatient.id] ?? []) : []
  const pending = selectedPatient ? (pendingReplies[selectedPatient.id] ?? 0) : 0

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
  }, [messages, pending, selectedPatientId])

  function appendMessage(patientId: string, message: AgentChatMessage) {
    setThreads((prev) => ({
      ...prev,
      [patientId]: [...(prev[patientId] ?? []), message],
    }))
  }

  function sendMessage(raw: string) {
    const text = raw.trim()
    if (!text || !selectedPatient) return

    const patientId = selectedPatient.id
    appendMessage(patientId, createAgentMessage("user", text))
    setInputValue("")
    setPendingReplies((prev) => ({
      ...prev,
      [patientId]: (prev[patientId] ?? 0) + 1,
    }))

    const timer = window.setTimeout(() => {
      const { reply, output } = buildAgentMockReply(text, selectedPatient)
      appendMessage(patientId, createAgentMessage("assistant", reply, output))
      setPendingReplies((prev) => {
        const next = { ...prev }
        const count = (next[patientId] ?? 1) - 1
        if (count <= 0) {
          delete next[patientId]
        } else {
          next[patientId] = count
        }
        return next
      })
      timersRef.current = timersRef.current.filter((id) => id !== timer)
    }, 500)

    timersRef.current.push(timer)
  }

  return (
    <div className="content-stretch flex size-full flex-col">
      <div className="border-b border-tp-slate-100 px-[10px] py-[8px]">
        <div className="mb-[7px] flex items-center gap-[6px]">
          <span className="inline-flex size-[20px] items-center justify-center rounded-[6px]" style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={12} />
          </span>
          <p className="text-[11px] font-semibold text-tp-slate-700">Doctor Agent</p>
        </div>
        <div className="relative">
          <select
            value={selectedPatientId}
            onChange={(event) => setSelectedPatientId(event.target.value)}
            className="h-[30px] w-full appearance-none rounded-[8px] border border-tp-slate-200 bg-white px-[8px] pr-[26px] text-[11px] font-medium text-tp-slate-700 outline-none focus:border-tp-blue-300"
          >
            {AGENT_PATIENTS.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {formatPatientLabel(patient)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-[8px] top-1/2 -translate-y-1/2 text-tp-slate-400" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-[1_0_0] space-y-[8px] overflow-y-auto p-[10px]">
        <div className="rounded-[10px] border border-tp-violet-100 bg-white p-[8px] shadow-[0_8px_16px_-14px_rgba(103,58,172,0.55)]">
          <div className="mb-[4px] flex items-center gap-[6px]">
            <span className="inline-flex size-[18px] items-center justify-center rounded-[5px]" style={{ background: AI_GRADIENT_SOFT }}>
              <AiBrandSparkIcon size={11} />
            </span>
            <p className="text-[10px] font-semibold text-tp-slate-700">Patient Summary</p>
          </div>
          <p className="text-[10px] leading-[15px] text-tp-slate-600">
            26-year-old with diabetes and hypertension on regular medication. Last visit showed viral fever with mild dehydration.
          </p>
        </div>

        {messages.map((message) => {
          const isUser = message.role === "user"
          return (
            <div key={message.id} className="space-y-[5px]">
              <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[95%] rounded-[10px] px-[8px] py-[7px] text-[10px] leading-[15px]",
                    isUser
                      ? "rounded-br-[6px] bg-tp-blue-500 text-white"
                      : "rounded-bl-[6px] bg-tp-slate-100 text-tp-slate-700",
                  )}
                >
                  {message.text}
                </div>
              </div>
              {!isUser && message.output && (
                <DynamicOutputCard
                  title={message.output.title}
                  subtitle={message.output.subtitle}
                  bullets={message.output.bullets}
                  actions={message.output.actions}
                />
              )}
            </div>
          )
        })}

        {pending > 0 && (
          <div className="space-y-[5px]">
            <div className="inline-flex items-center gap-1 rounded-[10px] bg-tp-slate-100 px-[8px] py-[7px]">
              <span className="size-1 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.2s]" />
              <span className="size-1 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.1s]" />
              <span className="size-1 rounded-full bg-tp-slate-400 animate-bounce" />
            </div>
            <div className="rounded-[10px] border border-tp-violet-100 bg-white p-[8px]">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="inline-flex size-5 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
                  <AiBrandSparkIcon size={12} />
                </span>
                <p className="text-[10px] font-semibold text-tp-slate-700">Generating dynamic output</p>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-[90%] rounded bg-tp-slate-100" />
                <div className="h-1.5 w-[74%] rounded bg-tp-slate-100" />
                <div className="h-1.5 w-[58%] rounded bg-tp-slate-100" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-tp-slate-100 p-[10px]">
        <div className="mb-[7px] flex flex-wrap gap-[4px]">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-tp-blue-200 bg-tp-blue-50 px-[7px] py-[3px] text-[9px] font-semibold text-tp-blue-500"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-[6px]">
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                sendMessage(inputValue)
              }
            }}
            placeholder="Ask Dr Agent"
            className="h-[30px] min-w-0 flex-1 rounded-[8px] border border-tp-slate-200 bg-tp-slate-50 px-[9px] text-[11px] text-tp-slate-700 outline-none focus:border-tp-blue-300"
          />
          <button
            type="button"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className={cn(
              "inline-flex size-[30px] items-center justify-center rounded-[8px]",
              inputValue.trim()
                ? "bg-tp-blue-500 text-white"
                : "cursor-not-allowed bg-tp-slate-100 text-tp-slate-400",
            )}
            aria-label="Send"
          >
            <SendHorizontal size={12} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

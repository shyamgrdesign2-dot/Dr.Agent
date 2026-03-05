"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  Copy,
  HeartPulse,
  Mic,
  SendHorizontal,
  ShieldCheck,
  X,
} from "lucide-react"

import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import {
  type AgentChatMessage,
  type AgentDynamicOutput,
  buildAgentMockReply,
  createAgentMessage,
  deriveAgentPromptSuggestions,
} from "@/components/doctor-agent/mock-agent"
import { cn } from "@/lib/utils"

const PROMPTS = [
  "Summarize this patient timeline",
  "Highlight risk factors",
  "Draft patient counseling",
  "Prepare follow-up checklist",
]

type SummaryModuleTone = "critical" | "watch" | "good" | "neutral"

interface SummaryModule {
  id: string
  title: string
  detail: string
  status: string
  tone: SummaryModuleTone
}

interface VitalTrendSeries {
  id: string
  label: string
  unit: string
  values: number[]
  latest: string
}

interface PatientIntakeItem {
  id: string
  line: string
  detail: string
  severity: "high" | "moderate" | "low"
}

const SUMMARY_MODULES: SummaryModule[] = [
  {
    id: "past-visits",
    title: "Past Visits",
    detail: "5 recent visits. Last 3 involved fever + respiratory complaints.",
    status: "Recurring",
    tone: "watch",
  },
  {
    id: "vitals",
    title: "Vitals",
    detail: "Pulse and BP stable. Temperature trend is improving.",
    status: "Stable",
    tone: "good",
  },
  {
    id: "history",
    title: "Medical History",
    detail: "Type 2 diabetes, hypertension, hypothyroidism.",
    status: "Chronic",
    tone: "critical",
  },
  {
    id: "ophthal",
    title: "Ophthal",
    detail: "No structured ophthal records in current chart.",
    status: "No data",
    tone: "neutral",
  },
  {
    id: "gynec-obstetric",
    title: "Gynec/Obstetric",
    detail: "History available in prior summary; no new changes this visit.",
    status: "Reviewed",
    tone: "neutral",
  },
  {
    id: "vaccine-growth",
    title: "Vaccine & Growth",
    detail: "1 pending vaccine reminder. Growth records unchanged.",
    status: "Follow-up",
    tone: "watch",
  },
  {
    id: "lab-results",
    title: "Lab Results",
    detail: "TSH and LDL were previously above reference range.",
    status: "Abnormal",
    tone: "critical",
  },
  {
    id: "records-notes",
    title: "Records & Notes",
    detail: "Personal note indicates low adherence during travel weeks.",
    status: "Insight",
    tone: "watch",
  },
]

const VITAL_TRENDS: VitalTrendSeries[] = [
  {
    id: "temp",
    label: "Temperature",
    unit: "F",
    values: [101.2, 100.4, 99.1, 98.6],
    latest: "98.6 F",
  },
  {
    id: "pulse",
    label: "Pulse",
    unit: "/min",
    values: [96, 92, 86, 82],
    latest: "82 /min",
  },
  {
    id: "spo2",
    label: "SpO2",
    unit: "%",
    values: [96, 97, 98, 98],
    latest: "98%",
  },
]

const PATIENT_INTAKE_SYMPTOMS: PatientIntakeItem[] = [
  {
    id: "sym-1",
    line: "Fever with evening spikes",
    detail: "3 days | high-grade | no chills",
    severity: "high",
  },
  {
    id: "sym-2",
    line: "Dry cough",
    detail: "2 days | worse at night",
    severity: "moderate",
  },
  {
    id: "sym-3",
    line: "Eye redness",
    detail: "bilateral | mild irritation",
    severity: "low",
  },
]

const PATIENT_INTAKE_HISTORY: PatientIntakeItem[] = [
  {
    id: "hist-1",
    line: "Type 2 diabetes",
    detail: "2 years | on oral medication",
    severity: "high",
  },
  {
    id: "hist-2",
    line: "Hypertension",
    detail: "1 year | usually controlled",
    severity: "moderate",
  },
  {
    id: "hist-3",
    line: "NSAID sensitivity",
    detail: "gastric discomfort reported",
    severity: "low",
  },
]

function toneClasses(tone: SummaryModuleTone) {
  if (tone === "critical") {
    return {
      badge: "border-tp-error-200 bg-tp-error-50 text-tp-error-600",
      border: "border-tp-error-100",
    }
  }
  if (tone === "watch") {
    return {
      badge: "border-tp-warning-200 bg-tp-warning-50 text-tp-warning-600",
      border: "border-tp-warning-100",
    }
  }
  if (tone === "good") {
    return {
      badge: "border-tp-success-200 bg-tp-success-50 text-tp-success-600",
      border: "border-tp-success-100",
    }
  }
  return {
    badge: "border-tp-slate-200 bg-tp-slate-50 text-tp-slate-600",
    border: "border-tp-slate-100",
  }
}

function severityClasses(level: PatientIntakeItem["severity"]) {
  if (level === "high") {
    return "text-tp-error-600 bg-tp-error-50 border-tp-error-200"
  }
  if (level === "moderate") {
    return "text-tp-warning-600 bg-tp-warning-50 border-tp-warning-200"
  }
  return "text-tp-success-600 bg-tp-success-50 border-tp-success-200"
}

function MiniTrendBars({
  series,
}: {
  series: VitalTrendSeries
}) {
  const max = Math.max(...series.values)
  const min = Math.min(...series.values)
  const span = Math.max(1, max - min)

  return (
    <div className="rounded-xl border border-tp-slate-200 bg-white p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-tp-slate-700">{series.label} trend</p>
        <span className="rounded-full border border-tp-violet-200 bg-tp-violet-50 px-1.5 py-0.5 text-[9px] font-semibold text-tp-violet-600">
          {series.latest}
        </span>
      </div>
      <div className="flex h-14 items-end gap-1">
        {series.values.map((value, index) => {
          const height = 16 + ((value - min) / span) * 32

          return (
            <button
              key={`${series.id}-${index}`}
              type="button"
              className="group flex flex-1 flex-col items-center justify-end"
            >
              <span
                className="w-full rounded-t-[4px] bg-gradient-to-b from-[#8A4DBB] to-[#4B4AD5] transition-opacity group-hover:opacity-80"
                style={{ height }}
              />
              <span className="mt-1 text-[8px] text-tp-slate-500">D{index + 1}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SummaryCard({
  patient,
}: {
  patient: { id: string; name: string; gender: string; age: number }
}) {
  const [expanded, setExpanded] = useState(false)
  const [activeTrendId, setActiveTrendId] = useState(VITAL_TRENDS[0].id)

  const activeTrend = useMemo(
    () => VITAL_TRENDS.find((trend) => trend.id === activeTrendId) ?? VITAL_TRENDS[0],
    [activeTrendId],
  )

  const urgentItems = SUMMARY_MODULES.filter((module) => module.tone === "critical").length
  const watchItems = SUMMARY_MODULES.filter((module) => module.tone === "watch").length

  return (
    <div className="rounded-xl border border-tp-violet-100 bg-[linear-gradient(135deg,#faf5ff_0%,#ffffff_45%,#f8f9ff_100%)] p-3 shadow-[0_10px_24px_-18px_rgba(103,58,172,0.6)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-[9px]" style={{ background: AI_GRADIENT_SOFT }}>
              <AiBrandSparkIcon size={15} />
            </span>
            <p className="text-[12px] font-semibold text-tp-slate-800">Patient Summary</p>
          </div>
          <p className="text-[10px] leading-[15px] text-tp-slate-500">
            AI triage summary for {patient.name} ({patient.gender}, {patient.age}y) based on past visits, vitals, history, labs, and notes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-full border border-tp-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-tp-slate-600"
        >
          {expanded ? "Collapse" : "Expand"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-tp-slate-200 bg-white px-2 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-tp-slate-400">Urgent Flags</p>
          <p className="mt-0.5 text-[12px] font-semibold text-tp-error-600">{urgentItems}</p>
        </div>
        <div className="rounded-lg border border-tp-slate-200 bg-white px-2 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-tp-slate-400">Watch Items</p>
          <p className="mt-0.5 text-[12px] font-semibold text-tp-warning-600">{watchItems}</p>
        </div>
        <div className="rounded-lg border border-tp-slate-200 bg-white px-2 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-tp-slate-400">Last Visit</p>
          <p className="mt-0.5 text-[12px] font-semibold text-tp-slate-700">Today</p>
        </div>
      </div>

      <div className="mb-3 rounded-lg border border-tp-blue-100 bg-tp-blue-50/50 p-2">
        <p className="text-[10px] font-semibold text-tp-blue-600">Consultation focus now</p>
        <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
          <p className="rounded-md bg-white px-2 py-1 text-[10px] text-tp-slate-700">Persistent fever pattern over 3 days</p>
          <p className="rounded-md bg-white px-2 py-1 text-[10px] text-tp-slate-700">Comorbid risk from diabetes + hypertension</p>
          <p className="rounded-md bg-white px-2 py-1 text-[10px] text-tp-slate-700">Prior lab alert: LDL and TSH above range</p>
          <p className="rounded-md bg-white px-2 py-1 text-[10px] text-tp-slate-700">Medication adherence concern from personal notes</p>
        </div>
      </div>

      <div className="mb-2 rounded-lg border border-tp-slate-200 bg-tp-slate-50 p-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <HeartPulse size={12} className="text-tp-violet-500" />
            <p className="text-[10px] font-semibold text-tp-slate-700">Vitals trend snapshot</p>
          </div>
          <div className="flex items-center gap-1">
            {VITAL_TRENDS.map((trend) => (
              <button
                key={trend.id}
                type="button"
                onClick={() => setActiveTrendId(trend.id)}
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[9px] font-semibold",
                  activeTrendId === trend.id
                    ? "border-tp-violet-300 bg-tp-violet-50 text-tp-violet-600"
                    : "border-tp-slate-200 bg-white text-tp-slate-500",
                )}
              >
                {trend.label}
              </button>
            ))}
          </div>
        </div>
        <MiniTrendBars series={activeTrend} />
      </div>

      {expanded && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SUMMARY_MODULES.map((module) => {
            const classes = toneClasses(module.tone)
            return (
              <div
                key={module.id}
                className={cn("rounded-lg border bg-white p-2", classes.border)}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold text-tp-slate-700">{module.title}</p>
                  <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-semibold", classes.badge)}>
                    {module.status}
                  </span>
                </div>
                <p className="text-[10px] leading-[15px] text-tp-slate-500">{module.detail}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function IntakeSection({
  title,
  copyAllLabel,
  copyToSectionLabel,
  copyToLineLabel,
  items,
  onCopy,
}: {
  title: string
  copyAllLabel: string
  copyToSectionLabel: string
  copyToLineLabel: string
  items: PatientIntakeItem[]
  onCopy: (text: string, successMessage: string) => void
}) {
  const allText = items.map((item) => `${item.line} (${item.detail})`).join("\n")

  return (
    <div className="group/section rounded-xl border border-tp-slate-200 bg-white p-2.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-tp-slate-800">{title}</p>
          <p className="text-[10px] text-tp-slate-500">Collected by symptom collector before consultation</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/section:opacity-100">
          <button
            type="button"
            onClick={() => onCopy(allText, `${title} copied`) }
            className="inline-flex items-center gap-1 rounded-full border border-tp-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-tp-slate-600"
          >
            <Copy size={10} />
            Copy
          </button>
          <button
            type="button"
            onClick={() => onCopy(allText, copyToSectionLabel)}
            className="inline-flex items-center gap-1 rounded-full border border-tp-blue-200 bg-tp-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-tp-blue-600"
          >
            <ClipboardPlus size={10} />
            {copyAllLabel}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group/row rounded-lg border border-tp-slate-100 bg-tp-slate-50 px-2 py-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5">
                  <p className="text-[10px] font-semibold text-tp-slate-700">{item.line}</p>
                  <span className={cn("rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase", severityClasses(item.severity))}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-[10px] text-tp-slate-500">{item.detail}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
                <button
                  type="button"
                  onClick={() => onCopy(`${item.line} (${item.detail})`, `${item.line} copied`) }
                  className="inline-flex size-5 items-center justify-center rounded border border-tp-slate-200 bg-white text-tp-slate-600"
                  aria-label={`Copy ${item.line}`}
                >
                  <Copy size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => onCopy(`${item.line} (${item.detail})`, `${item.line}: ${copyToLineLabel}`)}
                  className="inline-flex items-center gap-1 rounded-full border border-tp-blue-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-tp-blue-600"
                >
                  <ClipboardPlus size={10} />
                  {copyToLineLabel}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function IntakeCollectorCard({
  onCopy,
}: {
  onCopy: (text: string, successMessage: string) => void
}) {
  return (
    <div className="rounded-xl border border-tp-blue-100 bg-[linear-gradient(135deg,rgba(59,130,246,0.08)_0%,rgba(255,255,255,1)_42%)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-[8px] bg-tp-blue-100 text-tp-blue-600">
          <Activity size={12} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-tp-slate-800">Symptoms and medical history collected from the patient</p>
          <p className="text-[10px] text-tp-slate-500">Structured intake before doctor consultation</p>
        </div>
      </div>

      <div className="space-y-2">
        <IntakeSection
          title="Patient current symptoms"
          copyAllLabel="Copy to Symptoms"
          copyToSectionLabel="All symptoms copied to symptoms section"
          copyToLineLabel="Copy to Symptoms"
          items={PATIENT_INTAKE_SYMPTOMS}
          onCopy={onCopy}
        />
        <IntakeSection
          title="Patient provided medical history"
          copyAllLabel="Copy to Medical History"
          copyToSectionLabel="All history copied to medical history section"
          copyToLineLabel="Copy to Medical History"
          items={PATIENT_INTAKE_HISTORY}
          onCopy={onCopy}
        />
      </div>
    </div>
  )
}

function OutputActionChips({ actions }: { actions: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          className="rounded-full border border-tp-violet-200 bg-tp-violet-50 px-2 py-0.5 text-[10px] font-semibold text-tp-violet-600"
        >
          {action}
        </button>
      ))}
    </div>
  )
}

function RichOutputCard({ output }: { output: AgentDynamicOutput }) {
  const chartSeries: VitalTrendSeries | null = output.chart
    ? {
        id: "agent-chart",
        label: output.title,
        unit: output.chart.suffix ?? "",
        values: output.chart.values,
        latest:
          output.chart.values.length > 0
            ? `${output.chart.values[output.chart.values.length - 1]}${output.chart.suffix ?? ""}`
            : "--",
      }
    : null

  if (output.type === "diagnosis") {
    return (
      <div className="rounded-xl border border-tp-violet-100 bg-white p-2.5 shadow-[0_8px_20px_-14px_rgba(103,58,172,0.45)]">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-tp-slate-700">{output.title}</p>
            <p className="truncate text-[10px] text-tp-slate-500">{output.subtitle}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {output.bullets.map((item, index) => {
            const confidence = Math.max(40, 84 - index * 14)
            return (
              <div key={item} className="rounded-lg border border-tp-slate-100 bg-tp-slate-50 p-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold text-tp-slate-700">{item}</p>
                  <span className="rounded-full border border-tp-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-tp-slate-600">
                    {confidence}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-tp-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8A4DBB] to-[#4B4AD5]"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <OutputActionChips actions={output.actions} />
      </div>
    )
  }

  if (output.type === "follow-up") {
    return (
      <div className="rounded-xl border border-tp-violet-100 bg-white p-2.5 shadow-[0_8px_20px_-14px_rgba(103,58,172,0.45)]">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-tp-slate-700">{output.title}</p>
            <p className="truncate text-[10px] text-tp-slate-500">{output.subtitle}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {output.bullets.map((step, index) => (
            <div key={step} className="flex items-start gap-2 rounded-lg border border-tp-slate-100 bg-tp-slate-50 px-2 py-1.5">
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-tp-violet-100 text-[9px] font-semibold text-tp-violet-600">
                {index + 1}
              </span>
              <p className="text-[10px] leading-[15px] text-tp-slate-700">{step}</p>
            </div>
          ))}
        </div>
        <OutputActionChips actions={output.actions} />
      </div>
    )
  }

  if (output.type === "investigations") {
    return (
      <div className="rounded-xl border border-tp-violet-100 bg-white p-2.5 shadow-[0_8px_20px_-14px_rgba(103,58,172,0.45)]">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
            <AiBrandSparkIcon size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-tp-slate-700">{output.title}</p>
            <p className="truncate text-[10px] text-tp-slate-500">{output.subtitle}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {output.bullets.map((test, index) => (
            <div key={test} className="flex items-center justify-between rounded-lg border border-tp-slate-100 bg-white px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-tp-success-500" />
                <p className="text-[10px] font-medium text-tp-slate-700">{test}</p>
              </div>
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[8px] font-semibold",
                index === 0
                  ? "bg-tp-error-50 text-tp-error-600"
                  : index === 1
                    ? "bg-tp-warning-50 text-tp-warning-600"
                    : "bg-tp-success-50 text-tp-success-600",
              )}>
                {index === 0 ? "Priority" : index === 1 ? "Recommended" : "Optional"}
              </span>
            </div>
          ))}
        </div>
        <OutputActionChips actions={output.actions} />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-tp-violet-100 bg-white p-2.5 shadow-[0_8px_20px_-14px_rgba(103,58,172,0.45)]">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
          <AiBrandSparkIcon size={14} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-tp-slate-700">{output.title}</p>
          <p className="truncate text-[10px] text-tp-slate-500">{output.subtitle}</p>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-1 gap-1.5">
        {output.bullets.map((point) => (
          <div key={point} className="rounded-lg border border-tp-slate-100 bg-tp-slate-50 px-2 py-1.5 text-[10px] leading-[15px] text-tp-slate-700">
            {point}
          </div>
        ))}
      </div>

      {chartSeries && (
        <div className="mb-2">
          <MiniTrendBars series={chartSeries} />
        </div>
      )}

      {output.clickableItems && output.clickableItems.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {output.clickableItems.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full border border-tp-slate-200 bg-tp-slate-50 px-2 py-0.5 text-[9px] font-medium text-tp-slate-600"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <OutputActionChips actions={output.actions} />
    </div>
  )
}

export function PatientDetailAgentPanel({
  patient,
  onClose,
}: {
  patient: { id: string; name: string; gender: string; age: number }
  onClose: () => void
}) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    createAgentMessage(
      "assistant",
      `Patient detail mode active for ${patient.name}. I prepared a consultation-ready summary and intake review below.`,
    ),
  ])
  const [pendingCount, setPendingCount] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showTip, setShowTip] = useState(true)
  const [tipIndex, setTipIndex] = useState(0)
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>(PROMPTS)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const timersRef = useRef<number[]>([])
  const voiceTimerRef = useRef<number | null>(null)
  const copyTimerRef = useRef<number | null>(null)

  const tipItems = [
    "Tip: review patient summary first, then ask for diagnosis refinement.",
    "Tip: use copy actions to push intake lines into RxPad quickly.",
    "Tip: ask for trends to get chart-based follow-up guidance.",
  ]

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current)
      }
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const node = listRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
  }, [messages, pendingCount])

  async function handleCopy(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op fallback for non-secure contexts
    }

    setCopyFeedback(successMessage)
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current)
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopyFeedback(null)
      copyTimerRef.current = null
    }, 1400)
  }

  function sendMessage(raw: string, source: "typed" | "canned" | "voice" = "typed") {
    const text = raw.trim()
    if (!text) return

    setMessages((prev) => [...prev, createAgentMessage("user", text)])
    setInputValue("")
    if (source !== "canned") {
      setPromptSuggestions(deriveAgentPromptSuggestions(text, PROMPTS))
    }
    setPendingCount((prev) => prev + 1)

    const timer = window.setTimeout(() => {
      const { reply, output } = buildAgentMockReply(text, {
        id: patient.id,
        name: patient.name,
        gender: patient.gender === "F" ? "F" : "M",
        age: patient.age,
        visitType: "Follow-up",
      })
      setMessages((prev) => [...prev, createAgentMessage("assistant", reply, output)])
      setPendingCount((prev) => Math.max(prev - 1, 0))
      timersRef.current = timersRef.current.filter((id) => id !== timer)
    }, 520)

    timersRef.current.push(timer)
  }

  function handleMicClick() {
    if (isRecording) {
      setIsRecording(false)
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current)
      }
      sendMessage("Voice note: summarize this patient context and suggest next steps.", "voice")
      return
    }

    setIsRecording(true)
    voiceTimerRef.current = window.setTimeout(() => {
      setIsRecording(false)
      sendMessage("Voice note: summarize this patient context and suggest next steps.", "voice")
      voiceTimerRef.current = null
    }, 1800)
  }

  return (
    <aside className="hidden h-full w-[392px] shrink-0 md:block">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-tp-slate-200 bg-white shadow-[0_24px_48px_-24px_rgba(23,23,37,0.35)]">
        <div className="flex items-center justify-between border-b border-tp-slate-100 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-[8px]" style={{ background: AI_GRADIENT_SOFT }}>
              <AiBrandSparkIcon size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-tp-slate-900">Doctor Agent</p>
              <p className="truncate text-[11px] text-tp-slate-500">Patient detail context</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 items-center justify-center rounded-[8px] text-tp-slate-500 transition-colors hover:bg-tp-slate-100"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2">
            <div className="rounded-full border border-white/50 bg-white/55 px-2.5 py-1 text-[10px] font-medium text-tp-slate-500 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.5)] backdrop-blur-md">
              Patient context: {patient.name} ({patient.gender}, {patient.age}y)
            </div>
          </div>

          <div ref={listRef} className="h-full space-y-3 overflow-y-auto px-3 py-3 pt-12">
            <SummaryCard patient={patient} />
            <IntakeCollectorCard onCopy={handleCopy} />

            {copyFeedback && (
              <div className="rounded-lg border border-tp-success-200 bg-tp-success-50 px-2 py-1 text-[10px] font-semibold text-tp-success-700">
                {copyFeedback}
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user"
              return (
                <div key={message.id} className="space-y-1.5">
                  <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-[18px]",
                        isUser
                          ? "rounded-br-[8px] bg-tp-blue-500 text-white"
                          : "rounded-bl-[8px] bg-tp-slate-100 text-tp-slate-700",
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                  {!isUser && message.output && <RichOutputCard output={message.output} />}
                </div>
              )
            })}

            {pendingCount > 0 && (
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-[8px] bg-tp-slate-100 px-3 py-2">
                  <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.2s]" />
                  <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce [animation-delay:-0.1s]" />
                  <span className="size-1.5 rounded-full bg-tp-slate-400 animate-bounce" />
                </div>
                <div className="rounded-xl border border-tp-violet-100 bg-white p-2.5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: AI_GRADIENT_SOFT }}>
                      <AiBrandSparkIcon size={14} />
                    </span>
                    <p className="text-[11px] font-semibold text-tp-slate-700">Generating structured clinical UI</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-[92%] rounded bg-tp-slate-100" />
                    <div className="h-2 w-[78%] rounded bg-tp-slate-100" />
                    <div className="h-2 w-[66%] rounded bg-tp-slate-100" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-tp-slate-100 px-3 py-3">
          <div className="mb-2 overflow-x-auto pb-1">
            <div className="inline-flex min-w-max items-center gap-1.5">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt, "canned")}
                  className="whitespace-nowrap rounded-full border border-tp-violet-200 px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(242,77,182,0.08) 0%, rgba(150,72,254,0.08) 50%, rgba(75,74,213,0.08) 100%)",
                    color: "var(--tp-violet-600)",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  sendMessage(inputValue, "typed")
                }
              }}
              placeholder="Ask doctor agent"
              className="h-10 min-w-0 flex-1 rounded-[10px] border border-tp-slate-200 bg-tp-slate-50 px-3 text-[13px] text-tp-slate-700 outline-none focus:border-tp-blue-300"
            />
            <button
              type="button"
              onClick={handleMicClick}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-[10px] border",
                isRecording
                  ? "border-tp-violet-300 bg-tp-violet-100 text-tp-violet-600"
                  : "border-tp-slate-200 bg-white text-tp-slate-600 hover:bg-tp-slate-50",
              )}
              aria-label={isRecording ? "Stop recording" : "Record audio prompt"}
            >
              <Mic size={15} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => sendMessage(inputValue, "typed")}
              disabled={!inputValue.trim()}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-[10px]",
                inputValue.trim()
                  ? "bg-tp-blue-500 text-white"
                  : "cursor-not-allowed bg-tp-slate-100 text-tp-slate-400",
              )}
            >
              <SendHorizontal size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-tp-slate-500">
            <ShieldCheck size={12} className="text-tp-success-600" />
            <span>Encrypted. Patient details are stored securely and accessible only to this doctor.</span>
          </div>
          {isRecording && (
            <p className="mt-1 text-[10px] font-medium text-tp-violet-600">Recording voice prompt...</p>
          )}
          {showTip && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-tp-slate-400">
              <span className="truncate">{tipItems[tipIndex]}</span>
              <button
                type="button"
                onClick={() => setTipIndex((prev) => (prev + 1) % tipItems.length)}
                className="rounded px-1 py-0.5 text-tp-violet-500 hover:bg-tp-violet-50"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => setShowTip(false)}
                className="rounded px-1 py-0.5 text-tp-slate-500 hover:bg-tp-slate-100"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

"use client"

import React from "react"
import {
  Calendar2, MedalStar, DocumentText, Receipt1,
  Heart, StatusUp, MessageQuestion, Translate,
  ClipboardText, ShieldTick, Activity, Hospital,
  Health, SearchStatus, LanguageCircle, Clock,
} from "iconsax-reactjs"
import type { SmartSummaryData } from "../types"

/**
 * WelcomeScreen — ChatGPT-style intro screen for Dr. Agent.
 *
 * Shown when the chat is empty (no messages sent yet).
 * Disappears on first message or canned action click.
 *
 * Content adapts to the current page context:
 * - Homepage: clinic-wide suggestions
 * - RxPad: prescription-focused suggestions
 * - Patient Detail: patient-specific suggestions
 * - Billing: billing-focused suggestions
 */

export type PageContext = "homepage" | "rxpad" | "patient_detail" | "billing" | "default"

interface QuickAction {
  icon: React.ReactNode
  title: string
  subtitle: string
  message: string
}

const ICON_SIZE = 18

const CONTEXT_ACTIONS: Record<PageContext, QuickAction[]> = {
  homepage: [
    {
      icon: <Heart size={ICON_SIZE} variant="Bulk" />,
      title: "Follow-up Dues",
      subtitle: "View overdue and pending follow-ups that need your attention today",
      message: "Follow-up dues today",
    },
    {
      icon: <StatusUp size={ICON_SIZE} variant="Bulk" />,
      title: "Weekly KPIs",
      subtitle: "Compare this week's clinic performance against your previous week",
      message: "Weekly KPI dashboard",
    },
    {
      icon: <Receipt1 size={ICON_SIZE} variant="Bulk" />,
      title: "Today's Collection",
      subtitle: "Get a quick summary of billing, advances, and outstanding dues",
      message: "Today's collection",
    },
    {
      icon: <Activity size={ICON_SIZE} variant="Bulk" />,
      title: "Chronic Conditions",
      subtitle: "See distribution of DM, HTN, and other chronic conditions in your clinic",
      message: "Condition distribution",
    },
  ],
  // RxPad actions are built dynamically — see buildRxPadActions()
  rxpad: [],
  patient_detail: [
    {
      icon: <DocumentText size={ICON_SIZE} variant="Bulk" />,
      title: "Patient Summary",
      subtitle: "Get a complete clinical overview including vitals, labs, and history",
      message: "Patient summary",
    },
    {
      icon: <Activity size={ICON_SIZE} variant="Bulk" />,
      title: "Vital Trends",
      subtitle: "Track blood pressure, weight, and SpO2 trends over recent visits",
      message: "Vital trends",
    },
    {
      icon: <ClipboardText size={ICON_SIZE} variant="Bulk" />,
      title: "Lab Results",
      subtitle: "Review recent lab values and flagged abnormal parameters",
      message: "Labs flagged",
    },
    {
      icon: <Calendar2 size={ICON_SIZE} variant="Bulk" />,
      title: "Last Visit",
      subtitle: "View the previous visit summary, prescriptions, and follow-up notes",
      message: "Last visit details",
    },
  ],
  billing: [
    {
      icon: <Receipt1 size={ICON_SIZE} variant="Bulk" />,
      title: "Today's Billing",
      subtitle: "View today's revenue collection and outstanding payment summary",
      message: "Show today's billing summary",
    },
    {
      icon: <StatusUp size={ICON_SIZE} variant="Bulk" />,
      title: "Revenue Trends",
      subtitle: "Compare weekly and monthly revenue to spot growth patterns",
      message: "Show revenue trends this week",
    },
    {
      icon: <Hospital size={ICON_SIZE} variant="Bulk" />,
      title: "Pending Dues",
      subtitle: "See patients with outstanding balances that need follow-up",
      message: "Show patients with pending dues",
    },
    {
      icon: <MessageQuestion size={ICON_SIZE} variant="Bulk" />,
      title: "Generate Invoice",
      subtitle: "Create and send a new invoice for a specific patient visit",
      message: "Help me generate an invoice",
    },
  ],
  default: [
    {
      icon: <Health size={ICON_SIZE} variant="Bulk" />,
      title: "Patient Summary",
      subtitle: "Get a complete clinical overview of the selected patient's history",
      message: "Show me this patient's summary",
    },
    {
      icon: <SearchStatus size={ICON_SIZE} variant="Bulk" />,
      title: "Lab Results",
      subtitle: "Review recent investigation reports and flagged abnormal values",
      message: "Show recent lab results",
    },
    {
      icon: <Calendar2 size={ICON_SIZE} variant="Bulk" />,
      title: "Today's Schedule",
      subtitle: "View today's appointment list and upcoming patient queue",
      message: "Show today's schedule",
    },
    {
      icon: <MessageQuestion size={ICON_SIZE} variant="Bulk" />,
      title: "Ask Anything",
      subtitle: "Ask clinical questions, guidelines, or anything about your practice",
      message: "What clinical guidelines apply here?",
    },
  ],
}

/**
 * ═══════════════════════════════════════════════════════════════
 * PATIENT CANNED ACTIONS — Smart Priority System
 * ═══════════════════════════════════════════════════════════════
 *
 * 5 candidate cards, pick best 4 based on available patient data:
 *
 *   1. INTAKE    — "Reported by patient"         (only if symptom collector data exists)
 *   2. SUMMARY   — "Patient summary"            (always available)
 *   3. HISTORY   — "Medical history"            (past visits, prescriptions)
 *   4. SPECIALTY — Specialty-specific history    (obstetric / gynec / pediatric / ophthal)
 *   5. VITALS    — "Vital trends"               (fallback when a slot is empty)
 *
 * Priority rules:
 *   WITH intake + WITH specialty → intake, summary, history, specialty
 *   WITH intake + NO specialty  → intake, summary, history, vitals
 *   NO intake + WITH specialty  → summary, history, specialty, vitals
 *   NO intake + NO specialty    → summary, history, vitals, past visit details
 *
 * This logic is shared between V0 and non-V0 panels.
 * ═══════════════════════════════════════════════════════════════
 */

// Individual action definitions for dynamic composition
const PATIENT_ACTION_INTAKE: QuickAction = {
  icon: <ClipboardText size={ICON_SIZE} variant="Bulk" />,
  title: "Reported by patient",
  subtitle: "Symptoms & history shared before the visit",
  message: "Show pre-visit intake",
}
const PATIENT_ACTION_SUMMARY: QuickAction = {
  icon: <DocumentText size={ICON_SIZE} variant="Bulk" />,
  title: "Patient summary",
  subtitle: "Clinical overview with vitals, labs, and history",
  message: "Patient summary",
}
const PATIENT_ACTION_HISTORY: QuickAction = {
  icon: <Clock size={ICON_SIZE} variant="Bulk" />,
  title: "Medical history",
  subtitle: "Past visits, prescriptions, and treatment history",
  message: "Medical history",
}
const PATIENT_ACTION_VITALS: QuickAction = {
  icon: <Activity size={ICON_SIZE} variant="Bulk" />,
  title: "Today's vitals",
  subtitle: "View today's recorded vital parameters at a glance",
  message: "Today's vitals",
}
const PATIENT_ACTION_PAST_VISITS: QuickAction = {
  icon: <Calendar2 size={ICON_SIZE} variant="Bulk" />,
  title: "Past visit details",
  subtitle: "Previous visit prescriptions, follow-ups, and notes",
  message: "Last visit details",
}

function getSpecialtyAction(summary: SmartSummaryData): QuickAction | null {
  if (summary.obstetricData) {
    return {
      icon: <Health size={ICON_SIZE} variant="Bulk" />,
      title: "Obstetric history",
      subtitle: "ANC schedule, pregnancy parameters, and alerts",
      message: "Obstetric summary",
    }
  }
  if (summary.gynecData) {
    return {
      icon: <Health size={ICON_SIZE} variant="Bulk" />,
      title: "Gynec history",
      subtitle: "Menstrual cycle, screening, and gynec parameters",
      message: "Gynec summary",
    }
  }
  if (summary.pediatricsData) {
    return {
      icon: <Health size={ICON_SIZE} variant="Bulk" />,
      title: "Vaccination & growth",
      subtitle: "Growth chart, milestones, and vaccination schedule",
      message: "Growth & vaccines",
    }
  }
  if (summary.ophthalData) {
    return {
      icon: <Health size={ICON_SIZE} variant="Bulk" />,
      title: "Vision history",
      subtitle: "Visual acuity, IOP, and ophthalmic examination",
      message: "Vision summary",
    }
  }
  return null
}

function buildPatientActions(summary?: SmartSummaryData): QuickAction[] {
  if (!summary) {
    // No summary data — show generic actions
    return [PATIENT_ACTION_SUMMARY, PATIENT_ACTION_HISTORY, PATIENT_ACTION_VITALS, PATIENT_ACTION_PAST_VISITS]
  }

  const hasIntake = !!summary.symptomCollectorData
  const specialtyAction = getSpecialtyAction(summary)

  if (hasIntake && specialtyAction) {
    return [PATIENT_ACTION_INTAKE, PATIENT_ACTION_SUMMARY, PATIENT_ACTION_HISTORY, specialtyAction]
  }
  if (hasIntake && !specialtyAction) {
    return [PATIENT_ACTION_INTAKE, PATIENT_ACTION_SUMMARY, PATIENT_ACTION_HISTORY, PATIENT_ACTION_VITALS]
  }
  if (!hasIntake && specialtyAction) {
    return [PATIENT_ACTION_SUMMARY, PATIENT_ACTION_HISTORY, specialtyAction, PATIENT_ACTION_VITALS]
  }
  // No intake, no specialty
  return [PATIENT_ACTION_SUMMARY, PATIENT_ACTION_HISTORY, PATIENT_ACTION_VITALS, PATIENT_ACTION_PAST_VISITS]
}

interface WelcomeScreenProps {
  context?: PageContext
  doctorName?: string
  /** Patient name — shown in subtitle when in patient-specific context (RxPad, patient detail) */
  patientName?: string
  /** Whether this patient has pre-visit intake data — affects canned action order */
  hasIntake?: boolean
  /** Patient summary data — used by the smart priority system to pick the best 4 canned actions */
  summary?: SmartSummaryData
  onActionClick: (message: string) => void
}

export function WelcomeScreen({
  context = "default",
  doctorName,
  patientName,
  hasIntake = false,
  summary,
  onActionClick,
}: WelcomeScreenProps) {
  // Patient context (RxPad / patient detail): smart priority system picks best 4 from 5 candidates
  // Other contexts (homepage, billing, default): static preset actions
  const actions = (context === "rxpad" || context === "patient_detail")
    ? buildPatientActions(summary)
    : (CONTEXT_ACTIONS[context] ?? CONTEXT_ACTIONS.default)
  const greeting = getGreeting()
  const displayName = doctorName ? `Dr. ${doctorName.split(" ")[0]}` : "Doctor"
  const isPatientContext = context === "rxpad" || context === "patient_detail"

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-[12px] py-[16px] relative">
      {/* Background — white base + animated gradient GIF at 4% opacity */}
      <div className="absolute inset-0 bg-white pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "url(/icons/dr-agent/chat-bg.gif)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.04,
      }} />

      {/* Spark icon — 36px, animated gradient bg + rotating spark */}
      <div className="relative z-[1] mb-[10px]">
        <span
          className="pointer-events-none select-none relative inline-flex items-center justify-center overflow-hidden"
          style={{ width: 36, height: 36, borderRadius: 36 * 0.24 }}
          aria-hidden="true"
        >
          {/* White base + animated gradient GIF at 30% opacity on top */}
          <div className="absolute inset-0 bg-white" style={{ borderRadius: 36 * 0.24 }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "url(/icons/dr-agent/chat-bg.gif)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 36 * 0.24,
            opacity: 0.3,
          }} />
          {/* Rotating white spark overlay */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/dr-agent/agent-spark.svg"
            width={36 * 0.75}
            height={36 * 0.75}
            alt=""
            className="relative z-10 welcome-spark-rotate"
            draggable={false}
          />
        </span>
      </div>

      {/* Greeting — 15px semibold */}
      <h2 className="relative z-[1] text-[18px] font-semibold text-tp-slate-800 text-center leading-[24px]">
        {greeting}, {displayName}!
      </h2>
      {/* Subtitle — 13px with relaxed line height */}
      <p className="relative z-[1] mt-[4px] text-[14px] text-center leading-[18px]" style={{ color: "var(--tp-slate-400, #A2A2A8)" }}>
        {isPatientContext && patientName
          ? <>What would you like to know about patient <span className="font-semibold" style={{ color: "var(--tp-slate-500, #717179)" }}>{patientName.split(" ")[0]}</span> today?</>
          : "What can I assist you with today?"
        }
      </p>

      {/* Quick action cards — 2x2 grid, full width */}
      <div className="relative z-[1] mt-[16px] grid grid-cols-2 gap-[10px] w-full">
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onActionClick(action.message)}
            className="welcome-canned-card group relative flex flex-col items-start text-left transition-all overflow-hidden"
            style={{
              borderRadius: 14,
              padding: "14px 12px 16px",
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(226,226,234,0.5)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}
          >
            {/* Gradient background overlay — GIF at 6% opacity */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "url(/icons/dr-agent/chat-bg.gif)",
              backgroundSize: "cover",
              opacity: 0.06,
              borderRadius: 14,
            }} />

            {/* Icon — gradient colored, bare (no background) */}
            <span className="relative z-[1] mb-[8px] welcome-icon-grad" style={{ opacity: 0.85 }}>
              {action.icon}
            </span>

            {/* Title — 12px semibold */}
            <span className="relative z-[1] text-[12px] font-semibold leading-[15px] w-full" style={{ color: "var(--tp-slate-700, #454551)" }}>
              {action.title}
            </span>

            {/* Subtitle — 11px with 2-line clamp */}
            <span className="relative z-[1] mt-[4px] text-[11px] font-normal leading-[15px] w-full welcome-card-subtitle" style={{ color: "var(--tp-slate-400, #A2A2A8)" }}>
              {action.subtitle}
            </span>
          </button>
        ))}
      </div>

      {/* Gradient color for welcome card icons + spark rotation + hover/active card effects */}
      <style>{`
        .welcome-icon-grad svg { color: #8B5CF6; }
        .welcome-icon-grad svg path,
        .welcome-icon-grad svg circle,
        .welcome-icon-grad svg rect {
          fill: url(#welcomeIconGrad);
        }
        .welcome-card-subtitle {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .welcome-canned-card {
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .welcome-canned-card:hover {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 3px 12px rgba(0,0,0,0.06) !important;
          border-color: rgba(138,77,187,0.25) !important;
        }
        .welcome-canned-card:active {
          transform: translateY(0) scale(0.99);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important;
        }
        @keyframes welcomeSparkRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .welcome-spark-rotate {
          animation: welcomeSparkRotate 16s linear infinite;
        }
      `}</style>
      <svg width={0} height={0} className="absolute">
        <defs>
          <linearGradient id="welcomeIconGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BE6DCF" />
            <stop offset="100%" stopColor="#5351BD" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

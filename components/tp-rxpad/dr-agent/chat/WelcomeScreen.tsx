"use client"

import React from "react"
import {
  Calendar2, MedalStar, DocumentText, Receipt1,
  Heart, StatusUp, MessageQuestion, Translate,
  ClipboardText, ShieldTick, Activity, Hospital,
  Health, SearchStatus, LanguageCircle, Firstline,
} from "iconsax-reactjs"

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
 * RXPAD CANNED ACTIONS — Dynamic based on patient context
 * ═══════════════════════════════════════════════════════════════
 *
 * Logic for which 4 actions to show (RxPad / patient context):
 *
 * IF patient has pre-visit intake (symptom collector data):
 *   1. Pre-visit Intake — show what the patient reported before the visit
 *   2. Patient Summary — clinical overview
 *   3. Suggest Diagnosis — DDX based on symptoms
 *   4. Investigations — recommended labs/imaging
 *
 * IF patient has NO intake but has history (returning patient):
 *   1. Patient Summary — clinical overview
 *   2. Suggest Diagnosis — DDX based on history
 *   3. Drug Interactions — check current meds
 *   4. Investigations — recommended labs
 *
 * IF new patient (no history, no intake):
 *   1. Patient Summary — will show empty state
 *   2. Suggest Diagnosis — start clinical reasoning
 *   3. Investigations — suggest baseline tests
 *   4. Drug Interactions — check interactions
 *
 * The first action is always the most relevant starting point.
 * ═══════════════════════════════════════════════════════════════
 */

// Individual action definitions for dynamic composition
const RXPAD_ACTION_INTAKE: QuickAction = {
  icon: <ClipboardText size={ICON_SIZE} variant="Bulk" />,
  title: "Pre-visit Intake",
  subtitle: "View patient-reported symptoms, history, and questions before the visit",
  message: "Show pre-visit intake",
}
const RXPAD_ACTION_SUMMARY: QuickAction = {
  icon: <DocumentText size={ICON_SIZE} variant="Bulk" />,
  title: "Patient Summary",
  subtitle: "Get a complete clinical overview with vitals, labs, and history",
  message: "Patient summary",
}
const RXPAD_ACTION_DDX: QuickAction = {
  icon: <Health size={ICON_SIZE} variant="Bulk" />,
  title: "Suggest Diagnosis",
  subtitle: "Get AI-assisted differential diagnosis based on current symptoms",
  message: "Suggest DDX based on current symptoms",
}
const RXPAD_ACTION_INVESTIGATIONS: QuickAction = {
  icon: <SearchStatus size={ICON_SIZE} variant="Bulk" />,
  title: "Investigations",
  subtitle: "Get recommended lab tests and imaging for this patient's condition",
  message: "Suggest investigations for this patient",
}
const RXPAD_ACTION_INTERACTIONS: QuickAction = {
  icon: <ShieldTick size={ICON_SIZE} variant="Bulk" />,
  title: "Drug Interactions",
  subtitle: "Check for potential drug-drug interactions in current medications",
  message: "Check drug interactions for current medications",
}

function buildRxPadActions(hasIntake: boolean): QuickAction[] {
  if (hasIntake) {
    return [RXPAD_ACTION_INTAKE, RXPAD_ACTION_SUMMARY, RXPAD_ACTION_DDX, RXPAD_ACTION_INVESTIGATIONS]
  }
  return [RXPAD_ACTION_SUMMARY, RXPAD_ACTION_DDX, RXPAD_ACTION_INTERACTIONS, RXPAD_ACTION_INVESTIGATIONS]
}

interface WelcomeScreenProps {
  context?: PageContext
  doctorName?: string
  /** Patient name — shown in subtitle when in patient-specific context (RxPad, patient detail) */
  patientName?: string
  /** Whether this patient has pre-visit intake data — affects canned action order */
  hasIntake?: boolean
  onActionClick: (message: string) => void
}

export function WelcomeScreen({
  context = "default",
  doctorName,
  patientName,
  hasIntake = false,
  onActionClick,
}: WelcomeScreenProps) {
  // RxPad + patient_detail: dynamic actions based on patient context; others: static
  const actions = (context === "rxpad" || context === "patient_detail")
    ? buildRxPadActions(hasIntake)
    : (CONTEXT_ACTIONS[context] || CONTEXT_ACTIONS.default)
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

      {/* Spark icon — 44px, animated gradient bg + rotating spark */}
      <div className="relative z-[1] mb-[12px]">
        <span
          className="pointer-events-none select-none relative inline-flex items-center justify-center overflow-hidden"
          style={{ width: 44, height: 44, borderRadius: 44 * 0.24 }}
          aria-hidden="true"
        >
          {/* White base + animated gradient GIF at 30% opacity on top */}
          <div className="absolute inset-0 bg-white" style={{ borderRadius: 44 * 0.24 }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "url(/icons/dr-agent/chat-bg.gif)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 44 * 0.24,
            opacity: 0.3,
          }} />
          {/* Rotating white spark overlay */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/dr-agent/agent-spark.svg"
            width={44 * 0.75}
            height={44 * 0.75}
            alt=""
            className="relative z-10 welcome-spark-rotate"
            draggable={false}
          />
        </span>
      </div>

      {/* Greeting — 15px semibold */}
      <h2 className="relative z-[1] text-[14px] font-semibold text-tp-slate-800 text-center leading-[20px]">
        {greeting}, {displayName}!
      </h2>
      {/* Subtitle — 13px with relaxed line height */}
      <p className="relative z-[1] mt-[4px] text-[13px] text-center leading-[18px]" style={{ color: "#A2A2A8" }}>
        {isPatientContext && patientName
          ? <>What would you like to know about patient <span className="font-semibold" style={{ color: "#6B7280" }}>{patientName.split(" ")[0]}</span> today?</>
          : "What can I assist you with today?"
        }
      </p>

      {/* Quick action cards — 2x2 grid, full width */}
      <div className="relative z-[1] mt-[16px] grid grid-cols-2 gap-[8px] w-full">
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onActionClick(action.message)}
            className="group relative flex flex-col items-start p-[10px] pb-[12px] text-left transition-all overflow-hidden hover:scale-[1.02]"
            style={{
              borderRadius: 14,
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            {/* Gradient background overlay — GIF at 8% opacity */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "url(/icons/dr-agent/chat-bg.gif)",
              backgroundSize: "cover",
              opacity: 0.08,
              borderRadius: 14,
            }} />

            {/* Icon — gradient colored */}
            <span className="relative z-[1] mb-[4px] welcome-icon-grad" style={{ opacity: 0.8 }}>
              {React.cloneElement(action.icon as React.ReactElement, { size: 20 })}
            </span>

            {/* Title — 13px semibold */}
            <span className="relative z-[1] text-[13px] font-semibold leading-[17px]" style={{ color: "#454551" }}>
              {action.title}
            </span>

            {/* Subtitle — 12px with generous line height */}
            <span className="relative z-[1] mt-[2px] text-[12px] font-normal leading-[17px]" style={{ color: "#9E9EA8" }}>
              {action.subtitle}
            </span>
          </button>
        ))}
      </div>

      {/* Gradient color for welcome card icons + spark rotation */}
      <style>{`
        .welcome-icon-grad svg { color: #8B5CF6; }
        .welcome-icon-grad svg path,
        .welcome-icon-grad svg circle,
        .welcome-icon-grad svg rect {
          fill: url(#welcomeIconGrad);
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

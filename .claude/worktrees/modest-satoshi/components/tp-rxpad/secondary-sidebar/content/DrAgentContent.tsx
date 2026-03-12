/**
 * Dr Agent content panel — matches Figma DetailedSectionView (Dr Agent).
 * Shows: patient chip, agent welcome message, patient summary card,
 * and a chat input + quick suggestion chips at the bottom.
 */
import React from "react";

const imgGradientAni3 = "/assets/45653018b6de55994a5e10063aed7adb826f72fd.png";
const imgIntersect = "/assets/95670a821cdc29ab841d08c3a21a5b6bf1eea8ee.png";

// ─── Patient chip ─────────────────────────────────────────────────────────────

function PatientChip() {
  return (
    <div
      className="flex items-center justify-center relative shrink-0 mx-auto mt-[12px] mb-[8px] bg-tp-slate-100/70"
      style={{ borderRadius: "72.626px" }}
    >
      <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[8px] py-[5px] relative rounded-[inherit]">
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
          {/* user icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-70">
            <circle cx="6" cy="4" r="2.5" fill="var(--tp-slate-700)" opacity="0.6" />
            <path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="var(--tp-slate-700)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </svg>
          <div className="flex items-center font-sans leading-[0] not-italic relative shrink-0 text-tp-slate-900 text-[12px] whitespace-nowrap gap-[3px]">
            <span className="font-medium leading-[1.25]">Shyam GR</span>
            <span className="leading-[1.25] tracking-[0.12px]">(M, 25y)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dr Agent welcome message ─────────────────────────────────────────────────

function AgentMessage() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full p-[12px] pt-0">
      {/* Agent avatar */}
      <div className="bg-white relative rounded-bl-[7px] rounded-tl-[7px] rounded-tr-[7px] shrink-0 size-[28px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img alt="" className="absolute inset-0 object-cover size-full" src={imgGradientAni3} />
        </div>
        <div className="absolute left-[4px] top-[4px] size-[20px]">
          <img alt="" className="absolute block size-full" src={imgIntersect} />
        </div>
      </div>
      {/* Message */}
      <div className="flex flex-[1_0_0] font-sans leading-[0] min-h-px min-w-px not-italic relative text-tp-slate-700 text-[0px]">
        <p className="text-[12px] whitespace-pre-wrap">
          <span className="leading-[18px] font-normal">{"Hi Doctor! Start your consultation by "}</span>
          <span className="leading-[18px] font-semibold">{"dictating the Rx "}</span>
          <span className="leading-[18px] font-normal">{"or "}</span>
          <span className="leading-[18px] font-semibold">{"by capturing your conversation with the patient"}</span>
          <span className="leading-[18px] font-normal">{". I'll "}</span>
          <span className="leading-[18px] font-semibold">transcribe</span>
          <span className="leading-[18px] font-normal">{" & "}</span>
          <span className="leading-[18px] font-bold">structure</span>
          <span className="leading-[18px] font-normal">{" it into the "}</span>
          <span className="leading-[18px] font-semibold">{"Rx Pad "}</span>
          <span className="leading-[18px] font-normal text-tp-slate-700">automatically!</span>
        </p>
      </div>
    </div>
  );
}

// ─── Patient's Summary card ───────────────────────────────────────────────────

function PatientSummaryCard() {
  return (
    <div className="relative shrink-0 w-full px-[12px]">
      <div className="pl-[16px] relative w-full">
        <div
          className="relative w-full bg-white/60"
          style={{
            backdropFilter: "blur(1.28px)",
            borderRadius: "7.681px",
            boxShadow: "0px 0px 3.841px 0px rgba(242,77,182,0.05)",
          }}
        >
          <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col gap-[8px] items-center px-[10px] py-[8px] relative w-full">
              {/* Summary heading */}
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
                <div className="opacity-80 overflow-clip relative shrink-0 size-[14px]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="2" width="9" height="10" rx="1.5" fill="var(--tp-violet-100)" />
                    <rect x="3" y="1" width="8" height="10" rx="1.5" fill="var(--tp-violet-500)" />
                    <rect x="5" y="4" width="5" height="1.2" rx="0.6" fill="var(--tp-violet-100)" />
                    <rect x="5" y="6.5" width="4" height="1" rx="0.5" fill="var(--tp-violet-100)" />
                    <rect x="5" y="8.5" width="3" height="1" rx="0.5" fill="var(--tp-violet-100)" />
                  </svg>
                </div>
                <p className="font-sans font-semibold leading-[18px] not-italic opacity-90 relative shrink-0 text-tp-slate-700 text-[12px]">
                  Patient's Summary
                </p>
              </div>
              {/* Divider */}
              <div className="w-full h-[0.4px] bg-tp-slate-200" />
              {/* Summary text */}
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                <p className="font-sans leading-[18px] not-italic opacity-90 relative shrink-0 text-tp-slate-700 text-[12px] tracking-[0.08px] w-full whitespace-pre-wrap">
                  <span className="font-medium">26-year-old male with diabetes and hypertension</span>
                  <span>{`, presented for follow-up. Known case of diabetes and hypertension for `}</span>
                  <span className="font-medium">2 years</span>
                  <span>{`, on regular medication. `}</span>
                  <span className="font-medium">Last visit (24/12/2025)</span>
                  <span>{` summary noted `}</span>
                  <span className="font-medium">viral fever with mild dehydration</span>
                  <span>{`; the patient was prescribed `}</span>
                  <span className="font-medium">Paracetamol 650 mg </span>
                  <span>SOS</span>
                </p>
              </div>
              {/* View Detailed Summary */}
              <button className="content-stretch cursor-pointer flex gap-[4px] items-center justify-center px-[12px] py-[6px] relative shrink-0 rounded-[10px] border-0 bg-transparent">
                <p className="font-sans font-medium leading-[16px] not-italic relative shrink-0 text-tp-blue-500 text-[12px] text-center">
                  View Detailed Summary
                </p>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 4l2 2 2-2" stroke="var(--tp-blue-500)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom chat input ────────────────────────────────────────────────────────

function QuickSuggestionChip({ text }: { text: string }) {
  return (
    <div
      className="flex items-center justify-center px-[8px] py-[4px] relative shrink-0 cursor-pointer"
      style={{
        background: "linear-gradient(rgba(242,77,182,0.06) 0%, rgba(150,72,254,0.06) 50%, rgba(75,74,213,0.06) 100%)",
        backdropFilter: "blur(1.429px)",
        borderRadius: "71.426px",
        border: "0.714px solid var(--tp-blue-500)",
        boxShadow: "0px 1.429px 2.857px 0px rgba(0,0,0,0.06)",
      }}
    >
      <p
        className="font-sans font-medium leading-[normal] relative shrink-0 text-[11px] whitespace-nowrap"
        style={{ background: "linear-gradient(to left, #9e60d8, #7756d6 50%, #564dd5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        {text}
      </p>
    </div>
  );
}

function ChatInput() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center p-[12px] relative shrink-0 w-full">
      {/* Quick suggestion chips */}
      <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full flex-wrap">
        <QuickSuggestionChip text="Summarize symptoms" />
        <QuickSuggestionChip text="Add exam notes" />
        <QuickSuggestionChip text="Draft medication" />
        <QuickSuggestionChip text="Plan follow-up" />
      </div>
      {/* Input + Speak row */}
        <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full">
        {/* Text input */}
        <div className="relative flex-[1_0_0] min-h-px min-w-px">
          <div className="bg-tp-slate-50 rounded-[8px] w-full overflow-hidden border border-tp-violet-200/60">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center px-[10px] py-[8px] relative size-full">
                <p className="font-sans font-normal leading-[16px] relative shrink-0 text-tp-slate-400 text-[12px] tracking-[0.02px]">
                  Ask Dr. Agent
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Speak button */}
        <div
          className="content-stretch flex gap-[4px] h-[32px] items-center justify-center overflow-clip px-[10px] relative rounded-[8px] shrink-0 cursor-pointer"
          style={{
            background: "linear-gradient(to right, #9a7dda, #2f2ea4)",
            boxShadow: "0px 0px 5px 0px rgba(203,122,226,0.4)",
          }}
        >
          {/* Waveform icon */}
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="shrink-0">
            <path d="M1 5h1.5M3 5V3.5M4 5V2M5 5V1M6 5V2M7 5V3.5M8 5V5M9.5 5H11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-sans font-medium leading-[15px] relative shrink-0 text-[12px] text-white tracking-[0.02px]">
            Speak
          </p>
        </div>
      </div>
      {/* Privacy notice */}
      <div className="content-stretch flex gap-[4px] items-center mix-blend-luminosity opacity-40 relative shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
          <circle cx="5" cy="5" r="4.5" fill="var(--tp-success-600)" />
          <path d="M3 5l1.5 1.5L7 3.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-sans leading-[14px] not-italic relative shrink-0 text-tp-slate-700 text-[10px]">
          Your Data is Secured & only doctor can access it
        </p>
      </div>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function DrAgentContent() {
  return (
    <div className="content-stretch flex flex-col relative size-full">
      {/* Scrollable chat area */}
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full overflow-y-auto">
        <PatientChip />
        <AgentMessage />
        <PatientSummaryCard />
      </div>
      {/* Sticky chat input at bottom */}
      <div className="bg-white border-t border-tp-slate-100 shrink-0 w-full">
        <ChatInput />
      </div>
    </div>
  );
}

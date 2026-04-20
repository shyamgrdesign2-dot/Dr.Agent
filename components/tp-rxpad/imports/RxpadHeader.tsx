import React, { useState } from "react"
import { TPSplitButton } from "@/components/tp-ui/button-system/TPSplitButton"
import {
  ArrowDown2,
  Calendar2,
  CallCalling,
  Card,
  ClipboardText,
  DocumentSketch,
  Edit2,
  Eye,
  Grid5,
  Login,
  Ram,
  Setting2,
  User,
} from "iconsax-reactjs"
import { ChevronLeft, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TutorialPlayIcon } from "@/components/tp-ui/TutorialPlayIcon"

type RxpadHeaderProps = {
  className?: string
  onBack?: () => void
  onVisitSummary?: () => void
  patientName?: string
  patientMeta?: string
}

export default function RxpadHeader({ className, onBack, onVisitSummary, patientName, patientMeta }: RxpadHeaderProps) {
  const displayName = patientName ?? "Shyam GR"
  const metaParts = patientMeta?.split(",").map((s) => s.trim()) ?? ["Male", "25y"]
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className={`bg-white relative h-[62px] w-full overflow-x-auto ${className ?? ""}`} data-name="Rxpad_Header">
      <div className="flex h-full min-w-[980px] w-full flex-row items-center">
        <div className="content-stretch flex items-center justify-between pr-[16px] py-[10px] relative size-full max-xl:pr-[10px]">
          <div className="content-stretch flex min-w-0 items-center gap-[16px] relative max-xl:gap-[10px]">
            <button
              aria-label="Go back"
              className="bg-white content-stretch flex h-[60px] items-center justify-center px-[15px] py-[20px] relative shrink-0 w-[80px] transition-colors hover:bg-tp-slate-50"
              data-name="Back Button"
              onClick={onBack}
              type="button"
            >
              <div aria-hidden="true" className="absolute border-[#f1f1f5] border-b-[0.5px] border-r-[0.5px] border-solid inset-[0_-0.25px_-0.25px_0] pointer-events-none" />
              <div className="relative shrink-0 size-[24px]" data-name="Back Arrow">
                <ChevronLeft color="#454551" size={24} strokeWidth={2} />
              </div>
            </button>
            <div className="content-stretch flex items-center min-h-px min-w-0 relative" data-name="User Info">
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="content-stretch flex gap-[6px] items-center relative shrink-0 min-w-0 max-w-[200px] rounded-[10px] px-1 py-0.5 text-left transition-colors hover:bg-tp-slate-50"
                    data-name="Container"
                  >
                    <div className="bg-[#f1f1f5] relative rounded-[1250px] shrink-0 size-[40px]" data-name="Profile Image">
                      <div className="absolute left-[8.57px] size-[22.857px] top-[8.57px]" data-name="User">
                        <User color="#545460" size={22.857} variant="Bulk" />
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col items-start relative shrink-0 min-w-0 w-[200px] max-w-[200px]" data-name="User Details">
                      <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full" data-name="Header">
                        <p className="font-['Inter',sans-serif] font-semibold leading-[normal] max-w-[150px] min-w-0 truncate not-italic relative shrink text-tp-slate-700 text-[14px]">
                          {displayName}
                        </p>
                        <div className="relative shrink-0 size-[18px]" data-name="Dropdown Icon">
                          <ArrowDown2
                            color="var(--tp-slate-700)"
                            size={20}
                            strokeWidth={2}
                            variant="Linear"
                            className={`transition-transform duration-150 ${isProfileOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                      <div
                        className="content-stretch flex items-start leading-[18px] relative shrink-0 text-[12px] tracking-[0.1px] w-full font-['Inter',sans-serif] font-medium text-tp-slate-600"
                        data-name="Age & gender"
                      >
                        <p className="relative shrink-0 whitespace-nowrap">{metaParts[0] ?? "Male"}</p>
                        <p className="relative shrink-0 text-tp-slate-300 text-center w-[8px]">|</p>
                        <p className="relative shrink-0 whitespace-nowrap">{metaParts[1] ?? "25y"}</p>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={6}
                  className="relative z-[120] w-[320px] rounded-[22px] border border-tp-slate-100 bg-white p-4 shadow-[0_14px_28px_rgba(15,23,42,0.14)]"
                >
                  <div className="pointer-events-none absolute -top-[11px] left-[94px] h-0 w-0 border-b-[11px] border-l-[11px] border-r-[11px] border-b-tp-slate-100 border-l-transparent border-r-transparent" />
                  <div className="pointer-events-none absolute -top-[10px] left-[95px] h-0 w-0 border-b-[10px] border-l-[10px] border-r-[10px] border-b-white border-l-transparent border-r-transparent" />
                  <div className="space-y-4">
                    {[
                      { key: "patient-id", label: "Patient ID", value: "PAT0061", icon: <Card color="var(--tp-violet-500)" size={18} strokeWidth={1.5} variant="Linear" /> },
                      { key: "mobile", label: "Mobile Number", value: "9567933357", icon: <CallCalling color="var(--tp-violet-500)" size={18} strokeWidth={1.5} variant="Linear" /> },
                      { key: "dob", label: "DOB", value: "24 Jul 2000", icon: <Calendar2 color="var(--tp-violet-500)" size={18} strokeWidth={1.5} variant="Linear" /> },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center gap-3.5">
                        <div className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full bg-tp-violet-50">{item.icon}</div>
                        <div className="min-w-0">
                          <p className="font-['Inter',sans-serif] text-[14px] leading-[20px] font-medium text-tp-slate-600">{item.label}</p>
                          <p className="font-['Inter',sans-serif] text-[16px] leading-[22px] font-semibold text-tp-slate-700">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(false)}
                      className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] border border-tp-blue-200 bg-white px-4 text-tp-blue-500 hover:bg-tp-blue-50/40"
                    >
                      <Edit2 color="currentColor" size={20} strokeWidth={1.5} variant="Linear" />
                      <span className="font-['Inter',sans-serif] text-[16px] leading-[20px] font-semibold">Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false)
                        onVisitSummary?.()
                      }}
                      className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] border border-tp-blue-200 bg-white px-4 text-tp-blue-500 hover:bg-tp-blue-50/40"
                    >
                      <ClipboardText color="currentColor" size={20} strokeWidth={1.5} variant="Linear" />
                      <span className="font-['Inter',sans-serif] text-[16px] leading-[20px] font-semibold">Visit Summary</span>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="content-stretch flex gap-[14px] items-center relative shrink-0 ml-4 max-xl:gap-[10px]" data-name="Toolbar">
            <button
              type="button"
              aria-label="Tutorial"
              className="content-stretch flex h-[42px] items-center justify-center relative shrink-0"
              data-name="Tutorial"
            >
              <TutorialPlayIcon size={28} />
            </button>
            <div className="bg-gradient-to-b from-[rgba(208,213,221,0.2)] h-[42px] opacity-80 shrink-0 to-[rgba(208,213,221,0.2)] via-1/2 via-[#d0d5dd] w-[1.05px]" data-name="Divider" />
            <button
              type="button"
              aria-label="Template"
              className="bg-[#f1f1f5] content-stretch flex h-[42px] items-center justify-center p-[8.4px] relative rounded-[10.5px] shrink-0 transition-colors hover:bg-[#e9e9ef]"
              data-name="Template"
            >
              <Grid5 color="#454551" size={24} strokeWidth={1.5} variant="Linear" />
            </button>
            <button
              type="button"
              aria-label="Save"
              className="bg-[#f1f1f5] content-stretch flex h-[42px] items-center justify-center p-[8.4px] relative rounded-[10.5px] shrink-0 transition-colors hover:bg-[#e9e9ef]"
              data-name="Save"
            >
              <Ram color="#454551" size={24} strokeWidth={1.5} variant="Linear" />
            </button>
            <button
              type="button"
              aria-label="Customisation"
              className="bg-[#f1f1f5] content-stretch flex h-[42px] items-center justify-center p-[8.4px] relative rounded-[10.5px] shrink-0 transition-colors hover:bg-[#e9e9ef]"
              data-name="Customisation"
            >
              <Setting2 color="#454551" size={24} strokeWidth={1.5} variant="Linear" />
            </button>
            <div className="bg-gradient-to-b from-[rgba(208,213,221,0.2)] h-[42px] opacity-80 shrink-0 to-[rgba(208,213,221,0.2)] via-1/2 via-[#d0d5dd] w-[1.05px]" data-name="Divider" />
            <button
              type="button"
              aria-label="Preview"
              className="bg-[#f1f1f5] content-stretch flex gap-[6.3px] items-center justify-center px-[16px] py-[8px] relative rounded-[10.5px] shrink-0 transition-colors hover:bg-[#e9e9ef]"
              data-name="Preview"
            >
              <Eye color="#454551" size={24} strokeWidth={1.5} variant="Linear" />
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#454551] text-[14.7px] text-center whitespace-nowrap">Preview</p>
            </button>
            <TPSplitButton
              primaryAction={{
                label: "End Visit",
                onClick: () => {},
                icon: <Login color="white" size={18} strokeWidth={1.5} variant="Linear" />,
              }}
              secondaryActions={[
                { label: "End Visit", onClick: () => {} },
                { label: "Save as Draft", onClick: () => {}, icon: <DocumentSketch size={16} strokeWidth={1.5} variant="Linear" /> },
              ]}
              variant="solid"
              theme="primary"
              size="md"
            />
            <button
              type="button"
              aria-label="More options"
              className="flex items-center justify-center relative shrink-0 size-[25.2px] rounded-[8px] transition-colors hover:bg-tp-slate-100"
              style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}
            >
              <MoreVertical color="#454551" size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-tp-slate-100 border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
    </div>
  );
}

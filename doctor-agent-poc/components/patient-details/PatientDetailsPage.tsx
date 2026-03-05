"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  HeartPulse,
  Pill,
  Printer,
  Syringe,
} from "lucide-react"

import { AppointmentBanner } from "@/components/appointments/AppointmentBanner"
import { AiBrandSparkIcon, AI_GRADIENT_SOFT } from "@/components/doctor-agent/ai-brand"
import { PatientDetailAgentPanel } from "@/components/patient-details/PatientDetailAgentPanel"
import { TPButton as Button } from "@/components/tp-ui/button-system"

const SIDE_ITEMS = [
  { id: "visit-summary", label: "Visit Summary", icon: ClipboardList, active: true },
  { id: "certificate", label: "Certificate", icon: FileText },
  { id: "medical-records", label: "Medical Records", icon: FileText },
  { id: "billing", label: "Add Bill/Payment", icon: CreditCard },
  { id: "health-report", label: "Health Checkup Report", icon: HeartPulse },
]

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("")
}

interface PatientDetailsPageProps {
  patientId?: string
  name?: string
  gender?: string
  age?: string | number
  from?: string
}

export function PatientDetailsPage({
  patientId,
  name,
  gender,
  age,
  from,
}: PatientDetailsPageProps) {
  const router = useRouter()
  const [isAgentOpen, setIsAgentOpen] = useState(false)

  const patient = {
    id: patientId || "PAT0007",
    name: name || "Rrish Goyal",
    gender: gender || "M",
    age: Number(age ?? "25"),
    dob: "24-07-2000",
    from: from || "appointments",
  }

  function handleBack() {
    if (patient.from === "rxpad") {
      router.push("/Rxpad")
      return
    }
    router.push("/tp-appointment-screen")
  }

  return (
    <div className="min-h-screen bg-tp-slate-100 font-sans text-tp-slate-900">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden h-full w-[280px] shrink-0 border-r border-tp-slate-200 bg-white md:flex md:flex-col">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-14 items-center gap-2 border-b border-tp-slate-100 px-4 text-sm font-semibold text-tp-slate-700 transition-colors hover:bg-tp-slate-50"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>

          <div className="border-b border-tp-slate-100 px-4 py-3">
            <div className="flex items-center gap-3 rounded-xl bg-tp-slate-50 p-2.5">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-tp-slate-200 text-xs font-semibold text-tp-slate-600">
                {initials(patient.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-tp-slate-800">{patient.name}</p>
                <p className="truncate text-xs text-tp-slate-600">
                  {patient.gender}, {patient.age}y ({patient.dob})
                </p>
              </div>
              <ChevronDown size={16} className="text-tp-slate-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3">
            <nav className="space-y-1.5">
              {SIDE_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                      item.active
                        ? "border border-tp-blue-200 bg-tp-blue-50 text-tp-blue-600"
                        : "text-tp-slate-700 hover:bg-tp-slate-50"
                    }`}
                  >
                    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-white">
                      <Icon size={15} strokeWidth={1.8} />
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-tp-slate-100 p-3">
            <button
              type="button"
              className="w-full rounded-xl border-2 border-dashed border-tp-blue-400 px-3 py-2 text-sm font-semibold text-tp-blue-500 transition-colors hover:bg-tp-blue-50"
            >
              Adm IPD
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="flex h-full min-w-0">
            <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
              <div className="shrink-0">
                <AppointmentBanner
                  title="Patient Details"
                  actions={
                    <>
                      <Button
                        variant="outline"
                        theme="primary"
                        size="md"
                        surface="dark"
                        className="whitespace-nowrap !bg-[rgba(255,255,255,0.13)] backdrop-blur-sm"
                      >
                        Tutorial
                      </Button>
                      <Button
                        variant="solid"
                        theme="primary"
                        size="md"
                        surface="dark"
                        className="whitespace-nowrap"
                        leftIcon={<AiBrandSparkIcon size={16} className="[filter:brightness(0)_invert(1)]" />}
                      >
                        Smart Rx
                      </Button>
                    </>
                  }
                />
              </div>

              <div className="relative z-10 -mt-[60px] flex flex-1 flex-col px-3 pb-6 sm:px-4 lg:px-[18px]">
                <div className="flex flex-1 min-h-0 overflow-hidden rounded-2xl border border-tp-slate-200 bg-white">
                  <div className="flex-1 min-h-0 overflow-auto p-4 lg:p-5">
                    <div className="grid gap-5 xl:grid-cols-[minmax(340px,480px)_minmax(580px,1fr)]">
                      <div className="space-y-5">
                        <section className="overflow-hidden rounded-[18px] border border-tp-slate-200 bg-white">
                          <header className="flex items-center gap-2 border-b border-tp-slate-100 px-4 py-3.5">
                            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-tp-violet-50 text-tp-violet-500">
                              <ClipboardList size={15} />
                            </span>
                            <h2 className="text-xl font-semibold text-tp-slate-800">Gynec History</h2>
                          </header>
                          <div className="px-4 py-4">
                            <p className="mb-2 text-base font-semibold text-tp-slate-700">Menstrual Details</p>
                            <div className="rounded-xl border border-tp-slate-200 bg-tp-slate-50 px-3 py-3 text-sm leading-[1.45] text-tp-slate-700">
                              Menarche at: 7 years | Cycle: Regular | Cycle Interval: 22 days | Flow: Moderate | Duration: 3 days | Clots: Yes | Pain: Mild
                            </div>
                            <button type="button" className="mt-3 text-sm font-semibold text-tp-blue-500 hover:underline">
                              View more
                            </button>
                          </div>
                        </section>

                        <section className="overflow-hidden rounded-[18px] border border-tp-slate-200 bg-white">
                          <header className="flex items-center justify-between border-b border-tp-slate-100 px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-tp-violet-50 text-tp-violet-500">
                                <Syringe size={15} />
                              </span>
                              <h2 className="text-xl font-semibold text-tp-slate-800">Vaccination</h2>
                            </div>
                            <button type="button" className="rounded-xl border border-tp-blue-300 px-3 py-1.5 text-sm font-semibold text-tp-blue-500">
                              See Chart
                            </button>
                          </header>
                          <div className="px-4 py-4 text-sm text-tp-slate-700">
                            <p className="font-semibold text-tp-slate-800">Other Vaccines</p>
                            <div className="mt-3 rounded-xl border border-tp-slate-200 px-3 py-2.5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">Td Dose 1</p>
                                  <p className="text-tp-slate-600">Update due date: 17-Mar-2026</p>
                                </div>
                                <p className="font-medium text-tp-warning-600">Due this month</p>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="overflow-hidden rounded-[18px] border border-tp-slate-200 bg-white">
                          <header className="flex items-center gap-2 border-b border-tp-slate-100 px-4 py-3.5">
                            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-tp-violet-50 text-tp-violet-500">
                              <Pill size={15} />
                            </span>
                            <h2 className="text-xl font-semibold text-tp-slate-800">Assigned Care Plans (1)</h2>
                          </header>
                          <div className="px-4 py-4 text-sm text-tp-slate-700">
                            <div className="rounded-xl border border-tp-blue-200 bg-tp-blue-50 px-3 py-2.5">
                              <p className="font-semibold text-tp-slate-800">Feb 27, 2026</p>
                              <p className="mt-1">Daily medication adherence and hydration follow-up.</p>
                            </div>
                          </div>
                        </section>
                      </div>

                      <section className="overflow-hidden rounded-[18px] border border-tp-slate-200 bg-white">
                        <header className="flex items-center justify-between border-b border-tp-slate-100 px-4 py-3.5">
                          <div>
                            <p className="text-xl font-semibold text-tp-slate-800">Dr Sheela B R | Paediatrics</p>
                            <p className="mt-1 text-sm text-tp-slate-600">27 Feb 2026, 04:23 pm</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-tp-slate-200 text-tp-slate-600">
                              <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-tp-slate-700">1/2</span>
                            <button type="button" className="inline-flex size-8 items-center justify-center rounded-lg border border-tp-slate-200 text-tp-slate-600">
                              <ChevronRight size={16} />
                            </button>
                            <button type="button" className="ml-2 inline-flex size-8 items-center justify-center text-tp-slate-600">
                              <Printer size={18} />
                            </button>
                          </div>
                        </header>

                        <div className="px-4 py-4">
                          <div className="rounded-xl border border-tp-slate-200 bg-tp-slate-50 p-4">
                            <div className="mb-4 flex items-center justify-between border-b border-tp-slate-200 pb-3">
                              <div>
                                <p className="text-base font-semibold text-tp-violet-500">Apex Ortho Clinic</p>
                                <p className="text-sm text-tp-slate-600">Bengaluru, Karnataka</p>
                              </div>
                              <span className="inline-flex size-12 items-center justify-center rounded-2xl" style={{ background: AI_GRADIENT_SOFT }}>
                                <AiBrandSparkIcon size={18} />
                              </span>
                              <div className="text-right">
                                <p className="text-base font-semibold text-tp-violet-500">Dr Sheela BR</p>
                                <p className="text-sm text-tp-slate-600">Paediatrics</p>
                              </div>
                            </div>

                            <div className="grid gap-3 text-sm text-tp-slate-700 sm:grid-cols-2">
                              <p><span className="font-semibold text-tp-slate-800">Patient:</span> {patient.name}, {patient.id.toUpperCase()}</p>
                              <p><span className="font-semibold text-tp-slate-800">Date & Time:</span> 19/02/2026 17:02</p>
                              <p><span className="font-semibold text-tp-slate-800">Age/Gender:</span> {patient.age}y, {patient.gender === "M" ? "Male" : "Female"}</p>
                              <p><span className="font-semibold text-tp-slate-800">Mobile:</span> 8976543212</p>
                              <p><span className="font-semibold text-tp-slate-800">Blood Group:</span> A+</p>
                              <p><span className="font-semibold text-tp-slate-800">Consultation:</span> Follow-up</p>
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-tp-slate-700">
                              <p><span className="font-semibold text-tp-slate-800">Symptoms:</span> chest pain, heart burn</p>
                              <p><span className="font-semibold text-tp-slate-800">Examinations:</span> Fever</p>
                              <p><span className="font-semibold text-tp-slate-800">Diagnosis:</span> lung infection and blockage, body pain</p>
                            </div>

                            <div className="mt-4 overflow-hidden rounded-lg border border-tp-slate-200">
                              <table className="w-full border-collapse text-sm text-tp-slate-700">
                                <thead>
                                  <tr className="bg-white">
                                    <th className="border-b border-r border-tp-slate-200 px-2 py-2 text-left">G</th>
                                    <th className="border-b border-r border-tp-slate-200 px-2 py-2 text-left">P</th>
                                    <th className="border-b border-r border-tp-slate-200 px-2 py-2 text-left">L</th>
                                    <th className="border-b border-r border-tp-slate-200 px-2 py-2 text-left">A</th>
                                    <th className="border-b border-tp-slate-200 px-2 py-2 text-left">E</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                      <td key={index} className="border-r border-tp-slate-200 px-2 py-2 last:border-r-0">02</td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {isAgentOpen && (
              <PatientDetailAgentPanel
                patient={{
                  id: patient.id,
                  name: patient.name,
                  gender: patient.gender,
                  age: patient.age,
                }}
                onClose={() => setIsAgentOpen(false)}
              />
            )}
          </div>

          {!isAgentOpen && (
            <button
              type="button"
              onClick={() => setIsAgentOpen(true)}
              aria-label="Open doctor agent"
              className="absolute bottom-5 right-5 inline-flex size-12 items-center justify-center rounded-full border border-white/70 shadow-[0_16px_30px_-16px_rgba(103,58,172,0.7)] transition-transform hover:scale-105"
              style={{ background: AI_GRADIENT_SOFT }}
            >
              <AiBrandSparkIcon size={20} />
            </button>
          )}
        </main>
      </div>
    </div>
  )
}

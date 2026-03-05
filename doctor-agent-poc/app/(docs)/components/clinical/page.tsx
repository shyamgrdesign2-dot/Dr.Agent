import { PageHeader } from "@/components/docs/page-header"
import {
  TopNavBarShowcase,
  AppointmentBannerShowcase,
  ClinicalTabsShowcase,
  SearchFilterBarShowcase,
  StatusBadgeShowcase,
  ClinicalTableShowcase,
  PatientInfoHeaderShowcase,
  DrAgentAppointmentsShowcase,
} from "@/components/design-system/clinical-showcase"

export default function ClinicalPage() {
  return (
    <div>
      <PageHeader
        title="Clinical Components"
        description="Application-level components for appointment management, patient records, and clinical navigation. Built from Figma reference patterns with TP design tokens."
        badge="Components"
      />
      <div className="flex flex-col gap-8">
        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <TopNavBarShowcase />
        </section>

        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <AppointmentBannerShowcase />
        </section>

        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <ClinicalTabsShowcase />
        </section>

        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <SearchFilterBarShowcase />
        </section>

        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <StatusBadgeShowcase />
        </section>

        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <ClinicalTableShowcase />
        </section>

        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <PatientInfoHeaderShowcase />
        </section>

        <section className="rounded-xl border border-tp-slate-200 bg-white p-6 shadow-sm">
          <DrAgentAppointmentsShowcase />
        </section>
      </div>
    </div>
  )
}

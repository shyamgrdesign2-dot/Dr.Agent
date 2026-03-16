"use client"

const families = [
  {
    name: "Buttons",
    status: "Ready",
    note: "Primary, outline, link, danger, disabled states aligned to TP constraints.",
  },
  {
    name: "Form Controls",
    status: "Ready",
    note: "Inputs, checkbox, radio, toggle with semantic tokens and focus states.",
  },
  {
    name: "Navigation",
    status: "Ready",
    note: "Tabs, segmented controls, side navigation with icon state transitions.",
  },
  {
    name: "Data Display",
    status: "In Progress",
    note: "Tables, pagination, tooltip and modal patterns for dense workflows.",
  },
  {
    name: "Feedback",
    status: "In Progress",
    note: "Toast and date picker foundations with motion token alignment.",
  },
  {
    name: "Utilities",
    status: "In Progress",
    note: "Badges, avatars, cards, list, stepper, accordion and helper primitives.",
  },
] as const

export function MaterialFamiliesShowcase() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {families.map((family) => (
        <div
          key={family.name}
          className="rounded-xl border border-tp-slate-200 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-tp-slate-800">{family.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                family.status === "Ready"
                  ? "bg-tp-success-100 text-tp-success-700"
                  : "bg-tp-warning-100 text-tp-warning-700"
              }`}
            >
              {family.status}
            </span>
          </div>
          <p className="mt-2 text-xs text-tp-slate-600">{family.note}</p>
        </div>
      ))}
    </div>
  )
}


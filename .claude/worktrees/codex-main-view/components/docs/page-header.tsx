interface PageHeaderProps {
  title: string
  description: string
  badge?: string
}

/** Reusable page header — title + description + optional badge */
export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="mb-10">
      {badge && (
        <span className="mb-3 inline-block rounded-md bg-tp-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-tp-blue-600">
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-bold text-tp-slate-900 font-heading tracking-tight">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tp-slate-600">
        {description}
      </p>
    </div>
  )
}

"use client"

/**
 * Design system layout primitives for consistent segregation and aesthetics.
 * Each component gets its own elevated card with clear visual hierarchy.
 */

interface ComponentBlockProps {
  id?: string
  title: string
  description?: string
  children: React.ReactNode
  /** Optional badge/label for the component type */
  badge?: string
}

/** A single component showcase block — elevated card with clear segregation */
export function ComponentBlock({ id, title, description, children, badge }: ComponentBlockProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-tp-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(23,23,37,0.06)] ring-1 ring-tp-slate-100/50"
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <div className="flex items-start gap-3">
        {badge && (
          <span className="shrink-0 rounded-md bg-tp-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-tp-slate-600">
            {badge}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3
            id={id ? `${id}-heading` : undefined}
            className="text-base font-semibold text-tp-slate-900 tracking-tight"
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 text-sm text-tp-slate-500 leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  id: string
  title: string
  description: string
  links?: { href: string; label: string }[]
}

/** Section header with optional jump links — used for major categories */
export function SectionHeader({ id, title, description, links }: SectionHeaderProps) {
  return (
    <div
      className="scroll-mt-24 rounded-2xl border border-tp-slate-200 bg-gradient-to-br from-white via-tp-slate-50/30 to-tp-blue-50/20 p-6 shadow-[0_1px_3px_rgba(23,23,37,0.04)]"
    >
      <h2 id={id} className="text-xl font-semibold text-tp-slate-900 tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm text-tp-slate-600 leading-relaxed max-w-2xl">
        {description}
      </p>
      {links && links.length > 0 && (
        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs" aria-label={`${title} navigation`}>
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-tp-slate-500 hover:text-tp-blue-600 hover:underline transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

/** Wrapper for a category of components — adds spacing between blocks */
export function ComponentCategory({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      {children}
    </div>
  )
}

/** Simple card wrapper for existing showcases that have their own title — adds visual segregation */
export function ComponentCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-tp-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(23,23,37,0.06)] ring-1 ring-tp-slate-100/50 ${className}`}
    >
      {children}
    </div>
  )
}

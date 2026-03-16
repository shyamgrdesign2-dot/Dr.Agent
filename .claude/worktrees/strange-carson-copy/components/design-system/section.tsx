import type { ReactNode } from "react"

/** Iconsax icon component type */
type IconComponent = React.ComponentType<{ size?: number; variant?: string; className?: string }>

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
  icon?: IconComponent
}

export function Section({ title, description, children, icon: Icon }: SectionProps) {
  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <span className="inline-flex flex-shrink-0"><Icon className="text-tp-slate-400" size={24} variant="Linear" /></span>}
        <h2 className="text-2xl font-bold text-tp-slate-900 font-heading">
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-tp-slate-500 mb-8 max-w-2xl">{description}</p>
      )}
      {children}
    </div>
  )
}

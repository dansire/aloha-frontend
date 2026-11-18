import type { ReactNode } from 'react'
import { Wave } from '../illustrations'

/** Cabecera estándar de página: título, subtítulo y acciones. */
export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  icon?: ReactNode
}) {
  return (
    <header className="mb-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <span className="grid size-14 shrink-0 -rotate-3 place-items-center rounded-3xl border-2 border-line bg-paper text-2xl shadow-soft">
              {icon}
            </span>
          )}
          <div>
            <h1 className="text-3xl leading-tight sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-1 font-semibold text-ink-soft">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
      <Wave className="mt-4 h-3 w-40" />
    </header>
  )
}

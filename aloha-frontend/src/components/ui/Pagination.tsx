import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Genera [1, '…', 4, 5, 6, '…', 20] alrededor de la página actual. */
function pageWindow(page: number, total: number): (number | 'gap-start' | 'gap-end')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, page, page - 1, page + 1])
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p))
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | 'gap-start' | 'gap-end')[] = []
  sorted.forEach((p, i) => {
    const previous = sorted[i - 1]
    if (previous !== undefined && p - previous > 1) result.push(i < sorted.length / 2 ? 'gap-start' : 'gap-end')
    result.push(p)
  })
  return result
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  /** Página actual, base 1. */
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}) {
  if (totalPages <= 1) return null

  const item =
    'grid size-11 place-items-center rounded-full border-2 text-sm font-extrabold transition-all duration-200'

  return (
    <nav aria-label="Paginación" className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      <button
        type="button"
        className={cn(item, 'border-line bg-paper hover:border-turquoise disabled:opacity-40')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>

      {pageWindow(page, totalPages).map((entry) =>
        typeof entry === 'string' ? (
          <span key={entry} className="px-1 font-extrabold text-ink-soft" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            aria-label={`Página ${entry}`}
            aria-current={entry === page ? 'page' : undefined}
            className={cn(
              item,
              entry === page
                ? 'border-coral-deep bg-coral shadow-inset'
                : 'border-line bg-paper hover:border-turquoise',
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        className={cn(item, 'border-line bg-paper hover:border-turquoise disabled:opacity-40')}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </nav>
  )
}

import { Plus, RotateCcw } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '@/lib/cn'
import { formatDayHeading, pluralize } from '@/lib/format'
import type { UseApiResult } from '@/hooks/useApi'
import type { Learning, Page } from '@/types'
import { Button, CardGridSkeleton, EmptyState, ErrorState, LinkButton, ListSkeleton, Pagination } from '../ui'
import { LearningCard } from './LearningCard'

interface LearningCollectionProps {
  result: UseApiResult<Page<Learning>>
  /** `grid`: biblioteca en tarjetas. `journal`: cuaderno agrupado por día. */
  layout: 'grid' | 'journal'
  page: number
  onPageChange: (page: number) => void
  hasFilters: boolean
  onClearFilters: () => void
  onToggleFavorite: (learning: Learning) => void
  onDelete: (learning: Learning) => void
}

/** Resuelve todos los estados de un listado: cargando, error, vacío, resultados y paginación. */
export function LearningCollection({
  result,
  layout,
  page,
  onPageChange,
  hasFilters,
  onClearFilters,
  onToggleFavorite,
  onDelete,
}: LearningCollectionProps) {
  const { data, loading, error, reload } = result

  if (!data) {
    if (error) return <ErrorState error={error} onRetry={reload} />
    return layout === 'grid' ? <CardGridSkeleton /> : <ListSkeleton rows={5} />
  }

  if (data.totalElements === 0) {
    return hasFilters ? (
      <EmptyState
        illustration="shell"
        title="No encontramos coincidencias"
        description="Prueba con otras palabras o quita algunos filtros para ver más aprendizajes."
        action={
          <Button variant="soft" icon={<RotateCcw className="size-4" aria-hidden />} onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        }
      />
    ) : (
      <EmptyState
        illustration="island"
        title="Tu cuaderno está esperando su primera página"
        description="Registra lo que aprendiste hoy, por pequeño que sea. Cada aprendizaje construye tu biblioteca."
        action={
          <LinkButton to="/cuaderno/nuevo" icon={<Plus className="size-5" aria-hidden />}>
            Escribir mi primer aprendizaje
          </LinkButton>
        }
      />
    )
  }

  // Agrupa por día para el modo cuaderno (la API ya devuelve el orden elegido).
  const groups: { day: string; items: Learning[] }[] = []
  if (layout === 'journal') {
    for (const item of data.content) {
      const last = groups[groups.length - 1]
      if (last && last.day === item.learnedAt) last.items.push(item)
      else groups.push({ day: item.learnedAt, items: [item] })
    }
  }

  return (
    <section aria-busy={loading} aria-label="Resultados">
      {error && <ErrorState compact error={error} onRetry={reload} className="mb-4" />}
      <p className="mb-4 text-sm font-extrabold text-ink-soft" role="status">
        {pluralize(data.totalElements, 'aprendizaje', 'aprendizajes')}
        {hasFilters ? ' con los filtros aplicados' : ''}
      </p>

      <div className={cn('transition-opacity duration-200', loading && 'opacity-60')}>
        {layout === 'grid' ? (
          <ul className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
            {data.content.map((learning) => (
              <li key={learning.id} className="flex animate-fade-up *:flex-1">
                <LearningCard headingLevel="h2" learning={learning} onToggleFavorite={onToggleFavorite} onDelete={onDelete} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <Fragment key={group.day}>
                <h2 className="mt-4 flex items-center gap-3 text-lg first:mt-0">
                  <span className="inline-block size-3 rounded-full bg-coral ring-4 ring-blush" aria-hidden="true" />
                  <time dateTime={group.day} className="block first-letter:uppercase">
                    {formatDayHeading(group.day)}
                  </time>
                </h2>
                <ul className="ml-1.5 flex flex-col gap-4 border-l-2 border-dashed border-line pl-6">
                  {group.items.map((learning) => (
                    <li key={learning.id} className="animate-fade-up">
                      <LearningCard
                        variant="entry"
                        learning={learning}
                        onToggleFavorite={onToggleFavorite}
                        onDelete={onDelete}
                      />
                    </li>
                  ))}
                </ul>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <Pagination className="mt-8" page={page} totalPages={data.totalPages} onChange={onPageChange} />
    </section>
  )
}

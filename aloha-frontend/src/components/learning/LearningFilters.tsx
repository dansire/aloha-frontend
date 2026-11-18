import { RotateCcw, Search, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { LearningFilters as Filters } from '@/hooks/useLearningFilters'
import { cn } from '@/lib/cn'
import type { Category, LearningSort, Tag } from '@/types'
import { Button, Card, SelectField, TextField } from '../ui'

const SORT_LABELS: Record<LearningSort, string> = {
  'learnedAt,desc': 'Más recientes primero',
  'learnedAt,asc': 'Más antiguos primero',
  'updatedAt,desc': 'Editados recientemente',
  'title,asc': 'Título (A–Z)',
}

interface LearningFiltersProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
  activeCount: number
  categories: Category[]
  tags: Tag[]
}

/** Panel de búsqueda y filtros. El texto se aplica con retraso para no saturar la API. */
export function LearningFilters({ filters, onChange, onClear, activeCount, categories, tags }: LearningFiltersProps) {
  const [text, setText] = useState(filters.q)
  const debounced = useDebounce(text, 350)
  const lastPushed = useRef(filters.q)

  // Texto -> URL (con retraso).
  useEffect(() => {
    if (debounced !== lastPushed.current) {
      lastPushed.current = debounced
      onChange({ q: debounced })
    }
  }, [debounced, onChange])

  // URL -> texto (cambios externos: limpiar filtros, buscador global, atrás/adelante).
  useEffect(() => {
    if (filters.q !== lastPushed.current) {
      lastPushed.current = filters.q
      setText(filters.q)
    }
  }, [filters.q])

  return (
    <Card className="mb-6 p-4 sm:p-5">
      <form role="search" aria-label="Filtrar aprendizajes" onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <TextField
          label="Buscar"
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Título, descripción, contenido o etiqueta…"
          leading={<Search aria-hidden />}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Categoría"
            value={filters.categoryId ?? ''}
            onChange={(event) => onChange({ categoryId: event.target.value ? Number(event.target.value) : null })}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </SelectField>

          <SelectField label="Etiqueta" value={filters.tag} onChange={(event) => onChange({ tag: event.target.value })}>
            <option value="">Todas</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                #{tag.name} ({tag.learningCount})
              </option>
            ))}
          </SelectField>

          <TextField
            label="Desde"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => onChange({ from: event.target.value })}
          />
          <TextField
            label="Hasta"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => onChange({ to: event.target.value })}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-pressed={filters.favorite}
              onClick={() => onChange({ favorite: !filters.favorite })}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-extrabold transition-all duration-200 hover:-translate-y-0.5',
                filters.favorite ? 'border-vanilla-deep bg-vanilla' : 'border-line bg-paper hover:border-vanilla-deep',
              )}
            >
              <Star className={cn('size-5', filters.favorite && 'fill-current text-vanilla-deep')} aria-hidden />
              Solo favoritos
            </button>

            <SelectField
              label="Ordenar por"
              containerClassName="min-w-52 sm:flex-row sm:items-center sm:gap-3 [&>label]:whitespace-nowrap"
              value={filters.sort}
              onChange={(event) => onChange({ sort: event.target.value as LearningSort })}
            >
              {(Object.keys(SORT_LABELS) as LearningSort[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </SelectField>
          </div>

          <Button
            variant="ghost"
            icon={<RotateCcw className="size-4" aria-hidden />}
            onClick={onClear}
            disabled={activeCount === 0 && filters.sort === 'learnedAt,desc'}
          >
            Limpiar filtros{activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        </div>
      </form>
    </Card>
  )
}

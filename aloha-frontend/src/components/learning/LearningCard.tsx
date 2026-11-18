import { CalendarDays, Pencil, Star, Trash2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatShortDate } from '@/lib/format'
import type { Learning } from '@/types'
import { CategoryBadge, TagChip } from '../ui'

export interface LearningCardProps {
  learning: Learning
  onToggleFavorite: (learning: Learning) => void
  onDelete: (learning: Learning) => void
  /** `card`: tarjeta de biblioteca con cinta washi. `entry`: renglón de cuaderno. */
  variant?: 'card' | 'entry'
  /** Nivel del título: h2 cuando la tarjeta cuelga directamente del h1 de la página. */
  headingLevel?: 'h2' | 'h3'
}

const TAPE_BY_COLOR = {
  mint: 'mint',
  turquoise: 'turquoise',
  coral: 'coral',
  blush: 'blush',
  vanilla: 'vanilla',
  lavender: 'lavender',
} as const

function FavoriteButton({ learning, onToggle }: { learning: Learning; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={learning.favorite}
      aria-label={learning.favorite ? `Quitar “${learning.title}” de favoritos` : `Marcar “${learning.title}” como favorito`}
      className={cn(
        'relative z-10 grid size-10 shrink-0 place-items-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95',
        learning.favorite ? 'bg-vanilla text-vanilla-deep' : 'text-ink-soft hover:bg-vanilla/60',
      )}
    >
      <Star className={cn('size-5', learning.favorite && 'fill-current')} aria-hidden />
    </button>
  )
}

export function LearningCard({ learning, onToggleFavorite, onDelete, variant = 'card', headingLevel = 'h3' }: LearningCardProps) {
  const Heading = headingLevel
  const tape = learning.category ? TAPE_BY_COLOR[learning.category.color] : 'vanilla'
  const isEntry = variant === 'entry'

  return (
    <article
      className={cn(
        'card group relative flex flex-col gap-3 p-5 transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-pop focus-within:shadow-pop',
        isEntry && 'sm:flex-row sm:items-start sm:gap-5',
      )}
    >
      {!isEntry && (
        <span
          aria-hidden="true"
          className="washi"
          style={
            {
              '--tape': `var(--color-${tape})`,
              '--tape-rot': `${learning.id % 2 === 0 ? -4 : 3}deg`,
            } as CSSProperties
          }
        />
      )}

      {isEntry && (
        <span
          className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-cream text-3xl sm:grid"
          aria-hidden="true"
        >
          {learning.category?.icon ?? '📝'}
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge category={learning.category} />
          <FavoriteButton learning={learning} onToggle={() => onToggleFavorite(learning)} />
        </div>

        <Heading className="text-lg leading-snug">
          <Link
            to={`/cuaderno/${learning.id}`}
            className="rounded-lg after:absolute after:inset-0 after:content-[''] hover:text-turquoise-deep"
          >
            {learning.title}
          </Link>
        </Heading>

        <p className="line-clamp-3 text-[0.95rem] leading-relaxed font-semibold text-ink-soft">{learning.summary}</p>

        {learning.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Etiquetas">
            {learning.tags.slice(0, 4).map((tag) => (
              <li key={tag.id}>
                <TagChip name={tag.name} />
              </li>
            ))}
            {learning.tags.length > 4 && (
              <li className="self-center text-xs font-extrabold text-ink-soft">+{learning.tags.length - 4}</li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-soft">
            <CalendarDays className="size-4" aria-hidden />
            <time dateTime={learning.learnedAt}>{formatShortDate(learning.learnedAt)}</time>
          </p>
          <div className="relative z-10 flex gap-1">
            <Link
              to={`/cuaderno/${learning.id}/editar`}
              aria-label={`Editar “${learning.title}”`}
              title="Editar"
              className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-lavender hover:text-ink"
            >
              <Pencil className="size-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => onDelete(learning)}
              aria-label={`Eliminar “${learning.title}”`}
              title="Eliminar"
              className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-blush hover:text-coral-deep"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

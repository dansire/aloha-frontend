import { X } from 'lucide-react'
import { CATEGORY_THEME } from '@/lib/categoryTheme'
import { cn } from '@/lib/cn'
import type { Category } from '@/types'

/** Pegatina de categoría: emoji + nombre sobre su color pastel. */
export function CategoryBadge({
  category,
  className,
}: {
  category: Pick<Category, 'name' | 'icon' | 'color'> | null
  className?: string
}) {
  if (!category) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-line px-2.5 py-0.5 text-xs font-extrabold text-ink-soft',
          className,
        )}
      >
        Sin categoría
      </span>
    )
  }
  const theme = CATEGORY_THEME[category.color]
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold',
        theme.bg,
        'text-ink',
        className,
      )}
    >
      <span aria-hidden="true">{category.icon}</span>
      <span className="truncate">{category.name}</span>
    </span>
  )
}

/** Etiqueta (#tag). Si recibe `onClick` es un botón; si recibe `onRemove`, se puede quitar. */
export function TagChip({
  name,
  onClick,
  onRemove,
  active = false,
  className,
}: {
  name: string
  onClick?: () => void
  onRemove?: () => void
  active?: boolean
  className?: string
}) {
  const classes = cn(
    'inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold transition-colors',
    active ? 'border-lavender-deep bg-lavender' : 'border-line bg-paper text-ink-soft',
    onClick && 'hover:border-lavender-deep hover:bg-lavender hover:text-ink',
    className,
  )

  const label = <span>#{name}</span>

  return (
    <span className={classes}>
      {onClick ? (
        <button type="button" onClick={onClick} className="rounded-full" aria-pressed={active}>
          {label}
        </button>
      ) : (
        label
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1 rounded-full p-0.5 hover:bg-ink/10"
          aria-label={`Quitar etiqueta ${name}`}
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  )
}

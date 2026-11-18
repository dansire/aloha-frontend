import { LoaderCircle, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import { formatShortDate } from '@/lib/format'
import { learningService } from '@/services'
import type { Learning } from '@/types'

/**
 * Buscador global (Ctrl/⌘ + K). Muestra coincidencias rápidas y, con Enter,
 * lleva a la Biblioteca con el término ya aplicado como filtro.
 */
export function GlobalSearch({ className }: { className?: string }) {
  const navigate = useNavigate()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Learning[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(0)

  const debounced = useDebounce(term.trim(), 300)
  const hasTerm = debounced.length >= 2

  useEffect(() => {
    if (!hasTerm) return
    let cancelled = false
    setLoading(true)
    setFailed(false)
    learningService
      .list({ search: debounced, size: 6, sort: 'updatedAt,desc' })
      .then((page) => {
        if (cancelled) return
        setResults(page.content)
        setActive(0)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debounced, hasTerm])

  // Atajo de teclado global.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Cierra al hacer clic fuera.
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [])

  const visibleResults = hasTerm ? results : []
  // Opciones: resultados + "Ver todos".
  const optionCount = visibleResults.length + (term.trim() ? 1 : 0)

  const options = useMemo(
    () => [
      ...visibleResults.map((item) => ({ key: `r-${item.id}`, kind: 'result' as const, item })),
      ...(term.trim() ? [{ key: 'all', kind: 'all' as const }] : []),
    ],
    [visibleResults, term],
  )

  const goToResult = (item: Learning) => {
    setOpen(false)
    navigate(`/cuaderno/${item.id}`)
  }

  const goToLibrary = () => {
    const query = term.trim()
    setOpen(false)
    navigate(query ? `/biblioteca?q=${encodeURIComponent(query)}` : '/biblioteca')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((i) => (optionCount === 0 ? 0 : (i + 1) % optionCount))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (optionCount === 0 ? 0 : (i - 1 + optionCount) % optionCount))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const selected = options[active]
      if (selected?.kind === 'result') goToResult(selected.item)
      else goToLibrary()
    } else if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const expanded = open && term.trim().length > 0

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div role="search">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Buscar en todos tus aprendizajes
        </label>
        <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto size-5 text-ink-soft" aria-hidden />
        <input
          id={`${listId}-input`}
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar aprendizajes…"
          className="min-h-11 w-full rounded-full border-2 border-line bg-paper pr-16 pl-12 font-semibold transition-all placeholder:font-medium placeholder:text-ink-soft/75 hover:border-turquoise focus-visible:border-turquoise-deep focus-visible:ring-4 focus-visible:ring-turquoise/45 focus-visible:outline-none"
        />
        <kbd className="pointer-events-none absolute inset-y-0 right-4 my-auto hidden h-6 items-center rounded-lg border-2 border-line bg-cream px-1.5 text-[0.7rem] font-extrabold text-ink-soft sm:inline-flex">
          Ctrl K
        </kbd>
      </div>

      {expanded && (
        <div className="card absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 max-h-96 animate-pop overflow-y-auto p-2">
          <ul id={listId} role="listbox" aria-label="Resultados de búsqueda">
            {loading && (
              <li className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink-soft" role="presentation">
                <LoaderCircle className="size-4 animate-spin" aria-hidden /> Buscando…
              </li>
            )}
            {failed && (
              <li className="px-3 py-2 text-sm font-bold text-coral-deep" role="presentation">
                No pudimos buscar ahora. Revisa tu conexión.
              </li>
            )}
            {!loading && !failed && hasTerm && visibleResults.length === 0 && (
              <li className="px-3 py-2 text-sm font-semibold text-ink-soft" role="presentation">
                Sin coincidencias para “{debounced}”.
              </li>
            )}
            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => (option.kind === 'result' ? goToResult(option.item) : goToLibrary())}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5',
                  index === active && 'bg-mint/70',
                )}
              >
                {option.kind === 'result' ? (
                  <>
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cream text-lg" aria-hidden="true">
                      {option.item.category?.icon ?? '📝'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">{option.item.title}</span>
                      <span className="block truncate text-xs font-semibold text-ink-soft">
                        {formatShortDate(option.item.learnedAt)} · {option.item.summary}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="font-extrabold text-turquoise-deep">
                    Ver todos los resultados para “{term.trim()}”
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

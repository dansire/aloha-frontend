import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { LearningQuery, LearningSort } from '@/types'

export interface LearningFilters {
  q: string
  categoryId: number | null
  tag: string
  favorite: boolean
  from: string
  to: string
  sort: LearningSort
  /** Página visible, base 1. */
  page: number
}

const SORTS: LearningSort[] = ['learnedAt,desc', 'learnedAt,asc', 'updatedAt,desc', 'title,asc']

/**
 * Los filtros viven en la URL (?q=...&categoria=...) para que se puedan compartir,
 * recargar y recorrer con los botones atrás/adelante del navegador.
 */
export function useLearningFilters(pageSize: number) {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<LearningFilters>(() => {
    const sort = params.get('orden') as LearningSort | null
    const category = Number(params.get('categoria'))
    const page = Number(params.get('pagina'))
    return {
      q: params.get('q') ?? '',
      categoryId: Number.isInteger(category) && category > 0 ? category : null,
      tag: params.get('etiqueta') ?? '',
      favorite: params.get('favoritos') === '1',
      from: params.get('desde') ?? '',
      to: params.get('hasta') ?? '',
      sort: sort && SORTS.includes(sort) ? sort : 'learnedAt,desc',
      page: Number.isInteger(page) && page > 0 ? page : 1,
    }
  }, [params])

  const setFilters = useCallback(
    (patch: Partial<LearningFilters>) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          const set = (key: string, value: string | number | boolean | null) => {
            if (value === null || value === '' || value === false || value === 0) next.delete(key)
            else next.set(key, value === true ? '1' : String(value))
          }
          if ('q' in patch) set('q', patch.q ?? '')
          if ('categoryId' in patch) set('categoria', patch.categoryId ?? null)
          if ('tag' in patch) set('etiqueta', patch.tag ?? '')
          if ('favorite' in patch) set('favoritos', patch.favorite ?? false)
          if ('from' in patch) set('desde', patch.from ?? '')
          if ('to' in patch) set('hasta', patch.to ?? '')
          if ('sort' in patch) set('orden', patch.sort === 'learnedAt,desc' ? '' : (patch.sort ?? ''))
          // Cualquier cambio de filtro vuelve a la página 1, salvo que se pida otra explícitamente.
          set('pagina', 'page' in patch && patch.page && patch.page > 1 ? patch.page : null)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams])

  const query = useMemo<LearningQuery>(
    () => ({
      page: filters.page - 1,
      size: pageSize,
      search: filters.q.trim() || undefined,
      categoryId: filters.categoryId ?? undefined,
      tag: filters.tag || undefined,
      favorite: filters.favorite || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      sort: filters.sort,
    }),
    [filters, pageSize],
  )

  const activeCount = [
    filters.q.trim(),
    filters.categoryId,
    filters.tag,
    filters.favorite,
    filters.from,
    filters.to,
  ].filter(Boolean).length

  return { filters, setFilters, clear, query, activeCount }
}

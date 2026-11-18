import { useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import { useDeleteLearning, useToggleFavorite } from '@/hooks/useLearningActions'
import { useLearningFilters } from '@/hooks/useLearningFilters'
import { categoryService, learningService, tagService } from '@/services'
import type { Learning } from '@/types'
import { LearningCollection } from './LearningCollection'
import { LearningFilters } from './LearningFilters'

/**
 * Listado completo de aprendizajes: filtros en la URL + listado paginado + acciones.
 * Lo comparten el Cuaderno (cronológico) y la Biblioteca (tarjetas).
 */
export function LearningBrowser({ layout, pageSize }: { layout: 'grid' | 'journal'; pageSize: number }) {
  const { filters, setFilters, clear, query, activeCount } = useLearningFilters(pageSize)
  const result = useApi(() => learningService.list(query), [query])
  const categories = useApi(() => categoryService.list(), [])
  const tags = useApi(() => tagService.list(), [])

  const { setData, reload } = result

  const applyUpdate = useCallback(
    (updated: Learning) =>
      setData((page) =>
        page ? { ...page, content: page.content.map((item) => (item.id === updated.id ? updated : item)) } : page,
      ),
    [setData],
  )
  const toggleFavorite = useToggleFavorite(applyUpdate)

  const { request: requestDelete, dialog } = useDeleteLearning(() => {
    // Si se vació la última página, retrocede; si no, recarga el listado.
    if (result.data && result.data.content.length === 1 && filters.page > 1) {
      setFilters({ page: filters.page - 1 })
    } else {
      reload()
    }
    tags.reload()
    categories.reload()
  })

  const hasFilters = activeCount > 0

  return (
    <>
      <LearningFilters
        filters={filters}
        onChange={setFilters}
        onClear={clear}
        activeCount={activeCount}
        categories={categories.data ?? []}
        tags={tags.data ?? []}
      />
      <LearningCollection
        result={result}
        layout={layout}
        page={filters.page}
        onPageChange={(page) => {
          setFilters({ page })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        hasFilters={hasFilters}
        onClearFilters={clear}
        onToggleFavorite={toggleFavorite}
        onDelete={requestDelete}
      />
      {dialog}
    </>
  )
}

import { api } from '@/lib/apiClient'
import type { Learning, LearningInput, LearningQuery, Page } from '@/types'

/** Quita parámetros vacíos para no ensuciar la URL ni confundir al backend. */
function cleanParams(query: LearningQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '' || value === false) continue
    params[key] = value as string | number | boolean
  }
  return params
}

export const learningService = {
  list: (query: LearningQuery = {}) =>
    api.get<Page<Learning>>('/learnings', { params: cleanParams(query) }).then((r) => r.data),

  get: (id: number) => api.get<Learning>(`/learnings/${id}`).then((r) => r.data),

  create: (input: LearningInput) => api.post<Learning>('/learnings', input).then((r) => r.data),

  update: (id: number, input: LearningInput) =>
    api.put<Learning>(`/learnings/${id}`, input).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/learnings/${id}`).then(() => undefined),

  setFavorite: (id: number, favorite: boolean) =>
    api.patch<Learning>(`/learnings/${id}/favorite`, { favorite }).then((r) => r.data),

  /** "Descubrimiento del día": un aprendizaje elegido para repasar. */
  discovery: () =>
    api
      .get<Learning | null>('/learnings/discovery')
      .then((r) => (r.status === 204 ? null : (r.data ?? null))),
}

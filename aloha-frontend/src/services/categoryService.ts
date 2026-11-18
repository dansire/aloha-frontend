import { api } from '@/lib/apiClient'
import type { Category, CategoryInput } from '@/types'

export const categoryService = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),

  create: (input: CategoryInput) => api.post<Category>('/categories', input).then((r) => r.data),

  update: (id: number, input: CategoryInput) =>
    api.put<Category>(`/categories/${id}`, input).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/categories/${id}`).then(() => undefined),
}

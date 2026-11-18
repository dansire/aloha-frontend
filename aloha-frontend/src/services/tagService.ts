import { api } from '@/lib/apiClient'
import type { Tag } from '@/types'

export const tagService = {
  list: () => api.get<Tag[]>('/tags').then((r) => r.data),

  rename: (id: number, name: string) =>
    api.put<Tag>(`/tags/${id}`, { name }).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/tags/${id}`).then(() => undefined),
}

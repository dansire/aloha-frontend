import { api } from '@/lib/apiClient'
import type { Goal, GoalInput, GoalStatus } from '@/types'

export const goalService = {
  list: (status?: GoalStatus) =>
    api.get<Goal[]>('/goals', { params: status ? { status } : undefined }).then((r) => r.data),

  create: (input: GoalInput) => api.post<Goal>('/goals', input).then((r) => r.data),

  update: (id: number, input: GoalInput) =>
    api.put<Goal>(`/goals/${id}`, input).then((r) => r.data),

  setStatus: (id: number, status: GoalStatus) =>
    api.patch<Goal>(`/goals/${id}/status`, { status }).then((r) => r.data),

  remove: (id: number) => api.delete<void>(`/goals/${id}`).then(() => undefined),
}

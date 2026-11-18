import { api } from '@/lib/apiClient'
import type { ActivityPoint, CategoryStat, MonthlyStat, StatsSummary } from '@/types'

export const statsService = {
  summary: () => api.get<StatsSummary>('/stats/summary').then((r) => r.data),

  /** Aprendizajes por día en los últimos `days` días (solo días con actividad). */
  activity: (days = 90) =>
    api.get<ActivityPoint[]>('/stats/activity', { params: { days } }).then((r) => r.data),

  /** Días con aprendizajes dentro de un rango (para marcar el calendario). */
  calendar: (from: string, to: string) =>
    api.get<ActivityPoint[]>('/stats/calendar', { params: { from, to } }).then((r) => r.data),

  categories: () => api.get<CategoryStat[]>('/stats/categories').then((r) => r.data),

  monthly: (months = 6) =>
    api.get<MonthlyStat[]>('/stats/monthly', { params: { months } }).then((r) => r.data),
}

import { endOfMonth, startOfMonth } from 'date-fns'
import { useMemo } from 'react'
import { toDateKey } from '@/lib/format'
import { statsService } from '@/services'
import { useApi } from './useApi'

/** Días con aprendizajes del mes visible (para marcar calendarios). */
export function useMonthActivity(month: Date) {
  const from = toDateKey(startOfMonth(month))
  const to = toDateKey(endOfMonth(month))
  const result = useApi(() => statsService.calendar(from, to), [from, to])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    result.data?.forEach((point) => map.set(point.date, point.count))
    return map
  }, [result.data])

  return { ...result, counts }
}

import { addDays, differenceInCalendarDays, startOfWeek, subDays } from 'date-fns'
import { useMemo } from 'react'
import { formatShortDate, toDateKey } from '@/lib/format'
import type { ActivityPoint } from '@/types'

const WEEKS = 13
const LEVELS = [
  'bg-cream border-line',
  'bg-mint/60 border-mint-deep/30',
  'bg-mint border-mint-deep/50',
  'bg-turquoise border-turquoise-deep/60',
  'bg-turquoise-deep border-turquoise-deep',
] as const

function level(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

/** Mapa de actividad de las últimas 13 semanas (lunes a domingo). */
export function ActivityHeatmap({ data }: { data: ActivityPoint[] }) {
  const { cells, activeDays, total } = useMemo(() => {
    const counts = new Map(data.map((p) => [p.date, p.count]))
    const today = new Date()
    const start = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 1 })
    const days = differenceInCalendarDays(today, start) + 1
    const list = Array.from({ length: days }, (_, i) => {
      const date = addDays(start, i)
      const key = toDateKey(date)
      return { key, date, count: counts.get(key) ?? 0 }
    })
    return {
      cells: list,
      activeDays: list.filter((c) => c.count > 0).length,
      total: list.reduce((sum, c) => sum + c.count, 0),
    }
  }, [data])

  return (
    <figure>
      <div className="overflow-x-auto pb-2">
        <div
          role="img"
          aria-label={`Actividad de las últimas ${WEEKS} semanas: ${total} aprendizajes en ${activeDays} días.`}
          className="grid w-max grid-flow-col grid-rows-7 gap-1.5"
        >
          {cells.map((cell) => (
            <span
              key={cell.key}
              title={`${formatShortDate(cell.date)}: ${cell.count} ${cell.count === 1 ? 'aprendizaje' : 'aprendizajes'}`}
              className={`size-6 rounded-lg border-2 sm:size-7 ${LEVELS[level(cell.count)]}`}
            />
          ))}
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold text-ink-soft">
        <span>
          {total} {total === 1 ? 'aprendizaje' : 'aprendizajes'} en {activeDays} {activeDays === 1 ? 'día' : 'días'}
        </span>
        <span className="flex items-center gap-1.5" aria-hidden="true">
          Menos
          {LEVELS.map((cls) => (
            <span key={cls} className={`size-4 rounded-md border-2 ${cls}`} />
          ))}
          Más
        </span>
      </figcaption>
    </figure>
  )
}

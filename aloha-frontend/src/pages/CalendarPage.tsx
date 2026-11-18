import { CalendarDays, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ActivityCalendar } from '@/components/calendar/ActivityCalendar'
import { CategoryBadge, Card, EmptyState, ErrorState, LinkButton, ListSkeleton, PageHeader } from '@/components/ui'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMonthActivity } from '@/hooks/useMonthActivity'
import { formatLongDate, fromDateKey, pluralize, toDateKey, todayKey } from '@/lib/format'
import { learningService } from '@/services'

export default function CalendarPage() {
  useDocumentTitle('Calendario')
  const [params, setParams] = useSearchParams()

  // El día seleccionado vive en la URL (?fecha=YYYY-MM-DD), así se puede compartir y recargar.
  const param = params.get('fecha')
  const dayKey = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : todayKey()
  const selected = useMemo(() => fromDateKey(dayKey), [dayKey])

  const [month, setMonth] = useState(() => selected)
  const monthActivity = useMonthActivity(month)

  const day = useApi(() => learningService.list({ from: dayKey, to: dayKey, size: 50, sort: 'updatedAt,desc' }), [dayKey])

  const monthTotal = useMemo(
    () => [...monthActivity.counts.values()].reduce((sum, n) => sum + n, 0),
    [monthActivity.counts],
  )

  return (
    <>
      <PageHeader
        title="Calendario"
        subtitle="Mira en qué días aprendiste algo y revisa cada jornada."
        icon={<CalendarDays className="size-7 text-turquoise-deep" aria-hidden />}
      />

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="h-fit self-start p-4 sm:p-6">
          <div className="flex justify-center">
            <ActivityCalendar
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={(date) => setParams({ fecha: toDateKey(date) }, { replace: true })}
              activeDates={monthActivity.counts.keys()}
            />
          </div>
          <p className="mt-3 text-center text-sm font-extrabold text-ink-soft" role="status">
            {monthActivity.error
              ? 'No pudimos marcar los días de este mes.'
              : monthActivity.loading && !monthActivity.data
                ? 'Cargando mes…'
                : `${pluralize(monthTotal, 'aprendizaje', 'aprendizajes')} este mes · ${pluralize(monthActivity.counts.size, 'día activo', 'días activos')}`}
          </p>
          {monthActivity.error && (
            <button
              type="button"
              onClick={monthActivity.reload}
              className="mx-auto mt-1 block rounded-full text-sm font-extrabold text-turquoise-deep underline underline-offset-4"
            >
              Reintentar
            </button>
          )}
        </Card>

        <section aria-labelledby="day-title" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="day-title" className="text-2xl first-letter:uppercase">
              {formatLongDate(selected)}
            </h2>
            <LinkButton
              to={`/cuaderno/nuevo?fecha=${dayKey}`}
              variant="soft"
              size="sm"
              icon={<Plus className="size-4" aria-hidden />}
            >
              Agregar a este día
            </LinkButton>
          </div>

          {!day.data && day.error ? (
            <ErrorState error={day.error} onRetry={day.reload} />
          ) : !day.data ? (
            <Card className="p-5">
              <ListSkeleton rows={3} />
            </Card>
          ) : day.data.content.length === 0 ? (
            <EmptyState
              illustration="shell"
              title="Nada registrado este día"
              description="Si aprendiste algo, todavía puedes anotarlo con la fecha correcta."
              action={
                <LinkButton to={`/cuaderno/nuevo?fecha=${dayKey}`} icon={<Plus className="size-5" aria-hidden />}>
                  Registrar aprendizaje
                </LinkButton>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {day.data.content.map((item) => (
                <li key={item.id} className="animate-fade-up">
                  <Card hover className="p-4">
                    <Link to={`/cuaderno/${item.id}`} className="flex items-start gap-4 rounded-2xl">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cream text-2xl" aria-hidden="true">
                        {item.category?.icon ?? '📝'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="mb-1 block">
                          <CategoryBadge category={item.category} />
                        </span>
                        <span className="block font-display text-lg font-semibold">{item.title}</span>
                        <span className="mt-0.5 line-clamp-2 block text-sm font-semibold text-ink-soft">{item.summary}</span>
                      </span>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

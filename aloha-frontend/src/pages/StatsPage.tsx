import { BookMarked, ChartColumn, Flame, Trophy, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { MonthlyChart } from '@/components/charts/MonthlyChart'
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, StatCard } from '@/components/ui'
import type { UseApiResult } from '@/hooks/useApi'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pluralize } from '@/lib/format'
import { statsService } from '@/services'

/** Tarjeta de gráfico que resuelve sus propios estados: cargando, error y sin datos. */
function ChartPanel<T>({
  id,
  title,
  result,
  isEmpty,
  emptyText,
  children,
  skeletonHeight = 'h-64',
}: {
  id: string
  title: string
  result: UseApiResult<T>
  isEmpty: (data: T) => boolean
  emptyText: string
  children: (data: T) => ReactNode
  skeletonHeight?: string
}) {
  const { data, error, reload } = result
  return (
    <Card className="p-5 sm:p-6" aria-labelledby={id}>
      <h2 id={id} className="mb-4 text-xl">
        {title}
      </h2>
      {!data && error ? (
        <ErrorState compact error={error} onRetry={reload} className="border-0 shadow-none" />
      ) : !data ? (
        <Skeleton className={`w-full ${skeletonHeight}`} />
      ) : isEmpty(data) ? (
        <EmptyState illustration="shell" title="Sin datos todavía" description={emptyText} className="border-0 shadow-none" />
      ) : (
        children(data)
      )}
    </Card>
  )
}

export default function StatsPage() {
  useDocumentTitle('Estadísticas')
  const summary = useApi(() => statsService.summary(), [])
  const monthly = useApi(() => statsService.monthly(6), [])
  const categories = useApi(() => statsService.categories(), [])
  const activity = useApi(() => statsService.activity(91), [])

  const stats = summary.data

  return (
    <>
      <PageHeader
        title="Estadísticas"
        subtitle="Tu constancia y tus temas favoritos, de un vistazo."
        icon={<ChartColumn className="size-7 text-lavender-deep" aria-hidden />}
      />

      <div className="flex flex-col gap-6">
        <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.error && !stats ? (
            <div className="sm:col-span-2 xl:col-span-4">
              <ErrorState compact error={summary.error} onRetry={summary.reload} />
            </div>
          ) : (
            <>
              <StatCard loading={!stats} tone="mint" icon={<BookMarked aria-hidden />} label="Total registrado" value={stats?.totalLearnings} />
              <StatCard
                loading={!stats}
                tone="coral"
                icon={<Flame aria-hidden />}
                label="Racha actual"
                value={stats ? pluralize(stats.currentStreak, 'día', 'días') : ''}
              />
              <StatCard
                loading={!stats}
                tone="vanilla"
                icon={<Trophy aria-hidden />}
                label="Mejor racha"
                value={stats ? pluralize(stats.longestStreak, 'día', 'días') : ''}
              />
              <StatCard
                loading={!stats}
                tone="turquoise"
                icon={<TrendingUp aria-hidden />}
                label="Este mes"
                value={stats?.thisMonth}
                hint={stats ? `${stats.thisWeek} esta semana` : undefined}
              />
            </>
          )}
        </section>

        <ChartPanel
          id="monthly-title"
          title="Aprendizajes por mes"
          result={monthly}
          isEmpty={(rows) => rows.every((r) => r.count === 0)}
          emptyText="Cuando registres aprendizajes verás aquí tu ritmo mensual."
          skeletonHeight="h-72"
        >
          {(rows) => <MonthlyChart data={rows} />}
        </ChartPanel>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartPanel
            id="cats-title"
            title="Por categoría"
            result={categories}
            isEmpty={(rows) => rows.length === 0}
            emptyText="Asigna categorías a tus aprendizajes para ver su distribución."
            skeletonHeight="h-56"
          >
            {(rows) => <CategoryDonut data={rows} />}
          </ChartPanel>

          <ChartPanel
            id="heat-title"
            title="Constancia (13 semanas)"
            result={activity}
            isEmpty={() => false}
            emptyText=""
            skeletonHeight="h-52"
          >
            {(rows) => <ActivityHeatmap data={rows} />}
          </ChartPanel>
        </div>
      </div>
    </>
  )
}

import { BookMarked, CalendarDays, Flame, Lightbulb, Plus, Sparkles, Target } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActivityCalendar } from '@/components/calendar/ActivityCalendar'
import { Hibiscus, IslandScene } from '@/components/illustrations'
import {
  Card,
  CategoryBadge,
  EmptyState,
  ErrorState,
  LinkButton,
  ListSkeleton,
  ProgressBar,
  Skeleton,
  StatCard,
} from '@/components/ui'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMonthActivity } from '@/hooks/useMonthActivity'
import { CATEGORY_THEME } from '@/lib/categoryTheme'
import { formatLongDate, formatRelative, greeting, pluralize, toDateKey } from '@/lib/format'
import { goalService, learningService, statsService } from '@/services'

function SectionTitle({ id, children, to, linkLabel }: { id: string; children: React.ReactNode; to?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id={id} className="text-xl">
        {children}
      </h2>
      {to && (
        <Link to={to} className="rounded-full text-sm font-extrabold text-turquoise-deep underline underline-offset-4">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

export default function DashboardPage() {
  useDocumentTitle('Panel')
  const navigate = useNavigate()
  const { user } = useAuth()
  const [month, setMonth] = useState(() => new Date())

  const summary = useApi(() => statsService.summary(), [])
  const recent = useApi(() => learningService.list({ size: 5, sort: 'updatedAt,desc' }), [])
  const topCategories = useApi(() => statsService.categories(), [])
  const goals = useApi(() => goalService.list('ACTIVE'), [])
  const discovery = useApi(() => learningService.discovery(), [])
  const monthActivity = useMonthActivity(month)

  const stats = summary.data
  const firstName = user?.name.split(' ')[0] ?? ''
  const streakMessage = !stats
    ? ' '
    : stats.currentStreak > 0
      ? `Llevas ${pluralize(stats.currentStreak, 'día', 'días')} seguidos aprendiendo. ¡Sigue así!`
      : 'Hoy es un buen día para empezar una nueva racha.'
  const maxCategory = Math.max(1, ...(topCategories.data ?? []).map((c) => c.count))

  return (
    <div className="flex flex-col gap-6">
      {/* Bienvenida */}
      <section aria-labelledby="welcome" className="card card-stitch relative animate-fade-up overflow-hidden bg-gradient-to-br from-mint/70 via-paper to-blush/70 p-6 sm:p-8">
        <Hibiscus className="absolute -right-6 -bottom-8 size-40 rotate-12 opacity-40 sm:hidden" aria-hidden />
        <IslandScene className="absolute top-1/2 right-4 hidden h-44 -translate-y-1/2 sm:block lg:right-10 lg:h-52" />
        <div className="relative max-w-xl">
          <p className="text-sm font-extrabold tracking-wide text-ink-soft first-letter:uppercase">{formatLongDate(new Date())}</p>
          <h1 id="welcome" className="mt-1 text-3xl leading-tight sm:text-4xl">
            {greeting()}, {firstName} <span aria-hidden="true">🌺</span>
          </h1>
          <p className="mt-2 min-h-6 font-semibold text-ink/85">{streakMessage}</p>
          <LinkButton to="/cuaderno/nuevo" size="lg" className="mt-5" icon={<Plus className="size-5" aria-hidden />}>
            Registrar un aprendizaje
          </LinkButton>
        </div>
      </section>

      {/* Resumen */}
      <section aria-label="Resumen" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.error && !stats ? (
          <div className="sm:col-span-2 xl:col-span-4">
            <ErrorState compact error={summary.error} onRetry={summary.reload} />
          </div>
        ) : (
          <>
            <StatCard
              loading={!stats}
              tone="mint"
              icon={<BookMarked aria-hidden />}
              label="Aprendizajes"
              value={stats?.totalLearnings}
              hint={stats ? `${stats.thisWeek} esta semana · ${stats.thisMonth} este mes` : undefined}
            />
            <StatCard
              loading={!stats}
              tone="coral"
              icon={<Flame aria-hidden />}
              label="Racha actual"
              value={stats ? pluralize(stats.currentStreak, 'día', 'días') : ''}
              hint={stats ? `Récord: ${pluralize(stats.longestStreak, 'día', 'días')}` : undefined}
            />
            <StatCard
              loading={!stats}
              tone="lavender"
              icon={<Target aria-hidden />}
              label="Objetivos activos"
              value={stats?.activeGoals}
              hint="En progreso"
            />
            <StatCard
              loading={!stats}
              tone="vanilla"
              icon={<Sparkles aria-hidden />}
              label="Favoritos"
              value={stats?.totalFavorites}
              hint={stats ? `${stats.totalCategories} categorías` : undefined}
            />
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Actividad reciente */}
          <Card className="p-5 sm:p-6" aria-labelledby="recent-title">
            <SectionTitle id="recent-title" to="/cuaderno" linkLabel="Ver cuaderno">
              Actividad reciente
            </SectionTitle>
            {!recent.data && recent.error ? (
              <ErrorState compact error={recent.error} onRetry={recent.reload} className="border-0 shadow-none" />
            ) : !recent.data ? (
              <ListSkeleton rows={4} />
            ) : recent.data.content.length === 0 ? (
              <EmptyState
                illustration="shell"
                title="Todavía no hay aprendizajes"
                description="Cuando registres el primero, aparecerá aquí."
                className="border-0 shadow-none"
              />
            ) : (
              <ul className="flex flex-col gap-1">
                {recent.data.content.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/cuaderno/${item.id}`}
                      className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-mint/40"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream text-2xl" aria-hidden="true">
                        {item.category?.icon ?? '📝'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-extrabold">{item.title}</span>
                        <span className="block truncate text-xs font-semibold text-ink-soft">
                          {item.summary}
                        </span>
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <CategoryBadge category={item.category} />
                        <span className="text-xs font-bold text-ink-soft">{formatRelative(item.updatedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Categorías más exploradas */}
          <Card className="p-5 sm:p-6" aria-labelledby="cats-title">
            <SectionTitle id="cats-title" to="/categorias" linkLabel="Administrar">
              Categorías más exploradas
            </SectionTitle>
            {!topCategories.data && topCategories.error ? (
              <ErrorState compact error={topCategories.error} onRetry={topCategories.reload} className="border-0 shadow-none" />
            ) : !topCategories.data ? (
              <ListSkeleton rows={3} />
            ) : topCategories.data.length === 0 ? (
              <p className="font-semibold text-ink-soft">Aún no hay categorías con aprendizajes.</p>
            ) : (
              <ol className="flex flex-col gap-3.5">
                {topCategories.data.slice(0, 5).map((category) => (
                  <li key={category.categoryId}>
                    <Link to={`/biblioteca?categoria=${category.categoryId}`} className="group block rounded-2xl">
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm font-extrabold">
                        <span className="truncate">
                          <span aria-hidden="true">{category.icon}</span> {category.name}
                        </span>
                        <span className="shrink-0 text-ink-soft">{category.count}</span>
                      </div>
                      <div className="h-3.5 overflow-hidden rounded-full border-2 border-line bg-cream" aria-hidden="true">
                        <div
                          className="h-full rounded-full transition-all duration-700 group-hover:brightness-95"
                          style={{
                            width: `${(category.count / maxCategory) * 100}%`,
                            background: CATEGORY_THEME[category.color].solid,
                          }}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {/* Descubrimiento del día */}
          <Card tape="lavender" className="bg-gradient-to-br from-lavender/60 to-paper p-5 sm:p-6" aria-labelledby="discovery-title">
            <h2 id="discovery-title" className="mb-3 flex items-center gap-2 text-xl">
              <Lightbulb className="size-5 text-vanilla-deep" aria-hidden /> Descubrimiento del día
            </h2>
            {!discovery.loading && discovery.error ? (
              <ErrorState compact error={discovery.error} onRetry={discovery.reload} className="border-0 bg-transparent shadow-none" />
            ) : discovery.loading ? (
              <div className="flex flex-col gap-2" role="status" aria-label="Cargando descubrimiento">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : discovery.data ? (
              <>
                <CategoryBadge category={discovery.data.category} />
                <p className="mt-3 font-display text-lg leading-snug font-semibold">{discovery.data.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed font-semibold text-ink-soft">{discovery.data.summary}</p>
                <LinkButton to={`/cuaderno/${discovery.data.id}`} variant="soft" size="sm" className="mt-4">
                  Repasar ahora
                </LinkButton>
              </>
            ) : (
              <p className="font-semibold text-ink-soft">
                Cuando tengas aprendizajes, aquí te recordaremos uno cada día para repasarlo.
              </p>
            )}
          </Card>

          {/* Calendario resumido */}
          <Card className="p-4 sm:p-5" aria-labelledby="cal-title">
            <SectionTitle id="cal-title" to="/calendario" linkLabel="Abrir calendario">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-5 text-turquoise-deep" aria-hidden /> Calendario
              </span>
            </SectionTitle>
            <div className="flex justify-center">
              <ActivityCalendar
                compact
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => navigate(`/calendario?fecha=${toDateKey(date)}`)}
                activeDates={monthActivity.counts.keys()}
              />
            </div>
            <p className="mt-2 text-center text-xs font-bold text-ink-soft">Los días con punto tienen aprendizajes.</p>
          </Card>

          {/* Objetivos activos */}
          <Card className="p-5 sm:p-6" aria-labelledby="goals-title">
            <SectionTitle id="goals-title" to="/objetivos" linkLabel="Ver todos">
              Objetivos activos
            </SectionTitle>
            {!goals.data && goals.error ? (
              <ErrorState compact error={goals.error} onRetry={goals.reload} className="border-0 shadow-none" />
            ) : !goals.data ? (
              <ListSkeleton rows={2} />
            ) : goals.data.length === 0 ? (
              <p className="font-semibold text-ink-soft">No tienes objetivos activos. ¡Define una meta!</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {goals.data.slice(0, 3).map((goal) => (
                  <li key={goal.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-extrabold">
                      <span className="truncate">{goal.title}</span>
                      <span className="shrink-0 text-ink-soft">
                        {Math.min(goal.currentCount, goal.targetCount)}/{goal.targetCount}
                      </span>
                    </div>
                    <ProgressBar value={goal.currentCount} max={goal.targetCount} label={`Progreso de ${goal.title}`} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

import { differenceInCalendarDays } from 'date-fns'
import { Archive, CheckCircle2, Pencil, Plus, RotateCcw, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { GoalFormModal } from '@/components/goals/GoalFormModal'
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, PageHeader, ProgressBar } from '@/components/ui'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/lib/errors'
import { formatShortDate, fromDateKey } from '@/lib/format'
import { goalService } from '@/services'
import type { Goal, GoalStatus } from '@/types'

const TABS: { status: GoalStatus; label: string }[] = [
  { status: 'ACTIVE', label: 'Activos' },
  { status: 'COMPLETED', label: 'Completados' },
  { status: 'ARCHIVED', label: 'Archivados' },
]

const EMPTY: Record<GoalStatus, { title: string; description: string }> = {
  ACTIVE: { title: 'Sin objetivos activos', description: 'Una meta pequeña y concreta es el mejor comienzo.' },
  COMPLETED: { title: 'Aún no completas objetivos', description: 'Tus metas cumplidas aparecerán aquí. ¡Tú puedes!' },
  ARCHIVED: { title: 'Nada archivado', description: 'Archiva los objetivos que ya no quieras seguir.' },
}

function deadlineNote(goal: Goal): { text: string; late: boolean } | null {
  if (!goal.deadline) return null
  const days = differenceInCalendarDays(fromDateKey(goal.deadline), new Date())
  const date = formatShortDate(goal.deadline)
  if (goal.status !== 'ACTIVE') return { text: `Fecha límite: ${date}`, late: false }
  if (days < 0) return { text: `Venció el ${date}`, late: true }
  if (days === 0) return { text: 'Vence hoy', late: false }
  if (days === 1) return { text: 'Vence mañana', late: false }
  return { text: `Vence el ${date} (${days} días)`, late: false }
}

export default function GoalsPage() {
  useDocumentTitle('Objetivos')
  const toast = useToast()
  const [status, setStatus] = useState<GoalStatus>('ACTIVE')
  const goals = useApi(() => goalService.list(status), [status])

  const [modal, setModal] = useState<{ goal: Goal | null } | null>(null)
  const [deleting, setDeleting] = useState<Goal | null>(null)
  const [busy, setBusy] = useState(false)

  const changeStatus = async (goal: Goal, next: GoalStatus, message: string) => {
    try {
      await goalService.setStatus(goal.id, next)
      toast.success(message)
      goals.reload()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await goalService.remove(deleting.id)
      toast.success('Objetivo eliminado')
      setDeleting(null)
      goals.reload()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const iconBtn = 'grid size-10 place-items-center rounded-full text-ink-soft transition-colors'

  return (
    <>
      <PageHeader
        title="Objetivos"
        subtitle="Metas de aprendizaje para mantener el rumbo."
        icon={<Target className="size-7 text-coral-deep" aria-hidden />}
        actions={
          <Button icon={<Plus className="size-5" aria-hidden />} onClick={() => setModal({ goal: null })}>
            Nuevo objetivo
          </Button>
        }
      />

      <div role="tablist" aria-label="Estado de los objetivos" className="mb-6 flex w-fit flex-wrap gap-1 rounded-full border-2 border-line bg-paper p-1">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            role="tab"
            id={`goals-tab-${tab.status}`}
            aria-selected={status === tab.status}
            aria-controls="goals-panel"
            onClick={() => setStatus(tab.status)}
            className={cn(
              'min-h-10 rounded-full px-5 font-extrabold transition-colors',
              status === tab.status ? 'bg-lavender' : 'text-ink-soft hover:bg-ink/5',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id="goals-panel" role="tabpanel" aria-labelledby={`goals-tab-${status}`}>
        {!goals.data && goals.error ? (
          <ErrorState error={goals.error} onRetry={goals.reload} />
        ) : !goals.data ? (
          <Card className="p-5">
            <ListSkeleton rows={3} />
          </Card>
        ) : goals.data.length === 0 ? (
          <EmptyState
            illustration="palm"
            title={EMPTY[status].title}
            description={EMPTY[status].description}
            action={
              status === 'ACTIVE' ? (
                <Button icon={<Plus className="size-5" aria-hidden />} onClick={() => setModal({ goal: null })}>
                  Crear objetivo
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {goals.data.map((goal) => {
              const done = goal.currentCount >= goal.targetCount
              const note = deadlineNote(goal)
              return (
                <li key={goal.id} className="flex animate-fade-up *:flex-1">
                  <Card hover className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-xl leading-snug">{goal.title}</h2>
                        {goal.description && (
                          <p className="mt-1 text-sm font-semibold text-ink-soft">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <button
                          type="button"
                          className={cn(iconBtn, 'hover:bg-lavender hover:text-ink')}
                          onClick={() => setModal({ goal })}
                          aria-label={`Editar objetivo ${goal.title}`}
                          title="Editar"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={cn(iconBtn, 'hover:bg-blush hover:text-coral-deep')}
                          onClick={() => setDeleting(goal)}
                          aria-label={`Eliminar objetivo ${goal.title}`}
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between text-sm font-extrabold">
                        <span>
                          {Math.min(goal.currentCount, goal.targetCount)} de {goal.targetCount} aprendizajes
                        </span>
                        <span className="text-ink-soft">
                          {Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100))}%
                        </span>
                      </div>
                      <ProgressBar
                        value={goal.currentCount}
                        max={goal.targetCount}
                        label={`Progreso de ${goal.title}`}
                        tone={done ? 'mint' : 'coral'}
                      />
                    </div>

                    {note && (
                      <p className={cn('text-xs font-extrabold', note.late ? 'text-coral-deep' : 'text-ink-soft')}>
                        {note.text}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap gap-2">
                      {goal.status === 'ACTIVE' && (
                        <>
                          <Button
                            size="sm"
                            variant={done ? 'secondary' : 'outline'}
                            icon={<CheckCircle2 className="size-4" aria-hidden />}
                            onClick={() => changeStatus(goal, 'COMPLETED', '¡Objetivo cumplido! 🎉')}
                          >
                            {done ? '¡Marcar como cumplido!' : 'Marcar cumplido'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Archive className="size-4" aria-hidden />}
                            onClick={() => changeStatus(goal, 'ARCHIVED', 'Objetivo archivado')}
                          >
                            Archivar
                          </Button>
                        </>
                      )}
                      {goal.status !== 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="soft"
                          icon={<RotateCcw className="size-4" aria-hidden />}
                          onClick={() => changeStatus(goal, 'ACTIVE', 'Objetivo reactivado')}
                        >
                          Reactivar
                        </Button>
                      )}
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <GoalFormModal open={modal !== null} goal={modal?.goal ?? null} onClose={() => setModal(null)} onSaved={goals.reload} />

      <ConfirmDialog
        open={deleting !== null}
        title="¿Eliminar este objetivo?"
        message={
          <>
            Se eliminará <strong className="text-ink">“{deleting?.title}”</strong>. Tus aprendizajes no se verán afectados.
          </>
        }
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}

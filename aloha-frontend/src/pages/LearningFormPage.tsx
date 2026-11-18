import { ArrowLeft, NotebookPen } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { LearningEditor } from '@/components/learning/LearningEditor'
import { ErrorState, PageHeader, Skeleton } from '@/components/ui'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { categoryService, learningService, tagService } from '@/services'

function FormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]" role="status" aria-label="Cargando formulario">
      <Skeleton className="h-[34rem]" />
      <Skeleton className="h-96" />
    </div>
  )
}

/** Crear (/cuaderno/nuevo) y editar (/cuaderno/:id/editar): carga datos y delega en LearningEditor. */
export default function LearningFormPage() {
  const { id } = useParams()
  const [search] = useSearchParams()
  const editingId = id ? Number(id) : null
  const invalidId = id !== undefined && !(Number.isInteger(editingId) && (editingId ?? 0) > 0)
  const isEdit = editingId !== null

  useDocumentTitle(isEdit ? 'Editar aprendizaje' : 'Nuevo aprendizaje')

  const existing = useApi(
    () =>
      invalidId
        ? Promise.reject(new Error('Identificador inválido.'))
        : isEdit
          ? learningService.get(editingId)
          : Promise.resolve(null),
    [editingId, invalidId, isEdit],
  )
  const categories = useApi(() => categoryService.list(), [])
  const tags = useApi(() => tagService.list(), [])

  const queryDate = search.get('fecha')
  const initialDate = queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate) ? queryDate : undefined

  const failure = existing.error ?? categories.error
  const ready = !existing.loading && !categories.loading && !existing.error && !categories.error

  return (
    <>
      <Link
        to={isEdit ? `/cuaderno/${editingId}` : '/cuaderno'}
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full font-extrabold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-5" aria-hidden /> Volver
      </Link>
      <PageHeader
        title={isEdit ? 'Editar aprendizaje' : 'Nuevo aprendizaje'}
        subtitle={isEdit ? 'Ajusta lo que escribiste.' : 'Registra lo que descubriste hoy.'}
        icon={<NotebookPen className="size-7 text-coral-deep" aria-hidden />}
      />

      {failure ? (
        <ErrorState
          error={failure.status === 404 ? { ...failure, message: 'Este aprendizaje no existe o ya fue eliminado.' } : failure}
          onRetry={
            failure.status === 404
              ? undefined
              : () => {
                  existing.reload()
                  categories.reload()
                }
          }
        />
      ) : ready ? (
        <LearningEditor
          // `key` reinicia el formulario si se navega entre dos aprendizajes distintos.
          key={editingId ?? 'new'}
          learning={existing.data}
          categories={categories.data ?? []}
          tagSuggestions={(tags.data ?? []).map((t) => t.name)}
          initialDate={initialDate}
        />
      ) : (
        <FormSkeleton />
      )}
    </>
  )
}

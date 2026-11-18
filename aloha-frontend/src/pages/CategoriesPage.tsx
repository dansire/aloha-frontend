import { Pencil, Plus, Shapes, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryFormModal } from '@/components/learning/CategoryFormModal'
import { TagManager } from '@/components/learning/TagManager'
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, LearningCardSkeleton, PageHeader } from '@/components/ui'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { CATEGORY_THEME } from '@/lib/categoryTheme'
import { getErrorMessage } from '@/lib/errors'
import { pluralize } from '@/lib/format'
import { categoryService, tagService } from '@/services'
import type { Category } from '@/types'

type ModalState = { mode: 'create' } | { mode: 'edit'; category: Category } | null

export default function CategoriesPage() {
  useDocumentTitle('Categorías')
  const toast = useToast()
  const categories = useApi(() => categoryService.list(), [])
  const tags = useApi(() => tagService.list(), [])
  const [modal, setModal] = useState<ModalState>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await categoryService.remove(deleting.id)
      toast.success('Categoría eliminada')
      setDeleting(null)
      categories.reload()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const list = categories.data

  return (
    <>
      <PageHeader
        title="Categorías"
        subtitle="Los temas que organizan tu biblioteca."
        icon={<Shapes className="size-7 text-mint-deep" aria-hidden />}
        actions={
          <Button icon={<Plus className="size-5" aria-hidden />} onClick={() => setModal({ mode: 'create' })}>
            Nueva categoría
          </Button>
        }
      />

      {!list && categories.error ? (
        <ErrorState error={categories.error} onRetry={categories.reload} />
      ) : !list ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando categorías">
          {Array.from({ length: 6 }, (_, i) => (
            <LearningCardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          illustration="palm"
          title="Aún no tienes categorías"
          description="Crea la primera para empezar a ordenar tus aprendizajes por tema."
          action={
            <Button icon={<Plus className="size-5" aria-hidden />} onClick={() => setModal({ mode: 'create' })}>
              Crear categoría
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((category) => {
            const theme = CATEGORY_THEME[category.color]
            return (
              <li key={category.id} className="flex animate-fade-up *:flex-1">
                <Card hover tape={category.color} tapeRotation={category.id % 2 ? 3 : -3} className="flex flex-col gap-3 p-5">
                  <div className="flex items-start gap-4">
                    <span
                      className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${theme.bg}`}
                      aria-hidden="true"
                    >
                      {category.icon}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl">{category.name}</h2>
                      <p className="text-sm font-extrabold text-ink-soft">
                        {pluralize(category.learningCount, 'aprendizaje', 'aprendizajes')}
                      </p>
                    </div>
                  </div>
                  <p className="min-h-10 text-sm leading-relaxed font-semibold text-ink-soft">
                    {category.description ?? 'Sin descripción.'}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <Link
                      to={`/biblioteca?categoria=${category.id}`}
                      className="rounded-full text-sm font-extrabold text-turquoise-deep underline underline-offset-4"
                    >
                      Ver aprendizajes
                    </Link>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: 'edit', category })}
                        aria-label={`Editar categoría ${category.name}`}
                        title="Editar"
                        className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-lavender hover:text-ink"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(category)}
                        aria-label={`Eliminar categoría ${category.name}`}
                        title="Eliminar"
                        className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-coral-deep"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <TagManager result={tags} onChanged={categories.reload} />

      <CategoryFormModal
        open={modal !== null}
        category={modal?.mode === 'edit' ? modal.category : null}
        onClose={() => setModal(null)}
        onSaved={categories.reload}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="¿Eliminar esta categoría?"
        message={
          <>
            Se eliminará <strong className="text-ink">{deleting?.name}</strong>.{' '}
            {deleting && deleting.learningCount > 0
              ? `Sus ${deleting.learningCount} aprendizaje(s) no se borran: quedarán sin categoría.`
              : 'No tiene aprendizajes asociados.'}
          </>
        }
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}

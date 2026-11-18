import { Pencil, Tags, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/lib/errors'
import { tagService } from '@/services'
import type { Tag } from '@/types'
import type { UseApiResult } from '@/hooks/useApi'
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, Modal, TextField } from '../ui'
import { normalizeTag } from './TagInput'

/** Lista de etiquetas con renombrar y eliminar. Cada etiqueta enlaza a la Biblioteca filtrada. */
export function TagManager({ result, onChanged }: { result: UseApiResult<Tag[]>; onChanged: () => void }) {
  const toast = useToast()
  const { data, error, reload } = result
  const [renaming, setRenaming] = useState<Tag | null>(null)
  const [draft, setDraft] = useState('')
  const [deleting, setDeleting] = useState<Tag | null>(null)
  const [busy, setBusy] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)

  const afterChange = () => {
    reload()
    onChanged()
  }

  const rename = async () => {
    if (!renaming) return
    const name = normalizeTag(draft)
    if (!name) {
      setRenameError('Escribe un nombre.')
      return
    }
    setBusy(true)
    try {
      await tagService.rename(renaming.id, name)
      toast.success('Etiqueta renombrada')
      setRenaming(null)
      afterChange()
    } catch (e) {
      setRenameError(getErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await tagService.remove(deleting.id)
      toast.success('Etiqueta eliminada')
      setDeleting(null)
      afterChange()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="tags-title" className="mt-10">
      <h2 id="tags-title" className="mb-4 flex items-center gap-2 text-2xl">
        <Tags className="size-6 text-lavender-deep" aria-hidden /> Etiquetas
      </h2>

      {!data && error ? (
        <ErrorState compact error={error} onRetry={reload} />
      ) : !data ? (
        <Card className="p-5">
          <ListSkeleton rows={3} />
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          illustration="shell"
          title="Aún no hay etiquetas"
          description="Agrega etiquetas al escribir un aprendizaje y aparecerán aquí."
        />
      ) : (
        <Card className="p-3 sm:p-4">
          <ul className="divide-y-2 divide-dashed divide-line">
            {data.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link
                  to={`/biblioteca?etiqueta=${encodeURIComponent(tag.name)}`}
                  className="min-w-0 rounded-xl px-2 py-1 font-extrabold hover:bg-lavender/60"
                >
                  <span className="truncate">#{tag.name}</span>
                  <span className="ml-2 text-sm font-bold text-ink-soft">
                    {tag.learningCount} {tag.learningCount === 1 ? 'aprendizaje' : 'aprendizajes'}
                  </span>
                </Link>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRenaming(tag)
                      setDraft(tag.name)
                      setRenameError(null)
                    }}
                    aria-label={`Renombrar etiqueta ${tag.name}`}
                    title="Renombrar"
                    className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-lavender hover:text-ink"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(tag)}
                    aria-label={`Eliminar etiqueta ${tag.name}`}
                    title="Eliminar"
                    className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-coral-deep"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title="Renombrar etiqueta"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenaming(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={rename} loading={busy}>
              Guardar
            </Button>
          </>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void rename()
          }}
        >
          <TextField
            label="Nombre de la etiqueta"
            value={draft}
            maxLength={30}
            onChange={(event) => setDraft(event.target.value)}
            error={renameError ?? undefined}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="¿Eliminar esta etiqueta?"
        message={
          <>
            Se quitará <strong className="text-ink">#{deleting?.name}</strong> de {deleting?.learningCount ?? 0}{' '}
            aprendizaje(s). Los aprendizajes no se eliminan.
          </>
        }
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </section>
  )
}

import { useCallback, useState } from 'react'
import { ConfirmDialog } from '@/components/ui'
import { getErrorMessage } from '@/lib/errors'
import { learningService } from '@/services'
import type { Learning } from '@/types'
import { useToast } from './useToast'

/**
 * Favorito con actualización optimista: cambia al instante y se revierte si el servidor falla.
 * `apply` recibe el aprendizaje actualizado para que cada pantalla lo refleje en su estado.
 */
export function useToggleFavorite(apply: (updated: Learning) => void) {
  const toast = useToast()
  return useCallback(
    async (learning: Learning) => {
      const next = !learning.favorite
      apply({ ...learning, favorite: next })
      try {
        await learningService.setFavorite(learning.id, next)
        toast.success(next ? 'Agregado a favoritos ⭐' : 'Quitado de favoritos')
      } catch (error) {
        apply(learning)
        toast.error(getErrorMessage(error))
      }
    },
    [apply, toast],
  )
}

/** Eliminación con diálogo de confirmación. Devuelve `request` y el `dialog` a renderizar. */
export function useDeleteLearning(onDeleted: (learning: Learning) => void) {
  const toast = useToast()
  const [target, setTarget] = useState<Learning | null>(null)
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    if (!target) return
    setBusy(true)
    try {
      await learningService.remove(target.id)
      toast.success('Aprendizaje eliminado')
      onDeleted(target)
      setTarget(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const dialog = (
    <ConfirmDialog
      open={target !== null}
      title="¿Eliminar este aprendizaje?"
      message={
        <>
          Se eliminará <strong className="text-ink">“{target?.title}”</strong> de tu cuaderno. Esta acción no se
          puede deshacer.
        </>
      }
      loading={busy}
      onConfirm={confirm}
      onCancel={() => setTarget(null)}
    />
  )

  return { request: setTarget, dialog }
}

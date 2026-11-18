import { ArrowLeft, CalendarDays, Clock, ExternalLink, Pencil, Star, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MarkdownView } from '@/components/learning/MarkdownView'
import { Button, Card, CategoryBadge, ErrorState, LinkButton, Skeleton, TagChip } from '@/components/ui'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDeleteLearning, useToggleFavorite } from '@/hooks/useLearningActions'
import { cn } from '@/lib/cn'
import { formatDateTime, formatLongDate } from '@/lib/format'
import { learningService } from '@/services'
import type { Learning } from '@/types'

function isUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value)
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando aprendizaje">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-72 w-full" />
    </div>
  )
}

export default function LearningDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const learningId = Number(id)
  const valid = Number.isInteger(learningId) && learningId > 0

  const { data, error, reload, setData } = useApi(
    () => (valid ? learningService.get(learningId) : Promise.reject(new Error('Identificador inválido.'))),
    [learningId, valid],
  )
  useDocumentTitle(data?.title ?? 'Aprendizaje')

  const apply = useCallback((updated: Learning) => setData(() => updated), [setData])
  const toggleFavorite = useToggleFavorite(apply)
  const { request: requestDelete, dialog } = useDeleteLearning(() => navigate('/cuaderno', { replace: true }))

  const back = (
    <Link
      to="/cuaderno"
      className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full font-extrabold text-ink-soft hover:text-ink"
    >
      <ArrowLeft className="size-5" aria-hidden /> Volver al cuaderno
    </Link>
  )

  if (!data) {
    return (
      <>
        {back}
        {error ? (
          <ErrorState
            error={error.status === 404 ? { ...error, message: 'Este aprendizaje no existe o ya fue eliminado.' } : error}
            onRetry={error.status === 404 ? undefined : reload}
          />
        ) : (
          <DetailSkeleton />
        )}
      </>
    )
  }

  return (
    <>
      {back}
      <article>
        <Card stitch tape="vanilla" className="animate-fade-up p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CategoryBadge category={data.category} className="text-sm" />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={data.favorite ? 'secondary' : 'outline'}
                size="sm"
                aria-pressed={data.favorite}
                onClick={() => toggleFavorite(data)}
                icon={<Star className={cn('size-4', data.favorite && 'fill-current')} aria-hidden />}
              >
                {data.favorite ? 'Favorito' : 'Marcar favorito'}
              </Button>
              <LinkButton
                to={`/cuaderno/${data.id}/editar`}
                variant="soft"
                size="sm"
                icon={<Pencil className="size-4" aria-hidden />}
              >
                Editar
              </LinkButton>
              <Button
                variant="outline"
                size="sm"
                onClick={() => requestDelete(data)}
                icon={<Trash2 className="size-4 text-coral-deep" aria-hidden />}
              >
                Eliminar
              </Button>
            </div>
          </div>

          <h1 className="mt-5 text-3xl leading-tight sm:text-4xl">{data.title}</h1>
          <p className="mt-3 text-lg leading-relaxed font-semibold text-ink-soft">{data.summary}</p>

          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-ink-soft">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Fecha de aprendizaje</dt>
              <CalendarDays className="size-4 text-turquoise-deep" aria-hidden />
              <dd className="first-letter:uppercase">{formatLongDate(data.learnedAt)}</dd>
            </div>
            {data.source && (
              <div className="flex min-w-0 items-center gap-2">
                <dt className="sr-only">Fuente</dt>
                <ExternalLink className="size-4 shrink-0 text-turquoise-deep" aria-hidden />
                <dd className="min-w-0 truncate">
                  {isUrl(data.source) ? (
                    <a
                      href={data.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-turquoise-deep underline underline-offset-4"
                    >
                      {data.source}
                    </a>
                  ) : (
                    data.source
                  )}
                </dd>
              </div>
            )}
          </dl>

          {data.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Etiquetas">
              {data.tags.map((tag) => (
                <li key={tag.id}>
                  <Link to={`/biblioteca?etiqueta=${encodeURIComponent(tag.name)}`} className="rounded-full">
                    <TagChip name={tag.name} className="hover:border-lavender-deep hover:bg-lavender" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <hr className="my-6 border-t-2 border-dashed border-line" />

          {data.content.trim() ? (
            <MarkdownView content={data.content} />
          ) : (
            <p className="font-semibold text-ink-soft">Este aprendizaje no tiene contenido adicional.</p>
          )}

          <footer className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t-2 border-dashed border-line pt-4 text-xs font-bold text-ink-soft">
            <p className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> Creado: {formatDateTime(data.createdAt)}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> Actualizado: {formatDateTime(data.updatedAt)}
            </p>
          </footer>
        </Card>
      </article>
      {dialog}
    </>
  )
}

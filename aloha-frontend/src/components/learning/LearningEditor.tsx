import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { applyServerError } from '@/lib/formErrors'
import { formatDateTime, todayKey } from '@/lib/format'
import { learningSchema, type LearningForm } from '@/schemas'
import { learningService } from '@/services'
import type { Category, Learning, LearningInput } from '@/types'
import { Button, Card, FormAlert, LinkButton, SelectField, TextAreaField, TextField, Toggle } from '../ui'
import { MarkdownEditor } from './MarkdownEditor'
import { TagInput } from './TagInput'

interface LearningEditorProps {
  /** `null` = crear; con valor = editar. */
  learning: Learning | null
  categories: Category[]
  tagSuggestions: string[]
  /** Fecha sugerida al crear (p. ej. desde el calendario). */
  initialDate?: string
}

const SERVER_FIELDS = ['title', 'summary', 'content', 'source', 'learnedAt'] as const

function toFormValues(learning: Learning | null, initialDate: string): LearningForm {
  return {
    title: learning?.title ?? '',
    summary: learning?.summary ?? '',
    content: learning?.content ?? '',
    categoryId: learning?.category ? String(learning.category.id) : '',
    tags: learning?.tags.map((t) => t.name) ?? [],
    source: learning?.source ?? '',
    learnedAt: learning?.learnedAt ?? initialDate,
    favorite: learning?.favorite ?? false,
  }
}

function toInput(values: LearningForm): LearningInput {
  return {
    title: values.title.trim(),
    summary: values.summary.trim(),
    content: values.content,
    categoryId: values.categoryId ? Number(values.categoryId) : null,
    tags: values.tags,
    source: values.source.trim() || null,
    learnedAt: values.learnedAt,
    favorite: values.favorite,
  }
}

/** Formulario de creación/edición. Recibe los datos ya cargados, por eso no necesita `reset`. */
export function LearningEditor({ learning, categories, tagSuggestions, initialDate }: LearningEditorProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const isEdit = learning !== null

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<LearningForm>({
    resolver: zodResolver(learningSchema),
    defaultValues: toFormValues(learning, initialDate ?? todayKey()),
  })

  // Avisa antes de cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!isDirty || isSubmitSuccessful) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty, isSubmitSuccessful])

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const input = toInput(values)
      const saved = learning ? await learningService.update(learning.id, input) : await learningService.create(input)
      toast.success(isEdit ? 'Cambios guardados ✨' : '¡Aprendizaje registrado! 🌺')
      navigate(`/cuaderno/${saved.id}`, { replace: true })
    } catch (error) {
      setFormError(applyServerError(error, setError, SERVER_FIELDS))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-5 lg:col-start-1">
        <FormAlert message={formError} />

        <Card className="flex flex-col gap-5 p-5 sm:p-6">
          <TextField
            label="Título"
            required
            maxLength={120}
            placeholder="¿Qué aprendiste?"
            error={errors.title?.message}
            {...register('title')}
          />
          <TextAreaField
            label="Descripción breve"
            required
            rows={2}
            maxLength={240}
            placeholder="Resúmelo en una o dos frases."
            hint="Aparece en las tarjetas y en los resultados de búsqueda."
            error={errors.summary?.message}
            {...register('summary')}
          />
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <MarkdownEditor
                label="Contenido"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.content?.message}
                hint="Admite Markdown: negrita, listas, citas, enlaces y bloques de código."
              />
            )}
          />
        </Card>
      </div>

      <aside aria-label="Opciones del aprendizaje" className="flex flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <Card className="flex flex-col gap-5 p-5">
          <SelectField label="Categoría" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </SelectField>
          <p className="-mt-3 text-xs font-semibold text-ink-soft">
            ¿Necesitas otra?{' '}
            <Link to="/categorias" className="font-extrabold text-turquoise-deep underline underline-offset-2">
              Administrar categorías
            </Link>
          </p>

          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                label="Etiquetas"
                value={field.value}
                onChange={field.onChange}
                suggestions={tagSuggestions}
                error={errors.tags?.message}
              />
            )}
          />

          <TextField
            label="Fuente o referencia"
            placeholder="https://… o nombre del libro"
            hint="Opcional."
            error={errors.source?.message}
            {...register('source')}
          />

          <TextField
            label="Fecha de aprendizaje"
            type="date"
            required
            max={todayKey()}
            error={errors.learnedAt?.message}
            {...register('learnedAt')}
          />

          <Controller
            control={control}
            name="favorite"
            render={({ field }) => (
              <Toggle label="Favorito" description="Destácalo para repasarlo." checked={field.value} onChange={field.onChange} />
            )}
          />
        </Card>

        {learning && (
          <Card className="p-5 text-xs font-bold text-ink-soft">
            <p>Creado: {formatDateTime(learning.createdAt)}</p>
            <p className="mt-1">Última edición: {formatDateTime(learning.updatedAt)}</p>
          </Card>
        )}
      </aside>

      <div className="flex flex-wrap justify-end gap-3 lg:col-start-1">
        <LinkButton to={isEdit ? `/cuaderno/${learning.id}` : '/cuaderno'} variant="outline">
          Cancelar
        </LinkButton>
        <Button type="submit" loading={isSubmitting} icon={<Save className="size-5" aria-hidden />}>
          {isEdit ? 'Guardar cambios' : 'Guardar aprendizaje'}
        </Button>
      </div>
    </form>
  )
}

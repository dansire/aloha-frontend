import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useToast } from '@/hooks/useToast'
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_THEME } from '@/lib/categoryTheme'
import { cn } from '@/lib/cn'
import { applyServerError } from '@/lib/formErrors'
import { categorySchema, type CategoryForm } from '@/schemas'
import { categoryService } from '@/services'
import type { Category } from '@/types'
import { Button, FormAlert, Modal, TextField } from '../ui'

/** Selector de una opción entre varias (radiogroup accesible). */
function ChoiceGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; content: React.ReactNode; className?: string }[]
  error?: string
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-extrabold">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'grid size-11 place-items-center rounded-2xl border-2 text-xl transition-all duration-150 hover:-translate-y-0.5',
              value === option.value ? 'scale-105 border-ink shadow-soft' : 'border-line hover:border-turquoise',
              option.className,
            )}
          >
            {option.content}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-bold text-coral-deep">
          {error}
        </p>
      )}
    </fieldset>
  )
}

interface CategoryFormModalProps {
  open: boolean
  /** `null` = crear. */
  category: Category | null
  onClose: () => void
  onSaved: () => void
}

export function CategoryFormModal({ open, category, onClose, onSaved }: CategoryFormModalProps) {
  // `key` garantiza un formulario limpio cada vez que se abre con otra categoría.
  return open ? <CategoryFormBody key={category?.id ?? 'new'} category={category} onClose={onClose} onSaved={onSaved} /> : null
}

function CategoryFormBody({ category, onClose, onSaved }: Omit<CategoryFormModalProps, 'open'>) {
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const formId = 'category-form'

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      color: category?.color ?? 'mint',
      icon: category?.icon ?? '🌺',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input = { ...values, name: values.name.trim(), description: values.description.trim() || null }
    try {
      if (category) await categoryService.update(category.id, input)
      else await categoryService.create(input)
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada 🌴')
      onSaved()
      onClose()
    } catch (error) {
      setFormError(applyServerError(error, setError, ['name', 'description']))
    }
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      description="Agrupa tus aprendizajes por temas."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {category ? 'Guardar' : 'Crear categoría'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormAlert message={formError} />
        <TextField label="Nombre" required maxLength={30} error={errors.name?.message} {...register('name')} />
        <TextField
          label="Descripción"
          hint="Opcional."
          maxLength={120}
          error={errors.description?.message}
          {...register('description')}
        />
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <ChoiceGroup
              label="Color"
              value={field.value}
              onChange={field.onChange}
              options={CATEGORY_COLORS.map((color) => ({
                value: color,
                label: CATEGORY_THEME[color].label,
                content: <span aria-hidden="true" />,
                className: CATEGORY_THEME[color].bg,
              }))}
            />
          )}
        />
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <ChoiceGroup
              label="Ícono"
              value={field.value}
              onChange={field.onChange}
              error={errors.icon?.message}
              options={CATEGORY_ICONS.map((icon) => ({
                value: icon,
                label: `Ícono ${icon}`,
                content: <span aria-hidden="true">{icon}</span>,
                className: 'bg-paper',
              }))}
            />
          )}
        />
      </form>
    </Modal>
  )
}

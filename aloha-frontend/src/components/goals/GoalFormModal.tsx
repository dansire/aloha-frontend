import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/useToast'
import { applyServerError } from '@/lib/formErrors'
import { goalSchema, type GoalForm } from '@/schemas'
import { goalService } from '@/services'
import type { Goal } from '@/types'
import { Button, FormAlert, Modal, TextAreaField, TextField } from '../ui'

interface GoalFormModalProps {
  open: boolean
  /** `null` = crear. */
  goal: Goal | null
  onClose: () => void
  onSaved: () => void
}

export function GoalFormModal({ open, goal, onClose, onSaved }: GoalFormModalProps) {
  return open ? <GoalFormBody key={goal?.id ?? 'new'} goal={goal} onClose={onClose} onSaved={onSaved} /> : null
}

function GoalFormBody({ goal, onClose, onSaved }: Omit<GoalFormModalProps, 'open'>) {
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const formId = 'goal-form'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title ?? '',
      description: goal?.description ?? '',
      targetCount: goal?.targetCount ?? 10,
      deadline: goal?.deadline ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const input = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      targetCount: values.targetCount,
      deadline: values.deadline || null,
      status: goal?.status ?? ('ACTIVE' as const),
    }
    try {
      if (goal) await goalService.update(goal.id, input)
      else await goalService.create(input)
      toast.success(goal ? 'Objetivo actualizado' : '¡Objetivo creado! 🎯')
      onSaved()
      onClose()
    } catch (error) {
      setFormError(applyServerError(error, setError, ['title', 'description', 'targetCount', 'deadline']))
    }
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={goal ? 'Editar objetivo' : 'Nuevo objetivo'}
      description="Define cuántos aprendizajes quieres registrar y para cuándo."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {goal ? 'Guardar' : 'Crear objetivo'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormAlert message={formError} />
        <TextField label="Título" required maxLength={100} error={errors.title?.message} {...register('title')} />
        <TextAreaField
          label="Descripción"
          rows={2}
          hint="Opcional."
          maxLength={200}
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Meta (nº de aprendizajes)"
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            required
            error={errors.targetCount?.message}
            {...register('targetCount', { valueAsNumber: true })}
          />
          <TextField
            label="Fecha límite"
            type="date"
            hint="Opcional."
            error={errors.deadline?.message}
            {...register('deadline')}
          />
        </div>
      </form>
    </Modal>
  )
}

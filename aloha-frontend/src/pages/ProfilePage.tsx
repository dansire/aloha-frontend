import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, LogOut, Save, SlidersHorizontal, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Card, FormAlert, PageHeader, PasswordField, TextAreaField, TextField, Toggle } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { AVATARS } from '@/lib/categoryTheme'
import { cn } from '@/lib/cn'
import { applyServerError } from '@/lib/formErrors'
import { formatShortDate } from '@/lib/format'
import { getReduceMotion, setReduceMotion } from '@/lib/preferences'
import { passwordChangeSchema, profileSchema, type PasswordChangeForm, type ProfileForm } from '@/schemas'
import { authService } from '@/services'
import type { User } from '@/types'

function ProfileSection({ user }: { user: User }) {
  const { setUser } = useAuth()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, bio: user.bio ?? '', avatar: user.avatar },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const updated = await authService.updateProfile({
        name: values.name.trim(),
        bio: values.bio.trim() || null,
        avatar: values.avatar,
      })
      setUser(updated)
      reset({ name: updated.name, bio: updated.bio ?? '', avatar: updated.avatar })
      toast.success('Perfil actualizado 🌺')
    } catch (error) {
      setFormError(applyServerError(error, setError, ['name', 'bio', 'avatar']))
    }
  })

  return (
    <Card className="p-5 sm:p-6" aria-labelledby="profile-title">
      <h2 id="profile-title" className="mb-5 flex items-center gap-2 text-xl">
        <UserRound className="size-5 text-coral-deep" aria-hidden /> Tu perfil
      </h2>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormAlert message={formError} />

        <Controller
          control={control}
          name="avatar"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-1.5 text-sm font-extrabold">Avatar</legend>
              <div role="radiogroup" aria-label="Avatar" className="flex flex-wrap gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    role="radio"
                    aria-checked={field.value === emoji}
                    aria-label={`Avatar ${emoji}`}
                    onClick={() => field.onChange(emoji)}
                    className={cn(
                      'grid size-12 place-items-center rounded-full border-2 bg-blush text-2xl transition-all hover:-translate-y-0.5',
                      field.value === emoji ? 'scale-110 border-ink shadow-soft' : 'border-transparent hover:border-coral',
                    )}
                  >
                    <span aria-hidden="true">{emoji}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        />

        <TextField label="Nombre" required autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField label="Correo electrónico" value={user.email} readOnly hint="El correo no se puede cambiar." />
        <TextAreaField
          label="Sobre ti"
          rows={3}
          maxLength={200}
          placeholder="Una frase que te represente."
          error={errors.bio?.message}
          {...register('bio')}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-ink-soft">Miembro desde {formatShortDate(user.createdAt)}</p>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty} icon={<Save className="size-5" aria-hidden />}>
            Guardar perfil
          </Button>
        </div>
      </form>
    </Card>
  )
}

function PasswordSection() {
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFormError(null)
    try {
      await authService.changePassword({ currentPassword, newPassword })
      reset()
      toast.success('Contraseña actualizada 🔐')
    } catch (error) {
      setFormError(applyServerError(error, setError, ['currentPassword', 'newPassword']))
    }
  })

  return (
    <Card className="p-5 sm:p-6" aria-labelledby="password-title">
      <h2 id="password-title" className="mb-5 flex items-center gap-2 text-xl">
        <KeyRound className="size-5 text-turquoise-deep" aria-hidden /> Cambiar contraseña
      </h2>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormAlert message={formError} />
        <PasswordField
          label="Contraseña actual"
          autoComplete="current-password"
          required
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <PasswordField
          label="Nueva contraseña"
          autoComplete="new-password"
          required
          hint="Mínimo 8 caracteres, con letras y números."
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <PasswordField
          label="Repite la nueva contraseña"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="soft" loading={isSubmitting}>
            Actualizar contraseña
          </Button>
        </div>
      </form>
    </Card>
  )
}

function PreferencesSection() {
  const { logout } = useAuth()
  const [reduceMotion, setReduce] = useState(getReduceMotion)

  return (
    <Card className="p-5 sm:p-6" aria-labelledby="prefs-title">
      <h2 id="prefs-title" className="mb-5 flex items-center gap-2 text-xl">
        <SlidersHorizontal className="size-5 text-lavender-deep" aria-hidden /> Preferencias
      </h2>
      <Toggle
        label="Reducir animaciones"
        description="Desactiva movimientos y transiciones en este dispositivo."
        checked={reduceMotion}
        onChange={(value) => {
          setReduce(value)
          setReduceMotion(value)
        }}
      />
      <hr className="my-5 border-t-2 border-dashed border-line" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-soft">Cierra la sesión en este dispositivo.</p>
        <Button variant="outline" icon={<LogOut className="size-4" aria-hidden />} onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </Card>
  )
}

export default function ProfilePage() {
  useDocumentTitle('Perfil')
  const { user } = useAuth()
  if (!user) return null

  return (
    <>
      <PageHeader
        title="Perfil y configuración"
        subtitle="Personaliza tu cuenta y tus preferencias."
        icon={<span aria-hidden="true">{user.avatar}</span>}
      />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <ProfileSection user={user} />
        <div className="flex flex-col gap-6">
          <PasswordSection />
          <PreferencesSection />
        </div>
      </div>
    </>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, FormAlert, PasswordField, TextField } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { applyServerError } from '@/lib/formErrors'
import { registerSchema, type RegisterForm } from '@/schemas'

export default function RegisterPage() {
  useDocumentTitle('Crear cuenta')
  const { register: signUp } = useAuth()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null)
    try {
      await signUp({ name, email, password })
      toast.success(`¡Bienvenida a ALOHA, ${name.split(' ')[0]}! 🌺`)
    } catch (error) {
      setFormError(applyServerError(error, setError, ['name', 'email', 'password']))
    }
  })

  return (
    <AuthLayout
      title="Crea tu isla"
      subtitle="Un par de datos y empiezas a guardar lo que aprendes."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-extrabold text-turquoise-deep underline underline-offset-4">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormAlert message={formError} />

        <TextField label="Nombre" autoComplete="name" required error={errors.name?.message} {...register('name')} />
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="new-password"
          required
          hint="Mínimo 8 caracteres, con letras y números."
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordField
          label="Repite la contraseña"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" loading={isSubmitting} icon={<Sparkles className="size-5" aria-hidden />}>
          Crear mi cuenta
        </Button>
      </form>
    </AuthLayout>
  )
}

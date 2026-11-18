import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, FormAlert, PasswordField, TextField } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from '@/demo/types'
import { env } from '@/lib/env'
import { applyServerError } from '@/lib/formErrors'
import { loginSchema, type LoginForm } from '@/schemas'

export default function LoginPage() {
  useDocumentTitle('Iniciar sesión')
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = handleSubmit(async ({ email, password, remember }) => {
    setFormError(null)
    try {
      // Al autenticarse, <PublicOnlyRoute> redirige a la página que se intentaba abrir.
      await login({ email, password }, remember)
    } catch (error) {
      setFormError(applyServerError(error, setError, ['email', 'password']))
    }
  })

  return (
    <AuthLayout
      title="¡Aloha de nuevo!"
      subtitle="Entra para seguir escribiendo tu diario de aprendizajes."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-extrabold text-turquoise-deep underline underline-offset-4">
            Crea la tuya
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormAlert message={formError} />

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
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
          <input type="checkbox" className="size-5 accent-coral-deep" {...register('remember')} />
          Mantener mi sesión iniciada
        </label>

        <Button type="submit" size="lg" loading={isSubmitting} icon={<LogIn className="size-5" aria-hidden />}>
          Entrar
        </Button>

        {env.demoMode && (
          <Button
            variant="soft"
            onClick={() => {
              setValue('email', DEMO_USER_EMAIL, { shouldValidate: true })
              setValue('password', DEMO_USER_PASSWORD, { shouldValidate: true })
            }}
          >
            Usar la cuenta de demostración
          </Button>
        )}
      </form>
    </AuthLayout>
  )
}

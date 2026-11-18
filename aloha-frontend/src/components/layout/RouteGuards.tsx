import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Hibiscus } from '../illustrations'
import { ErrorState } from '../ui'

function SplashScreen() {
  return (
    <div className="grid min-h-screen place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <Hibiscus className="size-24 animate-float" />
        <p className="font-display text-xl font-semibold">Preparando tu isla…</p>
      </div>
    </div>
  )
}

/** Solo deja pasar a usuarios con sesión; el resto va a /login recordando a dónde iban. */
export function ProtectedRoute() {
  const { status, retry } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SplashScreen />

  if (status === 'unreachable') {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <ErrorState
          className="max-w-lg"
          error={{
            message: 'No pudimos conectar con el servidor para restaurar tu sesión. Tus datos siguen a salvo.',
            status: null,
            isNetwork: true,
            fieldErrors: {},
          }}
          onRetry={retry}
        />
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

/** Login y registro: si ya hay sesión, redirige a la página pendiente o al panel. */
export function PublicOnlyRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SplashScreen />

  if (status === 'authenticated') {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from ? `${from.pathname}${from.search}` : '/'} replace />
  }

  return <Outlet />
}

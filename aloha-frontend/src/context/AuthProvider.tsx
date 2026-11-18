import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UNAUTHORIZED_EVENT } from '@/lib/apiClient'
import { parseError } from '@/lib/errors'
import { tokenStorage } from '@/lib/tokenStorage'
import { authService } from '@/services'
import type { LoginInput, RegisterInput, User } from '@/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'loading' : 'anonymous'))
  const [attempt, setAttempt] = useState(0)

  // Restaura la sesión si existe un token vigente.
  useEffect(() => {
    if (!tokenStorage.get()) {
      setStatus('anonymous')
      return
    }
    let cancelled = false
    setStatus('loading')
    authService
      .me()
      .then((me) => {
        if (cancelled) return
        setUserState(me)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const parsed = parseError(error)
        if (parsed.isNetwork || (parsed.status !== null && parsed.status >= 500)) {
          setStatus('unreachable')
        } else {
          tokenStorage.clear()
          setUserState(null)
          setStatus('anonymous')
        }
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  // El interceptor de Axios avisa cuando el servidor rechaza el token (401).
  useEffect(() => {
    const onUnauthorized = () => {
      setUserState(null)
      setStatus('anonymous')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const login = useCallback(async (input: LoginInput, remember: boolean) => {
    const response = await authService.login(input)
    tokenStorage.set(response.token, remember)
    setUserState(response.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const response = await authService.register(input)
    tokenStorage.set(response.token, true)
    setUserState(response.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUserState(null)
    setStatus('anonymous')
  }, [])

  const setUser = useCallback((next: User) => setUserState(next), [])
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, setUser, retry }),
    [user, status, login, register, logout, setUser, retry],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

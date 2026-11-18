import { createContext } from 'react'
import type { LoginInput, RegisterInput, User } from '@/types'

/**
 * - loading: restaurando la sesión desde el token guardado.
 * - authenticated: hay usuario válido.
 * - anonymous: sin sesión.
 * - unreachable: hay token pero no se pudo contactar al servidor (se ofrece reintentar).
 */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unreachable'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (input: LoginInput, remember: boolean) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  /** Reemplaza el usuario en memoria (p. ej. tras editar el perfil). */
  setUser: (user: User) => void
  /** Reintenta restaurar la sesión (estado "unreachable"). */
  retry: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

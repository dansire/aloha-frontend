/**
 * Almacenamiento de la sesión JWT.
 *
 * - "Recordarme" activo  → localStorage (persiste entre cierres del navegador).
 * - "Recordarme" inactivo → sessionStorage (se borra al cerrar la pestaña).
 *
 * El token se valida contra su `exp` antes de usarse, de modo que nunca se envía
 * una credencial vencida. Para máxima seguridad el backend puede, además, emitir
 * el JWT en una cookie HttpOnly (ver README).
 */

const TOKEN_KEY = 'aloha.token'

interface JwtPayload {
  exp?: number
  [claim: string]: unknown
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload
  } catch {
    return null
  }
}

/** `true` si el token no se puede leer o ya venció (con 5 s de margen). */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload?.exp) return false // sin `exp` dejamos que el servidor decida
  return payload.exp * 1000 <= Date.now() + 5000
}

function readFrom(storage: Storage): string | null {
  try {
    return storage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const tokenStorage = {
  get(): string | null {
    const token = readFrom(localStorage) ?? readFrom(sessionStorage)
    if (token && isTokenExpired(token)) {
      this.clear()
      return null
    }
    return token
  },

  set(token: string, remember: boolean): void {
    this.clear()
    try {
      ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
    } catch {
      /* almacenamiento bloqueado: la sesión vivirá solo en memoria de la pestaña */
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* noop */
    }
  },
}

import axios, { type AxiosInstance } from 'axios'
import { env } from './env'
import { tokenStorage } from './tokenStorage'

/** Evento global que se emite cuando el servidor rechaza la sesión (401). */
export const UNAUTHORIZED_EVENT = 'aloha:unauthorized'

/** Endpoints públicos: un 401 aquí significa "credenciales incorrectas", no "sesión vencida". */
const PUBLIC_PATHS = ['/auth/login', '/auth/register']

/**
 * ÚNICA instancia de Axios de la aplicación.
 * Todos los servicios (src/services) pasan por aquí.
 */
export const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  withCredentials: env.withCredentials,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const isPublic = PUBLIC_PATHS.some((path) => url.endsWith(path))
      if (!isPublic) {
        tokenStorage.clear()
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
      }
    }
    return Promise.reject(error)
  },
)

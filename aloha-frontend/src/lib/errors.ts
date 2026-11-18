import axios from 'axios'
import type { ApiErrorBody } from '@/types'

export interface ParsedError {
  message: string
  status: number | null
  /** No hubo respuesta del servidor (caída, CORS, sin internet…). */
  isNetwork: boolean
  fieldErrors: Record<string, string>
}

/** Traduce cualquier error (Axios o no) a un objeto uniforme y amigable. */
export function parseError(error: unknown): ParsedError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.code === 'ERR_CANCELED') {
      return { message: 'Solicitud cancelada.', status: null, isNetwork: false, fieldErrors: {} }
    }

    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED'
      return {
        message: timedOut
          ? 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
          : 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo otra vez.',
        status: null,
        isNetwork: true,
        fieldErrors: {},
      }
    }

    const { status, data } = error.response
    const serverMessage = data?.message ?? data?.error
    const fieldErrors = data?.fieldErrors ?? {}

    const fallback: Record<number, string> = {
      400: 'Los datos enviados no son válidos.',
      401: 'Tu sesión expiró o tus credenciales no son correctas.',
      403: 'No tienes permiso para realizar esta acción.',
      404: 'No encontramos lo que buscabas.',
      409: 'Ya existe un registro con esos datos.',
      422: 'Revisa los datos del formulario.',
      429: 'Demasiados intentos. Espera un momento y vuelve a probar.',
    }

    return {
      message:
        serverMessage ??
        fallback[status] ??
        (status >= 500
          ? 'El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.'
          : 'Ocurrió un error inesperado.'),
      status,
      isNetwork: false,
      fieldErrors,
    }
  }

  return {
    message: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
    status: null,
    isNetwork: false,
    fieldErrors: {},
  }
}

export function getErrorMessage(error: unknown): string {
  return parseError(error).message
}

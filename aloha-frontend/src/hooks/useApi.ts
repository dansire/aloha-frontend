import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { parseError, type ParsedError } from '@/lib/errors'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: ParsedError | null
}

export interface UseApiResult<T> extends ApiState<T> {
  /** Vuelve a pedir los datos (muestra skeleton si no había datos). */
  reload: () => void
  /** Actualiza los datos en memoria (útil para cambios optimistas). */
  setData: (updater: (previous: T | null) => T | null) => void
}

/**
 * Carga datos de un servicio y gestiona loading / error / recarga.
 * Ignora respuestas obsoletas cuando cambian las dependencias.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList): UseApiResult<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null })
  const requestId = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetcher, deps)

  const run = useCallback(() => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    load()
      .then((data) => {
        if (id === requestId.current) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (id === requestId.current) {
          setState((s) => ({ ...s, loading: false, error: parseError(error) }))
        }
      })
  }, [load])

  useEffect(() => {
    run()
    return () => {
      requestId.current += 1
    }
  }, [run])

  const setData = useCallback((updater: (previous: T | null) => T | null) => {
    setState((s) => ({ ...s, data: updater(s.data) }))
  }, [])

  return { ...state, reload: run, setData }
}

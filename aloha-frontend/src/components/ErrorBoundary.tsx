import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui'

interface State {
  hasError: boolean
}

/** Red de seguridad: un error de render no deja la pantalla en blanco. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ALOHA] Error de interfaz:', error, info.componentStack)
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="card card-stitch max-w-md p-8 text-center" role="alert">
          <p className="text-5xl" aria-hidden="true">
            🐚
          </p>
          <h1 className="mt-3 text-2xl">Una ola se llevó esta pantalla</h1>
          <p className="mt-2 mb-5 font-semibold text-ink-soft">
            Ocurrió un error inesperado. Recarga la página para continuar.
          </p>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      </div>
    )
  }
}

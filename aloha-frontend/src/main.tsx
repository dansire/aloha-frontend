import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './context/ToastProvider'
import { api } from './lib/apiClient'
import { applyReduceMotion, getReduceMotion } from './lib/preferences'
import './styles/index.css'

async function bootstrap() {
  applyReduceMotion(getReduceMotion())

  // El backend simulado solo se descarga y activa con VITE_DEMO_MODE=true.
  // (Comparación directa con la variable de Vite para que el bundler elimine este bloque en producción.)
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const { installDemoBackend } = await import('./demo/install')
    installDemoBackend(api)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
}

void bootstrap()

import type { AxiosInstance } from 'axios'
import { demoAdapter } from './adapter'
import { resetDemoDb } from './db'

/**
 * Activa el backend simulado reemplazando únicamente el adaptador de transporte de Axios.
 * Se importa dinámicamente desde main.tsx SOLO si VITE_DEMO_MODE=true, por lo que el
 * código de demostración no viaja en el bundle de producción.
 */
export function installDemoBackend(client: AxiosInstance): void {
  client.defaults.adapter = demoAdapter
  ;(window as unknown as { __alohaDemoReset?: () => void }).__alohaDemoReset = () => {
    resetDemoDb()
    window.location.reload()
  }
}

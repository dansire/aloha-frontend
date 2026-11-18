/** Variables de entorno tipadas (ver .env.example). */
export const env = {
  /** URL base de la API REST de Spring Boot. */
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080/api',
  /**
   * Modo demostración: reemplaza SOLO el transporte HTTP por un backend simulado
   * (src/demo). Los servicios y pantallas no cambian. Debe ser `false` en producción.
   */
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  /** Enviar cookies (útil si el backend emite el JWT en una cookie HttpOnly). */
  withCredentials: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true',
} as const

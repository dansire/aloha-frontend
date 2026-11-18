import { CircleAlert } from 'lucide-react'

/** Mensaje de error general de un formulario (errores del servidor, conexión, etc.). */
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl border-2 border-coral-deep/40 bg-blush px-4 py-3 text-sm font-bold"
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-coral-deep" aria-hidden />
      <p>{message}</p>
    </div>
  )
}

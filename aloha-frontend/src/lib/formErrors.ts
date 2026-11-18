import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { parseError } from './errors'

/**
 * Lleva los errores por campo que devuelve la API (`fieldErrors`) a React Hook Form
 * y devuelve el mensaje general para mostrarlo en el formulario.
 */
export function applyServerError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string {
  const parsed = parseError(error)
  for (const [field, message] of Object.entries(parsed.fieldErrors)) {
    if ((fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: 'server', message })
    }
  }
  return parsed.message
}

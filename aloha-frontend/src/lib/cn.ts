import clsx, { type ClassValue } from 'clsx'

/** Une clases condicionales (alias corto de clsx). */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/** 'YYYY-MM-DD' de una fecha local (sin desfases de zona horaria). */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayKey(): string {
  return toDateKey(new Date())
}

/** Parsea 'YYYY-MM-DD' como fecha local (parseISO ya lo hace correctamente). */
export function fromDateKey(key: string): Date {
  return parseISO(key)
}

/** "lunes, 16 de noviembre de 2026" */
export function formatLongDate(date: Date | string): string {
  const value = typeof date === 'string' ? parseISO(date) : date
  return format(value, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
}

/** "16 nov 2026" */
export function formatShortDate(date: Date | string): string {
  const value = typeof date === 'string' ? parseISO(date) : date
  return format(value, 'd MMM yyyy', { locale: es })
}

/** "Hoy", "Ayer" o "lunes 16 de noviembre". */
export function formatDayHeading(dateKey: string): string {
  const date = parseISO(dateKey)
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy, h:mm a", { locale: es })
}

export function formatRelative(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { locale: es, addSuffix: true })
}

export function formatMonthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMM yy', { locale: es })
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Saludo según la hora del día. */
export function greeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

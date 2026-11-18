import { createSeedDb } from './seed'
import type { DemoDb } from './types'

const STORAGE_KEY = 'aloha.demo.db.v1'

let cache: DemoDb | null = null

function isDemoDb(value: unknown): value is DemoDb {
  if (typeof value !== 'object' || value === null) return false
  const db = value as Partial<DemoDb>
  return (
    Array.isArray(db.users) &&
    Array.isArray(db.categories) &&
    Array.isArray(db.tags) &&
    Array.isArray(db.learnings) &&
    Array.isArray(db.goals) &&
    typeof db.seq === 'object'
  )
}

export function loadDb(): DemoDb {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isDemoDb(parsed)) {
        cache = parsed
        return cache
      }
    }
  } catch {
    /* datos corruptos: se regeneran */
  }
  cache = createSeedDb()
  saveDb(cache)
  return cache
}

export function saveDb(db: DemoDb): void {
  cache = db
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    /* sin espacio / bloqueado: sigue funcionando en memoria */
  }
}

/** Restablece los datos de demostración (útil desde la consola: `__alohaDemoReset()`). */
export function resetDemoDb(): void {
  cache = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}

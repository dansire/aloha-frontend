/** Preferencias de interfaz guardadas por dispositivo (no son datos de la cuenta). */
const REDUCE_MOTION_KEY = 'aloha.reduceMotion'

export function getReduceMotion(): boolean {
  try {
    return localStorage.getItem(REDUCE_MOTION_KEY) === 'true'
  } catch {
    return false
  }
}

export function applyReduceMotion(enabled: boolean): void {
  document.documentElement.dataset.reduceMotion = String(enabled)
}

export function setReduceMotion(enabled: boolean): void {
  try {
    localStorage.setItem(REDUCE_MOTION_KEY, String(enabled))
  } catch {
    /* almacenamiento bloqueado: el cambio vale solo para esta sesión */
  }
  applyReduceMotion(enabled)
}
